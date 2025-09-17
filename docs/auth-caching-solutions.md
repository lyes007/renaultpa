# Auth.js Caching Solutions for Next.js App Router

## The Problem: Stale Session Data

When using Auth.js with Next.js App Router, you may experience a 5-minute delay in UI updates after logging in/out. This happens because:

1. **Static Rendering**: Next.js App Router uses static rendering by default
2. **Caching**: Pages are cached at build time or request time
3. **Session State**: Auth.js session data becomes stale in cached pages

## Solution 1: Force Dynamic Rendering (Recommended)

### Root Layout Approach
```tsx
// app/layout.tsx
export const dynamic = 'force-dynamic'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
```

### Page-Level Approach
```tsx
// app/dashboard/page.tsx
export const dynamic = 'force-dynamic'

export default function Dashboard() {
  const { data: session } = useSession()
  return <div>Welcome, {session?.user?.name}</div>
}
```

## Solution 2: Using Headers Function

### Dynamic Headers
```tsx
// app/profile/page.tsx
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'

export default async function Profile() {
  const headersList = await headers()
  const cookie = headersList.get('cookie')
  
  // This forces the page to be dynamic
  return <div>Profile page</div>
}
```

### Custom Headers
```tsx
// app/api/auth/[...nextauth]/route.ts
import { headers } from 'next/headers'

export async function GET(request: Request) {
  const headersList = await headers()
  
  // Add cache control headers
  const response = await NextAuth(request)
  
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')
  
  return response
}
```

## Solution 3: Using Cookies Function

### Cookie-Based Dynamic Rendering
```tsx
// app/protected/page.tsx
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export default async function ProtectedPage() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('next-auth.session-token')
  
  // This makes the page dynamic
  return (
    <div>
      {sessionToken ? 'Authenticated' : 'Not authenticated'}
    </div>
  )
}
```

### Custom Cookie Handling
```tsx
// app/api/user/route.ts
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('next-auth.session-token')
  
  if (!sessionToken) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Force dynamic response
  return Response.json(
    { user: 'authenticated' },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    }
  )
}
```

## Solution 4: Route Segment Config

### Multiple Config Options
```tsx
// app/dashboard/page.tsx
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'

export default function Dashboard() {
  const { data: session } = useSession()
  return <div>Dashboard</div>
}
```

## Solution 5: Middleware Approach

### Custom Middleware
```tsx
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Add cache control headers for auth-related routes
  if (request.nextUrl.pathname.startsWith('/api/auth') || 
      request.nextUrl.pathname.startsWith('/dashboard')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
  }
  
  return response
}

export const config = {
  matcher: ['/api/auth/:path*', '/dashboard/:path*']
}
```

## Solution 6: Client-Side Session Management

### Custom Hook with Refresh
```tsx
// hooks/use-auth-session.ts
'use client'

import { useSession } from 'next-auth/react'
import { useEffect } from 'react'

export function useAuthSession() {
  const { data: session, status, update } = useSession()
  
  useEffect(() => {
    // Force session refresh on mount
    if (status === 'authenticated') {
      update()
    }
  }, [status, update])
  
  return { session, status }
}
```

### Session Refresh Component
```tsx
// components/session-refresh.tsx
'use client'

import { useSession } from 'next-auth/react'
import { useEffect } from 'react'

export function SessionRefresh() {
  const { update } = useSession()
  
  useEffect(() => {
    // Refresh session every 30 seconds
    const interval = setInterval(() => {
      update()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [update])
  
  return null
}
```

## Best Practices

### 1. Use `force-dynamic` for Auth Pages
```tsx
// app/dashboard/page.tsx
export const dynamic = 'force-dynamic'
```

### 2. Add Cache Headers to API Routes
```tsx
// app/api/user/route.ts
export async function GET() {
  return Response.json(data, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate'
    }
  })
}
```

### 3. Use Middleware for Global Cache Control
```tsx
// middleware.ts
export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    response.headers.set('Cache-Control', 'no-store')
  }
  
  return response
}
```

### 4. Client-Side Session Updates
```tsx
// components/auth-button.tsx
'use client'

import { useSession, signIn, signOut } from 'next-auth/react'

export function AuthButton() {
  const { data: session, update } = useSession()
  
  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
    // Force session refresh
    await update()
  }
  
  return (
    <button onClick={handleSignOut}>
      Sign Out
    </button>
  )
}
```

## Performance Considerations

### 1. Selective Dynamic Rendering
Only use `force-dynamic` on pages that need real-time auth state:
```tsx
// app/dashboard/page.tsx - Dynamic
export const dynamic = 'force-dynamic'

// app/about/page.tsx - Static (no auth needed)
export const dynamic = 'auto'
```

### 2. Hybrid Approach
```tsx
// app/dashboard/page.tsx
export const dynamic = 'force-dynamic'
export const revalidate = 60 // Revalidate every minute

export default function Dashboard() {
  // This page is dynamic but can be cached for 60 seconds
  return <div>Dashboard</div>
}
```

### 3. Client-Side Caching
```tsx
// hooks/use-session-cache.ts
'use client'

import { useSession } from 'next-auth/react'
import { useMemo } from 'react'

export function useSessionCache() {
  const { data: session, status } = useSession()
  
  const cachedSession = useMemo(() => {
    if (status === 'authenticated' && session) {
      return session
    }
    return null
  }, [session, status])
  
  return { session: cachedSession, status }
}
```

## Summary

The most effective solution is to add `export const dynamic = 'force-dynamic'` to your root layout, which forces all pages to be rendered dynamically and prevents caching issues with Auth.js session data.

For specific pages that need auth state, you can also use:
- `headers()` or `cookies()` functions
- Custom middleware
- Client-side session management
- Route segment config options

Choose the approach that best fits your application's performance and caching requirements.

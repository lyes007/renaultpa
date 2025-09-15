# Authentication Setup Guide

This guide will help you set up Google authentication for your Renault PA application.

## Prerequisites

- Node.js and pnpm installed
- PostgreSQL database running
- Google Cloud Console account

## 1. Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/renault_pa"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

## 2. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set application type to "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)
7. Copy the Client ID and Client Secret to your `.env.local` file

## 3. Database Setup

The authentication tables have been added to your Prisma schema. Run the following commands:

```bash
# Generate Prisma client
pnpm prisma generate

# Push schema changes to database
pnpm prisma db push
```

## 4. Features Included

### Authentication Components
- **Sign-in page** (`/auth/signin`) - Clean login interface with Google button
- **Error page** (`/auth/error`) - Handles authentication errors
- **Auth button** - Shows login/logout button in header with user dropdown
- **Session provider** - Manages authentication state across the app

### User Pages
- **Profile page** (`/profile`) - User profile information and statistics
- **Orders page** (`/orders`) - Order history and tracking
- **Settings page** (`/settings`) - User preferences and account settings

### Database Models
- **User** - Extended with NextAuth fields (name, email, image, etc.)
- **Account** - OAuth provider accounts
- **Session** - User sessions
- **VerificationToken** - Email verification tokens

## 5. Usage

### Protecting Pages
```tsx
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function ProtectedPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === "loading") return <div>Loading...</div>
  if (status === "unauthenticated") {
    router.push("/auth/signin")
    return null
  }

  return <div>Protected content for {session.user?.name}</div>
}
```

### Getting User Data
```tsx
import { useSession } from "next-auth/react"

export default function Component() {
  const { data: session } = useSession()
  
  if (session) {
    return <div>Welcome, {session.user?.name}!</div>
  }
  
  return <div>Please sign in</div>
}
```

## 6. Customization

### Adding More OAuth Providers
1. Install the provider package: `pnpm add @auth/providers-name`
2. Add to `lib/auth.ts`:
```tsx
import ProviderName from "next-auth/providers/provider-name"

// In providers array:
ProviderName({
  clientId: process.env.PROVIDER_CLIENT_ID!,
  clientSecret: process.env.PROVIDER_CLIENT_SECRET!,
})
```

### Customizing Sign-in Page
Edit `app/auth/signin/page.tsx` to match your brand colors and styling.

### Adding User Fields
1. Update the User model in `prisma/schema.prisma`
2. Run `pnpm prisma db push`
3. Update the profile page to display new fields

## 7. Production Deployment

1. Update environment variables with production URLs
2. Ensure your OAuth app has production redirect URIs
3. Set `NEXTAUTH_SECRET` to a secure random string
4. Deploy your application

## 8. Security Notes

- Never commit `.env.local` to version control
- Use strong, unique secrets for `NEXTAUTH_SECRET`
- Regularly rotate OAuth client secrets
- Monitor authentication logs for suspicious activity
- Consider implementing rate limiting for auth endpoints

## 9. Troubleshooting

### Common Issues
- **"Invalid redirect URI"** - Check OAuth app settings match your URLs
- **"Client ID not found"** - Verify environment variables are loaded
- **Database errors** - Ensure Prisma schema is up to date
- **Session not persisting** - Check NEXTAUTH_SECRET is set

### Debug Mode
Add to your `.env.local`:
```env
NEXTAUTH_DEBUG=true
```

This will provide detailed logs for authentication issues.

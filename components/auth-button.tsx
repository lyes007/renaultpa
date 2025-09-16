"use client"

import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, LogOut, Settings, ShoppingBag } from "lucide-react"
import { useRouter } from "next/navigation"

export function AuthButton() {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === "loading") {
    return (
      <Button variant="ghost" size="sm" disabled className="h-10 px-4">
        <div className="h-4 w-4 animate-spin border-2 border-primary border-t-transparent rounded-full" />
      </Button>
    )
  }

  if (!session) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/auth/signin")}
        className="h-10 px-4 rounded-lg hover:bg-primary/10 transition-all duration-200"
      >
        <User className="h-4 w-4 mr-2" />
        Connexion
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-3">
      {/* User Info */}
      <div className="flex items-center gap-2">
        <Avatar className="h-6 w-6">
          <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
          <AvatarFallback>
            {session.user?.name?.charAt(0) || session.user?.email?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>
        <span className="hidden sm:inline text-sm font-medium">
          {session.user?.name || session.user?.email}
        </span>
      </div>

      {/* Simple Logout Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={async () => {
          console.log("Simple logout clicked")
          try {
            await signOut({ 
              callbackUrl: "/",
              redirect: true 
            })
            console.log("SignOut completed successfully")
          } catch (error) {
            console.error("SignOut error:", error)
          }
        }}
        className="h-10 px-3 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
      >
        <LogOut className="h-4 w-4 mr-2" />
        <span className="hidden sm:inline">Déconnexion</span>
      </Button>

      {/* Debug: Manual Logout Button (temporary) */}
      <Button
        variant="outline"
        size="sm"
        onClick={async () => {
          console.log("Manual logout clicked")
          try {
            const response = await fetch('/api/manual-logout', { method: 'POST' })
            const result = await response.json()
            console.log("Manual logout result:", result)
            
            if (response.ok) {
              // Force page reload to clear client-side session
              window.location.href = '/'
            }
          } catch (error) {
            console.error("Manual logout error:", error)
          }
        }}
        className="h-10 px-2 text-orange-600 border-orange-200 hover:bg-orange-50 hover:border-orange-300 transition-all duration-200"
        title="Debug: Manual logout"
      >
        <LogOut className="h-4 w-4" />
      </Button>

      {/* Quick Access Buttons */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/profile")}
          className="h-10 px-2 hover:bg-primary/10"
          title="Profil"
        >
          <User className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/orders")}
          className="h-10 px-2 hover:bg-primary/10"
          title="Mes commandes"
        >
          <ShoppingBag className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/settings")}
          className="h-10 px-2 hover:bg-primary/10"
          title="Paramètres"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

"use client"

import { signIn, getSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Mail } from "lucide-react"

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    // Check if user is already signed in
    getSession().then((session) => {
      if (session) {
        router.push("/")
      }
    })
  }, [router])

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError("")
    
    try {
      const result = await signIn("google", {
        redirect: false,
        callbackUrl: "/",
      })
      
      if (result?.error) {
        setError("Erreur lors de la connexion avec Google")
      } else if (result?.ok) {
        router.push("/")
      }
    } catch (error) {
      setError("Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white p-4">
      <style jsx>{`
        .custom-button {
          background: transparent;
          position: relative;
          padding: 5px 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 17px;
          font-weight: 600;
          text-decoration: none;
          cursor: pointer;
          border-radius: 25px;
          outline: none;
          overflow: hidden;
          transition: color 0.3s 0.1s ease-out;
          text-align: center;
          width: 100%;
        }
        
        .custom-button::before {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          margin: auto;
          content: '';
          border-radius: 50%;
          display: block;
          width: 20em;
          height: 20em;
          left: -5em;
          text-align: center;
          transition: box-shadow 0.5s ease-out;
          z-index: -1;
        }
        
        .google-button {
          border: 1px solid #4285F4;
          color: #4285F4;
        }
        
        .google-button:hover {
          color: #fff;
          border: 1px solid #4285F4;
        }
        
        .google-button:hover::before {
          box-shadow: inset 0 0 0 10em #4285F4;
        }
        
        
        .custom-button svg {
          height: 25px;
          width: 25px;
        }
        
        .custom-button:hover svg {
          fill: currentColor;
        }
        
        .custom-button span {
          margin: 10px;
        }
        
        .custom-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <img
              src="/LOGO Piece renault.png"
              alt="Pièces Auto Renault"
              className="h-16 w-auto"
            />
          </div>
          <CardTitle className="text-2xl font-bold">Connexion</CardTitle>
          <CardDescription>
            Connectez-vous pour accéder à votre compte et gérer vos commandes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}
          
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="custom-button google-button"
          >
            <svg 
              viewBox="0 0 24 24" 
              style={{ fill: '#4285F4' }}
            >
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Sign Up Google</span>
          </button>



          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              En vous connectant, vous acceptez nos{" "}
              <a href="/terms" className="text-primary hover:underline">
                conditions d'utilisation
              </a>{" "}
              et notre{" "}
              <a href="/privacy" className="text-primary hover:underline">
                politique de confidentialité
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag, ArrowLeft, Package, Truck, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function OrdersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin border-2 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  // Mock data - in a real app, this would come from your database
  const orders = []

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Button asChild variant="outline" size="sm">
                <Link href="/profile">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour au profil
                </Link>
              </Button>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Mes Commandes</h1>
            <p className="text-gray-600 mt-2">Suivez l'état de vos commandes et accédez à l'historique</p>
          </div>

          {orders.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Aucune commande trouvée
                </h3>
                <p className="text-gray-600 mb-6">
                  Vous n'avez pas encore passé de commande. Commencez à explorer nos produits !
                </p>
                <Button asChild>
                  <Link href="/">
                    Commencer mes achats
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          Commande #{order.orderNumber}
                        </CardTitle>
                        <CardDescription>
                          Passée le {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                        </CardDescription>
                      </div>
                      <Badge variant="outline">
                        {order.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {order.items.length} article{order.items.length > 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="text-lg font-semibold">
                          {order.totalAmount} TND
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm">
                          Voir les détails
                        </Button>
                        {order.status === 'DELIVERED' && (
                          <Button variant="outline" size="sm">
                            Télécharger la facture
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

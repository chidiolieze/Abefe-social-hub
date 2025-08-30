"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { useAuth } from "@/lib/auth-context"
import Database from "@/lib/database"
import { Download, Package, Calendar, CreditCard } from "lucide-react"

export default function OrdersPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [purchases, setPurchases] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    // Load user's purchases
    const userPurchases = Database.getUserPurchases(user.id)
    setPurchases(userPurchases)
    setLoading(false)
  }, [user, router])

  const handleDownloadCredentials = async (orderId: string) => {
    try {
      const response = await fetch(`/api/credentials/download/${orderId}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `order-${orderId}-credentials.txt`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        const errorData = await response.json()
        alert(errorData.error || "Failed to download credentials. Please contact support.")
      }
    } catch (error) {
      console.error("Download error:", error)
      alert("Failed to download credentials. Please try again.")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">Loading your orders...</div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="bg-gradient-to-r from-red-800 via-red-600 to-orange-500 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">My Orders</h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            View and manage your purchased products and download credentials
          </p>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          {purchases.length === 0 ? (
            <Card>
              <CardContent className="text-center py-16">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-2xl font-semibold mb-2">No Orders Yet</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't made any purchases yet. Browse our products to get started.
                </p>
                <Button onClick={() => router.push("/products")}>Browse Products</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {purchases.map((purchase) => (
                <Card key={purchase.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <CardTitle className="text-lg">{purchase.productName}</CardTitle>
                      <Badge
                        variant={
                          purchase.status === "active"
                            ? "default"
                            : purchase.status === "expired"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {purchase.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Amount</p>
                          <p className="font-semibold">₦{purchase.amount.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Purchase Date</p>
                          <p className="font-semibold">{new Date(purchase.purchaseDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      {purchase.expiryDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Expires</p>
                            <p className="font-semibold">{new Date(purchase.expiryDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                      )}
                      {purchase.credentialId && (
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-green-600" />
                          <div>
                            <p className="text-sm text-muted-foreground">Status</p>
                            <p className="font-semibold text-green-600">Credentials Ready</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {purchase.credentialId && (
                      <div className="flex justify-end">
                        <Button
                          onClick={() => handleDownloadCredentials(purchase.id)}
                          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download Credentials
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}

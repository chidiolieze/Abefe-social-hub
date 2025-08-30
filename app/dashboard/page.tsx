"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Wallet, CreditCard, ShoppingCart, Ticket, DollarSign } from "lucide-react"
import Link from "next/link"
import Database from "@/lib/database"

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [userStats, setUserStats] = useState<any>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user) {
      const stats = Database.getUserStats(user.id)
      setUserStats(stats)
    }
  }, [user])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-gradient-to-r from-red-800 to-orange-500 rounded-full animate-pulse mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name}!</h1>
          <p className="text-muted-foreground">Manage your purchases and account settings</p>
        </div>

        <div className="space-y-4 mb-8">
          {/* Fund Wallet Card */}
          <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Add Funds</p>
                  <Link href="/fund-wallet">
                    <Button
                      variant="ghost"
                      className="p-0 h-auto text-2xl font-bold text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200"
                    >
                      Fund Wallet
                    </Button>
                  </Link>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Spent Card */}
          <Card className="bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 dark:text-purple-400 mb-1">Total Spent</p>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                    ₦{userStats?.totalSpent?.toLocaleString() || "0.00"}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Orders Card */}
          <Card className="bg-violet-50 dark:bg-violet-950 border-violet-200 dark:border-violet-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-violet-600 dark:text-violet-400 mb-1">Orders</p>
                  <p className="text-2xl font-bold text-violet-700 dark:text-violet-300">
                    {userStats?.totalPurchases || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900 rounded-full flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Balance Card */}
          <Card className="bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">Balance</p>
                  <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                    ₦{userStats?.balance?.toLocaleString() || "0.00"}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-blue-700 dark:text-blue-300" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tickets Card */}
          <Card className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-1">Tickets</p>
                  <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{userStats?.tickets || 0}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                  <Ticket className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Latest Payments History</h2>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {userStats?.recentTransactions?.length > 0 ? (
                  userStats.recentTransactions.map((transaction: any) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between py-3 border-b border-border last:border-b-0"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{transaction.productName}</p>
                        <p className="text-sm text-muted-foreground">ID: {transaction.id}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-foreground">Korapay</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transaction.createdAt).toLocaleDateString()}{" "}
                          {new Date(transaction.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No payment history yet</p>
                    <p className="text-sm text-muted-foreground">Your transactions will appear here</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/products">
              <Button className="w-full h-auto p-6 bg-gradient-to-r from-red-800 to-red-600 hover:from-red-900 hover:to-red-700">
                <div className="text-center">
                  <ShoppingCart className="h-8 w-8 mx-auto mb-2" />
                  <p className="font-semibold">Browse Products</p>
                  <p className="text-sm opacity-90">Find new accounts</p>
                </div>
              </Button>
            </Link>
            <Link href="/fund-wallet">
              <Button variant="outline" className="w-full h-auto p-6 bg-transparent">
                <div className="text-center">
                  <Wallet className="h-8 w-8 mx-auto mb-2" />
                  <p className="font-semibold">Add Funds</p>
                  <p className="text-sm text-muted-foreground">Top up your wallet</p>
                </div>
              </Button>
            </Link>
            <Link href="/account-settings">
              <Button variant="outline" className="w-full h-auto p-6 bg-transparent">
                <div className="text-center">
                  <CreditCard className="h-8 w-8 mx-auto mb-2" />
                  <p className="font-semibold">Account Settings</p>
                  <p className="text-sm text-muted-foreground">Manage preferences</p>
                </div>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

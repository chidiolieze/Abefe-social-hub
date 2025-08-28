"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  LogOut,
  Package,
  Users,
  DollarSign,
  Clock,
  Ticket,
  Settings,
  BarChart3,
  CreditCard,
  Key,
  FileText,
  Search,
  Menu,
  X,
} from "lucide-react"
import { useAdminAuth } from "@/lib/admin-auth"
import { ProductManagement } from "@/components/admin/product-management"
import { CredentialManagement } from "@/components/admin/credential-management"
import Database from "@/lib/database"
import { products } from "@/lib/products-data"

type AdminSection = "dashboard" | "users" | "products" | "orders" | "payments" | "credentials" | "tickets" | "settings"

export default function AdminDashboard() {
  const { admin, logout } = useAdminAuth()
  const router = useRouter()
  const [activeSection, setActiveSection] = useState<AdminSection>("dashboard")
  const [stats, setStats] = useState<any>(null)
  const [pendingFunding, setPendingFunding] = useState<any[]>([])
  const [pendingPayments, setPendingPayments] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [purchases, setPurchases] = useState<any[]>([])
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [message, setMessage] = useState("")

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "users", label: "Users", icon: Users },
    { id: "products", label: "Products", icon: Package },
    { id: "orders", label: "Orders", icon: FileText },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "credentials", label: "Credentials", icon: Key },
    { id: "tickets", label: "Tickets", icon: Ticket },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  useEffect(() => {
    if (!admin) {
      router.push("/admin/login")
    }
  }, [admin, router])

  useEffect(() => {
    if (admin) {
      loadAdminData()
    }
  }, [admin, refreshTrigger])

  const loadAdminData = () => {
    // Load all data for admin dashboard
    const allUsers = Database.getAllUsers()
    const allTransactions = Database.getAllTransactions()
    const allPurchases = Database.getAllPurchases()
    const allFundingRequests = Database.getAllFundingRequests()
    const allManualPayments = Database.getAllManualPayments()

    setUsers(allUsers)
    setTransactions(allTransactions)
    setPurchases(allPurchases)
    setPendingFunding(allFundingRequests.filter((r) => r.status === "pending"))
    setPendingPayments(allManualPayments.filter((p) => p.status === "pending"))

    // Calculate stats
    const totalProducts = products.length
    const inStockProducts = products.filter((p) => p.inStock).length
    const totalStock = products.reduce((sum, p) => sum + p.stock, 0)
    const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0)
    const totalRevenue = allTransactions.filter((t) => t.status === "completed").reduce((sum, t) => sum + t.amount, 0)

    setStats({
      totalProducts,
      inStockProducts,
      totalStock,
      totalValue,
      totalUsers: allUsers.length,
      totalRevenue,
      totalOrders: allPurchases.length,
      pendingFundingCount: pendingFunding.length,
      pendingPaymentsCount: pendingPayments.length,
    })
  }

  const handleApproveFunding = (requestId: string, adminNotes?: string) => {
    Database.approveFundingRequest(requestId, adminNotes)
    logAdminAction("approve_funding", `Approved funding request ${requestId}`)
    setRefreshTrigger((prev) => prev + 1)
    setMessage("Payment confirmed successfully! User's wallet has been credited.")
    setTimeout(() => setMessage(""), 5000)
  }

  const handleRejectFunding = (requestId: string, adminNotes: string) => {
    Database.rejectFundingRequest(requestId, adminNotes)
    logAdminAction("reject_funding", `Rejected funding request ${requestId}: ${adminNotes}`)
    setRefreshTrigger((prev) => prev + 1)
    setMessage("Payment rejected. User has been notified.")
    setTimeout(() => setMessage(""), 5000)
  }

  const handleApprovePayment = (paymentId: string, adminNotes?: string) => {
    Database.approveManualPayment(paymentId, adminNotes)
    logAdminAction("approve_payment", `Approved manual payment ${paymentId}`)
    setRefreshTrigger((prev) => prev + 1)
    setMessage("Manual payment confirmed! Product has been delivered to user.")
    setTimeout(() => setMessage(""), 5000)
  }

  const handleRejectPayment = (paymentId: string, adminNotes: string) => {
    Database.rejectManualPayment(paymentId, adminNotes)
    logAdminAction("reject_payment", `Rejected manual payment ${paymentId}: ${adminNotes}`)
    setRefreshTrigger((prev) => prev + 1)
    setMessage("Manual payment rejected. User has been notified.")
    setTimeout(() => setMessage(""), 5000)
  }

  const resetUserBalance = (userId: string) => {
    const user = users.find((u) => u.id === userId)
    Database.updateUser(userId, { balance: 0, totalSpent: 0, totalPurchases: 0, activeAccounts: 0, tickets: 0 })
    logAdminAction("reset_user_balance", `Reset balance for user ${user?.email}`)
    setRefreshTrigger((prev) => prev + 1)
  }

  const deleteUser = (userId: string) => {
    const user = users.find((u) => u.id === userId)
    Database.deleteUser(userId)
    logAdminAction("delete_user", `Deleted user ${user?.email}`)
    setRefreshTrigger((prev) => prev + 1)
  }

  const logAdminAction = (action: string, description: string) => {
    const auditLogs = JSON.parse(localStorage.getItem("admin-audit-logs") || "[]")
    auditLogs.push({
      id: Date.now().toString(),
      adminId: admin?.id,
      adminEmail: admin?.email,
      action,
      description,
      timestamp: new Date().toISOString(),
    })
    localStorage.setItem("admin-audit-logs", JSON.stringify(auditLogs))
  }

  const getFilteredTransactions = () => {
    let filtered = transactions

    if (searchTerm) {
      filtered = filtered.filter(
        (t) =>
          t.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          users
            .find((u) => u.id === t.userId)
            ?.email.toLowerCase()
            .includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((t) => t.status === statusFilter)
    }

    if (dateFilter !== "all") {
      const now = new Date()
      const filterDate = new Date()

      switch (dateFilter) {
        case "today":
          filterDate.setHours(0, 0, 0, 0)
          break
        case "week":
          filterDate.setDate(now.getDate() - 7)
          break
        case "month":
          filterDate.setMonth(now.getMonth() - 1)
          break
      }

      filtered = filtered.filter((t) => new Date(t.createdAt) >= filterDate)
    }

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  const getFilteredUsers = () => {
    if (!searchTerm) return users
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.includes(searchTerm),
    )
  }

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-xl lg:text-2xl font-bold">₦{stats?.totalRevenue?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">From completed transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
            <p className="text-xs text-muted-foreground">All time orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Actions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats?.pendingFundingCount || 0) + (stats?.pendingPaymentsCount || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.slice(0, 5).map((transaction) => {
                const user = users.find((u) => u.id === transaction.userId)
                return (
                  <div key={transaction.id} className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{transaction.productName}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-medium">₦{transaction.amount.toLocaleString()}</p>
                      <Badge variant={transaction.status === "completed" ? "default" : "secondary"}>
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...pendingFunding.slice(0, 3), ...pendingPayments.slice(0, 2)].map((item) => {
                const user = users.find((u) => u.id === item.userId)
                const isPayment = "productName" in item
                return (
                  <div key={item.id} className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {isPayment ? `Payment: ${item.productName}` : "Wallet Funding"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-medium">₦{item.amount.toLocaleString()}</p>
                      <Badge variant="secondary">Pending</Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">User Management</h2>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="space-y-0">
            {getFilteredUsers().map((user, index) => (
              <div
                key={user.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6 ${
                  index !== getFilteredUsers().length - 1 ? "border-b" : ""
                }`}
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <p className="font-medium truncate">{user.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                  <p className="text-sm text-muted-foreground">Phone: {user.phone}</p>
                  <div className="flex flex-wrap gap-2 sm:gap-4 text-xs text-muted-foreground">
                    <span>Balance: ₦{user.balance.toLocaleString()}</span>
                    <span>Spent: ₦{user.totalSpent.toLocaleString()}</span>
                    <span>Orders: {user.totalPurchases}</span>
                    <span>Tickets: {user.tickets}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Joined: {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button size="sm" variant="outline" onClick={() => resetUserBalance(user.id)}>
                    Reset Balance
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteUser(user.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderOrders = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Orders Management</h2>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="space-y-0 min-w-full">
              {purchases
                .filter((purchase) => {
                  if (!searchTerm) return true
                  const user = users.find((u) => u.id === purchase.userId)
                  return (
                    purchase.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user?.name.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                })
                .filter((purchase) => {
                  if (statusFilter === "all") return true
                  return purchase.status === statusFilter
                })
                .map((purchase, index, filteredArray) => {
                  const user = users.find((u) => u.id === purchase.userId)
                  return (
                    <div
                      key={purchase.id}
                      className={`flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 sm:p-6 ${
                        index !== filteredArray.length - 1 ? "border-b" : ""
                      }`}
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <p className="font-medium truncate">{purchase.productName}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          Customer: {user?.name} ({user?.email})
                        </p>
                        <p className="text-sm text-muted-foreground">Amount: ₦{purchase.amount.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">
                          Purchased: {new Date(purchase.purchaseDate).toLocaleString()}
                        </p>
                        {purchase.expiryDate && (
                          <p className="text-xs text-muted-foreground">
                            Expires: {new Date(purchase.expiryDate).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-shrink-0">
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
                        {purchase.credentialId && (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            Credentials Assigned
                          </Badge>
                        )}
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderPayments = () => (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Payments Management</h2>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {(pendingFunding.length > 0 || pendingPayments.length > 0) && (
        <div className="grid gap-6">
          {pendingFunding.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Pending Wallet Funding Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingFunding.map((request) => {
                    const user = users.find((u) => u.id === request.userId)
                    return (
                      <div
                        key={request.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-lg"
                      >
                        <div className="space-y-1 min-w-0 flex-1">
                          <p className="font-medium truncate">
                            {user?.name} ({user?.email})
                          </p>
                          <p className="text-sm text-muted-foreground">Amount: ₦{request.amount.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground break-all">
                            Reference: {request.transactionReference}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(request.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <Button
                            size="sm"
                            onClick={() => handleApproveFunding(request.id, "Approved by admin")}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRejectFunding(request.id, "Rejected by admin")}
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {pendingPayments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Pending Manual Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingPayments.map((payment) => {
                    const user = users.find((u) => u.id === payment.userId)
                    return (
                      <div
                        key={payment.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-lg"
                      >
                        <div className="space-y-1 min-w-0 flex-1">
                          <p className="font-medium truncate">
                            {user?.name} ({user?.email})
                          </p>
                          <p className="text-sm text-muted-foreground truncate">Product: {payment.productName}</p>
                          <p className="text-sm text-muted-foreground">Amount: ₦{payment.amount.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground break-all">
                            Reference: {payment.transactionReference}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(payment.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <Button
                            size="sm"
                            onClick={() => handleApprovePayment(payment.id, "Payment confirmed and product delivered")}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRejectPayment(payment.id, "Payment not verified")}
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="space-y-0 min-w-full">
              {getFilteredTransactions()
                .slice(0, 50)
                .map((transaction, index) => {
                  const user = users.find((u) => u.id === transaction.userId)
                  return (
                    <div
                      key={transaction.id}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6 ${
                        index !== getFilteredTransactions().slice(0, 50).length - 1 ? "border-b" : ""
                      }`}
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <p className="font-medium truncate">{transaction.productName}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          User: {user?.name} ({user?.email})
                        </p>
                        <p className="text-sm text-muted-foreground">Amount: ₦{transaction.amount.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <Badge
                          variant={
                            transaction.status === "completed"
                              ? "default"
                              : transaction.status === "pending"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">System Settings</h2>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Bank Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Bank Name</Label>
                <Input defaultValue="NOMBANK" />
              </div>
              <div>
                <Label>Account Number</Label>
                <Input defaultValue="2624503680" />
              </div>
            </div>
            <div>
              <Label>Account Name</Label>
              <Input defaultValue="OLOYEDE SAMSON" />
            </div>
            <Button>Update Bank Details</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Site Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Total Products</Label>
                <p className="text-2xl font-bold">{stats?.totalProducts || 0}</p>
              </div>
              <div>
                <Label>Total Users</Label>
                <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
              </div>
              <div>
                <Label>Total Revenue</Label>
                <p className="text-2xl font-bold">₦{stats?.totalRevenue?.toLocaleString() || 0}</p>
              </div>
              <div>
                <Label>Total Orders</Label>
                <p className="text-2xl font-bold">{stats?.totalOrders || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Audit Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {JSON.parse(localStorage.getItem("admin-audit-logs") || "[]")
                .slice(-10)
                .reverse()
                .map((log: any) => (
                  <div key={log.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="text-sm font-medium">{log.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {log.adminEmail} • {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="outline">{log.action}</Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="lg:flex">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white dark:bg-gray-800 shadow-sm border-b p-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
          <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden">
            <Menu className="h-6 w-6" />
          </Button>
        </div>

        {/* Sidebar */}
        <div
          className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-sm border-r transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0 lg:flex lg:flex-col
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        >
          <div className="lg:hidden absolute inset-0 bg-black bg-opacity-50" onClick={() => setMobileMenuOpen(false)} />

          <div className="relative bg-white dark:bg-gray-800 h-full flex flex-col">
            <div className="p-6 border-b flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Welcome, {admin?.name || "Admin"}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(false)} className="lg:hidden">
                <X className="h-5 w-5" />
                <span className="truncate">Logout</span>
              </Button>
            </div>

            <nav className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveSection(item.id as AdminSection)
                        setMobileMenuOpen(false) // Close mobile menu on selection
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeSection === item.id
                          ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  )
                })}
              </div>
            </nav>

            <div className="p-4 border-t">
              <Button variant="outline" onClick={logout} className="w-full flex items-center gap-2 bg-transparent">
                <LogOut className="h-4 w-4" />
                <span className="truncate">Logout</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0 lg:ml-0">
          <main className="p-4 sm:p-6 lg:p-8">
            {message && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">{message}</div>
            )}

            {admin && (
              <>
                {activeSection === "dashboard" && renderDashboard()}
                {activeSection === "users" && renderUsers()}
                {activeSection === "products" && <ProductManagement />}
                {activeSection === "orders" && renderOrders()}
                {activeSection === "payments" && renderPayments()}
                {activeSection === "credentials" && <CredentialManagement />}
                {activeSection === "tickets" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Tickets Management</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Ticket system coming soon</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
                {activeSection === "settings" && renderSettings()}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

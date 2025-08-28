import { ValidationUtils } from "./validation"

export interface UserProfile {
  id: string
  email: string
  name: string
  phone: string
  password: string // Hashed password
  balance: number
  totalSpent: number
  totalPurchases: number
  activeAccounts: number
  tickets: number // Added tickets field
  referralCode: string
  referredBy?: string
  referralEarnings: number
  totalReferrals: number
  memberSince: string
  createdAt: string
  updatedAt: string
}

export interface Transaction {
  id: string
  userId: string
  productId: string
  productName: string
  amount: number
  status: "completed" | "pending" | "failed"
  createdAt: string
}

export interface Purchase {
  id: string
  userId: string
  productId: string
  productName: string
  productCategory: string
  amount: number
  status: "active" | "expired" | "suspended"
  purchaseDate: string
  expiryDate?: string
  credentialId?: string // Added credential assignment
  paymentMethod?: "wallet" | "paystack" | "manual"
  reference?: string
}

export interface FundingRequest {
  id: string
  userId: string
  amount: number
  transactionReference: string
  proofOfPayment?: string // File path or base64 string
  status: "pending" | "approved" | "rejected"
  adminNotes?: string
  createdAt: string
  updatedAt: string
}

export interface ManualPaymentRequest {
  id: string
  userId: string
  productId: string
  productName: string
  productCategory: string
  amount: number
  transactionReference: string
  proofOfPayment?: string
  status: "pending" | "approved" | "rejected"
  adminNotes?: string
  createdAt: string
  updatedAt: string
}

export interface Credential {
  id: string
  productId: string
  username: string
  password: string
  isUsed: boolean
  assignedToOrderId?: string
  assignedAt?: string
  createdAt: string
}

export interface ProductCredentials {
  productId: string
  totalCredentials: number
  usedCredentials: number
  availableCredentials: number
  credentials: Credential[]
}

export interface Referral {
  id: string
  referrerId: string
  referredUserId: string
  referralCode: string
  commissionEarned: number
  createdAt: string
}

// Database utility functions
export class Database {
  private static USERS_KEY = "abefe-users"
  private static TRANSACTIONS_KEY = "abefe-transactions"
  private static PURCHASES_KEY = "abefe-purchases"
  private static FUNDING_REQUESTS_KEY = "abefe-funding-requests"
  private static MANUAL_PAYMENTS_KEY = "abefe-manual-payments"
  private static CREDENTIALS_KEY = "abefe-credentials"
  private static PAYMENT_RECORDS_KEY = "abefe-payment-records"
  private static REFERRALS_KEY = "abefe-referrals"

  // Added authorization check utility
  private static isAuthorized(userId: string, requestedUserId: string): boolean {
    return userId === requestedUserId
  }

  // User Management
  static getAllUsers(): UserProfile[] {
    const users = localStorage.getItem(this.USERS_KEY)
    return users ? JSON.parse(users) : []
  }

  static getUserById(id: string): UserProfile | null {
    const users = this.getAllUsers()
    return users.find((user) => user.id === id) || null
  }

  static getUserByEmail(email: string): UserProfile | null {
    const users = this.getAllUsers()
    return users.find((user) => user.email === email) || null
  }

  static createUser(userData: Omit<UserProfile, "id" | "createdAt" | "updatedAt">): UserProfile {
    const users = this.getAllUsers()
    const referralCode = this.generateReferralCode()
    const newUser: UserProfile = {
      ...userData,
      id: "user-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9),
      referralCode,
      referralEarnings: 0,
      totalReferrals: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tickets: 0, // Initialize tickets field
    }

    users.push(newUser)
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users))

    if (userData.referredBy) {
      this.processReferral(userData.referredBy, newUser.id)
    }

    return newUser
  }

  static updateUser(id: string, updates: Partial<UserProfile>): UserProfile | null {
    const users = this.getAllUsers()
    const userIndex = users.findIndex((user) => user.id === id)

    if (userIndex === -1) return null

    users[userIndex] = {
      ...users[userIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    localStorage.setItem(this.USERS_KEY, JSON.stringify(users))
    return users[userIndex]
  }

  static deleteUser(id: string): boolean {
    const users = this.getAllUsers()
    const filteredUsers = users.filter((user) => user.id !== id)

    if (filteredUsers.length === users.length) return false

    localStorage.setItem(this.USERS_KEY, JSON.stringify(filteredUsers))
    return true
  }

  // Transaction Management with Authorization
  static getAllTransactions(): Transaction[] {
    const transactions = localStorage.getItem(this.TRANSACTIONS_KEY)
    return transactions ? JSON.parse(transactions) : []
  }

  static getUserTransactions(userId: string, requestingUserId?: string): Transaction[] {
    if (requestingUserId && !this.isAuthorized(userId, requestingUserId)) {
      throw new Error("Unauthorized access to user transactions")
    }

    const transactions = this.getAllTransactions()
    return transactions.filter((transaction) => transaction.userId === userId)
  }

  static createTransaction(transactionData: Omit<Transaction, "id" | "createdAt">): Transaction {
    const transactions = this.getAllTransactions()
    const newTransaction: Transaction = {
      ...transactionData,
      id: "txn-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    }

    transactions.push(newTransaction)
    localStorage.setItem(this.TRANSACTIONS_KEY, JSON.stringify(transactions))
    return newTransaction
  }

  // Purchase Management with Authorization
  static getAllPurchases(): Purchase[] {
    const purchases = localStorage.getItem(this.PURCHASES_KEY)
    return purchases ? JSON.parse(purchases) : []
  }

  static getUserPurchases(userId: string, requestingUserId?: string): Purchase[] {
    if (requestingUserId && !this.isAuthorized(userId, requestingUserId)) {
      throw new Error("Unauthorized access to user purchases")
    }

    const purchases = this.getAllPurchases()
    return purchases.filter((purchase) => purchase.userId === userId)
  }

  static createPurchase(purchaseData: Omit<Purchase, "id">): Purchase {
    const purchases = this.getAllPurchases()
    const newPurchase: Purchase = {
      ...purchaseData,
      id: "purchase-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9),
    }

    const assignedCredential = this.assignCredentialToOrder(purchaseData.productId, newPurchase.id)
    if (assignedCredential) {
      newPurchase.credentialId = assignedCredential.id
    }

    purchases.push(newPurchase)
    localStorage.setItem(this.PURCHASES_KEY, JSON.stringify(purchases))

    this.processReferralCommission(purchaseData.userId, purchaseData.amount)

    return newPurchase
  }

  static createManualPaymentRequest(
    paymentData: Omit<ManualPaymentRequest, "id" | "createdAt" | "updatedAt">,
  ): ManualPaymentRequest {
    const payments = this.getAllManualPayments()
    const newPayment: ManualPaymentRequest = {
      ...paymentData,
      id: "manual-pay-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    payments.push(newPayment)
    localStorage.setItem(this.MANUAL_PAYMENTS_KEY, JSON.stringify(payments))
    return newPayment
  }

  static updateManualPaymentRequest(id: string, updates: Partial<ManualPaymentRequest>): ManualPaymentRequest | null {
    const payments = this.getAllManualPayments()
    const paymentIndex = payments.findIndex((payment) => payment.id === id)

    if (paymentIndex === -1) return null

    payments[paymentIndex] = {
      ...payments[paymentIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    localStorage.setItem(this.MANUAL_PAYMENTS_KEY, JSON.stringify(payments))
    return payments[paymentIndex]
  }

  static approveManualPayment(id: string, adminNotes?: string): boolean {
    const payment = this.getAllManualPayments().find((p) => p.id === id)
    if (!payment || payment.status !== "pending") return false

    this.createPurchase({
      userId: payment.userId,
      productId: payment.productId,
      productName: payment.productName,
      productCategory: payment.productCategory,
      amount: payment.amount,
      status: "active",
      purchaseDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    })

    this.createTransaction({
      userId: payment.userId,
      productId: payment.productId,
      productName: payment.productName,
      amount: payment.amount,
      status: "completed",
    })

    const user = this.getUserById(payment.userId)
    if (user) {
      this.updateUser(payment.userId, {
        totalSpent: user.totalSpent + payment.amount,
        totalPurchases: user.totalPurchases + 1,
        activeAccounts: user.activeAccounts + 1,
      })
    }

    this.updateManualPaymentRequest(id, {
      status: "approved",
      adminNotes,
    })

    return true
  }

  static rejectManualPayment(id: string, adminNotes: string): boolean {
    return (
      this.updateManualPaymentRequest(id, {
        status: "rejected",
        adminNotes,
      }) !== null
    )
  }

  // Funding Request Management
  static getAllFundingRequests(): FundingRequest[] {
    const requests = localStorage.getItem(this.FUNDING_REQUESTS_KEY)
    return requests ? JSON.parse(requests) : []
  }

  static getUserFundingRequests(userId: string): FundingRequest[] {
    const requests = this.getAllFundingRequests()
    return requests.filter((request) => request.userId === userId)
  }

  static createFundingRequest(requestData: Omit<FundingRequest, "id" | "createdAt" | "updatedAt">): FundingRequest {
    const requests = this.getAllFundingRequests()
    const newRequest: FundingRequest = {
      ...requestData,
      id: "fund-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    requests.push(newRequest)
    localStorage.setItem(this.FUNDING_REQUESTS_KEY, JSON.stringify(requests))
    return newRequest
  }

  static updateFundingRequest(id: string, updates: Partial<FundingRequest>): FundingRequest | null {
    const requests = this.getAllFundingRequests()
    const requestIndex = requests.findIndex((request) => request.id === id)

    if (requestIndex === -1) return null

    requests[requestIndex] = {
      ...requests[requestIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    localStorage.setItem(this.FUNDING_REQUESTS_KEY, JSON.stringify(requests))
    return requests[requestIndex]
  }

  static approveFundingRequest(id: string, adminNotes?: string): boolean {
    const request = this.getAllFundingRequests().find((r) => r.id === id)
    if (!request || request.status !== "pending") return false

    const user = this.getUserById(request.userId)
    if (!user) return false

    this.updateUser(request.userId, {
      balance: user.balance + request.amount,
    })

    this.createTransaction({
      userId: request.userId,
      productId: "wallet-funding",
      productName: "Wallet Funding",
      amount: request.amount,
      status: "completed",
    })

    this.updateFundingRequest(id, {
      status: "approved",
      adminNotes,
    })

    return true
  }

  static rejectFundingRequest(id: string, adminNotes: string): boolean {
    return (
      this.updateFundingRequest(id, {
        status: "rejected",
        adminNotes,
      }) !== null
    )
  }

  // Manual Payment Request Management
  static getAllManualPayments(): ManualPaymentRequest[] {
    const payments = localStorage.getItem(this.MANUAL_PAYMENTS_KEY)
    return payments ? JSON.parse(payments) : []
  }

  static getUserManualPayments(userId: string): ManualPaymentRequest[] {
    const payments = this.getAllManualPayments()
    return payments.filter((payment) => payment.userId === userId)
  }

  // Credential Management
  static getAllCredentials(): Credential[] {
    const credentials = localStorage.getItem(this.CREDENTIALS_KEY)
    return credentials ? JSON.parse(credentials) : []
  }

  static getProductCredentials(productId: string): ProductCredentials {
    const allCredentials = this.getAllCredentials()
    const productCredentials = allCredentials.filter((cred) => cred.productId === productId)

    return {
      productId,
      totalCredentials: productCredentials.length,
      usedCredentials: productCredentials.filter((cred) => cred.isUsed).length,
      availableCredentials: productCredentials.filter((cred) => !cred.isUsed).length,
      credentials: productCredentials,
    }
  }

  static addCredentialsToProduct(
    productId: string,
    credentialData: Array<{ username: string; password: string }>,
  ): Credential[] {
    const allCredentials = this.getAllCredentials()
    const newCredentials: Credential[] = []

    credentialData.forEach(({ username, password }) => {
      const credential: Credential = {
        id: "cred-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9),
        productId,
        username: username.trim(),
        password: password.trim(),
        isUsed: false,
        createdAt: new Date().toISOString(),
      }
      newCredentials.push(credential)
      allCredentials.push(credential)
    })

    localStorage.setItem(this.CREDENTIALS_KEY, JSON.stringify(allCredentials))
    return newCredentials
  }

  static assignCredentialToOrder(productId: string, orderId: string): Credential | null {
    const allCredentials = this.getAllCredentials()
    const availableCredential = allCredentials.find((cred) => cred.productId === productId && !cred.isUsed)

    if (!availableCredential) return null

    availableCredential.isUsed = true
    availableCredential.assignedToOrderId = orderId
    availableCredential.assignedAt = new Date().toISOString()

    localStorage.setItem(this.CREDENTIALS_KEY, JSON.stringify(allCredentials))
    return availableCredential
  }

  static getCredentialByOrderId(orderId: string): Credential | null {
    const allCredentials = this.getAllCredentials()
    return allCredentials.find((cred) => cred.assignedToOrderId === orderId) || null
  }

  static deleteProductCredentials(productId: string): boolean {
    const allCredentials = this.getAllCredentials()
    const filteredCredentials = allCredentials.filter((cred) => cred.productId !== productId)

    localStorage.setItem(this.CREDENTIALS_KEY, JSON.stringify(filteredCredentials))
    return true
  }

  // Payment Record Management for Paystack
  static createPaymentRecord(paymentData: any): void {
    const records = this.getPaymentRecords()
    records.push({
      ...paymentData,
      createdAt: new Date().toISOString(),
    })
    localStorage.setItem(this.PAYMENT_RECORDS_KEY, JSON.stringify(records))
  }

  static getPaymentRecords(): any[] {
    const records = localStorage.getItem(this.PAYMENT_RECORDS_KEY)
    return records ? JSON.parse(records) : []
  }

  static getPaymentRecord(reference: string): any | null {
    const records = this.getPaymentRecords()
    return records.find((record) => record.reference === reference) || null
  }

  static updatePaymentRecord(reference: string, updates: any): void {
    const records = this.getPaymentRecords()
    const recordIndex = records.findIndex((record) => record.reference === reference)

    if (recordIndex !== -1) {
      records[recordIndex] = { ...records[recordIndex], ...updates }
      localStorage.setItem(this.PAYMENT_RECORDS_KEY, JSON.stringify(records))
    }
  }

  // Authentication helpers with improved security
  static authenticateUser(email: string, password: string): UserProfile | null {
    const user = this.getUserByEmail(email)
    if (user) {
      if (ValidationUtils.verifyPassword(password, user.password)) {
        return user
      }
    }
    return null
  }

  static isEmailTaken(email: string): boolean {
    return this.getUserByEmail(email) !== null
  }

  // Analytics helpers with authorization
  static getUserStats(userId: string, requestingUserId?: string) {
    if (requestingUserId && !this.isAuthorized(userId, requestingUserId)) {
      throw new Error("Unauthorized access to user statistics")
    }

    const user = this.getUserById(userId)
    const transactions = this.getUserTransactions(userId)
    const purchases = this.getUserPurchases(userId)

    if (!user) return null

    const activePurchases = purchases.filter((p) => p.status === "active")
    const completedTransactions = transactions.filter((t) => t.status === "completed")

    return {
      totalPurchases: purchases.length,
      activeAccounts: activePurchases.length,
      totalSpent: completedTransactions.reduce((sum, t) => sum + t.amount, 0),
      balance: user.balance,
      tickets: user.tickets,
      referralEarnings: user.referralEarnings,
      totalReferrals: user.totalReferrals,
      memberSince: new Date(user.createdAt).getFullYear(),
      recentPurchases: purchases
        .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime())
        .slice(0, 5),
      recentTransactions: completedTransactions
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5),
    }
  }

  // Helper methods for Paystack integration
  static updateUserBalance(userId: string, amount: number): boolean {
    const user = this.getUserById(userId)
    if (!user) return false

    this.updateUser(userId, {
      balance: user.balance + amount,
    })
    return true
  }

  static updateUserStats(
    userId: string,
    updates: Partial<Pick<UserProfile, "totalSpent" | "totalPurchases" | "activeAccounts">>,
  ): boolean {
    const user = this.getUserById(userId)
    if (!user) return false

    this.updateUser(userId, updates)
    return true
  }

  static decrementProductStock(productId: string): boolean {
    return true
  }

  // Referral System Methods
  private static generateReferralCode(): string {
    return "REF" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase()
  }

  static getUserByReferralCode(referralCode: string): UserProfile | null {
    const users = this.getAllUsers()
    return users.find((user) => user.referralCode === referralCode) || null
  }

  static processReferral(referralCode: string, newUserId: string): boolean {
    const referrer = this.getUserByReferralCode(referralCode)
    if (!referrer) return false

    const referrals = this.getAllReferrals()
    const newReferral: Referral = {
      id: "ref-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9),
      referrerId: referrer.id,
      referredUserId: newUserId,
      referralCode,
      commissionEarned: 0,
      createdAt: new Date().toISOString(),
    }

    referrals.push(newReferral)
    localStorage.setItem(this.REFERRALS_KEY, JSON.stringify(referrals))

    this.updateUser(referrer.id, {
      totalReferrals: referrer.totalReferrals + 1,
    })

    return true
  }

  static processReferralCommission(userId: string, purchaseAmount: number): void {
    const user = this.getUserById(userId)
    if (!user || !user.referredBy) return

    const referrer = this.getUserByReferralCode(user.referredBy)
    if (!referrer) return

    const commission = Math.floor(purchaseAmount * 0.02)
    if (commission <= 0) return

    this.updateUser(referrer.id, {
      balance: referrer.balance + commission,
      referralEarnings: referrer.referralEarnings + commission,
    })

    const referrals = this.getAllReferrals()
    const referralIndex = referrals.findIndex((ref) => ref.referrerId === referrer.id && ref.referredUserId === userId)

    if (referralIndex !== -1) {
      referrals[referralIndex].commissionEarned += commission
      localStorage.setItem(this.REFERRALS_KEY, JSON.stringify(referrals))
    }

    this.createTransaction({
      userId: referrer.id,
      productId: "referral-commission",
      productName: `Referral Commission from ${user.name}`,
      amount: commission,
      status: "completed",
    })
  }

  static getAllReferrals(): Referral[] {
    const referrals = localStorage.getItem(this.REFERRALS_KEY)
    return referrals ? JSON.parse(referrals) : []
  }

  static getUserReferrals(userId: string): Referral[] {
    const referrals = this.getAllReferrals()
    return referrals.filter((referral) => referral.referrerId === userId)
  }
}

export default Database

import { supabase } from "./supabase/client"

export interface UserProfile {
  id: string
  email: string
  name: string
  phone?: string
  balance: number
  total_spent: number
  total_purchases: number
  active_accounts: number
  tickets: number
  referral_code?: string
  referred_by?: string
  referral_earnings: number
  is_admin: boolean
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  stock: number
  image_url?: string
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  user_id: string
  type: string
  amount: number
  description?: string
  paystack_reference?: string
  status: string
  created_at: string
}

export interface Purchase {
  id: string
  user_id: string
  product_id: string
  product_name: string
  amount: number
  quantity: number
  credential_id?: string
  paystack_reference?: string
  status: string
  created_at: string
}

export interface ProductCredential {
  id: string
  product_id: string
  username: string
  password: string
  is_used: boolean
  assigned_to?: string
  assigned_at?: string
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: string
  is_read: boolean
  action_url?: string
  created_at: string
}

export class DatabaseService {
  // User Management
  static async createUser(userData: {
    email: string
    name: string
    phone?: string
    password_hash: string
    referral_code?: string
    referred_by?: string
  }): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from("users")
        .insert([
          {
            ...userData,
            referral_code: userData.referral_code || this.generateReferralCode(),
          },
        ])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error creating user:", error)
      return null
    }
  }

  static async getUserByEmail(email: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase.from("users").select("*").eq("email", email).single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error getting user by email:", error)
      return null
    }
  }

  static async getUserById(id: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase.from("users").select("*").eq("id", id).single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error getting user by ID:", error)
      return null
    }
  }

  static async updateUserBalance(userId: string, amount: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("users")
        .update({
          balance: amount,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

      if (error) throw error
      return true
    } catch (error) {
      console.error("Error updating user balance:", error)
      return false
    }
  }

  static async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("users")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

      if (error) throw error
      return true
    } catch (error) {
      console.error("Error updating user profile:", error)
      return false
    }
  }

  // Product Management
  static async getAllProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error getting products:", error)
      return []
    }
  }

  static async getProductById(id: string): Promise<Product | null> {
    try {
      const { data, error } = await supabase.from("products").select("*").eq("id", id).single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error getting product by ID:", error)
      return null
    }
  }

  static async createProduct(product: Omit<Product, "created_at" | "updated_at">): Promise<Product | null> {
    try {
      const { data, error } = await supabase.from("products").insert([product]).select().single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error creating product:", error)
      return null
    }
  }

  static async updateProduct(id: string, updates: Partial<Product>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("products")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (error) throw error
      return true
    } catch (error) {
      console.error("Error updating product:", error)
      return false
    }
  }

  static async deleteProduct(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("products").delete().eq("id", id)

      if (error) throw error
      return true
    } catch (error) {
      console.error("Error deleting product:", error)
      return false
    }
  }

  // Transaction Management
  static async createTransaction(transaction: Omit<Transaction, "id" | "created_at">): Promise<Transaction | null> {
    try {
      const { data, error } = await supabase.from("transactions").insert([transaction]).select().single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error creating transaction:", error)
      return null
    }
  }

  static async getUserTransactions(userId: string): Promise<Transaction[]> {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error getting user transactions:", error)
      return []
    }
  }

  // Purchase Management
  static async createPurchase(purchase: Omit<Purchase, "id" | "created_at">): Promise<Purchase | null> {
    try {
      const { data, error } = await supabase.from("purchases").insert([purchase]).select().single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error creating purchase:", error)
      return null
    }
  }

  static async getUserPurchases(userId: string): Promise<Purchase[]> {
    try {
      const { data, error } = await supabase
        .from("purchases")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error getting user purchases:", error)
      return []
    }
  }

  // Notification Management
  static async createNotification(notification: Omit<Notification, "id" | "created_at">): Promise<Notification | null> {
    try {
      const { data, error } = await supabase.from("notifications").insert([notification]).select().single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error creating notification:", error)
      return null
    }
  }

  static async getUserNotifications(userId: string): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error getting user notifications:", error)
      return []
    }
  }

  static async markNotificationAsRead(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", id)

      if (error) throw error
      return true
    } catch (error) {
      console.error("Error marking notification as read:", error)
      return false
    }
  }

  // Utility functions
  static generateReferralCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  static async getUserByReferralCode(code: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase.from("users").select("*").eq("referral_code", code).single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error getting user by referral code:", error)
      return null
    }
  }
}

import { DatabaseService, type UserProfile } from "./database-service"

export interface PurchaseRequest {
  userId: string
  productId: string
  productName: string
  productCategory: string
  amount: number
  activeDays: number
}

export interface PurchaseResult {
  success: boolean
  message: string
  transaction?: any
  purchase?: any
  updatedUser?: UserProfile
}

export class TransactionService {
  static async processPurchase(request: PurchaseRequest): Promise<PurchaseResult> {
    try {
      const user = await DatabaseService.getUserById(request.userId)
      if (!user) {
        return {
          success: false,
          message: "User not found",
        }
      }

      if (user.balance < request.amount) {
        return {
          success: false,
          message: `Insufficient wallet balance. You have ₦${user.balance.toLocaleString()} but need ₦${request.amount.toLocaleString()}. Please fund your wallet first.`,
        }
      }

      const product = await DatabaseService.getProductById(request.productId)
      if (!product) {
        return {
          success: false,
          message: "Product not found",
        }
      }

      if (product.stock <= 0) {
        return {
          success: false,
          message: "Product is out of stock",
        }
      }

      const newBalance = user.balance - request.amount
      await DatabaseService.updateUserBalance(request.userId, newBalance)

      const newStock = product.stock - 1
      await DatabaseService.updateProduct(request.productId, { stock: newStock })

      const transaction = await DatabaseService.createTransaction({
        user_id: request.userId,
        type: "product_purchase",
        amount: request.amount,
        description: `Purchase: ${request.productName}`,
        status: "completed",
      })

      const purchase = await DatabaseService.createPurchase({
        user_id: request.userId,
        product_id: request.productId,
        product_name: request.productName,
        amount: request.amount,
        quantity: 1,
        status: "completed",
      })

      const updatedUser = await DatabaseService.updateUserProfile(request.userId, {
        total_spent: user.total_spent + request.amount,
        total_purchases: user.total_purchases + 1,
        active_accounts: user.active_accounts + 1,
      })

      if (!updatedUser) {
        return {
          success: false,
          message: "Failed to update user statistics",
        }
      }

      await DatabaseService.createNotification({
        user_id: request.userId,
        title: "Purchase Completed",
        message: `You have successfully purchased ${request.productName} for ₦${request.amount.toLocaleString()}`,
        type: "purchase",
        action_url: "/orders",
      })

      return {
        success: true,
        message: `Purchase completed successfully! ₦${request.amount.toLocaleString()} has been deducted from your wallet.`,
        transaction,
        purchase,
        updatedUser: await DatabaseService.getUserById(request.userId),
      }
    } catch (error) {
      console.error("Purchase processing error:", error)
      return {
        success: false,
        message: "An error occurred while processing your purchase",
      }
    }
  }

  static async getUserTransactionHistory(userId: string) {
    return await DatabaseService.getUserTransactions(userId)
  }

  static async getUserPurchaseHistory(userId: string) {
    return await DatabaseService.getUserPurchases(userId)
  }

  static async getActivePurchases(userId: string) {
    const purchases = await DatabaseService.getUserPurchases(userId)
    return purchases.filter((purchase) => purchase.status === "completed")
  }
}

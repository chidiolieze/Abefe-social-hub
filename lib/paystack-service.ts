interface PaystackPaymentParams {
  amount: number
  purpose: "wallet_fund" | "product_purchase"
  productId?: string
  userId: string
  userEmail: string
  onSuccess?: (data: any) => void
  onError?: (error: string) => void
  onClose?: () => void
}

interface PaystackResponse {
  reference: string
  status: string
  trans: string
  transaction: string
  trxref: string
}

declare global {
  interface Window {
    PaystackPop: {
      setup: (config: any) => {
        openIframe: () => void
      }
    }
  }
}

export class PaystackService {
  private static instance: PaystackService
  private isScriptLoaded = false
  private scriptLoadPromise: Promise<void> | null = null

  private constructor() {}

  static getInstance(): PaystackService {
    if (!PaystackService.instance) {
      PaystackService.instance = new PaystackService()
    }
    return PaystackService.instance
  }

  private async loadPaystackScript(): Promise<void> {
    if (this.isScriptLoaded && window.PaystackPop) {
      return Promise.resolve()
    }

    if (this.scriptLoadPromise) {
      return this.scriptLoadPromise
    }

    this.scriptLoadPromise = new Promise<void>((resolve, reject) => {
      if (typeof window === "undefined") {
        reject(new Error("Not running in browser environment"))
        return
      }

      // Check if script is already loaded
      if (window.PaystackPop) {
        this.isScriptLoaded = true
        resolve()
        return
      }

      // Remove any existing script to avoid conflicts
      const existingScript = document.querySelector('script[src*="paystack"]')
      if (existingScript) {
        existingScript.remove()
      }

      const script = document.createElement("script")
      script.src = "https://js.paystack.co/v1/inline.js"
      script.async = true

      script.onload = () => {
        console.log("Paystack script loaded successfully")
        // Wait a bit for the script to initialize
        setTimeout(() => {
          if (window.PaystackPop) {
            this.isScriptLoaded = true
            resolve()
          } else {
            reject(new Error("Paystack object not available after script load"))
          }
        }, 500)
      }

      script.onerror = (error) => {
        console.error("Failed to load Paystack script:", error)
        this.scriptLoadPromise = null
        reject(new Error("Failed to load payment service"))
      }

      document.head.appendChild(script)
    })

    return this.scriptLoadPromise
  }

  async initializePayment(params: PaystackPaymentParams): Promise<void> {
    const { amount, purpose, productId, userId, userEmail, onSuccess, onError, onClose } = params

    // Validate parameters
    if (!amount || amount <= 0) {
      throw new Error("Invalid amount")
    }

    if (purpose === "wallet_fund" && amount < 100) {
      throw new Error("Minimum funding amount is ₦100")
    }

    if (purpose === "product_purchase" && !productId) {
      throw new Error("Product ID is required for product purchases")
    }

    if (!userId || !userEmail) {
      throw new Error("User information is required")
    }

    try {
      // Initialize payment with backend
      const response = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userEmail,
          amount: amount,
          userId: userId,
          type: purpose === "wallet_fund" ? "wallet" : "purchase",
          productId: productId,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        if (response.status === 503) {
          throw new Error("Payment service is not configured. Please contact support or use manual bank transfer.")
        } else {
          throw new Error(data.error || "Failed to initialize payment")
        }
      }

      const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || data.publicKey

      if (!publicKey || !publicKey.startsWith("pk_")) {
        throw new Error(
          "Payment service is not properly configured. Please use manual bank transfer or contact support.",
        )
      }

      if (!data.data?.reference) {
        throw new Error("Payment reference not generated. Please try again.")
      }

      // Load Paystack script
      await this.loadPaystackScript()

      // Open payment popup
      await this.openPaymentPopup({
        publicKey,
        amount,
        reference: data.data.reference,
        email: userEmail,
        userId,
        purpose,
        productId,
        onSuccess,
        onError,
        onClose,
      })
    } catch (error) {
      console.error("Payment initialization error:", error)
      throw error
    }
  }

  private async openPaymentPopup(config: {
    publicKey: string
    amount: number
    reference: string
    email: string
    userId: string
    purpose: string
    productId?: string
    onSuccess?: (data: any) => void
    onError?: (error: string) => void
    onClose?: () => void
  }): Promise<void> {
    const { publicKey, amount, reference, email, userId, purpose, productId, onSuccess, onError, onClose } = config

    try {
      if (!window.PaystackPop) {
        throw new Error("Paystack script not loaded properly")
      }

      function paymentCallback(response: PaystackResponse) {
        console.log("Payment callback received:", response)

        // Handle async verification in a separate function
        const verifyPayment = async () => {
          try {
            // Verify payment with backend
            const verifyResponse = await fetch(`/api/paystack/verify?reference=${response.reference}`)
            const verifyData = await verifyResponse.json()

            if (verifyData.success) {
              const successMessage =
                purpose === "wallet_fund"
                  ? `Payment successful! Your wallet has been funded with ₦${amount.toLocaleString()}.`
                  : `Payment successful! Your purchase has been completed.`

              onSuccess?.(verifyData)
            } else {
              const errorMessage =
                "Payment verification failed. Please contact support with reference: " + response.reference
              onError?.(errorMessage)
            }
          } catch (verifyError) {
            console.error("Payment verification error:", verifyError)
            const errorMessage =
              "Payment verification failed. Please contact support with reference: " + response.reference
            onError?.(errorMessage)
          }
        }

        // Execute async verification
        verifyPayment()
      }

      function paymentOnClose() {
        console.log("Payment popup closed")
        onClose?.()
      }

      const handler = window.PaystackPop.setup({
        key: publicKey,
        email: email,
        amount: amount * 100, // Convert to kobo
        ref: reference,
        currency: "NGN",
        metadata: {
          userId: userId,
          type: purpose,
          productId: productId || null,
        },
        callback: paymentCallback,
        onClose: paymentOnClose,
      })

      if (!handler || typeof handler.openIframe !== "function") {
        throw new Error("Payment handler not initialized properly")
      }

      // Open the popup with a small delay to ensure everything is ready
      setTimeout(() => {
        try {
          handler.openIframe()
        } catch (openError) {
          console.error("Error opening iframe:", openError)
          throw new Error("Failed to open payment popup")
        }
      }, 100)
    } catch (error) {
      console.error("Error setting up Paystack popup:", error)
      throw error
    }
  }

  // Utility method to format currency
  static formatCurrency(amount: number): string {
    return `₦${amount.toLocaleString()}`
  }

  // Utility method to validate amount
  static validateAmount(
    amount: number,
    purpose: "wallet_fund" | "product_purchase",
  ): { valid: boolean; error?: string } {
    if (!amount || amount <= 0) {
      return { valid: false, error: "Please enter a valid amount" }
    }

    if (purpose === "wallet_fund" && amount < 100) {
      return { valid: false, error: "Minimum funding amount is ₦100" }
    }

    return { valid: true }
  }
}

export default PaystackService

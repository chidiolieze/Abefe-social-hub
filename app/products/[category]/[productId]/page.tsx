"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  ShoppingCart,
  Shield,
  Clock,
  Globe,
  CheckCircle,
  Star,
  Package,
  Loader2,
  CreditCard,
  Wallet,
  Copy,
} from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { useProducts } from "@/lib/products-context"
import { useAuth } from "@/lib/auth-context"
import { categoryMap } from "@/lib/products-data"
import { TransactionService } from "@/lib/transaction-service"
import Database from "@/lib/database"
import { SecurityUtils } from "@/lib/security"
import Image from "next/image"
import PaystackService from "@/lib/paystack-service"

export default function ProductPage({ params }: { params: { category: string; productId: string } }) {
  const { getProductById, getProductsByCategory, isLoading } = useProducts()
  const { user } = useAuth()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [purchaseResult, setPurchaseResult] = useState<{ success: boolean; message: string } | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "paystack" | "manual">("paystack")
  const [isManualPaymentOpen, setIsManualPaymentOpen] = useState(false)
  const [transactionReference, setTransactionReference] = useState("")
  const [proofOfPayment, setProofOfPayment] = useState("")
  const [copiedField, setCopiedField] = useState("")

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading product...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const product = getProductById(params.productId)
  const categoryProducts = getProductsByCategory(params.category)
  const relatedProducts = categoryProducts.filter((p) => p.id !== params.productId).slice(0, 3)

  if (!product) {
    console.log("[v0] Product not found:", params.productId)
    console.log(
      "[v0] Available products:",
      getProductsByCategory(params.category).map((p) => p.id),
    )
    notFound()
  }

  const compatibleProduct = {
    ...product,
    inStock: product.stock > 0,
    image: product.image_url || product.image || "/placeholder.svg",
    country: product.country || "Global",
    activeDays: product.activeDays || 30,
    originalPrice: product.originalPrice,
    rating: product.rating || 4.5,
    reviews: product.reviews || 10,
    features: product.features || ["Premium Quality", "24/7 Support", "Instant Delivery"],
  }

  const categoryTitle =
    categoryMap[compatibleProduct.category as keyof typeof categoryMap] || compatibleProduct.category

  const bankDetails = {
    bank: "NOMBANK",
    accountNumber: "2624503680",
    accountName: "OLOYEDE SAMSON",
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(""), 2000)
  }

  const handlePaystackPayment = async () => {
    if (!user) {
      router.push("/login")
      return
    }

    const rateLimit = SecurityUtils.checkAdvancedRateLimit(user.email, "payment")
    if (!rateLimit.allowed) {
      setPurchaseResult({
        success: false,
        message: `Too many payment attempts. Please try again in ${Math.ceil((rateLimit.resetTime - Date.now()) / 60000)} minutes.`,
      })
      return
    }

    setIsProcessing(true)
    setPurchaseResult(null)

    try {
      const paystackService = PaystackService.getInstance()

      await paystackService.initializePayment({
        amount: compatibleProduct.price,
        purpose: "product_purchase",
        productId: compatibleProduct.id,
        userId: user.id,
        userEmail: user.email,
        onSuccess: (data) => {
          setPurchaseResult({
            success: true,
            message: `Payment successful! Your purchase of ${compatibleProduct.name} has been completed. Redirecting to dashboard...`,
          })
          setIsProcessing(false)

          // Redirect to dashboard after 2 seconds
          setTimeout(() => {
            router.push("/dashboard")
          }, 2000)
        },
        onError: (error) => {
          setPurchaseResult({
            success: false,
            message: error,
          })
          setIsProcessing(false)
        },
        onClose: () => {
          setPurchaseResult({
            success: false,
            message: "Payment cancelled",
          })
          setIsProcessing(false)
        },
      })

      setPurchaseResult({
        success: false,
        message: "Complete your payment in the popup window",
      })
    } catch (error) {
      setPurchaseResult({
        success: false,
        message: error instanceof Error ? error.message : "Failed to initialize payment. Please try again.",
      })
      setIsProcessing(false)
    }
  }

  const handleWalletPurchase = async () => {
    if (!user) {
      router.push("/login")
      return
    }

    setIsProcessing(true)
    setPurchaseResult(null)

    try {
      const result = await TransactionService.processPurchase({
        userId: user.id,
        productId: compatibleProduct.id,
        productName: compatibleProduct.name,
        productCategory: compatibleProduct.category,
        amount: compatibleProduct.price,
        activeDays: compatibleProduct.activeDays,
      })

      setPurchaseResult({
        success: result.success,
        message: result.message,
      })

      if (result.success) {
        // Redirect to dashboard after successful purchase
        setTimeout(() => {
          router.push("/dashboard")
        }, 2000)
      }
    } catch (error) {
      setPurchaseResult({
        success: false,
        message: "An unexpected error occurred. Please try again.",
      })
    }

    setIsProcessing(false)
  }

  const handleManualPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const sanitizedReference = SecurityUtils.sanitizeAndValidateInput(transactionReference, "text")
    if (!sanitizedReference.valid) {
      setPurchaseResult({
        success: false,
        message: sanitizedReference.error || "Invalid transaction reference",
      })
      return
    }

    if (!sanitizedReference.sanitized.trim()) {
      setPurchaseResult({
        success: false,
        message: "Please enter your transaction reference",
      })
      return
    }

    setIsProcessing(true)
    setPurchaseResult(null)

    try {
      // Create manual payment request
      Database.createManualPaymentRequest({
        userId: user.id,
        productId: compatibleProduct.id,
        productName: compatibleProduct.name,
        productCategory: compatibleProduct.category,
        amount: compatibleProduct.price,
        transactionReference: sanitizedReference.sanitized,
        proofOfPayment: proofOfPayment,
        status: "pending",
      })

      setPurchaseResult({
        success: true,
        message: `Payment submitted successfully! Your payment for ${compatibleProduct.name} is pending admin confirmation. You will be notified once approved.`,
      })

      setTransactionReference("")
      setProofOfPayment("")
      setIsManualPaymentOpen(false)

      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        router.push("/dashboard")
      }, 3000)
    } catch (error) {
      setPurchaseResult({
        success: false,
        message: "Failed to submit payment. Please try again.",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePurchase = () => {
    if (paymentMethod === "wallet") {
      handleWalletPurchase()
    } else if (paymentMethod === "paystack") {
      handlePaystackPayment()
    } else {
      setIsManualPaymentOpen(true)
    }
  }

  const canAffordWithWallet = user && user.balance >= compatibleProduct.price

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Breadcrumb */}
        <div className="flex flex-wrap items-center gap-2 mb-6 text-xs sm:text-sm">
          <Link href="/products">
            <Button variant="ghost" size="sm">
              All Products
            </Button>
          </Link>
          <span className="text-muted-foreground">/</span>
          <Link href={`/products/${params.category}`}>
            <Button variant="ghost" size="sm">
              {categoryTitle}
            </Button>
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="font-medium line-clamp-1">{compatibleProduct.name}</span>
        </div>

        {/* Purchase Result Alert */}
        {purchaseResult && (
          <Alert
            variant={purchaseResult.success ? "default" : "destructive"}
            className={`mb-6 ${
              purchaseResult.success ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950" : ""
            }`}
          >
            {purchaseResult.success && <CheckCircle className="h-4 w-4 text-green-600" />}
            <AlertDescription className={purchaseResult.success ? "text-green-800 dark:text-green-200" : ""}>
              {purchaseResult.message}
              {purchaseResult.success && paymentMethod !== "manual" && " Redirecting to dashboard..."}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="relative w-full h-64 sm:h-80 md:h-96 overflow-hidden rounded-lg border bg-muted">
              <Image
                src={compatibleProduct.image || "/placeholder.svg"}
                alt={compatibleProduct.name}
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3">{compatibleProduct.name}</h1>
              <p className="text-sm sm:text-base text-muted-foreground mb-4">{compatibleProduct.description}</p>

              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-4">
                <Badge
                  variant="secondary"
                  className={`text-xs sm:text-sm ${compatibleProduct.inStock ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"}`}
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {compatibleProduct.inStock ? `In Stock (${compatibleProduct.stock})` : "Out of Stock"}
                </Badge>
                {compatibleProduct.country && (
                  <Badge variant="outline" className="text-xs sm:text-sm">
                    <Globe className="h-3 w-3 mr-1" />
                    {compatibleProduct.country}
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs sm:text-sm">
                  <Clock className="h-3 w-3 mr-1" />
                  {compatibleProduct.activeDays} days
                </Badge>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="text-2xl sm:text-3xl font-bold text-red-600">
                  {PaystackService.formatCurrency(compatibleProduct.price)}
                </div>
                {compatibleProduct.originalPrice && (
                  <div className="text-base sm:text-lg text-muted-foreground line-through">
                    {PaystackService.formatCurrency(compatibleProduct.originalPrice)}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{compatibleProduct.rating}</span>
                  <span className="text-muted-foreground">({compatibleProduct.reviews} reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{compatibleProduct.stock} in stock</span>
                </div>
              </div>
            </div>

            {/* Features */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-3">Features Included:</h3>
              <ul className="space-y-2">
                {compatibleProduct.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm sm:text-base">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-semibold">Choose Payment Method:</h3>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(value) => setPaymentMethod(value as "wallet" | "paystack" | "manual")}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="paystack" id="paystack" />
                  <Label
                    htmlFor="paystack"
                    className="flex items-center gap-2 cursor-pointer hover:text-red-600 transition-colors"
                  >
                    <CreditCard className="h-4 w-4" />
                    Paystack (Card, Bank Transfer, USSD)
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                      Instant
                    </Badge>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="wallet" id="wallet" />
                  <Label
                    htmlFor="wallet"
                    className="flex items-center gap-2 cursor-pointer hover:text-red-600 transition-colors"
                  >
                    <Wallet className="h-4 w-4" />
                    Wallet Balance ({PaystackService.formatCurrency(user?.balance || 0)} available)
                    {!canAffordWithWallet && (
                      <Badge variant="destructive" className="text-xs">
                        Insufficient Balance
                      </Badge>
                    )}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="manual" id="manual" />
                  <Label
                    htmlFor="manual"
                    className="flex items-center gap-2 cursor-pointer hover:text-red-600 transition-colors"
                  >
                    <CreditCard className="h-4 w-4" />
                    Manual Bank Transfer
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Purchase Button */}
            <div className="space-y-4">
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-red-800 to-red-600 hover:from-red-900 hover:to-red-700 disabled:opacity-50 text-sm sm:text-base transition-all hover:shadow-lg"
                disabled={
                  !compatibleProduct.inStock ||
                  isProcessing ||
                  purchaseResult?.success ||
                  (paymentMethod === "wallet" && !canAffordWithWallet)
                }
                onClick={handlePurchase}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                    {paymentMethod === "paystack"
                      ? "Initializing Payment..."
                      : paymentMethod === "wallet"
                        ? "Processing Purchase..."
                        : "Submitting Payment..."}
                  </>
                ) : purchaseResult?.success ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    {paymentMethod === "manual" ? "Payment Submitted!" : "Purchase Completed!"}
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    {compatibleProduct.inStock
                      ? `${
                          paymentMethod === "paystack"
                            ? "Pay with Paystack"
                            : paymentMethod === "wallet"
                              ? "Purchase Now"
                              : "Pay via Transfer"
                        } - ${PaystackService.formatCurrency(compatibleProduct.price)}`
                      : "Out of Stock"}
                  </>
                )}
              </Button>
              <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Secure payment & instant delivery</span>
              </div>
            </div>
          </div>
        </div>

        {/* Manual Payment Dialog */}
        <Dialog open={isManualPaymentOpen} onOpenChange={setIsManualPaymentOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Manual Bank Transfer</DialogTitle>
              <DialogDescription>
                Transfer {PaystackService.formatCurrency(compatibleProduct.price)} to the account below and submit your
                payment details
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Bank Details */}
              <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Bank</p>
                    <p className="font-semibold">🏦 {bankDetails.bank}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(bankDetails.bank, "bank")}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {copiedField === "bank" ? "Copied!" : <Copy className="h-4 w-4" />}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Account Number</p>
                    <p className="font-semibold">{bankDetails.accountNumber}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(bankDetails.accountNumber, "account")}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {copiedField === "account" ? "Copied!" : <Copy className="h-4 w-4" />}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Account Name</p>
                    <p className="font-semibold">{bankDetails.accountName}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(bankDetails.accountName, "name")}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {copiedField === "name" ? "Copied!" : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Payment Form */}
              <form onSubmit={handleManualPayment} className="space-y-4">
                <div>
                  <Label htmlFor="reference">Transaction Reference *</Label>
                  <Input
                    id="reference"
                    type="text"
                    placeholder="Enter transaction reference from your bank"
                    value={transactionReference}
                    onChange={(e) => setTransactionReference(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="proof">Proof of Payment (Optional)</Label>
                  <Textarea
                    id="proof"
                    placeholder="Paste screenshot link or additional details"
                    value={proofOfPayment}
                    onChange={(e) => setProofOfPayment(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsManualPaymentOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-red-800 to-red-600 hover:from-red-900 hover:to-red-700"
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Submitting..." : "Submit Payment"}
                  </Button>
                </div>
              </form>
            </div>
          </DialogContent>
        </Dialog>

        {/* Product Description */}
        <Card className="mb-6 sm:mb-8">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Product Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {compatibleProduct.description}
              {compatibleProduct.country &&
                ` This premium account is specifically from ${compatibleProduct.country} and comes with ${compatibleProduct.activeDays} days of guaranteed access.`}
              {compatibleProduct.features.length > 0 &&
                ` Key features include ${compatibleProduct.features.slice(0, 3).join(", ")} and more.`}
            </p>
          </CardContent>
        </Card>

        {/* Specifications */}
        <Card className="mb-6 sm:mb-8">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Specifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="font-medium text-sm sm:text-base">Category:</span>
                <span className="text-muted-foreground text-sm sm:text-base">{categoryTitle}</span>
              </div>
              {compatibleProduct.country && (
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="font-medium text-sm sm:text-base">Country:</span>
                  <span className="text-muted-foreground text-sm sm:text-base">{compatibleProduct.country}</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="font-medium text-sm sm:text-base">Active Days:</span>
                <span className="text-muted-foreground text-sm sm:text-base">{compatibleProduct.activeDays} days</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="font-medium text-sm sm:text-base">Stock:</span>
                <span className="text-muted-foreground text-sm sm:text-base">{compatibleProduct.stock} available</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="font-medium text-sm sm:text-base">Rating:</span>
                <span className="text-muted-foreground text-sm sm:text-base">
                  {compatibleProduct.rating}/5 ({compatibleProduct.reviews} reviews)
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="font-medium text-sm sm:text-base">Support:</span>
                <span className="text-muted-foreground text-sm sm:text-base">24/7 customer support</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Related Products</h2>
            <div className="grid gap-4 sm:gap-6">
              {relatedProducts.map((relatedProduct) => (
                <div key={relatedProduct.id}>
                  <Link href={`/products/${relatedProduct.category}/${relatedProduct.id}`}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                            <Image
                              src={relatedProduct.image_url || relatedProduct.image || "/placeholder.svg"}
                              alt={relatedProduct.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm sm:text-base mb-1 line-clamp-1">
                              {relatedProduct.name}
                            </h3>
                            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-2">
                              {relatedProduct.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-base sm:text-lg font-bold text-red-600">
                                {PaystackService.formatCurrency(relatedProduct.price)}
                              </span>
                              <Button size="sm" variant="outline" className="text-xs sm:text-sm bg-transparent">
                                View Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

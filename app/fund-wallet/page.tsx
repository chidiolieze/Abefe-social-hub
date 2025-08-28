"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Wallet, CreditCard, ArrowLeft, Building2, Copy, Loader2 } from "lucide-react"
import Link from "next/link"
import PaystackService from "@/lib/paystack-service"

declare global {
  interface Window {
    PaystackPop: {
      setup: (config: any) => {
        openIframe: () => void
      }
    }
  }
}

export default function FundWalletPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [amount, setAmount] = useState("")
  const [transactionReference, setTransactionReference] = useState("")
  const [proofOfPayment, setProofOfPayment] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [copiedField, setCopiedField] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<"paystack" | "manual">("paystack")
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const bankDetails = {
    bank: "NOMBANK",
    accountNumber: "2624503680",
    accountName: "OLOYEDE SAMSON",
  }

  const copyToClipboard = (text: string, field: string) => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(""), 2000)
    }
  }

  const handlePaystackPayment = async () => {
    if (!user) return

    const fundAmount = Number.parseFloat(amount)
    const validation = PaystackService.validateAmount(fundAmount, "wallet_fund")

    if (!validation.valid) {
      setMessage(validation.error || "Invalid amount")
      return
    }

    setIsLoading(true)
    setMessage("Initializing payment...")

    try {
      const paystackService = PaystackService.getInstance()

      await paystackService.initializePayment({
        amount: fundAmount,
        purpose: "wallet_fund",
        userId: user.id,
        userEmail: user.email,
        onSuccess: (data) => {
          setMessage(
            `Payment successful! Your wallet has been funded with ${PaystackService.formatCurrency(fundAmount)}.`,
          )
          setAmount("")
          setIsLoading(false)

          // Reload page to show updated balance
          if (typeof window !== "undefined" && window.location && window.location.reload) {
            setTimeout(() => {
              window.location.reload()
            }, 2000)
          } else {
            setTimeout(() => {
              router.push("/dashboard")
            }, 3000)
          }
        },
        onError: (error) => {
          setMessage(error)
          setIsLoading(false)
        },
        onClose: () => {
          setMessage("Payment cancelled by user")
          setIsLoading(false)
        },
      })

      setMessage("Complete your payment in the popup window")
    } catch (error) {
      console.error("Payment initialization error:", error)
      setMessage(
        `${error instanceof Error ? error.message : "Payment initialization failed"}. Please try manual bank transfer or contact support.`,
      )
      setIsLoading(false)
    }
  }

  const handleFundWallet = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (paymentMethod === "paystack") {
      handlePaystackPayment()
    } else {
      const fundAmount = Number.parseFloat(amount)
      if (isNaN(fundAmount) || fundAmount <= 0) {
        setMessage("Please enter a valid amount")
        return
      }

      if (!transactionReference.trim()) {
        setMessage("Please enter your transaction reference")
        return
      }

      setIsLoading(true)
      setMessage("")

      try {
        const response = await fetch("/api/funding-requests", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
            amount: fundAmount,
            transactionReference: transactionReference.trim(),
            proofOfPayment: proofOfPayment,
          }),
        })

        const data = await response.json()

        if (data.success) {
          setMessage(
            `Funding request submitted successfully! Your request for ${PaystackService.formatCurrency(fundAmount)} is pending admin confirmation.`,
          )
          setAmount("")
          setTransactionReference("")
          setProofOfPayment("")

          setTimeout(() => {
            router.push("/dashboard")
          }, 3000)
        } else {
          setMessage(data.message || "Failed to submit funding request. Please try again.")
        }
      } catch (error) {
        console.error("Error submitting funding request:", error)
        setMessage("Failed to submit funding request. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    if (!user && isClient) {
      router.push("/login")
    }
  }, [user, isClient, router])

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <Link href="/dashboard" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold mb-2">Fund Wallet</h1>
          <p className="text-muted-foreground">Add funds to your Abefe Social Hub wallet</p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Current Balance
              </CardTitle>
              <CardDescription>Your available wallet balance</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{PaystackService.formatCurrency(user.balance || 0)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Choose Payment Method</CardTitle>
              <CardDescription>Select how you want to fund your wallet</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button
                  variant={paymentMethod === "paystack" ? "default" : "outline"}
                  onClick={() => setPaymentMethod("paystack")}
                  className="h-20 flex flex-col gap-2 hover:shadow-md transition-all"
                >
                  <CreditCard className="h-6 w-6" />
                  <span>Paystack (Instant)</span>
                </Button>
                <Button
                  variant={paymentMethod === "manual" ? "default" : "outline"}
                  onClick={() => setPaymentMethod("manual")}
                  className="h-20 flex flex-col gap-2 hover:shadow-md transition-all"
                >
                  <Building2 className="h-6 w-6" />
                  <span>Bank Transfer</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {paymentMethod === "manual" && (
            <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                  <Building2 className="h-5 w-5" />
                  Bank Transfer Details
                </CardTitle>
                <CardDescription className="text-blue-600 dark:text-blue-400">
                  Transfer funds to this account and submit the form below
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border">
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

                  <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border">
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

                  <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border">
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
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                {paymentMethod === "paystack" ? "Fund Wallet with Paystack" : "Submit Funding Request"}
              </CardTitle>
              <CardDescription>
                {paymentMethod === "paystack"
                  ? "Enter amount and pay instantly with card, bank transfer, or USSD"
                  : "After making the transfer, fill out this form for confirmation"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFundWallet} className="space-y-4">
                <div>
                  <Label htmlFor="amount">Amount (₦)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="1"
                    step="0.01"
                    required
                    className="transition-all focus:ring-2 focus:ring-red-500"
                  />
                </div>

                {paymentMethod === "manual" && (
                  <>
                    <div>
                      <Label htmlFor="reference">Transaction Reference</Label>
                      <Input
                        id="reference"
                        type="text"
                        placeholder="Enter transaction reference from your bank"
                        value={transactionReference}
                        onChange={(e) => setTransactionReference(e.target.value)}
                        required
                        className="transition-all focus:ring-2 focus:ring-red-500"
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
                        className="transition-all focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </>
                )}

                {message && (
                  <div
                    className={`p-3 rounded-md text-sm transition-all ${
                      message.includes("successful")
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    {message}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-red-800 to-red-600 hover:from-red-900 hover:to-red-700 transition-all hover:shadow-lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {paymentMethod === "paystack" ? "Initializing Payment..." : "Processing..."}
                    </>
                  ) : paymentMethod === "paystack" ? (
                    "Pay Now"
                  ) : (
                    "Submit Funding Request"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Amount Options</CardTitle>
              <CardDescription>Select a preset amount</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[1000, 2000, 5000, 10000].map((preset) => (
                  <Button key={preset} variant="outline" onClick={() => setAmount(preset.toString())} className="h-12">
                    ₦{preset.toLocaleString()}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}

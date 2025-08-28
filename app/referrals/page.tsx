"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Share2, Copy, Users, DollarSign, Gift, CheckCircle, ExternalLink } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import Database from "@/lib/database"
import PaystackService from "@/lib/paystack-service"

export default function ReferralsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [referralLink, setReferralLink] = useState("")
  const [copiedField, setCopiedField] = useState("")
  const [referrals, setReferrals] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalReferrals: 0,
    totalEarnings: 0,
    pendingEarnings: 0,
  })

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    // Generate referral link
    const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
    setReferralLink(`${baseUrl}/register?ref=${user.referralCode}`)

    // Load referral data
    loadReferralData()
  }, [user, router])

  const loadReferralData = () => {
    if (!user) return

    const userReferrals = Database.getUserReferrals(user.id)
    setReferrals(userReferrals)

    setStats({
      totalReferrals: user.totalReferrals || 0,
      totalEarnings: user.referralEarnings || 0,
      pendingEarnings: 0, // Could be calculated based on pending purchases
    })
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(""), 2000)
  }

  const shareReferralLink = () => {
    if (navigator.share) {
      navigator.share({
        title: "Join Abefe Social Hub",
        text: "Get premium social media accounts at amazing prices!",
        url: referralLink,
      })
    } else {
      copyToClipboard(referralLink, "link")
    }
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-red-800 via-red-600 to-orange-500 bg-clip-text text-transparent">
              Refer & Earn
            </h1>
            <p className="text-lg text-muted-foreground">Earn 2% commission on every purchase made by your referrals</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalReferrals}</div>
                <p className="text-xs text-muted-foreground">People you've referred</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{PaystackService.formatCurrency(stats.totalEarnings)}</div>
                <p className="text-xs text-muted-foreground">Commission earned</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
                <Gift className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{PaystackService.formatCurrency(user.balance)}</div>
                <p className="text-xs text-muted-foreground">Available in wallet</p>
              </CardContent>
            </Card>
          </div>

          {/* Referral Link Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Your Referral Link
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="referral-code">Your Referral Code</Label>
                <div className="flex gap-2 mt-1">
                  <Input id="referral-code" value={user.referralCode} readOnly className="font-mono" />
                  <Button variant="outline" onClick={() => copyToClipboard(user.referralCode, "code")}>
                    {copiedField === "code" ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="referral-link">Your Referral Link</Label>
                <div className="flex gap-2 mt-1">
                  <Input id="referral-link" value={referralLink} readOnly className="font-mono text-sm" />
                  <Button variant="outline" onClick={() => copyToClipboard(referralLink, "link")}>
                    {copiedField === "link" ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={shareReferralLink}
                  className="bg-gradient-to-r from-red-800 to-red-600 hover:from-red-900 hover:to-red-700"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Link
                </Button>
                <Button variant="outline" asChild>
                  <a
                    href={`https://wa.me/?text=Join Abefe Social Hub and get premium social media accounts! Use my referral link: ${referralLink}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Share on WhatsApp
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* How It Works */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Share2 className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="font-semibold mb-2">1. Share Your Link</h3>
                  <p className="text-sm text-muted-foreground">
                    Share your unique referral link with friends and family
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-2">2. They Sign Up</h3>
                  <p className="text-sm text-muted-foreground">
                    When someone signs up using your link, they become your referral
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2">3. Earn Commission</h3>
                  <p className="text-sm text-muted-foreground">Earn 2% commission on every purchase they make</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Commission Info */}
          <Alert className="mb-8">
            <Gift className="h-4 w-4" />
            <AlertDescription>
              <strong>Commission Rate:</strong> You earn 2% on every purchase made by your referrals. For example, if
              someone you referred spends ₦10,000, you earn ₦200 instantly added to your wallet!
            </AlertDescription>
          </Alert>

          {/* Referral History */}
          {referrals.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Your Referrals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {referrals.map((referral) => {
                    const referredUser = Database.getUserById(referral.referredUserId)
                    return (
                      <div key={referral.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{referredUser?.name || "Unknown User"}</p>
                          <p className="text-sm text-muted-foreground">
                            Joined: {new Date(referral.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">
                            {PaystackService.formatCurrency(referral.commissionEarned)}
                          </p>
                          <Badge variant="outline">{referral.commissionEarned > 0 ? "Active" : "New"}</Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}

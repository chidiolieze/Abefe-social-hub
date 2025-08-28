"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth-context"
import { Eye, EyeOff, Loader2, CheckCircle, XCircle, Gift } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ValidationUtils } from "@/lib/validation"

export function RegisterForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [passwordStrength, setPasswordStrength] = useState<{ isValid: boolean; message: string } | null>(null)
  const [referralCode, setReferralCode] = useState("")
  const [referralValid, setReferralValid] = useState<boolean | null>(null)
  const { register, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const refParam = searchParams.get("ref")
    if (refParam) {
      setReferralCode(refParam)
      validateReferralCode(refParam)
    }
  }, [searchParams])

  const validateReferralCode = async (code: string) => {
    if (!code.trim()) {
      setReferralValid(null)
      return
    }

    try {
      const response = await fetch(`/api/referrals/validate?code=${encodeURIComponent(code.trim())}`)
      const data = await response.json()
      setReferralValid(data.success && data.valid)
    } catch (error) {
      console.error("Error validating referral code:", error)
      setReferralValid(false)
    }
  }

  const handlePasswordChange = (value: string) => {
    setPassword(value)
    if (value) {
      setPasswordStrength(ValidationUtils.isValidPassword(value))
    } else {
      setPasswordStrength(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim() || !confirmPassword.trim()) {
      setError("Please fill in all fields")
      return
    }

    if (name.length > 50) {
      setError("Name is too long (maximum 50 characters)")
      return
    }

    if (email.length > 254) {
      setError("Email address is too long")
      return
    }

    if (phone.length > 20) {
      setError("Phone number is too long")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length > 128) {
      setError("Password is too long (maximum 128 characters)")
      return
    }

    const result = await register(name, email, phone, password, referralCode.trim() || undefined)
    if (result.success) {
      router.push("/dashboard")
    } else {
      setError(result.message)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-red-800 via-red-600 to-orange-500 bg-clip-text text-transparent">
          Create Account
        </CardTitle>
        <CardDescription>Join Abefe Social Hub today</CardDescription>
        {referralCode && referralValid && (
          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-center gap-2 text-green-700 text-sm">
              <Gift className="h-4 w-4" />
              <span>You're joining through a referral! Both you and your referrer will benefit.</span>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              required
              autoComplete="name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={254}
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength={20}
              required
              autoComplete="tel"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="referralCode">Referral Code (Optional)</Label>
            <Input
              id="referralCode"
              type="text"
              placeholder="Enter referral code if you have one"
              value={referralCode}
              onChange={(e) => {
                setReferralCode(e.target.value)
                validateReferralCode(e.target.value)
              }}
              className={referralValid === false ? "border-red-300" : referralValid === true ? "border-green-300" : ""}
            />
            {referralValid === true && (
              <div className="flex items-center gap-2 text-xs text-green-600">
                <CheckCircle className="h-3 w-3" />
                <span>Valid referral code! You'll both earn rewards.</span>
              </div>
            )}
            {referralValid === false && (
              <div className="flex items-center gap-2 text-xs text-red-600">
                <XCircle className="h-3 w-3" />
                <span>Invalid referral code</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                maxLength={128}
                required
                autoComplete="new-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {passwordStrength && (
              <div
                className={`flex items-center gap-2 text-xs ${passwordStrength.isValid ? "text-green-600" : "text-red-600"}`}
              >
                {passwordStrength.isValid ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                <span>{passwordStrength.message}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              maxLength={128}
              required
              autoComplete="new-password"
            />
            {password && confirmPassword && password !== confirmPassword && (
              <div className="flex items-center gap-2 text-xs text-red-600">
                <XCircle className="h-3 w-3" />
                <span>Passwords do not match</span>
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-red-800 to-red-600 hover:from-red-900 hover:to-red-700"
            disabled={isLoading || (passwordStrength && !passwordStrength.isValid)}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link href="/login" className="text-red-600 hover:text-red-700 font-medium">
              Sign in
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

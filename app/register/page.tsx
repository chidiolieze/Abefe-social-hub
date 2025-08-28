import { RegisterForm } from "@/components/auth/register-form"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Suspense } from "react"

function RegisterFormWrapper() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[400px]">Loading...</div>}>
      <RegisterForm />
    </Suspense>
  )
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Register Form */}
      <div className="container mx-auto px-4 py-16">
        <RegisterFormWrapper />
      </div>

      <Footer />
    </div>
  )
}

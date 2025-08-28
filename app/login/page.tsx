import { LoginForm } from "@/components/auth/login-form"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Login Form */}
      <div className="container mx-auto px-4 py-16">
        <LoginForm />
      </div>

      <Footer />
    </div>
  )
}

import type React from "react"
import type { Metadata } from "next"
import { Inter, DM_Sans } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/lib/auth-context"
import { AdminAuthProvider } from "@/lib/admin-auth"
import { ProductsProvider } from "@/lib/products-context"
import { NotificationProvider } from "@/lib/notification-context" // Added NotificationProvider import

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
})

export const metadata: Metadata = {
  title: "Abefe Social Hub - Premium Social Media Accounts & App Logins",
  description:
    "Your trusted platform for social media accounts, foreign numbers, and premium app logins. All deals are affordable at Abefe Social Hub.",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${dmSans.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange={false}>
          <AuthProvider>
            <AdminAuthProvider>
              <ProductsProvider>
                <NotificationProvider>{children}</NotificationProvider> {/* Added NotificationProvider wrapper */}
              </ProductsProvider>
            </AdminAuthProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { NotificationBell } from "@/components/notification-bell"
import { useAuth } from "@/lib/auth-context"
import { Menu, X, User, LogOut, Package, Share2, Plus } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/")
    setIsMenuOpen(false)
  }

  const closeMenu = () => setIsMenuOpen(false)

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2" onClick={closeMenu}>
            <div className="w-8 h-8 bg-gradient-to-r from-red-800 to-orange-500 rounded-full"></div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-red-800 via-red-600 to-orange-500 bg-clip-text text-transparent">
              Abefe Social Hub
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-foreground hover:text-red-600 transition-colors font-medium">
              Home
            </Link>
            <Link href="/products" className="text-foreground hover:text-red-600 transition-colors font-medium">
              Products
            </Link>
            <Link href="/contact" className="text-foreground hover:text-red-600 transition-colors font-medium">
              Contact
            </Link>
          </nav>

          {/* Desktop Auth & Theme */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            {user && <NotificationBell />}
            {user ? (
              <div className="flex items-center space-x-3">
                <Link href="/fund-wallet">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Funds
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center space-x-2 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      <User className="h-4 w-4" />
                      <span>{user.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center cursor-pointer">
                        <div className="flex items-center w-full p-2 rounded-md bg-blue-50 text-blue-700 font-semibold hover:bg-blue-100 transition-colors">
                          <User className="h-4 w-4 mr-2" />
                          Dashboard
                        </div>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/orders" className="flex items-center cursor-pointer">
                        <div className="flex items-center w-full p-2 rounded-md bg-purple-50 text-purple-700 font-semibold hover:bg-purple-100 transition-colors">
                          <Package className="h-4 w-4 mr-2" />
                          My Orders
                        </div>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/referrals" className="flex items-center cursor-pointer">
                        <div className="flex items-center w-full p-2 rounded-md bg-green-50 text-green-700 font-semibold hover:bg-green-100 transition-colors">
                          <Share2 className="h-4 w-4 mr-2" />
                          Refer & Earn
                        </div>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                      <div className="flex items-center w-full p-2 rounded-md bg-red-50 text-red-700 font-semibold hover:bg-red-100 transition-colors">
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="hover:bg-red-50 hover:text-red-600 transition-colors">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-red-800 to-red-600 hover:from-red-900 hover:to-red-700 transition-all duration-200 hover:shadow-md"
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            {user && <NotificationBell />}
            <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t py-4">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/"
                className="text-foreground hover:text-red-600 transition-colors font-medium py-2"
                onClick={closeMenu}
              >
                Home
              </Link>
              <Link
                href="/products"
                className="text-foreground hover:text-red-600 transition-colors font-medium py-2"
                onClick={closeMenu}
              >
                Products
              </Link>
              <Link
                href="/contact"
                className="text-foreground hover:text-red-600 transition-colors font-medium py-2"
                onClick={closeMenu}
              >
                Contact
              </Link>

              <div className="border-t pt-4 mt-4">
                {user ? (
                  <div className="space-y-3">
                    <Link href="/fund-wallet" onClick={closeMenu}>
                      <Button
                        size="sm"
                        className="w-full justify-start bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-semibold shadow-md"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Funds
                      </Button>
                    </Link>
                    <Link href="/dashboard" onClick={closeMenu}>
                      <div className="w-full p-3 rounded-lg bg-blue-50 text-blue-700 font-bold hover:bg-blue-100 transition-colors flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Dashboard ({user.name})
                      </div>
                    </Link>
                    <Link href="/orders" onClick={closeMenu}>
                      <div className="w-full p-3 rounded-lg bg-purple-50 text-purple-700 font-bold hover:bg-purple-100 transition-colors flex items-center">
                        <Package className="h-4 w-4 mr-2" />
                        My Orders
                      </div>
                    </Link>
                    <Link href="/referrals" onClick={closeMenu}>
                      <div className="w-full p-3 rounded-lg bg-green-50 text-green-700 font-bold hover:bg-green-100 transition-colors flex items-center">
                        <Share2 className="h-4 w-4 mr-2" />
                        Refer & Earn
                      </div>
                    </Link>
                    <div
                      onClick={handleLogout}
                      className="w-full p-3 rounded-lg bg-red-50 text-red-700 font-bold hover:bg-red-100 transition-colors flex items-center cursor-pointer"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link href="/login" onClick={closeMenu}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        Login
                      </Button>
                    </Link>
                    <Link href="/register" onClick={closeMenu}>
                      <Button
                        size="sm"
                        className="w-full justify-start bg-gradient-to-r from-red-800 to-red-600 hover:from-red-900 hover:to-red-700 transition-all duration-200 hover:shadow-md"
                      >
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

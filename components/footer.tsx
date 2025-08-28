import { Button } from "@/components/ui/button"
import { Mail, Phone, Instagram, MessageCircle, Send } from "lucide-react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-red-800 to-orange-500 rounded-full"></div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-red-800 via-red-600 to-orange-500 bg-clip-text text-transparent">
                Abefe Social Hub
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Your trusted platform for premium social media accounts, foreign numbers, and app logins. All deals are
              affordable.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold">Quick Links</h4>
            <div className="space-y-2">
              <Link href="/" className="block text-sm text-muted-foreground hover:text-red-600 transition-colors">
                Home
              </Link>
              <Link
                href="/products"
                className="block text-sm text-muted-foreground hover:text-red-600 transition-colors"
              >
                Products
              </Link>
              <Link
                href="/contact"
                className="block text-sm text-muted-foreground hover:text-red-600 transition-colors"
              >
                Contact
              </Link>
              <Link href="/login" className="block text-sm text-muted-foreground hover:text-red-600 transition-colors">
                Login
              </Link>
            </div>
          </div>

          {/* Products */}
          <div className="space-y-4">
            <h4 className="font-semibold">Our Products</h4>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Social Media Accounts</p>
              <p className="text-sm text-muted-foreground">Foreign Numbers</p>
              <p className="text-sm text-muted-foreground">Premium App Logins</p>
              <p className="text-sm text-muted-foreground">Netflix & Spotify</p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="font-semibold">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-red-600" />
                <a
                  href="mailto:abefesocialhub@gmail.com"
                  className="text-sm text-muted-foreground hover:text-red-600 transition-colors"
                >
                  abefesocialhub@gmail.com
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-red-600" />
                <a
                  href="tel:+2349152839443"
                  className="text-sm text-muted-foreground hover:text-red-600 transition-colors"
                >
                  +234 915 283 9443
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Instagram className="h-4 w-4 text-red-600" />
                <a
                  href="https://instagram.com/abefesocialhub"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-red-600 transition-colors"
                >
                  @abefesocialhub
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Send className="h-4 w-4 text-red-600" />
                <a
                  href="https://t.me/abefesocialhub"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-red-600 transition-colors"
                >
                  Telegram Channel
                </a>
              </div>
              <div className="flex gap-2">
                <Button asChild size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                  <a href="https://wa.me/2349152839443" target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    WhatsApp
                  </a>
                </Button>
                <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                  <a href="https://t.me/abefesocialhub" target="_blank" rel="noopener noreferrer">
                    <Send className="h-4 w-4 mr-2" />
                    Telegram
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-muted-foreground">© 2024 Abefe Social Hub. All rights reserved.</div>
        </div>
      </div>
    </footer>
  )
}

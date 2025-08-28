"use client"

import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { HeroSlider } from "@/components/hero-slider"
import { ProductCard } from "@/components/product-card"
import { ShoppingCart, Users, Globe, Star, CheckCircle } from "lucide-react"
import Link from "next/link"
// Updated to use products context instead of static import
import { useProducts } from "@/lib/products-context"

export default function HomePage() {
  // Using dynamic products from context instead of static import
  const { products } = useProducts()
  const latestProducts = products.slice(0, 6)

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <HeroSlider />

      {/* Latest Products Section */}
      <section className="py-12 sm:py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-red-800 via-red-600 to-orange-500 bg-clip-text text-transparent">
              Latest Products
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4 sm:px-0">
              Check out our newest additions and most popular items
            </p>
          </div>

          {/* Added conditional rendering for when products are loading */}
          {latestProducts.length > 0 ? (
            <div className="grid gap-4 sm:gap-6 mb-12 sm:mb-16">
              {latestProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Loading products...</p>
            </div>
          )}

          <div className="text-center px-4 sm:px-0">
            <Link href="/products">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-red-800 to-red-600 hover:from-red-900 hover:to-red-700"
              >
                <ShoppingCart className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                View All Products
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-red-800 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Star className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2">Quality Guaranteed</h3>
              <p className="text-sm text-muted-foreground">All accounts are verified and working</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-red-800 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2">Instant Delivery</h3>
              <p className="text-sm text-muted-foreground">Get your accounts immediately after purchase</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-red-800 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2">24/7 Support</h3>
              <p className="text-sm text-muted-foreground">Round-the-clock customer assistance</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-red-800 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Globe className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2">Global Access</h3>
              <p className="text-sm text-muted-foreground">Accounts from multiple countries available</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-12 sm:py-16 bg-gradient-to-r from-red-800 via-red-600 to-orange-500">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-base sm:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto px-4 sm:px-0">
            Join thousands of satisfied customers who trust Abefe Social Hub for their digital needs
          </p>
          <Link href="/products">
            <Button
              size="lg"
              variant="secondary"
              className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 h-auto font-semibold"
            >
              <ShoppingCart className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Start Shopping
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}

"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { useProducts } from "@/lib/products-context"
import { categoryMap } from "@/lib/products-data"

export default function CategoryPage({ params }: { params: { category: string } }) {
  const { getProductsByCategory } = useProducts()
  const categoryProducts = getProductsByCategory(params.category)
  const categoryTitle = categoryMap[params.category as keyof typeof categoryMap]

  if (!categoryTitle || categoryProducts.length === 0) {
    notFound()
  }

  const getCategoryDescription = (category: string) => {
    const descriptions = {
      facebook: "Premium Facebook accounts from various countries with complete verification and clean history",
      instagram: "Verified Instagram accounts with established followers and business features",
      "premium-vpn": "Premium VPN service accounts with global servers and advanced security features",
      "usa-texting": "USA phone numbers and texting services for verification and communication",
      "foreign-numbers": "International phone numbers for verification and global communication",
      "premium-apps": "Access to premium streaming and entertainment services",
      "social-media": "Premium social media accounts from various platforms and countries",
    }
    return descriptions[category as keyof typeof descriptions] || "Premium digital services and accounts"
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <Link href="/products">
            <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              All Products
            </Button>
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="font-medium text-sm sm:text-base">{categoryTitle}</span>
        </div>

        {/* Category Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-red-800 via-red-600 to-orange-500 bg-clip-text text-transparent">
            {categoryTitle}
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground mb-4 px-0 sm:px-0">
            {getCategoryDescription(params.category)}
          </p>
          <Badge
            variant="secondary"
            className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs sm:text-sm"
          >
            {categoryProducts.length} Products Available
          </Badge>
        </div>

        {/* Products Grid */}
        <div className="grid gap-4 sm:gap-6">
          {categoryProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Empty State */}
        {categoryProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No products found in this category.</p>
            <Link href="/products">
              <Button variant="outline">Browse All Products</Button>
            </Link>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

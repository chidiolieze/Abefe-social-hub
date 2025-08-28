"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { useProducts } from "@/lib/products-context"
import { Search, Filter } from "lucide-react"

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const { products } = useProducts()

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = [
    { id: "all", name: "All Products", count: products.length },
    { id: "social-media", name: "Social Media", count: products.filter((p) => p.category === "social-media").length },
    {
      id: "foreign-numbers",
      name: "Foreign Numbers",
      count: products.filter((p) => p.category === "foreign-numbers").length,
    },
    { id: "premium-apps", name: "Premium Apps", count: products.filter((p) => p.category === "premium-apps").length },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Page Header */}
      <section className="bg-gradient-to-r from-red-800 via-red-600 to-orange-500 py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">Our Products</h1>
          <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto px-4 sm:px-0">
            Browse our extensive collection of social media accounts, foreign numbers, and premium app logins
          </p>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="py-6 sm:py-8 border-b">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{filteredProducts.length} products found</span>
            </div>
          </div>
        </div>
      </section>

      {/* Products Content */}
      <section className="py-6 sm:py-8">
        <div className="container mx-auto px-4 sm:px-6">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8 h-auto">
              {categories.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm"
                >
                  <span className="truncate">{category.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {category.count}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="all" className="mt-0">
              {products.length > 0 ? (
                <div className="grid gap-4 sm:gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">Loading products...</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="social-media" className="mt-0">
              <div className="grid gap-4 sm:gap-6">
                {filteredProducts
                  .filter((product) => product.category === "social-media")
                  .map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="foreign-numbers" className="mt-0">
              <div className="grid gap-4 sm:gap-6">
                {filteredProducts
                  .filter((product) => product.category === "foreign-numbers")
                  .map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="premium-apps" className="mt-0">
              <div className="grid gap-4 sm:gap-6">
                {filteredProducts
                  .filter((product) => product.category === "premium-apps")
                  .map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
              </div>
            </TabsContent>
          </Tabs>

          {filteredProducts.length === 0 && products.length > 0 && (
            <div className="text-center py-12 sm:py-16">
              <h3 className="text-xl sm:text-2xl font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground mb-4">Try adjusting your search or filter criteria</p>
              <Button
                onClick={() => {
                  setSearchTerm("")
                  setSelectedCategory("all")
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}

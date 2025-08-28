import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Star, Package } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { formatPrice } from "@/lib/products-data"

interface Product {
  id: string
  name: string
  description: string
  category: string
  country?: string
  activeDays: number
  price: number
  originalPrice?: number
  rating: number
  reviews: number
  image: string
  image_url?: string
  features: string[]
  inStock: boolean
  stock: number
}

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  const isInStock = product.stock > 0
  const stockDisplay = isInStock ? `In Stock (${product.stock})` : "Out of Stock"

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-red-200 dark:hover:border-red-800 overflow-hidden h-full">
      <CardContent className="p-3 sm:p-4 h-full flex flex-col">
        <div className="flex items-start gap-3 flex-1">
          {/* Image container with consistent sizing */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted border">
            <Image
              src={product.image_url || product.image || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-contain transition-transform group-hover:scale-105 p-1"
            />
            {discount > 0 && (
              <Badge className="absolute -top-1 -right-1 bg-red-600 hover:bg-red-700 text-xs px-1 py-0">
                -{discount}%
              </Badge>
            )}
          </div>

          {/* Content area with proper spacing */}
          <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
            <div className="space-y-2">
              <h3 className="font-bold text-sm sm:text-base line-clamp-2 group-hover:text-red-600 transition-colors leading-tight">
                {product.name}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{product.description}</p>
            </div>

            {/* Stats section */}
            <div className="flex flex-wrap items-center gap-2 my-2 text-xs">
              <div className="flex items-center gap-1">
                <Package className="h-3 w-3 text-muted-foreground" />
                <span className={`font-medium ${isInStock ? "text-green-600" : "text-red-600"}`}>{stockDisplay}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{product.rating}</span>
                <span className="text-muted-foreground">({product.reviews})</span>
              </div>
            </div>

            {/* Price and button section */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-bold text-red-600">{formatPrice(product.price)}</span>
                {product.originalPrice && (
                  <span className="text-xs text-muted-foreground line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>

              <Link href={`/products/${product.category}/${product.id}`} className="block">
                <Button
                  size="sm"
                  className="w-full bg-gradient-to-r from-red-800 to-red-600 hover:from-red-900 hover:to-red-700 disabled:opacity-50 text-xs transition-all duration-200 hover:shadow-md"
                  disabled={!isInStock}
                >
                  <ShoppingCart className="mr-1 h-3 w-3" />
                  <span>{isInStock ? "Buy Now" : "Out of Stock"}</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

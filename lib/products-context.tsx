"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"

export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  stock: number
  image_url?: string
  created_at: string
  updated_at: string
  // Legacy fields for compatibility
  country?: string
  activeDays?: number
  originalPrice?: number
  rating?: number
  reviews?: number
  image?: string
  features?: string[]
  inStock?: boolean
}

interface ProductsContextType {
  products: Product[]
  addProduct: (product: Omit<Product, "created_at" | "updated_at">) => Promise<boolean>
  updateProduct: (productId: string, updatedProduct: Partial<Product>) => Promise<boolean>
  deleteProduct: (productId: string) => Promise<boolean>
  getProductById: (productId: string) => Product | undefined
  getProductsByCategory: (category: string) => Product[]
  refreshProducts: () => Promise<void>
  isLoading: boolean
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined)

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadProducts = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/products")
      const data = await response.json()

      if (data.success) {
        setProducts(data.products)
      } else {
        console.error("Failed to load products:", data.message)
      }
    } catch (error) {
      console.error("Error loading products:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const addProduct = useCallback(async (product: Omit<Product, "created_at" | "updated_at">): Promise<boolean> => {
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          stock: product.stock,
          image: product.image_url || product.image,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setProducts((prev) => [...prev, data.product])
        return true
      } else {
        console.error("Failed to add product:", data.message)
        return false
      }
    } catch (error) {
      console.error("Error adding product:", error)
      return false
    }
  }, [])

  const updateProduct = useCallback(async (productId: string, updatedProduct: Partial<Product>): Promise<boolean> => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: updatedProduct.name,
          description: updatedProduct.description,
          price: updatedProduct.price,
          category: updatedProduct.category,
          stock: updatedProduct.stock,
          image: updatedProduct.image_url || updatedProduct.image,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setProducts((prev) => prev.map((p) => (p.id === productId ? data.product : p)))
        return true
      } else {
        console.error("Failed to update product:", data.message)
        return false
      }
    } catch (error) {
      console.error("Error updating product:", error)
      return false
    }
  }, [])

  const deleteProduct = useCallback(async (productId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        setProducts((prev) => prev.filter((p) => p.id !== productId))
        return true
      } else {
        console.error("Failed to delete product:", data.message)
        return false
      }
    } catch (error) {
      console.error("Error deleting product:", error)
      return false
    }
  }, [])

  const getProductById = useCallback(
    (productId: string) => {
      return products.find((p) => p.id === productId)
    },
    [products],
  )

  const getProductsByCategory = useCallback(
    (category: string) => {
      return products.filter((p) => p.category === category)
    },
    [products],
  )

  const refreshProducts = useCallback(async () => {
    await loadProducts()
  }, [])

  const value: ProductsContextType = {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    getProductsByCategory,
    refreshProducts,
    isLoading,
  }

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>
}

export function useProducts() {
  const context = useContext(ProductsContext)
  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductsProvider")
  }
  return context
}

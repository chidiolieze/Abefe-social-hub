"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Package, CheckCircle, Loader2 } from "lucide-react"
import { categoryMap, formatPrice } from "@/lib/products-data"
import { useProducts, type Product } from "@/lib/products-context"
import Image from "next/image"

export function ProductManagement() {
  const { products: productList, addProduct, updateProduct, deleteProduct, isLoading } = useProducts()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    country: "",
    activeDays: 30,
    price: 0,
    originalPrice: 0,
    stock: 0,
    image: "",
    features: "",
    username: "",
    password: "",
    gmail: "",
    number: "",
  })

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "",
      country: "",
      activeDays: 30,
      price: 0,
      originalPrice: 0,
      stock: 0,
      image: "",
      features: "",
      username: "",
      password: "",
      gmail: "",
      number: "",
    })
    setImageFile(null)
    setImagePreview("")
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setImagePreview(result)
        setFormData({ ...formData, image: result })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddProduct = async () => {
    if (!formData.name || !formData.description || !formData.category) {
      setMessage("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)

    const newProduct = {
      id: `product-${Date.now()}`,
      name: formData.name,
      description: formData.description,
      category: formData.category,
      price: formData.price,
      stock: formData.stock,
      image_url: formData.image || "/placeholder.svg",
      credentials: {
        username: formData.username || null,
        password: formData.password || null,
        gmail: formData.gmail || null,
        number: formData.number || null,
      },
    }

    const success = await addProduct(newProduct)

    if (success) {
      setMessage("Product added successfully!")
      resetForm()
      setIsAddDialogOpen(false)
      setTimeout(() => setMessage(""), 3000)
    } else {
      setMessage("Failed to add product. Please try again.")
    }

    setIsSubmitting(false)
  }

  const handleEditProduct = async () => {
    if (!editingProduct || !formData.name || !formData.description || !formData.category) {
      setMessage("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)

    const updates = {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      price: formData.price,
      stock: formData.stock,
      image_url: formData.image || editingProduct.image_url,
      credentials: {
        username: formData.username || null,
        password: formData.password || null,
        gmail: formData.gmail || null,
        number: formData.number || null,
      },
    }

    const success = await updateProduct(editingProduct.id, updates)

    if (success) {
      setMessage("Product updated successfully!")
      resetForm()
      setEditingProduct(null)
      setIsEditDialogOpen(false)
      setTimeout(() => setMessage(""), 3000)
    } else {
      setMessage("Failed to update product. Please try again.")
    }

    setIsSubmitting(false)
  }

  const handleDeleteProduct = async (productId: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      const success = await deleteProduct(productId)

      if (success) {
        setMessage("Product deleted successfully!")
      } else {
        setMessage("Failed to delete product. Please try again.")
      }

      setTimeout(() => setMessage(""), 3000)
    }
  }

  const openEditDialog = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category,
      country: product.country || "",
      activeDays: product.activeDays || 30,
      price: product.price,
      originalPrice: product.originalPrice || 0,
      stock: product.stock,
      image: product.image_url || product.image || "",
      features: product.features?.join(", ") || "",
      username: product.credentials?.username || "",
      password: product.credentials?.password || "",
      gmail: product.credentials?.gmail || "",
      number: product.credentials?.number || "",
    })
    setImagePreview(product.image_url || product.image || "")
    setIsEditDialogOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading products...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Product Management</h2>
          <p className="text-muted-foreground">Manage your product inventory</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-red-800 to-red-600 hover:from-red-900 hover:to-red-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>Create a new product for your store</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter product name"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(categoryMap).map(([key, value]) => (
                        <SelectItem key={key} value={key}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter product description"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price">Price (₦) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number.parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="originalPrice">Original Price (₦)</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: Number.parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="stock">Stock Quantity *</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number.parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="image">Product Image</Label>
                <div className="space-y-4">
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="cursor-pointer"
                  />
                  <div className="text-sm text-muted-foreground">Or enter image URL:</div>
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="Enter image URL or upload file above"
                  />
                  {(imagePreview || formData.image) && (
                    <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
                      <Image src={imagePreview || formData.image} alt="Preview" fill className="object-cover" />
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-sm">Product Credentials (for TXT file generation)</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="Enter username (optional)"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Enter password (optional)"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gmail">Gmail</Label>
                    <Input
                      id="gmail"
                      value={formData.gmail}
                      onChange={(e) => setFormData({ ...formData, gmail: e.target.value })}
                      placeholder="Enter gmail (optional)"
                    />
                  </div>
                  <div>
                    <Label htmlFor="number">Number</Label>
                    <Input
                      id="number"
                      value={formData.number}
                      onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                      placeholder="Enter number (optional)"
                    />
                  </div>
                </div>
              </div>
              <Button
                onClick={handleAddProduct}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-red-800 to-red-600 hover:from-red-900 hover:to-red-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding Product...
                  </>
                ) : (
                  "Add Product"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {message && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4">
        {productList.map((product) => (
          <Card key={product.id} className="p-4">
            <div className="flex gap-4">
              <div className="relative w-16 h-16 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                <Image
                  src={product.image_url || product.image || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <Badge variant="outline">{categoryMap[product.category as keyof typeof categoryMap]}</Badge>
                      <span className="flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        {product.stock} in stock
                      </span>
                      <span className="font-semibold text-red-600">{formatPrice(product.price)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEditDialog(product)}>
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDeleteProduct(product.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Update product information</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Product Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryMap).map(([key, value]) => (
                      <SelectItem key={key} value={key}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="edit-description">Description *</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit-price">Price (₦) *</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number.parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="edit-originalPrice">Original Price (₦)</Label>
                <Input
                  id="edit-originalPrice"
                  type="number"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({ ...formData, originalPrice: Number.parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="edit-stock">Stock Quantity *</Label>
                <Input
                  id="edit-stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: Number.parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-image">Product Image</Label>
              <div className="space-y-4">
                <Input
                  id="edit-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="cursor-pointer"
                />
                <div className="text-sm text-muted-foreground">Or enter image URL:</div>
                <Input
                  id="edit-image"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="Enter image URL or upload file above"
                />
                {(imagePreview || formData.image) && (
                  <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
                    <Image src={imagePreview || formData.image} alt="Preview" fill className="object-cover" />
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-sm">Product Credentials (for TXT file generation)</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-username">Username</Label>
                  <Input
                    id="edit-username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Enter username (optional)"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-password">Password</Label>
                  <Input
                    id="edit-password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter password (optional)"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-gmail">Gmail</Label>
                  <Input
                    id="edit-gmail"
                    value={formData.gmail}
                    onChange={(e) => setFormData({ ...formData, gmail: e.target.value })}
                    placeholder="Enter gmail (optional)"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-number">Number</Label>
                  <Input
                    id="edit-number"
                    value={formData.number}
                    onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                    placeholder="Enter number (optional)"
                  />
                </div>
              </div>
            </div>
            <Button
              onClick={handleEditProduct}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-red-800 to-red-600 hover:from-red-900 hover:to-red-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating Product...
                </>
              ) : (
                "Update Product"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

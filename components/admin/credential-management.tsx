"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Key, XCircle } from "lucide-react"
import Database from "@/lib/database"
import { useProducts } from "@/lib/products-context"

export function CredentialManagement() {
  const { products } = useProducts()
  const [selectedProductId, setSelectedProductId] = useState("")
  const [credentialText, setCredentialText] = useState("")
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleTextUpload = () => {
    if (!selectedProductId || !credentialText.trim()) {
      setMessage("Please select a product and enter credentials")
      return
    }

    setIsLoading(true)
    try {
      // Parse credentials from text (username,password per line)
      const lines = credentialText.trim().split("\n")
      const credentials = lines
        .map((line) => {
          const [username, password] = line.split(",").map((s) => s.trim())
          return { username, password }
        })
        .filter((cred) => cred.username && cred.password)

      if (credentials.length === 0) {
        setMessage("No valid credentials found. Use format: username,password per line")
        return
      }

      Database.addCredentialsToProduct(selectedProductId, credentials)
      setMessage(`Successfully added ${credentials.length} credentials to the product`)
      setCredentialText("")
    } catch (error) {
      setMessage("Error adding credentials. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCsvUpload = () => {
    if (!selectedProductId || !csvFile) {
      setMessage("Please select a product and upload a CSV file")
      return
    }

    setIsLoading(true)
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const csvContent = e.target?.result as string
        const lines = csvContent.trim().split("\n")

        // Skip header if present
        const dataLines = lines[0].toLowerCase().includes("username") ? lines.slice(1) : lines

        const credentials = dataLines
          .map((line) => {
            const [username, password] = line.split(",").map((s) => s.trim())
            return { username, password }
          })
          .filter((cred) => cred.username && cred.password)

        if (credentials.length === 0) {
          setMessage("No valid credentials found in CSV file")
          return
        }

        Database.addCredentialsToProduct(selectedProductId, credentials)
        setMessage(`Successfully added ${credentials.length} credentials from CSV file`)
        setCsvFile(null)
      } catch (error) {
        setMessage("Error processing CSV file. Please check the format.")
      } finally {
        setIsLoading(false)
      }
    }
    reader.readAsText(csvFile)
  }

  const getProductCredentialStats = () => {
    return products.map((product) => {
      const credentialData = Database.getProductCredentials(product.id)
      return {
        ...product,
        ...credentialData,
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Key className="h-5 w-5" />
        <h2 className="text-xl font-semibold">Credential Management</h2>
      </div>

      <Tabs defaultValue="upload" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upload">Upload Credentials</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Add Product Credentials
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="product-select">Select Product</Label>
                <select
                  id="product-select"
                  className="w-full p-2 border rounded-md"
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                >
                  <option value="">Choose a product...</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.category})
                    </option>
                  ))}
                </select>
              </div>

              <Tabs defaultValue="text" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="text">Text Input</TabsTrigger>
                  <TabsTrigger value="csv">CSV Upload</TabsTrigger>
                </TabsList>

                <TabsContent value="text" className="space-y-4">
                  <div>
                    <Label htmlFor="credential-text">Credentials (username,password per line)</Label>
                    <Textarea
                      id="credential-text"
                      placeholder="user1,pass1&#10;user2,pass2&#10;user3,pass3"
                      value={credentialText}
                      onChange={(e) => setCredentialText(e.target.value)}
                      rows={8}
                    />
                  </div>
                  <Button
                    onClick={handleTextUpload}
                    disabled={isLoading || !selectedProductId || !credentialText.trim()}
                    className="w-full"
                  >
                    {isLoading ? "Adding..." : "Add Credentials"}
                  </Button>
                </TabsContent>

                <TabsContent value="csv" className="space-y-4">
                  <div>
                    <Label htmlFor="csv-file">CSV File (username,password columns)</Label>
                    <Input
                      id="csv-file"
                      type="file"
                      accept=".csv"
                      onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                    />
                  </div>
                  <Button
                    onClick={handleCsvUpload}
                    disabled={isLoading || !selectedProductId || !csvFile}
                    className="w-full"
                  >
                    {isLoading ? "Processing..." : "Upload CSV"}
                  </Button>
                </TabsContent>
              </Tabs>

              {message && (
                <Alert variant={message.includes("Successfully") ? "default" : "destructive"}>
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4">
            {getProductCredentialStats().map((product) => (
              <Card key={product.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{product.name}</span>
                    <Badge variant="outline">{product.category}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{product.totalCredentials}</div>
                      <div className="text-sm text-muted-foreground">Total</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{product.availableCredentials}</div>
                      <div className="text-sm text-muted-foreground">Available</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">{product.usedCredentials}</div>
                      <div className="text-sm text-muted-foreground">Used</div>
                    </div>
                  </div>

                  {product.availableCredentials === 0 && product.totalCredentials > 0 && (
                    <Alert className="mt-4">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>
                        No credentials available! Please add more credentials for this product.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

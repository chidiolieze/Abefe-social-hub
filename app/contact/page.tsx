import { ContactForm } from "@/components/contact-form"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, Phone, Instagram, MessageCircle, Clock } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Page Header */}
      <section className="bg-gradient-to-r from-red-800 via-red-600 to-orange-500 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Contact Us</h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Get in touch with our team. We're here to help with all your questions and concerns.
          </p>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Details */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-red-800 via-red-600 to-orange-500 bg-clip-text text-transparent">
                  Get in Touch
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  We're available 24/7 to assist you with your purchases and answer any questions you may have.
                </p>
              </div>

              {/* Contact Methods */}
              <div className="grid gap-6">
                <Card className="border-2 hover:border-red-200 dark:hover:border-red-800 transition-colors">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-red-800 to-orange-500 rounded-full flex items-center justify-center">
                        <Mail className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Email</CardTitle>
                        <CardDescription>Send us an email anytime</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="font-semibold text-red-600">abefesocialhub@gmail.com</p>
                    <p className="text-sm text-muted-foreground mt-1">We typically respond within 2-4 hours</p>
                  </CardContent>
                </Card>

                <Card className="border-2 hover:border-red-200 dark:hover:border-red-800 transition-colors">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-red-800 to-orange-500 rounded-full flex items-center justify-center">
                        <Phone className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Phone & WhatsApp</CardTitle>
                        <CardDescription>Call or message us directly</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="font-semibold text-red-600">+234 915 283 9443</p>
                    <p className="text-sm text-muted-foreground mt-1">Available 24/7 for urgent matters</p>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="mt-3 border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950 bg-transparent"
                    >
                      <a href="https://wa.me/2349152839443" target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        WhatsApp
                      </a>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-2 hover:border-red-200 dark:hover:border-red-800 transition-colors">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-red-800 to-orange-500 rounded-full flex items-center justify-center">
                        <Instagram className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Social Media</CardTitle>
                        <CardDescription>Follow us for updates</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Instagram</span>
                        <Button asChild variant="outline" size="sm">
                          <a href="https://instagram.com/abefesocialhub" target="_blank" rel="noopener noreferrer">
                            @abefesocialhub
                          </a>
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Facebook</span>
                        <span className="text-sm text-muted-foreground">Coming Soon</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">TikTok</span>
                        <Button asChild variant="outline" size="sm">
                          <a
                            href="https://www.tiktok.com/@abefesocial.hub?_t=ZM-8yn3ZOk3Q3E&_r=1"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            @abefesocial.hub
                          </a>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Business Hours */}
              <Card className="bg-gradient-to-r from-red-800 via-red-600 to-orange-500 text-white">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Clock className="h-6 w-6" />
                    <CardTitle className="text-white">Business Hours</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Monday - Friday</span>
                      <span className="font-semibold">24/7 Online</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Saturday - Sunday</span>
                      <span className="font-semibold">24/7 Online</span>
                    </div>
                    <div className="mt-4 p-3 bg-white/10 rounded-lg">
                      <p className="text-sm">
                        <strong>Note:</strong> We provide 24/7 online support through WhatsApp and email for all your
                        urgent needs.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-red-800 via-red-600 to-orange-500 bg-clip-text text-transparent">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground">Quick answers to common questions</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How quickly do I receive my accounts?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Most accounts are delivered instantly after payment confirmation. Some premium accounts may take up to
                  30 minutes for verification.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What if an account stops working?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We offer replacement guarantees for all accounts. Contact us immediately if you experience any issues
                  and we'll provide a replacement or refund.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Do you offer bulk discounts?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes! We offer special pricing for bulk orders. Contact us directly to discuss your requirements and
                  get a custom quote.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What payment methods do you accept?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We accept various payment methods including bank transfers, mobile money, and cryptocurrency. Contact
                  us for specific payment options.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ShoppingCart, Play, Users, Shield, Phone, Globe } from "lucide-react"
import Link from "next/link"

const slides = [
  {
    id: 1,
    title: "Welcome to Abefe Social Hub",
    subtitle: "All logins and deals are affordable",
    description: "Your trusted platform for premium social media accounts, foreign numbers, and exclusive app logins.",
    cta: "Shop Now",
    ctaLink: "/products",
    backgroundImage: "/digital-marketplace.png",
    icon: ShoppingCart,
  },
  {
    id: 2,
    title: "Premium Netflix Logins",
    subtitle: "Stream unlimited content worldwide",
    description: "Get access to premium Netflix accounts with 4K streaming and multiple profiles at unbeatable prices.",
    cta: "View Netflix Accounts",
    ctaLink: "/products/premium-apps",
    backgroundImage: "/netflix-interface.png",
    icon: Play,
  },
  {
    id: 3,
    title: "Facebook Accounts",
    subtitle: "USA, Canada, Australia & More",
    description: "Premium Facebook accounts from various countries with complete verification and clean history.",
    cta: "Browse Facebook Accounts",
    ctaLink: "/products/facebook",
    backgroundImage: "/facebook-instagram-verified.png",
    icon: Users,
  },
  {
    id: 4,
    title: "Premium VPN Services",
    subtitle: "NordVPN, ExpressVPN & More",
    description:
      "Access premium VPN accounts with global servers, unlimited bandwidth, and advanced security features.",
    cta: "View VPN Accounts",
    ctaLink: "/products/premium-vpn",
    backgroundImage: "/digital-marketplace.png",
    icon: Shield,
  },
  {
    id: 5,
    title: "USA Texting Services",
    subtitle: "Google Voice, TextPlus & More",
    description: "Get USA phone numbers for verification, texting, and calling with premium texting service accounts.",
    cta: "View Texting Services",
    ctaLink: "/products/usa-texting",
    backgroundImage: "/facebook-instagram-verified.png",
    icon: Phone,
  },
  {
    id: 6,
    title: "Foreign Numbers",
    subtitle: "UK, Germany, Australia & More",
    description: "Virtual phone numbers from various countries for app verification and international communication.",
    cta: "Browse Numbers",
    ctaLink: "/products/foreign-numbers",
    backgroundImage: "/digital-marketplace.png",
    icon: Globe,
  },
]

export function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [showContent, setShowContent] = useState(true)
  const [showButtons, setShowButtons] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide()
    }, 8000) // Increased interval for better user experience

    return () => clearInterval(timer)
  }, [currentSlide])

  const nextSlide = () => {
    if (isTransitioning) return
    transitionToSlide((currentSlide + 1) % slides.length)
  }

  const prevSlide = () => {
    if (isTransitioning) return
    transitionToSlide((currentSlide - 1 + slides.length) % slides.length)
  }

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentSlide) return
    transitionToSlide(index)
  }

  const transitionToSlide = (newSlideIndex: number) => {
    setIsTransitioning(true)

    setShowButtons(false)

    setTimeout(() => {
      setShowContent(false)
    }, 200)

    setTimeout(() => {
      setCurrentSlide(newSlideIndex)
    }, 500)

    setTimeout(() => {
      setShowContent(true)
    }, 800)

    setTimeout(() => {
      setShowButtons(true)
      setIsTransitioning(false)
    }, 1200)
  }

  const current = slides[currentSlide]

  return (
    <section className="relative overflow-hidden h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px]">
      {/* Background Image with enhanced transitions */}
      <div className="absolute inset-0">
        <div
          className="w-full h-full bg-cover bg-center transition-all duration-1000 ease-in-out"
          style={{
            backgroundImage: `url(${current.backgroundImage || "/placeholder.svg"})`,
            transform: isTransitioning ? "scale(1.1)" : "scale(1)",
            filter: isTransitioning ? "blur(2px)" : "blur(0px)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-red-800/90 via-red-600/80 to-orange-500/90"></div>
      </div>

      {/* Content with enhanced animations */}
      <div className="relative container mx-auto px-4 sm:px-6 h-full flex items-center">
        <div className="max-w-4xl mx-auto text-center">
          {/* Icon */}
          <div
            className={`mb-4 sm:mb-6 transition-all duration-700 ease-out ${
              showContent ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-75"
            }`}
            style={{ transitionDelay: showContent ? "300ms" : "0ms" }}
          >
            <current.icon className="h-8 w-8 sm:h-12 sm:w-12 md:h-16 md:w-16 text-white mx-auto mb-2 sm:mb-4 opacity-90" />
          </div>

          {/* Title */}
          <h1
            className={`text-2xl sm:text-3xl md:text-4xl lg:text-6xl xl:text-7xl font-bold text-white mb-3 sm:mb-4 md:mb-6 leading-tight transition-all duration-700 ease-out ${
              showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
            }`}
            style={{ transitionDelay: showContent ? "500ms" : "0ms" }}
          >
            {current.title}
          </h1>

          {/* Subtitle */}
          <p
            className={`text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-white/90 mb-3 sm:mb-4 md:mb-6 font-medium transition-all duration-700 ease-out ${
              showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{ transitionDelay: showContent ? "700ms" : "0ms" }}
          >
            {current.subtitle}
          </p>

          {/* Description */}
          <p
            className={`text-sm sm:text-base md:text-lg text-white/80 mb-6 sm:mb-8 md:mb-10 max-w-xl sm:max-w-2xl mx-auto px-4 sm:px-0 transition-all duration-700 ease-out ${
              showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{ transitionDelay: showContent ? "900ms" : "0ms" }}
          >
            {current.description}
          </p>

          {/* Buttons with separate animation */}
          <div
            className={`flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0 transition-all duration-500 ease-out ${
              showButtons ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"
            }`}
            style={{ transitionDelay: showButtons ? "1100ms" : "0ms" }}
          >
            <Link href={current.ctaLink}>
              <Button
                size="lg"
                variant="secondary"
                className="w-full sm:w-auto text-sm sm:text-base md:text-lg px-4 sm:px-6 md:px-8 py-3 sm:py-4 h-auto font-semibold hover:scale-105 transition-transform"
              >
                <current.icon className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                <span className="sm:hidden">Shop Now</span>
                <span className="hidden sm:inline">{current.cta}</span>
              </Button>
            </Link>
            <Link href="/products">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto text-sm sm:text-base md:text-lg px-4 sm:px-6 md:px-8 py-3 sm:py-4 h-auto font-semibold bg-white/10 border-white/30 text-white hover:bg-white/20 hover:scale-105 transition-all"
              >
                View All Products
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 sm:p-3 rounded-full transition-all duration-200 backdrop-blur-sm hover:scale-110 disabled:opacity-50"
        disabled={isTransitioning}
      >
        <ChevronLeft className="h-4 w-4 sm:h-6 sm:w-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 sm:p-3 rounded-full transition-all duration-200 backdrop-blur-sm hover:scale-110 disabled:opacity-50"
        disabled={isTransitioning}
      >
        <ChevronRight className="h-4 w-4 sm:h-6 sm:w-6" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 sm:space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 hover:scale-125 ${
              index === currentSlide ? "bg-white scale-125" : "bg-white/50 hover:bg-white/70"
            }`}
            disabled={isTransitioning}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 w-full h-0.5 sm:h-1 bg-white/20">
        <div
          className="h-full bg-white transition-all duration-8000 ease-linear"
          style={{
            width: isTransitioning ? "0%" : "100%",
            transitionDuration: isTransitioning ? "0ms" : "8000ms",
          }}
        />
      </div>
    </section>
  )
}

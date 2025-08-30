import type React from "react";
import type { Metadata } from "next";
import { Inter, DM_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/auth-context";
import { AdminAuthProvider } from "@/lib/admin-auth";
import { ProductsProvider } from "@/lib/products-context";
import { NotificationProvider } from "@/lib/notification-context";
import { useEffect } from "react";

const inter = Inter({
  subsets: ["latin"],
    display: "swap",
      variable: "--font-inter",
      });

      const dmSans = DM_Sans({
        subsets: ["latin"],
          display: "swap",
            variable: "--font-dm-sans",
            });

            export const metadata: Metadata = {
              title: "affiliate Gold socials - Premium Social Media Accounts & App Logins",
                description:
                    "Your trusted platform for social media accounts, foreign numbers, and premium app logins. All deals are affordable at affiliate Gold socials.",
                    };

                    // Client-side component for text replacement and watermark removal
                    function SiteUpdater() {
                      useEffect(() => {
                          // Text replacement function
                              const replaceText = (element: Node, searches: string[], replaceWith: string) => {
                                    if (element.childNodes.length === 0) return;

                                          element.childNodes.forEach((child) => {
                                                  if (child.nodeType === Node.TEXT_NODE) {
                                                            let text = child.textContent;
                                                                      if (text) {
                                                                                  searches.forEach((search) => {
                                                                                                const regex = new RegExp(search, "gi");
                                                                                                              text = text!.replace(regex, replaceWith);
                                                                                                                          });
                                                                                                                                      child.textContent = text;
                                                                                                                                                }
                                                                                                                                                        } else {
                                                                                                                                                                  replaceText(child, searches, replaceWith);
                                                                                                                                                                          }
                                                                                                                                                                                });
                                                                                                                                                                                    };

                                                                                                                                                                                        const searches = ["abefesocialhub", "abefe social hub"];
                                                                                                                                                                                            const replaceWith = "affiliate Gold socials";

                                                                                                                                                                                                // Initial text replacement
                                                                                                                                                                                                    replaceText(document.body, searches, replaceWith);

                                                                                                                                                                                                        // Handle dynamic content
                                                                                                                                                                                                            const observer = new MutationObserver(() => {
                                                                                                                                                                                                                  replaceText(document.body, searches, replaceWith);
                                                                                                                                                                                                                      });
                                                                                                                                                                                                                          observer.observe(document.body, { childList: true, subtree: true });

                                                                                                                                                                                                                              // Cleanup observer on unmount
                                                                                                                                                                                                                                  return () => observer.disconnect();
                                                                                                                                                                                                                                    }, []);

                                                                                                                                                                                                                                      return null;
                                                                                                                                                                                                                                      }

                                                                                                                                                                                                                                      export default function RootLayout({
                                                                                                                                                                                                                                        children,
                                                                                                                                                                                                                                        }: Readonly<{
                                                                                                                                                                                                                                          children: React.ReactNode;
                                                                                                                                                                                                                                          }>) {
                                                                                                                                                                                                                                            return (
                                                                                                                                                                                                                                                <html lang="en" suppressHydrationWarning>
                                                                                                                                                                                                                                                      <head>
                                                                                                                                                                                                                                                              <style>{`
                                                                                                                                                                                                                                                                        .v0-watermark, [class*="built-with-v0"], [id*="v0-badge"], [data-v0-watermark] {
                                                                                                                                                                                                                                                                                    display: none !important;
                                                                                                                                                                                                                                                                                                visibility: hidden !important;
                                                                                                                                                                                                                                                                                                          }
                                                                                                                                                                                                                                                                                                                  `}</style>
                                                                                                                                                                                                                                                                                                                        </head>
                                                                                                                                                                                                                                                                                                                              <body className={`${inter.variable} ${dmSans.variable} font-sans antialiased`}>
                                                                                                                                                                                                                                                                                                                                      <ThemeProvider
                                                                                                                                                                                                                                                                                                                                                attribute="class"
                                                                                                                                                                                                                                                                                                                                                          defaultTheme="light"
                                                                                                                                                                                                                                                                                                                                                                    enableSystem
                                                                                                                                                                                                                                                                                                                                                                              disableTransitionOnChange={false}
                                                                                                                                                                                                                                                                                                                                                                                      >
                                                                                                                                                                                                                                                                                                                                                                                                <AuthProvider>
                                                                                                                                                                                                                                                                                                                                                                                                            <AdminAuthProvider>
                                                                                                                                                                                                                                                                                                                                                                                                                          <ProductsProvider>
                                                                                                                                                                                                                                                                                                                                                                                                                                          <NotificationProvider>
                                                                                                                                                                                                                                                                                                                                                                                                                                                            <SiteUpdater />
                                                                                                                                                                                                                                                                                                                                                                                                                                                                              {children}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              </NotificationProvider>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            </ProductsProvider>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        </AdminAuthProvider>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  </AuthProvider>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          </ThemeProvider>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                </body>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    </html>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      );
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      }

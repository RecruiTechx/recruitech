import type React from "react"
import type { Metadata } from "next"
import { GeistMono } from "geist/font/mono"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Recruitech",
  description: "Recruitech, AI powered recruitment platform",
  generator: "Next.js",
}

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased ${GeistMono.variable}`}>
        <Suspense fallback={<div>Loading...</div>}>
          <AuthProvider>{children}</AuthProvider>
        </Suspense>
      </body>
    </html>
  )
}

'use client'

import Link from "next/link"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { useAuth } from "@/lib/auth-context"

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <>
        <SiteHeader />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading dashboard...</p>
          </div>
        </div>
      </>
    );
  }

  if (!user) {
    return null
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-12">
        <section className="relative overflow-hidden rounded-2xl border border-border bg-card p-10">
          {/* Decorative concentric rings akin to the reference */}
          <div className="hero-rings" aria-hidden />

          <div className="relative z-[1] text-center">
            <div className="mx-auto inline-flex items-center justify-center gap-3">
              {/* small spark diamonds */}
              <span className="spark" aria-hidden />
              <h1 className="text-pretty text-4xl font-extrabold md:text-5xl">
                <span className="brand-text">{"RecruiTech Exercise."}</span>
              </h1>
              <span className="spark" aria-hidden />
            </div>
            <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
              {"EXERCISE’s All in one recruitment System"}
            </p>

            <div className="mt-6 flex justify-center">
              <Link href="/open" className="btn-gradient">
                {"Apply Now."}
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}

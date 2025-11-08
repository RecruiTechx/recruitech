'use client'

import Link from "next/link"
import Image from "next/image"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { useAuth } from "@/lib/auth-context"

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth")
    }
  }, [user, loading, router])

  const scrollToAlumni = () => {
    const alumniSection = document.getElementById('alumni-section')
    if (alumniSection) {
      alumniSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

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
      <main className="bg-white min-h-screen">
        {/* Hero Section with Person and Info */}
        <section className="relative overflow-hidden bg-white pt-6 pb-8 md:pt-10 md:pb-12">
          <div className="mx-auto max-w-7xl px-6 md:px-8">
            <div className="grid gap-6 md:gap-12 md:grid-cols-2 items-center">
              {/* Left: Person Image with Pink Blob Background */}
              <div className="relative flex justify-center md:justify-start order-2 md:order-1">
                <div className="relative w-full max-w-[450px] md:max-w-[550px]">
                  {/* Pink organic blob background */}
                  {/* <div className="absolute inset-0 -left-12 -right-12 -top-10 -bottom-10 md:-left-16 md:-right-16 md:-top-12 md:-bottom-12 bg-[#FFB8C8] rounded-[45%_55%_60%_40%/50%_60%_40%_50%] opacity-50 blur-3xl" /> */}
                  <Image
                    src="/dashboard/dashboard-person.png"
                    alt="Student with laptop"
                    width={550}
                    height={550}
                    className="relative z-10 w-full h-auto"
                    priority
                  />
                  {/* Decorative vector - small plant */}
                  <div className="absolute top-1/3 right-0 transform translate-x-4 z-20 hidden md:block">
                    <Image
                      src="/dashboard/vector/Vector 2.png"
                      alt=""
                      width={40}
                      height={50}
                      className="w-8 h-auto"
                    />
                  </div>
                </div>
              </div>

              {/* Right: What is EXERCISE FTUI Info */}
              <div className="relative text-left order-1 md:order-2">
                <Image
                  src="/dashboard/dashboard-informational.png"
                  alt="What is EXERCISE FTUI"
                  width={550}
                  height={350}
                  className="w-full h-auto max-w-full md:max-w-[550px]"
                />
                {/* Decorative arrows - Clickable scroll indicators */}
                <button 
                  onClick={scrollToAlumni}
                  className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full mt-2 hidden md:flex flex-col items-center gap-0 cursor-pointer hover:opacity-80 transition-opacity animate-bounce"
                  aria-label="Scroll to Alumni History"
                >
                  <Image
                    src="/dashboard/vector/Vector 1.png"
                    alt=""
                    width={40}
                    height={40}
                    className="w-8 h-auto"
                  />
                  <Image
                    src="/dashboard/vector/Vector 2.png"
                    alt=""
                    width={80}
                    height={60}
                    className="w-16 h-auto"
                  />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Alumni History Section */}
        <section id="alumni-section" className="bg-white py-12 md:py-16">
          <div className="mx-auto max-w-6xl px-6 md:px-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Left: Alumni History Badge */}
              <div className="flex justify-center md:justify-start">
                <Image
                  src="/dashboard/dashboard-alumni-history.png"
                  alt="Alumni History"
                  width={350}
                  height={200}
                  className="w-full max-w-[300px] md:max-w-[350px] h-auto"
                />
              </div>

              {/* Right: Caption and Company Logos */}
              <div className="flex flex-col items-center">
                <Image
                  src="/dashboard/dashboard-alumni-caption.png"
                  alt="See where our seniors have performed and landed, achieving success by learning important skills through EXERCISE FTUI"
                  width={600}
                  height={50}
                  className="w-full h-auto mb-2"
                />

                {/* Company Logos Grid */}
                <div className="flex items-center justify-center gap-6 md:gap-8">
                  <div className="transition-transform duration-300 hover:scale-110 cursor-pointer">
                    <Image
                      src="/dashboard/company-logos/company-grab.png"
                      alt="Grab"
                      width={120}
                      height={60}
                      className="h-12 md:h-14 w-auto"
                    />
                  </div>
                  <div className="transition-transform duration-300 hover:scale-110 cursor-pointer">
                    <Image
                      src="/dashboard/company-logos/company-telkomsel.png"
                      alt="Telkomsel"
                      width={120}
                      height={60}
                      className="h-12 md:h-14 w-auto"
                    />
                  </div>
                  <div className="transition-transform duration-300 hover:scale-110 cursor-pointer">
                    <Image
                      src="/dashboard/company-logos/company-traveloka.png"
                      alt="Traveloka"
                      width={130}
                      height={60}
                      className="h-12 md:h-14 w-auto"
                    />
                  </div>
                  <div className="transition-transform duration-300 hover:scale-110 cursor-pointer">
                    <Image
                      src="/dashboard/company-logos/company-shopee.png"
                      alt="Shopee"
                      width={120}
                      height={60}
                      className="h-12 md:h-14 w-auto"
                    />
                  </div>
                  <div className="transition-transform duration-300 hover:scale-110 cursor-pointer">
                    <Image
                      src="/dashboard/company-logos/company-huawei.png"
                      alt="Huawei"
                      width={120}
                      height={60}
                      className="h-12 md:h-14 w-auto"
                    />
                  </div>
                  <div className="transition-transform duration-300 hover:scale-110 cursor-pointer">
                    <Image
                      src="/dashboard/company-logos/company-goto.png"
                      alt="Gojek"
                      width={120}
                      height={60}
                      className="h-12 md:h-14 w-auto"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section - Spoiler Alert We're Recruiting */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#F8764B] via-[#E8436B] to-[#C92F6A] py-20 md:py-24">
          <div className="mx-auto max-w-6xl px-6 md:px-8">
            <div className="flex flex-col items-center text-center space-y-12 md:space-y-16">
              {/* Spoiler Alert Title */}
              <div>
                <Image
                  src="/dashboard/cta/cta-spoiler-alert.png"
                  alt="Spoiler Alert, We're Recruiting!"
                  width={600}
                  height={60}
                  className="w-full max-w-[500px] md:max-w-[600px] h-auto"
                />
              </div>

              {/* Logo */}
              <div>
                <Image
                  src="/dashboard/cta/cta-logo.png"
                  alt="RecruiTech x Exercise FTUI"
                  width={450}
                  height={80}
                  className="w-full max-w-[350px] md:max-w-[450px] h-auto"
                />
              </div>

              {/* Caption Text */}
              <div className="max-w-3xl">
                <Image
                  src="/dashboard/cta/cta-caption.png"
                  alt="Exercise FTUI 2026 is currently partnering with RecruiTech to revolutionize the recruitment process through industry standard-backed Agentic AI."
                  width={800}
                  height={100}
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Apply Now Section */}
        <section className="bg-white py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-6 md:px-8 text-center">
            <div className="flex flex-col items-center space-y-3">
              {/* Be bold, take the leap text */}
              <Image
                src="/dashboard/action/Be bold, take the leap..png"
                alt="Be bold, take the leap."
                width={180}
                height={25}
                className="h-auto w-auto max-w-[150px] md:max-w-[180px]"
              />
              
              {/* Apply Now Button */}
              <Link href="/open" className="inline-block hover:scale-105 transition-transform duration-200">
                <Image
                  src="/dashboard/action/Group 735.png"
                  alt="Apply Now"
                  width={200}
                  height={60}
                  className="h-auto w-auto"
                />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}

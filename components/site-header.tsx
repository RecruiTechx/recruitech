'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

export function SiteHeader() {
  const { isAuthenticated, signOut } = useAuth()
  const router = useRouter()

  async function handleLogout() {
    try {
      await signOut()
      router.push('/auth')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <header className="w-full border-b border-border bg-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Image
            src="/navbar/navbar-logo-left.png"
            alt="RecruiTech"
            width={140}
            height={32}
            priority
            className="h-8 w-auto"
          />
        </Link>
        <ul className="hidden gap-50 items-center md:flex">
          <li>
            <Link href="/dashboard" className="hover:opacity-80 transition-opacity">
              <Image
                src="/navbar/navbar-About-Us.png"
                alt="About Us"
                width={30}
                height={8}
                className="h-2 w-auto"
              />
            </Link>
          </li>
          <li>
            <Link href="/dashboard" className="hover:opacity-80 transition-opacity">
              <Image
                src="/navbar/navbar-Dashboard.png"
                alt="Dashboard"
                width={35}
                height={8}
                className="h-2 w-auto"
              />
            </Link>
          </li>
          <li>
            <Link href="/open" className="hover:opacity-80 transition-opacity">
              <Image
                src="/navbar/navbar-AgenticAI.png"
                alt="Agentic AI"
                width={35}
                height={8}
                className="h-2 w-auto"
              />
            </Link>
          </li>
        </ul>
        <div className="flex items-center gap-4">
          <Link href="/auth" className="hover:opacity-80 transition-opacity">
            <Image
              src="/navbar/navbar-Login.png"
              alt="Login"
              width={40}
              height={16}
              className="h-2 w-auto"
            />
          </Link>
          <Link href="/auth/signup" className="relative hover:scale-105 transition-transform">
            <Image
              src="/navbar/navbar-signup-rectangle.png"
              alt=""
              width={70}
              height={28}
              className="h-5 w-auto"
            />
            <span className="absolute inset-0 flex items-center justify-center text-white text-[10px] font-small">
              Sign Up
            </span>
          </Link>
        </div>
      </nav>
    </header>
  )
}

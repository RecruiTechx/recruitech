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
    <header className="w-full border-b border-border">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Image
            src="/recruitech-logo.png"
            alt="RecruiTech"
            width={160}
            height={48}
            priority
            className="h-12 w-auto"
          />
        </Link>
        <ul className="hidden gap-6 text-sm md:flex">
          <li>
            <Link href="/dashboard" className="hover:underline">
              {"Dashboard"}
            </Link>
          </li>
          <li>
            <Link href="/open" className="hover:underline">
              {"Apply"}
            </Link>
          </li>
          {/* Removed Agentic AI from navbar per request */}
        </ul>
        <div className="flex items-center gap-2">
          {!isAuthenticated ? (
            <>
              <Link href="/auth" className="text-sm hover:underline">
                Login
              </Link>
              <Link href="/auth/signup" className="btn-gradient text-xs">
                Sign Up
              </Link>
            </>
          ) : (
            <button onClick={handleLogout} className="btn-outline text-xs">
              Log out
            </button>
          )}
        </div>
      </nav>
    </header>
  )
}

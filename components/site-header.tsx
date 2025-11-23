'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

export function SiteHeader() {
  const { isAuthenticated, signOut, user } = useAuth()
  const router = useRouter()

  async function handleLogout() {
    try {
      await signOut()
      router.push('/auth')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  function handleApplyClick(e: React.MouseEvent) {
    if (!isAuthenticated) {
      e.preventDefault()
      router.push('/auth')
    } else {
      router.push('/open')
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-border bg-white/95 backdrop-blur-sm shadow-sm">
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
        <ul className="hidden gap-8 items-center md:flex">
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
          {isAuthenticated && (
            <li>
              <Link href="/my-application" className="text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors">
                My Application
              </Link>
            </li>
          )}
          <li>
            <button onClick={handleApplyClick} className="hover:opacity-80 transition-opacity">
              <Image
                src="/navbar/navbar-Apply.png"
                alt="Apply"
                width={35}
                height={8}
                className="h-2 w-auto"
              />
            </button>
          </li>
        </ul>
        <div className="flex items-center gap-4">
          {isAuthenticated && user ? (
            <div className="inline-flex items-center gap-2">
              {/* Small sign-out button on the left side */}
              <button
                onClick={async (e) => {
                  e.stopPropagation()
                  await handleLogout()
                }}
                title="Sign out"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-[#f2706f] to-[#f3a683] hover:scale-105 transition-transform"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="h-4 w-4">
                  <path d="M16 13v-2H7V8l-5 4 5 4v-3zM20 3h-8v2h8v14h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
                </svg>
              </button>

              {/* Profile pill: navigate to dashboard/profile on click */}
              <button
                onClick={() => router.push('/dashboard')}
                title="View profile"
                className="inline-flex items-center gap-3 rounded-full px-3 py-1.5 bg-gradient-to-r from-[#f2706f] via-[#ff7a7a] to-[#f3a683] text-white text-sm font-medium hover:scale-105 transition-transform"
              >
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="h-4 w-4">
                    <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm0 2c-4.418 0-8 1.79-8 4v2h16v-2c0-2.21-3.582-4-8-4z" />
                  </svg>
                </span>
                <span className="leading-none">
                  {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
                </span>
              </button>
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>
      </nav>
    </header>
  )
}

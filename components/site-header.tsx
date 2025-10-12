"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export function SiteHeader() {
  const { authed, logout } = useAuth()
  const router = useRouter()

  function onLogout() {
    logout()
    router.push("/auth")
  }

  return (
    <header className="w-full border-b border-border">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/dashboard" className="font-semibold tracking-tight text-pretty brand-text">
          {"RecruiTech x Exercise"}
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
          {!authed ? (
            <>
              <Link href="/auth" className="text-sm hover:underline">
                {"Login"}
              </Link>
              <Link href="/auth" className="btn-gradient text-xs">
                {"Sign Up"}
              </Link>
            </>
          ) : (
            <button onClick={onLogout} className="btn-outline text-xs">
              {"Log out"}
            </button>
          )}
        </div>
      </nav>
    </header>
  )
}

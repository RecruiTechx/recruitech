"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useAuth } from "@/lib/auth-context"

export default function AuthForm() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      // pretend auth passed
      login()
      router.push("/dashboard")
    }, 600)
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="email" className="text-sm font-medium">
          {"Email"}
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-0 focus:border-ring"
          placeholder="javen@exerciseftui.com"
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="password" className="text-sm font-medium">
          {"Password"}
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-0 focus:border-ring"
          placeholder="••••••••"
          aria-label="Password"
        />
      </div>
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="h-4 w-4 rounded border-input" />
          {" Remember me"}
        </label>
        <a href="#" className="text-sm underline">
          {"Forgot?"}
        </a>
      </div>
      <button disabled={loading} className="w-full btn-gradient transition disabled:opacity-60" aria-busy={loading}>
        {loading ? "Signing in..." : "Submit →"}
      </button>
      <p className="text-center text-xs text-muted-foreground">
        {"No Account? "}
        <a className="underline" href="/auth">
          {"Sign Up"}
        </a>
      </p>
    </form>
  )
}

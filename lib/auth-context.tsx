"use client"

import type React from "react"
import { createContext, useCallback, useContext, useEffect, useState } from "react"

type AuthContextType = {
  authed: boolean
  login: () => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    // hydrate from localStorage
    const v = typeof window !== "undefined" ? localStorage.getItem("auth-authed") : null
    if (v === "1") setAuthed(true)
  }, [])

  const login = useCallback(() => {
    setAuthed(true)
    if (typeof window !== "undefined") localStorage.setItem("auth-authed", "1")
  }, [])

  const logout = useCallback(() => {
    setAuthed(false)
    if (typeof window !== "undefined") localStorage.removeItem("auth-authed")
  }, [])

  return <AuthContext.Provider value={{ authed, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}

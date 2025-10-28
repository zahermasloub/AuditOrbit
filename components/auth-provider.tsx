"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@/lib/api/types"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  logout: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("auth_token")
    const userStr = localStorage.getItem("user")

    if (token && userStr) {
      try {
        setUser(JSON.parse(userStr))
      } catch (err) {
        console.error("[v0] Failed to parse user data:", err)
        localStorage.removeItem("auth_token")
        localStorage.removeItem("user")
      }
    }

    setIsLoading(false)
  }, [])

  const logout = () => {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user")
    setUser(null)
    router.push("/login")
  }

  return <AuthContext.Provider value={{ user, isLoading, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)

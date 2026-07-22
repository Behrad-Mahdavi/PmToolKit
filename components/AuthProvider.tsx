'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { User, Session } from '@supabase/supabase-js'
import { useRouter, usePathname } from 'next/navigation'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {}
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)

      if (!session && pathname !== '/auth') {
        router.push('/auth')
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)

      if (session) {
        if (pathname === '/auth') {
          router.push('/')
        }
      } else {
        router.push('/auth')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [pathname, router])

  const signOut = async () => {
    setLoading(true)
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setLoading(false)
    router.push('/auth')
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {loading ? (
        <div className="min-h-screen bg-[#EEF1EE] dark:bg-[#14181A] flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 border-4 border-[var(--signal-teal)] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm font-medium opacity-70">در حال احراز هویت و برقراری ارتباط امن با Supabase...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

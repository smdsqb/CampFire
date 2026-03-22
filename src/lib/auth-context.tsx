'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from './supabase'

interface AuthCtx {
  user:             User | null
  session:          Session | null
  loading:          boolean
  signInWithGoogle: () => Promise<void>
  signOut:          () => Promise<void>
}

const AuthContext = createContext<AuthCtx>({
  user: null, session: null, loading: true,
  signInWithGoogle: async () => {},
  signOut:          async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Force refresh session on mount
    supabase.auth.refreshSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session)
        setUser(session.user)
        setLoading(false)
        return
      }
      // Fall back to getSession
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      })
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://campfires.vercel.app/auth/callback',
      },
    })
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

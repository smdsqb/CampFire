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
    // Handle hash fragment from OAuth redirect
    const handleHashSession = async () => {
      if (window.location.hash.includes('access_token')) {
        const { data, error } = await supabase.auth.getSession()
        if (data.session) {
          setSession(data.session)
          setUser(data.session.user)
        }
        window.history.replaceState(null, '', window.location.pathname)
      }
    }
    handleHashSession()

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
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
        redirectTo: `${window.location.origin}`,
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

'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import {
  onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut,
  type User
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, googleProvider, db } from './firebase'

interface AuthCtx {
  user:             User | null
  loading:          boolean
  signInWithGoogle: () => Promise<void>
  signOut:          () => Promise<void>
}

const AuthContext = createContext<AuthCtx>({
  user: null, loading: true,
  signInWithGoogle: async () => {},
  signOut:          async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        const userRef = doc(db, 'users', u.uid)
        const userSnap = await getDoc(userRef)
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            uid:         u.uid,
            displayName: u.displayName,
            photoURL:    u.photoURL,
            email:       u.email,
            createdAt:   serverTimestamp(),
          })
        }
        setUser(u)
      } else {
        setUser(null)
      }
      setLoading(false)
    })
    return () => unsub()
  }, [])

  async function signInWithGoogle() {
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (e) {
      console.error('Sign in error:', e)
    }
  }

  async function signOut() {
    await firebaseSignOut(auth)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

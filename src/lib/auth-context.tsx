'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import {
  onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut,
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  updateProfile,
  type User
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, googleProvider, db } from './firebase'

interface AuthCtx {
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthCtx>({
  user: null, loading: true,
  signInWithGoogle: async () => {},
  signInWithEmail: async () => ({}),
  signUpWithEmail: async () => ({}),
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        const userRef = doc(db, 'users', u.uid)
        const userSnap = await getDoc(userRef)
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            uid: u.uid,
            displayName: u.displayName,
            photoURL: u.photoURL,
            email: u.email,
            bio: '',
            karma: 0,
            joinedAt: serverTimestamp(),
            createdAt: serverTimestamp(),
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

  async function signInWithEmail(email: string, password: string): Promise<{ error?: string }> {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      return {}
    } catch (e: any) {
      const msg = e?.code === 'auth/invalid-credential'
        ? 'Invalid email or password.'
        : e?.message ?? 'Sign in failed.'
      return { error: msg }
    }
  }

  async function signUpWithEmail(email: string, password: string, displayName: string): Promise<{ error?: string }> {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(cred.user, { displayName })
      await setDoc(doc(db, 'users', cred.user.uid), {
        uid: cred.user.uid,
        displayName,
        photoURL: null,
        email,
        bio: '',
        karma: 0,
        joinedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      })
      return {}
    } catch (e: any) {
      const msg = e?.code === 'auth/email-already-in-use'
        ? 'An account with this email already exists.'
        : e?.code === 'auth/weak-password'
        ? 'Password must be at least 6 characters.'
        : e?.message ?? 'Sign up failed.'
      return { error: msg }
    }
  }

  async function signOut() {
    await firebaseSignOut(auth)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

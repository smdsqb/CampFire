'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import CampfireScene from '@/components/layout/CampfireScene'
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft } from 'lucide-react'

export default function LoginPage() {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth()
  const router = useRouter()

  const [mode, setMode] = useState<'choose' | 'login' | 'signup'>('choose')
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleGoogle() {
    setLoading(true)
    setError('')
    try {
      await signInWithGoogle()
      router.push('/')
    } catch {
      setError('Google sign in failed.')
    } finally {
      setLoading(false)
    }
  }

  async function handleEmailSubmit() {
    if (!email.trim() || !password.trim()) return
    if (mode === 'signup' && !displayName.trim()) return
    setLoading(true)
    setError('')

    const result: { error?: string; verify?: boolean } = mode === 'login'
      ? await signInWithEmail(email, password)
      : await signUpWithEmail(email, password, displayName)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else if (result.verify) {
      setMode('choose')
      setError('')
      alert('✅ Account created! Check your email to verify your account before signing in.')
    } else {
      router.push('/')
    }
  }  // ← this was missing

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden">
      <CampfireScene />

      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">

        {/* Card */}
        <div className="w-full max-w-sm rounded-2xl border border-[#2E2820] p-6"
          style={{ background: 'rgba(18,14,10,.95)', backdropFilter: 'blur(20px)' }}>

          {/* Back button */}
          {mode !== 'choose' && (
            <button
              onClick={() => { setMode('choose'); setError('') }}
              className="flex items-center gap-1.5 text-xs text-[#6B5A4A] hover:text-[#F97316] transition-colors mb-5">
              <ArrowLeft size={13} /> Back
            </button>
          )}

          {/* Logo + heading */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-3"
              style={{ background: 'linear-gradient(135deg,#EA580C,#F97316,#FBBF24)', boxShadow: '0 0 24px rgba(249,115,22,.4)' }}>
              🔥
            </div>
            <h1 className="font-serif text-xl font-semibold text-[#F5EFE8]">
              {mode === 'choose' ? 'Welcome to CampFire' : mode === 'login' ? 'Sign in' : 'Create account'}
            </h1>
            <p className="text-xs text-[#6B5A4A] mt-1">
              {mode === 'choose' ? 'Gather around. Every great conversation starts with a spark.' : mode === 'login' ? 'Good to have you back 🔥' : 'Join the fire 🔥'}
            </p>
          </div>

          {/* ── CHOOSE MODE ── */}
          {mode === 'choose' && (
            <div className="flex flex-col gap-3">
              <button
                onClick={handleGoogle}
                disabled={loading}
                className="flex items-center justify-center gap-3 w-full py-3 rounded-xl border border-[#3D3228] text-sm font-semibold text-[#F5EFE8] transition-all hover:border-[#F97316] hover:bg-[rgba(249,115,22,.06)] disabled:opacity-50"
                style={{ background: 'rgba(255,255,255,.04)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-[#2E2820]" />
                <span className="text-[11px] text-[#6B5A4A]">or</span>
                <div className="flex-1 h-px bg-[#2E2820]" />
              </div>

              <button
                onClick={() => setMode('login')}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold text-white transition-all"
                style={{ background: 'linear-gradient(135deg,#EA580C,#F97316)' }}>
                <Mail size={14} /> Sign in with Email
              </button>

              <button
                onClick={() => setMode('signup')}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-[#3D3228] text-sm font-semibold text-[#F5EFE8] transition-all hover:border-[#F97316]"
                style={{ background: 'rgba(255,255,255,.04)' }}>
                Create an account
              </button>
            </div>
          )}

          {/* ── EMAIL FORM ── */}
          {(mode === 'login' || mode === 'signup') && (
            <div className="flex flex-col gap-3">

              {mode === 'signup' && (
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B5A4A]" />
                  <input
                    type="text"
                    placeholder="Display name"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    className="w-full bg-transparent border border-[#3D3228] rounded-xl pl-9 pr-4 py-3 text-sm text-[#F5EFE8] placeholder-[#6B5A4A] outline-none focus:border-[#F97316] transition-colors"
                  />
                </div>
              )}

              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B5A4A]" />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-transparent border border-[#3D3228] rounded-xl pl-9 pr-4 py-3 text-sm text-[#F5EFE8] placeholder-[#6B5A4A] outline-none focus:border-[#F97316] transition-colors"
                />
              </div>

              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B5A4A]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleEmailSubmit()}
                  className="w-full bg-transparent border border-[#3D3228] rounded-xl pl-9 pr-10 py-3 text-sm text-[#F5EFE8] placeholder-[#6B5A4A] outline-none focus:border-[#F97316] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B5A4A] hover:text-[#F97316] transition-colors">
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>

              {error && (
                <p className="text-xs text-red-400 text-center">{error}</p>
              )}

              <button
                onClick={handleEmailSubmit}
                disabled={loading || !email.trim() || !password.trim() || (mode === 'signup' && !displayName.trim())}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 mt-1"
                style={{ background: 'linear-gradient(135deg,#EA580C,#F97316)' }}>
                {loading ? '🔥 Hang on...' : mode === 'login' ? 'Sign in' : 'Create account'}
              </button>

              <p className="text-center text-xs text-[#6B5A4A]">
                {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}
                  className="text-[#F97316] hover:underline">
                  {mode === 'login' ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, LogOut, User, Bell, Shield, Palette } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { db } from '@/lib/firebase'
import { doc, updateDoc } from 'firebase/firestore'
import CampfireScene from '@/components/layout/CampfireScene'

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [displayName, setDisplayName] = useState(user?.displayName ?? '')
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    if (!user) return
    await updateDoc(doc(db, 'users', user.uid), { displayName })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleSignOut() {
    await signOut()
    router.push('/')
  }

  return (
    <div className="relative w-full min-h-dvh overflow-hidden">
      <CampfireScene />
      <div className="relative z-10 h-full overflow-y-auto touch-scroll safe-top">
        <div className="max-w-xl mx-auto px-4 py-6">

          <button onClick={() => router.back()}
            className="flex items-center gap-2 text-[#A89880] hover:text-[#F97316] mb-6 transition-colors">
            <ArrowLeft size={16} /> Back
          </button>

          <div className="font-serif text-2xl font-semibold text-[#F5EFE8] mb-6">⚙️ Settings</div>

          {/* Profile section */}
          <Section icon={<User size={16} />} title="Profile">
            <div className="flex items-center gap-4 mb-4">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="" className="w-16 h-16 rounded-full border-2 border-[#F97316]" />
              ) : (
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white"
                  style={{ background: 'linear-gradient(135deg,#EA580C,#FBBF24)' }}>
                  {user?.displayName?.[0] ?? '?'}
                </div>
              )}
              <div>
                <div className="text-sm font-semibold text-[#F5EFE8]">{user?.displayName}</div>
                <div className="text-xs text-[#6B5A4A]">{user?.email}</div>
              </div>
            </div>
            <label className="text-xs text-[#6B5A4A] mb-1 block">Display name</label>
            <input
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-sm text-[#F5EFE8] border border-[#3D3228] outline-none focus:border-[#F97316] transition-colors mb-3"
              style={{ background: '#262019' }}
            />
            <button onClick={handleSave}
              className="px-4 py-2 text-sm font-semibold text-white rounded-lg"
              style={{ background: 'linear-gradient(135deg,#EA580C,#F97316)' }}>
              {saved ? '✅ Saved!' : 'Save changes'}
            </button>
          </Section>

          {/* Notifications */}
          <Section icon={<Bell size={16} />} title="Notifications">
            <ToggleRow label="Post replies" defaultOn />
            <ToggleRow label="Upvotes on your posts" defaultOn />
            <ToggleRow label="New camp activity" />
            <ToggleRow label="CampFire announcements" defaultOn />
          </Section>

          {/* Privacy */}
          <Section icon={<Shield size={16} />} title="Privacy">
            <ToggleRow label="Show my profile publicly" defaultOn />
            <ToggleRow label="Allow others to message me" defaultOn />
          </Section>

          {/* Appearance */}
          <Section icon={<Palette size={16} />} title="Appearance">
            <div className="text-xs text-[#6B5A4A] py-2">Dark mode only — the campfire demands it 🔥</div>
          </Section>

          {/* Sign out */}
          <button
            onClick={handleSignOut}
            className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl border border-red-900/50 text-red-400 hover:bg-red-900/20 transition-all text-sm font-medium"
          >
            <LogOut size={16} /> Sign out
          </button>

          <div className="text-center text-[10px] text-[#3D3228] mt-6">
            CampFire v0.1.0 — Built with 🔥
          </div>
        </div>
      </div>
    </div>
  )
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[#2E2820] mb-4 overflow-hidden"
      style={{ background: 'rgba(18,14,10,.88)', backdropFilter: 'blur(12px)' }}>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#2E2820]">
        <span className="text-[#F97316]">{icon}</span>
        <span className="text-sm font-semibold text-[#F5EFE8]">{title}</span>
      </div>
      <div className="px-4 py-3">{children}</div>
    </div>
  )
}

function ToggleRow({ label, defaultOn = false }: { label: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn)
  return (
    <div className="flex items-center justify-between py-2 border-b border-[#2E2820] last:border-0">
      <span className="text-sm text-[#A89880]">{label}</span>
      <button
        onClick={() => setOn(!on)}
        className="w-10 h-5 rounded-full transition-all relative"
        style={{ background: on ? '#F97316' : '#2E2820' }}>
        <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
          style={{ left: on ? '1.25rem' : '0.125rem' }} />
      </button>
    </div>
  )
}

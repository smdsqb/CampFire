'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { db } from '@/lib/firebase'
import { collection, addDoc, getDocs } from 'firebase/firestore'
import { SEED_CAMPS } from '@/lib/utils'

export default function SeedPage() {
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  async function seed() {
    setLoading(true)
    setStatus('Seeding...')
    try {
      const existing = await getDocs(collection(db, 'camps'))
      if (existing.size > 0) {
        setStatus('Camps already exist!')
        return
      }
      for (const camp of SEED_CAMPS) {
        await addDoc(collection(db, 'camps'), camp)
      }
      setStatus('Done! All camps seeded 🔥')
    } catch (e: any) {
      setStatus(e?.message ?? 'Failed to seed camps.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-[100dvh] overflow-y-auto touch-scroll safe-top" style={{ background: '#0D0B09', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <div style={{ fontSize: 48 }}>🔥</div>
      <button disabled={loading} onClick={seed} style={{ background: '#F97316', color: 'white', border: 'none', borderRadius: 8, padding: '12px 24px', fontSize: 16, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
        {loading ? 'Seeding...' : 'Seed Camps'}
      </button>
      <p style={{ color: '#A89880' }}>{status}</p>
    </div>
  )
}

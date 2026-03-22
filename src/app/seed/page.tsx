'use client'

import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { collection, addDoc, getDocs } from 'firebase/firestore'
import { SEED_CAMPS } from '@/lib/utils'

export default function SeedPage() {
  const [status, setStatus] = useState('')

  async function seed() {
    setStatus('Seeding...')
    const existing = await getDocs(collection(db, 'camps'))
    if (existing.size > 0) {
      setStatus('Camps already exist!')
      return
    }
    for (const camp of SEED_CAMPS) {
      await addDoc(collection(db, 'camps'), camp)
    }
    setStatus('Done! All camps seeded 🔥')
  }

  return (
    <div style={{ background: '#0D0B09', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <div style={{ fontSize: 48 }}>🔥</div>
      <button onClick={seed} style={{ background: '#F97316', color: 'white', border: 'none', borderRadius: 8, padding: '12px 24px', fontSize: 16, cursor: 'pointer' }}>
        Seed Camps
      </button>
      <p style={{ color: '#A89880' }}>{status}</p>
    </div>
  )
}

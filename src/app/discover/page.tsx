'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Search } from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { formatCount } from '@/lib/utils'
import CampfireScene from '@/components/layout/CampfireScene'
import type { Camp } from '@/types'

export default function DiscoverPage() {
  const router = useRouter()
  const [camps,  setCamps]  = useState<Camp[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    getDocs(query(collection(db, 'camps'), orderBy('memberCount', 'desc')))
      .then(snap => setCamps(snap.docs.map(d => ({ id: d.id, ...d.data() } as Camp))))
  }, [])

  const filtered = camps.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <CampfireScene />
      <div className="relative z-10 h-full overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-6">

          <button onClick={() => router.back()}
            className="flex items-center gap-2 text-[#A89880] hover:text-[#F97316] mb-6 transition-colors">
            <ArrowLeft size={16} /> Back
          </button>

          <div className="font-serif text-2xl font-semibold text-[#F5EFE8] mb-2">🧭 Discover Camps</div>
          <p className="text-sm text-[#6B5A4A] mb-6">Find your community and gather around the fire</p>

          <div className="flex items-center gap-2 rounded-xl px-4 py-3 border border-[#2E2820] mb-6"
            style={{ background: 'rgba(18,14,10,.88)', backdropFilter: 'blur(12px)' }}>
            <Search size={16} className="text-[#6B5A4A]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search camps..."
              className="flex-1 bg-transparent text-sm text-[#F5EFE8] outline-none placeholder-[#6B5A4A]"
            />
          </div>

          <div className="grid grid-cols-1 gap-3">
            {filtered.map(camp => (
              <button key={camp.id}
                onClick={() => router.push(`/camp/${camp.name}`)}
                className="flex items-center gap-4 p-4 rounded-xl border border-[#2E2820] hover:border-[#F97316]/40 transition-all text-left"
                style={{ background: 'rgba(18,14,10,.88)', backdropFilter: 'blur(12px)' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: camp.color }}>
                  {camp.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-serif text-base font-semibold text-[#F5EFE8]">{camp.displayName}</div>
                  <div className="text-xs text-[#6B5A4A] mt-0.5 truncate">{camp.description}</div>
                  <div className="text-xs text-[#F97316] mt-1">{formatCount(camp.memberCount)} members</div>
                </div>
                <div className="text-[#6B5A4A] text-xs">→</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

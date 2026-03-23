'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Search } from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, getDocs, limit, orderBy, query, startAfter } from 'firebase/firestore'
import { formatCount } from '@/lib/utils'
import CampfireScene from '@/components/layout/CampfireScene'
import type { Camp } from '@/types'

export default function DiscoverPage() {
  const router = useRouter()
  const [camps, setCamps] = useState<Camp[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')
  const [cursor, setCursor] = useState<any>(null)
  const [hasMore, setHasMore] = useState(false)

  async function loadInitial() {
    setLoading(true)
    setError('')
    try {
      const snap = await getDocs(query(collection(db, 'camps'), orderBy('memberCount', 'desc'), limit(16)))
      const mapped = snap.docs.map((d: any) => ({ id: d.id, ...d.data() } as Camp))
      setCamps(mapped)
      setCursor(snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null)
      setHasMore(snap.size === 16)
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load camps.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInitial()
  }, [])

  async function loadMore() {
    if (!cursor || !hasMore || loadingMore) return
    setLoadingMore(true)
    setError('')
    try {
      const snap = await getDocs(query(collection(db, 'camps'), orderBy('memberCount', 'desc'), startAfter(cursor), limit(16)))
      const mapped = snap.docs.map((d: any) => ({ id: d.id, ...d.data() } as Camp))
      setCamps((prev: Camp[]) => [...prev, ...mapped])
      setCursor(snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null)
      setHasMore(snap.size === 16)
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load more camps.')
    } finally {
      setLoadingMore(false)
    }
  }

  const filtered = camps.filter((c: Camp) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="relative w-full min-h-dvh overflow-hidden">
      <CampfireScene />
      <div className="relative z-10 h-full overflow-y-auto touch-scroll safe-top">
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
              onChange={(e: any) => setSearch(e.target.value)}
              placeholder="Search camps..."
              className="flex-1 bg-transparent text-sm text-[#F5EFE8] outline-none placeholder-[#6B5A4A]"
            />
          </div>

          {loading && <div className="text-center py-10 text-[#F97316] animate-pulse">🔥 Loading camps...</div>}
          {!loading && error && <div className="text-center py-8 text-sm text-red-400">{error}</div>}

          <div className="grid grid-cols-1 gap-3">
            {filtered.map((camp: Camp) => (
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

          {!loading && filtered.length > 0 && hasMore && search.trim() === '' && (
            <div className="flex justify-center pt-4">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg,#EA580C,#F97316)' }}
              >
                {loadingMore ? 'Loading...' : 'Load more'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

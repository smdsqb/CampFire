'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { subscribeToPosts } from '@/lib/db'
import { formatCount } from '@/lib/utils'
import CampfireScene from '@/components/layout/CampfireScene'
import PostCard from '@/components/feed/PostCard'
import type { Camp, Post } from '@/types'

export default function CampPage() {
  const { name } = useParams<{ name: string }>()
  const router = useRouter()
  const [camp, setCamp] = useState<Camp | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')

    getDocs(query(collection(db, 'camps'), where('name', '==', name)))
      .then(snap => {
        if (!snap.empty) setCamp({ id: snap.docs[0].id, ...snap.docs[0].data() } as Camp)
      })
      .catch((e: any) => setError(e?.message ?? 'Failed to load camp.'))
      .finally(() => setLoading(false))

    const unsub = subscribeToPosts(name, 'hot', (items) => setPosts(items))
    return () => unsub()
  }, [name])

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden">
      <CampfireScene />
      <div className="relative z-10 h-full overflow-y-auto touch-scroll safe-top">
        <div className="max-w-2xl mx-auto px-4 py-6">

          <button onClick={() => router.back()}
            className="flex items-center gap-2 text-[#A89880] hover:text-[#F97316] mb-6 transition-colors">
            <ArrowLeft size={16} /> Back
          </button>

          {camp && (
            <div className="rounded-2xl border border-[#2E2820] p-5 mb-6"
              style={{ background: 'rgba(18,14,10,.92)', backdropFilter: 'blur(16px)' }}>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl"
                  style={{ background: camp.color }}>
                  {camp.icon}
                </div>
                <div>
                  <div className="font-serif text-xl font-semibold text-[#F5EFE8]">{camp.displayName}</div>
                  <div className="text-sm text-[#6B5A4A] mt-0.5">{camp.description}</div>
                  <div className="text-xs text-[#F97316] mt-1">{formatCount(camp.memberCount)} members</div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {loading ? (
              <div className="text-center py-12 text-[#F97316] animate-pulse">🔥 Loading camp...</div>
            ) : error ? (
              <div className="text-center py-12 text-red-400">{error}</div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12 text-[#6B5A4A]">No posts in this camp yet 🔥</div>
            ) : posts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Search } from 'lucide-react'
import { searchPostsPage } from '@/lib/db'
import { formatCount, timeAgo } from '@/lib/utils'
import CampfireScene from '@/components/layout/CampfireScene'
import type { Post } from '@/types'

export default function SearchPage() {
  const router = useRouter()
  const [q, setQ] = useState('')
  const [results, setResults] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState('')
  const [cursor, setCursor] = useState<any>(null)
  const [hasMore, setHasMore] = useState(false)

  async function handleSearch() {
    if (!q.trim()) return
    setLoading(true)
    setSearched(true)
    setError('')

    try {
      const page = await searchPostsPage({ searchTerm: q, pageSize: 20, cursor: null })
      setResults(page.posts)
      setCursor(page.nextCursor)
      setHasMore(page.hasMore)
    } catch (e: any) {
      setError(e?.message ?? 'Search failed. Please try again.')
      setResults([])
      setHasMore(false)
      setCursor(null)
    } finally {
      setLoading(false)
    }
  }

  async function loadMore() {
    if (!hasMore || !cursor || loadingMore) return
    setLoadingMore(true)
    setError('')
    try {
      const page = await searchPostsPage({ searchTerm: q, pageSize: 20, cursor })
      setResults(prev => [...prev, ...page.posts])
      setCursor(page.nextCursor)
      setHasMore(page.hasMore)
    } catch (e: any) {
      setError(e?.message ?? 'Could not load more results.')
    } finally {
      setLoadingMore(false)
    }
  }

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden">
      <CampfireScene />
      <div className="relative z-10 h-full overflow-y-auto touch-scroll safe-top">
        <div className="max-w-2xl mx-auto px-4 py-6">

          <button onClick={() => router.back()}
            className="flex items-center gap-2 text-[#A89880] hover:text-[#F97316] mb-6 transition-colors">
            <ArrowLeft size={16} /> Back
          </button>

          <div className="font-serif text-2xl font-semibold text-[#F5EFE8] mb-6">🔍 Search</div>

          <div className="flex gap-2 mb-6">
            <div className="flex-1 flex items-center gap-2 rounded-xl px-4 py-3 border border-[#2E2820]"
              style={{ background: 'rgba(18,14,10,.88)', backdropFilter: 'blur(12px)' }}>
              <Search size={16} className="text-[#6B5A4A]" />
              <input
                value={q}
                onChange={e => setQ(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Search posts, camps, tags..."
                className="flex-1 bg-transparent text-sm text-[#F5EFE8] outline-none placeholder-[#6B5A4A]"
              />
            </div>
            <button onClick={handleSearch}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg,#EA580C,#F97316)' }}>
              Search
            </button>
          </div>

          {loading && <div className="text-center py-12 text-[#F97316] animate-pulse">🔥 Searching...</div>}

          {!loading && error && (
            <div className="text-center py-6 text-sm text-red-400">{error}</div>
          )}

          {!loading && searched && results.length === 0 && (
            <div className="text-center py-12 text-[#6B5A4A]">No results found for &quot;{q}&quot;</div>
          )}

          <div className="flex flex-col gap-3">
            {results.map(post => (
              <button key={post.id}
                onClick={() => router.push(`/post/${post.id}`)}
                className="text-left rounded-xl border border-[#2E2820] p-4 hover:border-[#3D3228] transition-colors"
                style={{ background: 'rgba(18,14,10,.88)', backdropFilter: 'blur(12px)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-[#6B5A4A]">{post.campIcon} c/{post.campName}</span>
                  <span className="text-xs text-[#6B5A4A]">· {timeAgo(post.createdAt)}</span>
                </div>
                <div className="font-serif text-sm font-semibold text-[#F5EFE8] mb-1">{post.title}</div>
                {post.body && <div className="text-xs text-[#6B5A4A] line-clamp-2 mb-2">{post.body}</div>}
                <div className="text-xs text-[#6B5A4A]">↑ {formatCount(post.upvotes)} · 💬 {formatCount(post.commentCount)}</div>
              </button>
            ))}
          </div>

          {!loading && results.length > 0 && hasMore && (
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

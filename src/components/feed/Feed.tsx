'use client'

import { useEffect, useState } from 'react'
import { Flame, Sparkles, TrendingUp, Rocket, Plus } from 'lucide-react'
import { subscribeToPosts } from '@/lib/db'
import { useAuth } from '@/lib/auth-context'
import PostCard from './PostCard'
import NewPostModal from './NewPostModal'
import type { Post, SortMode } from '@/types'

const SORT_TABS: { key: SortMode; label: string; icon: React.ReactNode }[] = [
  { key: 'hot', label: 'Hot', icon: <Flame size={14} /> },
  { key: 'new', label: 'New', icon: <Sparkles size={14} /> },
  { key: 'top', label: 'Top', icon: <TrendingUp size={14} /> },
  { key: 'rising', label: 'Rising', icon: <Rocket size={14} /> },
]

interface Props { campId: string | null; campName: string | null }

export default function Feed({ campId, campName }: Props) {
  const { user } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [sort, setSort] = useState<SortMode>('hot')
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const unsub = subscribeToPosts(campId, sort, setPosts)
    return () => unsub()
  }, [campId, sort])

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="glass-dark border-b border-[#2E2820] px-2 md:px-4 flex items-center gap-1 flex-shrink-0 overflow-x-auto">
        {SORT_TABS.map(tab => (
          <button key={tab.key} onClick={() => setSort(tab.key)}
            className="flex h-11 items-center gap-1.5 px-2.5 text-xs md:text-sm font-medium border-b-2 transition-all whitespace-nowrap"
            style={{ color: sort === tab.key ? '#F97316' : '#6B5A4A', borderColor: sort === tab.key ? '#F97316' : 'transparent' }}>
            {tab.icon} {tab.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden sm:block rounded-full px-3 py-1.5 text-xs text-[#A89880] border border-[#3D3228] cursor-pointer"
            style={{ background: 'rgba(255,255,255,.06)' }}>
            Today ▾
          </div>
          {user && (
            <button onClick={() => setShowModal(true)}
              className="flex h-11 items-center gap-1 rounded-full px-2.5 md:px-3 text-xs font-semibold text-white whitespace-nowrap"
              style={{ background: 'linear-gradient(135deg,#EA580C,#F97316)', boxShadow: '0 0 14px rgba(249,115,22,.3)' }}>
              <Plus size={13} /> <span className="hidden sm:inline">New Post</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto touch-scroll px-2 md:px-3 py-3 glass-feed flex flex-col gap-2">
        {posts.length === 0
          ? <EmptyState campName={campName} onPost={() => setShowModal(true)} />
          : posts.map(post => <PostCard key={post.id} post={post} />)
        }
      </div>

      <div className="glass-dark border-t border-[#2E2820] px-2 md:px-4 py-2.5 flex items-center gap-2 flex-shrink-0">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm border border-[#3D3228]"
          style={{ background: 'rgba(255,255,255,.05)' }}>🔥</div>
        <button onClick={() => user ? setShowModal(true) : undefined}
          className="flex-1 min-h-11 rounded-full px-4 py-2 text-sm text-left border border-[#3D3228] text-[#6B5A4A]"
          style={{ background: 'rgba(255,255,255,.05)' }}>
          Share something with the community...
        </button>
        <button onClick={() => user ? setShowModal(true) : undefined}
          className="w-11 h-11 rounded-full flex items-center justify-center text-white text-base"
          style={{ background: 'linear-gradient(135deg,#EA580C,#F97316)' }}>
          ↑
        </button>
      </div>

      {showModal && <NewPostModal campId={campId} campName={campName} onClose={() => setShowModal(false)} />}
    </div>
  )
}

function EmptyState({ campName, onPost }: { campName: string | null; onPost: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-4 py-20 text-center">
      <div className="text-5xl">🔥</div>
      <div className="font-serif text-xl text-[#F5EFE8]">No posts yet</div>
      <p className="text-sm text-[#6B5A4A] max-w-xs">
        {campName ? `Be the first to spark a conversation in c/${campName}` : 'Join some camps and start the fire'}
      </p>
      <button onClick={onPost} className="px-4 py-2 rounded-full text-sm font-semibold text-white"
        style={{ background: 'linear-gradient(135deg,#EA580C,#F97316)' }}>
        Create a Post
      </button>
    </div>
  )
}

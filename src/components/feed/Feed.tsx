'use client'

import { useEffect, useState } from 'react'
import { Flame, Sparkles, TrendingUp, Rocket, Plus, Menu, X } from 'lucide-react'
import { subscribeToPosts } from '@/lib/db'
import { useAuth } from '@/lib/auth-context'
import PostCard from './PostCard'
import NewPostModal from './NewPostModal'
import { SEED_CAMPS } from '@/lib/utils'
import type { Camp, Post, SortMode } from '@/types'

const SORT_TABS: { key: SortMode; label: string; icon: React.ReactNode }[] = [
  { key: 'hot', label: 'Hot', icon: <Flame size={14} /> },
  { key: 'new', label: 'New', icon: <Sparkles size={14} /> },
  { key: 'top', label: 'Top', icon: <TrendingUp size={14} /> },
  { key: 'rising', label: 'Rising', icon: <Rocket size={14} /> },
]

interface Props {
  campId: string | null
  campName: string | null
  camps: Camp[]
  activeCamp: string | null
  onCampSelect: (campName: string | null) => void
}

export default function Feed({ campId, campName, camps, activeCamp, onCampSelect }: Props) {
  const { user } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [sort, setSort] = useState<SortMode>('hot')
  const [showModal, setShowModal] = useState(false)
  const [showSortMenu, setShowSortMenu] = useState(false)

  const menuCamps = camps.length > 0
    ? camps
    : SEED_CAMPS.map((camp, i) => ({ ...camp, id: String(i), createdAt: new Date(), createdBy: '' }))

  useEffect(() => {
    const unsub = subscribeToPosts(campId, sort, setPosts)
    return () => unsub()
  }, [campId, sort])

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      <div className="relative glass-dark border-b border-[#2E2820] px-2 md:px-4 flex items-center gap-1 flex-shrink-0">
        <button
          onClick={() => setShowSortMenu(v => !v)}
          className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#3D3228] text-[#A89880] md:hidden"
          style={{ background: 'rgba(255,255,255,.05)' }}
          aria-label="Open sort menu"
        >
          {showSortMenu ? <X size={16} /> : <Menu size={16} />}
        </button>

        <div className="hidden md:flex items-center gap-1 overflow-x-auto touch-scroll">
          {SORT_TABS.map(tab => (
            <button key={tab.key} onClick={() => setSort(tab.key)}
              className="flex h-11 items-center gap-1.5 px-2.5 text-xs md:text-sm font-medium border-b-2 transition-all whitespace-nowrap"
              style={{ color: sort === tab.key ? '#F97316' : '#6B5A4A', borderColor: sort === tab.key ? '#F97316' : 'transparent' }}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

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

        {showSortMenu && (
          <div
            className="absolute left-2 top-[calc(100%+8px)] z-30 w-56 rounded-xl border border-[#3D3228] p-1.5 md:hidden"
            style={{ background: 'rgba(10,8,5,.96)', backdropFilter: 'blur(12px)' }}
          >
            <div className="px-2 py-1 text-[10px] font-semibold tracking-widest uppercase text-[#6B5A4A]">Sort</div>
            {SORT_TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => { setSort(tab.key); setShowSortMenu(false) }}
                className="flex min-h-11 w-full items-center gap-2 rounded-lg px-2.5 text-xs font-medium transition-all"
                style={{
                  color: sort === tab.key ? '#F97316' : '#A89880',
                  background: sort === tab.key ? 'rgba(249,115,22,.12)' : 'transparent',
                }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}

            <div className="mx-1 my-1 h-px bg-[#2E2820]" />
            <div className="px-2 py-1 text-[10px] font-semibold tracking-widest uppercase text-[#6B5A4A]">Camps</div>

            <button
              onClick={() => { onCampSelect(null); setShowSortMenu(false) }}
              className="flex min-h-11 w-full items-center gap-2 rounded-lg px-2.5 text-xs font-medium transition-all"
              style={{
                color: activeCamp === null ? '#F97316' : '#A89880',
                background: activeCamp === null ? 'rgba(249,115,22,.12)' : 'transparent',
              }}
            >
              🌍 Home Feed
            </button>

            <div className="max-h-56 overflow-y-auto touch-scroll">
              {menuCamps.map(camp => (
                <button
                  key={camp.id}
                  onClick={() => { onCampSelect(camp.name); setShowSortMenu(false) }}
                  className="flex min-h-11 w-full items-center gap-2 rounded-lg px-2.5 text-xs font-medium transition-all"
                  style={{
                    color: activeCamp === camp.name ? '#F97316' : '#A89880',
                    background: activeCamp === camp.name ? 'rgba(249,115,22,.12)' : 'transparent',
                  }}
                >
                  <span>{camp.icon}</span>
                  <span className="truncate">c/{camp.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
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

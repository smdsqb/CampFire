'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { formatCount } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import type { Post } from '@/types'

interface Props { trending: Post[]; onOnlineCount: (n: number) => void }

export default function RightPanel({ trending, onOnlineCount }: Props) {
  const { user, signInWithGoogle } = useAuth()
  const [memberCount, setMemberCount] = useState(0)
  const [campCount,   setCampCount]   = useState(0)
  const [postCount,   setPostCount]   = useState(0)
  const [onlineCount, setOnlineCount] = useState(1)

  useEffect(() => {
    async function fetchStats() {
      const [members, camps, posts] = await Promise.all([
        supabase.from('memberships').select('*', { count: 'exact', head: true }),
        supabase.from('camps').select('*', { count: 'exact', head: true }),
        supabase.from('posts').select('*', { count: 'exact', head: true }),
      ])
      setMemberCount(members.count ?? 0)
      setCampCount(camps.count ?? 0)
      setPostCount(posts.count ?? 0)
    }
    fetchStats()

    const roomChannel = supabase.channel('online-users', {
      config: { presence: { key: Math.random().toString(36).slice(2) } }
    })

    roomChannel
      .on('presence', { event: 'sync' }, () => {
        const state = roomChannel.presenceState()
        const count = Object.keys(state).length
        setOnlineCount(count)
        onOnlineCount(count)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await roomChannel.track({ online_at: new Date().toISOString() })
        }
      })

    const statsChannel = supabase
      .channel('stats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'memberships' }, fetchStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, fetchStats)
      .subscribe()

    return () => {
      supabase.removeChannel(roomChannel)
      supabase.removeChannel(statsChannel)
    }
  }, [])

  return (
    <div className="w-[210px] flex-shrink-0 border-l border-[#2E2820] overflow-y-auto px-3 py-3 flex flex-col gap-3 glass">

      <div className="rounded-xl p-4 text-center border border-[#F97316]/20"
        style={{ background: 'linear-gradient(160deg,rgba(28,15,4,.95),rgba(45,26,8,.95))' }}>
        <div className="text-[30px] mb-2">🔥</div>
        <div className="font-serif text-sm font-semibold text-[#FDE68A] mb-1">Welcome to CampFire</div>
        <p className="text-[11px] text-[#6B5A4A] leading-relaxed mb-3">
          Gather around. Every great conversation starts with a spark.
        </p>
        {user ? (
          <div className="text-xs text-[#A89880]">Signed in as {user.user_metadata?.full_name}</div>
        ) : (
          <button
            onClick={signInWithGoogle}
            className="w-full py-2 text-xs font-semibold text-white rounded-lg"
            style={{ background: 'linear-gradient(135deg,#EA580C,#F97316)' }}
          >
            Sign in with Google
          </button>
        )}
        <div className="flex justify-around mt-3">
          <div>
            <div className="text-sm font-semibold text-[#F5EFE8]">{formatCount(memberCount)}</div>
            <div className="text-[10px] text-[#6B5A4A]">members</div>
          </div>
          <div>
            <div className="text-sm font-semibold text-[#F5EFE8] flex items-center justify-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500"></span>
              {formatCount(onlineCount)}
            </div>
            <div className="text-[10px] text-[#6B5A4A]">online</div>
          </div>
          <div>
            <div className="text-sm font-semibold text-[#F5EFE8]">{formatCount(campCount)}</div>
            <div className="text-[10px] text-[#6B5A4A]">camps</div>
          </div>
        </div>
      </div>

      <Widget title="🔥 Trending Today">
        {trending.slice(0, 4).map((post, i) => (
          <div key={post.id} className="flex items-start gap-2 py-1.5 border-b border-[#2E2820] last:border-0 cursor-pointer">
            <span className="text-lg font-semibold text-[#3D3228] font-serif w-4 flex-shrink-0">{i + 1}</span>
            <div>
              <div className="text-[10px] text-[#6B5A4A] font-medium">c/{post.campName}</div>
              <div className="text-xs text-[#F5EFE8] font-medium leading-snug mt-0.5 line-clamp-2">{post.title}</div>
              <div className="text-[10px] text-[#F97316] font-semibold mt-0.5">↑ {formatCount(post.upvotes)}</div>
            </div>
          </div>
        ))}
        {trending.length === 0 && (
          <p className="text-xs text-[#6B5A4A] py-2">No trending posts yet.</p>
        )}
      </Widget>

      <Widget title="⚡ Live Stats">
        {[
          ['🔥 Posts',   formatCount(postCount)],
          ['🏕️ Camps',   formatCount(campCount)],
          ['👥 Members', formatCount(memberCount)],
          ['🟢 Online',  formatCount(onlineCount)],
        ].map(([label, val]) => (
          <div key={label} className="flex items-center justify-between py-1.5">
            <span className="text-xs text-[#A89880]">{label}</span>
            <span className="text-xs font-semibold text-[#F5EFE8]">{val}</span>
          </div>
        ))}
      </Widget>

    </div>
  )
}

function Widget({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl overflow-hidden border border-[#2E2820]"
      style={{ background: 'rgba(20,16,12,.9)' }}>
      <div className="px-3 py-2.5 text-[10px] font-semibold tracking-widest uppercase text-[#6B5A4A] border-b border-[#2E2820]">
        {title}
      </div>
      <div className="px-3 py-1">{children}</div>
    </div>
  )
}

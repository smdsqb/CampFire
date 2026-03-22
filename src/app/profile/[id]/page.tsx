'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { formatCount, timeAgo } from '@/lib/utils'
import CampfireScene from '@/components/layout/CampfireScene'
import type { Post } from '@/types'

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user } = useAuth()
  const [profile,   setProfile]   = useState<any>(null)
  const [posts,     setPosts]     = useState<Post[]>([])
  const [tab,       setTab]       = useState<'posts' | 'comments'>('posts')
  const [loading,   setLoading]   = useState(true)

  const isOwnProfile = user?.id === id

  useEffect(() => {
    async function load() {
      const { data: profileData } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single()
      setProfile(profileData)

      const { data: postsData } = await supabase
        .from('posts')
        .select('*')
        .eq('author_id', id)
        .order('created_at', { ascending: false })
        .limit(20)
      setPosts((postsData ?? []).map((p: any) => ({
        id: p.id, title: p.title, body: p.body,
        campId: p.camp_id, campName: p.camp_name, campIcon: p.camp_icon,
        authorId: p.author_id, authorName: p.author_name, authorAvatar: p.author_avatar,
        upvotes: p.upvotes, downvotes: p.downvotes, commentCount: p.comment_count,
        createdAt: new Date(p.created_at), tags: p.tags ?? [], awards: p.awards ?? [],
      })))
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) return (
    <div className="relative w-screen h-screen overflow-hidden">
      <CampfireScene />
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="text-[#F97316] text-2xl animate-pulse">🔥</div>
      </div>
    </div>
  )

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <CampfireScene />
      <div className="relative z-10 h-full overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-6">

          {/* Back button */}
          <button onClick={() => router.back()}
            className="flex items-center gap-2 text-[#A89880] hover:text-[#F97316] mb-6 transition-colors">
            <ArrowLeft size={16} /> Back
          </button>

          {/* Profile card */}
          <div className="rounded-2xl border border-[#2E2820] p-6 mb-4"
            style={{ background: 'rgba(18,14,10,.92)', backdropFilter: 'blur(16px)' }}>
            <div className="flex items-center gap-4">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-[#F97316]" />
              ) : (
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white"
                  style={{ background: 'linear-gradient(135deg,#EA580C,#FBBF24)' }}>
                  {profile?.full_name?.[0] ?? '?'}
                </div>
              )}
              <div>
                <div className="font-serif text-xl font-semibold text-[#F5EFE8]">
                  {profile?.full_name ?? 'Anonymous'}
                </div>
                <div className="text-sm text-[#6B5A4A] mt-0.5">{posts.length} posts</div>
                {isOwnProfile && (
                  <button
                    onClick={() => router.push('/settings')}
                    className="mt-2 text-xs px-3 py-1 rounded-full border border-[#3D3228] text-[#A89880] hover:text-[#F97316] hover:border-[#F97316] transition-all"
                    style={{ background: 'rgba(255,255,255,.05)' }}>
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-0 border-b border-[#2E2820] mb-4">
            {(['posts', 'comments'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="px-4 py-2.5 text-sm font-medium border-b-2 transition-all capitalize"
                style={{ color: tab === t ? '#F97316' : '#6B5A4A', borderColor: tab === t ? '#F97316' : 'transparent' }}>
                {t}
              </button>
            ))}
          </div>

          {/* Posts */}
          {tab === 'posts' && (
            <div className="flex flex-col gap-3">
              {posts.length === 0 ? (
                <div className="text-center py-12 text-[#6B5A4A]">No posts yet 🔥</div>
              ) : posts.map(post => (
                <button key={post.id} onClick={() => router.push(`/post/${post.id}`)}
                  className="text-left rounded-xl border border-[#2E2820] p-4 hover:border-[#3D3228] transition-colors"
                  style={{ background: 'rgba(18,14,10,.88)', backdropFilter: 'blur(12px)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-[#6B5A4A]">{post.campIcon} c/{post.campName}</span>
                    <span className="text-xs text-[#6B5A4A]">· {timeAgo(post.createdAt)}</span>
                  </div>
                  <div className="font-serif text-sm font-semibold text-[#F5EFE8] mb-1">{post.title}</div>
                  <div className="text-xs text-[#6B5A4A]">↑ {formatCount(post.upvotes)} · 💬 {formatCount(post.commentCount)}</div>
                </button>
              ))}
            </div>
          )}

          {tab === 'comments' && (
            <div className="text-center py-12 text-[#6B5A4A]">Comments coming soon 🔥</div>
          )}
        </div>
      </div>
    </div>
  )
}

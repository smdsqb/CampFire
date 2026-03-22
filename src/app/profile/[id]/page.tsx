'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, query, where, orderBy, limit, getDocs, doc, getDoc } from 'firebase/firestore'
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

  const isOwnProfile = user?.uid === id

  useEffect(() => {
    async function load() {
      const userSnap = await getDoc(doc(db, 'users', id))
      setProfile(userSnap.data())

      const q = query(
        collection(db, 'posts'),
        where('authorId', '==', id),
        orderBy('createdAt', 'desc'),
        limit(20)
      )
      const postsSnap = await getDocs(q)
      setPosts(postsSnap.docs.map(d => {
        const data = d.data()
        return {
          id:           d.id,
          title:        data.title,
          body:         data.body,
          campId:       data.campId,
          campName:     data.campName,
          campIcon:     data.campIcon,
          authorId:     data.authorId,
          authorName:   data.authorName,
          authorAvatar: data.authorAvatar,
          upvotes:      data.upvotes,
          downvotes:    data.downvotes,
          commentCount: data.commentCount,
          createdAt:    data.createdAt?.toDate() ?? new Date(),
          tags:         data.tags ?? [],
          awards:       data.awards ?? [],
        } as Post
      }))
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

          <button onClick={() => router.back()}
            className="flex items-center gap-2 text-[#A89880] hover:text-[#F97316] mb-6 transition-colors">
            <ArrowLeft size={16} /> Back
          </button>

          <div className="rounded-2xl border border-[#2E2820] p-6 mb-4"
            style={{ background: 'rgba(18,14,10,.92)', backdropFilter: 'blur(16px)' }}>
            <div className="flex items-center gap-4">
              {profile?.photoURL ? (
                <img src={profile.photoURL} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-[#F97316]" />
              ) : (
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white"
                  style={{ background: 'linear-gradient(135deg,#EA580C,#FBBF24)' }}>
                  {profile?.displayName?.[0] ?? '?'}
                </div>
              )}
              <div>
                <div className="font-serif text-xl font-semibold text-[#F5EFE8]">
                  {profile?.displayName ?? 'Anonymous'}
                </div>
                <div className="text-sm text-[#6B5A4A] mt-0.5">{posts.length} posts</div>
                {isOwnProfile && (
                  <button
                    onClick={() => router.push('/settings')}
                    className="mt-2 text-xs px-3 py-1 rounded-full border border-[#3D3228] text-[#A89880] hover:text-[#F97316] transition-all"
                    style={{ background: 'rgba(255,255,255,.05)' }}>
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-0 border-b border-[#2E2820] mb-4">
            {(['posts', 'comments'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="px-4 py-2.5 text-sm font-medium border-b-2 transition-all capitalize"
                style={{ color: tab === t ? '#F97316' : '#6B5A4A', borderColor: tab === t ? '#F97316' : 'transparent' }}>
                {t}
              </button>
            ))}
          </div>

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

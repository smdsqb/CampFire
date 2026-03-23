'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, query, where, orderBy, limit, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore'
import { useAuth } from '@/lib/auth-context'
import { subscribeSavedPostIds } from '@/lib/db'
import { formatCount, timeAgo } from '@/lib/utils'
import CampfireScene from '@/components/layout/CampfireScene'
import type { Post } from '@/types'

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user } = useAuth()
  const [profile,      setProfile]      = useState<any>(null)
  const [posts,        setPosts]        = useState<Post[]>([])
  const [savedPostIds, setSavedPostIds] = useState<string[]>([])
  const [savedPosts,   setSavedPosts]   = useState<Post[]>([])
  const [tab,          setTab]          = useState<'posts' | 'comments' | 'saved'>('posts')
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')
  const [editingBio,   setEditingBio]   = useState(false)
  const [bio,          setBio]          = useState('')
  const [savingBio,    setSavingBio]    = useState(false)

  const isOwnProfile = user?.uid === id

  useEffect(() => {
    async function load() {
      setError('')
      try {
        const userSnap = await getDoc(doc(db, 'users', id))
        const profileData = userSnap.data()
        setProfile(profileData)
        setBio(profileData?.bio ?? '')

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
            id: d.id, title: data.title, body: data.body,
            campId: data.campId, campName: data.campName, campIcon: data.campIcon,
            authorId: data.authorId, authorName: data.authorName, authorAvatar: data.authorAvatar,
            upvotes: data.upvotes, downvotes: data.downvotes, commentCount: data.commentCount,
            createdAt: data.createdAt?.toDate() ?? new Date(),
            tags: data.tags ?? [], awards: data.awards ?? [],
          } as Post
        }))
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load profile.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  useEffect(() => {
    if (!isOwnProfile || !user) { setSavedPostIds([]); return }
    const unsub = subscribeSavedPostIds(user.uid, setSavedPostIds)
    return () => unsub()
  }, [isOwnProfile, user])

  useEffect(() => {
    async function loadSaved() {
      if (!isOwnProfile || savedPostIds.length === 0) { setSavedPosts([]); return }
      const docs = await Promise.all(savedPostIds.slice(0, 30).map(async (postId) => {
        const snap = await getDoc(doc(db, 'posts', postId))
        if (!snap.exists()) return null
        const data = snap.data()
        return {
          id: snap.id, title: data.title, body: data.body,
          campId: data.campId, campName: data.campName, campIcon: data.campIcon,
          authorId: data.authorId, authorName: data.authorName, authorAvatar: data.authorAvatar,
          upvotes: data.upvotes, downvotes: data.downvotes, commentCount: data.commentCount,
          createdAt: data.createdAt?.toDate() ?? new Date(),
          tags: data.tags ?? [], awards: data.awards ?? [],
        } as Post
      }))
      setSavedPosts(docs.filter(Boolean) as Post[])
    }
    loadSaved()
  }, [savedPostIds, isOwnProfile])

  async function saveBio() {
    if (!user || user.uid !== id) return
    setSavingBio(true)
    try {
      await updateDoc(doc(db, 'users', id), { bio })
      setProfile((prev: any) => ({ ...prev, bio }))
      setEditingBio(false)
    } catch (e: any) {
      setError(e?.message ?? 'Could not save bio.')
    } finally {
      setSavingBio(false)
    }
  }

  const joinedDate = profile?.joinedAt?.toDate
    ? profile.joinedAt.toDate()
    : profile?.createdAt?.toDate
      ? profile.createdAt.toDate()
      : null

  const karma = posts.reduce((sum, p) => sum + (p.upvotes - p.downvotes), 0)

  if (loading) return (
    <div className="relative w-full h-[100dvh] overflow-hidden">
      <CampfireScene />
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="text-[#F97316] text-2xl animate-pulse">🔥</div>
      </div>
    </div>
  )

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden">
      <CampfireScene />
      <div className="relative z-10 h-full overflow-y-auto touch-scroll safe-top">
        <div className="max-w-2xl mx-auto px-4 py-6">

          <button onClick={() => router.back()}
            className="flex items-center gap-2 text-[#A89880] hover:text-[#F97316] mb-6 transition-colors">
            <ArrowLeft size={16} /> Back
          </button>

          {/* Profile card */}
          <div className="rounded-2xl border border-[#2E2820] p-6 mb-4"
            style={{ background: 'rgba(18,14,10,.92)', backdropFilter: 'blur(16px)' }}>
            <div className="flex items-start gap-4">
              {profile?.photoURL ? (
                <img src={profile.photoURL} alt="Profile" className="w-16 h-16 rounded-full object-cover border-2 border-[#F97316] flex-shrink-0" />
              ) : (
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,#EA580C,#FBBF24)' }}>
                  {profile?.displayName?.[0] ?? '?'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-serif text-xl font-semibold text-[#F5EFE8]">
                  {profile?.displayName ?? 'Anonymous'}
                </div>

                {/* Stats */}
                <div className="text-sm text-[#6B5A4A] mt-0.5">
                  {posts.length} posts · {karma} karma
                </div>
                {joinedDate && (
                  <div className="text-xs text-[#6B5A4A] mt-0.5">
                    Joined {joinedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </div>
                )}

                {/* Bio */}
                {editingBio ? (
                  <div className="mt-2">
                    <textarea
                      value={bio}
                      onChange={e => setBio(e.target.value)}
                      placeholder="Write something about yourself..."
                      rows={2}
                      maxLength={160}
                      className="w-full rounded-lg px-3 py-2 text-sm text-[#F5EFE8] border border-[#3D3228] outline-none focus:border-[#F97316] transition-colors resize-none"
                      style={{ background: '#262019' }}
                    />
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-[#6B5A4A]">{bio.length}/160</span>
                      <button onClick={saveBio} disabled={savingBio}
                        className="text-xs px-3 py-1 rounded-full text-white font-semibold disabled:opacity-50"
                        style={{ background: 'linear-gradient(135deg,#EA580C,#F97316)' }}>
                        {savingBio ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={() => { setEditingBio(false); setBio(profile?.bio ?? '') }}
                        className="text-xs px-3 py-1 rounded-full text-[#A89880] border border-[#3D3228]"
                        style={{ background: 'rgba(255,255,255,.05)' }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-1">
                    {profile?.bio
                      ? <p className="text-sm text-[#A89880] max-w-md line-clamp-2">{profile.bio}</p>
                      : isOwnProfile
                        ? <p className="text-sm text-[#3D3228] italic">No bio yet — add one!</p>
                        : null
                    }
                    {isOwnProfile && (
                      <button onClick={() => setEditingBio(true)}
                        className="text-xs text-[#F97316] hover:text-[#FDBA74] transition-colors mt-1 block">
                        {profile?.bio ? '✏️ Edit bio' : '+ Add bio'}
                      </button>
                    )}
                  </div>
                )}

                {isOwnProfile && (
                  <button
                    onClick={() => router.push('/settings')}
                    className="mt-3 text-xs px-3 py-1 rounded-full border border-[#3D3228] text-[#A89880] hover:text-[#F97316] transition-all"
                    style={{ background: 'rgba(255,255,255,.05)' }}>
                    ⚙️ Edit Settings
                  </button>
                )}
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-red-400 mb-3">{error}</p>}

          {/* Tabs */}
          <div className="flex gap-0 border-b border-[#2E2820] mb-4">
            {(['posts', 'comments', 'saved'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="px-4 py-2.5 text-sm font-medium border-b-2 transition-all capitalize"
                style={{ color: tab === t ? '#F97316' : '#6B5A4A', borderColor: tab === t ? '#F97316' : 'transparent' }}>
                {t}{t === 'posts' ? ` (${posts.length})` : t === 'saved' ? ` (${savedPosts.length})` : ''}
              </button>
            ))}
          </div>

          {/* Posts tab */}
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

          {/* Comments tab */}
          {tab === 'comments' && (
            <div className="text-center py-12 text-[#6B5A4A]">Comments history coming soon 🔥</div>
          )}

          {/* Saved tab */}
          {tab === 'saved' && (
            <div className="flex flex-col gap-3">
              {!isOwnProfile ? (
                <div className="text-center py-12 text-[#6B5A4A]">Saved posts are private.</div>
              ) : savedPosts.length === 0 ? (
                <div className="text-center py-12 text-[#6B5A4A]">No saved posts yet 🔖</div>
              ) : savedPosts.map(post => (
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

        </div>
      </div>
    </div>
  )
}

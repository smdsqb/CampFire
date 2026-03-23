'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Send } from 'lucide-react'
import { db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { subscribeToComments, createComment, castVote } from '@/lib/db'
import { useAuth } from '@/lib/auth-context'
import { formatCount, timeAgo } from '@/lib/utils'
import CampfireScene from '@/components/layout/CampfireScene'
import type { Post, Comment } from '@/types'

export default function PostPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user } = useAuth()
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [upvotes, setUpvotes] = useState(0)
  const [downvotes, setDownvotes] = useState(0)
  const [voteState, setVoteState] = useState<1 | -1 | 0>(0)

  useEffect(() => {
    getDoc(doc(db, 'posts', id)).then(snap => {
      if (!snap.exists()) return
      const data = snap.data()
      const p: Post = {
        id: snap.id, title: data.title, body: data.body,
        campId: data.campId, campName: data.campName, campIcon: data.campIcon,
        authorId: data.authorId, authorName: data.authorName, authorAvatar: data.authorAvatar,
        upvotes: data.upvotes, downvotes: data.downvotes, commentCount: data.commentCount,
        createdAt: data.createdAt?.toDate() ?? new Date(),
        tags: data.tags ?? [], awards: data.awards ?? [],
      }
      setPost(p)
      setUpvotes(p.upvotes)
      setDownvotes(p.downvotes)
    })

    const unsub = subscribeToComments(id, setComments)
    return () => unsub()
  }, [id])

  async function handleVote(val: 1 | -1) {
    if (!user || !post) return
    const prev = voteState
    const next: 1 | -1 | 0 = prev === val ? 0 : val
    setVoteState(next)

    if (next === 0) {
      if (val === 1) setUpvotes(v => Math.max(0, v - 1))
      else setDownvotes(v => Math.max(0, v - 1))
    } else if (prev === 0) {
      if (val === 1) setUpvotes(v => v + 1)
      else setDownvotes(v => v + 1)
    } else if (prev === 1 && val === -1) {
      setUpvotes(v => Math.max(0, v - 1))
      setDownvotes(v => v + 1)
    } else if (prev === -1 && val === 1) {
      setDownvotes(v => Math.max(0, v - 1))
      setUpvotes(v => v + 1)
    }

    await castVote(post.id, user.uid, val)
  }

  async function handleComment() {
    if (!user || !body.trim()) return
    setLoading(true)
    await createComment({
      postId: id,
      authorId: user.uid,
      authorName: user.displayName ?? 'Anonymous',
      authorAvatar: user.photoURL ?? undefined,
      body: body.trim(),
    })
    setBody('')
    setLoading(false)
  }

  if (!post) return (
    <div className="relative w-full min-h-dvh overflow-hidden">
      <CampfireScene />
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="text-[#F97316] text-2xl animate-pulse">🔥</div>
      </div>
    </div>
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

          {/* Post */}
          <div className="rounded-2xl border border-[#2E2820] p-5 mb-4"
            style={{ background: 'rgba(18,14,10,.92)', backdropFilter: 'blur(16px)' }}>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full border border-[#3D3228]"
                style={{ background: 'rgba(255,255,255,.06)', color: '#F5EFE8' }}>
                {post.campIcon} {post.campName}
              </span>
              <span className="text-xs text-[#6B5A4A]">· u/{post.authorName} · {timeAgo(post.createdAt)}</span>
            </div>
            <h1 className="font-serif text-xl font-semibold text-[#F5EFE8] mb-3">{post.title}</h1>
            {post.body && <p className="text-sm text-[#A89880] leading-relaxed mb-4">{post.body}</p>}
            {post.tags?.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-4">
                {post.tags.map(tag => (
                  <span key={tag} className="text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: 'rgba(249,115,22,.1)', color: '#FDBA74' }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2 pt-3 border-t border-[#2E2820]">
              <div className="flex items-center rounded-full overflow-hidden border border-[#3D3228]"
                style={{ background: 'rgba(255,255,255,.05)' }}>
                <button onClick={() => handleVote(1)}
                  className="flex items-center gap-1.5 px-3 py-1.5 transition-all hover:bg-[rgba(249,115,22,.12)]">
                  <span style={{ color: voteState === 1 ? '#F97316' : '#6B5A4A' }}>▲</span>
                  <span className="text-xs font-bold" style={{ color: voteState === 1 ? '#F97316' : '#F5EFE8' }}>
                    {formatCount(upvotes)}
                  </span>
                </button>
                <div className="w-px h-5 bg-[#3D3228]" />
                <button onClick={() => handleVote(-1)}
                  className="flex items-center gap-1.5 px-3 py-1.5 transition-all hover:bg-[rgba(239,68,68,.12)]">
                  <span style={{ color: voteState === -1 ? '#EF4444' : '#6B5A4A' }}>▼</span>
                  <span className="text-xs font-bold" style={{ color: voteState === -1 ? '#EF4444' : '#F5EFE8' }}>
                    {formatCount(downvotes)}
                  </span>
                </button>
              </div>
              <span className="text-xs text-[#6B5A4A]">💬 {formatCount(post.commentCount)} comments</span>
            </div>
          </div>

          {/* Comment box */}
          {user ? (
            <div className="rounded-xl border border-[#2E2820] p-4 mb-4"
              style={{ background: 'rgba(18,14,10,.88)', backdropFilter: 'blur(12px)' }}>
              <textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="Share your thoughts around the fire..."
                rows={3}
                className="w-full bg-transparent text-sm text-[#F5EFE8] outline-none resize-none placeholder-[#6B5A4A] mb-3"
              />
              <div className="flex justify-end">
                <button onClick={handleComment} disabled={loading || !body.trim()}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg,#EA580C,#F97316)' }}>
                  <Send size={13} /> {loading ? 'Posting...' : 'Comment'}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-sm text-[#6B5A4A] mb-4">
              Sign in to join the conversation 🔥
            </div>
          )}

          {/* Comments */}
          <div className="flex flex-col gap-3">
            {comments.length === 0 ? (
              <div className="text-center py-8 text-[#6B5A4A]">No comments yet — be the first! 🔥</div>
            ) : comments.map(comment => (
              <div key={comment.id} className="rounded-xl border border-[#2E2820] p-4"
                style={{ background: 'rgba(18,14,10,.88)', backdropFilter: 'blur(12px)' }}>
                <div className="flex items-center gap-2 mb-2">
                  {comment.authorAvatar ? (
                    <img src={comment.authorAvatar} alt="" className="w-6 h-6 rounded-full" />
                  ) : (
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                      style={{ background: 'linear-gradient(135deg,#EA580C,#FBBF24)' }}>
                      {comment.authorName[0]}
                    </div>
                  )}
                  <span className="text-xs font-semibold text-[#F5EFE8]">{comment.authorName}</span>
                  <span className="text-xs text-[#6B5A4A]">· {timeAgo(comment.createdAt)}</span>
                </div>
                <p className="text-sm text-[#A89880] leading-relaxed">{comment.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

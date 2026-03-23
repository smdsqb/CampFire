'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MessageCircle, Share2, Bookmark, Star, X } from 'lucide-react'
import { formatCount, timeAgo } from '@/lib/utils'
import { castVote } from '@/lib/db'
import { useAuth } from '@/lib/auth-context'
import { db } from '@/lib/firebase'
import { doc, updateDoc, arrayUnion, addDoc, collection, getDoc, deleteDoc } from 'firebase/firestore'
import { serverTimestamp } from 'firebase/firestore'
import type { Post } from '@/types'

const AWARDS = [
  { type: 'onfire', icon: '🔥', label: 'On Fire',      desc: 'This post is trending!' },
  { type: 'spark',  icon: '✨', label: 'Spark',         desc: 'Great idea!' },
  { type: 'log',    icon: '🪵', label: 'Log',           desc: 'Solid contribution' },
  { type: 'star',   icon: '🌟', label: 'Campfire Star', desc: 'Community favourite' },
]

interface Props { post: Post }

export default function PostCard({ post }: Props) {
  const { user } = useAuth()
  const router = useRouter()
  const [upvotes,    setUpvotes]    = useState(post.upvotes)
  const [downvotes,  setDownvotes]  = useState(post.downvotes)
  const [voteState,  setVoteState]  = useState<1 | -1 | 0>(0)
  const [saved,      setSaved]      = useState(false)
  const [busy,       setBusy]       = useState(false)
  const [showAwards, setShowAwards] = useState(false)
  const [awarded,    setAwarded]    = useState(false)
  const [error,      setError]      = useState('')

  async function handleVote(val: 1 | -1) {
    if (!user || busy) return
    setError('')
    setBusy(true)
    const prevState = voteState
    const prevUp    = upvotes
    const prevDown  = downvotes
    const next: 1 | -1 | 0 = prevState === val ? 0 : val
    setVoteState(next)
    if (next === 0) {
      if (val === 1) setUpvotes(v => Math.max(0, v - 1))
      else setDownvotes(v => Math.max(0, v - 1))
    } else if (prevState === 0) {
      if (val === 1) setUpvotes(v => v + 1)
      else setDownvotes(v => v + 1)
    } else if (prevState === 1 && val === -1) {
      setUpvotes(v => Math.max(0, v - 1))
      setDownvotes(v => v + 1)
    } else if (prevState === -1 && val === 1) {
      setDownvotes(v => Math.max(0, v - 1))
      setUpvotes(v => v + 1)
    }
    try {
      await castVote(post.id, user.uid, val)
    } catch (e: any) {
      setVoteState(prevState)
      setUpvotes(prevUp)
      setDownvotes(prevDown)
      setError(e?.message ?? 'Could not update vote.')
    } finally {
      setBusy(false)
    }
  }

  async function handleSave() {
    if (!user) return
    setError('')
    try {
      const saveRef = doc(db, 'saves', `${user.uid}_${post.id}`)
      const existing = await getDoc(saveRef)
      if (existing.exists()) {
        await deleteDoc(saveRef)
        setSaved(false)
      } else {
        await addDoc(collection(db, 'saves'), {
          userId: user.uid, postId: post.id, savedAt: serverTimestamp()
        })
        setSaved(true)
      }
    } catch (e: any) {
      setError(e?.message ?? 'Could not save post.')
    }
  }

  async function handleAward(award: typeof AWARDS[0]) {
    if (!user) return
    await updateDoc(doc(db, 'posts', post.id), {
      awards: arrayUnion({
        type:      award.type,
        icon:      award.icon,
        label:     award.label,
        grantedBy: user.uid,
      })
    })
    setAwarded(true)
    setShowAwards(false)
  }

  async function handleReport() {
    if (!user) return
    const reason = window.prompt('Report reason (spam, abuse, etc):', 'spam')
    if (!reason?.trim()) return
    try {
      await addDoc(collection(db, 'reports'), {
        postId: post.id, userId: user.uid,
        reason: reason.trim(), createdAt: serverTimestamp()
      })
      alert('Reported! We\'ll look into it 🔥')
    } catch (e: any) {
      setError(e?.message ?? 'Could not submit report.')
    }
  }

  function handleShare() {
    navigator.clipboard.writeText(`https://campfires.vercel.app/post/${post.id}`)
    alert('Link copied! 🔥')
  }

  const ts = (post.createdAt as any)?.seconds
  const createdAt = post.createdAt instanceof Date ? post.createdAt : new Date((ts ?? 0) * 1000)

  return (
    <div
      className="rounded-xl overflow-hidden border border-[#2E2820] transition-colors hover:border-[#3D3228]"
      style={{ background: 'rgba(18,14,10,.88)', backdropFilter: 'blur(12px)', position: 'relative' }}
    >

      {/* Award modal */}
      {showAwards && (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-xl"
          style={{ background: 'rgba(0,0,0,.85)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-xs p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="font-serif text-base font-semibold text-[#F5EFE8]">Give an Award</div>
              <button onClick={() => setShowAwards(false)} className="text-[#6B5A4A] hover:text-[#F5EFE8]">
                <X size={16} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {AWARDS.map(award => (
                <button key={award.type} onClick={() => handleAward(award)}
                  className="flex flex-col items-center gap-1 p-3 rounded-xl border border-[#3D3228] hover:border-[#F97316] transition-all"
                  style={{ background: 'rgba(255,255,255,.05)' }}>
                  <span className="text-2xl">{award.icon}</span>
                  <span className="text-xs font-semibold text-[#F5EFE8]">{award.label}</span>
                  <span className="text-[10px] text-[#6B5A4A] text-center">{award.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex p-3 gap-3">
        <div className="w-[72px] h-[72px] rounded-lg flex items-center justify-center text-3xl flex-shrink-0 border border-[#2E2820]"
          style={{ background: 'rgba(255,255,255,.04)' }}>
          {post.campIcon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-2">
            <span
              onClick={() => router.push(`/camp/${post.campName}`)}
              className="flex items-center gap-1 text-[11px] font-semibold rounded-full px-2 py-0.5 border border-[#3D3228] cursor-pointer hover:border-[#F97316] transition-all"
              style={{ background: 'rgba(255,255,255,.06)', color: '#F5EFE8' }}>
              <span className="w-[18px] h-[18px] rounded flex items-center justify-center text-[10px]"
                style={{ background: 'rgba(249,115,22,.2)' }}>
                {post.campIcon}
              </span>
              {post.campName}
            </span>
            <span className="text-[11px] text-[#6B5A4A]">·</span>
            <span
              onClick={() => router.push(`/profile/${post.authorId}`)}
              className="text-[11px] text-[#6B5A4A] cursor-pointer hover:text-[#F97316] transition-colors">
              u/{post.authorName}
            </span>
            <span className="text-[11px] text-[#6B5A4A]">·</span>
            <span className="text-[11px] text-[#6B5A4A]">{timeAgo(createdAt)}</span>
            {post.awards?.map((a, i) => (
              <span key={i} className="text-[10px] font-semibold rounded-full px-2 py-0.5"
                style={{ background: 'rgba(251,191,36,.1)', border: '1px solid rgba(251,191,36,.25)', color: '#FDE68A' }}>
                {a.icon} {a.label}
              </span>
            ))}
          </div>

          <p
            onClick={() => router.push(`/post/${post.id}`)}
            className="font-serif text-[15px] font-semibold leading-snug mb-1 cursor-pointer text-[#F5EFE8] hover:text-[#F97316] transition-colors line-clamp-2">
            {post.title}
          </p>

          {post.body && (
            <p className="text-xs text-[#A89880] leading-relaxed line-clamp-2 mb-2">{post.body}</p>
          )}

          {post.tags?.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {post.tags.map(tag => (
                <span key={tag} className="text-[10px] font-semibold rounded-full px-2 py-0.5 cursor-pointer"
                  style={{ background: 'rgba(249,115,22,.1)', color: '#FDBA74' }}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 px-3 py-2 border-t border-[#2E2820]"
        style={{ background: 'rgba(0,0,0,.2)' }}>

        {/* Votes */}
        <div className="flex items-center rounded-full overflow-hidden border border-[#3D3228] mr-1"
          style={{ background: 'rgba(255,255,255,.05)' }}>
          <button onClick={() => handleVote(1)}
            className="flex items-center gap-1.5 px-3 py-1.5 transition-all hover:bg-[rgba(249,115,22,.12)]">
            <span className="text-sm leading-none" style={{ color: voteState === 1 ? '#F97316' : '#6B5A4A' }}>▲</span>
            <span className="text-xs font-bold" style={{ color: voteState === 1 ? '#F97316' : '#F5EFE8' }}>
              {formatCount(upvotes)}
            </span>
          </button>
          <div className="w-px h-5 bg-[#3D3228]" />
          <button onClick={() => handleVote(-1)}
            className="flex items-center gap-1.5 px-3 py-1.5 transition-all hover:bg-[rgba(239,68,68,.12)]">
            <span className="text-sm leading-none" style={{ color: voteState === -1 ? '#EF4444' : '#6B5A4A' }}>▼</span>
            <span className="text-xs font-bold" style={{ color: voteState === -1 ? '#EF4444' : '#F5EFE8' }}>
              {formatCount(downvotes)}
            </span>
          </button>
        </div>

        {/* Comments */}
        <button onClick={() => router.push(`/post/${post.id}`)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium text-[#A89880] hover:text-[#F5EFE8] transition-all border border-[#3D3228]"
          style={{ background: 'rgba(255,255,255,.05)' }}>
          <MessageCircle size={13} />{formatCount(post.commentCount)}
        </button>

        {/* Share */}
        <button onClick={handleShare}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium text-[#A89880] hover:text-[#F5EFE8] transition-all border border-[#3D3228]"
          style={{ background: 'rgba(255,255,255,.05)' }}>
          <Share2 size={13} />Share
        </button>

        {/* Save */}
        <button onClick={handleSave}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all border border-[#3D3228]"
          style={{
            background: saved ? 'rgba(249,115,22,.1)' : 'rgba(255,255,255,.05)',
            color: saved ? '#F97316' : '#A89880',
            borderColor: saved ? 'rgba(249,115,22,.3)' : '#3D3228',
          }}>
          <Bookmark size={13} />{saved ? 'Saved' : 'Save'}
        </button>

        {/* Award */}
        <button onClick={() => user ? setShowAwards(true) : alert('Sign in to give awards! 🔥')}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all border border-[#3D3228]"
          style={{
            background: awarded ? 'rgba(251,191,36,.1)' : 'rgba(255,255,255,.05)',
            color: awarded ? '#FDE68A' : '#A89880',
            borderColor: awarded ? 'rgba(251,191,36,.3)' : '#3D3228',
          }}>
          <Star size={13} />{awarded ? 'Awarded!' : 'Award'}
        </button>

        {/* Report */}
        <button onClick={handleReport}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium text-red-400/50 hover:text-red-400 transition-all border border-[#3D3228]"
          style={{ background: 'rgba(255,255,255,.05)' }}>
          🚩
        </button>
      </div>

      {error && <p className="px-3 pb-2 text-[11px] text-red-400">{error}</p>}
    </div>
  )
}

'use client'

import { useState } from 'react'
import { MessageCircle, Share2, Bookmark, Star } from 'lucide-react'
import { formatCount, timeAgo } from '@/lib/utils'
import { castVote } from '@/lib/db'
import { useAuth } from '@/lib/auth-context'
import type { Post } from '@/types'

interface Props { post: Post }

export default function PostCard({ post }: Props) {
  const { user } = useAuth()
  const [upvotes, setUpvotes] = useState(post.upvotes)
  const [downvotes, setDownvotes] = useState(post.downvotes)
  const [voteState, setVoteState] = useState<1 | -1 | 0>(0)

  async function handleVote(val: 1 | -1) {
    if (!user) return
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

  const ts = (post.createdAt as any)?.seconds
  const createdAt = post.createdAt instanceof Date ? post.createdAt : new Date((ts ?? 0) * 1000)

  return (
    <div className="rounded-xl overflow-hidden border border-[#2E2820] transition-colors hover:border-[#3D3228]"
      style={{ background: 'rgba(18,14,10,.88)', backdropFilter: 'blur(12px)' }}>

      <div className="flex p-3 gap-3">
        <div className="w-[72px] h-[72px] rounded-lg flex items-center justify-center text-3xl flex-shrink-0 border border-[#2E2820]"
          style={{ background: 'rgba(255,255,255,.04)' }}>
          {post.campIcon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-2">
            <span className="flex items-center gap-1 text-[11px] font-semibold rounded-full px-2 py-0.5 border border-[#3D3228]"
              style={{ background: 'rgba(255,255,255,.06)', color: '#F5EFE8' }}>
              <span className="w-[18px] h-[18px] rounded flex items-center justify-center text-[10px]"
                style={{ background: 'rgba(249,115,22,.2)' }}>
                {post.campIcon}
              </span>
              {post.campName}
            </span>
            <span className="text-[11px] text-[#6B5A4A]">·</span>
            <span className="text-[11px] text-[#6B5A4A]">u/{post.authorName}</span>
            <span className="text-[11px] text-[#6B5A4A]">·</span>
            <span className="text-[11px] text-[#6B5A4A]">{timeAgo(createdAt)}</span>
            {post.awards?.map((a, i) => (
              <span key={i} className="text-[10px] font-semibold rounded-full px-2 py-0.5"
                style={{ background: 'rgba(251,191,36,.1)', border: '1px solid rgba(251,191,36,.25)', color: '#FDE68A' }}>
                {a.icon} {a.label}
              </span>
            ))}
          </div>

          <p className="font-serif text-[15px] font-semibold leading-snug mb-1 cursor-pointer text-[#F5EFE8] hover:text-[#F97316] transition-colors line-clamp-2">
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
        <ActionBtn icon={<MessageCircle size={13} />} label={formatCount(post.commentCount)} />
        <ActionBtn icon={<Share2 size={13} />} label="Share" />
        <ActionBtn icon={<Bookmark size={13} />} label="Save" />
        <ActionBtn icon={<Star size={13} />} label="Award" />
      </div>
    </div>
  )
}

function ActionBtn({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium text-[#A89880] hover:text-[#F5EFE8] transition-all border border-[#3D3228]"
      style={{ background: 'rgba(255,255,255,.05)' }}>
      {icon}{label}
    </button>
  )
}

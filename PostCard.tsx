'use client'

import { useState } from 'react'
import { MessageCircle, Link, Bookmark, Star } from 'lucide-react'
import { formatCount, timeAgo } from '@/lib/utils'
import { castVote } from '@/lib/db'
import { useAuth } from '@/lib/auth-context'
import type { Post } from '@/types'

interface Props { post: Post; onClick?: () => void }

const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  default:     { bg: 'rgba(249,115,22,.12)',  text: '#FDBA74' },
  gaming:      { bg: 'rgba(59,130,246,.12)',  text: '#93C5FD' },
  programming: { bg: 'rgba(34,197,94,.12)',   text: '#86EFAC' },
  science:     { bg: 'rgba(139,92,246,.12)',  text: '#C4B5FD' },
  memes:       { bg: 'rgba(168,85,247,.12)',  text: '#D8B4FE' },
  football:    { bg: 'rgba(239,68,68,.12)',   text: '#FCA5A5' },
  music:       { bg: 'rgba(236,72,153,.12)',  text: '#F9A8D4' },
  photography: { bg: 'rgba(20,184,166,.12)',  text: '#5EEAD4' },
  tvshows:     { bg: 'rgba(234,179,8,.12)',   text: '#FDE68A' },
  food:        { bg: 'rgba(249,115,22,.12)',  text: '#FDBA74' },
}

const CAMP_ICONS: Record<string, { bg: string; icon: string }> = {
  gaming:      { bg: 'rgba(59,130,246,.2)',  icon: '🎮' },
  programming: { bg: 'rgba(34,197,94,.2)',   icon: '💻' },
  memes:       { bg: 'rgba(168,85,247,.2)',  icon: '😂' },
  football:    { bg: 'rgba(239,68,68,.2)',   icon: '⚽' },
  music:       { bg: 'rgba(236,72,153,.2)',  icon: '🎵' },
  photography: { bg: 'rgba(20,184,166,.2)',  icon: '📸' },
  science:     { bg: 'rgba(139,92,246,.2)',  icon: '🧠' },
  tvshows:     { bg: 'rgba(234,179,8,.2)',   icon: '📺' },
  food:        { bg: 'rgba(249,115,22,.2)',  icon: '🍔' },
}

const AWARD_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  ember:   { bg: 'rgba(251,191,36,.1)',  border: 'rgba(251,191,36,.25)', text: '#FDE68A' },
  onfire:  { bg: 'rgba(249,115,22,.1)',  border: 'rgba(249,115,22,.25)', text: '#FDBA74' },
  spark:   { bg: 'rgba(139,92,246,.1)',  border: 'rgba(139,92,246,.25)', text: '#C4B5FD' },
}

export default function PostCard({ post, onClick }: Props) {
  const { user } = useAuth()
  const [upvotes,   setUpvotes]   = useState(post.upvotes)
  const [userVote,  setUserVote]  = useState<1 | -1 | 0>(0)
  const [saved,     setSaved]     = useState(false)

  const campStyle  = CAMP_ICONS[post.campName]  ?? { bg: 'rgba(249,115,22,.2)', icon: '🔥' }
  const tagPalette = TAG_COLORS[post.campName]  ?? TAG_COLORS.default

  async function handleVote(val: 1 | -1) {
    if (!user) return
    const prev = userVote
    const delta = val === prev ? -val : val - prev
    setUpvotes(v => v + delta)
    setUserVote(val === prev ? 0 : val)
    await castVote(post.id, user.uid, val)
  }

  const createdAt = post.createdAt instanceof Date
    ? post.createdAt
    : (post.createdAt as any)?.toDate?.() ?? new Date()

  return (
    <div
      className="glass-light border border-[#2E2820] rounded-xl overflow-hidden transition-all hover:border-[#3D3228] cursor-pointer"
      onClick={onClick}
    >
      {/* Top */}
      <div className="flex p-3">
        {/* Thumbnail */}
        <div className="w-[72px] h-[72px] rounded-lg flex items-center justify-center text-[30px] flex-shrink-0 mr-3 border border-[#2E2820]"
          style={{ background: 'rgba(255,255,255,.04)' }}>
          {post.imageUrl
            ? <img src={post.imageUrl} alt="" className="w-full h-full object-cover rounded-lg" />
            : campStyle.icon
          }
        </div>

        <div className="flex-1 min-w-0">
          {/* Meta */}
          <div className="flex items-center gap-2 text-[11px] text-[#6B5A4A] mb-2 flex-wrap">
            <div className="flex items-center gap-1 rounded-full px-2 py-0.5 border border-[#3D3228]"
              style={{ background: 'rgba(255,255,255,.06)' }}>
              <div className="w-[18px] h-[18px] rounded-md flex items-center justify-center text-[10px]"
                style={{ background: campStyle.bg }}>
                {campStyle.icon}
              </div>
              <span className="text-[11px] font-semibold text-[#F5EFE8]">c/{post.campName}</span>
            </div>
            <span>·</span>
            <span>u/{post.authorName}</span>
            <span>·</span>
            <span>{timeAgo(createdAt)}</span>

            {post.awards.map((a, i) => {
              const s = AWARD_STYLES[a.type] ?? AWARD_STYLES.ember
              return (
                <span key={i} className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border"
                  style={{ background: s.bg, borderColor: s.border, color: s.text }}>
                  {a.icon} {a.label}
                </span>
              )
            })}
          </div>

          {/* Title */}
          <div className="font-serif text-[15px] font-semibold text-[#F5EFE8] leading-snug mb-2 hover:text-[#F97316] transition-colors">
            {post.title}
          </div>

          {/* Snippet */}
          {post.body && (
            <p className="text-xs text-[#A89880] leading-relaxed mb-2 line-clamp-2">
              {post.body}
            </p>
          )}

          {/* Tags */}
          {post.tags?.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {post.tags.map(tag => (
                <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                  style={{ background: tagPalette.bg, color: tagPalette.text }}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom actions */}
      <div
        className="flex items-center gap-1 px-3 py-2 border-t border-[#2E2820]"
        style={{ background: 'rgba(0,0,0,.2)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Vote pill */}
        <div className="flex items-center rounded-full overflow-hidden mr-1 border border-[#3D3228]"
          style={{ background: 'rgba(255,255,255,.05)' }}>
          <button
            onClick={() => handleVote(1)}
            className="flex items-center gap-1 px-3 py-1 text-xs font-bold transition-all"
            style={{ color: userVote === 1 ? '#F97316' : '#6B5A4A', background: userVote === 1 ? 'rgba(249,115,22,.15)' : 'transparent' }}
          >
            <span className="text-sm leading-none">▲</span>
            <span style={{ color: userVote === 1 ? '#F97316' : '#F5EFE8' }}>{formatCount(upvotes)}</span>
          </button>
          <div className="w-px h-5 bg-[#3D3228]" />
          <button
            onClick={() => handleVote(-1)}
            className="flex items-center px-2 py-1 text-sm leading-none transition-all"
            style={{ color: userVote === -1 ? '#EF4444' : '#6B5A4A', background: userVote === -1 ? 'rgba(239,68,68,.15)' : 'transparent' }}
          >
            ▼
          </button>
        </div>

        <ActionBtn icon={<MessageCircle size={13} />} label={formatCount(post.commentCount)} />
        <ActionBtn icon={<Link size={13} />} label="Share" />
        <ActionBtn
          icon={<Bookmark size={13} fill={saved ? '#F97316' : 'none'} />}
          label="Save"
          active={saved}
          onClick={() => setSaved(s => !s)}
        />
        <ActionBtn icon={<Star size={13} />} label="Award" />
      </div>
    </div>
  )
}

function ActionBtn({ icon, label, active, onClick }: {
  icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all border border-[#3D3228] hover:text-[#F5EFE8]"
      style={{ background: 'rgba(255,255,255,.05)', color: active ? '#F97316' : '#A89880' }}
    >
      {icon} {label}
    </button>
  )
}

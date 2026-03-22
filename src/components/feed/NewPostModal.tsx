'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { createPost } from '@/lib/db'
import { useAuth } from '@/lib/auth-context'
import { SEED_CAMPS } from '@/lib/utils'

interface Props { campId: string | null; campName: string | null; onClose: () => void }

export default function NewPostModal({ campId, campName, onClose }: Props) {
  const { user } = useAuth()
  const [title,   setTitle]   = useState('')
  const [body,    setBody]    = useState('')
  const [tags,    setTags]    = useState('')
  const [selCamp, setSelCamp] = useState(campName ?? SEED_CAMPS[0].name)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  async function handleSubmit() {
    if (!user)         return setError('You must be signed in to post.')
    if (!title.trim()) return setError('Title is required.')
    setLoading(true)
    try {
      const camp = SEED_CAMPS.find(c => c.name === selCamp)!
      await createPost({
        title:        title.trim(),
        body:         body.trim(),
        campId:       campId ?? selCamp,
        campName:     selCamp,
        campIcon:     camp.icon,
        authorId:     user.id,
        authorName:   user.user_metadata?.full_name ?? 'Anonymous',
        authorAvatar: user.user_metadata?.avatar_url ?? undefined,
        tags:         tags.split(',').map(t => t.trim()).filter(Boolean),
      })
      onClose()
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-[#3D3228] p-6 flex flex-col gap-4"
        style={{ background: '#1A1410' }}
        onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between">
          <div className="font-serif text-lg font-semibold text-[#F5EFE8]">🔥 Share with the camp</div>
          <button onClick={onClose} className="text-[#6B5A4A] hover:text-[#F5EFE8]"><X size={18} /></button>
        </div>

        {!campName && (
          <div>
            <label className="text-xs text-[#6B5A4A] mb-1 block">Camp</label>
            <select value={selCamp} onChange={e => setSelCamp(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-sm text-[#F5EFE8] border border-[#3D3228] outline-none"
              style={{ background: '#262019' }}>
              {SEED_CAMPS.map(c => <option key={c.name} value={c.name}>{c.icon} c/{c.name}</option>)}
            </select>
          </div>
        )}

        <div>
          <label className="text-xs text-[#6B5A4A] mb-1 block">Title *</label>
          <input value={title} onChange={e => setTitle(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full rounded-lg px-3 py-2 text-sm text-[#F5EFE8] border border-[#3D3228] outline-none focus:border-[#F97316] transition-colors"
            style={{ background: '#262019' }} />
        </div>

        <div>
          <label className="text-xs text-[#6B5A4A] mb-1 block">Body (optional)</label>
          <textarea value={body} onChange={e => setBody(e.target.value)}
            placeholder="Share more details..." rows={4}
            className="w-full rounded-lg px-3 py-2 text-sm text-[#F5EFE8] border border-[#3D3228] outline-none focus:border-[#F97316] transition-colors resize-none"
            style={{ background: '#262019' }} />
        </div>

        <div>
          <label className="text-xs text-[#6B5A4A] mb-1 block">Tags (comma separated)</label>
          <input value={tags} onChange={e => setTags(e.target.value)}
            placeholder="discussion, news, hot take"
            className="w-full rounded-lg px-3 py-2 text-sm text-[#F5EFE8] border border-[#3D3228] outline-none focus:border-[#F97316] transition-colors"
            style={{ background: '#262019' }} />
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <div className="flex justify-end gap-2">
          <button onClick={onClose}
            className="px-4 py-2 text-sm rounded-full text-[#A89880] border border-[#3D3228]"
            style={{ background: 'rgba(255,255,255,.05)' }}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className="px-5 py-2 text-sm font-semibold text-white rounded-full disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg,#EA580C,#F97316)' }}>
            {loading ? 'Posting...' : '🔥 Post it'}
          </button>
        </div>
      </div>
    </div>
  )
}

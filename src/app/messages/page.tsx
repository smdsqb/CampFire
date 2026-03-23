'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Send } from 'lucide-react'
import CampfireScene from '@/components/layout/CampfireScene'
import { useAuth } from '@/lib/auth-context'
import { getOrCreateConversation, sendMessage, subscribeConversations, subscribeMessages } from '@/lib/db'
import { timeAgo } from '@/lib/utils'
import type { ChatMessage, Conversation } from '@/types'

export default function MessagesPage() {
    const router = useRouter()
    const { user } = useAuth()
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [targetUid, setTargetUid] = useState('')
    const [text, setText] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (!user) return
        const unsub = subscribeConversations(user.uid, setConversations)
        return () => unsub()
    }, [user])

    useEffect(() => {
        if (!activeConversationId) {
            setMessages([])
            return
        }
        const unsub = subscribeMessages(activeConversationId, setMessages)
        return () => unsub()
    }, [activeConversationId])

    const activeConversation = useMemo(
        () => conversations.find(c => c.id === activeConversationId) ?? null,
        [conversations, activeConversationId],
    )

    async function startConversation() {
        if (!user || !targetUid.trim()) return
        setError('')
        try {
            const convId = await getOrCreateConversation(user.uid, targetUid.trim(), user.displayName ?? 'You', targetUid.trim())
            setActiveConversationId(convId)
        } catch (e: any) {
            setError(e?.message ?? 'Could not start conversation.')
        }
    }

    async function handleSend() {
        if (!user || !activeConversationId || !text.trim()) return
        setLoading(true)
        setError('')
        try {
            await sendMessage(activeConversationId, user.uid, user.displayName ?? 'Anonymous', text.trim())
            setText('')
        } catch (e: any) {
            setError(e?.message ?? 'Message failed to send.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="relative w-full min-h-dvh overflow-hidden">
            <CampfireScene />
            <div className="relative z-10 h-full overflow-y-auto touch-scroll safe-top">
                <div className="max-w-4xl mx-auto px-4 py-6">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-[#A89880] hover:text-[#F97316] mb-6 transition-colors"
                    >
                        <ArrowLeft size={16} /> Back
                    </button>

                    <div className="font-serif text-2xl font-semibold text-[#F5EFE8] mb-4">💬 Messages</div>

                    {!user ? (
                        <div className="text-sm text-[#A89880]">Sign in to use messaging.</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-4">
                            <div className="rounded-xl border border-[#2E2820] p-3" style={{ background: 'rgba(18,14,10,.88)' }}>
                                <div className="text-xs font-semibold tracking-widest uppercase text-[#6B5A4A] mb-2">Start chat</div>
                                <div className="flex gap-2 mb-3">
                                    <input
                                        value={targetUid}
                                        onChange={e => setTargetUid(e.target.value)}
                                        placeholder="Enter user ID"
                                        className="flex-1 rounded-lg px-3 py-2 text-sm text-[#F5EFE8] border border-[#3D3228] outline-none"
                                        style={{ background: '#262019' }}
                                    />
                                    <button
                                        onClick={startConversation}
                                        className="px-3 py-2 rounded-lg text-xs font-semibold text-white"
                                        style={{ background: 'linear-gradient(135deg,#EA580C,#F97316)' }}
                                    >
                                        Start
                                    </button>
                                </div>

                                <div className="text-xs font-semibold tracking-widest uppercase text-[#6B5A4A] mb-2">Conversations</div>
                                <div className="space-y-1 max-h-[55vh] overflow-y-auto touch-scroll">
                                    {conversations.map(conv => {
                                        const other = conv.members.find(m => m !== user.uid) ?? 'Unknown'
                                        return (
                                            <button
                                                key={conv.id}
                                                onClick={() => setActiveConversationId(conv.id)}
                                                className="w-full text-left rounded-lg px-3 py-2 border border-[#2E2820]"
                                                style={{
                                                    background: activeConversationId === conv.id ? 'rgba(249,115,22,.12)' : 'rgba(255,255,255,.03)',
                                                }}
                                            >
                                                <div className="text-xs font-semibold text-[#F5EFE8] truncate">{conv.memberNames?.[other] ?? other}</div>
                                                <div className="text-[10px] text-[#6B5A4A] truncate">{conv.lastMessage || 'No messages yet'}</div>
                                            </button>
                                        )
                                    })}
                                    {conversations.length === 0 && <div className="text-xs text-[#6B5A4A]">No conversations yet.</div>}
                                </div>
                            </div>

                            <div className="rounded-xl border border-[#2E2820] p-3 flex flex-col" style={{ background: 'rgba(18,14,10,.88)' }}>
                                <div className="text-xs font-semibold tracking-widest uppercase text-[#6B5A4A] mb-2">
                                    {activeConversation ? 'Chat' : 'Select a conversation'}
                                </div>

                                <div className="flex-1 min-h-[320px] max-h-[55vh] overflow-y-auto touch-scroll space-y-2 pr-1">
                                    {messages.map(msg => (
                                        <div key={msg.id} className="rounded-lg border border-[#2E2820] px-3 py-2" style={{ background: 'rgba(255,255,255,.03)' }}>
                                            <div className="text-[10px] text-[#6B5A4A]">{msg.senderName} · {timeAgo(msg.createdAt)}</div>
                                            <div className="text-sm text-[#F5EFE8] mt-1 whitespace-pre-wrap">{msg.body}</div>
                                        </div>
                                    ))}
                                    {activeConversationId && messages.length === 0 && <div className="text-xs text-[#6B5A4A]">No messages yet.</div>}
                                </div>

                                <div className="mt-3 flex gap-2">
                                    <input
                                        value={text}
                                        onChange={e => setText(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                                        placeholder="Type a message..."
                                        className="flex-1 rounded-lg px-3 py-2 text-sm text-[#F5EFE8] border border-[#3D3228] outline-none"
                                        style={{ background: '#262019' }}
                                    />
                                    <button
                                        onClick={handleSend}
                                        disabled={loading || !activeConversationId || !text.trim()}
                                        className="px-3 py-2 rounded-lg text-white disabled:opacity-60"
                                        style={{ background: 'linear-gradient(135deg,#EA580C,#F97316)' }}
                                    >
                                        <Send size={14} />
                                    </button>
                                </div>

                                {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

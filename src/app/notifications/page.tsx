'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Bell } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { markNotificationRead, subscribeToNotifications } from '@/lib/db'
import { timeAgo } from '@/lib/utils'
import CampfireScene from '@/components/layout/CampfireScene'
import type { AppNotification } from '@/types'

export default function NotificationsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [items, setItems] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      setItems([])
      return
    }

    const unsub = subscribeToNotifications(user.uid, (data) => {
      setItems(data)
      setLoading(false)
    })

    return () => unsub()
  }, [user])

  return (
    <div className="relative w-full min-h-dvh overflow-hidden">
      <CampfireScene />
      <div className="relative z-10 h-full overflow-y-auto touch-scroll safe-top">
        <div className="max-w-xl mx-auto px-4 py-6">

          <button onClick={() => router.back()}
            className="flex items-center gap-2 text-[#A89880] hover:text-[#F97316] mb-6 transition-colors">
            <ArrowLeft size={16} /> Back
          </button>

          <div className="font-serif text-2xl font-semibold text-[#F5EFE8] mb-6">🔔 Notifications</div>

          <div className="rounded-xl border border-[#2E2820] overflow-hidden"
            style={{ background: 'rgba(18,14,10,.88)', backdropFilter: 'blur(12px)' }}>
            {loading ? (
              <div className="text-center py-12 text-[#F97316] animate-pulse">🔥 Loading notifications...</div>
            ) : !user ? (
              <div className="text-center py-12 text-[#6B5A4A]">Sign in to view notifications.</div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Bell size={40} className="text-[#3D3228]" />
                <div className="font-serif text-lg text-[#F5EFE8]">No notifications yet</div>
                <p className="text-sm text-[#6B5A4A] text-center max-w-xs">
                  When someone replies to your posts or upvotes your content, you&apos;ll see it here 🔥
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#2E2820]">
                {items.map(item => (
                  <button
                    key={item.id}
                    onClick={async () => {
                      if (!item.isRead) await markNotificationRead(item.id)
                      if (item.postId) router.push(`/post/${item.postId}`)
                    }}
                    className="w-full text-left p-4 hover:bg-[rgba(255,255,255,.03)] transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold text-[#F5EFE8]">{item.title}</div>
                      {!item.isRead && <span className="inline-block w-2 h-2 rounded-full bg-[#F97316]" />}
                    </div>
                    <div className="text-xs text-[#A89880] mt-1">{item.body}</div>
                    <div className="text-[10px] text-[#6B5A4A] mt-2">{timeAgo(item.createdAt)}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

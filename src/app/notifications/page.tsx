'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, Bell } from 'lucide-react'
import CampfireScene from '@/components/layout/CampfireScene'

export default function NotificationsPage() {
  const router = useRouter()

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
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Bell size={40} className="text-[#3D3228]" />
              <div className="font-serif text-lg text-[#F5EFE8]">No notifications yet</div>
              <p className="text-sm text-[#6B5A4A] text-center max-w-xs">
                When someone replies to your posts or upvotes your content, you'll see it here 🔥
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

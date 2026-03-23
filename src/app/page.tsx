'use client'

import { useEffect, useState } from 'react'
import CampfireScene from '@/components/layout/CampfireScene'
import Sidebar from '@/components/layout/Sidebar'
import CampList from '@/components/layout/CampList'
import Feed from '@/components/feed/Feed'
import RightPanel from '@/components/layout/RightPanel'
import { getCamps, subscribeToPosts } from '@/lib/db'
import type { Camp, Post } from '@/types'

export default function HomePage() {
  const [camps, setCamps] = useState<Camp[]>([])
  const [activeCamp, setActiveCamp] = useState<string | null>(null)
  const [trending, setTrending] = useState<Post[]>([])
  const [navActive, setNavActive] = useState('Home')
  const [onlineCount, setOnlineCount] = useState(1)

  useEffect(() => {
    getCamps().then(setCamps)
  }, [])

  useEffect(() => {
    const unsub = subscribeToPosts(null, 'hot', (posts) => setTrending(posts.slice(0, 4)))
    return () => unsub()
  }, [])

  const activeCampObj = camps.find((c) => c.name === activeCamp) ?? null

  return (
    <div className="relative w-full min-h-dvh overflow-hidden">
      <CampfireScene />
      <div className="relative z-10 safe-top flex h-full flex-col pb-[calc(4rem+env(safe-area-inset-bottom))] md:flex-row md:pb-0">
        <Sidebar active={navActive} onNav={setNavActive} />
        <CampList camps={camps} activeCamp={activeCamp} onSelect={setActiveCamp} onlineCount={onlineCount} />
        <Feed campId={activeCampObj?.id ?? null} campName={activeCamp} />
        <div className="hidden lg:block">
          <RightPanel trending={trending} onOnlineCount={setOnlineCount} />
        </div>
      </div>
      <a href="/privacy" className="fixed right-3 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] md:bottom-3 text-[10px] text-[#6B5A4A] hover:text-[#F97316] z-50">
        Privacy Policy
      </a>
    </div>
  )
}

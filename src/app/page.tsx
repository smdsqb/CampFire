'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import dynamic from 'next/dynamic'
const CampfireScene = dynamic(() => import('@/components/layout/CampfireScene'), { ssr: false })
import Sidebar from '@/components/layout/Sidebar'
import CampList from '@/components/layout/CampList'
import Feed from '@/components/feed/Feed'
import { getCamps, subscribeToPosts } from '@/lib/db'
import type { Camp, Post } from '@/types'

const RightPanel = dynamic(() => import('@/components/layout/RightPanel'), { ssr: false })

export default function HomePage() {
  const [camps, setCamps] = useState<Camp[]>([])
  const [activeCamp, setActiveCamp] = useState<string | null>(null)
  const [trending, setTrending] = useState<Post[]>([])
  const [navActive, setNavActive] = useState('Home')
  const [onlineCount, setOnlineCount] = useState(1)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    getCamps().then(setCamps)
  }, [])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)')
    const updateDesktop = () => setIsDesktop(mediaQuery.matches)

    updateDesktop()
    mediaQuery.addEventListener('change', updateDesktop)

    return () => mediaQuery.removeEventListener('change', updateDesktop)
  }, [])

  useEffect(() => {
    if (!isDesktop) {
      setTrending([])
      return
    }

    const unsub = subscribeToPosts(null, 'hot', (posts) => setTrending(posts.slice(0, 4)))
    return () => unsub()
  }, [isDesktop])

  const activeCampObj = camps.find((c) => c.name === activeCamp) ?? null

  return (
    <div className="relative w-full min-h-dvh overflow-hidden">
      <CampfireScene />
      <div className="relative z-10 safe-top flex h-full flex-col pb-[calc(4rem+env(safe-area-inset-bottom))] md:flex-row md:pb-0">
        <Sidebar active={navActive} onNav={setNavActive} />
        <CampList camps={camps} activeCamp={activeCamp} onSelect={setActiveCamp} onlineCount={onlineCount} />
        <Feed campId={activeCampObj?.id ?? null} campName={activeCamp} />
        <div className="hidden lg:block">
          {isDesktop && <RightPanel trending={trending} onOnlineCount={setOnlineCount} />}
        </div>
      </div>
      <a href="/privacy" className="fixed right-3 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] md:bottom-3 text-[10px] text-[#6B5A4A] hover:text-[#F97316] z-50">
        Privacy Policy
      </a>
    </div>
  )
}

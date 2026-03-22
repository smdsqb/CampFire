'use client'

import { useEffect, useState } from 'react'
import CampfireScene from '@/components/layout/CampfireScene'
import Sidebar       from '@/components/layout/Sidebar'
import CampList      from '@/components/layout/CampList'
import Feed          from '@/components/feed/Feed'
import RightPanel    from '@/components/layout/RightPanel'
import { getCamps }  from '@/lib/db'
import { subscribeToPosts } from '@/lib/db'
import { supabase } from '@/lib/supabase'
import type { Camp, Post } from '@/types'

export default function HomePage() {
  const [camps,      setCamps]      = useState<Camp[]>([])
  const [activeCamp, setActiveCamp] = useState<string | null>(null)
  const [trending,   setTrending]   = useState<Post[]>([])
  const [navActive,  setNavActive]  = useState('Home')

  useEffect(() => {
    if (window.location.hash && window.location.hash.includes('access_token')) {
      supabase.auth.getSession().then(() => {
        window.history.replaceState(null, '', window.location.pathname)
      })
    }
  }, [])

  useEffect(() => {
    getCamps().then(setCamps)
  }, [])

  useEffect(() => {
    const unsub = subscribeToPosts(null, 'hot', posts => setTrending(posts.slice(0, 4)))
    return () => unsub()
  }, [])

  const activeCampObj = camps.find(c => c.name === activeCamp) ?? null

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <CampfireScene />
      <div className="relative z-10 flex h-full">
        <Sidebar active={navActive} onNav={setNavActive} />
        <CampList camps={camps} activeCamp={activeCamp} onSelect={setActiveCamp} />
        <Feed campId={activeCampObj?.id ?? null} campName={activeCamp} />
        <RightPanel trending={trending} />
      </div>
      
        href="/privacy"
        className="fixed bottom-3 right-3 text-[10px] text-[#6B5A4A] hover:text-[#F97316] z-50"
      >
        Privacy Policy
      </a>
    </div>
  )
}

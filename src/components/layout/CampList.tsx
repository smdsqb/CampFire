'use client'

import { Search } from 'lucide-react'
import { formatCount } from '@/lib/utils'
import { SEED_CAMPS } from '@/lib/utils'
import type { Camp } from '@/types'

interface Props {
  camps: Camp[]
  activeCamp: string | null
  onSelect: (campName: string | null) => void
  onlineCount: number
}

export default function CampList({ camps, activeCamp, onSelect, onlineCount }: Props) {

export default function CampList({ camps, activeCamp, onSelect }: Props) {
  const list = camps.length > 0
    ? camps
    : SEED_CAMPS.map((c, i) => ({ ...c, id: String(i), createdAt: new Date(), createdBy: '' }))

  return (
    <div className="flex flex-col w-[200px] border-r border-[#2E2820] overflow-hidden flex-shrink-0 glass">

      <div className="px-3 pt-4 pb-3 border-b border-[#2E2820]">
        <div className="font-serif text-base font-semibold text-[#F5EFE8]">🔥 CampFire</div>
        <div className="text-[11px] text-[#6B5A4A] mt-1 flex items-center gap-1">
          <span className="inline-block w-[6px] h-[6px] rounded-full bg-green-500" style={{ boxShadow: '0 0 6px #22C55E' }} />
          {onlineCount.toLocaleString()} online
        </div>
      </div>

      <div className="mx-2 mt-2 flex items-center gap-2 rounded-full px-3 py-2 text-xs text-[#6B5A4A] border border-[#2E2820]"
        style={{ background: 'rgba(255,255,255,.04)' }}>
        <Search size={12} />
        <span>Search camps...</span>
      </div>

      <div className="px-3 pt-3 pb-1 text-[10px] font-semibold tracking-widest text-[#6B5A4A] uppercase">My Camps</div>

      <div className="flex-1 overflow-y-auto">
        <CampItem name="Home Feed" icon="🌍" color="rgba(249,115,22,.15)" active={activeCamp === null} onClick={() => onSelect(null)} />

        {list.slice(0, 7).map(camp => (
          <CampItem
            key={camp.id}
            name={camp.displayName}
            icon={camp.icon}
            color={camp.color}
            members={camp.memberCount}
            active={activeCamp === camp.name}
            onClick={() => onSelect(camp.name)}
          />
        ))}

        <div className="px-3 pt-3 pb-1 text-[10px] font-semibold tracking-widest text-[#6B5A4A] uppercase">Explore</div>

        {list.slice(7).map(camp => (
          <CampItem
            key={camp.id}
            name={camp.displayName}
            icon={camp.icon}
            color={camp.color}
            active={activeCamp === camp.name}
            onClick={() => onSelect(camp.name)}
          />
        ))}
      </div>
    </div>
  )
}

function CampItem({ name, icon, color, members, active, onClick }: {
  name: string; icon: string; color: string
  members?: number; active: boolean; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="relative flex items-center gap-2 w-full px-3 py-2 text-left transition-all"
      style={{ background: active ? 'rgba(249,115,22,.1)' : 'transparent' }}
    >
      {active && (
        <div className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r" style={{ background: '#F97316' }} />
      )}
      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0" style={{ background: color }}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-xs font-medium truncate" style={{ color: active ? '#F97316' : '#F5EFE8' }}>{name}</div>
        {members && <div className="text-[10px] text-[#6B5A4A]">{formatCount(members)} members</div>}
      </div>
    </button>
  )
}

'use client'

import { Home, Compass, MessageCircle, Bell, Settings } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { getInitials } from '@/lib/utils'

const NAV = [
  { icon: Home,          label: 'Home'     },
  { icon: Compass,       label: 'Discover' },
  { icon: MessageCircle, label: 'Messages' },
  { icon: Bell,          label: 'Alerts'   },
]

interface Props { active: string; onNav: (label: string) => void }

export default function Sidebar({ active, onNav }: Props) {
  const { user, signInWithGoogle, signOut } = useAuth()

  return (
    <div className="flex flex-col items-center w-[62px] py-3 gap-2 border-r border-[#2E2820] flex-shrink-0"
      style={{ background: 'rgba(10,8,5,.88)', backdropFilter: 'blur(16px)' }}>

      <div className="w-[42px] h-[42px] rounded-[13px] flex items-center justify-center text-[22px] mb-2 flex-shrink-0"
        style={{ background: 'linear-gradient(135deg,#EA580C,#F97316,#FBBF24)', boxShadow: '0 0 20px rgba(249,115,22,.4)' }}>
        🔥
      </div>

      {NAV.map(({ icon: Icon, label }) => (
        <button
          key={label}
          onClick={() => onNav(label)}
          title={label}
          className="w-[42px] h-[42px] rounded-xl flex items-center justify-center transition-all"
          style={{
            background: active === label ? 'rgba(249,115,22,.15)' : 'transparent',
            color:      active === label ? '#F97316'               : '#6B5A4A',
          }}
        >
          <Icon size={18} />
        </button>
      ))}

      <div className="w-[30px] h-px my-1" style={{ background: '#2E2820' }} />

      <button
        title="Settings"
        className="w-[42px] h-[42px] rounded-xl flex items-center justify-center transition-all"
        style={{ color: '#6B5A4A' }}
      >
        <Settings size={18} />
      </button>

      <div className="mt-auto mb-2">
        {user ? (
          <button
            onClick={signOut}
            title="Sign out"
            className="w-[36px] h-[36px] rounded-full flex items-center justify-center text-xs font-semibold text-white overflow-hidden"
            style={{ background: 'linear-gradient(135deg,#EA580C,#FBBF24)' }}
          >
            {user.user_metadata?.avatar_url
              ? <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover" />
              : getInitials(user.user_metadata?.full_name ?? null)
            }
          </button>
        ) : (
          <button
            onClick={signInWithGoogle}
            title="Sign in"
            className="w-[36px] h-[36px] rounded-full flex items-center justify-center text-xs font-semibold text-white"
            style={{ background: 'linear-gradient(135deg,#EA580C,#FBBF24)' }}
          >
            ?
          </button>
        )}
      </div>
    </div>
  )
}

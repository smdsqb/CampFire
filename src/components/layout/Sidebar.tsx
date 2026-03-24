'use client'

import { useRouter } from 'next/navigation'
import { Home, Compass, MessageCircle, Bell, Settings, LogIn } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { getInitials } from '@/lib/utils'

const NAV = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Compass, label: 'Discover', path: '/discover' },
  { icon: MessageCircle, label: 'Messages', path: '/messages' },
  { icon: Bell, label: 'Alerts', path: '/notifications' },
]

interface Props { active: string; onNav: (label: string) => void }

export default function Sidebar({ active, onNav }: Props) {
  const { user, signOut } = useAuth()
  const router = useRouter()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex h-[calc(3.5rem+env(safe-area-inset-bottom))] items-center justify-around border-t border-[#2E2820] px-2 pb-[env(safe-area-inset-bottom)] md:relative md:left-auto md:right-auto md:bottom-auto md:h-auto md:w-[62px] md:flex-col md:justify-start md:py-3 md:gap-2 md:border-t-0 md:border-r md:px-0 md:pb-0 md:flex-shrink-0"
      style={{ background: 'rgba(10,8,5,.92)', backdropFilter: 'blur(16px)' }}>

      {/* Logo — desktop only */}
      <div
        onClick={() => router.push('/')}
        className="hidden w-[42px] h-[42px] rounded-[13px] items-center justify-center text-[22px] mb-2 flex-shrink-0 cursor-pointer md:flex"
        style={{ background: 'linear-gradient(135deg,#EA580C,#F97316,#FBBF24)', boxShadow: '0 0 20px rgba(249,115,22,.4)' }}>
        🔥
      </div>

      {NAV.map(({ icon: Icon, label, path }) => (
        <button
          key={label}
          onClick={() => { onNav(label); router.push(path) }}
          title={label}
          className="h-11 w-11 rounded-xl flex items-center justify-center transition-all md:w-[42px] md:h-[42px]"
          style={{
            background: active === label ? 'rgba(249,115,22,.15)' : 'transparent',
            color: active === label ? '#F97316' : '#6B5A4A',
          }}
        >
          <Icon size={18} />
        </button>
      ))}

      <div className="hidden w-[30px] h-px my-1 md:block" style={{ background: '#2E2820' }} />

      <button
        title="Settings"
        onClick={() => router.push('/settings')}
        className="h-11 w-11 rounded-xl flex items-center justify-center transition-all md:w-[42px] md:h-[42px]"
        style={{ color: '#6B5A4A' }}
      >
        <Settings size={18} />
      </button>

      <div className="md:mt-auto md:mb-2">
        {user ? (
          <button
            onClick={() => router.push(`/profile/${user.uid}`)}
            title="View profile"
            className="w-11 h-11 rounded-full flex items-center justify-center text-xs font-semibold text-white overflow-hidden md:w-[36px] md:h-[36px]"
            style={{ background: 'linear-gradient(135deg,#EA580C,#FBBF24)' }}
          >
            {user.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              getInitials(user.displayName ?? null)
            )}
          </button>
        ) : (
          <>
            {/* Mobile: pill button with text */}
            <button
              onClick={() => router.push('/login')}
              className="flex md:hidden items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold text-white transition-all"
              style={{ background: 'linear-gradient(135deg,#EA580C,#F97316)', boxShadow: '0 0 12px rgba(249,115,22,.3)' }}
            >
              <LogIn size={13} />
              Login / Sign up
            </button>

            {/* Desktop: icon button with tooltip */}
            <button
              onClick={() => router.push('/login')}
              title="Login / Sign up"
              className="hidden md:flex w-[42px] h-[42px] rounded-xl flex-col items-center justify-center gap-0.5 transition-all hover:bg-[rgba(249,115,22,.15)]"
              style={{ color: '#F97316' }}
            >
              <LogIn size={16} />
              <span className="text-[8px] font-semibold leading-none">Login</span>
            </button>
          </>
        )}
      </div>
    </div>
  )
}

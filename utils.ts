import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}k`
  return String(n)
}

export function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60)   return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

export function getInitials(name: string | null): string {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

// Seed camps for first-time setup
export const SEED_CAMPS = [
  { name: 'gaming',       displayName: 'c/gaming',       description: 'All things gaming — reviews, clips, discussions.',  icon: '🎮', color: 'bg-blue-500/20',   memberCount: 2_100_000 },
  { name: 'programming',  displayName: 'c/programming',  description: 'Code, projects, tutorials and tech talk.',           icon: '💻', color: 'bg-green-500/20',  memberCount: 4_800_000 },
  { name: 'memes',        displayName: 'c/memes',        description: 'The internet\'s finest memes. Daily.',               icon: '😂', color: 'bg-purple-500/20', memberCount: 18_000_000 },
  { name: 'football',     displayName: 'c/football',     description: 'Goals, transfers, match threads and hot takes.',     icon: '⚽', color: 'bg-red-500/20',    memberCount: 1_300_000 },
  { name: 'music',        displayName: 'c/music',        description: 'Share what you\'re listening to.',                   icon: '🎵', color: 'bg-pink-500/20',   memberCount: 3_200_000 },
  { name: 'photography',  displayName: 'c/photography',  description: 'Shots, tips, and gear talk.',                       icon: '📸', color: 'bg-teal-500/20',   memberCount: 890_000 },
  { name: 'science',      displayName: 'c/science',      description: 'Discoveries, research and the wonder of the world.', icon: '🧠', color: 'bg-violet-500/20', memberCount: 2_400_000 },
  { name: 'tvshows',      displayName: 'c/tvshows',      description: 'Episode discussion, spoilers and reviews.',          icon: '📺', color: 'bg-yellow-500/20', memberCount: 1_100_000 },
  { name: 'food',         displayName: 'c/food',         description: 'Recipes, restaurants, and food pics.',               icon: '🍔', color: 'bg-orange-500/20', memberCount: 960_000 },
]

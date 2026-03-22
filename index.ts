export interface User {
  uid: string
  displayName: string | null
  email: string | null
  photoURL: string | null
  createdAt: Date
}

export interface Camp {
  id: string
  name: string          // e.g. "gaming"
  displayName: string   // e.g. "c/gaming"
  description: string
  icon: string          // emoji
  color: string         // tailwind bg class
  memberCount: number
  createdAt: Date
  createdBy: string
}

export interface Post {
  id: string
  title: string
  body?: string
  imageUrl?: string
  linkUrl?: string
  campId: string
  campName: string
  campIcon: string
  authorId: string
  authorName: string
  authorAvatar?: string
  upvotes: number
  downvotes: number
  commentCount: number
  createdAt: Date
  tags: string[]
  awards: Award[]
}

export interface Comment {
  id: string
  postId: string
  authorId: string
  authorName: string
  authorAvatar?: string
  body: string
  upvotes: number
  downvotes: number
  createdAt: Date
  parentId?: string
  replies?: Comment[]
}

export interface Vote {
  userId: string
  postId: string
  value: 1 | -1
}

export interface Award {
  type: 'ember' | 'onfire' | 'spark'
  label: string
  icon: string
  grantedBy: string
}

export type SortMode = 'hot' | 'new' | 'top' | 'rising'

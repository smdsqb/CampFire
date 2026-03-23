export interface User {
  uid: string
  displayName: string | null
  email: string | null
  photoURL: string | null
  bio?: string
  joinedAt?: Date
  karma?: number
  createdAt: Date
}

export interface Camp {
  id: string
  name: string
  displayName: string
  description: string
  icon: string
  color: string
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
  type: 'ember' | 'onfire' | 'spark' | 'log' | 'star'
  label: string
  icon: string
  grantedBy: string
}

export interface AppNotification {
  id: string
  userId: string
  type: 'vote' | 'reply' | 'system'
  title: string
  body: string
  postId?: string
  commentId?: string
  actorId?: string
  actorName?: string
  isRead: boolean
  createdAt: Date
}

export interface Conversation {
  id: string
  members: string[]
  memberNames: Record<string, string>
  lastMessage: string
  lastMessageAt?: Date
}

export interface ChatMessage {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  body: string
  createdAt: Date
}

export type SortMode = 'hot' | 'new' | 'top' | 'rising'

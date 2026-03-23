import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  getDocs, getDoc, query, where, orderBy, limit,
  increment, serverTimestamp, onSnapshot, setDoc,
  startAfter,
  type Query, type DocumentData,
} from 'firebase/firestore'
import { db } from './firebase'
import type { Post, Camp, Comment, SortMode, AppNotification, Conversation, ChatMessage } from '@/types'

function hotScore(post: Post): number {
  const hours = Math.max(1, (Date.now() - post.createdAt.getTime()) / 3_600_000)
  const net = post.upvotes - post.downvotes
  return net / Math.pow(hours + 2, 1.5)
}

function risingScore(post: Post): number {
  const hours = Math.max(1, (Date.now() - post.createdAt.getTime()) / 3_600_000)
  const velocity = (post.upvotes + post.commentCount * 0.6 - post.downvotes) / hours
  return velocity
}

function sortPosts(posts: Post[], sort: SortMode): Post[] {
  if (sort === 'new') return [...posts].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  if (sort === 'top') return [...posts].sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes))
  if (sort === 'rising') return [...posts].sort((a, b) => risingScore(b) - risingScore(a))
  return [...posts].sort((a, b) => hotScore(b) - hotScore(a))
}

async function assertUserNotBanned(userId: string) {
  const snap = await getDoc(doc(db, 'bannedUsers', userId))
  if (snap.exists()) {
    throw new Error('Your account is restricted from posting actions.')
  }
}

// ── CAMPS ────────────────────────────────────────────────
export async function getCamps(): Promise<Camp[]> {
  const snap = await getDocs(collection(db, 'camps'))
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Camp))
}

export async function getCamp(campId: string): Promise<Camp | null> {
  const snap = await getDoc(doc(db, 'camps', campId))
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Camp) : null
}

// ── POSTS ────────────────────────────────────────────────
export function subscribeToPosts(
  campId: string | null,
  sort: SortMode,
  cb: (posts: Post[]) => void,
) {
  const ref = collection(db, 'posts')
  let q: Query<DocumentData>

  if (campId) {
    q = query(ref, where('campId', '==', campId), orderBy('createdAt', 'desc'), limit(80))
  } else {
    q = query(ref, orderBy('createdAt', 'desc'), limit(100))
  }

  return onSnapshot(q, snap => {
    const mapped = snap.docs.map(d => {
      const data = d.data()
      return {
        id: d.id,
        title: data.title,
        body: data.body,
        campId: data.campId,
        campName: data.campName,
        campIcon: data.campIcon,
        authorId: data.authorId,
        authorName: data.authorName,
        authorAvatar: data.authorAvatar,
        upvotes: data.upvotes,
        downvotes: data.downvotes,
        commentCount: data.commentCount,
        createdAt: data.createdAt?.toDate() ?? new Date(),
        tags: data.tags ?? [],
        awards: data.awards ?? [],
      } as Post
    })

    cb(sortPosts(mapped, sort).slice(0, campId ? 30 : 50))
  })
}

export async function createPost(data: {
  title: string; body?: string; campId: string; campName: string
  campIcon: string; authorId: string; authorName: string
  authorAvatar?: string; tags: string[]
}): Promise<string> {
  await assertUserNotBanned(data.authorId)

  const ref = await addDoc(collection(db, 'posts'), {
    ...data,
    upvotes: 1,
    downvotes: 0,
    commentCount: 0,
    awards: [],
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function deletePost(postId: string) {
  await deleteDoc(doc(db, 'posts', postId))
}

// ── VOTES ────────────────────────────────────────────────
export async function castVote(postId: string, userId: string, value: 1 | -1) {
  await assertUserNotBanned(userId)

  const voteRef = doc(db, 'votes', `${postId}_${userId}`)
  const existing = await getDoc(voteRef)
  const postRef = doc(db, 'posts', postId)
  const postSnap = await getDoc(postRef)
  const postData = postSnap.exists() ? postSnap.data() : null

  if (existing.exists()) {
    if (existing.data().value === value) {
      await deleteDoc(voteRef)
      await updateDoc(postRef, {
        [value === 1 ? 'upvotes' : 'downvotes']: increment(-1),
      })
    } else {
      await updateDoc(voteRef, { value })
      await updateDoc(postRef, {
        upvotes: increment(value === 1 ? 1 : -1),
        downvotes: increment(value === -1 ? 1 : -1),
      })
    }
  } else {
    await setDoc(voteRef, { postId, userId, value })
    await updateDoc(postRef, {
      [value === 1 ? 'upvotes' : 'downvotes']: increment(1),
    })
  }

  if (value === 1 && postData?.authorId && postData.authorId !== userId) {
    await createNotification({
      userId: postData.authorId,
      type: 'vote',
      title: 'New upvote',
      body: `${postData.campName ? `Your post in c/${postData.campName}` : 'Your post'} got an upvote.`,
      postId,
      actorId: userId,
      actorName: 'Someone',
    })
  }
}

// ── COMMENTS ─────────────────────────────────────────────
export function subscribeToComments(postId: string, cb: (comments: Comment[]) => void) {
  const q = query(
    collection(db, 'comments'),
    where('postId', '==', postId),
    orderBy('createdAt', 'asc'),
  )
  return onSnapshot(q, snap => {
    cb(snap.docs.map(d => {
      const data = d.data()
      return {
        id: d.id,
        postId: data.postId,
        authorId: data.authorId,
        authorName: data.authorName,
        authorAvatar: data.authorAvatar,
        body: data.body,
        upvotes: data.upvotes,
        downvotes: data.downvotes,
        createdAt: data.createdAt?.toDate() ?? new Date(),
        parentId: data.parentId,
      } as Comment
    }))
  })
}

export async function createComment(data: {
  postId: string; authorId: string; authorName: string
  authorAvatar?: string; body: string; parentId?: string
}): Promise<string> {
  await assertUserNotBanned(data.authorId)

  const ref = await addDoc(collection(db, 'comments'), {
    ...data,
    upvotes: 1,
    downvotes: 0,
    createdAt: serverTimestamp(),
  })
  await updateDoc(doc(db, 'posts', data.postId), { commentCount: increment(1) })

  const postSnap = await getDoc(doc(db, 'posts', data.postId))
  if (postSnap.exists()) {
    const post = postSnap.data()
    if (post.authorId && post.authorId !== data.authorId) {
      await createNotification({
        userId: post.authorId,
        type: 'reply',
        title: 'New reply',
        body: `${data.authorName} replied to your post.`,
        postId: data.postId,
        commentId: ref.id,
        actorId: data.authorId,
        actorName: data.authorName,
      })
    }
  }

  return ref.id
}

// ── STATS ─────────────────────────────────────────────────
export async function getStats() {
  const [posts, camps, members] = await Promise.all([
    getDocs(collection(db, 'posts')),
    getDocs(collection(db, 'camps')),
    getDocs(collection(db, 'memberships')),
  ])
  return {
    postCount: posts.size,
    campCount: camps.size,
    memberCount: members.size,
  }
}

export async function createNotification(data: {
  userId: string
  type: 'vote' | 'reply' | 'system'
  title: string
  body: string
  postId?: string
  commentId?: string
  actorId?: string
  actorName?: string
}) {
  await addDoc(collection(db, 'notifications'), {
    ...data,
    isRead: false,
    createdAt: serverTimestamp(),
  })
}

export function subscribeToNotifications(userId: string, cb: (items: AppNotification[]) => void) {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(50),
  )

  return onSnapshot(q, snap => {
    cb(snap.docs.map(d => {
      const data = d.data()
      return {
        id: d.id,
        userId: data.userId,
        type: data.type,
        title: data.title,
        body: data.body,
        postId: data.postId,
        commentId: data.commentId,
        actorId: data.actorId,
        actorName: data.actorName,
        isRead: Boolean(data.isRead),
        createdAt: data.createdAt?.toDate() ?? new Date(),
      } as AppNotification
    }))
  })
}

export async function markNotificationRead(notificationId: string) {
  await updateDoc(doc(db, 'notifications', notificationId), { isRead: true })
}

export async function toggleSavePost(userId: string, postId: string): Promise<boolean> {
  const saveRef = doc(db, 'savedPosts', `${userId}_${postId}`)
  const snap = await getDoc(saveRef)
  if (snap.exists()) {
    await deleteDoc(saveRef)
    return false
  }
  await setDoc(saveRef, {
    userId,
    postId,
    createdAt: serverTimestamp(),
  })
  return true
}

export function subscribeSavedPostIds(userId: string, cb: (postIds: string[]) => void) {
  const q = query(collection(db, 'savedPosts'), where('userId', '==', userId), orderBy('createdAt', 'desc'), limit(200))
  return onSnapshot(q, snap => cb(snap.docs.map(d => d.data().postId as string)))
}

export async function reportPost(postId: string, reporterId: string, reason: string) {
  await addDoc(collection(db, 'reports'), {
    postId,
    reporterId,
    reason,
    status: 'open',
    createdAt: serverTimestamp(),
  })
}

export async function banUser(uid: string, bannedBy: string, reason: string) {
  await setDoc(doc(db, 'bannedUsers', uid), {
    uid,
    bannedBy,
    reason,
    createdAt: serverTimestamp(),
  })
}

export async function getOrCreateConversation(userA: string, userB: string, userAName?: string, userBName?: string) {
  const membersSorted = [userA, userB].sort()
  const convId = `${membersSorted[0]}_${membersSorted[1]}`
  const convRef = doc(db, 'conversations', convId)
  const snap = await getDoc(convRef)
  if (!snap.exists()) {
    await setDoc(convRef, {
      members: membersSorted,
      memberNames: {
        [userA]: userAName ?? 'You',
        [userB]: userBName ?? userB,
      },
      lastMessage: '',
      lastMessageAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    })
  }
  return convId
}

export function subscribeConversations(userId: string, cb: (items: Conversation[]) => void) {
  const q = query(
    collection(db, 'conversations'),
    where('members', 'array-contains', userId),
    orderBy('lastMessageAt', 'desc'),
    limit(50),
  )

  return onSnapshot(q, snap => {
    cb(snap.docs.map(d => {
      const data = d.data()
      return {
        id: d.id,
        members: data.members ?? [],
        memberNames: data.memberNames ?? {},
        lastMessage: data.lastMessage,
        lastMessageAt: data.lastMessageAt?.toDate(),
      } as Conversation
    }))
  })
}

export function subscribeMessages(conversationId: string, cb: (items: ChatMessage[]) => void) {
  const q = query(
    collection(db, 'messages'),
    where('conversationId', '==', conversationId),
    orderBy('createdAt', 'asc'),
    limit(200),
  )

  return onSnapshot(q, snap => {
    cb(snap.docs.map(d => {
      const data = d.data()
      return {
        id: d.id,
        conversationId: data.conversationId,
        senderId: data.senderId,
        senderName: data.senderName,
        body: data.body,
        createdAt: data.createdAt?.toDate() ?? new Date(),
      } as ChatMessage
    }))
  })
}

export async function sendMessage(conversationId: string, senderId: string, senderName: string, body: string) {
  await assertUserNotBanned(senderId)

  await addDoc(collection(db, 'messages'), {
    conversationId,
    senderId,
    senderName,
    body,
    createdAt: serverTimestamp(),
  })

  await updateDoc(doc(db, 'conversations', conversationId), {
    lastMessage: body,
    lastMessageAt: serverTimestamp(),
  })
}

export async function searchPostsPage(options: {
  searchTerm: string
  pageSize?: number
  cursor?: DocumentData | null
}) {
  const pageSize = options.pageSize ?? 20
  const constraints: any[] = [orderBy('createdAt', 'desc'), limit(pageSize)]
  if (options.cursor) constraints.push(startAfter(options.cursor))

  const q = query(collection(db, 'posts'), ...constraints)
  const snap = await getDocs(q)

  const rows = snap.docs.map(d => {
    const data = d.data()
    return {
      id: d.id,
      title: data.title,
      body: data.body,
      campId: data.campId,
      campName: data.campName,
      campIcon: data.campIcon,
      authorId: data.authorId,
      authorName: data.authorName,
      authorAvatar: data.authorAvatar,
      upvotes: data.upvotes,
      downvotes: data.downvotes,
      commentCount: data.commentCount,
      createdAt: data.createdAt?.toDate() ?? new Date(),
      tags: data.tags ?? [],
      awards: data.awards ?? [],
    } as Post
  }).filter(p => {
    const needle = options.searchTerm.trim().toLowerCase()
    if (!needle) return true
    return p.title.toLowerCase().includes(needle)
      || p.body?.toLowerCase().includes(needle)
      || p.campName.toLowerCase().includes(needle)
      || p.tags.some(t => t.toLowerCase().includes(needle))
  })

  return {
    posts: rows,
    nextCursor: snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null,
    hasMore: snap.size === pageSize,
  }
}

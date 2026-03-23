import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  getDocs, getDoc, query, where, orderBy, limit,
  increment, serverTimestamp, onSnapshot, setDoc,
  type Query, type DocumentData,
} from 'firebase/firestore'
import { db } from './firebase'
import type { Post, Camp, Comment, SortMode } from '@/types'

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
    q = sort === 'new'
      ? query(ref, where('campId', '==', campId), orderBy('createdAt', 'desc'), limit(30))
      : query(ref, where('campId', '==', campId), orderBy('upvotes', 'desc'), limit(30))
  } else {
    q = sort === 'new'
      ? query(ref, orderBy('createdAt', 'desc'), limit(50))
      : query(ref, orderBy('upvotes', 'desc'), limit(50))
  }

  return onSnapshot(q, snap => {
    cb(snap.docs.map(d => {
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
    }))
  })
}

export async function createPost(data: {
  title: string; body?: string; campId: string; campName: string
  campIcon: string; authorId: string; authorName: string
  authorAvatar?: string; tags: string[]
}): Promise<string> {
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
  const voteRef = doc(db, 'votes', `${postId}_${userId}`)
  const existing = await getDoc(voteRef)
  const postRef = doc(db, 'posts', postId)

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
  const ref = await addDoc(collection(db, 'comments'), {
    ...data,
    upvotes: 1,
    downvotes: 0,
    createdAt: serverTimestamp(),
  })
  await updateDoc(doc(db, 'posts', data.postId), { commentCount: increment(1) })
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

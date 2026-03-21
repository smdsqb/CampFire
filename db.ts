import { supabase } from './supabase'
import type { Post, Camp, Comment, SortMode } from '@/types'

// ── CAMPS ────────────────────────────────────────────────
export async function getCamps(): Promise<Camp[]> {
  const { data, error } = await supabase
    .from('camps')
    .select('*')
    .order('member_count', { ascending: false })
  if (error) throw error
  return (data ?? []).map(toCamp)
}

export async function getCamp(campId: string): Promise<Camp | null> {
  const { data } = await supabase.from('camps').select('*').eq('id', campId).single()
  return data ? toCamp(data) : null
}

// ── POSTS ────────────────────────────────────────────────
export async function getPosts(campId: string | null, sort: SortMode): Promise<Post[]> {
  let q = supabase.from('posts').select('*')
  if (campId) q = q.eq('camp_id', campId)
  if (sort === 'new') q = q.order('created_at', { ascending: false })
  if (sort === 'top' || sort === 'hot') q = q.order('upvotes', { ascending: false })
  if (sort === 'rising') q = q.order('comment_count', { ascending: false })
  q = q.limit(50)
  const { data, error } = await q
  if (error) throw error
  return (data ?? []).map(toPost)
}

export function subscribeToPosts(
  campId: string | null,
  sort: SortMode,
  cb: (posts: Post[]) => void,
) {
  // Initial fetch
  getPosts(campId, sort).then(cb)

  // Realtime subscription
  const channel = supabase
    .channel('posts-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
      getPosts(campId, sort).then(cb)
    })
    .subscribe()

  return () => { supabase.removeChannel(channel) }
}

export async function createPost(data: {
  title: string; body?: string; campId: string; campName: string
  campIcon: string; authorId: string; authorName: string
  authorAvatar?: string; tags: string[]
}): Promise<string> {
  const { data: row, error } = await supabase.from('posts').insert({
    title:         data.title,
    body:          data.body ?? '',
    camp_id:       data.campId,
    camp_name:     data.campName,
    camp_icon:     data.campIcon,
    author_id:     data.authorId,
    author_name:   data.authorName,
    author_avatar: data.authorAvatar ?? null,
    tags:          data.tags,
    upvotes:       1,
    downvotes:     0,
    comment_count: 0,
    awards:        [],
  }).select('id').single()
  if (error) throw error
  return row.id
}

export async function deletePost(postId: string) {
  await supabase.from('posts').delete().eq('id', postId)
}

// ── VOTES ────────────────────────────────────────────────
export async function castVote(postId: string, userId: string, value: 1 | -1) {
  // Check existing vote
  const { data: existing } = await supabase
    .from('votes')
    .select('*')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .single()

  if (existing) {
    if (existing.value === value) {
      // Undo vote
      await supabase.from('votes').delete().eq('id', existing.id)
      await supabase.rpc('adjust_votes', {
        p_post_id: postId,
        p_upvote_delta:   value === 1  ? -1 : 0,
        p_downvote_delta: value === -1 ? -1 : 0,
      })
    } else {
      // Flip vote
      await supabase.from('votes').update({ value }).eq('id', existing.id)
      await supabase.rpc('adjust_votes', {
        p_post_id: postId,
        p_upvote_delta:   value === 1  ?  1 : -1,
        p_downvote_delta: value === -1 ?  1 : -1,
      })
    }
  } else {
    // New vote
    await supabase.from('votes').insert({ post_id: postId, user_id: userId, value })
    await supabase.rpc('adjust_votes', {
      p_post_id: postId,
      p_upvote_delta:   value === 1  ? 1 : 0,
      p_downvote_delta: value === -1 ? 1 : 0,
    })
  }
}

// ── COMMENTS ─────────────────────────────────────────────
export function subscribeToComments(postId: string, cb: (comments: Comment[]) => void) {
  const fetch = async () => {
    const { data } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })
    cb((data ?? []).map(toComment))
  }
  fetch()

  const channel = supabase
    .channel(`comments-${postId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'comments', filter: `post_id=eq.${postId}` }, fetch)
    .subscribe()

  return () => { supabase.removeChannel(channel) }
}

export async function createComment(data: {
  postId: string; authorId: string; authorName: string
  authorAvatar?: string; body: string; parentId?: string
}): Promise<string> {
  const { data: row, error } = await supabase.from('comments').insert({
    post_id:       data.postId,
    author_id:     data.authorId,
    author_name:   data.authorName,
    author_avatar: data.authorAvatar ?? null,
    body:          data.body,
    parent_id:     data.parentId ?? null,
    upvotes:       1,
    downvotes:     0,
  }).select('id').single()
  if (error) throw error
  await supabase.rpc('increment_comment_count', { p_post_id: data.postId })
  return row.id
}

// ── MAPPERS ──────────────────────────────────────────────
function toCamp(r: any): Camp {
  return {
    id:          r.id,
    name:        r.name,
    displayName: r.display_name,
    description: r.description,
    icon:        r.icon,
    color:       r.color,
    memberCount: r.member_count,
    createdAt:   new Date(r.created_at),
    createdBy:   r.created_by,
  }
}

function toPost(r: any): Post {
  return {
    id:           r.id,
    title:        r.title,
    body:         r.body,
    campId:       r.camp_id,
    campName:     r.camp_name,
    campIcon:     r.camp_icon,
    authorId:     r.author_id,
    authorName:   r.author_name,
    authorAvatar: r.author_avatar,
    upvotes:      r.upvotes,
    downvotes:    r.downvotes,
    commentCount: r.comment_count,
    createdAt:    new Date(r.created_at),
    tags:         r.tags ?? [],
    awards:       r.awards ?? [],
  }
}

function toComment(r: any): Comment {
  return {
    id:           r.id,
    postId:       r.post_id,
    authorId:     r.author_id,
    authorName:   r.author_name,
    authorAvatar: r.author_avatar,
    body:         r.body,
    upvotes:      r.upvotes,
    downvotes:    r.downvotes,
    createdAt:    new Date(r.created_at),
    parentId:     r.parent_id,
  }
}

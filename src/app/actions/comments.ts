'use server'

import { db } from '@/lib/firebase'
import {
    addDoc,
    collection,
    doc,
    deleteDoc,
    getDoc,
    increment,
    serverTimestamp,
    setDoc,
    updateDoc
} from 'firebase/firestore'

export async function sendMessage(
    conversationId: string,
    userId: string,
    text: string
): Promise<{ id?: string; error?: string }> {
    try {
        if (!text?.trim()) {
            return { error: 'Message cannot be empty' }
        }

        const messagesRef = collection(db, 'conversations', conversationId, 'messages')
        const docRef = await addDoc(messagesRef, {
            userId,
            text: text.trim(),
            createdAt: serverTimestamp()
        })

        const convRef = doc(db, 'conversations', conversationId)
        await updateDoc(convRef, {
            lastMessage: text.trim(),
            lastMessageAt: serverTimestamp()
        })

        return { id: docRef.id }
    } catch (error) {
        console.error('Send message error:', error)
        return { error: 'Failed to send message' }
    }
}

export async function createComment(
    postId: string,
    userId: string,
    text: string
): Promise<{ id?: string; error?: string }> {
    try {
        if (!text?.trim()) {
            return { error: 'Comment cannot be empty' }
        }

        const commentsRef = collection(db, 'posts', postId, 'comments')
        const docRef = await addDoc(commentsRef, {
            author: userId,
            text: text.trim(),
            createdAt: serverTimestamp(),
            upvotes: 0,
            downvotes: 0
        })

        const postRef = doc(db, 'posts', postId)
        await updateDoc(postRef, {
            commentCount: increment(1)
        })

        return { id: docRef.id }
    } catch (error) {
        console.error('Create comment error:', error)
        return { error: 'Failed to create comment' }
    }
}

export async function updateComment(
    postId: string,
    commentId: string,
    text: string
): Promise<{ success?: boolean; error?: string }> {
    try {
        if (!text?.trim()) {
            return { error: 'Comment cannot be empty' }
        }

        const commentRef = doc(db, 'posts', postId, 'comments', commentId)
        await updateDoc(commentRef, {
            text: text.trim(),
            updatedAt: serverTimestamp()
        })

        return { success: true }
    } catch (error) {
        console.error('Update comment error:', error)
        return { error: 'Failed to update comment' }
    }
}

export async function deleteComment(
    postId: string,
    commentId: string
): Promise<{ success?: boolean; error?: string }> {
    try {
        const commentRef = doc(db, 'posts', postId, 'comments', commentId)
        await deleteDoc(commentRef)

        const postRef = doc(db, 'posts', postId)
        await updateDoc(postRef, {
            commentCount: increment(-1)
        })

        return { success: true }
    } catch (error) {
        console.error('Delete comment error:', error)
        return { error: 'Failed to delete comment' }
    }
}

// ── COMMENT VOTES ─────────────────────────────────────────────
// Stored in: commentVotes/{postId}_{commentId}_{userId}

export async function castCommentVote(
    postId: string,
    commentId: string,
    userId: string,
    value: 1 | -1
): Promise<{ success?: boolean; error?: string }> {
    try {
        const voteRef = doc(db, 'commentVotes', `${postId}_${commentId}_${userId}`)
        const commentRef = doc(db, 'posts', postId, 'comments', commentId)

        const [existingSnap, commentSnap] = await Promise.all([
            getDoc(voteRef),
            getDoc(commentRef),
        ])

        if (!commentSnap.exists()) {
            return { error: 'Comment not found' }
        }

        if (existingSnap.exists()) {
            const existingValue = existingSnap.data().value

            if (existingValue === value) {
                // Same vote → toggle off
                await deleteDoc(voteRef)
                await updateDoc(commentRef, {
                    [value === 1 ? 'upvotes' : 'downvotes']: increment(-1),
                })
            } else {
                // Switched direction
                await updateDoc(voteRef, { value })
                await updateDoc(commentRef, {
                    upvotes: increment(value === 1 ? 1 : -1),
                    downvotes: increment(value === -1 ? 1 : -1),
                })
            }
        } else {
            // First vote
            await setDoc(voteRef, { postId, commentId, userId, value })
            await updateDoc(commentRef, {
                [value === 1 ? 'upvotes' : 'downvotes']: increment(1),
            })
        }

        return { success: true }
    } catch (error) {
        console.error('Cast comment vote error:', error)
        return { error: 'Failed to cast vote' }
    }
}

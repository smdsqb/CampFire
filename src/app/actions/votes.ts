'use server'

import { db } from '@/lib/firebase'
import {
    doc,
    collection,
    setDoc,
    deleteDoc,
    updateDoc,
    increment,
    serverTimestamp,
    writeBatch,
    addDoc
} from 'firebase/firestore'

export async function createVote(
    postId: string,
    userId: string,
    voteType: 'up' | 'down'
): Promise<{ success: boolean } | { error: string }> {
    try {
        const votesRef = collection(db, 'posts', postId, 'votes')
        const voteRef = doc(votesRef, userId)

        const batch = writeBatch(db)

        // Remove old vote if exists by deleting, then set new
        batch.delete(voteRef)
        batch.set(voteRef, {
            userId,
            voteType,
            createdAt: serverTimestamp()
        })

        // Update post counters
        const postRef = doc(db, 'posts', postId)
        if (voteType === 'up') {
            batch.update(postRef, { upvotes: increment(1), downvotes: increment(-1) })
        } else {
            batch.update(postRef, { downvotes: increment(1), upvotes: increment(-1) })
        }

        await batch.commit()
        return { success: true }
    } catch (error) {
        console.error('Create vote error:', error)
        return { error: 'Failed to vote' }
    }
}

export async function removeVote(
    postId: string,
    userId: string,
    wasUpvote: boolean
): Promise<{ success: boolean } | { error: string }> {
    try {
        const votesRef = collection(db, 'posts', postId, 'votes')
        const voteRef = doc(votesRef, userId)

        const batch = writeBatch(db)
        batch.delete(voteRef)

        // Update post counters
        const postRef = doc(db, 'posts', postId)
        batch.update(postRef, {
            upvotes: wasUpvote ? increment(-1) : increment(0),
            downvotes: wasUpvote ? increment(0) : increment(-1)
        })

        await batch.commit()
        return { success: true }
    } catch (error) {
        console.error('Remove vote error:', error)
        return { error: 'Failed to remove vote' }
    }
}

export async function savePost(
    postId: string,
    userId: string
): Promise<{ success: boolean } | { error: string }> {
    try {
        const saveRef = doc(db, 'users', userId, 'savedPosts', postId)
        await setDoc(saveRef, { savedAt: serverTimestamp() })
        return { success: true }
    } catch (error) {
        console.error('Save post error:', error)
        return { error: 'Failed to save post' }
    }
}

export async function unsavePost(
    postId: string,
    userId: string
): Promise<{ success: boolean } | { error: string }> {
    try {
        const saveRef = doc(db, 'users', userId, 'savedPosts', postId)
        await deleteDoc(saveRef)
        return { success: true }
    } catch (error) {
        console.error('Unsave post error:', error)
        return { error: 'Failed to unsave post' }
    }
}

export async function reportPost(
    postId: string,
    userId: string,
    reason: string
): Promise<{ success: boolean } | { error: string }> {
    try {
        const reportsRef = collection(db, 'reports')
        await addDoc(reportsRef, {
            type: 'post',
            targetId: postId,
            reporterId: userId,
            reason,
            createdAt: serverTimestamp(),
            status: 'open'
        })
        return { success: true }
    } catch (error) {
        console.error('Report post error:', error)
        return { error: 'Failed to report post' }
    }
}

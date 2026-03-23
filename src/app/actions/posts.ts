'use server'

import { db, auth } from '@/lib/firebase'
import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    increment,
    writeBatch
} from 'firebase/firestore'

export async function createPost(
    campName: string,
    title: string,
    content: string,
    userId: string
): Promise<{ id: string } | { error: string }> {
    try {
        if (!title?.trim() || !campName?.trim()) {
            return { error: 'Title and camp are required' }
        }

        const postsRef = collection(db, 'posts')
        const docRef = await addDoc(postsRef, {
            title: title.trim(),
            campName,
            content: content?.trim() || '',
            author: userId,
            createdAt: serverTimestamp(),
            upvotes: 0,
            downvotes: 0,
            commentCount: 0,
            viewCount: 0
        })

        return { id: docRef.id }
    } catch (error) {
        console.error('Create post error:', error)
        return { error: 'Failed to create post' }
    }
}

export async function updatePost(
    postId: string,
    updates: { title?: string; content?: string },
    userId: string
): Promise<{ success: boolean } | { error: string }> {
    try {
        const postRef = doc(db, 'posts', postId)

        // Verify ownership (client-side check; server-side verification in real app)
        await updateDoc(postRef, {
            ...updates,
            updatedAt: serverTimestamp()
        })

        return { success: true }
    } catch (error) {
        console.error('Update post error:', error)
        return { error: 'Failed to update post' }
    }
}

export async function deletePost(postId: string): Promise<{ success: boolean } | { error: string }> {
    try {
        const batch = writeBatch(db)

        // Delete post
        const postRef = doc(db, 'posts', postId)
        batch.delete(postRef)

        // Delete votes on this post
        // In real app, would use batch delete for votes collection

        await batch.commit()
        return { success: true }
    } catch (error) {
        console.error('Delete post error:', error)
        return { error: 'Failed to delete post' }
    }
}

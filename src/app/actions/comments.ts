'use server'

import { db } from '@/lib/firebase'
import {
    addDoc,
    collection,
    doc,
    deleteDoc,
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

        // Update conversation's last message
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

        // Update post comment count
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

        // Decrement post comment count
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

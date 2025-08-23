import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import type { Meeting } from '@/types/meeting'
import type { Task } from '@/types/task'

// Initialize Firebase Admin SDK for server-side operations
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    })
  })
}

const db = getFirestore()

export async function getMeetings(userId: string): Promise<Meeting[]> {
  try {
    const snapshot = await db
      .collection('meetings')
      .where('userId', '==', userId)
      .orderBy('date', 'desc')
      .get()
    
    return snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        date: data.date?.toDate ? data.date.toDate().toISOString().split('T')[0] : data.date,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
      }
    }) as Meeting[]
  } catch (error) {
    console.error('Error fetching meetings:', error)
    return []
  }
}

export async function getMeeting(id: string): Promise<Meeting | null> {
  try {
    const doc = await db.collection('meetings').doc(id).get()
    
    if (!doc.exists) return null
    
    const data = doc.data()!
    return {
      id: doc.id,
      ...data,
      date: data.date?.toDate ? data.date.toDate().toISOString().split('T')[0] : data.date,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
    } as Meeting
  } catch (error) {
    console.error('Error fetching meeting:', error)
    return null
  }
}

export async function getTasks(userId: string): Promise<Task[]> {
  try {
    const snapshot = await db
      .collection('tasks')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get()
    
    return snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
        completedAt: data.completedAt?.toDate ? data.completedAt.toDate() : data.completedAt,
      }
    }) as Task[]
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return []
  }
}

export async function getTask(id: string): Promise<Task | null> {
  try {
    const doc = await db.collection('tasks').doc(id).get()
    
    if (!doc.exists) return null
    
    const data = doc.data()!
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
      completedAt: data.completedAt?.toDate ? data.completedAt.toDate() : data.completedAt,
    } as Task
  } catch (error) {
    console.error('Error fetching task:', error)
    return null
  }
}
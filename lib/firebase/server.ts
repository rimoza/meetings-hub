import { initializeApp, getApps } from 'firebase/app'
import { getFirestore, collection, query, where, orderBy, getDocs, doc, getDoc } from 'firebase/firestore'
import type { Meeting } from '@/types/meeting'
import type { Task } from '@/types/task'

// Firebase configuration - use the same config as client
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase for server-side operations
const app = getApps().length === 0 ? initializeApp(firebaseConfig, 'server') : getApps()[0]
const db = getFirestore(app)

export async function getMeetings(userId: string): Promise<Meeting[]> {
  try {
    const q = query(
      collection(db, 'meetings'),
      where('userId', '==', userId),
      orderBy('date', 'desc')
    )
    const snapshot = await getDocs(q)
    
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
    const docRef = doc(db, 'meetings', id)
    const docSnap = await getDoc(docRef)
    
    if (!docSnap.exists()) return null
    
    const data = docSnap.data()
    return {
      id: docSnap.id,
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
    const q = query(
      collection(db, 'tasks'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )
    const snapshot = await getDocs(q)
    
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
    const docRef = doc(db, 'tasks', id)
    const docSnap = await getDoc(docRef)
    
    if (!docSnap.exists()) return null
    
    const data = docSnap.data()
    return {
      id: docSnap.id,
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
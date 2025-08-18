import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  DocumentData,
  QueryDocumentSnapshot,
  getFirestore
} from 'firebase/firestore';
import { app } from './config';
import type { Meeting } from '@/types/meeting';

const COLLECTION_NAME = 'meetings';
const db = getFirestore(app);
// Convert Firestore document to Meeting type
const convertDocToMeeting = (doc: QueryDocumentSnapshot<DocumentData>): Meeting => {
  const data = doc.data();
  return {
    id: doc.id,
    title: data.title,
    description: data.description,
    date: data.date,
    time: data.time,
    duration: data.duration,
    location: data.location,
    attendees: data.attendees || [],
    completed: data.completed || false,
    priority: data.priority,
    type: data.type,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
};

// Create a new meeting
export const createMeeting = async (
  userId: string, 
  meetingData: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>
) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...meetingData,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating meeting:', error);
    throw error;
  }
};

// Update a meeting
export const updateMeeting = async (
  meetingId: string, 
  updates: Partial<Omit<Meeting, 'id' | 'createdAt'>>
) => {
  try {
    const meetingRef = doc(db, COLLECTION_NAME, meetingId);
    await updateDoc(meetingRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating meeting:', error);
    throw error;
  }
};

// Delete a meeting
export const deleteMeeting = async (meetingId: string) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, meetingId));
  } catch (error) {
    console.error('Error deleting meeting:', error);
    throw error;
  }
};

// Get all meetings for a user
export const getUserMeetings = async (userId: string): Promise<Meeting[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId),
      orderBy('date', 'asc'),
      orderBy('time', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(convertDocToMeeting);
  } catch (error) {
    console.error('Error fetching meetings:', error);
    throw error;
  }
};

// Subscribe to real-time meeting updates
export const subscribeMeetings = (
  userId: string, 
  callback: (meetings: Meeting[]) => void
) => {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('userId', '==', userId),
    orderBy('date', 'asc'),
    orderBy('time', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const meetings = snapshot.docs.map(convertDocToMeeting);
    callback(meetings);
  }, (error) => {
    console.error('Error in meetings subscription:', error);
  });
};

// Get today's meetings
export const getTodayMeetings = async (userId: string): Promise<Meeting[]> => {
  const today = new Date().toISOString().split('T')[0];
  
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId),
      where('date', '==', today),
      orderBy('time', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(convertDocToMeeting);
  } catch (error) {
    console.error('Error fetching today meetings:', error);
    throw error;
  }
};

// Get upcoming meetings
export const getUpcomingMeetings = async (userId: string): Promise<Meeting[]> => {
  const today = new Date().toISOString().split('T')[0];
  
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId),
      where('date', '>', today),
      orderBy('date', 'asc'),
      orderBy('time', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(convertDocToMeeting);
  } catch (error) {
    console.error('Error fetching upcoming meetings:', error);
    throw error;
  }
};

// Toggle meeting completion
export const toggleMeetingCompletion = async (meetingId: string, completed: boolean) => {
  try {
    const meetingRef = doc(db, COLLECTION_NAME, meetingId);
    await updateDoc(meetingRef, {
      completed,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error toggling meeting completion:', error);
    throw error;
  }
};
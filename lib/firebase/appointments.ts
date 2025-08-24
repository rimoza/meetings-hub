import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc,
  query, 
  orderBy, 
  where,
  Timestamp,
  getFirestore,
  type Firestore
} from 'firebase/firestore';
import { app, isFirebaseConfigured } from './config';
import { Appointment } from '@/types/appointment';

const COLLECTION_NAME = 'appointments';
const db: Firestore | null = app && isFirebaseConfigured() ? getFirestore(app) : null;

export const appointmentsService = {
  async getAll(userId: string): Promise<Appointment[]> {
    if (!db) {
      throw new Error("Firebase is not properly configured");
    }

    try {
      const appointmentsRef = collection(db, COLLECTION_NAME);
      const q = query(
        appointmentsRef, 
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      
      const appointments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Appointment[];
      
      // Sort by date in descending order on the client side
      return appointments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  },

  async getById(id: string): Promise<Appointment | null> {
    if (!db) {
      throw new Error("Firebase is not properly configured");
    }

    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Appointment;
      }
      return null;
    } catch (error) {
      console.error('Error fetching appointment:', error);
      throw error;
    }
  },

  async create(appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<string> {
    if (!db) {
      throw new Error("Firebase is not properly configured");
    }

    try {
      const now = Timestamp.now();
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...appointment,
        userId,
        createdAt: now,
        updatedAt: now,
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  },

  async update(id: string, updates: Partial<Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    if (!db) {
      throw new Error("Firebase is not properly configured");
    }

    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    if (!db) {
      throw new Error("Firebase is not properly configured");
    }

    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting appointment:', error);
      throw error;
    }
  },

  async getByStatus(userId: string, status: string): Promise<Appointment[]> {
    if (!db) {
      throw new Error("Firebase is not properly configured");
    }

    try {
      const appointmentsRef = collection(db, COLLECTION_NAME);
      const q = query(
        appointmentsRef,
        where('userId', '==', userId),
        where('status', '==', status),
        orderBy('date', 'desc')
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Appointment[];
    } catch (error) {
      console.error('Error fetching appointments by status:', error);
      throw error;
    }
  },

  async getTodaysAppointments(userId: string): Promise<Appointment[]> {
    if (!db) {
      throw new Error("Firebase is not properly configured");
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      const appointmentsRef = collection(db, COLLECTION_NAME);
      const q = query(
        appointmentsRef,
        where('userId', '==', userId),
        where('date', '==', today),
        orderBy('time', 'asc')
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Appointment[];
    } catch (error) {
      console.error('Error fetching today\'s appointments:', error);
      throw error;
    }
  }
};
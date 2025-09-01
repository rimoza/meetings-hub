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
  onSnapshot,
  startAt,
  endAt,
  type Firestore,
  type Unsubscribe
} from 'firebase/firestore';
import { app, isFirebaseConfigured } from './config';
import { Appointment } from '@/types/appointment';

const COLLECTION_NAME = 'appointments';
const db: Firestore | null = app && isFirebaseConfigured() ? getFirestore(app) : null;

// Helper function to get the next daily number for a specific date
async function getNextDailyNumber(date: string): Promise<number> {
  if (!db) {
    throw new Error("Firebase is not properly configured");
  }

  console.log('🔍 getNextDailyNumber called for date:', date);

  try {
    const appointmentsRef = collection(db, COLLECTION_NAME);
    // First, get all appointments for the specific date
    const q = query(
      appointmentsRef,
      where('date', '==', date)
    );
    
    const snapshot = await getDocs(q);
    
    console.log('📊 Query result - found', snapshot.docs.length, 'appointments for date:', date);
    
    if (snapshot.empty) {
      console.log('✨ No appointments found for date:', date, 'returning dailyNumber: 1');
      return 1;
    }
    
    // Get all daily numbers and find the highest one
    let highestNumber = 0;
    const dailyNumbers: number[] = [];
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const dailyNumber = data.dailyNumber || 0;
      dailyNumbers.push(dailyNumber);
      console.log(`📋 Appointment ${doc.id}: dailyNumber=${dailyNumber}`);
      if (dailyNumber > highestNumber) {
        highestNumber = dailyNumber;
      }
    });
    
    const nextNumber = highestNumber + 1;
    console.log(`🎯 Daily numbers found: [${dailyNumbers.join(', ')}], highest: ${highestNumber}, next: ${nextNumber}`);
    
    return nextNumber;
  } catch (error) {
    console.error('❌ Error getting next daily number:', error);
    // Fallback: try to get a simple count + 1
    try {
      const appointmentsRef = collection(db, COLLECTION_NAME);
      const q = query(appointmentsRef, where('date', '==', date));
      const snapshot = await getDocs(q);
      const fallbackNumber = snapshot.docs.length + 1;
      console.log(`🔄 Fallback: returning ${fallbackNumber} for date ${date}`);
      return fallbackNumber;
    } catch (fallbackError) {
      console.error('❌ Fallback also failed:', fallbackError);
      return 1;
    }
  }
}

// Helper function to format appointment number (e.g., 1 -> "001")
export function formatAppointmentNumber(dailyNumber: number): string {
  return dailyNumber.toString().padStart(3, '0');
}

// Migration function to assign daily numbers to existing appointments
async function migrateDailyNumbers(): Promise<void> {
  if (!db) {
    throw new Error("Firebase is not properly configured");
  }

  console.log('🔧 Starting daily numbers migration...');

  try {
    const appointmentsRef = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(appointmentsRef);
    
    if (snapshot.empty) {
      console.log('✨ No appointments to migrate');
      return;
    }

    // Group appointments by date
    const appointmentsByDate: { [date: string]: any[] } = {};
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const date = data.date || new Date().toISOString().split('T')[0];
      
      if (!appointmentsByDate[date]) {
        appointmentsByDate[date] = [];
      }
      
      appointmentsByDate[date].push({
        id: doc.id,
        data: data,
        hasNumber: typeof data.dailyNumber === 'number'
      });
    });

    // Assign numbers for each date
    const updates: Promise<void>[] = [];
    
    for (const [date, appointments] of Object.entries(appointmentsByDate)) {
      console.log(`📅 Processing ${appointments.length} appointments for date: ${date}`);
      
      // Sort by creation time or existing daily number
      appointments.sort((a, b) => {
        if (a.hasNumber && !b.hasNumber) return -1;
        if (!a.hasNumber && b.hasNumber) return 1;
        if (a.hasNumber && b.hasNumber) return a.data.dailyNumber - b.data.dailyNumber;
        
        const aTime = a.data.createdAt?.toDate?.() || new Date(0);
        const bTime = b.data.createdAt?.toDate?.() || new Date(0);
        return aTime.getTime() - bTime.getTime();
      });
      
      // Assign sequential numbers
      appointments.forEach((appointment, index) => {
        const expectedNumber = index + 1;
        
        if (!appointment.hasNumber || appointment.data.dailyNumber !== expectedNumber) {
          console.log(`📝 Updating appointment ${appointment.id}: ${appointment.data.dailyNumber || 'none'} -> ${expectedNumber}`);
          
          const docRef = doc(db, COLLECTION_NAME, appointment.id);
          updates.push(updateDoc(docRef, { dailyNumber: expectedNumber }));
        }
      });
    }

    if (updates.length > 0) {
      console.log(`🚀 Applying ${updates.length} updates...`);
      await Promise.all(updates);
      console.log('✅ Migration completed successfully');
    } else {
      console.log('✅ No updates needed - all appointments already have correct daily numbers');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

export const appointmentsService = {
  async getAll(userId: string): Promise<Appointment[]> {
    console.log(userId, 'userId in getAll');
    if (!db) {
      throw new Error("Firebase is not properly configured");
    }

    try {
      const appointmentsRef = collection(db, COLLECTION_NAME);
      // Get all appointments regardless of userId
      const q = query(
        appointmentsRef
      );
      const snapshot = await getDocs(q);
      
      const appointments = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          dailyNumber: data.dailyNumber || 0, // Use 0 for missing numbers (will trigger migration)
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };
      }) as Appointment[];
      
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
          dailyNumber: data.dailyNumber || 0, // Use 0 for missing numbers (will trigger migration)
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

  async create(appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt' | 'dailyNumber'>, userId: string): Promise<string> {
    if (!db) {
      throw new Error("Firebase is not properly configured");
    }

    console.log('🚀 Creating appointment for date:', appointment.date, 'user:', userId);

    try {
      // Get the next daily number for this date
      const dailyNumber = await getNextDailyNumber(appointment.date);
      console.log('🎯 Assigned dailyNumber:', dailyNumber, 'for appointment on date:', appointment.date);
      
      const now = Timestamp.now();
      const appointmentData = {
        ...appointment,
        dailyNumber,
        userId,
        createdAt: now,
        updatedAt: now,
      };
      
      console.log('💾 Saving appointment to Firestore:', { 
        title: appointmentData.title, 
        date: appointmentData.date, 
        dailyNumber: appointmentData.dailyNumber 
      });
      
      const docRef = await addDoc(collection(db, COLLECTION_NAME), appointmentData);
      
      console.log('✅ Appointment created successfully with ID:', docRef.id, 'and dailyNumber:', dailyNumber);
      
      return docRef.id;
    } catch (error) {
      console.error('❌ Error creating appointment:', error);
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
      // Get all appointments with this status regardless of userId
      const q = query(
        appointmentsRef,
        where('status', '==', status),
        orderBy('date', 'desc')
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          dailyNumber: data.dailyNumber || 0, // Use 0 for missing numbers (will trigger migration)
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };
      }) as Appointment[];
    } catch (error) {
      console.error('Error fetching appointments by status:', error);
      throw error;
    }
  },

  async getTodaysAppointments(userId: string): Promise<Appointment[]> {
    console.log(userId, 'userId in getTodaysAppointments');
    if (!db) {
      throw new Error("Firebase is not properly configured");
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      const appointmentsRef = collection(db, COLLECTION_NAME);
      // Get all today's appointments regardless of userId
      const q = query(
        appointmentsRef,
        where('date', '==', today),
        orderBy('time', 'asc')
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          dailyNumber: data.dailyNumber || 0, // Use 0 for missing numbers (will trigger migration)
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };
      }) as Appointment[];
    } catch (error) {
      console.error('Error fetching today\'s appointments:', error);
      throw error;
    }
  },

  subscribeToAppointments(userId: string, callback: (appointments: Appointment[]) => void): Unsubscribe | null {
    if (!db) {
      console.error("Firebase is not properly configured");
      return null;
    }

    try {
      const appointmentsRef = collection(db, COLLECTION_NAME);
      // Get all appointments regardless of userId
      const q = query(
        appointmentsRef
      );

      return onSnapshot(q, (snapshot) => {
        const appointments = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        })) as Appointment[];
        
        // Sort by date in descending order
        const sortedAppointments = appointments.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        callback(sortedAppointments);
      }, (error) => {
        console.error('Error in appointments subscription:', error);
      });
    } catch (error) {
      console.error('Error setting up appointments subscription:', error);
      return null;
    }
  },

  // Migration utility function
  migrateDailyNumbers
};
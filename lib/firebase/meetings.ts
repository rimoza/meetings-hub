import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  DocumentData,
  QueryDocumentSnapshot,
  getFirestore,
  type Firestore,
  Timestamp,
} from "firebase/firestore";
import { app, isFirebaseConfigured } from "@/lib/firebase/config";
import type { Meeting, MeetingNote } from "@/types/meeting";
import { createTaskFromMeetingNote } from "./tasks";

const COLLECTION_NAME = "meetings";
const db: Firestore | null =
  app && isFirebaseConfigured() ? getFirestore(app) : null;
// Convert Firestore document to Meeting type
const convertDocToMeeting = (
  doc: QueryDocumentSnapshot<DocumentData>,
): Meeting => {
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
    notes: data.notes || undefined,
    meetingNotes: data.meetingNotes
      ? data.meetingNotes.map((note: unknown) => {
          const typedNote = note as MeetingNote & {
            timestamp?: Timestamp | Date | string;
          };
          return {
            ...typedNote,
            timestamp:
              typedNote.timestamp instanceof Timestamp
                ? typedNote.timestamp.toDate()
                : new Date(typedNote.timestamp || Date.now()),
          };
        })
      : undefined,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
};

// Create a new meeting
export const createMeeting = async (
  userId: string,
  meetingData: Omit<Meeting, "id" | "createdAt" | "updatedAt">,
) => {
  if (!db) {
    throw new Error("Firebase is not properly configured");
  }

  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...meetingData,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating meeting:", error);
    throw error;
  }
};

// Update a meeting
export const updateMeeting = async (
  meetingId: string,
  updates: Partial<Omit<Meeting, "id" | "createdAt">>,
) => {
  if (!db) {
    throw new Error("Firebase is not properly configured");
  }

  try {
    const meetingRef = doc(db, COLLECTION_NAME, meetingId);
    await updateDoc(meetingRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating meeting:", error);
    throw error;
  }
};

// Delete a meeting
export const deleteMeeting = async (meetingId: string) => {
  if (!db) {
    throw new Error("Firebase is not properly configured");
  }

  try {
    await deleteDoc(doc(db, COLLECTION_NAME, meetingId));
  } catch (error) {
    console.error("Error deleting meeting:", error);
    throw error;
  }
};

// Get all meetings for all users
export const getUserMeetings = async (userId: string): Promise<Meeting[]> => {
  console.log(userId, 'userId in getUserMeetings');
  if (!db) {
    throw new Error("Firebase is not properly configured");
  }

  try {
    // Get all meetings regardless of userId
    const q = query(
      collection(db, COLLECTION_NAME)
    );

    const querySnapshot = await getDocs(q);
    const meetings = querySnapshot.docs.map(convertDocToMeeting);

    // Sort on client side
    return meetings.sort((a, b) => {
      const dateComparison = a.date.localeCompare(b.date);
      if (dateComparison !== 0) return dateComparison;
      return a.time.localeCompare(b.time);
    });
  } catch (error) {
    console.error("Error fetching meetings:", error);
    throw error;
  }
};

// Subscribe to real-time meeting updates
export const subscribeMeetings = (
  userId: string,
  callback: (meetings: Meeting[]) => void,
) => {
  if (!db) {
    console.warn("Firebase not configured, returning empty meetings");
    callback([]);
    return () => {}; // Return empty unsubscribe function
  }

  // Get all meetings regardless of userId
  const q = query(
    collection(db, COLLECTION_NAME)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const meetings = snapshot.docs.map(convertDocToMeeting);

      // Sort on client side to avoid needing composite index
      const sortedMeetings = meetings.sort((a, b) => {
        // First sort by date, then by time
        const dateComparison = a.date.localeCompare(b.date);
        if (dateComparison !== 0) return dateComparison;
        return a.time.localeCompare(b.time);
      });

      callback(sortedMeetings);
    },
    (error) => {
      console.error("Error in meetings subscription:", error);
    },
  );
};

// Get today's meetings
export const getTodayMeetings = async (userId: string): Promise<Meeting[]> => {
  console.log(userId, 'userId in getTodayMeetings');
  if (!db) {
    throw new Error("Firebase is not properly configured");
  }

  const today = new Date().toISOString().split("T")[0];

  try {
    // Get all meetings for today regardless of userId
    const q = query(
      collection(db, COLLECTION_NAME),
      where("date", "==", today)
    );

    const querySnapshot = await getDocs(q);
    const meetings = querySnapshot.docs.map(convertDocToMeeting);

    // Sort by time on client side
    return meetings.sort((a, b) => a.time.localeCompare(b.time));
  } catch (error) {
    console.error("Error fetching today meetings:", error);
    throw error;
  }
};

// Get upcoming meetings
export const getUpcomingMeetings = async (
  userId: string,
): Promise<Meeting[]> => {
  console.log(userId, 'userId in getUpcomingMeetings');
  if (!db) {
    throw new Error("Firebase is not properly configured");
  }

  const today = new Date().toISOString().split("T")[0];

  try {
    // Get all upcoming meetings regardless of userId
    const q = query(
      collection(db, COLLECTION_NAME),
      where("date", ">", today)
    );

    const querySnapshot = await getDocs(q);
    const meetings = querySnapshot.docs.map(convertDocToMeeting);

    // Sort by date and time on client side
    return meetings.sort((a, b) => {
      const dateComparison = a.date.localeCompare(b.date);
      if (dateComparison !== 0) return dateComparison;
      return a.time.localeCompare(b.time);
    });
  } catch (error) {
    console.error("Error fetching upcoming meetings:", error);
    throw error;
  }
};

// Toggle meeting completion
export const toggleMeetingCompletion = async (
  meetingId: string,
  completed: boolean,
) => {
  if (!db) {
    throw new Error("Firebase is not properly configured");
  }

  try {
    const meetingRef = doc(db, COLLECTION_NAME, meetingId);
    await updateDoc(meetingRef, {
      completed,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error toggling meeting completion:", error);
    throw error;
  }
};

// Get a specific meeting for a user
export const getMeeting = async (
  meetingId: string,
  userId: string,
): Promise<Meeting | null> => {
  console.log(userId, 'userId in getMeeting');
  if (!db) {
    throw new Error("Firebase is not properly configured");
  }

  try {
    const meetingRef = doc(db, COLLECTION_NAME, meetingId);
    const meetingDoc = await getDoc(meetingRef);

    if (!meetingDoc.exists()) {
      return null;
    }

    const meetingData = meetingDoc.data();
    if (!meetingData) {
      return null;
    }

    // Allow access to any meeting for any logged-in user
    // No user check needed anymore

    return convertDocToMeeting(meetingDoc);
  } catch (error) {
    console.error("Error fetching meeting:", error);
    throw error;
  }
};

// Add a note to a meeting and create task if it's a follow-up
export const addMeetingNote = async (
  userId: string,
  meetingId: string,
  noteContent: string,
  noteType: "regular" | "follow-up",
  author?: string,
  taskDetails?: {
    assignee?: string;
    priority?: "low" | "medium" | "high";
    dueDate?: string;
  },
) => {
  if (!db) {
    throw new Error("Firebase is not properly configured");
  }

  try {
    // First, get the current meeting to access its notes and title
    const meetingRef = doc(db, COLLECTION_NAME, meetingId);
    const meetingDoc = await getDoc(meetingRef);

    if (!meetingDoc.exists()) {
      throw new Error("Meeting not found");
    }

    const meetingData = meetingDoc.data();
    const currentNotes = meetingData.meetingNotes || [];

    // Create new note
    const newNote: MeetingNote = {
      id: `note_${Date.now()}`,
      content: noteContent,
      timestamp: new Date(),
      ...(author && { author }), // Only include author if it's defined
      type: noteType,
    };

    // Update meeting with new note
    await updateDoc(meetingRef, {
      meetingNotes: [...currentNotes, newNote],
      updatedAt: serverTimestamp(),
    });

    // If it's a follow-up note, create a task automatically
    if (noteType === "follow-up") {
      await createTaskFromMeetingNote(
        userId,
        meetingId,
        meetingData.title,
        noteContent,
        taskDetails?.priority || meetingData.priority || "medium",
        taskDetails?.assignee,
        taskDetails?.dueDate,
      );
    }

    return newNote.id;
  } catch (error) {
    console.error("Error adding meeting note:", error);
    throw error;
  }
};

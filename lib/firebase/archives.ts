import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  // getDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  DocumentData,
  QueryDocumentSnapshot,
  getFirestore,
  type Firestore,
} from "firebase/firestore";
import { app, isFirebaseConfigured } from "@/lib/firebase/config";
import type { Archive } from "@/types/archive";

const COLLECTION_NAME = "archives";
const db: Firestore | null =
  app && isFirebaseConfigured() ? getFirestore(app) : null;

// Convert Firestore document to Archive type
const convertDocToArchive = (
  doc: QueryDocumentSnapshot<DocumentData>,
): Archive => {
  const data = doc.data();
  return {
    id: data.id || doc.id,
    title: data.title,
    date: data.date,
    status: data.status,
    labels: data.labels || [],
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
};

// Generate archive ID in format xxx-01, xxx-02
const generateArchiveId = async (userId: string): Promise<string> => {
  if (!db) {
    throw new Error("Firebase is not properly configured");
  }

  try {
    // Get all existing archives for the user
    const q = query(
      collection(db, COLLECTION_NAME),
      where("userId", "==", userId),
    );
    const querySnapshot = await getDocs(q);
    
    // Get all existing IDs to avoid duplicates
    const existingIds = new Set(querySnapshot.docs.map(doc => {
      const data = doc.data();
      return data.id || doc.id;
    }));
    
    // Find the highest number across all existing archives
    const allNumbers = Array.from(existingIds)
      .map(id => {
        const match = id.match(/-(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(num => !isNaN(num) && num > 0);
    
    const nextNumber = allNumbers.length > 0 ? Math.max(...allNumbers) + 1 : 1;
    
    // Generate unique ID by trying different letter combinations
    let attempts = 0;
    const maxAttempts = 100;
    
    while (attempts < maxAttempts) {
      // Generate 3 random letters for the prefix
      const letters = Array.from({ length: 3 }, () => 
        String.fromCharCode(65 + Math.floor(Math.random() * 26))
      ).join('');
      
      const candidateId = `${letters}-${nextNumber.toString().padStart(2, '0')}`;
      
      // Check if this ID already exists
      if (!existingIds.has(candidateId)) {
        return candidateId;
      }
      
      attempts++;
    }
    
    // Fallback: use timestamp-based approach if all attempts fail
    const timestamp = Date.now().toString().slice(-6);
    const letters = Array.from({ length: 3 }, () => 
      String.fromCharCode(65 + Math.floor(Math.random() * 26))
    ).join('');
    
    return `${letters}-${timestamp.slice(-2)}`;
    
  } catch (error) {
    console.error("Error generating archive ID:", error);
    // Fallback ID generation with timestamp
    const timestamp = Date.now().toString().slice(-6);
    const letters = Array.from({ length: 3 }, () => 
      String.fromCharCode(65 + Math.floor(Math.random() * 26))
    ).join('');
    return `${letters}-${timestamp.slice(-2)}`;
  }
};

// Create a new archive
export const createArchive = async (
  userId: string,
  archiveData: Omit<Archive, "id" | "createdAt" | "updatedAt">,
) => {
  if (!db) {
    throw new Error("Firebase is not properly configured");
  }

  try {
    const archiveId = await generateArchiveId(userId);
    
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...archiveData,
      id: archiveId,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { docId: docRef.id, archiveId };
  } catch (error) {
    console.error("Error creating archive:", error);
    throw error;
  }
};

// Update an archive
export const updateArchive = async (
  archiveId: string,
  updates: Partial<Omit<Archive, "id" | "createdAt">>,
) => {
  if (!db) {
    throw new Error("Firebase is not properly configured");
  }

  try {
    // Find the document by custom ID
    const q = query(
      collection(db, COLLECTION_NAME),
      where("id", "==", archiveId),
    );
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error("Archive not found");
    }
    
    const archiveDoc = querySnapshot.docs[0];
    await updateDoc(doc(db, COLLECTION_NAME, archiveDoc.id), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating archive:", error);
    throw error;
  }
};

// Delete an archive
export const deleteArchive = async (archiveId: string) => {
  if (!db) {
    throw new Error("Firebase is not properly configured");
  }

  try {
    // Find the document by custom ID
    const q = query(
      collection(db, COLLECTION_NAME),
      where("id", "==", archiveId),
    );
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error("Archive not found");
    }
    
    const archiveDoc = querySnapshot.docs[0];
    await deleteDoc(doc(db, COLLECTION_NAME, archiveDoc.id));
  } catch (error) {
    console.error("Error deleting archive:", error);
    throw error;
  }
};

// Get all archives for all users
export const getUserArchives = async (userId: string): Promise<Archive[]> => {
  console.log(userId, 'userId in getUserArchives');
  if (!db) {
    throw new Error("Firebase is not properly configured");
  }

  try {
    // Get all archives regardless of userId
    const q = query(
      collection(db, COLLECTION_NAME)
    );

    const querySnapshot = await getDocs(q);
    const archives = querySnapshot.docs.map(convertDocToArchive);

    // Sort by created date (newest first)
    return archives.sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  } catch (error) {
    console.error("Error fetching archives:", error);
    throw error;
  }
};

// Subscribe to real-time archive updates
export const subscribeArchives = (
  userId: string,
  callback: (archives: Archive[]) => void,
) => {
  if (!db) {
    console.warn("Firebase not configured, returning empty archives");
    callback([]);
    return () => {}; // Return empty unsubscribe function
  }

  // Get all archives regardless of userId
  const q = query(
    collection(db, COLLECTION_NAME)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const archives = snapshot.docs.map(convertDocToArchive);

      // Sort by created date (newest first)
      const sortedArchives = archives.sort((a, b) => 
        b.createdAt.getTime() - a.createdAt.getTime()
      );

      callback(sortedArchives);
    },
    (error) => {
      console.error("Error in archives subscription:", error);
    },
  );
};

// Get a specific archive
export const getArchive = async (
  archiveId: string,
  userId: string,
): Promise<Archive | null> => {
  console.log(userId, 'userId in getArchive');
  if (!db) {
    throw new Error("Firebase is not properly configured");
  }

  try {
    // Get any archive with this ID regardless of userId
    const q = query(
      collection(db, COLLECTION_NAME),
      where("id", "==", archiveId)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const archiveDoc = querySnapshot.docs[0];
    return convertDocToArchive(archiveDoc);
  } catch (error) {
    console.error("Error fetching archive:", error);
    throw error;
  }
};

// Get archives by status
export const getArchivesByStatus = async (
  userId: string,
  status: Archive["status"],
): Promise<Archive[]> => {
  if (!db) {
    throw new Error("Firebase is not properly configured");
  }

  try {
    // Get all archives with this status regardless of userId
    const q = query(
      collection(db, COLLECTION_NAME),
      where("status", "==", status)
    );

    const querySnapshot = await getDocs(q);
    const archives = querySnapshot.docs.map(convertDocToArchive);

    return archives.sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  } catch (error) {
    console.error("Error fetching archives by status:", error);
    throw error;
  }
};
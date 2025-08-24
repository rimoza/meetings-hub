import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  Timestamp,
  getFirestore,
  type Firestore,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject, getStorage, type FirebaseStorage } from "firebase/storage";
import { app, isFirebaseConfigured } from "./config";
import type { Report } from "@/types/report";

const REPORTS_COLLECTION = "reports";

const db: Firestore | null = app && isFirebaseConfigured() ? getFirestore(app) : null;
const storage: FirebaseStorage | null = app && isFirebaseConfigured() ? getStorage(app) : null;

export const subscribeReports = (
  userId: string,
  callback: (reports: Report[]) => void,
) => {
  if (!db) {
    console.warn("Firebase not configured, returning empty reports");
    callback([]);
    return () => {}; // Return empty unsubscribe function
  }

  // Simplified query that doesn't require a composite index
  const reportsQuery = query(
    collection(db, REPORTS_COLLECTION),
    where("createdBy", "==", userId),
  );

  return onSnapshot(reportsQuery, (snapshot) => {
    const reports: Report[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      reports.push({
        id: doc.id,
        title: data.title,
        description: data.description,
        file: data.file,
        createdBy: data.createdBy,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      });
    });
    
    // Sort on client side to avoid needing composite index
    const sortedReports = reports.sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
    
    callback(sortedReports);
  }, (error) => {
    console.error("Error in reports subscription:", error);
  });
};

export const createReport = async (
  userId: string,
  reportData: Omit<Report, "id" | "createdAt" | "updatedAt">,
): Promise<string> => {
  if (!db) {
    throw new Error("Firebase is not properly configured");
  }

  try {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, REPORTS_COLLECTION), {
      ...reportData,
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating report:", error);
    throw error;
  }
};

export const updateReport = async (
  reportId: string,
  updates: Partial<Omit<Report, "id" | "createdAt" | "updatedAt">>,
): Promise<void> => {
  if (!db) {
    throw new Error("Firebase is not properly configured");
  }

  try {
    const reportRef = doc(db, REPORTS_COLLECTION, reportId);
    await updateDoc(reportRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error updating report:", error);
    throw error;
  }
};

export const deleteReport = async (reportId: string): Promise<void> => {
  if (!db) {
    throw new Error("Firebase is not properly configured");
  }

  try {
    const reportRef = doc(db, REPORTS_COLLECTION, reportId);
    await deleteDoc(reportRef);
  } catch (error) {
    console.error("Error deleting report:", error);
    throw error;
  }
};

export const uploadFile = async (
  userId: string,
  file: File,
): Promise<{ name: string; url: string; size: number; type: string }> => {
  if (!storage) {
    throw new Error("Firebase Storage is not properly configured");
  }

  try {
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `reports/${userId}/${fileName}`;
    const fileRef = ref(storage, filePath);
    
    const snapshot = await uploadBytes(fileRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return {
      name: file.name,
      url: downloadURL,
      size: file.size,
      type: file.type,
    };
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

export const deleteFile = async (fileUrl: string): Promise<void> => {
  if (!storage) {
    throw new Error("Firebase Storage is not properly configured");
  }

  try {
    const fileRef = ref(storage, fileUrl);
    await deleteObject(fileRef);
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
};
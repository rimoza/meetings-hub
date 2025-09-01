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
} from "firebase/firestore";
import { app, isFirebaseConfigured } from "@/lib/firebase/config";
import type { Contact } from "@/types/contact";

const COLLECTION_NAME = "contacts";
const db: Firestore | null =
  app && isFirebaseConfigured() ? getFirestore(app) : null;

// Convert Firestore document to Contact type
const convertDocToContact = (
  doc: QueryDocumentSnapshot<DocumentData>,
): Contact => {
  const data = doc.data();
  return {
    id: doc.id,
    title: data.title,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone,
    alternativePhone: data.alternativePhone,
    company: data.company,
    jobTitle: data.jobTitle,
    location: data.location,
    address: data.address,
    city: data.city,
    state: data.state,
    country: data.country,
    postalCode: data.postalCode,
    notes: data.notes,
    tags: data.tags || [],
    category: data.category || "personal",
    important: data.important || false,
    favorite: data.favorite || false,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
};

// Create a new contact
export const createContact = async (
  userId: string,
  contactData: Omit<Contact, "id" | "createdAt" | "updatedAt">,
) => {
  if (!db) {
    throw new Error("Firebase is not properly configured");
  }

  try {
    // Remove undefined fields to prevent Firebase errors
    const sanitizedData = Object.fromEntries(
      Object.entries(contactData).filter(([, value]) => value !== undefined)
    );

    console.log("Creating contact with data:", sanitizedData);
    console.log("Contact category:", sanitizedData.category);

    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...sanitizedData,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating contact:", error);
    throw error;
  }
};

// Update a contact
export const updateContact = async (
  contactId: string,
  updates: Partial<Omit<Contact, "id" | "createdAt">>,
) => {
  if (!db) {
    throw new Error("Firebase is not properly configured");
  }

  try {
    // Remove undefined fields to prevent Firebase errors
    const sanitizedUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined)
    );

    const contactRef = doc(db, COLLECTION_NAME, contactId);
    await updateDoc(contactRef, {
      ...sanitizedUpdates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating contact:", error);
    throw error;
  }
};

// Delete a contact
export const deleteContact = async (contactId: string) => {
  if (!db) {
    throw new Error("Firebase is not properly configured");
  }

  try {
    await deleteDoc(doc(db, COLLECTION_NAME, contactId));
  } catch (error) {
    console.error("Error deleting contact:", error);
    throw error;
  }
};

// Get all contacts for all users
export const getUserContacts = async (userId: string): Promise<Contact[]> => {
  console.log(userId, 'userId in getUserContacts');
  if (!db) {
    throw new Error("Firebase is not properly configured");
  }

  try {
    // Get all contacts regardless of userId
    const q = query(
      collection(db, COLLECTION_NAME)
    );

    const querySnapshot = await getDocs(q);
    const contacts = querySnapshot.docs.map(convertDocToContact);

    // Sort alphabetically by last name, then first name
    return contacts.sort((a, b) => {
      const lastNameCompare = a.lastName.localeCompare(b.lastName);
      if (lastNameCompare !== 0) return lastNameCompare;
      return a.firstName.localeCompare(b.firstName);
    });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    throw error;
  }
};

// Subscribe to real-time contact updates
export const subscribeContacts = (
  userId: string,
  callback: (contacts: Contact[]) => void,
) => {
  if (!db) {
    console.warn("Firebase not configured, returning empty contacts");
    callback([]);
    return () => {}; // Return empty unsubscribe function
  }

  // Get all contacts regardless of userId
  const q = query(
    collection(db, COLLECTION_NAME)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const contacts = snapshot.docs.map(convertDocToContact);

      // Sort alphabetically
      const sortedContacts = contacts.sort((a, b) => {
        const lastNameCompare = a.lastName.localeCompare(b.lastName);
        if (lastNameCompare !== 0) return lastNameCompare;
        return a.firstName.localeCompare(b.firstName);
      });

      callback(sortedContacts);
    },
    (error) => {
      console.error("Error in contacts subscription:", error);
    },
  );
};

// Get a specific contact
export const getContact = async (
  contactId: string,
  userId: string,
): Promise<Contact | null> => {
  console.log(userId, 'userId in getContact');
  if (!db) {
    throw new Error("Firebase is not properly configured");
  }

  try {
    const contactRef = doc(db, COLLECTION_NAME, contactId);
    const contactDoc = await getDoc(contactRef);

    if (!contactDoc.exists()) {
      return null;
    }

    const contactData = contactDoc.data();
    if (!contactData) {
      return null;
    }
    // Allow access to any contact for any logged-in user
    // No user check needed anymore

    return convertDocToContact(contactDoc as QueryDocumentSnapshot<DocumentData>);
  } catch (error) {
    console.error("Error fetching contact:", error);
    throw error;
  }
};

// Toggle favorite status
export const toggleContactFavorite = async (
  contactId: string,
  favorite: boolean,
) => {
  if (!db) {
    throw new Error("Firebase is not properly configured");
  }

  try {
    const contactRef = doc(db, COLLECTION_NAME, contactId);
    await updateDoc(contactRef, {
      favorite,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error toggling contact favorite:", error);
    throw error;
  }
};

// Toggle important status
export const toggleContactImportant = async (
  contactId: string,
  important: boolean,
) => {
  if (!db) {
    throw new Error("Firebase is not properly configured");
  }

  try {
    const contactRef = doc(db, COLLECTION_NAME, contactId);
    await updateDoc(contactRef, {
      important,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error toggling contact important:", error);
    throw error;
  }
};

// Get favorite contacts
export const getFavoriteContacts = async (userId: string): Promise<Contact[]> => {
  console.log(userId, 'userId in getFavoriteContacts');
  if (!db) {
    throw new Error("Firebase is not properly configured");
  }

  try {
    // Get all favorite contacts regardless of userId
    const q = query(
      collection(db, COLLECTION_NAME),
      where("favorite", "==", true)
    );

    const querySnapshot = await getDocs(q);
    const contacts = querySnapshot.docs.map(convertDocToContact);

    return contacts.sort((a, b) => {
      const lastNameCompare = a.lastName.localeCompare(b.lastName);
      if (lastNameCompare !== 0) return lastNameCompare;
      return a.firstName.localeCompare(b.firstName);
    });
  } catch (error) {
    console.error("Error fetching favorite contacts:", error);
    throw error;
  }
};

// Get important contacts
export const getImportantContacts = async (userId: string): Promise<Contact[]> => {
  console.log(userId, 'userId in getImportantContacts');
  if (!db) {
    throw new Error("Firebase is not properly configured");
  }

  try {
    // Get all important contacts regardless of userId
    const q = query(
      collection(db, COLLECTION_NAME),
      where("important", "==", true)
    );

    const querySnapshot = await getDocs(q);
    const contacts = querySnapshot.docs.map(convertDocToContact);

    return contacts.sort((a, b) => {
      const lastNameCompare = a.lastName.localeCompare(b.lastName);
      if (lastNameCompare !== 0) return lastNameCompare;
      return a.firstName.localeCompare(b.firstName);
    });
  } catch (error) {
    console.error("Error fetching important contacts:", error);
    throw error;
  }
};
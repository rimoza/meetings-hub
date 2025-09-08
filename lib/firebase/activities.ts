import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "./config";

export interface Activity {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  action: "created" | "updated" | "completed" | "deleted" | "scheduled" | "added";
  entityType: "meeting" | "task" | "appointment" | "report" | "contact" | "archive";
  entityId: string;
  entityTitle: string;
  timestamp: Date;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>;
}

export async function logActivity(
  userId: string,
  userName: string,
  action: Activity["action"],
  entityType: Activity["entityType"],
  entityId: string,
  entityTitle: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>
) {
  if (!db) {
    console.warn("Firestore not configured");
    return null;
  }

  try {
    const activitiesRef = collection(db, "activities");
    const activityData = {
      userId,
      userName,
      userAvatar: userName.split(" ").map(n => n[0]).join("").toUpperCase(),
      action,
      entityType,
      entityId,
      entityTitle,
      timestamp: serverTimestamp(),
      metadata: metadata || {},
    };

    const docRef = await addDoc(activitiesRef, activityData);
    return docRef.id;
  } catch (error) {
    console.error("Error logging activity:", error);
    return null;
  }
}

export function subscribeToRecentActivities(
  callback: (activities: Activity[]) => void,
  limitCount: number = 10
) {
  if (!db) {
    console.warn("Firestore not configured");
    callback([]);
    return () => {};
  }

  const activitiesRef = collection(db, "activities");
  const q = query(
    activitiesRef,
    orderBy("timestamp", "desc"),
    limit(limitCount)
  );

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const activities: Activity[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        activities.push({
          id: doc.id,
          userId: data.userId,
          userName: data.userName,
          userAvatar: data.userAvatar,
          action: data.action,
          entityType: data.entityType,
          entityId: data.entityId,
          entityTitle: data.entityTitle,
          timestamp: data.timestamp?.toDate() || new Date(),
          metadata: data.metadata,
        });
      });
      callback(activities);
    },
    (error) => {
      console.error("Error subscribing to activities:", error);
      callback([]);
    }
  );

  return unsubscribe;
}

export function subscribeToUserActivities(
  userId: string,
  callback: (activities: Activity[]) => void,
  limitCount: number = 20
) {
  if (!db) {
    console.warn("Firestore not configured");
    callback([]);
    return () => {};
  }

  const activitiesRef = collection(db, "activities");
  const q = query(
    activitiesRef,
    where("userId", "==", userId),
    orderBy("timestamp", "desc"),
    limit(limitCount)
  );

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const activities: Activity[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        activities.push({
          id: doc.id,
          userId: data.userId,
          userName: data.userName,
          userAvatar: data.userAvatar,
          action: data.action,
          entityType: data.entityType,
          entityId: data.entityId,
          entityTitle: data.entityTitle,
          timestamp: data.timestamp?.toDate() || new Date(),
          metadata: data.metadata,
        });
      });
      callback(activities);
    },
    (error) => {
      console.error("Error subscribing to user activities:", error);
      callback([]);
    }
  );

  return unsubscribe;
}

export async function getRecentActivities(limitCount: number = 20): Promise<Activity[]> {
  if (!db) {
    console.warn("Firestore not configured");
    return [];
  }

  try {
    const activitiesRef = collection(db, "activities");
    const q = query(
      activitiesRef,
      orderBy("timestamp", "desc"),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    const activities: Activity[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      activities.push({
        id: doc.id,
        userId: data.userId,
        userName: data.userName,
        userAvatar: data.userAvatar,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        entityTitle: data.entityTitle,
        timestamp: data.timestamp?.toDate() || new Date(),
        metadata: data.metadata,
      });
    });

    return activities;
  } catch (error) {
    console.error("Error getting recent activities:", error);
    return [];
  }
}
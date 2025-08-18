# Firebase Integration Guide for Meetings Hub

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Firebase Setup](#firebase-setup)
4. [Installation](#installation)
5. [Authentication Integration](#authentication-integration)
6. [Firestore Database Integration](#firestore-database-integration)
7. [Real-time Updates](#real-time-updates)
8. [Security Rules](#security-rules)
9. [Environment Variables](#environment-variables)
10. [Migration Strategy](#migration-strategy)
11. [Testing](#testing)
12. [Deployment](#deployment)

## Overview

This guide provides step-by-step instructions for integrating Firebase into your Meetings Hub application. The integration will replace localStorage with a cloud-based solution, add Gmail-only authentication, and enable real-time synchronization across devices.

### Key Benefits
- **Authentication**: Secure user authentication with Gmail/Google accounts only
- **Real-time Database**: Firestore for instant data synchronization
- **Scalability**: Handle growing user base without infrastructure concerns
- **Security**: Built-in security rules and user permissions
- **Offline Support**: Automatic offline persistence

## Prerequisites

Before starting, ensure you have:
- Node.js 18+ installed
- A Google account for Firebase Console access*
- Basic understanding of Next.js and React
- The current Meetings Hub project running locally

## Firebase Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Name your project: `meetings-hub-prod`
4. Enable Google Analytics (optional)
5. Wait for project creation

### Step 2: Enable Authentication

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Enable the following provider:
   - **Google**: For Gmail authentication only

### Step 3: Create Firestore Database

1. Go to **Firestore Database** → **Create database**
2. Choose **Start in production mode**
3. Select your preferred location (choose closest to your users)
4. Click "Enable"

### Step 4: Register Web App

1. Go to **Project Overview** → **Add app** → **Web**
2. Register app with nickname: `meetings-hub-web`
3. Copy the Firebase configuration object

## Installation

### Step 1: Install Firebase Dependencies

```bash
npm install firebase firebase-admin
```

### Step 2: Install Additional Dependencies

```bash
npm install react-firebase-hooks
```

## Authentication Integration

### Step 1: Create Firebase Configuration

Create `lib/firebase/config.ts`:

```typescript
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize Analytics (client-side only)
export const analytics = typeof window !== 'undefined' 
  ? isSupported().then(yes => yes ? getAnalytics(app) : null)
  : null;

export default app;
```

### Step 2: Update Authentication Context

Replace `contexts/auth-context.tsx`:

```typescript
"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User as FirebaseUser,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase/config';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

interface User {
  uid: string;
  email: string | null;
  name: string | null;
  photoURL?: string | null;
  emailVerified: boolean;
  createdAt?: Date;
  lastLoginAt?: Date;
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  error: string | null;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);
      
      if (firebaseUser) {
        setFirebaseUser(firebaseUser);
        
        // Get or create user document in Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || userData.name,
            photoURL: firebaseUser.photoURL,
            emailVerified: firebaseUser.emailVerified,
            createdAt: userData.createdAt?.toDate(),
            lastLoginAt: new Date()
          });
          
          // Update last login
          await setDoc(userDocRef, { 
            lastLoginAt: serverTimestamp() 
          }, { merge: true });
        } else {
          // Create new user document
          const newUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            emailVerified: firebaseUser.emailVerified,
            createdAt: serverTimestamp(),
            lastLoginAt: serverTimestamp()
          };
          
          await setDoc(userDocRef, newUser);
          setUser({
            ...newUser,
            createdAt: new Date(),
            lastLoginAt: new Date()
          });
        }
      } else {
        setUser(null);
        setFirebaseUser(null);
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Google Sign-In (Gmail only)
  const loginWithGoogle = async () => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push('/');
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  // Sign Out
  const logout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };


  const value = {
    user,
    firebaseUser,
    isLoading,
    error,
    loginWithGoogle,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

## Firestore Database Integration

### Step 1: Create Meetings Service

Create `lib/firebase/meetings.ts`:

```typescript
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
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from './config';
import type { Meeting } from '@/types/meeting';

const COLLECTION_NAME = 'meetings';

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
```

### Step 2: Update Meetings Hook

Replace `hooks/use-meetings.ts`:

```typescript
"use client"

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/auth-context";
import type { Meeting, MeetingFilters } from "@/types/meeting";
import {
  subscribeMeetings,
  createMeeting as createMeetingFirebase,
  updateMeeting as updateMeetingFirebase,
  deleteMeeting as deleteMeetingFirebase,
  toggleMeetingCompletion as toggleMeetingFirebase,
} from "@/lib/firebase/meetings";

export function useMeetings() {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<MeetingFilters>({
    search: "",
    status: "all",
    priority: "all",
    type: "all",
  });

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user?.uid) {
      setMeetings([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    const unsubscribe = subscribeMeetings(user.uid, (meetings) => {
      setMeetings(meetings);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // Filter meetings based on current filters
  const filteredMeetings = useMemo(() => {
    return meetings.filter((meeting) => {
      const matchesSearch =
        meeting.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        meeting.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        meeting.location.toLowerCase().includes(filters.search.toLowerCase()) ||
        meeting.attendees.some((attendee) => 
          attendee.toLowerCase().includes(filters.search.toLowerCase())
        );

      const matchesStatus =
        filters.status === "all" ||
        (filters.status === "completed" && meeting.completed) ||
        (filters.status === "pending" && !meeting.completed);

      const matchesPriority = 
        filters.priority === "all" || meeting.priority === filters.priority;

      const matchesType = 
        filters.type === "all" || meeting.type === filters.type;

      return matchesSearch && matchesStatus && matchesPriority && matchesType;
    });
  }, [meetings, filters]);

  // Get today's meetings
  const todayMeetings = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return meetings.filter((meeting) => meeting.date === today);
  }, [meetings]);

  // Get upcoming meetings
  const upcomingMeetings = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return meetings.filter((meeting) => meeting.date > today);
  }, [meetings]);

  // Get completed meetings
  const completedMeetings = useMemo(() => {
    return meetings.filter((meeting) => meeting.completed);
  }, [meetings]);

  // Create a new meeting
  const createMeeting = async (
    meetingData: Omit<Meeting, "id" | "createdAt" | "updatedAt">
  ) => {
    if (!user?.uid) {
      setError("User not authenticated");
      return;
    }

    try {
      setError(null);
      await createMeetingFirebase(user.uid, meetingData);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Update a meeting
  const updateMeeting = async (
    id: string, 
    updates: Partial<Omit<Meeting, "id">>
  ) => {
    try {
      setError(null);
      await updateMeetingFirebase(id, updates);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Delete a meeting
  const deleteMeeting = async (id: string) => {
    try {
      setError(null);
      await deleteMeetingFirebase(id);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Toggle meeting completion
  const toggleMeetingCompletion = async (id: string) => {
    const meeting = meetings.find((m) => m.id === id);
    if (!meeting) return;

    try {
      setError(null);
      await toggleMeetingFirebase(id, !meeting.completed);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return {
    meetings,
    filteredMeetings,
    todayMeetings,
    upcomingMeetings,
    completedMeetings,
    filters,
    setFilters,
    createMeeting,
    updateMeeting,
    deleteMeeting,
    toggleMeetingCompletion,
    isLoading,
    error,
  };
}
```

## Real-time Updates

The real-time updates are already integrated in the meetings hook using Firestore's `onSnapshot` listener. This ensures:
- Instant synchronization across all devices
- Automatic updates when data changes
- Optimistic UI updates with error handling

## Security Rules

### Firestore Security Rules

Go to Firestore → Rules and add:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Meetings are private to each user
    match /meetings/{meetingId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null 
        && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

### Authentication Security

Add to Firebase Authentication → Settings → Authorized domains:
- Your production domain
- Your staging domain
- localhost (for development)

## Environment Variables

### Step 1: Create `.env.local`

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id

# Optional: Admin SDK (for server-side operations)
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=your-service-account-email
FIREBASE_ADMIN_PRIVATE_KEY="your-private-key"
```

### Step 2: Add to `.gitignore`

```bash
# Environment files
.env.local
.env.production
```

## Migration Strategy

### Phase 1: Parallel Implementation (Week 1-2)
1. Set up Firebase project and configuration
2. Implement Firebase authentication alongside existing auth
3. Test Firebase services in development

### Phase 2: Data Migration (Week 3)
1. Create migration script for existing users
2. Implement dual-write pattern (write to both localStorage and Firebase)
3. Verify data integrity

### Phase 3: Gradual Rollout (Week 4)
1. Enable Firebase for new users first
2. Migrate existing users in batches
3. Monitor performance and errors

### Phase 4: Cleanup (Week 5)
1. Remove localStorage implementation
2. Update all components to use Firebase hooks
3. Performance optimization

### Migration Script Example

Create `scripts/migrate-to-firebase.ts`:

```typescript
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Initialize admin SDK
const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
});

const db = getFirestore();
const auth = getAuth();

async function migrateUsers() {
  // Note: Since we're using Gmail-only authentication,
  // existing users will need to sign in with their Google accounts.
  // This migration script will only migrate user data, not authentication.
  
  const existingUsers = getExistingUsers(); // Implement based on your current storage
  
  console.log('Gmail-only authentication enabled.');
  console.log('Users will need to sign in with their Google accounts.');
  console.log('User data will be created upon first Google sign-in.');
  
  // Optionally, you can prepare a mapping of email addresses to existing data
  // to be imported when users first sign in with Google
  const migrationMap = new Map();
  
  for (const user of existingUsers) {
    migrationMap.set(user.email, {
      previousData: user,
      migratedAt: new Date(),
    });
    console.log(`Prepared migration data for: ${user.email}`);
  }
  
  // Store this mapping for use during first Google sign-in
  // Implementation depends on your temporary storage solution
  await storeMigrationMap(migrationMap);
}

// Run migration
migrateUsers().then(() => {
  console.log('Migration complete');
  process.exit(0);
}).catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
```

## Testing

### Unit Tests

Create `__tests__/firebase/auth.test.ts`:

```typescript
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '@/contexts/auth-context';
import { signInWithEmailAndPassword } from 'firebase/auth';

jest.mock('firebase/auth');

describe('Firebase Authentication', () => {
  test('should login with Google successfully', async () => {
    const { result } = renderHook(() => useAuth());
    
    await act(async () => {
      await result.current.loginWithGoogle();
    });
    
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.email).toContain('@gmail.com');
  });
  
  test('should handle Google login errors', async () => {
    const { result } = renderHook(() => useAuth());
    
    // Mock a failed Google sign-in
    jest.spyOn(console, 'error').mockImplementation();
    
    await act(async () => {
      try {
        await result.current.loginWithGoogle();
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
    
    expect(result.current.isAuthenticated).toBe(false);
  });
});
```

### Integration Tests

```typescript
describe('Meetings Integration', () => {
  test('should create and retrieve meeting', async () => {
    const { result } = renderHook(() => useMeetings());
    
    const newMeeting = {
      title: 'Test Meeting',
      description: 'Test Description',
      date: '2024-12-25',
      time: '10:00',
      duration: 60,
      location: 'Virtual',
      attendees: ['test@example.com'],
      completed: false,
      priority: 'medium' as const,
      type: 'meeting' as const,
    };
    
    await act(async () => {
      await result.current.createMeeting(newMeeting);
    });
    
    expect(result.current.meetings).toContainEqual(
      expect.objectContaining(newMeeting)
    );
  });
});
```

## Deployment

### Vercel Deployment

1. Add environment variables in Vercel dashboard
2. Configure Firebase authorized domains
3. Enable CORS for your domain

### Environment Variables in Vercel

```bash
# In Vercel Dashboard → Settings → Environment Variables
NEXT_PUBLIC_FIREBASE_API_KEY=[your-api-key]
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=[your-auth-domain]
NEXT_PUBLIC_FIREBASE_PROJECT_ID=[your-project-id]
# ... add all other variables
```

### Production Checklist

- [ ] Enable App Check for additional security
- [ ] Set up Firebase Performance Monitoring
- [ ] Configure Firebase Cloud Messaging for notifications
- [ ] Enable Firebase Crashlytics for error tracking
- [ ] Set up backup and disaster recovery
- [ ] Configure budget alerts in Firebase Console
- [ ] Review and tighten security rules
- [ ] Enable audit logging
- [ ] Set up monitoring dashboards
- [ ] Document API rate limits

## Advanced Features

### 1. Offline Support

```typescript
import { enableIndexedDbPersistence } from 'firebase/firestore';

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Multiple tabs open, persistence enabled in first tab only');
  } else if (err.code === 'unimplemented') {
    console.warn('Browser doesn't support persistence');
  }
});
```

### 2. Cloud Functions

Create `functions/index.ts`:

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

// Send email reminder for meetings
export const sendMeetingReminder = functions.pubsub
  .schedule('every 1 hours')
  .onRun(async (context) => {
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
    
    const meetings = await admin.firestore()
      .collection('meetings')
      .where('date', '==', now.toISOString().split('T')[0])
      .where('reminderSent', '==', false)
      .get();
    
    for (const meeting of meetings.docs) {
      const data = meeting.data();
      const meetingTime = new Date(`${data.date}T${data.time}`);
      
      if (meetingTime > now && meetingTime <= oneHourLater) {
        // Send reminder (implement email service)
        await sendReminderEmail(data);
        
        // Mark reminder as sent
        await meeting.ref.update({ reminderSent: true });
      }
    }
  });
```

### 3. Analytics Integration

```typescript
import { logEvent } from 'firebase/analytics';
import { analytics } from '@/lib/firebase/config';

// Track meeting creation
export const trackMeetingCreated = async (meetingType: string) => {
  const analyticsInstance = await analytics;
  if (analyticsInstance) {
    logEvent(analyticsInstance, 'meeting_created', {
      meeting_type: meetingType,
      timestamp: new Date().toISOString(),
    });
  }
};

// Track user engagement
export const trackFeatureUsage = async (feature: string) => {
  const analyticsInstance = await analytics;
  if (analyticsInstance) {
    logEvent(analyticsInstance, 'feature_used', {
      feature_name: feature,
    });
  }
};
```

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Add your domain to Firebase Console → Authentication → Settings → Authorized domains
   - Check Firebase project settings

2. **Gmail Login Not Working**
   - Ensure Google provider is enabled in Firebase Console
   - Verify OAuth consent screen is configured
   - Check that authorized domains include your app domain

3. **Permission Denied**
   - Review Firestore security rules
   - Ensure user is authenticated via Google
   - Check if userId matches document owner

4. **Real-time Updates Not Working**
   - Verify WebSocket connections are allowed
   - Check browser console for errors
   - Ensure Firestore indexes are created

5. **Slow Performance**
   - Enable Firestore composite indexes
   - Implement pagination for large datasets
   - Use Firebase Performance Monitoring

## Support & Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Next.js Firebase Examples](https://github.com/vercel/next.js/tree/canary/examples)
- [Firebase Community](https://firebase.google.com/community)
- [Stack Overflow Firebase Tag](https://stackoverflow.com/questions/tagged/firebase)

## Conclusion

This guide provides a comprehensive approach to integrating Firebase into your Meetings Hub application with Gmail-only authentication. The integration will provide:

- Secure authentication via Google/Gmail accounts only
- Real-time data synchronization
- Offline support
- Professional-grade infrastructure
- Simplified user management (no password resets needed)

Follow the phases carefully, test thoroughly, and monitor the migration process. With Firebase and Gmail-only authentication, your Meetings Hub will be ready to scale to thousands of users while maintaining excellent performance, reliability, and simplified authentication flow.
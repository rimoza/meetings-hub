"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User as FirebaseUser,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  getAuth,
} from 'firebase/auth';
import { app, isFirebaseConfigured } from '@/lib/firebase/config';
import { doc, setDoc, getDoc, serverTimestamp, getFirestore } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;
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
    if (!auth || !isFirebaseConfigured()) {
      setIsLoading(false);
      return;
    }
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);
      
      if (firebaseUser) {
        setFirebaseUser(firebaseUser);
        
        // Get or create user document in Firestore
        if (!db) {
          console.warn('Firestore not configured, using basic user data');
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            emailVerified: firebaseUser.emailVerified,
            createdAt: new Date(),
            lastLoginAt: new Date()
          });
          setIsLoading(false);
          return;
        }

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
    if (!auth || !isFirebaseConfigured()) {
      setError('Firebase is not properly configured. Please set up your Firebase project.');
      return;
    }
    
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      
      // Configure provider to only allow Gmail accounts
      provider.setCustomParameters({
        hd: 'gmail.com' // Restrict to gmail.com domain
      });
      
      // Add required scopes
      provider.addScope('email');
      provider.addScope('profile');
      
      const result = await signInWithPopup(auth, provider);
      
      // Verify the user has a Gmail address
      if (result.user.email && !result.user.email.endsWith('@gmail.com')) {
        await signOut(auth);
        throw new Error('Only Gmail accounts are allowed');
      }
      
      router.push('/');
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
        throw error;
      } else {
        setError('An unknown error occurred');
        throw error;
      }
    }
  };

  // Sign Out
  const logout = async () => {
    if (!auth) {
      router.push('/login');
      return;
    }
    
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
        throw error;
      } else {
        setError('An unknown error occurred');
        throw error;
      }
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
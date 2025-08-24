"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  User as FirebaseUser,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  getAuth,
} from "firebase/auth";
import { app, isFirebaseConfigured } from "@/lib/firebase/config";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  getFirestore,
} from "firebase/firestore";
import { useRouter } from "next/navigation";

const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;

// Helper function to convert Firebase error codes to user-friendly messages
const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/operation-not-allowed':
      return 'Email/password authentication is not enabled.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please try again.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    default:
      return 'An error occurred. Please try again.';
  }
};
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
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signupWithEmail: (email: string, password: string, name: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
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
          console.warn("Firestore not configured, using basic user data");
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            emailVerified: firebaseUser.emailVerified,
            createdAt: new Date(),
            lastLoginAt: new Date(),
          });
          setIsLoading(false);
          return;
        }

        try {
          const userDocRef = doc(db, "users", firebaseUser.uid);
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
              lastLoginAt: new Date(),
            });

            // Update last login
            try {
              await setDoc(
                userDocRef,
                {
                  lastLoginAt: serverTimestamp(),
                },
                { merge: true },
              );
            } catch (updateError) {
              console.warn("Failed to update last login (offline mode):", updateError);
            }
          } else {
            // Create new user document
            const newUser = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              emailVerified: firebaseUser.emailVerified,
              createdAt: serverTimestamp(),
              lastLoginAt: serverTimestamp(),
            };

            try {
              await setDoc(userDocRef, newUser);
            } catch (createError) {
              console.warn("Failed to create user document (offline mode):", createError);
            }
            
            setUser({
              ...newUser,
              createdAt: new Date(),
              lastLoginAt: new Date(),
            });
          }
        } catch (firestoreError) {
          console.warn("Firestore unavailable, using basic user data:", firestoreError);
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            emailVerified: firebaseUser.emailVerified,
            createdAt: new Date(),
            lastLoginAt: new Date(),
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
      setError(
        "Firebase is not properly configured. Please set up your Firebase project.",
      );
      return;
    }

    try {
      setError(null);
      const provider = new GoogleAuthProvider();

      // Configure provider to only allow Gmail accounts
      provider.setCustomParameters({
        hd: "gmail.com", // Restrict to gmail.com domain
      });

      // Add required scopes
      provider.addScope("email");
      provider.addScope("profile");

      const result = await signInWithPopup(auth, provider);

      // Verify the user has a Gmail address
      if (result.user.email && !result.user.email.endsWith("@gmail.com")) {
        await signOut(auth);
        throw new Error("Only Gmail accounts are allowed");
      }

      router.push("/");
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
        throw error;
      } else {
        setError("An unknown error occurred");
        throw error;
      }
    }
  };

  // Email/Password Sign-In
  const loginWithEmail = async (email: string, password: string) => {
    if (!auth || !isFirebaseConfigured()) {
      setError(
        "Firebase is not properly configured. Please set up your Firebase project.",
      );
      return;
    }

    try {
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/");
    } catch (error: unknown) {
      if (error instanceof Error) {
        const errorMessage = getAuthErrorMessage(error.message);
        setError(errorMessage);
        throw error;
      } else {
        setError("An unknown error occurred");
        throw error;
      }
    }
  };

  // Email/Password Sign-Up
  const signupWithEmail = async (email: string, password: string, name: string) => {
    if (!auth || !isFirebaseConfigured()) {
      setError(
        "Firebase is not properly configured. Please set up your Firebase project.",
      );
      return;
    }

    try {
      setError(null);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name
      await updateProfile(result.user, {
        displayName: name,
      });

      // Send email verification
      await sendEmailVerification(result.user);
      
      router.push("/");
    } catch (error: unknown) {
      if (error instanceof Error) {
        const errorMessage = getAuthErrorMessage(error.message);
        setError(errorMessage);
        throw error;
      } else {
        setError("An unknown error occurred");
        throw error;
      }
    }
  };

  // Reset Password
  const resetPassword = async (email: string) => {
    if (!auth || !isFirebaseConfigured()) {
      setError(
        "Firebase is not properly configured. Please set up your Firebase project.",
      );
      return;
    }

    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (error: unknown) {
      if (error instanceof Error) {
        const errorMessage = getAuthErrorMessage(error.message);
        setError(errorMessage);
        throw error;
      } else {
        setError("An unknown error occurred");
        throw error;
      }
    }
  };

  // Sign Out
  const logout = async () => {
    if (!auth) {
      router.push("/login");
      return;
    }

    try {
      await signOut(auth);
      router.push("/login");
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
        throw error;
      } else {
        setError("An unknown error occurred");
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
    loginWithEmail,
    signupWithEmail,
    resetPassword,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

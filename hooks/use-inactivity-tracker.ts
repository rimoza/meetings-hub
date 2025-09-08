"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
const WARNING_TIME = 5 * 60  * 1000; // Show warning 5 minutes before logout

export function useInactivityTracker() {
  const { logout, user } = useAuth();
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const hasShownWarningRef = useRef<boolean>(false);
  const warningToastIdRef = useRef<string | number | undefined>(undefined);

  const handleLogout = useCallback(async () => {
    // Dismiss any existing warning toast
    if (warningToastIdRef.current) {
      toast.dismiss(warningToastIdRef.current);
    }
    
    toast.error("You have been logged out due to inactivity", {
      id: "inactivity-logout",
    });
    await logout();
    router.push("/login");
  }, [logout, router]);

  const showWarning = useCallback(() => {
    // Only show warning once per inactivity period
    if (hasShownWarningRef.current) return;
    
    hasShownWarningRef.current = true;
    warningToastIdRef.current = toast.warning("You will be logged out in 5 minutes due to inactivity", {
      duration: 10000,
      id: "inactivity-warning",
      action: {
        label: "Stay logged in",
        onClick: () => {
          resetTimer();
          hasShownWarningRef.current = false; // Reset for next inactivity period
          toast.success("Session extended", {
            id: "session-extended",
            duration: 3000,
          });
        },
      },
    });
  }, []);

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    hasShownWarningRef.current = false; // Reset warning flag when activity resumes
    
    // Clear existing timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }

    // Dismiss any existing warning toast when user becomes active
    if (warningToastIdRef.current) {
      toast.dismiss(warningToastIdRef.current);
      warningToastIdRef.current = undefined;
    }

    // Only set timeouts if user is logged in
    if (user) {
      // Set warning timeout (25 minutes)
      warningTimeoutRef.current = setTimeout(showWarning, INACTIVITY_TIMEOUT - WARNING_TIME);
      
      // Set logout timeout (30 minutes)
      timeoutRef.current = setTimeout(handleLogout, INACTIVITY_TIMEOUT);
    }
  }, [user, handleLogout, showWarning]);

  useEffect(() => {
    if (!user) {
      // Clear timeouts if user is not logged in
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
      return;
    }

    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "keydown",
      "scroll",
      "touchstart",
      "click",
      "focus",
    ];

    const handleActivity = () => {
      // Throttle activity tracking to avoid excessive timer resets
      const now = Date.now();
      if (now - lastActivityRef.current > 1000) { // Only reset if more than 1 second has passed
        resetTimer();
      }
    };

    // Add event listeners
    events.forEach((event) => {
      document.addEventListener(event, handleActivity);
    });

    // Initial timer setup
    resetTimer();

    // Cleanup
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, [user, resetTimer]);

  // Also track visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        // Check if user was away for more than the timeout period
        const awayTime = Date.now() - lastActivityRef.current;
        if (awayTime > INACTIVITY_TIMEOUT) {
          handleLogout();
        } else if (awayTime > INACTIVITY_TIMEOUT - WARNING_TIME) {
          showWarning();
        } else {
          resetTimer();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user, handleLogout, showWarning, resetTimer]);

  return {
    resetTimer,
    lastActivity: lastActivityRef.current,
  };
}
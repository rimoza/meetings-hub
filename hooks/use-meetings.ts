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
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
        throw err;
      } else {
        setError("An unknown error occurred");
        throw err;
      }
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
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
        throw err;
      } else {
        setError("An unknown error occurred");
        throw err;
      }
    }
  };

  // Delete a meeting
  const deleteMeeting = async (id: string) => {
    try {
      setError(null);
      await deleteMeetingFirebase(id);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
        throw err;
      } else {
        setError("An unknown error occurred");
        throw err;
      }
    }
  };

  // Toggle meeting completion
  const toggleMeetingCompletion = async (id: string) => {
    const meeting = meetings.find((m) => m.id === id);
    if (!meeting) return;

    try {
      setError(null);
      await toggleMeetingFirebase(id, !meeting.completed);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
        throw err;
      } else {
        setError("An unknown error occurred");
        throw err;
      }
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
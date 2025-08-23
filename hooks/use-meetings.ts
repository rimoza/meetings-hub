"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useReminders } from "@/hooks/use-reminders";
import type { Meeting, MeetingFilters } from "@/types/meeting";
import {
  subscribeMeetings,
  createMeeting as createMeetingFirebase,
  updateMeeting as updateMeetingFirebase,
  deleteMeeting as deleteMeetingFirebase,
  toggleMeetingCompletion as toggleMeetingFirebase,
  addMeetingNote as addMeetingNoteFirebase,
} from "@/lib/firebase/meetings";

export function useMeetings() {
  const { user } = useAuth();
  const { scheduleReminders, isPermissionGranted, isRemindersEnabled } =
    useReminders();
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
      console.log(`Received ${meetings.length} meetings from Firebase`);
      setMeetings(meetings);
      setIsLoading(false);

      // Schedule reminders for all meetings when data changes
      if (isPermissionGranted && isRemindersEnabled) {
        scheduleReminders(meetings);
      }
    });

    return () => unsubscribe();
  }, [user?.uid, isPermissionGranted, isRemindersEnabled, scheduleReminders]);

  // Reschedule reminders when permission is granted or reminders are enabled
  useEffect(() => {
    if (isPermissionGranted && isRemindersEnabled && meetings.length > 0) {
      scheduleReminders(meetings);
    }
  }, [isPermissionGranted, isRemindersEnabled, meetings, scheduleReminders]);

  // Filter meetings based on current filters and sort by completion status, then by date and time
  const filteredMeetings = useMemo(() => {
    return meetings
      .filter((meeting) => {
        const matchesSearch =
          meeting.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          meeting.description
            .toLowerCase()
            .includes(filters.search.toLowerCase()) ||
          meeting.location
            .toLowerCase()
            .includes(filters.search.toLowerCase()) ||
          meeting.attendees.some((attendee) =>
            attendee.toLowerCase().includes(filters.search.toLowerCase()),
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
      })
      .sort((a, b) => {
        // First sort by completion status (pending meetings first, completed meetings last)
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1; // false (pending) comes before true (completed)
        }

        // Within the same completion status, sort by date and time
        const dateTimeA = new Date(`${a.date}T${a.time}`);
        const dateTimeB = new Date(`${b.date}T${b.time}`);

        // Sort in ascending order (earliest meetings first)
        return dateTimeA.getTime() - dateTimeB.getTime();
      });
  }, [meetings, filters]);

  // Get today's meetings sorted by completion status, then by time
  const todayMeetings = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return meetings
      .filter((meeting) => {
        return meeting.date === today;
      })
      .sort((a, b) => {
        // First sort by completion status (pending meetings first, completed meetings last)
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1; // false (pending) comes before true (completed)
        }

        // Within the same completion status, sort by date and time
        const dateTimeA = new Date(`${a.date}T${a.time}`);
        const dateTimeB = new Date(`${b.date}T${b.time}`);

        // Sort in ascending order (earliest meetings first)
        return dateTimeA.getTime() - dateTimeB.getTime();
      });
  }, [meetings]);

  // Get upcoming meetings sorted by completion status, then by time
  const upcomingMeetings = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return meetings
      .filter((meeting) => {
        return meeting.date > today;
      })
      .sort((a, b) => {
        // First sort by completion status (pending meetings first, completed meetings last)
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1; // false (pending) comes before true (completed)
        }

        // Within the same completion status, sort by date and time
        const dateTimeA = new Date(`${a.date}T${a.time}`);
        const dateTimeB = new Date(`${b.date}T${b.time}`);

        // Sort in ascending order (earliest meetings first)
        return dateTimeA.getTime() - dateTimeB.getTime();
      });
  }, [meetings]);

  // Get completed meetings sorted by time (most recent first for completed meetings)
  const completedMeetings = useMemo(() => {
    return meetings
      .filter((meeting) => meeting.completed)
      .sort((a, b) => {
        // Create Date objects for comparison
        const dateTimeA = new Date(`${a.date}T${a.time}`);
        const dateTimeB = new Date(`${b.date}T${b.time}`);

        // Sort in descending order for completed meetings (most recent completed first)
        return dateTimeB.getTime() - dateTimeA.getTime();
      });
  }, [meetings]);

  // Get the next upcoming meeting (earliest non-completed meeting from now)
  const nextMeeting = useMemo(() => {
    const now = new Date();
    return meetings
      .filter((meeting) => !meeting.completed)
      .filter((meeting) => {
        const meetingDateTime = new Date(`${meeting.date}T${meeting.time}`);
        return meetingDateTime >= now;
      })
      .sort((a, b) => {
        // Create Date objects for comparison
        const dateTimeA = new Date(`${a.date}T${a.time}`);
        const dateTimeB = new Date(`${b.date}T${b.time}`);

        // Sort in ascending order (earliest meetings first)
        return dateTimeA.getTime() - dateTimeB.getTime();
      })[0]; // Get the first (earliest) meeting
  }, [meetings]);

  // Create a new meeting
  const createMeeting = async (
    meetingData: Omit<Meeting, "id" | "createdAt" | "updatedAt">,
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
    updates: Partial<Omit<Meeting, "id">>,
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

  // Add a note to a meeting
  const addMeetingNote = async (
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
    if (!user?.uid) {
      setError("User not authenticated");
      return;
    }

    try {
      setError(null);
      await addMeetingNoteFirebase(
        user.uid,
        meetingId,
        noteContent,
        noteType,
        author,
        taskDetails,
      );
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
    nextMeeting,
    filters,
    setFilters,
    createMeeting,
    updateMeeting,
    deleteMeeting,
    toggleMeetingCompletion,
    addMeetingNote,
    isLoading,
    error,
  };
}

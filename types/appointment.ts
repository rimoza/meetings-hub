export interface Appointment {
  id: string;
  dailyNumber: number; // Daily appointment number (resets each day)
  title: string;
  date: string;
  time: string;
  status: "scheduled" | "confirmed" | "cancelled" | "completed" | "no-show";
  attendeePhone?: string;
  attendeeCount?: number; // Number of attendees
  duration?: number; // in minutes
  location?: string;
  description?: string;
  reminderSent?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppointmentFilters {
  search: string;
  status: "all" | "scheduled" | "confirmed" | "cancelled" | "completed" | "no-show";
  date: "all" | "today" | "week" | "month";
}

export type AppointmentStatus = "scheduled" | "confirmed" | "cancelled" | "completed" | "no-show";

export type ViewMode = "table" | "card";
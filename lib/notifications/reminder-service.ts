"use client"

import type { Meeting } from '@/types/meeting';

export interface ReminderConfig {
  id: string;
  meetingId: string;
  reminderTime: number; // minutes before meeting
  isScheduled: boolean;
  timeoutId?: NodeJS.Timeout;
}

export class ReminderService {
  private reminders: Map<string, ReminderConfig> = new Map();
  private isNotificationSupported: boolean = false;
  private isNotificationGranted: boolean = false;

  constructor() {
    this.checkNotificationSupport();
  }

  private checkNotificationSupport(): void {
    this.isNotificationSupported = 'Notification' in window;
    this.isNotificationGranted = this.isNotificationSupported && 
      Notification.permission === 'granted';
  }

  async requestNotificationPermission(): Promise<boolean> {
    if (!this.isNotificationSupported) {
      console.warn('Notifications are not supported in this browser');
      return false;
    }

    if (Notification.permission === 'granted') {
      this.isNotificationGranted = true;
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      this.isNotificationGranted = permission === 'granted';
      return this.isNotificationGranted;
    }

    return false;
  }

  private showNotification(meeting: Meeting, reminderTime: number): void {
    if (!this.isNotificationGranted) {
      console.warn('Notification permission not granted');
      return;
    }

    const timeLabel = this.getTimeLabel(reminderTime);
    const meetingTime = `${meeting.date} at ${meeting.time}`;
    
    const notification = new Notification(`Meeting Reminder - ${timeLabel}`, {
      body: `${meeting.title}\n${meetingTime}\nLocation: ${meeting.location}`,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      tag: `meeting-${meeting.id}-${reminderTime}`,
      requireInteraction: true
    });

    // Auto-close notification after 10 seconds
    setTimeout(() => {
      notification.close();
    }, 10000);

    notification.onclick = () => {
      window.focus();
      notification.close();
      // Could navigate to meeting details page here
    };
  }

  private getTimeLabel(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    const hours = Math.floor(minutes / 60);
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }

  private calculateReminderTime(meeting: Meeting, minutesBefore: number): number {
    const [year, month, day] = meeting.date.split('-').map(Number);
    const [hours, minutes] = meeting.time.split(':').map(Number);
    
    const meetingDateTime = new Date(year, month - 1, day, hours, minutes);
    const reminderDateTime = new Date(meetingDateTime.getTime() - (minutesBefore * 60 * 1000));
    const delayMs = reminderDateTime.getTime() - Date.now();
    
    console.log(`Meeting: ${meeting.title}`);
    console.log(`Meeting DateTime: ${meetingDateTime.toLocaleString()}`);
    console.log(`Reminder DateTime: ${reminderDateTime.toLocaleString()}`);
    console.log(`Delay (ms): ${delayMs}`);
    
    return delayMs;
  }

  scheduleReminder(meeting: Meeting, minutesBefore: number): string | null {
    if (!this.isNotificationGranted) {
      console.warn('Cannot schedule reminder: notification permission not granted');
      return null;
    }

    const reminderId = `${meeting.id}-${minutesBefore}`;
    
    // Clear existing reminder if it exists
    this.clearReminder(reminderId);

    const delayMs = this.calculateReminderTime(meeting, minutesBefore);
    
    // Don't schedule if the reminder time has already passed
    if (delayMs <= 0) {
      console.log(`Reminder time has passed for meeting ${meeting.title}`);
      return null;
    }

    const timeoutId = setTimeout(() => {
      this.showNotification(meeting, minutesBefore);
      this.reminders.delete(reminderId);
    }, delayMs);

    const reminderConfig: ReminderConfig = {
      id: reminderId,
      meetingId: meeting.id,
      reminderTime: minutesBefore,
      isScheduled: true,
      timeoutId
    };

    this.reminders.set(reminderId, reminderConfig);
    
    const reminderDate = new Date(Date.now() + delayMs);
    console.log(`Reminder scheduled for ${meeting.title} at ${reminderDate.toLocaleString()}`);
    
    return reminderId;
  }

  clearReminder(reminderId: string): void {
    const reminder = this.reminders.get(reminderId);
    if (reminder?.timeoutId) {
      clearTimeout(reminder.timeoutId);
    }
    this.reminders.delete(reminderId);
  }

  clearAllReminders(): void {
    for (const [reminderId] of this.reminders) {
      this.clearReminder(reminderId);
    }
  }

  scheduleMeetingReminders(meeting: Meeting): string[] {
    const reminderTimes = [5, 30, 60]; // 5 minutes, 30 minutes, 1 hour
    const scheduledReminders: string[] = [];

    for (const minutes of reminderTimes) {
      const reminderId = this.scheduleReminder(meeting, minutes);
      if (reminderId) {
        scheduledReminders.push(reminderId);
      }
    }

    return scheduledReminders;
  }

  rescheduleAllMeetingReminders(meetings: Meeting[]): void {
    // Clear all existing reminders
    this.clearAllReminders();

    // Schedule reminders for all upcoming meetings
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    meetings
      .filter(meeting => {
        // Only schedule for future meetings
        return meeting.date > today || 
               (meeting.date === today && meeting.time > currentTime);
      })
      .forEach(meeting => {
        this.scheduleMeetingReminders(meeting);
      });
  }

  getScheduledReminders(): ReminderConfig[] {
    return Array.from(this.reminders.values());
  }

  isNotificationEnabled(): boolean {
    return this.isNotificationGranted;
  }
}

// Export a singleton instance
export const reminderService = new ReminderService();
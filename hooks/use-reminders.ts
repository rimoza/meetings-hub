"use client"

import { useEffect, useState, useCallback } from 'react';
import { reminderService } from '@/lib/notifications/reminder-service';
import type { Meeting } from '@/types/meeting';

export function useReminders() {
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  useEffect(() => {
    setIsPermissionGranted(reminderService.isNotificationEnabled());
  }, []);

  const requestPermission = useCallback(async () => {
    setIsRequestingPermission(true);
    try {
      const granted = await reminderService.requestNotificationPermission();
      setIsPermissionGranted(granted);
      return granted;
    } finally {
      setIsRequestingPermission(false);
    }
  }, []);

  const scheduleReminders = useCallback((meetings: Meeting[]) => {
    if (!isPermissionGranted) {
      console.warn('Cannot schedule reminders: permission not granted');
      return;
    }
    
    reminderService.rescheduleAllMeetingReminders(meetings);
  }, [isPermissionGranted]);

  const clearAllReminders = useCallback(() => {
    reminderService.clearAllReminders();
  }, []);

  return {
    isPermissionGranted,
    isRequestingPermission,
    requestPermission,
    scheduleReminders,
    clearAllReminders,
  };
}
"use client"

import { useEffect, useState, useCallback } from 'react';
import { reminderService } from '@/lib/notifications/reminder-service';
import type { Meeting } from '@/types/meeting';

export function useReminders() {
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [isRemindersEnabled, setIsRemindersEnabled] = useState(false);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  useEffect(() => {
    if (reminderService && typeof window !== 'undefined') {
      setIsPermissionGranted(reminderService.hasNotificationPermission());
      setIsRemindersEnabled(reminderService.isRemindersToggleEnabled());
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!reminderService) return false;
    
    setIsRequestingPermission(true);
    try {
      const granted = await reminderService.requestNotificationPermission();
      setIsPermissionGranted(granted);
      return granted;
    } finally {
      setIsRequestingPermission(false);
    }
  }, []);

  const toggleReminders = useCallback((enabled: boolean) => {
    if (!reminderService) return;
    
    reminderService.setRemindersEnabled(enabled);
    setIsRemindersEnabled(enabled);
  }, []);

  const scheduleReminders = useCallback((meetings: Meeting[]) => {
    if (!reminderService) return;
    
    if (!isPermissionGranted || !isRemindersEnabled) {
      console.warn('Cannot schedule reminders: permission not granted or reminders disabled');
      return;
    }
    
    reminderService.rescheduleAllMeetingReminders(meetings);
  }, [isPermissionGranted, isRemindersEnabled]);

  const clearAllReminders = useCallback(() => {
    if (!reminderService) return;
    
    reminderService.clearAllReminders();
  }, []);

  return {
    isPermissionGranted,
    isRemindersEnabled,
    isRequestingPermission,
    requestPermission,
    toggleReminders,
    scheduleReminders,
    clearAllReminders,
  };
}
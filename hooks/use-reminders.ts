"use client"

import { useEffect, useState, useCallback } from 'react';
import { getReminderService } from '@/lib/notifications/reminder-service';
import type { Meeting } from '@/types/meeting';

export function useReminders() {
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [isRemindersEnabled, setIsRemindersEnabled] = useState(false);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [reminderService, setReminderService] = useState<ReturnType<typeof getReminderService>>(null);

  useEffect(() => {
    // Initialize reminder service only on client side after mount
    const service = getReminderService();
    setReminderService(service);
    
    if (service) {
      setIsPermissionGranted(service.hasNotificationPermission());
      setIsRemindersEnabled(service.isRemindersToggleEnabled());
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
  }, [reminderService]);

  const toggleReminders = useCallback((enabled: boolean) => {
    if (!reminderService) return;
    
    reminderService.setRemindersEnabled(enabled);
    setIsRemindersEnabled(enabled);
  }, [reminderService]);

  const scheduleReminders = useCallback((meetings: Meeting[]) => {
    if (!reminderService) return;
    
    if (!isPermissionGranted || !isRemindersEnabled) {
      console.warn('Cannot schedule reminders: permission not granted or reminders disabled');
      return;
    }
    
    reminderService.rescheduleAllMeetingReminders(meetings);
  }, [reminderService, isPermissionGranted, isRemindersEnabled]);

  const clearAllReminders = useCallback(() => {
    if (!reminderService) return;
    
    reminderService.clearAllReminders();
  }, [reminderService]);

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
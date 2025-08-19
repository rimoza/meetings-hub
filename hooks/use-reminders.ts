"use client"

import { useEffect, useState, useCallback } from 'react';
import { getReminderService } from '@/lib/notifications/reminder-service';
import type { Meeting } from '@/types/meeting';

export function useReminders() {
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [isRemindersEnabled, setIsRemindersEnabled] = useState(false);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [reminderService, setReminderService] = useState<ReturnType<typeof getReminderService>>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [serviceStatus, setServiceStatus] = useState<any>(null);

  useEffect(() => {
    let isSubscribed = true;
    
    const initializeService = async () => {
      if (!isSubscribed) return;
      
      setIsMounted(true);
      
      // Add a small delay to ensure proper hydration
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (!isSubscribed) return;
      
      try {
        // Initialize reminder service only on client side after mount
        const service = getReminderService();
        
        if (!isSubscribed) return;
        
        setReminderService(service);
        
        if (service) {
          // Get initial status
          const status = service.getServiceStatus();
          setServiceStatus(status);
          console.log(serviceStatus, 'Service status initialized');
          setIsPermissionGranted(service.hasNotificationPermission());
          setIsRemindersEnabled(service.isRemindersToggleEnabled());
          
          // Set up periodic permission check for production environment
          const permissionCheckInterval = setInterval(() => {
            if (service && isSubscribed) {
              const currentPermission = service.hasNotificationPermission();
              const currentEnabled = service.isRemindersToggleEnabled();
              
              setIsPermissionGranted(currentPermission);
              setIsRemindersEnabled(currentEnabled);
              
              // Update service status
              const updatedStatus = service.getServiceStatus();
              setServiceStatus(updatedStatus);
            }
          }, 5000); // Check every 5 seconds
          
          return () => {
            clearInterval(permissionCheckInterval);
          };
        }
      } catch (error) {
        console.error('[useReminders] Initialization error:', error);
      }
    };
    
    const cleanup = initializeService();
    
    return () => {
      isSubscribed = false;
      cleanup?.then?.(cleanupFn => cleanupFn?.());
    };
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
    isPermissionGranted: isMounted ? isPermissionGranted : false,
    isRemindersEnabled: isMounted ? isRemindersEnabled : false,
    isRequestingPermission,
    requestPermission,
    toggleReminders,
    scheduleReminders,
    clearAllReminders,
  };
}
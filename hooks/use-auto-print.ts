"use client";

import { useCallback } from "react";
import { Appointment } from "@/types/appointment";
import { PrintService } from "@/lib/services/print-service";
import { toast } from "sonner";

export function useAutoPrint() {
  /**
   * Auto-print an appointment when it's created with 'scheduled' status
   */
  const triggerAutoPrint = useCallback(async (appointment: Appointment) => {
    const settings = PrintService.getPrintSettings();
    
    // Only auto-print if enabled and appointment is scheduled
    if (!settings.autoPrint || appointment.status !== 'scheduled') {
      return;
    }

    try {
      // Add delay if configured (allows user to see the appointment was created)
      const delay = settings.autoPrintDelay || 2000; // 2 seconds default
      
      setTimeout(async () => {
        // Check if appointment was already printed to avoid duplicates
        if (PrintService.wasAppointmentPrinted(appointment.id)) {
          return;
        }

        // Show confirmation if enabled
        if (settings.showAutoPrintConfirmation) {
          const confirmed = window.confirm(
            `Auto-print appointment card for ${appointment.title}?`
          );
          if (!confirmed) {
            return;
          }
        }

        // Generate and print the card
        await PrintService.printSingleCard(appointment);
        
        // Show success toast
        toast.success(`Auto-printed appointment card for ${appointment.title}`);
        
        // Log the auto-print event
        PrintService.logAutoPrintEvent(appointment.id);
        
      }, delay);
      
    } catch (error) {
      console.error("Auto-print failed:", error);
      toast.error("Auto-print failed. You can print manually from the appointment details.");
    }
  }, []);

  /**
   * Check if auto-print is enabled
   */
  const isAutoPrintEnabled = useCallback(() => {
    const settings = PrintService.getPrintSettings();
    return settings.autoPrint === true;
  }, []);

  /**
   * Toggle auto-print setting
   */
  const toggleAutoPrint = useCallback((enabled: boolean) => {
    const settings = PrintService.getPrintSettings();
    settings.autoPrint = enabled;
    PrintService.savePrintSettings(settings);
    
    if (enabled) {
      toast.success("Auto-print enabled for new appointments");
    } else {
      toast.success("Auto-print disabled");
    }
  }, []);

  /**
   * Update auto-print settings
   */
  const updateAutoPrintSettings = useCallback((newSettings: Partial<{
    autoPrint: boolean;
    autoPrintDelay: number;
    showAutoPrintConfirmation: boolean;
  }>) => {
    const currentSettings = PrintService.getPrintSettings();
    const updatedSettings = { ...currentSettings, ...newSettings };
    PrintService.savePrintSettings(updatedSettings);
    toast.success("Auto-print settings updated");
  }, []);

  return {
    triggerAutoPrint,
    isAutoPrintEnabled,
    toggleAutoPrint,
    updateAutoPrintSettings,
  };
}
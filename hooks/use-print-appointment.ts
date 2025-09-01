"use client";

import { useState, useCallback } from "react";
import { Appointment } from "@/types/appointment";
import { PrintService } from "@/lib/services/print-service";
import { toast } from "sonner";

export function usePrintAppointment() {
  const [isPrinting, setIsPrinting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedAppointments, setSelectedAppointments] = useState<Appointment[]>([]);

  /**
   * Print a single appointment card
   */
  const printSingle = useCallback(async (appointment: Appointment) => {
    try {
      setIsPrinting(true);
      setSelectedAppointments([appointment]);
      
      const settings = PrintService.getPrintSettings();
      
      if (settings.showPreview) {
        setShowPreview(true);
      } else {
        await PrintService.printSingleCard(appointment);
        toast.success("Print job sent to printer");
      }
    } catch (error) {
      console.error("Print error:", error);
      toast.error("Failed to print appointment card");
    } finally {
      setIsPrinting(false);
    }
  }, []);

  /**
   * Print multiple appointment cards
   */
  const printBatch = useCallback(async (appointments: Appointment[]) => {
    if (appointments.length === 0) {
      toast.warning("Please select appointments to print");
      return;
    }

    try {
      setIsPrinting(true);
      setSelectedAppointments(appointments);
      
      const settings = PrintService.getPrintSettings();
      
      if (settings.showPreview) {
        setShowPreview(true);
      } else {
        await PrintService.printBatchCards(appointments);
        toast.success(`${appointments.length} print jobs sent to printer`);
      }
    } catch (error) {
      console.error("Print error:", error);
      toast.error("Failed to print appointment cards");
    } finally {
      setIsPrinting(false);
    }
  }, []);

  /**
   * Execute print after preview
   */
  const executePrint = useCallback(async () => {
    try {
      if (selectedAppointments.length === 1) {
        await PrintService.printSingleCard(selectedAppointments[0]);
      } else {
        await PrintService.printBatchCards(selectedAppointments);
      }
      toast.success("Print job sent to printer");
      setShowPreview(false);
    } catch (error) {
      console.error("Print error:", error);
      toast.error("Failed to print");
    }
  }, [selectedAppointments]);

  /**
   * Close print preview
   */
  const closePreview = useCallback(() => {
    setShowPreview(false);
    setSelectedAppointments([]);
  }, []);

  /**
   * Check if appointment was printed
   */
  const wasPrinted = useCallback((appointmentId: string) => {
    return PrintService.wasAppointmentPrinted(appointmentId);
  }, []);

  return {
    isPrinting,
    showPreview,
    selectedAppointments,
    printSingle,
    printBatch,
    executePrint,
    closePreview,
    wasPrinted,
  };
}
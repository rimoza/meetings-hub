import { Appointment } from "@/types/appointment";

/**
 * Print service for handling appointment card printing
 */
export class PrintService {
  /**
   * Format appointment data for printing
   */
  static formatAppointmentForPrint(appointment: Appointment) {
    return {
      ...appointment,
      formattedDate: new Date(appointment.date).toLocaleDateString(),
      formattedTime: this.formatTime(appointment.time),
      year: new Date(appointment.date).getFullYear(),
    };
  }

  /**
   * Format time string to 12-hour format
   */
  private static formatTime(time: string): string {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  }

  /**
   * Print single appointment card
   */
  static async printSingleCard(appointment: Appointment): Promise<void> {
    // The actual printing is handled by the browser's print dialog
    // This method prepares the print data and triggers the print
    window.print();
    
    // Log print event
    this.logPrintEvent(appointment.id, "single");
  }

  /**
   * Print multiple appointment cards
   */
  static async printBatchCards(appointments: Appointment[]): Promise<void> {
    if (appointments.length === 0) {
      throw new Error("No appointments selected for printing");
    }

    // The actual printing is handled by the browser's print dialog
    window.print();
    
    // Log print events
    appointments.forEach(apt => {
      this.logPrintEvent(apt.id, "batch");
    });
  }

  /**
   * Generate print preview
   */
  static generatePrintPreview(appointments: Appointment[]): string {
    // This would generate HTML for print preview
    // The actual preview is handled by the React component
    return `Preparing ${appointments.length} card(s) for printing...`;
  }

  /**
   * Log print event for tracking
   */
  private static logPrintEvent(appointmentId: string, type: "single" | "batch"): void {
    const printLog = {
      appointmentId,
      type,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    };
    
    // Store in localStorage for now (could be sent to backend)
    const logs = this.getPrintLogs();
    logs.push(printLog);
    localStorage.setItem("printLogs", JSON.stringify(logs));
  }

  /**
   * Get print logs from storage
   */
  static getPrintLogs(): any[] {
    const logs = localStorage.getItem("printLogs");
    return logs ? JSON.parse(logs) : [];
  }

  /**
   * Check if appointment was printed
   */
  static wasAppointmentPrinted(appointmentId: string): boolean {
    const logs = this.getPrintLogs();
    return logs.some(log => log.appointmentId === appointmentId);
  }

  /**
   * Clear print logs
   */
  static clearPrintLogs(): void {
    localStorage.removeItem("printLogs");
  }

  /**
   * Handle print errors
   */
  static handlePrintError(error: Error): void {
    console.error("Print error:", error);
    // Could show user-friendly error message
    throw new Error(`Failed to print: ${error.message}`);
  }

  /**
   * Check if browser supports printing
   */
  static isPrintSupported(): boolean {
    return typeof window !== "undefined" && typeof window.print === "function";
  }

  /**
   * Get print settings from local storage
   */
  static getPrintSettings() {
    const settings = localStorage.getItem("printSettings");
    return settings ? JSON.parse(settings) : {
      autoPrint: false,
      showPreview: true,
      template: "default",
    };
  }

  /**
   * Save print settings
   */
  static savePrintSettings(settings: any): void {
    localStorage.setItem("printSettings", JSON.stringify(settings));
  }
}
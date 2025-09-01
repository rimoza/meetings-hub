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
  private static logPrintEvent(appointmentId: string, type: "single" | "batch" | "auto"): void {
    const printLog = {
      appointmentId,
      type,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      status: "completed",
    };
    
    // Store in localStorage for now (could be sent to backend)
    const logs = this.getPrintLogs();
    logs.push(printLog);
    localStorage.setItem("printLogs", JSON.stringify(logs));
  }

  /**
   * Log auto-print event specifically
   */
  static logAutoPrintEvent(appointmentId: string): void {
    this.logPrintEvent(appointmentId, "auto");
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
      autoPrintDelay: 2000,
      showAutoPrintConfirmation: true,
      showPreview: true,
      template: "default",
      printQuality: "high",
      defaultPrinter: null,
    };
  }

  /**
   * Save print settings
   */
  static savePrintSettings(settings: any): void {
    localStorage.setItem("printSettings", JSON.stringify(settings));
  }

  /**
   * Print Queue Management
   */
  static getPrintQueue(): any[] {
    const queue = localStorage.getItem("printQueue");
    return queue ? JSON.parse(queue) : [];
  }

  static addToPrintQueue(appointment: Appointment): void {
    const queue = this.getPrintQueue();
    const queueItem = {
      id: `${appointment.id}-${Date.now()}`,
      appointmentId: appointment.id,
      appointment,
      status: "pending",
      addedAt: new Date().toISOString(),
      retries: 0,
    };
    queue.push(queueItem);
    localStorage.setItem("printQueue", JSON.stringify(queue));
  }

  static removeFromPrintQueue(queueItemId: string): void {
    const queue = this.getPrintQueue();
    const updatedQueue = queue.filter(item => item.id !== queueItemId);
    localStorage.setItem("printQueue", JSON.stringify(updatedQueue));
  }

  static processPrintQueue(): void {
    const queue = this.getPrintQueue();
    const pendingItems = queue.filter(item => item.status === "pending");
    
    pendingItems.forEach(async (item) => {
      try {
        await this.printSingleCard(item.appointment);
        item.status = "completed";
        item.completedAt = new Date().toISOString();
      } catch (error) {
        item.status = "failed";
        item.error = error instanceof Error ? error.message : "Unknown error";
        item.retries = (item.retries || 0) + 1;
        
        // Retry up to 3 times
        if (item.retries < 3) {
          item.status = "pending";
        }
      }
    });
    
    localStorage.setItem("printQueue", JSON.stringify(queue));
  }

  /**
   * Enhanced Print History
   */
  static getPrintHistory(appointmentId?: string): any[] {
    const logs = this.getPrintLogs();
    if (appointmentId) {
      return logs.filter(log => log.appointmentId === appointmentId);
    }
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  static getPrintStatistics(): any {
    const logs = this.getPrintLogs();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return {
      total: logs.length,
      today: logs.filter(log => new Date(log.timestamp) >= today).length,
      thisWeek: logs.filter(log => new Date(log.timestamp) >= thisWeek).length,
      thisMonth: logs.filter(log => new Date(log.timestamp) >= thisMonth).length,
      byType: {
        single: logs.filter(log => log.type === "single").length,
        batch: logs.filter(log => log.type === "batch").length,
        auto: logs.filter(log => log.type === "auto").length,
      },
      failed: logs.filter(log => log.status === "failed").length,
    };
  }

  /**
   * Enhanced Error Handling
   */
  static async handlePrintWithRetry(appointment: Appointment, maxRetries = 3): Promise<void> {
    let retries = 0;
    
    while (retries < maxRetries) {
      try {
        await this.printSingleCard(appointment);
        return; // Success, exit retry loop
      } catch (error) {
        retries++;
        
        if (retries >= maxRetries) {
          // Log the failure
          this.logPrintFailure(appointment.id, error instanceof Error ? error.message : "Unknown error");
          throw new Error(`Failed to print after ${maxRetries} attempts: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
      }
    }
  }

  private static logPrintFailure(appointmentId: string, errorMessage: string): void {
    const failureLog = {
      appointmentId,
      type: "failure",
      timestamp: new Date().toISOString(),
      error: errorMessage,
      status: "failed",
    };
    
    const logs = this.getPrintLogs();
    logs.push(failureLog);
    localStorage.setItem("printLogs", JSON.stringify(logs));
  }

  /**
   * Bulk Operations
   */
  static async printAppointmentsByDate(date: string): Promise<void> {
    // This would typically fetch appointments for the given date
    // For now, we'll assume appointments are passed in
    console.log(`Bulk printing appointments for date: ${date}`);
  }

  static async printAppointmentsByStatus(status: string): Promise<void> {
    console.log(`Bulk printing appointments with status: ${status}`);
  }
}
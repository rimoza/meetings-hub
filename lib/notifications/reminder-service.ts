"use client";

import type { Meeting } from "@/types/meeting";

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
  private isRemindersEnabled: boolean = true; // User preference toggle
  private debugMode: boolean = false;
  private initializationError: string | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.debugMode =
        process.env.NODE_ENV === "development" ||
        localStorage.getItem("reminder-debug") === "true";
      this.log("🚀 ReminderService initializing...");

      try {
        this.checkNotificationSupport();
        this.loadReminderPreference();
        this.checkProductionEnvironment();
        this.initializeServiceWorker();
        this.log("✅ ReminderService initialized successfully");
      } catch (error) {
        this.initializationError =
          error instanceof Error
            ? error.message
            : "Unknown initialization error";
        this.log(
          "❌ ReminderService initialization failed:",
          this.initializationError,
        );
      }
    }
  }

  private async initializeServiceWorker(): Promise<void> {
    try {
      if ("serviceWorker" in navigator) {
        this.log("🔧 Registering service worker...");

        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });

        this.log("✅ Service worker registered successfully:", registration);

        // Listen for service worker updates
        registration.addEventListener("updatefound", () => {
          this.log("🔄 Service worker update found");
        });

        // Check if service worker is already active
        if (registration.active) {
          this.log("🟢 Service worker is active");
        }
      } else {
        this.log("❌ Service worker not supported in this browser");
      }
    } catch (error) {
      this.logError("💥 Service worker registration failed:", error);
    }
  }

  private log(...args: unknown[]): void {
    if (this.debugMode) {
      console.log("[ReminderService]", ...args);
    }
  }

  private logError(...args: unknown[]): void {
    console.error("[ReminderService]", ...args);
  }

  private checkProductionEnvironment(): void {
    const isProduction = process.env.NODE_ENV === "production";
    const isHttps =
      typeof window !== "undefined" && window.location.protocol === "https:";
    const isLocalhost =
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1");

    this.log(`🌍 Environment check:`, {
      isProduction,
      isHttps,
      isLocalhost,
      protocol:
        typeof window !== "undefined" ? window.location.protocol : "unknown",
      hostname:
        typeof window !== "undefined" ? window.location.hostname : "unknown",
    });

    if (isProduction && !isHttps && !isLocalhost) {
      this.logError(
        "⚠️ HTTPS is required for notifications in production environment",
      );
    }
  }

  private checkNotificationSupport(): void {
    if (typeof window === "undefined") {
      this.log("❌ Window is undefined (SSR context)");
      return;
    }

    if (typeof Notification === "undefined") {
      this.log("❌ Notification API is not available");
      return;
    }

    try {
      this.isNotificationSupported =
        "Notification" in window && typeof Notification !== "undefined";
      this.isNotificationGranted =
        this.isNotificationSupported && Notification.permission === "granted";

      this.log(`📱 Notification support check:`, {
        supported: this.isNotificationSupported,
        permission:
          typeof Notification !== "undefined"
            ? Notification.permission
            : "unavailable",
        granted: this.isNotificationGranted,
        userAgent: navigator.userAgent,
      });

      // Additional checks for common issues
      if (
        this.isNotificationSupported &&
        Notification.permission === "denied"
      ) {
        this.log("🚫 Notifications were previously denied by user");
      }

      if (
        this.isNotificationSupported &&
        Notification.permission === "default"
      ) {
        this.log("❓ Notification permission not yet requested");
      }
    } catch (error) {
      this.logError("💥 Error checking notification support:", error);
      this.isNotificationSupported = false;
      this.isNotificationGranted = false;
    }
  }

  private loadReminderPreference(): void {
    if (typeof window === "undefined" || typeof localStorage === "undefined")
      return;

    const saved = localStorage.getItem("reminders-enabled");
    this.isRemindersEnabled = saved !== null ? JSON.parse(saved) : true;
  }

  private saveReminderPreference(): void {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(
        "reminders-enabled",
        JSON.stringify(this.isRemindersEnabled),
      );
    }
  }

  async requestNotificationPermission(): Promise<boolean> {
    this.log("🔔 Requesting notification permission...");

    if (this.initializationError) {
      this.logError(
        "❌ Cannot request permission due to initialization error:",
        this.initializationError,
      );
      return false;
    }

    if (typeof window === "undefined" || typeof Notification === "undefined") {
      this.logError("❌ Window or Notification API not available");
      return false;
    }

    if (!this.isNotificationSupported) {
      this.logError("❌ Notifications are not supported in this browser");
      return false;
    }

    try {
      this.log("📱 Current permission:", Notification.permission);

      if (Notification.permission === "granted") {
        this.log("✅ Permission already granted");
        this.isNotificationGranted = true;
        return true;
      }

      if (Notification.permission === "denied") {
        this.logError(
          "🚫 Permission previously denied - user must manually enable in browser settings",
        );
        this.showPermissionInstructions();
        return false;
      }

      // Check if we're in a secure context
      if (typeof window !== "undefined" && !window.isSecureContext) {
        this.logError("🔒 Notifications require a secure context (HTTPS)");
        return false;
      }

      this.log("🤔 Requesting permission from user...");

      // Enhanced permission request with timeout and user interaction check
      const permissionPromise = Notification.requestPermission();

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<NotificationPermission>(
        (_, reject) => {
          setTimeout(
            () => reject(new Error("Permission request timeout")),
            10000,
          );
        },
      );

      const permission = await Promise.race([
        permissionPromise,
        timeoutPromise,
      ]);

      this.log("📝 Permission result:", permission);
      this.isNotificationGranted = permission === "granted";

      if (permission === "denied") {
        this.logError("❌ User denied notification permission");
      } else if (permission === "default") {
        this.logError("❌ User dismissed permission dialog");
      }

      return this.isNotificationGranted;
    } catch (error) {
      this.logError("💥 Error requesting notification permission:", error);

      // Try to provide helpful error information
      if (error instanceof Error) {
        if (error.message.includes("timeout")) {
          this.logError(
            "⏰ Permission request timed out - user may need to interact with page first",
          );
        } else if (error.message.includes("user gesture")) {
          this.logError(
            "👆 Permission request requires user gesture (click/touch)",
          );
        }
      }
    }

    return false;
  }

  private showNotification(meeting: Meeting, reminderTime: number): void {
    this.log(
      `🔔 Attempting to show notification for meeting: ${meeting.title}`,
    );

    if (!this.isNotificationGranted) {
      this.logError("❌ Notification permission not granted");
      this.showFallbackNotification(meeting, reminderTime);
      return;
    }

    const timeLabel = this.getTimeLabel(reminderTime);
    const meetingTime = `${meeting.date} at ${meeting.time}`;

    try {
      // Check if notification API is still available
      if (typeof Notification === "undefined") {
        this.logError("❌ Notification API became unavailable");
        this.showFallbackNotification(meeting, reminderTime);
        return;
      }

      // Re-check permission before showing notification
      if (Notification.permission !== "granted") {
        this.logError("❌ Notification permission was revoked");
        this.isNotificationGranted = false;
        this.showFallbackNotification(meeting, reminderTime);
        return;
      }

      const notificationOptions: NotificationOptions = {
        body: `${meeting.title}\n${meetingTime}\nLocation: ${meeting.location}`,
        icon: "/favicon.svg",
        badge: "/favicon.svg",
        tag: `meeting-${meeting.id}-${reminderTime}`,
        requireInteraction: false,
        silent: false,
        // Add additional data for tracking
        data: {
          meetingId: meeting.id,
          reminderTime: reminderTime,
          meetingTime: meetingTime,
          timestamp: Date.now(),
        },
      };

      this.log("📱 Creating notification with options:", notificationOptions);

      const notification = new Notification(
        `Meeting Reminder - ${timeLabel}`,
        notificationOptions,
      );

      // Enhanced event handlers with logging
      notification.onshow = () => {
        this.log("✅ Notification displayed successfully");
      };

      notification.onerror = (error) => {
        this.logError("❌ Notification error:", error);
        this.showFallbackNotification(meeting, reminderTime);
      };

      // Keep notification visible for 30 seconds
      const autoCloseTimeout = setTimeout(() => {
        this.log("⏰ Auto-closing notification after 30 seconds");
        notification.close();
      }, 30000);

      notification.onclick = () => {
        this.log("👆 User clicked notification");
        window.focus();
        clearTimeout(autoCloseTimeout);
        notification.close();

        // Try to navigate to meeting details if possible
        this.handleNotificationClick(meeting);
      };

      notification.onclose = () => {
        this.log("🔒 Notification closed");
        clearTimeout(autoCloseTimeout);
      };
    } catch (error) {
      this.logError("💥 Failed to show notification:", error);
      this.showFallbackNotification(meeting, reminderTime);
    }
  }

  private showFallbackNotification(
    meeting: Meeting,
    reminderTime: number,
  ): void {
    const timeLabel = this.getTimeLabel(reminderTime);
    const meetingTime = `${meeting.date} at ${meeting.time}`;
    const message = `Meeting Reminder - ${timeLabel}\n${meeting.title}\n${meetingTime}`;

    this.log("📢 Showing fallback notification");

    // Try multiple fallback methods
    try {
      // Method 1: Browser alert (most compatible)
      if (typeof alert !== "undefined") {
        alert(message);
        return;
      }

      // Method 2: Console notification for debugging
      console.warn("🔔 MEETING REMINDER:", message);

      // Method 3: Try to show a visual notification in the page
      this.showInPageNotification(meeting, timeLabel, meetingTime);
    } catch (error) {
      this.logError("💥 All notification methods failed:", error);
    }
  }

  private showInPageNotification(
    meeting: Meeting,
    timeLabel: string,
    meetingTime: string,
  ): void {
    try {
      // Create an in-page notification element
      const notification = document.createElement("div");
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #1f2937;
        color: white;
        padding: 16px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 9999;
        max-width: 320px;
        font-family: system-ui, -apple-system, sans-serif;
      `;

      notification.innerHTML = `
        <div style="display: flex; align-items: center; margin-bottom: 8px;">
          <span style="margin-right: 8px;">🔔</span>
          <strong>Meeting Reminder - ${timeLabel}</strong>
        </div>
        <div style="font-size: 14px; line-height: 1.4;">
          <div>${meeting.title}</div>
          <div style="opacity: 0.8;">${meetingTime}</div>
          <div style="opacity: 0.8;">Location: ${meeting.location}</div>
        </div>
      `;

      document.body.appendChild(notification);

      // Auto remove after 10 seconds
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 10000);

      this.log("📋 In-page notification created");
    } catch (error) {
      this.logError("💥 Failed to create in-page notification:", error);
    }
  }

  private handleNotificationClick(meeting: Meeting): void {
    try {
      // Try to focus the window
      if (typeof window !== "undefined" && window.focus) {
        window.focus();
      }

      // Could add navigation to meeting details here
      // For now, just log the interaction
      this.log("🎯 Notification clicked for meeting:", meeting.id);
    } catch (error) {
      this.logError("💥 Error handling notification click:", error);
    }
  }

  private showPermissionInstructions(): void {
    try {
      const instructionsDiv = document.createElement("div");
      instructionsDiv.id = "notification-permission-instructions";
      instructionsDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        color: #111827;
        padding: 24px;
        border-radius: 12px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        z-index: 10000;
        max-width: 480px;
        font-family: system-ui, -apple-system, sans-serif;
        border: 1px solid #e5e7eb;
      `;

      const browser = this.detectBrowser();
      const instructions = this.getBrowserInstructions(browser);

      instructionsDiv.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h3 style="margin: 0; font-size: 18px; font-weight: 600;">Enable Notifications</h3>
          <button onclick="this.parentElement.parentElement.remove()" style="
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #6b7280;
            padding: 0;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
          ">×</button>
        </div>
        <div style="margin-bottom: 16px; color: #ef4444; background: #fef2f2; padding: 12px; border-radius: 8px; border: 1px solid #fee2e2;">
          <strong>⚠️ Notifications are blocked</strong>
          <p style="margin: 8px 0 0 0; font-size: 14px;">You've previously denied notification permissions. To receive meeting reminders, you need to manually enable them in your browser settings.</p>
        </div>
        <div style="background: #f9fafb; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb;">
          <h4 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">How to enable for ${browser}:</h4>
          ${instructions}
        </div>
        <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; font-size: 14px; color: #6b7280;">
            After enabling notifications, refresh this page and click the notification button again.
          </p>
        </div>
      `;

      // Remove any existing instructions
      const existing = document.getElementById(
        "notification-permission-instructions",
      );
      if (existing) {
        existing.remove();
      }

      document.body.appendChild(instructionsDiv);

      // Auto-remove after 30 seconds
      setTimeout(() => {
        if (instructionsDiv.parentNode) {
          instructionsDiv.remove();
        }
      }, 30000);
    } catch (error) {
      this.logError("Failed to show permission instructions:", error);
    }
  }

  private detectBrowser(): string {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes("chrome") && !userAgent.includes("edg"))
      return "Chrome";
    if (userAgent.includes("firefox")) return "Firefox";
    if (userAgent.includes("safari") && !userAgent.includes("chrome"))
      return "Safari";
    if (userAgent.includes("edg")) return "Edge";
    return "your browser";
  }

  private getBrowserInstructions(browser: string): string {
    const instructions: Record<string, string> = {
      Chrome: `
        <ol style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6;">
          <li>Click the lock icon 🔒 in the address bar</li>
          <li>Click "Site settings"</li>
          <li>Find "Notifications" and change it to "Allow"</li>
          <li>Refresh this page</li>
        </ol>
      `,
      Firefox: `
        <ol style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6;">
          <li>Click the lock icon 🔒 in the address bar</li>
          <li>Click the "×" next to "Blocked" under Notifications</li>
          <li>Refresh this page</li>
        </ol>
      `,
      Safari: `
        <ol style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6;">
          <li>Go to Safari → Preferences → Websites</li>
          <li>Click "Notifications" in the sidebar</li>
          <li>Find this website and change to "Allow"</li>
          <li>Refresh this page</li>
        </ol>
      `,
      Edge: `
        <ol style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6;">
          <li>Click the lock icon 🔒 in the address bar</li>
          <li>Click "Permissions for this site"</li>
          <li>Find "Notifications" and change to "Allow"</li>
          <li>Refresh this page</li>
        </ol>
      `,
      "your browser": `
        <ol style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6;">
          <li>Look for a lock icon 🔒 or info icon ⓘ in the address bar</li>
          <li>Find site settings or permissions</li>
          <li>Enable notifications for this site</li>
          <li>Refresh this page</li>
        </ol>
      `,
    };

    return instructions[browser] || instructions["your browser"];
  }

  private getTimeLabel(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
    }
    const hours = Math.floor(minutes / 60);
    return `${hours} hour${hours !== 1 ? "s" : ""}`;
  }

  private calculateReminderTime(
    meeting: Meeting,
    minutesBefore: number,
  ): number {
    const [year, month, day] = meeting.date.split("-").map(Number);
    const [hours, minutes] = meeting.time.split(":").map(Number);

    const meetingDateTime = new Date(year, month - 1, day, hours, minutes);
    const reminderDateTime = new Date(
      meetingDateTime.getTime() - minutesBefore * 60 * 1000,
    );
    const delayMs = reminderDateTime.getTime() - Date.now();

    // console.log(`Meeting: ${meeting.title} - Reminder in ${delayMs}ms`);

    return delayMs;
  }

  scheduleReminder(meeting: Meeting, minutesBefore: number): string | null {
    this.log(
      `📅 Scheduling reminder for ${meeting.title} - ${minutesBefore} minutes before`,
    );

    if (!this.isNotificationGranted || !this.isRemindersEnabled) {
      this.logError(
        "❌ Cannot schedule reminder: permission not granted or reminders disabled",
        {
          isNotificationGranted: this.isNotificationGranted,
          isRemindersEnabled: this.isRemindersEnabled,
        },
      );
      return null;
    }

    const reminderId = `${meeting.id}-${minutesBefore}`;

    // Clear existing reminder if it exists
    this.clearReminder(reminderId);

    const delayMs = this.calculateReminderTime(meeting, minutesBefore);

    // Don't schedule if the reminder time has already passed
    if (delayMs <= 0) {
      this.log(
        `⏰ Reminder time has passed for meeting ${meeting.title} (${delayMs}ms)`,
      );
      return null;
    }

    this.log(
      `⏱️ Scheduling reminder in ${delayMs}ms (${Math.round(delayMs / 1000 / 60)} minutes)`,
    );

    // Try to use service worker for more reliable notifications
    const useServiceWorker = this.tryScheduleWithServiceWorker(
      meeting,
      minutesBefore,
      delayMs,
      reminderId,
    );

    if (!useServiceWorker) {
      // Fallback to setTimeout
      const timeoutId = setTimeout(() => {
        this.log(`🔔 Timeout triggered for reminder: ${reminderId}`);
        this.showNotification(meeting, minutesBefore);
        this.reminders.delete(reminderId);
      }, delayMs);

      const reminderConfig: ReminderConfig = {
        id: reminderId,
        meetingId: meeting.id,
        reminderTime: minutesBefore,
        isScheduled: true,
        timeoutId,
      };

      this.reminders.set(reminderId, reminderConfig);
    } else {
      // Service worker is handling it
      const reminderConfig: ReminderConfig = {
        id: reminderId,
        meetingId: meeting.id,
        reminderTime: minutesBefore,
        isScheduled: true,
      };

      this.reminders.set(reminderId, reminderConfig);
    }

    const reminderDate = new Date(Date.now() + delayMs);
    this.log(
      `✅ Reminder scheduled for ${meeting.title} at ${reminderDate.toLocaleString()}`,
    );

    return reminderId;
  }

  private tryScheduleWithServiceWorker(
    meeting: Meeting,
    reminderTime: number,
    delayMs: number,
    reminderId: string,
  ): boolean {
    try {
      if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
        this.log("📡 Using service worker for reminder scheduling");

        navigator.serviceWorker.controller.postMessage({
          type: "SCHEDULE_REMINDER",
          payload: {
            meeting,
            reminderTime,
            delayMs,
            reminderId,
          },
        });

        return true;
      }
    } catch (error) {
      this.logError("💥 Failed to schedule with service worker:", error);
    }

    this.log("⚠️ Falling back to setTimeout for reminder scheduling");
    return false;
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
    const today = now.toISOString().split("T")[0];
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

    meetings
      .filter((meeting) => {
        // Only schedule for future meetings
        return (
          meeting.date > today ||
          (meeting.date === today && meeting.time > currentTime)
        );
      })
      .forEach((meeting) => {
        this.scheduleMeetingReminders(meeting);
      });
  }

  getScheduledReminders(): ReminderConfig[] {
    return Array.from(this.reminders.values());
  }

  isNotificationEnabled(): boolean {
    // Re-check permission status in case it changed
    this.refreshPermissionStatus();
    return this.isNotificationGranted && this.isRemindersEnabled;
  }

  isRemindersToggleEnabled(): boolean {
    return this.isRemindersEnabled;
  }

  setRemindersEnabled(enabled: boolean): void {
    this.log(`🔧 Setting reminders enabled: ${enabled}`);
    this.isRemindersEnabled = enabled;
    this.saveReminderPreference();

    if (!enabled) {
      this.log("🗑️ Clearing all reminders (disabled)");
      this.clearAllReminders();
    }
  }

  hasNotificationPermission(): boolean {
    this.refreshPermissionStatus();
    return this.isNotificationGranted;
  }

  private refreshPermissionStatus(): void {
    if (typeof window === "undefined" || typeof Notification === "undefined") {
      return;
    }

    try {
      const currentPermission = Notification.permission === "granted";
      if (currentPermission !== this.isNotificationGranted) {
        this.log(
          `🔄 Permission status changed: ${this.isNotificationGranted} -> ${currentPermission}`,
        );
        this.isNotificationGranted = currentPermission;

        if (!currentPermission) {
          // Permission was revoked, clear all reminders
          this.log("🚫 Permission revoked, clearing reminders");
          this.clearAllReminders();
        }
      }
    } catch (error) {
      this.logError("💥 Error refreshing permission status:", error);
    }
  }

  getServiceStatus(): {
    isSupported: boolean;
    hasPermission: boolean;
    isEnabled: boolean;
    isHttps: boolean;
    hasServiceWorker: boolean;
    debugMode: boolean;
    activeReminders: number;
    initializationError: string | null;
  } {
    return {
      isSupported: this.isNotificationSupported,
      hasPermission: this.isNotificationGranted,
      isEnabled: this.isRemindersEnabled,
      isHttps:
        typeof window !== "undefined"
          ? window.location.protocol === "https:"
          : false,
      hasServiceWorker: "serviceWorker" in navigator,
      debugMode: this.debugMode,
      activeReminders: this.reminders.size,
      initializationError: this.initializationError,
    };
  }
}

// Create a client-only reminder service factory
export function createReminderService(): ReminderService | null {
  if (typeof window === "undefined") {
    return null;
  }
  return new ReminderService();
}

// Lazy initialization for client-side only
let reminderServiceInstance: ReminderService | null = null;

export function getReminderService(): ReminderService | null {
  if (typeof window === "undefined") {
    return null;
  }

  if (!reminderServiceInstance) {
    reminderServiceInstance = new ReminderService();
  }

  return reminderServiceInstance;
}

// Legacy export removed to prevent SSR issues - use getReminderService() instead

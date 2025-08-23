"use client";

import { useState } from "react";
import { Bell, TestTube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getReminderService } from "@/lib/notifications/reminder-service";
import type { Meeting } from "@/types/meeting";

export function NotificationTest() {
  const [isTestingNotification, setIsTestingNotification] = useState(false);

  const testNotification = async () => {
    setIsTestingNotification(true);

    try {
      const reminderService = getReminderService();

      if (!reminderService) {
        alert("Reminder service is not available");
        return;
      }

      // Request permission first if needed
      const hasPermission =
        await reminderService.requestNotificationPermission();

      if (!hasPermission) {
        alert("Notification permission is required to test reminders");
        return;
      }

      // Create a mock meeting for testing (10 seconds from now)
      const testMeeting: Meeting = {
        id: "test-meeting",
        title: "Test Meeting Reminder",
        description: "This is a test notification",
        date: new Date().toISOString().split("T")[0],
        time: new Date(Date.now() + 10000).toTimeString().slice(0, 5), // 10 seconds from now
        duration: 30,
        location: "Test Location",
        attendees: ["test@example.com"],
        completed: false,
        priority: "medium",
        type: "meeting",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Schedule a test reminder for 5 seconds from now (5 seconds before the "meeting")
      reminderService.scheduleReminder(testMeeting, 0.08); // ~5 seconds in minutes

      alert(
        "Test notification scheduled! You should see it in about 5 seconds.",
      );
    } catch (error) {
      console.error("Error testing notification:", error);
      alert("Error testing notification. Please try again.");
    } finally {
      setIsTestingNotification(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-secondary/50 rounded-lg">
            <TestTube className="h-5 w-5 text-foreground" />
          </div>
          <div>
            <CardTitle className="text-lg">Test Notifications</CardTitle>
            <p className="text-sm text-muted-foreground">
              Test the reminder notification system
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Button
          onClick={testNotification}
          disabled={isTestingNotification}
          className="w-full"
          variant="outline"
        >
          {isTestingNotification ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
              Setting up test...
            </>
          ) : (
            <>
              <Bell className="h-4 w-4 mr-2" />
              Send Test Notification
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground mt-3 text-center">
          This will send a test reminder notification in ~5 seconds
        </p>
      </CardContent>
    </Card>
  );
}

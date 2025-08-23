"use client";

import { Bell, BellOff, Settings, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useReminders } from "@/hooks/use-reminders";
import { useMeetings } from "@/hooks/use-meetings";

interface NotificationSidebarProps {
  children: React.ReactNode;
}

export function NotificationSidebar({ children }: NotificationSidebarProps) {
  const {
    isPermissionGranted,
    isRemindersEnabled,
    isRequestingPermission,
    requestPermission,
    toggleReminders,
  } = useReminders();

  const { upcomingMeetings } = useMeetings();

  const handleToggleReminders = async (enabled: boolean) => {
    if (enabled && !isPermissionGranted) {
      const granted = await requestPermission();
      if (granted) {
        toggleReminders(true);
      }
    } else {
      toggleReminders(enabled);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="right" className="w-[400px] sm:w-[500px]">
        <SheetHeader>
          <SheetTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Notification Settings</span>
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Main Toggle */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {isRemindersEnabled && isPermissionGranted ? (
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Bell className="h-5 w-5 text-primary" />
                    </div>
                  ) : (
                    <div className="p-2 bg-muted rounded-lg">
                      <BellOff className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-lg">Meeting Reminders</CardTitle>
                    <CardDescription>
                      {isRemindersEnabled && isPermissionGranted
                        ? "Active - You'll receive notifications"
                        : "Disabled - No notifications will be sent"}
                    </CardDescription>
                  </div>
                </div>
                <Switch
                  checked={isRemindersEnabled && isPermissionGranted}
                  onCheckedChange={handleToggleReminders}
                  disabled={isRequestingPermission}
                />
              </div>
            </CardHeader>

            {!isPermissionGranted && isRemindersEnabled && (
              <CardContent className="pt-0">
                <div className="p-3 bg-secondary/50 rounded-lg border">
                  <p className="text-sm text-muted-foreground">
                    Browser permission required to enable notifications
                  </p>
                  <Button
                    onClick={requestPermission}
                    disabled={isRequestingPermission}
                    size="sm"
                    className="mt-2 w-full"
                  >
                    {isRequestingPermission
                      ? "Requesting..."
                      : "Grant Permission"}
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Reminder Schedule */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center">
                <Settings className="h-4 w-4 mr-2" />
                Reminder Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-2">
                <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                  <span>1 hour before</span>
                  <Badge variant="secondary" className="text-xs">
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                  <span>30 minutes before</span>
                  <Badge variant="secondary" className="text-xs">
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                  <span>5 minutes before</span>
                  <Badge variant="secondary" className="text-xs">
                    Active
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Meetings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Upcoming Meetings
                <Badge className="ml-2">{upcomingMeetings.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingMeetings.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {upcomingMeetings.slice(0, 5).map((meeting) => (
                    <div
                      key={meeting.id}
                      className="p-2 bg-secondary/30 rounded text-sm"
                    >
                      <div className="font-medium truncate">
                        {meeting.title}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {meeting.date} at {meeting.time}
                      </div>
                    </div>
                  ))}
                  {upcomingMeetings.length > 5 && (
                    <div className="text-xs text-center text-muted-foreground">
                      And {upcomingMeetings.length - 5} more...
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No upcoming meetings scheduled
                </p>
              )}
            </CardContent>
          </Card>

          {/* Status Info */}
          {isRemindersEnabled && isPermissionGranted && (
            <div className="p-3 bg-primary/5 border border-primary/10 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
                <p className="text-sm text-primary font-medium">
                  Reminders are active for {upcomingMeetings.length} upcoming
                  meeting{upcomingMeetings.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

"use client"

import { useState } from "react"
import { Bell, BellOff, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useReminders } from "@/hooks/use-reminders"

export function NotificationSettings() {
  const { 
    isPermissionGranted, 
    isRequestingPermission, 
    requestPermission 
  } = useReminders()

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Meeting Reminders</CardTitle>
            <CardDescription className="text-sm">
              Get notified before your meetings start
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
          <div className="flex items-center space-x-3">
            {isPermissionGranted ? (
              <>
                <div className="p-1 bg-primary/10 rounded">
                  <Bell className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Notifications Enabled</p>
                  <p className="text-xs text-muted-foreground">
                    You'll receive reminders at 1h, 30min, and 5min before meetings
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="p-1 bg-muted rounded">
                  <BellOff className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">Notifications Disabled</p>
                  <p className="text-xs text-muted-foreground">
                    Enable notifications to get meeting reminders
                  </p>
                </div>
              </>
            )}
          </div>
          
          <Badge variant={isPermissionGranted ? "default" : "secondary"}>
            {isPermissionGranted ? "ON" : "OFF"}
          </Badge>
        </div>

        {!isPermissionGranted && (
          <div className="space-y-3">
            <div className="p-3 bg-primary/5 border border-primary/10 rounded-lg">
              <div className="flex items-start space-x-2">
                <Settings className="h-4 w-4 text-primary mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-primary mb-1">Reminder Schedule</p>
                  <ul className="text-muted-foreground text-xs space-y-1">
                    <li>• 1 hour before meeting</li>
                    <li>• 30 minutes before meeting</li>
                    <li>• 5 minutes before meeting</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button
              onClick={requestPermission}
              disabled={isRequestingPermission}
              className="w-full"
              size="sm"
            >
              {isRequestingPermission ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Requesting Permission...
                </>
              ) : (
                <>
                  <Bell className="h-4 w-4 mr-2" />
                  Enable Notifications
                </>
              )}
            </Button>
          </div>
        )}

        {isPermissionGranted && (
          <div className="p-3 bg-primary/5 border border-primary/10 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
              <p className="text-sm text-primary font-medium">
                Reminders are active for all upcoming meetings
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
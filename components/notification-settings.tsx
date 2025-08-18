"use client"

import { Bell, BellOff, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useReminders } from "@/hooks/use-reminders"

export function NotificationSettings() {
  const { 
    isPermissionGranted,
    isRemindersEnabled,
    isRequestingPermission, 
    requestPermission,
    toggleReminders
  } = useReminders()

  const handleToggleReminders = async (enabled: boolean) => {
    if (enabled && !isPermissionGranted) {
      const granted = await requestPermission()
      if (granted) {
        toggleReminders(true)
      }
    } else {
      toggleReminders(enabled)
    }
  }

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
            {isRemindersEnabled ? (
              isPermissionGranted ? (
                <>
                  <div className="p-1 bg-primary/10 rounded">
                    <Bell className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Reminders Active</p>
                    <p className="text-xs text-muted-foreground">
                      You&apos;ll receive reminders at 1h, 30min, and 5min before meetings
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-1 bg-yellow-100 rounded">
                    <Bell className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-yellow-700">Permission Needed</p>
                    <p className="text-xs text-muted-foreground">
                      Click &quot;Grant Permission&quot; below to enable reminders
                    </p>
                  </div>
                </>
              )
            ) : (
              <>
                <div className="p-1 bg-muted rounded">
                  <BellOff className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">Reminders Disabled</p>
                  <p className="text-xs text-muted-foreground">
                    Turn on to receive meeting reminders
                  </p>
                </div>
              </>
            )}
          </div>
          
          <Switch 
            checked={isRemindersEnabled}
            onCheckedChange={handleToggleReminders}
            disabled={isRequestingPermission}
          />
        </div>

        {(!isPermissionGranted && isRemindersEnabled) && (
          <div className="p-3 bg-secondary/50 rounded-lg border">
            <p className="text-sm text-muted-foreground mb-3">
              Browser permission is required to receive notifications
            </p>
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
                  Grant Permission
                </>
              )}
            </Button>
          </div>
        )}

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
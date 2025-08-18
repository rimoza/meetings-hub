"use client"

import { Info, Calendar, User, Shield } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/auth-context"

export function AppSettings() {
  const { user } = useAuth()

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-secondary/50 rounded-lg">
            <Info className="h-5 w-5 text-foreground" />
          </div>
          <div>
            <CardTitle className="text-lg">Application Info</CardTitle>
            <CardDescription>
              System information and account details
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* User Information */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <h4 className="font-medium text-sm">Account Information</h4>
          </div>
          
          <div className="pl-6 space-y-2">
            <div className="flex items-center justify-between p-2 bg-secondary/30 rounded text-sm">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium">{user?.name || "Not provided"}</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-secondary/30 rounded text-sm">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium truncate ml-2">{user?.email || "Not provided"}</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-secondary/30 rounded text-sm">
              <span className="text-muted-foreground">Account Status</span>
              <Badge variant="default" className="text-xs">Active</Badge>
            </div>
          </div>
        </div>

        <Separator />

        {/* Application Information */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <h4 className="font-medium text-sm">Application Details</h4>
          </div>
          
          <div className="pl-6 space-y-2">
            <div className="flex items-center justify-between p-2 bg-secondary/30 rounded text-sm">
              <span className="text-muted-foreground">Application</span>
              <span className="font-medium">Kulan Space</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-secondary/30 rounded text-sm">
              <span className="text-muted-foreground">Version</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-secondary/30 rounded text-sm">
              <span className="text-muted-foreground">Type</span>
              <span className="font-medium">Meeting Management</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Privacy & Security */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <h4 className="font-medium text-sm">Privacy & Security</h4>
          </div>
          
          <div className="pl-6 space-y-2">
            <div className="p-3 bg-primary/5 border border-primary/10 rounded-lg">
              <div className="text-sm">
                <p className="font-medium text-primary mb-2">Data Security</p>
                <ul className="text-muted-foreground text-xs space-y-1">
                  <li>• All meeting data is stored securely with Firebase</li>
                  <li>• Notifications are processed locally in your browser</li>
                  <li>• No data is shared with third parties</li>
                  <li>• Authentication is handled by Google OAuth</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
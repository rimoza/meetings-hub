"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle, XCircle, Info, Bug } from "lucide-react"
import { getReminderService } from "@/lib/notifications/reminder-service"

interface DiagnosticInfo {
  isSupported: boolean
  hasPermission: boolean
  isEnabled: boolean
  isHttps: boolean
  hasServiceWorker: boolean
  debugMode: boolean
  activeReminders: number
  initializationError: string | null
  userAgent: string
  platform: string
  location: string
}

export function NotificationDiagnostic() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [debugMode, setDebugMode] = useState(false)

  const refreshDiagnostics = () => {
    setIsLoading(true)
    
    try {
      const service = getReminderService()
      
      const info: DiagnosticInfo = {
        ...service?.getServiceStatus() || {
          isSupported: false,
          hasPermission: false,
          isEnabled: false,
          isHttps: false,
          hasServiceWorker: false,
          debugMode: false,
          activeReminders: 0,
          initializationError: "Service not available"
        },
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
        platform: typeof navigator !== 'undefined' ? navigator.platform : 'Unknown',
        location: typeof window !== 'undefined' ? window.location.href : 'Unknown'
      }
      
      setDiagnostics(info)
      setDebugMode(info.debugMode)
    } catch (error) {
      console.error('Failed to get diagnostics:', error)
      setDiagnostics({
        isSupported: false,
        hasPermission: false,
        isEnabled: false,
        isHttps: false,
        hasServiceWorker: false,
        debugMode: false,
        activeReminders: 0,
        initializationError: error instanceof Error ? error.message : 'Unknown error',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
        platform: typeof navigator !== 'undefined' ? navigator.platform : 'Unknown',
        location: typeof window !== 'undefined' ? window.location.href : 'Unknown'
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshDiagnostics()
    
    // Auto refresh every 10 seconds
    const interval = setInterval(refreshDiagnostics, 10000)
    return () => clearInterval(interval)
  }, [])

  const toggleDebugMode = () => {
    const newDebugMode = !debugMode
    setDebugMode(newDebugMode)
    
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('reminder-debug', String(newDebugMode))
    }
    
    // Refresh page to apply debug mode
    window.location.reload()
  }

  const getStatusIcon = (status: boolean) => {
    return status ? 
      <CheckCircle className="h-4 w-4 text-green-600" /> : 
      <XCircle className="h-4 w-4 text-red-600" />
  }

  const getStatusBadge = (status: boolean, trueText: string, falseText: string) => {
    return (
      <Badge variant={status ? "default" : "destructive"}>
        {status ? trueText : falseText}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bug className="h-5 w-5" />
            <span>Notification Diagnostics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading diagnostics...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bug className="h-5 w-5" />
            <span>Notification Diagnostics</span>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={toggleDebugMode}
              variant="outline"
              size="sm"
            >
              {debugMode ? "Disable Debug" : "Enable Debug"}
            </Button>
            <Button
              onClick={refreshDiagnostics}
              variant="outline"
              size="sm"
            >
              Refresh
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          System status and troubleshooting information
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {diagnostics?.initializationError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="font-medium text-red-800">Initialization Error</span>
            </div>
            <p className="text-sm text-red-700 mt-1">{diagnostics.initializationError}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">Core Features</h4>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Browser Support</span>
              <div className="flex items-center space-x-2">
                {getStatusIcon(diagnostics?.isSupported || false)}
                {getStatusBadge(diagnostics?.isSupported || false, "Supported", "Not Supported")}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Permission</span>
              <div className="flex items-center space-x-2">
                {getStatusIcon(diagnostics?.hasPermission || false)}
                {getStatusBadge(diagnostics?.hasPermission || false, "Granted", "Denied")}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Reminders Enabled</span>
              <div className="flex items-center space-x-2">
                {getStatusIcon(diagnostics?.isEnabled || false)}
                {getStatusBadge(diagnostics?.isEnabled || false, "Enabled", "Disabled")}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">HTTPS</span>
              <div className="flex items-center space-x-2">
                {getStatusIcon(diagnostics?.isHttps || false)}
                {getStatusBadge(diagnostics?.isHttps || false, "Secure", "Insecure")}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">Advanced Features</h4>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Service Worker</span>
              <div className="flex items-center space-x-2">
                {getStatusIcon(diagnostics?.hasServiceWorker || false)}
                {getStatusBadge(diagnostics?.hasServiceWorker || false, "Available", "Unavailable")}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Debug Mode</span>
              <div className="flex items-center space-x-2">
                <Info className="h-4 w-4 text-blue-600" />
                {getStatusBadge(diagnostics?.debugMode || false, "Enabled", "Disabled")}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Active Reminders</span>
              <Badge variant="outline">
                {diagnostics?.activeReminders || 0}
              </Badge>
            </div>
          </div>
        </div>

        <div className="space-y-2 pt-4 border-t">
          <h4 className="font-medium text-sm text-muted-foreground">Environment Details</h4>
          <div className="text-xs text-muted-foreground space-y-1">
            <div><strong>Platform:</strong> {diagnostics?.platform}</div>
            <div><strong>Location:</strong> {diagnostics?.location}</div>
            <div><strong>User Agent:</strong> {diagnostics?.userAgent}</div>
          </div>
        </div>

        {debugMode && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Info className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-800">Debug Mode Active</span>
            </div>
            <p className="text-sm text-blue-700">
              Check the browser console for detailed logging information. Debug mode will persist across page reloads.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
"use client";

import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, AlertCircle, LogOut } from "lucide-react";

export function PendingApproval() {
  const { user, logout } = useAuth();

  if (user?.status === 'denied') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              Your account access request has been denied.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {user.denialReason && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Reason:</strong> {user.denialReason}
                </p>
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              If you believe this is an error, please contact the administrator.
            </p>
            <Button onClick={logout} variant="outline" className="w-full">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mb-4">
            <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <CardTitle>Account Pending Approval</CardTitle>
          <CardDescription>
            Welcome, {user?.name || user?.email}!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Your account has been created successfully. An administrator will review 
            and approve your access shortly.
          </p>
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              You will receive an email notification once your account has been approved.
            </p>
          </div>
          <Button onClick={logout} variant="outline" className="w-full">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
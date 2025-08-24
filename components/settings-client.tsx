"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { NotificationSettings } from "@/components/notification-settings";
import { ThemeSettings } from "@/components/theme-settings";
import { AppSettings } from "@/components/app-settings";

export function SettingsClient() {

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="px-3 py-3 sm:px-4 sm:py-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden" />
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">
                    Settings
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                    Manage your application preferences
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Settings Content */}
      <main className="flex-1 overflow-auto p-4">
          <div className="flex gap-6">
            <div className="space-y-6">
              <NotificationSettings />
            <ThemeSettings />
            </div>
            <AppSettings />
          </div>
      </main>
    </div>
  );
}
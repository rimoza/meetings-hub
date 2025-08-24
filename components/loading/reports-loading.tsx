"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function ReportsLoading() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header Skeleton */}
      <header className="border-b bg-card">
        <div className="px-3 py-3 sm:px-4 sm:py-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 md:hidden" />
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0 space-y-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-64 hidden sm:block" />
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <Skeleton className="h-9 w-24 hidden sm:block" />
                  <Skeleton className="h-8 w-8 sm:hidden" />
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-9 w-9 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content Skeleton */}
      <main className="flex-1 overflow-auto px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8">
        {/* Filters Skeleton */}
        <div className="flex justify-end items-center mb-6">
          <div className="flex gap-2 items-center w-full">
            <div className="flex-1 lg:max-w-2xl">
              <Skeleton className="h-14 w-full rounded-lg" />
            </div>
          </div>
        </div>

        {/* Cards Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border-l-4 border-l-muted">
              <CardHeader className="p-4 sm:p-5">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-lg" />
                        <Skeleton className="h-5 w-48" />
                      </div>
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="flex items-center gap-1">
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0">
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                  <Skeleton className="h-16 w-full rounded-lg" />
                  <div className="grid grid-cols-2 gap-3">
                    <Skeleton className="h-16 w-full rounded-lg" />
                    <Skeleton className="h-16 w-full rounded-lg" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
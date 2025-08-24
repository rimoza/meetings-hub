import { Suspense } from 'react';
import { Metadata } from 'next';
import AppointmentsPageClient from '@/components/appointments-page-client';

export const metadata: Metadata = {
  title: 'Appointments - Kulan Space',
  description: 'Manage your appointments and schedule',
};

export default function AppointmentsPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-muted animate-pulse rounded" />
            <div className="h-4 w-64 bg-muted animate-pulse rounded" />
          </div>
          <div className="h-9 w-32 bg-muted animate-pulse rounded" />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded" />
          ))}
        </div>
        
        <div className="space-y-4">
          <div className="h-10 bg-muted animate-pulse rounded" />
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </div>
      </div>
    }>
      <AppointmentsPageClient />
    </Suspense>
  );
}
import { Suspense } from 'react';
import { Metadata } from 'next';
import AppointmentDetails from '@/components/appointment-details';
// import { AlertCircle } from 'lucide-react';

interface AppointmentDetailsPageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: AppointmentDetailsPageProps): Promise<Metadata> {
  console.log('Generating metadata for appointment ID:', params.id);
  return {
    title: `Appointment Details - Kulan Space`,
    description: 'View and manage appointment details',
  };
}

function AppointmentDetailsLoading() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-9 w-16 bg-muted animate-pulse rounded" />
            <div className="space-y-2">
              <div className="h-8 w-64 bg-muted animate-pulse rounded" />
              <div className="h-4 w-40 bg-muted animate-pulse rounded" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-6 w-24 bg-muted animate-pulse rounded-full" />
            <div className="h-9 w-24 bg-muted animate-pulse rounded" />
          </div>
        </div>

        {/* Content skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="h-96 bg-muted animate-pulse rounded-lg" />
          </div>
          <div className="space-y-4">
            <div className="h-32 bg-muted animate-pulse rounded-lg" />
            <div className="h-48 bg-muted animate-pulse rounded-lg" />
            <div className="h-32 bg-muted animate-pulse rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

// function AppointmentDetailsError() {
//   return (
//     <div className="container mx-auto px-4 py-6 max-w-4xl">
//       <div className="text-center space-y-4">
//         <AlertCircle className="h-16 w-16 mx-auto text-destructive" />
//         <div className="space-y-2">
//           <h1 className="text-2xl font-semibold">Error Loading Appointment</h1>
//           <p className="text-muted-foreground">
//             There was an error loading the appointment details. Please try again.
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }

export default function AppointmentDetailsPage({ params }: Readonly<AppointmentDetailsPageProps>) {
  return (
    <Suspense fallback={<AppointmentDetailsLoading />}>
      <div className="min-h-screen bg-background">
        <AppointmentDetails appointmentId={params.id} />
      </div>
    </Suspense>
  );
}
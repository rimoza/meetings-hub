import { notFound } from 'next/navigation'
import { getMeeting } from '@/lib/firebase/server'
import { PageHeader } from '@/components/ui/page-header'
import { MeetingDetailsClient } from '@/components/meetings/meeting-details-client'
import { ProtectedRoute } from '@/components/protected-route'

interface MeetingDetailsPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function MeetingDetailsPage({ params }: MeetingDetailsPageProps) {
  const resolvedParams = await params
  
  // Server-side data fetching
  const meeting = await getMeeting(resolvedParams.id)
  
  if (!meeting) {
    notFound()
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 space-y-6">
        {/* Server-rendered page header */}
        <PageHeader 
          title={meeting.title}
          description={`Meeting scheduled for ${new Date(meeting.date).toLocaleDateString()} at ${meeting.time}`}
        />
        
        {/* Client component for interactive features and real-time updates */}
        <MeetingDetailsClient initialMeeting={meeting} />
      </div>
    </ProtectedRoute>
  )
}

export async function generateMetadata({ params }: MeetingDetailsPageProps) {
  const resolvedParams = await params
  const meeting = await getMeeting(resolvedParams.id)
  
  if (!meeting) {
    return {
      title: 'Meeting Not Found'
    }
  }
  
  return {
    title: `${meeting.title} - Kulan Space`,
    description: `Meeting details for ${meeting.title} on ${new Date(meeting.date).toLocaleDateString()}`
  }
}
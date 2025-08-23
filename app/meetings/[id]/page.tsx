"use client";

import { ProtectedRoute } from "@/components/protected-route";
import { MeetingDetailsPage } from "@/components/meetings/meeting-details-page";

interface MeetingDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function MeetingDetailsPageWrapper({
  params,
}: Readonly<MeetingDetailsPageProps>) {
  return (
    <ProtectedRoute>
      <MeetingDetailsPage params={params} />
    </ProtectedRoute>
  );
}

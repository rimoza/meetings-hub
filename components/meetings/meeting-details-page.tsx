"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { getMeeting as getMeetingFirebase } from "@/lib/firebase/meetings";
import { MeetingDetailsClient } from "@/components/meetings/meeting-details-client";
import { Skeleton } from "@/components/ui/skeleton";
import type { Meeting } from "@/types/meeting";

interface MeetingDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export function MeetingDetailsPage({ params }: MeetingDetailsPageProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meetingId, setMeetingId] = useState<string | null>(null);

  // Resolve params
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setMeetingId(resolvedParams.id);
    };
    resolveParams();
  }, [params]);

  useEffect(() => {
    const fetchMeeting = async () => {
      if (!user?.uid || !meetingId) return;

      try {
        setLoading(true);
        setError(null);

        const meetingData = await getMeetingFirebase(meetingId, user.uid);

        if (!meetingData) {
          setError("Meeting not found");
          return;
        }

        setMeeting(meetingData);
      } catch (err) {
        console.error("Error fetching meeting:", err);
        setError("Failed to load meeting");
      } finally {
        setLoading(false);
      }
    };

    fetchMeeting();
  }, [user?.uid, meetingId]);

  // Handle not found or error cases
  useEffect(() => {
    if (!loading && (error === "Meeting not found" || (!meeting && !error))) {
      router.push("/404");
    }
  }, [loading, error, meeting, router]);

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (error && error !== "Meeting not found") {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold text-destructive mb-2">
            Error Loading Meeting
          </h2>
          <p className="text-muted-foreground">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!meeting) {
    return null; // Will redirect to 404
  }

  return <MeetingDetailsClient initialMeeting={meeting} />;
}

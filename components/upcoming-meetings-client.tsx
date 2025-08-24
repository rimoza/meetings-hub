"use client";

import { useState } from "react";
import { UpcomingMeetings } from "@/components/upcoming-meetings";
import { useMeetings } from "@/hooks/use-meetings";
import type { Meeting } from "@/types/meeting";
import { toast } from "sonner";
import { MeetingForm } from "@/components/meeting-form";

export function UpcomingMeetingsClient() {
  const { createMeeting, updateMeeting } = useMeetings();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | undefined>();

  const handleEdit = (meeting: Meeting) => {
    setEditingMeeting(meeting);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (meetingData: Omit<Meeting, "id">) => {
    try {
      if (editingMeeting) {
        await updateMeeting(editingMeeting.id, meetingData);
        toast.success("Meeting updated successfully");
      } else {
        await createMeeting(meetingData);
        toast.success("Meeting created successfully");
      }
      setIsFormOpen(false);
      setEditingMeeting(undefined);
    } catch (error) {
      console.error("Error submitting meeting:", error);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">

      {/* Upcoming Meetings Content */}
      <main className="flex-1 overflow-auto p-4">
        <UpcomingMeetings onEditMeeting={handleEdit} />
      </main>

      {/* Meeting Form Modal */}
      <MeetingForm
        meeting={editingMeeting}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingMeeting(undefined);
        }}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}
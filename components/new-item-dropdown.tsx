"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Calendar,
  CheckSquare,
  CalendarCheck,
  Users,
  Archive as ArchiveIcon,
  FileText,
  ChevronDown,
} from "lucide-react";
import { MeetingForm } from "@/components/meeting-form";
import { TaskForm } from "@/components/task-form";
import AppointmentForm  from "@/components/appointment-form";
import { ContactForm } from "@/components/contact-form";
import { ArchiveForm } from "@/components/archive-form";
import { ReportForm } from "@/components/report-form";
import type { Meeting } from "@/types/meeting";
import type { Task } from "@/types/task";
import type { Appointment } from "@/types/appointment";
import type { Contact } from "@/types/contact";
import type { Archive } from "@/types/archive";
import type { Report } from "@/types/report";

interface NewItemDropdownProps {
  onMeetingSubmit: (meeting: Omit<Meeting, "id">) => Promise<void>;
  onTaskSubmit: (task: Omit<Task, "id">) => Promise<void>;
  onAppointmentSubmit: (appointment: Omit<Appointment, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  onContactSubmit: (contact: Omit<Contact, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  onArchiveSubmit: (archive: Omit<Archive, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  onReportSubmit: (report: Omit<Report, "id" | "createdAt" | "updatedAt">) => Promise<void>;
}

export function NewItemDropdown({
  onMeetingSubmit,
  onTaskSubmit,
  onAppointmentSubmit,
  onContactSubmit,
  onArchiveSubmit,
  onReportSubmit,
}: Readonly<NewItemDropdownProps>) {
  const [isMeetingFormOpen, setIsMeetingFormOpen] = useState(false);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const [isArchiveFormOpen, setIsArchiveFormOpen] = useState(false);
  const [isReportFormOpen, setIsReportFormOpen] = useState(false);

  const menuItems = [
    {
      icon: Calendar,
      label: "Meeting",
      description: "Schedule a new meeting",
      onClick: () => setIsMeetingFormOpen(true),
    },
    {
      icon: CheckSquare,
      label: "Task",
      description: "Create a new task",
      onClick: () => setIsTaskFormOpen(true),
    },
    {
      icon: CalendarCheck,
      label: "Appointment",
      description: "Book an appointment",
      onClick: () => {}, // Handled by AppointmentForm trigger
    },
    {
      icon: Users,
      label: "Contact",
      description: "Add a new contact",
      onClick: () => setIsContactFormOpen(true),
    },
    {
      icon: ArchiveIcon,
      label: "Archive",
      description: "Create an archive entry",
      onClick: () => setIsArchiveFormOpen(true),
    },
    {
      icon: FileText,
      label: "Report",
      description: "Generate a new report",
      onClick: () => setIsReportFormOpen(true),
    },
  ];

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="gap-2 bg-primary hover:bg-primary/90 shadow-sm transition-all hover:shadow-md">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New</span>
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 p-2">
          {menuItems.map((item, index) => (
            <div key={item.label}>
              {item.label === "Appointment" ? (
                <AppointmentForm
                  onSubmit={onAppointmentSubmit}
                  trigger={
                    <div className="cursor-pointer p-3 rounded-md transition-colors hover:bg-accent focus:bg-accent w-full">
                      <div className="flex items-start gap-3">
                        <item.icon className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <div className="flex flex-col space-y-0.5">
                          <span className="text-sm font-medium">{item.label}</span>
                          <span className="text-xs text-muted-foreground">
                            {item.description}
                          </span>
                        </div>
                      </div>
                    </div>
                  }
                />
              ) : (
                <DropdownMenuItem
                  onClick={item.onClick}
                  className="cursor-pointer p-3 rounded-md transition-colors hover:bg-accent focus:bg-accent"
                >
                  <div className="flex items-start gap-3">
                    <item.icon className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div className="flex flex-col space-y-0.5">
                      <span className="text-sm font-medium">{item.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {item.description}
                      </span>
                    </div>
                  </div>
                </DropdownMenuItem>
              )}
              {index < menuItems.length - 1 && index % 2 === 1 && (
                <DropdownMenuSeparator className="my-1" />
              )}
            </div>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Meeting Form */}
      <MeetingForm
        isOpen={isMeetingFormOpen}
        onClose={() => setIsMeetingFormOpen(false)}
        onSubmit={async (data) => {
          await onMeetingSubmit(data);
          setIsMeetingFormOpen(false);
        }}
      />

      {/* Task Form */}
      {isTaskFormOpen && (
        <TaskForm
          isOpen={isTaskFormOpen}
          onClose={() => setIsTaskFormOpen(false)}
          onSubmit={async (data) => {
            await onTaskSubmit(data);
            setIsTaskFormOpen(false);
          }}
        />
      )}


      {/* Contact Form */}
      {isContactFormOpen && (
        <ContactForm
          isOpen={isContactFormOpen}
          onClose={() => setIsContactFormOpen(false)}
          onSubmit={async (data) => {
            await onContactSubmit(data);
            setIsContactFormOpen(false);
          }}
        />
      )}

      {/* Archive Form */}
      {isArchiveFormOpen && (
        <ArchiveForm
          isOpen={isArchiveFormOpen}
          onClose={() => setIsArchiveFormOpen(false)}
          onSubmit={async (data) => {
            await onArchiveSubmit(data);
            setIsArchiveFormOpen(false);
          }}
        />
      )}

      {/* Report Form */}
      {isReportFormOpen && (
        <ReportForm
          isOpen={isReportFormOpen}
          onClose={() => setIsReportFormOpen(false)}
          onSubmit={async (data) => {
            await onReportSubmit(data);
            setIsReportFormOpen(false);
          }}
        />
      )}
    </>
  );
}
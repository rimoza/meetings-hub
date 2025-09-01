"use client";

import React, { useState } from "react";
import { AppointmentPrintPreview } from "@/components/appointment-print-preview";
import { Appointment } from "@/types/appointment";

// Sample appointment data for testing
const sampleAppointments: Appointment[] = [
  {
    id: "1",
    dailyNumber: 1,
    title: "Meeting with CEO",
    date: "2025-09-02",
    time: "10:30",
    status: "scheduled",
    attendee: "Maxamed Ibraahim",
    attendeeEmail: "+252637589678",
    duration: 30,
    location: "Conference Room A",
    description: "Quarterly review meeting",
    reminderSent: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    dailyNumber: 2,
    title: "Budget Review",
    date: "2025-09-02",
    time: "14:00",
    status: "scheduled",
    attendee: "Faadumo Xasan",
    attendeeEmail: "+252612345678",
    duration: 45,
    location: "Office 201",
    description: "Annual budget planning",
    reminderSent: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    dailyNumber: 3,
    title: "Project Update",
    date: "2025-09-02",
    time: "16:30",
    status: "confirmed",
    attendee: "Cabdi Kariim",
    attendeeEmail: "cabdi@example.com",
    duration: 60,
    location: "Meeting Room B",
    description: "Project status update",
    reminderSent: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export default function TestPrintPage() {
  const [showPreview, setShowPreview] = useState(false);
  const [selectedAppointments, setSelectedAppointments] = useState<Appointment[]>([]);

  const handlePrintSingle = (appointment: Appointment) => {
    setSelectedAppointments([appointment]);
    setShowPreview(true);
  };

  const handlePrintAll = () => {
    setSelectedAppointments(sampleAppointments);
    setShowPreview(true);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Test Appointment Card Printing</h1>
      
      <div className="mb-4">
        <button
          onClick={handlePrintAll}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mr-4"
        >
          Print All Cards
        </button>
      </div>

      <div className="grid gap-4">
        {sampleAppointments.map((appointment) => (
          <div key={appointment.id} className="border rounded-lg p-4 bg-white shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{appointment.title}</h3>
                <p className="text-gray-600">Attendee: {appointment.attendee}</p>
                <p className="text-gray-600">Date: {appointment.date}</p>
                <p className="text-gray-600">Time: {appointment.time}</p>
                <p className="text-gray-600">Location: {appointment.location}</p>
                <p className="text-gray-600">Daily Number: {appointment.dailyNumber}</p>
              </div>
              <button
                onClick={() => handlePrintSingle(appointment)}
                className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Print Card
              </button>
            </div>
          </div>
        ))}
      </div>

      <AppointmentPrintPreview
        appointments={selectedAppointments}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
      />
    </div>
  );
}
"use client";

import React from "react";
import { Appointment } from "@/types/appointment";
import { format } from "date-fns";

interface AppointmentPrintCardProps {
  appointment: Appointment;
}

export function AppointmentPrintCard({ appointment }: AppointmentPrintCardProps) {
  // Extract year from date for appointment ID
  const appointmentYear = new Date(appointment.date).getFullYear();
  
  // Format appointment ID as XXX/YYYY (remove leading zeros from dailyNumber)
  const appointmentId = `${appointment.dailyNumber}/${appointmentYear}`;
  
  // Format date as "02 Sep, 2025"
  const formattedDate = format(new Date(appointment.date), "dd MMM, yyyy");
  
  // Format time with AM/PM
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="appointment-print-card">
      <div className="card-header">
        <h1 className="organization-name">XISBIGA WADDANI</h1>
        <p className="organization-subtitle">Xafiiska Guddoomiyaha</p>
      </div>
      
      <div className="card-body">
        <div className="appointment-info">
          <div className="info-row">
            <span className="info-label">Appointment ID:</span>
            <span className="info-value">#00{appointmentId}</span>
          </div>
          
          <div className="info-row">
            <span className="info-label">Appointment Date:</span>
            <span className="info-value">{formattedDate}</span>
          </div>
          
          <div className="info-row">
            <span className="info-label">Appointment Time:</span>
            <span className="info-value">{formatTime(appointment.time)}</span>
          </div>
          
          <div className="info-row">
            <span className="info-label">Name:</span>
            <span className="info-value">{appointment.attendee}</span>
          </div>
          
          <div className="info-row">
            <span className="info-label">Attendance:</span>
            <span className="info-value">{appointment.dailyNumber}</span>
          </div>
          
          {appointment.location && (
            <div className="info-row">
              <span className="info-label">Location:</span>
              <span className="info-value">{appointment.location}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="card-footer">
        <p className="thanks-message">Thank you for your appointment.<br/>We look forward to meeting you.</p>
        {appointment.attendeeEmail && (
          <p className="contact-info">Contact: {appointment.attendeeEmail}</p>
        )}
      </div>
    </div>
  );
}

// Component for printing multiple cards on a single page
interface PrintableCardsPageProps {
  appointments: Appointment[];
}

export function PrintableCardsPage({ appointments }: PrintableCardsPageProps) {
  // Display one card per page - deduplicate appointments by ID
  const uniqueAppointments = appointments.filter((appointment, index, self) => 
    index === self.findIndex((a) => a.id === appointment.id)
  );
  
  return (
    <div className="">
      <div className="">
        <div className="cards-grid">
          {uniqueAppointments.map((appointment, index) => (
            <AppointmentPrintCard 
              key={`${appointment.id}-print-${index}`} 
              appointment={appointment} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}
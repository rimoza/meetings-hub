"use client";

import React from "react";
import Image from "next/image";
import { Appointment } from "@/types/appointment";
import { format } from "date-fns";
import { PrintOptimizedBarcode } from "./print-optimized-barcode";

interface AppointmentPrintCardProps {
  appointment: Appointment;
}

export function AppointmentPrintCard({ appointment }: Readonly<AppointmentPrintCardProps>) {
  // Extract year from date for meeting ID
  const meetingYear = new Date(appointment.date).getFullYear();
  
  // Format meeting ID as XXX/YYYY (remove leading zeros from dailyNumber)
  const meetingId = `${appointment.dailyNumber}/${meetingYear}`;
  
  // Create a short barcode value with #00 prefix
  const barcodeValue = `#00${appointment.dailyNumber}`;
  
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
        <div className="organization-logo" style={{display: 'flex', alignItems: 'center', justifyContent: 'center' ,marginBottom:"1rem"}}>
          <Image
            src="/logo.jpg"
            alt="Organization Logo"
            width={150}
            height={80}
            className="logo-image"
          />
        </div>
        <div className="organization-text">
          <h1 className="organization-name">XISBIGA WADDANI</h1>
          <p className="organization-subtitle">Xafiiska Guddoomiyaha</p>
        </div>
      </div>
      
      <div className="card-body">
        <div className="meeting-info">
          <div className="info-row">
            <span className="info-label">Meeting ID:</span>
            <span className="info-value">#00{meetingId}</span>
          </div>
          
          <div className="info-row">
            <span className="info-label">Meeting Date:</span>
            <span className="info-value">{formattedDate}</span>
          </div>
          
          <div className="info-row">
            <span className="info-label">Meeting Time:</span>
            <span className="info-value">{formatTime(appointment.time)}</span>
          </div>
          
          <div className="info-row">
            <span className="info-label">Name:</span>
            <span className="info-value">{appointment.title}</span>
          </div>
          
          <div className="info-row">
            <span className="info-label">Attendance:</span>
            <span className="info-value">{appointment.attendeeCount}</span>
          </div>
          
          {appointment.location && (
            <div className="info-row">
              <span className="info-label">Location:</span>
              <span className="info-value">{appointment.location}</span>
            </div>
          )}
        </div>
      </div>
      
      <PrintOptimizedBarcode 
        value={barcodeValue}
        meetingId={meetingId}
      />
      
      <div className="card-footer">
        <p className="thanks-message">Ku mahadsanid sugitaankaaga.<br/>Gacmo furan ku soo dhawoow.</p>
        <div className="contact-section">
          <p className="contact-info">+252634118949 (Call & WhatsApp)</p>
        </div>
      </div>
    </div>
  );
}

// Component for printing multiple cards on a single page
interface PrintableCardsPageProps {
  appointments: Appointment[];
}

export function PrintableCardsPage({ appointments }: Readonly<PrintableCardsPageProps>) {
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
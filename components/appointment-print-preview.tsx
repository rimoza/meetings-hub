"use client";

import React, { useEffect, useRef } from "react";
import { Appointment } from "@/types/appointment";
import { AppointmentPrintCard } from "./appointment-print-card";
import { X, Printer } from "lucide-react";
import "@/styles/print-card.css";

interface AppointmentPrintPreviewProps {
  appointments: Appointment[];
  isOpen: boolean;
  onClose: () => void;
}

export function AppointmentPrintPreview({ 
  appointments, 
  isOpen, 
  onClose 
}: AppointmentPrintPreviewProps) {
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Add CSS file to document if not already present
    const cssId = 'print-card-styles';
    if (!document.getElementById(cssId)) {
      const link = document.createElement('link');
      link.id = cssId;
      link.rel = 'stylesheet';
      link.href = '/styles/print-card.css';
      document.head.appendChild(link);
    }
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="print-preview-modal">
      <div className="print-preview-content">
        <div className="print-preview-header no-print">
          <h2 className="text-lg font-semibold">Print Preview</h2>
          <div className="print-preview-actions">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              <X className="w-4 h-4" />
              Close
            </button>
          </div>
        </div>
        
        <div className="print-preview-body">
          <div ref={printRef}>
            <div className="print-container">
              <div className="print-page">
                <div className="cards-grid">
                  {appointments.map((appointment) => (
                    <AppointmentPrintCard key={appointment.id} appointment={appointment} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
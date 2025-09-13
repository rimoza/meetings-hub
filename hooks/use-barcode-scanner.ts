'use client';

import { useCallback } from 'react';
import { useAppointments } from './use-appointments';
import { toast } from 'sonner';
import { Appointment } from '@/types/appointment';

export function useBarcodeScanner() {
  const { appointments, updateAppointment } = useAppointments();

  const handleBarcodeScan = useCallback(async (barcodeValue: string) => {
    console.log('🌐 [useBarcodeScanner] Starting scan for:', barcodeValue);
    console.log('📅 [useBarcodeScanner] Current appointments:', appointments.length, 'appointments');
    
    try {
      let targetAppointment: Appointment | undefined;
      let meetingId: string | undefined;
      
      // Check if it's the old format (MTG-{meetingId}-{appointmentId})
      const oldFormatPattern = /^MTG-(\d+\/\d+)-(.+)$/;
      const oldMatch = barcodeValue.match(oldFormatPattern);
      
      if (oldMatch) {
        // Old format
        const appointmentId = oldMatch[2];
        meetingId = oldMatch[1];
        console.log('🅾️ [useBarcodeScanner] Old format detected - AppointmentId:', appointmentId, 'MeetingId:', meetingId);
        targetAppointment = appointments.find(apt => apt.id === appointmentId);
      } else if (/^#00\d+$/.test(barcodeValue.trim())) {
        // New format with #00 prefix
        const dailyNumber = parseInt(barcodeValue.trim().replace('#00', ''), 10);
        console.log('🆕 [useBarcodeScanner] #00 format detected - Daily number:', dailyNumber);
        targetAppointment = appointments.find(apt => apt.dailyNumber === dailyNumber);
      } else if (/^\d+$/.test(barcodeValue.trim())) {
        // Numeric format - just the daily number
        const dailyNumber = parseInt(barcodeValue.trim(), 10);
        console.log('🔢 [useBarcodeScanner] Numeric format detected - Daily number:', dailyNumber);
        targetAppointment = appointments.find(apt => apt.dailyNumber === dailyNumber);
      } else {
        // Try as appointment ID
        console.log('🆔 [useBarcodeScanner] Trying as direct appointment ID:', barcodeValue.trim());
        targetAppointment = appointments.find(apt => apt.id === barcodeValue.trim());
      }
      
      if (!targetAppointment) {
        console.log('❌ [useBarcodeScanner] No appointment found for barcode:', barcodeValue);
        console.log('🔍 [useBarcodeScanner] Available appointments:', appointments.map(a => ({ 
          id: a.id, 
          dailyNumber: a.dailyNumber, 
          status: a.status 
        })));
        toast.error(`Appointment not found for barcode: ${barcodeValue}`);
        return false;
      }
      
      console.log('✅ [useBarcodeScanner] Found appointment:', {
        id: targetAppointment.id,
        dailyNumber: targetAppointment.dailyNumber,
        status: targetAppointment.status,
      });
      
      // Generate meeting ID if not provided (new format)
      if (!meetingId) {
        const meetingYear = new Date(targetAppointment.date).getFullYear();
        meetingId = `${targetAppointment.dailyNumber}/${meetingYear}`;
      }

      // Handle status transitions based on current state
      console.log('🔄 [useBarcodeScanner] Current appointment status:', targetAppointment.status);
      
      if (targetAppointment.status === 'completed') {
        console.log('ℹ️ [useBarcodeScanner] Appointment already completed');
        toast.info(`Appointment ${meetingId} is already completed`);
        return true;
      }

      if (targetAppointment.status === 'confirmed') {
        console.log('⚠️ [useBarcodeScanner] Appointment already confirmed, checking for others to complete');
        // If scanning an already confirmed appointment, don't change it
        // but complete other confirmed appointments
        const otherConfirmed = appointments.filter(apt => 
          apt.status === 'confirmed' && apt.id !== targetAppointment.id
        );
        
        console.log('🔍 [useBarcodeScanner] Found', otherConfirmed.length, 'other confirmed appointments to complete');

        for (const confirmedAppt of otherConfirmed) {
          console.log('🔄 [useBarcodeScanner] Completing appointment:', confirmedAppt.id);
          await updateAppointment(confirmedAppt.id, { 
            status: 'completed' 
          });
          
          const confirmedMeetingYear = new Date(confirmedAppt.date).getFullYear();
          const confirmedMeetingId = `${confirmedAppt.dailyNumber}/${confirmedMeetingYear}`;
          
          console.log('✅ [useBarcodeScanner] Completed appointment:', confirmedMeetingId);
          toast.success(`Appointment #00${confirmedMeetingId} marked as completed`);
        }
        
        toast.info(`Appointment #00${meetingId} remains confirmed (already was confirmed)`);
        return true;
      }

      // If appointment is scheduled, we need to:
      // 1. Complete any currently confirmed appointments
      // 2. Confirm this scheduled appointment
      if (targetAppointment.status === 'scheduled') {
        console.log('📅 [useBarcodeScanner] Appointment is scheduled, processing status change');
        
        // Find and complete all currently confirmed appointments
        const currentlyConfirmed = appointments.filter(apt => 
          apt.status === 'confirmed'
        );
        
        console.log('🔍 [useBarcodeScanner] Found', currentlyConfirmed.length, 'confirmed appointments to complete');

        // Complete all currently confirmed appointments
        for (const confirmedAppt of currentlyConfirmed) {
          console.log('🔄 [useBarcodeScanner] Completing previous appointment:', confirmedAppt.id);
          await updateAppointment(confirmedAppt.id, { 
            status: 'completed' 
          });
          
          const confirmedMeetingYear = new Date(confirmedAppt.date).getFullYear();
          const confirmedMeetingId = `${confirmedAppt.dailyNumber}/${confirmedMeetingYear}`;
          
          console.log('✅ [useBarcodeScanner] Completed appointment:', confirmedMeetingId);
          toast.success(`Previous appointment #00${confirmedMeetingId} marked as completed`);
        }

        // Confirm the newly scanned scheduled appointment
        console.log('🆕 [useBarcodeScanner] Confirming scanned appointment:', targetAppointment.id);
        await updateAppointment(targetAppointment.id, { 
          status: 'confirmed' 
        });

        console.log('✅ [useBarcodeScanner] SCANNED: Appointment confirmed successfully!');
        toast.success(`Appointment #00${meetingId} confirmed successfully!`);
        return true;
      }

      // Handle any other status (waiting, etc.)
      console.log('⚠️ [useBarcodeScanner] Unexpected status:', targetAppointment.status);
      toast.warning(`Appointment ${meetingId} has status: ${targetAppointment.status}`);
      return false;

    } catch (error) {
      console.error('💥 [useBarcodeScanner] Error handling barcode scan:', error);
      toast.error('Failed to process barcode scan');
      return false;
    }
  }, [appointments, updateAppointment]);

  const validateBarcode = useCallback((barcodeValue: string): boolean => {
    const barcodePattern = /^MTG-(\d+\/\d+)-(.+)$/;
    return barcodePattern.test(barcodeValue);
  }, []);

  const parseBarcode = useCallback((barcodeValue: string) => {
    const barcodePattern = /^MTG-(\d+\/\d+)-(.+)$/;
    const match = barcodeValue.match(barcodePattern);
    
    if (!match) return null;
    
    const [, meetingId, appointmentId] = match;
    return { meetingId, appointmentId };
  }, []);

  return {
    handleBarcodeScan,
    validateBarcode,
    parseBarcode,
  };
}
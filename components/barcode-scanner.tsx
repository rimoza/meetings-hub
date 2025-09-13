'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useBarcodeScanner } from '@/hooks/use-barcode-scanner';
import { toast } from 'sonner';

interface BarcodeScannerProps {
  onScanSuccess?: (appointmentId: string, meetingId: string) => void;
  onScanError?: (error: string) => void;
}

export function BarcodeScanner({ onScanSuccess, onScanError }: BarcodeScannerProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const scanBufferRef = useRef('');
  const scanTimestampRef = useRef(0);

  const { handleBarcodeScan, validateBarcode, parseBarcode } = useBarcodeScanner();

  // Process the barcode scan
  const processScan = useCallback(async (barcodeValue: string) => {
    console.log('🎯 SCANNED: Processing barcode value:', barcodeValue);
    if (!barcodeValue) {
      console.log('❌ Empty barcode value, skipping');
      return;
    }

    setIsProcessing(true);
    console.log('🔄 Processing started for:', barcodeValue);
    console.log('⏳ Current processing state:', isProcessing ? 'BUSY' : 'IDLE');
    try {
      // Support multiple barcode formats
      let appointmentId: string;
      let meetingId: string;
      
      console.log('🔍 Checking barcode format for:', barcodeValue);
      
      // Check if it's the old format MTG-XXX/YYYY-ID
      if (validateBarcode(barcodeValue)) {
        console.log('✅ Valid MTG format detected');
        const parsed = parseBarcode(barcodeValue);
        if (!parsed) {
          console.log('❌ Failed to parse MTG format');
          const errorMsg = 'Could not parse barcode';
          toast.error(errorMsg);
          onScanError?.(errorMsg);
          return;
        }
        appointmentId = parsed.appointmentId;
        meetingId = parsed.meetingId;
        console.log('📋 Parsed - AppointmentId:', appointmentId, 'MeetingId:', meetingId);
      } else {
        console.log('🆕 New format detected (not MTG), passing raw value:', barcodeValue);
        // For new formats (#00XXX or just numbers), we'll let the hook handle it
        appointmentId = barcodeValue;
        meetingId = 'pending'; // Will be determined by the hook
      }

      console.log('🚀 Calling handleBarcodeScan with:', barcodeValue);
      const success = await handleBarcodeScan(barcodeValue);
      console.log('📊 Scan result:', success ? 'SUCCESS' : 'FAILED');

      if (success) {
        console.log('✅ SCANNED: Successfully processed appointment');
        onScanSuccess?.(appointmentId, meetingId);
      } else {
        console.log('❌ SCANNED: Failed to process appointment');
        onScanError?.('Failed to process appointment');
      }

    } catch (error) {
      console.error('💥 SCANNED: Error processing scan:', error);
      toast.error('Error processing scan');
      onScanError?.('Error processing scan');
    } finally {
      console.log('🏁 Processing completed');
      setIsProcessing(false);
    }
  }, [validateBarcode, parseBarcode, handleBarcodeScan, onScanSuccess, onScanError]);

  // Handle automatic barcode scanner input (most scanners send input as keyboard events)
  const handleKeyPress = useCallback(async (event: KeyboardEvent) => {
    const now = Date.now();
    const char = event.key;

    // Handle Enter key (typical end of barcode scan)
    if (char === 'Enter') {
      event.preventDefault();
      const currentBuffer = scanBufferRef.current.trim();
      if (currentBuffer) {
        console.log('🔍 SCANNED: Barcode detected via Enter key:', currentBuffer);
        console.log('📊 Processing scan buffer:', currentBuffer);
        await processScan(currentBuffer);
        scanBufferRef.current = '';
      }
      return;
    }

    // If more than 100ms has passed since last character, start a new scan
    if (now - scanTimestampRef.current > 100) {
      console.log('⏱️ New scan started (>100ms gap)');
      scanBufferRef.current = '';
    }

    scanTimestampRef.current = now;

    // Add character to buffer (ignore control keys)
    if (char.length === 1) {
      console.log('📝 Adding character to buffer:', char);
      scanBufferRef.current += char;
      console.log('📦 Buffer updated:', scanBufferRef.current);
    }
  }, [processScan]);

  // Add event listener for barcode scanner
  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    console.log('🚀 Barcode scanner initialized - ready to scan');
    toast.info('Barcode scanner ready - scan any appointment card', {
      duration: 3000,
    });
    
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      console.log('🛑 Barcode scanner deactivated');
    };
  }, [handleKeyPress]);

  // This component is invisible - it only listens for barcode scans
  return null;
}
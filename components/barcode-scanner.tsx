'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useBarcodeScanner } from '@/hooks/use-barcode-scanner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Scan, Check, AlertTriangle } from 'lucide-react';

interface BarcodeScannerProps {
  onScanSuccess?: (appointmentId: string, meetingId: string) => void;
  onScanError?: (error: string) => void;
}

export function BarcodeScanner({ onScanSuccess, onScanError }: BarcodeScannerProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastScanResult, setLastScanResult] = useState<{
    success: boolean;
    meetingId?: string;
    timestamp: Date;
  } | null>(null);
  const scanBufferRef = useRef('');
  const scanTimestampRef = useRef(0);
  const [displayBuffer, setDisplayBuffer] = useState(''); // Just for UI display

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
          setLastScanResult({ success: false, timestamp: new Date() });
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
      
      setLastScanResult({ 
        success, 
        meetingId: meetingId !== 'pending' ? meetingId : 'processed',
        timestamp: new Date() 
      });

      if (success) {
        console.log('✅ SCANNED: Successfully processed appointment');
        onScanSuccess?.(appointmentId, meetingId);
      } else {
        console.log('❌ SCANNED: Failed to process appointment');
        onScanError?.('Failed to process appointment');
      }

    } catch (error) {
      console.error('💥 SCANNED: Error processing scan:', error);
      setLastScanResult({ success: false, timestamp: new Date() });
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
        setDisplayBuffer('');
      }
      return;
    }

    // If more than 100ms has passed since last character, start a new scan
    if (now - scanTimestampRef.current > 100) {
      console.log('⏱️ New scan started (>100ms gap)');
      scanBufferRef.current = '';
      setDisplayBuffer('');
    }

    scanTimestampRef.current = now;

    // Add character to buffer (ignore control keys)
    if (char.length === 1) {
      console.log('📝 Adding character to buffer:', char);
      scanBufferRef.current += char;
      setDisplayBuffer(scanBufferRef.current);
      console.log('📦 Buffer updated:', scanBufferRef.current);
    }
  }, [processScan]);

  // Add event listener for barcode scanner
  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scan className="h-5 w-5" />
          Barcode Scanner
        </CardTitle>
        <CardDescription>
          Scan appointment barcode
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Scan Status */}
        {isProcessing && (
          <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-md">
            <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            <span className="text-sm text-blue-700">Processing scan...</span>
          </div>
        )}

        {/* Last Scan Result */}
        {lastScanResult && (
          <div className={`flex items-center gap-2 p-2 rounded-md ${
            lastScanResult.success 
              ? 'bg-green-50 text-green-700' 
              : 'bg-red-50 text-red-700'
          }`}>
            {lastScanResult.success ? (
              <>
                <Check className="h-4 w-4" />
                <span className="text-sm">
                  Appointment {lastScanResult.meetingId} confirmed
                </span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">Scan failed</span>
              </>
            )}
            <Badge variant="outline" className="ml-auto text-xs">
              {lastScanResult.timestamp.toLocaleTimeString()}
            </Badge>
          </div>
        )}

        {/* Scanning Buffer (for debugging) */}
        {displayBuffer && (
          <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded font-mono">
            Scanning: {displayBuffer}
          </div>
        )}

        {/* Instructions */}
        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
          <p className="font-medium mb-1">Instructions:</p>
          <ul className="space-y-1">
            <li>• <strong>Print the appointment cards first</strong> - scanners can&apos;t read from screens</li>
            <li>• Hold scanner 2-4 inches from the barcode</li>
            <li>• Ensure good lighting on the printed card</li>
            <li>• Current confirmed appointments will be automatically completed</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
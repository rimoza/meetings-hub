'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const Barcode = dynamic(() => import("react-barcode"), { ssr: false });

interface PrintOptimizedBarcodeProps {
  value: string;
  meetingId: string;
}

export function PrintOptimizedBarcode({ value, meetingId }: Readonly<PrintOptimizedBarcodeProps>) {
  return (
    <div 
      className="print-barcode-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: '0.5rem',
        marginBottom: '0.5rem',
        padding: '0.5rem',
        backgroundColor: '#FFFFFF',
        border: '2px solid #000000',
        borderRadius: '4px'
      }}
    >
      {/* High-contrast barcode optimized for physical scanning */}
      <Barcode
        value={value}
        format="CODE128"
        width={1.8}
        height={45}
        displayValue={true}
        fontSize={10}
        margin={8}
        background="#FFFFFF"
        lineColor="#000000"
        textMargin={3}
        textPosition="bottom"
      />
      
      {/* Human-readable text as backup */}
      <div 
        style={{
          fontSize: '10px',
          color: '#000000',
          marginTop: '4px',
          fontFamily: 'monospace',
          fontWeight: 'bold',
          textAlign: 'center'
        }}
      >
        Meeting #{meetingId.replace('/', '-')}
      </div>
      
      {/* Print-specific styling */}
      <style jsx>{`
        @media print {
          .print-barcode-container {
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
            break-inside: avoid;
          }
          
          .print-barcode-container svg {
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .print-barcode-container rect[fill="#FFFFFF"],
          .print-barcode-container rect[fill="white"] {
            fill: white !important;
          }
          
          .print-barcode-container rect[fill="#000000"],
          .print-barcode-container rect[fill="black"] {
            fill: black !important;
          }
          
          .print-barcode-container text {
            fill: black !important;
            font-weight: bold !important;
          }
        }
      `}</style>
    </div>
  );
}
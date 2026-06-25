"use client";

import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
}

export default function QRScanner({ onScanSuccess }: QRScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    if (!scannerRef.current) {
      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
        },
        /* verbose= */ false
      );

      scannerRef.current.render(
        (decodedText) => {
          // Pause scanning once successful
          if (scannerRef.current) {
            scannerRef.current.pause(true);
            setIsScanning(false);
          }
          onScanSuccess(decodedText);
        },
        (errorMessage) => {
          // ignore scan errors, they happen continuously when no QR is in view
        }
      );
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resumeScan = () => {
    if (scannerRef.current && !isScanning) {
      scannerRef.current.resume();
      setIsScanning(true);
    }
  };

  return (
    <div style={{ width: "100%", maxWidth: "400px", margin: "0 auto" }}>
      <div id="qr-reader" style={{ borderRadius: "16px", overflow: "hidden", border: "2px solid var(--color-1)" }}></div>
      {!isScanning && (
        <button 
          onClick={resumeScan}
          className="btn-primary" 
          style={{ marginTop: "16px" }}
        >
          Escanear de Nuevo
        </button>
      )}
    </div>
  );
}

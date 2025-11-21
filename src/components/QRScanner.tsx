import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface Props {
    onScan: (decodedText: string) => void;
    onError?: (error: any) => void;
}

export const QRScanner: React.FC<Props> = ({ onScan, onError }) => {
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);
    const [isScanning, setIsScanning] = useState(true);

    useEffect(() => {
        // Initialize scanner
        if (!scannerRef.current) {
            scannerRef.current = new Html5QrcodeScanner(
                "reader",
                { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
            );

            scannerRef.current.render(
                (decodedText) => {
                    onScan(decodedText);
                    // Stop scanning after success to prevent multiple triggers
                    if (scannerRef.current) {
                        scannerRef.current.clear().catch(console.error);
                        setIsScanning(false);
                    }
                },
                (errorMessage) => {
                    if (onError) onError(errorMessage);
                }
            );
        }

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(console.error);
            }
        };
    }, [onScan, onError]);

    return (
        <div className="w-full max-w-sm mx-auto overflow-hidden rounded-xl bg-black">
            {isScanning ? (
                <div id="reader" className="w-full" />
            ) : (
                <div className="p-8 text-center text-white">
                    <p>Scan Complete!</p>
                </div>
            )}
        </div>
    );
};

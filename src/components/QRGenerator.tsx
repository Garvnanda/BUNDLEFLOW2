import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface Props {
    data: string;
}

export const QRGenerator: React.FC<Props> = ({ data }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (canvasRef.current) {
            QRCode.toCanvas(canvasRef.current, data, {
                width: 256,
                margin: 2,
                color: {
                    dark: '#4F46E5',
                    light: '#FFFFFF',
                },
            }, (error) => {
                if (error) console.error(error);
            });
        }
    }, [data]);

    return (
        <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-sm border border-gray-100">
            <canvas ref={canvasRef} className="rounded-lg" />
            <p className="mt-2 text-xs text-gray-400">Scan to join group</p>
        </div>
    );
};

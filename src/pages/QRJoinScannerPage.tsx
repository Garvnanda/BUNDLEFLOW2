import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { QRScanner } from '../components/QRScanner';
import { parseQRPayload } from '../utils/qr';
import { useStore } from '../store/useStore';
import { ArrowLeft, Loader2 } from 'lucide-react';

export const QRJoinScannerPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { addMember, currentUser } = useStore();
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Handle URL-based join
    useEffect(() => {
        const data = searchParams.get('data');
        if (data && !isProcessing) {
            handleScan(data);
        }
    }, [searchParams]);

    const handleScan = async (decodedText: string) => {
        setIsProcessing(true);
        setError(null);

        try {
            const payload = parseQRPayload(decodedText);

            if (!payload) {
                setError("Invalid Invite Code");
                setIsProcessing(false);
                return;
            }

            if (!currentUser) {
                setError("Please connect your wallet first!");
                setIsProcessing(false);
                return;
            }

            // Simulate a small delay for UX
            await new Promise(resolve => setTimeout(resolve, 800));

            // Auto-add member
            addMember(payload.groupId, {
                address: currentUser,
                name: 'You',
                joinedAt: Date.now()
            });

            // Navigate to group
            navigate(`/groups/${payload.groupId}`);
        } catch (e) {
            setError("Failed to join group");
            setIsProcessing(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-3 px-2">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-2xl font-bold text-white">Join Group</h1>
            </div>

            <div className="glass-card p-6 rounded-3xl border border-white/10 relative overflow-hidden">
                {isProcessing ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <Loader2 size={48} className="text-indigo-500 animate-spin" />
                        <p className="text-white font-medium">Joining group...</p>
                    </div>
                ) : (
                    <>
                        <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                            <QRScanner
                                onScan={handleScan}
                                onError={(err) => console.log(err)}
                            />
                        </div>

                        {error && (
                            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm text-center font-medium animate-in fade-in slide-in-from-bottom-2">
                                {error}
                            </div>
                        )}

                        <p className="mt-6 text-center text-zinc-400 text-sm">
                            Point your camera at a BundleFlow QR code<br />or use an invite link.
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};

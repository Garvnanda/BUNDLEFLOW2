import React, { useState, useEffect } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { smoothSendService, BatchSettlementRequest } from '../services/smoothsend';
import { Transfer } from '../types';
import clsx from 'clsx';
import { Loader2, Zap, CheckCircle, AlertCircle } from 'lucide-react';
import { fromSmallest, getDecimalsForToken } from '../utils/amount';

interface GaslessSettleButtonProps {
    transfers: Transfer[];
    onSettlementComplete: (txHash: string) => void;
}

export const GaslessSettleButton: React.FC<GaslessSettleButtonProps> = ({ transfers, onSettlementComplete }) => {
    const { connected, account, signTransaction, network } = useWallet();
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [quote, setQuote] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);

    // Listen for SmoothSend events
    useEffect(() => {
        const removeListener = smoothSendService.subscribe((event: any) => {
            console.log('SmoothSend Event:', event);
            switch (event.type) {
                case 'transfer_initiated':
                    setStatus('Initiating transfer...');
                    break;
                case 'transfer_signed':
                    setStatus('Transaction signed. Submitting...');
                    break;
                case 'transfer_submitted':
                    setStatus('Submitted to network...');
                    break;
                case 'transfer_confirmed':
                    setStatus('Settlement confirmed!');
                    break;
                case 'transfer_failed':
                    setStatus('Transfer failed.');
                    setError(event.data?.message || 'Unknown error');
                    setLoading(false);
                    break;
            }
        });
        return () => removeListener();
    }, []);

    const handleGetQuote = async () => {
        if (!connected || !account) return;
        setLoading(true);
        setError(null);
        setStatus('Getting quote...');

        try {
            // Pre-flight check: Network
            if (network && !network.name.toLowerCase().includes('testnet')) {
                throw new Error("Please switch to Aptos Testnet to use gasless settlement.");
            }

            const request: BatchSettlementRequest = {
                transfers: transfers.map(t => ({
                    recipient: t.to,
                    amount: t.amount,
                    token: 'USDC'
                })),
                sender: account.address
            };

            const q = await smoothSendService.getQuote(request);
            setQuote(q);
            setShowModal(true);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to get quote');
        } finally {
            setLoading(false);
            setStatus('');
        }
    };

    const handleExecute = async () => {
        if (!quote || !account) return;
        setLoading(true);
        setStatus('Preparing transaction...');

        try {
            const request: BatchSettlementRequest = {
                transfers: transfers.map(t => ({
                    recipient: t.to,
                    amount: t.amount,
                    token: 'USDC'
                })),
                sender: account.address
            };

            // We pass the wallet adapter context which has signTransaction
            const walletContext = {
                account,
                signTransaction: async (txn: any) => {
                    setStatus('Please sign in your wallet...');
                    return await signTransaction(txn);
                }
            };

            const result = await smoothSendService.executeBatchSettlement(walletContext, request, quote);

            if (result.txHash) {
                onSettlementComplete(result.txHash);
                setShowModal(false);
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Settlement failed');
        } finally {
            setLoading(false);
            setStatus('');
        }
    };

    if (!connected) {
        return (
            <button disabled className="w-full py-3 rounded-xl bg-white/5 text-white/40 font-medium cursor-not-allowed flex items-center justify-center gap-2">
                <Zap className="w-4 h-4" /> Connect Wallet to Settle
            </button>
        );
    }

    const decimals = getDecimalsForToken('USDC');

    return (
        <>
            <button
                onClick={handleGetQuote}
                disabled={loading || transfers.length === 0}
                className={clsx(
                    "w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2",
                    loading || transfers.length === 0
                        ? "bg-gray-600 cursor-not-allowed"
                        : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-emerald-500/20"
                )}
            >
                {loading ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {status || 'Processing...'}
                    </>
                ) : (
                    <>
                        <Zap className="w-4 h-4 fill-current" />
                        <span>Settle Gasless (USDC)</span>
                    </>
                )}
            </button>

            {error && (
                <div className="mt-2 text-red-400 text-sm text-center bg-red-500/10 p-2 rounded-lg border border-red-500/20 flex items-center justify-center gap-2">
                    <AlertCircle className="w-4 h-4" /> {error}
                </div>
            )}

            {/* Confirmation Modal */}
            {showModal && quote && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-[#1a1b26] rounded-2xl border border-white/10 p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <CheckCircle className="text-emerald-500" /> Confirm Settlement
                        </h3>

                        <div className="space-y-3 mb-6 bg-white/5 p-4 rounded-xl">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Total Amount</span>
                                <span className="text-white font-mono">{fromSmallest(quote.amount, decimals)} USDC</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Relayer Fee</span>
                                <span className="text-emerald-400 font-mono">{fromSmallest(quote.relayerFee, decimals)} USDC</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Network Fee (Gas)</span>
                                <span className="text-emerald-400 font-bold">0.00 USDC (Sponsored)</span>
                            </div>
                            <div className="h-px bg-white/10 my-2" />
                            <div className="flex justify-between font-bold">
                                <span className="text-white">Total Cost</span>
                                <span className="text-white font-mono">
                                    {fromSmallest(
                                        (BigInt(quote.amount || '0') + BigInt(quote.relayerFee || '0')).toString(),
                                        decimals
                                    )} USDC
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 py-3 rounded-xl bg-white/5 text-white hover:bg-white/10 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleExecute}
                                disabled={loading}
                                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Zap className="w-4 h-4 fill-current" />}
                                {loading ? 'Signing...' : 'Confirm & Sign'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

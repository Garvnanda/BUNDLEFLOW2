import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { calculateMinimalTransfers } from '../utils/minimalTransfers';
import { calculateBalances } from '../utils/splitMath';
import { TransfersPreview } from '../components/TransfersPreview';
import { GaslessSettleButton } from '../components/GaslessSettleButton';
import { ArrowLeft, Wallet, ShieldCheck } from 'lucide-react';
import { smoothSendService, BatchSettlementRequest } from '../services/smoothsend';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { v4 as uuidv4 } from 'uuid';

export const SettlementPreviewPage: React.FC = () => {
    const navigate = useNavigate();
    const { activeGroup, expenses, addSettlementBatch } = useStore();
    const { account } = useWallet();
    const [quote, setQuote] = useState<any>(null);

    useEffect(() => {
        if (!activeGroup) {
            navigate('/');
        }
    }, [activeGroup, navigate]);

    if (!activeGroup) return null;

    const groupExpenses = expenses.filter(e => e.groupId === activeGroup.id);
    const balances = calculateBalances(activeGroup.members, groupExpenses);
    const transfers = calculateMinimalTransfers(balances);

    // Fetch quote on load to show estimated fees
    useEffect(() => {
        const fetchQuote = async () => {
            if (transfers.length > 0 && account) {
                try {
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
                } catch (e) {
                    console.error("Failed to fetch preliminary quote", e);
                }
            }
        };
        fetchQuote();
    }, [transfers.length, account]);

    const handleSettlementComplete = (txHash: string) => {
        addSettlementBatch({
            id: uuidv4(),
            groupId: activeGroup.id,
            transfers,
            txHash,
            timestamp: Date.now(),
            status: 'confirmed'
        });
        navigate(`/group/${activeGroup.id}`);
    };

    const totalAmount = transfers.reduce((sum, t) => sum + t.amount, 0);

    return (
        <div className="p-6 space-y-6 pb-24">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                    <ArrowLeft className="text-white" />
                </button>
                <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                    Settlement Preview
                </h1>
            </div>

            {/* Summary Card */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <p className="text-gray-400 text-sm">Total Settlement Volume</p>
                        <p className="text-3xl font-bold text-white mt-1">{totalAmount.toFixed(2)} USDC</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <Wallet className="text-emerald-400 w-6 h-6" />
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between text-sm p-3 bg-white/5 rounded-lg border border-white/5">
                        <span className="text-gray-400">Transfers Required</span>
                        <span className="text-white font-mono">{transfers.length}</span>
                    </div>
                    <div className="flex justify-between text-sm p-3 bg-white/5 rounded-lg border border-white/5">
                        <span className="text-gray-400">Gas Fees (Standard)</span>
                        <span className="text-red-400 line-through decoration-red-400/50">~0.02 USDC</span>
                    </div>
                    <div className="flex justify-between text-sm p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                        <span className="text-emerald-400 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4" /> SmoothSend Fee
                        </span>
                        <span className="text-emerald-400 font-mono">
                            {quote ? (parseInt(quote.relayerFee) / 1e6).toFixed(6) : '...'} USDC
                        </span>
                    </div>
                </div>
            </div>

            {/* Transfers List */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Proposed Transfers</h3>
                <TransfersPreview
                    transfers={transfers}
                    members={activeGroup.members}
                    currentUserId={account?.address}
                />
            </div>

            {/* Action Button */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0f172a] to-transparent z-10">
                <div className="max-w-md mx-auto">
                    <GaslessSettleButton
                        transfers={transfers}
                        onSettlementComplete={handleSettlementComplete}
                    />
                    <p className="text-center text-xs text-gray-500 mt-3">
                        Powered by SmoothSend Gasless Protocol
                    </p>
                </div>
            </div>
        </div>
    );
};

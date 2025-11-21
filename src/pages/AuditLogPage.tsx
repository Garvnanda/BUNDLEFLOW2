import React from 'react';
import { useStore } from '../store/useStore';
import { format } from 'date-fns';
import { ExternalLink, CheckCircle } from 'lucide-react';

export const AuditLogPage: React.FC = () => {
    const { settlements } = useStore();

    return (
        <div className="space-y-6 pt-4">
            <h1 className="text-2xl font-bold text-gray-900">Settlement History</h1>

            <div className="space-y-4">
                {settlements.sort((a, b) => b.timestamp - a.timestamp).map((settlement) => (
                    <div key={settlement.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-gray-900">Batch #{settlement.id.slice(-4)}</span>
                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium flex items-center gap-1">
                                        <CheckCircle size={10} /> Confirmed
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{format(settlement.timestamp, 'PPpp')}</p>
                            </div>
                            <a
                                href={`https://explorer.aptoslabs.com/txn/${settlement.txHash}?network=testnet`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-indigo-600 hover:text-indigo-700"
                            >
                                <ExternalLink size={18} />
                            </a>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                            {settlement.transfers.map((t, idx) => (
                                <div key={idx} className="flex justify-between text-sm">
                                    <span className="text-gray-600">{t.from.slice(0, 6)}... → {t.to.slice(0, 6)}...</span>
                                    <span className="font-medium text-gray-900">${t.amount.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {settlements.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        No settlements yet.
                    </div>
                )}
            </div>
        </div>
    );
};

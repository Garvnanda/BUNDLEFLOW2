import React from 'react';
import { Transfer, Member } from '../types';
import { ArrowRight } from 'lucide-react';

interface Props {
    transfers: Transfer[];
    members: Member[];
    currentUserId?: string | null;
}

export const TransfersPreview: React.FC<Props> = ({ transfers, members, currentUserId }) => {
    const getMemberName = (address: string) => {
        if (address === currentUserId) return 'You';
        const member = members.find(m => m.address === address);
        return member ? member.name : address.slice(0, 6) + '...';
    };

    if (transfers.length === 0) {
        return (
            <div className="text-center p-6 bg-green-50 rounded-lg border border-green-100">
                <p className="text-green-700 font-medium">All settled up! 🎉</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Proposed Settlements</h3>
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 divide-y divide-gray-100">
                {transfers.map((transfer, idx) => (
                    <div key={idx} className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1">
                            <span className="font-medium text-gray-900">{getMemberName(transfer.from)}</span>
                            <ArrowRight size={16} className="text-gray-400" />
                            <span className="font-medium text-gray-900">{getMemberName(transfer.to)}</span>
                        </div>
                        <span className="font-bold text-indigo-600">${transfer.amount.toFixed(2)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

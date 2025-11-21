import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { MembersList } from '../components/MembersList';
import { ExpensesList } from '../components/ExpensesList';
import { AddExpenseModal } from '../components/AddExpenseModal';
import { AddMemberModal } from '../components/AddMemberModal';
import { QRGenerator } from '../components/QRGenerator';
import { generateQRPayload } from '../utils/qr';
import { Plus, QrCode, ArrowRightLeft, Copy, Check } from 'lucide-react';

export const GroupPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { groups, expenses, selectGroup, addExpense, currentUser } = useStore();
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
    const [showQR, setShowQR] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (id) selectGroup(id);
    }, [id, selectGroup]);

    const group = groups.find(g => g.id === id);

    if (!group) return <div className="p-4 text-center text-zinc-500">Group not found</div>;

    const qrData = generateQRPayload(group.id, group.name, currentUser || 'unknown');
    const inviteLink = `${window.location.origin}/join?data=${qrData}`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleAddMember = (name: string, address: string) => {
        if (group) {
            // @ts-ignore - using store action directly
            useStore.getState().addMember(group.id, {
                address,
                name,
                joinedAt: Date.now()
            });
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="glass-card p-6 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-3xl rounded-full -mr-10 -mt-10" />

                <div className="flex justify-between items-start mb-6 relative z-10">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-1">{group.name}</h1>
                        <p className="text-sm text-zinc-400">{group.description || 'No description'}</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsMemberModalOpen(true)}
                            className="p-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all"
                            title="Add Member Manually"
                        >
                            <Plus size={20} />
                        </button>
                        <button
                            onClick={() => setShowQR(!showQR)}
                            className={`p-3 rounded-xl transition-all ${showQR ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
                        >
                            <QrCode size={20} />
                        </button>
                    </div>
                </div>

                {showQR && (
                    <div className="mb-6 animate-in fade-in zoom-in bg-white p-4 rounded-2xl shadow-xl">
                        <div className="flex justify-center mb-4">
                            <QRGenerator data={qrData} />
                        </div>
                        <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-lg">
                            <input
                                type="text"
                                readOnly
                                value={inviteLink}
                                className="flex-1 bg-transparent text-xs text-gray-600 outline-none font-mono truncate"
                            />
                            <button onClick={handleCopyLink} className="p-2 bg-white rounded-md shadow-sm hover:bg-gray-50 text-gray-700">
                                {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                            </button>
                        </div>
                        <p className="text-center text-xs text-gray-400 mt-2">Share this link or scan QR to join</p>
                    </div>
                )}

                <div className="flex gap-3 relative z-10">
                    <button
                        onClick={() => setIsExpenseModalOpen(true)}
                        className="flex-1 bg-white text-black py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:bg-zinc-200 transition-all active:scale-95"
                    >
                        <Plus size={18} /> Add Expense
                    </button>
                    <Link
                        to={`/groups/${id}/settle`}
                        className="flex-1 bg-white/10 text-white border border-white/10 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-white/20 transition-all active:scale-95"
                    >
                        <ArrowRightLeft size={18} /> Settle Up
                    </Link>
                </div>
            </div>

            <MembersList members={group.members} />

            <ExpensesList
                expenses={expenses}
                members={group.members}
                currentUserId={currentUser}
            />

            <AddExpenseModal
                isOpen={isExpenseModalOpen}
                onClose={() => setIsExpenseModalOpen(false)}
                onSubmit={(data) => addExpense({ ...data, groupId: group.id })}
                members={group.members}
                currentUser={currentUser}
            />

            <AddMemberModal
                isOpen={isMemberModalOpen}
                onClose={() => setIsMemberModalOpen(false)}
                onSubmit={handleAddMember}
            />
        </div>
    );
};

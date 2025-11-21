import React, { useState, useEffect } from 'react';
import { Member } from '../types';
import { X, DollarSign, Users, Check } from 'lucide-react';
import clsx from 'clsx';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { description: string; amount: number; payer: string; involvedMembers?: string[] }) => void;
    members: Member[];
    currentUser: string | null;
}

export const AddExpenseModal: React.FC<Props> = ({ isOpen, onClose, onSubmit, members, currentUser }) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [payer, setPayer] = useState('');
    const [splitMode, setSplitMode] = useState<'all' | 'selected'>('all');
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

    // Initialize defaults when modal opens
    useEffect(() => {
        if (isOpen) {
            setPayer(currentUser || (members[0]?.address ?? ''));
            setSelectedMembers(members.map(m => m.address));
            setSplitMode('all');
        }
    }, [isOpen, currentUser, members]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!description || !amount || !payer) return;

        const finalInvolved = splitMode === 'all' ? undefined : selectedMembers;

        // Validate at least one person is involved
        if (splitMode === 'selected' && selectedMembers.length === 0) {
            alert("Please select at least one person to split with.");
            return;
        }

        onSubmit({
            description,
            amount: parseFloat(amount),
            payer,
            involvedMembers: finalInvolved
        });

        setDescription('');
        setAmount('');
        onClose();
    };

    const toggleMember = (address: string) => {
        if (selectedMembers.includes(address)) {
            setSelectedMembers(selectedMembers.filter(a => a !== address));
        } else {
            setSelectedMembers([...selectedMembers, address]);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-0">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose} />
            <div className="relative bg-[#0A0A0A] border border-white/10 w-full max-w-md rounded-3xl shadow-2xl p-6 animate-in slide-in-from-bottom-10 fade-in duration-300 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-white">Add Expense</h2>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:bg-white/10 hover:text-white transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Description</label>
                        <input
                            type="text"
                            required
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-zinc-600 focus:bg-white/10 focus:border-indigo-500/50 outline-none transition-all"
                            placeholder="e.g. Dinner at Mario's"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Amount</label>
                        <div className="relative">
                            <div className="absolute left-4 top-3 text-zinc-500">
                                <DollarSign size={20} />
                            </div>
                            <input
                                type="number"
                                required
                                min="0.01"
                                step="0.01"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-zinc-600 focus:bg-white/10 focus:border-indigo-500/50 outline-none transition-all font-mono text-lg"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Paid By</label>
                        <select
                            value={payer}
                            onChange={e => setPayer(e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:bg-white/10 focus:border-indigo-500/50 outline-none transition-all appearance-none"
                        >
                            {members.map(m => (
                                <option key={m.address} value={m.address} className="bg-zinc-900 text-white">
                                    {m.address === currentUser ? 'You' : m.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Split With</label>
                        <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
                            <button
                                type="button"
                                onClick={() => setSplitMode('all')}
                                className={clsx(
                                    "flex-1 py-2 rounded-lg text-sm font-medium transition-all",
                                    splitMode === 'all' ? "bg-white/10 text-white shadow-sm" : "text-zinc-400 hover:text-white"
                                )}
                            >
                                Everyone
                            </button>
                            <button
                                type="button"
                                onClick={() => setSplitMode('selected')}
                                className={clsx(
                                    "flex-1 py-2 rounded-lg text-sm font-medium transition-all",
                                    splitMode === 'selected' ? "bg-white/10 text-white shadow-sm" : "text-zinc-400 hover:text-white"
                                )}
                            >
                                Specific People
                            </button>
                        </div>

                        {splitMode === 'selected' && (
                            <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                {members.map(m => {
                                    const isSelected = selectedMembers.includes(m.address);
                                    return (
                                        <button
                                            key={m.address}
                                            type="button"
                                            onClick={() => toggleMember(m.address)}
                                            className={clsx(
                                                "w-full flex items-center justify-between p-3 rounded-xl border transition-all",
                                                isSelected
                                                    ? "bg-indigo-500/10 border-indigo-500/50 text-white"
                                                    : "bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                                                    {m.name.charAt(0)}
                                                </div>
                                                <span className="font-medium">{m.address === currentUser ? 'You' : m.name}</span>
                                            </div>
                                            {isSelected && <Check size={16} className="text-indigo-400" />}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 active:scale-[0.98] transition-all mt-4"
                    >
                        Add Expense
                    </button>
                </form>
            </div>
        </div>
    );
};

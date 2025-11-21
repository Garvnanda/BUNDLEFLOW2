import React, { useState } from 'react';
import { X, UserPlus } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (name: string, address: string) => void;
}

export const AddMemberModal: React.FC<Props> = ({ isOpen, onClose, onSubmit }) => {
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !address) return;
        onSubmit(name, address);
        setName('');
        setAddress('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose} />
            <div className="relative bg-[#0A0A0A] border border-white/10 w-full max-w-md rounded-3xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">Add Member Manually</h2>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:bg-white/10 hover:text-white transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-zinc-600 focus:bg-white/10 focus:border-indigo-500/50 outline-none transition-all"
                            placeholder="e.g. Alice"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Wallet Address</label>
                        <input
                            type="text"
                            required
                            value={address}
                            onChange={e => setAddress(e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-zinc-600 focus:bg-white/10 focus:border-indigo-500/50 outline-none transition-all font-mono text-sm"
                            placeholder="0x..."
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-white text-black py-3 rounded-xl font-bold text-sm hover:bg-zinc-200 transition-colors mt-2 flex items-center justify-center gap-2"
                    >
                        <UserPlus size={18} /> Add Member
                    </button>
                </form>
            </div>
        </div>
    );
};

import React from 'react';
import { Member } from '../types';
import { User } from 'lucide-react';

interface Props {
    members: Member[];
}

export const MembersList: React.FC<Props> = ({ members }) => {
    return (
        <div className="space-y-4">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-1">Members ({members.length})</h3>
            <div className="grid grid-cols-2 gap-3">
                {members.map((member) => (
                    <div key={member.address} className="glass-card p-3 rounded-xl flex items-center gap-3 hover:bg-white/5 transition-colors">
                        <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                            <User size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{member.name}</p>
                            <p className="text-[10px] text-zinc-500 truncate font-mono">{member.address.slice(0, 6)}...{member.address.slice(-4)}</p>
                        </div>
                    </div>
                ))}
                {members.length === 0 && (
                    <div className="col-span-2 p-4 text-center text-zinc-500 text-sm border border-dashed border-white/10 rounded-xl">
                        No members yet. Invite someone!
                    </div>
                )}
            </div>
        </div>
    );
};

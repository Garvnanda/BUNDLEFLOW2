import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Plus, Users, ChevronRight, Search, X } from 'lucide-react';

export const GroupsListPage: React.FC = () => {
    const { groups, createGroup } = useStore();
    const [isCreating, setIsCreating] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newGroupName.trim()) return;
        createGroup(newGroupName, '');
        setNewGroupName('');
        setIsCreating(false);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center px-2">
                <h1 className="text-3xl font-bold text-white">My Groups</h1>
                <button
                    onClick={() => setIsCreating(!isCreating)}
                    className="bg-white text-black p-3 rounded-full shadow-lg hover:bg-zinc-200 transition-colors active:scale-90"
                >
                    {isCreating ? <X size={20} /> : <Plus size={20} />}
                </button>
            </div>

            {isCreating && (
                <form onSubmit={handleCreate} className="glass-card p-4 rounded-2xl animate-in slide-in-from-top-4">
                    <input
                        autoFocus
                        type="text"
                        placeholder="Group Name (e.g. Goa Trip)"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-indigo-500/50 outline-none mb-3 transition-all"
                    />
                    <div className="flex gap-2">
                        <button type="submit" className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-indigo-500 transition-colors">Create Group</button>
                        <button type="button" onClick={() => setIsCreating(false)} className="flex-1 bg-white/5 text-zinc-400 py-3 rounded-xl font-bold text-sm hover:bg-white/10 transition-colors">Cancel</button>
                    </div>
                </form>
            )}

            <div className="relative">
                <Search className="absolute left-4 top-3.5 text-zinc-600" size={20} />
                <input
                    type="text"
                    placeholder="Search groups..."
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/5 rounded-2xl text-white placeholder:text-zinc-600 focus:bg-white/10 outline-none transition-all"
                />
            </div>

            <div className="space-y-3">
                {groups.map(group => (
                    <Link key={group.id} to={`/groups/${group.id}`} className="block glass-card p-5 rounded-2xl hover:bg-white/10 transition-all group border-l-4 border-l-transparent hover:border-l-indigo-500">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                                    <Users size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-lg group-hover:text-indigo-300 transition-colors">{group.name}</h3>
                                    <p className="text-xs text-zinc-500 mt-1 flex items-center gap-2">
                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                        {group.members.length} members
                                    </p>
                                </div>
                            </div>
                            <ChevronRight className="text-zinc-600 group-hover:text-white transition-colors" />
                        </div>
                    </Link>
                ))}
                {groups.length === 0 && !isCreating && (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-zinc-700">
                            <Users size={32} />
                        </div>
                        <p className="text-zinc-500 font-medium">No groups found</p>
                        <button onClick={() => setIsCreating(true)} className="text-indigo-400 font-bold mt-2 hover:text-indigo-300">Create your first group</button>
                    </div>
                )}
            </div>
        </div>
    );
};

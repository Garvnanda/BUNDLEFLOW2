import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Scan, Users, ArrowRight, Sparkles } from 'lucide-react';
import { useStore } from '../store/useStore';

export const HomePage: React.FC = () => {
    const { groups } = useStore();

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Hero Section */}
            <section className="text-center space-y-4 py-8 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent blur-3xl -z-10" />
                <h1 className="text-5xl font-bold tracking-tight">
                    <span className="text-white">Split bills,</span><br />
                    <span className="text-gradient">Gasless.</span>
                </h1>
                <p className="text-zinc-400 text-lg max-w-xs mx-auto">
                    The easiest way to settle group expenses on Aptos. No gas fees, just vibes.
                </p>
            </section>

            {/* Quick Actions */}
            <section className="grid grid-cols-2 gap-4">
                <Link to="/groups" className="group relative overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-600 p-6 rounded-3xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all hover:scale-[1.02]">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Plus size={80} />
                    </div>
                    <div className="relative z-10 flex flex-col items-start gap-4">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10">
                            <Plus size={24} className="text-white" />
                        </div>
                        <div>
                            <span className="block font-bold text-lg text-white">New Group</span>
                            <span className="text-indigo-200 text-sm">Start splitting</span>
                        </div>
                    </div>
                </Link>

                <Link to="/join" className="group relative overflow-hidden glass-card p-6 rounded-3xl hover:bg-white/5 transition-all hover:scale-[1.02]">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Scan size={80} className="text-white" />
                    </div>
                    <div className="relative z-10 flex flex-col items-start gap-4">
                        <div className="w-12 h-12 bg-white/5 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10">
                            <Scan size={24} className="text-white" />
                        </div>
                        <div>
                            <span className="block font-bold text-lg text-white">Join Group</span>
                            <span className="text-zinc-400 text-sm">Scan QR code</span>
                        </div>
                    </div>
                </Link>
            </section>

            {/* Recent Groups */}
            <section>
                <div className="flex justify-between items-center mb-6 px-2">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Users size={20} className="text-indigo-400" />
                        Recent Groups
                    </h2>
                    <Link to="/groups" className="text-sm text-indigo-400 font-medium hover:text-indigo-300 flex items-center gap-1">
                        View All <ArrowRight size={14} />
                    </Link>
                </div>

                <div className="space-y-4">
                    {groups.slice(0, 3).map(group => (
                        <Link key={group.id} to={`/groups/${group.id}`} className="block glass-card p-4 rounded-2xl hover:bg-white/10 transition-all group">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-xl flex items-center justify-center border border-white/5 group-hover:border-indigo-500/30 transition-colors">
                                    <span className="text-xl">🏝️</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-white text-lg group-hover:text-indigo-300 transition-colors">{group.name}</h3>
                                    <p className="text-sm text-zinc-500">{group.members.length} members</p>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-all">
                                    <ArrowRight size={14} />
                                </div>
                            </div>
                        </Link>
                    ))}
                    {groups.length === 0 && (
                        <div className="text-center py-12 glass-card rounded-3xl border-dashed border-white/10">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-600">
                                <Sparkles size={24} />
                            </div>
                            <p className="text-zinc-400 font-medium">No groups yet</p>
                            <p className="text-zinc-600 text-sm mt-1">Create one to get started!</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

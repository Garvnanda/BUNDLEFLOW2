import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";
import { Home, Users, Scan, Sparkles, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';

export const Layout: React.FC = () => {
    const location = useLocation();
    const { network, connected } = useWallet();
    const [isWrongNetwork, setIsWrongNetwork] = useState(false);

    useEffect(() => {
        if (connected && network) {
            // Check if network is testnet (name might vary by wallet, usually 'Testnet' or 'aptos-testnet')
            const isTestnet = network.name.toLowerCase().includes('testnet');
            setIsWrongNetwork(!isTestnet);
        } else {
            setIsWrongNetwork(false);
        }
    }, [network, connected]);

    const navItems = [
        { icon: Home, label: 'Home', path: '/' },
        { icon: Users, label: 'Groups', path: '/groups' },
        { icon: Scan, label: 'Join', path: '/join' },
    ];

    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden font-sans selection:bg-indigo-500/30">
            {/* Ambient Background Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] animate-blob mix-blend-screen" />
                <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-indigo-600/20 rounded-full blur-[100px] animate-blob animation-delay-2000 mix-blend-screen" />
                <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-pink-600/10 rounded-full blur-[120px] animate-blob animation-delay-4000 mix-blend-screen" />
            </div>

            {/* Wrong Network Modal */}
            {isWrongNetwork && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-zinc-900 border border-red-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl shadow-red-900/20 animate-in fade-in zoom-in duration-300">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
                                <AlertTriangle size={32} className="text-red-500" />
                            </div>
                            <h2 className="text-xl font-bold text-white">Wrong Network Detected</h2>
                            <p className="text-gray-400">
                                Please switch your wallet to <span className="text-indigo-400 font-bold">Aptos Testnet</span>.
                                This app uses testnet USDC for settlements.
                            </p>
                            <div className="p-3 bg-white/5 rounded-lg text-sm text-gray-300 w-full">
                                <p>Open your wallet extension and select "Testnet" from the network dropdown.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 glass border-b-0">
                <div className="max-w-lg mx-auto px-4 py-3 flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                            <Sparkles size={16} className="text-white" />
                        </div>
                        <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                            BundleFlow
                        </span>
                    </Link>
                    <div className="scale-90 origin-right wallet-adapter-custom">
                        <WalletSelector />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 pt-20 pb-24 max-w-lg mx-auto w-full px-4 min-h-screen flex flex-col">
                <Outlet />
            </main>

            {/* Bottom Nav */}
            <nav className="fixed bottom-6 left-4 right-4 z-50 max-w-lg mx-auto">
                <div className="glass rounded-2xl p-2 flex justify-around items-center shadow-2xl shadow-black/50 border border-white/10 backdrop-blur-xl bg-black/60">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={clsx(
                                    "relative flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-all duration-300",
                                    isActive
                                        ? "text-white bg-white/10 shadow-inner"
                                        : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                                )}
                            >
                                <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} className={clsx("transition-transform duration-300", isActive && "scale-110")} />
                                {isActive && (
                                    <span className="absolute -bottom-1 w-1 h-1 bg-indigo-400 rounded-full shadow-[0_0_8px_rgba(129,140,248,0.8)]" />
                                )}
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
};

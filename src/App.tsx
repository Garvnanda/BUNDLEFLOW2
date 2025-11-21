import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { PetraWallet } from "petra-plugin-wallet-adapter";
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { GroupsListPage } from './pages/GroupsListPage';
import { GroupPage } from './pages/GroupPage';
import { QRJoinScannerPage } from './pages/QRJoinScannerPage';
import { SettlementPreviewPage } from './pages/SettlementPreviewPage';
import { AuditLogPage } from './pages/AuditLogPage';
import { useStore } from './store/useStore';
import { useWallet } from '@aptos-labs/wallet-adapter-react';

const wallets = [new PetraWallet()];

const AppContent: React.FC = () => {
    const { loadGroups, setCurrentUser } = useStore();
    const { account } = useWallet();

    useEffect(() => {
        loadGroups();
    }, [loadGroups]);

    useEffect(() => {
        if (account) {
            setCurrentUser(account.address);
        } else {
            setCurrentUser(null);
        }
    }, [account, setCurrentUser]);

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<HomePage />} />
                    <Route path="groups" element={<GroupsListPage />} />
                    <Route path="groups/:id" element={<GroupPage />} />
                    <Route path="groups/:id/settle" element={<SettlementPreviewPage />} />
                    <Route path="join" element={<QRJoinScannerPage />} />
                    <Route path="audit" element={<AuditLogPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
};

function App() {
    return (
        <AptosWalletAdapterProvider plugins={wallets} autoConnect={true}>
            <AppContent />
        </AptosWalletAdapterProvider>
    );
}

export default App;

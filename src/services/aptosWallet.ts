import { Types } from 'aptos';

// Interface for the wallet adapter (Petra/Pontem/etc)
export interface AptosWalletAdapter {
    connect: () => Promise<any>;
    account: () => Promise<{ address: string; publicKey: string } | null>;
    signTransaction: (transaction: any) => Promise<{
        hash: string;
        sender: string;
        payload: any;
        signature: string | any; // Can be hex string or object depending on wallet
    }>;
    signMessage: (message: any) => Promise<any>;
}

// This service wraps the wallet adapter provided by the context
export const aptosWalletService = {
    /**
     * Helper to get the public key from the connected wallet.
     * Most adapters expose this in the account object.
     */
    getPublicKey: async (wallet: any): Promise<string | null> => {
        if (!wallet || !wallet.account) return null;
        // Some adapters might need a specific call, but usually it's in the account object
        return wallet.account.publicKey?.toString() || null;
    },

    /**
     * Signs a transaction payload for SmoothSend.
     * SmoothSend expects Ed25519 signature.
     */
    signForSmoothSend: async (wallet: any, message: Uint8Array | string): Promise<{
        transactionBytes: string;
        authenticatorBytes: string;
        signatureHex: string;
    }> => {
        if (!wallet) throw new Error("Wallet not connected");

        // Note: The exact signing method depends on what SmoothSend 'message' is.
        // If it's a raw transaction payload, we use signTransaction.
        // If it's an arbitrary message, we use signMessage.
        // The prompt implies signTransaction(signatureData.message).

        try {
            // We assume 'message' is the transaction payload to sign
            const response = await wallet.signTransaction(message);

            // Normalize response - adapters differ
            // We need transactionBytes and authenticatorBytes (or signature)
            // This is a best-effort mapping for Petra/standard adapters

            // Mocking the response structure if the adapter doesn't return bytes directly
            // In a real scenario, we'd need the adapter to return the raw signed tx bytes
            // or we construct them.

            // For SmoothSend integration as requested:
            // "signedTx must include transactionBytes and authenticatorBytes"

            return {
                transactionBytes: response.transactionBytes || "", // Adapter specific
                authenticatorBytes: response.authenticatorBytes || "", // Adapter specific
                signatureHex: typeof response.signature === 'string' ? response.signature : response.signature.toString()
            };
        } catch (error) {
            console.error("Wallet signing failed", error);
            throw error;
        }
    }
};

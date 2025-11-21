import { SmoothSendSDK } from '@smoothsend/sdk';
import { Types, TxnBuilderTypes, BCS, HexString } from 'aptos';
import { aptosWalletService } from './aptosWallet';
import { toSmallest, fromSmallest, getDecimalsForToken } from '../utils/amount';

// Configuration
const CHAIN_ID = 'aptos-testnet';
const MODULE_ADDRESS = '0x1234567890123456789012345678901234567890123456789012345678901234'; // Replace with actual address
const MODULE_NAME = 'BundleFlow::Settler';
const FUNCTION_NAME = 'batch_settle';

// Initialize SDK
// Note: In a real app, you might want to initialize this in a context or hook
export const smoothSend = new SmoothSendSDK();

export interface TransferRequest {
    recipient: string;
    amount: number; // Human readable
    token: string; // 'USDC'
}

export interface BatchSettlementRequest {
    transfers: TransferRequest[];
    sender: string;
}

/**
 * Service to handle SmoothSend integration
 */
export const smoothSendService = {
    /**
     * Get a quote for the batch settlement
     */
    getQuote: async (request: BatchSettlementRequest) => {
        const totalAmount = request.transfers.reduce((sum, t) => sum + t.amount, 0);
        const token = 'USDC';
        const decimals = getDecimalsForToken(token);
        const amountSmallest = toSmallest(totalAmount, decimals);

        try {
            const quote = await smoothSend.getQuote({
                from: request.sender,
                to: MODULE_ADDRESS, // The contract is the 'recipient' of the meta-tx effectively
                token,
                amount: amountSmallest, // SDK expects string
                chain: CHAIN_ID as 'aptos-testnet' // Explicitly cast to literal type
            });
            return quote;
        } catch (error) {
            console.error("Failed to get quote:", error);
            throw error;
        }
    },

    /**
     * Prepare and execute the batch settlement
     */
    executeBatchSettlement: async (
        wallet: any,
        request: BatchSettlementRequest,
        quote: any
    ) => {
        try {
            // 1. Balance Check
            const token = 'USDC';
            const decimals = getDecimalsForToken(token);
            const totalAmount = request.transfers.reduce((sum, t) => sum + t.amount, 0);
            const requiredAmount = BigInt(toSmallest(totalAmount, decimals)) + BigInt(quote.relayerFee || 0);

            const balanceData = await smoothSend.getBalance(CHAIN_ID, request.sender, token);
            // Handle array or object return from getBalance
            const balanceStr = Array.isArray(balanceData) ? balanceData[0]?.balance : balanceData?.balance;
            const userBalance = BigInt(balanceStr || '0');

            if (userBalance < requiredAmount) {
                const requiredHuman = fromSmallest(requiredAmount.toString(), decimals);
                const balanceHuman = fromSmallest(userBalance.toString(), decimals);
                throw new Error(`INSUFFICIENT_BALANCE: Required ${requiredHuman} USDC, Available ${balanceHuman} USDC`);
            }

            // 2. Build Move Payload
            // Use full struct tag for Move payload
            const tokenStruct = '0x5e156f1207d0ebfa19a9eeff00d62a282278fb8719f4fab3a586a0a2c0fffbea::coin::T';

            const serializer = new BCS.Serializer();
            serializer.serializeU32AsUleb128(request.transfers.length);

            request.transfers.forEach(t => {
                const addr = HexString.ensure(t.recipient).toUint8Array();
                serializer.serializeBytes(addr);
                const amt = BigInt(toSmallest(t.amount, decimals));
                serializer.serializeU64(amt);
            });

            const serializedArgs = serializer.getBytes();

            // 3. Prepare Transfer
            const prepareReq = {
                ...quote,
                function: `${MODULE_ADDRESS}::${MODULE_NAME}::${FUNCTION_NAME}`,
                type_arguments: [],
                arguments: [serializedArgs],
                payload: {
                    function: `${MODULE_ADDRESS}::${MODULE_NAME}::${FUNCTION_NAME}`,
                    type_arguments: [],
                    arguments: [request.transfers.map(t => ({
                        recipient: t.recipient,
                        amount: toSmallest(t.amount, decimals)
                    }))]
                }
            };

            const signatureData = await smoothSend.prepareTransfer(prepareReq, quote);

            // 4. Sign with Wallet
            const signedTx = await aptosWalletService.signForSmoothSend(wallet, signatureData.message);

            // 5. Execute Transfer
            const signedData = {
                signature: signedTx.signatureHex,
                transferData: {
                    transactionBytes: signedTx.transactionBytes,
                    authenticatorBytes: signedTx.authenticatorBytes,
                    functionName: FUNCTION_NAME
                },
                signatureType: 'Ed25519' as const
            };

            const result = await smoothSend.executeTransfer(signedData, CHAIN_ID as 'aptos-testnet');
            return result;

        } catch (error: any) {
            console.error("Batch settlement failed:", error);
            if (error.message && error.message.startsWith('INSUFFICIENT_BALANCE')) {
                throw error;
            }
            throw mapError(error);
        }
    },

    /**
     * Get balance for an address
     */
    getBalance: async (address: string, token: string = 'USDC') => {
        return await smoothSend.getBalance(CHAIN_ID, address, token);
    },

    /**
     * Validate an address
     */
    validateAddress: (address: string) => {
        return smoothSend.validateAddress(CHAIN_ID, address);
    },

    /**
     * Get chain config
     */
    getChainConfig: () => {
        return smoothSend.getChainConfig(CHAIN_ID);
    },

    /**
     * Subscribe to events with safe cleanup
     */
    subscribe: (callback: (event: any) => void) => {
        const result = smoothSend.addEventListener(callback) as any;
        return () => {
            if (typeof result === 'function') {
                result();
            } else if ((smoothSend as any).removeEventListener) {
                (smoothSend as any).removeEventListener(callback);
            }
        };
    }
};

/**
 * Map SDK errors to user-friendly messages
 */
function mapError(error: any): Error {
    if (error.code === 'APTOS_MISSING_PUBLIC_KEY') {
        return new Error("Public key missing. Please ensure your wallet is connected and unlocked.");
    }
    if (error.code === 'INSUFFICIENT_BALANCE') {
        return new Error("Insufficient balance to cover the settlement amount and network fees.");
    }
    if (error.code === 'SIGNATURE_REJECTED') {
        return new Error("Transaction signature was rejected. Please try again.");
    }
    return error instanceof Error ? error : new Error("An unknown error occurred during settlement.");
}

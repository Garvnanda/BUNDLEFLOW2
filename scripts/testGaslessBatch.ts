import { AptosAccount, HexString } from 'aptos';
import { smoothSendService, BatchSettlementRequest } from '../src/services/smoothsend';
import { toSmallest } from '../src/utils/amount';

// Mock wallet for testing
const createTestWallet = (privateKeyHex: string) => {
    const account = new AptosAccount(HexString.ensure(privateKeyHex).toUint8Array());

    return {
        account: {
            address: account.address().hex(),
            publicKey: account.pubKey().hex()
        },
        signTransaction: async (txn: any) => {
            // In a real scenario, we'd sign the transaction bytes
            // For this test script, we assume 'txn' is the message to sign
            // SmoothSend SDK usually returns a message to sign

            // Note: This is a simplified mock. Real signing involves BCS serialization of the transaction.
            // If smoothSend returns a raw message buffer:
            const sig = account.signBuffer(txn);

            return {
                transactionBytes: "", // Would be the raw tx bytes
                authenticatorBytes: "", // Would be the auth bytes
                signature: sig.hex()
            };
        }
    };
};

const main = async () => {
    const PRIVATE_KEY = process.env.TEST_PRIVATE_KEY;
    if (!PRIVATE_KEY) {
        console.error("Please set TEST_PRIVATE_KEY env var");
        process.exit(1);
    }

    const wallet = createTestWallet(PRIVATE_KEY);
    console.log(`Testing with wallet: ${wallet.account.address}`);

    const request: BatchSettlementRequest = {
        sender: wallet.account.address,
        transfers: [
            {
                recipient: "0x123...", // Replace with valid test address
                amount: 0.1,
                token: "APT"
            }
        ]
    };

    try {
        console.log("Getting quote...");
        const quote = await smoothSendService.getQuote(request);
        console.log("Quote received:", quote);

        console.log("Executing batch...");
        const result = await smoothSendService.executeBatchSettlement(wallet, request, quote);
        console.log("Result:", result);

    } catch (error) {
        console.error("Test failed:", error);
    }
};

// main();
// Uncomment to run: ts-node scripts/testGaslessBatch.ts

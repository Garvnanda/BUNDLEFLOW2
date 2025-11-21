import { AptosAccount, HexString, TxnBuilderTypes, BCS } from 'aptos';
import { SmoothSendSDK } from '@smoothsend/sdk';
import dotenv from 'dotenv';

dotenv.config();

const CHAIN_ID = 'aptos-testnet';
const MODULE_ADDRESS = '0x1234567890123456789012345678901234567890123456789012345678901234'; // Replace with actual address
const MODULE_NAME = 'BundleFlow::Settler';
const FUNCTION_NAME = 'batch_settle';
const USDC_DECIMALS = 6;

// USDC Coin Type
const USDC_TYPE = '0x5e156f1207d0ebfa19a9eeff00d62a282278fb8719f4fab3a586a0a2c0fffbea::coin::T';

const smoothSend = new SmoothSendSDK();

const toSmallest = (amount: number, decimals: number): string => {
    return Math.round(amount * Math.pow(10, decimals)).toString();
};

async function main() {
    const privateKey = process.env.TEST_PRIVATE_KEY;
    if (!privateKey) {
        console.error("TEST_PRIVATE_KEY not found in .env");
        return;
    }

    const account = new AptosAccount(HexString.ensure(privateKey).toUint8Array());
    console.log(`Testing with account: ${account.address().hex()}`);

    // 1. Check Balance
    console.log("Checking USDC balance...");
    const balanceData = await smoothSend.getBalance(CHAIN_ID, account.address().hex(), 'USDC');
    const balance = Array.isArray(balanceData) ? balanceData[0]?.balance : balanceData?.balance;
    console.log(`Balance: ${balance} (smallest units)`);

    if (BigInt(balance || '0') === BigInt(0)) {
        console.error("Insufficient USDC balance. Please fund your wallet.");
        return;
    }

    // 2. Prepare Request
    const recipient = "0x1234567890123456789012345678901234567890123456789012345678901234"; // Dummy recipient
    const amount = 0.1; // 0.1 USDC
    const amountSmallest = toSmallest(amount, USDC_DECIMALS);

    console.log(`Preparing transfer of ${amount} USDC to ${recipient}`);

    // 3. Get Quote
    console.log("Getting quote...");
    try {
        const quote = await smoothSend.getQuote({
            from: account.address().hex(),
            to: MODULE_ADDRESS,
            token: 'USDC',
            amount: amountSmallest,
            chain: CHAIN_ID
        });
        console.log("Quote received:", quote);

        // 4. Build Move Payload (Batch Settle)
        console.log("Building Move payload...");
        const serializer = new BCS.Serializer();
        serializer.serializeU32AsUleb128(1); // Vector length = 1

        // Serialize recipient
        const addr = HexString.ensure(recipient).toUint8Array();
        serializer.serializeBytes(addr);

        // Serialize amount
        const amt = BigInt(amountSmallest);
        serializer.serializeU64(amt);

        const serializedArgs = serializer.getBytes();

        // 5. Prepare Transfer
        console.log("Preparing transfer with SmoothSend...");
        const prepareReq = {
            ...quote,
            function: `${MODULE_ADDRESS}::${MODULE_NAME}::${FUNCTION_NAME}`,
            type_arguments: [],
            arguments: [serializedArgs],
            payload: {
                function: `${MODULE_ADDRESS}::${MODULE_NAME}::${FUNCTION_NAME}`,
                type_arguments: [],
                arguments: [[{ recipient, amount: amountSmallest }]]
            }
        };

        const signatureData = await smoothSend.prepareTransfer(prepareReq, quote);
        console.log("Transfer prepared. Message to sign:", signatureData.message);

        // 6. Sign Transaction
        console.log("Signing transaction...");
        // Note: AptosAccount.signBuffer returns just the signature (HexString)
        const signature = account.signBuffer(HexString.ensure(signatureData.message).toUint8Array());

        // We need transactionBytes and authenticatorBytes. 
        // Since we are using the SDK's prepareTransfer, we rely on it providing the raw tx bytes if needed,
        // OR we might need to construct the transaction to get the bytes if the SDK doesn't return them in signatureData.
        // However, SmoothSend SDK usually handles the construction.
        // If signatureData contains the raw transaction bytes, we use them.
        // If not, we might be limited in this test script without full wallet adapter simulation.

        // For this test, we'll assume standard Ed25519 signature submission
        const signedData = {
            signature: signature.hex(),
            transferData: {
                // In a real wallet adapter, we get these. Here we might mock or need to reconstruct.
                // For now, let's see if we can proceed with just signature if the SDK supports it,
                // or if we need to pass the original message as transactionBytes (unlikely).
                transactionBytes: signatureData.message, // This is likely the signing message, not full tx bytes
                authenticatorBytes: "", // Mocking
                functionName: FUNCTION_NAME
            },
            signatureType: 'Ed25519'
        };

        console.log("Executing transfer...");
        const result = await smoothSend.executeTransfer(signedData, CHAIN_ID);
        console.log("Execution result:", result);

    } catch (error) {
        console.error("Test failed:", error);
    }
}

main();

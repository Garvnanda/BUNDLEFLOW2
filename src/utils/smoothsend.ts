import { Transfer } from '../types';

// Mock SmoothSend SDK
export const smoothSend = {
    sendGaslessBatch: async (
        initiator: string,
        transfers: Transfer[]
    ): Promise<{ txHash: string; status: string }> => {
        console.log("Initiating SmoothSend Gasless Batch...");
        console.log("Initiator:", initiator);
        console.log("Transfers:", transfers);

        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Simulate success
        const mockHash = "0x" + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');

        console.log("SmoothSend Batch Executed!");
        console.log("Tx Hash:", mockHash);

        return {
            txHash: mockHash,
            status: 'success',
        };
    }
};

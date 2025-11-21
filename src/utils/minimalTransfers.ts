import { Transfer } from '../types/index.ts';

export const calculateMinimalTransfers = (balances: Record<string, number>): Transfer[] => {
    const debtors: { address: string; amount: number }[] = [];
    const creditors: { address: string; amount: number }[] = [];

    // Separate into debtors and creditors
    Object.entries(balances).forEach(([address, amount]) => {
        if (amount < -0.0001) { // Use epsilon for float comparison
            debtors.push({ address, amount: -amount }); // Store positive debt
        } else if (amount > 0.0001) {
            creditors.push({ address, amount });
        }
    });

    // Sort by amount descending (greedy approach)
    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    const transfers: Transfer[] = [];
    let i = 0; // debtor index
    let j = 0; // creditor index

    while (i < debtors.length && j < creditors.length) {
        const debtor = debtors[i];
        const creditor = creditors[j];

        const amount = Math.min(debtor.amount, creditor.amount);

        if (amount > 0) {
            transfers.push({
                from: debtor.address,
                to: creditor.address,
                amount: Number(amount.toFixed(2)), // Round to 2 decimals
            });
        }

        debtor.amount -= amount;
        creditor.amount -= amount;

        // If settled, move to next
        if (debtor.amount < 0.0001) i++;
        if (creditor.amount < 0.0001) j++;
    }

    return transfers;
};

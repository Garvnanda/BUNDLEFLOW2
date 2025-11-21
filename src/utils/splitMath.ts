import { Expense, Member } from '../types/index.ts';

export const calculateBalances = (members: Member[], expenses: Expense[]): Record<string, number> => {
    const balances: Record<string, number> = {};

    // Initialize balances
    members.forEach(m => {
        balances[m.address] = 0;
    });

    expenses.forEach(expense => {
        const payer = expense.payer;
        const amount = expense.amount;

        // If involvedMembers is not specified, assume all members split equally
        // In a real app, we might handle unequal splits, but for now assume equal split among involved
        const involved = expense.involvedMembers && expense.involvedMembers.length > 0
            ? expense.involvedMembers
            : members.map(m => m.address);

        const splitAmount = amount / involved.length;

        // Payer gets positive balance (owed to them)
        if (balances[payer] !== undefined) {
            balances[payer] += amount;
        } else {
            // Handle case where payer might not be in list (shouldn't happen in strict mode)
            balances[payer] = amount;
        }

        // Each involved member gets negative balance (they owe)
        involved.forEach(memberAddr => {
            if (balances[memberAddr] !== undefined) {
                balances[memberAddr] -= splitAmount;
            } else {
                balances[memberAddr] = -splitAmount;
            }
        });
    });

    return balances;
};

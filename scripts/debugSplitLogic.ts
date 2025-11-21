// Inline types to avoid import issues
interface Member {
    address: string;
    name: string;
    joinedAt: number;
}

interface Expense {
    id: string;
    groupId: string;
    payer: string;
    amount: number;
    description: string;
    category?: string;
    timestamp: number;
    involvedMembers?: string[];
}

interface Transfer {
    from: string;
    to: string;
    amount: number;
}

// Inline splitMath logic
const calculateBalances = (members: Member[], expenses: Expense[]): Record<string, number> => {
    const balances: Record<string, number> = {};

    // Initialize balances
    members.forEach(m => {
        balances[m.address] = 0;
    });

    expenses.forEach(expense => {
        const payer = expense.payer;
        const amount = expense.amount;

        const involved = expense.involvedMembers && expense.involvedMembers.length > 0
            ? expense.involvedMembers
            : members.map(m => m.address);

        const splitAmount = amount / involved.length;

        // Payer gets positive balance
        if (balances[payer] !== undefined) {
            balances[payer] += amount;
        } else {
            balances[payer] = amount;
        }

        // Involved members get negative balance
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

// Inline minimalTransfers logic
const calculateMinimalTransfers = (balances: Record<string, number>): Transfer[] => {
    const debtors: { address: string; amount: number }[] = [];
    const creditors: { address: string; amount: number }[] = [];

    Object.entries(balances).forEach(([address, amount]) => {
        if (amount < -0.0001) {
            debtors.push({ address, amount: -amount });
        } else if (amount > 0.0001) {
            creditors.push({ address, amount });
        }
    });

    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    const transfers: Transfer[] = [];
    let i = 0;
    let j = 0;

    while (i < debtors.length && j < creditors.length) {
        const debtor = debtors[i];
        const creditor = creditors[j];

        const amount = Math.min(debtor.amount, creditor.amount);

        if (amount > 0) {
            transfers.push({
                from: debtor.address,
                to: creditor.address,
                amount: Number(amount.toFixed(2)),
            });
        }

        debtor.amount -= amount;
        creditor.amount -= amount;

        if (debtor.amount < 0.0001) i++;
        if (creditor.amount < 0.0001) j++;
    }

    return transfers;
};

// Test Data
const members: Member[] = [
    { address: 'Alice', name: 'Alice', joinedAt: 0 },
    { address: 'Bob', name: 'Bob', joinedAt: 0 },
    { address: 'Charlie', name: 'Charlie', joinedAt: 0 }
];

const expenses: Expense[] = [
    {
        id: '1',
        groupId: 'g1',
        payer: 'Alice',
        amount: 30,
        description: 'Dinner',
        timestamp: 0,
        involvedMembers: ['Alice', 'Bob', 'Charlie'] // Equal split: 10 each. Alice paid 30. Alice +20, Bob -10, Charlie -10.
    },
    {
        id: '2',
        groupId: 'g1',
        payer: 'Bob',
        amount: 20,
        description: 'Drinks',
        timestamp: 0,
        involvedMembers: ['Bob', 'Charlie'] // Split between Bob and Charlie: 10 each. Bob paid 20. Bob +10, Charlie -10.
    }
];

console.log("--- Testing Balances ---");
const balances = calculateBalances(members, expenses);
console.log("Balances:", balances);

console.log("\n--- Testing Transfers ---");
const transfers = calculateMinimalTransfers(balances);
console.log("Transfers:", transfers);

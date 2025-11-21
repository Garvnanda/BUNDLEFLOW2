import { Group, Expense, SettlementBatch } from '../types';

const STORAGE_KEYS = {
    GROUPS: 'bundleflow_groups',
    EXPENSES: 'bundleflow_expenses',
    SETTLEMENTS: 'bundleflow_settlements',
};

export const storage = {
    getGroups: (): Group[] => {
        const data = localStorage.getItem(STORAGE_KEYS.GROUPS);
        return data ? JSON.parse(data) : [];
    },

    saveGroups: (groups: Group[]) => {
        localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups));
    },

    getExpenses: (groupId: string): Expense[] => {
        const data = localStorage.getItem(STORAGE_KEYS.EXPENSES);
        const allExpenses: Expense[] = data ? JSON.parse(data) : [];
        return allExpenses.filter(e => e.groupId === groupId);
    },

    saveExpense: (expense: Expense) => {
        const data = localStorage.getItem(STORAGE_KEYS.EXPENSES);
        const allExpenses: Expense[] = data ? JSON.parse(data) : [];
        allExpenses.push(expense);
        localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(allExpenses));
    },

    getSettlements: (groupId: string): SettlementBatch[] => {
        const data = localStorage.getItem(STORAGE_KEYS.SETTLEMENTS);
        const allSettlements: SettlementBatch[] = data ? JSON.parse(data) : [];
        return allSettlements.filter(s => s.groupId === groupId);
    },

    saveSettlement: (settlement: SettlementBatch) => {
        const data = localStorage.getItem(STORAGE_KEYS.SETTLEMENTS);
        const allSettlements: SettlementBatch[] = data ? JSON.parse(data) : [];
        allSettlements.push(settlement);
        localStorage.setItem(STORAGE_KEYS.SETTLEMENTS, JSON.stringify(allSettlements));
    },
};

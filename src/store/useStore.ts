import { create } from 'zustand';
import { Group, Expense, SettlementBatch, Member } from '../types';
import { storage } from '../utils/storage';
import { v4 as uuidv4 } from 'uuid';

interface AppState {
    groups: Group[];
    activeGroup: Group | null;
    expenses: Expense[];
    settlements: SettlementBatch[];
    currentUser: string | null; // Wallet address

    // Actions
    setCurrentUser: (address: string | null) => void;
    loadGroups: () => void;
    createGroup: (name: string, description: string) => void;
    selectGroup: (groupId: string) => void;
    addMember: (groupId: string, member: Member) => void;
    addExpense: (expense: Omit<Expense, 'id' | 'timestamp'>) => void;
    loadExpenses: (groupId: string) => void;
    addSettlement: (settlement: SettlementBatch) => void;
    addSettlementBatch: (batch: SettlementBatch) => void;
}

export const useStore = create<AppState>((set, get) => ({
    groups: [],
    activeGroup: null,
    expenses: [],
    settlements: [],
    currentUser: null,

    setCurrentUser: (address) => set({ currentUser: address }),

    loadGroups: () => {
        const groups = storage.getGroups();
        set({ groups });
    },

    createGroup: (name, description) => {
        const newGroup: Group = {
            id: uuidv4(),
            name,
            description,
            members: [],
            createdAt: Date.now(),
            createdBy: get().currentUser || 'unknown',
        };

        // Auto-add creator as member if wallet connected
        if (get().currentUser) {
            newGroup.members.push({
                address: get().currentUser!,
                name: 'You',
                joinedAt: Date.now()
            });
        }

        const updatedGroups = [...get().groups, newGroup];
        storage.saveGroups(updatedGroups);
        set({ groups: updatedGroups });
    },

    selectGroup: (groupId) => {
        const group = get().groups.find(g => g.id === groupId) || null;
        set({ activeGroup: group });
        if (group) {
            get().loadExpenses(groupId);
        }
    },

    addMember: (groupId, member) => {
        const groups = get().groups.map(g => {
            if (g.id === groupId) {
                // Check if already exists
                if (g.members.some(m => m.address === member.address)) return g;
                return { ...g, members: [...g.members, member] };
            }
            return g;
        });
        storage.saveGroups(groups);
        set({ groups });

        // Update active group if it's the one being modified
        if (get().activeGroup?.id === groupId) {
            set({ activeGroup: groups.find(g => g.id === groupId) });
        }
    },

    loadExpenses: (groupId) => {
        const expenses = storage.getExpenses(groupId);
        const settlements = storage.getSettlements(groupId);
        set({ expenses, settlements });
    },

    addExpense: (expenseData) => {
        const newExpense: Expense = {
            ...expenseData,
            id: uuidv4(),
            timestamp: Date.now(),
        };
        storage.saveExpense(newExpense);
        set({ expenses: [...get().expenses, newExpense] });
    },

    addSettlement: (settlement) => {
        storage.saveSettlement(settlement);
        set({ settlements: [...get().settlements, settlement] });
    },

    addSettlementBatch: (batch) => {
        storage.saveSettlement(batch);
        set({ settlements: [...get().settlements, batch] });
    }
}));

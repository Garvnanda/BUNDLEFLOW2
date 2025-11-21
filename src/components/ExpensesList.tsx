import React from 'react';
import { Expense, Member } from '../types';
import { format } from 'date-fns';
import { Receipt } from 'lucide-react';

interface Props {
    expenses: Expense[];
    members: Member[];
    currentUserId?: string | null;
}

export const ExpensesList: React.FC<Props> = ({ expenses, members, currentUserId }) => {
    const getMemberName = (address: string) => {
        if (address === currentUserId) return 'You';
        const member = members.find(m => m.address === address);
        return member ? member.name : address.slice(0, 6) + '...';
    };

    return (
        <div className="space-y-4">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-1">Recent Expenses</h3>
            <div className="space-y-3">
                {expenses.sort((a, b) => b.timestamp - a.timestamp).map((expense) => (
                    <div key={expense.id} className="glass-card p-4 rounded-2xl flex items-center gap-4 hover:bg-white/5 transition-all group">
                        <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-zinc-400 group-hover:text-indigo-400 group-hover:bg-indigo-500/10 transition-colors shrink-0">
                            <Receipt size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                                <p className="text-sm font-bold text-white truncate">{expense.description}</p>
                                <span className="text-sm font-bold text-white">${expense.amount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <p className="text-xs text-zinc-400">
                                    <span className="text-indigo-300">{getMemberName(expense.payer)}</span> paid
                                </p>
                                <span className="text-[10px] text-zinc-600 font-medium uppercase tracking-wide">{format(expense.timestamp, 'MMM d')}</span>
                            </div>
                        </div>
                    </div>
                ))}
                {expenses.length === 0 && (
                    <div className="text-center py-12 glass-card rounded-2xl border-dashed border-white/10">
                        <p className="text-zinc-500 text-sm">No expenses yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

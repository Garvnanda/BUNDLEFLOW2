export interface Member {
    address: string;
    name: string;
    joinedAt: number;
}

export interface Group {
    id: string;
    name: string;
    description?: string;
    members: Member[];
    createdAt: number;
    createdBy: string;
}

export interface Expense {
    id: string;
    groupId: string;
    payer: string;
    amount: number;
    description: string;
    category?: string;
    timestamp: number;
    involvedMembers?: string[]; // If null, assumes all members in group
}

export interface Transfer {
    from: string;
    to: string;
    amount: number;
}

export interface SettlementBatch {
    id: string;
    groupId: string;
    transfers: Transfer[];
    timestamp: number;
    txHash: string;
    status: 'pending' | 'confirmed' | 'failed';
}

export interface QRPayload {
    type: 'bundleflow_group';
    groupId: string;
    groupName: string;
    inviter: string;
    ts: number;
}

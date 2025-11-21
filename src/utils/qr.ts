import { QRPayload } from '../types';

export const generateQRPayload = (
    groupId: string,
    groupName: string,
    inviter: string
): string => {
    const payload: QRPayload = {
        type: 'bundleflow_group',
        groupId,
        groupName,
        inviter,
        ts: Date.now(),
    };
    return btoa(JSON.stringify(payload));
};

export const parseQRPayload = (encoded: string): QRPayload | null => {
    try {
        const decoded = atob(encoded);
        const payload = JSON.parse(decoded);

        if (payload.type !== 'bundleflow_group' || !payload.groupId) {
            return null;
        }

        return payload as QRPayload;
    } catch (e) {
        console.error("Invalid QR Payload", e);
        return null;
    }
};

/**
 * Converts a human-readable amount to the smallest unit (integer string).
 * @param amount - The human-readable amount (e.g., "1.5")
 * @param decimals - The number of decimals (e.g., 6 for USDC, 8 for APT)
 * @returns The smallest unit string (e.g., "1500000" for USDC)
 */
export const toSmallest = (amount: string | number, decimals: number): string => {
    if (!amount) return '0';
    // avoid floating point issues: use BigInt arithmetic
    const [whole, fraction = ''] = String(amount).split('.');
    const fracPadded = (fraction + '0'.repeat(decimals)).slice(0, decimals);
    return (BigInt(whole) * BigInt(10 ** decimals) + BigInt(fracPadded)).toString();
};

/**
 * Converts a smallest unit amount to a human-readable string.
 * @param amount - The smallest unit amount (e.g., "1500000")
 * @param decimals - The number of decimals (e.g., 6 for USDC, 8 for APT)
 * @returns The human-readable string (e.g., "1.5")
 */
export const fromSmallest = (amount: string | number, decimals: number): string => {
    if (!amount) return '0';
    const s = String(amount).padStart(decimals + 1, '0');
    const whole = s.slice(0, -decimals);
    const frac = s.slice(-decimals).replace(/0+$/, '');
    return frac ? `${whole}.${frac}` : whole;
};

export const getDecimalsForToken = (token: string): number => {
    if (token === 'USDC') return USDC_DECIMALS;
    if (token === 'APT') return APT_DECIMALS;
    return 6; // Default
};

export const APT_DECIMALS = 8;
export const USDC_DECIMALS = 6;

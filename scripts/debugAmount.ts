import { toSmallest, fromSmallest } from '../src/utils/amount.ts';

const testAmounts = [
    { val: 1.5, decimals: 8, expected: "150000000" },
    { val: 0.00000001, decimals: 8, expected: "1" },
    { val: 0.1, decimals: 8, expected: "10000000" },
    { val: 123.456789, decimals: 6, expected: "123456789" }, // USDC
];

console.log("--- Testing toSmallest ---");
testAmounts.forEach(t => {
    const res = toSmallest(t.val, t.decimals);
    console.log(`Val: ${t.val}, Dec: ${t.decimals} -> ${res} (Expected: ${t.expected}) [${res === t.expected ? 'PASS' : 'FAIL'}]`);
});

console.log("\n--- Testing fromSmallest ---");
testAmounts.forEach(t => {
    const smallest = t.expected;
    const res = fromSmallest(smallest, t.decimals);
    console.log(`Smallest: ${smallest}, Dec: ${t.decimals} -> ${res} (Expected: ${t.val}) [${Math.abs(res - t.val) < 0.0000001 ? 'PASS' : 'FAIL'}]`);
});

console.log("\n--- Testing ParseInt Safety ---");
const quoteMock = {
    amount: "150000000",
    relayerFee: 2000000, // Number instead of string
    networkFee: "0"
};

try {
    console.log("Parsing string amount:", parseInt(quoteMock.amount));
    console.log("Parsing number fee:", parseInt(quoteMock.relayerFee as any));
} catch (e) {
    console.error("ParseInt failed:", e);
}

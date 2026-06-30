// src/ledger.js

// We preload the ledger with one successful transaction so you can build your React UI
const transactions = [
    {
        event: "payment_success",
        data: {
            amount: 5000,
            currency: "NGN",
            customerEmail: "ahmed@example.com",
            orderReference: "AJO-PRELOADED-TEST-001"
        },
        recordedAt: new Date().toISOString()
    }
];

module.exports = {
    addTransaction: (data) => {
        transactions.push({ ...data, recordedAt: new Date().toISOString() });
    },
    getLedger: () => transactions
};
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware: This allows your future React frontend to talk to this backend
app.use(cors());
app.use(express.json());

// --- AJOSTACK API CONTRACTS (MOCKED FOR UI DEVELOPMENT) ---

// 1. The Onboarding Engine
app.post('/api/members/tokenize', (req, res) => {
    // When Nomba docs drop, the actual API call goes here.
    // For now, we return the locked contract to feed the frontend.
    res.status(200).json({
        success: true,
        message: "Card saved and first contribution processed successfully.",
        member: {
            id: "mem_001",
            name: "Ahmed Olamide",
            email: req.body.email || "ahmed@example.com", // Takes email from frontend if provided
            cooperativeId: "coop_xyz789"
        },
        paymentMethod: {
            id: "pm_001",
            cardType: "Visa",
            last4: "4081",
            expiryMonth: "12",
            expiryYear: "2027",
            status: "active"
        },
        contribution: {
            transactionId: "txn_001",
            amount: 10000,
            currency: "NGN",
            status: "successful",
            paidAt: new Date().toISOString() // Automatically generates current time
        },
        subscription: {
            enabled: true,
            frequency: "monthly",
            nextChargeDate: "2026-07-18"
        }
    });
});

// 2. The Treasurer Dashboard
app.get('/api/treasury/dashboard', (req, res) => {
    res.status(200).json({
        success: true,
        generatedAt: new Date().toISOString(),
        cooperative: {
            id: "coop_xyz789",
            name: "Ikeja Civil Servants Cooperative",
            totalMembers: 87,
            activeSubscriptions: 81
        },
        summary: {
            currentMonth: "June 2026",
            totalExpected: 870000,
            totalCollected: 790000,
            totalFailed: 60000,
            totalUpcoming: 20000,
            collectionRate: 90.8,
            currency: "NGN"
        },
        recentSuccessful: [
            { transactionId: "txn_001", memberName: "Ahmed Olamide", amount: 10000, paidAt: "2026-06-18T08:14:00Z" },
            { transactionId: "txn_002", memberName: "Chisom Eze", amount: 10000, paidAt: "2026-06-17T11:42:00Z" }
        ],
        failedCharges: [
            { memberId: "mem_034", memberName: "Bola Adeyemi", phone: "08098765432", amount: 10000, failureReason: "insufficient_funds", failedAt: "2026-06-15T09:00:00Z", retryCount: 2, nextRetryDate: "2026-06-20", updateCardUrl: null },
            { memberId: "mem_061", memberName: "Emeka Nwosu", phone: "07011223344", amount: 10000, failureReason: "expired_card", failedAt: "2026-06-15T09:01:00Z", retryCount: 0, nextRetryDate: null, updateCardUrl: "https://ajostack.com/update/mem_061_token" }
        ]
    });
});

// --- IGNITION ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 AjoStack Engine running on port ${PORT}`);
});
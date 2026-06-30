const crypto = require('crypto');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// 1. Internal Dependencies
const checkoutRoutes = require('./routes/checkout');
const ledger = require('./ledger');

const app = express();

// 2. The Universal Listener (Keep this active for your Demo Day debugging)
app.use((req, res, next) => {
    console.log(`\n--- INBOUND TRAFFIC: ${req.method} ${req.url} ---`);
    console.log("Headers:", JSON.stringify(req.headers, null, 2));
    next();
});

// 3. 🚨 CRITICAL PIPELINE FIX: Middleware MUST come first 🚨
app.use(cors());
app.use(express.json());

// 4. Checkout Routing
app.use('/api/v1/checkout', checkoutRoutes);

// ============================================================================
// 🛡️ FORTIFIED AJOSTACK WEBHOOK LISTENER 🛡️
// ============================================================================

// A. The Browser Redirect (User Experience)
app.get('/api/v1/webhook', (req, res) => {
    res.send("<h1 style='font-family: sans-serif; color: green; text-align: center; margin-top: 20%;'>Payment Successful! Welcome to AjoStack.</h1>");
});

// B. The Background Receipt (Data Pipeline)
app.post('/api/v1/webhook', (req, res) => {
    const nombaSignature = req.headers['nomba-signature'];
    
    // Step 1: Does the signature exist?
    if (!nombaSignature) {
        console.error('\n🚨 BLOCKED: Missing Nomba Signature 🚨\n');
        return res.status(401).json({ error: 'Unauthorized' });
    }

    // Step 2: Calculate our own hash
    const hash = crypto.createHmac('sha256', process.env.NOMBA_WEBHOOK_SECRET)
        .update(JSON.stringify(req.body))
        .digest('hex');

    // Step 3: Compare. If they don't match, drop it immediately.
    if (hash !== nombaSignature) {
        console.error('\n🚨 CRITICAL: FORGED WEBHOOK ATTEMPT BLOCKED 🚨\n');
        return res.status(401).json({ error: 'Invalid signature' });
    }

    // Step 4: The data is 100% verified. Store it in the vault.
    console.log('\n✅ VERIFIED NOMBA WEBHOOK PAYLOAD ✅');
    console.log('Event:', req.body.event);
    
    // Save to your temporary database
    ledger.addTransaction(req.body); 

    // Step 5: Tell Nomba we got it so they stop pinging us
    res.status(200).json({ status: 'success', message: 'Webhook received and verified' });
});

// ============================================================================
// 📊 AJOSTACK API CONTRACTS (DASHBOARD & MOCKS) 📊
// ============================================================================

// 1. The Onboarding Engine (Mocked)
app.post('/api/members/tokenize', (req, res) => {
    res.status(200).json({
        success: true,
        message: "Card saved and first contribution processed successfully.",
        member: {
            id: "mem_001",
            name: "Ahmed Olamide",
            email: req.body.email || "ahmed@example.com",
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
            paidAt: new Date().toISOString()
        },
        subscription: {
            enabled: true,
            frequency: "monthly",
            nextChargeDate: "2026-07-18"
        }
    });
});

// 2. The Treasurer Dashboard (Now powered by your live Ledger)
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
        // 🚨 This pulls directly from your memory vault!
        recentSuccessful: ledger.getLedger(), 
        failedCharges: [
            { memberId: "mem_034", memberName: "Bola Adeyemi", phone: "08098765432", amount: 10000, failureReason: "insufficient_funds", failedAt: "2026-06-15T09:00:00Z", retryCount: 2, nextRetryDate: "2026-06-20", updateCardUrl: null },
            { memberId: "mem_061", memberName: "Emeka Nwosu", phone: "07011223344", amount: 10000, failureReason: "expired_card", failedAt: "2026-06-15T09:01:00Z", retryCount: 0, nextRetryDate: null, updateCardUrl: "https://ajostack.com/update/mem_061_token" }
        ]
    });
});

// ============================================================================
// 🚀 IGNITION 🚀
// ============================================================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 AjoStack Engine running on port ${PORT}`);
});
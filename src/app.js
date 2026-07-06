// 1. Load Environment Variables FIRST
require('dotenv').config();

// 2. Import Dependencies
const express = require('express'); 
const cors = require('cors');
const crypto = require('crypto');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// 3. Initialize Services
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const checkoutRoutes = require('./routes/checkout');
const ledger = require('./ledger');

const app = express();

// --- THE UNIVERSAL LISTENER ---
app.use((req, res, next) => {
    console.log(`\n--- INBOUND TRAFFIC: ${req.method} ${req.url} ---`);
    next();
});

// --- CRITICAL PIPELINE MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// ============================================================================
// 🛡️ NOMBA SECURITY MIDDLEWARE 🛡️
// ============================================================================
function validateNombaSignature(req) {
  const secretKey = process.env.NOMBA_WEBHOOK_SECRET || "NombaHackathon2026";
  const incomingSignature = req.headers['nomba-signature'];
  const incomingTimestamp = req.headers['nomba-timestamp'];
  const payload = req.body;

  if (!incomingSignature || !incomingTimestamp || !payload.data) {
    return false; 
  }

  const merchant = payload.data.merchant;
  const transaction = payload.data.transaction;

  const dataToHash = [
    payload.event_type,
    payload.requestId,
    merchant.userId,
    merchant.walletId,
    transaction.transactionId,
    transaction.type,
    transaction.time,
    transaction.responseCode || "", 
    incomingTimestamp
  ].join(':');

  const expectedSignature = crypto
    .createHmac('sha256', secretKey)
    .update(dataToHash)
    .digest('base64');

  const expectedBuffer = Buffer.from(expectedSignature);
  const incomingBuffer = Buffer.from(incomingSignature);

  if (expectedBuffer.length !== incomingBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, incomingBuffer);
}

// 4. Checkout Routing
app.use('/api/v1/checkout', checkoutRoutes);

// ============================================================================
// 🔔 LIVE NOMBA WEBHOOK RECEIVER 🔔
// ============================================================================

// A. The Browser Redirect (User Experience)
app.get('/api/v1/webhook', (req, res) => {
    res.send("<h1 style='font-family: sans-serif; color: green; text-align: center; margin-top: 20%;'>Payment Successful! Welcome to AjoStack.</h1>");
});

// B. The Background Receipt (Data Pipeline)
app.post('/api/v1/webhook', (req, res) => {
  console.log("🔔 Incoming webhook from Nomba...");

  // Step 1: Verify the cryptographic signature using the new Python-translated logic
  const isValid = validateNombaSignature(req);
  
  if (!isValid) {
    console.error("🚨 Webhook Security Breach: Invalid Signature!");
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }

  // Step 2: Acknowledge receipt immediately so Nomba doesn't timeout
  res.status(200).json({ status: "ok" });

  // Step 3: Process the event asynchronously
  const event = req.body;
  console.log(`✅ Verified Event: ${event.event_type}`);

  // Fortified logic to handle multiple undocumented API naming conventions
  if (event.event_type === "payment_success" || event.event_type === "transaction.success") {
    // Safely extract the amount, handling potential payload structure variations
    const amount = event.data?.transaction?.amount || event.data?.amount || "100"; 
    
    console.log(`💰 Payment of ₦${amount} received successfully.`);
    
    // Store in the temporary database
    ledger.addTransaction({
        ...event,
        // Normalize the event type so your React frontend understands it
        event_type: "transaction.success" 
    }); 
  } 
  
  if (event.event_type === "payment_failed" || event.event_type === "transaction.failed") {
    console.log("❌ Payment failed, triggering AI Dunning Engine...");
    // Future: Call Gemini function here dynamically based on webhook data
  }
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
    // 1. Fetch the persistent data from your JSON database
    const currentLedger = ledger.getLedger();

    // 2. Start with a baseline to make the demo look realistic
    let realTotalCollected = 790000; 

    // 3. Loop through all live transactions and add them to the total
    currentLedger.forEach(txn => {
        // Use the exact same safety fallback we used in the webhook
        const amountStr = txn.data?.transaction?.amount || txn.data?.amount || "100";
        realTotalCollected += parseFloat(amountStr);
    });

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
            currentMonth: "July 2026",
            totalExpected: 870000,
            // 🟢 THIS NUMBER IS NOW DYNAMIC 🟢
            totalCollected: realTotalCollected, 
            totalFailed: 60000,
            totalUpcoming: 20000,
            // 🟢 AUTO-CALCULATE THE PERCENTAGE 🟢
            collectionRate: ((realTotalCollected / 870000) * 100).toFixed(1), 
            currency: "NGN"
        },
        recentSuccessful: currentLedger, 
        failedCharges: [
            { memberId: "mem_034", memberName: "Bola Adeyemi", phone: "08098765432", amount: 10000, failureReason: "insufficient_funds", failedAt: "2026-06-15T09:00:00Z", retryCount: 2, nextRetryDate: "2026-06-20", updateCardUrl: null },
            { memberId: "mem_061", memberName: "Emeka Nwosu", phone: "07011223344", amount: 10000, failureReason: "expired_card", failedAt: "2026-06-15T09:01:00Z", retryCount: 0, nextRetryDate: null, updateCardUrl: "https://ajostack.com/update/mem_061_token" }
        ]
    });
});

// --- AI DUNNING ROUTE ---
app.post('/api/treasury/remind', async (req, res) => {
  const { memberName, reason, amount } = req.body;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `Write a short, professional WhatsApp message to ${memberName} reminding them that their cooperative AjoStack deduction of ₦${amount} failed due to ${reason}. Keep it polite but urgent. Do not use placeholders.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return res.json({ success: true, message: text });

  } catch (error) {
    console.warn("Google AI busy or failed, using fallback dunning template:", error.message);
    const fallbackMessage = `Dear ${memberName}, our records show your automated AjoStack deduction of ₦${amount.toLocaleString()} failed due to ${reason.replace('_', ' ')}. Please fund your account immediately to allow the automated retry to clear. Thank you.`;
    
    return res.json({ 
      success: true, 
      message: fallbackMessage 
    });
  }
});

// ============================================================================
// 💳 LIVE NOMBA CHECKOUT (PRODUCTION) 💳
// ============================================================================

app.post('/api/v1/create-live-checkout', async (req, res) => {
    // 1. Map to your specific .env credentials
    const CLIENT_ID = process.env.NOMBA_LIVE_CLIENT_ID;
    const CLIENT_SECRET = process.env.NOMBA_LIVE_CLIENT_SECRET;
    const TEAM_SUB_ACCOUNT_ID = process.env.NOMBA_SUB_ACCOUNT_ID; 
    
    // The shared Hackathon Mothership ID (Always goes in the header)
    const MOTHERSHIP_ID = "f666ef9b-888e-4799-85ce-acb505b28023";

    if (!CLIENT_ID || !CLIENT_SECRET || !TEAM_SUB_ACCOUNT_ID) {
         console.error("Missing Live Credentials in .env file");
         return res.status(500).json({ error: "Server configuration error" });
    }

    try {
        console.log("🔐 Requesting Live Access Token...");
        
        // --- STEP 1: GET THE ACCESS TOKEN ---
        const tokenResponse = await fetch("https://api.nomba.com/v1/auth/token/issue", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "accountId": MOTHERSHIP_ID // Mandatory Mothership Header
            },
            body: JSON.stringify({
                grant_type: "client_credentials",
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET
            })
        });

        const tokenData = await tokenResponse.json();
        
        if (!tokenData.data || !tokenData.data.access_token) {
            console.error("Token Error:", tokenData);
            return res.status(401).json({ error: "Failed to authenticate with Nomba" });
        }

        const accessToken = tokenData.data.access_token;
        console.log("✅ Token secured. Generating Checkout Order...");

        // --- STEP 2: CREATE THE CHECKOUT ORDER ---
        const orderReference = `AJO-${Date.now()}`; 
        
        const orderResponse = await fetch("https://api.nomba.com/v1/checkout/order", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`,
                "accountId": MOTHERSHIP_ID // Mandatory Mothership Header
            },
            body: JSON.stringify({
                order: {
                    orderReference: orderReference,
                    customerId: "mem_live_001",
                    customerEmail: "ahmed@ajostack.com",
                    amount: 100, // ₦100 minimum test amount
                    currency: "NGN",
                    callbackUrl: "http://localhost:5174", // 🟢 REDIRECTS BACK TO REACT 🟢
                    accountId: TEAM_SUB_ACCOUNT_ID 
                }
            })
        });

        const orderData = await orderResponse.json();

        if (orderData.code !== "00") {
            console.error("Order Creation Failed:", orderData);
            return res.status(400).json({ error: orderData.description });
        }

        console.log("🚀 Live Checkout Link Generated!");
        
        // Send the real checkout link back to the frontend
        res.status(200).json({
            success: true,
            checkoutLink: orderData.data.checkoutLink,
            orderReference: orderData.data.orderReference
        });

    } catch (error) {
        console.error("System Error during Live Checkout:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
// ============================================================================
// 🏦 LIVE NOMBA VIRTUAL ACCOUNTS (PRODUCTION) 🏦
// ============================================================================

app.post('/api/v1/create-virtual-account', async (req, res) => {
    const CLIENT_ID = process.env.NOMBA_LIVE_CLIENT_ID;
    const CLIENT_SECRET = process.env.NOMBA_LIVE_CLIENT_SECRET;
    const TEAM_SUB_ACCOUNT_ID = process.env.NOMBA_SUB_ACCOUNT_ID;
    const MOTHERSHIP_ID = "f666ef9b-888e-4799-85ce-acb505b28023";

    // Data coming from your React frontend
    const { accountName, email, phoneNumber } = req.body;

    if (!accountName || !email) {
        return res.status(400).json({ error: "Account Name and Email are strictly required." });
    }

    try {
        console.log(`🏦 Requesting Live Virtual Account for ${accountName}...`);
        
        // --- STEP 1: GET THE ACCESS TOKEN ---
        const tokenResponse = await fetch("https://api.nomba.com/v1/auth/token/issue", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "accountId": MOTHERSHIP_ID 
            },
            body: JSON.stringify({
                grant_type: "client_credentials",
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET
            })
        });

        const tokenData = await tokenResponse.json();
        
        if (!tokenData.data || !tokenData.data.access_token) {
            console.error("Token Error:", tokenData);
            return res.status(401).json({ error: "Authentication failed during account creation." });
        }

        const accessToken = tokenData.data.access_token;
        console.log("✅ Token secured. Provisioning Bank Account...");

       // --- STEP 2: CREATE THE VIRTUAL ACCOUNT ---
        const accountResponse = await fetch("https://api.nomba.com/v1/accounts/virtual", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`,
                "accountId": MOTHERSHIP_ID // Required header for routing
            },
            body: JSON.stringify({
                accountRef: `AJO-ACC-${Date.now()}`,
                accountName: accountName
                // We are intentionally leaving BVN out since the docs say it is Optional
            })
        });
        
        const accountData = await accountResponse.json();

        if (accountData.code !== "00" && accountData.code !== "200") {
            console.error("Virtual Account Creation Failed:", accountData);
            return res.status(400).json({ error: accountData.description || "Failed to generate account." });
        }

        console.log("🚀 Live Virtual Account Provisioned!");
        
        // Send the real bank account details back to the React frontend
        res.status(200).json({
            success: true,
            message: "Permanent Virtual Account created.",
            bankDetails: {
                // Mapped to the exact keys from Nomba's live production payload
                accountNumber: accountData.data.bankAccountNumber, 
                accountName: accountData.data.bankAccountName,
                bankName: accountData.data.bankName
            }
        });

    } catch (error) {
        console.error("System Error during Account Creation:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ============================================================================
// ⏰ SECRET CRON SIMULATOR (DEMO DAY ONLY) ⏰
// ============================================================================
app.post('/api/treasury/simulate-cron', (req, res) => {
    console.log("⏰ SECRET TRIGGER HIT: Simulating End of Month Card Deductions...");
    
    // Simulate Nomba automatically charging a saved card successfully
    const autoDeduction = {
        event_type: "transaction.success",
        data: { 
            amount: 15000, 
            description: "Automated Monthly Thrift Deduction" 
        }
    };
    
    // Write it directly to the persistent JSON database
    ledger.addTransaction(autoDeduction);
    
    res.status(200).json({ success: true, message: "End of month simulated." });
});

// ============================================================================
// 🚀 IGNITION 🚀
// ============================================================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 AjoStack Engine running on port ${PORT}`);
});
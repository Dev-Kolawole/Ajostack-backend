const express = require('express');
const axios = require('axios');
const router = express.Router();
const { getNombaAccessToken } = require('../services/nombaAuth');

router.post('/initialize-savings', async (req, res) => {
    try {
        const token = await getNombaAccessToken();
        
        const uniqueOrderRef = `AJO-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const payload = {
            order: {
                orderReference: uniqueOrderRef, 
                amount: parseFloat(req.body.amount).toFixed(2), 
                currency: "NGN",
                customerEmail: req.body.email,
                callbackUrl: "https://snowbird-boondocks-margarita.ngrok-free.dev/api/v1/webhook"
            }
        };

        const response = await axios.post('https://sandbox.nomba.com/v1/checkout/order', payload, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'accountId': process.env.NOMBA_PARENT_ACCOUNT_ID, 
                'Content-Type': 'application/json'
            }
        });
        
        // 🚨 Printing the full link in your Node terminal
        console.log("\n🔗 AJOSTACK CHECKOUT LINK:", response.data.data.checkoutLink, "\n");
        
        res.status(200).json(response.data);

    } catch (error) {
        console.error("\n🚨 NOMBA CHECKOUT FAILED 🚨");
        console.error(error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
        res.status(500).json({ error: "Failed to initialize session" });
    }
});

module.exports = router;
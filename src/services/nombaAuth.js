const axios = require('axios');

async function getNombaAccessToken() {
    try {
        // --- THE X-RAY TRAP ---
        console.log("\n--- KEY X-RAY ---");
        // Updated to match your exact .env labels
        console.log("ClientID:", `"${process.env.NOMBA_TEST_CLIENT_ID}"`, "Length:", process.env.NOMBA_TEST_CLIENT_ID?.length);
        console.log("AccountID:", `"${process.env.NOMBA_PARENT_ACCOUNT_ID}"`, "Length:", process.env.NOMBA_PARENT_ACCOUNT_ID?.length);
        console.log("-----------------\n");

        const response = await axios.post('https://sandbox.nomba.com/v1/auth/token/issue', {
            grant_type: "client_credentials",
            client_id: process.env.NOMBA_TEST_CLIENT_ID,        // UPDATED
            client_secret: process.env.NOMBA_TEST_PRIVATE_KEY   // UPDATED
        }, {
            headers: {
                'accountId': process.env.NOMBA_PARENT_ACCOUNT_ID,
                'Content-Type': 'application/json'
            }
        });
        
        console.log("Nomba Response:", JSON.stringify(response.data, null, 2));
        return response.data.access_token || response.data.data.access_token;

    } catch (error) {
        console.error("\n🚨 NOMBA AUTHENTICATION FAILED 🚨");
        console.error(error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
        throw new Error("Failed to get Access Token");
    }
}

module.exports = { getNombaAccessToken };
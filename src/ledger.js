const fs = require('fs');
const path = require('path');

// We create a persistent JSON database file in your src directory
const dbPath = path.join(__dirname, 'database.json');

// Boot Sequence: If the database doesn't exist yet, create it.
if (!fs.existsSync(dbPath)) {
    console.log("🛠️ Initializing persistent AjoStack ledger...");
    fs.writeFileSync(dbPath, JSON.stringify([]));
}

const getLedger = () => {
    try {
        const rawData = fs.readFileSync(dbPath, 'utf8');
        return JSON.parse(rawData);
    } catch (error) {
        console.error("Ledger Read Error:", error);
        return [];
    }
};

const addTransaction = (transaction) => {
    try {
        const currentLedger = getLedger();
        
        // Add a timestamp and unique ID if Nomba didn't provide one
        const enrichedTransaction = {
            ...transaction,
            ajostack_id: `txn_${Date.now()}`,
            recorded_at: new Date().toISOString()
        };

        currentLedger.push(enrichedTransaction);
        
        // Save it permanently to the hard drive
        fs.writeFileSync(dbPath, JSON.stringify(currentLedger, null, 2));
        console.log(`💾 Transaction permanently saved to database.json`);
    } catch (error) {
        console.error("Ledger Write Error:", error);
    }
};

module.exports = {
    getLedger,
    addTransaction
};
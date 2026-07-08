## 🛑 JUDGING & EVALUATION GUIDE

**Live URL:** [https://ajostack.vercel.app/]
**Demo Video:** [https://www.loom.com/share/592c215685fb4ce3936283ee0d3e01f2]

**How to Evaluate AjoStack:**
AjoStack is deployed using the **Live Production Environment** for Nomba APIs. There are no login gates or signup flows to bypass—the multi-tenant dashboard is immediately accessible for evaluation.

**Testing the Infrastructure:**
1. **Virtual Accounts (Live Webhooks):** Click "Generate Virtual Account". This provisions a live, permanent Nomba account. You can send a real micro-transfer (e.g., ₦50) to this account to trigger the Nomba webhook and witness the automated React dashboard reconciliation.
2. **AI Dunning Engine:** Click the "AI Reminder" button next to any failed charge on the dashboard. This triggers the Google Gemini 2.5 Flash model to read the specific failure payload and generate a contextualized WhatsApp recovery message.
3. **Card Tokenization:** Click "Process Live Card Payment" to view the Nomba Live Checkout routing.

# AjoStack 🏦
**DevCareer x Nomba Hackathon 2026 - Finalist Submission**

A multi-tenant treasury dashboard that digitizes and automates collection, reconciliation, and dunning for traditional Nigerian cooperative societies (Ajo/Esusu) using Nomba’s payment infrastructure and Gemini AI.

## 🚀 The Problem
Traditional informal cooperative systems manage millions of Naira, yet run on outdated, manual processes. Treasurers face severe operational bottlenecks: manual reconciliation of fragmented bank transfers, high default rates due to lack of automated deductions, and inefficient, manual debt recovery (dunning).

## 💡 The Solution (AjoStack)
AjoStack replaces manual tracking with a centralized, automated Treasurer Dashboard:
* **Automated Card Collections:** Tokenizes member debit cards via **Nomba Checkout API** for frictionless, recurring deductions.
* **Static Virtual Accounts:** Provisions dedicated Wema bank accounts via **Nomba Virtual Accounts API** for members who prefer manual transfers, allowing instant auto-reconciliation.
* **Real-Time Ledger:** Uses **Nomba Webhooks** to eliminate manual data entry, updating the cooperative's treasury instantly upon successful transaction events.
* **AI Contextual Debt Collector:** An automated exception engine powered by **Google Gemini AI** that flags failed charges and instantly generates localized, professional WhatsApp dunning messages to recover funds.

## 🛠️ Technical Architecture
* **Frontend:** React (Vite) + Tailwind/Vanilla CSS (Live polling architecture)
* **Backend:** Node.js + Express.js (Decoupled RESTful API)
* **Security:** Cryptographic Webhook Signature Validation (`crypto` HMAC SHA-256)
* **Database:** Persistent JSON File-System Ledger
* **AI Engine:** Google Generative AI (`gemini-2.5-flash`)

## ⚙️ Core Integrations
1. `POST /api/v1/create-live-checkout` -> Secures token and generates Nomba Checkout links.
2. `POST /api/v1/create-virtual-account` -> Provisions permanent Nombank MFB accounts.
3. `POST /api/v1/webhook` -> Validates signatures and parses `transaction.success` payloads.
4. `POST /api/treasury/remind` -> Feeds failure context to Gemini AI for localized text generation.

---
*Built by Kolawole Ahmed Olamide (Team Lead) for the DevCareer x Nomba 2026 Hackathon.*

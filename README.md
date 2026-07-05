AjoStack: Master Project Blueprint
Elevator Pitch
AjoStack is a multi-tenant treasury dashboard that digitizes and automates collection, reconciliation, and dunning for traditional Nigerian cooperative societies (Ajo/Esusu) using Nomba’s payment infrastructure and AI-driven exception handling.

The Problem: Financial Vulnerability & Operational Leakage
Traditional informal cooperative systems manage millions of Naira, yet they run on outdated, manual processes. Cooperative Treasurers face severe operational bottlenecks:

Manual Reconciliation: Wasting hours cross-referencing fragmented bank transfer receipts with paper ledgers or Excel sheets.

Collection Friction: The inability to automatically deduct recurring weekly or monthly contributions, leading to high default rates.

Inefficient Dunning: Chasing defaulting members manually creates friction, delays cooperative payouts, and increases the administrative overhead for the treasury.

The Solution: Automated Cooperative Infrastructure
AjoStack replaces manual tracking with a centralized, automated Treasurer Dashboard designed specifically for cooperative asset management. It guarantees 100% accurate ledger updates and enforces automated collections.

Automated Card Collections: Tokenizing member debit cards for frictionless, recurring deductions.

Static Virtual Accounts: Provisioning permanent, dedicated bank accounts for members who prefer manual transfers, allowing the system to auto-reconcile deposits instantly.

Real-Time Ledger: Eliminating manual data entry by updating the cooperative's treasury instantly upon successful transaction events.

AI Contextual Debt Collector: An automated exception engine that flags failed charges and instantly generates localized, professional dunning messages to recover funds.

API Integration Architecture (The "How")
AjoStack is built directly on top of Nomba's financial routing and Google's LLM capabilities:

Nomba Checkout API: Secures and tokenizes member debit cards for recurring thrift contributions.

Nomba Virtual Accounts API: Generates unique, permanent bank accounts mapped to individual cooperative members for seamless transfer reconciliation.

Nomba Webhooks: Real-time event listeners securely tunneled to our backend, capturing transaction statuses (success/failure) to drive immediate database updates.

Gemini AI API: Powers the automated dunning engine, generating context-aware recovery messages (e.g., WhatsApp prompts) based on specific Nomba failure codes (e.g., "insufficient funds" vs. "expired card").

Technical Stack
Frontend Client: React (built via Vite) styled with lightweight, responsive vanilla CSS for a fast, accessible, and non-technical user interface.

Backend Engine: Node.js with Express.js executing a decoupled RESTful API architecture.

Database & State: Database integration for persistent ledger records and secure state management.

Infrastructure & Security: ngrok for secure local webhook tunneling; GitHub for version control and continuous integration.
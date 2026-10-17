# TPay - Mobile Fintech Proposal Prototype

A high-fidelity, interactive mobile wallet and payment prototype built for client pitches, UI/UX demonstrations, and fintech product proposals.

---

## 🌟 Key Features Included

1. **Brand Splash Screen (5-6 Seconds)**:
   - Modern emerald neo-banking branding with animated TPay monogram and glow.
   - Smooth progress bar with countdown timer (5 seconds) matching the requested initial experience.
   - "Skip Intro" option for quick presentation control during live pitches.

2. **Security PIN Screen**:
   - 4-digit security lock with interactive keypad and active dot indicators.
   - Demo PIN: `1234` (or tap the Biometric/Face ID button for instant unlock).

3. **Dashboard & Wallet Balance**:
   - Premium Raqmi-style virtual debit card with masked virtual IBAN.
   - **500,000.00 PKR** default presentation balance.
   - **24-Hour Auto-Replenishment Logic**: Automatically resets/replenishes to 500k within 24 hours via `localStorage` persistence.
   - **Instant "Refill 500k" button**: Enables quick reset during client presentations.
   - Balance privacy toggle (show/hide balance).

4. **Interactive Money Transfer Flow**:
   - Quick-select contacts (Sara Ahmed, Bilal Khan, Raqmi Merchant).
   - Recipient number / IBAN input.
   - Quick amount chips (₨ 1,000, ₨ 5,000, ₨ 25,000, ₨ 50,000).
   - Dynamic balance deduction and transaction record generation.
   - Animated transaction confirmation receipt with Reference ID.

5. **Interactive Mobile Top-Up**:
   - Operator selection chips: **Jazz**, **Telenor**, **Zong**, **Ufone**.
   - Mobile number input and denomination chips (₨ 200, ₨ 500, ₨ 1,000, ₨ 2,500).
   - Real-time balance update and receipt dialog.

6. **Presentation Tools (Top Bar)**:
   - **↺ Reset 500K**: One-click restore to 500,000 PKR balance.
   - **📱 Frame**: Switch between iPhone 15 device mockup frame and responsive fullscreen mode.
   - **▶ Replay Intro**: Replay the 5-second animated splash screen anytime.

---

## 🚀 How to Run the Prototype

### Option 1: Direct Browser Launch
Simply double-click `index.html` in your file explorer to open it in Chrome, Edge, or Firefox.

### Option 2: Local HTTP Server (Recommended)
Open PowerShell in this directory (`c:\Users\ALI COMPUTERS\Desktop\TPay`) and run:

```bash
npm start
# OR using python:
python -m http.server 3000
```
Then navigate to `http://localhost:3000` in your web browser.

---

*Note: This prototype is designed strictly for UI/UX demonstration, client pitch proposals, and design reviews.*

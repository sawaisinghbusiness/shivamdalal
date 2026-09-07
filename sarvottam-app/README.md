# SARVOTTAM — Managed Home-Services Marketplace

SARVOTTAM is a mobile-first, high-performance home-services web application connecting homeowners across Rajasthan with verified local Karigars (Electricians, Plumbers, AC Technicians, Carpenters, Painters, and Furniture Craftsmen).

---

## Configuration & Customization Guide

All wizard pricing rules, service estimates, time slots, transparency guarantee steps, and default addresses are centrally configured and decoupled from UI logic in:
`src/config/bookingConfig.js`

### 1. Pricing & Visit Charges
Edit `PRICING_CONFIG` in `src/config/bookingConfig.js`:
- `visitCharge`: Standard visitation & diagnostic inspection fee (default: `₹99`). Multi-service carts only apply this fee **once**.
- `gstPct`: Applicable GST rate (default: `0.05` / 5%).
- `serviceEstimates`: Configure minimum and maximum estimated labor rates and attribute pill options for each service category (`electrician`, `ac`, `plumber`, `carpenter`, `painter`, `furniture`).

### 2. Time Slots & Schedule Groups
Edit `SLOT_GROUPS` in `src/config/bookingConfig.js`:
- Subah (Morning: 8:00 AM – 12:00 PM)
- Dopahar (Afternoon: 12:00 PM – 4:00 PM)
- Shaam (Evening: 4:00 PM – 8:00 PM)
- Toggle availability per slot (`available: true | false`).

### 3. Pricing Transparency Guarantee
Edit `TRANSPARENCY_STEPS` in `src/config/bookingConfig.js`:
- Step 1: Doorstep Diagnostic Inspection (`₹99` visiting charge)
- Step 2: Clear Estimate Before Work Begins
- Step 3: Customer Approval First (Zero hidden surprises)
- Step 4: Simple Fix Flat Rate or Visit Charge Only

---

## Key Features

1. **Multi-Step Booking Wizard**:
   - **Step 0: Aapka Booking Summary**: Service cart with problem pill, attribute chips, multi-service single visit savings banner (`Ek hi visit – visit charge sirf ek baar`), shared collapsible transparency guarantee, and draft persistence.
   - **Step 1: Date & Time**: Horizontal date picker ("Aaj" + 4 days) with morning/afternoon/evening slots.
   - **Step 2: Address & Location**: Saved addresses (Ghar/Office), GPS auto-locate, map pin preview, and full address input.
   - **Step 3: Review & Confirm**: Contact info, instructions note, complete price breakdown with transparency modal link.
   - **Step 4: Dispatch & Live Tracking**: Real-time matching radar, Start Job OTP, Karigar verification card, and UPI/Cash settlement.
2. **Apple HIG Design Language**:
   - Palette: Deep Teal (`#0F766E`), Mint (`#E6F4F1`), Slate Ink (`#1F2937`), Crisp Borders (`#E5E7EB`).
   - SVG vector iconography (zero emoji in UI elements).
   - 60fps smooth horizontal slide and bottom sheet snap transitions.

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation & Running Locally
```bash
# Frontend
cd sarvottam-app
npm install
npm run dev

# Build for Production
npm run build
```


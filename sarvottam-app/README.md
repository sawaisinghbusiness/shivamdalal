# SARVOTTAM — Managed Home-Services Marketplace

SARVOTTAM is a mobile-first, high-performance home-services web application connecting homeowners across Rajasthan with verified local Karigars (Electricians, Plumbers, AC Technicians, Carpenters, Painters, and Furniture Craftsmen).

---

## Configuration & Customization Guide

All pricing rules, service issues, estimates, time slots, transparency guarantee steps, and default addresses are centrally configured in:
`src/config/bookingConfig.js`

### 1. Services, Issues & Pricing Configuration
Edit `PRICING_CONFIG` in `src/config/bookingConfig.js`:
- `visitCharge`: Standard visiting & diagnostic inspection fee (default: `₹99`). Multi-service carts only apply this fee **once**.
- `gstPct`: Applicable GST rate (default: `0.05` / 5%).
- `serviceEstimates`: Configure specific services (`electrician`, `ac`, `plumber`, `carpenter`, `painter`), each containing:
  - `issues`: Array of selectable issues (including the first recommended row `"Problem pata nahi? Complete Diagnosis"` with fixed/estimate pricing).
  - `displayPrice`: Live price text rendered on radio chips and sticky bottom bar.

### 2. Time Slots & Schedule Groups
Edit `SLOT_GROUPS` in `src/config/bookingConfig.js`:
- **Subah 8–12** (Morning: 8:00 AM – 12:00 PM)
- **Dopahar 12–4** (Afternoon: 12:00 PM – 4:00 PM)
- **Shaam 4–8** (Evening: 4:00 PM – 8:00 PM)
- Toggle availability per slot (`available: true | false`).

### 3. Pricing Transparency Guarantee ("Kaam kaise hoga?")
Edit `TRANSPARENCY_STEPS` in `src/config/bookingConfig.js`:
- Step 1: Verified Technician Doorstep Inspection
- Step 2: Upfront Spare Parts Estimate
- Step 3: Work Commences After Your Approval
- Step 4: Fair & Flat-Rate Pricing Guarantee

---

## Managed Booking Pipeline

1. **S-ISSUE (Issue & Price Selection)**:
   - Tapping any service opens issue selection with **NOTHING pre-selected**.
   - Primary CTA disabled (*"Issue chunein"*) until an issue radio is selected.
   - Recommended row: *"Problem pata nahi? Complete Diagnosis"*.
   - Optional Brand & Model fields (renders only if populated, never *"not specified"*).
   - Live sticky price calculation: Visit fee (₹99) + Issue price + 5% GST.

2. **S0 (Booking Summary)**:
   - Itemized cart per service with photo, issue badge, and labor estimate.
   - Add another service with single visit charge savings banner.
   - ONE shared collapsible transparency card (*"Kaam kaise hoga?"*).
   - Remove per item & footer *"Clear booking draft"* text link.

3. **S1 (Date & Time)**:
   - Slim teal stepper: Date & Time → Address → Confirm.
   - Day chips ("Aaj" + 4 days) & Morning/Afternoon/Evening grouped slots.

4. **S2 (Address & Location)**:
   - Saved addresses (Ghar/Office), GPS location trigger, and interactive map preview.
   - CTA disabled until address ≥ 10 chars.

5. **S3 (Details & Confirm)**:
   - Name and phone prefilled; optional notes.
   - Itemized price breakdown card and 30-day warranty note.
   - CTA *"Confirm karein"* generates `CPxxxxxx` booking ID, stores in `AppData` store, clears draft, and navigates to Success Page.

6. **Booking Confirmed Success Page (`/booking-success`)**:
   - Green check in mint ring, title, Hinglish sub-line, `CP` Booking ID pill, summary table, and navigation CTAs.
   - Direct-open or refresh guard automatically redirects home.

7. **My Bookings Redesign (`/bookings`)**:
   - Logged-in customer card with Verified badge and count pill.
   - Status tabs (`All`, `Processing`, `Confirmed`, `Completed`, `Cancelled`).
   - Cards with status accent bar, service icon tile, date/time chips, Booking ID, and total amount.
   - Tap opens interactive details sheet: progress timeline, assigned technician, itemized invoice, warranty guarantee, support helpline, and rating tags.
   - **Zero live-tracking / map / fake ETA code paths**.
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


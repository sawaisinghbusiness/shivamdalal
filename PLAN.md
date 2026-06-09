# SARVOTTAM DIGITAL SOLUTION — Project Plan (Master Document)

> Yeh document hamara "project ka dimaag" hai. Jo bhi finalize hota hai, yahan likha jaata hai.
> Status: **FINALIZATION PHASE** (abhi coding nahi — pehle sab kuch clear).
> Last updated: 2026-06-08

---

## 0. Ek line mein idea
"Rapido for home services" — Customer ek service ya **emergency repair** book kare, aas-paas ke
verified workers (Captains) ko notification jaaye, jo pehle accept kare wo job le, customer ko uski
detail mile (kaun aa raha hai), kaam ho, payment (cash/online) ho — hamara commission kat ke baaki
worker ko mile.

---

## 1. DECIDED (finalize ho chuka)

### Launch strategy
- Software **poore Rajasthan** ko support karega (din 1 se).
- Real users **BARMER** se start honge. Dense karo, phir city-by-city expand.
- **Abhi coding NAHI.** Pehle: inspiration → features → look → rules → tech/paisa finalize, phir plan, phir code.

### Platform
- **Website pehle** (phone pe app jaisa chale), **phir Android/iOS app** (same code reuse).

### Services at launch
- Emergency repairs (electrician, plumber, gate/lock, AC) — **star feature**
- Furniture (custom design & making)
- Painting (interior/exterior, designing)

### Inspiration (kis app se kya lena hai)
- **Rapido** → nearby worker matching, pehle-accept-wala-jeete, "banda aa raha hai" live tracking
- **Urban Company** → verified/trained workers, fixed price list, ratings & reviews, premium feel
- **Zomato/Swiggy** → live order status (Accepted → On the way → Working → Done), order history
- **Ola/Uber** → pehle se price estimate, emergency priority/surge, cash + online dono

### Branding
- **App ka naam: SARVOTTAM** (company: Sarvottam Digital Solution)
- **Worker ko bulaate hain: KARIGAR**
- Peacock branding (mor) already maujood — Rajasthan local feel ke saath jaata hai.

### App ke 3 hisse (sabhi platforms ki tarah)
1. **Customer App** — book kare, track kare, pay kare
2. **Karigar App** (worker) — notification → accept → kaam → paisa
3. **Admin Panel** (aap) — orders, Karigar approve, commission set, earnings, complaints

---

## 2. FEATURES — FINALIZED ✅

### 1) CUSTOMER APP
- Login — phone number + OTP
- Home — location (Barmer), search, service categories, popular services
- Service select → detail + **price estimate** (Ola jaisa) + photos
- Booking form — address, date/time ya "abhi chahiye", problem photo upload
- Emergency button — bada, alag, fast flow
- Live tracking — dhoondh rahe hain → accept hua → Karigar naam/photo/phone/rating → aa raha hai (map) → kaam chalu → done
- Payment — cash ya online (UPI/card), bill breakdown
- Rating & review — kaam ke baad
- My Bookings — chalu + purane, status ke saath
- Profile — saved addresses, wallet, help/support

### 2) KARIGAR APP (worker)
- Login + registration — phone OTP, naam, photo, skill, ID proof, area
- Online/Offline toggle (available hoon)
- Job notification — service + area + distance + paisa → Accept/Reject (timer)
- Job detail — customer address, phone, problem photo, map direction
- Status update — pahuncha → kaam chalu → done
- Earnings/Wallet — aaj/total kamai, commission kata, payout
- Ratings — customer se mili rating

### 3) ADMIN PANEL (aap, website pe)
- Dashboard — aaj ke orders, complete, earning, aapka commission
- Karigar management — approve/reject (ID verify), block
- Orders — sabhi bookings, stuck wale, manual assign
- Commission settings — har service ka % set
- Payments — payout, cash collection track
- Complaints/Support

---

## 2c. RULES — FINALIZED ✅

- **Commission:** Service ke hisaab se alag (emergency zyada e.g. 20%, normal kam e.g. 12%).
  Aap Admin panel se har service ka % set karoge.
- **Emergency matching:** Sabse paas wale available Karigar ko pehle notification → 30 sec mein
  accept na ho to agle najdeek wale ko (Rapido jaisa). Fastest response.
- **Karigar verification:** Karigar register kare (ID, photo, skill), par customer ko tabhi dikhe
  jab AAP Admin panel se manually approve karo (ID check karke). Safe shuruaat.
- **Cancellation:** Abhi simple — sab free cancel. Charge ka rule baad mein add karenge.
- **Payment:** Cash + online (UPI/card) dono. Online = commission auto-cut. Cash = Karigar ne liya,
  commission uske wallet se adjust.

---

## 2d. LOOK & FEEL — FINALIZED ✅
- **Colors:** Dark teal (gehra hara-neela) + Peacock (mor) branding. Royal, Rajasthan-feel, premium.
- **Logo:** Baad mein professional banwaenge. Abhi temporary mor image chalegi.
- **NOTE:** Demo mein abhi naam "CraftConnect" likha hai → "SARVOTTAM" karna hai.

## 2e. TECH & PAISA — FINALIZED ✅
- **Frontend (jo dikhta hai):** React → React Native (ek baar banao, web + Android + iOS teeno).
- **Backend (dimaag):** Node.js + Database (PostgreSQL).
- **Notifications:** Firebase. **Maps:** Google Maps. **Payment:** Razorpay. **Login:** Phone OTP.
- **Kharcha:** Demo/test = FREE. Real launch = ~₹1,000–3,000/month shuruaat mein, usage ke saath badhega.
  Razorpay online payment pe 2%. Domain ~₹800/saal. SMS OTP ~₹0.15/SMS.

## 2f. PEHLA DEMO — FINALIZED ✅
- **Customer App pura clickable** banao: current demo ko "SARVOTTAM" bana ke complete karo —
  emergency flow, live tracking, payment screens — sab clickable (fake/demo data).
- Abhi bhi sirf "dikhne" wala demo (no real backend) — logon ko dikhane / test ke liye.

---

## ✅ FINALIZATION PHASE COMPLETE!
Sab bade decisions ho gaye. Agla kadam (jab aap kaho): Customer App ka pura clickable demo banana.

---

## 5. CUSTOMER APP DEMO — PROGRESS (clickable demo, no backend)
- [x] **Step 1: Naam SARVOTTAM** — title, comments, top-bar pe brand "SARVOTTAM" dikhaya
- [x] **Step 2: Location Barmer** — top bar default Barmer, location picker mein bhi Barmer active
- [x] **Step 3+4: Emergency fast-flow + Live tracking** — emergency button → "Karigar dhoondh rahe hain"
      (radar) → 3.5s baad Ramesh ne accept kiya → map + Karigar card (call button) → live steps
      (mila → aa raha hai → kaam chalu → poora). Full-screen Rapido-style overlay.
- [x] **FIX (business logic):** "Pahuncha/kaam shuru/kaam poora" buttons USER ke paas NAHI hote —
      ye KARIGAR ki app mein hote hain. User ki screen READ-ONLY hai, status apne aap update hota
      dikhta hai (demo mein auto-timer). Sirf payment user ka action hai. (Rapido/Ola jaisa.)
- [x] **Step 5: Payment screen** — kaam poora → bottom sheet: bill breakdown (service + visit + GST),
      Online (UPI/Card) ya Cash choose, har service ka apna price. Cash/online dono pe alag confirm.
- [x] **Step 6: Rating screen** — payment ke baad: Karigar ko 1-5 ⭐ (tap pe glow + word),
      quick feedback chips (time pe aaya, achha kaam, etc.), optional text, submit ya skip.
- [ ] (Bonus) "Captain/worker" wording → "Karigar" jahan zaroori

### 🎉 CUSTOMER APP DEMO POORA HO GAYA! (Steps 1-6 done)
Pura emergency flow end-to-end chalta hai: book → Karigar dhoondhna → accept → live tracking
(read-only, auto) → payment (cash/online) → rating. Sab clickable demo (no backend).

### FIX (user feedback):
- [x] **Location pehle** — Book Now → ab pehle address sheet khulti hai (saved Ghar/Office chuno YA
      naya address type karo) + charges dikhte hain (visit + service + approx total) → tabhi "Confirm
      karein & Karigar dhoondhein". Bina address ke Karigar nahi dhoondhega. (Pehle seedha dhoondh raha tha.)
- [x] **Bekaar map hataya** — nakli grid/dashed-line map gaya. Ab saaf teal "on the way" banner
      (🛵 → 🏠, ETA min) + address line. Professional, free.

### GRAPHICS FIX (user feedback — emoji bekaar lag rahe the):
- [x] Saare emoji (🛵🏠⚡📱💵📍 etc.) hata ke proper SVG icon library (sprite) banayi —
      Lucide-style clean line icons. Booking, tracking, payment, rating sab professional.
- [x] Bekaar scooter/dots banner → proper SVG scooter + animated progress route + ghar icon.
- [x] Payment radio buttons, verified shield badge, rating stars — sab SVG.

---

## 6. REACT APP SHURU! (asli product ki neev) 🚀
HTML demo ab "blueprint" ban gaya. Asli app `sarvottam-app/` folder mein React (Vite) se banayi.
- **Stack:** Vite + React + React Router. Node v24, npm 11.
- **Structure:** src/components (Icon, Toast, BottomNav, EmergencyFlow), src/pages (Home,
  Emergency, Placeholder), src/data (services.js — saari demo data ek jagah).
- **Done:** Home (Barmer, search, categories, popular), Emergency page, aur poora EmergencyFlow
  (booking+address+charges → searching → tracking read-only → payment → rating) — ek saaf
  React component (state machine). Saare graphics SVG (Icon component). Build PASS (0 errors).
- **Chalana:** `cd sarvottam-app && npm run dev` → http://localhost:5173/

### Home rich kiya (purane demo jaisa):
- [x] Hero mein MOR (peacock) wapas, photo-based popular cards (Electrician/Plumber/Car Painter),
      "Fast. Reliable. Trusted." Book Now banner (feather), trust stats (1,200+ / 4.8★ / 48hrs).
      Images public/ mein copy ki.

### Profile + animations:
- [x] Profile page — user card, stats, options list (My Bookings/Addresses/Payments/Wishlist/
      Notifications/Support), logout. Header overlap theek kiya.
- [x] GLOBAL professional animations — page entry (fade+slide), staggered cards (riseIn),
      tap feedback (scale), nav pulse. prefers-reduced-motion respected.

### Profile sub-screens — RESEARCH → PLAN → BUILD (sab WORKING):
- [x] Research ki (Urban Company, PhonePe, Swiggy, Zomato ke patterns) phir banaya.
- [x] **AppData store** (Context + localStorage) — data sach mein update hota hai, refresh tak rehta hai.
- [x] **Edit Profile** — avatar, name/phone/email editable, validation, Save (data badalta hai).
- [x] **My Bookings** — Upcoming/Completed/Cancelled tabs, status badges, Track/Rebook.
- [x] **Saved Addresses** — Ghar/Office/Other cards, ADD/EDIT/DELETE sab working (local).
- [x] **Payments & Wallet** — balance card, Add Money (quick + custom, balance badhta hai +
      transaction add hoti hai), payment methods, transaction history.
- [x] **Notifications** — unread highlight, screen chhodte hi sab read ho jaati hain.
- [x] **Help & Support** — contact (call/chat/email) + FAQ accordion.
- [x] SubHeader component (back+title) sabme. Sub-pages pe bottom nav chhupa. Build PASS (53 modules).

### LIVE on Vercel! 🌐
- [x] GitHub (shivamdalal repo) + Vercel pe live. Root dir = sarvottam-app, vercel.json SPA routing.
- [x] Har push pe Vercel khud update karta hai.

### Furniture & Painting pages:
- [x] **Furniture** — category tabs (Bedroom/Kitchen/Office/Living), photo grid (Unsplash),
      wishlist, detail sheet with features + Book This Item.
- [x] **Painting** — service rates (interior/exterior/texture/waterproof per sq.ft),
      style gallery (tabs), Get Free Quote sheet.
- [x] Animations smooth ki (single page fade), profile overlap glitch fix.

### Login & Karigar Registration:
- [x] **Login screen** — app khulte hi aata hai, Phone + OTP (demo OTP = 1234), customer signup
      toggle, peacock branding. Login ke baad Home.
- [x] **Register as Karigar** — alag form: naam, phone, skill (electrician/plumber/etc.), area,
      experience, ID upload (demo), success screen ("team 24-48h mein sampark karegi").
- [x] **Auth gate** — login bina sirf login/register dikhe. Profile se Logout → wapas login.
      localStorage v3 mein auth state.

### AGLA (jab aap kaho):
- Karigar (worker) app — notification, accept, status update, earnings (Phase 2 core idea)
- Ya asli backend (real OTP, database) — Phase 1
- (Customer app ke saare main pages + login ho gaye!)
- My Bookings page (booking history)
- Phir asli backend (login OTP, database, real Karigar matching) — Phase 1
- Baad mein: Karigar app, Admin panel

---

## 3. Current status of existing demo
- Folder mein ek visual prototype hai: `index.html`, `style.css`, `script.js` (naam "CraftConnect").
- 5 screens (Customer-side only): Home, Emergency, Furniture, Painting, Bookings.
- Yeh sirf "dikhne" wala demo hai — koi real backend/login/payment/worker-app nahi.
- Peacock branding images maujood hain.

---

## 4. Build order (jab coding shuru hogi)
- Phase 1: Customer side real (login, services, bookings DB, basic admin)
- Phase 2: Captain App + matching/notification (core idea)
- Phase 3: Payments (Razorpay) + commission split (cash/online)
- Phase 4: Emergency fast-flow + live map tracking + ratings
- Phase 5: Android/iOS apps

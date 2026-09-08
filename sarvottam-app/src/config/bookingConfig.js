// ══════════════════════════════════════════════════════════════
// SARVOTTAM — PRICING & BOOKING CONFIGURATION
// Central configuration for services, issues, prices, time slots & guarantees
// ══════════════════════════════════════════════════════════════

export const PRICING_CONFIG = {
  // Flat visiting & diagnostic inspection fee (applied ONCE per multi-service cart)
  visitCharge: 99,

  // GST rate on total estimate (5%)
  gstPct: 0.05,

  // Service catalogs with detailed issues and pricing
  serviceEstimates: {
    electrician: {
      id: 'electrician',
      name: 'Electrician',
      photo: '/electrician-card.jpg',
      badgeIcon: 'bolt',
      defaultProblem: 'Complete Diagnosis & Inspection',
      issues: [
        {
          id: 'diag',
          label: 'Diagnostic Inspection & Quote',
          desc: 'Doorstep inspection, voltage check & upfront quote before work starts',
          priceType: 'fixed',
          price: 149,
          displayPrice: '₹149',
          recommended: true,
        },
        {
          id: 'switch',
          label: 'Switchboard / Socket Issue',
          desc: 'Sparking, broken switch, loose connection or socket replacement',
          priceType: 'estimate',
          minPrice: 199,
          maxPrice: 399,
          displayPrice: '₹199–₹399',
        },
        {
          id: 'fan',
          label: 'Ceiling / Exhaust Fan Repair',
          desc: 'Noise, capacitor replacement, speed issue or new fan installation',
          priceType: 'estimate',
          minPrice: 249,
          maxPrice: 499,
          displayPrice: '₹249–₹499',
        },
        {
          id: 'mcb',
          label: 'MCB / Fuse Frequent Tripping',
          desc: 'Short circuit tracing, overload check or circuit breaker change',
          priceType: 'estimate',
          minPrice: 349,
          maxPrice: 699,
          displayPrice: '₹349–₹699',
        },
        {
          id: 'wiring',
          label: 'Inverter & House Wiring Check',
          desc: 'Inverter connection, voltage fluctuation check & wire replacement',
          priceType: 'estimate',
          minPrice: 499,
          maxPrice: 899,
          displayPrice: '₹499–₹899',
        },
      ],
    },
    ac: {
      id: 'ac',
      name: 'AC Repair',
      photo: '/ac-repair-card.jpg',
      badgeIcon: 'fan',
      defaultProblem: 'Complete Diagnosis & Inspection',
      issues: [
        {
          id: 'diag',
          label: 'Diagnostic Inspection & Quote',
          desc: 'Comprehensive cooling test, gas pressure & electrical diagnostic',
          priceType: 'fixed',
          price: 199,
          displayPrice: '₹199',
          recommended: true,
        },
        {
          id: 'service',
          label: 'Power Jet Deep Clean Servicing',
          desc: 'Indoor & outdoor high-pressure wash, tray cleaning, filter sanitize',
          priceType: 'fixed',
          price: 499,
          displayPrice: '₹499',
        },
        {
          id: 'cooling',
          label: 'Less / No Cooling Check',
          desc: 'Gas leak inspection, capacitor check & compressor diagnosis',
          priceType: 'estimate',
          minPrice: 599,
          maxPrice: 1499,
          displayPrice: '₹599–₹1,499',
        },
        {
          id: 'leakage',
          label: 'Indoor Water Leakage Repair',
          desc: 'Drain pipe unclogging, coil tray adjustment & leak prevention',
          priceType: 'estimate',
          minPrice: 399,
          maxPrice: 699,
          displayPrice: '₹399–₹699',
        },
        {
          id: 'install',
          label: 'AC Uninstallation / Installation',
          desc: 'Safe gas lock, bracket mounting, copper piping fitting & testing',
          priceType: 'estimate',
          minPrice: 799,
          maxPrice: 1499,
          displayPrice: '₹799–₹1,499',
        },
      ],
    },
    plumber: {
      id: 'plumber',
      name: 'Plumber',
      photo: '/plumber-card.jpg',
      badgeIcon: 'droplet',
      defaultProblem: 'Complete Diagnosis & Inspection',
      issues: [
        {
          id: 'diag',
          label: 'Diagnostic Inspection & Quote',
          desc: 'Inspection of hidden leakages, water lines & sanitary fittings',
          priceType: 'fixed',
          price: 149,
          displayPrice: '₹149',
          recommended: true,
        },
        {
          id: 'tap',
          label: 'Tap / Mixer Repair & Installation',
          desc: 'Dripping tap, spindle change, mixer replacement or new installation',
          priceType: 'estimate',
          minPrice: 199,
          maxPrice: 399,
          displayPrice: '₹199–₹399',
        },
        {
          id: 'blockage',
          label: 'Drain & Pipe Blockage Removal',
          desc: 'Kitchen sink, washbasin or bathroom drain clearing with tools',
          priceType: 'estimate',
          minPrice: 349,
          maxPrice: 699,
          displayPrice: '₹349–₹699',
        },
        {
          id: 'flush',
          label: 'Flush Tank / Cistern Repair',
          desc: 'Water overflow, siphon kit replacement & inlet valve repair',
          priceType: 'estimate',
          minPrice: 299,
          maxPrice: 549,
          displayPrice: '₹299–₹549',
        },
        {
          id: 'motor',
          label: 'Water Motor / Pump Issue',
          desc: 'Air lock release, pipe connection, noise check or capacitor fix',
          priceType: 'estimate',
          minPrice: 449,
          maxPrice: 849,
          displayPrice: '₹449–₹849',
        },
      ],
    },
    carpenter: {
      id: 'carpenter',
      name: 'Carpenter',
      photo: '/carpainter.png',
      badgeIcon: 'hammer',
      defaultProblem: 'Complete Diagnosis & Inspection',
      issues: [
        {
          id: 'diag',
          label: 'Diagnostic Inspection & Quote',
          desc: 'Door, lock, hinge, drawer or wooden furniture inspection',
          priceType: 'fixed',
          price: 149,
          displayPrice: '₹149',
          recommended: true,
        },
        {
          id: 'lock',
          label: 'Door Lock / Handle Repair & Change',
          desc: 'Jammed lock, cylinder replacement, new latch & handle fitting',
          priceType: 'estimate',
          minPrice: 249,
          maxPrice: 499,
          displayPrice: '₹249–₹499',
        },
        {
          id: 'hinge',
          label: 'Hinges, Channels & Drawer Fix',
          desc: 'Loose cabinet door, hydraulic channel change & slider realignment',
          priceType: 'estimate',
          minPrice: 299,
          maxPrice: 599,
          displayPrice: '₹299–₹599',
        },
        {
          id: 'assembly',
          label: 'Bed / Wardrobe Assembly & Repair',
          desc: 'Dismantling, fitting, drawer repair or wooden reinforcement',
          priceType: 'estimate',
          minPrice: 499,
          maxPrice: 999,
          displayPrice: '₹499–₹999',
        },
      ],
    },
    painter: {
      id: 'painter',
      name: 'Painter',
      photo: '/ac-repair-card.jpg',
      badgeIcon: 'roller',
      defaultProblem: 'Complete Diagnosis & Inspection',
      issues: [
        {
          id: 'diag',
          label: 'Diagnostic Inspection & Quote',
          desc: 'Wall dampness/seepage inspection, surface check & estimate',
          priceType: 'fixed',
          price: 149,
          displayPrice: '₹149',
          recommended: true,
        },
        {
          id: 'touchup',
          label: 'Wall Touch-up & Patch Painting',
          desc: 'Seepage scraping, putty filling & matching color application',
          priceType: 'estimate',
          minPrice: 499,
          maxPrice: 999,
          displayPrice: '₹499–₹999',
        },
        {
          id: 'room',
          label: '1 Room Painting (Walls & Ceiling)',
          desc: 'Surface preparation, primer, 2 coats premium emulsion paint',
          priceType: 'estimate',
          minPrice: 1999,
          maxPrice: 3499,
          displayPrice: '₹1,999–₹3,499',
        },
        {
          id: 'door',
          label: 'Door & Window Polish / Paint',
          desc: 'Sanding, wood primer, PU coat or enamel paint application',
          priceType: 'estimate',
          minPrice: 499,
          maxPrice: 899,
          displayPrice: '₹499–₹899',
        },
      ],
    },
  },
};

// 4-Step Transparency Guarantee (Rendered ONCE per booking summary)
export const TRANSPARENCY_STEPS = [
  {
    step: 1,
    title: 'Verified Technician Doorstep Inspection',
    desc: 'A verified, background-checked professional visits your doorstep to conduct a full diagnostic inspection.',
  },
  {
    step: 2,
    title: 'Upfront Spare Parts Estimate',
    desc: 'If any spare parts are required, you receive a transparent estimate with warranty details before work begins.',
  },
  {
    step: 3,
    title: 'Work Commences After Your Approval',
    desc: 'Repairs only start after you approve the final price. Payment is due only after satisfactory job completion.',
  },
  {
    step: 4,
    title: 'Fair & Flat-Rate Pricing Guarantee',
    desc: 'Minor repairs follow standard flat rates. The standard visiting fee (₹' + PRICING_CONFIG.visitCharge + ') applies only if you decline the repair estimate.',
  },
];

// Structured Slot Groups (Subah 8–12 / Dopahar 12–4 / Shaam 4–8)
export const SLOT_GROUPS = [
  {
    id: 'morning',
    label: 'Morning (8:00 AM – 12:00 PM)',
    timeRange: '8:00 AM – 12:00 PM',
    slots: [
      { id: '08_10', time: '08:00 AM – 10:00 AM', available: true },
      { id: '10_12', time: '10:00 AM – 12:00 PM', available: true },
    ],
  },
  {
    id: 'afternoon',
    label: 'Afternoon (12:00 PM – 04:00 PM)',
    timeRange: '12:00 PM – 04:00 PM',
    slots: [
      { id: '12_02', time: '12:00 PM – 02:00 PM', available: true },
      { id: '02_04', time: '02:00 PM – 04:00 PM', available: true },
    ],
  },
  {
    id: 'evening',
    label: 'Evening (04:00 PM – 08:00 PM)',
    timeRange: '04:00 PM – 08:00 PM',
    slots: [
      { id: '04_06', time: '04:00 PM – 06:00 PM', available: true },
      { id: '06_08', time: '06:00 PM – 08:00 PM', available: false, fullNote: 'Slot Full' },
    ],
  },
];

// Default Saved Addresses for Fast 1-Tap Selection
export const DEFAULT_SAVED_ADDRESSES = [
  {
    id: 'home',
    label: 'Home',
    icon: 'home',
    area: 'Indra Colony',
    fullText: '12, Indra Colony, Near Water Tank, Barmer, Rajasthan',
    lat: 25.7532,
    lng: 71.3965,
  },
  {
    id: 'office',
    label: 'Office',
    icon: 'building',
    area: 'Station Road',
    fullText: 'Shop 4, First Floor, Station Road, Barmer, Rajasthan',
    lat: 25.7511,
    lng: 71.4012,
  },
];

// ══════════════════════════════════════════════════════════════
// SARVOTTAM — BOOKING WIZARD CONFIG & PRICING
// Edit prices, time slots, and transparency guarantees here.
// ══════════════════════════════════════════════════════════════

export const PRICING_CONFIG = {
  // Flat visiting & diagnostic inspection fee (applied ONCE per cart)
  visitCharge: 99,

  // GST rate on total estimate (5%)
  gstPct: 0.05,

  // Service price estimates (min & max ranges)
  serviceEstimates: {
    electrician: {
      id: 'electrician',
      name: 'Electrician',
      minPrice: 350,
      maxPrice: 550,
      photo: '/electrician-card.jpg',
      badgeIcon: 'bolt',
      defaultProblem: 'Wiring, switchboard, MCB trip or appliance issue',
      attributeOptions: [
        'Switchboard Spark',
        'Ceiling Fan',
        'MCB Trip',
        'Inverter Wiring',
        'Socket Fitting',
      ],
    },
    ac: {
      id: 'ac',
      name: 'AC Repair',
      minPrice: 500,
      maxPrice: 850,
      photo: '/ac-repair-card.jpg',
      badgeIcon: 'fan',
      defaultProblem: 'Servicing, cooling check, water leak or gas inspection',
      attributeOptions: [
        'Not Cooling',
        'Water Leakage',
        'Deep Clean Service',
        'Uninstallation',
        'Compressor Noise',
      ],
    },
    plumber: {
      id: 'plumber',
      name: 'Plumber',
      minPrice: 300,
      maxPrice: 500,
      photo: '/plumber-card.jpg',
      badgeIcon: 'droplet',
      defaultProblem: 'Pipe leakage, tap fitting, flush or bathroom repair',
      attributeOptions: [
        'Continuous Tap Leak',
        'Pipe Blockage',
        'Water Motor',
        'Flush Repair',
        'Basin Fitting',
      ],
    },
    carpenter: {
      id: 'carpenter',
      name: 'Carpenter',
      minPrice: 400,
      maxPrice: 650,
      photo: '/carpainter.png',
      badgeIcon: 'hammer',
      defaultProblem: 'Door lock, hinge fix, bed or furniture repair',
      attributeOptions: [
        'Door Lock Jammed',
        'Broken Hinge',
        'Bed Assembly',
        'Cupboard Slider',
        'Woodwork Fix',
      ],
    },
    painter: {
      id: 'painter',
      name: 'Painter',
      minPrice: 450,
      maxPrice: 750,
      photo: '/ac-repair-card.jpg',
      badgeIcon: 'roller',
      defaultProblem: 'Wall touch-up, seepage treatment or room painting',
      attributeOptions: [
        'Seepage Touch-up',
        '1 Room Fresh Paint',
        'Door Polish',
        'Exterior Painting',
      ],
    },
  },
};

// 4-Step Transparency Guarantee (Rendered ONCE per booking summary)
export const TRANSPARENCY_STEPS = [
  {
    step: 1,
    title: 'Verified Karigar Doorstep Inspection',
    desc: 'Verified aur background-checked Karigar aapke doorstep par aakar pehle poora inspection aur diagnosis karega.',
  },
  {
    step: 2,
    title: 'Spare Part Pehle Estimate',
    desc: 'Agar kisi spare part ki zaroorat hui, toh kaam shuru hone se pehle part price aur warranty ka transparent estimate diya jayega.',
  },
  {
    step: 3,
    title: 'Aapki Approval ke Baad Kaam',
    desc: 'Aapke rate approve karne ke baad hi repair kaam shuru hoga. Payment kaam santoshjanak poora hone par hi li jayegi.',
  },
  {
    step: 4,
    title: 'Fair Pricing Guarantee',
    desc: 'Minor fix ka standard flat rate hota hai. Visit charge (₹' + PRICING_CONFIG.visitCharge + ') sirf tab lagta hai agar aap inspection ke baad repair estimate approve nahi karte.',
  },
];

// Structured Slot Groups (Subah / Dopahar / Shaam)
export const SLOT_GROUPS = [
  {
    id: 'morning',
    label: 'Subah',
    timeRange: '8:00 AM – 12:00 PM',
    slots: [
      { id: '08_10', time: '08:00 AM – 10:00 AM', available: true },
      { id: '10_12', time: '10:00 AM – 12:00 PM', available: true },
    ],
  },
  {
    id: 'afternoon',
    label: 'Dopahar',
    timeRange: '12:00 PM – 04:00 PM',
    slots: [
      { id: '12_02', time: '12:00 PM – 02:00 PM', available: true },
      { id: '02_04', time: '02:00 PM – 04:00 PM', available: true },
    ],
  },
  {
    id: 'evening',
    label: 'Shaam',
    timeRange: '04:00 PM – 08:00 PM',
    slots: [
      { id: '04_06', time: '04:00 PM – 06:00 PM', available: true },
      { id: '06_08', time: '06:00 PM – 08:00 PM', available: false, fullNote: 'Slot Full' },
    ],
  },
];

// Default Rajasthan Saved Addresses for Fast 1-Tap Selection
export const DEFAULT_SAVED_ADDRESSES = [
  {
    id: 'ghar',
    label: 'Ghar',
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

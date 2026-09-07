// ══════════════════════════════════════════════════════════════
// SARVOTTAM — BOOKING WIZARD CONFIG & PRICING
// Central configuration for prices, time slots, and transparency guarantees.
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
      defaultProblem: 'Wiring, switchboard, MCB trip or appliance repair',
      attributeOptions: [
        'Switchboard Spark',
        'Ceiling Fan Fix',
        'MCB Tripping',
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
      defaultProblem: 'Servicing, cooling check, water leak or gas refill',
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
        'Water Motor Issue',
        'Flush Tank Repair',
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
      defaultProblem: 'Door lock, hinge repair, bed or furniture assembly',
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

// Structured Slot Groups (Morning / Afternoon / Evening)
export const SLOT_GROUPS = [
  {
    id: 'morning',
    label: 'Morning',
    timeRange: '8:00 AM – 12:00 PM',
    slots: [
      { id: '08_10', time: '08:00 AM – 10:00 AM', available: true },
      { id: '10_12', time: '10:00 AM – 12:00 PM', available: true },
    ],
  },
  {
    id: 'afternoon',
    label: 'Afternoon',
    timeRange: '12:00 PM – 04:00 PM',
    slots: [
      { id: '12_02', time: '12:00 PM – 02:00 PM', available: true },
      { id: '02_04', time: '02:00 PM – 04:00 PM', available: true },
    ],
  },
  {
    id: 'evening',
    label: 'Evening',
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

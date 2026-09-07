import { createContext, useContext, useState, useEffect } from 'react';
import { signUp, signIn, signOutUser, watchAuth, fetchProfile } from '../services/auth';

const AppDataContext = createContext(null);
export const useAppData = () => useContext(AppDataContext);

// Seed bookings matching the status-based admin-progressed marketplace spec
const DEFAULT_BOOKINGS = [
  {
    id: 'CP849201',
    service: 'Electrician',
    subService: 'Complete Diagnosis & Inspection',
    icon: 'bolt',
    status: 'PROCESSING', // PROCESSING, CONFIRMED, COMPLETED, CANCELLED
    date: 'Today, 8 Jun 2026',
    slot: '08:00 AM – 10:00 AM',
    city: 'Barmer',
    addressArea: 'Indra Colony',
    address: '12, Indra Colony, Near Water Tank, Barmer, Rajasthan',
    customer: {
      name: 'Shivam Singh',
      phone: '9876543210',
      notes: 'Please call at main gate before entering',
    },
    services: [
      {
        id: 'electrician',
        name: 'Electrician',
        issue: 'Problem pata nahi? Complete Diagnosis',
        price: '₹149',
        minPrice: 149,
        maxPrice: 149,
      },
    ],
    estimate: {
      visitCharge: 99,
      laborMin: 149,
      laborMax: 149,
      gstMin: 12,
      gstMax: 12,
      totalMin: 260,
      totalMax: 260,
      savings: 0,
    },
    amount: 260,
    karigar: null,
    timeline: [
      { status: 'PROCESSING', title: 'Booking Placed', desc: 'Assigned to SARVOTTAM operations desk', time: '10 mins ago', done: true },
      { status: 'CONFIRMED', title: 'Karigar Assignment', desc: 'Platform assigning verified technician', time: 'In progress', done: false },
      { status: 'IN_PROGRESS', title: 'Doorstep Inspection', desc: 'Technician reaches address on time', time: 'Pending', done: false },
      { status: 'COMPLETED', title: 'Work Done & Final Bill', desc: 'Payment after complete satisfaction', time: 'Pending', done: false },
    ],
  },
  {
    id: 'CP712849',
    service: 'AC Repair',
    subService: 'Power Jet Deep Clean Servicing',
    icon: 'fan',
    status: 'CONFIRMED',
    date: 'Tomorrow, 9 Jun 2026',
    slot: '12:00 PM – 02:00 PM',
    city: 'Barmer',
    addressArea: 'Station Road',
    address: 'Shop 4, First Floor, Station Road, Barmer, Rajasthan',
    customer: {
      name: 'Shivam Singh',
      phone: '9876543210',
      notes: '',
    },
    services: [
      {
        id: 'ac',
        name: 'AC Repair',
        issue: 'Power Jet Deep Clean Servicing',
        price: '₹499',
        minPrice: 499,
        maxPrice: 499,
      },
    ],
    estimate: {
      visitCharge: 99,
      laborMin: 499,
      laborMax: 499,
      gstMin: 30,
      gstMax: 30,
      totalMin: 628,
      totalMax: 628,
      savings: 0,
    },
    amount: 628,
    karigar: {
      name: 'Dinesh Jain',
      phone: '+91 94140 88214',
      skill: 'AC Repair Specialist',
      area: 'Station Road, Barmer',
      rating: 4.9,
      jobsDone: 420,
    },
    timeline: [
      { status: 'PROCESSING', title: 'Booking Placed', desc: 'Received by operations', time: 'Yesterday', done: true },
      { status: 'CONFIRMED', title: 'Technician Assigned', desc: 'Dinesh Jain allocated for this job', time: '2 hrs ago', done: true },
      { status: 'IN_PROGRESS', title: 'Doorstep Inspection', desc: 'Scheduled for 12:00 PM slot', time: 'Pending', done: false },
      { status: 'COMPLETED', title: 'Work Done & Final Bill', desc: 'Payment after complete satisfaction', time: 'Pending', done: false },
    ],
  },
  {
    id: 'CP554910',
    service: 'Plumber',
    subService: 'Tap / Mixer Repair & Installation',
    icon: 'droplet',
    status: 'COMPLETED',
    date: '28 May 2026',
    slot: '04:00 PM – 06:00 PM',
    city: 'Barmer',
    addressArea: 'Indra Colony',
    address: '12, Indra Colony, Near Water Tank, Barmer, Rajasthan',
    customer: {
      name: 'Shivam Singh',
      phone: '9876543210',
      notes: '',
    },
    services: [
      {
        id: 'plumber',
        name: 'Plumber',
        issue: 'Tap / Mixer Repair & Installation',
        price: '₹199–₹399',
        minPrice: 199,
        maxPrice: 399,
      },
    ],
    estimate: {
      visitCharge: 99,
      laborMin: 199,
      laborMax: 399,
      gstMin: 15,
      gstMax: 25,
      totalMin: 313,
      totalMax: 523,
      savings: 0,
    },
    amount: 420,
    karigar: {
      name: 'Suresh Mali',
      phone: '+91 94140 12345',
      skill: 'Plumbing Specialist',
      area: 'Barmer City',
      rating: 4.8,
      jobsDone: 310,
    },
    timeline: [
      { status: 'PROCESSING', title: 'Booking Placed', desc: 'Received by operations', time: '28 May', done: true },
      { status: 'CONFIRMED', title: 'Technician Assigned', desc: 'Suresh Mali assigned', time: '28 May', done: true },
      { status: 'IN_PROGRESS', title: 'Doorstep Inspection', desc: 'Diagnosis & repair completed', time: '28 May', done: true },
      { status: 'COMPLETED', title: 'Job Completed', desc: 'Paid ₹420 via UPI with 30-day warranty', time: '28 May', done: true },
    ],
  },
  {
    id: 'CP391048',
    service: 'Carpenter',
    subService: 'Door Lock / Handle Repair',
    icon: 'hammer',
    status: 'CANCELLED',
    date: '20 May 2026',
    slot: '10:00 AM – 12:00 PM',
    city: 'Barmer',
    addressArea: 'Station Road',
    address: 'Shop 4, First Floor, Station Road, Barmer, Rajasthan',
    customer: {
      name: 'Shivam Singh',
      phone: '9876543210',
      notes: '',
    },
    services: [
      {
        id: 'carpenter',
        name: 'Carpenter',
        issue: 'Door Lock / Handle Repair & Change',
        price: '₹249–₹499',
        minPrice: 249,
        maxPrice: 499,
      },
    ],
    estimate: {
      visitCharge: 99,
      laborMin: 249,
      laborMax: 499,
      gstMin: 17,
      gstMax: 30,
      totalMin: 365,
      totalMax: 628,
      savings: 0,
    },
    amount: 0,
    karigar: null,
    timeline: [
      { status: 'PROCESSING', title: 'Booking Placed', desc: 'Received by operations', time: '20 May', done: true },
      { status: 'CANCELLED', title: 'Cancelled by User', desc: 'User rescheduled appointment', time: '20 May', done: true },
    ],
  },
];

const DEFAULTS = {
  user: {
    name: 'Shivam Singh',
    phone: '9876543210',
    email: 'shivam@sarvottam.in',
  },
  karigar: null,
  cart: [],
  myReviews: {},
  addresses: [
    { id: 'a1', label: 'Ghar',   icon: 'home',     full: '12, Indra Colony, Barmer, Rajasthan 344001' },
    { id: 'a2', label: 'Office', icon: 'building', full: 'Shop 4, Station Road, Barmer, Rajasthan 344001' },
  ],
  bookings: DEFAULT_BOOKINGS,
  wallet: {
    balance: 250,
    methods: [
      { id: 'm1', type: 'upi',  label: 'UPI', sub: 'shivam@okaxis' },
      { id: 'm2', type: 'card', label: 'HDFC Card', sub: '•••• 4521' },
    ],
    transactions: [
      { id: 't1', title: 'AC Repair payment',  date: '2 Jun 2026',  amount: -680, type: 'debit' },
      { id: 't2', title: 'Wallet top-up',      date: '1 Jun 2026',  amount: 500,  type: 'credit' },
      { id: 't3', title: 'Plumber payment',    date: '28 May 2026', amount: -420, type: 'debit' },
      { id: 't4', title: 'Referral bonus',     date: '25 May 2026', amount: 100,  type: 'credit' },
    ],
  },
  notifications: [
    { id: 'n1', icon: 'bolt',     title: 'Booking Confirmed',   msg: 'Your booking CP849201 is in processing. Platform will assign a verified technician shortly.',  time: '2 min ago', unread: true },
    { id: 'n2', icon: 'card',     title: '₹100 Cashback Received', msg: '₹100 referral bonus credited to your wallet balance.', time: '1 hr ago',  unread: true },
    { id: 'n3', icon: 'star',     title: 'Rate your service',   msg: 'How was your Plumber service? Share your rating with us.',     time: 'Yesterday', unread: false },
    { id: 'n4', icon: 'bell',     title: 'Monsoon Offer',       msg: '20% off on all Painting services this week.',            time: '2 days ago',unread: false },
  ],
};

const KEY = 'sarvottam_data_v8';

function load() {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved) return { ...DEFAULTS, ...JSON.parse(saved) };
  } catch { /* ignore */ }
  return DEFAULTS;
}

function buildUser(profile) {
  return {
    name: ((profile.name || '') + ' ' + (profile.surname || '')).trim() || 'Shivam Singh',
    email: profile.email || 'shivam@sarvottam.in',
    phone: profile.phone ? '+91 ' + profile.phone : '9876543210',
  };
}

function buildKarigar(profile, prev) {
  if (prev) return prev;
  return {
    name: ((profile.name || '') + ' ' + (profile.surname || '')).trim(),
    phone: profile.phone || '',
    skill: profile.skill || 'Electrician',
    area: profile.area || 'Barmer',
    exp: profile.exp || '',
    rating: 5.0, online: false, todayEarn: 0, totalEarn: 0, balance: 0, jobsDone: 0, history: [],
  };
}

export function AppDataProvider({ children }) {
  const [data, setData] = useState(load);
  const [auth, setAuth] = useState({ loggedIn: false, role: null });
  const [authReady, setAuthReady] = useState(false);
  const [needsVerify, setNeedsVerify] = useState(false);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* ignore */ }
  }, [data]);

  useEffect(() => {
    const unsub = watchAuth(async (fbUser) => {
      if (fbUser) {
        const profile = await fetchProfile(fbUser.uid);
        if (profile) {
          setData((d) => ({
            ...d,
            user: buildUser(profile),
            karigar: profile.role === 'karigar' ? buildKarigar(profile, d.karigar) : d.karigar,
          }));
          setAuth({ loggedIn: true, role: profile.role });
        } else {
          setAuth({ loggedIn: true, role: null });
        }
      } else {
        setAuth({ loggedIn: false, role: null });
      }
      setAuthReady(true);
    });
    return unsub;
  }, []);

  const api = {
    ...data,
    auth,
    authReady,
    needsVerify,
    verifyEmailDone: () => setNeedsVerify(false),

    login: async (identifier, password) => {
      const id = identifier.trim();
      if (!id.includes('@')) {
        return { ok: false, error: 'Please log in with your email address' };
      }
      const res = await signIn(id.toLowerCase(), password);
      if (!res.ok) return { ok: false, error: res.error };
      const role = res.profile?.role || null;
      if (res.profile) {
        setData((d) => ({
          ...d,
          user: buildUser(res.profile),
          karigar: role === 'karigar' ? buildKarigar(res.profile, d.karigar) : d.karigar,
        }));
      }
      setAuth({ loggedIn: true, role });
      return { ok: true, role };
    },

    signupCustomer: async (acc) => {
      const res = await signUp(acc.email.toLowerCase(), acc.password, {
        role: 'customer', name: acc.name, surname: acc.surname, phone: acc.phone,
      });
      if (!res.ok) return { ok: false, error: res.error };
      setData((d) => ({ ...d, user: buildUser(res.profile) }));
      setNeedsVerify(true);
      setAuth({ loggedIn: true, role: 'customer' });
      return { ok: true };
    },

    registerKarigar: async (k) => {
      const res = await signUp(k.email.toLowerCase(), k.password, {
        role: 'karigar', name: k.name, surname: k.surname, phone: k.phone,
        skill: k.skill, area: k.area, exp: k.exp,
      });
      if (!res.ok) return { ok: false, error: res.error };
      setData((d) => ({ ...d, karigar: buildKarigar(res.profile, null) }));
      setAuth({ loggedIn: true, role: 'karigar' });
      return { ok: true };
    },

    logout: async () => {
      await signOutUser();
      setNeedsVerify(false);
      setAuth({ loggedIn: false, role: null });
    },

    setKarigarOnline: (on) => setData((d) => ({ ...d, karigar: { ...d.karigar, online: on } })),

    karigarCompleteJob: (job, gross, net, payMode) => setData((d) => ({
      ...d,
      karigar: {
        ...d.karigar,
        todayEarn: (d.karigar.todayEarn || 0) + net,
        totalEarn: (d.karigar.totalEarn || 0) + net,
        balance: (d.karigar.balance || 0) + net,
        jobsDone: (d.karigar.jobsDone || 0) + 1,
        history: [
          { id: 'j' + Date.now(), service: job.service, area: job.area, gross, net, payMode,
            date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + ', ' +
                  new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            rating: 5 },
          ...(d.karigar.history || []),
        ],
      },
    })),

    karigarWithdraw: () => setData((d) => ({ ...d, karigar: { ...d.karigar, balance: 0 } })),

    // Add structured booking to store
    addBooking: (bookingObj) => {
      const b = {
        id: bookingObj.id || ('CP' + Math.floor(100000 + Math.random() * 900000)),
        status: bookingObj.status || 'PROCESSING',
        date: bookingObj.date || todayStr(),
        slot: bookingObj.slot || '08:00 AM – 10:00 AM',
        service: bookingObj.service || (bookingObj.services?.[0]?.name || 'Home Service'),
        subService: bookingObj.subService || (bookingObj.services?.[0]?.issue || 'Doorstep Service'),
        icon: bookingObj.icon || (bookingObj.services?.[0]?.id === 'ac' ? 'fan' : bookingObj.services?.[0]?.id === 'plumber' ? 'droplet' : bookingObj.services?.[0]?.id === 'carpenter' ? 'hammer' : bookingObj.services?.[0]?.id === 'painter' ? 'roller' : 'bolt'),
        city: bookingObj.city || 'Barmer',
        addressArea: bookingObj.addressArea || 'Barmer',
        address: bookingObj.address || 'Doorstep Address, Barmer',
        customer: bookingObj.customer || { name: 'Customer', phone: '9876543210', notes: '' },
        services: bookingObj.services || [],
        estimate: bookingObj.estimate || {
          visitCharge: 99,
          laborMin: 350,
          laborMax: 550,
          gstMin: 22,
          gstMax: 32,
          totalMin: 471,
          totalMax: 681,
          savings: 0,
        },
        amount: bookingObj.estimate?.totalMin || 471,
        karigar: bookingObj.karigar || null,
        timeline: bookingObj.timeline || [
          { status: 'PROCESSING', title: 'Booking Placed', desc: 'Assigned to platform operations desk', time: 'Just now', done: true },
          { status: 'CONFIRMED', title: 'Karigar Assignment', desc: 'Platform assigning verified technician', time: 'In progress', done: false },
          { status: 'IN_PROGRESS', title: 'Doorstep Inspection', desc: 'Technician reaches address on time', time: 'Pending', done: false },
          { status: 'COMPLETED', title: 'Work Done & Final Bill', desc: 'Payment after complete satisfaction', time: 'Pending', done: false },
        ],
      };

      setData((d) => ({
        ...d,
        bookings: [b, ...d.bookings],
        notifications: [
          {
            id: 'n_' + Date.now(),
            icon: b.icon,
            title: 'Booking Placed (' + b.id + ')',
            msg: 'Your ' + b.service + ' booking is in processing. Platform will assign a verified technician.',
            time: 'Just now',
            unread: true,
          },
          ...d.notifications,
        ],
      }));

      return b;
    },

    addToCart: (item) => setData((d) => ({ ...d, cart: [...d.cart, item] })),
    removeFromCart: (id) => setData((d) => ({ ...d, cart: d.cart.filter((c) => c.id !== id) })),
    addReview: (productId, review) => setData((d) => ({
      ...d,
      myReviews: { ...d.myReviews, [productId]: [review, ...(d.myReviews[productId] || [])] },
    })),

    updateUser: (patch) => setData((d) => ({ ...d, user: { ...d.user, ...patch } })),

    addAddress: (addr) =>
      setData((d) => ({ ...d, addresses: [...d.addresses, { ...addr, id: 'a' + Date.now() }] })),
    updateAddress: (id, patch) =>
      setData((d) => ({ ...d, addresses: d.addresses.map((a) => (a.id === id ? { ...a, ...patch } : a)) })),
    deleteAddress: (id) =>
      setData((d) => ({ ...d, addresses: d.addresses.filter((a) => a.id !== id) })),

    addMoney: (amt) =>
      setData((d) => ({
        ...d,
        wallet: {
          ...d.wallet,
          balance: d.wallet.balance + amt,
          transactions: [
            { id: 't' + Date.now(), title: 'Wallet top-up', date: todayStr(), amount: amt, type: 'credit' },
            ...d.wallet.transactions,
          ],
        },
      })),

    markNotifsRead: () =>
      setData((d) => ({ ...d, notifications: d.notifications.map((n) => ({ ...n, unread: false })) })),

    resetDemo: () => setData(DEFAULTS),
  };

  return <AppDataContext.Provider value={api}>{children}</AppDataContext.Provider>;
}

function todayStr() {
  return new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

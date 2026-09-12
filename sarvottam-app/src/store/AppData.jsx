import { createContext, useContext, useState, useEffect } from 'react';
import { signUp, signIn, signOutUser, watchAuth, fetchProfile } from '../services/auth';

const AppDataContext = createContext(null);
export const useAppData = () => useContext(AppDataContext);

// No demo bookings — bookings are created real-time by users
const DEFAULT_BOOKINGS = [];

const DEFAULTS = {
  user: {
    name: 'Shivam Singh',
    phone: '9876543210',
    email: 'shivam@sarvottam.in',
    avatar: null,
  },
  karigar: null,
  cart: [],
  myReviews: {},
  addresses: [
    { id: 'a1', label: 'Ghar',   icon: 'home',     full: '12, Indra Colony, Barmer, Rajasthan 344001' },
    { id: 'a2', label: 'Office', icon: 'building', full: 'Shop 4, Station Road, Barmer, Rajasthan 344001' },
  ],
  bookings: [],
  wallet: {
    balance: 250,
    methods: [
      { id: 'm1', type: 'upi',  label: 'UPI', sub: 'shivam@okaxis' },
      { id: 'm2', type: 'card', label: 'HDFC Card', sub: '•••• 4521' },
    ],
    transactions: [
      { id: 't2', title: 'Wallet top-up',  date: '1 Jun 2026',  amount: 500,  type: 'credit' },
      { id: 't4', title: 'Referral bonus', date: '25 May 2026', amount: 100,  type: 'credit' },
    ],
  },
  notifications: [
    { id: 'n2', icon: 'card', title: '₹100 Cashback Received', msg: '₹100 referral bonus credited to your wallet balance.', time: '1 hr ago', unread: true },
    { id: 'n4', icon: 'bell', title: 'Monsoon Offer',          msg: '20% off on all Painting services this week.',          time: '2 days ago', unread: false },
  ],
};

const KEY = 'sarvottam_data_v10';

const DEMO_BOOKING_IDS = new Set(['CP849201', 'CP712849', 'CP554910', 'CP391048']);

function load() {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const cleanBookings = Array.isArray(parsed.bookings)
        ? parsed.bookings.filter((b) => !DEMO_BOOKING_IDS.has(b.id))
        : [];
      return { ...DEFAULTS, ...parsed, bookings: cleanBookings };
    }
  } catch { /* ignore */ }
  return DEFAULTS;
}

function buildUser(profile, prev) {
  return {
    name: ((profile?.name || '') + ' ' + (profile?.surname || '')).trim() || prev?.name || 'Shivam Singh',
    email: profile?.email || prev?.email || 'shivam@sarvottam.in',
    phone: profile?.phone ? '+91 ' + profile.phone : (prev?.phone || '9876543210'),
    avatar: profile?.avatar || profile?.photoURL || prev?.avatar || null,
  };
}

function buildKarigar(profile, prev) {
  if (prev) {
    return {
      ...prev,
      avatar: profile?.avatar || profile?.photoURL || prev?.avatar || null,
      balance: prev.balance !== undefined ? prev.balance : 1450,
      payoutMethods: prev.payoutMethods || { upis: [], banks: [] },
      withdrawals: prev.withdrawals || [],
    };
  }
  return {
    name: ((profile?.name || '') + ' ' + (profile?.surname || '')).trim() || 'Karigar Captain',
    phone: profile?.phone || '9414012345',
    email: profile?.email || 'partner@sarvottam.in',
    skill: profile?.skill || 'Electrician',
    area: profile?.area || 'Barmer',
    exp: profile?.exp || '5',
    avatar: profile?.avatar || profile?.photoURL || null,
    rating: 5.0,
    online: false,
    todayEarn: 450,
    totalEarn: 8650,
    balance: 1450,
    jobsDone: 18,
    history: [],
    payoutMethods: {
      upis: [],
      banks: [],
    },
    withdrawals: [],
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

    karigarWithdraw: (amount, method) => {
      const amt = Math.max(1, Math.round(Number(amount) || 0));
      const tx = {
        id: 'WDR' + Math.floor(100000 + Math.random() * 900000),
        utr: 'UTR' + Math.floor(1000000000 + Math.random() * 9000000000),
        amount: amt,
        method: method || { type: 'bank', detail: 'Bank Account' },
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) + ', ' +
              new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        status: 'SUCCESS',
      };
      setData((d) => {
        const curBal = d.karigar?.balance || 0;
        const newBal = Math.max(0, curBal - amt);
        return {
          ...d,
          karigar: {
            ...d.karigar,
            balance: newBal,
            withdrawals: [tx, ...(d.karigar?.withdrawals || [])],
          },
        };
      });
      return tx;
    },

    saveKarigarPayoutMethod: (type, item) => {
      setData((d) => {
        const methods = d.karigar?.payoutMethods || { upis: [], banks: [] };
        let updated;
        if (type === 'upi') {
          const list = (methods.upis || []).filter((u) => u.id !== item.id);
          updated = { ...methods, upis: [item, ...list] };
        } else {
          const list = (methods.banks || []).filter((b) => b.id !== item.id);
          updated = { ...methods, banks: [item, ...list] };
        }
        return {
          ...d,
          karigar: {
            ...d.karigar,
            payoutMethods: updated,
          },
        };
      });
    },

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
    updateKarigar: (patch) => setData((d) => ({ ...d, karigar: { ...d.karigar, ...patch } })),

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

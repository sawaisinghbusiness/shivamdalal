import { createContext, useContext, useState, useEffect } from 'react';
import { signUp, signIn, signOutUser, watchAuth, fetchProfile } from '../services/auth';

const AppDataContext = createContext(null);
export const useAppData = () => useContext(AppDataContext);

// Persisted, demo-only app data. Auth/identity now comes from Firebase, not here.
const DEFAULTS = {
  user: {
    name: 'Guest',
    phone: '',
    email: '',
  },
  // current karigar profile (set on karigar login / registration)
  karigar: null,
  // shopping cart (furniture / painting items)
  cart: [],
  // product reviews written by this user: { [productId]: [{name, stars, text, date}] }
  myReviews: {},
  addresses: [
    { id: 'a1', label: 'Ghar',   icon: 'home',     full: '12, Indra Colony, Barmer, Rajasthan 344001' },
    { id: 'a2', label: 'Office', icon: 'building', full: 'Shop 4, Station Road, Barmer, Rajasthan 344001' },
  ],
  bookings: [
    { id: 'b1', service: 'Electrician', icon: 'bolt',   karigar: 'Ramesh Kumar', date: '8 Jun 2026, 4:30 PM', amount: 473, status: 'upcoming' },
    { id: 'b2', service: 'AC Repair',   icon: 'snow',   karigar: 'Dinesh Jain',  date: '2 Jun 2026, 11:00 AM', amount: 680, status: 'completed' },
    { id: 'b3', service: 'Plumber',     icon: 'wrench', karigar: 'Suresh Mali',  date: '28 May 2026, 6:00 PM', amount: 420, status: 'completed' },
    { id: 'b4', service: 'Carpenter',   icon: 'wrench', karigar: 'Mahesh Suthar',date: '20 May 2026, 1:00 PM', amount: 0,   status: 'cancelled' },
  ],
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
    { id: 'n1', icon: 'bolt',     title: 'Booking confirmed',   msg: 'Ramesh Kumar aapke Electrician booking pe aa raha hai.', time: '2 min ago', unread: true },
    { id: 'n2', icon: 'card',     title: '₹100 cashback mila!', msg: 'Aapke wallet mein ₹100 referral bonus add hua.',         time: '1 hr ago',  unread: true },
    { id: 'n3', icon: 'star',     title: 'Rate your service',   msg: 'AC Repair kaisa raha? Karigar ko rating dein.',          time: 'Yesterday', unread: false },
    { id: 'n4', icon: 'bell',     title: 'Monsoon offer',       msg: 'Painting pe 20% off — is hafte tak.',                    time: '2 days ago',unread: false },
  ],
};

const KEY = 'sarvottam_data_v7';

function load() {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved) return { ...DEFAULTS, ...JSON.parse(saved) };
  } catch { /* ignore */ }
  return DEFAULTS;
}

// Build the display `user` object from a Firestore profile doc.
function buildUser(profile) {
  return {
    name: `${profile.name || ''} ${profile.surname || ''}`.trim() || 'User',
    email: profile.email || '',
    phone: profile.phone ? '+91 ' + profile.phone : '',
  };
}

// Build a karigar working profile. Keep an existing one (with earnings/history) if present.
function buildKarigar(profile, prev) {
  if (prev) return prev;
  return {
    name: `${profile.name || ''} ${profile.surname || ''}`.trim(),
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
  // true right after a customer signs up — gates the app until email is verified
  const [needsVerify, setNeedsVerify] = useState(false);

  // Persist demo app data.
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* ignore */ }
  }, [data]);

  // Firebase auth subscription — fires on login, logout and every page load.
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
          // Signed in but profile doc missing (interrupted signup).
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

    // Auth — all async, return { ok, error, role }.
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

    // job done: gross = customer paid, net = after SARVOTTAM commission
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

    // bookings (demo order from product page)
    addBookingDemo: (b) => setData((d) => ({
      ...d,
      bookings: [
        { id: 'b' + Date.now(),
          date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) + ', ' +
                new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          ...b },
        ...d.bookings,
      ],
    })),

    // cart & reviews
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

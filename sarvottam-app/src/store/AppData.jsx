import { createContext, useContext, useState, useEffect } from 'react';

const AppDataContext = createContext(null);
export const useAppData = () => useContext(AppDataContext);

const DEFAULTS = {
  // auth.role: null | 'customer' | 'karigar'
  auth: { loggedIn: false, role: null },
  // registered accounts (demo — normally on server)
  accounts: [
    { email: 'demo@sarvottam.com', phone: '9876543210', password: '1234', role: 'customer',
      name: 'Shivam', surname: 'Singh' },
  ],
  user: {
    name: 'Shivam Singh',
    phone: '+91 98765 43210',
    email: 'sawaisinghbusiness@gmail.com',
  },
  // current karigar profile (set on karigar registration)
  karigar: null,
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

const KEY = 'sarvottam_data_v4';

function load() {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved) return { ...DEFAULTS, ...JSON.parse(saved) };
  } catch { /* ignore */ }
  return DEFAULTS;
}

export function AppDataProvider({ children }) {
  const [data, setData] = useState(load);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* ignore */ }
  }, [data]);

  const api = {
    ...data,

    // Auth — returns { ok, error }
    login: (identifier, password) => {
      const id = identifier.trim().toLowerCase();
      const acc = data.accounts.find(
        (a) => (a.email.toLowerCase() === id || a.phone === id.replace(/\D/g, '')) && a.password === password
      );
      if (!acc) return { ok: false, error: 'Email/phone or password is wrong' };
      setData((d) => ({
        ...d,
        auth: { loggedIn: true, role: acc.role },
        user: { ...d.user, name: `${acc.name} ${acc.surname || ''}`.trim(), email: acc.email, phone: '+91 ' + acc.phone },
        karigar: acc.role === 'karigar' ? (d.karigar || { name: `${acc.name} ${acc.surname || ''}`.trim(), phone: acc.phone }) : d.karigar,
      }));
      return { ok: true, role: acc.role };
    },

    signupCustomer: (acc) => {
      const exists = data.accounts.some((a) => a.email.toLowerCase() === acc.email.toLowerCase() || a.phone === acc.phone);
      if (exists) return { ok: false, error: 'Account already exists with this email/phone' };
      setData((d) => ({
        ...d,
        accounts: [...d.accounts, { ...acc, role: 'customer' }],
        auth: { loggedIn: true, role: 'customer' },
        user: { ...d.user, name: `${acc.name} ${acc.surname}`.trim(), email: acc.email, phone: '+91 ' + acc.phone },
      }));
      return { ok: true };
    },

    registerKarigar: (k) => {
      const exists = data.accounts.some((a) => a.phone === k.phone);
      if (exists) return { ok: false, error: 'This phone is already registered' };
      setData((d) => ({
        ...d,
        accounts: [...d.accounts, { email: k.email, phone: k.phone, password: k.password, role: 'karigar', name: k.name, surname: k.surname }],
        auth: { loggedIn: true, role: 'karigar' },
        karigar: { name: `${k.name} ${k.surname}`.trim(), phone: k.phone, skill: k.skill, area: k.area, exp: k.exp, rating: 5.0, online: false, todayEarn: 0, totalEarn: 0, jobsDone: 0 },
      }));
      return { ok: true };
    },

    setKarigarOnline: (on) => setData((d) => ({ ...d, karigar: { ...d.karigar, online: on } })),
    karigarCompleteJob: (amount) => setData((d) => ({
      ...d,
      karigar: { ...d.karigar, todayEarn: d.karigar.todayEarn + amount, totalEarn: d.karigar.totalEarn + amount, jobsDone: d.karigar.jobsDone + 1 },
    })),

    logout: () => setData((d) => ({ ...d, auth: { loggedIn: false, role: null } })),

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

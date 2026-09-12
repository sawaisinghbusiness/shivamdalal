// SARVOTTAM — Services Data

export const EMERGENCY_SERVICES = [
  { id: 'electrician', name: 'Electrician', icon: 'plug',    color: '#E5484D', img: '/electrician.png', desc: 'Quick electrical repair at your doorstep',
    karigar: { name: 'Ramesh Kumar', initial: 'R', rating: 4.8, jobs: 320, eta: 8 },  service: 400 },
  { id: 'plumber',     name: 'Plumber',     icon: 'droplet', color: '#0B6BBF', img: '/plumber.png', desc: 'Leakage, pipe fitting, bathroom & kitchen repair',
    karigar: { name: 'Suresh Mali', initial: 'S', rating: 4.7, jobs: 210, eta: 10 },  service: 350 },
  { id: 'carpenter',   name: 'Carpenter',   icon: 'hammer',  color: '#A05A0B', img: '/carpainter.png', desc: 'Door, hinge fix, lock replacement & woodwork',
    karigar: { name: 'Mahesh Suthar', initial: 'M', rating: 4.9, jobs: 415, eta: 12 }, service: 450 },
  { id: 'ac',          name: 'AC Repair',   icon: 'fan',     color: '#0891B2', img: '/ac-repair.png', desc: 'Installation, repair, servicing & gas refill',
    karigar: { name: 'Dinesh Jain', initial: 'D', rating: 4.6, jobs: 180, eta: 15 },  service: 600 },
];

// Popular services with real photos (Home page)
export const POPULAR = [
  { id: 'electrician', name: 'Electrician', img: '/electrician.png' },
  { id: 'plumber',     name: 'Plumber',     img: '/plumber.png' },
  { id: 'carpainter',  name: 'Carpenter',   img: '/carpainter.png' },
];

// Trust stats (Home rating card)
export const TRUST_STATS = [
  { num: '1,200+', label: 'Happy Clients' },
  { num: '4.8★',   label: 'Avg Rating' },
  { num: '48 hrs', label: 'Avg Delivery' },
];

export const SAVED_ADDRESSES = [
  { id: 'home',   label: 'Home',   icon: 'home',     full: '12, Indra Colony, Barmer' },
  { id: 'office', label: 'Office', icon: 'building', full: 'Shop 4, Station Road, Barmer' },
];

export const VISIT_CHARGE = 99;
export const GST_RATE = 0.05;

export const RAJASTHAN_DISTRICTS = [
  'Barmer', 'Jodhpur', 'Jaipur', 'Ajmer', 'Bikaner', 'Udaipur', 'Kota', 'Jaisalmer',
  'Pali', 'Sirohi', 'Jalore', 'Nagaur', 'Sikar', 'Alwar', 'Bharatpur', 'Bhilwara',
];

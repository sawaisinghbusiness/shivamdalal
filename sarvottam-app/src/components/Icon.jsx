// SARVOTTAM — reusable SVG icons (clean Lucide-style line icons)
// Use: <Icon name="bolt" /> or <Icon name="home" size={20} />

const PATHS = {
  bolt:    <path d="M13 2 4.5 13.5a.5.5 0 0 0 .4.8H11l-1 7.7 8.5-11.5a.5.5 0 0 0-.4-.8H12l1-7.7Z" fill="currentColor" />,
  home:    <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />,
  building:<path d="M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M15 9h2a2 2 0 0 1 2 2v10M8 7h2M8 11h2M8 15h2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />,
  pin:     <><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><circle cx="12" cy="10" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.8" /></>,
  phone:   <path d="M22 16.9v2.6a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h2.6a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L7.6 9.6a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2Z" fill="currentColor" />,
  star:    <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.8 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9 2.9-6Z" fill="currentColor" />,
  check:   <path d="M20 6 9 17l-5-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />,
  scooter: <><circle cx="11" cy="18" r="4" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="37" cy="18" r="4" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M15 18h18M37 14V8h-4M33 8l-6 10M8 11h7l4 7M4 8h6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></>,
  card:    <><rect x="2" y="5" width="20" height="14" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M2 10h20M6 15h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></>,
  cash:    <><rect x="2" y="6" width="20" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" /><circle cx="12" cy="12" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M5 9v6M19 9v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></>,
  wrench:  <path d="M14.7 6.3a4 4 0 0 0 5 5l-7 7a2.1 2.1 0 0 1-3-3l5-5a4 4 0 0 1 0-4Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />,
  snow:    <path d="M12 2v20M4 7l16 10M20 7 4 17M12 5l3 2-3 2-3-2 3-2ZM12 22l3-2-3-2-3 2 3 2Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />,
  plus:    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />,
  clipboard:<><rect x="5" y="4" width="14" height="17" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M9 4a3 3 0 0 1 6 0M9 11h6M9 15h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></>,
  heart:   <path d="M12 20s-7-4.4-9.2-9C1.3 8 2.6 4.5 6 4.5c2 0 3.3 1.2 4 2.4.7-1.2 2-2.4 4-2.4 3.4 0 4.7 3.5 3.2 6.5C19 15.6 12 20 12 20Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />,
  shield:  <><path d="M12 2 4 5.5v6c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10v-6L12 2Z" fill="currentColor" /><path d="M8.5 12l2.5 2.5L16 9.5" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></>,
  bell:    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />,
  search:  <><circle cx="11" cy="11" r="8" fill="none" stroke="currentColor" strokeWidth="2" /><path d="m21 21-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></>,
  chevron: <path d="m9 18 6-6-6-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />,
  arrow:   <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />,
  back:    <path d="M19 12H5M11 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
  close:   <path d="M18 6 6 18M6 6l12 12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />,
  user:    <><circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></>,
  bookings:<><rect x="3" y="4" width="18" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></>,
  sofa:    <><path d="M5 10V8a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v2" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M3 12a2 2 0 0 1 4 0v1h10v-1a2 2 0 0 1 4 0v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><path d="M6 19v2M18 19v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></>,
  roller:  <><rect x="3" y="3" width="14" height="6" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M17 5h2a1.5 1.5 0 0 1 1.5 1.5v2A1.5 1.5 0 0 1 19 10h-7v3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><rect x="10.5" y="13" width="3" height="8" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.8" /></>,
  droplet: <><path d="M12 3s6 6.2 6 10.2A6 6 0 0 1 6 13.2C6 9.2 12 3 12 3Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><path d="M9.5 13.5a2.6 2.6 0 0 0 2.5 2.7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></>,
  hammer:  <><path d="M14.5 4.5 19 9l-2 2-4.5-4.5 2-2Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><path d="M12.5 6.5 4 15a1.8 1.8 0 0 0 0 2.6l.4.4a1.8 1.8 0 0 0 2.6 0l8.5-8.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><path d="M13 4l3-1.5L20.5 7 19 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></>,
  plug:    <><path d="M9 2v5M15 2v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><path d="M6 7h12v3a6 6 0 0 1-5 5.9V21h-2v-5.1A6 6 0 0 1 6 10V7Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></>,
  cart:    <><circle cx="9" cy="20" r="1.6" fill="currentColor" /><circle cx="17" cy="20" r="1.6" fill="currentColor" /><path d="M3 3h2.5l2.2 11.2a1.6 1.6 0 0 0 1.6 1.3h7.6a1.6 1.6 0 0 0 1.6-1.2L20.5 7H6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></>,
  truck:   <><rect x="2" y="6" width="12" height="10" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M14 9h4l3 3.5V16h-2.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><circle cx="7" cy="17.5" r="1.8" fill="none" stroke="currentColor" strokeWidth="1.7" /><circle cx="17" cy="17.5" r="1.8" fill="none" stroke="currentColor" strokeWidth="1.7" /></>,
  medal:   <><circle cx="12" cy="9" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="m9 13.5-2 7 5-2.6 5 2.6-2-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><path d="m12 6.6.9 1.8 2 .3-1.45 1.4.35 2-1.8-.95-1.8.95.35-2L9.1 8.7l2-.3.9-1.8Z" fill="currentColor" /></>,
  clock:   <><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M12 7v5l3.5 2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></>,
  chart:   <path d="M4 20V10M10 20V4M16 20v-8M21 20H3" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />,
  rupee:   <path d="M7 4h10M7 8.5h10M7 4c5 0 7 1.5 7 4.5S11 13 8.5 13L15 20" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />,
  navigate:<path d="M21 3 3.6 10.3a.7.7 0 0 0 .07 1.32L11 14l2.37 7.33a.7.7 0 0 0 1.32.07L21 3Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />,
  key:     <><circle cx="8" cy="14" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="m11.5 10.5 8-8M16 5l3 3M13.5 7.5l2.5 2.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></>,
  history: <><path d="M3.5 12a8.5 8.5 0 1 0 2.5-6L3.5 8.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><path d="M3.5 4v4.5H8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 8v4l3 2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></>,
  headset: <><path d="M4 14v-2a8 8 0 0 1 16 0v2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><rect x="3" y="13" width="4.5" height="7" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" /><rect x="16.5" y="13" width="4.5" height="7" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" /></>,
  fan:     <><circle cx="12" cy="12" r="2.2" fill="currentColor" /><path d="M12 9.5c0-3 1.2-5.5 3.5-5.5 2 0 3 1.6 3 3 0 2.2-2.6 3.4-6.5 2.5ZM12 14.5c0 3-1.2 5.5-3.5 5.5-2 0-3-1.6-3-3 0-2.2 2.6-3.4 6.5-2.5ZM9.5 12c-3 0-5.5-1.2-5.5-3.5 0-2 1.6-3 3-3 2.2 0 3.4 2.6 2.5 6.5ZM14.5 12c3 0 5.5 1.2 5.5 3.5 0 2-1.6 3-3 3-2.2 0-3.4-2.6-2.5-6.5Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></>,
  mail:    <><rect x="2.5" y="5" width="19" height="14" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="m3.5 7 8.5 5.5L20.5 7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></>,
  lock:    <><rect x="4.5" y="10.5" width="15" height="10" rx="2.2" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><circle cx="12" cy="15.5" r="1.4" fill="currentColor" /></>,
  trend:   <path d="M3 17 9 11l4 4 8-8M21 9v5M21 9h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
};

// scooter uses a wider viewBox
const VIEWBOX = { scooter: '0 0 48 24' };

export default function Icon({ name, size }) {
  const vb = VIEWBOX[name] || '0 0 24 24';
  const style = size ? { width: size, height: size } : undefined;
  return (
    <svg className="ic" viewBox={vb} style={style} aria-hidden="true">
      {PATHS[name] || null}
    </svg>
  );
}

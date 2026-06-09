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

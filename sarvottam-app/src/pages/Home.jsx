import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import MapView from '../components/MapView';
import EmergencyFlow from '../components/EmergencyFlow';
import { useToast } from '../components/Toast';
import { EMERGENCY_SERVICES } from '../data/services';
import './Home.css';

const LOCATIONS = [
  'Vaishali Nagar, Jaipur',
  'Gandhi Nagar, Jaipur',
  'Mansarovar, Jaipur',
  'Malviya Nagar, Jaipur',
  'Indra Colony, Barmer',
  'Station Road, Barmer',
  'Ratanada, Jodhpur',
];

// 3 Core Services matching the uploaded UI screenshot
const HOME_SERVICES = [
  {
    id: 'electrician',
    name: 'Electrician',
    sub: 'Wiring, installation, repair',
    img: '/electrician-card.jpg',
    badgeIcon: 'bolt',
    badgeColor: '#2563EB',
    btnColor: '#2563EB',
    eta: '8 mins',
    price: '₹400',
    serviceData: EMERGENCY_SERVICES.find((s) => s.id === 'electrician') || {
      name: 'Electrician',
      icon: 'bolt',
      color: '#2563EB',
      service: 400,
    },
  },
  {
    id: 'ac',
    name: 'AC Repair',
    sub: 'Repair, service, installation',
    img: '/ac-repair-card.jpg',
    badgeIcon: 'fan',
    badgeColor: '#EA580C',
    btnColor: '#EA580C',
    eta: '15 mins',
    price: '₹600',
    serviceData: EMERGENCY_SERVICES.find((s) => s.id === 'ac') || {
      name: 'AC Repair',
      icon: 'fan',
      color: '#EA580C',
      service: 600,
    },
  },
  {
    id: 'plumber',
    name: 'Plumber',
    sub: 'Pipes, leakage, installation',
    img: '/plumber-card.jpg',
    badgeIcon: 'droplet',
    badgeColor: '#0284C7',
    btnColor: '#0284C7',
    eta: '10 mins',
    price: '₹350',
    serviceData: EMERGENCY_SERVICES.find((s) => s.id === 'plumber') || {
      name: 'Plumber',
      icon: 'droplet',
      color: '#0284C7',
      service: 350,
    },
  },
];

// Extended Services shown when the bottom sheet is dragged/expanded upward
const ALL_EXPANDED_SERVICES = [
  ...HOME_SERVICES,
  {
    id: 'carpenter',
    name: 'Carpenter',
    sub: 'Door lock, furniture, hinges',
    img: '/electrician-card.jpg',
    badgeIcon: 'hammer',
    badgeColor: '#A05A0B',
    btnColor: '#A05A0B',
    eta: '12 mins',
    price: '₹450',
    serviceData: EMERGENCY_SERVICES.find((s) => s.id === 'carpenter') || {
      name: 'Carpenter',
      icon: 'hammer',
      color: '#A05A0B',
      service: 450,
    },
  },
  {
    id: 'painter',
    name: 'Painter',
    sub: 'Wall touch-up & waterproofing',
    img: '/ac-repair-card.jpg',
    badgeIcon: 'roller',
    badgeColor: '#7C3AED',
    btnColor: '#7C3AED',
    eta: '15 mins',
    price: '₹500',
    serviceData: EMERGENCY_SERVICES.find((s) => s.id === 'painter') || {
      name: 'Painter',
      icon: 'roller',
      color: '#7C3AED',
      service: 500,
    },
  },
  {
    id: 'appliance',
    name: 'Appliance Repair',
    sub: 'Washing machine, fridge, microwave',
    img: '/plumber-card.jpg',
    badgeIcon: 'wrench',
    badgeColor: '#0D9488',
    btnColor: '#0D9488',
    eta: '18 mins',
    price: '₹450',
    serviceData: {
      id: 'appliance',
      name: 'Appliance Repair',
      icon: 'wrench',
      color: '#0D9488',
      service: 450,
    },
  },
];

const CATEGORY_CHIPS = ['All', '⚡ Emergency', '❄️ AC / Appliance', '🚰 Plumbing', '🔨 Woodwork', '🎨 Painting'];

export default function Home() {
  const nav = useNavigate();
  const toast = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLoc, setSelectedLoc] = useState('Vaishali Nagar');
  const [locOpen, setLocOpen] = useState(false);
  const [activeBookingService, setActiveBookingService] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');

  // Bottom sheet state: 'peek' (~42vh) | 'expanded' (~88vh)
  const [sheetState, setSheetState] = useState('peek');
  const dragStartYRef = useRef(null);
  const isDraggingRef = useRef(false);

  // Dynamic Location found callback from MapView GPS
  const handleLocationFound = (areaName) => {
    if (areaName && areaName !== 'My Location') {
      setSelectedLoc(areaName);
    }
  };

  // Trigger booking from map marker or card
  const handleSelectService = (serviceName) => {
    const s =
      ALL_EXPANDED_SERVICES.find(
        (item) => item.name.toLowerCase() === (serviceName || '').toLowerCase()
      ) || HOME_SERVICES[0];
    setActiveBookingService(s.serviceData);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast('Service name search karein (e.g. Electrician)');
      return;
    }
    const found = ALL_EXPANDED_SERVICES.find((s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );
    if (found) {
      setActiveBookingService(found.serviceData);
    } else {
      setSheetState('expanded');
      toast(`Showing services matching "${searchQuery}"`);
    }
  };

  // Touch & Pointer Drag Handlers for Bottom Sheet
  const handleTouchStart = (e) => {
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    dragStartYRef.current = clientY;
    isDraggingRef.current = true;
  };

  const handleTouchEnd = (e) => {
    if (!isDraggingRef.current || dragStartYRef.current === null) return;
    const clientY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
    const deltaY = dragStartYRef.current - clientY; // Positive = drag UP, Negative = drag DOWN

    if (deltaY > 35) {
      // Swiped UP -> Expand sheet over map
      setSheetState('expanded');
    } else if (deltaY < -35) {
      // Swiped DOWN -> Collapse sheet to peek
      setSheetState('peek');
    }

    dragStartYRef.current = null;
    isDraggingRef.current = false;
  };

  // Filtered services in expanded view
  const filteredServices = ALL_EXPANDED_SERVICES.filter((s) => {
    if (searchQuery.trim()) {
      return (
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.sub.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (activeCategory === '⚡ Emergency') return ['electrician', 'plumber', 'ac'].includes(s.id);
    if (activeCategory === '❄️ AC / Appliance') return ['ac', 'appliance'].includes(s.id);
    if (activeCategory === '🚰 Plumbing') return s.id === 'plumber';
    if (activeCategory === '🔨 Woodwork') return s.id === 'carpenter';
    if (activeCategory === '🎨 Painting') return s.id === 'painter';
    return true;
  });

  return (
    <div className={`home-screen-wrapper sheet-${sheetState}`}>
      {/* ── 1. UPPER HALF: INTERACTIVE MAP VIEW ── */}
      <div className="home-map-section">
        <MapView
          onSelectService={handleSelectService}
          onLocationFound={handleLocationFound}
        />

        {/* Floating Search & Location Pill (Apple Liquid Glass) */}
        <div className="floating-top-header">
          <form className="fth-search-bar" onSubmit={handleSearchSubmit}>
            <span className="fth-search-ic">
              <Icon name="search" size={17} />
            </span>
            <input
              type="text"
              className="fth-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for electrician, AC repair, plumber..."
            />
          </form>

          <div className="fth-loc-wrapper">
            <button
              type="button"
              className="fth-loc-btn"
              onClick={() => setLocOpen(!locOpen)}
            >
              <span className="fth-pin-ic">
                <Icon name="pin" size={15} />
              </span>
              <span className="fth-loc-text">{selectedLoc}</span>
              <span className="fth-chevron-ic">
                <Icon name="chevron" size={12} />
              </span>
            </button>

            {locOpen && (
              <div className="fth-loc-dropdown">
                {LOCATIONS.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    className={'fth-loc-option' + (selectedLoc === loc ? ' active' : '')}
                    onClick={() => {
                      setSelectedLoc(loc.split(',')[0]);
                      setLocOpen(false);
                      toast(`Location set to ${loc}`);
                    }}
                  >
                    <Icon name="pin" size={13} />
                    <span>{loc}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Backdrop overlay when sheet is expanded */}
        {sheetState === 'expanded' && (
          <div
            className="sheet-backdrop"
            onClick={() => setSheetState('peek')}
          />
        )}
      </div>

      {/* ── 2. DRAGGABLE BOTTOM SERVICE SHEET ── */}
      <div
        className={`home-bottom-sheet ${sheetState}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Subtle Drag Handle with Tap Toggle */}
        <div
          className="sheet-drag-handle-area"
          onClick={() => setSheetState(sheetState === 'peek' ? 'expanded' : 'peek')}
        >
          <div className="sheet-drag-handle" />
        </div>

        {/* Section Header: Book a Service / View all > */}
        <div className="sheet-header-row">
          <div className="sheet-title-group">
            <h2 className="sheet-title">Book a Service</h2>
            <span className="sheet-live-badge">
              <span className="pulse-dot-green" /> 5 Karigars Online
            </span>
          </div>

          <button
            type="button"
            className="sheet-view-all-btn"
            onClick={() => setSheetState(sheetState === 'peek' ? 'expanded' : 'peek')}
          >
            <span>{sheetState === 'expanded' ? 'Show Map' : 'View all'}</span>
            <Icon name={sheetState === 'expanded' ? 'chevron' : 'arrow'} size={14} />
          </button>
        </div>

        {/* ── SHEET BODY CONTENT ── */}
        <div className="sheet-scroll-body">
          {/* Service Cards Horizontal Grid (Resting Peek View) */}
          <div className="service-cards-row">
            {HOME_SERVICES.map((s) => (
              <div
                key={s.id}
                className="service-card-item"
                onClick={() => setActiveBookingService(s.serviceData)}
              >
                {/* Worker Image Container */}
                <div className="card-img-wrap">
                  <img src={s.img} alt={s.name} className="card-worker-img" />
                  {/* Floating Service Badge */}
                  <div
                    className="card-floating-badge"
                    style={{ backgroundColor: s.badgeColor }}
                  >
                    <Icon name={s.badgeIcon} size={15} />
                  </div>
                </div>

                {/* Title & Subtitle */}
                <div className="card-content-wrap">
                  <h3 className="card-service-name">{s.name}</h3>
                  <p className="card-service-sub">{s.sub}</p>
                </div>

                {/* Arrow Action Button */}
                <div className="card-action-bottom">
                  <button
                    type="button"
                    className="card-arrow-btn"
                    style={{ backgroundColor: s.btnColor }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveBookingService(s.serviceData);
                    }}
                  >
                    <Icon name="arrow" size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ── EXPANDED EXTRA CONTENT (Visible when sheet slides UP) ── */}
          {sheetState === 'expanded' && (
            <div className="expanded-services-content">
              {/* Category Filter Chips */}
              <div className="category-chips-row">
                {CATEGORY_CHIPS.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`cat-chip ${activeCategory === cat ? 'active' : ''}`}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* All Services Detailed List / Grid */}
              <div className="expanded-services-grid">
                {filteredServices.map((srv) => (
                  <div
                    key={srv.id}
                    className="expanded-service-card"
                    onClick={() => setActiveBookingService(srv.serviceData)}
                  >
                    <div className="esc-left">
                      <div
                        className="esc-icon-badge"
                        style={{ backgroundColor: `${srv.badgeColor}18`, color: srv.badgeColor }}
                      >
                        <Icon name={srv.badgeIcon} size={22} />
                      </div>
                      <div className="esc-info">
                        <div className="esc-title-row">
                          <h4 className="esc-name">{srv.name}</h4>
                          <span className="esc-eta">⚡ {srv.eta}</span>
                        </div>
                        <p className="esc-sub">{srv.sub}</p>
                        <span className="esc-price">Starts at {srv.price}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="esc-book-btn"
                      style={{ backgroundColor: srv.btnColor }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveBookingService(srv.serviceData);
                      }}
                    >
                      Book
                    </button>
                  </div>
                ))}
              </div>

              {/* 24/7 Emergency Helpline Banner */}
              <div className="emergency-help-card">
                <div className="ehc-icon">
                  <Icon name="phone" size={20} />
                </div>
                <div className="ehc-text">
                  <strong>24×7 Emergency Dispatch</strong>
                  <small>Need urgent help? Direct Karigar connect</small>
                </div>
                <a
                  href="tel:1800123456"
                  className="ehc-call-btn"
                  onClick={() => toast('Calling 24×7 Karigar Helpline…')}
                >
                  Call Now
                </a>
              </div>
            </div>
          )}
        </div>

        {/* ── 3. LOCKED / STICKY TRUST FOOTER (Never shifts, always above tab bar) ── */}
        <div className="home-trust-banner-wrapper">
          <div className="home-trust-banner">
            <div className="htb-col htb-india">
              {/* Round Indian Flag Badge */}
              <span className="india-flag-badge">
                <span className="flag-circle">
                  <span className="flag-stripe saffron" />
                  <span className="flag-stripe white">
                    <span className="chakra-dot" />
                  </span>
                  <span className="flag-stripe green" />
                </span>
              </span>
              <span className="htb-title">#MadeInIndia</span>
            </div>

            <div className="htb-divider" />

            <div className="htb-col htb-rajasthan">
              <span className="palace-icon-wrap">
                <Icon name="building" size={20} />
              </span>
              <div className="htb-raj-text">
                <strong className="htb-title">Crafted in Rajasthan</strong>
                <small className="htb-sub">Proudly local, proudly Indian</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. EMERGENCY BOOKING MODAL (Connected) ── */}
      {activeBookingService && (
        <EmergencyFlow
          service={activeBookingService}
          onClose={() => setActiveBookingService(null)}
        />
      )}
    </div>
  );
}


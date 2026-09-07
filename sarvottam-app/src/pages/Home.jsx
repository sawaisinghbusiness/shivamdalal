import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import MapView from '../components/MapView';
import EmergencyFlow from '../components/EmergencyFlow';
import BottomSheet, { DEFAULT_SHEET_SNAPS } from '../components/BottomSheet';
import { useToast } from '../components/Toast';
import { EMERGENCY_SERVICES } from '../data/services';
import './Home.css';

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

export default function Home() {
  const nav = useNavigate();
  const toast = useToast();
  const bottomSheetRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLoc, setSelectedLoc] = useState('Vaishali Nagar');
  const [activeBookingService, setActiveBookingService] = useState(null);
  const [sheetState, setSheetState] = useState('collapsed');

  // Dynamic Location found callback from MapView GPS
  const handleLocationFound = (areaName) => {
    if (areaName && areaName !== 'My Location') {
      setSelectedLoc(areaName);
    }
  };

  // Trigger booking from map marker or card
  const handleSelectService = (serviceName) => {
    const s =
      HOME_SERVICES.find(
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
    const found = HOME_SERVICES.find((s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );
    if (found) {
      setActiveBookingService(found.serviceData);
    } else {
      bottomSheetRef.current?.expand();
      toast(`Showing services matching "${searchQuery}"`);
    }
  };

  // Snap change callback
  const handleSnapChange = (index, name) => {
    setSheetState(name);
  };

  // Progress callback for live CSS variable update
  const handleProgress = (progress) => {
    document.documentElement.style.setProperty('--sheet-progress', String(progress));
  };

  // Filtered services based on search
  const filteredServices = HOME_SERVICES.filter((s) => {
    if (!searchQuery.trim()) return true;
    return (
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.sub.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="home-screen-wrapper">
      {/* ── 1. MAP SECTION (Stays mounted continuously, zero reload/flicker) ── */}
      <div className="home-map-section">
        <MapView
          onSelectService={handleSelectService}
          onLocationFound={handleLocationFound}
        />

        {/* Floating Top Search & Locked Live Location Bar */}
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

          {/* Locked Live Location Pill */}
          <div className="fth-loc-wrapper">
            <div
              className="fth-loc-pill"
              title={`Live GPS Location: ${selectedLoc}`}
              onClick={() => toast(`📍 Live GPS Location locked: ${selectedLoc}`)}
            >
              <span className="fth-pin-ic">
                <Icon name="pin" size={14} />
              </span>
              <span className="fth-loc-text">{selectedLoc}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. OLA/UBER-STYLE 60FPS DRAGGABLE BOTTOM SHEET WITH SNAP POINTS ── */}
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={DEFAULT_SHEET_SNAPS}
        defaultSnapIndex={1}
        onSnapChange={handleSnapChange}
        onProgress={handleProgress}
        header={
          <div className="sheet-header-row">
            <h2 className="sheet-title">Book a Service</h2>
            <button
              type="button"
              className="sheet-view-all-btn"
              onClick={() =>
                bottomSheetRef.current?.snapTo(sheetState === 'expanded' ? 1 : 0)
              }
            >
              <span>{sheetState === 'expanded' ? 'Show Map' : 'View all'}</span>
              <Icon name={sheetState === 'expanded' ? 'chevron' : 'arrow'} size={14} />
            </button>
          </div>
        }
        footer={
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
        }
      >
        {/* Featured Service Cards Horizontal Row (Resting View) */}
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
                <div
                  className="card-floating-badge"
                  style={{ backgroundColor: s.badgeColor }}
                >
                  <Icon name={s.badgeIcon} size={15} />
                </div>
              </div>

              {/* Service Title */}
              <div className="card-content-wrap">
                <h3 className="card-service-name">{s.name}</h3>
              </div>

              {/* Action Button */}
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

        {/* Expanded Services Content (Only Electrician, AC Repair, Plumber with Photos) */}
        <div className="expanded-services-content">
          <div className="expanded-services-grid">
            {filteredServices.map((srv) => (
              <div
                key={srv.id}
                className="expanded-service-card"
                onClick={() => setActiveBookingService(srv.serviceData)}
              >
                <div className="esc-left">
                  {/* Real Image Thumbnail Instead of Generic Icon */}
                  <div className="esc-img-wrap">
                    <img src={srv.img} alt={srv.name} className="esc-thumb-img" />
                  </div>
                  <div className="esc-info">
                    <div className="esc-title-row">
                      <h4 className="esc-name">{srv.name}</h4>
                      <span className="esc-eta">⚡ {srv.eta}</span>
                    </div>
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
        </div>
      </BottomSheet>

      {/* ── 3. EMERGENCY BOOKING MODAL (Connected) ── */}
      {activeBookingService && (
        <EmergencyFlow
          service={activeBookingService}
          onClose={() => setActiveBookingService(null)}
        />
      )}
    </div>
  );
}


import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import BookingWizard from '../components/BookingWizard';
import { EMERGENCY_SERVICES } from '../data/services';
import './AllServices.css';

const CATEGORIES = ['All', 'Quick Repair', 'Furniture', 'Painting'];

const ALL_CATALOG = [
  {
    id: 'electrician',
    name: 'Electrician',
    category: 'Quick Repair',
    desc: 'Wiring, switchboard, fuse & repair',
    img: '/electrician-card.jpg',
    badgeColor: '#2563EB',
    eta: '8 mins',
    price: '₹400',
    type: 'emergency',
    serviceData: EMERGENCY_SERVICES.find((s) => s.id === 'electrician') || {
      name: 'Electrician',
      icon: 'bolt',
      color: '#2563EB',
      service: 400,
    },
  },
  {
    id: 'ac',
    name: 'AC Service & Repair',
    category: 'Quick Repair',
    desc: 'Deep clean, gas fill, cooling issue',
    img: '/ac-repair-card.jpg',
    badgeColor: '#EA580C',
    eta: '15 mins',
    price: '₹600',
    type: 'emergency',
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
    category: 'Quick Repair',
    desc: 'Leakage, taps, pipes, bathroom fittings',
    img: '/plumber-card.jpg',
    badgeColor: '#0284C7',
    eta: '10 mins',
    price: '₹350',
    type: 'emergency',
    serviceData: EMERGENCY_SERVICES.find((s) => s.id === 'plumber') || {
      name: 'Plumber',
      icon: 'droplet',
      color: '#0284C7',
      service: 350,
    },
  },
  {
    id: 'carpenter',
    name: 'Carpenter',
    category: 'Quick Repair',
    desc: 'Door locks, hinges, furniture repair',
    img: '/carpainter.png',
    badgeColor: '#A05A0B',
    eta: '12 mins',
    price: '₹450',
    type: 'emergency',
    serviceData: EMERGENCY_SERVICES.find((s) => s.id === 'carpenter') || {
      name: 'Carpenter',
      icon: 'hammer',
      color: '#A05A0B',
      service: 450,
    },
  },
  {
    id: 'furniture',
    name: 'Custom Furniture',
    category: 'Furniture',
    desc: 'Beds, wardrobes, dining sets, sofa',
    img: '/karigar-hero.jpg',
    badgeColor: '#0D9488',
    eta: 'Custom Made',
    price: 'View Catalog',
    type: 'route',
    route: '/furniture',
  },
  {
    id: 'painting',
    name: 'Wall Painting',
    category: 'Painting',
    desc: 'Waterproofing, texture, full home paint',
    img: '/ac-repair-card.jpg',
    badgeColor: '#7C3AED',
    eta: 'Free Estimate',
    price: 'View Rates',
    type: 'route',
    route: '/painting',
  },
];

export default function AllServices() {
  const nav = useNavigate();
  const [selectedCat, setSelectedCat] = useState('All');
  const [search, setSearch] = useState('');
  const [activeBooking, setActiveBooking] = useState(null);

  const filtered = ALL_CATALOG.filter((s) => {
    const matchesCat = selectedCat === 'All' || s.category === selectedCat;
    const matchesSearch =
      !search.trim() ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.desc.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleCardClick = (item) => {
    if (item.type === 'route') {
      nav(item.route);
    } else if (item.serviceData) {
      setActiveBooking(item.serviceData);
    }
  };

  return (
    <div className="page all-services-page">
      <div className="inner-header as-header">
        <div className="as-header-top">
          <button className="ih-back" onClick={() => nav('/')}>
            <Icon name="back" size={18} />
          </button>
          <h1 className="ih-title">All Services</h1>
        </div>
        <p className="ih-sub">Choose from verified local Rajasthan experts</p>

        {/* Search input */}
        <div className="as-search-wrap">
          <Icon name="search" size={16} />
          <input
            type="text"
            className="as-search-input"
            placeholder="Search all services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="as-tabs-wrap">
        <div className="as-tabs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={'as-tab' + (selectedCat === cat ? ' active' : '')}
              onClick={() => setSelectedCat(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div className="as-grid">
        {filtered.map((it) => (
          <div
            key={it.id}
            className="as-card"
            onClick={() => handleCardClick(it)}
          >
            <div className="as-card-img-wrap">
              <img src={it.img} alt={it.name} className="as-card-img" />
              <span className="as-badge" style={{ backgroundColor: it.badgeColor }}>
                {it.eta}
              </span>
            </div>

            <div className="as-card-info">
              <div className="as-card-title-row">
                <h3>{it.name}</h3>
                <span className="as-price">{it.price}</span>
              </div>
              <p className="as-card-desc">{it.desc}</p>
              <button
                type="button"
                className="as-card-action-btn"
                style={{ backgroundColor: it.badgeColor }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCardClick(it);
                }}
              >
                {it.type === 'route' ? 'Explore' : 'Book Now'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bottom-spacer" />

      {activeBooking && (
        <BookingWizard
          initialService={activeBooking}
          onClose={() => setActiveBooking(null)}
        />
      )}
    </div>
  );
}

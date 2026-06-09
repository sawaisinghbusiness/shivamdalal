import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import { useToast } from '../components/Toast';
import { EMERGENCY_SERVICES, POPULAR, TRUST_STATS } from '../data/services';
import './Home.css';

const CATEGORIES = [
  { id: 'emergency', to: '/emergency', icon: 'bolt',      name: 'Emergency', sub: '24x7 Available',   color: '#ef4444' },
  { id: 'furniture', to: '/furniture', icon: 'clipboard', name: 'Furniture', sub: 'Design & Custom',  color: '#0F3D3E' },
  { id: 'painting',  to: '/painting',  icon: 'heart',     name: 'Painting',  sub: 'Interior & Exterior', color: '#7c3aed' },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export default function Home() {
  const nav = useNavigate();
  const toast = useToast();
  const [q, setQ] = useState('');

  const onSearch = (e) => {
    e.preventDefault();
    if (!q.trim()) { toast('Service ka naam type karein'); return; }
    nav('/emergency');
    setQ('');
  };

  return (
    <div className="page">
      {/* Header */}
      <div className="home-header">
        <div className="home-topbar">
          <button className="loc-btn" onClick={() => toast('Location picker abhi demo mein')}>
            <Icon name="pin" size={15} />
            <span>Barmer</span>
            <Icon name="chevron" size={12} />
          </button>
          <span className="brand">SARVOTTAM</span>
          <button className="notif-btn" onClick={() => nav('/notifications')}>
            <Icon name="bell" size={20} />
            <span className="notif-dot" />
          </button>
        </div>

        <div className="hero">
          <div className="hero-text">
            <p className="hero-greet">{greeting()} ☀️</p>
            <h1 className="hero-head">Let's make your<br />home <span>beautiful</span></h1>
          </div>
          <img className="hero-peacock" src="/peacock.png" alt="" />
        </div>

        <form className="search" onSubmit={onSearch}>
          <Icon name="search" size={17} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search services, furniture, painting…"
          />
          <button type="submit" className="search-btn">Search</button>
        </form>
      </div>

      {/* Category cards */}
      <section className="cat-row">
        {CATEGORIES.map((c) => (
          <button key={c.id} className="cat-card" onClick={() => nav(c.to)}>
            <div className="cat-ic" style={{ background: c.color }}><Icon name={c.icon} size={22} /></div>
            <div className="cat-text">
              <span className="cat-name">{c.name}</span>
              <span className="cat-sub">{c.sub}</span>
            </div>
            <Icon name="chevron" size={14} />
          </button>
        ))}
      </section>

      {/* Popular services — photo cards */}
      <section className="section">
        <div className="section-head">
          <h2 className="section-title">Popular Services</h2>
          <button className="view-all" onClick={() => nav('/emergency')}>View All</button>
        </div>
        <div className="pop-grid">
          {POPULAR.map((s) => (
            <button key={s.id} className="pop-card" onClick={() => nav('/emergency')}>
              <div className="pop-img"><img src={s.img} alt={s.name} /></div>
              <p className="pop-name">{s.name}</p>
              <span className="pop-arrow"><Icon name="arrow" size={14} /></span>
            </button>
          ))}
        </div>
      </section>

      {/* Trust banner */}
      <section className="section">
        <div className="trust-banner" onClick={() => nav('/emergency')}>
          <img className="trust-feather" src="/peacock-small.png" alt="" />
          <h3>Fast. Reliable.<br />Trusted.</h3>
          <p>Book expert professionals at your doorstep</p>
          <span className="trust-book">Book Now</span>
        </div>
      </section>

      {/* Trust stats */}
      <section className="section">
        <div className="trust-stats">
          {TRUST_STATS.map((t, i) => (
            <div className="trust-stat" key={i}>
              <strong>{t.num}</strong>
              <small>{t.label}</small>
            </div>
          ))}
        </div>
      </section>

      <div className="bottom-spacer" />
    </div>
  );
}

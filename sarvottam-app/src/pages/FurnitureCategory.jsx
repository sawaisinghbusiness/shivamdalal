import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Icon from '../components/Icon';
import { useToast } from '../components/Toast';
import { useAppData } from '../store/AppData';
import { FURNITURE_CATALOG, SPACES } from '../data/furnitureData';
import './FurnitureCategory.css';

const LIKED_STORAGE_KEY = 'sarvottam_furniture_wishlist';

export default function FurnitureCategory() {
  const { categorySlug } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const { user, addBookingDemo } = useAppData();

  const currentSpace = useMemo(() => {
    return FURNITURE_CATALOG[categorySlug] || null;
  }, [categorySlug]);

  const currentSpaceMeta = useMemo(() => {
    return SPACES.find((s) => s.id === categorySlug) || { name: currentSpace?.title || 'Furniture' };
  }, [categorySlug, currentSpace]);

  // UI state
  const [activeSubcat, setActiveSubcat] = useState('All');
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [wishlistOnly, setWishlistOnly] = useState(false);
  const [readMore, setReadMore] = useState(false);

  // Wishlist state
  const [liked, setLiked] = useState(() => {
    try {
      const saved = localStorage.getItem(LIKED_STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Modal states
  const [selectedProject, setSelectedProject] = useState(null);
  const [consultModal, setConsultModal] = useState(null);

  // Consultation form state
  const [cName, setCName] = useState(user?.name || '');
  const [cPhone, setCPhone] = useState(user?.phone?.replace('+91 ', '') || '');
  const [cAddress, setCAddress] = useState('Barmer, Rajasthan');
  const [cDate, setCDate] = useState('Tomorrow (Morning 09:00 AM – 12:00 PM)');
  const [cNotes, setCNotes] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(LIKED_STORAGE_KEY, JSON.stringify(liked));
    } catch (e) {
      console.warn('Could not save wishlist', e);
    }
  }, [liked]);

  useEffect(() => {
    setActiveSubcat('All');
    setSearch('');
    setWishlistOnly(false);
    setReadMore(false);
    setSelectedProject(null);
    setConsultModal(null);
    window.scrollTo(0, 0);
  }, [categorySlug]);

  const toggleLike = (id, title, e) => {
    e.stopPropagation();
    setLiked((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      toast(next[id] ? `Saved to wishlist: ${title}` : 'Removed from wishlist');
      return next;
    });
  };

  const designs = currentSpace?.designs || [];
  const filteredDesigns = useMemo(() => {
    return designs.filter((item) => {
      const matchesSubcat = activeSubcat === 'All' || item.subcat === activeSubcat;
      const matchesSearch =
        !search.trim() ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.finish.toLowerCase().includes(search.toLowerCase()) ||
        item.size.toLowerCase().includes(search.toLowerCase());
      const matchesWishlist = !wishlistOnly || liked[item.id];
      return matchesSubcat && matchesSearch && matchesWishlist;
    });
  }, [designs, activeSubcat, search, wishlistOnly, liked]);

  const projectNav = useMemo(() => {
    if (!selectedProject || designs.length === 0) return { prev: null, next: null };
    const idx = designs.findIndex((p) => p.id === selectedProject.id);
    return {
      prev: idx > 0 ? designs[idx - 1] : designs[designs.length - 1],
      next: idx < designs.length - 1 ? designs[idx + 1] : designs[0],
    };
  }, [selectedProject, designs]);

  const handleConsultSubmit = (e) => {
    e.preventDefault();
    const cleanPhone = cPhone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      toast('Please enter a valid 10-digit mobile number');
      return;
    }

    const title = consultModal?.name || `${currentSpace?.title || 'Furniture'} Consultation`;

    addBookingDemo({
      service: `Consultation: ${title}`,
      icon: 'hammer',
      karigar: 'Master Karigar assigned on schedule',
      amount: 0,
      status: 'upcoming',
      notes: `Slot: ${cDate}. Address: ${cAddress}. Details: ${cNotes || 'Standard 3D Measurement'}`,
    });

    toast('Free Consultation booked! Our master karigar will visit you.');
    setConsultModal(null);
    setSelectedProject(null);
    nav('/bookings');
  };

  const wishlistCount = Object.values(liked).filter(Boolean).length;

  if (!currentSpace) {
    return (
      <div className="lvc-page">
        <header className="lvc-top-nav">
          <button type="button" className="lvc-back-btn" onClick={() => nav('/furniture')}>
            <Icon name="back" size={20} />
          </button>
          <span className="lvc-nav-title">Category Not Found</span>
        </header>
        <div className="lvc-empty-box">
          <Icon name="search" size={40} />
          <h2>Category Not Found</h2>
          <p>The space you are looking for is not currently available.</p>
          <Link to="/furniture" className="lvc-btn-fill">
            Explore All Spaces
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="lvc-page">
      {/* ── TOP NAV HEADER ── */}
      <header className="lvc-top-nav">
        <div className="lvc-nav-left">
          <button
            type="button"
            className="lvc-back-btn"
            onClick={() => nav('/furniture')}
            aria-label="Back to Furniture Ideas"
          >
            <Icon name="back" size={20} />
          </button>
          <div className="lvc-nav-text">
            <span className="lvc-nav-tag">SARVOTTAM</span>
            <span className="lvc-nav-title">{currentSpace.title}</span>
          </div>
        </div>

        <div className="lvc-nav-actions">
          <button
            type="button"
            className={'lvc-icon-btn' + (showSearch ? ' active' : '')}
            onClick={() => setShowSearch((v) => !v)}
            aria-label="Search"
          >
            <Icon name="search" size={18} />
          </button>
          <button
            type="button"
            className={'lvc-icon-btn' + (wishlistOnly ? ' active' : '')}
            onClick={() => setWishlistOnly((v) => !v)}
            aria-label="Wishlist"
          >
            <Icon name="heart" size={18} />
            {wishlistCount > 0 && <span className="lvc-badge-count">{wishlistCount}</span>}
          </button>
        </div>
      </header>

      {/* Search Bar Dropdown */}
      {showSearch && (
        <div className="lvc-search-bar">
          <div className="lvc-search-inner">
            <Icon name="search" size={16} />
            <input
              type="text"
              className="lvc-search-input"
              placeholder={`Search ${currentSpaceMeta.name} by finish, size, or style...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
            {search && (
              <button type="button" className="lvc-clear-search" onClick={() => setSearch('')}>
                <Icon name="close" size={14} />
              </button>
            )}
          </div>
        </div>
      )}

      <div className="lvc-container">
        {/* ── EDITORIAL HEADER & BREADCRUMB ── */}
        <section className="lvc-hero-block">
          <nav className="lvc-breadcrumb" aria-label="Breadcrumb">
            <Link to="/" className="lvc-bc-link">Home</Link>
            <span className="lvc-bc-sep">/</span>
            <Link to="/furniture" className="lvc-bc-link">Furniture</Link>
            <span className="lvc-bc-sep">/</span>
            <span className="lvc-bc-current">{currentSpaceMeta.name}</span>
          </nav>

          <div className="lvc-hero-head">
            <div className="lvc-count-tag">
              Showing {filteredDesigns.length} {filteredDesigns.length === 1 ? 'Design' : 'Designs'}
            </div>
            <h1 className="lvc-title">{currentSpace.title}</h1>
            <p className="lvc-desc">
              {readMore ? currentSpace.longDesc : currentSpace.shortDesc}
            </p>

            <button
              type="button"
              className="lvc-read-more"
              onClick={() => setReadMore((v) => !v)}
            >
              <span>{readMore ? 'Read Less' : 'Read More Specifications'}</span>
              <span className={'lvc-rm-arrow' + (readMore ? ' open' : '')}>
                <Icon name="chevron" size={12} />
              </span>
            </button>
          </div>

          {/* Promo Callout */}
          {currentSpace.promo && !wishlistOnly && (
            <div className="lvc-promo-banner">
              <div className="lvc-pb-text">
                <strong>{currentSpace.promo.headline}</strong>
                <p>{currentSpace.promo.sub}</p>
              </div>
              <button
                type="button"
                className="lvc-pb-btn"
                onClick={() => setConsultModal({ name: currentSpace.promo.headline })}
              >
                {currentSpace.promo.cta}
              </button>
            </div>
          )}
        </section>

        {/* ── SUBCATEGORY FILTER CHIPS ── */}
        {currentSpace.subcategories && currentSpace.subcategories.length > 1 && (
          <div className="lvc-subcat-wrapper">
            <div className="lvc-subcat-scroll">
              {currentSpace.subcategories.map((sub) => (
                <button
                  key={sub}
                  type="button"
                  className={'lvc-subcat-pill' + (activeSubcat === sub ? ' active' : '')}
                  onClick={() => setActiveSubcat(sub)}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── DESIGN CARDS GRID (EXACT LIVSPACE CARDS) ── */}
        <main className="lvc-grid">
          {filteredDesigns.map((item) => (
            <article
              key={item.id}
              className="lvc-card"
              onClick={() => setSelectedProject(item)}
            >
              <div className="lvc-card-media">
                <img src={item.img} alt={item.name} loading="lazy" className="lvc-card-img" />
                <span className="lvc-card-dim-pill">{item.size}</span>
                <button
                  type="button"
                  className={'lvc-card-heart' + (liked[item.id] ? ' on' : '')}
                  onClick={(e) => toggleLike(item.id, item.name, e)}
                  aria-label="Wishlist"
                >
                  <Icon name="heart" size={16} />
                </button>
              </div>

              <div className="lvc-card-body">
                <span className="lvc-card-finish">{item.finish}</span>
                <h3 className="lvc-card-title">{item.name}</h3>

                <div className="lvc-card-meta-row">
                  <span className="lvc-card-price">{item.price}</span>
                  <span className="lvc-card-rating">
                    <Icon name="star" size={13} /> {item.rating}
                  </span>
                </div>

                <div className="lvc-card-actions">
                  <button
                    type="button"
                    className="lvc-btn-cta-fill"
                    onClick={(e) => {
                      e.stopPropagation();
                      setConsultModal(item);
                    }}
                  >
                    Book Free Consultation
                  </button>
                  <button
                    type="button"
                    className="lvc-btn-cta-outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProject(item);
                    }}
                  >
                    View Specs
                  </button>
                </div>
              </div>
            </article>
          ))}

          {filteredDesigns.length === 0 && (
            <div className="lvc-empty-box">
              <Icon name="search" size={32} />
              <h3>No designs found</h3>
              <p>Try resetting filters or search terms.</p>
              <button
                type="button"
                className="lvc-btn-fill"
                onClick={() => {
                  setActiveSubcat('All');
                  setSearch('');
                  setWishlistOnly(false);
                }}
              >
                Reset Filters
              </button>
            </div>
          )}
        </main>
      </div>

      {/* ── PROJECT DETAIL SHEET OVERLAY ── */}
      {selectedProject && (
        <div className="lvc-overlay" onClick={() => setSelectedProject(null)}>
          <div className="lvc-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="lvc-sheet-head">
              <button
                type="button"
                className="lvc-sheet-close"
                onClick={() => setSelectedProject(null)}
                aria-label="Close"
              >
                <Icon name="close" size={18} />
              </button>
              <h3 className="lvc-sheet-top-title">{selectedProject.name}</h3>
              <button
                type="button"
                className={'lvc-sheet-heart' + (liked[selectedProject.id] ? ' on' : '')}
                onClick={(e) => toggleLike(selectedProject.id, selectedProject.name, e)}
                aria-label="Save"
              >
                <Icon name="heart" size={18} />
              </button>
            </div>

            <div className="lvc-sheet-scroll">
              <div className="lvc-sheet-hero">
                <img src={selectedProject.img} alt={selectedProject.name} />
                <div className="lvc-sheet-hero-badges">
                  <span>{selectedProject.size}</span>
                  <span><Icon name="star" size={12} /> {selectedProject.rating} Rating</span>
                </div>
              </div>

              <div className="lvc-sheet-body">
                <div className="lvc-sheet-summary">
                  <div>
                    <h2 className="lvc-sheet-h2">{selectedProject.name}</h2>
                    <p className="lvc-sheet-tag">{selectedProject.finish}</p>
                  </div>
                  <div className="lvc-sheet-price-col">
                    <span className="lvc-sp-lbl">Estimate Range</span>
                    <span className="lvc-sp-val">{selectedProject.price}</span>
                  </div>
                </div>

                <div className="lvc-karigar-card">
                  <div className="lvc-kc-ic">
                    <Icon name="shield" size={20} />
                  </div>
                  <div className="lvc-kc-txt">
                    <strong>100% Verified Rajasthan Artisans</strong>
                    <p>Direct workshop fabrication with 10-year warranty and zero showroom markup.</p>
                  </div>
                </div>

                <h4 className="lvc-sheet-h4">Technical Specifications</h4>
                <div className="lvc-specs-table">
                  {selectedProject.specs?.map(([k, v]) => (
                    <div key={k} className="lvc-spec-row">
                      <span className="lvc-spec-k">{k}</span>
                      <strong className="lvc-spec-v">{v}</strong>
                    </div>
                  ))}
                </div>

                <div className="lvc-sheet-cta-box">
                  <div>
                    <strong>Want this exact look customized for your room?</strong>
                    <p>Get a free doorstep measurement visit with 3D CAD blueprints.</p>
                  </div>
                  <button
                    type="button"
                    className="lvc-btn-fill w-full mt-2"
                    onClick={() => setConsultModal(selectedProject)}
                  >
                    Book Measurement Visit
                  </button>
                </div>
              </div>
            </div>

            {/* Previous / Next Design Footer */}
            <div className="lvc-sheet-footer">
              {projectNav.prev && (
                <button
                  type="button"
                  className="lvc-nav-btn prev"
                  onClick={() => setSelectedProject(projectNav.prev)}
                >
                  <Icon name="chevron" size={14} />
                  <span className="lvc-nav-btn-txt">
                    <small>Previous</small>
                    <strong>{projectNav.prev.name}</strong>
                  </span>
                </button>
              )}

              {projectNav.next && (
                <button
                  type="button"
                  className="lvc-nav-btn next"
                  onClick={() => setSelectedProject(projectNav.next)}
                >
                  <span className="lvc-nav-btn-txt">
                    <small>Next Design</small>
                    <strong>{projectNav.next.name}</strong>
                  </span>
                  <Icon name="chevron" size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── CONSULTATION BOOKING MODAL ── */}
      {consultModal && (
        <div className="lvc-overlay" onClick={() => setConsultModal(null)}>
          <div className="lvc-consult-modal" onClick={(e) => e.stopPropagation()}>
            <div className="lvc-cm-header">
              <div>
                <span className="lvc-cm-badge">Free Doorstep Visit · ₹0</span>
                <h3 className="lvc-cm-title">Book Design Consultation</h3>
                <p className="lvc-cm-sub">Space: <strong>{consultModal.name || currentSpace.title}</strong></p>
              </div>
              <button
                type="button"
                className="lvc-sheet-close"
                onClick={() => setConsultModal(null)}
                aria-label="Close"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            <form className="lvc-cm-form" onSubmit={handleConsultSubmit}>
              <div className="lvc-cm-field">
                <label className="lvc-cm-label">Your Name</label>
                <input
                  type="text"
                  className="lvc-cm-input"
                  value={cName}
                  onChange={(e) => setCName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="lvc-cm-field">
                <label className="lvc-cm-label">Phone Number</label>
                <div className="lvc-cm-phone-box">
                  <span className="lvc-cm-prefix">+91</span>
                  <input
                    type="tel"
                    maxLength={10}
                    className="lvc-cm-input lvc-cm-phone-inp"
                    value={cPhone}
                    onChange={(e) => setCPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="10-digit number"
                    required
                  />
                </div>
              </div>

              <div className="lvc-cm-field">
                <label className="lvc-cm-label">Preferred Time Slot</label>
                <select
                  className="lvc-cm-select"
                  value={cDate}
                  onChange={(e) => setCDate(e.target.value)}
                >
                  <option>Tomorrow (Morning 09:00 AM – 12:00 PM)</option>
                  <option>Tomorrow (Afternoon 12:00 PM – 04:00 PM)</option>
                  <option>Tomorrow (Evening 04:00 PM – 07:00 PM)</option>
                  <option>Within 2 Days</option>
                  <option>This Weekend</option>
                </select>
              </div>

              <div className="lvc-cm-field">
                <label className="lvc-cm-label">Doorstep Address / City</label>
                <input
                  type="text"
                  className="lvc-cm-input"
                  value={cAddress}
                  onChange={(e) => setCAddress(e.target.value)}
                  placeholder="House/Plot No., Area, City in Rajasthan"
                  required
                />
              </div>

              <div className="lvc-cm-field">
                <label className="lvc-cm-label">Room Dimensions or Notes (Optional)</label>
                <textarea
                  className="lvc-cm-textarea"
                  rows={2}
                  value={cNotes}
                  onChange={(e) => setCNotes(e.target.value)}
                  placeholder="e.g. 14x10 ft room, need modular cabinets..."
                />
              </div>

              <button type="submit" className="lvc-btn-fill w-full">
                Confirm Free Measurement Visit
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="bottom-spacer" />
    </div>
  );
}

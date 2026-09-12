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

  // Find current space by slug (or fallback to kitchen)
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

  // Wishlist state (persisted in localStorage)
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
  const [cAddress, setCAddress] = useState('Indra Colony, Barmer, Rajasthan');
  const [cDate, setCDate] = useState('Tomorrow (Morning 09:00 AM – 12:00 PM)');
  const [cNotes, setCNotes] = useState('');

  // Persist wishlist
  useEffect(() => {
    try {
      localStorage.setItem(LIKED_STORAGE_KEY, JSON.stringify(liked));
    } catch (e) {
      console.warn('Could not save wishlist', e);
    }
  }, [liked]);

  // Reset subcategory when route changes
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
      toast(next[id] ? `Added to wishlist: ${title}` : 'Removed from wishlist');
      return next;
    });
  };

  // Filtered designs
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

  // Project navigation for detail sheet
  const projectNav = useMemo(() => {
    if (!selectedProject || designs.length === 0) return { prev: null, next: null };
    const idx = designs.findIndex((p) => p.id === selectedProject.id);
    return {
      prev: idx > 0 ? designs[idx - 1] : designs[designs.length - 1],
      next: idx < designs.length - 1 ? designs[idx + 1] : designs[0],
    };
  }, [selectedProject, designs]);

  // Consultation booking handler
  const handleConsultSubmit = (e) => {
    e.preventDefault();
    if (!cPhone || cPhone.replace(/\D/g, '').length < 10) {
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
      notes: `Preferred slot: ${cDate}. Address: ${cAddress}. Notes: ${cNotes || 'Standard 3D Measurement'}`,
    });

    toast('Free Consultation booked! Our master karigar will visit you.');
    setConsultModal(null);
    setSelectedProject(null);
    nav('/bookings');
  };

  const wishlistCount = Object.values(liked).filter(Boolean).length;

  // Invalid category fallback
  if (!currentSpace) {
    return (
      <div className="fc-page fc-empty-container">
        <header className="fc-top-bar">
          <button type="button" className="fc-back-btn" onClick={() => nav('/furniture')}>
            <Icon name="back" size={20} />
          </button>
          <h1 className="fc-header-title">Category Not Found</h1>
        </header>
        <div className="fc-not-found-body">
          <Icon name="search" size={40} />
          <h2>Space Category Not Found</h2>
          <p>The space you are looking for does not exist or has been relocated.</p>
          <Link to="/furniture" className="fc-action-btn-primary">
            Explore All Furniture Spaces
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="fc-page">
      {/* ── TOP NAV HEADER ── */}
      <header className="fc-top-bar">
        <div className="fc-tb-left">
          <button
            type="button"
            className="fc-back-btn"
            onClick={() => nav('/furniture')}
            aria-label="Back to Furniture Ideas"
          >
            <Icon name="back" size={20} />
          </button>
          <div className="fc-tb-titles">
            <span className="fc-tb-eyebrow">SARVOTTAM DESIGN IDEAS</span>
            <h1 className="fc-tb-title">{currentSpace.title}</h1>
          </div>
        </div>

        <div className="fc-tb-actions">
          <button
            type="button"
            className={'fc-icon-btn' + (showSearch ? ' active' : '')}
            onClick={() => setShowSearch((v) => !v)}
            aria-label="Toggle Search"
          >
            <Icon name="search" size={18} />
          </button>
          <button
            type="button"
            className={'fc-icon-btn' + (wishlistOnly ? ' active' : '')}
            onClick={() => setWishlistOnly((v) => !v)}
            aria-label="Wishlist"
          >
            <Icon name="heart" size={18} />
            {wishlistCount > 0 && <span className="fc-badge-counter">{wishlistCount}</span>}
          </button>
        </div>
      </header>

      {/* Optional Search Bar */}
      {showSearch && (
        <div className="fc-search-banner">
          <div className="fc-search-input-wrap">
            <Icon name="search" size={16} />
            <input
              type="text"
              className="fc-search-input"
              placeholder={`Search ${currentSpaceMeta.name} by finish, size, or style...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
            {search && (
              <button type="button" className="fc-clear-search" onClick={() => setSearch('')}>
                <Icon name="close" size={14} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── BREADCRUMB & EDITORIAL HEADER ── */}
      <div className="fc-header-section">
        <nav className="fc-breadcrumb" aria-label="Breadcrumb">
          <Link to="/" className="fc-bc-link">Home</Link>
          <span className="fc-bc-sep">/</span>
          <Link to="/furniture" className="fc-bc-link">Furniture</Link>
          <span className="fc-bc-sep">/</span>
          <span className="fc-bc-current">{currentSpaceMeta.name}</span>
        </nav>

        <div className="fc-meta-pill-row">
          <span className="fc-results-pill">
            Showing {filteredDesigns.length} {filteredDesigns.length === 1 ? 'Design' : 'Designs'}
          </span>
          {wishlistOnly && <span className="fc-wishlist-filter-tag">Wishlist Filter Active</span>}
        </div>

        <h2 className="fc-headline">{currentSpace.title}</h2>
        <p className="fc-desc">
          {readMore ? currentSpace.longDesc : currentSpace.shortDesc}
        </p>

        <button
          type="button"
          className="fc-read-more-btn"
          onClick={() => setReadMore((prev) => !prev)}
        >
          <span>{readMore ? 'Read Less' : 'Read More About Specifications'}</span>
          <span className={'fc-chevron-icon' + (readMore ? ' open' : '')}>
            <Icon name="chevron" size={12} />
          </span>
        </button>

        {/* Promo Highlight Banner */}
        {currentSpace.promo && !wishlistOnly && (
          <div className="fc-promo-highlight">
            <div className="fc-ph-text">
              <strong>{currentSpace.promo.headline}</strong>
              <p>{currentSpace.promo.sub}</p>
            </div>
            <button
              type="button"
              className="fc-ph-cta"
              onClick={() => setConsultModal({ name: currentSpace.promo.headline })}
            >
              {currentSpace.promo.cta}
            </button>
          </div>
        )}
      </div>

      {/* ── SUBCATEGORY FILTER CHIPS ── */}
      {currentSpace.subcategories && currentSpace.subcategories.length > 1 && (
        <div className="fc-subcats-bar">
          <div className="fc-subcats-scroll">
            {currentSpace.subcategories.map((sub) => (
              <button
                key={sub}
                type="button"
                className={'fc-subcat-chip' + (activeSubcat === sub ? ' active' : '')}
                onClick={() => setActiveSubcat(sub)}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── MAIN DESIGN CARDS GRID ── */}
      <main className="fc-main-grid">
        {filteredDesigns.map((item) => (
          <article
            key={item.id}
            className="fc-design-card"
            onClick={() => setSelectedProject(item)}
          >
            <div className="fc-card-media">
              <img src={item.img} alt={item.name} loading="lazy" />
              <span className="fc-card-size-pill">{item.size}</span>
              <button
                type="button"
                className={'fc-card-heart' + (liked[item.id] ? ' on' : '')}
                onClick={(e) => toggleLike(item.id, item.name, e)}
                aria-label="Save to Wishlist"
              >
                <Icon name="heart" size={15} />
              </button>
            </div>

            <div className="fc-card-details">
              <span className="fc-card-finish-tag">{item.finish}</span>
              <h3 className="fc-card-title">{item.name}</h3>

              <div className="fc-card-price-row">
                <span className="fc-card-price-val">{item.price}</span>
                <span className="fc-card-rating">
                  <Icon name="star" size={12} /> {item.rating}
                </span>
              </div>

              {/* Dual Action Buttons */}
              <div className="fc-card-actions-row">
                <button
                  type="button"
                  className="fc-action-consult"
                  onClick={(e) => {
                    e.stopPropagation();
                    setConsultModal(item);
                  }}
                >
                  Book Free Consultation
                </button>
                <button
                  type="button"
                  className="fc-action-view"
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
          <div className="fc-empty-state">
            <Icon name="search" size={32} />
            <h3>No designs match this filter</h3>
            <p>Try selecting "All" or reset your search term to see all available designs.</p>
            <button
              type="button"
              className="fc-reset-btn"
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

      {/* ── PROJECT DETAIL SHEET (Livspace-inspired overlay) ── */}
      {selectedProject && (
        <div className="fc-sheet-overlay" onClick={() => setSelectedProject(null)}>
          <div className="fc-project-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="fc-ps-header">
              <button
                type="button"
                className="fc-ps-close"
                onClick={() => setSelectedProject(null)}
                aria-label="Close"
              >
                <Icon name="close" size={18} />
              </button>
              <h3 className="fc-ps-top-title">{selectedProject.name}</h3>
              <button
                type="button"
                className={'fc-ps-heart' + (liked[selectedProject.id] ? ' on' : '')}
                onClick={(e) => toggleLike(selectedProject.id, selectedProject.name, e)}
                aria-label="Save"
              >
                <Icon name="heart" size={18} />
              </button>
            </div>

            <div className="fc-ps-scroll">
              <div className="fc-ps-hero-img-wrap">
                <img src={selectedProject.img} alt={selectedProject.name} />
                <div className="fc-ps-hero-overlay">
                  <span className="fc-ps-size-tag">{selectedProject.size}</span>
                  <span className="fc-ps-rating-tag">
                    <Icon name="star" size={12} /> {selectedProject.rating} Rating
                  </span>
                </div>
              </div>

              <div className="fc-ps-content-body">
                <div className="fc-ps-meta-row">
                  <div>
                    <h2 className="fc-ps-title">{selectedProject.name}</h2>
                    <p className="fc-ps-finish">{selectedProject.finish}</p>
                  </div>
                  <div className="fc-ps-price-box">
                    <span className="fc-ps-price-lbl">Estimate Range</span>
                    <span className="fc-ps-price-val">{selectedProject.price}</span>
                  </div>
                </div>

                {/* SARVOTTAM Karigar Promise Box */}
                <div className="fc-karigar-promise-box">
                  <div className="fc-kp-icon">
                    <Icon name="shield" size={20} />
                  </div>
                  <div className="fc-kp-text">
                    <strong>100% Verified Local Rajasthani Master Woodwork</strong>
                    <p>Direct workshop pricing, premium IS-certified materials, and zero middleman inflation.</p>
                  </div>
                </div>

                {/* Technical Specifications Table */}
                <h4 className="fc-ps-section-heading">Design Specifications</h4>
                <div className="fc-ps-specs-table">
                  {selectedProject.specs?.map(([k, v]) => (
                    <div key={k} className="fc-ps-spec-row">
                      <span className="fc-ps-spec-key">{k}</span>
                      <strong className="fc-ps-spec-val">{v}</strong>
                    </div>
                  ))}
                </div>

                {/* Quick Consultation Callout */}
                <div className="fc-ps-consult-banner">
                  <div className="fc-ps-cb-text">
                    <strong>Want this exact look customized for your home?</strong>
                    <p>Get a free doorstep measurement visit with 3D CAD blueprints from our carpenters.</p>
                  </div>
                  <button
                    type="button"
                    className="fc-ps-cb-btn"
                    onClick={() => {
                      setConsultModal(selectedProject);
                    }}
                  >
                    Book Measurement Visit
                  </button>
                </div>
              </div>
            </div>

            {/* Sticky Previous / Next Project Footer */}
            <div className="fc-ps-nav-footer">
              {projectNav.prev && (
                <button
                  type="button"
                  className="fc-ps-nav-btn prev"
                  onClick={() => setSelectedProject(projectNav.prev)}
                >
                  <Icon name="chevron" size={14} />
                  <span className="fc-ps-nav-text">
                    <small>Previous</small>
                    <strong>{projectNav.prev.name}</strong>
                  </span>
                </button>
              )}

              {projectNav.next && (
                <button
                  type="button"
                  className="fc-ps-nav-btn next"
                  onClick={() => setSelectedProject(projectNav.next)}
                >
                  <span className="fc-ps-nav-text">
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

      {/* ── BOOK FREE CONSULTATION MODAL ── */}
      {consultModal && (
        <div className="fc-sheet-overlay" onClick={() => setConsultModal(null)}>
          <div className="fc-consult-modal" onClick={(e) => e.stopPropagation()}>
            <div className="fc-cm-head">
              <div>
                <span className="fc-cm-badge">Free Doorstep Visit · ₹0</span>
                <h3 className="fc-cm-title">Book Design Consultation</h3>
                <p className="fc-cm-sub">
                  Selected: <strong>{consultModal.name || currentSpace.title}</strong>
                </p>
              </div>
              <button
                type="button"
                className="fc-cm-close"
                onClick={() => setConsultModal(null)}
                aria-label="Close"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            <form className="fc-cm-form" onSubmit={handleConsultSubmit}>
              <div className="fc-cm-field">
                <label className="fc-cm-label">Your Name</label>
                <input
                  type="text"
                  className="fc-cm-input"
                  value={cName}
                  onChange={(e) => setCName(e.target.value)}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="fc-cm-field">
                <label className="fc-cm-label">Mobile Number</label>
                <div className="fc-cm-phone-wrap">
                  <span className="fc-cm-prefix">+91</span>
                  <input
                    type="tel"
                    maxLength={10}
                    className="fc-cm-input fc-cm-phone"
                    value={cPhone}
                    onChange={(e) => setCPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="10-digit number"
                    required
                  />
                </div>
              </div>

              <div className="fc-cm-field">
                <label className="fc-cm-label">Preferred Date &amp; Time Slot</label>
                <select
                  className="fc-cm-select"
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

              <div className="fc-cm-field">
                <label className="fc-cm-label">Doorstep Address / City</label>
                <input
                  type="text"
                  className="fc-cm-input"
                  value={cAddress}
                  onChange={(e) => setCAddress(e.target.value)}
                  placeholder="House/Plot No., Area, City in Rajasthan"
                  required
                />
              </div>

              <div className="fc-cm-field">
                <label className="fc-cm-label">Notes or Custom Requirements (Optional)</label>
                <textarea
                  className="fc-cm-textarea"
                  rows={2}
                  value={cNotes}
                  onChange={(e) => setCNotes(e.target.value)}
                  placeholder="e.g. Need L-shaped modular kitchen with chimney space..."
                />
              </div>

              <div className="fc-cm-guarantee-note">
                <Icon name="check" size={14} />
                <span>Zero obligation · No hidden inspection charges</span>
              </div>

              <button type="submit" className="fc-cm-submit-btn">
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

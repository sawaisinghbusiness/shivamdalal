import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import { useToast } from '../components/Toast';
import { useAppData } from '../store/AppData';
import { SPACES, FURNITURE_CATALOG } from '../data/furnitureData';
import './Furniture.css';

const LIKED_STORAGE_KEY = 'sarvottam_furniture_wishlist';

export default function Furniture() {
  const nav = useNavigate();
  const toast = useToast();
  const { user, addBookingDemo } = useAppData();

  // Active space & subcategory
  const [activeSpaceId, setActiveSpaceId] = useState('kitchen');
  const [activeSubcat, setActiveSubcat] = useState('All');
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [wishlistOnly, setWishlistOnly] = useState(false);
  const [readMore, setReadMore] = useState(false);

  // Wishlist state (persisted)
  const [liked, setLiked] = useState(() => {
    try {
      const saved = localStorage.getItem(LIKED_STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Modals state
  const [selectedProject, setSelectedProject] = useState(null);
  const [consultModal, setConsultModal] = useState(null); // project or promo data

  // Consultation Form State
  const [cName, setCName] = useState(user?.name || 'Shivam Singh');
  const [cPhone, setCPhone] = useState(user?.phone?.replace('+91 ', '') || '9876543210');
  const [cAddress, setCAddress] = useState('Indra Colony, Barmer, Rajasthan');
  const [cDate, setCDate] = useState('Tomorrow (Morning)');
  const [cNotes, setCNotes] = useState('');

  // Persist wishlist
  useEffect(() => {
    try {
      localStorage.setItem(LIKED_STORAGE_KEY, JSON.stringify(liked));
    } catch (e) {
      console.warn('Could not save wishlist', e);
    }
  }, [liked]);

  const toggleLike = (id, title, e) => {
    e.stopPropagation();
    setLiked((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      toast(next[id] ? `Added to wishlist: ${title}` : 'Removed from wishlist');
      return next;
    });
  };

  const currentSpace = useMemo(() => {
    return FURNITURE_CATALOG[activeSpaceId] || FURNITURE_CATALOG.kitchen;
  }, [activeSpaceId]);

  // Reset subcategory when space changes
  const handleSpaceChange = (spaceId) => {
    setActiveSpaceId(spaceId);
    setActiveSubcat('All');
    setReadMore(false);
  };

  // Filtered designs
  const filteredDesigns = useMemo(() => {
    return currentSpace.designs.filter((item) => {
      const matchesSubcat = activeSubcat === 'All' || item.subcat === activeSubcat;
      const matchesSearch =
        !search.trim() ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.finish.toLowerCase().includes(search.toLowerCase()) ||
        item.size.toLowerCase().includes(search.toLowerCase());
      const matchesWishlist = !wishlistOnly || liked[item.id];
      return matchesSubcat && matchesSearch && matchesWishlist;
    });
  }, [currentSpace, activeSubcat, search, wishlistOnly, liked]);

  // Trending designs for carousel
  const trendingDesigns = useMemo(() => {
    return currentSpace.designs.filter((d) => d.isTrending);
  }, [currentSpace]);

  // Previous & Next navigation in Project Detail Sheet
  const projectNav = useMemo(() => {
    if (!selectedProject) return { prev: null, next: null };
    const list = currentSpace.designs;
    const idx = list.findIndex((p) => p.id === selectedProject.id);
    return {
      prev: idx > 0 ? list[idx - 1] : list[list.length - 1],
      next: idx < list.length - 1 ? list[idx + 1] : list[0],
    };
  }, [selectedProject, currentSpace]);

  // Consultation booking submission
  const handleConsultSubmit = (e) => {
    e.preventDefault();
    if (!cPhone || cPhone.length < 10) {
      toast('Please enter a valid 10-digit mobile number');
      return;
    }

    const title = consultModal?.name || `${currentSpace.title} Consultation`;

    addBookingDemo({
      service: `Consultation: ${title}`,
      icon: 'hammer',
      karigar: 'Master Karigar assigned on schedule',
      amount: 0,
      status: 'upcoming',
      notes: `Preferred slot: ${cDate}. Address: ${cAddress}. Details: ${cNotes || 'Standard measurement'}`,
    });

    toast('Free Consultation booked! Our master karigar will visit you.');
    setConsultModal(null);
    setSelectedProject(null);
    nav('/bookings');
  };

  const wishlistCount = Object.values(liked).filter(Boolean).length;

  return (
    <div className="page fn-design-page">
      {/* ── TOP NAV HEADER ── */}
      <header className="fn-top-bar">
        <div className="fn-tb-left">
          <button type="button" className="fn-back-btn" onClick={() => nav('/')} aria-label="Back to Home">
            <Icon name="back" size={20} />
          </button>
          <div className="fn-tb-titles">
            <h1 className="fn-main-title">Design Ideas &amp; Furniture</h1>
            <p className="fn-main-sub">Verified Rajasthan Karigars &amp; Custom Woodwork</p>
          </div>
        </div>

        <div className="fn-tb-actions">
          <button
            type="button"
            className={'fn-icon-btn' + (showSearch ? ' active' : '')}
            onClick={() => setShowSearch((v) => !v)}
            aria-label="Toggle Search"
          >
            <Icon name="search" size={19} />
          </button>
          <button
            type="button"
            className={'fn-icon-btn' + (wishlistOnly ? ' active' : '')}
            onClick={() => setWishlistOnly((v) => !v)}
            aria-label="Wishlist"
          >
            <Icon name="heart" size={19} />
            {wishlistCount > 0 && <span className="fn-badge-counter">{wishlistCount}</span>}
          </button>
        </div>
      </header>

      {/* Optional Search Bar */}
      {showSearch && (
        <div className="fn-search-banner">
          <div className="fn-search-input-wrap">
            <Icon name="search" size={16} />
            <input
              type="text"
              className="fn-search-input"
              placeholder="Search kitchen, bed, wardrobe, teak finish, size..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
            {search && (
              <button type="button" className="fn-clear-search" onClick={() => setSearch('')}>
                <Icon name="close" size={14} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── 1. SPACES TABS (Horizontal Scroll) ── */}
      <nav className="fn-spaces-nav" aria-label="Home Spaces">
        <div className="fn-spaces-scroll">
          {SPACES.map((sp) => {
            const isActive = activeSpaceId === sp.id;
            return (
              <button
                key={sp.id}
                type="button"
                className={'fn-space-tab' + (isActive ? ' active' : '')}
                onClick={() => handleSpaceChange(sp.id)}
              >
                <span className="fn-space-name">{sp.name}</span>
                {isActive && <span className="fn-active-indicator" />}
              </button>
            );
          })}
        </div>
      </nav>

      {/* ── 2. EDITORIAL CATEGORY HEADER ── */}
      <section className="fn-editorial-box">
        <div className="fn-editorial-meta">
          <span className="fn-results-pill">
            Showing {filteredDesigns.length} {filteredDesigns.length === 1 ? 'Design' : 'Designs'}
          </span>
          {wishlistOnly && <span className="fn-wishlist-filter-tag">Wishlist Filter Active</span>}
        </div>
        <h2 className="fn-cat-headline">{currentSpace.title}</h2>
        <p className="fn-cat-desc">
          {readMore ? currentSpace.longDesc : currentSpace.shortDesc}
        </p>
        <button
          type="button"
          className="fn-read-more-btn"
          onClick={() => setReadMore((prev) => !prev)}
        >
          {readMore ? 'Read Less' : 'Read More'}
          <Icon name="chevron" size={12} />
        </button>
      </section>

      {/* ── 3. TOP TRENDING DESIGNS CAROUSEL ── */}
      {trendingDesigns.length > 0 && !wishlistOnly && (
        <section className="fn-trending-section">
          <div className="fn-trending-head">
            <div className="fn-th-left">
              <span className="fn-trend-badge">
                <Icon name="trend" size={13} />
                Trending
              </span>
              <h3 className="fn-trending-title">Top Trending {currentSpace.title}</h3>
            </div>
            <span className="fn-trending-date">Curated September 2026</span>
          </div>

          <div className="fn-trending-carousel">
            {trendingDesigns.map((tr) => (
              <div
                key={tr.id}
                className="fn-trend-card"
                onClick={() => setSelectedProject(tr)}
              >
                <div className="fn-tc-img-wrap">
                  <img src={tr.img} alt={tr.name} loading="lazy" />
                  <span className="fn-tc-size">{tr.size}</span>
                  <button
                    type="button"
                    className={'fn-card-heart' + (liked[tr.id] ? ' on' : '')}
                    onClick={(e) => toggleLike(tr.id, tr.name, e)}
                    aria-label="Save to Wishlist"
                  >
                    <Icon name="heart" size={15} />
                  </button>
                </div>

                <div className="fn-tc-info">
                  <h4 className="fn-tc-title">{tr.name}</h4>
                  <p className="fn-tc-finish">{tr.finish}</p>
                  <div className="fn-tc-foot">
                    <span className="fn-tc-price">{tr.price}</span>
                    <button
                      type="button"
                      className="fn-tc-consult-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setConsultModal(tr);
                      }}
                    >
                      Book Consultation
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── 4. SUBCATEGORY FILTER CHIPS ── */}
      <div className="fn-subcats-bar">
        <div className="fn-subcats-scroll">
          {currentSpace.subcategories.map((sub) => (
            <button
              key={sub}
              type="button"
              className={'fn-subcat-chip' + (activeSubcat === sub ? ' active' : '')}
              onClick={() => setActiveSubcat(sub)}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* ── 5. MAIN 2-COLUMN DESIGN GRID ── */}
      <main className="fn-main-grid">
        {filteredDesigns.map((item, index) => {
          return (
            <div key={item.id} className="fn-grid-item">
              <article className="fn-design-card" onClick={() => setSelectedProject(item)}>
                <div className="fn-card-image-box">
                  <img src={item.img} alt={item.name} loading="lazy" />
                  <span className="fn-card-size-pill">{item.size}</span>
                  <button
                    type="button"
                    className={'fn-card-heart' + (liked[item.id] ? ' on' : '')}
                    onClick={(e) => toggleLike(item.id, item.name, e)}
                    aria-label="Save to Wishlist"
                  >
                    <Icon name="heart" size={15} />
                  </button>
                </div>

                <div className="fn-card-details">
                  <span className="fn-card-finish-tag">{item.finish}</span>
                  <h3 className="fn-card-title">{item.name}</h3>

                  <div className="fn-card-price-row">
                    <span className="fn-card-price-val">{item.price}</span>
                    <span className="fn-card-rating">
                      <Icon name="star" size={12} /> {item.rating}
                    </span>
                  </div>

                  {/* Dual Actions: Book Consultation & View Project */}
                  <div className="fn-card-actions-row">
                    <button
                      type="button"
                      className="fn-action-consult"
                      onClick={(e) => {
                        e.stopPropagation();
                        setConsultModal(item);
                      }}
                    >
                      Book Free Consultation
                    </button>
                    <button
                      type="button"
                      className="fn-action-view"
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

              {/* Integrated Promotional Card after item index 1 (Livspace style) */}
              {index === 1 && !wishlistOnly && (
                <div className="fn-promo-card-wrapper">
                  <div className="fn-inline-promo-card">
                    <div className="fn-promo-badge">Rajasthan Karigar Direct</div>
                    <h3 className="fn-promo-title">{currentSpace.promo.headline}</h3>
                    <p className="fn-promo-sub">{currentSpace.promo.sub}</p>
                    <button
                      type="button"
                      className="fn-promo-cta-btn"
                      onClick={() => setConsultModal({ name: currentSpace.promo.headline })}
                    >
                      {currentSpace.promo.cta}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredDesigns.length === 0 && (
          <div className="fn-empty-state">
            <Icon name="search" size={32} />
            <h3>No designs found in this filter</h3>
            <p>Try selecting "All" or clear your search keyword to view all curated designs.</p>
            <button
              type="button"
              className="fn-reset-btn"
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

      {/* ── 6. PROJECT DETAIL SHEET (Livspace-inspired viewer) ── */}
      {selectedProject && (
        <div className="fn-sheet-overlay" onClick={() => setSelectedProject(null)}>
          <div className="fn-project-sheet" onClick={(e) => e.stopPropagation()}>
            {/* Sheet Top Controls */}
            <div className="fn-ps-header">
              <button
                type="button"
                className="fn-ps-close"
                onClick={() => setSelectedProject(null)}
                aria-label="Close"
              >
                <Icon name="close" size={18} />
              </button>
              <h3 className="fn-ps-top-title">{selectedProject.name}</h3>
              <button
                type="button"
                className={'fn-ps-heart' + (liked[selectedProject.id] ? ' on' : '')}
                onClick={(e) => toggleLike(selectedProject.id, selectedProject.name, e)}
                aria-label="Save"
              >
                <Icon name="heart" size={18} />
              </button>
            </div>

            {/* Scrollable Sheet Content */}
            <div className="fn-ps-scroll">
              <div className="fn-ps-hero-img-wrap">
                <img src={selectedProject.img} alt={selectedProject.name} />
                <div className="fn-ps-hero-overlay">
                  <span className="fn-ps-size-tag">{selectedProject.size}</span>
                  <span className="fn-ps-rating-tag">
                    <Icon name="star" size={12} /> {selectedProject.rating} Rating
                  </span>
                </div>
              </div>

              <div className="fn-ps-content-body">
                <div className="fn-ps-meta-row">
                  <div>
                    <h2 className="fn-ps-title">{selectedProject.name}</h2>
                    <p className="fn-ps-finish">{selectedProject.finish}</p>
                  </div>
                  <div className="fn-ps-price-box">
                    <span className="fn-ps-price-lbl">Estimate Range</span>
                    <span className="fn-ps-price-val">{selectedProject.price}</span>
                  </div>
                </div>

                {/* SARVOTTAM Karigar Promise Box */}
                <div className="fn-karigar-promise-box">
                  <div className="fn-kp-icon">
                    <Icon name="shield" size={20} />
                  </div>
                  <div className="fn-kp-text">
                    <strong>100% Verified Local Rajasthani Master Woodwork</strong>
                    <p>Direct workshop pricing, premium IS-certified materials, and zero middleman inflation.</p>
                  </div>
                </div>

                {/* Technical Specifications Table */}
                <h4 className="fn-ps-section-heading">Design Specifications</h4>
                <div className="fn-ps-specs-table">
                  {selectedProject.specs?.map(([k, v]) => (
                    <div key={k} className="fn-ps-spec-row">
                      <span className="fn-ps-spec-key">{k}</span>
                      <strong className="fn-ps-spec-val">{v}</strong>
                    </div>
                  ))}
                </div>

                {/* Quick Consultation Callout */}
                <div className="fn-ps-consult-banner">
                  <div className="fn-ps-cb-text">
                    <strong>Want this exact look customized for your home?</strong>
                    <p>Get a free doorstep measurement visit with 3D CAD blueprints from our carpenters.</p>
                  </div>
                  <button
                    type="button"
                    className="fn-ps-cb-btn"
                    onClick={() => {
                      setConsultModal(selectedProject);
                    }}
                  >
                    Book Measurement Visit
                  </button>
                </div>
              </div>
            </div>

            {/* Sticky Previous / Next Project Footer (Livspace style) */}
            <div className="fn-ps-nav-footer">
              {projectNav.prev && (
                <button
                  type="button"
                  className="fn-ps-nav-btn prev"
                  onClick={() => setSelectedProject(projectNav.prev)}
                >
                  <Icon name="chevron" size={14} />
                  <span className="fn-ps-nav-text">
                    <small>Previous</small>
                    <strong>{projectNav.prev.name}</strong>
                  </span>
                </button>
              )}

              {projectNav.next && (
                <button
                  type="button"
                  className="fn-ps-nav-btn next"
                  onClick={() => setSelectedProject(projectNav.next)}
                >
                  <span className="fn-ps-nav-text">
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

      {/* ── 7. BOOK FREE CONSULTATION MODAL ── */}
      {consultModal && (
        <div className="fn-sheet-overlay" onClick={() => setConsultModal(null)}>
          <div className="fn-consult-modal" onClick={(e) => e.stopPropagation()}>
            <div className="fn-cm-head">
              <div>
                <span className="fn-cm-badge">Free Doorstep Visit · ₹0</span>
                <h3 className="fn-cm-title">Book Design Consultation</h3>
                <p className="fn-cm-sub">
                  Selected: <strong>{consultModal.name || currentSpace.title}</strong>
                </p>
              </div>
              <button
                type="button"
                className="fn-cm-close"
                onClick={() => setConsultModal(null)}
                aria-label="Close"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            <form className="fn-cm-form" onSubmit={handleConsultSubmit}>
              <div className="fn-cm-field">
                <label className="fn-cm-label">Your Name</label>
                <input
                  type="text"
                  className="fn-cm-input"
                  value={cName}
                  onChange={(e) => setCName(e.target.value)}
                  required
                />
              </div>

              <div className="fn-cm-field">
                <label className="fn-cm-label">Mobile Number</label>
                <div className="fn-cm-phone-wrap">
                  <span className="fn-cm-prefix">+91</span>
                  <input
                    type="tel"
                    maxLength={10}
                    className="fn-cm-input fn-cm-phone"
                    value={cPhone}
                    onChange={(e) => setCPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="10-digit number"
                    required
                  />
                </div>
              </div>

              <div className="fn-cm-field">
                <label className="fn-cm-label">Preferred Date &amp; Time</label>
                <select
                  className="fn-cm-select"
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

              <div className="fn-cm-field">
                <label className="fn-cm-label">Doorstep Address / City</label>
                <input
                  type="text"
                  className="fn-cm-input"
                  value={cAddress}
                  onChange={(e) => setCAddress(e.target.value)}
                  placeholder="House/Plot No., Area, City in Rajasthan"
                  required
                />
              </div>

              <div className="fn-cm-field">
                <label className="fn-cm-label">Notes or Custom Requirements (Optional)</label>
                <textarea
                  className="fn-cm-textarea"
                  rows={2}
                  value={cNotes}
                  onChange={(e) => setCNotes(e.target.value)}
                  placeholder="e.g. Need L-shaped modular kitchen with chimney space..."
                />
              </div>

              <div className="fn-cm-guarantee-note">
                <Icon name="check" size={14} />
                <span>Zero obligation · No hidden inspection charges</span>
              </div>

              <button type="submit" className="fn-cm-submit-btn">
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

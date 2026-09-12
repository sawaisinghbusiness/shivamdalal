import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Icon from '../components/Icon';
import { useToast } from '../components/Toast';
import { FURNITURE_CATALOG, SPACES } from '../data/furnitureData';
import './FurnitureCategory.css';

const LIKED_STORAGE_KEY = 'sarvottam_furniture_wishlist';

export default function FurnitureCategory() {
  const { categorySlug } = useParams();
  const nav = useNavigate();
  const toast = useToast();

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

  const wishlistCount = useMemo(() => {
    return Object.values(liked).filter(Boolean).length;
  }, [liked]);

  const openConsultation = (item = null) => {
    nav('/furniture/consultation', {
      state: { design: item, space: currentSpaceMeta },
    });
  };

  if (!currentSpace) {
    return (
      <div className="page lvc-page">
        <header className="lvc-top-nav">
          <button type="button" className="lvc-back-btn" onClick={() => nav('/furniture')}>
            <Icon name="back" size={20} />
          </button>
          <span className="lvc-top-title">Space Not Found</span>
        </header>
        <div className="lvc-empty-state">
          <Icon name="search" size={40} />
          <h2>Space Not Found</h2>
          <p>The space you are looking for is not currently available.</p>
          <Link to="/furniture" className="lvc-btn-fill">
            Explore All Spaces
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page lvc-page">
      {/* ── TOP NAV HEADER ── */}
      <header className="lvc-top-nav">
        <div className="lvc-nav-left">
          <button
            type="button"
            className="lvc-back-btn"
            onClick={() => nav('/furniture')}
            aria-label="Back to Furniture"
          >
            <Icon name="back" size={20} />
          </button>
          <div className="lvc-title-group">
            <span className="lvc-sub-badge">{currentSpaceMeta.name}</span>
            <h2 className="lvc-top-title">{currentSpace.title}</h2>
          </div>
        </div>

        <div className="lvc-nav-right">
          <button
            type="button"
            className={'lvc-icon-btn' + (showSearch ? ' active' : '')}
            onClick={() => setShowSearch((v) => !v)}
            aria-label="Search designs"
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
                onClick={() => openConsultation(null)}
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
              onClick={() => nav(`/furniture/${categorySlug}/${item.id}`)}
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
                      openConsultation(item);
                    }}
                  >
                    Book Free Consultation
                  </button>
                  <button
                    type="button"
                    className="lvc-btn-cta-outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      nav(`/furniture/${categorySlug}/${item.id}`);
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

      <div className="bottom-spacer" />
    </div>
  );
}

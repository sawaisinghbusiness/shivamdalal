import { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Icon from '../components/Icon';
import { useToast } from '../components/Toast';
import { useAppData } from '../store/AppData';
import { FURNITURE_CATALOG, SPACES } from '../data/furnitureData';
import './FurnitureDetail.css';

const LIKED_STORAGE_KEY = 'sarvottam_furniture_wishlist';

export default function FurnitureDetail() {
  const { categorySlug, designId } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const { user, addBookingDemo } = useAppData();
  const scrollRef = useRef(null);

  // Scroll to top whenever categorySlug or designId changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [categorySlug, designId]);

  // Current category data
  const currentSpace = useMemo(() => {
    return FURNITURE_CATALOG[categorySlug] || null;
  }, [categorySlug]);

  const currentSpaceMeta = useMemo(() => {
    return SPACES.find((s) => s.id === categorySlug) || { name: currentSpace?.title || 'Furniture' };
  }, [categorySlug, currentSpace]);

  // Current design
  const designs = currentSpace?.designs || [];
  const currentDesign = useMemo(() => {
    return designs.find((d) => d.id === designId) || designs[0] || null;
  }, [designs, designId]);

  // Previous and Next design navigation
  const { prevDesign, nextDesign } = useMemo(() => {
    if (!currentDesign || designs.length === 0) return { prevDesign: null, nextDesign: null };
    const idx = designs.findIndex((d) => d.id === currentDesign.id);
    return {
      prevDesign: idx > 0 ? designs[idx - 1] : designs[designs.length - 1],
      nextDesign: idx < designs.length - 1 ? designs[idx + 1] : designs[0],
    };
  }, [currentDesign, designs]);

  // Other designs in this category (for Related Designs carousel)
  const relatedDesigns = useMemo(() => {
    return designs.filter((d) => d.id !== currentDesign?.id);
  }, [designs, currentDesign]);

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

  const isLiked = currentDesign ? !!liked[currentDesign.id] : false;

  const toggleWishlist = () => {
    if (!currentDesign) return;
    setLiked((prev) => {
      const next = { ...prev, [currentDesign.id]: !prev[currentDesign.id] };
      toast(next[currentDesign.id] ? `Saved to wishlist: ${currentDesign.name}` : 'Removed from wishlist');
      return next;
    });
  };

  // Consultation booking form state
  const [cName, setCName] = useState(user?.name || '');
  const [cPhone, setCPhone] = useState(user?.phone?.replace('+91 ', '') || '');
  const [cAddress, setCAddress] = useState('Barmer, Rajasthan');
  const [cDate, setCDate] = useState('Tomorrow (Morning 09:00 AM – 12:00 PM)');
  const [cNotes, setCNotes] = useState('');
  const [booked, setBooked] = useState(false);

  const handleConsultSubmit = (e) => {
    e.preventDefault();
    const cleanPhone = cPhone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      toast('Please enter a valid 10-digit mobile number');
      return;
    }

    addBookingDemo({
      service: `Consultation: ${currentDesign.name}`,
      icon: 'hammer',
      karigar: 'Senior Karigar Supervisor assigned on schedule',
      amount: 0,
      status: 'upcoming',
      notes: `Design: ${currentDesign.name} (${currentDesign.size}). Slot: ${cDate}. Address: ${cAddress}. Notes: ${cNotes || '3D Laser Measurement'}`,
    });

    setBooked(true);
    toast('Consultation booked! Our master karigar will visit you.');
  };

  if (!currentDesign) {
    return (
      <div className="fd-page">
        <header className="fd-top-bar">
          <button type="button" className="fd-nav-btn" onClick={() => nav('/furniture')}>
            <Icon name="back" size={20} />
          </button>
          <span className="fd-bar-title">Design Not Found</span>
        </header>
        <div className="fd-not-found">
          <Icon name="search" size={40} />
          <h2>Design Not Found</h2>
          <p>The design you are looking for does not exist.</p>
          <Link to={`/furniture/${categorySlug || 'kitchen'}`} className="fd-btn-fill">
            Back to Category
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="fd-page">
      {/* ── STICKY TOP APP BAR (EXACT LIVSPACE HEADER) ── */}
      <header className="fd-top-bar">
        <button
          type="button"
          className="fd-round-btn"
          onClick={() => nav(`/furniture/${categorySlug}`)}
          aria-label="Back to Category"
        >
          <Icon name="close" size={18} />
        </button>

        <h1 className="fd-bar-title">{currentDesign.name}</h1>

        <button
          type="button"
          className={'fd-round-btn' + (isLiked ? ' on' : '')}
          onClick={toggleWishlist}
          aria-label="Wishlist"
        >
          <Icon name="heart" size={18} />
        </button>
      </header>

      <div className="fd-scroll-body" ref={scrollRef}>
        <main className="fd-content">
        {/* ── BREADCRUMB ── */}
        <nav className="fd-breadcrumb" aria-label="Breadcrumb">
          <Link to="/" className="fd-bc-link">Home</Link>
          <span className="fd-bc-sep">/</span>
          <Link to="/furniture" className="fd-bc-link">Furniture</Link>
          <span className="fd-bc-sep">/</span>
          <Link to={`/furniture/${categorySlug}`} className="fd-bc-link">
            {currentSpaceMeta.name}
          </Link>
          <span className="fd-bc-sep">/</span>
          <span className="fd-bc-current">{currentDesign.name}</span>
        </nav>

        {/* ── HERO IMAGE SECTION ── */}
        <div className="fd-hero-image-wrap">
          <img
            src={currentDesign.img}
            alt={currentDesign.name}
            className="fd-hero-img"
          />
          <div className="fd-hero-badge-left">{currentDesign.size}</div>
          <div className="fd-hero-badge-right">
            <Icon name="star" size={13} />
            <span>{currentDesign.rating} Rating</span>
          </div>
        </div>

        {/* ── TITLE & PRICE BLOCK ── */}
        <div className="fd-meta-card">
          <div className="fd-title-col">
            <h2 className="fd-design-title">{currentDesign.name}</h2>
            <p className="fd-design-finish">{currentDesign.finish}</p>
          </div>

          <div className="fd-price-col">
            <span className="fd-price-label">Estimate Range</span>
            <span className="fd-price-value">{currentDesign.price}</span>
          </div>
        </div>

        {/* ── 100% VERIFIED RAJASTHAN ARTISANS PROMISE BOX ── */}
        <div className="fd-promise-box">
          <div className="fd-promise-ic">
            <Icon name="shield" size={20} />
          </div>
          <div className="fd-promise-text">
            <strong>100% Verified Rajasthan Artisans</strong>
            <p>Direct workshop fabrication with 10-year warranty and zero showroom markup.</p>
          </div>
        </div>

        {/* ── TECHNICAL SPECIFICATIONS TABLE (MATCHES SCREENSHOT) ── */}
        <section className="fd-specs-section">
          <h3 className="fd-specs-heading">Technical Specifications</h3>
          <div className="fd-specs-table">
            {currentDesign.specs?.map(([k, v]) => (
              <div key={k} className="fd-spec-row">
                <span className="fd-spec-key">{k}</span>
                <span className="fd-spec-val">{v}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── IN-PAGE CONSULTATION BOOKING CARD ── */}
        <section id="book-consultation" className="fd-consult-section">
          <div className="fd-consult-card">
            <div className="fd-cc-head">
              <span className="fd-cc-badge">100% Free Doorstep Visit · ₹0</span>
              <h3 className="fd-cc-title">Want this exact look customized for your home?</h3>
              <p className="fd-cc-sub">
                Our master karigar visits your residence with material swatches, laser measurement tools, and 3D CAD layouts.
              </p>
            </div>

            {booked ? (
              <div className="fd-booked-state">
                <div className="fd-booked-icon">
                  <Icon name="check" size={26} />
                </div>
                <h4>Measurement Visit Scheduled!</h4>
                <p>
                  Thank you, <strong>{cName}</strong>. Our supervisor will contact you at <strong>+91 {cPhone}</strong> to confirm your slot: <strong>{cDate}</strong>.
                </p>
                <div className="fd-booked-actions">
                  <button
                    type="button"
                    className="fd-btn-fill"
                    onClick={() => nav('/bookings')}
                  >
                    View in My Bookings
                  </button>
                  <button
                    type="button"
                    className="fd-btn-outline"
                    onClick={() => setBooked(false)}
                  >
                    Book Another Slot
                  </button>
                </div>
              </div>
            ) : (
              <form className="fd-consult-form" onSubmit={handleConsultSubmit}>
                <div className="fd-form-row">
                  <div className="fd-field">
                    <label className="fd-label">Your Name</label>
                    <input
                      type="text"
                      className="fd-input"
                      placeholder="e.g. Shivam Singh"
                      value={cName}
                      onChange={(e) => setCName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="fd-field">
                    <label className="fd-label">Mobile Number</label>
                    <div className="fd-phone-box">
                      <span className="fd-prefix">+91</span>
                      <input
                        type="tel"
                        maxLength={10}
                        className="fd-input fd-phone-inp"
                        placeholder="10-digit number"
                        value={cPhone}
                        onChange={(e) => setCPhone(e.target.value.replace(/\D/g, ''))}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="fd-form-row">
                  <div className="fd-field">
                    <label className="fd-label">Preferred Time Slot</label>
                    <select
                      className="fd-select"
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

                  <div className="fd-field">
                    <label className="fd-label">Address / Rajasthan City</label>
                    <input
                      type="text"
                      className="fd-input"
                      placeholder="Area, Colony, City"
                      value={cAddress}
                      onChange={(e) => setCAddress(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="fd-field">
                  <label className="fd-label">Custom Requirements or Dimensions (Optional)</label>
                  <textarea
                    rows={2}
                    className="fd-textarea"
                    placeholder="Approx room size, preferred finishes or modifications..."
                    value={cNotes}
                    onChange={(e) => setCNotes(e.target.value)}
                  />
                </div>

                <button type="submit" className="fd-submit-btn">
                  Book Free Doorstep Measurement
                </button>
              </form>
            )}
          </div>
        </section>

        {/* ── RELATED DESIGNS IN THIS SPACE CAROUSEL ── */}
        {relatedDesigns.length > 0 && (
          <section className="fd-related-section">
            <div className="fd-sec-head">
              <h3 className="fd-sec-title">More {currentSpaceMeta.name} Designs</h3>
              <p className="fd-sec-sub">Explore alternative finishes and layouts</p>
            </div>

            <div className="fd-related-track">
              {relatedDesigns.map((rel) => (
                <div
                  key={rel.id}
                  className="fd-rel-card"
                  onClick={() => nav(`/furniture/${categorySlug}/${rel.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      nav(`/furniture/${categorySlug}/${rel.id}`);
                    }
                  }}
                >
                  <div className="fd-rel-img-wrap">
                    <img src={rel.img} alt={rel.name} loading="lazy" />
                    <span className="fd-rel-dim">{rel.size}</span>
                  </div>
                  <div className="fd-rel-body">
                    <h4 className="fd-rel-title">{rel.name}</h4>
                    <p className="fd-rel-price">{rel.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
        </main>
      </div>

      {/* ── STICKY FOOTER PREVIOUS / NEXT NAVIGATION BAR (MATCHES SCREENSHOT) ── */}
      <footer className="fd-sticky-nav-bar">
        {prevDesign && (
          <button
            type="button"
            className="fd-nav-btn prev"
            onClick={() => nav(`/furniture/${categorySlug}/${prevDesign.id}`)}
            aria-label={`Previous Design: ${prevDesign.name}`}
          >
            <span className="fd-nav-btn-ic">
              <Icon name="chevron" size={14} />
            </span>
            <span className="fd-nav-btn-text">
              <small>PREVIOUS</small>
              <strong>{prevDesign.name}</strong>
            </span>
          </button>
        )}

        {nextDesign && (
          <button
            type="button"
            className="fd-nav-btn next"
            onClick={() => nav(`/furniture/${categorySlug}/${nextDesign.id}`)}
            aria-label={`Next Design: ${nextDesign.name}`}
          >
            <span className="fd-nav-btn-text">
              <small>NEXT DESIGN</small>
              <strong>{nextDesign.name}</strong>
            </span>
            <span className="fd-nav-btn-ic">
              <Icon name="chevron" size={14} />
            </span>
          </button>
        )}
      </footer>
    </div>
  );
}

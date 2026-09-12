import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Icon from '../components/Icon';
import { useToast } from '../components/Toast';
import { useAppData } from '../store/AppData';
import { SPACES, FURNITURE_CATALOG } from '../data/furnitureData';
import './Furniture.css';

// Pre-configured curated collections for Section C carousels
const STYLE_COLLECTION = [
  {
    id: 'bd-03',
    slug: 'bedroom',
    title: 'Royal Rajasthani Sheesham Four-Poster Bed',
    tag: 'Heritage Luxe',
    price: '₹55,000 – ₹89,000',
    img: 'https://images.unsplash.com/photo-1540518614846-7ede433c4b69?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'kt-05',
    slug: 'kitchen',
    title: 'Royal Emerald Green & Gold Trim U-Shaped Kitchen',
    tag: 'Modern Royal',
    price: '₹2,10,000 – ₹3,20,000',
    img: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'lv-02',
    slug: 'living',
    title: 'Heritage Sheesham 3+1+1 Sofa Suite with Brass Studs',
    tag: 'Artisan Woodwork',
    price: '₹45,000 – ₹72,000',
    img: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'wd-02',
    slug: 'wardrobe',
    title: 'Tinted Black Glass Walk-in Wardrobe with LED Profiles',
    tag: 'Contemporary Chic',
    price: '₹1,10,000 – ₹1,80,000',
    img: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80',
  },
];

const RECENTLY_ADDED = [
  {
    id: 'lv-04',
    slug: 'living',
    title: 'Fluted Wood Nesting Coffee Table Pair',
    tag: 'Natural Ash & Slate',
    price: '₹12,000 – ₹19,500',
    img: 'https://images.unsplash.com/photo-1532372320572-cda25653a26d?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'kt-04',
    slug: 'kitchen',
    title: 'Compact Straight Kitchen for Urban Apartments',
    tag: 'Light Ash Wood',
    price: '₹85,000 – ₹1,30,000',
    img: 'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'bd-04',
    slug: 'bedroom',
    title: 'Scandi Light Birch Bed with Floating Nightstands',
    tag: 'Birch Veneer',
    price: '₹32,000 – ₹48,000',
    img: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'tv-02',
    slug: 'tv_unit',
    title: 'Minimalist Teak Floating Media Console',
    tag: 'Solid CP Teak',
    price: '₹16,500 – ₹26,000',
    img: 'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'wd-03',
    slug: 'wardrobe',
    title: 'Classic 4-Door Hinged Wardrobe with Loft Storage',
    tag: 'Warm Ivory PU',
    price: '₹48,000 – ₹78,000',
    img: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800&q=80',
  },
];

// Curated design counts per category tile
const DESIGN_COUNTS = {
  kitchen: '450+ Designs',
  bedroom: '380+ Designs',
  living: '520+ Designs',
  wardrobe: '260+ Designs',
  tv_unit: '220+ Designs',
  dining: '190+ Designs',
  pooja: '140+ Designs',
  study: '120+ Designs',
  kids: '160+ Designs',
  balcony: '110+ Designs',
};

// FAQ data
const FAQS = [
  {
    q: 'How does SARVOTTAM ensure woodwork quality and transparent pricing?',
    a: 'All our furniture and modular cabinetry are crafted directly by verified Rajasthan master karigars using IS-710 Boiling Water Proof (BWP) plywood, seasoned solid Sheesham, and genuine Teak wood. Because we operate workshops locally without middlemen, our prices are up to 35% lower than retail interior design studios.',
  },
  {
    q: 'Can I customize the dimensions, internal layout, and laminate finishes?',
    a: 'Yes, absolutely. Every piece is 100% made to order according to your exact room measurements. You can select from high-gloss acrylic, matte suede laminate, PU lacquer, natural veneers, and fluted acoustic glass with custom internal drawers and organizers.',
  },
  {
    q: 'Is the doorstep measurement visit and 3D CAD design really free?',
    a: 'Yes. When you request a consultation, a senior master karigar visits your home with material finish catalogs, laminate swatches, and measuring equipment. We deliver accurate 3D floorplan blueprints and transparent quotation breakdowns with zero obligation.',
  },
  {
    q: 'What warranty is provided on custom furniture and hardware?',
    a: 'We provide a 10-Year Karigar Warranty on structural carcass plywood and solid wood framing, along with official manufacturer warranties on international hardware fittings including Blum, Hettich, and Hafele soft-close systems.',
  },
  {
    q: 'What is the typical fabrication and installation timeline across Rajasthan?',
    a: 'Standard modular kitchens, wardrobes, and TV media walls are fabricated and delivered within 12 to 18 working days. Solid Sheesham and carved wooden furniture pieces typically require 14 to 21 working days for seasoning, assembly, and multi-coat lacquer polish.',
  },
];

export default function Furniture() {
  const nav = useNavigate();
  const toast = useToast();
  const { user, addBookingDemo } = useAppData();

  // Section A: Expandable intro state
  const [readMore, setReadMore] = useState(false);

  // Section B: Category grid expansion state (show 6 by default, expand to all 10)
  const [showAllCategories, setShowAllCategories] = useState(false);

  // Section D: FAQ accordion active indices
  const [openFaq, setOpenFaq] = useState(0);

  // Section D: Lead capture form state
  const [leadForm, setLeadForm] = useState({
    name: user?.name || '',
    phone: user?.phone?.replace('+91 ', '') || '',
    city: 'Barmer',
    spaceType: 'Modular Kitchen',
    notes: '',
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Derive top trending designs across all categories for Section C
  const trendingDesigns = useMemo(() => {
    const list = [];
    Object.keys(FURNITURE_CATALOG).forEach((spaceId) => {
      const space = FURNITURE_CATALOG[spaceId];
      if (space?.designs) {
        space.designs.forEach((d) => {
          if (d.isTrending) {
            list.push({
              id: d.id,
              slug: spaceId,
              title: d.name,
              tag: d.finish,
              price: d.price,
              img: d.img,
            });
          }
        });
      }
    });
    return list.slice(0, 6);
  }, []);

  // Category grid items (6 or 10)
  const visibleSpaces = useMemo(() => {
    return showAllCategories ? SPACES : SPACES.slice(0, 6);
  }, [showAllCategories]);

  // Handle lead capture form submission
  const handleLeadSubmit = (e) => {
    e.preventDefault();
    if (!leadForm.name.trim()) {
      toast('Please enter your full name');
      return;
    }
    if (!leadForm.phone || leadForm.phone.replace(/\D/g, '').length < 10) {
      toast('Please enter a valid 10-digit mobile number');
      return;
    }

    addBookingDemo({
      service: `Consultation: ${leadForm.spaceType}`,
      icon: 'hammer',
      karigar: 'Master Karigar assigned on schedule',
      amount: 0,
      status: 'upcoming',
      notes: `Doorstep Visit in ${leadForm.city}. Contact: ${leadForm.phone}. Notes: ${leadForm.notes || 'Standard 3D Measurement'}`,
    });

    setFormSubmitted(true);
    toast('Consultation booked! Our master karigar will contact you shortly.');
  };

  return (
    <div className="fn-page">
      {/* ── TOP APP BAR ── */}
      <header className="fn-header">
        <div className="fn-header-inner">
          <button
            type="button"
            className="fn-header-back-btn"
            onClick={() => nav('/')}
            aria-label="Back to Home"
          >
            <Icon name="back" size={20} />
          </button>
          <div className="fn-header-title-block">
            <span className="fn-header-eyebrow">SARVOTTAM WOODWORK &amp; INTERIORS</span>
            <span className="fn-header-title">Furniture &amp; Design Ideas</span>
          </div>
          <button
            type="button"
            className="fn-header-action-btn"
            onClick={() => {
              const el = document.getElementById('consultation-form');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Book Free Visit
          </button>
        </div>
      </header>

      <main className="fn-main-content">
        {/* ══════════════════════════════════════════════════════════════
            SECTION A — HERO / PAGE HEADER
            Breadcrumb, H1 Title, Expandable Intro Paragraph
            ══════════════════════════════════════════════════════════════ */}
        <section className="fn-hero-section">
          <nav className="fn-breadcrumb" aria-label="Breadcrumb">
            <Link to="/" className="fn-bc-link">Home</Link>
            <span className="fn-bc-sep">/</span>
            <span className="fn-bc-current">Furniture</span>
          </nav>

          <div className="fn-hero-body">
            <div className="fn-hero-badge">
              <Icon name="shield" size={13} />
              <span>Rajasthan Karigar Verified · Workshop Direct</span>
            </div>

            <h1 className="fn-hero-title">Furniture Design Ideas</h1>

            <p className="fn-hero-intro">
              Discover bespoke modular kitchens, custom wardrobes, and solid wood furniture engineered for Indian lifestyles. Crafted by verified master artisans across Rajasthan with transparent workshop-direct pricing and 10-year structural warranty.
            </p>

            {readMore && (
              <div className="fn-hero-more-text">
                <p>
                  Every piece is precision-built using boiling-water-proof (BWP) IS-710 marine plywood, seasoned solid Sheesham, and genuine Teak wood. We incorporate premium German soft-close hydraulic fittings from Blum and Hettich to guarantee decades of seamless operation.
                </p>
                <p>
                  Whether you are planning a full-home modular setup or handcrafted accent pieces, SARVOTTAM connects you directly to experienced karigars with complimentary doorstep laser measurements and 3D CAD design renderings.
                </p>
              </div>
            )}

            <button
              type="button"
              className="fn-hero-toggle-btn"
              onClick={() => setReadMore((prev) => !prev)}
            >
              <span>{readMore ? 'Read Less' : 'Read More About Our Woodwork'}</span>
              <span className={'fn-toggle-icon' + (readMore ? ' open' : '')}>
                <Icon name="chevron" size={13} />
              </span>
            </button>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            SECTION B — CATEGORY GRID WITH COUNTS
            Image tiles showing Category Name + Design Count
            "View More Spaces" button to expand hidden categories
            Clicking a tile navigates to separate page: /furniture/:categorySlug
            ══════════════════════════════════════════════════════════════ */}
        <section className="fn-category-grid-section">
          <div className="fn-section-header">
            <div>
              <span className="fn-section-tag">SPACES &amp; ROOMS</span>
              <h2 className="fn-section-title">Explore Furniture by Space</h2>
              <p className="fn-section-sub">
                Select a category to view curated designs, layout options, and custom finishes
              </p>
            </div>
          </div>

          <div className="fn-category-grid">
            {visibleSpaces.map((sp) => {
              const catalogData = FURNITURE_CATALOG[sp.id];
              const heroImg = catalogData?.designs?.[0]?.img || 'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?auto=format&fit=crop&w=800&q=80';
              const designCount = DESIGN_COUNTS[sp.id] || `${catalogData?.designs?.length || 100}+ Designs`;

              return (
                <Link
                  key={sp.id}
                  to={`/furniture/${sp.id}`}
                  className="fn-category-tile"
                  aria-label={`View ${sp.name} designs`}
                >
                  <div className="fn-tile-media">
                    <img
                      src={heroImg}
                      alt={sp.name}
                      loading="lazy"
                      className="fn-tile-img"
                    />
                    <div className="fn-tile-overlay" />
                  </div>

                  <div className="fn-tile-content">
                    <div className="fn-tile-count-pill">{designCount}</div>
                    <div className="fn-tile-bottom-row">
                      <h3 className="fn-tile-name">{sp.name}</h3>
                      <div className="fn-tile-arrow">
                        <Icon name="arrow" size={14} />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* View More Spaces Button */}
          <div className="fn-expand-btn-wrap">
            <button
              type="button"
              className="fn-expand-btn"
              onClick={() => setShowAllCategories((v) => !v)}
            >
              <span>{showAllCategories ? 'Show Fewer Spaces' : 'View More Spaces (4 More)'}</span>
              <span className={'fn-expand-arrow' + (showAllCategories ? ' rotated' : '')}>
                <Icon name="chevron" size={14} />
              </span>
            </button>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            SECTION C — CURATED COLLECTION CAROUSELS
            Reused Component: CollectionCarousel (3 instances)
            1. Style-based collection ("Modern Luxe Rajasthani Interiors")
            2. Top Trending Designs ("Chosen by homeowners in September 2026")
            3. Recently Added Designs ("Curated on 10 September 2026")
            ══════════════════════════════════════════════════════════════ */}
        <section className="fn-collections-container">
          {/* Carousel 1: Style-Based Collection */}
          <CollectionCarousel
            title="Modern Luxe Rajasthani Interiors"
            subtitle="Handcrafted solid Sheesham & Teak spaces with contemporary gold and brass inlays"
            badge="Style Collection"
            items={STYLE_COLLECTION}
            onSelect={(item) => nav(`/furniture/${item.slug}`)}
          />

          {/* Carousel 2: Top Trending Designs */}
          <CollectionCarousel
            title="Top Trending Designs"
            subtitle="Chosen by Rajasthan homeowners in September 2026"
            badge="Trending Now"
            items={trendingDesigns}
            onSelect={(item) => nav(`/furniture/${item.slug}`)}
          />

          {/* Carousel 3: Recently Added Designs */}
          <CollectionCarousel
            title="Recently Added Designs"
            subtitle="Curated on 10 September 2026"
            badge="New Release"
            items={RECENTLY_ADDED}
            onSelect={(item) => nav(`/furniture/${item.slug}`)}
          />
        </section>

        {/* ══════════════════════════════════════════════════════════════
            SECTION D — LEAD CAPTURE
            Part 1: FAQ Accordion
            Part 2: Contact / Quotation Form
            ══════════════════════════════════════════════════════════════ */}
        <section className="fn-lead-capture-section">
          {/* FAQ Accordion */}
          <div className="fn-faq-container">
            <div className="fn-section-header">
              <span className="fn-section-tag">FREQUENTLY ASKED QUESTIONS</span>
              <h2 className="fn-section-title">Got Questions About Woodwork?</h2>
              <p className="fn-section-sub">
                Clear answers on materials, warranty, pricing, and doorstep measurement visits.
              </p>
            </div>

            <div className="fn-faq-list">
              {FAQS.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div key={index} className={'fn-faq-card' + (isOpen ? ' active' : '')}>
                    <button
                      type="button"
                      className="fn-faq-question-btn"
                      onClick={() => setOpenFaq(isOpen ? -1 : index)}
                      aria-expanded={isOpen}
                    >
                      <span className="fn-faq-q-text">{faq.q}</span>
                      <span className={'fn-faq-chevron' + (isOpen ? ' open' : '')}>
                        <Icon name="chevron" size={16} />
                      </span>
                    </button>
                    {isOpen && (
                      <div className="fn-faq-answer-body">
                        <p>{faq.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Lead / Quotation Form */}
          <div id="consultation-form" className="fn-consult-form-card">
            <div className="fn-cf-header">
              <div className="fn-cf-pill">
                <Icon name="check" size={13} />
                <span>100% Free Doorstep Visit · Zero Obligation</span>
              </div>
              <h3 className="fn-cf-title">Book a Free 3D Design Consultation</h3>
              <p className="fn-cf-sub">
                Our verified master karigar visits your residence with material swatches, laser measurement tools, and 3D floorplan blueprints.
              </p>
            </div>

            {formSubmitted ? (
              <div className="fn-cf-success-state">
                <div className="fn-cf-success-icon">
                  <Icon name="check" size={28} />
                </div>
                <h4>Consultation Scheduled Successfully!</h4>
                <p>
                  Thank you, <strong>{leadForm.name}</strong>. Our senior karigar supervisor in <strong>{leadForm.city}</strong> will contact you at <strong>+91 {leadForm.phone}</strong> within 2 hours to confirm your preferred visit slot.
                </p>
                <div className="fn-cf-success-actions">
                  <button
                    type="button"
                    className="fn-cf-btn secondary"
                    onClick={() => nav('/bookings')}
                  >
                    View in My Bookings
                  </button>
                  <button
                    type="button"
                    className="fn-cf-btn outline"
                    onClick={() => setFormSubmitted(false)}
                  >
                    Submit Another Request
                  </button>
                </div>
              </div>
            ) : (
              <form className="fn-cf-form" onSubmit={handleLeadSubmit}>
                <div className="fn-form-row">
                  <div className="fn-form-field">
                    <label className="fn-form-label" htmlFor="cf-name">Full Name *</label>
                    <input
                      id="cf-name"
                      type="text"
                      className="fn-form-input"
                      placeholder="e.g. Shivam Singh"
                      value={leadForm.name}
                      onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="fn-form-field">
                    <label className="fn-form-label" htmlFor="cf-phone">Mobile Number *</label>
                    <div className="fn-phone-group">
                      <span className="fn-phone-prefix">+91</span>
                      <input
                        id="cf-phone"
                        type="tel"
                        maxLength={10}
                        className="fn-form-input fn-phone-input"
                        placeholder="10-digit number"
                        value={leadForm.phone}
                        onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value.replace(/\D/g, '') })}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="fn-form-row">
                  <div className="fn-form-field">
                    <label className="fn-form-label" htmlFor="cf-city">City / District in Rajasthan *</label>
                    <select
                      id="cf-city"
                      className="fn-form-select"
                      value={leadForm.city}
                      onChange={(e) => setLeadForm({ ...leadForm, city: e.target.value })}
                    >
                      <option value="Barmer">Barmer</option>
                      <option value="Jaipur">Jaipur</option>
                      <option value="Jodhpur">Jodhpur</option>
                      <option value="Udaipur">Udaipur</option>
                      <option value="Bikaner">Bikaner</option>
                      <option value="Kota">Kota</option>
                      <option value="Ajmer">Ajmer</option>
                      <option value="Alwar">Alwar</option>
                      <option value="Sikar">Sikar</option>
                      <option value="Other Rajasthan City">Other Rajasthan City</option>
                    </select>
                  </div>

                  <div className="fn-form-field">
                    <label className="fn-form-label" htmlFor="cf-space">Furniture Requirement *</label>
                    <select
                      id="cf-space"
                      className="fn-form-select"
                      value={leadForm.spaceType}
                      onChange={(e) => setLeadForm({ ...leadForm, spaceType: e.target.value })}
                    >
                      <option value="Modular Kitchen">Modular Kitchen</option>
                      <option value="Master Bedroom Suite">Master Bedroom Suite</option>
                      <option value="Custom Wardrobe & Storage">Custom Wardrobe &amp; Storage</option>
                      <option value="Living Room & Sofa Sets">Living Room &amp; Sofa Sets</option>
                      <option value="TV Media Console & Louvers">TV Media Console &amp; Louvers</option>
                      <option value="Full Home Woodwork Package">Full Home Woodwork Package</option>
                    </select>
                  </div>
                </div>

                <div className="fn-form-field">
                  <label className="fn-form-label" htmlFor="cf-notes">
                    Specific Requirements or Approximate Room Dimensions (Optional)
                  </label>
                  <textarea
                    id="cf-notes"
                    rows={2}
                    className="fn-form-textarea"
                    placeholder="e.g. 14x10 ft modular kitchen, high gloss acrylic finish, L-shaped counter..."
                    value={leadForm.notes}
                    onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })}
                  />
                </div>

                <div className="fn-form-guarantee-note">
                  <Icon name="shield" size={15} />
                  <span>Your privacy is protected. No spam calls. Direct contact with our verified master karigar.</span>
                </div>

                <button type="submit" className="fn-cf-submit-btn">
                  <span>Get Free Quote &amp; 3D Render</span>
                  <Icon name="arrow" size={15} />
                </button>
              </form>
            )}
          </div>

          {/* SARVOTTAM Trust Badges Strip */}
          <div className="fn-trust-strip">
            <div className="fn-trust-item">
              <div className="fn-trust-icon">
                <Icon name="shield" size={18} />
              </div>
              <div className="fn-trust-text">
                <strong>10-Year Karigar Warranty</strong>
                <span>On structural plywood &amp; solid wood framing</span>
              </div>
            </div>

            <div className="fn-trust-item">
              <div className="fn-trust-icon">
                <Icon name="hammer" size={18} />
              </div>
              <div className="fn-trust-text">
                <strong>Verified Rajasthan Artisans</strong>
                <span>Jodhpur &amp; Shekhawati seasoned master carpenters</span>
              </div>
            </div>

            <div className="fn-trust-item">
              <div className="fn-trust-icon">
                <Icon name="rupee" size={18} />
              </div>
              <div className="fn-trust-text">
                <strong>Direct Workshop Pricing</strong>
                <span>Zero retail showroom markups or middleman commissions</span>
              </div>
            </div>

            <div className="fn-trust-item">
              <div className="fn-trust-icon">
                <Icon name="check" size={18} />
              </div>
              <div className="fn-trust-text">
                <strong>Free Doorstep 3D CAD</strong>
                <span>Photorealistic renders and accurate laser measurements</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <div className="bottom-spacer" />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// REUSABLE COMPONENT: Curated Collection Carousel (Repeating Component)
// ══════════════════════════════════════════════════════════════
function CollectionCarousel({ title, subtitle, badge, items, onSelect }) {
  return (
    <div className="fn-carousel-block">
      <div className="fn-carousel-head">
        <div className="fn-ch-left">
          {badge && <span className="fn-carousel-badge">{badge}</span>}
          <h3 className="fn-carousel-title">{title}</h3>
          {subtitle && <p className="fn-carousel-sub">{subtitle}</p>}
        </div>
      </div>

      <div className="fn-carousel-track">
        {items.map((item) => (
          <article
            key={item.id}
            className="fn-carousel-card"
            onClick={() => onSelect(item)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(item);
              }
            }}
          >
            <div className="fn-cc-media">
              <img
                src={item.img}
                alt={item.title}
                loading="lazy"
                className="fn-cc-img"
              />
              {item.tag && <span className="fn-cc-tag">{item.tag}</span>}
            </div>

            <div className="fn-cc-body">
              <h4 className="fn-cc-title">{item.title}</h4>
              <div className="fn-cc-foot">
                <span className="fn-cc-price">{item.price}</span>
                <button
                  type="button"
                  className="fn-cc-cta-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(item);
                  }}
                >
                  View Space
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

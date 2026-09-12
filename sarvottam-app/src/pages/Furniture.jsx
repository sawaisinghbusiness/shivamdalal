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
    tag: 'Heritage Solid Wood',
    price: '₹55,000 – ₹89,000',
    img: 'https://images.unsplash.com/photo-1540518614846-7ede433c4b69?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'kt-05',
    slug: 'kitchen',
    title: 'Royal Emerald Green & Gold Trim U-Shaped Kitchen',
    tag: 'Modern Royal Suite',
    price: '₹2,10,000 – ₹3,20,000',
    img: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'lv-02',
    slug: 'living',
    title: 'Heritage Sheesham 3+1+1 Sofa Suite with Brass Studs',
    tag: 'Jodhpur Craftsmanship',
    price: '₹45,000 – ₹72,000',
    img: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'wd-02',
    slug: 'wardrobe',
    title: 'Tinted Black Glass Walk-in Wardrobe with LED Profiles',
    tag: 'Contemporary Luxury',
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

// Curated design counts per space tile (Livspace style)
const DESIGN_COUNTS = {
  kitchen: '450 Designs',
  bedroom: '380 Designs',
  living: '520 Designs',
  wardrobe: '260 Designs',
  tv_unit: '220 Designs',
  dining: '190 Designs',
  pooja: '140 Designs',
  study: '120 Designs',
  kids: '160 Designs',
  balcony: '110 Designs',
};

// FAQ data
const FAQS = [
  {
    q: 'How does SARVOTTAM ensure woodwork quality and pricing?',
    a: 'All our custom furniture and modular cabinetry are crafted directly by verified Rajasthan master karigars using IS-710 Boiling Water Proof (BWP) marine plywood, seasoned solid Sheesham, and genuine Teak wood. Because we operate workshops locally without middlemen, our prices are up to 35% lower than retail interior design studios.',
  },
  {
    q: 'Can I customize dimensions, internal organizers, and finishes?',
    a: 'Yes, absolutely. Every piece is 100% made to order according to your exact room measurements. You can choose high-gloss acrylic, matte suede laminate, PU lacquer, natural veneers, and fluted acoustic glass with custom internal drawers and organizers.',
  },
  {
    q: 'Is the doorstep measurement visit and 3D CAD design really free?',
    a: 'Yes. When you request a consultation, a senior master karigar visits your home with material finish catalogs, laminate swatches, and laser measuring equipment. We deliver accurate 3D floorplan blueprints and transparent quotation breakdowns with zero obligation.',
  },
  {
    q: 'What warranty is provided on custom furniture and hardware?',
    a: 'We provide a 10-Year Karigar Warranty on structural carcass plywood and solid wood framing, along with official manufacturer warranties on international hardware fittings including Blum, Hettich, and Hafele soft-close systems.',
  },
  {
    q: 'What is the typical delivery and installation timeline in Rajasthan?',
    a: 'Standard modular kitchens, wardrobes, and TV media walls are fabricated and delivered within 12 to 18 working days. Solid Sheesham and carved wooden furniture pieces typically require 14 to 21 working days for seasoning, assembly, and multi-coat lacquer polish.',
  },
];

export default function Furniture() {
  const nav = useNavigate();
  const toast = useToast();
  const { user, addBookingDemo } = useAppData();

  // Section A: Expandable intro state
  const [readMore, setReadMore] = useState(false);

  // Section B: Category grid expansion (6 by default, expand to all 10)
  const [showAllCategories, setShowAllCategories] = useState(false);

  // Section D: FAQ accordion
  const [openFaq, setOpenFaq] = useState(0);

  // Section D: Consultation form state
  const [leadForm, setLeadForm] = useState({
    name: user?.name || '',
    phone: user?.phone?.replace('+91 ', '') || '',
    city: 'Barmer',
    spaceType: 'Modular Kitchen',
    notes: '',
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Derive top trending designs across categories
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

  const visibleSpaces = useMemo(() => {
    return showAllCategories ? SPACES : SPACES.slice(0, 6);
  }, [showAllCategories]);

  const handleLeadSubmit = (e) => {
    e.preventDefault();
    if (!leadForm.name.trim()) {
      toast('Please enter your full name');
      return;
    }
    const cleanPhone = leadForm.phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      toast('Please enter a valid 10-digit mobile number');
      return;
    }

    addBookingDemo({
      service: `Consultation: ${leadForm.spaceType}`,
      icon: 'hammer',
      karigar: 'Master Karigar assigned on schedule',
      amount: 0,
      status: 'upcoming',
      notes: `Doorstep Visit in ${leadForm.city}. Contact: ${leadForm.phone}. Details: ${leadForm.notes || 'Standard 3D Measurement'}`,
    });

    setFormSubmitted(true);
    toast('Consultation booked! Our master karigar will contact you.');
  };

  return (
    <div className="page lv-page">
      {/* ── CLEAN TOP HEADER BAR ── */}
      <header className="lv-top-nav">
        <div className="lv-nav-inner">
          <button
            type="button"
            className="lv-back-btn"
            onClick={() => nav('/')}
            aria-label="Back to Home"
          >
            <Icon name="back" size={20} />
          </button>
          <div className="lv-nav-titles">
            <span className="lv-nav-tag">SARVOTTAM</span>
            <span className="lv-nav-heading">Design Ideas</span>
          </div>
          <button
            type="button"
            className="lv-nav-cta"
            onClick={() => nav('/furniture/consultation')}
          >
            Get Free Quote
          </button>
        </div>
      </header>

      <div className="lv-container">
        {/* ══════════════════════════════════════════════════════════════
            SECTION A — HERO / PAGE HEADER (LIVSPACE STYLE)
            Breadcrumb: Home / Furniture
            H1 Title with left accent bar
            Introductory paragraph with Read More toggle
            ══════════════════════════════════════════════════════════════ */}
        <section className="lv-hero-section">
          <nav className="lv-breadcrumb" aria-label="Breadcrumb">
            <Link to="/" className="lv-bc-item">Home</Link>
            <span className="lv-bc-sep">/</span>
            <span className="lv-bc-current">Furniture</span>
          </nav>

          <div className="lv-hero-header-block">
            <h1 className="lv-hero-title">Furniture Design Ideas</h1>
            <p className="lv-hero-sub">
              Discover thousands of custom modular kitchens, wardrobes, and handcrafted solid wood designs crafted for Indian homes by verified Rajasthan karigars.
            </p>

            {readMore && (
              <div className="lv-hero-expandable">
                <p>
                  Every unit is precision-engineered using IS-710 Boiling Water Proof (BWP) marine plywood, seasoned solid Sheesham, and genuine Teak wood with German hydraulic fittings from Blum and Hettich.
                </p>
                <p>
                  Direct workshop pricing eliminates showroom inflation, giving you superior craftsmanship at transparent rates with free doorstep 3D CAD design consultations.
                </p>
              </div>
            )}

            <button
              type="button"
              className="lv-read-more-btn"
              onClick={() => setReadMore((v) => !v)}
            >
              <span>{readMore ? 'Read Less' : 'Read More'}</span>
              <span className={'lv-rm-arrow' + (readMore ? ' up' : '')}>
                <Icon name="chevron" size={13} />
              </span>
            </button>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            SECTION B — CATEGORY GRID WITH COUNTS (EXACT LIVSPACE TILES)
            Image ON TOP, clean white text card BELOW
            Category name + Design count (e.g. Modular Kitchen — 450 Designs)
            "View More Spaces" pill button
            Clicking a tile navigates to /furniture/:categorySlug
            ══════════════════════════════════════════════════════════════ */}
        <section className="lv-section lv-category-section">
          <div className="lv-sec-head">
            <h2 className="lv-sec-title">Explore by Space</h2>
            <p className="lv-sec-sub">Select a space to view curated designs and layout options</p>
          </div>

          <div className="lv-cat-grid">
            {visibleSpaces.map((sp) => {
              const catalogData = FURNITURE_CATALOG[sp.id];
              const heroImg = catalogData?.designs?.[0]?.img || 'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?auto=format&fit=crop&w=800&q=80';
              const designCount = DESIGN_COUNTS[sp.id] || `${catalogData?.designs?.length || 100}+ Designs`;

              return (
                <Link
                  key={sp.id}
                  to={`/furniture/${sp.id}`}
                  className="lv-cat-tile"
                  aria-label={`View ${sp.name} designs`}
                >
                  <div className="lv-tile-media">
                    <img
                      src={heroImg}
                      alt={`${sp.name} - Livspace style`}
                      loading="lazy"
                      className="lv-tile-img"
                    />
                  </div>
                  <div className="lv-tile-meta">
                    <h3 className="lv-tile-name">{sp.name}</h3>
                    <p className="lv-tile-count">{designCount}</p>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="lv-expand-row">
            <button
              type="button"
              className="lv-pill-btn"
              onClick={() => setShowAllCategories((v) => !v)}
            >
              <span>{showAllCategories ? 'Show Fewer Spaces' : 'View More Spaces'}</span>
              <span className={'lv-btn-arrow' + (showAllCategories ? ' open' : '')}>
                <Icon name="chevron" size={13} />
              </span>
            </button>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            SECTION C — CURATED COLLECTION CAROUSELS (REUSED 3 TIMES)
            1. Style Collection ("Modern Luxe Rajasthani Interiors")
            2. Top Trending Designs ("Chosen by homeowners in September 2026")
            3. Recently Added Designs ("Curated on 10 September 2026")
            Aspect 3:2 image, title (1-2 lines), Outlined Pill CTA button
            ══════════════════════════════════════════════════════════════ */}
        <section className="lv-section lv-carousels-section">
          {/* 1. Style Collection */}
          <LivspaceCarousel
            title="Modern Luxe Rajasthani Interiors"
            subtitle="Handcrafted solid Sheesham & Teak spaces with contemporary gold inlays"
            items={STYLE_COLLECTION}
            onSelect={(item) => nav(`/furniture/${item.slug}/${item.id}`)}
          />

          {/* 2. Top Trending */}
          <LivspaceCarousel
            title="Top Trending Designs"
            subtitle="Chosen by Rajasthan homeowners in September 2026"
            items={trendingDesigns}
            onSelect={(item) => nav(`/furniture/${item.slug}/${item.id}`)}
          />

          {/* 3. Recently Added */}
          <LivspaceCarousel
            title="Recently Added Designs"
            subtitle="Curated on 10 September 2026"
            items={RECENTLY_ADDED}
            onSelect={(item) => nav(`/furniture/${item.slug}/${item.id}`)}
          />
        </section>

        {/* ══════════════════════════════════════════════════════════════
            SECTION D — LEAD CAPTURE
            Part 1: FAQ Accordion
            Part 2: Contact / Quotation Form
            ══════════════════════════════════════════════════════════════ */}
        <section className="lv-section lv-lead-section">
          {/* FAQ Accordion */}
          <div className="lv-faq-block">
            <div className="lv-sec-head">
              <h2 className="lv-sec-title">Frequently Asked Questions</h2>
              <p className="lv-sec-sub">Everything you need to know about our custom furniture and woodwork</p>
            </div>

            <div className="lv-faq-list">
              {FAQS.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div key={index} className={'lv-faq-item' + (isOpen ? ' open' : '')}>
                    <button
                      type="button"
                      className="lv-faq-trigger"
                      onClick={() => setOpenFaq(isOpen ? -1 : index)}
                      aria-expanded={isOpen}
                    >
                      <span className="lv-faq-q">{faq.q}</span>
                      <span className={'lv-faq-arrow' + (isOpen ? ' open' : '')}>
                        <Icon name="chevron" size={15} />
                      </span>
                    </button>
                    {isOpen && (
                      <div className="lv-faq-body">
                        <p>{faq.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contact / Quotation Form Card (Livspace style) */}
          <div id="consultation-form" className="lv-form-card">
            <div className="lv-form-head">
              <span className="lv-form-badge">100% Free Doorstep Visit</span>
              <h3 className="lv-form-title">Talk to a Master Designer</h3>
              <p className="lv-form-sub">
                Get customized 3D floorplan blueprints, material samples, and an itemized quote.
              </p>
            </div>

            {formSubmitted ? (
              <div className="lv-success-box">
                <div className="lv-success-ic">
                  <Icon name="check" size={26} />
                </div>
                <h4>Thank You, {leadForm.name}!</h4>
                <p>
                  Our senior karigar supervisor in <strong>{leadForm.city}</strong> will contact you at <strong>+91 {leadForm.phone}</strong> within 2 hours.
                </p>
                <div className="lv-success-btns">
                  <button
                    type="button"
                    className="lv-btn-fill"
                    onClick={() => nav('/bookings')}
                  >
                    View in My Bookings
                  </button>
                  <button
                    type="button"
                    className="lv-btn-outline"
                    onClick={() => setFormSubmitted(false)}
                  >
                    Book Another Space
                  </button>
                </div>
              </div>
            ) : (
              <form className="lv-lead-form" onSubmit={handleLeadSubmit}>
                <div className="lv-field-group">
                  <div className="lv-field">
                    <label className="lv-label">Your Name</label>
                    <input
                      type="text"
                      className="lv-input"
                      placeholder="e.g. Shivam Singh"
                      value={leadForm.name}
                      onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="lv-field">
                    <label className="lv-label">Phone Number</label>
                    <div className="lv-phone-wrap">
                      <span className="lv-prefix">+91</span>
                      <input
                        type="tel"
                        maxLength={10}
                        className="lv-input lv-phone-inp"
                        placeholder="10-digit number"
                        value={leadForm.phone}
                        onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value.replace(/\D/g, '') })}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="lv-field-group">
                  <div className="lv-field">
                    <label className="lv-label">City in Rajasthan</label>
                    <select
                      className="lv-select"
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
                      <option value="Other">Other Rajasthan Location</option>
                    </select>
                  </div>

                  <div className="lv-field">
                    <label className="lv-label">Space Required</label>
                    <select
                      className="lv-select"
                      value={leadForm.spaceType}
                      onChange={(e) => setLeadForm({ ...leadForm, spaceType: e.target.value })}
                    >
                      <option value="Modular Kitchen">Modular Kitchen</option>
                      <option value="Master Bedroom">Master Bedroom</option>
                      <option value="Custom Wardrobes">Custom Wardrobes</option>
                      <option value="Living Room Furniture">Living Room Furniture</option>
                      <option value="TV Media Console">TV Media Console</option>
                      <option value="Full Home Interiors">Full Home Interiors</option>
                    </select>
                  </div>
                </div>

                <div className="lv-field">
                  <label className="lv-label">Requirement Details (Optional)</label>
                  <textarea
                    rows={2}
                    className="lv-textarea"
                    placeholder="Approx room size, preferred finishes (e.g. L-shaped acrylic kitchen)..."
                    value={leadForm.notes}
                    onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })}
                  />
                </div>

                <button type="submit" className="lv-submit-btn">
                  Book Free Consultation
                </button>
              </form>
            )}
          </div>

          {/* Livspace Style Trust Strips */}
          <div className="lv-trust-grid">
            <div className="lv-trust-card">
              <div className="lv-trust-ic">
                <Icon name="shield" size={18} />
              </div>
              <div className="lv-trust-txt">
                <h4>10-Year Karigar Warranty</h4>
                <p>On structural plywood &amp; solid wood framing</p>
              </div>
            </div>

            <div className="lv-trust-card">
              <div className="lv-trust-ic">
                <Icon name="hammer" size={18} />
              </div>
              <div className="lv-trust-txt">
                <h4>Verified Local Artisans</h4>
                <p>Skilled master carpenters with verified reviews</p>
              </div>
            </div>

            <div className="lv-trust-card">
              <div className="lv-trust-ic">
                <Icon name="rupee" size={18} />
              </div>
              <div className="lv-trust-txt">
                <h4>Direct Workshop Pricing</h4>
                <p>Zero retail showroom markups or middleman costs</p>
              </div>
            </div>

            <div className="lv-trust-card">
              <div className="lv-trust-ic">
                <Icon name="check" size={18} />
              </div>
              <div className="lv-trust-txt">
                <h4>Free Doorstep 3D CAD</h4>
                <p>Laser measurements and photorealistic renderings</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="bottom-spacer" />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// REUSABLE LIVSPACE-STYLE CAROUSEL COMPONENT
// ══════════════════════════════════════════════════════════════
function LivspaceCarousel({ title, subtitle, items, onSelect }) {
  return (
    <div className="lv-carousel-block">
      <div className="lv-sec-head">
        <h3 className="lv-sec-title">{title}</h3>
        {subtitle && <p className="lv-sec-sub">{subtitle}</p>}
      </div>

      <div className="lv-carousel-track">
        {items.map((item) => (
          <article
            key={item.id}
            className="lv-c-card"
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
            <div className="lv-c-img-wrap">
              <img
                src={item.img}
                alt={item.title}
                loading="lazy"
                className="lv-c-img"
              />
              {item.tag && <span className="lv-c-badge">{item.tag}</span>}
            </div>

            <div className="lv-c-body">
              <h4 className="lv-c-title">{item.title}</h4>
              <p className="lv-c-price">{item.price}</p>
              <button
                type="button"
                className="lv-c-cta-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(item);
                }}
              >
                View Design &amp; Specs
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

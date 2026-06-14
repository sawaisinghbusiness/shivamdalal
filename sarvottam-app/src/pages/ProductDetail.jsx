import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import { useToast } from '../components/Toast';
import { useAppData } from '../store/AppData';
import { FURNITURE } from '../data/furniture';
import { PAINT_STYLES } from '../data/painting';
import './ProductDetail.css';

// find item + its category + siblings (related)
function lookup(type, id) {
  const source = type === 'painting' ? PAINT_STYLES : FURNITURE;
  for (const [category, items] of Object.entries(source)) {
    const item = items.find((it) => it.id === id);
    if (item) return { item, category, related: items.filter((it) => it.id !== id) };
  }
  return { item: null, category: '', related: [] };
}

// stable demo reviews per product
const DEMO_REVIEWS = [
  { name: 'Pradeep S.', stars: 5, date: 'May 2026', text: 'Excellent quality and the team installed everything on time. Highly recommended.' },
  { name: 'Anita M.',   stars: 4, date: 'Apr 2026', text: 'Good finish and sturdy material. Delivery took a couple of extra days.' },
  { name: 'Rakesh V.',  stars: 5, date: 'Apr 2026', text: 'Value for money. The measurement visit was free and very professional.' },
];

const BADGES = [
  { icon: 'medal',  label: '1-Year Warranty' },
  { icon: 'shield', label: 'ISI Certified' },
  { icon: 'truck',  label: 'Free Installation' },
  { icon: 'headset',label: '7-Day Support' },
];

export default function ProductDetail() {
  const { type, id } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const { cart, addToCart, myReviews, addReview, addBookingDemo } = useAppData();

  const { item, category, related } = useMemo(() => lookup(type, id), [type, id]);

  const [writeOpen, setWriteOpen] = useState(false);
  const [stars, setStars] = useState(0);
  const [text, setText] = useState('');

  if (!item) {
    return (
      <div className="sub-page pd-missing">
        <p>Product not found.</p>
        <button className="pd-back-link" onClick={() => nav(-1)}>Go back</button>
      </div>
    );
  }

  const isPaint = type === 'painting';
  const inCart = cart.some((c) => c.id === item.id);
  const userReviews = myReviews[item.id] || [];
  const allReviews = [...userReviews, ...DEMO_REVIEWS];
  const avg = (allReviews.reduce((s, r) => s + r.stars, 0) / allReviews.length).toFixed(1);

  const SPECS = isPaint
    ? [
        ['Style', item.name], ['Room type', category], ['Finish', item.tag],
        ['Paint brands', 'Asian Paints / Berger'], ['Coats included', 'Putty + Primer + 2 coats'],
        ['Coverage', 'Per sq.ft pricing'],
      ]
    : [
        ['Product', item.name], ['Category', category], ['Material', item.material],
        ['Customisation', 'Size & finish customisable'], ['Delivery', '7–15 working days'],
        ['Payment', '30% advance, rest on delivery'],
      ];

  function handleCart() {
    if (inCart) { toast('Already in cart'); return; }
    addToCart({ id: item.id, name: item.name, type, img: item.img, price: item.price || item.tag });
    toast('Added to cart');
  }

  function handleBuy() {
    addBookingDemo({
      service: item.name,
      icon: isPaint ? 'roller' : 'sofa',
      karigar: 'Team will be assigned',
      amount: 0,
      status: 'upcoming',
    });
    toast(isPaint ? 'Quote request placed — team will call you' : 'Order placed — track it in My Bookings');
    nav('/bookings');
  }

  function submitReview() {
    if (!stars) { toast('Tap the stars to rate'); return; }
    if (text.trim().length < 4) { toast('Write a short review'); return; }
    addReview(item.id, { name: 'You', stars, date: 'Just now', text: text.trim() });
    setWriteOpen(false); setStars(0); setText('');
    toast('Review submitted — thank you!');
  }

  return (
    <div className="sub-page pd-page">
      {/* image + back */}
      <div className="pd-hero">
        <img src={item.img} alt={item.name} />
        <button className="pd-back" onClick={() => nav(-1)}><Icon name="back" size={18} /></button>
      </div>

      <div className="pd-body">
        {/* title block */}
        <div className="pd-title-row">
          <div>
            <h1>{item.name}</h1>
            <p className="pd-sub">{isPaint ? `${item.tag} · ${category}` : item.material}</p>
          </div>
          <span className="pd-rating"><Icon name="star" size={13} /> {avg} <small>({allReviews.length})</small></span>
        </div>

        <div className="pd-price-row">
          <span className="pd-price">{isPaint ? 'Per sq.ft quote' : item.price}</span>
          {!isPaint && <span className="pd-price-note">incl. installation</span>}
        </div>

        {/* offers */}
        <div className="pd-offers">
          <div className="pd-offer"><Icon name="rupee" size={14} /> 5% off on online payment</div>
          <div className="pd-offer"><Icon name="card" size={14} /> No-cost EMI available</div>
        </div>

        {/* trust badges */}
        <div className="pd-badges">
          {BADGES.map((b) => (
            <div className="pd-badge" key={b.label}>
              <Icon name={b.icon} size={20} />
              <span>{b.label}</span>
            </div>
          ))}
        </div>

        {/* specs */}
        <h2 className="pd-h2">Product details</h2>
        <div className="pd-specs">
          {SPECS.map(([k, v]) => (
            <div className="pd-spec" key={k}><span>{k}</span><strong>{v}</strong></div>
          ))}
        </div>

        {/* reviews */}
        <div className="pd-rev-head">
          <h2 className="pd-h2">Ratings &amp; reviews</h2>
          <button className="pd-write" onClick={() => setWriteOpen((v) => !v)}>
            {writeOpen ? 'Close' : 'Write a review'}
          </button>
        </div>

        {writeOpen && (
          <div className="pd-write-box">
            <div className="pd-write-stars">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} className={'pd-star' + (n <= stars ? ' on' : '')} onClick={() => setStars(n)}>
                  <Icon name="star" size={26} />
                </button>
              ))}
            </div>
            <textarea rows={2} value={text} onChange={(e) => setText(e.target.value)} placeholder="Share your experience…" />
            <button className="pd-submit" onClick={submitReview}>Submit review</button>
          </div>
        )}

        <div className="pd-reviews">
          {allReviews.map((r, i) => (
            <div className="pd-review" key={i}>
              <div className="pd-review-top">
                <span className="pd-review-stars"><Icon name="star" size={12} /> {r.stars}</span>
                <strong>{r.name}</strong>
                <small>{r.date}</small>
              </div>
              <p>{r.text}</p>
            </div>
          ))}
        </div>

        {/* related */}
        {related.length > 0 && (
          <>
            <h2 className="pd-h2">Similar in {category}</h2>
            <div className="pd-related">
              {related.map((r) => (
                <button className="pd-rel-card" key={r.id} onClick={() => nav(`/product/${type}/${r.id}`)}>
                  <img src={r.img} alt={r.name} loading="lazy" />
                  <strong>{r.name}</strong>
                  <small>{isPaint ? r.tag : r.price}</small>
                </button>
              ))}
            </div>
          </>
        )}

        <div className="pd-end-space" />
      </div>

      {/* sticky action bar */}
      <div className="pd-actionbar">
        <button className={'pd-cart-btn' + (inCart ? ' added' : '')} onClick={handleCart}>
          <Icon name={inCart ? 'check' : 'cart'} size={18} />
          {inCart ? 'In Cart' : 'Add to Cart'}
        </button>
        <button className="pd-buy-btn" onClick={handleBuy}>
          {isPaint ? 'Get Free Quote' : 'Book Now'}
        </button>
      </div>
    </div>
  );
}

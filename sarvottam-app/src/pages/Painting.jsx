import { useState } from 'react';
import Icon from '../components/Icon';
import { useToast } from '../components/Toast';
import { PAINT_SERVICES, PAINT_CATEGORIES, PAINT_STYLES } from '../data/painting';
import './Furniture.css';
import './Painting.css';

export default function Painting() {
  const toast = useToast();
  const [cat, setCat] = useState('Bedroom');
  const [liked, setLiked] = useState({});
  const [quote, setQuote] = useState(null); // style chosen for quote

  const styles = PAINT_STYLES[cat] || [];

  const toggleLike = (id, e) => {
    e.stopPropagation();
    setLiked((m) => ({ ...m, [id]: !m[id] }));
    toast(liked[id] ? 'Wishlist se hata' : 'Wishlist mein add ✓');
  };

  return (
    <div className="page">
      <div className="inner-header pt-header">
        <h1 className="ih-title">Painting</h1>
        <p className="ih-sub">Deewaron ko nayi jaan dein</p>
      </div>

      {/* Services with rates */}
      <section className="section">
        <h2 className="section-title">Painting Services</h2>
        <div className="pt-services">
          {PAINT_SERVICES.map((s) => (
            <div className="pt-service" key={s.id}>
              <div className="pt-service-ic"><Icon name={s.icon} size={20} /></div>
              <div className="pt-service-info">
                <strong>{s.name}</strong>
                <small>{s.desc}</small>
              </div>
              <span className="pt-rate">{s.rate}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Style gallery */}
      <section className="section">
        <h2 className="section-title">Popular Styles</h2>
        <div className="pt-tabs">
          {PAINT_CATEGORIES.map((c) => (
            <button key={c} className={'pt-tab' + (cat === c ? ' active' : '')} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>
        <div className="pt-grid">
          {styles.map((st) => (
            <div className="pt-card" key={st.id} onClick={() => setQuote(st)}>
              <img src={st.img} alt={st.name} loading="lazy" />
              <button className={'pt-heart' + (liked[st.id] ? ' on' : '')} onClick={(e) => toggleLike(st.id, e)}>
                <Icon name="heart" size={15} />
              </button>
              <div className="pt-card-overlay">
                <strong>{st.name}</strong>
                <small>{st.tag}</small>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="bottom-spacer" />

      {/* Quote sheet */}
      {quote && (
        <div className="fn-overlay" onClick={() => setQuote(null)}>
          <div className="fn-sheet" onClick={(e) => e.stopPropagation()}>
            <img className="fn-sheet-img" src={quote.img} alt={quote.name} />
            <div className="fn-sheet-body">
              <div className="fn-drag" />
              <h2 className="pt-sheet-title">{quote.name}</h2>
              <p className="pt-sheet-tag">{quote.tag} · {cat}</p>

              <div className="fn-features">
                {['Free site visit & wall measurement', 'Branded paint (Asian/Berger)', 'Surface prep + primer included', 'Furniture covering & cleanup', 'Painters insured & verified'].map((f) => (
                  <div className="fn-feature" key={f}><Icon name="check" size={16} /> {f}</div>
                ))}
              </div>

              <button className="fn-book" onClick={() => { setQuote(null); toast('✓ Free quote request bheji — team site visit set karegi'); }}>
                Get Free Quote
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

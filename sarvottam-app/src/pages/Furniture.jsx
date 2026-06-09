import { useState } from 'react';
import Icon from '../components/Icon';
import { useToast } from '../components/Toast';
import { FURNITURE_CATEGORIES, FURNITURE } from '../data/furniture';
import './Furniture.css';

export default function Furniture() {
  const toast = useToast();
  const [cat, setCat] = useState('Bedroom');
  const [liked, setLiked] = useState({});
  const [detail, setDetail] = useState(null);

  const items = FURNITURE[cat] || [];

  const toggleLike = (id, e) => {
    e.stopPropagation();
    setLiked((m) => ({ ...m, [id]: !m[id] }));
    toast(liked[id] ? 'Wishlist se hata' : 'Wishlist mein add ✓');
  };

  return (
    <div className="page">
      <div className="inner-header fn-header">
        <h1 className="ih-title">Furniture</h1>
        <p className="ih-sub">Apne sapno ka ghar design karein</p>
      </div>

      {/* Category tabs */}
      <div className="fn-tabs">
        {FURNITURE_CATEGORIES.map((c) => (
          <button key={c} className={'fn-tab' + (cat === c ? ' active' : '')} onClick={() => setCat(c)}>
            {c}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="fn-grid">
        {items.map((it) => (
          <div className="fn-card" key={it.id} onClick={() => setDetail(it)}>
            <div className="fn-img">
              <img src={it.img} alt={it.name} loading="lazy" />
              <button className={'fn-heart' + (liked[it.id] ? ' on' : '')} onClick={(e) => toggleLike(it.id, e)}>
                <Icon name="heart" size={16} />
              </button>
            </div>
            <div className="fn-info">
              <h3>{it.name}</h3>
              <p className="fn-material">{it.material}</p>
              <div className="fn-foot">
                <span className="fn-price">{it.price}</span>
                <span className="fn-rating"><Icon name="star" size={12} /> {it.rating}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bottom-spacer" />

      {/* Detail sheet */}
      {detail && (
        <div className="fn-overlay" onClick={() => setDetail(null)}>
          <div className="fn-sheet" onClick={(e) => e.stopPropagation()}>
            <img className="fn-sheet-img" src={detail.img} alt={detail.name} />
            <div className="fn-sheet-body">
              <div className="fn-drag" />
              <div className="fn-sheet-head">
                <div>
                  <h2>{detail.name}</h2>
                  <p>{detail.material}</p>
                </div>
                <span className="fn-rating big"><Icon name="star" size={14} /> {detail.rating}</span>
              </div>
              <p className="fn-sheet-price">{detail.price}</p>

              <div className="fn-features">
                {['Free measurement & site visit', 'ISI-certified wood & materials', 'Delivery + installation included', '1-year warranty', '30% advance, rest on delivery'].map((f) => (
                  <div className="fn-feature" key={f}><Icon name="check" size={16} /> {f}</div>
                ))}
              </div>

              <button className="fn-book" onClick={() => { setDetail(null); toast('✓ ' + detail.name + ' ke liye request bheji — team call karegi'); }}>
                Book This Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

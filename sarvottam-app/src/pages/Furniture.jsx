import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import { useToast } from '../components/Toast';
import { FURNITURE_CATEGORIES, FURNITURE } from '../data/furniture';
import './Furniture.css';

export default function Furniture() {
  const nav = useNavigate();
  const toast = useToast();
  const [cat, setCat] = useState('Bedroom');
  const [liked, setLiked] = useState({});

  const items = FURNITURE[cat] || [];

  const toggleLike = (id, e) => {
    e.stopPropagation();
    setLiked((m) => ({ ...m, [id]: !m[id] }));
    toast(liked[id] ? 'Removed from wishlist' : 'Added to wishlist');
  };

  return (
    <div className="page">
      <div className="inner-header fn-header">
        <h1 className="ih-title">Furniture</h1>
        <p className="ih-sub">Custom-made for your dream home</p>
      </div>

      <div className="fn-tabs">
        {FURNITURE_CATEGORIES.map((c) => (
          <button key={c} className={'fn-tab' + (cat === c ? ' active' : '')} onClick={() => setCat(c)}>
            {c}
          </button>
        ))}
      </div>

      <div className="fn-grid">
        {items.map((it) => (
          <div className="fn-card" key={it.id} onClick={() => nav(`/product/furniture/${it.id}`)}>
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
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import { useToast } from '../components/Toast';
import { PAINT_SERVICES, PAINT_CATEGORIES, PAINT_STYLES } from '../data/painting';
import './Painting.css';

export default function Painting() {
  const nav = useNavigate();
  const toast = useToast();
  const [cat, setCat] = useState('Bedroom');
  const [liked, setLiked] = useState({});

  const styles = PAINT_STYLES[cat] || [];

  const toggleLike = (id, e) => {
    e.stopPropagation();
    setLiked((m) => ({ ...m, [id]: !m[id] }));
    toast(liked[id] ? 'Removed from wishlist' : 'Added to wishlist');
  };

  return (
    <div className="page">
      <div className="inner-header pt-header">
        <h1 className="ih-title">Painting</h1>
        <p className="ih-sub">Colours that bring walls to life</p>
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
            <div className="pt-card" key={st.id} onClick={() => nav(`/product/painting/${st.id}`)}>
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
    </div>
  );
}

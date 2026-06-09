import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import { EMERGENCY_SERVICES } from '../data/services';
import EmergencyFlow from '../components/EmergencyFlow';
import './Emergency.css';

export default function Emergency() {
  const nav = useNavigate();
  const [active, setActive] = useState(null); // chosen service for the flow

  return (
    <div className="page">
      <div className="inner-header">
        <button className="ih-back" onClick={() => nav('/')}><Icon name="back" size={18} /></button>
        <h1 className="ih-title">Emergency<br />Services</h1>
        <p className="ih-sub">24x7 verified Karigar aapke ghar</p>
      </div>

      <div className="em-list">
        {EMERGENCY_SERVICES.map((s) => (
          <div className="em-card" key={s.id}>
            <div className="em-ic" style={{ color: s.color, background: s.color + '18' }}>
              <Icon name={s.icon} size={26} />
            </div>
            <div className="em-info">
              <h3>{s.name}</h3>
              <p>{s.desc}</p>
            </div>
            <button className="em-btn" onClick={() => setActive(s)}>Book Now</button>
          </div>
        ))}
      </div>

      <div className="em-urgent">
        <Icon name="bolt" size={20} />
        <div>
          <strong>Book Urgent Service</strong>
          <small>Sabse najdeek Karigar turant bheje</small>
        </div>
      </div>

      <div className="bottom-spacer" />

      {active && <EmergencyFlow service={active} onClose={() => setActive(null)} />}
    </div>
  );
}

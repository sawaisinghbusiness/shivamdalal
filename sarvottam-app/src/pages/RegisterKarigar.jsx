import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import { useToast } from '../components/Toast';
import './Login.css';
import './RegisterKarigar.css';

const SKILLS = ['Electrician', 'Plumber', 'Carpenter', 'AC Repair', 'Painter', 'Other'];

export default function RegisterKarigar() {
  const nav = useNavigate();
  const toast = useToast();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [skill, setSkill] = useState('');
  const [area, setArea] = useState('');
  const [exp, setExp] = useState('');
  const [idDone, setIdDone] = useState(false);
  const [done, setDone] = useState(false);

  function submit() {
    if (name.trim().length < 2) { toast('Apna naam daalein'); return; }
    if (phone.replace(/\D/g, '').length < 10) { toast('Sahi phone number daalein'); return; }
    if (!skill) { toast('Apni skill chunein'); return; }
    if (area.trim().length < 2) { toast('Apna area/city daalein'); return; }
    if (!idDone) { toast('ID proof upload karein'); return; }
    setDone(true);
  }

  if (done) {
    return (
      <div className="rk-success">
        <div className="rk-success-ic"><Icon name="check" size={36} /></div>
        <h2>Application mil gayi!</h2>
        <p>Dhanyavaad {name.trim()}! SARVOTTAM team aapki details aur ID verify karke 24-48 ghante mein sampark karegi.</p>
        <p className="rk-success-note">Verify hone ke baad aapko Karigar app ka access milega aur aas-paas ke kaam ki notification aane lagegi.</p>
        <button className="login-cta" onClick={() => nav('/login')}>Wapas Login pe</button>
      </div>
    );
  }

  return (
    <div className="rk-screen">
      <div className="rk-header">
        <button className="login-back static" onClick={() => nav('/login')}><Icon name="back" size={18} /></button>
        <div className="rk-head-text">
          <h1>Karigar Registration</h1>
          <p>Judд kar kaam paayein aur kamayein</p>
        </div>
      </div>

      <div className="rk-body">
        {/* Earnings highlight */}
        <div className="rk-banner">
          <strong>₹25,000 – ₹60,000 / mahina kamayein</strong>
          <small>Apne time pe kaam, har job pe seedha payment</small>
        </div>

        <label className="login-field">
          <span>Poora naam</span>
          <div className="login-input"><Icon name="user" size={18} /><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Aapka naam" /></div>
        </label>

        <label className="login-field">
          <span>Phone number</span>
          <div className="login-input"><span className="login-cc">+91</span><input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="98765 43210" inputMode="numeric" /></div>
        </label>

        <div className="login-field">
          <span>Aapki skill</span>
          <div className="rk-skills">
            {SKILLS.map((s) => (
              <button key={s} className={'rk-skill' + (skill === s ? ' active' : '')} onClick={() => setSkill(s)}>{s}</button>
            ))}
          </div>
        </div>

        <label className="login-field">
          <span>Area / City</span>
          <div className="login-input"><Icon name="pin" size={18} /><input value={area} onChange={(e) => setArea(e.target.value)} placeholder="Jaise: Barmer, Rajasthan" /></div>
        </label>

        <label className="login-field">
          <span>Experience (saal) — optional</span>
          <div className="login-input"><Icon name="shield" size={18} /><input value={exp} onChange={(e) => setExp(e.target.value.replace(/\D/g, '').slice(0, 2))} placeholder="Jaise: 5" inputMode="numeric" /></div>
        </label>

        <div className="login-field">
          <span>ID proof (Aadhaar / Voter ID)</span>
          <button className={'rk-upload' + (idDone ? ' done' : '')} onClick={() => { setIdDone(true); toast('Demo: ID upload ho gayi ✓'); }}>
            <Icon name={idDone ? 'check' : 'plus'} size={18} />
            {idDone ? 'ID uploaded ✓' : 'ID photo upload karein'}
          </button>
        </div>

        <button className="login-cta" onClick={submit}>Application Submit karein</button>
        <p className="login-terms">Aapki ID SARVOTTAM team verify karegi. Verify hone par hi customer ko aap dikhenge.</p>
      </div>
    </div>
  );
}

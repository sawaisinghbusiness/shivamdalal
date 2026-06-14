import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import { useToast } from '../components/Toast';
import { useAppData } from '../store/AppData';
import './Login.css';

export default function KarigarLogin() {
  const nav = useNavigate();
  const toast = useToast();
  const { login } = useAppData();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formErr, setFormErr] = useState('');
  const [shaking, setShaking] = useState(false);

  function fail(msg) { setFormErr(msg); setShaking(true); }

  async function submit() {
    if (busy) return;
    if (!identifier.trim()) { fail('Please enter your email'); return; }
    if (!password) { fail('Please enter your password'); return; }
    setFormErr('');
    setBusy(true);
    const res = await login(identifier, password);
    setBusy(false);
    if (!res.ok) { fail(res.error); return; }
    if (res.role !== 'karigar') {
      fail('This is a customer account — use Customer login');
      return;
    }
    toast('Welcome back, Karigar!');
    nav('/karigar');
  }

  return (
    <div className="kl-screen">
      {/* ── Hero ── */}
      <header className="kl-hero">
        <span className="kl-glow" aria-hidden="true" />
        <span className="kl-pins" aria-hidden="true" />
        <span className="kl-dots" aria-hidden="true" />

        <div className="kl-logo">
          <img className="kl-logo-img" src="/sarvottam-logo.png" alt="SARVOTTAM Partner"
               onError={(e) => { const l = e.currentTarget.closest('.kl-logo'); if (l) l.classList.add('kl-logo--fallback'); }} />
          <div className="kl-logo-fallback">
            <strong>SARVOTTAM</strong>
            <span className="kl-badge">PARTNER</span>
          </div>
        </div>

        <div className="kl-headline">
          <h1>Kaam dhoondhna band karo.<br /><span className="accent">Jobs ab aapke paas aayengi.</span></h1>
        </div>
        <img className="kl-tech" src="/karigar-tech.png" alt=""
             onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/karigar-hero.png'; }} />
      </header>

      {/* ── Benefits strip (glassmorphism) ── */}
      <div className="kl-benefits">
        <div className="kl-benefit">
          <span className="kl-bic"><Icon name="bolt" size={18} /></span>
          <div className="kl-btxt"><strong>Emergency Jobs</strong></div>
        </div>
        <div className="kl-benefit">
          <span className="kl-bic"><Icon name="pin" size={18} /></span>
          <div className="kl-btxt"><strong>Nearby Customers</strong></div>
        </div>
        <div className="kl-benefit">
          <span className="kl-bic"><Icon name="cash" size={18} /></span>
          <div className="kl-btxt"><strong>Weekly Payouts</strong></div>
        </div>
      </div>

      {/* ── Login card ── */}
      <div className={'kl-card' + (shaking ? ' shake' : '')} onAnimationEnd={() => setShaking(false)}>
        <h2 className="kl-title">Karigar <span className="accent">Login</span></h2>
        <p className="kl-cardsub">Login karein aur jobs &amp; earnings track karein</p>
        {formErr && <div className="form-error"><Icon name="close" size={15} /> {formErr}</div>}

        <label className="auth-field">
          <span>Email or Mobile Number</span>
          <div className="auth-input">
            <Icon name="user" size={18} />
            <input value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="Enter email or mobile number" autoComplete="username" />
          </div>
        </label>

        <label className="auth-field">
          <span>Password</span>
          <div className="auth-input">
            <Icon name="lock" size={18} />
            <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" autoComplete="current-password" />
            <button type="button" className="auth-eye" onClick={() => setShowPw((v) => !v)}>{showPw ? 'Hide' : 'Show'}</button>
          </div>
        </label>

        <button className="kl-forgot" onClick={() => toast('Password reset — coming soon')}>Forgot Password?</button>

        <button className="kl-login" onClick={submit} disabled={busy}>
          {busy ? 'Signing in…' : 'Login'} <Icon name="arrow" size={18} />
        </button>

        <div className="kl-or"><span>OR</span></div>

        <button className="kl-register" onClick={() => nav('/register?role=karigar')}>
          <Icon name="user" size={18} /> Register as Karigar
        </button>

        <div className="kl-trust">
          <div className="kl-trust-item"><Icon name="shield" size={20} /><span>Verified Customers</span></div>
          <div className="kl-trust-item"><Icon name="lock" size={20} /><span>Secure Payments</span></div>
          <div className="kl-trust-item"><Icon name="bell" size={20} /><span>Real-time Job Alerts</span></div>
          <div className="kl-trust-item"><Icon name="headset" size={20} /><span>24/7 Support</span></div>
        </div>

        <p className="kl-secure"><Icon name="lock" size={14} /> Aapka data 100% secure hai</p>

        <button className="kl-switch" onClick={() => nav('/login')}>
          Looking for a service? <span>Customer Login</span>
        </button>
      </div>
    </div>
  );
}

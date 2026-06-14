import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import { useToast } from '../components/Toast';
import { useAppData } from '../store/AppData';
import './Login.css';

export default function Login() {
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
    if (res.role === 'karigar') {
      toast('Tip: use the Karigar login for worker accounts');
      nav('/karigar');
      return;
    }
    toast('Welcome back!');
    nav('/');
  }

  return (
    <div className="cl-screen">
      {/* Hero (logo + tagline + lifestyle scene baked into the image) */}
      <img className="cl-hero" src="/customer-hero.png" alt="SARVOTTAM — Book trusted home services in minutes" />

      {/* Feature strip */}
      <div className="cl-features">
        <div className="cl-feat"><span className="cl-fic"><Icon name="shield" size={20} /></span><strong>Verified<br />Karigars</strong></div>
        <div className="cl-feat"><span className="cl-fic"><Icon name="bolt" size={20} /></span><strong>Fast<br />Response</strong></div>
        <div className="cl-feat"><span className="cl-fic"><Icon name="lock" size={20} /></span><strong>Secure<br />Payments</strong></div>
        <div className="cl-feat"><span className="cl-fic"><Icon name="pin" size={20} /></span><strong>Live<br />Tracking</strong></div>
      </div>

      {/* Login card */}
      <div className={'cl-card' + (shaking ? ' shake' : '')} onAnimationEnd={() => setShaking(false)}>
        <h2 className="cl-title">Welcome Back <span className="cl-wave">👋</span></h2>
        <p className="cl-sub">Login karein aur service booking continue karein</p>
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

        <button className="cl-forgot" onClick={() => toast('Password reset — coming soon')}>Forgot Password?</button>

        <button className="cl-login" onClick={submit} disabled={busy}>
          {busy ? 'Signing in…' : 'Continue'} <Icon name="arrow" size={18} />
        </button>

        <div className="cl-or"><span>OR</span></div>

        <button className="cl-register" onClick={() => nav('/register')}>
          <Icon name="user" size={18} /> New Customer? <span>Create Account</span>
        </button>
      </div>

      {/* Karigar CTA banner */}
      <div className="cl-karigar">
        <img className="cl-karigar-img" src="/karigar-hero.png" alt="" />
        <div className="cl-karigar-txt">
          <strong>Earn with Sarvottam</strong>
          <small>Become a verified Karigar and receive nearby jobs.</small>
        </div>
        <button className="cl-karigar-btn" onClick={() => nav('/karigar-login')}>
          Join as Karigar <Icon name="arrow" size={16} />
        </button>
      </div>

      <p className="cl-secure"><Icon name="lock" size={14} /> Aapka data 100% secure hai</p>
    </div>
  );
}

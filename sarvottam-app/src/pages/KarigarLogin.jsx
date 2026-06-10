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

  function submit() {
    if (!identifier.trim()) { toast('Enter your email or phone'); return; }
    if (!password) { toast('Enter your password'); return; }
    const res = login(identifier, password);
    if (!res.ok) { toast(res.error); return; }
    if (res.role !== 'karigar') {
      toast('This is a customer account — use Customer login');
      nav('/');
      return;
    }
    toast('Welcome back, Karigar!');
    nav('/karigar');
  }

  return (
    <div className="auth-screen">
      <div className="auth-brand karigar-brand">
        <img className="auth-peacock" src="/peacock.png" alt="" />
        <h1>SARVOTTAM <span className="brand-pro">PRO</span></h1>
        <p>For Karigars — work &amp; earn near you</p>
      </div>

      <div className="auth-card">
        <h2 className="auth-h2">Karigar Login</h2>
        <p className="auth-sub">Sign in to get jobs and track earnings</p>

        <label className="auth-field">
          <span>Email or Phone</span>
          <div className="auth-input">
            <Icon name="user" size={18} />
            <input value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="you@email.com or 98765 43210" autoComplete="username" />
          </div>
        </label>

        <label className="auth-field">
          <span>Password</span>
          <div className="auth-input">
            <Icon name="shield" size={18} />
            <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" autoComplete="current-password" />
            <button type="button" className="auth-eye" onClick={() => setShowPw((v) => !v)}>{showPw ? 'Hide' : 'Show'}</button>
          </div>
        </label>

        <button className="auth-forgot" onClick={() => toast('Password reset — coming soon')}>Forgot password?</button>

        <button className="auth-cta karigar-cta" onClick={submit}>Log in</button>

        <p className="auth-switch">
          New Karigar? <button onClick={() => nav('/register?role=karigar')}>Register here</button>
        </p>
      </div>

      <div className="auth-divider"><span>or</span></div>

      <button className="auth-karigar" onClick={() => nav('/login')}>
        <div className="ak-ic customer-ic"><Icon name="user" size={20} /></div>
        <div className="ak-text">
          <strong>Looking for a service?</strong>
          <small>Go to Customer login</small>
        </div>
        <Icon name="chevron" size={16} />
      </button>

      <p className="auth-terms">Karigar accounts are verified by the SARVOTTAM team.</p>
    </div>
  );
}

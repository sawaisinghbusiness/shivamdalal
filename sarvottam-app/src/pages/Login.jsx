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

  function submit() {
    if (!identifier.trim()) { toast('Enter your email or phone'); return; }
    if (!password) { toast('Enter your password'); return; }
    const res = login(identifier, password);
    if (!res.ok) { toast(res.error); return; }
    toast('Welcome back!');
    nav(res.role === 'karigar' ? '/karigar' : '/');
  }

  return (
    <div className="auth-screen">
      <div className="auth-brand">
        <img className="auth-peacock" src="/peacock.png" alt="" />
        <h1>SARVOTTAM</h1>
        <p>Every home service, one tap away</p>
      </div>

      <div className="auth-card">
        <h2 className="auth-h2">Log in</h2>
        <p className="auth-sub">Welcome back — please sign in to continue</p>

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

        <button className="auth-cta" onClick={submit}>Log in</button>

        <p className="auth-switch">
          New to SARVOTTAM? <button onClick={() => nav('/register')}>Create account</button>
        </p>
      </div>

      <div className="auth-divider"><span>or</span></div>

      <button className="auth-karigar" onClick={() => nav('/register?role=karigar')}>
        <div className="ak-ic"><Icon name="wrench" size={20} /></div>
        <div className="ak-text">
          <strong>Earn as a Karigar</strong>
          <small>Electrician, plumber, painter — register here</small>
        </div>
        <Icon name="chevron" size={16} />
      </button>

      <p className="auth-terms">By continuing you agree to our Terms &amp; Privacy Policy</p>
      <p className="auth-demo">Demo login → email: demo@sarvottam.com · password: 1234</p>
    </div>
  );
}

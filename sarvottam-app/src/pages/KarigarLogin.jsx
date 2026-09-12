import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import { useToast } from '../components/Toast';
import { useAppData } from '../store/AppData';
import './Login.css';

export default function KarigarLogin() {
  const nav = useNavigate();
  const toast = useToast();
  const { loginKarigar } = useAppData();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formErr, setFormErr] = useState('');
  const [shaking, setShaking] = useState(false);

  function fail(msg) {
    setFormErr(msg);
    setShaking(true);
  }

  async function submit(e) {
    if (e) e.preventDefault();
    if (busy) return;
    if (!identifier.trim()) {
      fail('Please enter your Partner ID, Mobile or Email');
      return;
    }
    if (!password) {
      fail('Please enter your password');
      return;
    }
    setFormErr('');
    setBusy(true);

    const res = await loginKarigar(identifier, password);
    setBusy(false);

    if (!res.ok) {
      fail(res.error || 'Invalid Partner ID or Password');
      return;
    }

    toast('Welcome back, Captain!');
    nav('/karigar');
  }

  return (
    <div className="kl-screen clean-partner-login">
      {/* Top Header */}
      <div className="kl-top-bar">
        <button
          type="button"
          className="kl-back-arrow"
          onClick={() => nav('/login')}
          aria-label="Back to Customer Login"
        >
          <Icon name="back" size={18} />
        </button>
        <span className="kl-partner-pill">SARVOTTAM PARTNER</span>
      </div>

      <div className="kl-auth-container">
        {/* Logo & Headline */}
        <div className="kl-auth-head">
          <div className="kl-badge-icon">
            <Icon name="wrench" size={26} />
          </div>
          <h1 className="kl-auth-title">Partner Duty Login</h1>
          <p className="kl-auth-sub">
            Enter your <strong>Partner ID</strong>, registered mobile number, and password to sign in.
          </p>
        </div>

        {/* Login Form Card */}
        <form
          className={'cl-card' + (shaking ? ' shake' : '')}
          onSubmit={submit}
          onAnimationEnd={() => setShaking(false)}
        >
          {formErr && (
            <div className="form-error">
              <Icon name="close" size={15} /> {formErr}
            </div>
          )}

          <label className="auth-field">
            <span>Partner ID / Registered Mobile</span>
            <div className="auth-input">
              <Icon name="user" size={18} />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. 9414012345 or SARV-K101"
                autoComplete="username"
                required
              />
            </div>
          </label>

          <label className="auth-field">
            <span>Password</span>
            <div className="auth-input">
              <Icon name="lock" size={18} />
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="auth-eye"
                onClick={() => setShowPw((v) => !v)}
              >
                {showPw ? 'Hide' : 'Show'}
              </button>
            </div>
          </label>

          <button
            type="submit"
            className="cl-login"
            disabled={busy}
          >
            {busy ? 'Verifying Credentials…' : 'Sign In to Duty'}
            <Icon name="arrow" size={18} />
          </button>

          <div className="kl-footer-hints">
            <div className="kl-demo-hint">
              <Icon name="info" size={13} />
              <span>Demo Partner ID: <strong>9414012345</strong> · Pass: <strong>password123</strong></span>
            </div>

            <button
              type="button"
              className="kl-switch-btn"
              onClick={() => nav('/login')}
            >
              Looking for home services? <span>Go to Customer App</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

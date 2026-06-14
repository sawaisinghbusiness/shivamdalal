import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../components/Icon';
import { useToast } from '../components/Toast';
import { useAppData } from '../store/AppData';
import './VerifyEmail.css';

export default function VerifyEmail() {
  const nav = useNavigate();
  const loc = useLocation();
  const toast = useToast();
  const { user, verifyEmailDone } = useAppData();

  const email = loc.state?.email || user?.email || 'your email';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [secs, setSecs] = useState(30);
  const [busy, setBusy] = useState(false);
  const [shaking, setShaking] = useState(false);
  const inputs = useRef([]);

  // Resend countdown
  useEffect(() => {
    if (secs <= 0) return;
    const t = setTimeout(() => setSecs((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secs]);

  function setDigit(i, v) {
    const d = v.replace(/\D/g, '').slice(-1);
    setOtp((prev) => { const n = [...prev]; n[i] = d; return n; });
    if (d && i < 5) inputs.current[i + 1]?.focus();
  }

  function onKeyDown(i, e) {
    if (e.key === 'Backspace' && !otp[i] && i > 0) inputs.current[i - 1]?.focus();
  }

  function onPaste(e) {
    const txt = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6);
    if (!txt) return;
    e.preventDefault();
    const n = ['', '', '', '', '', ''];
    for (let i = 0; i < txt.length; i++) n[i] = txt[i];
    setOtp(n);
    inputs.current[Math.min(txt.length, 5)]?.focus();
  }

  function verify() {
    if (busy) return;
    const code = otp.join('');
    if (code.length < 6) { setShaking(true); toast('Enter the full 6-digit code'); return; }
    setBusy(true);
    // UI flow — real 6-digit email OTP needs a backend (see note to user).
    setTimeout(() => { setBusy(false); verifyEmailDone(); toast('Email verified — welcome!'); nav('/'); }, 400);
  }

  function resend() {
    if (secs > 0) return;
    setSecs(30);
    toast('Verification code re-sent');
  }

  const mm = String(Math.floor(secs / 60)).padStart(2, '0');
  const ss = String(secs % 60).padStart(2, '0');

  return (
    <div className="ve-screen">
      <div className="ve-top">
        <button className="ve-back" onClick={() => nav(-1)}><Icon name="back" size={18} /></button>
        <span className="ve-logo">SARVOTTAM</span>
        <span className="ve-spacer" />
      </div>

      <img className="ve-illus" src="/verify-mail.png" alt="" />

      <h1 className="ve-title">Verify Your<br />Email Address</h1>
      <p className="ve-sub">We sent a 6-digit verification code to<br /><strong>{email}</strong></p>

      <div className={'ve-otp' + (shaking ? ' shake' : '')} onPaste={onPaste} onAnimationEnd={() => setShaking(false)}>
        {otp.map((d, i) => (
          <input
            key={i}
            ref={(el) => (inputs.current[i] = el)}
            className={'ve-box' + (d ? ' filled' : '')}
            value={d}
            onChange={(e) => setDigit(i, e.target.value)}
            onKeyDown={(e) => onKeyDown(i, e)}
            inputMode="numeric"
            maxLength={1}
            autoFocus={i === 0}
          />
        ))}
      </div>

      <p className="ve-resend">
        <Icon name="mail" size={15} /> Didn't receive the code?{' '}
        {secs > 0
          ? <>Resend email in <b>{mm}:{ss}</b></>
          : <button className="ve-resend-btn" onClick={resend}>Resend email</button>}
      </p>

      <button className="ve-verify" onClick={verify} disabled={busy}>
        <Icon name="shield" size={18} /> {busy ? 'Verifying…' : 'Verify & Continue'}
      </button>

      <div className="ve-note">
        <span className="ve-note-ic"><Icon name="lock" size={18} /></span>
        <span>Your email is secure and used only for account verification.</span>
      </div>
    </div>
  );
}

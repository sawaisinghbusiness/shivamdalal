import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import { useToast } from '../components/Toast';
import { useAppData } from '../store/AppData';
import './Login.css';

const DEMO_OTP = '1234';

export default function Login() {
  const nav = useNavigate();
  const toast = useToast();
  const { login } = useAppData();

  const [mode, setMode] = useState('phone'); // phone | otp | signup
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [signup, setSignup] = useState(false);
  const otpRefs = [useRef(), useRef(), useRef(), useRef()];

  useEffect(() => {
    if (mode === 'otp') setTimeout(() => otpRefs[0].current?.focus(), 350);
  }, [mode]);

  function sendOtp() {
    if (phone.replace(/\D/g, '').length < 10) { toast('Sahi 10-digit number daalein'); return; }
    if (signup && name.trim().length < 2) { toast('Apna naam daalein'); return; }
    setMode('otp');
    toast(`Demo: OTP hai ${DEMO_OTP}`);
  }

  function onOtpChange(i, val) {
    const v = val.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[i] = v;
    setOtp(next);
    if (v && i < 3) otpRefs[i + 1].current?.focus();
  }

  function verifyOtp() {
    if (otp.join('') !== DEMO_OTP) { toast('Galat OTP. Demo OTP: ' + DEMO_OTP); return; }
    login('+91 ' + phone.replace(/\D/g, ''), signup ? name.trim() : undefined);
    toast('✓ Login ho gaya — swagat hai!');
    nav('/');
  }

  return (
    <div className="login-screen">
      {/* Brand header */}
      <div className="login-top">
        <img className="login-peacock" src="/peacock.png" alt="" />
        <h1 className="login-brand">SARVOTTAM</h1>
        <p className="login-tagline">Ghar ki har service, ek tap mein</p>
      </div>

      <div className="login-card">
        {mode === 'phone' && (
          <>
            <h2 className="login-h2">{signup ? 'Account banayein' : 'Login karein'}</h2>
            <p className="login-sub">{signup ? 'Naya account — sirf phone se' : 'Phone number se aage badhein'}</p>

            {signup && (
              <label className="login-field">
                <span>Poora naam</span>
                <div className="login-input"><Icon name="user" size={18} /><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Aapka naam" /></div>
              </label>
            )}

            <label className="login-field">
              <span>Phone number</span>
              <div className="login-input">
                <span className="login-cc">+91</span>
                <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="98765 43210" inputMode="numeric" />
              </div>
            </label>

            <button className="login-cta" onClick={sendOtp}>Get OTP</button>

            <p className="login-switch">
              {signup ? 'Pehle se account hai? ' : 'Naya user? '}
              <button onClick={() => setSignup((v) => !v)}>{signup ? 'Login karein' : 'Account banayein'}</button>
            </p>
          </>
        )}

        {mode === 'otp' && (
          <>
            <button className="login-back" onClick={() => setMode('phone')}><Icon name="back" size={18} /></button>
            <h2 className="login-h2">OTP daalein</h2>
            <p className="login-sub">+91 {phone} pe bheja gaya <span className="login-demohint">(demo: {DEMO_OTP})</span></p>

            <div className="otp-row">
              {otp.map((d, i) => (
                <input key={i} ref={otpRefs[i]} className="otp-box" value={d} inputMode="numeric"
                  onChange={(e) => onOtpChange(i, e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Backspace' && !d && i > 0) otpRefs[i - 1].current?.focus(); }} />
              ))}
            </div>

            <button className="login-cta" onClick={verifyOtp}>Verify & Continue</button>
            <p className="login-switch"><button onClick={() => toast(`Demo: OTP ${DEMO_OTP} dobara bheja`)}>OTP dobara bhejein</button></p>
          </>
        )}
      </div>

      {/* Register as Karigar */}
      <button className="login-karigar" onClick={() => nav('/register-karigar')}>
        <div className="lk-ic"><Icon name="wrench" size={20} /></div>
        <div className="lk-text">
          <strong>Karigar ban kar kamayein</strong>
          <small>Electrician, plumber, painter? Yahan register karein</small>
        </div>
        <Icon name="chevron" size={16} />
      </button>

      <p className="login-terms">Aage badhne par aap hamari Terms & Privacy se sehmat hain</p>
    </div>
  );
}

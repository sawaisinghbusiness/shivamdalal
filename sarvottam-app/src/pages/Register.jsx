import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Icon from '../components/Icon';
import { useToast } from '../components/Toast';
import { useAppData } from '../store/AppData';
import './Login.css';

const SKILLS = ['Electrician', 'Plumber', 'Carpenter', 'AC Repair', 'Painter', 'Other'];

export default function Register() {
  const nav = useNavigate();
  const toast = useToast();
  const [params] = useSearchParams();
  const { signupCustomer, registerKarigar } = useAppData();

  // role is fixed by entry point: /register = customer, /register?role=karigar = karigar
  const isKarigar = params.get('role') === 'karigar';

  // shared fields
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  // karigar extra
  const [skills, setSkills] = useState([]);
  const [area, setArea] = useState('');
  const [exp, setExp] = useState('');
  const [idDone, setIdDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formErr, setFormErr] = useState('');
  const [shaking, setShaking] = useState(false);

  function fail(msg) { setFormErr(msg); setShaking(true); }

  function toggleSkill(s) {
    setSkills((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));
  }

  function validateCommon() {
    if (name.trim().length < 2) return 'Enter your first name';
    if (surname.trim().length < 1) return 'Enter your surname';
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(email.trim())) return 'Enter a valid email';
    if (phone.replace(/\D/g, '').length !== 10) return 'Enter a valid 10-digit phone';
    if (password.length < 6) return 'Password must be at least 6 characters';
    if (password !== confirm) return 'Passwords do not match';
    return null;
  }

  async function submit() {
    if (busy) return;
    const v = validateCommon();
    if (v) { fail(v); return; }

    const base = { name: name.trim(), surname: surname.trim(), email: email.trim(), phone: phone.replace(/\D/g, ''), password };

    if (isKarigar) {
      if (skills.length === 0) { fail('Select at least one skill'); return; }
      if (area.trim().length < 2) { fail('Enter your area / city'); return; }
      if (!idDone) { fail('Upload your ID proof'); return; }
      setFormErr('');
      setBusy(true);
      const res = await registerKarigar({ ...base, skill: skills.join(', '), skills, area: area.trim(), exp });
      setBusy(false);
      if (!res.ok) { fail(res.error); return; }
      toast('Welcome! Your Karigar account is ready');
      nav('/karigar');
    } else {
      setFormErr('');
      setBusy(true);
      const res = await signupCustomer(base);
      setBusy(false);
      if (!res.ok) { fail(res.error); return; }
      // App gates to the email-verify screen automatically (no home flash)
    }
  }

  const goBack = () => nav(isKarigar ? '/karigar-login' : '/login');

  return (
    <div className="auth-screen">
      {isKarigar ? (
        <header className="karigar-hero">
          <span className="kh-glow" aria-hidden="true" />
          <span className="kh-dots" aria-hidden="true" />
          <button className="kh-back" onClick={goBack}><Icon name="back" size={20} /></button>
          <div className="kh-text">
            <h1 className="kh-title"><span className="accent">Karigar</span> Register</h1>
            <p className="kh-sub">Join our trusted network and earn more with every job</p>
          </div>
          <img className="kh-img" src="/karigar-hero.png" alt=""
               onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        </header>
      ) : (
        <div className="auth-topbar">
          <button className="auth-back" onClick={goBack}><Icon name="back" size={18} /></button>
          <span>Create Account</span>
        </div>
      )}

      <div className={'auth-card flush' + (isKarigar ? ' karigar-card' : '') + (shaking ? ' shake' : '')}
           onAnimationEnd={() => setShaking(false)}>
        {formErr && (
          <div className="form-error"><Icon name="close" size={15} /> {formErr}</div>
        )}
        {isKarigar && (
          <>
            <div className="earn-banner">
              <div className="eb-ic"><Icon name="rupee" size={24} /></div>
              <div className="eb-text">
                <strong>Earn ₹25,000 – ₹60,000 / month</strong>
                <small>Work on your schedule, get paid per job</small>
              </div>
              <span className="eb-chart"><Icon name="trend" size={28} /></span>
            </div>
          </>
        )}

        {/* Name + Surname */}
        <div className="auth-row">
          <label className="auth-field">
            <span>First name</span>
            <div className="auth-input"><Icon name="user" size={18} /><input value={name} onChange={(e) => setName(e.target.value)} placeholder="First name" /></div>
          </label>
          <label className="auth-field">
            <span>Surname</span>
            <div className="auth-input"><Icon name="user" size={18} /><input value={surname} onChange={(e) => setSurname(e.target.value)} placeholder="Surname" /></div>
          </label>
        </div>

        <label className="auth-field">
          <span>Email address</span>
          <div className="auth-input"><Icon name="mail" size={18} /><input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" inputMode="email" autoComplete="email" /></div>
        </label>

        <label className="auth-field">
          <span>Phone number</span>
          <div className="auth-input"><Icon name="phone" size={18} /><span className="auth-cc">+91</span><input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="98765 43210" inputMode="numeric" /></div>
        </label>

        <label className="auth-field">
          <span>Password</span>
          <div className="auth-input"><Icon name="lock" size={18} /><input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" /><button type="button" className="auth-eye" onClick={() => setShowPw((v) => !v)}>{showPw ? 'Hide' : 'Show'}</button></div>
        </label>

        <label className="auth-field">
          <span>Confirm password</span>
          <div className="auth-input"><Icon name="lock" size={18} /><input type={showPw ? 'text' : 'password'} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Re-enter password" /></div>
        </label>

        {/* Karigar-only extra fields */}
        {isKarigar && (
          <>
            <p className="auth-section-label">Your skills <span className="sl-muted">(Select all that apply)</span></p>
            <div className="skill-grid">
              {SKILLS.map((s) => {
                const on = skills.includes(s);
                return (
                  <button key={s} type="button" className={'skill-chk' + (on ? ' active' : '')} onClick={() => toggleSkill(s)}>
                    <span className="chk-box">{on && <Icon name="check" size={13} />}</span>
                    {s}
                  </button>
                );
              })}
            </div>

            <label className="auth-field">
              <span>Area / City</span>
              <div className="auth-input"><Icon name="pin" size={18} /><input value={area} onChange={(e) => setArea(e.target.value)} placeholder="e.g. Barmer, Rajasthan" /></div>
            </label>
            <label className="auth-field">
              <span>Experience in years (optional)</span>
              <div className="auth-input"><Icon name="star" size={18} /><input value={exp} onChange={(e) => setExp(e.target.value.replace(/\D/g, '').slice(0, 2))} placeholder="e.g. 5" inputMode="numeric" /></div>
            </label>
            <div className="auth-field">
              <span>ID proof (Aadhaar / Voter ID)</span>
              <button className={'id-upload' + (idDone ? ' done' : '')} onClick={() => { setIdDone(true); toast('ID uploaded'); }}>
                <Icon name={idDone ? 'check' : 'plus'} size={18} /> {idDone ? 'ID uploaded' : 'Upload ID photo'}
              </button>
            </div>
          </>
        )}

        <button className="auth-cta" onClick={submit} disabled={busy}>
          <Icon name="shield" size={18} />
          {busy ? 'Creating…' : (isKarigar ? 'Create Account' : 'Create account')}
        </button>

        <p className="auth-switch">Already have an account? <button onClick={goBack}>Log in</button></p>

        {isKarigar && <p className="auth-terms">Your ID will be verified by the SARVOTTAM team before customers can see you.</p>}
      </div>
    </div>
  );
}

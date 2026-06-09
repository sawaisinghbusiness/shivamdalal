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

  const [isKarigar, setIsKarigar] = useState(params.get('role') === 'karigar');

  // shared fields
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  // karigar extra
  const [skill, setSkill] = useState('');
  const [area, setArea] = useState('');
  const [exp, setExp] = useState('');
  const [idDone, setIdDone] = useState(false);

  function validateCommon() {
    if (name.trim().length < 2) return 'Enter your first name';
    if (surname.trim().length < 1) return 'Enter your surname';
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(email.trim())) return 'Enter a valid email';
    if (phone.replace(/\D/g, '').length !== 10) return 'Enter a valid 10-digit phone';
    if (password.length < 4) return 'Password must be at least 4 characters';
    if (password !== confirm) return 'Passwords do not match';
    return null;
  }

  function submit() {
    const err = validateCommon();
    if (err) { toast(err); return; }

    const base = { name: name.trim(), surname: surname.trim(), email: email.trim(), phone: phone.replace(/\D/g, ''), password };

    if (isKarigar) {
      if (!skill) { toast('Select your skill'); return; }
      if (area.trim().length < 2) { toast('Enter your area / city'); return; }
      if (!idDone) { toast('Upload your ID proof'); return; }
      const res = registerKarigar({ ...base, skill, area: area.trim(), exp });
      if (!res.ok) { toast(res.error); return; }
      toast('Welcome! Your Karigar account is ready');
      nav('/karigar');
    } else {
      const res = signupCustomer(base);
      if (!res.ok) { toast(res.error); return; }
      toast('Account created — welcome!');
      nav('/');
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-topbar">
        <button className="auth-back" onClick={() => nav('/login')}><Icon name="back" size={18} /></button>
        <span>{isKarigar ? 'Karigar Registration' : 'Create Account'}</span>
      </div>

      <div className="auth-card flush">
        {/* Role toggle */}
        <div className="role-toggle">
          <button className={'role-opt' + (!isKarigar ? ' active' : '')} onClick={() => setIsKarigar(false)}>
            <Icon name="user" size={16} /> Customer
          </button>
          <button className={'role-opt' + (isKarigar ? ' active' : '')} onClick={() => setIsKarigar(true)}>
            <Icon name="wrench" size={16} /> Karigar
          </button>
        </div>

        {isKarigar && (
          <div className="karigar-banner">
            <strong>Earn ₹25,000 – ₹60,000 / month</strong>
            <small>Work on your schedule, get paid per job</small>
          </div>
        )}

        {/* Name + Surname */}
        <div className="auth-row">
          <label className="auth-field">
            <span>First name</span>
            <div className="auth-input"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="First name" /></div>
          </label>
          <label className="auth-field">
            <span>Surname</span>
            <div className="auth-input"><input value={surname} onChange={(e) => setSurname(e.target.value)} placeholder="Surname" /></div>
          </label>
        </div>

        <label className="auth-field">
          <span>Email</span>
          <div className="auth-input"><Icon name="card" size={18} /><input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" inputMode="email" /></div>
        </label>

        <label className="auth-field">
          <span>Phone number</span>
          <div className="auth-input"><span className="auth-cc">+91</span><input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="98765 43210" inputMode="numeric" /></div>
        </label>

        <label className="auth-field">
          <span>Password</span>
          <div className="auth-input"><Icon name="shield" size={18} /><input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password" /><button type="button" className="auth-eye" onClick={() => setShowPw((v) => !v)}>{showPw ? 'Hide' : 'Show'}</button></div>
        </label>

        <label className="auth-field">
          <span>Confirm password</span>
          <div className="auth-input"><Icon name="shield" size={18} /><input type={showPw ? 'text' : 'password'} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Re-enter password" /></div>
        </label>

        {/* Karigar-only extra fields appear inline */}
        {isKarigar && (
          <>
            <div className="auth-field">
              <span>Your skill</span>
              <div className="skill-row">
                {SKILLS.map((s) => (
                  <button key={s} className={'skill-chip' + (skill === s ? ' active' : '')} onClick={() => setSkill(s)}>{s}</button>
                ))}
              </div>
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

        <button className="auth-cta" onClick={submit}>{isKarigar ? 'Register as Karigar' : 'Create account'}</button>

        <p className="auth-switch">Already have an account? <button onClick={() => nav('/login')}>Log in</button></p>

        {isKarigar && <p className="auth-terms">Your ID will be verified by the SARVOTTAM team before customers can see you.</p>}
      </div>
    </div>
  );
}

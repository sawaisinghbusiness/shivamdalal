import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SubHeader from '../components/SubHeader';
import { useAppData } from '../store/AppData';
import { useToast } from '../components/Toast';
import './FormPages.css';

export default function EditProfile() {
  const { user, updateUser } = useAppData();
  const toast = useToast();
  const nav = useNavigate();

  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [email, setEmail] = useState(user.email);

  const initial = (name.trim()[0] || 'U').toUpperCase();

  function save() {
    if (name.trim().length < 2) { toast('Please enter a valid full name'); return; }
    if (phone.replace(/\D/g, '').length < 10) { toast('Please enter a valid 10-digit phone number'); return; }
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(email.trim())) { toast('Please enter a valid email address'); return; }
    updateUser({ name: name.trim(), phone: phone.trim(), email: email.trim() });
    toast('Profile updated successfully');
    nav(-1);
  }

  return (
    <div className="sub-page">
      <SubHeader title="Edit Profile" sub="Update your contact information" />

      <div className="form-avatar-wrap">
        <div className="form-avatar">{initial}</div>
        <button className="form-avatar-edit" onClick={() => toast('Profile photo upload coming soon')}>
          Change Photo
        </button>
      </div>

      <div className="form-fields">
        <label className="field">
          <span>Full Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
        </label>
        <label className="field">
          <span>Phone Number</span>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 …" inputMode="tel" />
        </label>
        <label className="field">
          <span>Email Address</span>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" inputMode="email" />
          <small className="field-note">Changing email may require verification</small>
        </label>
      </div>

      <div className="form-actions">
        <button className="btn-primary" onClick={save}>Save Changes</button>
        <button className="btn-ghost" onClick={() => nav(-1)}>Cancel</button>
      </div>
    </div>
  );
}

import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import { useToast } from '../components/Toast';
import { useAppData } from '../store/AppData';
import './Profile.css';

export default function Profile() {
  const nav = useNavigate();
  const toast = useToast();
  const { user, updateUser, bookings, addresses, notifications, logout } = useAppData();
  const fileInputRef = useRef(null);

  const initial = (user.name.trim()[0] || 'U').toUpperCase();
  const unread = notifications.filter((n) => n.unread).length;

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast('Please select an image file from your gallery');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX = 400;
        let w = img.width;
        let h = img.height;
        if (w > h) {
          if (w > MAX) {
            h = Math.round((h * MAX) / w);
            w = MAX;
          }
        } else {
          if (h > MAX) {
            w = Math.round((w * MAX) / h);
            h = MAX;
          }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const optimized = canvas.toDataURL('image/jpeg', 0.85);
        updateUser({ avatar: optimized });
        toast('Profile photo updated from gallery!');
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const STATS = [
    { num: String(bookings.length), label: 'Bookings' },
    { num: String(addresses.length), label: 'Addresses' },
    { num: '4.9★', label: 'Rating' },
  ];

  const OPTIONS = [
    { icon: 'bookings', title: 'My Bookings',       sub: 'Complete service history',       to: '/bookings' },
    { icon: 'pin',      title: 'Saved Addresses',   sub: 'Home, Office & custom locations',to: '/addresses' },
    { icon: 'card',     title: 'Payments & Wallet', sub: 'Wallet balance & payment modes', to: '/wallet' },
    { icon: 'bell',     title: 'Notifications',     sub: unread ? `${unread} new alerts` : 'Offers and order updates', to: '/notifications' },
    { icon: 'shield',   title: 'Help & Support',    sub: '24×7 customer assistance',       to: '/help' },
  ];

  return (
    <div className="page">
      <div className="inner-header profile-head">
        <h1 className="ih-title">My Profile</h1>
        <p className="ih-sub">Your account and preferences</p>
      </div>

      {/* Hidden gallery file input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handlePhotoSelect}
      />

      <div className="pf-user-card">
        <div
          className="pf-avatar-wrap"
          onClick={() => fileInputRef.current?.click()}
          title="Upload photo from gallery"
          role="button"
          tabIndex={0}
        >
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="pf-avatar-img" />
          ) : (
            <div className="pf-avatar">{initial}</div>
          )}
          <span className="pf-avatar-badge" title="Change photo">
            <Icon name="camera" size={12} />
          </span>
        </div>
        <div className="pf-user-info">
          <h2>{user.name}</h2>
          <p>{user.phone}</p>
          <p className="pf-email">{user.email}</p>
        </div>
        <button className="pf-edit" onClick={() => nav('/profile/edit')}>
          <Icon name="user" size={16} /> Edit
        </button>
      </div>

      <div className="pf-stats">
        {STATS.map((s, i) => (
          <div className="pf-stat" key={i}>
            <strong>{s.num}</strong>
            <small>{s.label}</small>
          </div>
        ))}
      </div>

      <div className="pf-options">
        {OPTIONS.map((o, i) => (
          <button className="pf-option" key={i} onClick={() => nav(o.to)}>
            <span className="pf-opt-ic"><Icon name={o.icon} size={20} /></span>
            <span className="pf-opt-text">
              <strong>{o.title}</strong>
              <small>{o.sub}</small>
            </span>
            <Icon name="chevron" size={16} />
          </button>
        ))}
      </div>

      <button className="pf-logout" onClick={() => { logout(); toast('Logged out'); }}>
        Log Out
      </button>

      <p className="pf-version">SARVOTTAM · v1.0 (demo)</p>
      <div className="bottom-spacer" />
    </div>
  );
}

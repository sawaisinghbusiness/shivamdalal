import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SubHeader from '../components/SubHeader';
import Icon from '../components/Icon';
import { useAppData } from '../store/AppData';
import { useToast } from '../components/Toast';
import './FormPages.css';

export default function EditProfile() {
  const { user, updateUser } = useAppData();
  const toast = useToast();
  const nav = useNavigate();
  const fileInputRef = useRef(null);

  const [name, setName] = useState(user.name || '');
  const [avatar, setAvatar] = useState(user.avatar || null);

  const initial = (name.trim()[0] || 'U').toUpperCase();

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
        setAvatar(optimized);
        updateUser({ avatar: optimized });
        toast('Profile photo updated from gallery!');
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  function save() {
    if (name.trim().length < 2) {
      toast('Please enter a valid full name');
      return;
    }
    updateUser({ name: name.trim(), avatar });
    toast('Profile updated successfully');
    nav(-1);
  }

  return (
    <div className="sub-page">
      <SubHeader title="Edit Profile" sub="Update your profile photo and full name" />

      {/* Hidden file input for native device gallery */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handlePhotoSelect}
      />

      <div className="form-avatar-wrap">
        <div
          className="form-avatar-box"
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          title="Click to choose photo from gallery"
        >
          {avatar ? (
            <img src={avatar} alt={name} className="form-avatar-img" />
          ) : (
            <div className="form-avatar">{initial}</div>
          )}
          <button
            type="button"
            className="form-avatar-camera-btn"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            title="Upload photo from gallery"
          >
            <Icon name="camera" size={15} />
          </button>
        </div>
        <button
          type="button"
          className="form-avatar-edit"
          onClick={() => fileInputRef.current?.click()}
        >
          {avatar ? 'Change Gallery Photo' : 'Upload Photo from Gallery'}
        </button>
      </div>

      <div className="form-fields">
        {/* Full Name: Editable */}
        <label className="field">
          <span>Full Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
          />
        </label>

        {/* Phone Number: LOCKED / READ-ONLY */}
        <label className="field field-locked">
          <div className="field-head-row">
            <span>Phone Number</span>
            <span className="locked-badge"><Icon name="lock" size={11} /> Locked</span>
          </div>
          <input
            value={user.phone || '+91 9876543210'}
            disabled
            readOnly
            className="input-disabled"
          />
          <small className="field-note field-locked-note">
            Registered phone number cannot be changed for security.
          </small>
        </label>

        {/* Email Address: LOCKED / READ-ONLY */}
        <label className="field field-locked">
          <div className="field-head-row">
            <span>Email Address</span>
            <span className="locked-badge"><Icon name="lock" size={11} /> Locked</span>
          </div>
          <input
            value={user.email || 'shivam@sarvottam.in'}
            disabled
            readOnly
            className="input-disabled"
          />
          <small className="field-note field-locked-note">
            Account email address cannot be changed.
          </small>
        </label>
      </div>

      <div className="form-actions">
        <button className="btn-primary" onClick={save}>Save Changes</button>
        <button className="btn-ghost" onClick={() => nav(-1)}>Cancel</button>
      </div>
    </div>
  );
}

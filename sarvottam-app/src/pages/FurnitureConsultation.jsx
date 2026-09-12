import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../components/Icon';
import { useToast } from '../components/Toast';
import { useAppData } from '../store/AppData';
import './FurnitureConsultation.css';

const INDIAN_CITIES = [
  'Bengaluru',
  'Jaipur',
  'Jodhpur',
  'Udaipur',
  'Barmer',
  'Bikaner',
  'Kota',
  'Delhi-NCR',
  'Mumbai',
  'Pune',
  'Hyderabad',
  'Ahmedabad',
  'Chennai',
  'Kolkata',
];

export default function FurnitureConsultation() {
  const nav = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { user, addBookingDemo } = useAppData();

  // Selected design passed from previous screen if available
  const targetDesign = location.state?.design || null;
  const targetSpace = location.state?.space || null;

  // Form State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone?.replace('+91 ', '') || '');
  const [whatsappUpdates, setWhatsappUpdates] = useState(true);
  const [city, setCity] = useState('Bengaluru');
  const [chatOpen, setChatOpen] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast('Please enter your full name');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      toast('Please enter a valid 10-digit mobile number');
      return;
    }

    const serviceTitle = targetDesign
      ? `Designer Consultation: ${targetDesign.name}`
      : `Free Interior Consultation (${city})`;

    addBookingDemo({
      service: serviceTitle,
      icon: 'hammer',
      karigar: 'Senior Karigar Designer assigned on schedule',
      amount: 0,
      status: 'upcoming',
      notes: `City: ${city}. Email: ${email || 'N/A'}. WhatsApp Updates: ${whatsappUpdates ? 'Yes' : 'No'}. Design: ${targetDesign?.name || 'General Space Planning'}.`,
    });

    setSubmitted(true);
    toast('Consultation booked! A senior designer will contact you.');
  };

  const handleClose = () => {
    if (window.history.length > 1) {
      nav(-1);
    } else {
      nav('/furniture');
    }
  };

  return (
    <div className="fc-page">
      {/* ── TOP HEADER (EXACT LIVSPACE MATCH) ── */}
      <header className="fc-header">
        <button
          type="button"
          className="fc-close-btn"
          onClick={handleClose}
          aria-label="Close"
        >
          <Icon name="close" size={20} />
        </button>
        <h1 className="fc-header-title">Talk to a designer</h1>
      </header>

      {/* ── FORM CONTAINER ── */}
      <main className="fc-main">
        {submitted ? (
          <div className="fc-success-box">
            <div className="fc-success-badge">
              <Icon name="check" size={32} />
            </div>
            <h2 className="fc-success-heading">Consultation Scheduled!</h2>
            <p className="fc-success-desc">
              Thank you, <strong>{name}</strong>! Our senior designer has received your request for <strong>{city}</strong>. We will reach out on <strong>+91 {phone}</strong> {whatsappUpdates ? 'and WhatsApp' : ''} with 3D floor plan options.
            </p>
            {targetDesign && (
              <div className="fc-design-preview-chip">
                <img src={targetDesign.img} alt={targetDesign.name} />
                <div className="fc-dpc-text">
                  <small>Selected Design</small>
                  <strong>{targetDesign.name}</strong>
                  <span>{targetDesign.price}</span>
                </div>
              </div>
            )}
            <div className="fc-success-actions">
              <button
                type="button"
                className="fc-btn-primary"
                onClick={() => nav('/bookings')}
              >
                View in My Bookings
              </button>
              <button
                type="button"
                className="fc-btn-secondary"
                onClick={handleClose}
              >
                Back to Designs
              </button>
            </div>
          </div>
        ) : (
          <form className="fc-form" onSubmit={handleSubmit}>
            {/* Design context banner if arrived from a card */}
            {targetDesign && (
              <div className="fc-context-card">
                <img src={targetDesign.img} alt={targetDesign.name} className="fc-ctx-img" />
                <div className="fc-ctx-info">
                  <span className="fc-ctx-tag">{targetDesign.finish || targetSpace?.name || 'Selected Look'}</span>
                  <h3 className="fc-ctx-title">{targetDesign.name}</h3>
                  <span className="fc-ctx-price">{targetDesign.price}</span>
                </div>
              </div>
            )}

            {/* Input 1: Name */}
            <div className="fc-field">
              <input
                type="text"
                className="fc-input"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Input 2: Email */}
            <div className="fc-field">
              <input
                type="email"
                className="fc-input"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Input 3: Phone Number with Country Flag */}
            <div className="fc-field fc-phone-field">
              <span className="fc-field-label-float">Phone Number</span>
              <div className="fc-phone-wrap">
                <div className="fc-flag-box">
                  <span className="fc-flag" role="img" aria-label="India Flag">🇮🇳</span>
                  <span className="fc-flag-arrow">▾</span>
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  className="fc-input fc-phone-inp"
                  placeholder=""
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>
            </div>

            {/* Checkbox: Send me updates on WhatsApp */}
            <div className="fc-wa-row">
              <label className="fc-checkbox-label">
                <input
                  type="checkbox"
                  className="fc-checkbox"
                  checked={whatsappUpdates}
                  onChange={(e) => setWhatsappUpdates(e.target.checked)}
                />
                <span className="fc-custom-check">
                  {whatsappUpdates && <Icon name="check" size={13} />}
                </span>
                <span className="fc-wa-text">Send me updates on WhatsApp</span>
              </label>

              {/* Floating WhatsApp Card Badge */}
              <div className="fc-wa-badge-pill" title="WhatsApp Updates">
                <Icon name="whatsapp" size={20} />
              </div>
            </div>

            {/* Input 4: City Dropdown */}
            <div className="fc-field fc-select-field">
              <select
                className="fc-select"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              >
                {INDIAN_CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <span className="fc-select-arrow">▾</span>
            </div>

            {/* Big Coral CTA Button (Matching Screenshot) */}
            <button type="submit" className="fc-submit-btn">
              BOOK CONSULTATION
            </button>

            {/* Disclaimer terms */}
            <p className="fc-disclaimer">
              By submitting this form, you agree to the{' '}
              <a href="#privacy" onClick={(e) => e.preventDefault()} className="fc-link">
                privacy policy
              </a>{' '}
              &amp;{' '}
              <a href="#terms" onClick={(e) => e.preventDefault()} className="fc-link">
                terms and conditions
              </a>
            </p>
          </form>
        )}
      </main>

      {/* ── FLOATING ONLINE ASSISTANT WIDGET (MATCHING SCREENSHOT) ── */}
      <div className="fc-floating-chat-container">
        {chatOpen && (
          <div className="fc-chat-prompt">
            <button
              type="button"
              className="fc-chat-dismiss"
              onClick={() => setChatOpen(false)}
              aria-label="Dismiss chat prompt"
            >
              ✕
            </button>
            <span className="fc-chat-prompt-txt">
              We&apos;re online. How may I assist you?
            </span>
          </div>
        )}
        <button
          type="button"
          className="fc-floating-chat-btn"
          onClick={() => {
            setChatOpen((v) => !v);
            toast('Our interior design consultant is online and available.');
          }}
          aria-label="Live Chat Assistant"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

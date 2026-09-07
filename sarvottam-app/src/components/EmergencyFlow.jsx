import { useState, useEffect, useRef } from 'react';
import Icon from './Icon';
import { useToast } from './Toast';
import { useAppData } from '../store/AppData';
import { dispatchService } from '../services/dispatchService';
import { SAVED_ADDRESSES, GST_RATE } from '../data/services';
import './EmergencyFlow.css';

const QUICK_PROBLEMS = {
  Electrician: ['Switchboard spark / burnt', 'Ceiling fan repair', 'Short circuit / MCB trip', 'Inverter wiring', 'Light / socket fitting'],
  Plumber: ['Tap leaking continuously', 'Pipe blockage / overflow', 'Water motor not working', 'Toilet / flush repair', 'Basin fitting'],
  Carpenter: ['Door lock stuck / jammed', 'Door hinge broken', 'Bed assembly', 'Cupboard handle / slider', 'Furniture repair'],
  'AC Repair': ['AC not cooling / gas low', 'Water leakage from indoor unit', 'Full servicing & filter clean', 'AC uninstallation / fitting', 'Compressor issue'],
  Painter: ['Water seepage wall touch-up', '1-2 Room fresh paint', 'Door & window polish', 'Exterior wall painting', 'Full home paint estimate'],
};

const BARMER_AREAS = [
  'Indra Colony, Barmer',
  'Station Road, Barmer',
  'Gandhi Nagar, Barmer',
  'Mahaveer Park, Barmer',
  'Sadar Bazar, Barmer',
  'Ratanada, Barmer',
  'Shastri Nagar, Barmer',
  'Kalyanpura, Barmer',
];

export default function EmergencyFlow({ service, onClose }) {
  const toast = useToast();
  const { user } = useAppData();

  const [stage, setStage] = useState('booking'); // booking | searching | tracking | payment | rating
  const [activeTrip, setActiveTrip] = useState(null);

  // Booking Form Inputs
  const [selectedArea, setSelectedArea] = useState(BARMER_AREAS[0]);
  const [addressDetail, setAddressDetail] = useState('Flat 204, Near Main Gate');
  const [phone, setPhone] = useState(user?.phone?.replace('+91 ', '') || '9876543210');
  const [problem, setProblem] = useState('');
  const [selectedChip, setSelectedChip] = useState('');

  // Payment & Rating
  const [payMethod, setPayMethod] = useState('online');
  const [stars, setStars] = useState(5);
  const [chips, setChips] = useState(['Time pe aaya', 'Achha kaam']);

  const simTimerRef = useRef(null);

  const svcCharge = service.service || 350;
  const visitCharge = 99;
  const gst = Math.round((svcCharge + visitCharge) * GST_RATE);
  const totalApprox = svcCharge + visitCharge + gst;

  // Listen to real-time dispatch updates
  useEffect(() => {
    const unsubscribe = dispatchService.subscribe((event) => {
      if (event.type === 'TRIP_UPDATED') {
        const trip = event.trip;
        if (trip && activeTrip && trip.id === activeTrip.id) {
          setActiveTrip(trip);
          if (trip.status === 'accepted') {
            setStage('tracking');
            toast(`✓ ${trip.karigar.name} ne request accept ki!`);
          } else if (trip.status === 'arrived') {
            toast(`📍 ${trip.karigar.name} aapke ghar pahunch gaye hain!`);
          } else if (trip.status === 'working') {
            toast(`🔧 OTP Verify hua — Kaam shuru ho gaya`);
          } else if (trip.status === 'completed') {
            toast(`✓ Kaam poora ho gaya — Payment bill generate hua`);
            setStage('payment');
          }
        }
      }
    });

    return () => {
      unsubscribe();
      if (simTimerRef.current) clearTimeout(simTimerRef.current);
    };
  }, [activeTrip]);

  // Handle problem chip selection
  const handleChipSelect = (chip) => {
    setSelectedChip(chip);
    setProblem(chip);
  };

  // Submit Emergency Booking
  const handleConfirmBooking = () => {
    if (!phone || phone.replace(/\D/g, '').length < 10) {
      toast('Kripya valid 10-digit mobile number daalein');
      return;
    }

    const fullAddress = `${addressDetail.trim() ? addressDetail.trim() + ', ' : ''}${selectedArea}`;
    const trip = dispatchService.createBooking({
      service: service.name,
      area: selectedArea,
      address: fullAddress,
      problem: problem.trim() || 'Emergency Service Request',
      phone: '+91 ' + phone.replace(/\D/g, ''),
      customerName: user?.name || 'Customer',
    });

    setActiveTrip(trip);
    setStage('searching');
    toast('Searching nearby verified Karigars in Barmer…');

    // Auto-match fallback simulator after 12s if no real Captain accepts across tabs
    simTimerRef.current = setTimeout(() => {
      const current = dispatchService.getActiveTrip();
      if (current && current.id === trip.id && current.status === 'searching') {
        dispatchService.acceptBooking(trip.id, {
          name: service.karigar?.name || 'Ramesh Suthar',
          phone: '+91 94140 88214',
          skill: service.name,
          area: selectedArea,
          rating: 4.9,
          jobsDone: 210,
        });
      }
    }, 12000);
  };

  // Cancel Booking
  const handleCancelBooking = () => {
    if (simTimerRef.current) clearTimeout(simTimerRef.current);
    dispatchService.clearTrip();
    setActiveTrip(null);
    onClose();
  };

  // Submit Payment
  const handlePayment = () => {
    toast(payMethod === 'online' ? `✓ ₹${totalApprox} Online Paid via UPI!` : `✓ ₹${totalApprox} Cash collected by Karigar`);
    setStage('rating');
  };

  // Submit Rating
  const handleRatingSubmit = () => {
    toast(`🙏 ${stars}★ Rating submit hui — Dhanyavaad!`);
    handleCancelBooking();
  };

  const togglePraiseChip = (c) => {
    setChips((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  };

  const quickList = QUICK_PROBLEMS[service.name] || QUICK_PROBLEMS.Electrician;

  return (
    <div className="flow-overlay">
      <div className={'flow-screen' + (stage === 'booking' || stage === 'payment' || stage === 'rating' ? ' sheet' : '')}>

        {/* ═══════════════════════ 1. BOOKING SHEET ═══════════════════════ */}
        {stage === 'booking' && (
          <div className="ef-sheet">
            <div className="ef-drag" />

            {/* Service Header */}
            <div className="ef-bk-head">
              <div className="ef-bk-ic" style={{ background: service.color + '22', color: service.color }}>
                <Icon name={service.icon || 'bolt'} size={28} />
              </div>
              <div className="ef-bk-title-wrap">
                <div className="ef-bk-badge">
                  <Icon name="bolt" size={12} /> 24×7 Instant Dispatch
                </div>
                <h2 className="ef-title">{service.name} Service</h2>
                <p className="ef-sub">Verified Rajasthan Karigar at your doorstep</p>
              </div>
            </div>

            {/* Location Picker */}
            <div className="ef-sec">
              <label className="ef-label"><Icon name="pin" size={15} /> Select Area in Barmer <span className="req">*</span></label>
              <select
                className="ef-select"
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
              >
                {BARMER_AREAS.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>

              <input
                className="ef-input"
                type="text"
                value={addressDetail}
                onChange={(e) => setAddressDetail(e.target.value)}
                placeholder="House / Flat No., Landmark, Gali No."
              />
            </div>

            {/* Customer Phone */}
            <div className="ef-sec">
              <label className="ef-label"><Icon name="phone" size={15} /> Mobile Number for Karigar Call <span className="req">*</span></label>
              <div className="ef-phone-wrap">
                <span className="ef-phone-code">+91</span>
                <input
                  className="ef-phone-input"
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="10 digit mobile number"
                />
              </div>
            </div>

            {/* Problem Selection */}
            <div className="ef-sec">
              <label className="ef-label"><Icon name="wrench" size={15} /> Kya problem hai? (Problem Details)</label>
              <div className="ef-chips">
                {quickList.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    className={'ef-chip' + (selectedChip === chip ? ' active' : '')}
                    onClick={() => handleChipSelect(chip)}
                  >
                    {chip}
                  </button>
                ))}
              </div>
              <textarea
                className="ef-input ef-textarea"
                rows={2}
                value={problem}
                onChange={(e) => { setProblem(e.target.value); setSelectedChip(''); }}
                placeholder="Problem describe karein (e.g. switchboard short ho gaya hai)…"
              />
            </div>

            {/* Transparent Fare Estimate (Rapido style) */}
            <div className="ef-charges">
              <div className="ef-charges-title">Estimated Pricing (Transparent)</div>
              <div className="ef-crow">
                <span>Visiting &amp; Inspection Charge</span>
                <span>₹{visitCharge}</span>
              </div>
              <div className="ef-crow">
                <span>Labor &amp; Service Charge (approx)</span>
                <span>₹{svcCharge}</span>
              </div>
              <div className="ef-crow">
                <span>GST (5%)</span>
                <span>₹{gst}</span>
              </div>
              <div className="ef-crow ef-ctotal">
                <span>Estimated Total</span>
                <span className="num">₹{totalApprox}</span>
              </div>
              <div className="ef-cnote">
                ✓ Karigar aane ke baad hi payment karni hai · No advance needed
              </div>
            </div>

            {/* Action Buttons */}
            <button className="ef-cta danger" onClick={handleConfirmBooking}>
              <Icon name="bolt" size={18} /> Request Karigar Now (Rapido Flow)
            </button>
            <button className="ef-skip" onClick={onClose}>
              Cancel
            </button>
          </div>
        )}

        {/* ═══════════════════════ 2. SEARCHING SCREEN ═══════════════════════ */}
        {stage === 'searching' && (
          <div className="ef-full">
            <div className="ef-fhead">
              <button className="ef-close" onClick={handleCancelBooking}><Icon name="close" size={20} /></button>
              <span>{service.name} · Finding Karigar</span>
            </div>

            <div className="ef-search">
              <div className="radar">
                <span className="ring r1" />
                <span className="ring r2" />
                <span className="ring r3" />
                <div className="radar-core"><Icon name={service.icon || 'bolt'} size={32} /></div>
              </div>

              <h2 className="ef-big">Connecting nearby {service.name}…</h2>
              <p className="ef-muted">Aapke 3 km area ke online Karigars ko request bheji ja rahi hai</p>

              <div className="ef-search-card">
                <div className="ef-sc-row">
                  <Icon name="pin" size={16} />
                  <span>{activeTrip?.customer?.address || selectedArea}</span>
                </div>
                <div className="ef-sc-row">
                  <Icon name="wrench" size={16} />
                  <span>{activeTrip?.customer?.problem || 'Emergency repair'}</span>
                </div>
              </div>

              <div className="ef-search-note">
                <span className="pulse-dot" /> Captain App par alert gaya hai. Wait karein…
              </div>

              <button className="ef-cancel-btn" onClick={handleCancelBooking}>
                Cancel Request
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════ 3. LIVE TRACKING SCREEN ═══════════════════════ */}
        {stage === 'tracking' && activeTrip && (
          <div className="ef-full">
            <div className="ef-fhead">
              <button className="ef-close" onClick={handleCancelBooking}><Icon name="close" size={20} /></button>
              <span>{service.name} · Live Tracking</span>
            </div>

            <div className="ef-track">
              {/* Security OTP Card (Key Rapido Feature) */}
              <div className="ef-otp-banner">
                <div className="ef-otp-left">
                  <span className="ef-otp-tag">START JOB OTP</span>
                  <p className="ef-otp-note">Karigar ko aane par ye 4-digit code dein</p>
                </div>
                <div className="ef-otp-code">{activeTrip.otp || '4829'}</div>
              </div>

              {/* ETA Status Header */}
              <div className="ef-track-status-card">
                <div className="ef-tsc-icon">
                  <Icon name="scooter" size={28} />
                </div>
                <div className="ef-tsc-info">
                  <h3>
                    {activeTrip.status === 'arrived'
                      ? 'Karigar Arrived at Doorstep!'
                      : activeTrip.status === 'working'
                      ? 'Work in Progress 🔧'
                      : 'Karigar is on the way'}
                  </h3>
                  <p>
                    {activeTrip.status === 'arrived'
                      ? 'Karigar aapke address par pahunch chuka hai'
                      : activeTrip.status === 'working'
                      ? 'Kaam complete hone par bill aayega'
                      : 'Reaching in approx 8 - 12 mins'}
                  </p>
                </div>
              </div>

              {/* Captain Profile Card */}
              <div className="kcard">
                <div className="kavatar">{activeTrip.karigar?.avatar || 'R'}</div>
                <div className="kinfo">
                  <div className="kname-row">
                    <h3>{activeTrip.karigar?.name || 'Ramesh Suthar'}</h3>
                    <span className="kverified"><Icon name="shield" size={13} /> Verified</span>
                  </div>
                  <p className="kskill">{service.name} Expert · Barmer</p>
                  <div className="krating">
                    <Icon name="star" size={14} /> <strong>{activeTrip.karigar?.rating || 4.9}</strong>
                    <span>({activeTrip.karigar?.jobs || 180}+ jobs done)</span>
                  </div>
                </div>
                <a
                  href={`tel:${activeTrip.karigar?.phone || '9414012345'}`}
                  className="kcall"
                  onClick={() => toast(`Calling ${activeTrip.karigar?.name}…`)}
                >
                  <Icon name="phone" size={20} />
                </a>
              </div>

              {/* Step Progression */}
              <div className="steps">
                {[
                  { t: 'Karigar Assigned', s: `${activeTrip.karigar?.name} accepted request`, done: true },
                  { t: 'On the Way', s: 'Reaching your location', done: activeTrip.status === 'arrived' || activeTrip.status === 'working' },
                  { t: 'Work in Progress', s: 'Working after OTP verification', done: activeTrip.status === 'working' },
                  { t: 'Job Complete & Bill', s: 'Pay online or cash', done: false },
                ].map((st, i) => (
                  <div key={i} className={'step' + (st.done ? ' done' : '')}>
                    <span className="step-dot" />
                    <div className="step-text">
                      <strong>{st.t}</strong>
                      <small>{st.s}</small>
                    </div>
                  </div>
                ))}
              </div>

              <div className="livenote">
                <span className="live-dot" /> Live sync active · Both apps connected in real-time
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════ 4. PAYMENT SHEET ═══════════════════════ */}
        {stage === 'payment' && (
          <div className="ef-sheet">
            <div className="ef-drag" />
            <div className="pay-done"><Icon name="check" size={32} /></div>
            <h2 className="ef-title center">Kaam Poora Ho Gaya!</h2>
            <p className="ef-sub center">{activeTrip?.karigar?.name || 'Karigar'} · {service.name}</p>

            <div className="ef-charges">
              <div className="ef-crow"><span>Labor &amp; Service Charge</span><span className="num">₹{svcCharge}</span></div>
              <div className="ef-crow"><span>Visiting &amp; Inspection Fee</span><span className="num">₹{visitCharge}</span></div>
              <div className="ef-crow"><span>GST (5%)</span><span className="num">₹{gst}</span></div>
              <div className="ef-crow ef-ctotal"><span>Final Amount</span><span className="num">₹{totalApprox}</span></div>
            </div>

            <p className="ef-label">Payment Method Chunein:</p>
            {[
              { id: 'online', icon: 'card', t: 'Online Payment (UPI / QR / Card)', s: 'GPay, PhonePe, Paytm, Card' },
              { id: 'cash', icon: 'cash', t: 'Cash to Karigar', s: 'Karigar ko haath mein dein' },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                className={'pay-method' + (payMethod === m.id ? ' active' : '')}
                onClick={() => setPayMethod(m.id)}
              >
                <span className="pm-ic"><Icon name={m.icon} size={22} /></span>
                <span className="pm-text"><strong>{m.t}</strong><small>{m.s}</small></span>
                <span className="pm-radio" />
              </button>
            ))}

            <button className="ef-cta" onClick={handlePayment}>
              ₹{totalApprox} {payMethod === 'online' ? 'Online Pay Karein' : 'Cash Diya'}
            </button>
          </div>
        )}

        {/* ═══════════════════════ 5. RATING SHEET ═══════════════════════ */}
        {stage === 'rating' && (
          <div className="ef-sheet center-sheet">
            <div className="ef-drag" />
            <div className="rate-avatar">{activeTrip?.karigar?.avatar || 'R'}</div>
            <h2 className="ef-title center">{activeTrip?.karigar?.name || 'Karigar'} ko Rate Karein</h2>
            <p className="ef-sub center">Aapka feedback services improve karta hai</p>

            <div className="rate-stars">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" className={'rate-star' + (n <= stars ? ' on' : '')} onClick={() => setStars(n)}>
                  <Icon name="star" size={36} />
                </button>
              ))}
            </div>

            <div className="rate-chips">
              {['Time pe aaya', 'Achha kaam', 'Vyavhaar achha', 'Saaf-suthra', 'Uchit daam', 'Expert knowledge'].map((c) => (
                <button
                  key={c}
                  type="button"
                  className={'rate-chip' + (chips.includes(c) ? ' on' : '')}
                  onClick={() => togglePraiseChip(c)}
                >
                  {c}
                </button>
              ))}
            </div>

            <button className="ef-cta" onClick={handleRatingSubmit}>
              Submit 5★ Rating
            </button>
            <button className="ef-skip" onClick={handleCancelBooking}>
              Skip for now
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

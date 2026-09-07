import { useState, useEffect, useRef, useMemo } from 'react';
import Icon from './Icon';
import { useToast } from './Toast';
import { useAppData } from '../store/AppData';
import { dispatchService } from '../services/dispatchService';
import {
  PRICING_CONFIG,
  TRANSPARENCY_STEPS,
  SLOT_GROUPS,
  DEFAULT_SAVED_ADDRESSES,
} from '../config/bookingConfig';
import './BookingWizard.css';

const DRAFT_STORAGE_KEY = 'sarvottam_booking_draft';

// Generate 5 days: "Aaj" + next 4 days
const generateBookingDays = () => {
  const days = [];
  const now = new Date();
  const weekNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  for (let i = 0; i < 5; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const dayName = i === 0 ? 'Aaj' : i === 1 ? 'Kal' : weekNames[d.getDay()];
    const fullDateStr = weekNames[d.getDay()] + ', ' + d.getDate() + ' ' + monthNames[d.getMonth()];
    days.push({
      index: i,
      label: dayName,
      dateNum: d.getDate(),
      month: monthNames[d.getMonth()],
      weekday: weekNames[d.getDay()],
      fullString: fullDateStr,
      isoDate: d.toISOString().split('T')[0],
      hasSlots: i !== 4, // 5th day simulated fully booked to demonstrate edge case
    });
  }
  return days;
};

export default function BookingWizard({ initialService, onClose }) {
  const toast = useToast();
  const { user } = useAppData();

  // ── 1. WIZARD STATE (Persisted in localStorage) ──
  const [step, setStep] = useState(0); // 0: Summary, 1: Date & Time, 2: Address, 3: Confirm, 4: Matching Flow

  // Cart of services
  const [cart, setCart] = useState(() => {
    const fallbackId = initialService?.id || 'electrician';
    const item = PRICING_CONFIG.serviceEstimates[fallbackId] || PRICING_CONFIG.serviceEstimates.electrician;
    return [
      {
        ...item,
        problem: initialService?.problem || item.defaultProblem,
        selectedAttribute: item.attributeOptions[0] || '',
      },
    ];
  });

  // Date & Slot state
  const availableDays = useMemo(() => generateBookingDays(), []);
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState(SLOT_GROUPS[0].slots[0].time);

  // Address state
  const [savedAddresses, setSavedAddresses] = useState(DEFAULT_SAVED_ADDRESSES);
  const [selectedAddressId, setSelectedAddressId] = useState('ghar');
  const [addressArea, setAddressArea] = useState('Indra Colony');
  const [addressDetail, setAddressDetail] = useState('12, Indra Colony, Near Water Tank, Barmer');
  const [customPin, setCustomPin] = useState({ lat: 25.7532, lng: 71.3965 });
  const [isLocating, setIsLocating] = useState(false);
  const [showAddAddressSheet, setShowAddAddressSheet] = useState(false);
  const [newAddrLabel, setNewAddrLabel] = useState('Ghar');
  const [newAddrText, setNewAddrText] = useState('');

  // Customer Contact & Notes state
  const [custName, setCustName] = useState(user?.name || 'Customer');
  const [custPhone, setCustPhone] = useState(user?.phone?.replace('+91 ', '') || '9876543210');
  const [custNotes, setCustNotes] = useState('');

  // UI State
  const [transparencyOpen, setTransparencyOpen] = useState(false);
  const [showAddServiceSheet, setShowAddServiceSheet] = useState(false);
  const [showTransparencyModal, setShowTransparencyModal] = useState(false);
  const [helpExpanded, setHelpExpanded] = useState(false);
  const [activeTrip, setActiveTrip] = useState(null);
  const [payMethod, setPayMethod] = useState('online');
  const [stars, setStars] = useState(5);
  const [ratingChips, setRatingChips] = useState(['Time pe aaya', 'Achha kaam']);

  const simTimerRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const lastScrollTopRef = useRef(0);

  // ── 2. DRAFT RESTORATION & PERSISTENCE ──
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const d = JSON.parse(saved);
        if (d.cart && d.cart.length > 0) setCart(d.cart);
        if (typeof d.step === 'number' && d.step <= 3) setStep(d.step);
        if (typeof d.selectedDayIdx === 'number') setSelectedDayIdx(d.selectedDayIdx);
        if (d.selectedSlot) setSelectedSlot(d.selectedSlot);
        if (d.addressDetail) setAddressDetail(d.addressDetail);
        if (d.addressArea) setAddressArea(d.addressArea);
        if (d.custName) setCustName(d.custName);
        if (d.custPhone) setCustPhone(d.custPhone);
        if (d.custNotes) setCustNotes(d.custNotes);
      }
    } catch (e) {
      console.warn('Could not restore draft:', e);
    }
  }, []);

  // Auto-save draft on changes (when not in matching stage)
  useEffect(() => {
    if (step <= 3 && cart.length > 0) {
      try {
        const draft = {
          cart,
          step,
          selectedDayIdx,
          selectedSlot,
          addressArea,
          addressDetail,
          customPin,
          custName,
          custPhone,
          custNotes,
        };
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
      } catch (e) {
        console.warn('Could not save draft:', e);
      }
    }
  }, [cart, step, selectedDayIdx, selectedSlot, addressArea, addressDetail, customPin, custName, custPhone, custNotes]);

  // Listen to live dispatch updates if trip active
  useEffect(() => {
    const unsubscribe = dispatchService.subscribe((event) => {
      if (event.type === 'TRIP_UPDATED') {
        const trip = event.trip;
        if (trip && activeTrip && trip.id === activeTrip.id) {
          setActiveTrip(trip);
          if (trip.status === 'accepted') {
            toast('✓ ' + trip.karigar.name + ' ne request accept ki!');
          } else if (trip.status === 'arrived') {
            toast('📍 ' + trip.karigar.name + ' aapke ghar pahunch gaye hain!');
          } else if (trip.status === 'working') {
            toast('🔧 OTP Verify hua — Kaam shuru ho gaya');
          } else if (trip.status === 'completed') {
            toast('✓ Kaam poora ho gaya — Payment bill generate hua');
          }
        }
      }
    });

    return () => {
      unsubscribe();
      if (simTimerRef.current) clearTimeout(simTimerRef.current);
    };
  }, [activeTrip]);

  // Collapse Help FAB on scroll down
  const handleScroll = (e) => {
    const st = e.target.scrollTop;
    if (st > lastScrollTopRef.current + 20 && helpExpanded) {
      setHelpExpanded(false);
    }
    lastScrollTopRef.current = st;
  };

  // ── 3. PRICING CALCULATIONS ──
  const pricingSummary = useMemo(() => {
    const serviceMinSum = cart.reduce((acc, it) => acc + (it.minPrice || 350), 0);
    const serviceMaxSum = cart.reduce((acc, it) => acc + (it.maxPrice || 550), 0);
    const visitCharge = PRICING_CONFIG.visitCharge;
    const gstMin = Math.round((serviceMinSum + visitCharge) * PRICING_CONFIG.gstPct);
    const gstMax = Math.round((serviceMaxSum + visitCharge) * PRICING_CONFIG.gstPct);
    const totalMin = serviceMinSum + visitCharge + gstMin;
    const totalMax = serviceMaxSum + visitCharge + gstMax;
    const savings = cart.length > 1 ? (cart.length - 1) * visitCharge : 0;

    return {
      serviceMinSum,
      serviceMaxSum,
      visitCharge,
      gstMin,
      gstMax,
      totalMin,
      totalMax,
      savings,
    };
  }, [cart]);

  // ── 4. STEP NAVIGATION ──
  const goToStep = (nextStep) => {
    setStep(nextStep);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  };

  // ── 5. CART ACTIONS ──
  const handleRemoveService = (serviceId) => {
    if (cart.length <= 1) {
      toast('Cart mein kam se kam 1 service hona zaroori hai');
      return;
    }
    setCart((prev) => prev.filter((it) => it.id !== serviceId));
    toast('Service remove kar di gayi');
  };

  const handleAddServiceToCart = (serviceKey) => {
    const s = PRICING_CONFIG.serviceEstimates[serviceKey];
    if (!s) return;
    if (cart.some((it) => it.id === s.id)) {
      toast(s.name + ' pehle se cart mein shamil hai');
      return;
    }
    setCart((prev) => [
      ...prev,
      {
        ...s,
        problem: s.defaultProblem,
        selectedAttribute: s.attributeOptions[0] || '',
      },
    ]);
    setShowAddServiceSheet(false);
    toast('✓ ' + s.name + ' cart mein add ho gaya (Visit charge sirf 1 baar)');
  };

  const handleClearDraft = () => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    toast('Draft clear kar diya gaya');
    onClose();
  };

  // ── 6. GEOLOCATION ──
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast('Aapke browser mein GPS location available nahi hai');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        setCustomPin({ lat: latitude, lng: longitude });
        setAddressArea('Live GPS Location');
        setAddressDetail('GPS Pin (' + latitude.toFixed(4) + ', ' + longitude.toFixed(4) + '), Barmer');
        toast('📍 Current GPS location set ho gayi!');
      },
      (err) => {
        setIsLocating(false);
        toast('GPS permission allow karein ya address manually likhein');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Save new custom address
  const handleSaveNewAddress = () => {
    if (newAddrText.trim().length < 10) {
      toast('Kripya kam se kam 10 characters ka pura address likhein');
      return;
    }
    const newId = 'addr_' + Date.now();
    const newObj = {
      id: newId,
      label: newAddrLabel,
      icon: newAddrLabel === 'Office' ? 'building' : 'home',
      area: 'Barmer',
      fullText: newAddrText.trim(),
      lat: customPin.lat,
      lng: customPin.lng,
    };
    setSavedAddresses((prev) => [...prev, newObj]);
    setSelectedAddressId(newId);
    setAddressDetail(newObj.fullText);
    setShowAddAddressSheet(false);
    setNewAddrText('');
    toast('✓ Naya address save ho gaya');
  };

  // ── 7. FINAL CONFIRMATION & HANDOFF ──
  const handleConfirmAndMatch = () => {
    if (!custPhone || custPhone.replace(/\D/g, '').length < 10) {
      toast('Kripya valid 10-digit mobile number daalein');
      return;
    }

    // Construct unified payload
    const bookingPayload = {
      services: cart.map((it) => ({
        id: it.id,
        name: it.name,
        problem: it.selectedAttribute || it.problem,
        minPrice: it.minPrice,
        maxPrice: it.maxPrice,
      })),
      date: availableDays[selectedDayIdx].fullString,
      slot: selectedSlot,
      address: {
        area: addressArea,
        fullText: addressDetail,
        lat: customPin.lat,
        lng: customPin.lng,
      },
      customer: {
        name: custName.trim() || 'Customer',
        phone: '+91 ' + custPhone.replace(/\D/g, ''),
        notes: custNotes.trim(),
      },
      estimate: pricingSummary,
    };

    // 1. Clear draft from localStorage
    localStorage.removeItem(DRAFT_STORAGE_KEY);

    // 2. Call existing real-time dispatch service
    const trip = dispatchService.createBooking({
      service: cart.map((s) => s.name).join(' + '),
      area: addressArea,
      address: addressDetail,
      problem: cart.map((s) => s.name + ': ' + (s.selectedAttribute || s.problem)).join('; '),
      phone: '+91 ' + custPhone.replace(/\D/g, ''),
      customerName: custName.trim() || 'Customer',
    });

    setActiveTrip(trip);
    setStep(4); // Switch to matching & live tracking stage
    toast('Connecting with verified Rajasthan Karigars…');

    // Auto-match fallback simulator after 10s if standalone
    simTimerRef.current = setTimeout(() => {
      const current = dispatchService.getActiveTrip();
      if (current && current.id === trip.id && current.status === 'searching') {
        dispatchService.acceptBooking(trip.id, {
          name: 'Ramesh Suthar',
          phone: '+91 94140 88214',
          skill: cart[0]?.name || 'Electrician',
          area: addressArea,
          rating: 4.9,
          jobsDone: 340,
        });
      }
    }, 10000);
  };

  const handleCancelTrip = () => {
    if (simTimerRef.current) clearTimeout(simTimerRef.current);
    dispatchService.clearTrip();
    setActiveTrip(null);
    onClose();
  };

  const handlePayment = () => {
    toast(payMethod === 'online' ? ('✓ ₹' + pricingSummary.totalMin + ' Online Paid via UPI!') : ('✓ ₹' + pricingSummary.totalMin + ' Cash collected by Karigar'));
    setActiveTrip((t) => (t ? { ...t, status: 'rated' } : null));
  };

  const handleRatingSubmit = () => {
    toast('🙏 ' + stars + ' Star Rating submit hui — Dhanyavaad!');
    handleCancelTrip();
  };

  const toggleRatingChip = (c) => {
    setRatingChips((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  };

  // Address validation check
  const isAddressValid = addressDetail.trim().length >= 10;

  return (
    <div className="bw-overlay">
      <div className="bw-modal">

        {/* ═══════════════════════ HEADER & SLIM STEPPER (Steps 1–3) ═══════════════════════ */}
        {step >= 1 && step <= 3 && (
          <div className="bw-stepper-header">
            <div className="bw-stepper-top">
              <button
                type="button"
                className="bw-back-btn"
                onClick={() => goToStep(step - 1)}
                aria-label="Previous step"
              >
                <Icon name="back" size={18} />
              </button>
              <h2 className="bw-step-main-title">
                {step === 1 ? 'Date & Time' : step === 2 ? 'Service Address' : 'Review & Confirm'}
              </h2>
              <button
                type="button"
                className="bw-close-btn"
                onClick={onClose}
                aria-label="Close"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            {/* Slim 3-Step Stepper Bar */}
            <div className="bw-stepper-track">
              {[
                { num: 1, label: 'Date & Time' },
                { num: 2, label: 'Address' },
                { num: 3, label: 'Confirm' },
              ].map((st) => {
                const isDone = step > st.num;
                const isActive = step === st.num;
                return (
                  <button
                    key={st.num}
                    type="button"
                    className={'bw-step-pill' + (isDone ? ' done' : isActive ? ' active' : '')}
                    onClick={() => isDone && goToStep(st.num)}
                    disabled={!isDone && !isActive}
                  >
                    <span className="bw-step-circle">
                      {isDone ? <Icon name="check" size={12} /> : st.num}
                    </span>
                    <span className="bw-step-label">{st.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══════════════════════ STEP 0: BOOKING SUMMARY (Aapka Booking Summary) ═══════════════════════ */}
        {step === 0 && (
          <div className="bw-view-scroll" ref={scrollContainerRef} onScroll={handleScroll}>
            <div className="bw-summary-header">
              <div className="bw-sh-left">
                <h2 className="bw-title">Aapka Booking Summary</h2>
                <p className="bw-subtitle">Verified Rajasthan Karigars directly at your doorstep</p>
              </div>
              <button type="button" className="bw-close-btn" onClick={onClose} aria-label="Close">
                <Icon name="close" size={18} />
              </button>
            </div>

            {/* Cart Service Cards List */}
            <div className="bw-cart-list">
              {cart.map((item) => (
                <div key={item.id} className="bw-service-card">
                  <div className="bw-sc-img-wrap">
                    <img src={item.photo} alt={item.name} className="bw-sc-img" />
                    <span className="bw-sc-badge">
                      <Icon name={item.badgeIcon} size={13} />
                    </span>
                  </div>

                  <div className="bw-sc-info">
                    <div className="bw-sc-title-row">
                      <h3 className="bw-sc-name">{item.name}</h3>
                      {cart.length > 1 && (
                        <button
                          type="button"
                          className="bw-sc-remove-btn"
                          onClick={() => handleRemoveService(item.id)}
                          title="Remove item"
                        >
                          <Icon name="trash" size={14} />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>

                    {/* Problem/Requirement Pill */}
                    <div className="bw-sc-prob-pill">
                      <span className="bw-sc-prob-text">{item.problem}</span>
                    </div>

                    {/* Attribute Chips (Rendered ONLY when value exists) */}
                    {item.selectedAttribute && (
                      <div className="bw-attr-chips-row">
                        <span className="bw-attr-chip">
                          <Icon name="tag" size={11} />
                          <span>{item.selectedAttribute}</span>
                        </span>
                      </div>
                    )}

                    <div className="bw-sc-price-row">
                      <span className="bw-sc-estimate-label">Estimated Service:</span>
                      <span className="bw-sc-estimate-val">₹{item.minPrice} – ₹{item.maxPrice}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Service Affordance Button */}
            <div className="bw-add-service-wrap">
              <button
                type="button"
                className="bw-add-service-btn"
                onClick={() => setShowAddServiceSheet(true)}
              >
                <Icon name="plus" size={16} />
                <span>Add Another Service to Cart</span>
              </button>
            </div>

            {/* Multi-Service Single Visit Savings Banner */}
            {cart.length > 1 && (
              <div className="bw-savings-banner">
                <Icon name="check" size={16} />
                <div className="bw-savings-text">
                  <strong>Ek hi visit – visit charge sirf ek baar</strong>
                  <p>Aapne ₹{pricingSummary.savings} visit charge save kiya</p>
                </div>
              </div>
            )}

            {/* ONE Shared Collapsible Transparency Card ("Kaam kaise hoga") */}
            <div className="bw-transparency-card">
              <button
                type="button"
                className="bw-tc-toggle"
                onClick={() => setTransparencyOpen((prev) => !prev)}
              >
                <div className="bw-tc-left">
                  <span className="bw-tc-shield-ic">
                    <Icon name="shield" size={18} />
                  </span>
                  <div className="bw-tc-title-wrap">
                    <strong className="bw-tc-title">Kaam kaise hoga</strong>
                    <span className="bw-tc-sub">SARVOTTAM Transparency Guarantee</span>
                  </div>
                </div>
                <span className={'bw-tc-chevron' + (transparencyOpen ? ' open' : '')}>
                  <Icon name="chevron" size={16} />
                </span>
              </button>

              {transparencyOpen && (
                <div className="bw-tc-content">
                  <div className="bw-tc-steps-list">
                    {TRANSPARENCY_STEPS.map((st) => (
                      <div key={st.step} className="bw-tc-step-item">
                        <span className="bw-tc-num">{st.step}</span>
                        <div className="bw-tc-step-info">
                          <strong>{st.title}</strong>
                          <p>{st.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Clear Draft quiet text link at footer */}
            <div className="bw-clear-footer">
              <button type="button" className="bw-clear-link" onClick={handleClearDraft}>
                Clear booking draft
              </button>
            </div>

            <div className="bw-bottom-spacing" />
          </div>
        )}

        {/* ═══════════════════════ STEP 1: DATE & TIME ═══════════════════════ */}
        {step === 1 && (
          <div className="bw-view-scroll" ref={scrollContainerRef} onScroll={handleScroll}>
            <div className="bw-section-head">
              <h3 className="bw-sec-title">Service Date Chunein</h3>
              <p className="bw-sec-sub">Karigar aapke chune huye samay par doorstep par aayega</p>
            </div>

            {/* Horizontal Date Chips */}
            <div className="bw-date-chips-scroll">
              <div className="bw-date-chips-row">
                {availableDays.map((d, idx) => (
                  <button
                    key={d.isoDate}
                    type="button"
                    className={'bw-date-chip' + (selectedDayIdx === idx ? ' selected' : '') + (!d.hasSlots ? ' no-slots' : '')}
                    onClick={() => {
                      setSelectedDayIdx(idx);
                      if (!d.hasSlots) {
                        toast('Is din sabhi slots full hain. Kripya doosra din chunein.');
                      }
                    }}
                  >
                    <span className="bw-dc-dayname">{d.label}</span>
                    <span className="bw-dc-num">{d.dateNum}</span>
                    <span className="bw-dc-month">{d.month}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Slots Grid Grouped by Subah / Dopahar / Shaam */}
            {availableDays[selectedDayIdx].hasSlots ? (
              <div className="bw-slots-container">
                {SLOT_GROUPS.map((grp) => (
                  <div key={grp.id} className="bw-slot-group">
                    <div className="bw-sg-head">
                      <strong className="bw-sg-title">{grp.label}</strong>
                      <span className="bw-sg-range">{grp.timeRange}</span>
                    </div>

                    <div className="bw-sg-grid">
                      {grp.slots.map((s) => {
                        const isSel = selectedSlot === s.time;
                        return (
                          <button
                            key={s.id}
                            type="button"
                            className={'bw-slot-pill' + (isSel ? ' selected' : '') + (!s.available ? ' disabled' : '')}
                            disabled={!s.available}
                            onClick={() => setSelectedSlot(s.time)}
                          >
                            <span className="bw-sp-time">{s.time}</span>
                            {!s.available && <span className="bw-sp-tag">Full</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bw-no-slots-box">
                <Icon name="info" size={24} />
                <strong>Is din koi slot available nahi hai</strong>
                <p>Sabhi Karigars pehle se booked hain.</p>
                <button
                  type="button"
                  className="bw-next-day-btn"
                  onClick={() => setSelectedDayIdx(0)}
                >
                  Switch to Aaj (Available)
                </button>
              </div>
            )}

            <div className="bw-bottom-spacing" />
          </div>
        )}

        {/* ═══════════════════════ STEP 2: ADDRESS & LOCATION ═══════════════════════ */}
        {step === 2 && (
          <div className="bw-view-scroll" ref={scrollContainerRef} onScroll={handleScroll}>
            <div className="bw-section-head">
              <h3 className="bw-sec-title">Service Address &amp; Location</h3>
              <p className="bw-sec-sub">Karigar ko exact navigation mil sake</p>
            </div>

            {/* Saved Address Chips */}
            <div className="bw-saved-addr-row">
              {savedAddresses.map((addr) => (
                <button
                  key={addr.id}
                  type="button"
                  className={'bw-addr-chip' + (selectedAddressId === addr.id ? ' selected' : '')}
                  onClick={() => {
                    setSelectedAddressId(addr.id);
                    setAddressArea(addr.area);
                    setAddressDetail(addr.fullText);
                    setCustomPin({ lat: addr.lat, lng: addr.lng });
                  }}
                >
                  <Icon name={addr.icon} size={15} />
                  <span>{addr.label}</span>
                </button>
              ))}

              <button
                type="button"
                className="bw-addr-chip add-new"
                onClick={() => setShowAddAddressSheet(true)}
              >
                <Icon name="plus" size={14} />
                <span>Naya Address</span>
              </button>
            </div>

            {/* Current Geolocation Trigger */}
            <div className="bw-geo-trigger-card">
              <button
                type="button"
                className="bw-geo-btn"
                onClick={handleUseCurrentLocation}
                disabled={isLocating}
              >
                <span className="bw-geo-ic">
                  <Icon name="pin" size={16} />
                </span>
                <span className="bw-geo-text">
                  {isLocating ? 'Location fetch ho rahi hai…' : 'Meri current location use karein'}
                </span>
              </button>
            </div>

            {/* Map Preview with Pin Helper */}
            <div className="bw-map-preview-card">
              <div className="bw-mp-header">
                <Icon name="map" size={16} />
                <span>Pin on Map: {customPin.lat.toFixed(4)}, {customPin.lng.toFixed(4)}</span>
              </div>
              <div className="bw-mp-viewport">
                <div className="bw-mp-grid-bg" />
                <div className="bw-mp-pin-marker">
                  <span className="bw-mp-pin-glow" />
                  <Icon name="pin" size={24} />
                </div>
              </div>
              <p className="bw-mp-helper">Karigar ki navigation ke liye pin exact rakhein</p>
            </div>

            {/* Address Textarea Form Input */}
            <div className="bw-addr-form-block">
              <label className="bw-form-label">
                Pura Address (House/Flat No., Gali, Landmark) <span className="req">*</span>
              </label>
              <textarea
                className="bw-form-textarea"
                rows={3}
                value={addressDetail}
                onChange={(e) => {
                  setAddressDetail(e.target.value);
                  setSelectedAddressId('custom');
                }}
                placeholder="Ghar ka number, building ka naam, landmark, Barmer…"
              />
              {!isAddressValid && (
                <p className="bw-form-err">Kripya kam se kam 10 characters ka pura address daalein.</p>
              )}
            </div>

            <div className="bw-bottom-spacing" />
          </div>
        )}

        {/* ═══════════════════════ STEP 3: DETAILS & CONFIRM ═══════════════════════ */}
        {step === 3 && (
          <div className="bw-view-scroll" ref={scrollContainerRef} onScroll={handleScroll}>
            <div className="bw-section-head">
              <h3 className="bw-sec-title">Booking Details &amp; Confirmation</h3>
              <p className="bw-sec-sub">Karigar aapke doorstep par visit karega</p>
            </div>

            {/* Customer Details Form */}
            <div className="bw-card-block">
              <h4 className="bw-block-title">Aapki Contact Info</h4>
              <div className="bw-input-row">
                <div className="bw-input-field">
                  <label className="bw-form-label">Aapka Naam</label>
                  <input
                    type="text"
                    className="bw-form-input"
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    placeholder="Full Name"
                  />
                </div>
                <div className="bw-input-field">
                  <label className="bw-form-label">Mobile Number <span className="req">*</span></label>
                  <div className="bw-phone-wrap">
                    <span className="bw-phone-prefix">+91</span>
                    <input
                      type="tel"
                      maxLength={10}
                      className="bw-form-input bw-phone-input"
                      value={custPhone}
                      onChange={(e) => setCustPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="10-digit number"
                    />
                  </div>
                </div>
              </div>

              {/* Optional Notes */}
              <div className="bw-notes-field">
                <label className="bw-form-label">Karigar ke liye nirdesh (Optional)</label>
                <textarea
                  className="bw-form-textarea"
                  rows={2}
                  value={custNotes}
                  onChange={(e) => setCustNotes(e.target.value)}
                  placeholder="Jaise: Doorbell nahi chal rahi, gate par phone karein…"
                />
              </div>
            </div>

            {/* Schedule & Address Review Box */}
            <div className="bw-card-block">
              <h4 className="bw-block-title">Scheduled Slot &amp; Address</h4>
              <div className="bw-review-row">
                <Icon name="calendar" size={16} />
                <div className="bw-rr-text">
                  <strong>{availableDays[selectedDayIdx].fullString}</strong>
                  <span>Slot: {selectedSlot}</span>
                </div>
              </div>

              <div className="bw-review-row">
                <Icon name="pin" size={16} />
                <div className="bw-rr-text">
                  <strong>{addressArea}</strong>
                  <span>{addressDetail}</span>
                </div>
              </div>
            </div>

            {/* Price Breakdown Card */}
            <div className="bw-card-block bw-pricing-card">
              <div className="bw-pc-head">
                <h4 className="bw-block-title">Price Breakdown</h4>
                <button
                  type="button"
                  className="bw-pc-link"
                  onClick={() => setShowTransparencyModal(true)}
                >
                  Pricing kaise kaam karti hai?
                </button>
              </div>

              <div className="bw-pc-rows">
                <div className="bw-pc-row">
                  <span>Visiting &amp; Inspection Fee</span>
                  <span>₹{pricingSummary.visitCharge}</span>
                </div>

                <div className="bw-pc-row">
                  <span>Services Labor Estimate ({cart.length} item{cart.length > 1 ? 's' : ''})</span>
                  <span>₹{pricingSummary.serviceMinSum} – ₹{pricingSummary.serviceMaxSum}</span>
                </div>

                {pricingSummary.savings > 0 && (
                  <div className="bw-pc-row bw-pc-discount">
                    <span>Multi-Service Single Visit Saving</span>
                    <span className="green">-₹{pricingSummary.savings}</span>
                  </div>
                )}

                <div className="bw-pc-row">
                  <span>GST (5%)</span>
                  <span>₹{pricingSummary.gstMin} – ₹{pricingSummary.gstMax}</span>
                </div>

                <div className="bw-pc-row bw-pc-total">
                  <strong>Estimated Total Range</strong>
                  <strong className="teal">₹{pricingSummary.totalMin} – ₹{pricingSummary.totalMax}</strong>
                </div>
              </div>

              <p className="bw-pc-guarantee-note">
                Payment kaam poora hone par hi deni hai · No advance required
              </p>
            </div>

            <div className="bw-bottom-spacing" />
          </div>
        )}

        {/* ═══════════════════════ STEP 4: MATCHING & LIVE TRACKING ═══════════════════════ */}
        {step === 4 && (
          <div className="bw-matching-stage">
            {/* Searching Radar State */}
            {(!activeTrip || activeTrip.status === 'searching') && (
              <div className="bw-search-view">
                <div className="bw-sv-head">
                  <button type="button" className="bw-close-btn" onClick={handleCancelTrip}>
                    <Icon name="close" size={20} />
                  </button>
                  <span>Connecting Karigar</span>
                </div>

                <div className="bw-radar-box">
                  <div className="bw-radar-ring r1" />
                  <div className="bw-radar-ring r2" />
                  <div className="bw-radar-ring r3" />
                  <div className="bw-radar-icon">
                    <Icon name="bolt" size={32} />
                  </div>
                </div>

                <h3 className="bw-search-title">Finding verified {cart[0]?.name}…</h3>
                <p className="bw-search-sub">Aapke 3 km area ke online Karigars ko request bheji ja rahi hai</p>

                <div className="bw-search-summary-card">
                  <div className="bw-ssc-row">
                    <Icon name="pin" size={15} />
                    <span>{addressDetail}</span>
                  </div>
                  <div className="bw-ssc-row">
                    <Icon name="calendar" size={15} />
                    <span>{availableDays[selectedDayIdx].fullString} · {selectedSlot}</span>
                  </div>
                </div>

                <button type="button" className="bw-cancel-request-btn" onClick={handleCancelTrip}>
                  Cancel Request
                </button>
              </div>
            )}

            {/* Live Tracking & OTP */}
            {activeTrip && activeTrip.status !== 'searching' && activeTrip.status !== 'completed' && activeTrip.status !== 'rated' && (
              <div className="bw-tracking-view">
                <div className="bw-tv-head">
                  <button type="button" className="bw-close-btn" onClick={handleCancelTrip}>
                    <Icon name="close" size={20} />
                  </button>
                  <span>Live Tracking · {activeTrip.service}</span>
                </div>

                {/* Start Job OTP Card */}
                <div className="bw-otp-card">
                  <div className="bw-oc-left">
                    <span className="bw-oc-tag">START JOB OTP</span>
                    <p className="bw-oc-desc">Karigar aane par ye 4-digit code dein</p>
                  </div>
                  <div className="bw-oc-code">{activeTrip.otp || '4829'}</div>
                </div>

                {/* Karigar Profile */}
                <div className="bw-karigar-card">
                  <div className="bw-kc-avatar">R</div>
                  <div className="bw-kc-info">
                    <div className="bw-kc-name-row">
                      <h4>{activeTrip.karigar?.name || 'Ramesh Suthar'}</h4>
                      <span className="bw-kc-verified">
                        <Icon name="shield" size={13} /> Verified
                      </span>
                    </div>
                    <p className="bw-kc-skill">{activeTrip.service} Expert · Barmer</p>
                    <div className="bw-kc-rating">
                      <Icon name="star" size={13} />
                      <strong>{activeTrip.karigar?.rating || 4.9}</strong>
                      <span>({activeTrip.karigar?.jobsDone || 320}+ jobs)</span>
                    </div>
                  </div>
                  <a href="tel:9414088214" className="bw-kc-call-btn">
                    <Icon name="phone" size={18} />
                  </a>
                </div>

                {/* Step Progression Tracker */}
                <div className="bw-progression-box">
                  {[
                    { title: 'Karigar Assigned', desc: 'Accepted your request', done: true },
                    { title: 'On the Way', desc: 'Reaching your address in ~8 mins', done: activeTrip.status === 'arrived' || activeTrip.status === 'working' },
                    { title: 'Work in Progress', desc: 'Working after OTP verification', done: activeTrip.status === 'working' },
                    { title: 'Job Done & Bill', desc: 'Payment after completion', done: false },
                  ].map((s, i) => (
                    <div key={i} className={'bw-prog-step' + (s.done ? ' done' : '')}>
                      <span className="bw-ps-dot" />
                      <div className="bw-ps-text">
                        <strong>{s.title}</strong>
                        <small>{s.desc}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payment & Bill */}
            {activeTrip && activeTrip.status === 'completed' && (
              <div className="bw-payment-view">
                <div className="bw-pv-done-ic">
                  <Icon name="check" size={28} />
                </div>
                <h3 className="bw-pv-title">Kaam Poora Ho Gaya!</h3>
                <p className="bw-pv-sub">{activeTrip.karigar?.name || 'Karigar'} · {activeTrip.service}</p>

                <div className="bw-bill-box">
                  <div className="bw-bb-row">
                    <span>Service &amp; Diagnostic Bill</span>
                    <span>₹{pricingSummary.totalMin}</span>
                  </div>
                </div>

                <div className="bw-pm-options">
                  <button
                    type="button"
                    className={'bw-pm-btn' + (payMethod === 'online' ? ' active' : '')}
                    onClick={() => setPayMethod('online')}
                  >
                    <Icon name="card" size={20} />
                    <div className="bw-pm-text">
                      <strong>Online Payment (UPI / QR)</strong>
                      <small>Google Pay, PhonePe, Paytm</small>
                    </div>
                  </button>

                  <button
                    type="button"
                    className={'bw-pm-btn' + (payMethod === 'cash' ? ' active' : '')}
                    onClick={() => setPayMethod('cash')}
                  >
                    <Icon name="cash" size={20} />
                    <div className="bw-pm-text">
                      <strong>Cash Payment</strong>
                      <small>Karigar ko haath mein dein</small>
                    </div>
                  </button>
                </div>

                <button type="button" className="bw-primary-cta" onClick={handlePayment}>
                  Pay ₹{pricingSummary.totalMin} &amp; Complete
                </button>
              </div>
            )}

            {/* Rating Sheet */}
            {activeTrip && activeTrip.status === 'rated' && (
              <div className="bw-rating-view">
                <div className="bw-rv-avatar">R</div>
                <h3 className="bw-rv-title">{activeTrip.karigar?.name || 'Ramesh Suthar'} ko Rate Karein</h3>
                <p className="bw-rv-sub">Aapka feedback hume best service dene mein help karta hai</p>

                <div className="bw-stars-row">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      className={'bw-star-btn' + (n <= stars ? ' on' : '')}
                      onClick={() => setStars(n)}
                    >
                      <Icon name="star" size={32} />
                    </button>
                  ))}
                </div>

                <div className="bw-praise-chips">
                  {['Time pe aaya', 'Achha kaam', 'Vyavhaar achha', 'Saaf-suthra', 'Uchit daam'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={'bw-praise-chip' + (ratingChips.includes(c) ? ' on' : '')}
                      onClick={() => toggleRatingChip(c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>

                <button type="button" className="bw-primary-cta" onClick={handleRatingSubmit}>
                  Submit {stars} Star Rating
                </button>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════ PERSISTENT HELP FAB (12px above sticky bar) ═══════════════════════ */}
        {step <= 3 && (
          <div className="bw-help-fab-wrapper">
            {helpExpanded && (
              <div className="bw-help-popover">
                <a href="tel:1800123456" className="bw-hp-link" onClick={() => toast('Calling Customer Helpline…')}>
                  <Icon name="phone" size={16} />
                  <span>Call 24×7 Helpline</span>
                </a>
                <a
                  href="https://wa.me/919414088214?text=Namaste,%20mujhe%20booking%20ke%20liye%20help%20chahiye"
                  target="_blank"
                  rel="noreferrer"
                  className="bw-hp-link"
                >
                  <Icon name="whatsapp" size={16} />
                  <span>WhatsApp Support</span>
                </a>
              </div>
            )}

            <button
              type="button"
              className={'bw-help-fab' + (helpExpanded ? ' active' : '')}
              onClick={() => setHelpExpanded((prev) => !prev)}
              aria-label="Need Help"
            >
              <Icon name={helpExpanded ? 'close' : 'headset'} size={18} />
              <span>Need Help?</span>
            </button>
          </div>
        )}

        {/* ═══════════════════════ STICKY BOTTOM ACTION BAR (Steps 0–3) ═══════════════════════ */}
        {step <= 3 && (
          <div className="bw-sticky-bottom-bar">
            <div className="bw-sbb-price-col">
              <div className="bw-sbb-total">
                <span className="bw-sbb-amount">₹{pricingSummary.totalMin} – ₹{pricingSummary.totalMax}</span>
              </div>
              <span className="bw-sbb-sub">Visit ₹{pricingSummary.visitCharge} + Est + 5% GST</span>
            </div>

            <div className="bw-sbb-cta-col">
              {step === 0 && (
                <button
                  type="button"
                  className="bw-primary-cta"
                  onClick={() => goToStep(1)}
                >
                  <Icon name="calendar" size={18} />
                  <span>Choose Date &amp; Time</span>
                </button>
              )}

              {step === 1 && (
                <button
                  type="button"
                  className="bw-primary-cta"
                  disabled={!availableDays[selectedDayIdx].hasSlots}
                  onClick={() => goToStep(2)}
                >
                  <span>Proceed to Address</span>
                  <Icon name="arrow" size={16} />
                </button>
              )}

              {step === 2 && (
                <button
                  type="button"
                  className="bw-primary-cta"
                  disabled={!isAddressValid}
                  onClick={() => goToStep(3)}
                >
                  <span>Proceed to Details</span>
                  <Icon name="arrow" size={16} />
                </button>
              )}

              {step === 3 && (
                <button
                  type="button"
                  className="bw-primary-cta danger-confirm"
                  onClick={handleConfirmAndMatch}
                >
                  <Icon name="bolt" size={18} />
                  <span>Confirm &amp; Find Karigar</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════ MODAL: ADD ANOTHER SERVICE SHEET ═══════════════════════ */}
        {showAddServiceSheet && (
          <div className="bw-sheet-overlay" onClick={() => setShowAddServiceSheet(false)}>
            <div className="bw-sub-sheet" onClick={(e) => e.stopPropagation()}>
              <div className="bw-ss-header">
                <h3>Add Another Service</h3>
                <button type="button" className="bw-close-btn" onClick={() => setShowAddServiceSheet(false)}>
                  <Icon name="close" size={18} />
                </button>
              </div>
              <p className="bw-ss-desc">Ek hi visit mein multiple services karwayein aur extra visit charge bachayein.</p>

              <div className="bw-ss-list">
                {Object.values(PRICING_CONFIG.serviceEstimates).map((srv) => {
                  const inCart = cart.some((it) => it.id === srv.id);
                  return (
                    <div key={srv.id} className={'bw-ss-item' + (inCart ? ' in-cart' : '')}>
                      <div className="bw-ss-left">
                        <img src={srv.photo} alt={srv.name} className="bw-ss-thumb" />
                        <div>
                          <strong>{srv.name}</strong>
                          <span>Starts ₹{srv.minPrice}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className={'bw-ss-add-btn' + (inCart ? ' added' : '')}
                        disabled={inCart}
                        onClick={() => handleAddServiceToCart(srv.id)}
                      >
                        {inCart ? 'Added' : '+ Add'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════ MODAL: TRANSPARENCY EXPLANATION ═══════════════════════ */}
        {showTransparencyModal && (
          <div className="bw-sheet-overlay" onClick={() => setShowTransparencyModal(false)}>
            <div className="bw-sub-sheet" onClick={(e) => e.stopPropagation()}>
              <div className="bw-ss-header">
                <div className="bw-tc-title-wrap">
                  <Icon name="shield" size={18} />
                  <h3>Pricing Transparency Guarantee</h3>
                </div>
                <button type="button" className="bw-close-btn" onClick={() => setShowTransparencyModal(false)}>
                  <Icon name="close" size={18} />
                </button>
              </div>

              <div className="bw-tc-steps-list in-modal">
                {TRANSPARENCY_STEPS.map((st) => (
                  <div key={st.step} className="bw-tc-step-item">
                    <span className="bw-tc-num">{st.step}</span>
                    <div className="bw-tc-step-info">
                      <strong>{st.title}</strong>
                      <p>{st.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bw-tc-modal-foot">
                <button type="button" className="bw-primary-cta" onClick={() => setShowTransparencyModal(false)}>
                  Samajh Aa Gaya
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════ MODAL: NAYA ADDRESS SHEET ═══════════════════════ */}
        {showAddAddressSheet && (
          <div className="bw-sheet-overlay" onClick={() => setShowAddAddressSheet(false)}>
            <div className="bw-sub-sheet" onClick={(e) => e.stopPropagation()}>
              <div className="bw-ss-header">
                <h3>Naya Address Save Karein</h3>
                <button type="button" className="bw-close-btn" onClick={() => setShowAddAddressSheet(false)}>
                  <Icon name="close" size={18} />
                </button>
              </div>

              <div className="bw-na-form">
                <label className="bw-form-label">Address Type</label>
                <div className="bw-na-chips">
                  {['Ghar', 'Office', 'Shop', 'Dukaan'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={'bw-na-chip' + (newAddrLabel === t ? ' active' : '')}
                      onClick={() => setNewAddrLabel(t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <label className="bw-form-label">Address Details</label>
                <textarea
                  className="bw-form-textarea"
                  rows={3}
                  value={newAddrText}
                  onChange={(e) => setNewAddrText(e.target.value)}
                  placeholder="House/Plot No., Street/Gali, Landmark, Area, Barmer…"
                />

                <button type="button" className="bw-primary-cta" onClick={handleSaveNewAddress}>
                  Save &amp; Use Address
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

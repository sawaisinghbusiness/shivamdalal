import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon';
import { useToast } from './Toast';
import { useAppData } from '../store/AppData';
import {
  PRICING_CONFIG,
  TRANSPARENCY_STEPS,
  SLOT_GROUPS,
  DEFAULT_SAVED_ADDRESSES,
} from '../config/bookingConfig';
import './BookingWizard.css';

const DRAFT_STORAGE_KEY = 'sarvottam_booking_draft';

// Generate 5 days: "Aaj" (Today) + next 4 days
const generateBookingDays = () => {
  const days = [];
  const now = new Date();
  const weekNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  for (let i = 0; i < 5; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const dayLabel = i === 0 ? 'Aaj' : i === 1 ? 'Kal' : weekNames[d.getDay()];
    const fullDateStr = (i === 0 ? 'Today, ' : i === 1 ? 'Tomorrow, ' : weekNames[d.getDay()] + ', ') +
      d.getDate() + ' ' + monthNames[d.getMonth()];

    days.push({
      index: i,
      label: dayLabel,
      dateNum: d.getDate(),
      month: monthNames[d.getMonth()],
      weekday: weekNames[d.getDay()],
      fullString: fullDateStr,
      isoDate: d.toISOString().split('T')[0],
      hasSlots: i !== 4, // 5th day simulated fully booked
    });
  }
  return days;
};

export default function BookingWizard({ initialService, onClose }) {
  const nav = useNavigate();
  const toast = useToast();
  const { user, addBooking } = useAppData();

  // Active target service config
  const serviceKey = initialService?.id || 'electrician';
  const serviceConfig = PRICING_CONFIG.serviceEstimates[serviceKey] || PRICING_CONFIG.serviceEstimates.electrician;

  // ── 1. WIZARD STEP STATE ──
  // 'issue': S-ISSUE (Issue & Price Selection)
  // 0: S0 Booking Summary
  // 1: S1 Date & Time
  // 2: S2 Address & Location
  // 3: S3 Details & Confirm
  const [step, setStep] = useState('issue');

  // S-ISSUE State (Default = NOTHING selected; CTA disabled)
  const [selectedIssueId, setSelectedIssueId] = useState(null);
  const [brandInput, setBrandInput] = useState('');
  const [modelInput, setModelInput] = useState('');

  // Cart of booked services
  const [cart, setCart] = useState([]);

  // Date & Slot state
  const availableDays = useMemo(() => generateBookingDays(), []);
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState(SLOT_GROUPS[0].slots[0].time);

  // Address state
  const [savedAddresses, setSavedAddresses] = useState(DEFAULT_SAVED_ADDRESSES);
  const [selectedAddressId, setSelectedAddressId] = useState('home');
  const [addressArea, setAddressArea] = useState('Indra Colony');
  const [addressDetail, setAddressDetail] = useState('12, Indra Colony, Near Water Tank, Barmer');
  const [customPin, setCustomPin] = useState({ lat: 25.7532, lng: 71.3965 });
  const [isLocating, setIsLocating] = useState(false);
  const [showAddAddressSheet, setShowAddAddressSheet] = useState(false);
  const [newAddrLabel, setNewAddrLabel] = useState('Ghar');
  const [newAddrText, setNewAddrText] = useState('');

  // Customer Contact & Notes state
  const [custName, setCustName] = useState(user?.name || 'Shivam Singh');
  const [custPhone, setCustPhone] = useState(user?.phone?.replace('+91 ', '') || '9876543210');
  const [custNotes, setCustNotes] = useState('');

  // UI state
  const [transparencyOpen, setTransparencyOpen] = useState(false);
  const [showAddServiceSheet, setShowAddServiceSheet] = useState(false);
  const [helpExpanded, setHelpExpanded] = useState(false);

  const scrollContainerRef = useRef(null);
  const lastScrollTopRef = useRef(0);
  const transparencyRef = useRef(null);

  // ── 2. DRAFT PERSISTENCE & RESTORATION ──
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const d = JSON.parse(saved);
        if (d.cart && d.cart.length > 0) {
          setCart(d.cart);
          if (d.step !== undefined) setStep(d.step);
        }
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

  // Auto-save draft on changes
  useEffect(() => {
    if (cart.length > 0) {
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

  // Collapse Help FAB on scroll down
  const handleScroll = (e) => {
    const st = e.target.scrollTop;
    if (st > lastScrollTopRef.current + 20 && helpExpanded) {
      setHelpExpanded(false);
    }
    lastScrollTopRef.current = st;
  };

  const toggleTransparency = () => {
    setTransparencyOpen((prev) => {
      const next = !prev;
      if (next) {
        setTimeout(() => {
          if (transparencyRef.current) {
            transparencyRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }, 100);
      }
      return next;
    });
  };

  // ── 3. PRICING CALCULATIONS ──
  const currentChosenIssue = useMemo(() => {
    if (!selectedIssueId) return null;
    return serviceConfig.issues.find((iss) => iss.id === selectedIssueId) || null;
  }, [selectedIssueId, serviceConfig]);

  const issueLivePrice = useMemo(() => {
    if (!currentChosenIssue) return null;
    const visit = PRICING_CONFIG.visitCharge;
    const minLabor = currentChosenIssue.priceType === 'fixed' ? currentChosenIssue.price : currentChosenIssue.minPrice;
    const maxLabor = currentChosenIssue.priceType === 'fixed' ? currentChosenIssue.price : currentChosenIssue.maxPrice;
    const gstMin = Math.round((visit + minLabor) * PRICING_CONFIG.gstPct);
    const gstMax = Math.round((visit + maxLabor) * PRICING_CONFIG.gstPct);
    return {
      minLabor,
      maxLabor,
      totalMin: visit + minLabor + gstMin,
      totalMax: visit + maxLabor + gstMax,
      isRange: minLabor !== maxLabor,
      displayLabor: currentChosenIssue.displayPrice,
    };
  }, [currentChosenIssue]);

  const cartPricingSummary = useMemo(() => {
    if (cart.length === 0) {
      return {
        serviceMinSum: 0,
        serviceMaxSum: 0,
        visitCharge: PRICING_CONFIG.visitCharge,
        gstMin: 0,
        gstMax: 0,
        totalMin: PRICING_CONFIG.visitCharge,
        totalMax: PRICING_CONFIG.visitCharge,
        savings: 0,
      };
    }

    const serviceMinSum = cart.reduce((acc, it) => acc + (it.minPrice || 0), 0);
    const serviceMaxSum = cart.reduce((acc, it) => acc + (it.maxPrice || 0), 0);
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

  // ── 4. S-ISSUE CONFIRMATION & STEP NAVIGATION ──
  const handleProceedFromIssue = () => {
    if (!currentChosenIssue) {
      toast('Please select an issue to continue / Issue chunein');
      return;
    }

    const brandModelStr = [brandInput.trim(), modelInput.trim()].filter(Boolean).join(' ');

    const newCartItem = {
      id: serviceConfig.id,
      name: serviceConfig.name,
      photo: serviceConfig.photo,
      badgeIcon: serviceConfig.badgeIcon,
      problem: currentChosenIssue.label,
      selectedIssue: currentChosenIssue,
      minPrice: currentChosenIssue.priceType === 'fixed' ? currentChosenIssue.price : currentChosenIssue.minPrice,
      maxPrice: currentChosenIssue.priceType === 'fixed' ? currentChosenIssue.price : currentChosenIssue.maxPrice,
      displayPrice: currentChosenIssue.displayPrice,
      brandModel: brandModelStr,
    };

    setCart([newCartItem]);
    setStep(0); // Move to S0 (Booking Summary)
    if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
  };

  const goToStep = (nextStep) => {
    setStep(nextStep);
    if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
  };

  // ── 5. CART ACTIONS ──
  const handleRemoveService = (serviceId) => {
    if (cart.length <= 1) {
      toast('At least 1 service is required in the cart');
      return;
    }
    setCart((prev) => prev.filter((it) => it.id !== serviceId));
    toast('Service removed from cart');
  };

  const handleAddServiceToCart = (srvKey, issueObj) => {
    const s = PRICING_CONFIG.serviceEstimates[srvKey];
    if (!s) return;
    if (cart.some((it) => it.id === s.id)) {
      toast(s.name + ' is already in your cart');
      return;
    }

    const defaultIssue = issueObj || s.issues[0];
    const newCartItem = {
      id: s.id,
      name: s.name,
      photo: s.photo,
      badgeIcon: s.badgeIcon,
      problem: defaultIssue.label,
      selectedIssue: defaultIssue,
      minPrice: defaultIssue.priceType === 'fixed' ? defaultIssue.price : defaultIssue.minPrice,
      maxPrice: defaultIssue.priceType === 'fixed' ? defaultIssue.price : defaultIssue.maxPrice,
      displayPrice: defaultIssue.displayPrice,
      brandModel: '',
    };

    setCart((prev) => [...prev, newCartItem]);
    setShowAddServiceSheet(false);
    toast(s.name + ' added to cart (Single visit charge applied)');
  };

  const handleClearDraft = () => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    toast('Booking draft cleared');
    onClose();
  };

  // ── 6. GEOLOCATION ──
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast('GPS geolocation is not supported in your browser');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        setCustomPin({ lat: latitude, lng: longitude });
        setAddressArea('Live GPS Location');
        setAddressDetail('GPS Pin (' + latitude.toFixed(4) + ', ' + longitude.toFixed(4) + '), Barmer, Rajasthan');
        toast('GPS location locked successfully');
      },
      (err) => {
        setIsLocating(false);
        toast('Please enable GPS location permission or enter address manually');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSaveNewAddress = () => {
    if (newAddrText.trim().length < 10) {
      toast('Please enter a complete address with at least 10 characters');
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
    toast('New address saved successfully');
  };

  // ── 7. FINAL BOOKING CONFIRMATION ──
  const handleFinalConfirm = () => {
    if (!custPhone || custPhone.replace(/\D/g, '').length < 10) {
      toast('Please enter a valid 10-digit mobile number');
      return;
    }

    const bookingId = 'CP' + Math.floor(100000 + Math.random() * 900000);

    const newBooking = {
      id: bookingId,
      status: 'PROCESSING',
      createdAt: new Date().toISOString(),
      date: availableDays[selectedDayIdx].fullString,
      slot: selectedSlot,
      city: 'Barmer',
      addressArea: addressArea,
      address: addressDetail,
      service: cart.map((s) => s.name).join(' + '),
      subService: cart.map((s) => s.problem).join('; '),
      icon: cart[0]?.badgeIcon || 'bolt',
      customer: {
        name: custName.trim() || 'Shivam Singh',
        phone: '+91 ' + custPhone.replace(/\D/g, ''),
        notes: custNotes.trim() || '',
      },
      services: cart.map((s) => ({
        id: s.id,
        name: s.name,
        issue: s.problem,
        price: s.displayPrice,
        minPrice: s.minPrice,
        maxPrice: s.maxPrice,
        brandModel: s.brandModel || '',
      })),
      estimate: {
        visitCharge: cartPricingSummary.visitCharge,
        laborMin: cartPricingSummary.serviceMinSum,
        laborMax: cartPricingSummary.serviceMaxSum,
        gstMin: cartPricingSummary.gstMin,
        gstMax: cartPricingSummary.gstMax,
        totalMin: cartPricingSummary.totalMin,
        totalMax: cartPricingSummary.totalMax,
        savings: cartPricingSummary.savings,
      },
      amount: cartPricingSummary.totalMin,
      karigar: null,
      timeline: [
        { status: 'PROCESSING', title: 'Booking Placed', desc: 'Assigned to platform operations desk', time: 'Just now', done: true },
        { status: 'CONFIRMED', title: 'Karigar Assignment', desc: 'Platform assigning verified technician', time: 'In progress', done: false },
        { status: 'IN_PROGRESS', title: 'Doorstep Inspection', desc: 'Technician reaches address on time', time: 'Pending', done: false },
        { status: 'COMPLETED', title: 'Work Done & Final Bill', desc: 'Payment after complete satisfaction', time: 'Pending', done: false },
      ],
    };

    addBooking(newBooking);
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    onClose();
    nav('/booking-success', { state: { booking: newBooking } });
  };

  const isAddressValid = addressDetail.trim().length >= 10;

  return (
    <div className="bw-overlay">
      <div className="bw-modal">

        {/* ═══════════════════════ S-ISSUE HEADER ═══════════════════════ */}
        {step === 'issue' && (
          <div className="bw-issue-header">
            <div className="bw-ih-top">
              <button type="button" className="bw-back-btn" onClick={onClose} aria-label="Close">
                <Icon name="close" size={18} />
              </button>
              <h2 className="bw-step-main-title">{serviceConfig.name} Issue Selection</h2>
              <div className="bw-ih-badge">
                <Icon name={serviceConfig.badgeIcon} size={15} />
              </div>
            </div>
            <p className="bw-ih-sub">Select your issue for upfront transparent pricing</p>
          </div>
        )}

        {/* ═══════════════════════ STEPS 1–3 STEPPER HEADER ═══════════════════════ */}
        {step >= 1 && step <= 3 && (
          <div className="bw-stepper-header">
            <div className="bw-stepper-top">
              <button
                type="button"
                className="bw-back-btn"
                onClick={() => goToStep(step === 1 ? 0 : step - 1)}
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

        {/* ═══════════════════════ S-ISSUE: ISSUE & PRICE SELECTION ═══════════════════════ */}
        {step === 'issue' && (
          <div className="bw-view-scroll" ref={scrollContainerRef} onScroll={handleScroll}>
            <div className="bw-issue-list">
              {serviceConfig.issues.map((iss) => {
                const isSelected = selectedIssueId === iss.id;
                return (
                  <div
                    key={iss.id}
                    className={'bw-issue-card' + (isSelected ? ' selected' : '') + (iss.recommended ? ' recommended' : '')}
                    onClick={() => setSelectedIssueId(iss.id)}
                  >
                    {iss.recommended && (
                      <div className="bw-rec-tag">
                        <Icon name="star" size={12} />
                        <span>Recommended</span>
                      </div>
                    )}

                    <div className="bw-ic-radio-row">
                      <div className={'bw-radio-circle' + (isSelected ? ' checked' : '')}>
                        {isSelected && <span className="bw-rc-inner" />}
                      </div>

                      <div className="bw-ic-content">
                        <div className="bw-ic-title-row">
                          <strong className="bw-ic-label">{iss.label}</strong>
                          <span className="bw-ic-price-tag">{iss.displayPrice}</span>
                        </div>
                        <p className="bw-ic-desc">{iss.desc}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Optional Brand / Model Inputs */}
            <div className="bw-optional-appliance-box">
              <span className="bw-oab-title">Appliance Details (Optional)</span>
              <div className="bw-oab-grid">
                <input
                  type="text"
                  className="bw-oab-input"
                  placeholder="Brand (e.g. Havells, Voltas, Jaquar)"
                  value={brandInput}
                  onChange={(e) => setBrandInput(e.target.value)}
                />
                <input
                  type="text"
                  className="bw-oab-input"
                  placeholder="Model / Capacity (e.g. 1.5 Ton, Inverter)"
                  value={modelInput}
                  onChange={(e) => setModelInput(e.target.value)}
                />
              </div>
            </div>

            <div className="bw-bottom-spacing" />
          </div>
        )}

        {/* ═══════════════════════ STEP 0: BOOKING SUMMARY (S0) ═══════════════════════ */}
        {step === 0 && (
          <div className="bw-view-scroll" ref={scrollContainerRef} onScroll={handleScroll}>
            <div className="bw-summary-header">
              <div className="bw-sh-left">
                <h2 className="bw-title">Your Booking Summary</h2>
                <p className="bw-subtitle">Verified local technicians directly at your doorstep</p>
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

                    {/* Selected Issue Pill */}
                    <div className="bw-sc-prob-pill">
                      <span className="bw-sc-prob-text">{item.problem}</span>
                    </div>

                    {/* Brand/Model Pill (Rendered ONLY when entered) */}
                    {item.brandModel && (
                      <div className="bw-attr-chips-row">
                        <span className="bw-attr-chip">
                          <Icon name="tag" size={11} />
                          <span>{item.brandModel}</span>
                        </span>
                      </div>
                    )}

                    <div className="bw-sc-price-row">
                      <span className="bw-sc-estimate-label">Labor Estimate:</span>
                      <span className="bw-sc-estimate-val">{item.displayPrice}</span>
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
                <span>Add Another Service</span>
              </button>
            </div>

            {/* Multi-Service Single Visit Savings Banner */}
            {cart.length > 1 && (
              <div className="bw-savings-banner">
                <Icon name="check" size={16} />
                <div className="bw-savings-text">
                  <strong>Single Visit Guarantee – Pay Visiting Fee Only Once</strong>
                  <p>You saved ₹{cartPricingSummary.savings} in multiple visitation charges</p>
                </div>
              </div>
            )}

            {/* ONE Shared Collapsible Transparency Card ("Kaam kaise hoga") */}
            <div className="bw-transparency-card" ref={transparencyRef}>
              <button
                type="button"
                className="bw-tc-toggle"
                onClick={toggleTransparency}
              >
                <div className="bw-tc-left">
                  <span className="bw-tc-shield-ic">
                    <Icon name="shield" size={18} />
                  </span>
                  <div className="bw-tc-title-wrap">
                    <strong className="bw-tc-title">Kaam kaise hoga?</strong>
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

        {/* ═══════════════════════ STEP 1: DATE & TIME (S1) ═══════════════════════ */}
        {step === 1 && (
          <div className="bw-view-scroll" ref={scrollContainerRef} onScroll={handleScroll}>
            <div className="bw-section-head">
              <h3 className="bw-sec-title">Select Service Date &amp; Time</h3>
              <p className="bw-sec-sub">Technician will arrive at your doorstep during the selected slot</p>
            </div>

            {/* Horizontal Date Chips (Aaj + 4 days) */}
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
                        toast('All slots are booked for this day. Please select another date.');
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

            {/* Slots Grid Grouped by Subah 8–12 / Dopahar 12–4 / Shaam 4–8 */}
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
                <strong>No slots available on this date</strong>
                <p>All technicians are currently booked for this day.</p>
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

        {/* ═══════════════════════ STEP 2: ADDRESS & LOCATION (S2) ═══════════════════════ */}
        {step === 2 && (
          <div className="bw-view-scroll" ref={scrollContainerRef} onScroll={handleScroll}>
            <div className="bw-section-head">
              <h3 className="bw-sec-title">Service Address &amp; Location</h3>
              <p className="bw-sec-sub">Accurate location pin for seamless technician navigation</p>
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
                <span>+ Naya Address</span>
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
                  {isLocating ? 'Fetching GPS location…' : 'Meri current location'}
                </span>
              </button>
            </div>

            {/* Map Preview with Pin Helper */}
            <div className="bw-map-preview-card">
              <div className="bw-mp-header">
                <Icon name="map" size={16} />
                <span>Map Coordinates: {customPin.lat.toFixed(4)}, {customPin.lng.toFixed(4)}</span>
              </div>
              <div className="bw-mp-viewport">
                <div className="bw-mp-grid-bg" />
                <div className="bw-mp-pin-marker">
                  <span className="bw-mp-pin-glow" />
                  <Icon name="pin" size={24} />
                </div>
              </div>
              <p className="bw-mp-helper">Keep pin exact for quick and easy technician arrival</p>
            </div>

            {/* Address Textarea Form Input */}
            <div className="bw-addr-form-block">
              <label className="bw-form-label">
                Complete Address (House/Flat No., Street, Landmark) <span className="req">*</span>
              </label>
              <textarea
                className="bw-form-textarea"
                rows={3}
                value={addressDetail}
                onChange={(e) => {
                  setAddressDetail(e.target.value);
                  setSelectedAddressId('custom');
                }}
                placeholder="House/flat number, building name, street, landmark, area, Barmer…"
              />
              {!isAddressValid && (
                <p className="bw-form-err">Please enter a complete address with at least 10 characters.</p>
              )}
            </div>

            <div className="bw-bottom-spacing" />
          </div>
        )}

        {/* ═══════════════════════ STEP 3: DETAILS & CONFIRM (S3) ═══════════════════════ */}
        {step === 3 && (
          <div className="bw-view-scroll" ref={scrollContainerRef} onScroll={handleScroll}>
            <div className="bw-section-head">
              <h3 className="bw-sec-title">Booking Details &amp; Confirmation</h3>
              <p className="bw-sec-sub">Technician will visit your selected doorstep address</p>
            </div>

            {/* Customer Details Form */}
            <div className="bw-card-block">
              <h4 className="bw-block-title">Contact Information</h4>
              <div className="bw-input-row">
                <div className="bw-input-field">
                  <label className="bw-form-label">Your Name</label>
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
                <label className="bw-form-label">Special Instructions for Technician (Optional)</label>
                <textarea
                  className="bw-form-textarea"
                  rows={2}
                  value={custNotes}
                  onChange={(e) => setCustNotes(e.target.value)}
                  placeholder="e.g., Doorbell not working, please call at gate, landmark notes…"
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
              <h4 className="bw-block-title">Price Breakdown</h4>

              <div className="bw-pc-rows">
                <div className="bw-pc-row">
                  <span>Visiting &amp; Diagnostic Fee</span>
                  <span>₹{cartPricingSummary.visitCharge}</span>
                </div>

                <div className="bw-pc-row">
                  <span>Services Labor Estimate ({cart.length} item{cart.length > 1 ? 's' : ''})</span>
                  <span>₹{cartPricingSummary.serviceMinSum} – ₹{cartPricingSummary.serviceMaxSum}</span>
                </div>

                {cartPricingSummary.savings > 0 && (
                  <div className="bw-pc-row bw-pc-discount">
                    <span>Multi-Service Single Visit Savings</span>
                    <span className="green">-₹{cartPricingSummary.savings}</span>
                  </div>
                )}

                <div className="bw-pc-row">
                  <span>GST (5%)</span>
                  <span>₹{cartPricingSummary.gstMin} – ₹{cartPricingSummary.gstMax}</span>
                </div>

                <div className="bw-pc-row bw-pc-total">
                  <strong>Estimated Total Range</strong>
                  <strong className="teal">₹{cartPricingSummary.totalMin} – ₹{cartPricingSummary.totalMax}</strong>
                </div>
              </div>

              <p className="bw-pc-guarantee-note">
                Payment due only after satisfactory job completion · Zero advance required
              </p>
            </div>

            <div className="bw-bottom-spacing" />
          </div>
        )}

        {/* ═══════════════════════ PERSISTENT HELP FAB (12px above sticky bar) ═══════════════════════ */}
        <div className="bw-help-fab-wrapper">
          {helpExpanded && (
            <div className="bw-help-popover">
              <a href="tel:1800123456" className="bw-hp-link" onClick={() => toast('Connecting to 24×7 Customer Helpline…')}>
                <Icon name="phone" size={16} />
                <span>Call 24×7 Helpline</span>
              </a>
              <a
                href="https://wa.me/919414088214?text=Hello,%20I%20need%20assistance%20with%20my%20service%20booking"
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

        {/* ═══════════════════════ STICKY BOTTOM ACTION BAR ═══════════════════════ */}
        <div className="bw-sticky-bottom-bar">
          {/* S-ISSUE Sticky Bar */}
          {step === 'issue' && (
            <>
              <div className="bw-sbb-price-col">
                <div className="bw-sbb-total">
                  <span className="bw-sbb-amount">
                    {issueLivePrice ? (issueLivePrice.isRange ? ('₹' + issueLivePrice.totalMin + ' – ₹' + issueLivePrice.totalMax) : ('₹' + issueLivePrice.totalMin)) : 'Select issue'}
                  </span>
                </div>
                <span className="bw-sbb-sub">
                  {issueLivePrice ? ('Visit ₹' + PRICING_CONFIG.visitCharge + ' + ' + issueLivePrice.displayLabor + ' + GST') : 'Upfront transparent price'}
                </span>
              </div>

              <div className="bw-sbb-cta-col">
                <button
                  type="button"
                  className="bw-primary-cta"
                  disabled={!selectedIssueId}
                  onClick={handleProceedFromIssue}
                >
                  <span>{selectedIssueId ? 'Aage badhein' : 'Issue chunein'}</span>
                  <Icon name="arrow" size={16} />
                </button>
              </div>
            </>
          )}

          {/* S0–S3 Sticky Bar */}
          {step !== 'issue' && (
            <>
              <div className="bw-sbb-price-col">
                <div className="bw-sbb-total">
                  <span className="bw-sbb-amount">₹{cartPricingSummary.totalMin} – ₹{cartPricingSummary.totalMax}</span>
                </div>
                <span className="bw-sbb-sub">Visit ₹{cartPricingSummary.visitCharge} + Est + 5% GST</span>
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
                    onClick={handleFinalConfirm}
                  >
                    <Icon name="check" size={18} />
                    <span>Confirm karein</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>

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
              <p className="bw-ss-desc">Book multiple services in a single visit and save on multiple visitation charges.</p>

              <div className="bw-ss-list">
                {Object.values(PRICING_CONFIG.serviceEstimates).map((srv) => {
                  const inCart = cart.some((it) => it.id === srv.id);
                  return (
                    <div key={srv.id} className={'bw-ss-item' + (inCart ? ' in-cart' : '')}>
                      <div className="bw-ss-left">
                        <img src={srv.photo} alt={srv.name} className="bw-ss-thumb" />
                        <div>
                          <strong>{srv.name}</strong>
                          <span>Starts {srv.issues[0]?.displayPrice}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className={'bw-ss-add-btn' + (inCart ? ' added' : '')}
                        disabled={inCart}
                        onClick={() => handleAddServiceToCart(srv.id, srv.issues[0])}
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

        {/* ═══════════════════════ MODAL: NEW ADDRESS SHEET ═══════════════════════ */}
        {showAddAddressSheet && (
          <div className="bw-sheet-overlay" onClick={() => setShowAddAddressSheet(false)}>
            <div className="bw-sub-sheet" onClick={(e) => e.stopPropagation()}>
              <div className="bw-ss-header">
                <h3>Save New Address</h3>
                <button type="button" className="bw-close-btn" onClick={() => setShowAddAddressSheet(false)}>
                  <Icon name="close" size={18} />
                </button>
              </div>

              <div className="bw-na-form">
                <label className="bw-form-label">Address Type</label>
                <div className="bw-na-chips">
                  {['Ghar', 'Office', 'Shop', 'Other'].map((t) => (
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
                  placeholder="House/Plot No., Street/Road, Landmark, Area, Barmer…"
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

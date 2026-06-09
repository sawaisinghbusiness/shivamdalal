import { useState, useEffect, useRef } from 'react';
import Icon from './Icon';
import { useToast } from './Toast';
import { SAVED_ADDRESSES, VISIT_CHARGE, GST_RATE } from '../data/services';
import './EmergencyFlow.css';

// flow stages: booking → searching → tracking → payment → rating → done
export default function EmergencyFlow({ service, onClose }) {
  const toast = useToast();
  const [stage, setStage] = useState('booking');

  // booking inputs
  const [addrId, setAddrId] = useState(SAVED_ADDRESSES[0].id);
  const [newAddr, setNewAddr] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [problem, setProblem] = useState('');

  // tracking step: 0 mila, 1 aa raha, 2 kaam chalu, 3 poora
  const [step, setStep] = useState(1);

  // payment / rating
  const [payMethod, setPayMethod] = useState('online');
  const [stars, setStars] = useState(0);
  const [chips, setChips] = useState([]);

  const timers = useRef([]);
  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  useEffect(() => () => clearTimers(), []);

  const k = service.karigar;
  const svc = service.service;
  const gst = Math.round((svc + VISIT_CHARGE) * GST_RATE);
  const total = svc + VISIT_CHARGE + gst;

  const chosenAddr = showNew
    ? (newAddr.trim() ? `Naya — ${newAddr.trim()}` : '')
    : `${SAVED_ADDRESSES.find(a => a.id === addrId)?.label} — ${SAVED_ADDRESSES.find(a => a.id === addrId)?.full}`;

  // approx range for booking sheet
  const approxLo = svc + VISIT_CHARGE;
  const approxHi = Math.round((svc * 1.2 + VISIT_CHARGE) / 10) * 10;

  function confirmBooking() {
    if (showNew && newAddr.trim().length < 6) { toast('Pura address daalein (area, landmark)'); return; }
    if (!chosenAddr) { toast('Pehle address chunein'); return; }
    setStage('searching');
    // 3.5s baad Karigar mil gaya → tracking
    timers.current.push(setTimeout(() => {
      setStage('tracking');
      setStep(1);
      toast(`✓ ${k.name} ne aapki request accept ki`);
      autoAdvance();
    }, 3500));
  }

  function autoAdvance() {
    // step1 (aa raha) → 3s → step2 (kaam chalu)
    timers.current.push(setTimeout(() => {
      setStep(2);
      toast('🔧 Karigar ne kaam shuru kiya');
      // → 3.5s → step3 (poora) → payment
      timers.current.push(setTimeout(() => {
        setStep(3);
        toast('✓ Karigar ne kaam poora kiya');
        timers.current.push(setTimeout(() => setStage('payment'), 900));
      }, 3500));
    }, 3000));
  }

  function pay() {
    toast(payMethod === 'online'
      ? `✓ ₹${total} online paid — dhanyavaad!`
      : `✓ ₹${total} cash — Karigar ko dein. Dhanyavaad!`);
    setStage('rating');
  }

  function submitRating() {
    if (stars === 0) { toast('Pehle star tap karke rating dein'); return; }
    toast(`🙏 Aapki ${stars}★ rating ke liye dhanyavaad!`);
    finish();
  }

  function finish() { clearTimers(); onClose(); }

  const toggleChip = (c) =>
    setChips((arr) => arr.includes(c) ? arr.filter(x => x !== c) : [...arr, c]);

  const RATE_WORDS = ['Star tap karke rating dein', 'Bahut kharab', 'Theek nahi', 'Theek-thaak', 'Achha', 'Behtareen!'];
  const STEP_INFO = [
    { t: 'Karigar mil gaya', s: `${k.name} ne request accept ki` },
    { t: 'Aapke ghar aa raha hai', s: 'Live location track ho rahi hai' },
    { t: 'Kaam chalu', s: 'Karigar kaam kar raha hai' },
    { t: 'Kaam poora', s: 'Payment aur rating' },
  ];
  const etaText = step >= 3 ? '✓' : step === 2 ? 'अभी' : `${k.eta} min`;
  const etaLabel = step >= 3 ? 'poora' : step === 2 ? 'kaam chalu' : 'door';
  const liveNote = step >= 3 ? 'Kaam poora ho gaya — ab payment'
    : step === 2 ? 'Karigar ne kaam shuru kar diya hai…'
    : 'Karigar aapke ghar aa raha hai…';

  return (
    <div className="flow-overlay">
      <div className={'flow-screen' + (stage === 'booking' || stage === 'payment' || stage === 'rating' ? ' sheet' : '')}>

        {/* ─────────── BOOKING ─────────── */}
        {stage === 'booking' && (
          <div className="ef-sheet">
            <div className="ef-drag" />
            <div className="ef-bk-head">
              <div className="ef-bk-ic" style={{ background: service.color + '22', color: service.color }}>
                <Icon name={service.icon} size={26} />
              </div>
              <div>
                <h2 className="ef-title">{service.name}</h2>
                <p className="ef-sub">Emergency service · Barmer</p>
              </div>
            </div>

            <p className="ef-label">Kahan aana hai? <span className="req">*</span></p>
            {SAVED_ADDRESSES.map((a) => (
              <button key={a.id}
                className={'ef-addr' + (!showNew && addrId === a.id ? ' active' : '')}
                onClick={() => { setAddrId(a.id); setShowNew(false); }}>
                <span className="ef-addr-ic"><Icon name={a.icon} size={20} /></span>
                <span className="ef-addr-text"><strong>{a.label}</strong><small>{a.full}</small></span>
                <span className="ef-addr-check"><Icon name="check" size={18} /></span>
              </button>
            ))}
            <button className="ef-newbtn" onClick={() => setShowNew((v) => !v)}>
              <Icon name="plus" size={15} /> Naya address daalein
            </button>
            {showNew && (
              <textarea className="ef-input" rows={2} value={newAddr}
                onChange={(e) => setNewAddr(e.target.value)}
                placeholder="Ghar/dukaan no., area, landmark… (Barmer)" autoFocus />
            )}

            <p className="ef-label">Kya problem hai? (optional)</p>
            <textarea className="ef-input" rows={2} value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder="Jaise: switch board kaam nahi kar raha…" />

            <div className="ef-charges">
              <div className="ef-crow"><span>Visit / inspection charge</span><span>₹{VISIT_CHARGE}</span></div>
              <div className="ef-crow"><span>{service.name} charge (approx)</span><span>₹{svc}</span></div>
              <div className="ef-cnote">Final bill kaam ke hisaab se · GST alag</div>
              <div className="ef-crow ef-ctotal"><span>Approx total</span><span>₹{approxLo} – ₹{approxHi}</span></div>
            </div>

            <button className="ef-cta danger" onClick={confirmBooking}>Confirm karein & Karigar dhoondhein</button>
            <button className="ef-skip" onClick={finish}>Cancel</button>
          </div>
        )}

        {/* ─────────── SEARCHING ─────────── */}
        {stage === 'searching' && (
          <div className="ef-full">
            <div className="ef-fhead">
              <button className="ef-close" onClick={finish}><Icon name="close" size={20} /></button>
              <span>{service.name} · Emergency</span>
            </div>
            <div className="ef-search">
              <div className="radar">
                <span className="ring r1" /><span className="ring r2" /><span className="ring r3" />
                <div className="radar-core"><Icon name="bolt" size={30} /></div>
              </div>
              <h2 className="ef-big">Karigar dhoondh rahe hain…</h2>
              <p className="ef-muted">Aapke aas-paas ke verified Karigar ko request bheji ja rahi hai</p>
              <div className="ef-addrline"><Icon name="pin" size={15} /> {chosenAddr}</div>
            </div>
          </div>
        )}

        {/* ─────────── TRACKING ─────────── */}
        {stage === 'tracking' && (
          <div className="ef-full">
            <div className="ef-fhead">
              <button className="ef-close" onClick={finish}><Icon name="close" size={20} /></button>
              <span>{service.name} · Emergency</span>
            </div>
            <div className="ef-track">
              <div className="onway">
                <div className="onway-route">
                  <Icon name="scooter" size={40} />
                  <div className="onway-line"><span className="onway-fill" /></div>
                  <span className="onway-home"><Icon name="home" size={22} /></span>
                </div>
                <div className="onway-eta">
                  <span className="eta-num">{etaText}</span>
                  <span className="eta-label">{etaLabel}</span>
                </div>
              </div>
              <p className="ef-addrline soft"><Icon name="pin" size={15} /> {chosenAddr}</p>

              <div className="kcard">
                <div className="kavatar">{k.initial}</div>
                <div className="kinfo">
                  <h3>{k.name}</h3>
                  <p><span className="kverified"><Icon name="shield" size={14} /> Verified</span> · {service.name}</p>
                  <div className="krating"><Icon name="star" size={14} /> {k.rating} <span>· {k.jobs}+ kaam</span></div>
                </div>
                <button className="kcall" onClick={() => toast('Karigar ko call ho rahi hai…')}>
                  <Icon name="phone" size={20} />
                </button>
              </div>

              <div className="steps">
                {STEP_INFO.map((si, i) => (
                  <div key={i} className={'step' + (i < step ? ' done' : i === step ? ' active' : '')}>
                    <span className="step-dot" />
                    <div className="step-text"><strong>{si.t}</strong><small>{si.s}</small></div>
                  </div>
                ))}
              </div>

              <div className="livenote"><span className="live-dot" /> {liveNote}</div>
            </div>
          </div>
        )}

        {/* ─────────── PAYMENT ─────────── */}
        {stage === 'payment' && (
          <div className="ef-sheet">
            <div className="ef-drag" />
            <div className="pay-done"><Icon name="check" size={30} /></div>
            <h2 className="ef-title center">Kaam poora ho gaya!</h2>
            <p className="ef-sub center">{k.name} · {service.name}</p>

            <div className="ef-charges">
              <div className="ef-crow"><span>Service charge</span><span>₹{svc}</span></div>
              <div className="ef-crow"><span>Visit / emergency charge</span><span>₹{VISIT_CHARGE}</span></div>
              <div className="ef-crow"><span>Tax (GST)</span><span>₹{gst}</span></div>
              <div className="ef-crow ef-ctotal"><span>Total</span><span>₹{total}</span></div>
            </div>

            <p className="ef-label">Payment kaise karein?</p>
            {[
              { id: 'online', icon: 'card', t: 'Online (UPI / Card)', s: 'GPay, PhonePe, Paytm, Card' },
              { id: 'cash',   icon: 'cash', t: 'Cash', s: 'Karigar ko haath mein dein' },
            ].map((m) => (
              <button key={m.id} className={'pay-method' + (payMethod === m.id ? ' active' : '')}
                onClick={() => setPayMethod(m.id)}>
                <span className="pm-ic"><Icon name={m.icon} size={22} /></span>
                <span className="pm-text"><strong>{m.t}</strong><small>{m.s}</small></span>
                <span className="pm-radio" />
              </button>
            ))}

            <button className="ef-cta" onClick={pay}>
              ₹{total} {payMethod === 'online' ? 'Online Pay karein' : 'Cash mein dein'}
            </button>
          </div>
        )}

        {/* ─────────── RATING ─────────── */}
        {stage === 'rating' && (
          <div className="ef-sheet center-sheet">
            <div className="ef-drag" />
            <div className="rate-avatar">{k.initial}</div>
            <h2 className="ef-title center">Karigar ko rating dein</h2>
            <p className="ef-sub center">{k.name} · {service.name}</p>

            <div className="rate-stars">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} className={'rate-star' + (n <= stars ? ' on' : '')} onClick={() => setStars(n)}>
                  <Icon name="star" size={36} />
                </button>
              ))}
            </div>
            <p className={'rate-word' + (stars ? ' filled' : '')}>{RATE_WORDS[stars]}</p>

            <div className="rate-chips">
              {['Time pe aaya', 'Achha kaam', 'Vyavhaar achha', 'Saaf-suthra', 'Uchit daam'].map((c) => (
                <button key={c} className={'rate-chip' + (chips.includes(c) ? ' on' : '')} onClick={() => toggleChip(c)}>{c}</button>
              ))}
            </div>

            <button className="ef-cta" onClick={submitRating}>Rating Submit karein</button>
            <button className="ef-skip" onClick={finish}>Abhi nahi</button>
          </div>
        )}

      </div>
    </div>
  );
}

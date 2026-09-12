import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import { useToast } from '../components/Toast';
import { useAppData } from '../store/AppData';
import { dispatchService } from '../services/dispatchService';
import KarigarWithdraw from '../components/KarigarWithdraw';
import './KarigarApp.css';

/* Fallback simulated jobs matched to the Karigar's skill */
const JOBS_BY_SKILL = {
  Electrician: [
    { service: 'Switch board repair', area: 'Indra Colony, Barmer', dist: '1.8 km', gross: 450, problem: 'Switch board sparking, 2 switches dead', customer: 'Vikram S.', phone: '+91 98290 12345' },
    { service: 'Fan installation',    area: 'Gandhi Nagar, Barmer', dist: '1.4 km', gross: 350, problem: 'New ceiling fan needs installation', customer: 'Pooja D.', phone: '+91 94141 67890' },
    { service: 'Inverter wiring',     area: 'Station Road, Barmer', dist: '2.5 km', gross: 600, problem: 'Inverter connection for 3 rooms', customer: 'Amit B.', phone: '+91 97820 11223' },
  ],
  Plumber: [
    { service: 'Tap leakage fix',     area: 'Mahaveer Park, Barmer', dist: '1.9 km', gross: 380, problem: 'Kitchen tap leaking continuously', customer: 'Sunita K.', phone: '+91 98295 44332' },
    { service: 'Bathroom fitting',    area: 'Ratanada, Barmer',      dist: '3.1 km', gross: 550, problem: 'New shower + basin fitting', customer: 'Rahul M.', phone: '+91 94142 99887' },
    { service: 'Motor repair',        area: 'Indra Colony, Barmer',  dist: '2.0 km', gross: 450, problem: 'Water motor not lifting water', customer: 'Devi L.', phone: '+91 98280 55443' },
  ],
  Carpenter: [
    { service: 'Door lock jammed',    area: 'Sadar Bazar, Barmer',   dist: '1.6 km', gross: 420, problem: 'Main door lock jammed, door stuck', customer: 'Kishan P.', phone: '+91 97822 66778' },
    { service: 'Door hinge repair',   area: 'Gandhi Nagar, Barmer',  dist: '1.2 km', gross: 380, problem: 'Godrej lock & hinge repair', customer: 'Meena J.', phone: '+91 98291 33445' },
  ],
  'AC Repair': [
    { service: 'AC gas refill',       area: 'Ratanada, Barmer',      dist: '2.8 km', gross: 1500, problem: '1.5T split AC not cooling, gas low', customer: 'Suresh G.', phone: '+91 94144 88776' },
    { service: 'AC full service',     area: 'Indra Colony, Barmer',  dist: '2.1 km', gross: 600,  problem: 'Yearly service + filter cleaning', customer: 'Nisha R.', phone: '+91 98296 22110' },
  ],
  Painter: [
    { service: 'Wall touch-up',       area: 'Sadar Bazar, Barmer',   dist: '1.5 km', gross: 800,  problem: 'Seepage patches on 2 walls', customer: 'Gopal V.', phone: '+91 97824 55667' },
    { service: 'Room painting',       area: 'Gandhi Nagar, Barmer',  dist: '2.2 km', gross: 2200, problem: '12x12 bedroom 2 coats', customer: 'Lakshmi N.', phone: '+91 98288 99001' },
  ],
  Other: [
    { service: 'General repair',      area: 'Gandhi Nagar, Barmer',  dist: '1.5 km', gross: 400, problem: 'Home hardware & electrical fix', customer: 'Asha B.', phone: '+91 98293 44556' },
  ],
};

const COMMISSION = 0.2;          // 20% emergency commission
const DEFAULT_OTP = '4829';      // demo fallback OTP
const DAILY_TARGET = 5;          // incentive: 5 jobs → ₹200 bonus
const WEEK_BARS = [62, 40, 78, 55, 90, 35, 0];

export default function KarigarApp() {
  const nav = useNavigate();
  const toast = useToast();
  const { karigar, setKarigarOnline, karigarCompleteJob, karigarWithdraw, updateKarigar, logout } = useAppData();

  const [tab, setTab] = useState('home');           // home | orders | earnings | profile
  const [showWithdraw, setShowWithdraw] = useState(false); // dedicated withdrawal view
  const [incoming, setIncoming] = useState(null);   // job offer popup
  const [secs, setSecs] = useState(30);
  const [job, setJob] = useState(null);             // active job
  const [stage, setStage] = useState('navigate');   // navigate | otp | working | bill
  const [otp, setOtp] = useState('');

  const offerTimer = useRef();
  const countTimer = useRef();
  const karigarFileInputRef = useRef(null);

  const k = karigar || {};
  const pool = JOBS_BY_SKILL[k.skill] || JOBS_BY_SKILL.Other;

  const handleKarigarPhotoSelect = (e) => {
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
        updateKarigar({ avatar: optimized });
        toast('Captain profile photo updated from gallery!');
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  // ── Listen for Real-Time Dispatch Bookings from Customer App ──
  useEffect(() => {
    const handleIncomingTrip = (trip) => {
      if (!k.online || job || incoming) return;
      if (trip && trip.status === 'searching') {
        const gross = (trip.baseCharge || 350) + (trip.visitCharge || 99);
        const jobData = {
          tripId: trip.id,
          service: trip.service,
          area: trip.customer?.address || 'Barmer',
          dist: '1.5 km',
          gross,
          problem: trip.customer?.problem || 'Emergency repair',
          customer: trip.customer?.name || 'Customer',
          phone: trip.customer?.phone || '+91 98765 43210',
          otp: trip.otp || DEFAULT_OTP,
        };

        setIncoming(jobData);
        setSecs(30);
        dispatchService.playAlertTone();
      }
    };

    // Check existing active trip on mount or status change
    const initialTrip = dispatchService.getActiveTrip();
    if (initialTrip && initialTrip.status === 'searching' && k.online && !job && !incoming) {
      handleIncomingTrip(initialTrip);
    }

    const unsubscribe = dispatchService.subscribe((event) => {
      if (event.type === 'TRIP_UPDATED') {
        handleIncomingTrip(event.trip);
      }
    });

    return () => {
      unsubscribe();
      dispatchService.stopAlertTone();
    };
  }, [k.online, job, incoming]);

  // Offer countdown timer (30 seconds)
  useEffect(() => {
    if (!incoming) return;
    if (secs <= 0) {
      dispatchService.stopAlertTone();
      setIncoming(null);
      toast('Job request expired');
      return;
    }
    countTimer.current = setTimeout(() => setSecs((s) => s - 1), 1000);
    return () => clearTimeout(countTimer.current);
  }, [incoming, secs]);

  const net = (g) => Math.round(g * (1 - COMMISSION));

  // Karigar accepts the job
  function accept() {
    dispatchService.stopAlertTone();
    if (incoming.tripId) {
      dispatchService.acceptBooking(incoming.tripId, k);
    }
    setJob(incoming);
    setIncoming(null);
    setStage('navigate');
    setTab('home');
    toast('✓ Job Accepted — Customer ko live status update ho gaya');
  }

  // Karigar skips the job
  function reject() {
    dispatchService.stopAlertTone();
    setIncoming(null);
    toast('Request skipped');
  }

  // Karigar arrives at customer doorstep
  function handleArrived() {
    if (job?.tripId) {
      dispatchService.updateTripStatus(job.tripId, 'arrived');
    }
    setStage('otp');
    toast('📍 Arrived at Customer doorstep — Ask for 4-digit OTP');
  }

  // Verify Customer OTP & start work
  function verifyOtp() {
    const targetOtp = job?.otp || DEFAULT_OTP;
    if (otp !== targetOtp) {
      toast(`Wrong OTP — Customer se OTP maangein (Demo OTP: ${targetOtp})`);
      return;
    }
    if (job?.tripId) {
      dispatchService.updateTripStatus(job.tripId, 'working');
    }
    setOtp('');
    setStage('working');
    toast('✓ OTP Verified — Work started!');
  }

  // Complete work & generate bill
  function collect(mode) {
    if (job?.tripId) {
      dispatchService.updateTripStatus(job.tripId, 'completed', { payMode: mode });
    }
    karigarCompleteJob(job, job.gross, net(job.gross), mode);
    toast(`✓ Job complete — ₹${net(job.gross)} aapke wallet mein add hua`);
    setJob(null);
    setStage('navigate');
  }

  // Toggle online/offline
  function toggleOnline(val) {
    if (!val) {
      dispatchService.stopAlertTone();
      setIncoming(null);
    }
    setKarigarOnline(val);
  }

  const targetPct = Math.min(((k.jobsDone || 0) / DAILY_TARGET) * 100, 100);

  /* ───────────────── TABS CONTENT ───────────────── */

  const HomeTab = (
    <>
      {/* online toggle */}
      <button className={'ka-toggle' + (k.online ? ' on' : '')} onClick={() => toggleOnline(!k.online)}>
        <span className="ka-toggle-knob" />
        <span className="ka-toggle-label">{k.online ? 'ONLINE — Receiving Rapido Job Requests' : 'OFFLINE — Tap to go Online'}</span>
      </button>

      {/* today stats */}
      <div className="ka-stats">
        <div className="ka-stat"><strong>₹{k.todayEarn || 0}</strong><small>Today</small></div>
        <div className="ka-stat"><strong>{k.jobsDone || 0}</strong><small>Jobs</small></div>
        <div className="ka-stat"><strong>{(k.rating || 5).toFixed(1)}★</strong><small>Rating</small></div>
        <div className="ka-stat"><strong>₹{k.balance || 0}</strong><small>Wallet</small></div>
      </div>

      {/* incentive card */}
      <div className="ka-incentive">
        <div className="ka-inc-head">
          <span className="ka-inc-ic"><Icon name="medal" size={18} /></span>
          <div>
            <strong>Daily Bonus — ₹200</strong>
            <small>Complete {DAILY_TARGET} jobs today ({Math.min(k.jobsDone || 0, DAILY_TARGET)}/{DAILY_TARGET} done)</small>
          </div>
        </div>
        <div className="ka-inc-bar"><span style={{ width: `${targetPct}%` }} /></div>
      </div>

      {/* active job / waiting / offline */}
      {job ? (
        <div className="ka-active">
          <div className="ka-active-head">
            <span className="ka-active-tag">
              {stage === 'navigate' ? 'GO TO CUSTOMER' : stage === 'otp' ? 'ARRIVED — VERIFY OTP' : stage === 'working' ? 'WORK IN PROGRESS' : 'COLLECT PAYMENT'}
            </span>
            <span className="ka-active-earn">You earn <b>₹{net(job.gross)}</b></span>
          </div>
          <h3>{job.service}</h3>
          <p className="ka-active-prob">"{job.problem}"</p>

          <div className="ka-active-rows">
            <div><Icon name="user" size={15} /> {job.customer}</div>
            <div><Icon name="pin" size={15} /> {job.area} · {job.dist}</div>
            <div><Icon name="phone" size={15} /> {job.phone}</div>
          </div>

          {/* stage progress */}
          <div className="ka-progress">
            {['navigate', 'otp', 'working', 'bill'].map((s, i) => {
              const order = ['navigate', 'otp', 'working', 'bill'].indexOf(stage);
              return <div key={s} className={'ka-prog-step' + (i <= order ? ' on' : '')} />;
            })}
          </div>

          {stage === 'navigate' && (
            <>
              <div className="ka-btn-row">
                <a href={`https://maps.google.com/?q=${encodeURIComponent(job.area)}`} target="_blank" rel="noreferrer" className="ka-secondary">
                  <Icon name="navigate" size={16} /> Map Navigation
                </a>
                <a href={`tel:${job.phone}`} className="ka-secondary">
                  <Icon name="phone" size={16} /> Call Customer
                </a>
              </div>
              <button className="ka-action" onClick={handleArrived}>
                📍 I Have Arrived at Doorstep
              </button>
            </>
          )}

          {stage === 'otp' && (
            <>
              <p className="ka-otp-note">
                <Icon name="key" size={14} /> Ask Customer for 4-Digit Job Start OTP:
              </p>
              <input
                className="ka-otp-input"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="• • • •"
                inputMode="numeric"
                autoFocus
              />
              <button className="ka-action" onClick={verifyOtp}>
                Verify OTP &amp; Start Work
              </button>
            </>
          )}

          {stage === 'working' && (
            <>
              <div className="ka-working-note">
                <span className="ka-working-dot" /> Work in progress — Complete repair, then generate final bill
              </div>
              <button className="ka-action" onClick={() => setStage('bill')}>
                ✓ Work Done — Generate Final Bill
              </button>
            </>
          )}

          {stage === 'bill' && (
            <>
              <div className="ka-bill">
                <div className="ka-bill-row"><span>Gross Service Charge</span><span>₹{job.gross}</span></div>
                <div className="ka-bill-row deduct"><span>SARVOTTAM Commission (20%)</span><span>− ₹{job.gross - net(job.gross)}</span></div>
                <div className="ka-bill-row total"><span>Your Net Earning</span><span>₹{net(job.gross)}</span></div>
              </div>
              <div className="ka-btn-row">
                <button className="ka-collect cash" onClick={() => collect('cash')}>
                  <Icon name="cash" size={17} /> Collected ₹{job.gross} Cash
                </button>
                <button className="ka-collect online" onClick={() => collect('online')}>
                  <Icon name="card" size={17} /> Customer Paid Online
                </button>
              </div>
            </>
          )}
        </div>
      ) : k.online ? (
        <div className="ka-waiting">
          <div className="ka-radar"><span /><span /><span /><Icon name="bolt" size={28} /></div>
          <h3>Finding {k.skill || 'Emergency'} jobs in Barmer…</h3>
          <p>Stay online — Customer emergency bookings will ring here with sound alert!</p>
        </div>
      ) : (
        <div className="ka-offline">
          <div className="ka-offline-ic"><Icon name="wrench" size={28} /></div>
          <h3>You are Offline</h3>
          <p>Go online to receive {k.skill || ''} job requests in {k.area || 'Barmer'}</p>
        </div>
      )}
    </>
  );

  const OrdersTab = (
    <div className="ka-orders">
      {(k.history || []).length === 0 && (
        <div className="ka-empty">
          <Icon name="history" size={30} />
          <p>No completed jobs yet.<br />Go online to start earning!</p>
        </div>
      )}
      {(k.history || []).map((h) => (
        <div className="ka-order" key={h.id}>
          <div className="ka-order-ic"><Icon name="check" size={17} /></div>
          <div className="ka-order-info">
            <strong>{h.service}</strong>
            <small>{h.area} · {h.date}</small>
            <span className="ka-order-mode">{h.payMode === 'cash' ? 'Cash collected' : 'Paid online'} · <Icon name="star" size={10} /> 5.0★</span>
          </div>
          <div className="ka-order-amt">
            <strong>+₹{h.net}</strong>
            <small>of ₹{h.gross}</small>
          </div>
        </div>
      ))}
    </div>
  );

  const EarningsTab = (
    <div className="ka-earnings">
      <div className="ka-earn-card">
        <small>Available Balance in Wallet</small>
        <h2>₹{(k.balance !== undefined ? k.balance : 1450).toLocaleString('en-IN')}</h2>
        <button
          type="button"
          className="ka-withdraw"
          onClick={() => setShowWithdraw(true)}
        >
          <Icon name="rupee" size={15} /> Withdrawal
        </button>
      </div>

      <h3 className="ka-tab-title">This Week Earning</h3>
      <div className="ka-chart">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <div className="ka-bar-col" key={i}>
            <div className="ka-bar"><span style={{ height: `${i === 6 ? Math.min((k.todayEarn || 0) / 10, 100) : WEEK_BARS[i]}%` }} /></div>
            <small>{d}</small>
          </div>
        ))}
      </div>

      <div className="ka-earn-rows">
        <div className="ka-earn-row"><span><Icon name="clock" size={15} /> Today Earning</span><strong>₹{k.todayEarn || 0}</strong></div>
        <div className="ka-earn-row"><span><Icon name="chart" size={15} /> Total Lifetime Earning</span><strong>₹{k.totalEarn || 0}</strong></div>
        <div className="ka-earn-row"><span><Icon name="check" size={15} /> Jobs Completed</span><strong>{k.jobsDone || 0}</strong></div>
        <div className="ka-earn-row"><span><Icon name="medal" size={15} /> Sarvottam Commission</span><strong>20%</strong></div>
      </div>
    </div>
  );

  const ProfileTab = (
    <div className="ka-profile">
      <input
        type="file"
        ref={karigarFileInputRef}
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleKarigarPhotoSelect}
      />

      <div className="ka-prof-card">
        <div
          className="ka-prof-avatar-wrap"
          onClick={() => karigarFileInputRef.current?.click()}
          title="Upload photo from gallery"
          role="button"
          tabIndex={0}
        >
          {k.avatar ? (
            <img src={k.avatar} alt={k.name} className="ka-prof-avatar-img" />
          ) : (
            <div className="ka-prof-avatar">{(k.name || 'K')[0]}</div>
          )}
          <span className="ka-avatar-badge" title="Change photo">
            <Icon name="camera" size={13} />
          </span>
        </div>
        <div className="ka-prof-info">
          <div className="ka-prof-name-row">
            <h3>{k.name || 'Karigar Captain'}</h3>
            <span className="ka-locked-pill" title="Captain name cannot be changed">
              <Icon name="lock" size={11} /> Locked
            </span>
          </div>
          <p>{k.skill} · {k.area}</p>
          <span className="ka-prof-rating"><Icon name="star" size={12} /> {(k.rating || 5).toFixed(1)} Rating</span>
          <button
            type="button"
            className="ka-upload-btn"
            onClick={() => karigarFileInputRef.current?.click()}
          >
            <Icon name="camera" size={13} /> {k.avatar ? 'Change Gallery Photo' : 'Upload Photo from Gallery'}
          </button>
        </div>
      </div>

      <div className="ka-prof-rows">
        <div className="ka-prof-row">
          <span><Icon name="shield" size={16} /> Verification Status</span>
          <b className="ok">Verified Partner</b>
        </div>
        <div className="ka-prof-row">
          <span><Icon name="user" size={16} /> Captain Name</span>
          <b className="locked-val">{k.name || 'Karigar Captain'} <Icon name="lock" size={11} /></b>
        </div>
        <div className="ka-prof-row">
          <span><Icon name="phone" size={16} /> Registered Phone</span>
          <b className="locked-val">{k.phone ? `+91 ${k.phone}` : '+91 94140 12345'} <Icon name="lock" size={11} /></b>
        </div>
        <div className="ka-prof-row">
          <span><Icon name="mail" size={16} /> Registered Email</span>
          <b className="locked-val">{k.email || 'partner@sarvottam.in'} <Icon name="lock" size={11} /></b>
        </div>
        <div className="ka-prof-row">
          <span><Icon name="wrench" size={16} /> Registered Skill</span>
          <b>{k.skill || 'Electrician'}</b>
        </div>
        <div className="ka-prof-row">
          <span><Icon name="pin" size={16} /> Operational Area</span>
          <b>{k.area || 'Barmer'}</b>
        </div>
        <div className="ka-prof-row">
          <span><Icon name="clock" size={16} /> Work Experience</span>
          <b>{k.exp ? `${k.exp} yrs` : '5+ yrs'}</b>
        </div>
      </div>

      <div className="ka-lock-notice">
        <Icon name="lock" size={15} />
        <span>Captain Name, registered Phone Number, and Email are verified and strictly locked by SARVOTTAM operations desk for compliance &amp; background verification.</span>
      </div>

      <button className="ka-prof-help" onClick={() => toast('Partner Support: 1800-123-456')}>
        <Icon name="headset" size={17} /> Partner Support (24×7)
      </button>
      <button className="ka-prof-logout" onClick={() => { logout(); nav('/login'); }}>Log Out</button>
    </div>
  );

  /* ───────────────── RENDER ───────────────── */
  return (
    <div className="ka-screen">
      {/* ── HEADER SWITCHING BY TAB ── */}
      {tab === 'home' && (
        <div className="ka-header">
          <div className="ka-head-row">
            <div className="ka-avatar-box">
              {k.avatar ? (
                <img src={k.avatar} alt={k.name} className="ka-avatar-img" />
              ) : (
                <div className="ka-avatar">{(k.name || 'K')[0]}</div>
              )}
            </div>
            <div className="ka-head-info">
              <h2>{k.name || 'Karigar Captain'}</h2>
              <p>{k.skill || 'Electrician'} · {k.area || 'Barmer'}</p>
            </div>
            <span className={'ka-status-pill' + (k.online ? ' on' : '')}>
              {k.online ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>
        </div>
      )}

      {tab === 'orders' && (
        <div className="ka-clean-header">
          <h1 className="ka-clean-title">Order History</h1>
          <p className="ka-clean-sub">Completed jobs and doorstep service records</p>
        </div>
      )}

      {tab === 'earnings' && (
        <div className="ka-clean-header">
          <h1 className="ka-clean-title">Earnings</h1>
          <p className="ka-clean-sub">Wallet balance, withdrawal &amp; payout summary</p>
        </div>
      )}

      {tab === 'profile' && (
        <div className="ka-clean-header">
          <h1 className="ka-clean-title">Captain Profile</h1>
          <p className="ka-clean-sub">Verified partner identity &amp; account settings</p>
        </div>
      )}

      {/* body */}
      <div className="ka-body">
        {tab === 'home' && HomeTab}
        {tab === 'orders' && OrdersTab}
        {tab === 'earnings' && EarningsTab}
        {tab === 'profile' && ProfileTab}
      </div>

      {/* internal tab bar */}
      <nav className="ka-tabs">
        {[
          { id: 'home',     icon: 'home',    label: 'Home' },
          { id: 'orders',   icon: 'history', label: 'Orders' },
          { id: 'earnings', icon: 'chart',   label: 'Earnings' },
          { id: 'profile',  icon: 'user',    label: 'Profile' },
        ].map((t) => (
          <button key={t.id} className={'ka-tab' + (tab === t.id ? ' active' : '')} onClick={() => setTab(t.id)}>
            <Icon name={t.icon} size={20} />
            <span>{t.label}</span>
          </button>
        ))}
      </nav>

      {/* Incoming Rapido-Style Job Alert Modal with Sound */}
      {incoming && (
        <div className="ka-offer-overlay">
          <div className="ka-offer">
            <div className="ka-offer-timer">{secs}s</div>
            <span className="ka-offer-tag">⚡ NEW EMERGENCY REQUEST</span>
            <h2>{incoming.service}</h2>
            <p className="ka-offer-prob">"{incoming.problem}"</p>

            <div className="ka-offer-rows">
              <div><Icon name="user" size={15} /> <strong>{incoming.customer}</strong></div>
              <div><Icon name="pin" size={15} /> {incoming.area} · <strong>{incoming.dist}</strong> away</div>
              <div><Icon name="phone" size={15} /> {incoming.phone}</div>
              <div className="ka-offer-pay">
                <Icon name="rupee" size={15} /> You Earn: <b>₹{net(incoming.gross)}</b> <small>(after 20% commission)</small>
              </div>
            </div>

            <div className="ka-offer-btns">
              <button className="ka-reject" onClick={reject}>Skip</button>
              <button className="ka-accept" onClick={accept}>⚡ Accept Job</button>
            </div>
          </div>
        </div>
      )}

      {/* Dedicated Withdrawal Screen */}
      {showWithdraw && (
        <KarigarWithdraw onBack={() => setShowWithdraw(false)} />
      )}
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import { useToast } from '../components/Toast';
import { useAppData } from '../store/AppData';
import './KarigarApp.css';

/* Jobs matched to the Karigar's skill (no more plumber jobs for electricians) */
const JOBS_BY_SKILL = {
  Electrician: [
    { service: 'Switch board repair', area: 'Indra Colony, Barmer', dist: '2.1 km', gross: 450, problem: 'Switch board sparking, 2 switches dead', customer: 'Vikram S.' },
    { service: 'Fan installation',    area: 'Gandhi Nagar, Barmer', dist: '1.6 km', gross: 350, problem: 'New ceiling fan needs installation', customer: 'Pooja D.' },
    { service: 'Inverter wiring',     area: 'Station Road, Barmer', dist: '3.2 km', gross: 600, problem: 'Inverter connection for 3 rooms', customer: 'Amit B.' },
  ],
  Plumber: [
    { service: 'Tap leakage fix',     area: 'Mahaveer Park, Barmer', dist: '1.9 km', gross: 380, problem: 'Kitchen tap leaking continuously', customer: 'Sunita K.' },
    { service: 'Bathroom fitting',    area: 'Ratanada, Barmer',      dist: '3.5 km', gross: 550, problem: 'New shower + basin fitting', customer: 'Rahul M.' },
    { service: 'Motor repair',        area: 'Indra Colony, Barmer',  dist: '2.4 km', gross: 450, problem: 'Water motor not lifting water', customer: 'Devi L.' },
  ],
  Carpenter: [
    { service: 'Door hinge repair',   area: 'Sadar Bazar, Barmer',   dist: '2.0 km', gross: 420, problem: 'Main door hinge broken, door stuck', customer: 'Kishan P.' },
    { service: 'Lock replacement',    area: 'Gandhi Nagar, Barmer',  dist: '1.4 km', gross: 380, problem: 'Godrej lock jammed, need new one', customer: 'Meena J.' },
    { service: 'Bed assembly',        area: 'Station Road, Barmer',  dist: '2.8 km', gross: 600, problem: 'New double bed needs assembly', customer: 'Arjun T.' },
  ],
  'AC Repair': [
    { service: 'AC gas refill',       area: 'Ratanada, Barmer',      dist: '3.0 km', gross: 1500, problem: '1.5T split AC not cooling, gas low', customer: 'Suresh G.' },
    { service: 'AC full service',     area: 'Indra Colony, Barmer',  dist: '2.2 km', gross: 600,  problem: 'Yearly service + filter cleaning', customer: 'Nisha R.' },
    { service: 'AC installation',     area: 'Mahaveer Park, Barmer', dist: '2.7 km', gross: 1200, problem: 'New window AC installation', customer: 'Farhan A.' },
  ],
  Painter: [
    { service: 'Wall touch-up',       area: 'Sadar Bazar, Barmer',   dist: '1.8 km', gross: 800,  problem: 'Seepage patches on 2 walls', customer: 'Gopal V.' },
    { service: 'One-room painting',   area: 'Gandhi Nagar, Barmer',  dist: '2.3 km', gross: 2500, problem: '12x12 bedroom, 2 coats', customer: 'Lakshmi N.' },
    { service: 'Door polish',         area: 'Station Road, Barmer',  dist: '3.1 km', gross: 900,  problem: '3 wooden doors need polish', customer: 'Imran S.' },
  ],
  Other: [
    { service: 'TV wall mounting',    area: 'Indra Colony, Barmer',  dist: '2.0 km', gross: 400, problem: '43-inch TV wall mount', customer: 'Ravi K.' },
    { service: 'General repair',      area: 'Gandhi Nagar, Barmer',  dist: '1.7 km', gross: 350, problem: 'Curtain rods + small fixes', customer: 'Asha B.' },
  ],
};

const COMMISSION = 0.2;          // 20% emergency commission (per business plan)
const START_OTP = '4321';        // demo job-start OTP (customer ke paas hota hai)
const DAILY_TARGET = 5;          // incentive: 5 jobs → ₹200 bonus

const WEEK_BARS = [62, 40, 78, 55, 90, 35, 0]; // demo weekly earning bars (%)

export default function KarigarApp() {
  const nav = useNavigate();
  const toast = useToast();
  const { karigar, setKarigarOnline, karigarCompleteJob, karigarWithdraw, logout } = useAppData();

  const [tab, setTab] = useState('home');           // home | orders | earnings | profile
  const [incoming, setIncoming] = useState(null);   // job offer popup
  const [secs, setSecs] = useState(25);
  const [job, setJob] = useState(null);             // active job
  const [stage, setStage] = useState('navigate');   // navigate | otp | working | bill
  const [otp, setOtp] = useState('');

  const offerTimer = useRef();
  const countTimer = useRef();

  const k = karigar || {};
  const pool = JOBS_BY_SKILL[k.skill] || JOBS_BY_SKILL.Other;

  /* online + free → naya job offer aata hai */
  useEffect(() => {
    clearTimeout(offerTimer.current);
    if (k.online && !incoming && !job) {
      offerTimer.current = setTimeout(() => {
        setIncoming(pool[Math.floor(Math.random() * pool.length)]);
        setSecs(25);
      }, 3000);
    }
    return () => clearTimeout(offerTimer.current);
  }, [k.online, incoming, job]);

  /* offer countdown */
  useEffect(() => {
    if (!incoming) return;
    if (secs <= 0) { setIncoming(null); toast('Request expired'); return; }
    countTimer.current = setTimeout(() => setSecs((s) => s - 1), 1000);
    return () => clearTimeout(countTimer.current);
  }, [incoming, secs]);

  const net = (g) => Math.round(g * (1 - COMMISSION));

  function accept() {
    setJob(incoming);
    setIncoming(null);
    setStage('navigate');
    setTab('home');
    toast('Job accepted — navigate to customer');
  }

  function verifyOtp() {
    if (otp !== START_OTP) { toast(`Wrong OTP — ask customer (demo: ${START_OTP})`); return; }
    setOtp('');
    setStage('working');
    toast('OTP verified — work started');
  }

  function collect(mode) {
    karigarCompleteJob(job, job.gross, net(job.gross), mode);
    toast(`Job complete — ₹${net(job.gross)} added · Customer rated you 5★`);
    setJob(null);
    setStage('navigate');
  }

  const todayJobs = (k.history || []).length ? Math.min(k.jobsDone || 0, DAILY_TARGET) : (k.jobsDone || 0);
  const targetPct = Math.min(((k.jobsDone || 0) / DAILY_TARGET) * 100, 100);

  /* ───────────────── TABS CONTENT ───────────────── */

  const HomeTab = (
    <>
      {/* online toggle */}
      <button className={'ka-toggle' + (k.online ? ' on' : '')} onClick={() => setKarigarOnline(!k.online)}>
        <span className="ka-toggle-knob" />
        <span className="ka-toggle-label">{k.online ? 'ONLINE — receiving job requests' : 'OFFLINE — tap to go online'}</span>
      </button>

      {/* today stats */}
      <div className="ka-stats">
        <div className="ka-stat"><strong>₹{k.todayEarn || 0}</strong><small>Today</small></div>
        <div className="ka-stat"><strong>{k.jobsDone || 0}</strong><small>Jobs</small></div>
        <div className="ka-stat"><strong>{(k.rating || 5).toFixed(1)}</strong><small>Rating</small></div>
        <div className="ka-stat"><strong>₹{k.balance || 0}</strong><small>Balance</small></div>
      </div>

      {/* incentive — goal gradient (Rapido-style) */}
      <div className="ka-incentive">
        <div className="ka-inc-head">
          <span className="ka-inc-ic"><Icon name="medal" size={18} /></span>
          <div>
            <strong>Daily bonus — ₹200</strong>
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
                <button className="ka-secondary" onClick={() => toast('Opening navigation…')}><Icon name="navigate" size={16} /> Navigate</button>
                <button className="ka-secondary" onClick={() => toast('Calling customer…')}><Icon name="phone" size={16} /> Call</button>
              </div>
              <button className="ka-action" onClick={() => setStage('otp')}>I have arrived</button>
            </>
          )}

          {stage === 'otp' && (
            <>
              <p className="ka-otp-note"><Icon name="key" size={14} /> Ask the customer for the job-start OTP <b>(demo: {START_OTP})</b></p>
              <input
                className="ka-otp-input"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="• • • •"
                inputMode="numeric"
              />
              <button className="ka-action" onClick={verifyOtp}>Verify OTP &amp; Start Work</button>
            </>
          )}

          {stage === 'working' && (
            <>
              <div className="ka-working-note">
                <span className="ka-working-dot" /> Work in progress — complete the job, then generate the bill
              </div>
              <button className="ka-action" onClick={() => setStage('bill')}>Work done — Generate bill</button>
            </>
          )}

          {stage === 'bill' && (
            <>
              <div className="ka-bill">
                <div className="ka-bill-row"><span>Service charge</span><span>₹{job.gross}</span></div>
                <div className="ka-bill-row deduct"><span>SARVOTTAM commission (20%)</span><span>− ₹{job.gross - net(job.gross)}</span></div>
                <div className="ka-bill-row total"><span>Your earning</span><span>₹{net(job.gross)}</span></div>
              </div>
              <div className="ka-btn-row">
                <button className="ka-collect cash" onClick={() => collect('cash')}><Icon name="cash" size={17} /> Collected ₹{job.gross} cash</button>
                <button className="ka-collect online" onClick={() => collect('online')}><Icon name="card" size={17} /> Paid online</button>
              </div>
            </>
          )}
        </div>
      ) : k.online ? (
        <div className="ka-waiting">
          <div className="ka-radar"><span /><span /><span /><Icon name="wrench" size={26} /></div>
          <h3>Finding {k.skill} jobs near you…</h3>
          <p>Stay online — nearby requests will appear here</p>
        </div>
      ) : (
        <div className="ka-offline">
          <div className="ka-offline-ic"><Icon name="wrench" size={28} /></div>
          <h3>You are offline</h3>
          <p>Go online to receive {k.skill || ''} job requests in {k.area || 'your area'}</p>
        </div>
      )}
    </>
  );

  const OrdersTab = (
    <div className="ka-orders">
      <h3 className="ka-tab-title">Order history</h3>
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
            <span className="ka-order-mode">{h.payMode === 'cash' ? 'Cash collected' : 'Paid online'} · <Icon name="star" size={10} /> {h.rating}.0</span>
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
        <small>Available balance</small>
        <h2>₹{k.balance || 0}</h2>
        <button
          className="ka-withdraw"
          onClick={() => {
            if (!k.balance) { toast('No balance to withdraw'); return; }
            karigarWithdraw();
            toast('Withdrawal requested — reaches your bank in 24h');
          }}>
          <Icon name="rupee" size={15} /> Withdraw to bank
        </button>
      </div>

      <h3 className="ka-tab-title">This week</h3>
      <div className="ka-chart">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <div className="ka-bar-col" key={i}>
            <div className="ka-bar"><span style={{ height: `${i === 6 ? Math.min((k.todayEarn || 0) / 10, 100) : WEEK_BARS[i]}%` }} /></div>
            <small>{d}</small>
          </div>
        ))}
      </div>

      <div className="ka-earn-rows">
        <div className="ka-earn-row"><span><Icon name="clock" size={15} /> Today</span><strong>₹{k.todayEarn || 0}</strong></div>
        <div className="ka-earn-row"><span><Icon name="chart" size={15} /> Total earned</span><strong>₹{k.totalEarn || 0}</strong></div>
        <div className="ka-earn-row"><span><Icon name="check" size={15} /> Jobs completed</span><strong>{k.jobsDone || 0}</strong></div>
        <div className="ka-earn-row"><span><Icon name="medal" size={15} /> Commission rate</span><strong>20%</strong></div>
      </div>
    </div>
  );

  const ProfileTab = (
    <div className="ka-profile">
      <div className="ka-prof-card">
        <div className="ka-prof-avatar">{(k.name || 'K')[0]}</div>
        <div>
          <h3>{k.name}</h3>
          <p>{k.skill} · {k.area}</p>
          <span className="ka-prof-rating"><Icon name="star" size={12} /> {(k.rating || 5).toFixed(1)} rating</span>
        </div>
      </div>

      <div className="ka-prof-rows">
        <div className="ka-prof-row"><span><Icon name="shield" size={16} /> ID verification</span><b className="ok">Verified</b></div>
        <div className="ka-prof-row"><span><Icon name="wrench" size={16} /> Skill</span><b>{k.skill || '—'}</b></div>
        <div className="ka-prof-row"><span><Icon name="pin" size={16} /> Service area</span><b>{k.area || '—'}</b></div>
        <div className="ka-prof-row"><span><Icon name="clock" size={16} /> Experience</span><b>{k.exp ? `${k.exp} yrs` : '—'}</b></div>
        <div className="ka-prof-row"><span><Icon name="phone" size={16} /> Phone</span><b>+91 {k.phone}</b></div>
      </div>

      <button className="ka-prof-help" onClick={() => toast('Partner support: 1800-123-456')}>
        <Icon name="headset" size={17} /> Partner support
      </button>
      <button className="ka-prof-logout" onClick={() => { logout(); nav('/login'); }}>Log out</button>
    </div>
  );

  /* ───────────────── RENDER ───────────────── */
  return (
    <div className="ka-screen">
      {/* header */}
      <div className="ka-header">
        <div className="ka-head-row">
          <div className="ka-avatar">{(k.name || 'K')[0]}</div>
          <div className="ka-head-info">
            <h2>{k.name}</h2>
            <p>{k.skill} · {k.area}</p>
          </div>
          <span className={'ka-status-pill' + (k.online ? ' on' : '')}>{k.online ? 'ONLINE' : 'OFFLINE'}</span>
        </div>
      </div>

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

      {/* incoming job offer */}
      {incoming && (
        <div className="ka-offer-overlay">
          <div className="ka-offer">
            <div className="ka-offer-timer">{secs}s</div>
            <span className="ka-offer-tag">NEW {String(k.skill || 'JOB').toUpperCase()} REQUEST</span>
            <h2>{incoming.service}</h2>
            <p className="ka-offer-prob">"{incoming.problem}"</p>
            <div className="ka-offer-rows">
              <div><Icon name="user" size={15} /> {incoming.customer}</div>
              <div><Icon name="pin" size={15} /> {incoming.area} · {incoming.dist} away</div>
              <div className="ka-offer-pay"><Icon name="rupee" size={15} /> You earn <b>₹{net(incoming.gross)}</b> <small>(after 20% commission)</small></div>
            </div>
            <div className="ka-offer-btns">
              <button className="ka-reject" onClick={() => { setIncoming(null); toast('Request skipped'); }}>Skip</button>
              <button className="ka-accept" onClick={accept}>Accept job</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

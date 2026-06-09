import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import { useToast } from '../components/Toast';
import { useAppData } from '../store/AppData';
import './KarigarApp.css';

// demo incoming jobs (rotates)
const JOB_POOL = [
  { service: 'Electrician', area: 'Indra Colony, Barmer', dist: '2.1 km', pay: 425, problem: 'Switch board not working' },
  { service: 'Plumber',     area: 'Station Road, Barmer', dist: '3.4 km', pay: 380, problem: 'Tap leakage in kitchen' },
  { service: 'AC Repair',   area: 'Gandhi Nagar, Barmer', dist: '1.8 km', pay: 640, problem: 'AC not cooling' },
  { service: 'Carpenter',   area: 'Mahaveer Park, Barmer',dist: '4.0 km', pay: 470, problem: 'Door hinge broken' },
];

export default function KarigarApp() {
  const nav = useNavigate();
  const toast = useToast();
  const { karigar, setKarigarOnline, karigarCompleteJob, logout } = useAppData();

  const [incoming, setIncoming] = useState(null);  // job offer popup
  const [activeJob, setActiveJob] = useState(null); // accepted job in progress
  const [jobStep, setJobStep] = useState(0);        // 0 reached, 1 working, 2 done
  const [secs, setSecs] = useState(20);
  const jobTimer = useRef();
  const offerTimer = useRef();

  const k = karigar || {};

  // When online, periodically send a job offer (if free)
  useEffect(() => {
    clearTimeout(offerTimer.current);
    if (k.online && !incoming && !activeJob) {
      offerTimer.current = setTimeout(() => {
        setIncoming(JOB_POOL[Math.floor(Math.random() * JOB_POOL.length)]);
        setSecs(20);
      }, 2500);
    }
    return () => clearTimeout(offerTimer.current);
  }, [k.online, incoming, activeJob]);

  // countdown for the incoming offer
  useEffect(() => {
    if (!incoming) return;
    if (secs <= 0) { rejectJob(); return; }
    jobTimer.current = setTimeout(() => setSecs((s) => s - 1), 1000);
    return () => clearTimeout(jobTimer.current);
  }, [incoming, secs]);

  function acceptJob() {
    setActiveJob(incoming);
    setIncoming(null);
    setJobStep(0);
    toast('Job accepted — head to the customer');
  }
  function rejectJob() {
    setIncoming(null);
    toast('Job skipped');
  }
  function advanceJob() {
    if (jobStep < 2) { setJobStep((s) => s + 1); return; }
    // done
    karigarCompleteJob(activeJob.pay);
    toast(`Job complete — ₹${activeJob.pay} added to earnings`);
    setActiveJob(null);
    setJobStep(0);
  }

  const STEP_LABELS = ['I have reached', 'Start work', 'Mark complete'];

  return (
    <div className="ka-screen">
      {/* Header */}
      <div className="ka-header">
        <div className="ka-head-row">
          <div className="ka-avatar">{(k.name || 'K')[0]}</div>
          <div className="ka-head-info">
            <h2>{k.name}</h2>
            <p>{k.skill} · {k.area}</p>
          </div>
          <button className="ka-logout" onClick={() => { logout(); nav('/login'); }}><Icon name="back" size={16} /></button>
        </div>

        {/* Online toggle */}
        <button className={'ka-toggle' + (k.online ? ' on' : '')} onClick={() => setKarigarOnline(!k.online)}>
          <span className="ka-toggle-knob" />
          <span className="ka-toggle-label">{k.online ? "You're ONLINE — getting jobs" : "You're OFFLINE — tap to go online"}</span>
        </button>
      </div>

      {/* Earnings */}
      <div className="ka-stats">
        <div className="ka-stat"><strong>₹{k.todayEarn || 0}</strong><small>Today</small></div>
        <div className="ka-stat"><strong>₹{k.totalEarn || 0}</strong><small>Total</small></div>
        <div className="ka-stat"><strong>{k.jobsDone || 0}</strong><small>Jobs</small></div>
        <div className="ka-stat"><strong>{(k.rating || 5).toFixed(1)}★</strong><small>Rating</small></div>
      </div>

      {/* Active job OR waiting state */}
      <div className="ka-body">
        {activeJob ? (
          <div className="ka-active">
            <span className="ka-active-tag">ACTIVE JOB</span>
            <h3>{activeJob.service}</h3>
            <p className="ka-active-prob">{activeJob.problem}</p>
            <div className="ka-active-row"><Icon name="pin" size={16} /> {activeJob.area} · {activeJob.dist}</div>
            <div className="ka-active-row"><Icon name="card" size={16} /> You earn <b>₹{activeJob.pay}</b></div>

            <div className="ka-progress">
              {['Reached', 'Working', 'Done'].map((s, i) => (
                <div key={i} className={'ka-prog-step' + (i <= jobStep ? ' on' : '')}><span /></div>
              ))}
            </div>

            <button className="ka-action" onClick={advanceJob}>{STEP_LABELS[jobStep]}</button>
            <a className="ka-call" onClick={() => toast('Calling customer…')}><Icon name="phone" size={16} /> Call customer</a>
          </div>
        ) : k.online ? (
          <div className="ka-waiting">
            <div className="ka-radar"><span /><span /><span /><Icon name="wrench" size={28} /></div>
            <h3>Looking for jobs near you…</h3>
            <p>Stay online — new requests will pop up automatically</p>
          </div>
        ) : (
          <div className="ka-offline">
            <div className="ka-offline-ic"><Icon name="wrench" size={30} /></div>
            <h3>You are offline</h3>
            <p>Go online to start receiving job requests near {k.area || 'you'}</p>
          </div>
        )}
      </div>

      {/* Incoming job offer */}
      {incoming && (
        <div className="ka-offer-overlay">
          <div className="ka-offer">
            <div className="ka-offer-timer">{secs}s</div>
            <span className="ka-offer-tag">NEW JOB REQUEST</span>
            <h2>{incoming.service}</h2>
            <p className="ka-offer-prob">{incoming.problem}</p>
            <div className="ka-offer-rows">
              <div><Icon name="pin" size={16} /> {incoming.area}</div>
              <div><Icon name="scooter" size={20} /> {incoming.dist} away</div>
              <div className="ka-offer-pay"><Icon name="card" size={16} /> You earn <b>₹{incoming.pay}</b></div>
            </div>
            <div className="ka-offer-btns">
              <button className="ka-reject" onClick={rejectJob}>Reject</button>
              <button className="ka-accept" onClick={acceptJob}>Accept</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

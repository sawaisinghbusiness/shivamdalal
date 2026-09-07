import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SubHeader from '../components/SubHeader';
import Icon from '../components/Icon';
import { useAppData } from '../store/AppData';
import { useToast } from '../components/Toast';
import './MyBookings.css';

const TABS = ['all', 'processing', 'confirmed', 'completed', 'cancelled'];
const LABEL = {
  all: 'All',
  processing: 'Processing',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export default function MyBookings() {
  const { bookings, user } = useAppData();
  const nav = useNavigate();
  const toast = useToast();
  const [tab, setTab] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [activeRatingTag, setActiveRatingTag] = useState([]);

  const filteredBookings = bookings.filter((b) => {
    const st = (b.status || '').toLowerCase();
    if (tab === 'all') return true;
    return st === tab;
  });

  const toggleRatingTag = (tag) => {
    setActiveRatingTag((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleRatingSubmit = () => {
    toast('Feedback and tags submitted. Thank you!');
    setSelectedBooking(null);
  };

  return (
    <div className="sub-page my-bookings-page">
      <SubHeader title="My Bookings" sub="Managed bookings &amp; status updates" />

      {/* ── USER CARD REMOVED AS REQUESTED ── */}

      {/* ── 2. STATUS FILTER TABS ── */}
      <div className="mb-tabs-scroll">
        <div className="mb-tabs">
          {TABS.map((t) => (
            <button
              key={t}
              className={'mb-tab' + (tab === t ? ' active' : '')}
              onClick={() => setTab(t)}
            >
              {LABEL[t]}
            </button>
          ))}
        </div>
      </div>

      {/* ── 3. BOOKINGS LIST ── */}
      <div className="mb-list-container">
        {filteredBookings.length === 0 && (
          <div className="mb-empty-card">
            <div className="mb-empty-vector">
              <svg className="mb-waving-tech-svg" viewBox="0 0 160 140" width="120" height="105" aria-hidden="true">
                <circle cx="80" cy="70" r="56" fill="#E6F4F1" />
                <path d="M80 34c9 0 16 7 16 16s-7 16-16 16-16-7-16-16 7-16 16-16Z" fill="#0F766E" />
                <path d="M56 104c0-14 11-25 24-25s24 11 24 25v6H56v-6Z" fill="#0F766E" />
                <path d="M104 64l18-18c2-2 5-2 7 0s2 5 0 7l-15 15" stroke="#0F766E" strokeWidth="4" strokeLinecap="round" />
                <path d="M56 70l-14 14" stroke="#0F766E" strokeWidth="4" strokeLinecap="round" />
                <circle cx="126" cy="42" r="6" fill="#16A34A" />
              </svg>
            </div>
            <h3>No {LABEL[tab]} Bookings</h3>
            <p>Your {LABEL[tab].toLowerCase()} doorstep service bookings will appear here.</p>
            <button type="button" className="mb-empty-cta" onClick={() => nav('/')}>
              <Icon name="plus" size={16} />
              <span>Book a Service</span>
            </button>
          </div>
        )}

        {filteredBookings.map((b) => {
          const statusKey = (b.status || 'PROCESSING').toUpperCase();
          return (
            <div
              key={b.id}
              className={'mb-booking-card status-' + statusKey.toLowerCase()}
              onClick={() => setSelectedBooking(b)}
            >
              <div className="mb-bc-header">
                <div className="mb-bc-icon-tile">
                  <Icon name={b.icon || 'bolt'} size={20} />
                </div>

                <div className="mb-bc-titles">
                  <h3 className="mb-bc-service">{b.service}</h3>
                  <p className="mb-bc-sub">{b.subService || 'Doorstep Diagnostic & Repair'}</p>
                </div>

                <span className={'mb-status-pill pill-' + statusKey.toLowerCase()}>
                  {statusKey}
                </span>
              </div>

              <div className="mb-bc-chips-row">
                <div className="mb-meta-chip">
                  <Icon name="calendar" size={13} />
                  <span>{b.date}</span>
                </div>
                <div className="mb-meta-chip">
                  <Icon name="clock" size={13} />
                  <span>{b.slot}</span>
                </div>
              </div>

              <div className="mb-bc-footer">
                <span className="mb-bc-id">ID: {b.id}</span>
                <div className="mb-bc-amount">
                  <span className="mb-amt-label">Est. Total:</span>
                  <strong className="mb-amt-val">
                    {b.amount ? ('₹' + b.amount) : ('₹' + (b.estimate?.totalMin || 260))}
                  </strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 4. INTERACTIVE BOOKING DETAIL SHEET ── */}
      {selectedBooking && (
        <div className="mb-sheet-overlay" onClick={() => setSelectedBooking(null)}>
          <div className="mb-sheet-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mb-sm-header">
              <div>
                <h3 className="mb-sm-title">{selectedBooking.service}</h3>
                <span className="mb-sm-id">Booking ID: {selectedBooking.id}</span>
              </div>
              <button
                type="button"
                className="mb-close-btn"
                onClick={() => setSelectedBooking(null)}
                aria-label="Close details"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            <div className="mb-sm-content">
              <div className="mb-sm-status-row">
                <span className="mb-sm-status-label">Current Booking Status</span>
                <span className={'mb-status-pill pill-' + (selectedBooking.status || 'PROCESSING').toLowerCase()}>
                  {(selectedBooking.status || 'PROCESSING').toUpperCase()}
                </span>
              </div>

              <div className="mb-block-box">
                <h4 className="mb-box-title">Progress Timeline</h4>
                <div className="mb-timeline-list">
                  {(selectedBooking.timeline || [
                    { status: 'PROCESSING', title: 'Booking Placed', desc: 'Assigned to platform desk', time: 'Completed', done: true },
                    { status: 'CONFIRMED', title: 'Karigar Assignment', desc: 'Platform assigning verified technician', time: 'In progress', done: selectedBooking.status !== 'PROCESSING' },
                    { status: 'IN_PROGRESS', title: 'Doorstep Inspection', desc: 'Technician reaches address on time', time: 'Pending', done: selectedBooking.status === 'COMPLETED' },
                    { status: 'COMPLETED', title: 'Work Done & Final Bill', desc: 'Payment after satisfaction', time: 'Pending', done: selectedBooking.status === 'COMPLETED' },
                  ]).map((st, idx) => (
                    <div key={idx} className={'mb-tl-item' + (st.done ? ' done' : '')}>
                      <div className="mb-tl-dot-col">
                        <span className="mb-tl-dot" />
                        {idx < 3 && <span className="mb-tl-line" />}
                      </div>
                      <div className="mb-tl-info">
                        <div className="mb-tl-head">
                          <strong>{st.title}</strong>
                          <small>{st.time}</small>
                        </div>
                        <p>{st.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedBooking.karigar && (
                <div className="mb-block-box mb-karigar-box">
                  <h4 className="mb-box-title">Assigned Technician</h4>
                  <div className="mb-kb-card">
                    <div className="mb-kb-avatar">
                      {selectedBooking.karigar.name.charAt(0)}
                    </div>
                    <div className="mb-kb-info">
                      <div className="mb-kb-name-row">
                        <strong>{selectedBooking.karigar.name}</strong>
                        <span className="mb-verified-pill">
                          <Icon name="shield" size={11} /> Verified
                        </span>
                      </div>
                      <p className="mb-kb-skill">{selectedBooking.karigar.skill} · {selectedBooking.karigar.area}</p>
                      <div className="mb-kb-rating">
                        <Icon name="star" size={12} />
                        <span>{selectedBooking.karigar.rating || '4.9'} ({selectedBooking.karigar.jobsDone || '300'}+ jobs)</span>
                      </div>
                    </div>
                    <a href={'tel:' + (selectedBooking.karigar.phone || '9414088214')} className="mb-kb-call" aria-label="Call Technician">
                      <Icon name="phone" size={18} />
                    </a>
                  </div>
                </div>
              )}

              <div className="mb-block-box">
                <h4 className="mb-box-title">Schedule &amp; Address</h4>
                <div className="mb-sa-row">
                  <Icon name="calendar" size={16} />
                  <div>
                    <strong>{selectedBooking.date}</strong>
                    <span>{selectedBooking.slot}</span>
                  </div>
                </div>
                <div className="mb-sa-row">
                  <Icon name="pin" size={16} />
                  <div>
                    <strong>{selectedBooking.addressArea || 'Barmer'}</strong>
                    <span>{selectedBooking.address}</span>
                  </div>
                </div>
              </div>

              <div className="mb-block-box mb-invoice-box">
                <h4 className="mb-box-title">Invoice / Price Breakdown</h4>
                <div className="mb-inv-rows">
                  <div className="mb-inv-row">
                    <span>Visiting &amp; Diagnostic Fee</span>
                    <span>₹{selectedBooking.estimate?.visitCharge || 99}</span>
                  </div>
                  <div className="mb-inv-row">
                    <span>Labor Estimate ({selectedBooking.service})</span>
                    <span>₹{selectedBooking.estimate?.laborMin || 149} – ₹{selectedBooking.estimate?.laborMax || 149}</span>
                  </div>
                  <div className="mb-inv-row">
                    <span>GST (5%)</span>
                    <span>₹{selectedBooking.estimate?.gstMin || 12} – ₹{selectedBooking.estimate?.gstMax || 12}</span>
                  </div>
                  <div className="mb-inv-row mb-inv-total">
                    <strong>Total Estimated Amount</strong>
                    <strong className="teal">
                      ₹{selectedBooking.estimate?.totalMin || selectedBooking.amount || 260}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="mb-warranty-box">
                <Icon name="shield" size={16} />
                <div>
                  <strong>30-Day SARVOTTAM Service Guarantee</strong>
                  <p>Free rework warranty included on all completed repairs.</p>
                </div>
              </div>

              {selectedBooking.status === 'COMPLETED' && (
                <div className="mb-block-box mb-rating-box">
                  <h4 className="mb-box-title">Rate Service Quality</h4>
                  <p className="mb-rb-sub">Tag your experience with the technician</p>
                  <div className="mb-rating-tags">
                    {['On Time Arrival', 'Quality Work', 'Fair Pricing', 'Polite Behavior', 'Clean Workspace'].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        className={'mb-rt-chip' + (activeRatingTag.includes(tag) ? ' active' : '')}
                        onClick={() => toggleRatingTag(tag)}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                  <button type="button" className="mb-rating-submit-btn" onClick={handleRatingSubmit}>
                    Submit Feedback
                  </button>
                </div>
              )}

              <div className="mb-support-actions">
                <a href="tel:1800123456" className="mb-sup-btn call" onClick={() => toast('Calling SARVOTTAM Support…')}>
                  <Icon name="phone" size={16} />
                  <span>Call Helpline</span>
                </a>
                <a
                  href={"https://wa.me/919414088214?text=Hello,%20I%20have%20an%20inquiry%20regarding%20my%20booking%20ID%20" + selectedBooking.id}
                  target="_blank"
                  rel="noreferrer"
                  className="mb-sup-btn whatsapp"
                >
                  <Icon name="whatsapp" size={16} />
                  <span>WhatsApp Help</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bottom-spacer" />
    </div>
  );
}

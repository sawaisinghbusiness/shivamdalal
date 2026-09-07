import { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Icon from '../components/Icon';
import './BookingSuccess.css';

export default function BookingSuccess() {
  const loc = useLocation();
  const nav = useNavigate();
  const booking = loc.state?.booking;

  // Direct open or refresh guard: redirect home if no booking in state
  useEffect(() => {
    if (!booking || !booking.id) {
      nav('/', { replace: true });
    }
  }, [booking, nav]);

  if (!booking || !booking.id) {
    return null;
  }

  return (
    <div className="page booking-success-page">
      <div className="bs-container">
        {/* Green Check in Mint Ring */}
        <div className="bs-icon-wrapper">
          <div className="bs-mint-ring">
            <span className="bs-check-glow" />
            <div className="bs-check-circle">
              <Icon name="check" size={32} />
            </div>
          </div>
        </div>

        {/* Title & Hinglish Sub-line */}
        <h1 className="bs-title">Booking Confirmed!</h1>
        <p className="bs-subtitle">
          Aapki booking successfully place ho chuki hai. Platform jald hi verified technician assign karega.
        </p>

        {/* Booking ID Pill (Teal on Mint) */}
        <div className="bs-id-pill">
          <span className="bs-id-label">Booking ID:</span>
          <strong className="bs-id-code">{booking.id}</strong>
        </div>

        {/* Summary Table Card */}
        <div className="bs-summary-card">
          <div className="bs-card-head">
            <Icon name="clipboard" size={16} />
            <span>Booking Summary</span>
          </div>

          <div className="bs-table-rows">
            <div className="bs-row">
              <span className="bs-col-label">Service</span>
              <strong className="bs-col-val">{booking.service || booking.services?.[0]?.name}</strong>
            </div>

            {booking.subService && (
              <div className="bs-row">
                <span className="bs-col-label">Selected Issue</span>
                <span className="bs-col-val">{booking.subService}</span>
              </div>
            )}

            <div className="bs-row">
              <span className="bs-col-label">City / Area</span>
              <span className="bs-col-val">{booking.city || 'Barmer'}, {booking.addressArea || 'Rajasthan'}</span>
            </div>

            <div className="bs-row">
              <span className="bs-col-label">Date &amp; Time</span>
              <strong className="bs-col-val">{booking.date} · {booking.slot}</strong>
            </div>

            <div className="bs-row">
              <span className="bs-col-label">Doorstep Address</span>
              <span className="bs-col-val bs-address">{booking.address}</span>
            </div>

            <div className="bs-row bs-total-row">
              <span className="bs-col-label">Estimated Total</span>
              <strong className="bs-col-val bs-price">
                ₹{booking.estimate?.totalMin} – ₹{booking.estimate?.totalMax}
                <small className="bs-pay-tag">(Pay after work)</small>
              </strong>
            </div>
          </div>
        </div>

        {/* Informational Alert Note */}
        <div className="bs-info-banner">
          <Icon name="info" size={18} />
          <span>Status aur updates <strong>My Bookings</strong> me milenge. Platform updates bhejega.</span>
        </div>

        {/* Action Buttons */}
        <div className="bs-actions">
          <button
            type="button"
            className="bs-primary-btn"
            onClick={() => nav('/bookings')}
          >
            <Icon name="bookings" size={18} />
            <span>Go to My Bookings</span>
          </button>

          <Link to="/" className="bs-secondary-btn">
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Muted Trust Footer */}
        <div className="bs-trust-footer">
          <Icon name="shield" size={14} />
          <span>SARVOTTAM Digital Solution · Verified &amp; Managed Home Services</span>
        </div>
      </div>
    </div>
  );
}
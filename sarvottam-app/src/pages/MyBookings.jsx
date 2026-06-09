import { useState } from 'react';
import SubHeader from '../components/SubHeader';
import Icon from '../components/Icon';
import { useAppData } from '../store/AppData';
import { useToast } from '../components/Toast';
import './MyBookings.css';

const TABS = ['upcoming', 'completed', 'cancelled'];
const LABEL = { upcoming: 'Upcoming', completed: 'Completed', cancelled: 'Cancelled' };
const BADGE = { upcoming: 'badge-up', completed: 'badge-done', cancelled: 'badge-cancel' };

export default function MyBookings() {
  const { bookings } = useAppData();
  const toast = useToast();
  const [tab, setTab] = useState('upcoming');

  const list = bookings.filter((b) => b.status === tab);

  return (
    <div className="sub-page">
      <SubHeader title="My Bookings" sub="Saari service history" />

      <div className="bk-tabs">
        {TABS.map((t) => (
          <button key={t} className={'bk-tab' + (tab === t ? ' active' : '')} onClick={() => setTab(t)}>
            {LABEL[t]}
          </button>
        ))}
      </div>

      <div className="bk-list">
        {list.length === 0 && (
          <div className="bk-empty">
            <div className="bk-empty-ic"><Icon name="bookings" size={32} /></div>
            <h3>Koi {LABEL[tab]} booking nahi</h3>
            <p>Yahan aapki {LABEL[tab].toLowerCase()} bookings dikhengi</p>
          </div>
        )}

        {list.map((b) => (
          <div className="bk-card" key={b.id}>
            <div className="bk-ic"><Icon name={b.icon} size={24} /></div>
            <div className="bk-info">
              <div className="bk-top">
                <h3>{b.service}</h3>
                <span className={'bk-badge ' + BADGE[b.status]}>{LABEL[b.status]}</span>
              </div>
              <p className="bk-karigar">Karigar: {b.karigar}</p>
              <p className="bk-date">{b.date}</p>
              <div className="bk-foot">
                {b.amount > 0 && <span className="bk-amt">₹{b.amount}</span>}
                {b.status === 'upcoming' && (
                  <button className="bk-action" onClick={() => toast('Booking track — demo')}>Track</button>
                )}
                {b.status === 'completed' && (
                  <button className="bk-action ghost" onClick={() => toast('Dobara book — demo')}>Rebook</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

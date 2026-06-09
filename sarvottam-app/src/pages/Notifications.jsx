import { useEffect } from 'react';
import SubHeader from '../components/SubHeader';
import Icon from '../components/Icon';
import { useAppData } from '../store/AppData';
import './Notifications.css';

export default function Notifications() {
  const { notifications, markNotifsRead } = useAppData();

  // mark all read when leaving the screen
  useEffect(() => () => markNotifsRead(), [markNotifsRead]);

  return (
    <div className="sub-page">
      <SubHeader title="Notifications" sub="Updates aur offers" />

      <div className="nt-list">
        {notifications.length === 0 && (
          <div className="bk-empty">
            <div className="bk-empty-ic"><Icon name="bell" size={32} /></div>
            <h3>Koi notification nahi</h3>
          </div>
        )}
        {notifications.map((n) => (
          <div className={'nt-card' + (n.unread ? ' unread' : '')} key={n.id}>
            <div className="nt-ic"><Icon name={n.icon} size={20} /></div>
            <div className="nt-info">
              <h3>{n.title}</h3>
              <p>{n.msg}</p>
              <small>{n.time}</small>
            </div>
            {n.unread && <span className="nt-dot" />}
          </div>
        ))}
      </div>
    </div>
  );
}

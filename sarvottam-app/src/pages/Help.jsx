import { useState } from 'react';
import SubHeader from '../components/SubHeader';
import Icon from '../components/Icon';
import { useToast } from '../components/Toast';
import './Help.css';

const CONTACTS = [
  { id: 'call',  icon: 'phone', title: 'Call us',  sub: '+91 1800-123-456 · 9am-9pm', action: 'Karigar support ko call ho rahi hai…' },
  { id: 'chat',  icon: 'bell',  title: 'Live chat', sub: 'Turant jawab paayein',       action: 'Chat — jald aa raha hai' },
  { id: 'email', icon: 'card',  title: 'Email',    sub: 'help@sarvottam.com',          action: 'Email app khul raha hai…' },
];

const FAQS = [
  { q: 'Karigar kitni der mein aata hai?', a: 'Emergency service mein sabse najdeek available Karigar ko request jaati hai — aam taur pe 8-15 minute mein pahunch jaata hai.' },
  { q: 'Payment kaise karein?', a: 'Aap kaam poora hone ke baad Online (UPI/Card) ya Cash mein payment kar sakte hain. Wallet se bhi pay kar sakte hain.' },
  { q: 'Kya Karigar verified hote hain?', a: 'Haan, har Karigar ki ID aur skill SARVOTTAM team manually verify karti hai, tabhi wo customer ko dikhta hai.' },
  { q: 'Booking cancel kaise karein?', a: 'My Bookings mein jaa kar upcoming booking ko cancel kar sakte hain. Abhi cancellation free hai.' },
  { q: 'Galat kaam ho to kya karein?', a: 'Help & Support se humein turant batayein — hum Karigar se baat karke ya refund/dobara service ka intezaam karenge.' },
];

export default function Help() {
  const toast = useToast();
  const [open, setOpen] = useState(null);

  return (
    <div className="sub-page">
      <SubHeader title="Help & Support" sub="Hum aapki madad ke liye hain" />

      <p className="sub-section-label">Humse baat karein</p>
      <div className="hp-contacts">
        {CONTACTS.map((c) => (
          <button className="hp-contact" key={c.id} onClick={() => toast(c.action)}>
            <div className="hp-contact-ic"><Icon name={c.icon} size={20} /></div>
            <div className="hp-contact-info"><strong>{c.title}</strong><small>{c.sub}</small></div>
            <Icon name="chevron" size={16} />
          </button>
        ))}
      </div>

      <p className="sub-section-label">Common sawaal (FAQ)</p>
      <div className="hp-faqs">
        {FAQS.map((f, i) => (
          <div className={'hp-faq' + (open === i ? ' open' : '')} key={i}>
            <button className="hp-faq-q" onClick={() => setOpen(open === i ? null : i)}>
              <span>{f.q}</span>
              <span className="hp-faq-chev"><Icon name="chevron" size={16} /></span>
            </button>
            {open === i && <p className="hp-faq-a">{f.a}</p>}
          </div>
        ))}
      </div>

      <div className="bottom-spacer" />
    </div>
  );
}

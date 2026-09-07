import { useState } from 'react';
import SubHeader from '../components/SubHeader';
import Icon from '../components/Icon';
import { useToast } from '../components/Toast';
import './Help.css';

const CONTACTS = [
  { id: 'call',  icon: 'phone', title: 'Call Us',  sub: '+91 1800-123-456 · 9 AM – 9 PM', action: 'Calling 24×7 customer support…' },
  { id: 'chat',  icon: 'bell',  title: 'Live Chat', sub: 'Instant answers to your queries', action: 'Live chat opening…' },
  { id: 'email', icon: 'card',  title: 'Email Us',  sub: 'help@sarvottam.com',              action: 'Opening email client…' },
];

const FAQS = [
  { q: 'How quickly does a technician arrive?', a: 'For emergency services, requests are dispatched to the closest available verified technician within 3 km, who typically arrives within 8 to 15 minutes.' },
  { q: 'How do I pay for the service?', a: 'Payment is due only after work is completed. You can pay online via UPI / QR / Card or directly in Cash to the technician.' },
  { q: 'Are all technicians verified?', a: 'Yes. Every technician undergoes comprehensive background checks and skill verification by the SARVOTTAM team before onboarding.' },
  { q: 'How do I cancel a booking?', a: 'You can cancel any upcoming booking free of charge from the My Bookings section anytime before technician arrival.' },
  { q: 'What if I am not satisfied with the work?', a: 'Contact our 24×7 Support immediately. We will arrange a free revisit or process a full refund per our Transparency Guarantee.' },
];

export default function Help() {
  const toast = useToast();
  const [open, setOpen] = useState(null);

  return (
    <div className="sub-page">
      <SubHeader title="Help & Support" sub="We are here to assist you 24×7" />

      <p className="sub-section-label">Contact Support</p>
      <div className="hp-contacts">
        {CONTACTS.map((c) => (
          <button className="hp-contact" key={c.id} onClick={() => toast(c.action)}>
            <div className="hp-contact-ic"><Icon name={c.icon} size={20} /></div>
            <div className="hp-contact-info"><strong>{c.title}</strong><small>{c.sub}</small></div>
            <Icon name="chevron" size={16} />
          </button>
        ))}
      </div>

      <p className="sub-section-label">Frequently Asked Questions (FAQ)</p>
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

import { useState } from 'react';
import SubHeader from '../components/SubHeader';
import Icon from '../components/Icon';
import { useAppData } from '../store/AppData';
import { useToast } from '../components/Toast';
import './Wallet.css';

const QUICK = [100, 200, 500, 1000];

export default function Wallet() {
  const { wallet, addMoney } = useAppData();
  const toast = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [amt, setAmt] = useState('');

  function doAdd(value) {
    const v = value || parseInt(amt, 10);
    if (!v || v < 1) { toast('Amount daalein'); return; }
    addMoney(v);
    toast(`✓ ₹${v} wallet mein add ho gaye`);
    setShowAdd(false);
    setAmt('');
  }

  return (
    <div className="sub-page">
      <SubHeader title="Payments & Wallet" sub="Balance, methods & history" />

      {/* Balance card */}
      <div className="wl-balance">
        <div className="wl-bal-top">
          <span>SARVOTTAM Wallet</span>
          <Icon name="card" size={22} />
        </div>
        <p className="wl-bal-label">Available balance</p>
        <h2 className="wl-bal-amt">₹{wallet.balance.toLocaleString('en-IN')}</h2>
        <button className="wl-add-btn" onClick={() => setShowAdd(true)}>
          <Icon name="plus" size={16} /> Add Money
        </button>
      </div>

      {/* Payment methods */}
      <p className="sub-section-label">Payment Methods</p>
      <div className="wl-methods">
        {wallet.methods.map((m) => (
          <div className="wl-method" key={m.id}>
            <div className="wl-method-ic"><Icon name={m.type === 'upi' ? 'cash' : 'card'} size={20} /></div>
            <div className="wl-method-info"><strong>{m.label}</strong><small>{m.sub}</small></div>
            <Icon name="check" size={16} />
          </div>
        ))}
        <button className="wl-add-method" onClick={() => toast('Naya method — jald aa raha hai')}>
          <Icon name="plus" size={16} /> Add payment method
        </button>
      </div>

      {/* Transactions */}
      <p className="sub-section-label">Transaction History</p>
      <div className="wl-txns">
        {wallet.transactions.map((t) => (
          <div className="wl-txn" key={t.id}>
            <div className={'wl-txn-ic ' + (t.type === 'credit' ? 'cr' : 'dr')}>
              <Icon name={t.type === 'credit' ? 'plus' : 'arrow'} size={16} />
            </div>
            <div className="wl-txn-info"><strong>{t.title}</strong><small>{t.date}</small></div>
            <span className={'wl-txn-amt ' + (t.type === 'credit' ? 'cr' : 'dr')}>
              {t.type === 'credit' ? '+' : '−'}₹{Math.abs(t.amount)}
            </span>
          </div>
        ))}
      </div>

      <div className="bottom-spacer" />

      {/* Add money sheet */}
      {showAdd && (
        <div className="addr-overlay" onClick={() => setShowAdd(false)}>
          <div className="addr-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="addr-drag" />
            <h2 className="addr-sheet-title">Add Money</h2>
            <div className="wl-quick">
              {QUICK.map((q) => (
                <button key={q} className="wl-quick-btn" onClick={() => doAdd(q)}>₹{q}</button>
              ))}
            </div>
            <div className="wl-amt-input">
              <span>₹</span>
              <input value={amt} onChange={(e) => setAmt(e.target.value.replace(/\D/g, ''))} placeholder="Koi aur amount" inputMode="numeric" />
            </div>
            <button className="btn-primary" onClick={() => doAdd()}>Add to Wallet</button>
            <button className="btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useMemo } from 'react';
import Icon from './Icon';
import { useToast } from './Toast';
import { useAppData } from '../store/AppData';
import './KarigarWithdraw.css';

export default function KarigarWithdraw({ onBack }) {
  const { karigar, karigarWithdraw, saveKarigarPayoutMethod } = useAppData();
  const toast = useToast();
  const k = karigar || {};

  const balance = k.balance !== undefined ? k.balance : 1450;
  const payoutMethods = k.payoutMethods || { upis: [], banks: [] };

  const [view, setView] = useState('main'); // 'main' | 'add_upi' | 'add_bank' | 'bank_in_review' | 'processing' | 'success'
  const [amount, setAmount] = useState(balance > 0 ? Math.min(balance, 1000) : 0);
  const [selectedMethod, setSelectedMethod] = useState(() => {
    if (payoutMethods.upis?.length > 0) {
      return { type: 'upi', id: payoutMethods.upis[0].id, detail: payoutMethods.upis[0].id };
    }
    if (payoutMethods.banks?.length > 0) {
      return { type: 'bank', id: payoutMethods.banks[0].id, detail: `${payoutMethods.banks[0].bankName} (••${payoutMethods.banks[0].accLast4})` };
    }
    return null;
  });

  // UPI Form State
  const [upiId, setUpiId] = useState('');
  const [isVerifyingUpi, setIsVerifyingUpi] = useState(false);
  const [verifiedUpiName, setVerifiedUpiName] = useState(null);
  const [upiError, setUpiError] = useState(null);

  // Bank Form State
  const [bankForm, setBankForm] = useState({
    accName: k.name || 'Karigar Captain',
    accNumber: '',
    accNumberRe: '',
    ifsc: '',
  });
  const [bankError, setBankError] = useState(null);
  const [submittedBank, setSubmittedBank] = useState(null);

  // Success Receipt State
  const [lastTx, setLastTx] = useState(null);

  // Quick Amount presets
  const quickAmounts = useMemo(() => {
    const list = [500, 1000, 2000];
    return list.filter((a) => a <= balance);
  }, [balance]);

  // Detected Bank name based on IFSC prefix
  const detectedBank = useMemo(() => {
    const code = (bankForm.ifsc || '').trim().toUpperCase();
    if (code.startsWith('SBIN')) return 'State Bank of India — Barmer Branch';
    if (code.startsWith('HDFC')) return 'HDFC Bank — Station Road Branch';
    if (code.startsWith('ICIC')) return 'ICICI Bank — High School Road Branch';
    if (code.startsWith('PUNB')) return 'Punjab National Bank — Barmer';
    if (code.startsWith('BARB')) return 'Bank of Baroda — Indra Colony Branch';
    if (code.length >= 4) return code.slice(0, 4) + ' Commercial Bank';
    return null;
  }, [bankForm.ifsc]);

  // Handle Verify UPI
  const handleVerifyUpi = () => {
    setUpiError(null);
    const cleaned = upiId.trim().toLowerCase();
    if (!cleaned) {
      setUpiError('Please enter a valid UPI ID');
      return;
    }
    if (!/^[a-zA-Z0-9.\-_]{2,64}@[a-zA-Z]{2,32}$/.test(cleaned)) {
      setUpiError('Invalid format. Example: mobile@paytm or name@oksbi');
      return;
    }

    setIsVerifyingUpi(true);
    setTimeout(() => {
      setIsVerifyingUpi(false);
      // Simulate real-time NPCI verification response
      const verifiedName = (k.name || 'SHIVAM SINGH').toUpperCase();
      setVerifiedUpiName(verifiedName);
      toast('UPI ID verified successfully with NPCI network!');
    }, 800);
  };

  // Handle Save UPI
  const handleSaveUpi = (e) => {
    e.preventDefault();
    if (!verifiedUpiName) {
      handleVerifyUpi();
      return;
    }
    const newUpi = {
      id: upiId.trim().toLowerCase(),
      holderName: verifiedUpiName,
      status: 'VERIFIED',
      addedAt: Date.now(),
    };
    saveKarigarPayoutMethod('upi', newUpi);
    setSelectedMethod({ type: 'upi', id: newUpi.id, detail: newUpi.id });
    setView('main');
    toast('UPI ID linked for instant withdrawal!');
  };

  // Handle Submit Bank Account
  const handleSubmitBank = (e) => {
    e.preventDefault();
    setBankError(null);
    const acc = bankForm.accNumber.replace(/\D/g, '');
    const accRe = bankForm.accNumberRe.replace(/\D/g, '');
    const ifsc = bankForm.ifsc.trim().toUpperCase();

    if (acc.length < 9 || acc.length > 18) {
      setBankError('Account number must be between 9 and 18 digits.');
      return;
    }
    if (acc !== accRe) {
      setBankError('Account numbers do not match. Please re-enter carefully.');
      return;
    }
    if (ifsc.length !== 11) {
      setBankError('IFSC code must be exactly 11 characters (e.g. SBIN0001234).');
      return;
    }

    const newBank = {
      id: 'BANK_' + Date.now(),
      accName: bankForm.accName,
      accLast4: acc.slice(-4),
      ifsc,
      bankName: detectedBank || 'Commercial Bank of India',
      status: 'IN_REVIEW',
      addedAt: Date.now(),
    };

    saveKarigarPayoutMethod('bank', newBank);
    setSubmittedBank(newBank);
    setView('bank_in_review');
  };

  // Execute Withdrawal
  const handleExecuteWithdrawal = () => {
    const num = Number(amount);
    if (!num || num < 100) {
      toast('Minimum withdrawal amount is ₹100');
      return;
    }
    if (num > balance) {
      toast('Insufficient wallet balance');
      return;
    }
    if (!selectedMethod) {
      toast('Please select a payout method (UPI or Bank)');
      return;
    }

    setView('processing');
    setTimeout(() => {
      const tx = karigarWithdraw(num, selectedMethod);
      setLastTx(tx);
      setView('success');
    }, 1200);
  };

  return (
    <div className="kw-page">
      {/* ── TOP HEADER ── */}
      <div className="kw-header">
        <button
          type="button"
          className="kw-back-btn"
          onClick={() => {
            if (view === 'main' || view === 'success') onBack();
            else setView('main');
          }}
          aria-label="Go Back"
        >
          <Icon name="back" size={18} />
        </button>
        <div className="kw-head-title">
          <h2>
            {view === 'main' && 'Withdraw Funds'}
            {view === 'add_upi' && 'Add UPI ID'}
            {view === 'add_bank' && 'Add Bank Account'}
            {view === 'bank_in_review' && 'Bank Verification Ledger'}
            {view === 'processing' && 'Processing Withdrawal'}
            {view === 'success' && 'Withdrawal Receipt'}
          </h2>
          <p>
            {view === 'main' && 'Transfer wallet balance to UPI or Bank'}
            {view === 'add_upi' && 'Instant payout via GPay, PhonePe, Paytm'}
            {view === 'add_bank' && 'Direct IMPS/NEFT bank transfer'}
            {view === 'bank_in_review' && 'Penny-drop ₹1 verification & NPCI clearing status'}
            {view === 'processing' && 'Connecting to banking switch...'}
            {view === 'success' && 'Transfer initiated successfully'}
          </p>
        </div>
      </div>

      <div className="kw-content">
        {/* ════════════════════════════════════════════════════════
            1. MAIN VIEW: BALANCE + AMOUNT + PAYOUT METHODS
           ════════════════════════════════════════════════════════ */}
        {view === 'main' && (
          <>
            {/* Wallet Balance Hero Card */}
            <div className="kw-balance-card">
              <div className="kw-bal-sub">Available Wallet Balance</div>
              <div className="kw-bal-amt">₹{balance.toLocaleString('en-IN')}</div>
              <div className="kw-bal-note">
                <Icon name="shield" size={13} />
                <span>Zero deduction · 100% verified payout</span>
              </div>
            </div>

            {/* Enter Amount Section */}
            <div className="kw-sec-card">
              <label className="kw-sec-label">Enter Withdrawal Amount</label>
              <div className="kw-input-wrap">
                <span className="kw-currency-symbol">₹</span>
                <input
                  type="number"
                  className="kw-amt-input"
                  placeholder="0"
                  value={amount || ''}
                  onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
                  max={balance}
                />
                {amount > 0 && (
                  <button
                    type="button"
                    className="kw-clear-btn"
                    onClick={() => setAmount(0)}
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Quick Chips */}
              <div className="kw-chips">
                {quickAmounts.map((q) => (
                  <button
                    key={q}
                    type="button"
                    className={'kw-chip' + (amount === q ? ' active' : '')}
                    onClick={() => setAmount(q)}
                  >
                    +₹{q}
                  </button>
                ))}
                {balance > 0 && (
                  <button
                    type="button"
                    className={'kw-chip withdraw-all' + (amount === balance ? ' active' : '')}
                    onClick={() => setAmount(balance)}
                  >
                    Withdraw All (₹{balance})
                  </button>
                )}
              </div>

              <small className="kw-min-note">Min: ₹100 · Max: ₹{balance}</small>
            </div>

            {/* Payout Methods (UPI & Bank Account) */}
            <div className="kw-sec-card">
              <label className="kw-sec-label">Choose Payout Method</label>

              {/* ── UPI OPTION BLOCK ── */}
              <div className="kw-method-group">
                <div className="kw-group-header">
                  <div className="kw-group-icon upi"><Icon name="bolt" size={16} /></div>
                  <div>
                    <strong>UPI Transfer</strong>
                    <small>Instant transfer · 24×7</small>
                  </div>
                </div>

                {/* Saved UPI IDs */}
                {(payoutMethods.upis || []).map((u) => {
                  const isSel = selectedMethod?.type === 'upi' && selectedMethod?.id === u.id;
                  return (
                    <div
                      key={u.id}
                      className={'kw-item-card' + (isSel ? ' selected' : '')}
                      onClick={() => setSelectedMethod({ type: 'upi', id: u.id, detail: u.id })}
                    >
                      <div className="kw-radio-dot">{isSel && <span />}</div>
                      <div className="kw-item-info">
                        <span className="kw-item-val">{u.id}</span>
                        <span className="kw-item-name">✓ Verified: {u.holderName || k.name}</span>
                      </div>
                      <span className="kw-status-tag verified">Instant</span>
                    </div>
                  );
                })}

                <button
                  type="button"
                  className="kw-add-link-btn"
                  onClick={() => {
                    setUpiId('');
                    setVerifiedUpiName(null);
                    setUpiError(null);
                    setView('add_upi');
                  }}
                >
                  <Icon name="plus" size={14} />
                  <span>{(payoutMethods.upis || []).length > 0 ? 'Add Another UPI ID' : 'Add UPI ID (GPay / PhonePe / Paytm)'}</span>
                </button>
              </div>

              {/* ── BANK ACCOUNT OPTION BLOCK ── */}
              <div className="kw-method-group">
                <div className="kw-group-header">
                  <div className="kw-group-icon bank"><Icon name="building" size={16} /></div>
                  <div>
                    <strong>Bank Account</strong>
                    <small>Direct NEFT / IMPS transfer</small>
                  </div>
                </div>

                {/* Saved Bank Accounts */}
                {(payoutMethods.banks || []).map((b) => {
                  const isSel = selectedMethod?.type === 'bank' && selectedMethod?.id === b.id;
                  const isReview = b.status === 'IN_REVIEW';
                  return (
                    <div
                      key={b.id}
                      className={'kw-item-card' + (isSel ? ' selected' : '')}
                      onClick={() => {
                        if (isReview) {
                          setSubmittedBank(b);
                          setView('bank_in_review');
                        } else {
                          setSelectedMethod({ type: 'bank', id: b.id, detail: `${b.bankName} (••${b.accLast4})` });
                        }
                      }}
                    >
                      <div className="kw-radio-dot">{isSel && <span />}</div>
                      <div className="kw-item-info">
                        <span className="kw-item-val">{b.bankName}</span>
                        <span className="kw-item-name">A/C •••• {b.accLast4} · IFSC {b.ifsc}</span>
                      </div>
                      <span className={'kw-status-tag ' + (isReview ? 'review' : 'verified')}>
                        {isReview ? '1–2 Days · View Status' : 'Active'}
                      </span>
                    </div>
                  );
                })}

                <button
                  type="button"
                  className="kw-add-link-btn"
                  onClick={() => {
                    setBankForm({
                      accName: k.name || 'Karigar Captain',
                      accNumber: '',
                      accNumberRe: '',
                      ifsc: '',
                    });
                    setBankError(null);
                    setView('add_bank');
                  }}
                >
                  <Icon name="plus" size={14} />
                  <span>{(payoutMethods.banks || []).length > 0 ? 'Add Another Bank Account' : 'Add Bank Account'}</span>
                </button>
              </div>
            </div>

            {/* Bottom CTA Button */}
            <div className="kw-footer-cta">
              <button
                type="button"
                className="kw-primary-btn"
                disabled={amount < 100 || amount > balance || !selectedMethod}
                onClick={handleExecuteWithdrawal}
              >
                {amount > balance
                  ? 'Insufficient Balance'
                  : amount < 100
                  ? 'Enter min. ₹100'
                  : !selectedMethod
                  ? 'Select Payout Method'
                  : `Proceed to Withdraw ₹${amount.toLocaleString('en-IN')}`}
              </button>
            </div>
          </>
        )}

        {/* ════════════════════════════════════════════════════════
            2. ADD UPI VIEW (WITH REAL-TIME VERIFY)
           ════════════════════════════════════════════════════════ */}
        {view === 'add_upi' && (
          <form className="kw-form" onSubmit={handleSaveUpi}>
            <div className="kw-sec-card">
              <label className="kw-sec-label">Enter Your UPI ID</label>
              <div className="kw-input-box">
                <input
                  type="text"
                  className="kw-field-input"
                  placeholder="mobile@paytm or name@oksbi"
                  value={upiId}
                  onChange={(e) => {
                    setUpiId(e.target.value);
                    setVerifiedUpiName(null);
                    setUpiError(null);
                  }}
                  autoFocus
                />
                <button
                  type="button"
                  className="kw-verify-inline-btn"
                  disabled={!upiId.trim() || isVerifyingUpi}
                  onClick={handleVerifyUpi}
                >
                  {isVerifyingUpi ? 'Verifying...' : 'Verify'}
                </button>
              </div>

              {/* Handle Suffix Quick Buttons */}
              <div className="kw-upi-suggestions">
                <small>Common handles:</small>
                {['@okhdfcbank', '@oksbi', '@paytm', '@ybl', '@upi'].map((suf) => (
                  <button
                    key={suf}
                    type="button"
                    className="kw-suf-chip"
                    onClick={() => {
                      const prefix = upiId.split('@')[0] || (k.phone || '9414012345');
                      setUpiId(prefix + suf);
                      setVerifiedUpiName(null);
                      setUpiError(null);
                    }}
                  >
                    {suf}
                  </button>
                ))}
              </div>

              {/* Error Message */}
              {upiError && <div className="kw-error-msg"><Icon name="info" size={14} /> {upiError}</div>}

              {/* Verified Result Card */}
              {verifiedUpiName && (
                <div className="kw-verified-card">
                  <div className="kw-verified-ic"><Icon name="check" size={16} /></div>
                  <div>
                    <strong>✓ Account Verified via NPCI</strong>
                    <p>Registered Name: <b>{verifiedUpiName}</b></p>
                  </div>
                </div>
              )}
            </div>

            <div className="kw-footer-cta">
              <button
                type="submit"
                className="kw-primary-btn"
                disabled={!verifiedUpiName}
              >
                {verifiedUpiName ? 'Save & Use for Withdrawal' : 'Verify UPI ID to Continue'}
              </button>
              <button
                type="button"
                className="kw-ghost-btn"
                onClick={() => setView('main')}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* ════════════════════════════════════════════════════════
            3. ADD BANK ACCOUNT VIEW
           ════════════════════════════════════════════════════════ */}
        {view === 'add_bank' && (
          <form className="kw-form" onSubmit={handleSubmitBank}>
            <div className="kw-sec-card">
              {/* Account Holder Name (Locked to Captain) */}
              <label className="kw-sec-label">Account Holder Name</label>
              <div className="kw-locked-field">
                <input
                  type="text"
                  className="kw-field-input disabled"
                  value={bankForm.accName}
                  disabled
                  readOnly
                />
                <span className="kw-field-tag"><Icon name="lock" size={11} /> Verified Captain</span>
              </div>
              <small className="kw-hint-note">Must match your legal KYC name for direct bank transfer.</small>

              {/* Account Number */}
              <label className="kw-sec-label" style={{ marginTop: 14 }}>Bank Account Number</label>
              <input
                type="text"
                className="kw-field-input"
                placeholder="Enter 9–18 digit account number"
                value={bankForm.accNumber}
                onChange={(e) => setBankForm({ ...bankForm, accNumber: e.target.value.replace(/\D/g, '') })}
                inputMode="numeric"
                required
              />

              {/* Re-enter Account Number */}
              <label className="kw-sec-label" style={{ marginTop: 14 }}>Re-enter Bank Account Number</label>
              <input
                type="text"
                className={'kw-field-input' + (bankForm.accNumberRe && bankForm.accNumber !== bankForm.accNumberRe ? ' error' : '')}
                placeholder="Confirm bank account number"
                value={bankForm.accNumberRe}
                onChange={(e) => setBankForm({ ...bankForm, accNumberRe: e.target.value.replace(/\D/g, '') })}
                inputMode="numeric"
                required
              />
              {bankForm.accNumberRe && bankForm.accNumber !== bankForm.accNumberRe && (
                <small className="kw-error-txt">Account numbers do not match</small>
              )}

              {/* IFSC Code */}
              <label className="kw-sec-label" style={{ marginTop: 14 }}>Bank IFSC Code</label>
              <input
                type="text"
                className="kw-field-input"
                placeholder="e.g. SBIN0001234"
                value={bankForm.ifsc}
                onChange={(e) => setBankForm({ ...bankForm, ifsc: e.target.value.toUpperCase() })}
                maxLength={11}
                required
              />

              {detectedBank && (
                <div className="kw-bank-detect-pill">
                  <Icon name="building" size={14} />
                  <span>{detectedBank}</span>
                </div>
              )}

              {bankError && <div className="kw-error-msg"><Icon name="info" size={14} /> {bankError}</div>}
            </div>

            <div className="kw-footer-cta">
              <button
                type="submit"
                className="kw-primary-btn"
                disabled={!bankForm.accNumber || bankForm.accNumber !== bankForm.accNumberRe || bankForm.ifsc.length !== 11}
              >
                Submit Bank Account for Verification
              </button>
              <button
                type="button"
                className="kw-ghost-btn"
                onClick={() => setView('main')}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* ════════════════════════════════════════════════════════
            4. BANK VERIFICATION PENDING SCREEN (1–2 WORKING DAYS)
           ════════════════════════════════════════════════════════ */}
        {view === 'bank_in_review' && (() => {
          const activeBank = submittedBank || (payoutMethods.banks && payoutMethods.banks.length > 0 ? payoutMethods.banks[0] : null) || {
            bankName: 'State Bank of India — Barmer Branch',
            accLast4: '4821',
            ifsc: 'SBIN0001234',
            accName: k.name || 'Karigar Captain',
            status: 'IN_REVIEW',
          };
          const refId = `SARV-${activeBank.accLast4 ? `IMPS${activeBank.accLast4}` : 'MND8492'}`;

          return (
            <div className="kw-fintech-audit">
              {/* Bank Clearance Status Banner */}
              <div className="kw-audit-banner">
                <div className="kw-audit-banner-top">
                  <div className="kw-audit-node-badge">
                    <span className="kw-pulse-dot" />
                    <span>NPCI · IMPS CLEARING SWITCH</span>
                  </div>
                  <div className="kw-audit-ref">
                    REF: <span>{refId}</span>
                  </div>
                </div>

                <div className="kw-audit-headline">
                  <div className="kw-audit-bank-icon">
                    <Icon name="building" size={22} />
                  </div>
                  <div className="kw-audit-head-text">
                    <h3 className="kw-audit-title">Bank Verification in Progress</h3>
                    <p className="kw-audit-sub">
                      Automated Penny-Drop micro-deposit initiated with <strong>{activeBank.bankName}</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Stepper Timeline */}
              <div className="kw-fintech-card">
                <div className="kw-card-hdr">
                  <div className="kw-card-title">
                    <Icon name="history" size={15} />
                    <span>Verification Progress Ledger</span>
                  </div>
                  <span className="kw-eta-pill">Est. 1–2 Business Days</span>
                </div>

                <div className="kw-timeline">
                  {/* Step 1 */}
                  <div className="kw-tl-step done">
                    <div className="kw-tl-track">
                      <div className="kw-tl-node">
                        <Icon name="check" size={12} />
                      </div>
                      <div className="kw-tl-line" />
                    </div>
                    <div className="kw-tl-body">
                      <div className="kw-tl-row">
                        <span className="kw-tl-name">Bank Account Submitted</span>
                        <span className="kw-tl-tag done">Verified</span>
                      </div>
                      <p className="kw-tl-desc">
                        Account encrypted via 256-bit SSL and registered on the NPCI clearing network.
                      </p>
                      <span className="kw-tl-time">Logged · Clearance Initiated</span>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="kw-tl-step active">
                    <div className="kw-tl-track">
                      <div className="kw-tl-node active">
                        <span className="kw-node-pulse" />
                      </div>
                      <div className="kw-tl-line" />
                    </div>
                    <div className="kw-tl-body">
                      <div className="kw-tl-row">
                        <span className="kw-tl-name">₹1.00 Penny-Drop Micro-Deposit</span>
                        <span className="kw-tl-tag active">In Progress</span>
                      </div>
                      <p className="kw-tl-desc">
                        ₹1.00 test credit sent to match beneficiary legal name <strong>"{activeBank.accName}"</strong> with bank core system.
                      </p>
                      <span className="kw-tl-time">UTR: IMPS/2026/{activeBank.accLast4 || '8921'} · In Transit</span>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="kw-tl-step pending">
                    <div className="kw-tl-track">
                      <div className="kw-tl-node pending">
                        <Icon name="clock" size={12} />
                      </div>
                    </div>
                    <div className="kw-tl-body">
                      <div className="kw-tl-row">
                        <span className="kw-tl-name">Receiving Bank Clearance</span>
                        <span className="kw-tl-tag pending">Upcoming</span>
                      </div>
                      <p className="kw-tl-desc">
                        Beneficiary bank acknowledges account active status. Instant withdrawals unlock automatically upon confirmation.
                      </p>
                      <span className="kw-tl-time">Standard turnaround: 1–2 business days</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bank Mandate Details Dossier */}
              <div className="kw-fintech-card">
                <div className="kw-card-hdr">
                  <div className="kw-card-title">
                    <Icon name="card" size={15} />
                    <span>Submitted Account Dossier</span>
                  </div>
                  <div className="kw-secure-badge">
                    <Icon name="lock" size={11} />
                    <span>RBI Compliant</span>
                  </div>
                </div>

                <div className="kw-dossier-grid">
                  <div className="kw-dossier-item">
                    <span className="kw-dossier-label">BENEFICIARY NAME</span>
                    <span className="kw-dossier-val">{activeBank.accName}</span>
                  </div>
                  <div className="kw-dossier-item">
                    <span className="kw-dossier-label">BANK NAME</span>
                    <span className="kw-dossier-val">{activeBank.bankName}</span>
                  </div>
                  <div className="kw-dossier-item">
                    <span className="kw-dossier-label">ACCOUNT NUMBER</span>
                    <span className="kw-dossier-val mono">•••• •••• •••• {activeBank.accLast4 || '0000'}</span>
                  </div>
                  <div className="kw-dossier-item">
                    <span className="kw-dossier-label">IFSC CODE</span>
                    <span className="kw-dossier-val mono">{activeBank.ifsc || 'SBIN0000000'}</span>
                  </div>
                  <div className="kw-dossier-item">
                    <span className="kw-dossier-label">ROUTING NETWORK</span>
                    <span className="kw-dossier-val">NPCI Automated IMPS / NEFT</span>
                  </div>
                  <div className="kw-dossier-item">
                    <span className="kw-dossier-label">VERIFICATION PROTOCOL</span>
                    <span className="kw-dossier-val">Automated Penny-Drop v2</span>
                  </div>
                </div>

                <div className="kw-micro-note">
                  <Icon name="shield" size={13} />
                  <span>
                    A ₹1.00 credit will appear in your passbook or SMS statement under <strong>SARVOTTAM PAYOUTS</strong>. No debit will ever be charged to your account.
                  </span>
                </div>
              </div>

              {/* Fast Track UPI Bypass Callout */}
              <div className="kw-instant-bypass-card">
                <div className="kw-bypass-icon">
                  <Icon name="bolt" size={20} />
                </div>
                <div className="kw-bypass-info">
                  <strong>Need instant cash right now?</strong>
                  <p>
                    Don’t wait 1–2 days for bank clearance. Link your <strong>UPI ID</strong> for 100% verified, 60-second real-time withdrawals anytime 24×7.
                  </p>
                  <button
                    type="button"
                    className="kw-bypass-btn"
                    onClick={() => {
                      setUpiId('');
                      setVerifiedUpiName(null);
                      setView('add_upi');
                    }}
                  >
                    <span>Link UPI for Instant Payout</span>
                    <Icon name="arrow" size={14} />
                  </button>
                </div>
              </div>

              {/* Footer Action Buttons */}
              <div className="kw-footer-cta">
                <button
                  type="button"
                  className="kw-primary-btn"
                  onClick={() => setView('main')}
                >
                  Return to Wallet
                </button>
                <button
                  type="button"
                  className="kw-ghost-btn"
                  onClick={() => {
                    toast('Status refreshed: Penny-drop ₹1 verification active');
                  }}
                >
                  Refresh Verification Status
                </button>
              </div>
            </div>
          );
        })()}

        {/* ════════════════════════════════════════════════════════
            5. PROCESSING WITHDRAWAL
           ════════════════════════════════════════════════════════ */}
        {view === 'processing' && (
          <div className="kw-proc-screen">
            <div className="kw-spinner" />
            <h3>Processing Payout...</h3>
            <p>Initiating transfer of <strong>₹{amount}</strong> to your chosen payout method.</p>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════
            6. SUCCESS RECEIPT SCREEN
           ════════════════════════════════════════════════════════ */}
        {view === 'success' && (
          <div className="kw-success-screen">
            <div className="kw-success-badge">
              <Icon name="check" size={34} />
            </div>
            <h3 className="kw-success-title">₹{lastTx?.amount?.toLocaleString('en-IN')} Withdrawn!</h3>
            <p className="kw-success-sub">
              Payout transfer request successfully executed via Sarvottam Banking Network.
            </p>

            <div className="kw-receipt-card">
              <div className="kw-sum-row">
                <span>Transaction ID</span>
                <strong>{lastTx?.id}</strong>
              </div>
              <div className="kw-sum-row">
                <span>Bank UTR Reference</span>
                <strong>{lastTx?.utr}</strong>
              </div>
              <div className="kw-sum-row">
                <span>Transferred To</span>
                <strong>{lastTx?.method?.detail}</strong>
              </div>
              <div className="kw-sum-row">
                <span>Date &amp; Time</span>
                <strong>{lastTx?.date}</strong>
              </div>
              <div className="kw-sum-row">
                <span>Remaining Wallet</span>
                <strong>₹{(balance - (lastTx?.amount || 0)).toLocaleString('en-IN')}</strong>
              </div>
              <div className="kw-sum-row">
                <span>Transfer Status</span>
                <span className="kw-status-tag verified">COMPLETED (IMPS)</span>
              </div>
            </div>

            <div className="kw-footer-cta">
              <button
                type="button"
                className="kw-primary-btn"
                onClick={onBack}
              >
                Done &amp; Back to Earnings
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

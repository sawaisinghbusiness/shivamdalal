import { useState } from 'react';
import SubHeader from '../components/SubHeader';
import Icon from '../components/Icon';
import { useAppData } from '../store/AppData';
import { useToast } from '../components/Toast';
import './SavedAddresses.css';

const LABEL_ICONS = { Home: 'home', Office: 'building', Other: 'pin' };

export default function SavedAddresses() {
  const { addresses, addAddress, updateAddress, deleteAddress } = useAppData();
  const toast = useToast();
  const [editing, setEditing] = useState(null); // null | {} (new) | existing addr

  function openNew() { setEditing({ label: 'Home', full: '' }); }
  function openEdit(a) { setEditing(a); }

  function saveAddr() {
    const full = (editing.full || '').trim();
    if (full.length < 8) { toast('Please enter a complete address'); return; }
    const icon = LABEL_ICONS[editing.label] || 'pin';
    if (editing.id) {
      updateAddress(editing.id, { label: editing.label, full, icon });
      toast('Address updated successfully');
    } else {
      addAddress({ label: editing.label, full, icon });
      toast('New address added successfully');
    }
    setEditing(null);
  }

  function remove(id) {
    deleteAddress(id);
    toast('Address deleted');
  }

  return (
    <div className="sub-page">
      <SubHeader title="Saved Addresses" sub="Home, Office & delivery locations" />

      <div className="addr-list">
        {addresses.map((a) => (
          <div className="addr-card" key={a.id}>
            <div className="addr-ic"><Icon name={a.icon} size={20} /></div>
            <div className="addr-info">
              <strong>{a.label}</strong>
              <p>{a.full}</p>
            </div>
            <div className="addr-actions">
              <button onClick={() => openEdit(a)} aria-label="Edit"><Icon name="user" size={15} /></button>
              <button onClick={() => remove(a.id)} aria-label="Delete" className="del"><Icon name="close" size={15} /></button>
            </div>
          </div>
        ))}

        {addresses.length === 0 && <p className="addr-empty">No saved addresses yet. Add one below.</p>}
      </div>

      <div className="addr-add-wrap">
        <button className="addr-add" onClick={openNew}>
          <Icon name="plus" size={18} /> Add New Address
        </button>
      </div>

      {/* Add / Edit sheet */}
      {editing && (
        <div className="addr-overlay" onClick={() => setEditing(null)}>
          <div className="addr-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="addr-drag" />
            <h2 className="addr-sheet-title">{editing.id ? 'Edit Address' : 'New Address'}</h2>

            <p className="addr-label-row-title">Type</p>
            <div className="addr-type-row">
              {['Home', 'Office', 'Other'].map((l) => (
                <button key={l}
                  className={'addr-type' + (editing.label === l ? ' active' : '')}
                  onClick={() => setEditing((e) => ({ ...e, label: l }))}>
                  <Icon name={LABEL_ICONS[l]} size={18} /> {l}
                </button>
              ))}
            </div>

            <textarea className="addr-textarea" rows={3}
              value={editing.full}
              onChange={(e) => setEditing((s) => ({ ...s, full: e.target.value }))}
              placeholder="House/flat no., building name, street, landmark, city, pincode" autoFocus />

            <button className="btn-primary" onClick={saveAddr}>{editing.id ? 'Update' : 'Save'} Address</button>
            <button className="btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

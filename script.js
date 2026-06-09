/* ═══════════════════════════════════════════
   SARVOTTAM — App Script
═══════════════════════════════════════════ */

/* ── Screen Navigation ── */
function navigateTo(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const target = document.getElementById('screen-' + screenId);
  if (target) target.classList.add('active');

  const navBtn = document.querySelector(`.nav-item[data-screen="${screenId}"]`);
  if (navBtn) navBtn.classList.add('active');
}

document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    if (!btn.dataset.screen) return;
    navigateTo(btn.dataset.screen);
  });
});

document.querySelectorAll('.cat-card').forEach(card => {
  card.addEventListener('click', () => navigateTo(card.dataset.target));
});

/* Category horizontal cards */
document.querySelectorAll('.cat-card-h').forEach(btn => {
  btn.addEventListener('click', () => navigateTo(btn.dataset.target));
});

document.querySelectorAll('.view-all-btn').forEach(btn => {
  btn.addEventListener('click', () => navigateTo(btn.dataset.target));
});

/* ── Sub Tab Switching (bottom bar on Furniture / Painting / Bookings) ── */
document.querySelectorAll('.sub-tab-bar').forEach(bar => {
  bar.querySelectorAll('.sub-tab[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      bar.querySelectorAll('.sub-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const tabId = btn.dataset.tab;
      const screen = btn.closest('.screen');
      screen.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

      const targetContent = document.getElementById('tab-' + tabId);
      if (targetContent) {
        targetContent.classList.add('active');
        screen.querySelector('.screen-scroll').scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });
});

/* ── Wishlist Toggle ── */
document.querySelectorAll('.wishlist-btn').forEach(btn => {
  btn.addEventListener('click', e => {
    e.stopPropagation();
    const filled = btn.classList.toggle('liked');
    btn.style.color = filled ? '#ef4444' : '';
    const svg = btn.querySelector('.ic');
    if (svg) svg.style.fill = filled ? '#ef4444' : 'none';
    showToast(filled ? 'Added to wishlist' : 'Removed from wishlist');
  });
});

/* ── Time Chip Selection ── */
document.querySelectorAll('.time-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    chip.closest('.time-chips').querySelectorAll('.time-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
  });
});

/* ── Booking Modal ── */
let currentService = '';

function showBookingModal(serviceName) {
  currentService = serviceName;
  document.getElementById('modalTitle').textContent = 'Book – ' + serviceName;

  // Auto-fill name
  const nameField = document.getElementById('field-name');
  if (nameField && !nameField.value) nameField.value = 'Shivam Singh';

  // Set today's min date on date field
  const dateField = document.getElementById('field-date');
  if (dateField) {
    const today = new Date().toISOString().split('T')[0];
    dateField.min = today;
  }

  // Clear previous errors
  ['fg-name', 'fg-phone', 'fg-date'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('has-error', 'shake');
  });

  document.getElementById('bookingModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('bookingModal').classList.remove('open');
  document.body.style.overflow = '';
}

function shakeField(groupId) {
  const el = document.getElementById(groupId);
  if (!el) return;
  el.classList.add('has-error');
  el.classList.remove('shake');
  void el.offsetWidth; // force reflow to restart animation
  el.classList.add('shake');
}

function confirmBooking() {
  const name  = (document.getElementById('field-name')?.value  || '').trim();
  const phone = (document.getElementById('field-phone')?.value || '').trim();
  const date  = (document.getElementById('field-date')?.value  || '').trim();

  let hasError = false;

  if (!name) { shakeField('fg-name');  hasError = true; }
  else document.getElementById('fg-name')?.classList.remove('has-error');

  const phoneDigits = phone.replace(/\D/g, '');
  if (!phone || phoneDigits.length < 10) { shakeField('fg-phone'); hasError = true; }
  else document.getElementById('fg-phone')?.classList.remove('has-error');

  if (!date) { shakeField('fg-date'); hasError = true; }
  else document.getElementById('fg-date')?.classList.remove('has-error');

  if (hasError) return;

  // All valid — proceed
  closeModal();

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const iconMap = {
    'Electrician':       { cls: 'bk2-red',    svg: '<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor"/>' },
    'Plumber':           { cls: 'bk2-blue',   svg: '<path d="M12 2C8 2 5 5 5 9c0 2.4 1.2 4.5 3 5.7V20h2v2h4v-2h2v-5.3c1.8-1.2 3-3.3 3-5.7 0-4-3-7-7-7z" fill="currentColor"/>' },
    'Carpenter':         { cls: 'bk2-teal',   svg: '<path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' },
    'AC Repair':         { cls: 'bk2-cyan',   svg: '<path d="M12 2a5 5 0 00-5 5c0 3 2 5.5 5 7 3-1.5 5-4 5-7a5 5 0 00-5-5z" fill="currentColor"/>' },
    'Car Painter':       { cls: 'bk2-purple', svg: '<path d="M18.37 2.63L14 7l-1.59-1.59a2 2 0 00-2.82 0L8 7l9 9 1.59-1.59a2 2 0 000-2.82L17 10l4.37-4.37a.6.6 0 000-.85l-2.15-2.15a.6.6 0 00-.85 0z" fill="currentColor"/>' },
  };
  const icon = iconMap[currentService] || { cls: 'bk2-teal', svg: '<circle cx="12" cy="12" r="8" fill="currentColor"/>' };

  const itemHTML = `
    <div class="booking-item">
      <div class="bk2-icon ${icon.cls}">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">${icon.svg}</svg>
      </div>
      <div class="booking-details">
        <h3>${currentService}</h3>
        <p class="booking-sub">Booking requested</p>
        <p class="booking-date">${dateStr} · ${timeStr}</p>
      </div>
      <span class="booking-status pending">Pending</span>
    </div>`;

  document.getElementById('list-all').insertAdjacentHTML('afterbegin', itemHTML);
  document.getElementById('list-pending').insertAdjacentHTML('afterbegin', itemHTML);

  navigateTo('bookings');
  showToast('✓ Booking confirmed for ' + currentService);
}

document.getElementById('bookingModal').addEventListener('click', e => {
  if (e.target === document.getElementById('bookingModal')) closeModal();
});

/* ── Item Detail Sheet ── */
const detailFeatureMap = {
  default: [
    'Free measurement & site visit included',
    'ISI-certified wood and materials',
    'Delivery + installation in price',
    '1-year warranty on all work',
    'Pay 30% advance, rest on delivery'
  ]
};

function showItemDetail(name, price) {
  let overlay = document.getElementById('detailOverlay');

  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'detail-overlay';
    overlay.id = 'detailOverlay';
    overlay.innerHTML = `
      <div class="detail-sheet">
        <div class="detail-drag"></div>
        <h2 class="detail-name" id="detailName"></h2>
        <p class="detail-price" id="detailPrice"></p>
        <div class="detail-features" id="detailFeatures"></div>
        <button class="detail-book-btn" id="detailBookBtn">Book This Item</button>
      </div>
    `;
    document.querySelector('.app-wrapper').appendChild(overlay);

    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeDetailSheet();
    });

    document.getElementById('detailBookBtn').addEventListener('click', () => {
      closeDetailSheet();
      showBookingModal(document.getElementById('detailName').textContent);
    });
  }

  document.getElementById('detailName').textContent = name;
  document.getElementById('detailPrice').textContent = price;

  const features = detailFeatureMap.default;
  document.getElementById('detailFeatures').innerHTML = features
    .map(f => `<div class="detail-feature">${f}</div>`)
    .join('');

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeDetailSheet() {
  const overlay = document.getElementById('detailOverlay');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
}

/* ── Toast ── */
let toastTimer;

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

/* ── Notification Button ── */
document.getElementById('notifBtn').addEventListener('click', () => {
  showToast('No new notifications right now');
});

/* ── Location Picker ── */
const locOverlay   = document.getElementById('locOverlay');
const locList      = document.getElementById('locList');
const locSearchInp = document.getElementById('locSearchInput');
const locText      = document.querySelector('.hv2-location-btn span');

function openLocPicker() {
  locOverlay.classList.add('open');
  locSearchInp.value = '';
  filterLoc('');
  setTimeout(() => locSearchInp.focus(), 350);
}

function closeLocPicker() {
  locOverlay.classList.remove('open');
}

function filterLoc(query) {
  const q = query.trim().toLowerCase();
  locList.querySelectorAll('.loc-item').forEach(item => {
    const name = item.dataset.jila.toLowerCase();
    item.classList.toggle('hidden', q !== '' && !name.includes(q));
  });
}

function selectJila(jila) {
  locList.querySelectorAll('.loc-item').forEach(item => {
    const isSelected = item.dataset.jila === jila;
    item.classList.toggle('active', isSelected);
  });
  if (locText) locText.textContent = jila;
  showToast(`📍 ${jila}, Rajasthan set as location`);
  setTimeout(closeLocPicker, 260);
}

const locBtn = document.querySelector('.hv2-location-btn');
if (locBtn) locBtn.addEventListener('click', openLocPicker);

locOverlay.addEventListener('click', e => {
  if (e.target === locOverlay) closeLocPicker();
});

locSearchInp.addEventListener('input', e => filterLoc(e.target.value));

locList.addEventListener('click', e => {
  const item = e.target.closest('.loc-item');
  if (item) selectJila(item.dataset.jila);
});

/* ── Search ── */
const serviceRoutes = {
  electrician: 'emergency', electric: 'emergency', wiring: 'emergency', switch: 'emergency',
  plumber: 'emergency', pipe: 'emergency', leak: 'emergency', tap: 'emergency',
  carpenter: 'emergency', door: 'emergency', hinge: 'emergency', lock: 'emergency',
  ac: 'emergency', repair: 'emergency', cooling: 'emergency',
  furniture: 'furniture', bed: 'furniture', kitchen: 'furniture', wardrobe: 'furniture',
  sofa: 'furniture', office: 'furniture', table: 'furniture', shelf: 'furniture',
  paint: 'painting', painting: 'painting', colour: 'painting', color: 'painting', wall: 'painting',
};

function handleSearch(e) {
  e.preventDefault();
  const inp = document.getElementById('searchInput');
  const val = inp.value.trim().toLowerCase();
  if (!val) { showToast('Type a service name to search'); return; }

  const matched = Object.keys(serviceRoutes).find(k => val.includes(k));
  if (matched) {
    inp.value = '';
    inp.blur();
    navigateTo(serviceRoutes[matched]);
    showToast(`Showing results for "${inp.value || val}"`);
  } else {
    showToast(`No results for "${val}" — try Electrician, Furniture, Painting`);
  }
}

/* ── Greeting based on time ── */
(function setGreeting() {
  const hour = new Date().getHours();
  let greeting = 'Good Morning';
  if (hour >= 12 && hour < 17) greeting = 'Good Afternoon';
  else if (hour >= 17) greeting = 'Good Evening';

  const el = document.querySelector('.greeting-label');
  if (el) {
    const icon = hour < 12 ? '☀️' : hour < 17 ? '🌤️' : '🌙';
    el.textContent = `${greeting} ${icon}`;
  }
})();

/* ── Profile Sheet ── */
function openProfileSheet() {
  document.getElementById('profileOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeProfileSheet() {
  document.getElementById('profileOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

/* ── Swipe Down to close modals ── */
(function setupSwipeClose() {
  ['bookingModal', 'detailOverlay'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;

    const sheet = el.querySelector('.modal-sheet, .detail-sheet');
    if (!sheet) return;

    let startY = 0;
    let isDragging = false;

    sheet.addEventListener('touchstart', e => {
      startY = e.touches[0].clientY;
      isDragging = true;
    }, { passive: true });

    sheet.addEventListener('touchmove', e => {
      if (!isDragging) return;
      const dy = e.touches[0].clientY - startY;
      if (dy > 0) {
        sheet.style.transform = `translateY(${dy}px)`;
        sheet.style.transition = 'none';
      }
    }, { passive: true });

    sheet.addEventListener('touchend', e => {
      isDragging = false;
      const dy = e.changedTouches[0].clientY - startY;
      sheet.style.transition = '';
      sheet.style.transform = '';

      if (dy > 100) {
        if (id === 'bookingModal') closeModal();
        else closeDetailSheet();
      }
    });
  });
})();

/* ═══════════════════════════════════════════
   EMERGENCY TRACKING FLOW (Rapido jaisa)
═══════════════════════════════════════════ */
let trackStage = 1;       // 1 = searching, 2 = found
let trackStep  = 1;       // which live step is active (0..3)
let searchTimer;

const karigarBySkill = {
  'Electrician': { name: 'Ramesh Kumar', initial: 'R', skill: 'Electrician', eta: 8,  service: 400, ico: 'i-bolt' },
  'Plumber':     { name: 'Suresh Mali',  initial: 'S', skill: 'Plumber',     eta: 10, service: 350, ico: 'i-wrench' },
  'Carpenter':   { name: 'Mahesh Suthar',initial: 'M', skill: 'Carpenter',   eta: 12, service: 450, ico: 'i-wrench' },
  'AC Repair':   { name: 'Dinesh Jain',  initial: 'D', skill: 'AC Repair',   eta: 15, service: 600, ico: 'i-snow' },
  'Urgent Service': { name: 'Ramesh Kumar', initial: 'R', skill: 'Urgent help', eta: 7, service: 400, ico: 'i-bolt' },
};

let currentKarigar = null;   // jo abhi assign hua
let currentAddr = '';        // user ne jo address chuna/bhara
// note: currentService pehle se upar declared hai (booking modal ke liye)

const VISIT_CHARGE = 50;

/* STEP 1: Book Now dabate hi pehle address + charges sheet kholo (Karigar abhi NAHI dhoondhega) */
function startTracking(serviceName) {
  currentService = serviceName;
  const k = karigarBySkill[serviceName] || karigarBySkill['Urgent Service'];

  document.getElementById('ebookIco').innerHTML = '<svg class="ic"><use href="#' + k.ico + '"/></svg>';
  document.getElementById('ebookTitle').textContent = serviceName;
  document.getElementById('ebookSvc').textContent = '₹' + k.service;
  document.getElementById('ebookSvcLabel').textContent = serviceName + ' charge (approx)';
  const lo = k.service + VISIT_CHARGE;
  const hi = Math.round((k.service * 1.2 + VISIT_CHARGE) / 10) * 10;
  document.getElementById('ebookApprox').textContent = '₹' + lo + ' – ₹' + hi;

  // reset address selection (Ghar default)
  const addrs = document.querySelectorAll('.ebook-addr');
  addrs.forEach((a, i) => a.classList.toggle('active', i === 0));
  currentAddr = addrs[0] ? addrs[0].dataset.addr : '';
  document.getElementById('ebookNewAddr').value = '';
  document.getElementById('ebookNewAddr').style.display = 'none';
  document.getElementById('ebookProblem').value = '';

  document.getElementById('ebookOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function pickAddr(btn) {
  document.querySelectorAll('.ebook-addr').forEach(a => a.classList.remove('active'));
  btn.classList.add('active');
  currentAddr = btn.dataset.addr;
  document.getElementById('ebookNewAddr').style.display = 'none';
}

function toggleNewAddr() {
  const box = document.getElementById('ebookNewAddr');
  const show = box.style.display === 'none';
  box.style.display = show ? 'block' : 'none';
  if (show) {
    document.querySelectorAll('.ebook-addr').forEach(a => a.classList.remove('active'));
    box.focus();
  }
}

function closeEbook() {
  document.getElementById('ebookOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

/* STEP 2: Confirm dabaya → ab Karigar dhoondhna shuru (tracking) */
function confirmBookingAndFind() {
  const newAddr = document.getElementById('ebookNewAddr').value.trim();
  const newAddrVisible = document.getElementById('ebookNewAddr').style.display !== 'none';

  // address pakka karo
  if (newAddrVisible) {
    if (newAddr.length < 6) { showToast('Pura address daalein (area, landmark)'); return; }
    currentAddr = 'Naya — ' + newAddr + (newAddr.toLowerCase().includes('barmer') ? '' : ', Barmer');
  }
  if (!currentAddr) { showToast('Pehle address chunein ya daalein'); return; }

  closeEbook();
  beginTracking(currentService);
}

/* Karigar dhoondhna + tracking (pehle ye startTracking mein tha) */
function beginTracking(serviceName) {

  const overlay = document.getElementById('trackOverlay');
  const k = karigarBySkill[serviceName] || karigarBySkill['Urgent Service'];
  currentKarigar = k;

  // reset to searching stage
  trackStage = 1;
  trackStep = 1;
  document.getElementById('trackSearching').style.display = 'block';
  document.getElementById('trackFound').style.display = 'none';
  document.getElementById('trackHeadTitle').textContent = serviceName + ' · Emergency';
  document.getElementById('searchTitle').textContent = 'Karigar dhoondh rahe hain…';

  // fill karigar details for when found
  document.querySelector('.tk-avatar').textContent = k.initial;
  document.querySelector('.tk-info h3').textContent = k.name;
  document.getElementById('trackKarigarSkill').innerHTML =
    '<span class="tk-verified"><svg class="ic"><use href="#i-shield-check"/></svg> Verified</span> · ' + k.skill;
  document.getElementById('trackEta').textContent = k.eta + ' min';
  document.querySelector('.tow-eta-label').textContent = 'door';
  document.getElementById('trackToAddr').innerHTML = '<svg class="ic"><use href="#i-pin"/></svg> ' + currentAddr;

  // searching screen pe address dikhao
  document.getElementById('trackAddr').textContent = currentAddr;

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';

  // after 3.5s → Karigar found, phir status apne aap aage badhega
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    trackStage = 2;
    document.getElementById('trackSearching').style.display = 'none';
    document.getElementById('trackFound').style.display = 'block';
    resetSteps();
    showToast('✓ ' + k.name + ' ne aapki request accept ki');
    autoAdvance();   // Karigar dusri taraf se update kar raha hai (demo: auto)
  }, 3500);
}

let autoTimer;

function paintSteps() {
  document.querySelectorAll('#trackSteps .track-step').forEach(s => {
    const n = +s.dataset.step;
    s.classList.toggle('done',   n < trackStep);
    s.classList.toggle('active', n === trackStep);
  });
}

function resetSteps() {
  trackStep = 1;          // step 0 (mila) done, step 1 (aa raha hai) active
  paintSteps();
  setLiveNote('Karigar aapke ghar aa raha hai…');
}

function setLiveNote(text) {
  const el = document.getElementById('trackLiveText');
  if (el) el.textContent = text;
}

/* Status apne aap aage badhta hai — asli mein Karigar dusri app se update karta hai.
   User sirf dekhta hai (read-only), khud koi button nahi dabata. */
function autoAdvance() {
  clearTimeout(autoTimer);
  // aa raha hai (step1) → 3s baad kaam chalu (step2)
  autoTimer = setTimeout(() => {
    trackStep = 2;
    paintSteps();
    document.getElementById('trackEta').textContent = 'अभी';
    document.querySelector('.tow-eta-label').textContent = 'kaam chalu';
    setLiveNote('Karigar ne kaam shuru kar diya hai…');
    showToast('🔧 Karigar ne kaam shuru kiya');

    // 3.5s baad kaam poora (step3) → payment
    autoTimer = setTimeout(() => {
      trackStep = 3;
      paintSteps();
      document.getElementById('trackEta').textContent = '✓';
      document.querySelector('.tow-eta-label').textContent = 'poora';
      setLiveNote('Kaam poora ho gaya — ab payment');
      showToast('✓ Karigar ne kaam poora kiya');
      setTimeout(openPayment, 900);
    }, 3500);
  }, 3000);
}

/* ── Payment ── */
let payMethod = 'online';

function openPayment() {
  const k = currentKarigar || karigarBySkill['Urgent Service'];
  const service = k.service;
  const visit = 50;
  const tax = Math.round((service + visit) * 0.05);
  const total = service + visit + tax;

  document.getElementById('paySub').textContent = k.name + ' · ' + k.skill;
  document.getElementById('payService').textContent = '₹' + service;
  document.getElementById('payTax').textContent = '₹' + tax;
  document.getElementById('payTotal').textContent = '₹' + total;

  // default method = online
  payMethod = 'online';
  document.querySelectorAll('.pay-method').forEach(m =>
    m.classList.toggle('active', m.dataset.method === 'online'));
  updatePayCta(total);

  document.getElementById('payOverlay').dataset.total = total;
  document.getElementById('payOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function selectPayMethod(btn) {
  document.querySelectorAll('.pay-method').forEach(m => m.classList.remove('active'));
  btn.classList.add('active');
  payMethod = btn.dataset.method;
  updatePayCta(+document.getElementById('payOverlay').dataset.total);
}

function updatePayCta(total) {
  const cta = document.getElementById('payCta');
  cta.textContent = payMethod === 'online'
    ? '₹' + total + ' Online Pay karein'
    : '₹' + total + ' Cash mein dein';
}

function confirmPayment() {
  const total = document.getElementById('payOverlay').dataset.total;
  document.getElementById('payOverlay').classList.remove('open');
  closeTracking();
  if (payMethod === 'online') {
    showToast('✓ ₹' + total + ' online paid — dhanyavaad!');
  } else {
    showToast('✓ ₹' + total + ' cash — Karigar ko dein. Dhanyavaad!');
  }
  // Payment ke baad rating kholo
  setTimeout(openRating, 700);
}

/* ── Rating ── */
let rateValue = 0;
const rateWords = ['', 'Bahut kharab 😞', 'Theek nahi 😕', 'Theek-thaak 🙂', 'Achha 😊', 'Behtareen! 🤩'];

function openRating() {
  const k = currentKarigar || karigarBySkill['Urgent Service'];
  document.getElementById('rateAvatar').textContent = k.initial;
  document.getElementById('rateSub').textContent = k.name + ' · ' + k.skill;

  // reset
  rateValue = 0;
  paintStars();
  const word = document.getElementById('rateWord');
  word.textContent = 'Star tap karke rating dein';
  word.classList.remove('filled');
  document.querySelectorAll('.rate-chip').forEach(c => c.classList.remove('on'));
  document.getElementById('rateText').value = '';

  document.getElementById('rateOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function paintStars() {
  document.querySelectorAll('.rate-star').forEach(s => {
    s.classList.toggle('on', +s.dataset.val <= rateValue);
  });
}

function setRating(val) {
  rateValue = val;
  paintStars();
  const word = document.getElementById('rateWord');
  word.textContent = rateWords[val];
  word.classList.add('filled');
}

function toggleChip(btn) { btn.classList.toggle('on'); }

function submitRating() {
  if (rateValue === 0) {
    showToast('Pehle star tap karke rating dein');
    return;
  }
  closeRating();
  showToast('🙏 Aapki ' + rateValue + '★ rating ke liye dhanyavaad!');
}

function closeRating() {
  document.getElementById('rateOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

// Star tap/click listeners
document.querySelectorAll('.rate-star').forEach(star => {
  star.addEventListener('click', () => setRating(+star.dataset.val));
});

function closeTracking() {
  clearTimeout(searchTimer);
  clearTimeout(autoTimer);
  document.getElementById('trackOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

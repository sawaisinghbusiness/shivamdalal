/* ═══════════════════════════════════════════
   CRAFTCONNECT — App Script
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
  btn.addEventListener('click', () => navigateTo(btn.dataset.screen));
});

document.querySelectorAll('.cat-card').forEach(card => {
  card.addEventListener('click', () => navigateTo(card.dataset.target));
});

/* New V2 category buttons */
document.querySelectorAll('.hv2-cat').forEach(btn => {
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
    const filled = btn.textContent === '♥';
    btn.textContent = filled ? '♡' : '♥';
    btn.style.color = filled ? '' : '#ef4444';
    showToast(filled ? 'Removed from wishlist' : 'Added to wishlist ♥');
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
  document.getElementById('bookingModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('bookingModal').classList.remove('open');
  document.body.style.overflow = '';
}

function confirmBooking() {
  closeModal();
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

/* ── Search Bar Interaction ── */
const searchInput = document.querySelector('.hv2-search input');
if (searchInput) searchInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const val = e.target.value.trim();
    if (val) showToast(`Searching for "${val}"…`);
  }
});

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

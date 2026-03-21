// ============================================
// KONFIGURASI
// ============================================
const CONFIG = {
  particleInterval: 400,
  fireworkInterval: 4000,
  staticStarCount: 25,
  fireworkParticles: 25,
  bubbleInterval: 4000 // Durasi interval gelembung (ms)
};

// ===== Deteksi Device =====
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

// ===== Container & State =====
let particlesContainer = null;
let fireworksContainer = null;
let effectsEnabled = true;
let particleInterval = null;
let fireworkInterval = null;

// ===== Warna =====
const colors = ['#ffd700', '#ff6b6b', '#4d96ff', '#ff6eb4', '#6bcb77', '#fff'];

// ============================================
// FITUR GELEMBUNG HARAPAN (STATE)
// ============================================
let wishesContainer = null;
let wishInterval = null;
let activeBubbles = new Set();
let wishesEnabled = true; // <--- Variabel ini yang tadi kurang

const defaultWishes = [
  "Semoga sehat selalu 💪",
  "Minal aidzin wal faidzin 🌙",
  "Mohon maaf lahir dan batin 🙏",
  "Semoga rezeki lancar 💰",
  "Selamat hari raya! 🎉",
  "Semoga bahagia selalu 😊",
  "Eid Mubarak! ✨",
  "Semoga dimudahkan segala urusan 🤲",
  "Maafkan segala kesalahan 🙇",
  "Semoga panjang umur 🎂"
];

// ============================================
// FUNGSI UTAMA (PARTIKEL, BINTANG, KEMBANG API)
// ============================================

function createParticle() {
  if (!effectsEnabled || !particlesContainer) return;
  
  const particle = document.createElement('div');
  particle.className = 'particle';
  
  const size = Math.random() * 2 + 1;
  const x = Math.random() * window.innerWidth;
  const duration = 8 + Math.random() * 6;
  
  particle.style.cssText = `
    width: ${size}px;
    height: ${size}px;
    left: ${x}px;
    top: ${window.innerHeight}px;
    animation-duration: ${duration}s;
    background: ${colors[Math.floor(Math.random() * colors.length)]};
  `;
  
  particlesContainer.appendChild(particle);
  
  setTimeout(() => {
    if (particle.parentNode) particle.remove();
  }, duration * 1000);
}

function createStaticStars() {
  const container = document.createElement('div');
  container.className = 'static-stars';
  
  for (let i = 0; i < CONFIG.staticStarCount; i++) {
    const star = document.createElement('div');
    star.className = 'static-star';
    star.style.cssText = `
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      opacity: ${0.3 + Math.random() * 0.4};
    `;
    container.appendChild(star);
  }
  
  document.body.appendChild(container);
}

function createFirework(x, y) {
  if (!effectsEnabled || !fireworksContainer) return;
  
  const color = colors[Math.floor(Math.random() * colors.length)];
  const count = isMobile ? 20 : CONFIG.fireworkParticles;
  
  const glow = document.createElement('div');
  glow.style.cssText = `
    position: absolute;
    left: ${x}px;
    top: ${y}px;
    width: 100px;
    height: 100px;
    margin-left: -50px;
    margin-top: -50px;
    background: radial-gradient(circle, ${color}66 0%, transparent 70%);
    border-radius: 50%;
    animation: glowPulse 0.5s ease-out forwards;
    pointer-events: none;
  `;
  fireworksContainer.appendChild(glow);
  setTimeout(() => glow.remove(), 500);
  
  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div');
    particle.className = 'firework';
    
    const angle = (i / count) * Math.PI * 2;
    const velocity = 40 + Math.random() * 50;
    const tx = Math.cos(angle) * velocity;
    const ty = Math.sin(angle) * velocity;
    
    particle.style.cssText = `
      left: ${x}px;
      top: ${y}px;
      background: ${color};
      box-shadow: 0 0 6px ${color};
      --tx: ${tx}px;
      --ty: ${ty}px;
    `;
    
    fireworksContainer.appendChild(particle);
    setTimeout(() => particle.remove(), 1200);
  }
}

function launchAutoFirework() {
  if (!effectsEnabled) return;
  
  const x = 50 + Math.random() * (window.innerWidth - 100);
  const y = 50 + Math.random() * (window.innerHeight * 0.35);
  createFirework(x, y);
}

// ============================================
// KONTROL EFEK (START/STOP)
// ============================================

function startEffects() {
  // Partikel
  if (particleInterval) clearInterval(particleInterval);
  createParticle();
  particleInterval = setInterval(createParticle, CONFIG.particleInterval);
  
  // Kembang api
  if (fireworkInterval) clearInterval(fireworkInterval);
  launchAutoFirework();
  fireworkInterval = setInterval(launchAutoFirework, CONFIG.fireworkInterval);
  
  // Gelembung Harapan
  startWishBubbles();
}

function stopEffects() {
  if (particleInterval) {
    clearInterval(particleInterval);
    particleInterval = null;
  }
  if (fireworkInterval) {
    clearInterval(fireworkInterval);
    fireworkInterval = null;
  }
  
  stopWishBubbles();
  
  if (particlesContainer) particlesContainer.innerHTML = '';
  if (fireworksContainer) fireworksContainer.innerHTML = '';
}

// ============================================
// GELEMBUNG HARAPAN - FUNGSI
// ============================================

function initWishesContainer() {
  wishesContainer = document.getElementById('wishesContainer');
  if (!wishesContainer) {
    wishesContainer = document.createElement('div');
    wishesContainer.id = 'wishesContainer';
    wishesContainer.className = 'wishes-container';
    document.body.appendChild(wishesContainer);
  }
}

function createWishBubble(text) {
  if (!wishesEnabled || !wishesContainer) return;
  if (activeBubbles.has(text)) return;

  activeBubbles.add(text);

  const bubble = document.createElement('div');
  bubble.className = 'wish-bubble';
  
  const variant = Math.floor(Math.random() * 5);
  if (variant > 0) bubble.classList.add(`variant-${variant}`);
  
  const startY = 10 + Math.random() * 70;
  const duration = 18 + Math.random() * 12;
  
  bubble.style.cssText = `
    top: ${startY}%;
    --slide-duration: ${duration}s;
  `;
  
  bubble.textContent = text;
  wishesContainer.appendChild(bubble);

  setTimeout(() => {
    if (bubble.parentNode) bubble.remove();
    activeBubbles.delete(text);
  }, duration * 1000);
}

function getRandomWish() {
  let storedWishes = [];
  // Cek apakah MemoryManager sudah load
  if (typeof MemoryManager !== 'undefined') {
    storedWishes = MemoryManager.getAllWishes();
  }
  
  const allWishes = storedWishes.length > 0 
    ? storedWishes.map(w => w.text) 
    : [...defaultWishes];
  
  const availableWishes = allWishes.filter(wish => !activeBubbles.has(wish));
  
  if (availableWishes.length === 0) {
    return allWishes[Math.floor(Math.random() * allWishes.length)];
  }
  
  return availableWishes[Math.floor(Math.random() * availableWishes.length)];
}

function startWishBubbles() {
  if (wishInterval) return;
  
  createWishBubble(getRandomWish());
  
  wishInterval = setInterval(() => {
    if (!wishesEnabled) return;
    createWishBubble(getRandomWish());
  }, CONFIG.bubbleInterval);
}

function stopWishBubbles() {
  if (wishInterval) {
    clearInterval(wishInterval);
    wishInterval = null;
  }
  activeBubbles.clear();
  if (wishesContainer) wishesContainer.innerHTML = '';
}

// ============================================
// MODAL & UI
// ============================================

function createWishModal() {
  const modal = document.createElement('div');
  modal.className = 'wish-modal';
  modal.id = 'wishModal';
  
  modal.innerHTML = `
    <div class="wish-modal-content">
      <div class="wish-modal-header">
        <h3>✨ Tulis Harapanmu</h3>
        <button class="wish-modal-close" onclick="closeWishModal()">&times;</button>
      </div>
      <div class="wish-input-group">
        <textarea class="wish-textarea" id="wishInput" placeholder="Tulis harapan atau ucapan Idul Fitrimu di sini..." maxlength="100"></textarea>
      </div>
      <div class="wish-counter"><span id="wishCharCount">0</span>/100</div>
      <div class="wish-modal-footer">
        <button class="wish-btn wish-btn-secondary" onclick="showWishHistory()">📜 Riwayat</button>
        <button class="wish-btn wish-btn-cancel" onclick="closeWishModal()">Batal</button>
        <button class="wish-btn wish-btn-send" onclick="sendWish()">Kirim 🚀</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  const textarea = document.getElementById('wishInput');
  const counter = document.getElementById('wishCharCount');
  
  textarea.addEventListener('input', () => {
    counter.textContent = textarea.value.length;
  });
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeWishModal();
  });
}

function openWishModal() {
  const modal = document.getElementById('wishModal');
  if (modal) {
    modal.classList.add('active');
    document.getElementById('wishInput').focus();
  }
}

function closeWishModal() {
  const modal = document.getElementById('wishModal');
  if (modal) {
    modal.classList.remove('active');
    const input = document.getElementById('wishInput');
    const nameInput = document.getElementById('wishNameInput');
    if (input) {
      input.value = '';
      document.getElementById('wishCharCount').textContent = '0';
    }
    if (nameInput) {
      nameInput.value = '';
    }
  }
}

function sendWish() {
  if (typeof MemoryManager === 'undefined') {
    showNotification('❌ Sistem memory belum siap');
    return;
  }

  const textarea = document.getElementById('wishInput');
  const nameInput = document.getElementById('wishNameInput'); // Elemen ini mungkin tidak ada
  
  const text = textarea.value.trim();
  // Gunakan logika OR (||), jika nameInput tidak ada (null), langsung pakai 'Anonim'
  const author = (nameInput && nameInput.value.trim()) ? nameInput.value.trim() : 'Anonim';
  
  if (!text) {
    showNotification('Harap isi harapan terlebih dahulu! 🙏');
    textarea.focus();
    return;
  }
  
  const result = MemoryManager.saveWish(text, author);
  
  if (result.duplicate) {
    showNotification('⚠️ Harapan ini sudah pernah dikirim!');
    return;
  }
  
  if (result.success) {
    showNotification('✨ Harapanmu berhasil disimpan!');
    createWishBubble(text);
    closeWishModal();
  } else {
    showNotification('❌ Gagal menyimpan harapan');
  }
}

function createHistoryModal() {
  const modal = document.createElement('div');
  modal.className = 'wish-modal';
  modal.id = 'historyModal';
  
  modal.innerHTML = `
    <div class="wish-modal-content wish-history-content">
      <div class="wish-modal-header">
        <h3>📜 Riwayat Harapan</h3>
        <button class="wish-modal-close" onclick="closeHistoryModal()">&times;</button>
      </div>
      <div class="wish-history-actions">
        <button class="wish-btn wish-btn-secondary" onclick="exportWishes()">📥 Export JSON</button>
        <label class="wish-btn wish-btn-secondary">
          📤 Import
          <input type="file" id="importFile" accept=".json" style="display:none" onchange="importWishes(event)">
        </label>
      </div>
      <div class="wish-history-stats" id="wishStats"></div>
      <div class="wish-history-list" id="wishHistoryList"></div>
    </div>
  `;
  
  document.body.appendChild(modal);
}

function showWishHistory() {
  closeWishModal();
  
  let historyModal = document.getElementById('historyModal');
  if (!historyModal) {
    createHistoryModal();
  }
  
  renderWishHistory();
  document.getElementById('historyModal').classList.add('active');
}

function closeHistoryModal() {
  const modal = document.getElementById('historyModal');
  if (modal) modal.classList.remove('active');
}

function renderWishHistory() {
  if (typeof MemoryManager === 'undefined') return;

  const wishes = MemoryManager.getAllWishes();
  const stats = MemoryManager.getStats();
  
  const statsEl = document.getElementById('wishStats');
  if (statsEl) {
    statsEl.innerHTML = `
      <div class="wish-stat-item">
        <span class="wish-stat-number">${wishes.length}</span>
        <span class="wish-stat-label">Total Harapan</span>
      </div>
      <div class="wish-stat-item">
        <span class="wish-stat-number">${MemoryManager.getMemoryUsage()}</span>
        <span class="wish-stat-label">Memory Used</span>
      </div>
    `;
  }
  
  const listEl = document.getElementById('wishHistoryList');
  if (!listEl) return;
  
  if (wishes.length === 0) {
    listEl.innerHTML = `<div class="wish-empty"><p>Belum ada harapan.</p><p>Yuk tulis harapanmu! ✨</p></div>`;
    return;
  }
  
  const sorted = [...wishes].sort((a, b) => b.timestamp - a.timestamp);
  
  listEl.innerHTML = sorted.map(wish => `
    <div class="wish-history-item" data-id="${wish.id}">
      <div class="wish-history-text">"${escapeHtml(wish.text)}"</div>
      <div class="wish-history-meta">
        <span class="wish-history-author">- ${escapeHtml(wish.author)}</span>
        <span class="wish-history-date">${wish.readableDate || new Date(wish.timestamp).toLocaleDateString('id-ID')}</span>
      </div>
      <button class="wish-delete-btn" onclick="deleteWishFromHistory('${wish.id}')">🗑️</button>
    </div>
  `).join('');
}

function deleteWishFromHistory(id) {
  if (confirm('Hapus harapan ini?') && typeof MemoryManager !== 'undefined') {
    MemoryManager.deleteWish(id);
    renderWishHistory();
    showNotification('🗑️ Harapan dihapus');
  }
}

function exportWishes() {
  if (typeof MemoryManager !== 'undefined') {
    MemoryManager.exportToJson();
    showNotification('📥 Data berhasil di-export!');
  }
}

function importWishes(event) {
  const file = event.target.files[0];
  if (!file || typeof MemoryManager === 'undefined') return;
  
  MemoryManager.importFromJson(file)
    .then(result => {
      showNotification(result.message);
      renderWishHistory();
    })
    .catch(error => {
      showNotification('❌ ' + error.error);
    });
  
  event.target.value = '';
}

function showNotification(message) {
  const existingNotif = document.querySelector('.wish-notification');
  if (existingNotif) existingNotif.remove();
  
  const notif = document.createElement('div');
  notif.className = 'wish-notification';
  notif.textContent = message;
  document.body.appendChild(notif);
  
  setTimeout(() => notif.classList.add('show'), 10);
  
  setTimeout(() => {
    notif.classList.remove('show');
    setTimeout(() => notif.remove(), 300);
  }, 3000);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============================================
// TOGGLE EFEK
// ============================================

function createToggleButton() {
  const btn = document.createElement('button');
  btn.id = 'effectsToggle';
  btn.className = 'effects-toggle active';
  btn.innerHTML = '✨ON';
  btn.setAttribute('aria-label', 'Toggle efek animasi');
  
  btn.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    effectsEnabled = !effectsEnabled;
    wishesEnabled = effectsEnabled; // Sinkronkan status wishes
    
    if (effectsEnabled) {
      this.innerHTML = '✨ON';
      this.classList.add('active');
      startEffects();
    } else {
      this.innerHTML = '✨OFF';
      this.classList.remove('active');
      stopEffects();
    }
  });
  
  document.body.appendChild(btn);
}

// ============================================
// MAIN INITIALIZATION
// ============================================

function init() {
  // 1. Container Partikel & Kembang Api
  particlesContainer = document.getElementById('particles');
  if (!particlesContainer) {
    particlesContainer = document.createElement('div');
    particlesContainer.id = 'particles';
    particlesContainer.className = 'particles';
    document.body.appendChild(particlesContainer);
  }
  
  fireworksContainer = document.createElement('div');
  fireworksContainer.className = 'fireworks-container';
  document.body.appendChild(fireworksContainer);
  
  // 2. Inisialisasi Sistem Harapan (Gelembung + Memory)
  initWishesContainer();
  createWishModal();
  
  // 3. Elemen Lain
  createStaticStars();
  createToggleButton();
  
  // 4. Event Listener Tombol Share
  const shareBtn = document.getElementById('shareBtn');
  if (shareBtn) {
    shareBtn.addEventListener('click', async function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      const shareData = {
        title: 'Selamat Hari Raya Idul Fitri',
        text: 'Selamat Hari Raya Idul Fitri 1447 H. Minal aidzin wal faidzin, mohon maaf lahir dan batin🙏.',
        url: window.location.href
      };
      
      try {
        if (navigator.share && isMobile) {
          await navigator.share(shareData);
        } else {
          await navigator.clipboard.writeText(shareData.text + ' ' + shareData.url);
          alert('✓ Ucapan disalin ke clipboard!');
        }
      } catch (err) {}
    });
  }
  
  // 5. Event Listener Tombol Harapan (Wish Button)
  const wishBtn = document.getElementById('wishBtn');
  if (wishBtn) {
    wishBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openWishModal();
    });
  }
  
  // 6. Event Klik/Tap untuk Kembang Api
  let lastTap = 0;
  function handleTap(e) {
    const now = Date.now();
    if (now - lastTap < 300) return;
    lastTap = now;
    
    if (e.target.closest('.effects-toggle, .btn, button, .wish-modal')) return;
    
    let x, y;
    if (e.touches && e.touches.length > 0) {
      x = e.touches[0].clientX;
      y = e.touches[0].clientY;
    } else if (e.changedTouches && e.changedTouches.length > 0) {
      x = e.changedTouches[0].clientX;
      y = e.changedTouches[0].clientY;
    } else {
      x = e.clientX;
      y = e.clientY;
    }
    
    if (x !== undefined && y !== undefined) {
      createFirework(x, y);
    }
  }
  
  document.addEventListener('click', handleTap);
  document.addEventListener('touchend', handleTap, { passive: false });
  
  // 7. Mulai Semua Efek
  startEffects();
  
  // 8. Inject CSS Animation untuk Glow
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes glowPulse {
      0% { opacity: 1; transform: scale(0.5); }
      100% { opacity: 0; transform: scale(1.5); }
    }
  `;
  document.head.appendChild(styleSheet);
  
  console.log('🎉 Website Idul Fitri initialized!');
}

// ============================================
// VISIBILITY & RESIZE HANDLER
// ============================================

document.addEventListener('visibilitychange', function() {
  if (document.hidden) {
    stopEffects();
  } else if (effectsEnabled) {
    startEffects();
  }
});

let resizeTimeout;
window.addEventListener('resize', function() {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(function() {
    if (effectsEnabled) {
      stopEffects();
      setTimeout(startEffects, 100);
    }
  }, 250);
});

// ============================================
// EXPORT GLOBAL FUNCTIONS (untuk onclick HTML)
// ============================================

window.closeWishModal = closeWishModal;
window.sendWish = sendWish;
window.openWishModal = openWishModal;
window.showWishHistory = showWishHistory;
window.closeHistoryModal = closeHistoryModal;
window.deleteWishFromHistory = deleteWishFromHistory;
window.exportWishes = exportWishes;
window.importWishes = importWishes;

// ============================================
// RUN INIT
// ============================================

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
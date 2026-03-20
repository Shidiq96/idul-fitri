// ===== Konfigurasi =====
const CONFIG = {
  particleInterval: 400,
  fireworkInterval: 4000,
  staticStarCount: 25,
  fireworkParticles: 25
};

// ===== Deteksi Device =====
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

// ===== Container =====
let particlesContainer = null;
let fireworksContainer = null;
let effectsEnabled = true;
let particleInterval = null;
let fireworkInterval = null;

// ===== Warna =====
const colors = ['#ffd700', '#ff6b6b', '#4d96ff', '#ff6eb4', '#6bcb77', '#fff'];

// ===== Fungsi Partikel Bintang =====
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
    if (particle.parentNode) {
      particle.remove();
    }
  }, duration * 1000);
}

// ===== Fungsi Bintang Statis =====
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

// ===== Fungsi Kembang Api =====
function createFirework(x, y) {
  if (!effectsEnabled || !fireworksContainer) return;
  
  const color = colors[Math.floor(Math.random() * colors.length)];
  const count = isMobile ? 20 : CONFIG.fireworkParticles;
  
  // Efek glow
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
  
  // Partikel
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

// ===== Start Effects =====
function startEffects() {
  // Partikel
  if (particleInterval) clearInterval(particleInterval);
  createParticle(); // Buat satu langsung
  particleInterval = setInterval(createParticle, CONFIG.particleInterval);
  
  // Kembang api
  if (fireworkInterval) clearInterval(fireworkInterval);
  launchAutoFirework(); // Langsung tembak satu
  fireworkInterval = setInterval(launchAutoFirework, CONFIG.fireworkInterval);
}

// ===== Stop Effects =====
function stopEffects() {
  if (particleInterval) {
    clearInterval(particleInterval);
    particleInterval = null;
  }
  if (fireworkInterval) {
    clearInterval(fireworkInterval);
    fireworkInterval = null;
  }
  
  // Bersihkan container
  if (particlesContainer) particlesContainer.innerHTML = '';
  if (fireworksContainer) fireworksContainer.innerHTML = '';
}

// ===== Toggle Button =====
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
  
  // Touch event untuk mobile
  btn.addEventListener('touchend', function(e) {
    e.preventDefault();
    e.stopPropagation();
    this.click();
  });
  
  document.body.appendChild(btn);
}

// ===== Event Klik/Tap untuk Kembang Api =====
let lastTap = 0;

function handleTap(e) {
  // Cegah double tap zoom
  const now = Date.now();
  if (now - lastTap < 300) return;
  lastTap = now;
  
  // Jangan trigger jika klik tombol
  if (e.target.closest('.effects-toggle') || 
      e.target.closest('.btn') || 
      e.target.closest('button')) {
    return;
  }
  
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

// ===== Tombol Share =====
function setupShareButton() {
  const shareBtn = document.getElementById('shareBtn');
  if (!shareBtn) return;
  
  shareBtn.addEventListener('click', async function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const shareData = {
      title: 'Selamat Hari Raya Idul Fitri',
      text: 'Selamat Hari Raya Idul Fitri 1447 H. Minal aidzin wal faidzin, mohon maaf lahir dan batin.',
      url: window.location.href
    };
    
    try {
      if (navigator.share && isMobile) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.text + ' ' + shareData.url);
        alert('✓ Ucapan disalin ke clipboard!');
      }
    } catch (err) {
      // User cancel atau error, ignore
    }
  });
}

// ===== Inisialisasi =====
function init() {
  // Buat container
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
  
  // Buat bintang statis
  createStaticStars();
  
  // Buat toggle button
  createToggleButton();
  
  // Setup share button
  setupShareButton();
  
  // Event listener untuk tap/klik
  document.addEventListener('click', handleTap);
  document.addEventListener('touchend', handleTap, { passive: false });
  
  // Mulai efek
  startEffects();
  
  // Debug - log ke console
  console.log('🎉 Website Idul Fitri initialized!');
  console.log('📱 Mobile:', isMobile);
  console.log('👆 Touch device:', isTouchDevice);
}

// ===== CSS Animation untuk Glow =====
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes glowPulse {
    0% { opacity: 1; transform: scale(0.5); }
    100% { opacity: 0; transform: scale(1.5); }
  }
`;
document.head.appendChild(styleSheet);

// ===== Visibility Change =====
document.addEventListener('visibilitychange', function() {
  if (document.hidden) {
    stopEffects();
  } else if (effectsEnabled) {
    startEffects();
  }
});

// ===== Resize Handler =====
let resizeTimeout;
window.addEventListener('resize', function() {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(function() {
    // Restart effects on resize
    if (effectsEnabled) {
      stopEffects();
      setTimeout(startEffects, 100);
    }
  }, 250);
});

// ===== Run on DOM Ready =====
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// ===== Fallback: Run after 1 second jika belum =====
setTimeout(function() {
  if (!particlesContainer || !fireworksContainer) {
    console.log('⚠️ Reinitializing...');
    init();
  }
}, 1000);
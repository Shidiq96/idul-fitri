// ===== Konfigurasi Ringan =====
const CONFIG = {
  particleInterval: 500,        // Lebih lambat (500ms vs 80ms)
  fireworkInterval: 5000,       // Lebih jarang (5 detik)
  staticStarCount: 30,          // Kurangi bintang statis
  particleCount: 20,            // Kurangi partikel kembang api
  enableOnMobile: true          // Aktifkan di mobile
};

// ===== Deteksi Device =====
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const isLowEndDevice = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;

// Auto reduce motion untuk device low-end
if (isLowEndDevice || (isMobile && window.innerWidth < 400)) {
  document.body.classList.add('reduce-motion');
  CONFIG.particleInterval = 1000;
  CONFIG.fireworkInterval = 8000;
  CONFIG.staticStarCount = 15;
}

// ===== Partikel Bintang =====
const particlesContainer = document.getElementById('particles');
let particleEnabled = true;

function createParticle() {
  if (!particleEnabled) return;
  
  const particle = document.createElement('div');
  particle.classList.add('particle');

  const size = Math.random() * 2 + 1;
  const x = Math.random() * window.innerWidth;
  const duration = 10 + Math.random() * 8;

  particle.style.width = size + 'px';
  particle.style.height = size + 'px';
  particle.style.left = x + 'px';
  particle.style.top = window.innerHeight + 'px';
  particle.style.animationDuration = duration + 's';

  particlesContainer.appendChild(particle);

  setTimeout(() => particle.remove(), duration * 1000);
}

let particleInterval = setInterval(createParticle, CONFIG.particleInterval);

// ===== Bintang Statis =====
function createStaticStars() {
  const starLayer = document.createElement('div');
  starLayer.classList.add('static-stars');
  document.body.appendChild(starLayer);

  for (let i = 0; i < CONFIG.staticStarCount; i++) {
    const star = document.createElement('div');
    star.classList.add('static-star');
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    starLayer.appendChild(star);
  }
}

// ===== Kembang Api (Ringan) =====
const fireworksContainer = document.createElement('div');
fireworksContainer.classList.add('fireworks-container');
document.body.appendChild(fireworksContainer);

const fireworkColors = [
  '#ffd700', '#ff6b6b', '#4d96ff', '#ff6eb4', '#6bcb77'
];

function createFirework(x, y) {
  const color = fireworkColors[Math.floor(Math.random() * fireworkColors.length)];
  
  // Kurangi partikel untuk mobile
  const count = isMobile ? 15 : CONFIG.particleCount;

  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div');
    particle.classList.add('firework');

    const angle = (i / count) * Math.PI * 2;
    const velocity = 50 + Math.random() * 60;
    const tx = Math.cos(angle) * velocity;
    const ty = Math.sin(angle) * velocity;

    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    particle.style.background = color;
    particle.style.boxShadow = `0 0 4px ${color}`;
    particle.style.setProperty('--tx', tx + 'px');
    particle.style.setProperty('--ty', ty + 'px');

    fireworksContainer.appendChild(particle);
    setTimeout(() => particle.remove(), 1200);
  }
}

function launchFirework() {
  const x = 50 + Math.random() * (window.innerWidth - 100);
  const y = 50 + Math.random() * (window.innerHeight * 0.3);
  createFirework(x, y);
}

let fireworkInterval;

function startFireworks() {
  launchFirework();
  fireworkInterval = setInterval(launchFirework, CONFIG.fireworkInterval);
}

// ===== Toggle Efek =====
function createEffectsToggle() {
  const toggle = document.createElement('button');
  toggle.classList.add('effects-toggle');
  toggle.textContent = '✨ Efek ON';
  toggle.setAttribute('aria-label', 'Toggle effects');
  
  let effectsEnabled = true;
  
  toggle.addEventListener('click', () => {
    effectsEnabled = !effectsEnabled;
    particleEnabled = effectsEnabled;
    
    if (effectsEnabled) {
      toggle.textContent = '✨ Efek ON';
      toggle.classList.add('active');
      particleInterval = setInterval(createParticle, CONFIG.particleInterval);
      startFireworks();
    } else {
      toggle.textContent = '✨ Efek OFF';
      toggle.classList.remove('active');
      clearInterval(particleInterval);
      clearInterval(fireworkInterval);
      // Hapus partikel yang ada
      particlesContainer.innerHTML = '';
      fireworksContainer.innerHTML = '';
    }
  });
  
  if (!document.body.classList.contains('reduce-motion')) {
    toggle.classList.add('active');
  }
  
  document.body.appendChild(toggle);
}

// ===== Event Klik untuk Kembang Api =====
let clickTimeout;
document.addEventListener('click', (e) => {
  // Debounce untuk mencegah spam klik
  if (clickTimeout) return;
  
  clickTimeout = setTimeout(() => {
    clickTimeout = null;
  }, 300);
  
  createFirework(e.clientX, e.clientY);
});

// ===== Tombol Share =====
const shareBtn = document.getElementById('shareBtn');
if (shareBtn) {
  shareBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    
    const shareData = {
      title: 'Selamat Hari Raya Idul Fitri',
      text: 'Selamat Hari Raya Idul Fitri 1447 H. Minal aidzin wal faidzin, mohon maaf lahir dan batin.',
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareData.text + ' ' + shareData.url)
        .then(() => alert('Ucapan disalin ke clipboard!'))
        .catch(() => {});
    }
  });
}

// ===== Inisialisasi =====
document.addEventListener('DOMContentLoaded', () => {
  createStaticStars();
  
  // Hanya jalankan efek jika tidak low-end
  if (!document.body.classList.contains('reduce-motion')) {
    startFireworks();
  }
  
  createEffectsToggle();
});

// ===== Pause saat tab tidak aktif =====
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    clearInterval(particleInterval);
    clearInterval(fireworkInterval);
  } else if (particleEnabled) {
    particleInterval = setInterval(createParticle, CONFIG.particleInterval);
    fireworkInterval = setInterval(launchFirework, CONFIG.fireworkInterval);
  }
});
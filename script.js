// ===== Konfigurasi =====
const CONFIG = {
  particleInterval: 80,        // Interval partikel bintang (ms) - lebih cepat
  fireworkInterval: 2000,      // Interval kembang api (ms)
  starCount: 100,              // Jumlah bintang statis
  maxFireworks: 5              // Maksimal kembang api sekaligus
};

// ===== Partikel Bintang Berjalan =====
const particlesContainer = document.getElementById('particles');

function createParticle() {
  const particle = document.createElement('div');
  particle.classList.add('particle');

  const size = Math.random() * 4 + 1; // 1-5px (lebih besar)
  const x = Math.random() * window.innerWidth;
  const duration = 6 + Math.random() * 10; // 6-16 detik
  const delay = Math.random() * 3;

  // Warna bintang random (putih, kuning, gold)
  const colors = ['#ffffff', '#fffacd', '#ffd700', '#f0e68c', '#fafad2'];
  const color = colors[Math.floor(Math.random() * colors.length)];

  particle.style.width = size + 'px';
  particle.style.height = size + 'px';
  particle.style.left = x + 'px';
  particle.style.top = window.innerHeight + 'px';
  particle.style.animationDuration = duration + 's';
  particle.style.animationDelay = delay + 's';
  particle.style.background = color;
  particle.style.boxShadow = `0 0 ${size * 2}px ${color}`;

  particlesContainer.appendChild(particle);

  setTimeout(() => {
    particle.remove();
  }, (duration + delay) * 1000);
}

// Buat partikel lebih sering
setInterval(createParticle, CONFIG.particleInterval);

// ===== Bintang Statis Berkedip =====
function createStaticStars() {
  const starLayer = document.createElement('div');
  starLayer.classList.add('star-layer');
  document.body.appendChild(starLayer);

  for (let i = 0; i < CONFIG.starCount; i++) {
    const star = document.createElement('div');
    
    // 30% chance untuk bintang bentuk bintang
    if (Math.random() < 0.3) {
      star.classList.add('star-shape');
      star.style.setProperty('--star-size', (Math.random() * 12 + 8) + 'px');
      star.style.setProperty('--star-color', getRandomStarColor());
    } else {
      star.classList.add('twinkling-star');
      star.style.width = (Math.random() * 4 + 2) + 'px';
      star.style.height = star.style.width;
      star.style.background = getRandomStarColor();
    }

    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    star.style.setProperty('--duration', (2 + Math.random() * 4) + 's');
    star.style.setProperty('--delay', Math.random() * 3 + 's');

    starLayer.appendChild(star);
  }
}

function getRandomStarColor() {
  const colors = [
    '#ffffff',   // putih
    '#ffd700',   // gold
    '#fffacd',   // lemon chiffon
    '#f0e68c',   // khaki
    '#add8e6',   // light blue
    '#ffb6c1',   // light pink
    '#d4af37'    // gold accent
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// ===== Efek Kembang Api =====
const fireworksContainer = document.createElement('div');
fireworksContainer.classList.add('fireworks-container');
document.body.appendChild(fireworksContainer);

// Warna-warna kembang api
const fireworkColors = [
  ['#ff6b6b', '#ee5a5a', '#ff8787'], // Merah
  ['#ffd93d', '#ffec8b', '#fff176'], // Kuning/Gold
  ['#6bcb77', '#4ade80', '#86efac'], // Hijau
  ['#4d96ff', '#60a5fa', '#93c5fd'], // Biru
  ['#ff6eb4', '#ff85c1', '#ffa6d1'], // Pink
  ['#a855f7', '#c084fc', '#d8b4fe'], // Ungu
  ['#f97316', '#fb923c', '#fdba74'], // Orange
  ['#14b8a6', '#2dd4bf', '#5eead4'], // Teal
  ['#d4af37', '#f7d774', '#ffeaa7'], // Gold
  ['#ffffff', '#f0f0f0', '#e0e0e0']  // Putih
];

function createFirework(x, y) {
  const colorSet = fireworkColors[Math.floor(Math.random() * fireworkColors.length)];
  const particleCount = 60 + Math.floor(Math.random() * 40); // 60-100 partikel
  const size = 4 + Math.random() * 4;

  // Efek glow burst di tengah
  const glow = document.createElement('div');
  glow.classList.add('glow-burst');
  glow.style.left = x + 'px';
  glow.style.top = y + 'px';
  glow.style.width = '200px';
  glow.style.height = '200px';
  glow.style.marginLeft = '-100px';
  glow.style.marginTop = '-100px';
  glow.style.background = `radial-gradient(circle, ${colorSet[0]}88 0%, transparent 70%)`;
  fireworksContainer.appendChild(glow);
  setTimeout(() => glow.remove(), 600);

  // Buat partikel kembang api
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.classList.add('firework');

    // Hitung sudut dan jarak untuk efek meledak melingkar
    const angle = (i / particleCount) * Math.PI * 2;
    const velocity = 80 + Math.random() * 120;
    const tx = Math.cos(angle) * velocity;
    const ty = Math.sin(angle) * velocity;

    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    particle.style.background = colorSet[Math.floor(Math.random() * colorSet.length)];
    particle.style.boxShadow = `0 0 ${size * 2}px ${colorSet[0]}, 0 0 ${size * 4}px ${colorSet[0]}`;
    particle.style.setProperty('--tx', tx + 'px');
    particle.style.setProperty('--ty', ty + 'px');

    fireworksContainer.appendChild(particle);

    // Hapus setelah animasi selesai
    setTimeout(() => particle.remove(), 1500);
  }

  // Tambah percikan kecil
  for (let i = 0; i < 20; i++) {
    setTimeout(() => {
      const sparkle = document.createElement('div');
      sparkle.classList.add('firework-particle');
      
      const offsetX = x + (Math.random() - 0.5) * 100;
      const offsetY = y + (Math.random() - 0.5) * 100;
      
      sparkle.style.left = offsetX + 'px';
      sparkle.style.top = offsetY + 'px';
      sparkle.style.background = colorSet[Math.floor(Math.random() * colorSet.length)];
      sparkle.style.boxShadow = `0 0 6px ${colorSet[0]}`;
      
      fireworksContainer.appendChild(sparkle);
      setTimeout(() => sparkle.remove(), 800);
    }, Math.random() * 500);
  }
}

function createRocket(startX, startY, targetY) {
  const rocket = document.createElement('div');
  rocket.classList.add('firework-rocket');
  
  const colorSet = fireworkColors[Math.floor(Math.random() * fireworkColors.length)];
  const height = targetY - startY;
  
  rocket.style.left = startX + 'px';
  rocket.style.top = startY + 'px';
  rocket.style.background = `linear-gradient(to top, ${colorSet[0]}, transparent)`;
  rocket.style.boxShadow = `0 0 10px ${colorSet[0]}`;
  rocket.style.setProperty('--rocket-height', height + 'px');
  
  fireworksContainer.appendChild(rocket);
  
  // Setelah roket mencapai target, ledakkan
  setTimeout(() => {
    rocket.remove();
    createFirework(startX, startY + height);
  }, 800);
}

function launchFirework() {
  const startX = 50 + Math.random() * (window.innerWidth - 100);
  const startY = window.innerHeight;
  const targetY = 50 + Math.random() * (window.innerHeight * 0.4);
  
  createRocket(startX, startY, -targetY);
}

// Luncurkan beberapa kembang api sekaligus
function launchMultipleFireworks() {
  const count = 1 + Math.floor(Math.random() * CONFIG.maxFireworks);
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      launchFirework();
    }, i * 300);
  }
}

// ===== Event Klik untuk Kembang Api =====
document.addEventListener('click', (e) => {
  createFirework(e.clientX, e.clientY);
});

// ===== Inisialisasi =====
document.addEventListener('DOMContentLoaded', () => {
  // Buat bintang statis
  createStaticStars();
  
  // Jalankan kembang api otomatis
  launchMultipleFireworks();
  setInterval(launchMultipleFireworks, CONFIG.fireworkInterval);
  
  // Bintang berjalan sudah dijalankan di atas
});

// ===== Tombol "Bagikan Ucapan" =====
const shareBtn = document.getElementById('shareBtn');
shareBtn.addEventListener('click', async (e) => {
  e.stopPropagation(); // Supaya tidak trigger kembang api
  const shareData = {
    title: 'Selamat Hari Raya Idul Fitri',
    text:
      'Selamat Hari Raya Idul Fitri 1447 H. Minal aidzin wal faidzin, mohon maaf lahir dan batin.',
    url: window.location.href
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(
        shareData.text + ' ' + shareData.url
      );
      alert('Ucapan disalin ke clipboard!');
    }
  } catch (err) {
    console.error(err);
  }
});
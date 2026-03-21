/**
 * ============================================
 * MEMORY.JS - Sistem Penyimpanan Harapan
 * ============================================
 * Menyimpan riwayat harapan secara permanen di localStorage
 * dengan fitur export/import JSON
 */

const MemoryManager = (function() {
  // Kunci penyimpanan
  const STORAGE_KEY = 'idul_fitri_wishes_memory';
  const SETTINGS_KEY = 'idul_fitri_settings';
  const STATS_KEY = 'idul_fitri_stats';

  // ============================================
  // FUNGSI UTAMA PENYIMPANAN
  // ============================================

  /**
   * Simpan harapan baru ke memory
   * @param {string} text - Teks harapan
   * @param {string} author - Nama pengirim (opsional)
   * @returns {object} - Data harapan yang disimpan
   */
  function saveWish(text, author = 'Anonim') {
    if (!text || typeof text !== 'string') {
      console.error('❌ Teks harapan tidak valid');
      return null;
    }

    const trimmedText = text.trim();
    if (trimmedText.length === 0) {
      console.error('❌ Teks harapan kosong');
      return null;
    }

    const wishes = getAllWishes();
    
    // Cek duplikasi
    const isDuplicate = wishes.some(w => w.text.toLowerCase() === trimmedText.toLowerCase());
    if (isDuplicate) {
      console.log('⚠️ Harapan sudah ada sebelumnya');
      return { duplicate: true, message: 'Harapan ini sudah pernah dikirim sebelumnya' };
    }

    // Buat data harapan baru
    const newWish = {
      id: generateId(),
      text: trimmedText,
      author: author || 'Anonim',
      timestamp: Date.now(),
      date: formatDate(new Date()),
      readableDate: formatReadableDate(new Date())
    };

    // Tambahkan ke array
    wishes.push(newWish);

    // Simpan ke localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wishes));
      
      // Update statistik
      updateStats('totalWishes', wishes.length);
      updateStats('lastWishDate', newWish.timestamp);

      console.log('✅ Harapan berhasil disimpan:', newWish.id);
      
      // Trigger event untuk notifikasi
      window.dispatchEvent(new CustomEvent('wishSaved', { detail: newWish }));
      
      return { success: true, data: newWish };
    } catch (e) {
      console.error('❌ Gagal menyimpan ke localStorage:', e);
      
      // Coba bersihkan data lama jika penuh
      if (e.name === 'QuotaExceededError') {
        cleanOldData();
        // Coba simpan lagi
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(wishes));
          return { success: true, data: newWish };
        } catch (e2) {
          return { success: false, error: 'Penyimpanan penuh' };
        }
      }
      
      return { success: false, error: e.message };
    }
  }

  /**
   * Ambil semua harapan dari memory
   * @returns {array} - Array harapan
   */
  function getAllWishes() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('❌ Gagal membaca dari localStorage:', e);
      return [];
    }
  }

  /**
   * Ambil harapan berdasarkan ID
   * @param {string} id - ID harapan
   * @returns {object|null} - Data harapan atau null
   */
  function getWishById(id) {
    const wishes = getAllWishes();
    return wishes.find(w => w.id === id) || null;
  }

  /**
   * Hapus harapan berdasarkan ID
   * @param {string} id - ID harapan
   * @returns {boolean} - Status keberhasilan
   */
  function deleteWish(id) {
    const wishes = getAllWishes();
    const index = wishes.findIndex(w => w.id === id);
    
    if (index === -1) {
      console.log('⚠️ Harapan tidak ditemukan');
      return false;
    }
    
    wishes.splice(index, 1);
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wishes));
      updateStats('totalWishes', wishes.length);
      console.log('✅ Harapan berhasil dihapus:', id);
      return true;
    } catch (e) {
      console.error('❌ Gagal menghapus:', e);
      return false;
    }
  }

  /**
   * Hapus semua harapan
   * @returns {boolean} - Status keberhasilan
   */
  function clearAllWishes() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      updateStats('totalWishes', 0);
      console.log('✅ Semua harapan telah dihapus');
      return true;
    } catch (e) {
      console.error('❌ Gagal menghapus semua:', e);
      return false;
    }
  }

  // ============================================
  // FUNGSI EXPORT/IMPORT JSON
  // ============================================

  /**
   * Export semua harapan ke file JSON
   */
  function exportToJson() {
    const wishes = getAllWishes();
    const stats = getStats();
    
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      appName: 'Idul Fitri Wishes',
      stats: stats,
      wishes: wishes
    };
    
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Buat link download
    const a = document.createElement('a');
    a.href = url;
    a.download = `riwayat_harapan_${formatDate(new Date())}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('📥 Data berhasil di-export');
    return true;
  }

  /**
   * Import harapan dari file JSON
   * @param {File} file - File JSON
   * @returns {Promise} - Hasil import
   */
  function importFromJson(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = function(e) {
        try {
          const data = JSON.parse(e.target.result);
          
          // Validasi struktur
          if (!data.wishes || !Array.isArray(data.wishes)) {
            throw new Error('Format file tidak valid');
          }
          
          // Ambil data yang ada
          const existingWishes = getAllWishes();
          const existingIds = new Set(existingWishes.map(w => w.id));
          
          // Filter data baru (yang belum ada)
          const newWishes = data.wishes.filter(w => !existingIds.has(w.id));
          
          if (newWishes.length === 0) {
            resolve({ 
              success: true, 
              imported: 0, 
              message: 'Tidak ada data baru untuk diimport' 
            });
            return;
          }
          
          // Gabungkan dan simpan
          const allWishes = [...existingWishes, ...newWishes];
          localStorage.setItem(STORAGE_KEY, JSON.stringify(allWishes));
          
          updateStats('totalWishes', allWishes.length);
          
          console.log(`📤 Berhasil import ${newWishes.length} harapan`);
          resolve({ 
            success: true, 
            imported: newWishes.length,
            message: `Berhasil import ${newWishes.length} harapan baru` 
          });
          
        } catch (e) {
          console.error('❌ Gagal import:', e);
          reject({ success: false, error: e.message });
        }
      };
      
      reader.onerror = function() {
        reject({ success: false, error: 'Gagal membaca file' });
      };
      
      reader.readAsText(file);
    });
  }

  // ============================================
  // FUNGSI STATISTIK
  // ============================================

  /**
   * Ambil statistik
   * @returns {object} - Data statistik
   */
  function getStats() {
    try {
      const data = localStorage.getItem(STATS_KEY);
      return data ? JSON.parse(data) : getDefaultStats();
    } catch (e) {
      return getDefaultStats();
    }
  }

  /**
   * Update statistik
   * @param {string} key - Kunci statistik
   * @param {any} value - Nilai
   */
  function updateStats(key, value) {
    const stats = getStats();
    stats[key] = value;
    stats.lastUpdated = Date.now();
    try {
      localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    } catch (e) {
      console.error('Gagal update statistik:', e);
    }
  }

  function getDefaultStats() {
    return {
      totalWishes: 0,
      firstVisit: Date.now(),
      lastVisit: Date.now(),
      lastWishDate: null,
      lastUpdated: Date.now()
    };
  }

  // ============================================
  // FUNGSI SETTINGS
  // ============================================

  /**
   * Ambil pengaturan
   * @returns {object} - Data pengaturan
   */
  function getSettings() {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      return data ? JSON.parse(data) : getDefaultSettings();
    } catch (e) {
      return getDefaultSettings();
    }
  }

  /**
   * Simpan pengaturan
   * @param {object} settings - Data pengaturan
   */
  function saveSettings(settings) {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      return true;
    } catch (e) {
      console.error('Gagal simpan pengaturan:', e);
      return false;
    }
  }

  function getDefaultSettings() {
    return {
      showBubbles: true,
      bubbleInterval: 3000,
      maxBubblesOnScreen: 5,
      enableSound: false,
      theme: 'default'
    };
  }

  // ============================================
  // FUNGSI UTILITAS
  // ============================================

  /**
   * Generate ID unik
   * @returns {string} - ID unik
   */
  function generateId() {
    return 'wish_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Format tanggal ke string (YYYY-MM-DD)
   * @param {Date} date - Objek tanggal
   * @returns {string} - String tanggal
   */
  function formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  /**
   * Format tanggal ke format readable
   * @param {Date} date - Objek tanggal
   * @returns {string} - String tanggal
   */
  function formatReadableDate(date) {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString('id-ID', options);
  }

  /**
   * Bersihkan data lama (jika localStorage penuh)
   */
  function cleanOldData() {
    const wishes = getAllWishes();
    // Hapus 20% data terlama
    const keepCount = Math.floor(wishes.length * 0.8);
    const newWishes = wishes.slice(-keepCount);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newWishes));
    console.log(`🧹 Dibersihkan: ${wishes.length - newWishes.length} data lama`);
  }

  /**
   * Hitung total memory yang digunakan
   * @returns {string} - Ukuran dalam KB/MB
   */
  function getMemoryUsage() {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length * 2; // UTF-16 = 2 bytes per char
      }
    }
    
    if (total < 1024) return total + ' bytes';
    if (total < 1024 * 1024) return (total / 1024).toFixed(2) + ' KB';
    return (total / (1024 * 1024)).toFixed(2) + ' MB';
  }

  /**
   * Ambil harapan random untuk ditampilkan
   * @param {number} count - Jumlah harapan
   * @param {Set} excludeIds - ID yang dikecualikan
   * @returns {array} - Array harapan random
   */
  function getRandomWishes(count = 1, excludeIds = new Set()) {
    const wishes = getAllWishes();
    const available = wishes.filter(w => !excludeIds.has(w.id));
    
    if (available.length === 0) return [];
    
    const result = [];
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < Math.min(count, shuffled.length); i++) {
      result.push(shuffled[i]);
    }
    
    return result;
  }

  /**
   * Cari harapan berdasarkan teks
   * @param {string} query - Kata kunci pencarian
   * @returns {array} - Array harapan yang cocok
   */
  function searchWishes(query) {
    const wishes = getAllWishes();
    const lowerQuery = query.toLowerCase();
    
    return wishes.filter(w => 
      w.text.toLowerCase().includes(lowerQuery) ||
      w.author.toLowerCase().includes(lowerQuery)
    );
  }

  // ============================================
  // PUBLIC API
  // ============================================

  return {
    // CRUD
    saveWish,
    getAllWishes,
    getWishById,
    deleteWish,
    clearAllWishes,
    
    // Export/Import
    exportToJson,
    importFromJson,
    
    // Stats & Settings
    getStats,
    updateStats,
    getSettings,
    saveSettings,
    
    // Utilities
    getMemoryUsage,
    getRandomWishes,
    searchWishes,
    generateId,
    formatDate,
    formatReadableDate
  };

})();

// Export untuk digunakan di file lain
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MemoryManager;
}

console.log('💾 MemoryManager initialized');
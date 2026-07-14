/**
 * config.js — Konfigurasi SIG Desa Jetis
 * Ubah nilai di sini untuk menyesuaikan tampilan peta.
 */

const CONFIG = {
  // === Titik Tengah & Zoom Peta ===
  MAP_CENTER: [-7.7603, 113.7093],
  MAP_ZOOM: 15,
  MIN_ZOOM: 13,
  MAX_ZOOM: 18,

  // === Tile Layer (OpenStreetMap Gratis) ===
  TILE_URL: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  TILE_ATTRIBUTION:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',

  // === Warna Poligon per Jenis Potensi ===
  COLORS: {
    'Pertanian':           '#22c55e',
    'Industri Batu Bata':  '#f97316',
    'Material Tambang':    '#3b82f6',
    'Industri Tahu-Tempe': '#a855f7'
  },

  // === Warna Marker Isu Lingkungan ===
  COLORS_LINGKUNGAN: {
    'Pencemaran Udara': '#ef4444',
    'Pencemaran Air':   '#eab308',
    'Degradasi Lahan':  '#8b5cf6'
  },

  // === Opacity Berdasarkan Skor Kelayakan ===
  OPACITY: {
    'Tinggi':  0.72,
    'Sedang':  0.50,
    'Rendah':  0.32
  },

  // === Label dengan Emoji ===
  LABELS_POTENSI: {
    'Pertanian':           '🌾 Pertanian',
    'Industri Batu Bata':  '🧱 Industri Batu Bata',
    'Material Tambang':    '⛏️ Material Tambang',
    'Industri Tahu-Tempe': '🫘 Industri Tahu-Tempe'
  },

  LABELS_LINGKUNGAN: {
    'Pencemaran Udara': '💨 Pencemaran Udara',
    'Pencemaran Air':   '💧 Pencemaran Air',
    'Degradasi Lahan':  '🏔️ Degradasi Lahan'
  },

  // === Info Program ===
  PROGRAM_TITLE: 'Sistem Informasi Geografis — Potensi SDA & Produksi',
  DESA_NAME: 'Desa Jetis, Kec. Besuki, Kab. Situbondo, Jawa Timur'
};

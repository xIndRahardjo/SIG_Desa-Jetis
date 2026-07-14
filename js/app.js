/**
 * app.js — Logic Utama SIG Desa Jetis
 * Mengelola peta Leaflet, layer, popup, sidebar, filter, dan legenda.
 *
 * ── DATA DINAMIS ──────────────────────────────────────────────
 * URL backend Google Apps Script untuk membaca data yang ditambah
 * oleh admin desa. Isi dengan URL deployment GAS Anda.
 * Jika kosong (''), fitur data dinamis dinonaktifkan secara otomatis.
 * ─────────────────────────────────────────────────────────────
 */
const BACKEND_URL_PUBLIC = 'https://script.google.com/macros/s/AKfycbxR7sHEGlCjYR0kNFirvm_Wg7Anw9RQrh2GKkndwOsWYpam2u9ZDcLbgZixjPHwGACXeg/exec'; // Contoh: 'https://script.google.com/macros/s/ABC.../exec'

/* ================================================================
   STATE
   ================================================================ */
let map;
let potensiLayer;
let lingkunganLayer;
let dynamicLayer = null;   // Layer data yang ditambah via panel admin
let activeLayer = 'potensi'; // 'potensi' | 'lingkungan'
let activeFilter = 'Semua';
let activeDusunId = null;

/* ================================================================
   INITIALIZATION
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initMap();
  initPotensiLayer();
  initLingkunganLayer();
  renderSidebar();
  renderFilterPills();
  renderLegend();
  initLayerToggle();
  initMobileControls();
  loadDynamicData(); // Muat data dari panel admin (non-blocking)
  hideLoading();
});

/* ================================================================
   MAP SETUP
   ================================================================ */
function initMap() {
  map = L.map('map', {
    center: CONFIG.MAP_CENTER,
    zoom: CONFIG.MAP_ZOOM,
    minZoom: CONFIG.MIN_ZOOM,
    maxZoom: CONFIG.MAX_ZOOM,
    zoomControl: true,
    attributionControl: true
  });

  L.tileLayer(CONFIG.TILE_URL, {
    attribution: CONFIG.TILE_ATTRIBUTION,
    maxZoom: 19
  }).addTo(map);

  // Move zoom control to top-right on desktop
  map.zoomControl.setPosition('topright');
}

/* ================================================================
   POTENSI SDA LAYER (Polygons)
   ================================================================ */
function initPotensiLayer() {
  potensiLayer = L.geoJSON(DATA_DUSUN_POTENSI, {
    style: stylePotensi,
    onEachFeature: onEachDusunPotensi
  }).addTo(map);
}

function stylePotensi(feature) {
  const props = feature.properties;
  const color = CONFIG.COLORS[props.jenis_potensi] || '#6b7280';
  const opacity = CONFIG.OPACITY[props.skor_kelayakan] || 0.5;

  return {
    fillColor: color,
    fillOpacity: opacity,
    color: '#ffffff',
    weight: 2,
    opacity: 0.6,
    dashArray: ''
  };
}

function onEachDusunPotensi(feature, layer) {
  layer.bindPopup(createPotensiPopup(feature.properties), {
    maxWidth: 320,
    className: 'custom-popup'
  });

  layer.on({
    mouseover: onPolygonMouseOver,
    mouseout: onPolygonMouseOut,
    click: onPolygonClick
  });
}

function onPolygonMouseOver(e) {
  const layer = e.target;
  layer.setStyle({
    weight: 3,
    opacity: 1,
    fillOpacity: Math.min((layer.options.fillOpacity || 0.5) + 0.15, 0.9)
  });
  layer.bringToFront();
}

function onPolygonMouseOut(e) {
  potensiLayer.resetStyle(e.target);
  // Re-highlight active dusun if any
  if (activeDusunId) {
    potensiLayer.eachLayer(l => {
      if (l.feature && l.feature.properties.id === activeDusunId) {
        l.setStyle({ weight: 3, opacity: 1, color: '#fbbf24' });
        l.bringToFront();
      }
    });
  }
}

function onPolygonClick(e) {
  const id = e.target.feature.properties.id;
  setActiveDusun(id);
}

/* ================================================================
   ISU LINGKUNGAN LAYER (Point Markers)
   ================================================================ */
function initLingkunganLayer() {
  lingkunganLayer = L.geoJSON(DATA_ISU_LINGKUNGAN, {
    pointToLayer: createLingkunganMarker,
    onEachFeature: onEachIsuLingkungan
  });
  // Not added to map by default — toggled via layer switch
}

function createLingkunganMarker(feature, latlng) {
  const color = CONFIG.COLORS_LINGKUNGAN[feature.properties.jenis_isu] || '#ef4444';

  return L.circleMarker(latlng, {
    radius: 12,
    fillColor: color,
    fillOpacity: 0.75,
    color: '#ffffff',
    weight: 2.5,
    opacity: 0.9
  });
}

function onEachIsuLingkungan(feature, layer) {
  layer.bindPopup(createLingkunganPopup(feature.properties), {
    maxWidth: 320,
    className: 'custom-popup'
  });

  layer.on({
    mouseover: function (e) {
      e.target.setStyle({ radius: 16, fillOpacity: 0.9, weight: 3 });
    },
    mouseout: function (e) {
      e.target.setStyle({ radius: 12, fillOpacity: 0.75, weight: 2.5 });
    }
  });
}

/* ================================================================
   POPUP BUILDERS
   ================================================================ */
function createPotensiPopup(props) {
  const color = CONFIG.COLORS[props.jenis_potensi] || '#6b7280';
  const label = CONFIG.LABELS_POTENSI[props.jenis_potensi] || props.jenis_potensi;

  let html = `
    <div class="popup">
      <div class="popup__header">
        <div class="popup__title">${escHtml(props.nama_dusun)}</div>
        <div class="popup__badges">
          <span class="popup__badge" style="background:${color}">${label}</span>
          <span class="popup__skor-badge">Skor: ${escHtml(props.skor_kelayakan)}</span>
        </div>
      </div>
      <div class="popup__body">
        <div class="popup__row">
          <span class="popup__label">Komoditas</span>
          <span class="popup__value">${escHtml(props.komoditas_unggulan)}</span>
        </div>
        <div class="popup__row">
          <span class="popup__label">Luas Est.</span>
          <span class="popup__value">${escHtml(props.luas_estimasi_ha)} Ha</span>
        </div>
        <div class="popup__row">
          <span class="popup__label">Keterangan</span>
          <span class="popup__value">${escHtml(props.keterangan)}</span>
        </div>`;

  if (props.catatan_lingkungan) {
    html += `
        <div class="popup__warning">
          <span class="popup__warning-icon">⚠️</span>
          <span class="popup__warning-text">${escHtml(props.catatan_lingkungan)}</span>
        </div>`;
  }

  html += `
      </div>
    </div>`;
  return html;
}

function createLingkunganPopup(props) {
  const color = CONFIG.COLORS_LINGKUNGAN[props.jenis_isu] || '#ef4444';
  const label = CONFIG.LABELS_LINGKUNGAN[props.jenis_isu] || props.jenis_isu;

  const severityColors = {
    'Tinggi': '#ef4444',
    'Sedang': '#f59e0b',
    'Rendah': '#22c55e'
  };
  const sevColor = severityColors[props.tingkat_keparahan] || '#6b7280';

  return `
    <div class="popup popup--env">
      <div class="popup__header">
        <div class="popup__title">${escHtml(props.nama_lokasi)}</div>
        <div class="popup__badges">
          <span class="popup__badge" style="background:${color}">${label}</span>
          <span class="popup__skor-badge" style="color:${sevColor};border-color:${sevColor}40">
            ${escHtml(props.tingkat_keparahan)}
          </span>
        </div>
      </div>
      <div class="popup__body">
        <div class="popup__row">
          <span class="popup__label">Dusun</span>
          <span class="popup__value">${escHtml(props.dusun)}</span>
        </div>
        <div class="popup__row">
          <span class="popup__label">Deskripsi</span>
          <span class="popup__value">${escHtml(props.deskripsi)}</span>
        </div>
        <div class="popup__row">
          <span class="popup__label">Rekomendasi</span>
          <span class="popup__value">${escHtml(props.rekomendasi)}</span>
        </div>
        <div class="popup__row">
          <span class="popup__label">Status</span>
          <span class="popup__value" style="font-weight:600;color:${sevColor}">${escHtml(props.status)}</span>
        </div>
      </div>
    </div>`;
}

/* ================================================================
   SIDEBAR — DUSUN LIST
   ================================================================ */
function renderSidebar() {
  const container = document.getElementById('dusunList');
  container.innerHTML = '';

  const features = DATA_DUSUN_POTENSI.features;

  features.forEach((f, i) => {
    const props = f.properties;
    const color = CONFIG.COLORS[props.jenis_potensi] || '#6b7280';

    const card = document.createElement('div');
    card.className = 'dusun-card';
    card.dataset.id = props.id;
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `Zoom ke Dusun ${props.nama_dusun}`);
    card.style.animationDelay = `${i * 0.05}s`;

    card.innerHTML = `
      <div class="dusun-card__indicator" style="background:${color}"></div>
      <div class="dusun-card__content">
        <div class="dusun-card__name">${escHtml(props.nama_dusun)}</div>
        <div class="dusun-card__meta">
          <span class="dusun-card__badge" style="background:${color}">
            ${CONFIG.LABELS_POTENSI[props.jenis_potensi] || props.jenis_potensi}
          </span>
          <span class="dusun-card__skor">${escHtml(props.skor_kelayakan)}</span>
        </div>
        <div class="dusun-card__komoditas">📦 ${escHtml(props.komoditas_unggulan)}</div>
      </div>`;

    card.addEventListener('click', () => {
      zoomToDusun(props.id);
      closeSidebarMobile();
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        zoomToDusun(props.id);
        closeSidebarMobile();
      }
    });

    container.appendChild(card);
  });
}

function setActiveDusun(id) {
  activeDusunId = id;

  // Update card styles
  document.querySelectorAll('.dusun-card').forEach(card => {
    card.classList.toggle('active', card.dataset.id === id);
  });

  // Highlight polygon
  potensiLayer.eachLayer(layer => {
    if (layer.feature && layer.feature.properties.id === id) {
      layer.setStyle({ weight: 3, opacity: 1, color: '#fbbf24' });
      layer.bringToFront();
    }
  });
}

function zoomToDusun(id) {
  setActiveDusun(id);

  potensiLayer.eachLayer(layer => {
    if (layer.feature && layer.feature.properties.id === id) {
      map.flyToBounds(layer.getBounds().pad(0.3), { duration: 0.8 });
      layer.openPopup();
      showToast(`📍 Dusun ${layer.feature.properties.nama_dusun}`);
    }
  });
}

/* ================================================================
   FILTER PILLS
   ================================================================ */
function renderFilterPills() {
  const container = document.getElementById('filterPills');
  container.innerHTML = '';

  const types = ['Semua', ...Object.keys(CONFIG.COLORS)];

  types.forEach(type => {
    const pill = document.createElement('button');
    pill.className = 'filter-pill' + (type === 'Semua' ? ' active' : '');
    pill.dataset.type = type;
    pill.textContent = type === 'Semua'
      ? '🗂️ Semua'
      : (CONFIG.LABELS_POTENSI[type] || type);

    pill.addEventListener('click', () => applyFilter(type));
    container.appendChild(pill);
  });
}

function applyFilter(type) {
  activeFilter = type;

  // Update pill styles
  document.querySelectorAll('.filter-pill').forEach(pill => {
    pill.classList.toggle('active', pill.dataset.type === type);
  });

  // Filter polygons
  potensiLayer.eachLayer(layer => {
    if (!layer.feature) return;
    const match = type === 'Semua' || layer.feature.properties.jenis_potensi === type;

    if (match) {
      layer.setStyle(stylePotensi(layer.feature));
      layer.getElement && layer.getElement() && (layer.getElement().style.display = '');
      // For SVG paths
      if (layer._path) layer._path.style.display = '';
    } else {
      layer.setStyle({ fillOpacity: 0, opacity: 0, weight: 0 });
      if (layer._path) layer._path.style.pointerEvents = 'none';
    }
  });

  // Also filter sidebar cards
  document.querySelectorAll('.dusun-card').forEach(card => {
    const id = card.dataset.id;
    const feature = DATA_DUSUN_POTENSI.features.find(f => f.properties.id === id);
    if (!feature) return;
    const match = type === 'Semua' || feature.properties.jenis_potensi === type;
    card.style.display = match ? '' : 'none';
  });

  // Update count
  const visible = type === 'Semua'
    ? DATA_DUSUN_POTENSI.features.length
    : DATA_DUSUN_POTENSI.features.filter(f => f.properties.jenis_potensi === type).length;

  document.getElementById('dusunListTitle').textContent = `${visible} Dusun`;

  // Reset polygon interaction
  if (type !== 'Semua') {
    potensiLayer.eachLayer(layer => {
      if (layer.feature && layer.feature.properties.jenis_potensi === type && layer._path) {
        layer._path.style.pointerEvents = 'auto';
      }
    });
  } else {
    potensiLayer.eachLayer(layer => {
      if (layer._path) layer._path.style.pointerEvents = 'auto';
    });
  }

  showToast(type === 'Semua' ? '🗂️ Menampilkan semua potensi' : `Filter: ${CONFIG.LABELS_POTENSI[type] || type}`);
}

/* ================================================================
   LAYER TOGGLE
   ================================================================ */
function initLayerToggle() {
  const btnPotensi = document.getElementById('btnLayerPotensi');
  const btnLingkungan = document.getElementById('btnLayerLingkungan');
  const filterSection = document.getElementById('filterSection');

  btnPotensi.addEventListener('click', () => switchLayer('potensi'));
  btnLingkungan.addEventListener('click', () => switchLayer('lingkungan'));
}

function switchLayer(layer) {
  activeLayer = layer;
  const filterSection = document.getElementById('filterSection');
  const dusunListTitle = document.getElementById('dusunListTitle');

  // Toggle button styles
  document.querySelectorAll('.layer-toggle__btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.layer === layer);
  });

  if (layer === 'potensi') {
    // Show potensi, hide lingkungan
    if (!map.hasLayer(potensiLayer)) map.addLayer(potensiLayer);
    if (map.hasLayer(lingkunganLayer)) map.removeLayer(lingkunganLayer);

    filterSection.style.display = '';
    renderSidebar();
    applyFilter(activeFilter);

    // Fit map to potensi bounds
    map.flyToBounds(potensiLayer.getBounds().pad(0.1), { duration: 0.6 });

  } else {
    // Show lingkungan, hide potensi
    if (map.hasLayer(potensiLayer)) map.removeLayer(potensiLayer);
    if (!map.hasLayer(lingkunganLayer)) map.addLayer(lingkunganLayer);

    filterSection.style.display = 'none';
    renderLingkunganSidebar();

    // Fit to lingkungan markers
    if (lingkunganLayer.getLayers().length > 0) {
      map.flyToBounds(lingkunganLayer.getBounds().pad(0.5), { duration: 0.6 });
    }
  }

  renderLegend();
  showToast(layer === 'potensi' ? '🌾 Layer: Potensi SDA & Produksi' : '⚠️ Layer: Catatan Lingkungan');
}

function renderLingkunganSidebar() {
  const container = document.getElementById('dusunList');
  container.innerHTML = '';

  const features = DATA_ISU_LINGKUNGAN.features;
  document.getElementById('dusunListTitle').textContent = `${features.length} Titik Isu`;

  features.forEach((f, i) => {
    const props = f.properties;
    const color = CONFIG.COLORS_LINGKUNGAN[props.jenis_isu] || '#ef4444';

    const card = document.createElement('div');
    card.className = 'dusun-card';
    card.dataset.id = props.id;
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.style.animationDelay = `${i * 0.05}s`;

    card.innerHTML = `
      <div class="dusun-card__indicator" style="background:${color}"></div>
      <div class="dusun-card__content">
        <div class="dusun-card__name">${escHtml(props.nama_lokasi)}</div>
        <div class="dusun-card__meta">
          <span class="dusun-card__badge" style="background:${color}">
            ${CONFIG.LABELS_LINGKUNGAN[props.jenis_isu] || props.jenis_isu}
          </span>
          <span class="dusun-card__skor">${escHtml(props.tingkat_keparahan)}</span>
        </div>
        <div class="dusun-card__komoditas">📍 Dusun ${escHtml(props.dusun)}</div>
      </div>`;

    card.addEventListener('click', () => {
      const coords = f.geometry.coordinates;
      map.flyTo([coords[1], coords[0]], 17, { duration: 0.8 });
      lingkunganLayer.eachLayer(layer => {
        if (layer.feature && layer.feature.properties.id === props.id) {
          layer.openPopup();
        }
      });
      closeSidebarMobile();
    });

    container.appendChild(card);
  });
}

/* ================================================================
   LEGEND
   ================================================================ */
function renderLegend() {
  const container = document.getElementById('legend');

  if (activeLayer === 'potensi') {
    let html = `<div class="legend__title">Jenis Potensi</div>`;

    Object.entries(CONFIG.COLORS).forEach(([type, color]) => {
      html += `
        <div class="legend__item">
          <div class="legend__color" style="background:${color}"></div>
          <span class="legend__label">${CONFIG.LABELS_POTENSI[type] || type}</span>
        </div>`;
    });

    html += `<div class="legend__divider"></div>`;
    html += `<div class="legend__subtitle">Skor Kelayakan (Opacity)</div>`;

    Object.entries(CONFIG.OPACITY).forEach(([level, opacity]) => {
      html += `
        <div class="legend__item">
          <div class="legend__color" style="background:rgba(100,160,130,${opacity});border-color:rgba(255,255,255,0.2)"></div>
          <span class="legend__label">${level}</span>
        </div>`;
    });

    container.innerHTML = html;

  } else {
    let html = `<div class="legend__title">Jenis Isu Lingkungan</div>`;

    Object.entries(CONFIG.COLORS_LINGKUNGAN).forEach(([type, color]) => {
      html += `
        <div class="legend__item">
          <div class="legend__color" style="background:${color};border-radius:50%"></div>
          <span class="legend__label">${CONFIG.LABELS_LINGKUNGAN[type] || type}</span>
        </div>`;
    });

    html += `<div class="legend__divider"></div>`;
    html += `<div class="legend__subtitle">Tingkat Keparahan</div>`;

    const severities = {
      'Tinggi': '#ef4444',
      'Sedang': '#f59e0b',
      'Rendah': '#22c55e'
    };

    Object.entries(severities).forEach(([level, color]) => {
      html += `
        <div class="legend__item">
          <div class="legend__color" style="background:${color};border-radius:50%;width:12px;height:12px"></div>
          <span class="legend__label">${level}</span>
        </div>`;
    });

    container.innerHTML = html;
  }
}

/* ================================================================
   MOBILE CONTROLS
   ================================================================ */
function initMobileControls() {
  const sidebar = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const legendToggle = document.getElementById('legendToggle');
  const legend = document.getElementById('legend');

  // Sidebar toggle
  sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    sidebarToggle.innerHTML = sidebar.classList.contains('open')
      ? '<span class="icon">✕</span> Tutup'
      : '<span class="icon">📋</span> Daftar Dusun';
  });

  // Legend toggle
  legendToggle.addEventListener('click', () => {
    legend.classList.toggle('show');
  });

  // Close sidebar when clicking map on mobile
  map.on('click', () => {
    if (window.innerWidth <= 768) {
      closeSidebarMobile();
    }
  });
}

function closeSidebarMobile() {
  if (window.innerWidth <= 768) {
    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('sidebarToggle');
    sidebar.classList.remove('open');
    toggle.innerHTML = '<span class="icon">📋</span> Daftar Dusun';
  }
}

/* ================================================================
   DATA DINAMIS ADMIN — Memuat lokasi yang ditambah via panel admin
   ================================================================ */
async function loadDynamicData() {
  if (!BACKEND_URL_PUBLIC) return; // Backend belum dikonfigurasi, skip

  try {
    const url = `${BACKEND_URL_PUBLIC}?action=getData&_t=${Date.now()}`;
    const res = await fetch(url, { redirect: 'follow' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    if (!json.ok || !json.data) return;

    const { potensi, lingkungan } = json.data;

    // Gabungkan fitur dari kedua koleksi ke satu layer dinamis
    const allFeatures = [
      ...(potensi?.features || []),
      ...(lingkungan?.features || [])
    ];

    if (allFeatures.length === 0) return;

    if (dynamicLayer) map.removeLayer(dynamicLayer);

    dynamicLayer = L.geoJSON(
      { type: 'FeatureCollection', features: allFeatures },
      {
        pointToLayer: createDynamicMarker,
        onEachFeature: onEachDynamicFeature
      }
    ).addTo(map);

  } catch (err) {
    // Gagal fetch data dinamis — tidak mempengaruhi peta statis
    console.warn('[SIG] Data dinamis tidak dapat dimuat:', err.message);
  }
}

function createDynamicMarker(feature, latlng) {
  const jenis = feature.properties._jenis || 'potensi';
  const isLingkungan = jenis === 'lingkungan';
  const color = isLingkungan ? '#f97316' : '#7c3aed';

  return L.circleMarker(latlng, {
    radius: 10,
    fillColor: color,
    fillOpacity: 0.80,
    color: '#ffffff',
    weight: 2.5,
    opacity: 0.95
  });
}

function onEachDynamicFeature(feature, layer) {
  const p = feature.properties;
  const jenis = p._jenis || 'potensi';
  const isLingkungan = jenis === 'lingkungan';

  const nama = escHtml(p.judul || p.nama_lokasi || '(tanpa nama)');
  const kategori = escHtml(p.kategori || p.jenis_potensi || p.jenis_isu || '-');
  const keterangan = escHtml(p.keterangan || p.deskripsi || '');
  const labelJenis = isLingkungan ? '⚠️ Isu Lingkungan' : '🌾 Potensi Produksi';
  const warna = isLingkungan ? '#f97316' : '#7c3aed';

  let extra = '';
  if (isLingkungan && p.status) extra += `<div class="popup__row"><span class="popup__label">Status</span><span class="popup__value">${escHtml(p.status)}</span></div>`;
  if (isLingkungan && p.rekomendasi) extra += `<div class="popup__row"><span class="popup__label">Rekomendasi</span><span class="popup__value">${escHtml(p.rekomendasi)}</span></div>`;
  if (!isLingkungan && p.skor_kelayakan) extra += `<div class="popup__row"><span class="popup__label">Skor</span><span class="popup__value">${escHtml(p.skor_kelayakan)}</span></div>`;

  const popupHtml = `
    <div class="popup">
      <div class="popup__header">
        <div class="popup__title">${nama}</div>
        <div class="popup__badges">
          <span class="popup__badge" style="background:${warna}">${labelJenis}</span>
          <span class="popup__skor-badge">${kategori}</span>
        </div>
      </div>
      <div class="popup__body">
        <div class="popup__row">
          <span class="popup__label">Keterangan</span>
          <span class="popup__value">${keterangan}</span>
        </div>
        ${extra}
        <div class="popup__row" style="opacity:.55;font-size:11px;margin-top:4px">
          📍 Ditambahkan via Panel Admin
        </div>
      </div>
    </div>`;

  layer.bindPopup(popupHtml, { maxWidth: 300, className: 'custom-popup' });

  layer.on({
    mouseover: (e) => e.target.setStyle({ radius: 14, fillOpacity: 0.95, weight: 3 }),
    mouseout: (e) => e.target.setStyle({ radius: 10, fillOpacity: 0.80, weight: 2.5 })
  });
}

/* ================================================================
   UTILITIES
   ================================================================ */
function hideLoading() {
  setTimeout(() => {
    const overlay = document.getElementById('loadingOverlay');
    overlay.classList.add('hidden');
    setTimeout(() => overlay.remove(), 600);
  }, 800);
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 2500);
}

function escHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

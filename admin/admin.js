/**
 * admin.js — Logic Panel Admin SIG Desa Jetis
 *
 * ════════════════════════════════════════════════════════════════
 * KONFIGURASI WAJIB — Isi setelah deploy Google Apps Script
 * ════════════════════════════════════════════════════════════════
 * 1. Buka backend/Code.gs di Google Apps Script
 * 2. Deploy sebagai Web App (lihat README-setup.md)
 * 3. Copy URL deployment ke variabel BACKEND_URL di bawah
 * ════════════════════════════════════════════════════════════════
 */
const BACKEND_URL = 'https://script.google.com/macros/s/AKfycbwaVis_FcwOZhynXuhVZN9i-17j38DD_OQv18u64MA3nydmMAYS-XyIE40KPVGvrBi0/exec'; // Contoh: 'https://script.google.com/macros/s/ABC123.../exec'

/* ──────────────────────────────────────────────────────────────
   KONSTANTA KATEGORI
   ────────────────────────────────────────────────────────────── */
const KATEGORI = {
  potensi: [
    'Pertanian',
    'Industri Batu Bata',
    'Industri Tahu-Tempe',
    'Material Tambang',
    'Potensi Lainnya'
  ],
  lingkungan: [
    'Pencemaran Udara',
    'Pencemaran Air',
    'Degradasi Lahan',
    'Kebisingan',
    'Isu Lingkungan Lainnya'
  ]
};

// Bounding box Desa Jetis untuk validasi koordinat di sisi client
const BOUNDS = {
  latMin: -7.79, latMax: -7.73,
  lngMin: 113.68, lngMax: 113.73
};

/* ──────────────────────────────────────────────────────────────
   STATE
   ────────────────────────────────────────────────────────────── */
let adminToken = '';
let miniMapMain = null;      // Leaflet map di form tambah
let miniMapEdit = null;      // Leaflet map di modal edit
let markerMain = null;      // Marker di peta tambah
let markerEdit = null;      // Marker di peta edit
let allData = { potensi: [], lingkungan: [] };
let hapusTarget = null;      // { id, jenis, nama } — antrian hapus
let currentFilter = 'semua';

/* ──────────────────────────────────────────────────────────────
   INISIALISASI
   ────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  checkBackendUrl();
  initLoginForm();
  initTabNav();
  initFormTambah();
  initFormEdit();
  initModalHapus();
  initDaftarFilter();

  // Cek apakah sudah login sebelumnya (session)
  const savedToken = sessionStorage.getItem('adminToken');
  if (savedToken) {
    adminToken = savedToken;
    showDashboard();
  }
});

/* ──────────────────────────────────────────────────────────────
   CEK KONFIGURASI BACKEND URL
   ────────────────────────────────────────────────────────────── */
function checkBackendUrl() {
  const alertEl = document.getElementById('alertBackendUrl');
  if (BACKEND_URL && BACKEND_URL.includes('script.google.com')) {
    alertEl.style.display = 'none';
  }
}

/* ──────────────────────────────────────────────────────────────
   LOGIN
   ────────────────────────────────────────────────────────────── */
function initLoginForm() {
  const form = document.getElementById('loginForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const token = document.getElementById('inputToken').value.trim();
    const btn = document.getElementById('btnLogin');

    if (!token) return;

    // Token langsung diterima dan disimpan di session.
    // Backend (GAS) akan menolak operasi tambah/edit/hapus jika token salah.
    // Pendekatan ini menghindari masalah CORS/redirect GAS saat verifikasi awal.
    adminToken = token;
    sessionStorage.setItem('adminToken', token);
    showDashboard();
  });
}

function showLoginError(el) {
  el.style.display = '';
  setTimeout(() => { el.style.display = 'none'; }, 4000);
}

function showDashboard() {
  document.getElementById('pageLogin').style.display = 'none';
  document.getElementById('pageDashboard').style.display = '';
  initMiniMapMain();
  loadDaftar();
}

document.getElementById('btnLogout').addEventListener('click', () => {
  sessionStorage.removeItem('adminToken');
  adminToken = '';
  document.getElementById('pageDashboard').style.display = 'none';
  document.getElementById('pageLogin').style.display = '';
  document.getElementById('inputToken').value = '';
});

/* ──────────────────────────────────────────────────────────────
   TAB NAVIGATION
   ────────────────────────────────────────────────────────────── */
function initTabNav() {
  document.querySelectorAll('.tab-nav__btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });
}

function switchTab(tabName) {
  document.querySelectorAll('.tab-panel').forEach(p => p.style.display = 'none');
  document.querySelectorAll('.tab-nav__btn').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === tabName);
    b.setAttribute('aria-selected', b.dataset.tab === tabName ? 'true' : 'false');
  });

  document.getElementById(`tab${capitalize(tabName)}`).style.display = '';

  if (tabName === 'daftar') {
    loadDaftar();
    // Invalidate peta edit kalau ada
    if (miniMapEdit) { miniMapEdit.invalidateSize(); }
  }
  if (tabName === 'tambah' && miniMapMain) {
    setTimeout(() => miniMapMain.invalidateSize(), 100);
  }
}

/* ──────────────────────────────────────────────────────────────
   MINI MAP — FORM TAMBAH
   ────────────────────────────────────────────────────────────── */
function initMiniMapMain() {
  if (miniMapMain) return; // Sudah dibuat

  miniMapMain = L.map('miniMap', {
    center: [-7.7603, 113.7093],
    zoom: 14
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(miniMapMain);

  miniMapMain.on('click', (e) => {
    const { lat, lng } = e.latlng;
    setKoordinatTambah(lat, lng);
  });
}

function setKoordinatTambah(lat, lng) {
  document.getElementById('inputLat').value = lat.toFixed(6);
  document.getElementById('inputLng').value = lng.toFixed(6);

  if (markerMain) {
    markerMain.setLatLng([lat, lng]);
  } else {
    markerMain = L.marker([lat, lng], { draggable: true })
      .addTo(miniMapMain)
      .bindPopup('📍 Titik dipilih')
      .openPopup();

    markerMain.on('dragend', (e) => {
      const pos = e.target.getLatLng();
      setKoordinatTambah(pos.lat, pos.lng);
    });
  }

  // Validasi visual
  const status = document.getElementById('koordinatStatus');
  if (isKoordinatValid(lat, lng)) {
    status.textContent = `✅ Koordinat valid: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    status.style.color = 'var(--success)';
  } else {
    status.textContent = '⚠️ Koordinat di luar wilayah Desa Jetis!';
    status.style.color = 'var(--danger)';
  }
}

// Sinkronisasi input manual lat/lng → update marker
['inputLat', 'inputLng'].forEach(id => {
  document.getElementById(id)?.addEventListener('input', () => {
    const lat = parseFloat(document.getElementById('inputLat').value);
    const lng = parseFloat(document.getElementById('inputLng').value);
    if (!isNaN(lat) && !isNaN(lng) && miniMapMain) {
      setKoordinatTambah(lat, lng);
      miniMapMain.setView([lat, lng], 16);
    }
  });
});

/* ──────────────────────────────────────────────────────────────
   FORM TAMBAH LOKASI
   ────────────────────────────────────────────────────────────── */
function initFormTambah() {
  updateKategoriOptions('tambah', 'potensi');
  updateFieldVisibility('potensi');

  document.querySelectorAll('input[name="jenis"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      updateKategoriOptions('tambah', e.target.value);
      updateFieldVisibility(e.target.value);
    });
  });

  document.getElementById('formTambah').addEventListener('submit', handleSubmitTambah);
  document.getElementById('btnResetForm').addEventListener('click', resetFormTambah);
}

function updateKategoriOptions(formType, jenis) {
  const selectId = formType === 'tambah' ? 'selectKategori' : 'editKategori';
  const select = document.getElementById(selectId);
  select.innerHTML = KATEGORI[jenis].map(k => `<option value="${k}">${k}</option>`).join('');
}

function updateFieldVisibility(jenis) {
  document.getElementById('fieldPotensi').style.display = jenis === 'potensi' ? '' : 'none';
  document.getElementById('fieldLingkungan').style.display = jenis === 'lingkungan' ? '' : 'none';
}

async function handleSubmitTambah(e) {
  e.preventDefault();
  const form = e.target;
  const btn = document.getElementById('btnSubmitTambah');

  const jenis = document.querySelector('input[name="jenis"]:checked').value;
  const judul = document.getElementById('inputJudul').value.trim();
  const kategori = document.getElementById('selectKategori').value;
  const keterangan = document.getElementById('inputKeterangan').value.trim();
  const lat = parseFloat(document.getElementById('inputLat').value);
  const lng = parseFloat(document.getElementById('inputLng').value);

  // Validasi
  if (!judul) return showToast('❌ Judul lokasi wajib diisi', 'error');
  if (!keterangan) return showToast('❌ Keterangan wajib diisi', 'error');
  if (isNaN(lat) || isNaN(lng)) return showToast('❌ Koordinat wajib diisi. Klik di peta atau isi manual.', 'error');
  if (!isKoordinatValid(lat, lng)) return showToast('❌ Koordinat di luar wilayah Desa Jetis', 'error');

  const payload = {
    action: 'tambah',
    token: adminToken,
    jenis, judul, kategori, keterangan,
    lat, lng
  };

  if (jenis === 'lingkungan') {
    payload.dusun = document.getElementById('inputDusun').value.trim();
    payload.tingkat_keparahan = document.getElementById('selectKeparahan').value;
    payload.rekomendasi = document.getElementById('inputRekomendasi').value.trim();
    payload.status = document.getElementById('selectStatus').value;
  } else {
    payload.skor_kelayakan = document.getElementById('selectSkor').value;
  }

  btn.disabled = true;
  btn.textContent = '⏳ Menyimpan...';

  const result = await apiPost(payload);

  btn.disabled = false;
  btn.textContent = '💾 Simpan Lokasi';

  if (result.ok) {
    showToast('✅ Lokasi berhasil ditambahkan!', 'success');
    resetFormTambah();
    // Otomatis pindah ke tab daftar untuk konfirmasi visual
    setTimeout(() => switchTab('daftar'), 800);
  } else {
    showToast(`❌ ${result.error || 'Gagal menyimpan'}`, 'error');
  }
}

function resetFormTambah() {
  document.getElementById('formTambah').reset();
  document.getElementById('koordinatStatus').textContent = '';
  if (markerMain) { miniMapMain.removeLayer(markerMain); markerMain = null; }
  updateKategoriOptions('tambah', 'potensi');
  updateFieldVisibility('potensi');
}

/* ──────────────────────────────────────────────────────────────
   LOAD DAFTAR LOKASI
   ────────────────────────────────────────────────────────────── */
async function loadDaftar() {
  showDaftarState('loading');

  const result = await apiFetch('getData');

  if (!result.ok) {
    showDaftarState('empty');
    showToast('⚠️ Gagal memuat data. Periksa koneksi internet.', 'error');
    return;
  }

  const data = result.data || {};
  const featuresPotensi = (data.potensi?.features || []);
  const featuresLingkungan = (data.lingkungan?.features || []);

  allData.potensi = featuresPotensi.map(f => ({ ...f.properties, _coords: f.geometry.coordinates }));
  allData.lingkungan = featuresLingkungan.map(f => ({ ...f.properties, _coords: f.geometry.coordinates }));

  renderTabel(currentFilter);
}

function renderTabel(filter) {
  currentFilter = filter;
  let items = [];

  if (filter === 'semua' || filter === 'potensi') {
    allData.potensi.forEach(d => items.push({ ...d, _jenis: 'potensi' }));
  }
  if (filter === 'semua' || filter === 'lingkungan') {
    allData.lingkungan.forEach(d => items.push({ ...d, _jenis: 'lingkungan' }));
  }

  if (items.length === 0) {
    showDaftarState('empty');
    return;
  }

  showDaftarState('table');
  const tbody = document.getElementById('tableBody');
  tbody.innerHTML = '';

  items.forEach(item => {
    const coords = item._coords || [];
    const lng = coords[0] || '-';
    const lat = coords[1] || '-';
    const nama = item.judul || item.nama_lokasi || '(tanpa nama)';
    const jenis = item._jenis;
    const kategori = item.kategori || item.jenis_potensi || item.jenis_isu || '-';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <div class="td-name">${escHtml(nama)}</div>
      </td>
      <td>
        <span class="badge badge--${jenis}">
          ${jenis === 'potensi' ? '🌾 Potensi' : '⚠️ Isu Lingk.'}
        </span>
      </td>
      <td>${escHtml(kategori)}</td>
      <td class="td-coords">${parseFloat(lat).toFixed(4)}, ${parseFloat(lng).toFixed(4)}</td>
      <td>
        <div class="td-actions">
          <button class="btn btn--ghost btn--sm" onclick="bukaModalEdit('${escAttr(item.id)}', '${jenis}')">
            ✏️ Edit
          </button>
          <button class="btn btn--danger btn--sm" onclick="bukaModalHapus('${escAttr(item.id)}', '${jenis}', '${escAttr(nama)}')">
            🗑️
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function showDaftarState(state) {
  document.getElementById('daftarLoading').style.display = state === 'loading' ? '' : 'none';
  document.getElementById('daftarEmpty').style.display = state === 'empty' ? '' : 'none';
  document.getElementById('daftarTable').style.display = state === 'table' ? '' : 'none';
}

/* ──────────────────────────────────────────────────────────────
   FILTER DAFTAR
   ────────────────────────────────────────────────────────────── */
function initDaftarFilter() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderTabel(btn.dataset.filter);
    });
  });

  document.getElementById('btnRefreshDaftar').addEventListener('click', loadDaftar);
}

/* ──────────────────────────────────────────────────────────────
   MODAL EDIT
   ────────────────────────────────────────────────────────────── */
function initFormEdit() {
  document.getElementById('btnModalEditClose').addEventListener('click', tutupModalEdit);
  document.getElementById('btnCancelEdit').addEventListener('click', tutupModalEdit);
  document.getElementById('formEdit').addEventListener('submit', handleSubmitEdit);
}

function bukaModalEdit(id, jenis) {
  const dataArr = jenis === 'potensi' ? allData.potensi : allData.lingkungan;
  const item = dataArr.find(d => String(d.id) === String(id));
  if (!item) { showToast('❌ Data tidak ditemukan', 'error'); return; }

  document.getElementById('editId').value = id;
  document.getElementById('editJenis').value = jenis;
  document.getElementById('editJudul').value = item.judul || item.nama_lokasi || '';
  document.getElementById('editKeterangan').value = item.keterangan || item.deskripsi || '';

  updateKategoriOptions('edit', jenis);
  const editKat = document.getElementById('editKategori');
  const katVal = item.kategori || item.jenis_potensi || item.jenis_isu || '';
  if (katVal) editKat.value = katVal;

  // Tampilkan field sesuai jenis
  document.getElementById('editFieldPotensi').style.display = jenis === 'potensi' ? '' : 'none';
  document.getElementById('editFieldLingkungan').style.display = jenis === 'lingkungan' ? '' : 'none';

  if (jenis === 'lingkungan') {
    document.getElementById('editDusun').value = item.dusun || '';
    document.getElementById('editKeparahan').value = item.tingkat_keparahan || 'Sedang';
    document.getElementById('editRekomendasi').value = item.rekomendasi || '';
    document.getElementById('editStatus').value = item.status || 'Perlu Penanganan';
  } else {
    document.getElementById('editSkor').value = item.skor_kelayakan || 'Sedang';
  }

  // Koordinat
  const coords = item._coords || [];
  const lat = coords[1] || '';
  const lng = coords[0] || '';
  document.getElementById('editLat').value = lat ? parseFloat(lat).toFixed(6) : '';
  document.getElementById('editLng').value = lng ? parseFloat(lng).toFixed(6) : '';

  document.getElementById('modalEdit').style.display = '';

  // Init peta edit setelah modal tampil
  setTimeout(() => initMiniMapEdit(parseFloat(lat) || -7.7603, parseFloat(lng) || 113.7093), 100);
}

function initMiniMapEdit(lat, lng) {
  const container = document.getElementById('editMiniMap');

  // Hapus instance lama
  if (miniMapEdit) {
    miniMapEdit.remove();
    miniMapEdit = null;
    markerEdit = null;
    container._leaflet_id = null; // reset leaflet marker
  }

  miniMapEdit = L.map('editMiniMap', { center: [lat, lng], zoom: 15 });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(miniMapEdit);

  markerEdit = L.marker([lat, lng], { draggable: true }).addTo(miniMapEdit);
  markerEdit.on('dragend', (e) => {
    const pos = e.target.getLatLng();
    document.getElementById('editLat').value = pos.lat.toFixed(6);
    document.getElementById('editLng').value = pos.lng.toFixed(6);
  });

  miniMapEdit.on('click', (e) => {
    const { lat: elat, lng: elng } = e.latlng;
    markerEdit.setLatLng([elat, elng]);
    document.getElementById('editLat').value = elat.toFixed(6);
    document.getElementById('editLng').value = elng.toFixed(6);
  });
}

function tutupModalEdit() {
  document.getElementById('modalEdit').style.display = 'none';
  if (miniMapEdit) { miniMapEdit.remove(); miniMapEdit = null; markerEdit = null; }
}

async function handleSubmitEdit(e) {
  e.preventDefault();
  const btn = document.getElementById('btnSubmitEdit');

  const id = document.getElementById('editId').value;
  const jenis = document.getElementById('editJenis').value;
  const lat = parseFloat(document.getElementById('editLat').value);
  const lng = parseFloat(document.getElementById('editLng').value);

  if (!isNaN(lat) && !isNaN(lng) && !isKoordinatValid(lat, lng)) {
    return showToast('❌ Koordinat di luar wilayah Desa Jetis', 'error');
  }

  const payload = {
    action: 'edit', token: adminToken, id, jenis,
    judul: document.getElementById('editJudul').value.trim(),
    kategori: document.getElementById('editKategori').value,
    keterangan: document.getElementById('editKeterangan').value.trim(),
    lat: isNaN(lat) ? undefined : lat,
    lng: isNaN(lng) ? undefined : lng
  };

  if (jenis === 'lingkungan') {
    payload.dusun = document.getElementById('editDusun').value.trim();
    payload.tingkat_keparahan = document.getElementById('editKeparahan').value;
    payload.rekomendasi = document.getElementById('editRekomendasi').value.trim();
    payload.status = document.getElementById('editStatus').value;
  } else {
    payload.skor_kelayakan = document.getElementById('editSkor').value;
  }

  btn.disabled = true;
  btn.textContent = '⏳ Menyimpan...';

  const result = await apiPost(payload);

  btn.disabled = false;
  btn.textContent = '💾 Simpan Perubahan';

  if (result.ok) {
    showToast('✅ Lokasi berhasil diperbarui!', 'success');
    tutupModalEdit();
    loadDaftar();
  } else {
    showToast(`❌ ${result.error || 'Gagal memperbarui'}`, 'error');
  }
}

/* ──────────────────────────────────────────────────────────────
   MODAL HAPUS
   ────────────────────────────────────────────────────────────── */
function initModalHapus() {
  document.getElementById('btnModalHapusClose').addEventListener('click', tutupModalHapus);
  document.getElementById('btnBatalHapus').addEventListener('click', tutupModalHapus);
  document.getElementById('btnKonfirmasiHapus').addEventListener('click', handleHapus);
}

function bukaModalHapus(id, jenis, nama) {
  hapusTarget = { id, jenis, nama };
  document.getElementById('hapusTarget').textContent = nama;
  document.getElementById('modalHapus').style.display = '';
}

function tutupModalHapus() {
  hapusTarget = null;
  document.getElementById('modalHapus').style.display = 'none';
}

async function handleHapus() {
  if (!hapusTarget) return;

  const btn = document.getElementById('btnKonfirmasiHapus');
  btn.disabled = true;
  btn.textContent = '⏳ Menghapus...';

  const result = await apiPost({
    action: 'hapus',
    token: adminToken,
    id: hapusTarget.id,
    jenis: hapusTarget.jenis
  });

  btn.disabled = false;
  btn.textContent = '🗑️ Ya, Hapus';

  if (result.ok) {
    showToast('✅ Lokasi berhasil dihapus!', 'success');
    tutupModalHapus();
    loadDaftar();
  } else {
    showToast(`❌ ${result.error || 'Gagal menghapus'}`, 'error');
  }
}

/* ──────────────────────────────────────────────────────────────
   API HELPERS
   ────────────────────────────────────────────────────────────── */
async function apiFetch(action) {
  if (!BACKEND_URL) {
    // Mode demo — return data kosong
    return { ok: true, data: { potensi: { features: [] }, lingkungan: { features: [] } } };
  }

  try {
    const url = `${BACKEND_URL}?action=${action}&_t=${Date.now()}`;
    const res = await fetch(url, { redirect: 'follow' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('apiFetch error:', err);
    return { ok: false, error: err.message };
  }
}

async function apiPost(payload) {
  if (!BACKEND_URL) {
    // Mode demo offline — simulasi sukses
    console.log('[Demo mode] POST payload:', payload);
    if (payload._test) return { ok: false, error: 'Field wajib diisi.' };
    return { ok: true, message: '[Demo] Operasi berhasil (backend belum dikonfigurasi)' };
  }

  try {
    const res = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      redirect: 'follow'
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('apiPost error:', err);
    return { ok: false, error: err.message };
  }
}

/* ──────────────────────────────────────────────────────────────
   VALIDASI KOORDINAT
   ────────────────────────────────────────────────────────────── */
function isKoordinatValid(lat, lng) {
  return lat >= BOUNDS.latMin && lat <= BOUNDS.latMax &&
    lng >= BOUNDS.lngMin && lng <= BOUNDS.lngMax;
}

/* ──────────────────────────────────────────────────────────────
   TOAST NOTIFICATION
   ────────────────────────────────────────────────────────────── */
function showToast(message, type = '') {
  const toast = document.getElementById('adminToast');
  toast.textContent = message;
  toast.className = 'admin-toast show' + (type ? ` ${type}` : '');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

/* ──────────────────────────────────────────────────────────────
   UTILITIES
   ────────────────────────────────────────────────────────────── */
function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escAttr(str) {
  if (!str) return '';
  return String(str).replace(/'/g, "\\'").replace(/"/g, '\\"');
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Code.gs — Backend REST API untuk Panel Admin SIG Desa Jetis
 * Dijalankan sebagai Google Apps Script Web App
 *
 * ==========================================================
 * CARA SETUP:
 * 1. Buka script.google.com → New Project
 * 2. Copy-paste seluruh kode ini ke editor
 * 3. Edit bagian KONFIGURASI di bawah (SPREADSHEET_ID, ADMIN_TOKEN)
 * 4. Klik Deploy → New Deployment → Web App
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Copy URL deployment → masukkan ke admin/admin.js (BACKEND_URL)
 * ==========================================================
 */

// ═══════════════════════════════════════════════════════════════
// KONFIGURASI — WAJIB DIISI SEBELUM DEPLOY
// ═══════════════════════════════════════════════════════════════
const CONFIG_GAS = {
  // Token akses admin — GANTI SEBELUM DEPLOY!
  // Bagikan token ini ke perangkat desa & kepala dusun.
  ADMIN_TOKEN: 'JetisAdmin2025!',

  // ID Google Spreadsheet yang akan digunakan sebagai database
  // Cara dapat ID: buka Google Sheets → lihat URL
  // https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_ADA_DI_SINI/edit
  SPREADSHEET_ID: 'GANTI_DENGAN_SPREADSHEET_ID_ANDA',

  // Nama sheet (tab) di dalam Spreadsheet
  SHEET_POTENSI: 'LokasiPotensi',
  SHEET_LINGKUNGAN: 'LokasiLingkungan',

  // Bounding box validasi koordinat Desa Jetis (±0.02 derajat toleransi)
  BOUNDS: {
    LAT_MIN: -7.79,
    LAT_MAX: -7.73,
    LNG_MIN: 113.68,
    LNG_MAX: 113.73
  }
};

// ═══════════════════════════════════════════════════════════════
// HEADER CORS — WAJIB UNTUK FETCH DARI BROWSER
// ═══════════════════════════════════════════════════════════════
function setCorsHeaders(output) {
  return output
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
}

// ═══════════════════════════════════════════════════════════════
// doGet — Endpoint baca data (publik, tidak butuh token)
// GET ?action=getData
// ═══════════════════════════════════════════════════════════════
function doGet(e) {
  try {
    const action = (e.parameter && e.parameter.action) || 'getData';

    if (action === 'getData') {
      const data = getAllData();
      return setCorsHeaders(
        ContentService.createTextOutput(JSON.stringify({ ok: true, data: data }))
      );
    }

    return setCorsHeaders(
      ContentService.createTextOutput(JSON.stringify({ ok: false, error: 'Action tidak dikenal' }))
    );

  } catch (err) {
    return setCorsHeaders(
      ContentService.createTextOutput(JSON.stringify({ ok: false, error: err.message }))
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// doPost — Endpoint tulis data (butuh token admin)
// POST body JSON: { token, action, ...data }
// ═══════════════════════════════════════════════════════════════
function doPost(e) {
  try {
    // Parse body
    const body = JSON.parse(e.postData.contents);

    // Validasi token
    if (!body.token || body.token !== CONFIG_GAS.ADMIN_TOKEN) {
      return setCorsHeaders(
        ContentService.createTextOutput(JSON.stringify({
          ok: false, error: 'Token tidak valid. Akses ditolak.'
        }))
      );
    }

    const action = body.action;

    if (action === 'tambah') {
      return setCorsHeaders(
        ContentService.createTextOutput(JSON.stringify(tambahLokasi(body)))
      );
    }

    if (action === 'edit') {
      return setCorsHeaders(
        ContentService.createTextOutput(JSON.stringify(editLokasi(body)))
      );
    }

    if (action === 'hapus') {
      return setCorsHeaders(
        ContentService.createTextOutput(JSON.stringify(hapusLokasi(body)))
      );
    }

    return setCorsHeaders(
      ContentService.createTextOutput(JSON.stringify({ ok: false, error: 'Action tidak dikenal' }))
    );

  } catch (err) {
    return setCorsHeaders(
      ContentService.createTextOutput(JSON.stringify({ ok: false, error: err.message }))
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// CRUD FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Ambil semua data dari kedua sheet, return sebagai GeoJSON FeatureCollection
 */
function getAllData() {
  const ss = SpreadsheetApp.openById(CONFIG_GAS.SPREADSHEET_ID);

  const featuresPotensi = getSheetAsFeatures(ss, CONFIG_GAS.SHEET_POTENSI, 'potensi');
  const featuresLingkungan = getSheetAsFeatures(ss, CONFIG_GAS.SHEET_LINGKUNGAN, 'lingkungan');

  return {
    potensi: {
      type: 'FeatureCollection',
      features: featuresPotensi
    },
    lingkungan: {
      type: 'FeatureCollection',
      features: featuresLingkungan
    }
  };
}

/**
 * Baca sheet dan konversi ke array GeoJSON Feature
 */
function getSheetAsFeatures(ss, sheetName, jenis) {
  const sheet = getOrCreateSheet(ss, sheetName, jenis);
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) return []; // hanya header

  const headers = data[0];
  const features = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue; // skip baris kosong

    const props = {};
    headers.forEach((h, idx) => {
      if (h !== 'lat' && h !== 'lng') {
        props[h] = row[idx] !== undefined ? String(row[idx]) : '';
      }
    });

    const latIdx = headers.indexOf('lat');
    const lngIdx = headers.indexOf('lng');
    const lat = parseFloat(row[latIdx]);
    const lng = parseFloat(row[lngIdx]);

    if (isNaN(lat) || isNaN(lng)) continue;

    features.push({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [lng, lat]
      },
      properties: {
        ...props,
        _jenis: jenis,
        _row: i + 1  // simpan nomor baris untuk keperluan edit/hapus
      }
    });
  }

  return features;
}

/**
 * Tambah lokasi baru ke sheet yang sesuai
 */
function tambahLokasi(body) {
  // Validasi field wajib
  const required = ['judul', 'jenis', 'kategori', 'lat', 'lng', 'keterangan'];
  for (const field of required) {
    if (!body[field] && body[field] !== 0) {
      return { ok: false, error: `Field '${field}' wajib diisi.` };
    }
  }

  // Validasi koordinat
  const lat = parseFloat(body.lat);
  const lng = parseFloat(body.lng);
  const validasi = validasiKoordinat(lat, lng);
  if (!validasi.ok) return validasi;

  const ss = SpreadsheetApp.openById(CONFIG_GAS.SPREADSHEET_ID);
  const sheetName = body.jenis === 'potensi' ? CONFIG_GAS.SHEET_POTENSI : CONFIG_GAS.SHEET_LINGKUNGAN;
  const sheet = getOrCreateSheet(ss, sheetName, body.jenis);

  // Generate ID unik
  const id = 'loc-' + Date.now();
  const timestamp = new Date().toISOString();

  if (body.jenis === 'potensi') {
    sheet.appendRow([
      id, body.judul, body.kategori, body.skor_kelayakan || 'Sedang',
      body.keterangan, lat, lng, timestamp
    ]);
  } else {
    sheet.appendRow([
      id, body.judul, body.dusun || '', body.kategori,
      body.keterangan, body.tingkat_keparahan || 'Sedang',
      body.rekomendasi || '', body.status || 'Perlu Penanganan',
      lat, lng, timestamp
    ]);
  }

  return { ok: true, message: 'Lokasi berhasil ditambahkan.', id: id };
}

/**
 * Edit lokasi berdasarkan ID
 */
function editLokasi(body) {
  if (!body.id) return { ok: false, error: 'ID lokasi wajib disertakan.' };

  const ss = SpreadsheetApp.openById(CONFIG_GAS.SPREADSHEET_ID);
  const sheetName = body.jenis === 'potensi' ? CONFIG_GAS.SHEET_POTENSI : CONFIG_GAS.SHEET_LINGKUNGAN;
  const sheet = getOrCreateSheet(ss, sheetName, body.jenis);

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idIdx = headers.indexOf('id');

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idIdx]) === String(body.id)) {
      // Validasi koordinat jika diubah
      if (body.lat !== undefined && body.lng !== undefined) {
        const lat = parseFloat(body.lat);
        const lng = parseFloat(body.lng);
        const validasi = validasiKoordinat(lat, lng);
        if (!validasi.ok) return validasi;
        sheet.getRange(i + 1, headers.indexOf('lat') + 1).setValue(lat);
        sheet.getRange(i + 1, headers.indexOf('lng') + 1).setValue(lng);
      }

      // Update field lain
      const fieldsToUpdate = ['judul', 'kategori', 'keterangan', 'skor_kelayakan',
        'dusun', 'tingkat_keparahan', 'rekomendasi', 'status'];

      fieldsToUpdate.forEach(field => {
        const colIdx = headers.indexOf(field);
        if (colIdx >= 0 && body[field] !== undefined) {
          sheet.getRange(i + 1, colIdx + 1).setValue(body[field]);
        }
      });

      return { ok: true, message: 'Lokasi berhasil diperbarui.' };
    }
  }

  return { ok: false, error: 'Lokasi dengan ID tersebut tidak ditemukan.' };
}

/**
 * Hapus lokasi berdasarkan ID
 */
function hapusLokasi(body) {
  if (!body.id) return { ok: false, error: 'ID lokasi wajib disertakan.' };

  const ss = SpreadsheetApp.openById(CONFIG_GAS.SPREADSHEET_ID);
  const sheetName = body.jenis === 'potensi' ? CONFIG_GAS.SHEET_POTENSI : CONFIG_GAS.SHEET_LINGKUNGAN;
  const sheet = getOrCreateSheet(ss, sheetName, body.jenis);

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idIdx = headers.indexOf('id');

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idIdx]) === String(body.id)) {
      sheet.deleteRow(i + 1);
      return { ok: true, message: 'Lokasi berhasil dihapus.' };
    }
  }

  return { ok: false, error: 'Lokasi dengan ID tersebut tidak ditemukan.' };
}

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Validasi koordinat dalam bounding box Desa Jetis
 */
function validasiKoordinat(lat, lng) {
  const b = CONFIG_GAS.BOUNDS;
  if (isNaN(lat) || isNaN(lng)) {
    return { ok: false, error: 'Koordinat tidak valid (bukan angka).' };
  }
  if (lat < b.LAT_MIN || lat > b.LAT_MAX || lng < b.LNG_MIN || lng > b.LNG_MAX) {
    return {
      ok: false,
      error: `Koordinat di luar wilayah Desa Jetis. Pastikan titik berada di dalam peta desa.`
    };
  }
  return { ok: true };
}

/**
 * Ambil sheet, buat jika belum ada (dengan header yang sesuai)
 */
function getOrCreateSheet(ss, sheetName, jenis) {
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);

    if (jenis === 'potensi') {
      sheet.appendRow([
        'id', 'judul', 'kategori', 'skor_kelayakan',
        'keterangan', 'lat', 'lng', 'created_at'
      ]);
    } else {
      sheet.appendRow([
        'id', 'judul', 'dusun', 'kategori',
        'keterangan', 'tingkat_keparahan', 'rekomendasi', 'status',
        'lat', 'lng', 'created_at'
      ]);
    }

    // Format header
    sheet.getRange(1, 1, 1, sheet.getLastColumn())
      .setBackground('#1e3a5f')
      .setFontColor('#ffffff')
      .setFontWeight('bold');
  }

  return sheet;
}

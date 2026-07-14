const { Redis } = require('@upstash/redis');

// Inisialisasi koneksi ke Upstash Redis (Vercel KV alternative)
// Variabel lingkungan UPSTASH_REDIS_REST_URL dan UPSTASH_REDIS_REST_TOKEN
// otomatis akan terisi jika Redis diintegrasikan di dashboard Vercel.
let redis;
try {
  redis = Redis.fromEnv();
} catch (e) {
  // Jika tidak ada env var (misal jalan di lokal tanpa .env)
  console.warn("Redis env variables missing. Operasi database akan gagal.");
}

const POTENSI_KEY = 'sig_desa_jetis:potensi';
const LINGKUNGAN_KEY = 'sig_desa_jetis:lingkungan';

module.exports = async function handler(req, res) {
  // Setup CORS headers jika diperlukan (meski same-origin, ini good practice)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Handle GET (Ambil data)
  if (req.method === 'GET') {
    const action = req.query.action;
    if (action === 'getData') {
      try {
        let potensi = await redis.get(POTENSI_KEY);
        let lingkungan = await redis.get(LINGKUNGAN_KEY);

        // Pastikan format GeoJSON yang valid selalu di-return
        potensi = potensi || { type: 'FeatureCollection', features: [] };
        lingkungan = lingkungan || { type: 'FeatureCollection', features: [] };

        return res.status(200).json({ ok: true, data: { potensi, lingkungan } });
      } catch (err) {
        return res.status(500).json({ ok: false, error: err.message });
      }
    }
    return res.status(400).json({ ok: false, error: 'Aksi GET tidak dikenal.' });
  }

  // Handle POST (Tambah, Edit, Hapus)
  if (req.method === 'POST') {
    try {
      // Pastikan payload berupa object, kadang Vercel tidak mem-parse otomatis
      let payload = req.body;
      if (typeof payload === 'string') {
        try { payload = JSON.parse(payload); } catch (e) {}
      }

      const { action, token, jenis } = payload;

      // Validasi Token Admin (Di-hardcode agar tidak perlu setting Vercel Env Var)
      const realToken = 'bbk8jetis1';
      
      if (token !== realToken) {
        return res.status(401).json({ 
          ok: false, 
          error: `Token akses salah. Silakan coba lagi.` 
        });
      }

      if (payload._test) {
        return res.status(200).json({ ok: false, error: 'Field wajib diisi.' });
      }

      const key = jenis === 'potensi' ? POTENSI_KEY : LINGKUNGAN_KEY;
      
      // Ambil data lama
      let currentData = await redis.get(key);
      if (!currentData || !currentData.features) {
        currentData = { type: 'FeatureCollection', features: [] };
      }

      if (action === 'tambah') {
        const newFeature = {
          type: 'Feature',
          properties: {
            id: payload.id,
            _jenis: jenis,
            timestamp: payload.timestamp,
            ...payload // Spread all other properties (judul, kategori, etc)
          },
          geometry: {
            type: 'Point',
            coordinates: [payload.lng, payload.lat] // GeoJSON [lng, lat]
          }
        };
        // Hapus property lat lng duplikat dari payload (karena sudah masuk geometry)
        delete newFeature.properties.action;
        delete newFeature.properties.token;
        delete newFeature.properties.lat;
        delete newFeature.properties.lng;

        currentData.features.push(newFeature);
        await redis.set(key, currentData);
        
        return res.status(200).json({ ok: true, message: 'Lokasi berhasil ditambahkan.' });
      } 
      
      else if (action === 'edit') {
        const idToEdit = payload.id;
        const idx = currentData.features.findIndex(f => String(f.properties.id) === String(idToEdit));
        
        if (idx === -1) {
          return res.status(404).json({ ok: false, error: 'Data tidak ditemukan.' });
        }

        // Update properties
        const feature = currentData.features[idx];
        const props = feature.properties;
        
        if (payload.judul) props.judul = payload.judul;
        if (payload.kategori) props.kategori = payload.kategori;
        if (payload.keterangan !== undefined) props.keterangan = payload.keterangan;
        
        // Field khusus Lingkungan
        if (payload.dusun !== undefined) props.dusun = payload.dusun;
        if (payload.tingkat_keparahan !== undefined) props.tingkat_keparahan = payload.tingkat_keparahan;
        if (payload.rekomendasi !== undefined) props.rekomendasi = payload.rekomendasi;
        if (payload.status !== undefined) props.status = payload.status;
        
        // Field khusus Potensi
        if (payload.skor_kelayakan !== undefined) props.skor_kelayakan = payload.skor_kelayakan;

        // Update koordinat
        if (payload.lat !== undefined && payload.lng !== undefined) {
          feature.geometry.coordinates = [payload.lng, payload.lat];
        }
        
        props.timestamp = payload.timestamp || new Date().toISOString();

        await redis.set(key, currentData);
        return res.status(200).json({ ok: true, message: 'Lokasi berhasil diperbarui.' });
      }

      else if (action === 'hapus') {
        const idToDelete = payload.id;
        const initialLength = currentData.features.length;
        
        currentData.features = currentData.features.filter(f => String(f.properties.id) !== String(idToDelete));
        
        if (currentData.features.length === initialLength) {
          return res.status(404).json({ ok: false, error: 'Data tidak ditemukan.' });
        }

        await redis.set(key, currentData);
        return res.status(200).json({ ok: true, message: 'Lokasi berhasil dihapus.' });
      }

      return res.status(400).json({ ok: false, error: 'Aksi POST tidak dikenal.' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ ok: false, error: err.message });
    }
  }

  return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
};

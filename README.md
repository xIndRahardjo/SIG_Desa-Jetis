# 🗺️ SIG Potensi SDA & Produksi — Desa Jetis

**Sistem Informasi Geografis (SIG)** untuk pemetaan potensi Sumber Daya Alam dan
kapasitas produksi tingkat dusun di **Desa Jetis, Kecamatan Besuki, Kabupaten
Situbondo, Jawa Timur**.

> ⚠️ **Catatan**: Semua koordinat dan batas dusun dalam prototipe ini adalah
> PERKIRAAN/dummy. Belum berbasis survei GPS atau shapefile resmi. Harus diganti
> dengan data lapangan sebelum digunakan untuk keperluan resmi.

---

## 📁 Struktur Folder

```
sig-desa-jetis/
├── index.html              ← Halaman utama (buka file ini di browser)
├── css/
│   └── style.css           ← Tampilan / desain website
├── js/
│   ├── config.js           ← Pengaturan warna, lokasi pusat peta, dll.
│   ├── data.js             ← Data peta (8 dusun + isu lingkungan)
│   └── app.js              ← Program utama website
├── data/
│   ├── dusun-potensi.geojson    ← Data dusun (format GeoJSON, untuk editing)
│   └── isu-lingkungan.geojson   ← Data isu lingkungan (format GeoJSON)
└── README.md               ← File yang sedang Anda baca ini
```

---

## 🚀 Cara Membuka Website (Lokal)

1. **Unduh atau clone** seluruh folder `sig-desa-jetis`
2. **Buka file `index.html`** langsung di browser (Chrome, Firefox, Edge)
   - Klik dua kali file `index.html`, atau
   - Klik kanan → "Open with" → pilih browser Anda
3. Peta akan langsung tampil — tidak perlu install apapun!

> 💡 Website ini 100% statis (tanpa server). Semua data sudah tertanam langsung
> di kode, jadi bisa dibuka bahkan tanpa koneksi internet (setelah tile peta
> ter-cache di browser).

---

## 🌐 Cara Deploy ke Hosting Gratis

### Pilihan 1: Netlify (Paling Mudah)

1. Buka **[netlify.com](https://www.netlify.com/)** dan buat akun gratis (bisa pakai Google)
2. Di dashboard, klik **"Add new site" → "Deploy manually"**
3. **Drag & drop** seluruh folder `sig-desa-jetis` ke area upload
4. Tunggu beberapa detik — website Anda langsung online!
5. Netlify akan memberi URL gratis seperti `https://nama-acak.netlify.app`
6. (Opsional) Klik **"Site settings" → "Change site name"** untuk ganti nama URL

**Cara update data peta di Netlify:**
- Edit file yang ingin diubah di komputer Anda
- Buka dashboard Netlify → **"Deploys"** → **"Drag & drop"** folder yang sudah diupdate

---

### Pilihan 2: GitHub Pages

1. Buat akun **[github.com](https://github.com/)** (gratis)
2. Klik **"New repository"**, beri nama (misal: `sig-desa-jetis`)
3. **Upload** semua file dari folder `sig-desa-jetis` ke repository
4. Buka **Settings → Pages**
5. Di bagian "Source", pilih **"Deploy from a branch"**
6. Pilih branch **"main"** dan folder **"/ (root)"**, lalu klik **"Save"**
7. Tunggu 1-2 menit, website akan online di: `https://username.github.io/sig-desa-jetis/`

**Cara update data peta di GitHub:**
- Buka repository → navigasi ke file yang ingin diubah
- Klik ikon pensil (✏️) untuk edit langsung di browser
- Edit → klik "Commit changes"

---

### Pilihan 3: Cloudflare Pages

1. Buat akun di **[dash.cloudflare.com](https://dash.cloudflare.com/)**
2. Masuk ke **"Workers & Pages"** → **"Create application"** → **"Pages"**
3. Pilih **"Upload assets"** (direct upload)
4. Beri nama project dan upload folder `sig-desa-jetis`
5. Website langsung online!

---

## ✏️ Cara Mengganti Data Dummy dengan Data Survei Asli

### Langkah 1: Kumpulkan Data GPS Lapangan

**Opsi A — Pakai HP:**
- Install aplikasi GPS di HP (misal: GPS Essentials, Locus Map, atau SW Maps)
- Jalan mengelilingi batas setiap dusun sambil merekam jalur (track)
- Ekspor sebagai file GPX atau KML

**Opsi B — Pakai GPS Handheld:**
- Rekam waypoint di setiap sudut batas dusun
- Catat koordinat di spreadsheet

### Langkah 2: Buat Poligon Dusun di QGIS (Gratis)

1. **Download & install QGIS** dari [qgis.org](https://qgis.org/) (gratis, open source)
2. Buka QGIS → **Layer → Add Layer → Add Vector Layer** → pilih file GPX/KML hasil survei
3. Buat layer baru: **Layer → Create Layer → New Shapefile Layer**
   - Geometry type: **Polygon**
   - Tambahkan field: `nama_dusun` (Text), `jenis_potensi` (Text), `skor_kelayakan` (Text),
     `komoditas_unggulan` (Text), `keterangan` (Text), `catatan_lingkungan` (Text),
     `luas_estimasi_ha` (Text)
4. **Gambar poligon** setiap dusun berdasarkan titik GPS
5. Isi atribut setiap poligon sesuai data lapangan
6. Ekspor: **Klik kanan layer → Export → Save Features As**
   - Format: **GeoJSON**
   - Nama file: `dusun-potensi.geojson`

### Langkah 3: Alternatif Lebih Mudah — mapshaper.org

1. Buka **[mapshaper.org](https://mapshaper.org/)** di browser
2. Upload file shapefile/GPX/KML hasil survei
3. Edit/simplify jika perlu
4. Klik **"Export"** → pilih format **GeoJSON**

### Langkah 4: Masukkan Data Baru ke Website

1. Buka file `dusun-potensi.geojson` hasil ekspor
2. Buka file `js/data.js` di text editor (Notepad, VS Code, dll.)
3. **Ganti isi** variabel `DATA_DUSUN_POTENSI` dengan isi file GeoJSON baru
4. Pastikan format properties tetap sama (nama field harus sama persis)
5. Simpan dan refresh browser — peta langsung terupdate!

---

## 🎨 Cara Edit Data Peta Tanpa Coding (geojson.io)

Metode ini paling cocok untuk **perangkat desa atau BUMDes** yang ingin update data
tanpa perlu belajar coding:

### Edit Poligon Dusun

1. Buka **[geojson.io](https://geojson.io/)** di browser
2. Buka file `data/dusun-potensi.geojson` di komputer Anda
3. **Copy semua isinya** (Ctrl+A lalu Ctrl+C)
4. Di geojson.io, klik panel kanan (area kode JSON) dan **paste** (Ctrl+V)
5. Peta akan langsung menampilkan poligon dusun!
6. **Untuk edit bentuk**: klik poligon di peta → tarik titik-titiknya
7. **Untuk edit data**: klik poligon → edit properti di panel kanan
8. **Untuk tambah dusun**: pakai tool gambar poligon di toolbar atas
9. Setelah selesai, **copy semua kode JSON** dari panel kanan
10. Paste ke file `js/data.js` (ganti isi variabel `DATA_DUSUN_POTENSI`)

### Edit Titik Isu Lingkungan

- Sama prosesnya, tapi gunakan file `data/isu-lingkungan.geojson`
- Dan paste hasilnya ke variabel `DATA_ISU_LINGKUNGAN` di `js/data.js`

### Tips Penting

- ⚠️ **Jangan ubah nama field** (nama_dusun, jenis_potensi, dll.) — website
  membaca nama-nama ini secara persis
- ✅ **Boleh ubah isi/nilai** field (misal ganti "Padi" jadi "Padi, Kedelai")
- ✅ **Boleh tambah atau hapus** feature (dusun/titik isu)
- 📝 Simpan backup file asli sebelum mengedit!

---

## 🔧 Cara Mengubah Pengaturan Tampilan

Buka file **`js/config.js`** untuk mengubah:

| Pengaturan | Penjelasan |
|---|---|
| `MAP_CENTER` | Titik tengah peta (latitude, longitude) |
| `MAP_ZOOM` | Level zoom default saat peta dibuka |
| `COLORS` | Warna poligon per jenis potensi |
| `OPACITY` | Tingkat transparansi per skor kelayakan |
| `TILE_URL` | URL tile peta (default: OpenStreetMap) |
| `PROGRAM_TITLE` | Judul yang tampil di header website |
| `DESA_NAME` | Nama desa/kecamatan di header |

---

## ❓ Troubleshooting

**Peta tidak muncul / blank putih:**
- Pastikan koneksi internet aktif (untuk memuat tile peta OpenStreetMap)
- Coba buka di browser lain (Chrome/Firefox)
- Periksa apakah file `js/data.js` ada dan tidak kosong

**Poligon dusun tidak tampil:**
- Buka Console browser (tekan F12 → tab "Console")
- Periksa apakah ada error merah (biasanya typo di file data.js)
- Pastikan format GeoJSON valid — test di [geojsonlint.com](https://geojsonlint.com/)

**Website lambat di HP:**
- Ini normal untuk koneksi 3G, tunggu hingga tile peta ter-load
- Setelah pertama kali dibuka, peta akan ter-cache dan lebih cepat

---

## 📄 Lisensi & Kredit

- **Peta dasar**: © [OpenStreetMap](https://www.openstreetmap.org/) contributors
- **Library peta**: [Leaflet.js](https://leafletjs.com/) v1.9.4 (BSD-2 License)
- **Proyek**: Program BBK — Pengabdian Masyarakat Mahasiswa
- **Lokasi**: Desa Jetis, Kecamatan Besuki, Kabupaten Situbondo, Jawa Timur

---

*Dibuat sebagai prototipe untuk program pengabdian masyarakat (BBK).
Dikembangkan agar ringan, gratis, dan mudah di-maintain oleh perangkat desa.*

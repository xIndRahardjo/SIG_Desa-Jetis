# Panduan Setup Backend Google Apps Script
# SIG Desa Jetis — Panel Admin

Panduan ini menjelaskan cara menyiapkan backend gratis menggunakan
Google Apps Script dan Google Sheets sebagai database.

---

## Langkah 1: Siapkan Google Sheets (Database)

1. Buka **Google Drive** (drive.google.com) dengan akun Google desa.
2. Klik **+ Baru → Google Spreadsheet**.
3. Beri nama spreadsheet, misal: `Database SIG Desa Jetis`.
4. **Salin ID Spreadsheet** dari URL:
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_ADA_DI_SINI/edit
   ```
   Contoh ID: `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms`

> Catatan: Sheet (tab) akan dibuat otomatis oleh skrip saat pertama kali
> data ditambahkan. Anda tidak perlu membuat tab secara manual.

---

## Langkah 2: Buat Google Apps Script

1. Buka **script.google.com** (atau Google Drive → Baru → Lainnya → Google Apps Script).
2. Klik **Proyek tanpa judul** dan ganti namanya menjadi: `SIG Desa Jetis API`.
3. Hapus semua kode yang ada di editor (kode `function myFunction() {}`).
4. Buka file **`backend/Code.gs`** di dalam proyek SIG ini.
5. Copy **semua isinya** dan paste ke editor Google Apps Script.

---

## Langkah 3: Konfigurasi Skrip

Di bagian atas skrip, temukan blok `CONFIG_GAS` dan ubah 2 nilai wajib:

```javascript
const CONFIG_GAS = {
  // GANTI dengan token/password yang akan dibagikan ke perangkat desa:
  ADMIN_TOKEN: 'JetisAdmin2025!',  // ← GANTI INI

  // GANTI dengan ID Spreadsheet dari Langkah 1:
  SPREADSHEET_ID: 'GANTI_DENGAN_SPREADSHEET_ID_ANDA',  // ← GANTI INI
  ...
};
```

**Contoh token yang baik:** `Jetis@2025`, `DesaJetis#Admin`, dll.
Token harus cukup unik tapi mudah diingat perangkat desa.

---

## Langkah 4: Deploy sebagai Web App

1. Di Google Apps Script, klik **Deploy (ikon rocket) → Deployment baru**.
2. Klik ikon ⚙️ di sebelah "Pilih jenis" → pilih **Web App**.
3. Atur konfigurasi:
   - **Deskripsi:** `SIG Desa Jetis - v1`
   - **Jalankan sebagai:** `Saya` (akun desa yang login)
   - **Siapa yang punya akses:** `Semua orang`
4. Klik **Deploy**.
5. Jika diminta izin, klik **Otorisasi akses → Lanjutkan → Izinkan**.
6. **Salin URL Web App** yang muncul.
   Contoh: `https://script.google.com/macros/s/AKfycby.../exec`

---

## Langkah 5: Pasang URL ke Proyek SIG

Setelah dapat URL, isi ke **2 file** berikut:

### File 1: `admin/admin.js` (baris 1)
```javascript
const BACKEND_URL = 'https://script.google.com/macros/s/AKfycby.../exec';
```

### File 2: `js/app.js` (baris 8)
```javascript
const BACKEND_URL_PUBLIC = 'https://script.google.com/macros/s/AKfycby.../exec';
```

Isi keduanya dengan URL yang **sama persis**.

---

## Langkah 6: Push ke GitHub

Setelah semua file diperbarui, push ke GitHub:
```powershell
git add .
git commit -m "feat: tambah panel admin dengan backend GAS"
git push origin main
```

Situs publik akan otomatis update (via GitHub Pages/Vercel/Netlify).

---

## Langkah 7: Test Fungsionalitas

1. Buka `https://[domain-anda]/admin/` di browser.
2. Masukkan token yang sudah Anda set di `ADMIN_TOKEN`.
3. Coba tambah lokasi baru dengan klik di peta mini.
4. Buka `https://[domain-anda]/` (peta publik).
5. Reload → lokasi baru harus muncul sebagai marker lingkaran.
6. Cek juga Google Sheets → data harus tersimpan di tab `LokasiPotensi` atau `LokasiLingkungan`.

---

## Informasi yang Perlu Dikonfirmasi ke Pengelola Server

Untuk memastikan setup berjalan lancar, konfirmasi hal berikut:

| Informasi | Pertanyaan |
|-----------|------------|
| Akun Google | Apakah ada akun Gmail khusus desa? (misal desajetis@gmail.com) |
| Domain/URL | URL akhir situs publik setelah deploy? |
| Hosting | GitHub Pages / Vercel / Netlify / lainnya? |
| Akses repo | Apakah ada akses push ke repositori GitHub? |

---

## Memperbarui Deployment (Jika Ada Perubahan Kode GAS)

Jika kode `Code.gs` diubah, **wajib buat deployment baru:**
1. Google Apps Script → Deploy → Kelola deployment.
2. Klik ikon pensil ✏️ di deployment aktif.
3. Ubah versi ke "Versi baru".
4. Klik **Deploy**.

URL tidak berubah, tapi kode yang berjalan sudah versi terbaru.

---

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| Token ditolak padahal benar | Cek tidak ada spasi di awal/akhir token di Code.gs |
| Data tidak muncul di peta | Pastikan `BACKEND_URL_PUBLIC` di app.js sudah diisi |
| CORS error di browser | Pastikan deploy dengan "Siapa yang punya akses: Semua orang" |
| Spreadsheet tidak bisa diakses | Pastikan `SPREADSHEET_ID` benar dan akun Google yang deploy adalah pemiliknya |
| Lokasi tidak tersimpan di Sheets | Cek apakah ada pesan error di toast (panel admin) |

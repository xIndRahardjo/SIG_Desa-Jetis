# Panduan Setup Vercel & Upstash Redis (KV)
# SIG Desa Jetis — Panel Admin

Panduan ini menjelaskan cara mengaktifkan database Redis gratis di Vercel agar fitur Panel Admin berfungsi sempurna tanpa error CORS.

---

## 1. Pastikan Proyek Sudah Dideploy ke Vercel

Jika Anda belum mendeploy repositori GitHub ini ke Vercel:
1. Buka [vercel.com](https://vercel.com) dan login dengan akun GitHub Anda.
2. Klik **Add New → Project**.
3. Import repositori `SIG_Desa-Jetis`.
4. Klik **Deploy**.

---

## 2. Aktifkan Database Redis (Storage)

Vercel menggunakan layanan dari Upstash untuk Redis gratis.

1. Di Dashboard Vercel, buka proyek `SIG_Desa-Jetis`.
2. Klik tab **Storage** (di menu atas).
3. Klik tombol **Create Database**.
4. Pilih **Redis** (di bawah bagian Upstash), lalu klik **Continue**.
5. Baca dan terima *Terms of Service* (jika muncul).
6. Beri nama database, misalnya: `sig-desa-jetis-redis`.
7. Pilih region yang paling dekat (misal: Singapore / `sin1`).
8. Klik **Create**.
9. Setelah database terbuat, Vercel akan **otomatis** menyambungkan kredensial (`UPSTASH_REDIS_REST_URL` dan `UPSTASH_REDIS_REST_TOKEN`) ke proyek Anda.
10. Akan ada popup "Connect to Project", pilih proyek `SIG_Desa-Jetis` dan klik **Connect**.

---

## 3. Tambahkan Password Admin (ADMIN_TOKEN)

Agar tidak ada sembarang orang yang bisa mengubah data peta, kita perlu mengatur token / password.

1. Di Dashboard Vercel, buka proyek Anda, lalu klik tab **Settings**.
2. Di menu sebelah kiri, klik **Environment Variables**.
3. Tambahkan variabel baru:
   - **Key:** `ADMIN_TOKEN`
   - **Value:** `bbk8jetis1` *(atau ganti dengan password yang Anda inginkan)*
4. Pastikan dicentang untuk *Production*, *Preview*, dan *Development*.
5. Klik **Save**.

---

## 4. Redeploy (Wajib Dilakukan)

Agar Vercel mengenali database Redis dan Password Admin yang baru saja kita tambahkan, Anda wajib melakukan redeploy:

1. Klik tab **Deployments** (di menu atas).
2. Di deployment paling atas (yang paling baru), klik ikon tiga titik `...` di sebelah kanannya.
3. Pilih **Redeploy**.
4. Tunggu hingga proses selesai (muncul centang hijau).

---

## ✅ Selesai!

Sekarang coba buka `https://[domain-vercel-anda.vercel.app]/admin/`
- Masukkan token `bbk8jetis1`.
- Coba tambah lokasi baru.
- Jika berhasil, notifikasi hijau akan muncul dan data tersimpan di Redis!

/**
 * data.js — Data GeoJSON Desa Jetis (DUMMY / ESTIMASI)
 *
 * ╔═══════════════════════════════════════════════════════════╗
 * ║  PERHATIAN: Semua koordinat batas dusun di bawah ini     ║
 * ║  adalah PERKIRAAN untuk prototipe. Belum berbasis survei  ║
 * ║  GPS atau shapefile resmi. Harus diganti dengan data      ║
 * ║  lapangan sebelum digunakan secara resmi.                 ║
 * ╚═══════════════════════════════════════════════════════════╝
 *
 * Cara mengganti data:
 * 1. Buka file .geojson di geojson.io untuk edit visual
 * 2. Atau ekspor dari QGIS / mapshaper.org
 * 3. Copy-paste isi GeoJSON ke variabel di bawah
 */

// ─────────────────────────────────────────────────────────────
// Layer 1: Potensi SDA & Produksi (Polygon per dusun)
// ─────────────────────────────────────────────────────────────

const DATA_DUSUN_POTENSI = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [113.7015, -7.7490],
          [113.7090, -7.7493],
          [113.7088, -7.7548],
          [113.7018, -7.7545],
          [113.7015, -7.7490]
        ]]
      },
      "properties": {
        "id": "langsep",
        "nama_dusun": "Langsep",
        "jenis_potensi": "Industri Batu Bata",
        "skor_kelayakan": "Tinggi",
        "komoditas_unggulan": "Batu Bata",
        "keterangan": "Sentra industri batu bata rumahan dengan puluhan unit usaha aktif. Tanah lempung berpasir sangat mendukung produksi batu bata berkualitas.",
        "catatan_lingkungan": "",
        "luas_estimasi_ha": "55"
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [113.7090, -7.7493],
          [113.7170, -7.7490],
          [113.7168, -7.7548],
          [113.7088, -7.7548],
          [113.7090, -7.7493]
        ]]
      },
      "properties": {
        "id": "randu",
        "nama_dusun": "Randu",
        "jenis_potensi": "Industri Batu Bata",
        "skor_kelayakan": "Tinggi",
        "komoditas_unggulan": "Batu Bata, Jagung",
        "keterangan": "Sentra industri batu bata sekaligus area pertanian jagung aktif. Salah satu dusun dengan aktivitas ekonomi paling beragam di Desa Jetis.",
        "catatan_lingkungan": "Terdapat titik pembakaran sampah terbuka yang berdampak pada kualitas udara warga sekitar. Perlu penanganan pengelolaan sampah yang lebih baik.",
        "luas_estimasi_ha": "58"
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [113.7018, -7.7545],
          [113.7088, -7.7548],
          [113.7092, -7.7600],
          [113.7015, -7.7605],
          [113.7018, -7.7545]
        ]]
      },
      "properties": {
        "id": "krajan",
        "nama_dusun": "Krajan",
        "jenis_potensi": "Industri Tahu-Tempe",
        "skor_kelayakan": "Sedang",
        "komoditas_unggulan": "Tahu, Tempe",
        "keterangan": "Pusat desa dan konsentrasi industri tahu-tempe rumahan. Produksi harian melayani pasar lokal Kecamatan Besuki dan sekitarnya.",
        "catatan_lingkungan": "Limbah cair produksi tahu berpotensi mencemari saluran air/sungai sekitar jika belum diolah dengan baik. Data estimasi — perlu verifikasi lapangan.",
        "luas_estimasi_ha": "52"
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [113.7088, -7.7548],
          [113.7168, -7.7548],
          [113.7170, -7.7598],
          [113.7092, -7.7600],
          [113.7088, -7.7548]
        ]]
      },
      "properties": {
        "id": "biting",
        "nama_dusun": "Biting",
        "jenis_potensi": "Material Tambang",
        "skor_kelayakan": "Tinggi",
        "komoditas_unggulan": "Batu, Koral, Pasir",
        "keterangan": "Dusun dengan potensi material tambang (batu, koral, pasir) yang signifikan. Menjadi sumber material bangunan untuk wilayah Besuki dan sekitarnya.",
        "catatan_lingkungan": "Aktivitas penambangan berpotensi menyebabkan erosi dan degradasi lahan jika tidak dikelola secara berkelanjutan.",
        "luas_estimasi_ha": "50"
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [113.7015, -7.7605],
          [113.7092, -7.7600],
          [113.7095, -7.7655],
          [113.7012, -7.7660],
          [113.7015, -7.7605]
        ]]
      },
      "properties": {
        "id": "kanak-putih",
        "nama_dusun": "Kanak Putih",
        "jenis_potensi": "Pertanian",
        "skor_kelayakan": "Sedang",
        "komoditas_unggulan": "Padi",
        "keterangan": "Dusun pertanian dengan lahan persawahan yang luas. Padi menjadi komoditas utama dengan sistem irigasi semi-teknis.",
        "catatan_lingkungan": "",
        "luas_estimasi_ha": "56"
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [113.7092, -7.7600],
          [113.7170, -7.7598],
          [113.7172, -7.7652],
          [113.7095, -7.7655],
          [113.7092, -7.7600]
        ]]
      },
      "properties": {
        "id": "kesambi",
        "nama_dusun": "Kesambi",
        "jenis_potensi": "Pertanian",
        "skor_kelayakan": "Sedang",
        "komoditas_unggulan": "Padi, Jagung",
        "keterangan": "Dusun pertanian dengan pola tanam padi-jagung bergantian. Juga terdapat beberapa usaha tahu-tempe rumahan skala kecil (estimasi, perlu verifikasi).",
        "catatan_lingkungan": "",
        "luas_estimasi_ha": "53"
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [113.7012, -7.7660],
          [113.7095, -7.7655],
          [113.7090, -7.7715],
          [113.7015, -7.7712],
          [113.7012, -7.7660]
        ]]
      },
      "properties": {
        "id": "tanjung",
        "nama_dusun": "Tanjung",
        "jenis_potensi": "Pertanian",
        "skor_kelayakan": "Sedang",
        "komoditas_unggulan": "Padi",
        "keterangan": "Dusun pertanian dominan persawahan. Akses jalan dusun cukup baik untuk distribusi hasil panen ke pasar Besuki.",
        "catatan_lingkungan": "",
        "luas_estimasi_ha": "54"
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [113.7095, -7.7655],
          [113.7172, -7.7652],
          [113.7170, -7.7715],
          [113.7090, -7.7715],
          [113.7095, -7.7655]
        ]]
      },
      "properties": {
        "id": "karang-tengah",
        "nama_dusun": "Karang Tengah",
        "jenis_potensi": "Pertanian",
        "skor_kelayakan": "Rendah",
        "komoditas_unggulan": "Padi",
        "keterangan": "Dusun pertanian dengan produktivitas relatif lebih rendah dibanding dusun lain. Perlu peningkatan irigasi dan pengelolaan lahan untuk mengoptimalkan hasil.",
        "catatan_lingkungan": "",
        "luas_estimasi_ha": "48"
      }
    }
  ]
};


// ─────────────────────────────────────────────────────────────
// Layer 2: Isu Lingkungan (Point markers)
// ─────────────────────────────────────────────────────────────

const DATA_ISU_LINGKUNGAN = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [113.7132, -7.7518]
      },
      "properties": {
        "id": "isu-1",
        "nama_lokasi": "Titik Pembakaran Sampah Terbuka",
        "dusun": "Randu",
        "jenis_isu": "Pencemaran Udara",
        "deskripsi": "Lokasi tumpukan sampah warga yang kerap dibakar secara terbuka. Asap pembakaran berdampak langsung pada kualitas udara dan kesehatan warga sekitar, terutama saat musim kemarau.",
        "tingkat_keparahan": "Sedang",
        "rekomendasi": "Perlu penyediaan TPS (Tempat Pembuangan Sementara) dan edukasi pengelolaan sampah rumah tangga.",
        "status": "Perlu Penanganan"
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [113.7048, -7.7578]
      },
      "properties": {
        "id": "isu-2",
        "nama_lokasi": "Area Potensi Limbah Cair Produksi Tahu",
        "dusun": "Krajan",
        "jenis_isu": "Pencemaran Air",
        "deskripsi": "Konsentrasi industri tahu-tempe rumahan di area ini. Limbah cair (whey tahu) yang belum diolah berpotensi mencemari saluran air dan sungai kecil di sekitar sentra produksi.",
        "tingkat_keparahan": "Rendah",
        "rekomendasi": "Perlu verifikasi lapangan mengenai sistem pembuangan limbah. Potensi pengolahan limbah cair menjadi biogas atau pakan ternak.",
        "status": "Perlu Verifikasi"
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [113.7138, -7.7572]
      },
      "properties": {
        "id": "isu-3",
        "nama_lokasi": "Area Penambangan Material Aktif",
        "dusun": "Biting",
        "jenis_isu": "Degradasi Lahan",
        "deskripsi": "Area penambangan batu, koral, dan pasir yang aktif. Jika tidak dikelola dengan prinsip pertambangan berkelanjutan, berpotensi menyebabkan erosi dan kerusakan bentang alam.",
        "tingkat_keparahan": "Rendah",
        "rekomendasi": "Pemantauan berkala dampak lingkungan dan penerapan reklamasi lahan pasca-tambang.",
        "status": "Perlu Pemantauan"
      }
    }
  ]
};

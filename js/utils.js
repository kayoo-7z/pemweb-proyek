// js/utils.js

/**
 * Filter obat berdasarkan kategori (misal: 'Obat Bebas', 'Resep Dokter', 'Skincare')
 */
export const filterKategori = (dataObat, kategori) => {
  if (!Array.isArray(dataObat)) {
    throw new TypeError('Data obat harus berupa Array');
  }
  return dataObat.filter((item) => item.kategori.toLowerCase() === kategori.toLowerCase());
};

/**
 * Cari obat berdasarkan ID atau Nama
 */
export const cariObat = (dataObat, keyword) => {
  if (!Array.isArray(dataObat)) {
    throw new TypeError('Data obat harus berupa Array');
  }
  return dataObat.find(
    (item) => item.id === Number(keyword) || item.nama.toLowerCase().includes(keyword.toLowerCase())
  );
};

/**
 * Hitung total nilai stok seluruh inventaris obat menggunakan reduce
 */
export const hitungTotalStok = (dataObat) => {
  if (!Array.isArray(dataObat)) {
    throw new TypeError('Data obat harus berupa Array');
  }
  return dataObat.reduce((total, item) => total + (item.harga * item.stok), 0);
};

/**
 * Buat ringkasan informasi obat menggunakan destructuring dan template literal
 */
export const formatRingkasanObat = (obat) => {
  if (!obat || typeof obat !== 'object') {
    throw new Error('Data obat tidak valid');
  }
  const { nama, kategori, harga, stok, ketersediaan } = obat;
  const statusStok = ketersediaan ? `Tersedia (${stok} unit)` : 'Stok Habis';
  
  return `[${kategori}] ${nama} - Rp${harga.toLocaleString('id-ID')} | Status: ${statusStok}`;
};

/**
 * Cari obat berdasarkan nama (banyak hasil). Keyword kosong = kembalikan semua data.
 */
export const cariBerdasarkanNama = (dataObat, keyword) => {
  if (!Array.isArray(dataObat)) {
    throw new TypeError('Data obat harus berupa Array');
  }
  const kunci = String(keyword).trim().toLowerCase();
  if (!kunci) return dataObat;
  return dataObat.filter((item) => item.nama.toLowerCase().includes(kunci));
};

/**
 * Ambil satu obat berdasarkan ID (dipakai tombol Detail)
 */
export const cariObatById = (dataObat, id) => {
  if (!Array.isArray(dataObat)) {
    throw new TypeError('Data obat harus berupa Array');
  }
  return dataObat.find((item) => item.id === Number(id));
};

// ==========================================
// TUGAS 06: VALIDASI FORM ANTREAN DOKTER
// ==========================================

export const LAYANAN_VALID = ['Konsultasi Dokter', 'Pemeriksaan GCU', 'Tebus Resep Dokter'];

/**
 * Tanggal lokal format YYYY-MM-DD (+ tambahHari).
 * Sengaja tidak memakai toISOString() karena memakai UTC dan bisa
 * mundur sehari untuk zona waktu WITA (UTC+8).
 */
export const tanggalLokal = (tambahHari = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + tambahHari);
  const dua = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${dua(d.getMonth() + 1)}-${dua(d.getDate())}`;
};

/**
 * Baca + normalisasi data form (trim, rapikan spasi, boolean checkbox)
 */
export const bacaDataAntrean = (form) => {
  const fd = new FormData(form);
  const teks = (nama) => String(fd.get(nama) ?? '').trim();
  return {
    nama: teks('nama').replace(/\s+/g, ' '),
    wa: teks('wa'),
    layanan: teks('layanan'),
    tanggal: teks('tanggal'),
    keluhan: teks('keluhan'),
    setuju: form.elements.setuju.checked
  };
};

/**
 * Validasi aturan bisnis. Mengembalikan object errors ({} jika valid).
 * hariIni & batasAkhir bisa disuntik agar mudah diuji.
 */
export const validasiAntrean = (data, hariIni = tanggalLokal(), batasAkhir = tanggalLokal(30)) => {
  const errors = {};

  // 1. Nama
  if (!data.nama) {
    errors.nama = 'Nama lengkap wajib diisi.';
  } else if (data.nama.length < 3) {
    errors.nama = 'Nama minimal 3 karakter.';
  } else if (!/^\p{L}[\p{L}\s.'-]*$/u.test(data.nama)) {
    errors.nama = 'Nama hanya boleh berisi huruf, spasi, titik, apostrof, atau tanda hubung.';
  }
  // 2. Nomor WhatsApp
  const nomor = data.wa.replace(/[\s-]/g, '');
  if (!data.wa) {
    errors.wa = 'Nomor WhatsApp wajib diisi.';
  } else if (!/^(\+62|62|0)8\d{8,11}$/.test(nomor)) {
    errors.wa = 'Format nomor belum valid. Gunakan 08xxxxxxxxxx (10–13 digit).';
  }
  // 3. Layanan
  if (!data.layanan) {
    errors.layanan = 'Pilih salah satu layanan.';
  } else if (!LAYANAN_VALID.includes(data.layanan)) {
    errors.layanan = 'Layanan yang dipilih tidak tersedia. Pilih dari daftar.';
  }
  // 4. Tanggal kunjungan
  if (!data.tanggal) {
    errors.tanggal = 'Tanggal kunjungan wajib diisi.';
  } else if (data.tanggal < hariIni) {
    errors.tanggal = 'Tanggal kunjungan tidak boleh sebelum hari ini.';
  } else if (data.tanggal > batasAkhir) {
    errors.tanggal = 'Pendaftaran hanya bisa maksimal 30 hari ke depan.';
  }
  // 5. Keluhan (opsional)
  if (data.keluhan.length > 200) {
    errors.keluhan = 'Keluhan maksimal 200 karakter.';
  }
  // 6. Persetujuan
  if (!data.setuju) {
    errors.setuju = 'Centang persetujuan untuk melanjutkan pendaftaran.';
  }

  return errors;
};

// ==========================================
// TUGAS 07: HELPER DASHBOARD STOK OBAT
// ==========================================

export const formatRupiah = (angka) => `Rp${Number(angka).toLocaleString('id-ID')}`;

/**
 * Statistik ringkas untuk kartu dashboard
 */
export const hitungStatistikObat = (dataObat) => {
  if (!Array.isArray(dataObat)) {
    throw new TypeError('Data obat harus berupa Array');
  }
  return {
    total: dataObat.length,
    tersedia: dataObat.filter((o) => o.ketersediaan).length,
    habis: dataObat.filter((o) => !o.ketersediaan).length,
    nilaiStok: hitungTotalStok(dataObat)
  };
};

/**
 * Filter dashboard: kata kunci + status stok + kategori (semua dari data yang sudah dimuat)
 */
export const filterDashboard = (dataObat, { keyword = '', status = 'semua', kategori = 'semua' } = {}) => {
  if (!Array.isArray(dataObat)) {
    throw new TypeError('Data obat harus berupa Array');
  }
  const kunci = String(keyword).trim().toLowerCase();

  return dataObat.filter((o) => {
    const cocokNama = !kunci || o.nama.toLowerCase().includes(kunci);
    const cocokStatus =
      status === 'semua' || (status === 'tersedia' ? o.ketersediaan : !o.ketersediaan);
    const cocokKategori = kategori === 'semua' || o.kategori === kategori;
    return cocokNama && cocokStatus && cocokKategori;
  });
};
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
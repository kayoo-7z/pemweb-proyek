// js/app.js
import { 
  filterKategori, 
  cariObat, 
  hitungTotalStok, 
  formatRingkasanObat 
} from './utils.js';

// Data Inventaris Obat Apotek Bina Farma
const inventarisApotek = [
  { id: 1, nama: 'Paracetamol 500mg', kategori: 'Obat Bebas', harga: 5000, stok: 50, ketersediaan: true },
  { id: 2, nama: 'Amoxicillin 500mg', kategori: 'Resep Dokter', harga: 12000, stok: 20, ketersediaan: true },
  { id: 3, nama: 'Herborist Juice for Skin', kategori: 'Skincare', harga: 25000, stok: 15, ketersediaan: true },
  { id: 4, nama: 'Vitamin C 1000mg', kategori: 'Obat Bebas', harga: 15000, stok: 0, ketersediaan: false },
  { id: 5, nama: 'Milna Rice Crackers', kategori: 'Susu & Makanan', harga: 18000, stok: 30, ketersediaan: true }
];

console.log('=== APLIKASI MANAGEMENT APOTEK BINA FARMA ===\n');

try {
  // 1. Ambil daftar nama obat yang tersedia menggunakan map
  const daftarNamaObat = inventarisApotek
    .filter(item => item.ketersediaan)
    .map(({ nama, harga }) => `${nama} (Rp${harga.toLocaleString('id-ID')})`);
  
  console.log('--- Obat Ready Stok ---');
  console.table(daftarNamaObat);

  // 2. Filter obat berdasarkan kategori 'Obat Bebas'
  const obatBebas = filterKategori(inventarisApotek, 'Obat Bebas');
  console.log('\n--- Kategori Obat Bebas ---');
  console.table(obatBebas);

  // 3. Cari obat spesifik dengan find
  const obatDicari = cariObat(inventarisApotek, 'Amoxicillin');
  console.log('\n--- Hasil Pencarian Obat ---');
  if (obatDicari) {
    console.log(formatRingkasanObat(obatDicari));
  } else {
    console.log('Obat tidak ditemukan.');
  }

  // 4. Hitung total aset nilai stok obat dengan reduce
  const totalAset = hitungTotalStok(inventarisApotek);
  console.log(`\n--- Total Nilai Stok Inventaris: Rp${totalAset.toLocaleString('id-ID')} ---`);

} catch (error) {
  // Error handling dasar
  console.error('Terjadi kesalahan pada pengolahan data:', error.message);
}
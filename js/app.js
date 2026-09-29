// js/app.js
import { 
  filterKategori, 
  cariObat, 
  hitungTotalStok, 
  formatRingkasanObat 
} from './utils.js';
import { cariBerdasarkanNama, cariObatById } from './utils.js';
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
// ==========================================
// TUGAS 05 OBE: DOM, EVENT & WEB STORAGE
// ==========================================

// --- Seleksi elemen ---
const daftarObat = document.querySelector('#daftar-obat');
const detailObat = document.querySelector('#detail-obat');
const infoHasil = document.querySelector('#info-hasil');
const inputCari = document.querySelector('#cari-obat');
const tombolFilter = document.querySelectorAll('[data-filter]');
const formShop = document.querySelector('#shop form');
const pesanStatus = document.querySelector('#pesan-status');
const themeButton = document.querySelector('#theme-button');

// --- State sederhana ---
const state = { kategori: 'Semua', keyword: '' };

// --- Render DOM aman (tanpa innerHTML) ---
function buatKartuObat(obat) {
  const { id, nama, kategori, harga, stok, ketersediaan } = obat;

  const kartu = document.createElement('article');
  kartu.className = 'card-obat';

  const judul = document.createElement('h4');
  judul.textContent = nama;

  const info = document.createElement('p');
  info.textContent = `${kategori} • Rp${harga.toLocaleString('id-ID')}`;

  const badge = document.createElement('span');
  badge.className = `badge-stok ${ketersediaan ? 'ada' : 'habis'}`;
  badge.textContent = ketersediaan ? `Stok: ${stok}` : 'Stok Habis';

  const tombol = document.createElement('button');
  tombol.type = 'button';
  tombol.className = 'btn-detail';
  tombol.dataset.id = id;
  tombol.textContent = 'Detail';

  kartu.append(judul, info, badge, tombol);
  return kartu;
}

function renderObat(items) {
  daftarObat.replaceChildren();

  if (items.length === 0) {
    const kosong = document.createElement('p');
    kosong.textContent = 'Obat yang Anda cari tidak ditemukan.';
    daftarObat.append(kosong);
    return;
  }

  daftarObat.append(...items.map(buatKartuObat));
}

function perbaruiDaftar() {
  try {
    const berdasarkanKategori =
      state.kategori === 'Semua'
        ? inventarisApotek
        : filterKategori(inventarisApotek, state.kategori);

    const hasil = cariBerdasarkanNama(berdasarkanKategori, state.keyword);

    renderObat(hasil);
    infoHasil.textContent = `Menampilkan ${hasil.length} dari ${inventarisApotek.length} obat`;
    detailObat.replaceChildren(); // tutup panel detail lama
  } catch (error) {
    infoHasil.textContent = 'Gagal menampilkan daftar obat.';
    console.error('Error render katalog:', error.message);
  }
}

// --- INTERAKSI 1a: filter kategori (event click) ---
tombolFilter.forEach((tombol) => {
  tombol.addEventListener('click', () => {
    state.kategori = tombol.dataset.filter;
    tombolFilter.forEach((t) => t.classList.toggle('aktif', t === tombol));
    perbaruiDaftar();
  });
});

// --- INTERAKSI 1b: pencarian real-time (event input) ---
inputCari.addEventListener('input', () => {
  state.keyword = inputCari.value;
  perbaruiDaftar();
});

// --- INTERAKSI 2: event delegation pada tombol Detail ---
function tampilkanDetail(obat) {
  detailObat.replaceChildren();
  if (!obat) return;

  const panel = document.createElement('div');
  panel.className = 'panel-detail';

  const judul = document.createElement('h4');
  judul.textContent = 'Detail Obat';

  const ringkasan = document.createElement('p');
  ringkasan.textContent = formatRingkasanObat(obat);

  panel.append(judul, ringkasan);

  if (obat.kategori === 'Resep Dokter') {
    const catatan = document.createElement('p');
    catatan.textContent = 'Obat ini hanya dapat ditebus dengan resep dokter. Silakan unggah resep Anda.';
    panel.append(catatan);
  }

  const tutup = document.createElement('button');
  tutup.type = 'button';
  tutup.textContent = 'Tutup';
  tutup.addEventListener('click', () => detailObat.replaceChildren());

  panel.append(tutup);
  detailObat.append(panel);
}

daftarObat.addEventListener('click', (event) => {
  const tombol = event.target.closest('.btn-detail');
  if (!tombol || !daftarObat.contains(tombol)) return;
  tampilkanDetail(cariObatById(inventarisApotek, tombol.dataset.id));
});

// --- Event submit: cegah reload halaman ---
formShop.addEventListener('submit', (event) => {
  event.preventDefault();
  if (document.activeElement === inputCari) return; // Enter saat mengetik pencarian
  pesanStatus.textContent = 'Fitur unggah resep dokter akan segera tersedia. Silakan kunjungi apotek atau hubungi WhatsApp kami.';
});

// --- INTERAKSI 3: tema gelap/terang + localStorage ---
const TEMA_KEY = 'theme';

function terapkanTema(tema) {
  document.documentElement.dataset.theme = tema;
  themeButton.textContent = tema === 'dark' ? '☀️ Mode Terang' : '🌙 Mode Gelap';
}

function bacaTema() {
  try {
    return localStorage.getItem(TEMA_KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light'; // localStorage tidak tersedia
  }
}

themeButton.addEventListener('click', () => {
  const temaBaru = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  terapkanTema(temaBaru);
  try {
    localStorage.setItem(TEMA_KEY, temaBaru);
  } catch (error) {
    console.warn('Tema tidak dapat disimpan:', error.message);
  }
});

// --- Inisialisasi ---
terapkanTema(bacaTema());
perbaruiDaftar();
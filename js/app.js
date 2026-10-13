// js/app.js
import { 
  filterKategori, 
  cariObat, 
  hitungTotalStok, 
  formatRingkasanObat 
} from './utils.js';
import { cariBerdasarkanNama, cariObatById } from './utils.js';
import { bacaDataAntrean, validasiAntrean, tanggalLokal } from './utils.js';
import { ambilDataObat, pesanErrorRamah, ENDPOINT_OBAT } from './api.js';
import { hitungStatistikObat, filterDashboard, formatRupiah } from './utils.js';
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

// ==========================================
// TUGAS 06 OBE: FORM AKSESIBEL & VALIDASI
// ==========================================
const formAntrean = document.querySelector('#form-antrean');
const ringkasanError = document.querySelector('#ringkasan-error');
const jumlahError = document.querySelector('#jumlah-error');
const daftarError = document.querySelector('#daftar-error');
const statusForm = document.querySelector('#form-status');
const hasilDaftar = document.querySelector('#hasil-pendaftaran');

// Batas tanggal di date picker (HTML constraint, diisi dinamis)
formAntrean.elements.tanggal.min = tanggalLokal();
formAntrean.elements.tanggal.max = tanggalLokal(30);

function bersihkanError() {
  formAntrean.querySelectorAll('.error').forEach((el) => { el.textContent = ''; });
  formAntrean.querySelectorAll('[aria-invalid]').forEach((el) => el.removeAttribute('aria-invalid'));
  daftarError.replaceChildren();
  ringkasanError.hidden = true;
  statusForm.textContent = '';
  hasilDaftar.replaceChildren();
}

function tampilkanError(errors) {
  const daftar = Object.entries(errors);

  for (const [field, pesan] of daftar) {
    document.querySelector(`#error-${field}`).textContent = pesan;
    formAntrean.elements[field].setAttribute('aria-invalid', 'true');

    const item = document.createElement('li');
    item.textContent = pesan;
    daftarError.append(item);
  }

  jumlahError.textContent = daftar.length;
  ringkasanError.hidden = false;
  statusForm.textContent = 'Periksa kembali data yang belum valid.';
  formAntrean.elements[daftar[0][0]].focus(); // fokus ke error pertama
}

function tampilkanPreview(data) {
  const panel = document.createElement('div');
  panel.className = 'panel-detail';

  const judul = document.createElement('h4');
  judul.textContent = 'Data valid — preview pendaftaran';

  const dl = document.createElement('dl');
  const baris = [
    ['Nama', data.nama],
    ['WhatsApp', data.wa],
    ['Layanan', data.layanan],
    ['Tanggal kunjungan', data.tanggal],
    ['Keluhan', data.keluhan || '-']
  ];
  for (const [label, nilai] of baris) {
    const dt = document.createElement('dt');
    dt.textContent = label;
    const dd = document.createElement('dd');
    dd.textContent = nilai;
    dl.append(dt, dd);
  }

  const catatan = document.createElement('p');
  catatan.textContent = 'Data belum dikirim ke server. Validasi server akan ditambahkan pada modul backend.';

  panel.append(judul, dl, catatan);
  hasilDaftar.append(panel);
}

formAntrean.addEventListener('submit', (event) => {
  event.preventDefault();
  bersihkanError();

  const data = bacaDataAntrean(formAntrean);
  const errors = validasiAntrean(data);

  if (Object.keys(errors).length > 0) {
    tampilkanError(errors);
    return; // jangan lanjut kalau masih ada error
  }

  statusForm.textContent = 'Data valid dan siap dikirim.';
  tampilkanPreview(data);
});

// --- Inisialisasi ---
terapkanTema(bacaTema());
perbaruiDaftar();

// ==========================================
// TUGAS 07 OBE: REST API / MINI DASHBOARD
// ==========================================
const dashLoading = document.querySelector('#dash-loading');
const dashError = document.querySelector('#dash-error');
const dashErrorPesan = document.querySelector('#dash-error-pesan');
const dashRetry = document.querySelector('#dash-retry');
const dashEmpty = document.querySelector('#dash-empty');
const dashKonten = document.querySelector('#dash-konten');
const dashStatistik = document.querySelector('#dash-statistik');
const dashCari = document.querySelector('#dash-cari');
const dashKategori = document.querySelector('#dash-kategori');
const dashStatus = document.querySelector('#dash-status');
const dashMuatUlang = document.querySelector('#dash-muat-ulang');
const dashInfo = document.querySelector('#dash-info');
const dashTabelWrap = document.querySelector('#dash-tabel-wrap');
const dashTbody = document.querySelector('#dash-tbody');
const dashTidakAda = document.querySelector('#dash-tidak-ada');
const dashDiperbarui = document.querySelector('#dash-diperbarui');

// Data asli disimpan sekali; filter bekerja di data ini tanpa request ulang
const dashState = { data: [], keyword: '', status: 'semua', kategori: 'semua' };

// Hanya satu state yang tampil dalam satu waktu
function aturTampilan(keadaan) {
  dashLoading.hidden = keadaan !== 'loading';
  dashError.hidden = keadaan !== 'error';
  dashEmpty.hidden = keadaan !== 'empty';
  dashKonten.hidden = keadaan !== 'success';
}

// --- Render aman (createElement + textContent, tanpa innerHTML) ---
function buatKartuStat(label, nilai) {
  const kartu = document.createElement('div');
  kartu.className = 'stat-card';

  const angka = document.createElement('strong');
  angka.textContent = String(nilai);

  const teks = document.createElement('span');
  teks.textContent = label;

  kartu.append(angka, teks);
  return kartu;
}

function renderStatistik(data) {
  const s = hitungStatistikObat(data);
  dashStatistik.replaceChildren(
    buatKartuStat('Jenis obat', s.total),
    buatKartuStat('Obat tersedia', s.tersedia),
    buatKartuStat('Stok habis', s.habis),
    buatKartuStat('Total nilai stok', formatRupiah(s.nilaiStok))
  );
}

function isiOpsiKategori(data) {
  const kategoriUnik = [...new Set(data.map((o) => o.kategori))].sort();
  dashKategori.replaceChildren(
    new Option('Semua kategori', 'semua'),
    ...kategoriUnik.map((k) => new Option(k, k))
  );
}

function buatSel(teks) {
  const td = document.createElement('td');
  td.textContent = teks;
  return td;
}

function renderTabel(items) {
  dashTbody.replaceChildren();

  for (const obat of items) {
    const baris = document.createElement('tr');

    const tdStatus = document.createElement('td');
    const badge = document.createElement('span');
    badge.className = `badge-stok ${obat.ketersediaan ? 'ada' : 'habis'}`;
    badge.textContent = obat.ketersediaan ? 'Tersedia' : 'Stok Habis';
    tdStatus.append(badge);

    baris.append(
      buatSel(obat.nama),
      buatSel(obat.kategori),
      buatSel(formatRupiah(obat.harga)),
      buatSel(`${obat.stok} ${obat.satuan ?? 'unit'}`),
      tdStatus
    );
    dashTbody.append(baris);
  }
}

function renderDashboard() {
  const hasil = filterDashboard(dashState.data, dashState);
  renderTabel(hasil);
  dashTabelWrap.hidden = hasil.length === 0;
  dashTidakAda.hidden = hasil.length > 0;
  dashInfo.textContent = `Menampilkan ${hasil.length} dari ${dashState.data.length} obat`;
}

// --- Fungsi utama: fetch + async/await + try/catch ---
async function muatDashboard() {
  aturTampilan('loading');

  try {
    const data = await ambilDataObat();
    dashState.data = data;

    if (data.length === 0) {
      aturTampilan('empty');
      return;
    }

    // reset filter setiap data baru dimuat
    dashState.keyword = '';
    dashState.status = 'semua';
    dashState.kategori = 'semua';
    dashCari.value = '';
    dashStatus.value = 'semua';

    isiOpsiKategori(data);
    renderStatistik(data);
    renderDashboard();
    dashDiperbarui.textContent =
      `Terakhir dimuat: ${new Date().toLocaleTimeString('id-ID')} • Sumber: ${ENDPOINT_OBAT}`;

    aturTampilan('success');
  } catch (error) {
    console.error('Gagal memuat dashboard:', error); // detail teknis hanya di Console
    dashErrorPesan.textContent = pesanErrorRamah(error); // pengguna melihat pesan ramah
    aturTampilan('error');
  }
}

// --- Event ---
dashCari.addEventListener('input', () => {
  dashState.keyword = dashCari.value;
  renderDashboard();
});

dashKategori.addEventListener('change', () => {
  dashState.kategori = dashKategori.value;
  renderDashboard();
});

dashStatus.addEventListener('change', () => {
  dashState.status = dashStatus.value;
  renderDashboard();
});

dashRetry.addEventListener('click', muatDashboard);
dashMuatUlang.addEventListener('click', muatDashboard);

// --- Inisialisasi ---
muatDashboard();
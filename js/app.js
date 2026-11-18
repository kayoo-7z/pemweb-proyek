// js/app.js | Apotek Bina Farma (tampilan pengguna)
import { ambilDataObat, pesanErrorRamah } from './api.js';
import { bacaDataAntrean, validasiAntrean, tanggalLokal } from './utils.js';

/* ==================== HELPER UMUM ==================== */
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const SVG_NS = 'http://www.w3.org/2000/svg';
const NOMOR_WA = '6285245748617';
const CART_KEY = 'binafarma_cart'; // hanya id produk dan jumlah (data non-sensitif)

const rupiah = (angka) => `Rp${Number(angka).toLocaleString('id-ID')}`;
const kapital = (teks) => (teks ? teks.charAt(0).toUpperCase() + teks.slice(1) : '');

/** Buat elemen dengan teks aman (textContent, bukan innerHTML). */
function el(tag, className = '', text = '') {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== '') node.textContent = text;
  return node;
}

/** Ikon dari kumpulan <symbol> di index.html. */
function icon(name) {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', 'icon');
  svg.setAttribute('aria-hidden', 'true');
  const use = document.createElementNS(SVG_NS, 'use');
  use.setAttribute('href', `#i-${name}`);
  svg.append(use);
  return svg;
}

function scrollKe(selector) {
  const kurangiGerak = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  $(selector)?.scrollIntoView({ behavior: kurangiGerak ? 'auto' : 'smooth', block: 'start' });
}

/* ---------- Dialog ---------- */
function bukaDialog(dialog) {
  if (typeof dialog.showModal === 'function') dialog.showModal();
  else dialog.setAttribute('open', '');
}

document.addEventListener('click', (event) => {
  const tombolTutup = event.target.closest('[data-close-dialog]');
  if (tombolTutup) tombolTutup.closest('dialog')?.close();
});
// klik di area gelap (di luar kotak) menutup dialog
$$('dialog').forEach((dialog) => {
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
});

/* ---------- Toast ---------- */
const toast = $('#toast');
let toastTimer;
function tampilkanToast(pesan) {
  toast.textContent = pesan;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.hidden = true; }, 2600);
}

/* ==================== STATE ==================== */
const state = { data: [], kategori: 'semua', keyword: '' };

const temukanObat = (id) => state.data.find((obat) => obat.id === Number(id));
const bisaDibeli = (obat) => obat.stok > 0 && obat.kategori !== 'Resep Dokter';

/* ==================== KERANJANG ==================== */
function muatKeranjang() {
  try {
    const mentah = JSON.parse(localStorage.getItem(CART_KEY) ?? '[]');
    return new Map(mentah.filter(([id, jumlah]) => Number.isInteger(id) && Number.isInteger(jumlah) && jumlah > 0));
  } catch {
    return new Map();
  }
}
const keranjang = muatKeranjang();

function simpanKeranjang() {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify([...keranjang]));
  } catch (error) {
    console.warn('Keranjang tidak dapat disimpan:', error.message);
  }
}

function totalItem() {
  return [...keranjang.values()].reduce((a, b) => a + b, 0);
}

function perbaruiBadgeKeranjang() {
  const total = totalItem();
  const badge = $('#cart-count');
  badge.textContent = String(total);
  badge.hidden = total === 0;
  $('#cart-button').setAttribute('aria-label', `Keranjang, ${total} item`);
}

/** Buang item yang produknya sudah tidak ada/habis, dan sesuaikan jumlah dengan stok. */
function rapikanKeranjang() {
  for (const [id, jumlah] of keranjang) {
    const obat = temukanObat(id);
    if (!obat || !bisaDibeli(obat)) keranjang.delete(id);
    else if (jumlah > obat.stok) keranjang.set(id, obat.stok);
  }
  simpanKeranjang();
  perbaruiBadgeKeranjang();
}

function tambahKeKeranjang(obat) {
  if (!obat || !bisaDibeli(obat)) return;
  const sekarang = keranjang.get(obat.id) ?? 0;
  if (sekarang >= obat.stok) {
    tampilkanToast(`Stok ${obat.nama} terbatas (${obat.stok})`);
    return;
  }
  keranjang.set(obat.id, sekarang + 1);
  simpanKeranjang();
  perbaruiBadgeKeranjang();
  tampilkanToast(`${obat.nama} ditambahkan ke keranjang`);
}

function renderKeranjang() {
  const daftar = $('#keranjang-list');
  daftar.replaceChildren();

  let total = 0;
  const barisPesan = [];

  for (const [id, jumlah] of keranjang) {
    const obat = temukanObat(id);
    if (!obat) continue;

    const subtotal = obat.harga * jumlah;
    total += subtotal;
    barisPesan.push(`- ${jumlah}x ${obat.nama} (${rupiah(subtotal)})`);

    const item = el('li', 'cart-item');
    const info = el('div');
    info.append(el('p', 'cart-name', obat.nama), el('p', 'muted', `${rupiah(obat.harga)} x ${jumlah} = ${rupiah(subtotal)}`));

    const atur = el('div', 'qty');
    const kurang = el('button', '', '−');
    kurang.type = 'button';
    kurang.dataset.cart = 'minus';
    kurang.dataset.id = String(id);
    kurang.setAttribute('aria-label', `Kurangi ${obat.nama}`);

    const angka = el('span', '', String(jumlah));

    const tambah = el('button', '', '+');
    tambah.type = 'button';
    tambah.dataset.cart = 'plus';
    tambah.dataset.id = String(id);
    tambah.setAttribute('aria-label', `Tambah ${obat.nama}`);

    const hapus = el('button', 'link-btn', 'Hapus');
    hapus.type = 'button';
    hapus.dataset.cart = 'hapus';
    hapus.dataset.id = String(id);
    hapus.setAttribute('aria-label', `Hapus ${obat.nama} dari keranjang`);

    atur.append(kurang, angka, tambah, hapus);
    item.append(info, atur);
    daftar.append(item);
  }

  const kosong = barisPesan.length === 0;
  $('#keranjang-kosong').hidden = !kosong;
  $('#keranjang-total').hidden = kosong;
  $('#keranjang-total-nilai').textContent = rupiah(total);
  $('#keranjang-kosongkan').hidden = kosong;

  const wa = $('#keranjang-wa');
  wa.hidden = kosong;
  if (!kosong) {
    const pesan = ['Halo Apotek Bina Farma, saya ingin memesan:', ...barisPesan, `Total: ${rupiah(total)}`].join('\n');
    wa.href = `https://wa.me/${NOMOR_WA}?text=${encodeURIComponent(pesan)}`;
  }
}

$('#cart-button').addEventListener('click', () => {
  renderKeranjang();
  bukaDialog($('#dialog-keranjang'));
});

$('#keranjang-list').addEventListener('click', (event) => {
  const tombol = event.target.closest('button[data-cart]');
  if (!tombol) return;

  const id = Number(tombol.dataset.id);
  const obat = temukanObat(id);
  const jumlah = keranjang.get(id) ?? 0;

  if (tombol.dataset.cart === 'plus') {
    if (obat && jumlah < obat.stok) keranjang.set(id, jumlah + 1);
    else tampilkanToast('Stok terbatas');
  } else if (tombol.dataset.cart === 'minus') {
    if (jumlah <= 1) keranjang.delete(id);
    else keranjang.set(id, jumlah - 1);
  } else if (tombol.dataset.cart === 'hapus') {
    keranjang.delete(id);
  }

  simpanKeranjang();
  perbaruiBadgeKeranjang();
  renderKeranjang();
});

$('#keranjang-kosongkan').addEventListener('click', () => {
  keranjang.clear();
  simpanKeranjang();
  perbaruiBadgeKeranjang();
  renderKeranjang();
});

/* ==================== KATALOG PRODUK ==================== */
const gridKatalog = $('#katalog-grid');

function buatKartu(obat) {
  const habis = obat.stok <= 0;
  const resep = obat.kategori === 'Resep Dokter';

  const kartu = el('article', 'product-card');
  kartu.append(
    el('span', `status-badge ${habis ? 'is-habis' : 'is-ada'}`, habis ? 'Habis' : 'Tersedia'),
    el('p', `product-kategori${resep ? ' is-resep' : ''}`, resep ? 'Wajib resep dokter' : obat.kategori),
    el('h3', 'product-name', obat.nama)
  );

  const meta = [kapital(obat.satuan), obat.kemasan].filter(Boolean).join(' · ');
  if (meta) kartu.append(el('p', 'product-meta', meta));

  kartu.append(el('p', 'product-price', rupiah(obat.harga)));

  const beli = bisaDibeli(obat);
  const tombol = el('button', 'btn btn-block');
  tombol.type = 'button';
  tombol.dataset.aksi = beli ? 'beli' : 'detail';
  tombol.dataset.id = String(obat.id);
  tombol.setAttribute('aria-label', `${beli ? 'Beli' : 'Lihat detail'} ${obat.nama}`);
  tombol.append(el('span', '', beli ? 'Beli' : 'Detail'), icon(beli ? 'plus' : 'arrow'));
  kartu.append(tombol);

  return kartu;
}

function renderKatalog() {
  const kunci = state.keyword.trim().toLowerCase();
  const hasil = state.data.filter(
    (obat) =>
      (state.kategori === 'semua' || obat.kategori === state.kategori) &&
      (!kunci || obat.nama.toLowerCase().includes(kunci))
  );

  gridKatalog.replaceChildren(...hasil.map(buatKartu));
  $('#katalog-tidak-ada').hidden = hasil.length > 0;
  $('#katalog-info').textContent = `Menampilkan ${hasil.length} dari ${state.data.length} produk`;
}

function aturStateKatalog(keadaan) {
  $('#katalog-loading').hidden = keadaan !== 'loading';
  $('#katalog-error').hidden = keadaan !== 'error';
  $('#katalog-kosong').hidden = keadaan !== 'kosong';
  $('#katalog-konten').hidden = keadaan !== 'ok';
}

async function muatKatalog() {
  aturStateKatalog('loading');

  try {
    state.data = await ambilDataObat();

    if (state.data.length === 0) {
      aturStateKatalog('kosong');
      return;
    }

    rapikanKeranjang();
    renderKatalog();
    aturStateKatalog('ok');
  } catch (error) {
    console.error('Gagal memuat katalog:', error); // detail teknis hanya di Console
    $('#katalog-error-pesan').textContent = pesanErrorRamah(error);
    aturStateKatalog('error');
  }
}

$('#katalog-retry').addEventListener('click', muatKatalog);

// Filter kategori
$$('.pill').forEach((tombol) => {
  tombol.addEventListener('click', () => {
    state.kategori = tombol.dataset.kategori;
    $$('.pill').forEach((pill) => {
      const aktif = pill === tombol;
      pill.classList.toggle('is-active', aktif);
      pill.setAttribute('aria-pressed', String(aktif));
    });
    renderKatalog();
  });
});

// Pencarian (kolom di hero dan chip "Sering dicari")
const inputCari = $('#cari-produk');

inputCari.addEventListener('input', () => {
  state.keyword = inputCari.value;
  renderKatalog();
});

$('#search-form').addEventListener('submit', (event) => {
  event.preventDefault();
  state.keyword = inputCari.value;
  renderKatalog();
  scrollKe('#katalog');
});

$$('[data-cari]').forEach((chip) => {
  chip.addEventListener('click', () => {
    inputCari.value = chip.dataset.cari;
    state.keyword = chip.dataset.cari;
    renderKatalog();
    scrollKe('#katalog');
  });
});

// Event delegation: tombol Beli / Detail pada semua kartu
gridKatalog.addEventListener('click', (event) => {
  const tombol = event.target.closest('button[data-aksi]');
  if (!tombol) return;

  const obat = temukanObat(tombol.dataset.id);
  if (!obat) return;

  if (tombol.dataset.aksi === 'beli') tambahKeKeranjang(obat);
  else tampilkanDetail(obat);
});

/* ---------- Detail produk ---------- */
function tampilkanDetail(obat) {
  const resep = obat.kategori === 'Resep Dokter';

  $('#detail-kategori').textContent = resep ? 'Wajib resep dokter' : obat.kategori;
  $('#detail-judul').textContent = obat.nama;

  const baris = [
    ['Harga', rupiah(obat.harga)],
    ['Kemasan', [kapital(obat.satuan), obat.kemasan].filter(Boolean).join(' · ') || '-'],
    ['Ketersediaan', obat.stok > 0 ? 'Tersedia' : 'Stok habis']
  ];
  const daftar = $('#detail-list');
  daftar.replaceChildren();
  for (const [label, nilai] of baris) {
    daftar.append(el('dt', '', label), el('dd', '', nilai));
  }

  const catatan = $('#detail-catatan');
  catatan.hidden = !resep;
  catatan.textContent = 'Obat ini hanya dapat dibeli dengan resep dokter yang valid. Silakan datang ke apotek atau hubungi kami lewat WhatsApp.';

  const tombolBeli = $('#detail-beli');
  tombolBeli.hidden = !bisaDibeli(obat);
  tombolBeli.dataset.id = String(obat.id);

  bukaDialog($('#dialog-detail'));
}

$('#detail-beli').addEventListener('click', (event) => {
  tambahKeKeranjang(temukanObat(event.currentTarget.dataset.id));
  $('#dialog-detail').close();
});

/* ==================== FORM ANTREAN (validasi dari Tugas 6) ==================== */
const formAntrean = $('#form-antrean');
const ringkasanError = $('#ringkasan-error');
const jumlahError = $('#jumlah-error');
const daftarError = $('#daftar-error');
const statusForm = $('#form-status');
const hasilDaftar = $('#hasil-pendaftaran');

// batas tanggal pada date picker (HTML constraint, diisi dinamis)
formAntrean.elements.tanggal.min = tanggalLokal();
formAntrean.elements.tanggal.max = tanggalLokal(30);

function bersihkanError() {
  $$('.error', formAntrean).forEach((node) => { node.textContent = ''; });
  $$('[aria-invalid]', formAntrean).forEach((node) => node.removeAttribute('aria-invalid'));
  daftarError.replaceChildren();
  ringkasanError.hidden = true;
  statusForm.textContent = '';
  hasilDaftar.replaceChildren();
}

function tampilkanError(errors) {
  const daftar = Object.entries(errors);

  for (const [field, pesan] of daftar) {
    $(`#error-${field}`).textContent = pesan;
    formAntrean.elements[field].setAttribute('aria-invalid', 'true');
    daftarError.append(el('li', '', pesan));
  }

  jumlahError.textContent = String(daftar.length);
  ringkasanError.hidden = false;
  statusForm.textContent = 'Periksa kembali data yang belum valid.';
  formAntrean.elements[daftar[0][0]].focus(); // fokus ke error pertama
}

function tampilkanPreview(data) {
  const kotak = el('div', 'preview-box');
  kotak.append(el('h3', '', 'Data valid, preview pendaftaran'));

  const dl = document.createElement('dl');
  const baris = [
    ['Nama', data.nama],
    ['WhatsApp', data.wa],
    ['Layanan', data.layanan],
    ['Tanggal kunjungan', data.tanggal],
    ['Keluhan', data.keluhan || '-']
  ];
  for (const [label, nilai] of baris) {
    dl.append(el('dt', '', label), el('dd', '', nilai));
  }
  kotak.append(dl, el('p', 'muted', 'Data belum dikirim ke server. Penyimpanan antrean akan dihubungkan pada tahap berikutnya.'));
  hasilDaftar.append(kotak);
}

$('#buka-antrean').addEventListener('click', () => {
  formAntrean.reset();
  bersihkanError();
  bukaDialog($('#dialog-antrean'));
  formAntrean.elements.nama.focus();
});

formAntrean.addEventListener('submit', (event) => {
  event.preventDefault();
  bersihkanError();

  const data = bacaDataAntrean(formAntrean);
  const errors = validasiAntrean(data);

  if (Object.keys(errors).length > 0) {
    tampilkanError(errors);
    return;
  }

  statusForm.textContent = 'Data valid dan siap dikirim.';
  tampilkanPreview(data);
});

// error hilang otomatis saat field sudah diperbaiki
formAntrean.addEventListener('input', (event) => {
  const field = event.target;
  if (field.getAttribute('aria-invalid') !== 'true') return;

  const errors = validasiAntrean(bacaDataAntrean(formAntrean));
  if (!errors[field.name]) {
    field.removeAttribute('aria-invalid');
    $(`#error-${field.name}`).textContent = '';
  }
});

/* ==================== NAVIGASI ==================== */
const linkNav = $$('.site-nav a');
linkNav.forEach((link) => {
  link.addEventListener('click', () => {
    linkNav.forEach((item) => item.classList.toggle('is-active', item === link));
  });
});

/* ==================== MULAI ==================== */
perbaruiBadgeKeranjang();
muatKatalog();
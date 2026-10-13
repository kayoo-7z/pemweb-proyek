// js/api.js
// Modul akses API: fetch + async/await + pemeriksaan response.ok

export const ENDPOINT_OBAT = './data/obat.json';

// Jeda buatan agar loading state terlihat saat demo (ubah ke 0 bila tidak perlu)
const DELAY_SIMULASI_MS = 800;
const jeda = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export class ApiError extends Error {
  constructor(message, status = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const adalahObatValid = (item) =>
  item !== null &&
  typeof item === 'object' &&
  typeof item.nama === 'string' &&
  typeof item.kategori === 'string' &&
  Number.isFinite(item.harga) &&
  Number.isFinite(item.stok);

/**
 * GET data obat. Alur: terima response -> cek ok -> baca JSON -> validasi bentuk data.
 */
export async function ambilDataObat(endpoint = ENDPOINT_OBAT) {
  await jeda(DELAY_SIMULASI_MS);

  const response = await fetch(endpoint, {
    headers: { Accept: 'application/json' },
    cache: 'no-cache'
  });

  // fetch tidak reject untuk 404/500, jadi status harus dicek manual
  if (!response.ok) {
    throw new ApiError(`HTTP ${response.status}`, response.status);
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    throw new ApiError('Format JSON tidak sesuai: data harus berupa array');
  }

  return data.filter(adalahObatValid);
}

/**
 * Pesan error ramah untuk pengguna (tanpa detail teknis / stack trace)
 */
export function pesanErrorRamah(error) {
  if (error instanceof ApiError) {
    if (error.status === 404) {
      return 'Data stok tidak ditemukan di server. Periksa alamat endpoint, lalu coba lagi.';
    }
    if (error.status >= 500) {
      return 'Server sedang bermasalah. Silakan coba lagi beberapa saat lagi.';
    }
    return 'Data stok gagal dimuat. Silakan coba lagi.';
  }
  if (error instanceof SyntaxError) {
    return 'Format data dari server tidak dapat dibaca. Silakan coba lagi.';
  }
  return 'Tidak dapat terhubung ke server. Periksa koneksi Anda, lalu coba lagi.';
}
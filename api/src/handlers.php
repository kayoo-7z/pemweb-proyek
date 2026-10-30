<?php

declare(strict_types=1);

use App\Database;
use App\Repositories\AntreanRepository;
use App\Repositories\KategoriRepository;
use App\Repositories\ObatRepository;

/* ==================== VALIDASI ==================== */

function isBlank(mixed $value): bool
{
    return $value === null || (is_string($value) && trim($value) === '');
}

/** Ubah ke integer; false bila bukan bilangan bulat (boolean/array/null ditolak). */
function parseInteger(mixed $value): int|false
{
    if ($value === null || is_bool($value) || is_array($value)) {
        return false;
    }

    return filter_var($value, FILTER_VALIDATE_INT);
}

/** Validasi input obat. $kategoriValid berasal dari tabel kategori. */
function validateObatInput(array $input, array $kategoriValid): array
{
    $errors = [];

    // 1. Nama: wajib, teks, 3-100 karakter
    $nama = $input['nama'] ?? null;
    if (isBlank($nama)) {
        $errors['nama'] = 'Nama obat wajib diisi.';
    } elseif (!is_string($nama)) {
        $errors['nama'] = 'Nama obat harus berupa teks.';
    } else {
        $nama = trim((string) preg_replace('/\s+/u', ' ', $nama));
        if (mb_strlen($nama) < 3) {
            $errors['nama'] = 'Nama obat minimal 3 karakter.';
        } elseif (mb_strlen($nama) > 100) {
            $errors['nama'] = 'Nama obat maksimal 100 karakter.';
        }
    }

    // 2. Kategori: wajib, harus ada di tabel kategori
    $kategori = $input['kategori'] ?? null;
    if (isBlank($kategori)) {
        $errors['kategori'] = 'Kategori wajib diisi.';
    } elseif (!is_string($kategori) || !in_array(trim($kategori), $kategoriValid, true)) {
        $errors['kategori'] = 'Kategori tidak tersedia. Pilih salah satu: ' . implode(', ', $kategoriValid) . '.';
    } else {
        $kategori = trim($kategori);
    }

    // 3. Harga: wajib, bilangan bulat >= 0
    $hargaRaw = $input['harga'] ?? null;
    $harga = parseInteger($hargaRaw);
    if (isBlank($hargaRaw)) {
        $errors['harga'] = 'Harga wajib diisi.';
    } elseif ($harga === false || $harga < 0) {
        $errors['harga'] = 'Harga harus bilangan bulat 0 atau lebih.';
    }

    // 4. Stok: wajib, bilangan bulat >= 0
    $stokRaw = $input['stok'] ?? null;
    $stok = parseInteger($stokRaw);
    if (isBlank($stokRaw)) {
        $errors['stok'] = 'Stok wajib diisi.';
    } elseif ($stok === false || $stok < 0) {
        $errors['stok'] = 'Stok harus bilangan bulat 0 atau lebih.';
    }

    // 5. Satuan: opsional (default "unit"), maksimal 20 karakter
    $satuan = $input['satuan'] ?? null;
    if (isBlank($satuan)) {
        $satuan = 'unit';
    } elseif (!is_string($satuan) || mb_strlen(trim($satuan)) > 20) {
        $errors['satuan'] = 'Satuan harus berupa teks maksimal 20 karakter.';
    } else {
        $satuan = trim($satuan);
    }

    if ($errors !== []) {
        return [$errors, []];
    }

    return [[], [
        'nama'         => $nama,
        'kategori'     => $kategori,
        'harga'        => $harga,
        'stok'         => $stok,
        'satuan'       => $satuan,
        'ketersediaan' => $stok > 0,
    ]];
}

/* ==================== HANDLER ENDPOINT ==================== */

/** GET /health */
function handleHealth(): never
{
    $data = [
        'app'         => env('APP_NAME', 'Apotek Bina Farma API'),
        'environment' => env('APP_ENV', 'local'),
        'time'        => date(DATE_ATOM),
    ];

    if (isDebug()) {
        $data['php_version'] = PHP_VERSION; // hanya saat debug lokal
    }

    jsonSuccess(200, 'API is running', ['data' => $data]);
}

/** GET /kategori */
function handleKategoriIndex(): never
{
    $data = (new KategoriRepository(Database::connect()))->all();

    jsonSuccess(200, 'Daftar kategori berhasil diambil.', ['count' => count($data), 'data' => $data]);
}

/** GET /obat?kategori=&status=&q= */
function handleObatIndex(): never
{
    $repo  = new ObatRepository(Database::connect());
    $hasil = $repo->search(queryString('kategori'), queryString('status'), queryString('q'));

    // Data kosong bukan error: request valid tetap 200
    jsonSuccess(200, 'Daftar obat berhasil diambil.', ['count' => count($hasil), 'data' => $hasil]);
}

/** GET /obat/{id} */
function handleObatShow(string $id): never
{
    $obat = (new ObatRepository(Database::connect()))->findById((int) $id);

    if ($obat === null) {
        jsonError(404, "Obat dengan id {$id} tidak ditemukan.");
    }

    jsonSuccess(200, 'Detail obat berhasil diambil.', ['data' => $obat]);
}

/** POST /obat (body JSON). Hanya validasi; penyimpanan ke database dikerjakan di Modul 11. */
function handleObatStore(): never
{
    $input = readJsonBody();                                             // 400 bila format rusak
    $kategoriValid = (new KategoriRepository(Database::connect()))->names();

    [$errors, $obat] = validateObatInput($input, $kategoriValid);

    if ($errors !== []) {
        jsonError(422, 'Data tidak memenuhi aturan validasi.', $errors);
    }

    jsonSuccess(201, 'Data obat valid dan diterima (penyimpanan ke database dikerjakan pada Modul 11).', ['data' => $obat]);
}

/** GET /antrean/ringkasan?tanggal=YYYY-MM-DD (default: hari ini) */
function handleAntreanRingkasan(): never
{
    $tanggal = queryString('tanggal') ?? date('Y-m-d');
    $parsed  = DateTimeImmutable::createFromFormat('!Y-m-d', $tanggal);

    if ($parsed === false || $parsed->format('Y-m-d') !== $tanggal) {
        jsonError(400, 'Parameter tanggal tidak valid. Gunakan format YYYY-MM-DD.');
    }

    $data = (new AntreanRepository(Database::connect()))->ringkasan($tanggal);

    jsonSuccess(200, 'Ringkasan antrean berhasil diambil.', ['tanggal' => $tanggal, 'data' => $data]);
}
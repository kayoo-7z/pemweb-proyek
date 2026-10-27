<?php

declare(strict_types=1);

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

/** Validasi input obat. Mengembalikan [errors, dataBersih]. */
function validateObatInput(array $input): array
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

    // 2. Kategori: wajib, harus salah satu dari daftar
    $kategori = $input['kategori'] ?? null;
    if (isBlank($kategori)) {
        $errors['kategori'] = 'Kategori wajib diisi.';
    } elseif (!is_string($kategori) || !in_array(trim($kategori), KATEGORI_VALID, true)) {
        $errors['kategori'] = 'Kategori tidak tersedia. Pilih salah satu: ' . implode(', ', KATEGORI_VALID) . '.';
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

/** GET /obat?kategori=&status=&q= */
function handleObatIndex(): never
{
    $kategori = queryString('kategori');
    $status   = queryString('status');
    $q        = queryString('q');

    $hasil = array_filter(getObatData(), function (array $obat) use ($kategori, $status, $q): bool {
        if ($kategori !== null && strcasecmp($obat['kategori'], $kategori) !== 0) {
            return false;
        }
        if ($status !== null && strcasecmp($obat['ketersediaan'] ? 'tersedia' : 'habis', $status) !== 0) {
            return false;
        }
        if ($q !== null && stripos($obat['nama'], $q) === false) {
            return false;
        }

        return true;
    });

    $hasil = array_values($hasil);

    // Data kosong bukan error: request valid tetap 200
    jsonSuccess(200, 'Daftar obat berhasil diambil.', ['count' => count($hasil), 'data' => $hasil]);
}

/** GET /obat/{id} */
function handleObatShow(string $id): never
{
    foreach (getObatData() as $obat) {
        if ($obat['id'] === (int) $id) {
            jsonSuccess(200, 'Detail obat berhasil diambil.', ['data' => $obat]);
        }
    }

    jsonError(404, "Obat dengan id {$id} tidak ditemukan.");
}

/** POST /obat (body JSON). Belum disimpan: database dipakai di Modul 10. */
function handleObatStore(): never
{
    $input = readJsonBody();                       // 400 bila format rusak
    [$errors, $obat] = validateObatInput($input);

    if ($errors !== []) {
        jsonError(422, 'Data tidak memenuhi aturan validasi.', $errors);
    }

    $obat = ['id' => nextObatId()] + $obat;

    jsonSuccess(201, 'Data obat diterima (belum disimpan ke database).', ['data' => $obat]);
}
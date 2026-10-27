<?php

declare(strict_types=1);

const KATEGORI_VALID = ['Obat Bebas', 'Resep Dokter', 'Skincare', 'Susu & Makanan', 'Alat Kesehatan'];

/** Data sementara (tanpa database). Akan diganti data MySQL pada Modul 10. */
function getObatData(): array
{
    return [
        ['id' => 1, 'nama' => 'Paracetamol 500mg',        'kategori' => 'Obat Bebas',     'harga' => 5000,  'stok' => 50, 'satuan' => 'strip', 'ketersediaan' => true],
        ['id' => 2, 'nama' => 'Amoxicillin 500mg',        'kategori' => 'Resep Dokter',   'harga' => 12000, 'stok' => 20, 'satuan' => 'strip', 'ketersediaan' => true],
        ['id' => 3, 'nama' => 'Herborist Juice for Skin', 'kategori' => 'Skincare',       'harga' => 25000, 'stok' => 15, 'satuan' => 'botol', 'ketersediaan' => true],
        ['id' => 4, 'nama' => 'Vitamin C 1000mg',         'kategori' => 'Obat Bebas',     'harga' => 15000, 'stok' => 0,  'satuan' => 'botol', 'ketersediaan' => false],
        ['id' => 5, 'nama' => 'Milna Rice Crackers',      'kategori' => 'Susu & Makanan', 'harga' => 18000, 'stok' => 30, 'satuan' => 'pack',  'ketersediaan' => true],
        ['id' => 6, 'nama' => 'Antasida DOEN',            'kategori' => 'Obat Bebas',     'harga' => 4000,  'stok' => 40, 'satuan' => 'strip', 'ketersediaan' => true],
        ['id' => 7, 'nama' => 'Omeprazole 20mg',          'kategori' => 'Resep Dokter',   'harga' => 15000, 'stok' => 0,  'satuan' => 'strip', 'ketersediaan' => false],
        ['id' => 8, 'nama' => 'Plester Luka',             'kategori' => 'Alat Kesehatan', 'harga' => 8000,  'stok' => 25, 'satuan' => 'box',   'ketersediaan' => true],
    ];
}

function nextObatId(): int
{
    return max(array_column(getObatData(), 'id')) + 1;
}
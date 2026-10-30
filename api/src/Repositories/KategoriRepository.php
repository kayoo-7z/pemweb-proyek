<?php

declare(strict_types=1);

namespace App\Repositories;

use PDO;

final class KategoriRepository
{
    public function __construct(private PDO $pdo)
    {
    }

    /** Semua kategori beserta jumlah obat di dalamnya. */
    public function all(): array
    {
        $sql = 'SELECT k.id, k.nama, COUNT(o.id) AS jumlah_obat
                FROM kategori k
                LEFT JOIN obat o ON o.kategori_id = k.id
                GROUP BY k.id, k.nama
                ORDER BY k.nama';

        return array_map(
            fn (array $row): array => [
                'id'          => (int) $row['id'],
                'nama'        => $row['nama'],
                'jumlah_obat' => (int) $row['jumlah_obat'],
            ],
            $this->pdo->query($sql)->fetchAll()
        );
    }

    /** Daftar nama kategori (dipakai untuk validasi POST /obat). */
    public function names(): array
    {
        return $this->pdo->query('SELECT nama FROM kategori ORDER BY nama')
            ->fetchAll(PDO::FETCH_COLUMN);
    }
}
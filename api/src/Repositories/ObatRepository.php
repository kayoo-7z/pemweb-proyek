<?php

declare(strict_types=1);

namespace App\Repositories;

use PDO;

final class ObatRepository
{
    private const SELECT = 'SELECT o.id, o.nama, k.nama AS kategori, o.harga, o.stok, o.satuan,
                                   (o.stok > 0) AS ketersediaan
                            FROM obat o
                            JOIN kategori k ON k.id = o.kategori_id';

    public function __construct(private PDO $pdo)
    {
    }

    /**
     * Cari obat. Semua nilai dari pengguna dikirim lewat parameter (:nama),
     * bagian SQL yang digabung hanya potongan tetap yang ditulis di sini.
     */
    public function search(?string $kategori, ?string $status, ?string $q): array
    {
        $where  = [];
        $params = [];

        if ($kategori !== null) {
            $where[] = 'k.nama = :kategori';
            $params['kategori'] = $kategori;
        }

        if ($status !== null) {
            $status = strtolower($status);

            if ($status === 'tersedia') {
                $where[] = 'o.stok > 0';
            } elseif ($status === 'habis') {
                $where[] = 'o.stok = 0';
            } else {
                return []; // status tidak dikenal -> hasil kosong, request tetap valid
            }
        }

        if ($q !== null) {
            $where[] = 'o.nama LIKE :q';
            $params['q'] = '%' . addcslashes($q, '%_\\') . '%'; // % dan _ dari pengguna dianggap teks biasa
        }

        $sql = self::SELECT
            . ($where !== [] ? ' WHERE ' . implode(' AND ', $where) : '')
            . ' ORDER BY o.id';

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);

        return array_map(fn (array $row): array => $this->toApi($row), $stmt->fetchAll());
    }

    public function findById(int $id): ?array
    {
        $stmt = $this->pdo->prepare(self::SELECT . ' WHERE o.id = :id');
        $stmt->execute(['id' => $id]);

        $row = $stmt->fetch();

        return $row === false ? null : $this->toApi($row);
    }

    /** Samakan tipe data dengan format JSON API. */
    private function toApi(array $row): array
    {
        return [
            'id'           => (int) $row['id'],
            'nama'         => $row['nama'],
            'kategori'     => $row['kategori'],
            'harga'        => (int) $row['harga'], // rupiah tanpa sen
            'stok'         => (int) $row['stok'],
            'satuan'       => $row['satuan'],
            'ketersediaan' => (bool) $row['ketersediaan'],
        ];
    }
}
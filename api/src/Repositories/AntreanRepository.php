<?php

declare(strict_types=1);

namespace App\Repositories;

use PDO;

final class AntreanRepository
{
    public function __construct(private PDO $pdo)
    {
    }

    /** Ringkasan antrean per layanan pada satu tanggal (tanpa data pribadi pasien). */
    public function ringkasan(string $tanggal): array
    {
        $sql = "SELECT l.nama AS layanan, l.kode_antrean,
                       COALESCE(SUM(a.status = 'Menunggu'), 0) AS menunggu,
                       COALESCE(SUM(a.status = 'Dilayani'), 0) AS dilayani,
                       COALESCE(SUM(a.status = 'Selesai'), 0)  AS selesai,
                       MAX(CASE WHEN a.status = 'Dilayani' THEN a.nomor_urut END) AS nomor_berjalan
                FROM layanan l
                LEFT JOIN antrean a
                       ON a.layanan_id = l.id AND a.tanggal_kunjungan = :tanggal
                GROUP BY l.id, l.nama, l.kode_antrean
                ORDER BY l.id";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['tanggal' => $tanggal]);

        return array_map(
            fn (array $row): array => [
                'layanan'        => $row['layanan'],
                'nomor_berjalan' => $row['nomor_berjalan'] === null
                    ? null
                    : sprintf('%s-%03d', $row['kode_antrean'], (int) $row['nomor_berjalan']),
                'menunggu'       => (int) $row['menunggu'],
                'dilayani'       => (int) $row['dilayani'],
                'selesai'        => (int) $row['selesai'],
            ],
            $stmt->fetchAll()
        );
    }
}
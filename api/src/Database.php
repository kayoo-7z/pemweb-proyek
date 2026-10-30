<?php

declare(strict_types=1);

namespace App;

use PDO;
use RuntimeException;

/**
 * Satu-satunya tempat koneksi database dibuat.
 * Semua kredensial dibaca dari .env, tidak ada yang ditulis di kode.
 */
final class Database
{
    private static ?PDO $pdo = null;

    public static function connect(): PDO
    {
        if (self::$pdo instanceof PDO) {
            return self::$pdo;
        }

        $host    = self::required('DB_HOST');
        $name    = self::required('DB_NAME');
        $user    = self::required('DB_USER');
        $port    = env('DB_PORT', '3306');
        $charset = env('DB_CHARSET', 'utf8mb4');

        // DB_PASS boleh kosong (Laragon lokal) tetapi harus didefinisikan di .env
        if (!array_key_exists('DB_PASS', $_ENV)) {
            throw new RuntimeException('Konfigurasi DB_PASS belum didefinisikan pada .env');
        }
        $pass = (string) $_ENV['DB_PASS'];

        $dsn = "mysql:host={$host};port={$port};dbname={$name};charset={$charset}";

        self::$pdo = new PDO($dsn, $user, $pass, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION, // error jadi exception
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,                  // prepared statement asli
        ]);

        return self::$pdo;
    }

    private static function required(string $key): string
    {
        $value = env($key, '');

        if ($value === null || $value === '') {
            throw new RuntimeException("Konfigurasi {$key} belum diisi pada .env");
        }

        return $value;
    }
}
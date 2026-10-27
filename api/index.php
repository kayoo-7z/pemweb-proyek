<?php

declare(strict_types=1);

use Dotenv\Dotenv;

// 1. Pastikan dependency Composer sudah terpasang
$autoload = __DIR__ . '/vendor/autoload.php';
if (!is_file($autoload)) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success' => false,
        'message' => 'Dependency belum terpasang. Jalankan "composer install" di folder api.',
        'errors'  => [],
    ]);
    exit;
}
require $autoload;

// 2. Muat konfigurasi dari .env
Dotenv::createImmutable(__DIR__)->safeLoad();

// 3. Jangan tampilkan error PHP ke client agar JSON tidak rusak
ini_set('display_errors', '0');
error_reporting(E_ALL);
date_default_timezone_set(env('APP_TIMEZONE', 'Asia/Makassar'));

// 4. Error tak terduga -> 500 JSON (detail hanya muncul bila APP_DEBUG=true)
set_exception_handler(function (Throwable $e): void {
    error_log($e::class . ': ' . $e->getMessage());
    jsonError(500, 'Terjadi kesalahan pada server.', isDebug() ? ['debug' => $e->getMessage()] : []);
});

// 5. Routing
$routes = require __DIR__ . '/routes/api.php';
dispatch($routes, requestMethod(), requestPath());
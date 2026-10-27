<?php

declare(strict_types=1);

/* ==================== KONFIGURASI (.env) ==================== */

function env(string $key, ?string $default = null): ?string
{
    $value = $_ENV[$key] ?? $_SERVER[$key] ?? null;

    return is_string($value) ? $value : $default;
}

function isDebug(): bool
{
    return filter_var(env('APP_DEBUG', 'false'), FILTER_VALIDATE_BOOLEAN);
}

/* ==================== RESPONSE JSON ==================== */

function sendJson(int $status, array $body, array $headers = []): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');

    foreach ($headers as $name => $value) {
        header("{$name}: {$value}");
    }

    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    exit;
}

function jsonSuccess(int $status, string $message, array $payload = []): never
{
    sendJson($status, ['success' => true, 'message' => $message] + $payload);
}

function jsonError(int $status, string $message, array $errors = [], array $headers = []): never
{
    sendJson($status, ['success' => false, 'message' => $message, 'errors' => $errors], $headers);
}

/* ==================== MEMBACA REQUEST ==================== */

function requestMethod(): string
{
    return strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
}

/** Path relatif terhadap folder api/, misalnya "/obat/3". */
function requestPath(): string
{
    $path = rawurldecode(parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/');
    $base = rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '')), '/');

    if ($base !== '' && str_starts_with($path, $base)) {
        $path = substr($path, strlen($base));
    }

    $path = (string) preg_replace('/\.php$/', '', $path); // /health.php = /health

    return '/' . trim($path, '/');
}

function queryString(string $key): ?string
{
    $value = $_GET[$key] ?? null;

    if (!is_string($value)) {
        return null;
    }

    $value = trim($value);

    return $value === '' ? null : $value;
}

/** Baca body JSON. Rusak -> 400. Bukan object -> 400. */
function readJsonBody(): array
{
    $raw = file_get_contents('php://input');

    try {
        $payload = json_decode($raw === false ? '' : $raw, true, 512, JSON_THROW_ON_ERROR);
    } catch (JsonException) {
        jsonError(400, 'Format JSON tidak valid.');
    }

    if (!is_array($payload) || ($payload !== [] && array_is_list($payload))) {
        jsonError(400, 'Body JSON harus berupa object.');
    }

    return $payload;
}

/* ==================== MIDDLEWARE ==================== */

/**
 * Pastikan request yang membawa body memakai Content-Type JSON.
 * Dijalankan oleh dispatch() SETELAH route cocok dan SEBELUM handler dipanggil.
 */
function middlewareRequireJson(): void
{
    $contentType = strtolower($_SERVER['CONTENT_TYPE'] ?? '');

    if (!str_starts_with($contentType, 'application/json')) {
        jsonError(415, 'Content-Type harus application/json.');
    }
}

/* ==================== ROUTER ==================== */

/**
 * path + method cocok       -> middleware (bila perlu) lalu handler
 * path cocok, method beda   -> 405 + header Allow
 * tidak ada yang cocok      -> 404
 */
function dispatch(array $routes, string $method, string $path): void
{
    $allowed = [];

    foreach ($routes as [$routeMethod, $pattern, $handler]) {
        if (preg_match($pattern, $path, $matches) !== 1) {
            continue;
        }

        $allowed[] = $routeMethod;

        if ($routeMethod !== $method) {
            continue;
        }

        if (in_array($method, ['POST', 'PUT', 'PATCH'], true)) {
            middlewareRequireJson();
        }

        $handler(...array_slice($matches, 1));
        return;
    }

    if ($allowed !== []) {
        jsonError(
            405,
            "Method {$method} tidak diizinkan untuk endpoint ini.",
            [],
            ['Allow' => implode(', ', array_unique($allowed))]
        );
    }

    jsonError(404, 'Route tidak ditemukan.');
}
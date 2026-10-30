-- Skema database Apotek Bina Farma (Modul 10)
-- Menjalankan file ini akan membuat ulang semua tabel (data lama terhapus).

CREATE DATABASE IF NOT EXISTS binafarma_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE binafarma_db;

DROP TABLE IF EXISTS antrean;
DROP TABLE IF EXISTS obat;
DROP TABLE IF EXISTS layanan;
DROP TABLE IF EXISTS kategori;

CREATE TABLE kategori (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nama       VARCHAR(80) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE obat (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  kategori_id BIGINT UNSIGNED NOT NULL,
  nama        VARCHAR(120) NOT NULL,
  harga       DECIMAL(12,2) NOT NULL DEFAULT 0,
  stok        INT UNSIGNED NOT NULL DEFAULT 0,
  satuan      VARCHAR(20) NOT NULL DEFAULT 'unit',
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_obat_kategori FOREIGN KEY (kategori_id)
    REFERENCES kategori(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT chk_obat_harga CHECK (harga >= 0),
  INDEX idx_obat_nama (nama)
) ENGINE=InnoDB;

CREATE TABLE layanan (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nama         VARCHAR(80) NOT NULL UNIQUE,
  kode_antrean CHAR(1) NOT NULL UNIQUE,
  deskripsi    VARCHAR(255) NULL
) ENGINE=InnoDB;

CREATE TABLE antrean (
  id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  layanan_id        BIGINT UNSIGNED NOT NULL,
  nomor_urut        SMALLINT UNSIGNED NOT NULL,
  nama_pasien       VARCHAR(100) NOT NULL,
  no_wa             VARCHAR(20) NOT NULL,
  tanggal_kunjungan DATE NOT NULL,
  keluhan           VARCHAR(200) NULL,
  status            ENUM('Menunggu','Dilayani','Selesai','Dibatalkan') NOT NULL DEFAULT 'Menunggu',
  created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_antrean_layanan FOREIGN KEY (layanan_id)
    REFERENCES layanan(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT uq_antrean_nomor UNIQUE (layanan_id, tanggal_kunjungan, nomor_urut),
  INDEX idx_antrean_tanggal_status (tanggal_kunjungan, status)
) ENGINE=InnoDB;
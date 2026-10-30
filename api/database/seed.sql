USE binafarma_db;

INSERT INTO kategori (id, nama) VALUES
  (1, 'Obat Bebas'),
  (2, 'Resep Dokter'),
  (3, 'Skincare'),
  (4, 'Susu & Makanan'),
  (5, 'Alat Kesehatan');

INSERT INTO obat (kategori_id, nama, harga, stok, satuan) VALUES
  (1, 'Paracetamol 500mg',         5000, 50, 'strip'),
  (2, 'Amoxicillin 500mg',        12000, 20, 'strip'),
  (3, 'Herborist Juice for Skin', 25000, 15, 'botol'),
  (1, 'Vitamin C 1000mg',         15000,  0, 'botol'),
  (4, 'Milna Rice Crackers',      18000, 30, 'pack'),
  (1, 'Antasida DOEN',             4000, 40, 'strip'),
  (2, 'Omeprazole 20mg',          15000,  0, 'strip'),
  (5, 'Plester Luka',              8000, 25, 'box');

INSERT INTO layanan (id, nama, kode_antrean, deskripsi) VALUES
  (1, 'Konsultasi Dokter',  'A', 'Konsultasi dengan dokter umum'),
  (2, 'Pemeriksaan GCU',    'B', 'Cek gula darah, kolesterol, dan asam urat'),
  (3, 'Tebus Resep Dokter', 'C', 'Penebusan obat resep dokter');

INSERT INTO antrean (layanan_id, nomor_urut, nama_pasien, no_wa, tanggal_kunjungan, keluhan, status) VALUES
  (1, 13, 'Siti Aminah',  '081200000001', CURDATE(), 'Demam dan batuk', 'Selesai'),
  (1, 14, 'Budi Santoso', '081200000002', CURDATE(), 'Sakit kepala',    'Dilayani'),
  (1, 15, 'Rina Marlina', '081200000003', CURDATE(), NULL,              'Menunggu'),
  (2,  1, 'Andi Wijaya',  '081200000004', CURDATE(), 'Cek gula darah',  'Menunggu'),
  (3,  1, 'Dewi Lestari', '081200000005', CURDATE(), NULL,              'Selesai');
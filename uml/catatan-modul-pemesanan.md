# Desain Rinci & Pola Desain Modul Pemesanan

## Daftar Class/Modul Utama:
1. **PesananController**: Menerima request dari frontend (checkout, lihat status) dan meneruskannya ke Service.
2. **PemesananService**: Mengatur aturan bisnis (validasi stok, pemicu verifikasi resep, hitung total harga).
3. **Pesanan (Entity)**: Menyimpan data inti (item obat, jumlah, status, total harga).
4. **PesananRepository**: Mengambil & menyimpan data dari basis data MySQL.
5. **ResepVerificationStrategy**: Menentukan verifikasi resep (manual/otomatis).
6. **NotifikasiObserver**: Mengirim notifikasi perubahan status pesanan ke pelanggan/apoteker.
7. **PembayaranAdapter**: Menjembatani format API Payment Gateway eksternal.
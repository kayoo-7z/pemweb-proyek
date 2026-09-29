# Proyek Individu - Apotek Bina Farma

_Mata Kuliah:_ Pemrograman Web  
_Fitur:_ Halaman Utama (Struktur HTML5 & Aksesibilitas Dasar)

---

## 🗺️ Sitemap / Struktur Halaman

- _Header:_ Logo, Judul Apotek, Navigasi Utama.
- _Main Content:_
  - _Hero Section:_ Informasi operasional (Buka 24 Jam).
  - _Section Lokasi & Layanan:_ Detail alamat dan layanan apotek.
  - _Section Shop:_ Pencarian obat & resep.
  - _Section Antrean (Articles):_ Status dokter dan daftar antrean.
  - _Section Form Kontak:_ Form masukan dari pengunjung.
- _Footer:_ Informasi kontak dan media sosial.

---

## ♿ Checklist Aksesibilitas Dasar

- [x] _Elemen Bahasa (lang="id"):_ Memudahkan screen reader mengenali bahasa Indonesia.
- [x] _Struktur HTML Semantik:_ Menggunakan <header>, <nav>, <main>, <section>, <article>, dan <footer>.
- [x] _Hirarki Heading:_ Menggunakan struktur terurut <h1>, <h2>, <h3>, dan <h4>.
- [x] _Alt Text pada Gambar:_ Menambahkan atribut alt pada logo apotek.
- [x] _Label Form:_ Semua input dan textarea pada form dihubungkan secara eksplisit dengan tag <label> menggunakan atribut for dan id.
- [x] _Link Deskriptif:_ Menggunakan kalimat tujuan link yang jelas tanpa teks generik.
- [x] _Uji Navigasi Keyboard:_ Seluruh elemen interaktif (<a>, <button>, <input>) dapat diakses dan difokuskan menggunakan tombol Tab.

---

## 📝 Refleksi Singkat

Pengerjaan struktur HTML murni ini memberikan pemahaman mendalam mengenai pentingnya pondasi web semantik sebelum masuk ke tahap styling (CSS). Penerapan label pada form dan hirarki heading sangat membantu keterbacaan struktur halaman, baik bagi pengguna biasa, mesin pencari (SEO), maupun pengguna yang mengandalkan teknologi asistif (screen reader)

# Landing Page Responsif Apotek Bina Farma Tarakan

Repositori ini berisi kode sumber untuk tugas **Proyek Individu 3 - Pemrograman Web**, berupa _landing page_ responsif dan aksesibel untuk **Apotek Bina Farma Tarakan**.

---

## 📋 Catatan Keputusan Desain & CSS

- **Palet Warna (Identitas Apotek Bina Farma):**
  - **Tosca (`#2ebaa8`):** Warna utama yang merepresentasikan kesehatan, kebersihan, dan kesegaran.
  - **Putih (`#ffffff`) & Light Cyan (`#f4fbfb`):** Warna latar belakang agar tampilan bersih dan nyaman dibaca.
  - **Kuning (`#ffd11a`):** Warna aksen untuk lencana (_badge_) informasi operasional 24 jam.
- **Layout Responsif:**
  - **Flexbox:** Digunakan untuk merapikan navigasi menu, form pencarian obat, dan elemen _footer_.
  - **CSS Grid:** Digunakan pada section antrean dokter (`#antrean`) agar otomatis menyesuaikan dari 1 kolom di layar smartphone menjadi 2 kolom di layar tablet/desktop.
- **Variabel CSS (`:root`):** Memudahkan konsistensi warna, _border-radius_, dan _box-shadow_ di seluruh komponen.

---

## ♿ Aksesibilitas (Accessibility)

- **Navigasi Keyboard:** Seluruh tautan, input, dan tombol dapat diakses sepenuhnya menggunakan navigasi `Tab`.
- **Fokus Visual (`:focus-visible`):** Memberikan garis tepi (_outline_) yang jelas saat elemen interaktif disorot melalui keyboard.
- **HTML Semantik:** Menggunakan tag semantik seperti `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, dan `<footer>` untuk mendukung pembaca layar (_screen reader_).

---

## 🚀 Cara Menjalankan Proyek

1. _Clone_ repositori ini:
   ```bash
   git clone [https://github.com/kayoo-7z/pemweb-proyek.git](https://github.com/kayoo-7z/pemweb-proyek.git)
   ```

<div align="center">
  <h1>KAIH (Sistem Monitoring 7 Kebiasaan Anak)</h1>
  <p>Platform progresif untuk menjembatani evaluasi karakter siswa antara Orang Tua dan Guru secara real-time.</p>
</div>

<br />

## 📖 Tentang Proyek

**Sistem Monitoring 7 Kebiasaan Anak (KAIH)** adalah aplikasi berbasis web yang dirancang untuk memonitor, mencatat, dan mengevaluasi aktivitas sehari-hari siswa di rumah. Aplikasi ini dibangun dengan paradigma *Mobile-First* untuk memudahkan orang tua dalam mengisi jurnal harian anak.

Sistem ini melacak 7 pilar kebiasaan utama:
1. 🌅 **Bangun Pagi**
2. 🕌 **Ibadah** (Disesuaikan untuk Islam dan Non-Islam)
3. 🏃 **Berolahraga**
4. 🥗 **Makan Sehat**
5. 📚 **Gemar Belajar**
6. 🤝 **Bermasyarakat** (Interaksi Sosial)
7. 😴 **Tidur Tepat Waktu**

Melalui KAIH, guru dapat melihat rekapitulasi data afektif siswa secara *real-time* yang direpresentasikan menggunakan visualisasi indikator (Heatmap/Titik Warna), sehingga evaluasi karakter dapat dilakukan dengan presisi berbasis data.

---

## 🚀 Fitur Utama

### 👨‍👩‍👦 Untuk Orang Tua
- **Smart Dashboard:** Tampilan ringkasan pengisian harian dan sisa jurnal yang belum terisi.
- **Form Interaktif:** Antarmuka pencatatan harian yang responsif, dilengkapi animasi transisi dan *state* pemrosesan (loading) yang jelas.
- **Riwayat Kalender:** Meninjau catatan historis di hari-hari sebelumnya.

### 👨‍🏫 Untuk Guru & Admin
- **Visualisasi Rekapitulasi:** Pemantauan kelengkapan pengisian jurnal siswa menggunakan indikator warna (Hijau = Tuntas, Kuning = Parsial, Merah = Kosong).
- **Manajemen Kelas:** Memantau siswa secara agregat berdasarkan kelas.
- **Evaluasi & Laporan:** Memberikan umpan balik terhadap perkembangan kebiasaan siswa.

---

## 🛠️ Stack Teknologi

Aplikasi ini dibangun menggunakan arsitektur modern (*3-Tier Architecture*):

- **Frontend Framework:** [Nuxt 4](https://nuxt.com/) (Vue.js 3)
- **Styling:** Vanilla CSS & Tailwind CSS (*Glassmorphism & Flat Design*)
- **Backend & Database:** [Supabase](https://supabase.com/) (PostgreSQL)
- **Otentikasi:** Supabase Auth
- **Deployment:** Cloudflare Pages (Nitro Preset)

---

## 🛡️ Keamanan (Security)

Sistem ini telah dikonfigurasi untuk memenuhi standar keamanan data privasi siswa:
- **Row Level Security (RLS):** Diaktifkan di seluruh tabel Supabase untuk memastikan data hanya bisa ditulis oleh *role* yang diotorisasi (Authenticated).
- **GraphQL Omission:** Skema *public* database disembunyikan dari *endpoint* GraphQL publik untuk menghindari pengeksposan data yang tidak disengaja.
- **Security Invoker:** Fungsi-fungsi kritikal (seperti RPC) dijalankan menggunakan izin eksekutor (Invoker).

---

## 💻 Cara Menjalankan di Lokal (Local Setup)

### Prasyarat
Pastikan Anda telah menginstal Node.js (Versi 18+ disarankan), PNPM (atau NPM/Yarn), dan memiliki kredensial Supabase.

### Langkah-langkah

1. **Instalasi Dependensi**
   ```bash
   pnpm install
   ```

2. **Konfigurasi Environment Variable**
   Buat file `.env` di root direktori proyek Anda:
   ```env
   SUPABASE_URL=https://<project-id>.supabase.co
   SUPABASE_KEY=<anon-public-key>
   ```

3. **Jalankan Development Server**
   ```bash
   pnpm run dev
   ```

---

<div align="center">
  Dibuat dengan ❤️ untuk kemajuan pendidikan anak Indonesia.
</div>

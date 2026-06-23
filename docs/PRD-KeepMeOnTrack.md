# Product Requirements Document (PRD)
# KeepMeOnTrack

**Version:** 1.0  
**Status:** Draft  
**Last Updated:** June 2026  

---

## 1. Overview

### 1.1 Product Vision

KeepMeOnTrack adalah sebuah **Progressive Web App (PWA) minimalis** yang membantu pengguna membangun satu kebiasaan sekaligus dengan cara paling sederhana: jangan biarkan rantai harimu terputus.

> *"One habit. One chain. Don't break it."*

### 1.2 Problem Statement

Aplikasi habit tracker yang ada di pasaran memiliki terlalu banyak fitur — grafik kompleks, statistik berlapis, notifikasi agresif, dan sistem gamifikasi yang justru menciptakan friction. Akibatnya, pengguna lebih sering merasa overwhelmed daripada termotivasi, dan akhirnya meninggalkan aplikasi.

### 1.3 Solution

KeepMeOnTrack hanya melakukan **satu pekerjaan**: menampilkan satu target kebiasaan dan memotivasi pengguna untuk tap hari ini menjadi hijau. Tidak ada akun wajib, tidak ada notifikasi paksa, tidak ada backend — semua data tersimpan di browser pengguna sendiri.

### 1.4 Target Users

- Pengguna yang ingin memulai atau mempertahankan satu kebiasaan baru
- Pengguna yang frustrasi dengan habit tracker yang terlalu kompleks
- Pengguna yang menghargai privasi dan tidak ingin membuat akun
- Usia 16–40 tahun, pengguna smartphone dan desktop

---

## 2. Goals & Success Metrics

### 2.1 Product Goals

| Goal | Deskripsi |
|---|---|
| **Simplicity** | Pengguna bisa log habit dalam < 10 detik |
| **Retention** | Pengguna kembali membuka app setiap hari secara sukarela |
| **Zero Friction** | Tidak perlu akun, tidak perlu koneksi internet |
| **Shareability** | Pengguna berbagi pencapaian secara organik |

### 2.2 Success Metrics (KPIs)

| Metrik | Target |
|---|---|
| Time-to-first-log | < 30 detik sejak buka app |
| Daily active retention (minggu 1) | > 60% |
| Completion card shared | > 20% dari user yang menyelesaikan target |
| App install (Add to Home Screen) | > 40% dari returning users |

---

## 3. Features & Requirements

### 3.1 Target Setup

**Priority: P0 — Must Have**

Pengguna dapat membuat target kebiasaan baru dengan mengisi:

- **Nama habit** (max 40 karakter), contoh: *"Olahraga 15 menit"*
- **Durasi target**: pilihan preset 30 / 66 / 90 / 100 hari, atau custom (min 7, max 365)
- **Tanggal mulai**: default hari ini, atau pilih tanggal lain
- **Emoji ikon** (optional): untuk personalisasi visual
- **Warna aksen** (optional): pilih dari 6 preset warna

**Rules:**
- Pengguna bisa memiliki lebih dari satu target (tersimpan di localStorage)
- Tampilan default hanya fokus menampilkan **satu target aktif** pada satu waktu
- Pengguna bisa switch antar target dari menu

---

### 3.2 Calendar Chain View

**Priority: P0 — Must Have**

Tampilan utama app menampilkan kalender grid kebiasaan:

- Grid bulan berjalan, tiap hari = lingkaran/kotak kecil
- **Tap hari ini** → status berubah menjadi hijau ✅ (toggle)
- **Hari terlewat** (tidak di-tap) → merah / abu gelap
- **Hari mendatang** → kosong / outline saja
- **Visual chain**: garis/rantai SVG yang menghubungkan hari-hari hijau berturutan
- **Streak counter** prominent di bagian atas: *"🔥 23 hari berturut-turut"*
- Navigasi bulan (prev/next) untuk melihat histori

**Rules:**
- Pengguna hanya bisa tap hari ini (bukan masa lalu atau masa depan)
- Satu tap = done; tap lagi = undo (toggle)
- Setelah tengah malam, hari sebelumnya otomatis terkunci

---

### 3.3 Progress View

**Priority: P0 — Must Have**

Tampilan progres keseluruhan target:

- **Progress bar besar**: *"67 dari 90 hari"* dengan persentase
- **Milestone markers** pada progress bar: 7 hari 🥉, 30 hari 🥈, 66 hari 🥇, 100 hari 🏆
- **Weekly summary strip**: 7 kotak kecil minggu berjalan
- **Stats panel**:
  - Current streak (hari berturut-turut sekarang)
  - Longest streak (rekor terpanjang)
  - Total days completed
  - Completion rate (%)
- Animasi micro-interaction saat milestone tercapai

---

### 3.4 Daily Log Interaction

**Priority: P0 — Must Have**

- Tombol besar / area tap yang jelas di halaman utama: *"Tap untuk hari ini ✓"*
- Animasi satisfying saat tap: pulse hijau + confetti mini + sound (optional, bisa di-mute)
- Jika sudah di-tap hari ini: tampil status *"✅ Sudah selesai hari ini! Besok lagi."*
- Peringatan visual saat chain hampir putus (hari ini belum di-tap, sudah malam)

---

### 3.5 Completion Card — Shareable Image

**Priority: P1 — Should Have**

Ketika target selesai (semua hari dalam durasi target tercapai):

- Muncul layar celebrasi fullscreen dengan animasi
- Generate **shareable card** sebagai gambar PNG berisi:
  - Nama habit
  - Durasi total yang dicapai
  - Grid mini kalender (semua hijau)
  - Hashtag: `#KeepMeOnTrack`
  - Tanggal selesai
- Tombol **"Bagikan"** → native share sheet (Web Share API) atau download PNG
- Pilihan **2–3 template visual** kartu (minimalis, bold, pastel)

---

### 3.6 Data Management

**Priority: P1 — Should Have**

Karena semua data tersimpan di localStorage:

- **Export JSON**: download semua data habit sebagai file `.json`
- **Import JSON**: restore data dari file backup
- **Reset target**: hapus progress, mulai ulang dari awal (dengan konfirmasi)
- **Delete target**: hapus target beserta semua datanya

---

### 3.7 PWA Capabilities

**Priority: P1 — Should Have**

- **Installable**: manifest.json lengkap untuk "Add to Home Screen"
- **Offline-first**: service worker meng-cache semua aset, app berfungsi 100% tanpa internet
- **Responsive**: tampil optimal di mobile (360px+) dan desktop
- **Dark mode default** dengan opsi light mode

---

### 3.8 Onboarding

**Priority: P2 — Nice to Have**

- Layar onboarding singkat (3 slides max) saat pertama kali buka
- Langsung arahkan ke setup target pertama
- Tidak ada signup/login flow

---

## 4. Non-Goals (Out of Scope for v1)

- Notifikasi push / reminder (dikecualikan by design)
- Backend / cloud sync
- Social features (leaderboard, follow teman)
- Multiple habit tampil bersamaan dalam satu view
- Integrasi kalender eksternal (Google Calendar, dll)
- Statistik analitik mendalam
- AI-generated suggestions

---

## 5. User Stories

| ID | User Story | Priority |
|---|---|---|
| US-01 | Sebagai pengguna baru, saya ingin membuat target kebiasaan dalam < 1 menit tanpa perlu daftar akun | P0 |
| US-02 | Sebagai pengguna harian, saya ingin tap satu tombol untuk menandai hari ini selesai | P0 |
| US-03 | Sebagai pengguna, saya ingin melihat rantai hari hijau saya secara visual agar termotivasi | P0 |
| US-04 | Sebagai pengguna, saya ingin tahu berapa hari streak saya saat ini | P0 |
| US-05 | Sebagai pengguna yang menyelesaikan target, saya ingin berbagi pencapaian saya ke media sosial | P1 |
| US-06 | Sebagai pengguna, saya ingin data saya tidak hilang meski clear cache, dengan cara export/import | P1 |
| US-07 | Sebagai pengguna mobile, saya ingin install app ini ke home screen seperti native app | P1 |
| US-08 | Sebagai pengguna dengan beberapa habit, saya ingin bisa switch antar target | P2 |

---

## 6. UX Principles

1. **Zero friction**: buka app → tap → tutup. Total waktu < 10 detik
2. **No dark patterns**: tidak ada notifikasi yang tidak diminta, tidak ada paywall tersembunyi
3. **Visual reward over numbers**: otak merespons visual rantai hijau lebih kuat dari angka statistik
4. **Offline first**: app harus bekerja penuh tanpa koneksi internet
5. **Privacy by design**: tidak ada tracking, tidak ada data yang keluar dari device pengguna

---

## 7. Monetisasi (Roadmap)

| Tier | Fitur | Model |
|---|---|---|
| **Free** | 1 aktif habit, localStorage, share card | Gratis selamanya |
| **Pro** *(v2)* | Multiple habit tanpa batas, cloud sync, tema premium | Subscription bulanan / one-time |

> **Prinsip**: Core feature tidak pernah di-paywall. Monetisasi hanya untuk convenience features.

---

## 8. Risks & Mitigations

| Risk | Dampak | Mitigasi |
|---|---|---|
| User kehilangan data karena clear browser storage | Tinggi | Prompting export berkala; fitur import |
| localStorage limit (biasanya 5–10MB) | Rendah | Data habit sangat kecil; tidak akan mencapai limit |
| Web Share API tidak didukung semua browser | Sedang | Fallback ke download PNG manual |
| html2canvas tidak render sempurna di semua browser | Sedang | Test lintas browser; fallback ke Canvas API native |

---

## 9. Open Questions

- [ ] Apakah perlu **"grace period"**? (misal: boleh lewat 1 hari dalam seminggu tanpa chain putus)
- [ ] Nama final untuk chain yang putus: "Game Over" screen atau langsung reset subtle?
- [ ] Berapa template completion card di v1? (usulan: 3 template)
- [ ] Apakah perlu konfirmasi sebelum undo tap hari ini?

---

*Dokumen ini adalah living document dan akan diperbarui seiring perkembangan produk.*

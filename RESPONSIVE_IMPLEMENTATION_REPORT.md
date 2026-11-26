# RUANG DENGAR — Responsive Reconstruction

## Audit awal (sebelum implementasi)

### Cakupan yang diperiksa

- Viewport, root React, dan stylesheet global (`index.html`, `src/App.tsx`, `src/index.css`).
- Layar awal, roster, simulasi, percakapan, intro komik, dan modal utama.
- Ukuran canvas, transform kamera, DPR, serta pemetaan pointer ke tile/agen.
- Vercel build/output dan endpoint Gemini yang dipanggil klien.

### Temuan

1. Meta viewport sudah memakai `width=device-width` dan `viewport-fit=cover`; manifest juga menyatakan orientasi landscape.
2. Aturan UI terpusat di satu stylesheet besar. Ada beberapa breakpoint yang tumpang tindih dan campuran `vh`, `svh`, serta `dvh`; beberapa panel komik/modal masih memakai tinggi `vh` tetap. Belum ada petunjuk orientasi portrait.
3. Roster dan dialog sudah memiliki aturan ponsel, tetapi beberapa kontrol menjadi lebih kecil dari target sentuh saat ruang menyempit. Roster perlu mempertahankan alur scroll saat semua kartu tidak muat.
4. Canvas memakai `ResizeObserver`, DPR maksimum 2, kamera fit, dan koordinat pointer berbasis `getBoundingClientRect()`; tidak perlu mengubah koordinat dunia. Namun ukuran logis canvas dipaksa minimum 300 × 260 px, yang dapat melampaui kontainer viewport pendek. Kamera harus tetap mengukur ruang aktual.
5. Adegan dan intro memiliki layout/rasio gambar masing-masing; penyesuaian sebaiknya dilakukan pada viewport/container dan skala kamera, bukan mengubah geometri map, collision, atau data karakter.
6. Konfigurasi Vercel membangun `dist` dengan Vite. Tidak ditemukan fungsi di direktori `api/`, sedangkan klien memanggil `/api/gemini/health`, `/classify`, dan `/utterance`; endpoint tersebut saat ini hanya dibuat oleh Express di `server.ts`, sehingga fitur Gemini tidak tersedia pada deployment statis Vercel.
7. Asset klien menggunakan path publik/root-relative; build Vite dan plugin salin asset sudah tersedia.

### Rencana implementasi

- Menyatukan perilaku viewport dinamis dan safe-area tanpa mengubah mekanisme simulasi.
- Menata ulang layar mobile landscape untuk layar awal, roster, HUD, dialog, intro, dan modal; menjaga scroll internal dan sasaran sentuh.
- Memperbaiki ukuran buffer canvas agar selalu mengikuti ukuran aktual kontainer, sambil mempertahankan DPR terkendali, kamera fit, dan transform pointer yang ada.
- Menambahkan petunjuk portrait yang tidak memaksa rotasi.
- Menyediakan handler serverless Vercel untuk endpoint Gemini agar konfigurasi produksi sesuai dengan jalur API klien.
- Memvalidasi build, type-check, pengujian kamera/layout, serta viewport desktop, landscape, dan portrait; memperbarui laporan ini dengan hasil akhir.

## Implementasi dan hasil akhir

### Perubahan

- Viewport dinamis, safe-area, layout mobile, ukuran target sentuh, scroll internal panel, dan petunjuk orientasi portrait dikalibrasi lintas layar awal, roster, HUD, dialog, intro, dan modal.
- Buffer canvas mengikuti dimensi stage yang terukur, termasuk pada viewport pendek. Kamera peta disesuaikan dengan ruang yang tersedia tanpa mengubah koordinat dunia, collision, AI, atau simulasi.
- Logika Gemini dipakai bersama oleh server Express lokal dan fungsi serverless pada `api/gemini/`, agar endpoint klien tersedia pada deployment Vercel.
- README diperbarui dengan konfigurasi deployment terkait.

### Validasi

- `npm run lint`: berhasil.
- `npm test`: berhasil, 446 tes lulus dan 0 gagal.
- `npm run build`: berhasil. Vite masih melaporkan bundle JavaScript sekitar 552,5 kB, di atas ambang peringatan 500 kB; ini peringatan non-blocking.
- Build produksi melalui Vite preview diperiksa pada 844 × 260 (landscape pendek), 390 × 844 (portrait), dan 1366 × 768 (desktop). Tidak ditemukan overflow dokumen; ukuran stage dan canvas sesuai viewport. Petunjuk portrait tampil hanya pada viewport portrait.
- Intro komik 5-panel sebelumnya juga diperiksa pada 844 × 390; panel tetap dapat diakses dan tidak tertutup kontrol atas.

### Kesiapan Vercel dan batasan

- Konfigurasi fungsi API Vercel sudah ditambahkan dan build produksi berhasil; deployment langsung ke Vercel belum dilakukan, sehingga kesiapan operasional setelah deploy belum terverifikasi.
- Fungsi Gemini memerlukan `GEMINI_API_KEY` di environment Vercel. Endpoint tersebut belum memiliki rate limit; pertimbangkan perlindungan biaya sebelum membuka endpoint ke publik.

## Audit regresi identitas karakter (26 November 2026)

### Temuan dan penyebab

- Registry utama `STUDENT_BLUEPRINTS` memasangkan nama dan ID, misalnya `mhs-12` = Sari Melati dan `mhs-03` = Tania Wijaya. `STORY_GRAPHS` juga diindeks dengan `studentId`; `useStoryMission` mengambil agen dan graf menggunakan ID agen yang sama. `StoryScreen` meneruskan `agent.id` ke portrait, dan loader aset memilih portrait/pose berdasarkan ID tersebut. Tidak ditemukan perubahan responsive yang mengubah registry, dialog, relasi ruangan, atau pemilihan agen.
- `?autostart=1` hanya membuka layar simulasi; parameter itu tidak memilih student atau memulai skenario percakapan tertentu. Mahasiswa yang dihampiri dari tombol prioritas berasal dari `campusMission.topPriorityAgent` pada state permainan saat itu. Karena itu Tania yang tampil dapat berarti sesi tersebut memilih `mhs-03`; itu sendiri bukan bukti bahwa skenario Sari (`mhs-12`) tertimpa.
- Ditemukan satu fallback yang berisiko menyamarkan ID salah: `getCharacterProfile()` sebelumnya mengembalikan profil dosen untuk ID storyboard yang tidak dikenal. Fallback tersebut dihapus; ID tak dikenal sekarang menghasilkan error yang eksplisit.

### Perbaikan dan pengujian

- `speakerId` kini wajib pada data dialog komik, dan portrait percakapan mengekspos `data-character-id` untuk verifikasi ID yang benar-benar dirender.
- Tes regresi memeriksa pemetaan seluruh graf ke ID mahasiswa, ID actor/dialog eksplisit, kecocokan label speaker dengan registry, portrait manifest yang dipakai berdasarkan ID yang sama, skenario Sari `mhs-12`, serta penolakan ID storyboard tak dikenal.
- `npm run lint`, `npm test` (446 lulus, 0 gagal), dan `npm run build` berhasil. Peringatan ukuran bundle >500 kB tetap non-blocking.
- Skenario autostart yang sama diperiksa pada 1920 × 1080, 1366 × 768, 844 × 390, 915 × 412, dan 390 × 844. Pada semuanya percakapan tetap memakai `mhs-15` / Naufal Hakim, Naufal sebagai speaker aktif dan Dosen (`dosen`) sebagai pendengar, dialog pembuka yang sama, serta aset pose `/assets/characters/naufal/poses/p11-exhausted.png` (480 × 600). Tidak ada overflow dokumen pada kelima viewport.
- Identitas Sari diverifikasi terpisah lewat registry dan graf (`mhs-12`), label, dan manifest portrait (`mhs-12-portrait.png`). Tidak ada perubahan pada aset atau mekanisme gameplay.

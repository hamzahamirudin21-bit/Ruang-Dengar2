# Laporan Perbaikan Tutorial Mobile RUANG DENGAR

## Akar masalah

Panel ilustrasi, heading, seluruh instruksi, dan footer sebelumnya berada dalam satu area yang terpotong pada viewport pendek. Di landscape 844 × 390, tinggi konten melebihi tinggi panel sehingga tombol aksi terdorong ke luar layar. Handler tombol bukan penyebabnya: tombol sudah berupa elemen `<button>` dengan callback yang benar untuk menutup briefing.

Audit lanjutan pada portrait menemukan pemberitahuan orientasi layar memiliki `z-index: 1000`, lebih tinggi daripada modal tutorial (`z-75`). Pemberitahuan tersebut menutupi sebagian area footer secara visual, walaupun tidak menangkap pointer.

## Perbaikan

- Memisahkan modal menjadi area ilustrasi, heading, konten instruksi yang dapat digulir, dan footer aksi yang tidak ikut tergulir.
- Menambahkan layout khusus landscape dan portrait, ukuran ilustrasi yang dibatasi, dukungan `dvh`/safe-area, dan penguncian scroll halaman belakang selama briefing terbuka.
- Menempatkan modal briefing di atas pemberitahuan orientasi (`z-index: 1001` vs `1000`) sehingga kontrol tutorial tidak tertutup.
- Mempertahankan teks panduan, portrait asli Ibu Dosen BK, fungsi tombol Mulai Shift Pagi, dan mekanisme game.
- Menambahkan tes render untuk identitas portrait, isi panduan penting, dialog, dan tombol HTML semantik di `src/ui/screens/morningBriefingModal.test.ts`.

## Hasil pengujian

### Browser automation — development server

| Viewport | Tombol terlihat & menerima klik | Gambar utuh dalam panel | Modal tertutup |
| --- | --- | --- | --- |
| 844 × 390 landscape | Lulus | Lulus | Lulus |
| 915 × 412 landscape | Lulus | Lulus | Lulus |
| 932 × 430 landscape | Lulus | Lulus | Lulus |
| 960 × 440 landscape | Lulus | Lulus | Lulus |
| 390 × 844 portrait | Lulus | Lulus | Lulus |
| 412 × 915 portrait | Lulus | Lulus | Lulus |
| 1366 × 768 desktop | Lulus | Lulus | Lulus |
| 1920 × 1080 desktop | Lulus | Lulus | Lulus |

Matriks delapan ukuran di atas dijalankan pada development server. Production preview terpisah merespons HTTP 200; pengujian portrait pada bundle production menghasilkan nol error halaman, memastikan pemberitahuan orientasi berada di bawah modal, dan berhasil menjalankan tombol.

### Scroll dan regresi

- Pada 844 × 260, scroll internal bergerak dari `scrollTop=0` ke `118`, sementara posisi footer tidak berubah.
- Setelah tombol ditekan, modal tertutup dan scroll halaman belakang dipulihkan.
- `npm test`: 447 lulus, 0 gagal.
- `npm run lint`: lulus.
- `npm run build`: lulus. Vite masih menampilkan peringatan ukuran satu chunk JavaScript di atas 500 kB; tidak menggagalkan build dan tidak terkait perubahan tutorial.
- `git diff --check`: lulus.

## Batas pengujian

Pengujian dilakukan melalui browser automation pada server lokal dan production preview. Perangkat fisik maupun deployment publik tidak tersedia untuk diuji; klik browser bukan bukti pengujian sentuh pada perangkat nyata.


# RUANG DENGAR

Simulator 2D konseling untuk laboratorium kampus vokasi atau sekolah industri. Pengguna berperan sebagai calon guru Bimbingan dan Konseling (BK) yang bertugas di sebuah laboratorium praktik. Ia mengamati mahasiswa, memilih jalur kontak, membangun aliansi kerja, memperbaiki keretakan hubungan, dan menjaga kerahasiaan.

Seluruh tokoh dalam aplikasi ini fiktif. Aplikasi ini adalah alat latihan, bukan alat diagnosis dan bukan pengganti konselor.

## Latar teori BK

Rancangan simulasi bertumpu pada konsep dasar BK berikut. Ringkasan ini dimaksudkan sebagai pengantar, bukan pengganti buku ajar.

- **Konseling berpusat pada klien.** Konselor menciptakan kondisi penerimaan, kesejajaran, dan pemahaman empatik. Klien yang menentukan arah pembicaraan dan kecepatan membuka diri.
- **Aliansi kerja.** Kualitas hubungan konselor-klien (kesepakatan tujuan, tugas, dan ikatan emosional) memengaruhi hasil konseling. Dalam simulasi, aliansi tercermin pada tingkat kepercayaan (*rapport*) yang naik atau turun menurut pilihan konselor.
- **Empati.** Konselor memahami dan menyampaikan pemahamannya tentang perasaan klien tanpa menghakimi. Keterampilan ini dilatih lewat dialog.
- **Ruptur dan repair.** Ketegangan atau keretakan hubungan (misalnya klien menarik diri atau berkonfrontasi) lazim terjadi. Pengakuan, eksplorasi, dan perbaikan yang tepat dapat memulihkan bahkan menguatkan aliansi.
- **Observasi non-tes.** Konselor mengumpulkan data lewat pengamatan perilaku, catatan anekdotal, dan hipotesis sementara, bukan lewat label atau tes tunggal.
- **Sosiometri.** Pola pilihan dan kedekatan antarsiswa dipetakan dalam sosiogram untuk melihat kelompok, siswa terisolasi, dan penghubung.
- **Kerahasiaan dan batas peran.** Informasi yang dipercayakan klien dijaga. Konselor bertindak dalam batas perannya dan merujuk bila persoalan melampaui kewenangannya.

## Tujuan pembelajaran

Setelah berlatih dengan Ruang Dengar, pengguna diharapkan mampu:

1. Membedakan fakta perilaku yang teramati dari tafsiran, lalu menyusun hipotesis yang dapat direvisi.
2. Memilih jalur kontak yang sesuai dengan tingkat privasi dan risiko stigma.
3. Menyesuaikan keterampilan konseling (misalnya refleksi perasaan dan pertanyaan terbuka) dengan kesiapan klien.
4. Mengenali tanda ruptur dan menjalankan langkah perbaikan.
5. Menjaga kerahasiaan dan menyadari batas peran konselor.
6. Membaca sosiogram sebagai bahan hipotesis, bukan kesimpulan.

## Fitur utama

- **Peta laboratorium 40 x 24 petak** dengan 9 zona: cetak 3D, pemrograman, las, elektronik IoT, diskusi, gudang alat, istirahat, konsultasi, dan ruang dosen. Pergerakan mahasiswa memakai pencarian jalur A*.
- **Kohort 15 mahasiswa fiktif** (konstanta `STUDENT_COUNT` di `src/data/agents.seed.ts`). Tiap mahasiswa memiliki kepribadian, kebutuhan, relasi, dan memori sendiri. Jalannya hari berlangsung dari 08:00 sampai 16:00 waktu simulasi.
- **Pengamatan dan sosiogram.** Pengguna mencatat perilaku teramati, menyusun hipotesis, dan membaca peta relasi antarmahasiswa.
- **Enam jalur kontak**, masing-masing dengan biaya energi, durasi, tingkat privasi, risiko stigma, dan batas kedalaman dialog: sapa di tempat, ajak aktivitas, pintu akademik, panggilan resmi, lewat perantara, dan pesan tertulis.
- **Tangga keterbukaan L0-L3.** Mahasiswa membuka diri bertahap. Ambang kepercayaan untuk L1, L2, dan L3 berbeda tiap mahasiswa.
- **Keretakan dan perbaikan.** Pilihan yang keliru dapat memicu ruptur (menarik diri atau konfrontasi). Pengguna menjalankan langkah repair untuk memulihkan hubungan.
- **Daftar Karakter dan visual pixel art.** Setelah Mulai, layar Daftar Karakter menampilkan 15 kartu mahasiswa (potret, nama, gaya khas, dan dua minat teratas). Mahasiswa tampil sebagai sprite beranimasi di dunia 2D dan potret berekspresi di layar cerita. Semua gambar dibuat prosedural dari kode (0 berkas gambar). Anda dapat menggantinya dengan gambar sendiri lewat slot aset opsional: letakkan berkas di `public/assets/characters/mhs-XX/` dan daftarkan di `public/assets/characters/manifest.json` (format dan tata letak sprite sheet ada di `docs/ASSETS.md`). Tanpa manifest, aplikasi memakai gambar prosedural.
- **Mode Latihan dan Mode Ujian.** Mode Latihan menampilkan petunjuk kualitatif. Mode Ujian menyembunyikannya, sehingga pengguna membaca respons dan isyarat nonverbal secara mandiri.
- **Dialog hibrida dengan mode offline.** Bila kunci Gemini tersedia, ucapan mahasiswa dibangkitkan model bahasa dan divalidasi. Bila tidak, aplikasi memakai templat ujaran berbasis aturan.

## Instalasi dan menjalankan

Prasyarat: Node.js (versi LTS terbaru disarankan) dan npm.

1. Pasang dependensi:

   ```bash
   npm install
   ```

   Bila npm melaporkan konflik peer dependency, gunakan:

   ```bash
   npm install --legacy-peer-deps
   ```

2. (Opsional) Siapkan variabel lingkungan dengan menyalin `.env.example` menjadi `.env`. Lihat bagian berikut.
3. Jalankan server pengembangan:

   ```bash
   npm run dev
   ```

4. Buka http://localhost:3000. Port dapat diubah lewat variabel `PORT`.

Tambahan yang berguna:

- `http://localhost:3000/?autostart=1` melewati layar awal dan langsung membuka simulasi.
- Tekan **Ctrl+Shift+D** di layar simulasi untuk membuka panel pengembang.
- Menjalankan semua tes: `npm test` (mencakup `src/engine`, `src/engine/story`, `src/data/stories`, dan `src/ui/story`; pola yang belum cocok berkas diabaikan). Di PowerShell, pola `*` tidak selalu diperluas sama seperti di shell lain, jadi jalankan `npm test` atau jalankan tes per berkas, misalnya `npx tsx --test src/data/stories/mhs-01.test.ts`.
- Pemeriksaan tipe: `npm run lint` (menjalankan `tsc --noEmit`).
- Build klien: `npm run build`.
- Ekspor tinjauan dialog ke Markdown: `npx tsx scripts/exportStoryReview.ts mhs-01 mhs-02 ...` (sebutkan id mahasiswa yang ingin ditinjau; hasilnya ditulis ke `docs/story-review/`).
## Variabel lingkungan

| Variabel | Fungsi | Wajib |
| --- | --- | --- |
| `GEMINI_API_KEY` | Kunci API Gemini yang dibaca server untuk dialog hibrida. Bila kosong, aplikasi berjalan dalam mode offline. | Tidak |
| `GEMINI_MODEL` | Nama model Gemini. Bila kosong, server memakai model bawaan yang didefinisikan di `src/llm/config.ts` (saat ini `gemini-3.6-flash`). | Tidak |
| `APP_URL` | URL tempat aplikasi dihosting, untuk tautan yang merujuk ke aplikasi sendiri. | Tidak |

Contoh `.env`:

```env
GEMINI_API_KEY=isi-kunci-anda
GEMINI_MODEL=
APP_URL=
```

Berkas `.env` tidak ikut terlacak. Jangan memasukkan kunci ke kode sumber.

## Mode offline (tanpa GEMINI_API_KEY)

Aplikasi dapat dijalankan penuh tanpa kunci. Biarkan `GEMINI_API_KEY` kosong atau jangan buat `.env`, lalu jalankan `npm run dev`. Server tetap berjalan, endpoint `/api/gemini/health` melaporkan bahwa LLM belum dikonfigurasi, dan dialog memakai templat ujaran offline. Seluruh mekanisme simulasi (waktu, pergerakan, kepercayaan, keterbukaan, ruptur) tetap berfungsi karena berjalan di engine deterministik. Bila panggilan ke model gagal atau ucapan tidak lolos validasi, aplikasi juga kembali ke templat offline.

## Arsitektur singkat

- **`src/engine`**: logika simulasi deterministik dalam TypeScript murni, tanpa React atau DOM. Mencakup jam, generator acak ber-seed, pencarian jalur, agen, kepercayaan, keterbukaan, ruptur, sosiometri, dan dunia harian. Bagian ini diuji dengan `node:test`.
- **`src/data`**: data dan konten, yaitu peta, benih mahasiswa, konfigurasi jalur kontak, efek keterampilan, teks antarmuka, dan templat ujaran.
- **`src/llm`**: lapisan dialog. Berisi konfigurasi model, klien, pengklasifikasi keterampilan, pembangkit ujaran, cache, logger, dan validator yang menyaring keluaran model. Templat offline menjadi cadangan.
- **`server.ts`**: server Express yang menjadi proksi ke Gemini lewat endpoint `/api/gemini/health`, `/api/gemini/classify`, dan `/api/gemini/utterance`, serta melayani klien (Vite pada mode pengembangan). Kunci API hanya dibaca di server dan tidak pernah dikirim ke klien.
- **`src/ui`**: antarmuka React dan kanvas untuk layar awal, simulasi, panel pengamatan, sosiogram, dan panel pengembang.

## Struktur folder

```text
.
├── server.ts              Server Express (proksi Gemini, penyaji klien)
├── index.html             Titik masuk klien
├── .env.example           Templat variabel lingkungan
├── docs/                  Catatan perubahan dan keputusan desain
└── src/
    ├── App.tsx, main.tsx  Titik masuk aplikasi React
    ├── data/              Peta, benih mahasiswa, jalur kontak, teks, templat
    ├── engine/            Engine simulasi deterministik dan tesnya
    ├── llm/               Konfigurasi, klien, validator, cache, templat offline
    ├── types/             Definisi tipe bersama
    ├── ui/                Layar, panel, komponen, dan renderer kanvas
    └── utils/             Utilitas penyimpanan lokal
```

## Batasan

- Semua mahasiswa, relasi, dan peristiwa bersifat fiktif dan disederhanakan.
- Aplikasi ini bukan alat asesmen atau diagnosis. Sosiogram dan catatan hipotesis hanya bahan latihan penalaran.
- Aplikasi tidak menggantikan supervisi dosen, praktik lapangan, maupun konselor profesional.
- Kualitas dialog dalam mode offline lebih terbatas daripada dialog yang dibangkitkan model.
- Kohort, nilai parameter, dan ambang masih dapat dikalibrasi lebih lanjut.

## Etika

- Tidak ada data siswa nyata. Jangan memasukkan data pribadi siswa nyata ke aplikasi, catatan, maupun berkas lingkungan.
- Kerahasiaan adalah bagian dari latihan: pilihan jalur kontak memperhitungkan privasi dan risiko stigma.
- Topik krisis (misalnya risiko menyakiti diri atau orang lain) berada di luar cakupan simulasi. Pada situasi nyata, ikuti prosedur lembaga dan rujuk kepada tenaga profesional atau layanan darurat yang berwenang.
- Pemilihan perilaku mahasiswa tidak memakai label demografis sebagai dasar.
- Bila dialog dibangkitkan model, teks dikirim ke layanan Gemini. Jangan mengetik informasi nyata yang sensitif.

## Lisensi dan kredit

Proyek ini dibuat untuk keperluan pembelajaran dan kompetisi. Belum ada berkas lisensi di repositori. Hak penggunaan ditentukan oleh pemilik proyek. Dependensi pihak ketiga (React, Vite, Express, Tailwind CSS, `@google/genai`, dan lainnya) tunduk pada lisensinya masing-masing. Daftar aset ada di `docs/ASSETS.md`.

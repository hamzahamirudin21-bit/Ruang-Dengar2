# Riwayat Perubahan (`docs/CHANGELOG.md`)

## [Tahap 1] — Fondasi Proyek dan Dunia 2D Laboratorium
### Ditambahkan
- Identitas proyek `RUANG DENGAR` di `metadata.json` dan `index.html` berbahasa Indonesia.
- Palet warna kalem berbasis variabel CSS serta kontrol aksesibilitas (`data-text-size` dan `data-reduced-motion`) di `src/index.css`.
- Pusat seluruh teks antarmuka Bahasa Indonesia di `src/data/strings.ts` dan kontrak tipe di `src/types/index.ts`.
- Data peta statis top-down 40 × 24 petak di `src/data/map.ts` mencakup 9 zona wajib (Stasiun Cetak 3D, Stasiun Pemrograman & Mikrokontroler, Stasiun Las bersekat K3, Stasiun Elektronik & IoT, Meja Diskusi Bersama, Gudang Alat, Ruang Istirahat, Ruang Konsultasi Praktikum dengan pintu yang dapat diatur, dan Ruang Dosen).
- Mesin TypeScript murni beserta uji unit (`node:test`): `rng.ts` (`mulberry32`), `clock.ts` (`1 detik = 5 menit` pada `1x`, siklus `08:00–16:00`), dan `pathfinding.ts` (grid navigasi + A* 4-arah).
- Renderer Canvas 2D prosedural di `src/ui/canvas/labRenderer.ts` dengan zoom roda mouse, geser seret, kontrol keyboard, toggle grid & label zona, serta pengatur visibilitas pintu Ruang Konsultasi.
- Layar Awal (`StartScreen.tsx`), Modal Pengaturan (`SettingsModal.tsx`) dengan `localStorage` aman (`storage.ts`), Layar Simulasi (`SimulationScreen.tsx`) dengan bilah status dan 4 tab panel konselor placeholder, serta Panel Dev `Ctrl+Shift+D` (`DevPanel.tsx`) dengan uji "Teleport titik lalu jalan".
- Dokumentasi awal `docs/ASSETS.md`, `docs/DECISIONS.md`, dan `docs/CHANGELOG.md`.

## [Tahap 2] — Mesin Kehidupan Harian (40 Mahasiswa)
### Ditambahkan
- Model data lengkap mahasiswa di `src/types/index.ts` (identitas, minat 4 bidang, keterampilan, Big Five, matriks afinitas -1..1, kondisi dinamis, dan struktur awal variabel tersembunyi BK).
- 40 profil mahasiswa fiktif unik (tanpa NPC kosong) beserta pembangun posisi dan jaringan sosial awal deterministik di `src/data/agents.seed.ts`.
- Utilitas PRNG tambahan di `src/engine/rng.ts` (`randomRange`, `pickOne`, `shuffleDeterministic`, `clamp01`, `clampAffinity`).
- Mesin perilaku agen (`src/engine/agent.ts`): *utility scoring* per tick 5 menit, reservasi slot berdiri / petak zona, pergerakan mulus di jalur A*, pembaruan energi/stres/beban tugas, serta evolusi afinitas dan status sosial.
- Sistem event lab (`src/engine/events.ts`): jeda siang, koordinasi proyek, kalibrasi printer 3D, pengingat tenggat praktikum, inspeksi K3, dan gesekan tugas ringan.
- Orkestrator dunia simulasi (`src/engine/world.ts`) beserta uji unit di `src/engine/world.test.ts` (40 agen unik, determinisme seed, netralitas demografi, dan siklus penuh hari kerja).
- Renderer prosedural 40 agen dan garis interaksi sosial di `src/ui/canvas/agentRenderer.ts`, terintegrasi ke `labRenderer.ts`, inspeksi klik mahasiswa di `SimulationScreen.tsx`, serta ringkasan statistik & event aktif di `DevPanel.tsx`.

## [Tahap 3] — Jaringan Sosial dan Sosiogram Otomatis
### Ditambahkan
- Mesin log pengamatan perilaku (`src/engine/observationLog.ts`): perekaman ringkasan harian per agen, peta panas keberadaan `40 × 24`, skor ko-presensi, ekstraksi fakta perilaku murni bebas tafsir, dan validasi kata tafsir pada kolom FAKTA catatan anekdot.
- Mesin sosiometri positif harian (`src/engine/sociometry.ts`): pilihan kerja kelompok maksimal 3 rekan berbasis afinitas, riwayat kebersamaan, dan keterampilan saling melengkapi tanpa pertanyaan negatif.
- Analisis jaringan & tata letak (`src/engine/network.ts`): perhitungan timbal balik, komponen terhubung, ambang bintang 10% teratas, terisolasi, terabaikan, deteksi jembatan (titik artikulasi), tata letak *force-directed* stabil, dan laporan mentah konsol.
- Antarmuka Panel Sosiogram (`src/ui/SociogramPanel.tsx`) dan Panel Pengamatan (`src/ui/ObservationPanel.tsx`), terintegrasi di `SimulationScreen.tsx`, `DevPanel.tsx`, serta penyimpanan lokal aman di `storage.ts`.
- Uji unit sosiometri, analisis jaringan, pengamatan faktual, dan validasi catatan anekdot di `src/engine/sociometry.test.ts`.

## [Tahap 4] — Antarmuka Konselor, Pengamatan, dan Jalur Kontak
### Ditambahkan
- Data parameter 6 jalur kontak yang dapat disetel dosen BK di `src/data/contactChannels.ts` (`Sapa di tempat`, `Ajak aktivitas`, `Pintu akademik`, `Panggilan resmi`, `Lewat perantara`, `Pesan tertulis`).
- Mesin visibilitas & gosip (`src/engine/visibility.ts`): menghitung jumlah saksi di sekitar agen sasaran (dengan pengaruh mode pintu Ruang Konsultasi) serta kenaikan variabel `paparan` (`exposure`) untuk Tahap 5.
- Mesin ketersediaan & resolusi jalur kontak (`src/engine/contactChannels.ts`): validasi ketersediaan ruang konsultasi/energi, kegagalan tenggat penuh pada jalur 2, ketidakhadiran saat kepercayaan rendah pada jalur 3, penolakan/keterpaksaan pada jalur 4, dan kebocoran kepercayaan saat membuka detail kepada perantara pada jalur 5.
- Mesin peran konselor (`src/engine/counselor.ts`): manajemen energi 100/hari, percepatan waktu simulasi per aksi, aksi *Amati dari sudut* (5 energi / 30 menit ke `observationLog`), log aksi harian, serta ringkasan akhir hari dan transisi hari berikutnya saat energi habis atau jam lab selesai.
- Antarmuka `src/ui/AgentCard.tsx` dan `src/ui/ActionPanel.tsx` (termasuk layar percakapan placeholder dengan konteks jalur/saksi/jam serta modal Ringkasan Akhir Hari), terintegrasi ke `SimulationScreen.tsx`.
- Uji unit di `src/engine/counselor.test.ts` (energi/waktu, perbandingan saksi jalur 4 vs jalur 3, okupansi Ruang Konsultasi, determinisme seed, kebocoran kerahasiaan, dan pergantian hari saat energi habis).

## [Tahap 5] — Mesin Kepercayaan, Tangga Keterbukaan, Keretakan, dan Perbaikan Relasi
### Ditambahkan
- Data 14 keterampilan konseling dan profil masalah bertingkat (L1, L2, L3) pada 5 kategori masalah ringan fiktif di `src/data/skillEffects.ts`.
- Mesin kepercayaan (`src/engine/trust.ts`), tangga keterbukaan L0–L3 (`src/engine/disclosure.ts`), deteksi & perbaikan keretakan (`src/engine/rupture.ts` untuk tipe *menarik diri* & *konfrontasi* beserta pemutusan sesi jika diabaikan 2 giliran), dan ingatan lintas sesi (`src/engine/memory.ts` untuk ucapan terdahulu, janji tindak lanjut, riwayat dipermalukan, dan saksi).
- Layar sesi interaktif deterministik `src/ui/SessionScreen.tsx` menggantikan placeholder Tahap 4, lengkap dengan pengalih **Mode Latihan** vs **Mode Ujian**, isyarat nonverbal teks, input teks bebas tersimpan, alur *Akui ketegangan* + 4 langkah perbaikan, serta fitur *Buat janji tindak lanjut*.
- Tombol pengembang **"Simulasikan 100 sesi acak"** di `src/ui/components/DevPanel.tsx` dan uji unit komprehensif di `src/engine/trust.test.ts`.

## [Tahap 6] — Lapisan Dialog Gemini (Hibrida) dan Mode Offline
### Ditambahkan
- Proxy server Express terpadu di `server.ts` (`/api/gemini/health`, `/api/gemini/classify`, `/api/gemini/utterance`) menggunakan `@google/genai` dan `process.env.GEMINI_API_KEY` sisi server (tanpa kunci di kode klien) dengan `vite.middlewares` pada mode dev.
- Konfigurasi terpusat `src/llm/config.ts` (`gemini-4-hydrogen`, timeout `8000ms`, `1x` retry), klien fetch ber-timeout `src/llm/client.ts`, cache **Mode Rekaman** ber-seed `src/llm/cache.ts`, dan pencatat audit `src/llm/logger.ts`.
- Pengklasifikasi kalimat bebas konselor (Panggilan A) di `src/llm/classifier.ts` dengan aturan kata kunci deterministik sebagai cadangan offline.
- Pembangun kartu keadaan terbatas & generator ucapan agen (Panggilan B) di `src/llm/utteranceGenerator.ts`, dilindungi validator pasca-panggilan kode murni di `src/llm/validator.ts` (JSON, batas 40/12 kata, larangan diagnosis/keluar peran, anti-kebocoran kata kunci level terkunci, detektor injeksi prompt, dan pengaman topik terlarang).
- Pustaka templat offline deterministik `src/data/utteranceTemplates.ts` berisi 36 kombinasi (4 level × 3 nada × 3 gaya bicara) × minimal 6 variasi santai khas mahasiswa Indonesia.
- Orkestrator dialog hibrida `src/engine/dialogue.ts` (tanpa mengubah `trust.ts`, `disclosure.ts`, maupun `rupture.ts`), pembaruan UI `src/ui/SessionScreen.tsx` (indikator & pengalih uji `Gemini` / `Cadangan aturan`, toggle `Mode Rekaman`, opsi `Deteksi otomatis dari kalimat bebas`, gelembung dialog dengan isyarat nonverbal di bawahnya, dan pemberitahuan `Di Luar Cakupan Simulator`), serta uji unit di `src/engine/dialogue.test.ts`.


## [Revisi Kohort] — Pengurangan dari 40 menjadi 15 Mahasiswa (merevisi Tahap 2)

### Diubah
- `STUDENT_BLUEPRINTS` di `src/data/agents.seed.ts` dikurangi dari 40 menjadi 15 mahasiswa dengan id `mhs-01..mhs-15` (alasan pemilihan dan pemetaan id lama ke baru ada di Keputusan 016). Pada pemilihan subset, `mhs-19` diganti `mhs-20` agar seed bawaan hari 1 memuat bintang, terabaikan, dan terisolasi. Entri Tahap 2 di atas tetap sebagai riwayat.
- Konstanta `STUDENT_COUNT` diekspor dari `src/data/agents.seed.ts` sebagai sumber tunggal jumlah mahasiswa.
- Teks UI yang memuat jumlah mahasiswa menjadi fungsi berparameter di `src/data/strings.ts` (placeholder tab Pengamatan dan Sosiogram) serta dipakai di `src/ui/SimulationScreen.tsx` dan `src/ui/components/DevPanel.tsx` (judul ringkasan Panel Dev). Komentar yang menyebut jumlah mahasiswa ikut diperbarui.
- Bonus skor Meja Diskusi saat event diskusi-proyek di `src/engine/agent.ts` dinaikkan dari 0,24 menjadi 0,40 agar Meja Diskusi tetap terisi pada kohort kecil.
- Kunci `localStorage` catatan konselor (`counselor-records`) dan ingatan agen (`agent-memory`) dinaikkan ke `v2`, karena id lama dipakai ulang oleh mahasiswa yang berbeda.
- Aturan afinitas berpasangan dipetakan ulang ke id baru `mhs-01..mhs-15`.
- Uji `src/engine/world.test.ts`, `sociometry.test.ts`, `trust.test.ts`, dan `dialogue.test.ts` diperbarui agar memakai `STUDENT_COUNT` dan id kohort 15.

### Tidak berubah
- Ukuran peta tetap 40 × 24 petak.
- Logika `trust.ts`, `disclosure.ts`, dan `rupture.ts` tidak diubah.


## [Refaktor Kode Orisinal] — Pembersihan Sisa Templat AI Studio (spec `original-codebase-refactor`)

Perubahan ini hanya membersihkan sisa bawaan templat. Mekanisme simulasi dan kontrak endpoint tidak berubah. Entri di atas tetap sebagai riwayat, sehingga istilah lama (misalnya `gemini-4-hydrogen`) di dalamnya tidak diubah.

### Diubah
- `package.json`: `name` diubah dari nama templat (`react-example`) menjadi `ruang-dengar`. Skrip, dependensi, dan versi tidak berubah. Kolom `name` di `package-lock.json` ikut diselaraskan menjadi `ruang-dengar`.
- `server.ts`:
  - Header `User-Agent` bawaan platform (`aistudio-build`) pada opsi HTTP klien Gemini dihapus.
  - Placeholder kunci gaya templat (`MY_GEMINI_API_KEY`, `MY_APP_URL`) dihapus. Klien dibuat hanya bila `GEMINI_API_KEY` terisi.
  - Bila kunci tidak tersedia, `/api/gemini/classify` dan `/api/gemini/utterance` menjawab `503` dengan pesan Indonesia yang menyebut `GEMINI_API_KEY` dan cara mengaturnya lewat `.env`.
  - Konfigurasi thinking dipilih sesuai model lewat `buildThinkingConfig`: model berawalan `gemini-2.5` memakai `thinkingBudget`, model lain memakai `thinkingLevel` rendah, tidak pernah keduanya.
  - Nama model hanya dibaca dari `LLM_CONFIG`.
  - Path, metode, validasi `400`, `502`, skema respons, dan instruksi sistem endpoint tidak berubah.
- `src/llm/config.ts`: ditambahkan `DEFAULT_MODEL = 'gemini-3.6-flash'`, fungsi `resolveModel(env)` (memakai `GEMINI_MODEL` yang di-trim bila tidak kosong, jika tidak model bawaan), dan `LLM_CONFIG.model = resolveModel(...)`. String `gemini-4-hydrogen` tidak lagi ada di kode. Komentar `targetTemperatureBand` ditulis ulang dengan istilah netral. Modul ini tidak mengimpor `@google/genai`, sehingga aman dipakai klien.
- `.env.example`: ditulis ulang dalam Bahasa Indonesia untuk `GEMINI_API_KEY` (kosong berarti mode offline), `GEMINI_MODEL` (opsional), dan `APP_URL` (opsional). Placeholder gaya templat dihapus.
- `README.md`: ditulis ulang dalam Bahasa Indonesia (latar teori BK, tujuan, instalasi, arsitektur singkat, batasan, etika, dan mode offline tanpa kunci).
- `.gitignore`: ditambahkan `.aistudio/`.
- Komentar generik di `server.ts`, `src/llm/*`, dan `src/engine/*` diganti dengan istilah domain BK (misalnya klasifikasi keterampilan konseling) tanpa mengubah logika.

### Ditambahkan
- `src/llm/serverGemini.ts` (baru, sisi server): `MISSING_KEY_MESSAGE`, `isLlmConfigured`, `buildThinkingConfig`, dan `buildHealthBody`. Badan health hanya memuat `configured` dan `model`, tanpa kunci.

### Dihapus
- `metadata.json`: dihapus karena tidak dibaca oleh kode mana pun di proyek.

### Tidak berubah
- Endpoint `/api/gemini/health`, `/api/gemini/classify`, dan `/api/gemini/utterance` tetap sama (path, metode, bentuk respons).
- Logika `trust.ts`, `disclosure.ts`, `rupture.ts`, dan mesin simulasi lainnya.

### Tindak lanjut
- `ruang-dengar.zip` dan folder `.aistudio/` dipertahankan dan menunggu keputusan pengguna soal penghapusan (lihat Keputusan 017). `.aistudio/` sudah diabaikan oleh git.
- `vite.config.ts` masih menyisakan jejak templat (komentar dan variabel lingkungan `DISABLE_HMR`). Belum diubah karena di luar cakupan spec ini.

## [Story-Driven Counseling] — Mode Misi Bergaya GTA / Visual Novel
### Ditambahkan
- Mode misi bergaya GTA/visual novel: konselor berjalan di dunia 2D menuju mahasiswa sasaran memakai avatar dengan jalur A*, lalu masuk ke percakapan bercerita lewat `StoryScreen`.
- 15 cerita penuh yang khas per mahasiswa di `src/data/stories/` (termasuk `mhs-12.bk-rencana.ts` dan `mhs-14.bk-eksplorasi.ts`) beserta cerita cadangan di `fallback.ts`, dihimpun lewat `index.ts`.
- Aturan ringkas cerita: tepat 4 pilihan per giliran, teks maksimal 90 karakter, 15–17 giliran per cerita, dan batas pengaman `MAX_STORY_TURNS` = 80.
- Runner cerita (`src/engine/story/runner.ts`) menjalankan ulang aksi Ketegangan yang ditolak sebagai giliran biasa.

### Diubah
- Tab Aksi pada panel konselor diganti menjadi tab Misi.
- Hasil sosiometri seed bawaan bergeser karena bias sosiometri terisolasi sebesar +0,2, yang diterapkan secara terisolasi hanya untuk peran terkait.
- Skrip `npm test` dipakai untuk menjalankan seluruh uji unit.

### Dihapus
- Panel Aksi, `SessionScreen`, `ActionPanel`, `AgentCard`, dan `DaySummaryModal` dihapus dari antarmuka. Salinan cadangan tersimpan di `.kiro/specs/story-driven-counseling/backup-ui-lama/`.

### Revisi 3 (gaya bahasa cerita)
- Ucapan mahasiswa pada 15 cerita di `src/data/stories/` dibuat lebih santai, sedangkan pilihan Dosen sopan-luwes. Opsi terbaik tetap tepat secara keterampilan BK. Hanya teks cerita yang berubah, tanpa perubahan mesin atau dependensi.

## [Daftar Karakter dan Visual Mahasiswa] — Karakter Pixel Art Prosedural (spec `character-roster-visuals`)

### Ditambahkan
- Layar **Daftar Karakter** (`src/ui/screens/CharacterRosterScreen.tsx`, `RosterCard.tsx`) berupa grid 15 kartu (5/3/2 kolom responsif) di antara Layar Awal dan simulasi. Tiap kartu memuat potret, nomor, nama, gaya khas, sprite kecil, dua label minat teratas, dan latar sesuai zona awal. Tombol Lanjut, Kembali, dan Pengaturan tersedia; Enter memicu Lanjut dan Escape memicu Kembali.
- Modul murni di `src/ui/characters/`: palet (`characterPalette.ts`), peta penampilan 15 mahasiswa (`appearance.ts`), penyusun sprite tiga lapisan (`spriteParts.ts`, `spriteCompose.ts`), pemilih arah dan frame (`animation.ts`), potret dan 11 ekspresi (`portraitExpressions.ts`, `portraitCompose.ts`), teks alternatif (`altText.ts`), label minat dan latar kartu (`interestLabels.ts`, `cardBackdrop.ts`), serta model roster (`rosterModel.ts`).
- Penggambar berkanvas `spriteCanvas.ts` (cache kanvas luar layar 2×) dan komponen `PixelPortrait.tsx`.
- **Slot aset opsional** `assetSlots.ts`: bila `public/assets/characters/manifest.json` dan gambarnya tersedia, aplikasi memakainya; bila tidak, memakai gambar prosedural tanpa pesan galat. Repositori tetap membawa 0 berkas gambar (cara pakai di `docs/ASSETS.md`).
- Glob uji `src/ui/characters/*.test.ts` dan `src/ui/screens/*.test.ts` pada skrip `test`.

### Diubah
- `AppScreen` menjadi `'start' | 'roster' | 'simulation'`. Tombol Mulai membuka Daftar Karakter, Lanjut membuka simulasi. `?autostart=1` tetap langsung ke simulasi.
- `src/ui/canvas/agentRenderer.ts` menggambar mahasiswa sebagai sprite 16×24 beranimasi (idle dan jalan, 4 arah) menggantikan bahu dan kepala berbentuk lingkaran. Indikator status, label nama, dan seleksi dipertahankan; area klik disesuaikan dengan tinggi sprite. `SimulationScreen.tsx` meneruskan waktu dan `reducedMotion` ke renderer.
- `StoryPortrait.tsx` dan `StoryScreen.tsx`: potret mahasiswa memakai `PixelPortrait` (80×96, 11 ekspresi). Potret Dosen BK tetap SVG lama.
- `src/data/strings.ts`: blok `roster` ditambahkan.

### Tidak berubah
- Logika `trust.ts`, `disclosure.ts`, `rupture.ts`, teks dan struktur cerita, serta data mahasiswa di `agents.seed.ts`.
- Tidak ada dependensi baru.
## [Perombakan Visual UI] — Pixel Art, Gaya Visual Novel, dan Dosen BK (spec `ui-visual-overhaul`)
### Ditambahkan
- Denah lab sebagai tilemap pixel art (`src/ui/world/`): tema lantai per zona, dinding bermuka dan berjendela, pintu Konsultasi per mode, 13 jenis perabot, dekor deterministik, cache kanvas luar layar, font piksel 5×7, plakat zona, balon ucapan (maksimal 4), dan kamera yang dapat mengikuti avatar (tombol Ikuti Avatar).
- Latar adegan pixel art 192×108 untuk 10 adegan dengan varian pagi dan sore (`src/ui/scene/`).
- Dosen BK pixel art: potret 80×96 dengan 11 ekspresi dan sprite 16×24 (`src/ui/characters/dosenLook.ts`, `dosenPortrait.ts`, `dosenSprite.ts`, `characterArt.ts`). Slot aset opsional memakai id `dosen` (lihat `docs/ASSETS.md`).
- Layar cerita bergaya visual novel: panel kiri daftar 15 mahasiswa, panel kanan kartu profil (tab Profil, Jadwal, Riwayat, Relasi) yang hanya memuat data permukaan, kotak dialog dan pilihan bergaya game, serta ikon `GameIcons.tsx`.
- Penata Daftar Karakter ringkas `rosterLayout.ts`, palet VN (`vnPalette.ts`) dan token `--vn-*`, penulis PNG tanpa dependensi `scripts/pngEncoder.ts`, dan kunci teks Bahasa Indonesia baru di `src/data/strings.ts`.
- Pratinjau PNG di `docs/ui-preview/` (tilemap kedua mode pintu, semua latar adegan, ekspresi dan sprite Dosen, potret mahasiswa, mockup cerita, dan wireframe Daftar Karakter pada 1280×720, 1366×768, dan 360×640).
- Glob uji `src/ui/world/*.test.ts`, `src/ui/scene/*.test.ts`, `src/ui/canvas/*.test.ts`, dan `scripts/*.test.ts` pada skrip `test`.
### Diubah
- `labRenderer.ts`, `agentRenderer.ts`, dan `storyLayer.ts`: latar tilemap, sprite 48×72 piksel dunia dengan urutan gambar menurut y, avatar Dosen bersprite, dan hit-test klik yang mengikuti ukuran sprite baru.
- `StoryScreen.tsx` dan `StoryPortrait.tsx`: tata letak visual novel; potret Dosen memakai `PixelPortrait` (id `dosen`), bukan SVG lama.
- `CharacterRosterScreen.tsx` dan `RosterCard.tsx`: kartu lanskap ringkas agar 15 kartu muat satu layar laptop.
- `SimulationScreen.tsx`: kamera awal lebih dekat, bilah atas dan tab bertema game tanpa mengubah `role`, `aria-label`, urutan tab, atau pintasan.
- `PixelPortrait.tsx` dan `spriteCanvas.ts` memakai `composePortraitFor` dan `composeSpriteFor`.
### Tidak berubah
- Logika `trust.ts`, `disclosure.ts`, dan `rupture.ts`, `src/data/map.ts`, pathfinding, serta teks dan struktur cerita di `src/data/stories/`.
- `STORY_PALETTE` dan token `--ui-*`.
- Tidak ada dependensi baru. Repositori tetap membawa 0 berkas gambar aset; PNG di `docs/ui-preview/` hanya pratinjau.

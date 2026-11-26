# RUANG DENGAR — FRAME PRODUCTION TRACKER

Metode produksi: **ONE FRAME AT A TIME — MULTI-STAGE PRODUCTION — QUALITY GATE**  
Referensi identitas karakter utama: `public/assets/characters/mhs-01-portrait.png` (Raka Pratama) dan database `src/data/agents.seed.ts`.

---

## Ringkasan Progres Frame

| Scene ID | Frame ID | Jenis | Deskripsi Adegan | Karakter | Action | Asset References | Generation Status | Revision Status | QC Status | File Path |
|---|---|---|---|---|---|---|---|---|---|---|
| SCENE 01 | FRAME 01 | KEYFRAME | Raka berada di koridor luar gedung laboratorium pagi hari dan mulai berjalan menuju pintu kaca utama | Raka Pratama (`mhs-01`) | Walking approach (Left Contact) | `public/assets/characters/mhs-01-portrait.png`, `public/assets/scenes/diskusi.png` | BLOCKED (HTTP 429 QUOTA) | PENDING | NEEDS REVISION | `public/assets/frames/scene-01/frame_01.png` (belum terbuat) |
| SCENE 01 | FRAME 02 | IN-BETWEEN | Raka semakin dekat dengan pintu kaca laboratorium | Raka Pratama (`mhs-01`) | Walking passing | `FRAME 01`, `mhs-01-portrait.png` | NOT STARTED | - | NOT STARTED | `public/assets/frames/scene-01/frame_02.png` |
| SCENE 01 | FRAME 03 | KEYFRAME | Raka berhenti tepat di depan pintu kaca utama | Raka Pratama (`mhs-01`) | Stopping & looking at door | `FRAME 02`, `mhs-01-portrait.png` | NOT STARTED | - | NOT STARTED | `public/assets/frames/scene-01/frame_03.png` |
| SCENE 02 | FRAME 04 | IN-BETWEEN | Raka mengangkat tangan kanan untuk meraih gagang pintu | Raka Pratama (`mhs-01`) | Reach hand toward handle | `FRAME 03`, `mhs-01-portrait.png` | NOT STARTED | - | NOT STARTED | `public/assets/frames/scene-02/frame_04.png` |
| SCENE 02 | FRAME 05 | KEYFRAME | Close-up tangan kanan Raka menyentuh & menggenggam gagang pintu baja | Raka Pratama (`mhs-01`) | Grip door handle | `FRAME 04`, `mhs-01-portrait.png` | NOT STARTED | - | NOT STARTED | `public/assets/frames/scene-02/frame_05.png` |
| SCENE 02 | FRAME 06 | IN-BETWEEN | Raka mulai menekan/memutar gagang pintu hingga kait terbuka | Raka Pratama (`mhs-01`) | Press handle (KLIK!) | `FRAME 05` | NOT STARTED | - | NOT STARTED | `public/assets/frames/scene-02/frame_06.png` |
| SCENE 02 | FRAME 07 | KEYFRAME | Daun pintu kaca mulai terbuka, cahaya dalam laboratorium terlihat | Raka Pratama (`mhs-01`) | Door opening (SWOOSH!) | `FRAME 06` | NOT STARTED | - | NOT STARTED | `public/assets/frames/scene-02/frame_07.png` |
| SCENE 02 | FRAME 08 | IN-BETWEEN | Raka mulai melangkah masuk melewati ambang pintu | Raka Pratama (`mhs-01`) | Step through entrance | `FRAME 07`, `mhs-01-portrait.png` | NOT STARTED | - | NOT STARTED | `public/assets/frames/scene-02/frame_08.png` |
| SCENE 02 | FRAME 09 | IN-BETWEEN | Raka sudah melewati pintu dan memasuki area koridor dalam | Raka Pratama (`mhs-01`) | Entering corridor | `FRAME 08`, `mhs-01-portrait.png` | NOT STARTED | - | NOT STARTED | `public/assets/frames/scene-02/frame_09.png` |
| SCENE 02 | FRAME 10 | KEYFRAME | Raka berada di dalam laboratorium dan menoleh ramah melihat aktivitas mahasiswa | Raka Pratama (`mhs-01`) | Turning & looking around | `FRAME 09`, `mhs-01-portrait.png` | NOT STARTED | - | NOT STARTED | `public/assets/frames/scene-02/frame_10.png` |

---

## Detail Perencanaan Aktif — FRAME 01 (SUBSTAGE A — VISUAL PLANNING)

- **Scene / Frame**: `SCENE 01 — FRAME 01` (*KEYFRAME*)
- **Adegan**: Pagi hari cerah di selasar luar Gedung Laboratorium Elektronika & IoT. Raka mulai melangkah menuju pintu kaca ganda di depan.
- **Karakter**: **Raka Pratama (`mhs-01`)** — identitas terkunci dari `public/assets/characters/mhs-01-portrait.png` (rambut hitam pendek agak berlayer, mata cokelat tua hangat, kulit sawo matang cerah, jaket/blazer biru navy berlogo merah-emas di dada kiri, kemeja putih berkerah, tali tas selempang abu-abu gelap bersabuk logam menyilang di dada, celana krem rapi, sepatu sneakers cokelat-marun).
- **Aktivitas & Posisi Tubuh**: Berjalan maju dengan pose *Left Contact* (kaki kiri melangkah ke depan menyentuh lantai keramik selasar, kaki kanan mendorong di belakang, tubuh sedikit condong ke depan 5°, bahu rileks natural).
- **Ekspresi Wajah**: Senyum tenang penuh semangat pagi, tatapan mata mengarah ke pintu masuk laboratorium di kanan-depan.
- **Posisi Tangan**: Tangan kanan memegang tali tas selempang di dada dengan 5 jari natural; tangan kiri mengayun ringan ke belakang seirama langkah kaki kiri.
- **Posisi Kaki**: Kedua kaki utuh dari pinggul, lutut, betis, pergelangan kaki hingga sepatu sneakers menyentuh lantai ubin selasar dengan bayangan kontak jelas.
- **Sudut Kamera**: *Medium-Full Three-Quarter Tracking Shot* setinggi dada (`eye-to-chest level`), ruang negatif di sisi kanan mengarah ke pintu kaca laboratorium.
- **Background & Objek**: Selasar gedung laboratorium 2D anime berdetail tinggi — lantai ubin keramik abu-hangat, dinding kaca laboratorium yang memperlihatkan siluet meja elektronika di dalam, pot tanaman hijau di sisi koridor, papan nama `"LABORATORIUM ELEKTRONIKA & IoT"`, dan pintu kaca ganda dengan gagang baja di sisi kanan.
- **Lighting**: Cahaya matahari pagi keemasan (07.15 WIB) masuk diagonal dari sisi kiri-atas, menciptakan *rim light* hangat di rambut dan bahu Raka serta bayangan lembut memanjang ke kanan-bawah.
- **Hubungan dengan Frame Berikutnya**: Menjadi *anchor* komposisi lingkungan, skala karakter, arah cahaya, dan awal langkah menuju `FRAME 02` (posisi Raka lebih dekat ke pintu kaca).

## Log Substage B — First Generation (`FRAME 01`)
- **Status**: `BLOCKED (HTTP 429 RESOURCE_EXHAUSTED)` — kuota model generasi gambar AI pada lingkungan ini habis (*reset dalam ~79 jam 3 menit*).
- **Tindakan sesuai Aturan Produksi #8 & #9**: Tidak membuat placeholder, tidak menandai `APPROVED`, dan menghentikan pengerjaan pada `FRAME 01` hingga gambar final tersedia untuk masuk ke **SUBSTAGE C (Anatomy & Detail Refinement)**, **SUBSTAGE D (Continuity Check)**, dan **SUBSTAGE E (Final Quality Gate)**.

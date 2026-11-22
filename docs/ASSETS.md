# Catatan Aset Eksternal (`docs/ASSETS.md`)

Sesuai Aturan Permanen #3 pada proyek **RUANG DENGAR**, aplikasi menargetkan **0% aset eksternal**.

## Status Saat Ini
- **Gambar / Sprite Eksternal:** Tidak ada (0 berkas). Seluruh ilustrasi antarmuka dan dunia 2D laboratorium digambar secara prosedural melalui HTML5 Canvas 2D (`/src/ui/canvas/labRenderer.ts`) dan inline SVG (`/src/ui/components/Icons.tsx`).
- **Ikon Pihak Ketiga:** Tidak digunakan. Seluruh ikon fungsional dibuat manual menggunakan SVG inline.
- **Font Eksternal:** Tidak digunakan. Aplikasi memakai *system font stack* (`ui-sans-serif`, `system-ui`, `ui-monospace`) agar ringan dan berjalan penuh tanpa koneksi internet.
- **Audio / Video Eksternal:** Tidak ada.

## Slot Aset Karakter Opsional (spec `character-roster-visuals`)

Karakter mahasiswa digambar secara prosedural dari kode (sprite dunia 16×24 dan potret 80×96). Jumlah berkas gambar bawaan repositori tetap **0**. Anda dapat menimpa gambar prosedural dengan gambar sendiri lewat slot aset berikut. Slot ini sepenuhnya opsional.

### Cara memakai
1. Letakkan gambar di `public/assets/characters/mhs-XX/` (misalnya `public/assets/characters/mhs-04/portrait.png`).
2. Daftarkan di `public/assets/characters/manifest.json`. Bila berkas ini tidak ada, aplikasi memakai gambar prosedural.
3. Muat ulang aplikasi. Aset diperiksa per mahasiswa dan per jenis: potret aset tidak memaksa sprite aset, dan sebaliknya.

### Format `manifest.json`
```json
{
  "version": 1,
  "characters": {
    "mhs-04": {
      "portrait": "mhs-04/portrait.png",
      "sprite": "mhs-04/sprite.png",
      "cell": { "w": 16, "h": 24 },
      "expressions": { "tersenyum": "mhs-04/tersenyum.png" }
    }
  }
}
```
- `portrait` (opsional): potret setengah badan, dipakai di StoryScreen dan kartu roster.
- `sprite` (opsional): sprite sheet untuk dunia 2D.
- `cell` (opsional): ukuran satu sel sprite sheet; bawaan 16×24.
- `expressions` (opsional): potret khusus per ekspresi cerita. Kunci sah: netral, waspada, menunduk, cemas, lega, tersenyum, lelah, kesal, terkejut, tertegun, menutup-diri. Tanpa ini, potret aset statis dipakai dengan variasi ringan.
- Nama berkas relatif terhadap `public/assets/characters/`. Nama yang memuat `..`, `\`, atau skema URL ditolak.

### Tata letak sprite sheet
- 6 kolom: kolom 0–1 idle (2 frame), kolom 2–5 jalan (4 frame).
- 4 baris: baris 0 menghadap bawah, 1 kiri, 2 kanan, 3 atas.
- Ukuran sel mengikuti `cell` (bawaan 16×24).

### Perilaku cadangan
Aset dipakai hanya bila manifest sah, id terdaftar, dan gambar berhasil dimuat. Manifest yang hilang, rusak, atau berupa HTML (fallback SPA) dianggap tidak ada. Dalam semua kasus itu aplikasi kembali ke gambar prosedural tanpa pesan galat.


### Slot Dosen BK (id `dosen`)

Dosen BK memakai id khusus `dosen` pada slot aset yang sama dengan mahasiswa (spec `ui-visual-overhaul`). Letakkan gambar di `public/assets/characters/dosen/` (misalnya `portrait.png` dan `sprite.png`) dan daftarkan di `manifest.json` dengan kunci `dosen` di bawah `characters`, memakai format entri yang sama dengan `mhs-XX`. Tata letak sprite sheet dan perilaku cadangan juga sama. Tanpa entri `dosen`, atau bila gambarnya gagal dimuat, aplikasi memakai Dosen prosedural bawaan (ciri-cirinya ada di tabel `DOSEN_LOOK`, `src/ui/characters/dosenLook.ts`). Pratinjau gambar prosedural ada di `docs/ui-preview/`.

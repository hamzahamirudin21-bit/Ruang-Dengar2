# Panduan Produksi Aset Visual Studio — Ruang Dengar (Juara 1 Nasional)

## Status Aset Saat Ini
- ✅ **16 / 16 (100%) Potret Percakapan VN Anime Cel-Shaded Tajam SELESAI & TERPASANG!**
  Seluruh karakter (`dosen` Ibu Dosen BK + `mhs-01` s.d. `mhs-15`) sudah memiliki potret berdiri transparan `480×600` bergaya *Captain Tsubasa (2018) / Persona 5 / Blue Archive* tanpa kotak foto di `public/assets/characters/` dan terdaftar penuh di `public/assets/characters/manifest.json`.
- ✅ **16 / 16 (100%) Miniatur Peta 2D HD 2.5D Anime SD SELESAI & TERPASANG!**
  Seluruh karakter (`dosen` Ibu Dosen BK + `mhs-01` s.d. `mhs-15`) sudah memiliki sprite sheet `6×4` (`96×144` per sel, 4 arah × 6 frame, nol morphing) bergaya *Blue Archive / Nendoroid* di `public/assets/characters/` dan terdaftar penuh di `public/assets/characters/manifest.json`.
- ✅ **Latar Ruangan Anime HD (`src/ui/scene/paintedScene.ts`)**:
  Pelukis Canvas 2D HD `960×540` sudah aktif di seluruh layar, dan mendukung penggantian otomatis bila berkas PNG opsional diletakkan di `public/assets/scenes/` lewat `scripts\importAllStudioAssets.ps1`.

---

## Opsional: Prompt Latar Ruangan Anime HD 16:9 (Tanpa Manusia)
Jika ingin menambahkan gambar latar ruangan lukisan raster di `raw-assets/` lalu menjalankan `powershell -ExecutionPolicy Bypass -File scripts\importAllStudioAssets.ps1`:

### 1. `raw-assets/scene-ruang-bk.jpg` (Ruang Konsultasi BK)
```text
High-budget modern Japanese anime visual novel background illustration (Makoto Shinkai / Blue Archive / A Space for the Unbound style), warm sunlit Indonesian university counseling room interior, NO characters, NO people. Large sunlit window with soft cream sheer curtains showing blue campus sky and green trees outside, warm golden morning sunbeams slanted across wooden flooring, cozy wooden bookshelf filled with psychology books, calm framed landscape art on warm cream plaster wall, potted indoor monstera plant, warm acoustic wood wainscoting, peaceful safe atmosphere. Crisp painterly anime lighting, clean composition with open foreground space for visual novel sprites. 16:9 widescreen.
```

### 2. `raw-assets/scene-lab-elektronik.jpg` (Lab Elektronika, IoT & Pemrograman)
```text
High-budget modern Japanese anime visual novel background illustration (Makoto Shinkai / Blue Archive style), bright modern Indonesian vocational university electronics and robotics laboratory interior, NO characters, NO people. Wide campus windows letting in bright daylight over green campus trees, clean whiteboards with neat circuit diagrams and pastel sticky notes, lab workbenches with glowing cyan oscilloscopes, microcontroller kits, neatly organized wooden/metal tool shelves, warm sunlight rays, clean atmospheric depth of field. Open foreground space for visual novel characters. 16:9 widescreen.
```

### 3. `raw-assets/scene-lab-umum.jpg` (Lab Umum / Workshop / Cetak 3D / Istirahat)
```text
High-budget modern Japanese anime visual novel background illustration (Makoto Shinkai / Blue Archive style), sunlit Indonesian vocational polytechnic makerspace and design workshop studio interior, NO characters, NO people. Tall industrial-modern campus windows with bright sky and leafy trees outside, neat wooden workbench with 3D printer and prototype models in background, organized tool pegboard, cork bulletin board with campus posters, potted plant by the window, warm golden-hour natural sunlight streaming inside. Clean anime painterly detail, open foreground space for visual novel sprites. 16:9 widescreen.
```

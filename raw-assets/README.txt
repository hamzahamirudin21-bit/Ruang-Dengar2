Letakkan sisa lembar gambar studio di folder ini sesuai panduan di docs/STUDIO-ASSET-PROMPTS.md:
- lineup-wave2.jpg (atau .png) -> mhs-04..07 (Potret VN 16:9)
- lineup-wave3.jpg (atau .png) -> mhs-08..11 (Potret VN 16:9)
- lineup-wave4.jpg (atau .png) -> mhs-12..15 (Potret VN 16:9)
- sd-wave2.jpg (atau .png)     -> mhs-04..07 (Miniatur HD 2.5D SD 4x3)
- sd-wave3.jpg (atau .png)     -> mhs-08..11 (Miniatur HD 2.5D SD 4x3)
- sd-wave4.jpg (atau .png)     -> mhs-12..15 (Miniatur HD 2.5D SD 4x3)
- scene-ruang-bk.jpg           -> Latar Ruang Konsultasi BK (16:9)
- scene-lab-elektronik.jpg     -> Latar Lab Elektronika & Pemrograman (16:9)
- scene-lab-umum.jpg           -> Latar Lab Umum / Workshop / Cetak 3D (16:9)

Lalu jalankan di PowerShell dari akar proyek:
  powershell -ExecutionPolicy Bypass -File scripts\importAllStudioAssets.ps1

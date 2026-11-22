param(
  [string]$RawDir = (Join-Path (Split-Path -Parent $PSScriptRoot) "raw-assets")
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$slicer = Join-Path $PSScriptRoot "sliceStudioSheets.ps1"
$charDir = Join-Path $root "public\assets\characters"
$sceneDir = Join-Path $root "public\assets\scenes"
$qaDir = Join-Path $RawDir "qa"

New-Item -ItemType Directory -Force -Path $charDir | Out-Null
New-Item -ItemType Directory -Force -Path $sceneDir | Out-Null

function Find-RawFile([string]$baseName) {
  foreach ($ext in @(".png", ".jpg", ".jpeg", ".webp")) {
    $candidate = Join-Path $RawDir ($baseName + $ext)
    if (Test-Path $candidate) { return $candidate }
  }
  return $null
}

$processed = 0

# 1. Portrait Lineups (4 characters per sheet -> 480x600 transparent PNGs)
$lineups = @(
  @{ Name = "lineup-wave1"; Ids = @("dosen","mhs-01","mhs-02","mhs-03"); Flip = "0,0,1,0" },
  @{ Name = "lineup-wave2"; Ids = @("mhs-04","mhs-05","mhs-06","mhs-07"); Flip = "0,0,0,0" },
  @{ Name = "lineup-wave3"; Ids = @("mhs-08","mhs-09","mhs-10","mhs-11"); Flip = "0,0,0,0" },
  @{ Name = "lineup-wave4"; Ids = @("mhs-12","mhs-13","mhs-14","mhs-15"); Flip = "0,0,0,0" }
)
foreach ($item in $lineups) {
  $src = Find-RawFile $item.Name
  if ($src) {
    $outs = @($item.Ids | ForEach-Object { Join-Path $charDir ("$_-portrait.png") })
    $qa = Join-Path $qaDir ($item.Name + "-qa.png")
    Write-Host "Slicing $($item.Name) from $src ..."
    & $slicer -Mode lineup4 -Src $src -Out $outs -Width 480 -Height 600 -Flip $item.Flip -ContactOut $qa
    $processed++
  }
}

# 2. HD 2.5D Anime SD Turnaround Grids (4 rows x 3..5 cols -> 96x144 per cell, 6x4 sheets)
$sdSheets = @(
  @{ Name = "sd-wave1"; Ids = @("dosen","mhs-01","mhs-02","mhs-03") },
  @{ Name = "sd-wave2"; Ids = @("mhs-04","mhs-05","mhs-06","mhs-07") },
  @{ Name = "sd-wave3"; Ids = @("mhs-08","mhs-09","mhs-10","mhs-11") },
  @{ Name = "sd-wave4"; Ids = @("mhs-12","mhs-13","mhs-14","mhs-15") }
)
foreach ($item in $sdSheets) {
  $src = Find-RawFile $item.Name
  if ($src) {
    $outs = @($item.Ids | ForEach-Object { Join-Path $charDir ("$_-sprite.png") })
    $qa = Join-Path $qaDir ($item.Name + "-qa.png")
    Write-Host "Slicing $($item.Name) from $src ..."
    & $slicer -Mode sdgrid4x3 -Src $src -Out $outs -Width 96 -Height 144 -ContactOut $qa
    $processed++
  }
}

# 3. Painted Anime Scenes (1280x720 PNGs wired into paintedScene.ts automatically)
$sceneMap = @(
  @{ Name = "scene-ruang-bk";         Targets = @("ruang-bk-pagi.png","ruang-bk-sore.png","istirahat-pagi.png","istirahat-sore.png") },
  @{ Name = "scene-lab-elektronik";   Targets = @("elektronik-pagi.png","elektronik-sore.png","pemrograman-pagi.png","pemrograman-sore.png") },
  @{ Name = "scene-lab-umum";         Targets = @("lab-umum-pagi.png","lab-umum-sore.png","cetak-3d-pagi.png","cetak-3d-sore.png","las-pagi.png","las-sore.png") }
)
foreach ($sc in $sceneMap) {
  $src = Find-RawFile $sc.Name
  if ($src) {
    foreach ($t in $sc.Targets) {
      $dst = Join-Path $sceneDir $t
      & $slicer -Mode scene -Src $src -Out @($dst) -Width 1280 -Height 720
    }
    $processed++
  }
}

# 4. Rebuild public/assets/characters/manifest.json cleanly from every existing character PNG
$allIds = @("dosen") + (1..15 | ForEach-Object { "mhs-{0:d2}" -f $_ })
$chars = [ordered]@{}
foreach ($id in $allIds) {
  $pFile = "$id-portrait.png"
  $sFile = "$id-sprite.png"
  $hasP = Test-Path (Join-Path $charDir $pFile)
  $hasS = Test-Path (Join-Path $charDir $sFile)
  if ($hasP -or $hasS) {
    $entry = [ordered]@{}
    if ($hasP) { $entry["portrait"] = $pFile }
    if ($hasS) {
      $entry["sprite"] = $sFile
      $entry["cell"] = [ordered]@{ w = 96; h = 144 }
    }
    $chars[$id] = $entry
  }
}

$manifest = [ordered]@{
  version = 1
  characters = $chars
}
$manifestPath = Join-Path $charDir "manifest.json"
$manifest | ConvertTo-Json -Depth 5 | Set-Content -Path $manifestPath -Encoding UTF8

Write-Host "Selesai! Diproses: $processed berkas baru. Total karakter di manifest.json: $($chars.Count)/16."
if ($processed -eq 0) {
  Write-Host "Tip: Letakkan gambar hasil generate di '$RawDir' sesuai nama di docs/STUDIO-ASSET-PROMPTS.md lalu jalankan ulang skrip ini."
}

param(
  [string]$CharactersRoot = (Join-Path $PSScriptRoot "..\public\assets\characters"),
  [string]$AnimeRoot = (Join-Path $PSScriptRoot "..\public\assets\anime-characters")
)

$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$csharp = @'
using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;

public static class AnimeFullBodySynthesizer {
    private static Color Darken(Color c, float f) {
        return Color.FromArgb(c.A, Math.Max(0, (int)(c.R * f)), Math.Max(0, (int)(c.G * f)), Math.Max(0, (int)(c.B * f)));
    }

    private static void DrawFullBodyStanding(
        Graphics g,
        Bitmap upperPortrait,
        int canvasW,
        int canvasH,
        string bottomType,
        Color bottomCol,
        Color shoeCol,
        float stridePhaseRad,
        float breathDy,
        float bodyTiltDeg,
        float headNodDy,
        string exprId,
        int mouthLevel // 0=closed, 1=mid, 2=open
    ) {
        g.SmoothingMode = SmoothingMode.AntiAlias;
        g.InterpolationMode = InterpolationMode.HighQualityBicubic;
        g.PixelOffsetMode = PixelOffsetMode.HighQuality;

        Color bottomShade = Darken(bottomCol, 0.78f);
        Color shoeShade = Darken(shoeCol, 0.78f);
        Color ink = Color.FromArgb(242, 24, 20, 28);

        // Anchor di bottom-center (canvasW/2, canvasH - 12)
        float cx = canvasW * 0.5f;
        float footY = canvasH - 18f;
        float hipY = footY - 242f + breathDy;

        var st = g.Save();
        g.TranslateTransform(cx, footY);
        g.RotateTransform(bodyTiltDeg);
        g.TranslateTransform(-cx, -footY);

        // 1. KAKI PENUH ANATOMIS TERSAMBUNG RAPI DARI PINGGUL KE SEPATU (tanpa celah sambungan)
        float s = (float)Math.Sin(stridePhaseRad);
        float c = (float)Math.Cos(stridePhaseRad);
        float leftShiftX = -32f + s * 22f;
        float rightShiftX = 32f - s * 22f;
        float leftLift = Math.Max(0f, c) * 14f;
        float rightLift = Math.Max(0f, -c) * 14f;

        Action<float, float, float, Color, Color> drawLeg = (hipOffX, ankleOffX, liftY, legFill, shFill) => {
            float hx = cx + hipOffX;
            float ax = cx + ankleOffX;
            float ay = footY - 14f - liftY;
            float kx = (hx + ax) * 0.5f + (ankleOffX - hipOffX) * 0.12f;
            float ky = (hipY + ay) * 0.5f;

            // Paha & Betis menyatu mulus dengan overlap sendi lutut
            using (var legInk = new Pen(ink, 52f) { StartCap = LineCap.Round, EndCap = LineCap.Round, LineJoin = LineJoin.Round })
            using (var legMain = new Pen(legFill, 44f) { StartCap = LineCap.Round, EndCap = LineCap.Round, LineJoin = LineJoin.Round })
            using (var legInner = new Pen(Darken(legFill, 0.86f), 16f) { StartCap = LineCap.Round, EndCap = LineCap.Round }) {
                PointF[] pts = { new PointF(hx, hipY - 16f), new PointF(kx, ky), new PointF(ax, ay) };
                g.DrawLines(legInk, pts);
                g.DrawLines(legMain, pts);
                g.DrawLines(legInner, pts);
            }

            // Sepatu proporsional
            using (var shBrush = new SolidBrush(shFill))
            using (var shPen = new Pen(ink, 3.2f))
            using (var soleBrush = new SolidBrush(Color.FromArgb(248, 250, 252))) {
                var shoeRect = new RectangleF(ax - 24f, ay - 6f, 52f, 24f);
                g.FillEllipse(shBrush, shoeRect);
                g.DrawEllipse(shPen, shoeRect);
                g.FillRectangle(soleBrush, ax - 20f, ay + 12f, 44f, 5f);
            }
        };

        // Kaki belakang lalu kaki depan
        drawLeg(-28f, leftShiftX, leftLift, bottomShade, shoeShade);
        drawLeg(28f, rightShiftX, rightLift, bottomCol, shoeCol);

        // Jika karakter memakai rok, gambar siluet rok menyatu di pinggul
        if (bottomType == "rok") {
            PointF[] skirt = {
                new PointF(cx - 76f, hipY - 26f),
                new PointF(cx + 76f, hipY - 26f),
                new PointF(cx + 96f, hipY + 112f),
                new PointF(cx - 96f, hipY + 112f)
            };
            using (var skBrush = new SolidBrush(bottomCol))
            using (var skPen = new Pen(ink, 3.4f) { LineJoin = LineJoin.Round }) {
                g.FillPolygon(skBrush, skirt);
                g.DrawPolygon(skPen, skirt);
            }
        }

        // 2. TUBUH ATAS & WAJAH ANIME ASLI (480x600) MENYATU LANGSUNG DI ATAS PINGGUL
        float upperW = 420f;
        float upperH = 525f;
        float upperX = cx - upperW * 0.5f;
        float upperY = hipY - upperH + 34f + headNodDy;
        g.DrawImage(upperPortrait, upperX, upperY, upperW, upperH);

        // 3. OVERLAY EKSPRESI WAJAH & MULUT LIP-SYNC
        float faceCx = cx;
        float eyeY = upperY + upperH * 0.255f;
        float browY = upperY + upperH * 0.222f;
        float cheekY = upperY + upperH * 0.292f;
        float mouthY = upperY + upperH * 0.312f;

        using (var inkPen = new Pen(ink, 2.8f) { StartCap = LineCap.Round, EndCap = LineCap.Round })
        using (var blushBrush = new SolidBrush(Color.FromArgb(90, 244, 114, 132)))
        using (var sweatBrush = new SolidBrush(Color.FromArgb(225, 125, 211, 252)))
        using (var sparkBrush = new SolidBrush(Color.FromArgb(235, 253, 224, 71))) {
            if (exprId == "happy" || exprId == "laughing" || exprId == "excited" || exprId == "shy" || exprId == "reassuring") {
                g.FillEllipse(blushBrush, faceCx - 46f, cheekY, 22f, 9f);
                g.FillEllipse(blushBrush, faceCx + 24f, cheekY, 22f, 9f);
            }
            if (exprId == "laughing") {
                using (var archPen = new Pen(ink, 3.4f) { StartCap = LineCap.Round, EndCap = LineCap.Round }) {
                    g.DrawArc(archPen, faceCx - 38f, eyeY - 10f, 24f, 14f, 195, 150);
                    g.DrawArc(archPen, faceCx + 14f, eyeY - 10f, 24f, 14f, 195, 150);
                }
            }
            if (exprId == "curious" || exprId == "confused" || exprId == "surprised") {
                g.DrawLine(inkPen, faceCx - 38f, browY - 4f, faceCx - 14f, browY - 10f);
                g.DrawLine(inkPen, faceCx + 14f, browY - 10f, faceCx + 38f, browY - 4f);
            } else if (exprId == "worried" || exprId == "sad" || exprId == "tired") {
                g.DrawLine(inkPen, faceCx - 38f, browY + 3f, faceCx - 14f, browY - 4f);
                g.DrawLine(inkPen, faceCx + 14f, browY - 4f, faceCx + 38f, browY + 3f);
            } else if (exprId == "frustrated" || exprId == "serious" || exprId == "confident") {
                g.DrawLine(inkPen, faceCx - 38f, browY - 4f, faceCx - 14f, browY + 3f);
                g.DrawLine(inkPen, faceCx + 14f, browY + 3f, faceCx + 38f, browY - 4f);
            }
            if (exprId == "excited") {
                PointF[] star = {
                    new PointF(faceCx + 68f, eyeY - 30f), new PointF(faceCx + 72f, eyeY - 20f),
                    new PointF(faceCx + 82f, eyeY - 16f), new PointF(faceCx + 72f, eyeY - 12f),
                    new PointF(faceCx + 68f, eyeY - 2f),  new PointF(faceCx + 64f, eyeY - 12f),
                    new PointF(faceCx + 54f, eyeY - 16f), new PointF(faceCx + 64f, eyeY - 20f)
                };
                g.FillPolygon(sparkBrush, star);
                g.DrawPolygon(inkPen, star);
            }
            if (exprId == "confused" || exprId == "worried" || exprId == "tired" || exprId == "frustrated") {
                float sx = faceCx + 54f;
                float sy = eyeY - 14f;
                using (var dp = new GraphicsPath()) {
                    dp.AddBezier(sx, sy - 8f, sx + 7f, sy + 2f, sx + 6f, sy + 10f, sx, sy + 10f);
                    dp.AddBezier(sx, sy + 10f, sx - 6f, sy + 10f, sx - 7f, sy + 2f, sx, sy - 8f);
                    g.FillPath(sweatBrush, dp);
                    g.DrawPath(inkPen, dp);
                }
            }
            if (mouthLevel > 0) {
                float mh = mouthLevel == 2 ? 12f : 7f;
                float mw = mouthLevel == 2 ? 18f : 14f;
                using (var mb = new SolidBrush(Color.FromArgb(230, 159, 18, 57))) {
                    g.FillEllipse(mb, faceCx - mw * 0.5f, mouthY - mh * 0.5f, mw, mh);
                    g.DrawEllipse(inkPen, faceCx - mw * 0.5f, mouthY - mh * 0.5f, mw, mh);
                }
            }
        }

        g.Restore(st);
    }

    public static void RenderFrameToPng(
        string srcPortraitPath,
        string destPngPath,
        string bottomType,
        string bottomHex,
        string shoeHex,
        float stridePhaseRad,
        float breathDy,
        float bodyTiltDeg,
        float headNodDy,
        string exprId,
        int mouthLevel
    ) {
        using (var src = new Bitmap(srcPortraitPath))
        using (var outBmp = new Bitmap(480, 760, PixelFormat.Format32bppArgb))
        using (var g = Graphics.FromImage(outBmp)) {
            g.Clear(Color.Transparent);
            DrawFullBodyStanding(
                g, src, 480, 760,
                bottomType,
                ColorTranslator.FromHtml(bottomHex),
                ColorTranslator.FromHtml(shoeHex),
                stridePhaseRad, breathDy, bodyTiltDeg, headNodDy, exprId, mouthLevel
            );
            Directory.CreateDirectory(Path.GetDirectoryName(destPngPath));
            outBmp.Save(destPngPath, ImageFormat.Png);
        }
    }

    public static void RenderFallbackMasterSheet(
        string srcPortraitPath,
        string destPngPath,
        string bottomType,
        string bottomHex,
        string shoeHex
    ) {
        if (File.Exists(destPngPath)) return; // Pertahankan master sheet AI jika sudah ada!
        using (var src = new Bitmap(srcPortraitPath))
        using (var sheet = new Bitmap(1440, 820, PixelFormat.Format32bppArgb))
        using (var g = Graphics.FromImage(sheet)) {
            g.Clear(Color.FromArgb(255, 248, 250, 252));
            // 3 tampilan referensi berdampingan (Front, 3/4, Dynamic Standing)
            var st1 = g.Save();
            g.TranslateTransform(0, 30);
            DrawFullBodyStanding(g, src, 480, 760, bottomType, ColorTranslator.FromHtml(bottomHex), ColorTranslator.FromHtml(shoeHex), 0f, 0f, 0f, 0f, "neutral", 0);
            g.Restore(st1);

            var st2 = g.Save();
            g.TranslateTransform(480, 30);
            DrawFullBodyStanding(g, src, 480, 760, bottomType, ColorTranslator.FromHtml(bottomHex), ColorTranslator.FromHtml(shoeHex), 0.35f, -3f, 1.5f, 0f, "happy", 0);
            g.Restore(st2);

            var st3 = g.Save();
            g.TranslateTransform(960, 30);
            DrawFullBodyStanding(g, src, 480, 760, bottomType, ColorTranslator.FromHtml(bottomHex), ColorTranslator.FromHtml(shoeHex), -0.4f, -2f, -1.8f, 0f, "confident", 0);
            g.Restore(st3);

            Directory.CreateDirectory(Path.GetDirectoryName(destPngPath));
            sheet.Save(destPngPath, ImageFormat.Png);
        }
    }
}
'@

Add-Type -TypeDefinition $csharp -ReferencedAssemblies System.Drawing

$students = @(
  @{ id = "mhs-01"; slug = "raka"; name = "Raka Pratama"; bottomType = "celana"; bottomHex = "#cdbd98"; shoeHex = "#7a2433" },
  @{ id = "mhs-02"; slug = "dimas"; name = "Dimas Aditya"; bottomType = "celana"; bottomHex = "#1f3a5f"; shoeHex = "#cdbd98" },
  @{ id = "mhs-03"; slug = "tania"; name = "Tania Wijaya"; bottomType = "rok"; bottomHex = "#1f3a5f"; shoeHex = "#7a2433" },
  @{ id = "mhs-04"; slug = "kevin"; name = "Kevin Gunawan"; bottomType = "celana"; bottomHex = "#1f3a5f"; shoeHex = "#14263f" },
  @{ id = "mhs-05"; slug = "ayu"; name = "Ayu Permata"; bottomType = "rok"; bottomHex = "#6b7a2e"; shoeHex = "#cdbd98" },
  @{ id = "mhs-06"; slug = "mita"; name = "Mita Rahmawati"; bottomType = "rok"; bottomHex = "#cdbd98"; shoeHex = "#7a2433" },
  @{ id = "mhs-07"; slug = "bima"; name = "Bima Mahendra"; bottomType = "celana"; bottomHex = "#1f3a5f"; shoeHex = "#521825" },
  @{ id = "mhs-08"; slug = "hendra"; name = "Hendra Wijaya"; bottomType = "celana"; bottomHex = "#cdbd98"; shoeHex = "#d9a21b" },
  @{ id = "mhs-09"; slug = "gilang"; name = "Gilang Ramadhan"; bottomType = "celana"; bottomHex = "#7a2433"; shoeHex = "#e2702a" },
  @{ id = "mhs-10"; slug = "teguh"; name = "Teguh Santosa"; bottomType = "celana"; bottomHex = "#6b7a2e"; shoeHex = "#1f3a5f" },
  @{ id = "mhs-11"; slug = "maya"; name = "Maya Puspita"; bottomType = "celana"; bottomHex = "#cdbd98"; shoeHex = "#6b4a9e" },
  @{ id = "mhs-12"; slug = "sari"; name = "Sari Melati"; bottomType = "celana"; bottomHex = "#1f3a5f"; shoeHex = "#14263f" },
  @{ id = "mhs-13"; slug = "nisa"; name = "Nisa Nurhaliza"; bottomType = "rok"; bottomHex = "#1f3a5f"; shoeHex = "#cdbd98" },
  @{ id = "mhs-14"; slug = "rani"; name = "Rani Safitri"; bottomType = "rok"; bottomHex = "#cdbd98"; shoeHex = "#7a2433" },
  @{ id = "mhs-15"; slug = "naufal"; name = "Naufal Hakim"; bottomType = "celana"; bottomHex = "#6b7a2e"; shoeHex = "#1f3a5f" },
  @{ id = "mhs-16"; slug = "farhan"; name = "Farhan Pratama"; bottomType = "celana"; bottomHex = "#1f3a5f"; shoeHex = "#cdbd98" },
  @{ id = "mhs-17"; slug = "sekar"; name = "Sekar Wulandari"; bottomType = "rok"; bottomHex = "#d9a21b"; shoeHex = "#7a2433" },
  @{ id = "mhs-18"; slug = "bagas"; name = "Bagas Saputra"; bottomType = "celana"; bottomHex = "#1f3a5f"; shoeHex = "#14263f" }
)

$poseSpecs = @(
  @{ id = "P01"; suffix = "01_neutral"; expr = "neutral"; tilt = 0.0; dy = 0.0; stride = 0.0 },
  @{ id = "P02"; suffix = "02_smile"; expr = "happy"; tilt = 1.2; dy = -2.0; stride = 0.08 },
  @{ id = "P03"; suffix = "03_laugh"; expr = "laughing"; tilt = -2.0; dy = -5.0; stride = 0.12 },
  @{ id = "P04"; suffix = "04_excited"; expr = "excited"; tilt = -1.6; dy = -7.0; stride = 0.22 },
  @{ id = "P05"; suffix = "05_thinking"; expr = "thinking"; tilt = 2.4; dy = 2.0; stride = -0.06 },
  @{ id = "P06"; suffix = "06_curious"; expr = "curious"; tilt = 3.2; dy = -1.0; stride = 0.1 },
  @{ id = "P07"; suffix = "07_confused"; expr = "confused"; tilt = -2.6; dy = 3.0; stride = -0.1 },
  @{ id = "P08"; suffix = "08_surprised"; expr = "surprised"; tilt = -1.8; dy = -8.0; stride = 0.25 },
  @{ id = "P09"; suffix = "09_worried"; expr = "worried"; tilt = 1.8; dy = 6.0; stride = -0.08 },
  @{ id = "P10"; suffix = "10_sad"; expr = "sad"; tilt = 2.8; dy = 11.0; stride = -0.05 },
  @{ id = "P11"; suffix = "11_exhausted"; expr = "tired"; tilt = 2.2; dy = 14.0; stride = -0.04 },
  @{ id = "P12"; suffix = "12_frustrated"; expr = "frustrated"; tilt = -2.2; dy = 3.0; stride = 0.18 },
  @{ id = "P13"; suffix = "13_confident"; expr = "confident"; tilt = -1.0; dy = -4.0; stride = 0.16 },
  @{ id = "P14"; suffix = "14_explaining"; expr = "neutral"; tilt = -1.4; dy = -2.0; stride = 0.14 },
  @{ id = "P15"; suffix = "15_pointing"; expr = "serious"; tilt = -2.0; dy = -3.0; stride = 0.2 },
  @{ id = "P16"; suffix = "16_open_invitation"; expr = "reassuring"; tilt = 0.8; dy = -4.0; stride = 0.12 },
  @{ id = "P17"; suffix = "17_listening"; expr = "neutral"; tilt = 2.0; dy = 2.0; stride = -0.04 },
  @{ id = "P18"; suffix = "18_reassuring"; expr = "reassuring"; tilt = 1.0; dy = -2.0; stride = 0.06 },
  @{ id = "P19"; suffix = "19_shy"; expr = "shy"; tilt = 3.0; dy = 7.0; stride = -0.12 },
  @{ id = "P20"; suffix = "20_serious_focus"; expr = "serious"; tilt = 0.0; dy = -3.0; stride = 0.1 }
)

$expressions = @(
  "neutral", "happy", "laughing", "excited", "thinking", "curious", "confused", "surprised",
  "worried", "sad", "tired", "frustrated", "confident", "serious", "shy", "reassuring"
)

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$masterChars = [ordered]@{}

foreach ($st in $students) {
  $srcPortrait = Join-Path $CharactersRoot "$($st.id)-portrait.png"
  $charRoot = Join-Path $AnimeRoot $st.slug
  $refDir = Join-Path $charRoot "reference"
  $posesDir = Join-Path $charRoot "poses"
  $exprDir = Join-Path $charRoot "expressions"
  $idleDir = Join-Path $charRoot "animations\idle"
  $walkDir = Join-Path $charRoot "animations\walking"
  $talkDir = Join-Path $charRoot "animations\talking"
  $gestDir = Join-Path $charRoot "animations\gestures"

  New-Item -ItemType Directory -Force -Path $refDir, $posesDir, $exprDir, $idleDir, $walkDir, $talkDir, $gestDir | Out-Null

  # 1. Master Reference Sheet (pertahankan jika sudah digenerate AI)
  $masterRefDest = Join-Path $refDir "$($st.slug)_master_model_sheet.png"
  [AnimeFullBodySynthesizer]::RenderFallbackMasterSheet($srcPortrait, $masterRefDest, $st.bottomType, $st.bottomHex, $st.shoeHex)

  # 2. 20 Full-Body Poses
  $poseMap = [ordered]@{}
  foreach ($p in $poseSpecs) {
    $fileName = "$($st.slug)_pose_$($p.suffix).png"
    $dest = Join-Path $posesDir $fileName
    [AnimeFullBodySynthesizer]::RenderFrameToPng($srcPortrait, $dest, $st.bottomType, $st.bottomHex, $st.shoeHex, [float]$p.stride, [float]$p.dy, [float]$p.tilt, 0.0, $p.expr, 0)
    $poseMap[$p.id] = [ordered]@{
      id = $p.id
      assetPath = "/assets/anime-characters/$($st.slug)/poses/$fileName"
      width = 480
      height = 760
      anchor = "bottom-center"
      available = $true
    }
  }

  # 3. 16 Expressions
  $exprMap = [ordered]@{}
  foreach ($ex in $expressions) {
    $fileName = "$($st.slug)_expression_$ex.png"
    $dest = Join-Path $exprDir $fileName
    [AnimeFullBodySynthesizer]::RenderFrameToPng($srcPortrait, $dest, $st.bottomType, $st.bottomHex, $st.shoeHex, 0.0, 0.0, 0.0, 0.0, $ex, 0)
    $exprMap[$ex] = [ordered]@{
      id = $ex
      assetPath = "/assets/anime-characters/$($st.slug)/expressions/$fileName"
      width = 480
      height = 760
      anchor = "bottom-center"
      available = $true
    }
  }

  # 4. Animations: Idle (6 frames), Walking (8 frames), Talking (4 frames), Gestures (4 frames)
  $idleList = @()
  for ($i = 0; $i -lt 6; $i++) {
    $num = "{0:D2}" -f ($i + 1)
    $fileName = "$($st.slug)_animation_idle_$num.png"
    $phase = ($i / 6.0) * [Math]::PI * 2.0
    $bDy = [float]([Math]::Sin($phase) * 3.5)
    $tDeg = [float]([Math]::Cos($phase) * 0.9)
    [AnimeFullBodySynthesizer]::RenderFrameToPng($srcPortrait, (Join-Path $idleDir $fileName), $st.bottomType, $st.bottomHex, $st.shoeHex, 0.0, $bDy, $tDeg, 0.0, "neutral", 0)
    $idleList += [ordered]@{ id = "idle_$num"; assetPath = "/assets/anime-characters/$($st.slug)/animations/idle/$fileName"; width = 480; height = 760; anchor = "bottom-center"; available = $true }
  }

  $walkList = @()
  for ($i = 0; $i -lt 8; $i++) {
    $num = "{0:D2}" -f ($i + 1)
    $fileName = "$($st.slug)_animation_walk_$num.png"
    $phase = ($i / 8.0) * [Math]::PI * 2.0
    $bDy = [float](-[Math]::Abs([Math]::Sin($phase)) * 7.0)
    $tDeg = [float]([Math]::Sin($phase) * 1.4)
    [AnimeFullBodySynthesizer]::RenderFrameToPng($srcPortrait, (Join-Path $walkDir $fileName), $st.bottomType, $st.bottomHex, $st.shoeHex, [float]$phase, $bDy, $tDeg, 0.0, "neutral", 0)
    $walkList += [ordered]@{ id = "walk_$num"; assetPath = "/assets/anime-characters/$($st.slug)/animations/walking/$fileName"; width = 480; height = 760; anchor = "bottom-center"; available = $true }
  }

  $talkList = @()
  $mouthSeq = @(0, 1, 2, 1)
  for ($i = 0; $i -lt 4; $i++) {
    $num = "{0:D2}" -f ($i + 1)
    $fileName = "$($st.slug)_animation_talk_$num.png"
    $tDeg = [float](($i - 1.5) * 0.6)
    [AnimeFullBodySynthesizer]::RenderFrameToPng($srcPortrait, (Join-Path $talkDir $fileName), $st.bottomType, $st.bottomHex, $st.shoeHex, 0.06, -1.5, $tDeg, 0.0, "happy", $mouthSeq[$i])
    $talkList += [ordered]@{ id = "talk_$num"; assetPath = "/assets/anime-characters/$($st.slug)/animations/talking/$fileName"; width = 480; height = 760; anchor = "bottom-center"; available = $true }
  }

  $gestList = @()
  $gestExprs = @("curious", "excited", "confident", "reassuring")
  for ($i = 0; $i -lt 4; $i++) {
    $num = "{0:D2}" -f ($i + 1)
    $fileName = "$($st.slug)_animation_gesture_$num.png"
    $tDeg = [float](($i % 2 - 0.5) * 3.0)
    [AnimeFullBodySynthesizer]::RenderFrameToPng($srcPortrait, (Join-Path $gestDir $fileName), $st.bottomType, $st.bottomHex, $st.shoeHex, 0.14, -4.0, $tDeg, 0.0, $gestExprs[$i], 1)
    $gestList += [ordered]@{ id = "gesture_$num"; assetPath = "/assets/anime-characters/$($st.slug)/animations/gestures/$fileName"; width = 480; height = 760; anchor = "bottom-center"; available = $true }
  }

  $charManifest = [ordered]@{
    characterId = $st.id
    slug = $st.slug
    name = $st.name
    masterReferencePath = "/assets/anime-characters/$($st.slug)/reference/$($st.slug)_master_model_sheet.png"
    poses = $poseMap
    expressions = $exprMap
    animations = [ordered]@{
      idle = $idleList
      walking = $walkList
      talking = $talkList
      gestures = $gestList
    }
  }

  [System.IO.File]::WriteAllText((Join-Path $charRoot "manifest.json"), ($charManifest | ConvertTo-Json -Depth 6), $utf8NoBom)
  $masterChars[$st.id] = $charManifest
}

$masterManifest = [ordered]@{
  version = 1
  totalCharacters = $students.Count
  characters = $masterChars
}

[System.IO.File]::WriteAllText((Join-Path $AnimeRoot "manifest.json"), ($masterManifest | ConvertTo-Json -Depth 7), $utf8NoBom)
Write-Output "Generated complete full-body anime character library for $($students.Count) characters (18x59 = 1062 assets + manifests)."

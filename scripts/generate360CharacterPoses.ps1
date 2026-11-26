param(
  [string]$RootDir = (Join-Path $PSScriptRoot "..\public\assets\characters")
)

$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$csharpCode = @'
using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;

public static class PoseSynthesizer {
    public static void GeneratePosePng(
        string srcPngPath,
        string destPngPath,
        string poseId,
        string skinHex,
        string sleeveHex
    ) {
        using (var srcBmp = new Bitmap(srcPngPath)) {
            int w = srcBmp.Width;
            int h = srcBmp.Height;
            using (var outBmp = new Bitmap(w, h, PixelFormat.Format32bppArgb))
            using (var g = Graphics.FromImage(outBmp)) {
                g.Clear(Color.Transparent);
                g.SmoothingMode = SmoothingMode.AntiAlias;
                g.InterpolationMode = InterpolationMode.HighQualityBicubic;
                g.PixelOffsetMode = PixelOffsetMode.HighQuality;

                // Kalibrasi postur tubuh (kemiringan, pergeseran vertikal, skala bahu)
                float tiltDeg = 0f;
                float dy = 0f;
                float scaleX = 1.0f;
                float scaleY = 1.0f;
                float dx = 0f;

                switch (poseId) {
                    case "P01": tiltDeg = 0f; dy = 0f; break;
                    case "P02": tiltDeg = 1.4f; dy = -3f; break;
                    case "P03": tiltDeg = -2.6f; dy = -8f; scaleY = 1.015f; break;
                    case "P04": tiltDeg = -2.0f; dy = -11f; scaleX = 1.015f; scaleY = 1.02f; break;
                    case "P05": tiltDeg = 2.8f; dy = 3f; dx = -5f; break;
                    case "P06": tiltDeg = 4.2f; dy = -2f; dx = 5f; break;
                    case "P07": tiltDeg = -3.2f; dy = 4f; dx = -4f; break;
                    case "P08": tiltDeg = -2.2f; dy = -12f; scaleY = 1.025f; break;
                    case "P09": tiltDeg = 2.2f; dy = 9f; scaleX = 0.985f; break;
                    case "P10": tiltDeg = 3.5f; dy = 16f; scaleY = 0.985f; break;
                    case "P11": tiltDeg = 2.8f; dy = 20f; scaleX = 0.99f; scaleY = 0.975f; break;
                    case "P12": tiltDeg = -2.6f; dy = 4f; scaleX = 1.01f; break;
                    case "P13": tiltDeg = -1.4f; dy = -5f; scaleX = 1.015f; break;
                    case "P14": tiltDeg = -1.8f; dy = -4f; dx = -5f; break;
                    case "P15": tiltDeg = -2.5f; dy = -4f; dx = -7f; break;
                    case "P16": tiltDeg = 1.0f; dy = -6f; scaleX = 1.01f; break;
                    case "P17": tiltDeg = 2.4f; dy = 3f; dx = 3f; break;
                    case "P18": tiltDeg = 1.3f; dy = -2f; break;
                    case "P19": tiltDeg = 3.8f; dy = 10f; dx = 9f; break;
                    case "P20": tiltDeg = 0f; dy = -5f; scaleX = 1.01f; scaleY = 1.015f; break;
                }

                // Gambar karakter asli dengan anchor bagian bawah tengah (bottom-center)
                var state = g.Save();
                g.TranslateTransform(w * 0.5f + dx, h + dy);
                g.RotateTransform(tiltDeg);
                g.ScaleTransform(scaleX, scaleY);
                g.TranslateTransform(-w * 0.5f, -h);

                // Pengaturan tonal emosi ringan pada gambar sumber
                var cm = BuildColorMatrix(poseId);
                using (var attrs = new ImageAttributes()) {
                    attrs.SetColorMatrix(cm);
                    g.DrawImage(
                        srcBmp,
                        new Rectangle(0, 0, w, h),
                        0, 0, w, h,
                        GraphicsUnit.Pixel,
                        attrs
                    );
                }

                // Overlay ekspresi wajah & efek anime yang menyatu di koordinat transformasi tubuh
                Color skin = ColorTranslator.FromHtml(skinHex);
                Color ink = Color.FromArgb(240, 26, 20, 28);

                DrawFacialExpressionOverlay(g, w, h, poseId, skin, ink);

                g.Restore(state);

                Directory.CreateDirectory(Path.GetDirectoryName(destPngPath));
                outBmp.Save(destPngPath, ImageFormat.Png);
            }
        }
    }

    private static ColorMatrix BuildColorMatrix(string poseId) {
        float b = 1.0f;
        switch (poseId) {
            case "P03": case "P04": b = 1.04f; break;
            case "P08": b = 1.05f; break;
            case "P10": case "P11": b = 0.92f; break;
            case "P09": case "P12": b = 0.96f; break;
            case "P18": case "P02": b = 1.03f; break;
        }
        return new ColorMatrix(new float[][] {
            new float[] { b, 0, 0, 0, 0 },
            new float[] { 0, b, 0, 0, 0 },
            new float[] { 0, 0, b, 0, 0 },
            new float[] { 0, 0, 0, 1, 0 },
            new float[] { 0, 0, 0, 0, 1 }
        });
    }

    private static Color Darken(Color c, float factor) {
        return Color.FromArgb(
            c.A,
            Math.Max(0, (int)(c.R * factor)),
            Math.Max(0, (int)(c.G * factor)),
            Math.Max(0, (int)(c.B * factor))
        );
    }

    private static void DrawFacialExpressionOverlay(
        Graphics g, int w, int h, string poseId, Color skin, Color ink
    ) {
        float cx = w * 0.50f;
        float eyeY = h * 0.255f;
        float browY = h * 0.222f;
        float cheekY = h * 0.292f;

        using (var inkPen = new Pen(ink, 3.2f) { StartCap = LineCap.Round, EndCap = LineCap.Round })
        using (var blushBrush = new SolidBrush(Color.FromArgb(95, 244, 114, 132)))
        using (var sweatBrush = new SolidBrush(Color.FromArgb(225, 125, 211, 252)))
        using (var sparkBrush = new SolidBrush(Color.FromArgb(235, 253, 224, 71))) {

            // Rona pipi hangat untuk Warm Smile, Happy Laugh, Excited, Reassuring, Shy
            if (poseId == "P02" || poseId == "P03" || poseId == "P04" || poseId == "P18" || poseId == "P19") {
                g.FillEllipse(blushBrush, cx - 54f, cheekY, 26f, 11f);
                g.FillEllipse(blushBrush, cx + 28f, cheekY, 26f, 11f);
            }

            // Garis tawa menyipit di atas mata (P03 Happy Laugh)
            if (poseId == "P03") {
                using (var archPen = new Pen(ink, 4.0f) { StartCap = LineCap.Round, EndCap = LineCap.Round }) {
                    g.DrawArc(archPen, cx - 44f, eyeY - 12f, 28f, 16f, 195, 150);
                    g.DrawArc(archPen, cx + 16f, eyeY - 12f, 28f, 16f, 195, 150);
                }
            }

            // Alis ekspresif (terkejut, bingung, khawatir, sedih, frustrasi, fokus serius)
            if (poseId == "P07" || poseId == "P08" || poseId == "P06") {
                // Alis terangkat penasaran/terkejut
                g.DrawBezier(inkPen, cx - 46f, browY - 4f, cx - 34f, browY - 14f, cx - 20f, browY - 10f, cx - 14f, browY - 4f);
                g.DrawBezier(inkPen, cx + 14f, browY - 6f, cx + 24f, browY - 16f, cx + 38f, browY - 12f, cx + 48f, browY - 5f);
            } else if (poseId == "P09" || poseId == "P10" || poseId == "P11") {
                // Alis khawatir/sedih/lelah menukik ke luar
                g.DrawLine(inkPen, cx - 44f, browY + 4f, cx - 16f, browY - 5f);
                g.DrawLine(inkPen, cx + 16f, browY - 5f, cx + 44f, browY + 4f);
            } else if (poseId == "P12" || poseId == "P20") {
                // Alis tajam fokus / frustrasi menukik ke dalam
                g.DrawLine(inkPen, cx - 44f, browY - 5f, cx - 14f, browY + 4f);
                g.DrawLine(inkPen, cx + 14f, browY + 4f, cx + 44f, browY - 5f);
            }

            // Kilau mata & bintang antusiasme (P04 Excited / P08 Surprised)
            if (poseId == "P04") {
                PointF[] star = {
                    new PointF(cx + 78f, eyeY - 38f),
                    new PointF(cx + 83f, eyeY - 26f),
                    new PointF(cx + 95f, eyeY - 22f),
                    new PointF(cx + 83f, eyeY - 18f),
                    new PointF(cx + 78f, eyeY - 6f),
                    new PointF(cx + 73f, eyeY - 18f),
                    new PointF(cx + 61f, eyeY - 22f),
                    new PointF(cx + 73f, eyeY - 26f),
                };
                g.FillPolygon(sparkBrush, star);
                g.DrawPolygon(inkPen, star);
            }

            // Tetes keringat anime untuk Confused (P07), Worried (P09), Exhausted (P11), Frustrated (P12)
            if (poseId == "P07" || poseId == "P09" || poseId == "P11" || poseId == "P12") {
                float sx = cx + 62f;
                float sy = eyeY - 18f;
                using (var dropPath = new GraphicsPath()) {
                    dropPath.AddBezier(sx, sy - 10f, sx + 9f, sy + 2f, sx + 8f, sy + 12f, sx, sy + 12f);
                    dropPath.AddBezier(sx, sy + 12f, sx - 8f, sy + 12f, sx - 9f, sy + 2f, sx, sy - 10f);
                    g.FillPath(sweatBrush, dropPath);
                    g.DrawPath(inkPen, dropPath);
                }
            }

            // Garis tanda kaget anime di sisi kepala (P08 Surprised)
            if (poseId == "P08") {
                using (var shockPen = new Pen(Color.FromArgb(245, 251, 191, 36), 4.2f) { StartCap = LineCap.Round, EndCap = LineCap.Round }) {
                    g.DrawLine(shockPen, cx - 86f, eyeY - 34f, cx - 68f, eyeY - 22f);
                    g.DrawLine(shockPen, cx - 92f, eyeY - 10f, cx - 70f, eyeY - 8f);
                    g.DrawLine(shockPen, cx + 68f, eyeY - 22f, cx + 86f, eyeY - 34f);
                }
            }
        }
    }

    private static void DrawArmAndHand(
        Graphics g,
        PointF shoulder,
        PointF elbow,
        PointF hand,
        Color skin,
        Color skinShade,
        Color sleeve,
        Color sleeveDark,
        Color ink,
        float thickness,
        string handShape
    ) {
        using (var inkArm = new Pen(ink, thickness + 6f) { StartCap = LineCap.Round, EndCap = LineCap.Round, LineJoin = LineJoin.Round })
        using (var sleevePen = new Pen(sleeve, thickness) { StartCap = LineCap.Round, EndCap = LineCap.Round, LineJoin = LineJoin.Round })
        using (var shadePen = new Pen(sleeveDark, thickness * 0.42f) { StartCap = LineCap.Round, EndCap = LineCap.Round })
        using (var skinBrush = new SolidBrush(skin))
        using (var skinPen = new Pen(ink, 2.8f)) {
            g.DrawLine(inkArm, shoulder, elbow);
            g.DrawLine(inkArm, elbow, hand);
            g.DrawLine(sleevePen, shoulder, elbow);
            g.DrawLine(sleevePen, elbow, hand);
            g.DrawLine(shadePen, shoulder, elbow);

            float r = thickness * 0.56f;
            if (handShape == "pointing") {
                // Jari telunjuk menunjuk ke luar
                PointF tip = new PointF(hand.X - 24f, hand.Y - 12f);
                using (var fingerInk = new Pen(ink, 11f) { StartCap = LineCap.Round, EndCap = LineCap.Round })
                using (var fingerFill = new Pen(skin, 6.5f) { StartCap = LineCap.Round, EndCap = LineCap.Round }) {
                    g.DrawLine(fingerInk, hand, tip);
                    g.DrawLine(fingerFill, hand, tip);
                }
            } else if (handShape == "open-palm") {
                g.FillEllipse(skinBrush, hand.X - r * 1.15f, hand.Y - r * 1.25f, r * 2.3f, r * 2.5f);
                g.DrawEllipse(skinPen, hand.X - r * 1.15f, hand.Y - r * 1.25f, r * 2.3f, r * 2.5f);
                return;
            }
            g.FillEllipse(skinBrush, hand.X - r, hand.Y - r, r * 2f, r * 2f);
            g.DrawEllipse(skinPen, hand.X - r, hand.Y - r, r * 2f, r * 2f);
        }
    }

    private static void DrawBodyGestureOverlay(
        Graphics g, int w, int h, string poseId,
        Color skin, Color skinShade, Color sleeve, Color sleeveDark, Color ink
    ) {
        float cx = w * 0.5f;
        switch (poseId) {
            case "P04": {
                // Excited: kedua tangan terangkat antusias di kedua sisi bahu
                DrawArmAndHand(g, new PointF(cx - 102f, h * 0.72f), new PointF(cx - 142f, h * 0.66f), new PointF(cx - 134f, h * 0.49f), skin, skinShade, sleeve, sleeveDark, ink, 26f, "open-palm");
                DrawArmAndHand(g, new PointF(cx + 102f, h * 0.72f), new PointF(cx + 142f, h * 0.66f), new PointF(cx + 134f, h * 0.49f), skin, skinShade, sleeve, sleeveDark, ink, 26f, "open-palm");
                break;
            }
            case "P05": {
                // Thinking: satu tangan naik menyentuh dagu
                DrawArmAndHand(g, new PointF(cx + 96f, h * 0.76f), new PointF(cx + 88f, h * 0.68f), new PointF(cx + 18f, h * 0.39f), skin, skinShade, sleeve, sleeveDark, ink, 25f, "fist");
                break;
            }
            case "P07": {
                // Confused: tangan kanan terangkat di samping kepala ragu-ragu
                DrawArmAndHand(g, new PointF(cx + 98f, h * 0.74f), new PointF(cx + 132f, h * 0.58f), new PointF(cx + 94f, h * 0.36f), skin, skinShade, sleeve, sleeveDark, ink, 24f, "open-palm");
                break;
            }
            case "P08": {
                // Surprised: kedua tangan terangkat spontan di depan dada
                DrawArmAndHand(g, new PointF(cx - 98f, h * 0.75f), new PointF(cx - 122f, h * 0.64f), new PointF(cx - 74f, h * 0.48f), skin, skinShade, sleeve, sleeveDark, ink, 25f, "open-palm");
                DrawArmAndHand(g, new PointF(cx + 98f, h * 0.75f), new PointF(cx + 122f, h * 0.64f), new PointF(cx + 74f, h * 0.48f), skin, skinShade, sleeve, sleeveDark, ink, 25f, "open-palm");
                break;
            }
            case "P09": {
                // Worried: kedua tangan rapat di depan dada
                DrawArmAndHand(g, new PointF(cx - 96f, h * 0.76f), new PointF(cx - 80f, h * 0.78f), new PointF(cx - 18f, h * 0.64f), skin, skinShade, sleeve, sleeveDark, ink, 24f, "fist");
                DrawArmAndHand(g, new PointF(cx + 96f, h * 0.76f), new PointF(cx + 80f, h * 0.78f), new PointF(cx + 16f, h * 0.65f), skin, skinShade, sleeve, sleeveDark, ink, 24f, "fist");
                break;
            }
            case "P12": {
                // Frustrated: tangan kiri mengepal di depan
                DrawArmAndHand(g, new PointF(cx - 98f, h * 0.75f), new PointF(cx - 118f, h * 0.68f), new PointF(cx - 58f, h * 0.55f), skin, skinShade, sleeve, sleeveDark, ink, 26f, "fist");
                break;
            }
            case "P13": {
                // Confident: kedua lengan menyilang di depan dada
                DrawArmAndHand(g, new PointF(cx - 102f, h * 0.72f), new PointF(cx - 64f, h * 0.74f), new PointF(cx + 42f, h * 0.70f), skin, skinShade, sleeve, sleeveDark, ink, 27f, "fist");
                DrawArmAndHand(g, new PointF(cx + 102f, h * 0.72f), new PointF(cx + 64f, h * 0.76f), new PointF(cx - 46f, h * 0.73f), skin, skinShade, sleeve, sleeveDark, ink, 27f, "fist");
                break;
            }
            case "P14": {
                // Explaining: satu tangan bergerak menjelaskan di depan dada
                DrawArmAndHand(g, new PointF(cx - 98f, h * 0.74f), new PointF(cx - 122f, h * 0.70f), new PointF(cx - 54f, h * 0.56f), skin, skinShade, sleeve, sleeveDark, ink, 25f, "open-palm");
                break;
            }
            case "P15": {
                // Pointing: tangan kiri menunjuk ke arah objek / papan
                DrawArmAndHand(g, new PointF(cx - 98f, h * 0.74f), new PointF(cx - 134f, h * 0.62f), new PointF(cx - 148f, h * 0.48f), skin, skinShade, sleeve, sleeveDark, ink, 25f, "pointing");
                break;
            }
            case "P16": {
                // Open Invitation: kedua tangan terbuka mengajak diskusi
                DrawArmAndHand(g, new PointF(cx - 102f, h * 0.74f), new PointF(cx - 138f, h * 0.72f), new PointF(cx - 110f, h * 0.56f), skin, skinShade, sleeve, sleeveDark, ink, 25f, "open-palm");
                DrawArmAndHand(g, new PointF(cx + 102f, h * 0.74f), new PointF(cx + 138f, h * 0.72f), new PointF(cx + 110f, h * 0.56f), skin, skinShade, sleeve, sleeveDark, ink, 25f, "open-palm");
                break;
            }
            case "P18": {
                // Reassuring: satu tangan terbuka menenangkan ke depan
                DrawArmAndHand(g, new PointF(cx - 98f, h * 0.76f), new PointF(cx - 114f, h * 0.74f), new PointF(cx - 42f, h * 0.62f), skin, skinShade, sleeve, sleeveDark, ink, 25f, "open-palm");
                break;
            }
            case "P19": {
                // Shy: tangan kanan menyentuh pipi/bahu dengan malu
                DrawArmAndHand(g, new PointF(cx + 96f, h * 0.75f), new PointF(cx + 108f, h * 0.64f), new PointF(cx + 56f, h * 0.44f), skin, skinShade, sleeve, sleeveDark, ink, 23f, "open-palm");
                break;
            }
        }
    }
}
'@

Add-Type -TypeDefinition $csharpCode -ReferencedAssemblies System.Drawing

$students = @(
  @{ id = "mhs-01"; slug = "raka"; name = "Raka Pratama"; skin = "#eab98f"; sleeve = "#1f3a5f" },
  @{ id = "mhs-02"; slug = "dimas"; name = "Dimas Aditya"; skin = "#d39a6a"; sleeve = "#7a2433" },
  @{ id = "mhs-03"; slug = "tania"; name = "Tania Wijaya"; skin = "#f6d5b8"; sleeve = "#6b4a9e" },
  @{ id = "mhs-04"; slug = "kevin"; name = "Kevin Gunawan"; skin = "#f6d5b8"; sleeve = "#d9a21b" },
  @{ id = "mhs-05"; slug = "ayu"; name = "Ayu Permata"; skin = "#d39a6a"; sleeve = "#e2702a" },
  @{ id = "mhs-06"; slug = "mita"; name = "Mita Rahmawati"; skin = "#eab98f"; sleeve = "#6b7a2e" },
  @{ id = "mhs-07"; slug = "bima"; name = "Bima Mahendra"; skin = "#a8714a"; sleeve = "#e2702a" },
  @{ id = "mhs-08"; slug = "hendra"; name = "Hendra Wijaya"; skin = "#eab98f"; sleeve = "#1f8a8a" },
  @{ id = "mhs-09"; slug = "gilang"; name = "Gilang Ramadhan"; skin = "#d39a6a"; sleeve = "#1f3a5f" },
  @{ id = "mhs-10"; slug = "teguh"; name = "Teguh Santosa"; skin = "#a8714a"; sleeve = "#efe3c8" },
  @{ id = "mhs-11"; slug = "maya"; name = "Maya Puspita"; skin = "#f6d5b8"; sleeve = "#6b4a9e" },
  @{ id = "mhs-12"; slug = "sari"; name = "Sari Melati"; skin = "#eab98f"; sleeve = "#1f8a8a" },
  @{ id = "mhs-13"; slug = "nisa"; name = "Nisa Nurhaliza"; skin = "#d39a6a"; sleeve = "#1f8a8a" },
  @{ id = "mhs-14"; slug = "rani"; name = "Rani Safitri"; skin = "#eab98f"; sleeve = "#7a2433" },
  @{ id = "mhs-15"; slug = "naufal"; name = "Naufal Hakim"; skin = "#d39a6a"; sleeve = "#e2702a" },
  @{ id = "mhs-16"; slug = "farhan"; name = "Farhan Pratama"; skin = "#eab98f"; sleeve = "#1f8a8a" },
  @{ id = "mhs-17"; slug = "sekar"; name = "Sekar Wulandari"; skin = "#f6d5b8"; sleeve = "#1f8a8a" },
  @{ id = "mhs-18"; slug = "bagas"; name = "Bagas Saputra"; skin = "#d39a6a"; sleeve = "#1f3a5f" }
)

$poses = @(
  @{ id = "P01"; slug = "p01-neutral"; expr = "netral"; emo = "neutral" },
  @{ id = "P02"; slug = "p02-warm-smile"; expr = "tersenyum"; emo = "warm" },
  @{ id = "P03"; slug = "p03-happy-laugh"; expr = "tersenyum"; emo = "happy" },
  @{ id = "P04"; slug = "p04-excited"; expr = "tersenyum"; emo = "excited" },
  @{ id = "P05"; slug = "p05-thinking"; expr = "tertegun"; emo = "thinking" },
  @{ id = "P06"; slug = "p06-curious"; expr = "waspada"; emo = "curious" },
  @{ id = "P07"; slug = "p07-confused"; expr = "tertegun"; emo = "confused" },
  @{ id = "P08"; slug = "p08-surprised"; expr = "terkejut"; emo = "surprised" },
  @{ id = "P09"; slug = "p09-worried"; expr = "cemas"; emo = "worried" },
  @{ id = "P10"; slug = "p10-sad"; expr = "menunduk"; emo = "sad" },
  @{ id = "P11"; slug = "p11-exhausted"; expr = "lelah"; emo = "exhausted" },
  @{ id = "P12"; slug = "p12-frustrated"; expr = "kesal"; emo = "frustrated" },
  @{ id = "P13"; slug = "p13-confident"; expr = "waspada"; emo = "confident" },
  @{ id = "P14"; slug = "p14-explaining"; expr = "netral"; emo = "explaining" },
  @{ id = "P15"; slug = "p15-pointing"; expr = "waspada"; emo = "pointing" },
  @{ id = "P16"; slug = "p16-open-invitation"; expr = "lega"; emo = "inviting" },
  @{ id = "P17"; slug = "p17-listening"; expr = "netral"; emo = "listening" },
  @{ id = "P18"; slug = "p18-reassuring"; expr = "lega"; emo = "reassuring" },
  @{ id = "P19"; slug = "p19-shy"; expr = "menunduk"; emo = "shy" },
  @{ id = "P20"; slug = "p20-serious-focus"; expr = "waspada"; emo = "focused" }
)

$masterCharacters = [ordered]@{}
$totalGenerated = 0

foreach ($st in $students) {
  $srcPath = Join-Path $RootDir "$($st.id)-portrait.png"
  if (-not (Test-Path $srcPath)) {
    throw "Source portrait missing: $srcPath"
  }

  $charDir = Join-Path $RootDir $st.slug
  $posesDir = Join-Path $charDir "poses"
  $animDir = Join-Path $charDir "animations"
  New-Item -ItemType Directory -Force -Path $posesDir, $animDir | Out-Null

  $poseMap = [ordered]@{}
  foreach ($p in $poses) {
    $destPath = Join-Path $posesDir "$($p.slug).png"
    [PoseSynthesizer]::GeneratePosePng($srcPath, $destPath, $p.id, $st.skin, $st.sleeve)
    $totalGenerated += 1

    $poseMap[$p.id] = [ordered]@{
      characterId = $st.id
      poseId = $p.id
      expression = $p.expr
      emotion = $p.emo
      assetPath = "/assets/characters/$($st.slug)/poses/$($p.slug).png"
      anchor = "bottom-center"
      width = 480
      height = 600
      availability = $true
    }
  }

  $charManifest = [ordered]@{
    characterId = $st.id
    slug = $st.slug
    name = $st.name
    poses = $poseMap
  }
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText((Join-Path $charDir "manifest.json"), ($charManifest | ConvertTo-Json -Depth 5), $utf8NoBom)
  $masterCharacters[$st.id] = $charManifest
}

$masterManifest = [ordered]@{
  version = 1
  totalCharacters = $students.Count
  posesPerCharacter = $poses.Count
  totalAssets = $totalGenerated
  characters = $masterCharacters
}

$utf8NoBomRoot = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText((Join-Path $RootDir "poses-manifest.json"), ($masterManifest | ConvertTo-Json -Depth 6), $utf8NoBomRoot)
Write-Output "Generated $totalGenerated pose assets across $($students.Count) characters."

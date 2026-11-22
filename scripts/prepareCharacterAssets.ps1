param(
  [Parameter(Mandatory=$true)][ValidateSet("portrait","chibi")][string]$Mode,
  [Parameter(Mandatory=$true)][string]$Src,
  [Parameter(Mandatory=$true)][string]$Dst,
  [int]$Width = 512,
  [int]$Height = 614,
  [int]$Threshold = 26,
  [switch]$FlipLeft
)

$code = @"
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public static class AssetProcessor {
    private static bool IsNearBg(byte r, byte g, byte b, byte bgR, byte bgG, byte bgB, int tol) {
        int dr = Math.Abs(r - bgR);
        int dg = Math.Abs(g - bgG);
        int db = Math.Abs(b - bgB);
        int maxC = Math.Max(r, Math.Max(g, b));
        int minC = Math.Min(r, Math.Min(g, b));
        int sat = maxC - minC;
        return dr <= tol && dg <= tol && db <= tol && sat <= 24;
    }

    private static Bitmap RemoveWhiteBackground(Bitmap src, int tol, bool seedBottom) {
        int w = src.Width;
        int h = src.Height;
        Bitmap bmp = new Bitmap(w, h, PixelFormat.Format32bppArgb);
        using (Graphics g = Graphics.FromImage(bmp)) {
            g.DrawImage(src, 0, 0, w, h);
        }

        BitmapData bd = bmp.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
        int bytes = Math.Abs(bd.Stride) * h;
        byte[] px = new byte[bytes];
        Marshal.Copy(bd.Scan0, px, 0, bytes);
        int stride = bd.Stride;

        // Sample average background from top corners
        int bgR = (px[2] + px[(w - 1) * 4 + 2]) / 2;
        int bgG = (px[1] + px[(w - 1) * 4 + 1]) / 2;
        int bgB = (px[0] + px[(w - 1) * 4 + 0]) / 2;
        if (bgR < 220 || bgG < 220 || bgB < 220) { bgR = 255; bgG = 255; bgB = 255; }

        bool[] bg = new bool[w * h];
        Queue<int> q = new Queue<int>(w * 4);

        Action<int, int> trySeed = (sx, sy) => {
            int idx = sy * w + sx;
            if (bg[idx]) return;
            int o = sy * stride + sx * 4;
            if (IsNearBg(px[o + 2], px[o + 1], px[o], (byte)bgR, (byte)bgG, (byte)bgB, tol)) {
                bg[idx] = true;
                q.Enqueue(idx);
            }
        };

        for (int x = 0; x < w; x++) {
            trySeed(x, 0);
            if (seedBottom) trySeed(x, h - 1);
        }
        for (int y = 0; y < h; y++) {
            trySeed(0, y);
            trySeed(w - 1, y);
        }

        int[] dx = { -1, 1, 0, 0 };
        int[] dy = { 0, 0, -1, 1 };

        while (q.Count > 0) {
            int cur = q.Dequeue();
            int cx = cur % w;
            int cy = cur / w;
            for (int d = 0; d < 4; d++) {
                int nx = cx + dx[d];
                int ny = cy + dy[d];
                if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
                int nidx = ny * w + nx;
                if (bg[nidx]) continue;
                int o = ny * stride + nx * 4;
                if (IsNearBg(px[o + 2], px[o + 1], px[o], (byte)bgR, (byte)bgG, (byte)bgB, tol)) {
                    bg[nidx] = true;
                    q.Enqueue(nidx);
                }
            }
        }

        // Zero alpha on background
        for (int y = 0; y < h; y++) {
            for (int x = 0; x < w; x++) {
                if (bg[y * w + x]) {
                    int o = y * stride + x * 4;
                    px[o + 3] = 0;
                }
            }
        }

        // Soft 2-pass white-fringe decontamination on boundary pixels adjacent to bg
        bool[] edge1 = new bool[w * h];
        for (int y = 1; y < h - 1; y++) {
            for (int x = 1; x < w - 1; x++) {
                int idx = y * w + x;
                if (bg[idx]) continue;
                if (bg[idx - 1] || bg[idx + 1] || bg[idx - w] || bg[idx + w]) {
                    edge1[idx] = true;
                }
            }
        }
        for (int y = 1; y < h - 1; y++) {
            for (int x = 1; x < w - 1; x++) {
                int idx = y * w + x;
                if (!edge1[idx]) continue;
                int o = y * stride + x * 4;
                int r = px[o + 2], g = px[o + 1], b = px[o];
                int luma = (r * 30 + g * 59 + b * 11) / 100;
                int sat = Math.Max(r, Math.Max(g, b)) - Math.Min(r, Math.Min(g, b));
                if (luma > 175 && sat < 35) {
                    // Anti-aliased grey-white pixel on dark outline edge: convert to soft alpha
                    double alpha = Math.Max(0.0, Math.Min(1.0, (248.0 - luma) / 115.0));
                    px[o + 3] = (byte)Math.Round(alpha * 255.0);
                    if (alpha > 0.05) {
                        // Un-premultiply white halo slightly
                        px[o + 2] = (byte)Math.Max(0, Math.Min(255, Math.Round((r - (1.0 - alpha) * 255.0) / alpha)));
                        px[o + 1] = (byte)Math.Max(0, Math.Min(255, Math.Round((g - (1.0 - alpha) * 255.0) / alpha)));
                        px[o + 0] = (byte)Math.Max(0, Math.Min(255, Math.Round((b - (1.0 - alpha) * 255.0) / alpha)));
                    }
                }
            }
        }

        Marshal.Copy(px, 0, bd.Scan0, bytes);
        bmp.UnlockBits(bd);
        return bmp;
    }

    private static Rectangle AlphaBounds(Bitmap bmp, int x0, int x1, int minAlpha) {
        int w = bmp.Width, h = bmp.Height;
        BitmapData bd = bmp.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
        int bytes = Math.Abs(bd.Stride) * h;
        byte[] px = new byte[bytes];
        Marshal.Copy(bd.Scan0, px, 0, bytes);
        int stride = bd.Stride;
        bmp.UnlockBits(bd);

        int minX = x1, maxX = x0, minY = h, maxY = 0;
        bool any = false;
        for (int y = 0; y < h; y++) {
            for (int x = Math.Max(0, x0); x < Math.Min(w, x1); x++) {
                if (px[y * stride + x * 4 + 3] >= minAlpha) {
                    any = true;
                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                }
            }
        }
        if (!any) return Rectangle.Empty;
        return new Rectangle(minX, minY, maxX - minX + 1, maxY - minY + 1);
    }

    public static void ProcessPortrait(string srcPath, string dstPath, int outW, int outH, int tol) {
        using (Bitmap raw = new Bitmap(srcPath))
        using (Bitmap cut = RemoveWhiteBackground(raw, tol, false)) {
            Rectangle b = AlphaBounds(cut, 0, cut.Width, 40);
            if (b.IsEmpty) throw new Exception("Empty portrait alpha bounds");

            using (Bitmap outBmp = new Bitmap(outW, outH, PixelFormat.Format32bppArgb))
            using (Graphics g = Graphics.FromImage(outBmp)) {
                g.Clear(Color.Transparent);
                g.InterpolationMode = InterpolationMode.HighQualityBicubic;
                g.SmoothingMode = SmoothingMode.HighQuality;
                g.PixelOffsetMode = PixelOffsetMode.HighQuality;

                // Keep generous ~4% headroom, anchor bottom cleanly to outH
                float availW = outW * 0.94f;
                float availH = outH * 0.96f;
                float scale = Math.Min(availW / b.Width, availH / b.Height);
                float dw = b.Width * scale;
                float dh = b.Height * scale;
                float dx = (outW - dw) * 0.5f;
                float dy = outH - dh;

                g.DrawImage(cut, new RectangleF(dx, dy, dw, dh), b, GraphicsUnit.Pixel);
                outBmp.Save(dstPath, ImageFormat.Png);
            }
        }
    }

    private static Bitmap ExtractNormalizedPose(Bitmap cut, Rectangle b, int cellW, int cellH, bool flipX) {
        Bitmap pose = new Bitmap(cellW, cellH, PixelFormat.Format32bppArgb);
        using (Graphics g = Graphics.FromImage(pose)) {
            g.Clear(Color.Transparent);
            g.InterpolationMode = InterpolationMode.HighQualityBicubic;
            g.SmoothingMode = SmoothingMode.HighQuality;
            g.PixelOffsetMode = PixelOffsetMode.HighQuality;

            float targetH = cellH * 0.89f;
            float maxW = cellW * 0.92f;
            float scale = Math.Min(maxW / b.Width, targetH / b.Height);
            float dw = b.Width * scale;
            float dh = b.Height * scale;
            float dx = (cellW - dw) * 0.5f;
            float dy = cellH - 3f - dh;

            if (flipX) {
                g.TranslateTransform(cellW, 0);
                g.ScaleTransform(-1, 1);
            }
            g.DrawImage(cut, new RectangleF(dx, dy, dw, dh), b, GraphicsUnit.Pixel);
        }
        return pose;
    }

    private static void DrawPoseFrame(Graphics g, Bitmap pose, int col, int row, int cellW, int cellH, float scaleX, float scaleY, float hopY, float tiltDeg) {
        int ox = col * cellW;
        int oy = row * cellH;
        float footX = ox + cellW * 0.5f;
        float footY = oy + cellH - 3f;

        GraphicsState st = g.Save();
        g.SetClip(new Rectangle(ox, oy, cellW, cellH));
        g.TranslateTransform(footX, footY + hopY);
        if (Math.Abs(tiltDeg) > 0.01f) g.RotateTransform(tiltDeg);
        g.ScaleTransform(scaleX, scaleY);
        g.DrawImage(pose, -cellW * 0.5f, -(cellH - 3f), cellW, cellH);
        g.Restore(st);
    }

    public static void ProcessChibiSheet(string srcPath, string dstPath, int cellW, int cellH, int tol, bool flipLeft) {
        using (Bitmap raw = new Bitmap(srcPath))
        using (Bitmap cut = RemoveWhiteBackground(raw, tol, true)) {
            int w = cut.Width, h = cut.Height;
            BitmapData bd = cut.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
            int bytes = Math.Abs(bd.Stride) * h;
            byte[] px = new byte[bytes];
            Marshal.Copy(bd.Scan0, px, 0, bytes);
            int stride = bd.Stride;
            cut.UnlockBits(bd);

            // Column alpha projection to split 3 figures
            int[] colCount = new int[w];
            for (int x = 0; x < w; x++) {
                int c = 0;
                for (int y = 0; y < h; y++) {
                    if (px[y * stride + x * 4 + 3] >= 48) c++;
                }
                colCount[x] = c;
            }

            List<int[]> spans = new List<int[]>();
            bool inSpan = false;
            int start = 0;
            for (int x = 0; x < w; x++) {
                bool solid = colCount[x] >= 3;
                if (solid && !inSpan) { inSpan = true; start = x; }
                else if (!solid && inSpan) {
                    inSpan = false;
                    if (x - start >= Math.Max(20, w / 25)) spans.Add(new int[] { start, x });
                }
            }
            if (inSpan && w - start >= Math.Max(20, w / 25)) spans.Add(new int[] { start, w });

            Rectangle[] boxes = new Rectangle[3];
            if (spans.Count == 3) {
                for (int i = 0; i < 3; i++) boxes[i] = AlphaBounds(cut, spans[i][0], spans[i][1], 48);
            } else {
                // Fallback: equal thirds
                int third = w / 3;
                for (int i = 0; i < 3; i++) boxes[i] = AlphaBounds(cut, i * third, (i + 1) * third, 48);
            }

            using (Bitmap frontPose = ExtractNormalizedPose(cut, boxes[0], cellW, cellH, false))
            using (Bitmap leftPose  = ExtractNormalizedPose(cut, boxes[1], cellW, cellH, flipLeft))
            using (Bitmap rightPose = ExtractNormalizedPose(cut, boxes[1], cellW, cellH, !flipLeft))
            using (Bitmap backPose  = ExtractNormalizedPose(cut, boxes[2], cellW, cellH, false))
            using (Bitmap sheet = new Bitmap(cellW * 6, cellH * 4, PixelFormat.Format32bppArgb))
            using (Graphics g = Graphics.FromImage(sheet)) {
                g.Clear(Color.Transparent);
                g.InterpolationMode = InterpolationMode.HighQualityBicubic;
                g.SmoothingMode = SmoothingMode.HighQuality;
                g.PixelOffsetMode = PixelOffsetMode.HighQuality;

                Bitmap[] rows = { frontPose, leftPose, rightPose, backPose };
                for (int r = 0; r < 4; r++) {
                    Bitmap p = rows[r];
                    // Idle 0, Idle 1 (gentle breath squash)
                    DrawPoseFrame(g, p, 0, r, cellW, cellH, 1.00f, 1.00f, 0f, 0f);
                    DrawPoseFrame(g, p, 1, r, cellW, cellH, 1.02f, 0.975f, 0f, 0f);
                    // Walk 0..3 (lively cozy chibi walk hop & sway)
                    DrawPoseFrame(g, p, 2, r, cellW, cellH, 0.985f, 1.02f, -3.5f, -3.2f);
                    DrawPoseFrame(g, p, 3, r, cellW, cellH, 1.015f, 0.985f, 0f, 0f);
                    DrawPoseFrame(g, p, 4, r, cellW, cellH, 0.985f, 1.02f, -3.5f, 3.2f);
                    DrawPoseFrame(g, p, 5, r, cellW, cellH, 1.015f, 0.985f, 0f, 0f);
                }

                sheet.Save(dstPath, ImageFormat.Png);
            }
        }
    }
}
"@

Add-Type -TypeDefinition $code -ReferencedAssemblies System.Drawing
$dir = Split-Path -Parent $Dst
if ($dir -and !(Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }

if ($Mode -eq "portrait") {
  [AssetProcessor]::ProcessPortrait($Src, $Dst, $Width, $Height, $Threshold)
  Write-Host "OK portrait -> $Dst"
} else {
  [AssetProcessor]::ProcessChibiSheet($Src, $Dst, $Width, $Height, $Threshold, [bool]$FlipLeft)
  Write-Host "OK chibi sheet -> $Dst"
}

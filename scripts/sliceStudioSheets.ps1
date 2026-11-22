param(
  [Parameter(Mandatory=$true)][ValidateSet("lineup4","lineup2x3","sdgrid4x3","scene")][string]$Mode,
  [Parameter(Mandatory=$true)][string]$Src,
  [Parameter(Mandatory=$true)][string[]]$Out,
  [int]$Width = 480,
  [int]$Height = 600,
  [int]$Threshold = 26,
  [string]$Flip = "",
  [string]$ColMap = "",
  [string]$ExtraSeeds = "",
  [string]$ContactOut = ""
)

$code = @"
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Globalization;
using System.IO;
using System.Runtime.InteropServices;

public static class StudioSheetSlicer {
    private static bool IsWhiteBg(byte r, byte g, byte b, int tol) {
        int dr = 255 - r, dg = 255 - g, db = 255 - b;
        int sat = Math.Max(r, Math.Max(g, b)) - Math.Min(r, Math.Min(g, b));
        return dr <= tol && dg <= tol && db <= tol && sat <= 24;
    }

    private static Bitmap RemoveWhiteBg(Bitmap src, int tol, bool seedBottom, List<PointF> extraRelSeeds) {
        int w = src.Width, h = src.Height;
        Bitmap bmp = new Bitmap(w, h, PixelFormat.Format32bppArgb);
        using (Graphics g = Graphics.FromImage(bmp)) { g.DrawImage(src, 0, 0, w, h); }

        BitmapData bd = bmp.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
        int bytes = Math.Abs(bd.Stride) * h;
        byte[] px = new byte[bytes];
        Marshal.Copy(bd.Scan0, px, 0, bytes);
        int st = bd.Stride;

        bool[] bg = new bool[w * h];
        Queue<int> q = new Queue<int>(w * 4);
        Action<int, int> seed = (sx, sy) => {
            if (sx < 0 || sx >= w || sy < 0 || sy >= h) return;
            int idx = sy * w + sx;
            if (bg[idx]) return;
            int o = sy * st + sx * 4;
            if (IsWhiteBg(px[o + 2], px[o + 1], px[o], tol)) {
                bg[idx] = true;
                q.Enqueue(idx);
            }
        };
        for (int x = 0; x < w; x++) {
            seed(x, 0);
            if (seedBottom) seed(x, h - 1);
        }
        for (int y = 0; y < h; y++) { seed(0, y); seed(w - 1, y); }

        if (extraRelSeeds != null) {
            foreach (var pt in extraRelSeeds) {
                int sx = Math.Max(0, Math.Min(w - 1, (int)Math.Round(pt.X * (w - 1))));
                int sy = Math.Max(0, Math.Min(h - 1, (int)Math.Round(pt.Y * (h - 1))));
                for (int dy = -3; dy <= 3; dy++)
                    for (int dx = -3; dx <= 3; dx++)
                        seed(sx + dx, sy + dy);
            }
        }

        int[] dx4 = { -1, 1, 0, 0 };
        int[] dy4 = { 0, 0, -1, 1 };
        while (q.Count > 0) {
            int cur = q.Dequeue();
            int cx = cur % w, cy = cur / w;
            for (int d = 0; d < 4; d++) {
                int nx = cx + dx4[d], ny = cy + dy4[d];
                if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
                int ni = ny * w + nx;
                if (bg[ni]) continue;
                int o = ny * st + nx * 4;
                if (IsWhiteBg(px[o + 2], px[o + 1], px[o], tol)) {
                    bg[ni] = true;
                    q.Enqueue(ni);
                }
            }
        }
        for (int y = 0; y < h; y++) {
            for (int x = 0; x < w; x++) {
                if (bg[y * w + x]) px[y * st + x * 4 + 3] = 0;
            }
        }
        // Two-pass zero-halo edge de-fringing around transparent boundaries
        for (int pass = 0; pass < 2; pass++) {
            bool[] nextBg = new bool[w * h];
            Array.Copy(bg, nextBg, bg.Length);
            for (int y = 1; y < h - 1; y++) {
                for (int x = 1; x < w - 1; x++) {
                    int idx = y * w + x;
                    if (bg[idx]) continue;
                    if (!(bg[idx - 1] || bg[idx + 1] || bg[idx - w] || bg[idx + w])) continue;
                    int o = y * st + x * 4;
                    int r = px[o + 2], g = px[o + 1], b = px[o];
                    int luma = (r * 30 + g * 59 + b * 11) / 100;
                    int sat = Math.Max(r, Math.Max(g, b)) - Math.Min(r, Math.Min(g, b));
                    if (luma > 180 && sat < 34) {
                        double a = Math.Max(0.0, Math.Min(1.0, (244.0 - luma) / 108.0));
                        byte na = (byte)Math.Round(a * 255.0);
                        px[o + 3] = Math.Min(px[o + 3], na);
                        if (na < 16) {
                            px[o + 3] = 0;
                            nextBg[idx] = true;
                        } else if (a > 0.12) {
                            px[o + 2] = (byte)Math.Max(0, Math.Min(255, Math.Round((r - (1.0 - a) * 255.0) / a)));
                            px[o + 1] = (byte)Math.Max(0, Math.Min(255, Math.Round((g - (1.0 - a) * 255.0) / a)));
                            px[o + 0] = (byte)Math.Max(0, Math.Min(255, Math.Round((b - (1.0 - a) * 255.0) / a)));
                        }
                    }
                }
            }
            bg = nextBg;
        }

        Marshal.Copy(px, 0, bd.Scan0, bytes);
        bmp.UnlockBits(bd);
        return bmp;
    }

    private static List<int[]> DetectNaturalSpans(int[] density, int minLen, int minSolid) {
        int n = density.Length;
        var spans = new List<int[]>();
        bool on = false;
        int start = 0;
        for (int i = 0; i < n; i++) {
            bool solid = density[i] >= minSolid;
            if (solid && !on) { on = true; start = i; }
            else if (!solid && on) {
                on = false;
                if (i - start >= minLen) spans.Add(new[] { start, i });
            }
        }
        if (on && n - start >= minLen) spans.Add(new[] { start, n });
        return spans;
    }

    private static List<int[]> FindSpans(int[] density, int minLen, int targetCount) {
        int n = density.Length;
        var spans = DetectNaturalSpans(density, minLen, 3);
        if (spans.Count == targetCount) return spans;
        // If two adjacent items barely kissed (spans.Count < targetCount), split ONLY the widest merged span at its internal valley!
        while (spans.Count > 0 && spans.Count < targetCount) {
            int widestIdx = 0;
            int widestLen = -1;
            for (int i = 0; i < spans.Count; i++) {
                int len = spans[i][1] - spans[i][0];
                if (len > widestLen) { widestLen = len; widestIdx = i; }
            }
            int s0 = spans[widestIdx][0], s1 = spans[widestIdx][1];
            int mid = (s0 + s1) / 2;
            int margin = Math.Max(minLen / 2, (s1 - s0) / 5);
            int lo = Math.Min(mid, s0 + margin), hi = Math.Max(mid, s1 - margin);
            int bestX = mid, bestVal = int.MaxValue;
            for (int x = lo; x <= hi; x++) {
                if (density[x] < bestVal) { bestVal = density[x]; bestX = x; }
            }
            if (bestX <= s0 + 4 || bestX >= s1 - 4) break;
            spans.RemoveAt(widestIdx);
            spans.Insert(widestIdx, new[] { s0, bestX });
            spans.Insert(widestIdx + 1, new[] { bestX, s1 });
        }
        if (spans.Count == targetCount) return spans;
        // Fallback: split into targetCount segments using lowest-density valleys near ideal boundaries
        var res = new List<int[]>();
        int prev = 0;
        for (int k = 1; k < targetCount; k++) {
            int ideal = (n * k) / targetCount;
            int search = n / (targetCount * 3);
            int bestX = ideal, bestVal = int.MaxValue;
            for (int x = Math.Max(prev + minLen, ideal - search); x <= Math.Min(n - minLen, ideal + search); x++) {
                if (density[x] < bestVal) { bestVal = density[x]; bestX = x; }
            }
            res.Add(new[] { prev, bestX });
            prev = bestX;
        }
        res.Add(new[] { prev, n });
        return res;
    }

    private static void StripTinyDisconnectedFragments(Bitmap bmp, int x0, int y0, int x1, int y1) {
        int bw = x1 - x0, bh = y1 - y0;
        if (bw <= 0 || bh <= 0) return;
        BitmapData bd = bmp.LockBits(new Rectangle(0, 0, bmp.Width, bmp.Height), ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
        int bytes = Math.Abs(bd.Stride) * bmp.Height;
        byte[] px = new byte[bytes];
        Marshal.Copy(bd.Scan0, px, 0, bytes);
        int st = bd.Stride;

        int[] compId = new int[bw * bh];
        var compSizes = new List<int> { 0 };
        int[] dx4 = { -1, 1, 0, 0 };
        int[] dy4 = { 0, 0, -1, 1 };
        Queue<int> q = new Queue<int>();
        int nextId = 1, maxSize = 0;

        for (int ly = 0; ly < bh; ly++) {
            for (int lx = 0; lx < bw; lx++) {
                int li = ly * bw + lx;
                if (compId[li] != 0) continue;
                int o = (y0 + ly) * st + (x0 + lx) * 4;
                if (px[o + 3] < 24) continue;
                int cid = nextId++;
                int sz = 0;
                compId[li] = cid;
                q.Enqueue(li);
                while (q.Count > 0) {
                    int cur = q.Dequeue();
                    sz++;
                    int cx = cur % bw, cy = cur / bw;
                    for (int d = 0; d < 4; d++) {
                        int nx = cx + dx4[d], ny = cy + dy4[d];
                        if (nx < 0 || nx >= bw || ny < 0 || ny >= bh) continue;
                        int ni = ny * bw + nx;
                        if (compId[ni] != 0) continue;
                        int no = (y0 + ny) * st + (x0 + nx) * 4;
                        if (px[no + 3] >= 24) {
                            compId[ni] = cid;
                            q.Enqueue(ni);
                        }
                    }
                }
                compSizes.Add(sz);
                if (sz > maxSize) maxSize = sz;
            }
        }
        int keepMin = Math.Max(40, (int)(maxSize * 0.015));
        for (int ly = 0; ly < bh; ly++) {
            for (int lx = 0; lx < bw; lx++) {
                int cid = compId[ly * bw + lx];
                if (cid > 0 && compSizes[cid] < keepMin) {
                    px[(y0 + ly) * st + (x0 + lx) * 4 + 3] = 0;
                }
            }
        }
        Marshal.Copy(px, 0, bd.Scan0, bytes);
        bmp.UnlockBits(bd);
    }

    private static Rectangle AlphaBounds(Bitmap bmp, int x0, int y0, int x1, int y1, int minA) {
        int w = bmp.Width, h = bmp.Height;
        BitmapData bd = bmp.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
        int bytes = Math.Abs(bd.Stride) * h;
        byte[] px = new byte[bytes];
        Marshal.Copy(bd.Scan0, px, 0, bytes);
        int st = bd.Stride;
        bmp.UnlockBits(bd);

        int minX = x1, maxX = x0, minY = y1, maxY = y0;
        bool any = false;
        for (int y = Math.Max(0, y0); y < Math.Min(h, y1); y++) {
            for (int x = Math.Max(0, x0); x < Math.Min(w, x1); x++) {
                if (px[y * st + x * 4 + 3] >= minA) {
                    any = true;
                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                }
            }
        }
        return any ? new Rectangle(minX, minY, maxX - minX + 1, maxY - minY + 1) : Rectangle.Empty;
    }

    private static List<PointF> ParseRelSeeds(string raw) {
        var list = new List<PointF>();
        if (string.IsNullOrWhiteSpace(raw)) return list;
        foreach (string item in raw.Split(';')) {
            string t = item.Trim();
            if (t.Length == 0) continue;
            string[] parts = t.Split(',');
            if (parts.Length != 2) continue;
            float rx, ry;
            if (float.TryParse(parts[0], NumberStyles.Float, CultureInfo.InvariantCulture, out rx) &&
                float.TryParse(parts[1], NumberStyles.Float, CultureInfo.InvariantCulture, out ry)) {
                list.Add(new PointF(rx, ry));
            }
        }
        return list;
    }

    private static bool[] ParseFlipFlags(string raw, int count) {
        bool[] flags = new bool[count];
        if (string.IsNullOrWhiteSpace(raw)) return flags;
        string[] parts = raw.Split(',');
        for (int i = 0; i < Math.Min(count, parts.Length); i++) {
            string p = parts[i].Trim().ToLowerInvariant();
            flags[i] = (p == "1" || p == "true" || p == "yes" || p == "l" || p == "flip");
        }
        return flags;
    }

    private static int[] ParseColMap(string raw) {
        if (string.IsNullOrWhiteSpace(raw)) return null;
        string[] parts = raw.Split(',');
        if (parts.Length != 3) return null;
        int[] idx = new int[3];
        for (int i = 0; i < 3; i++) {
            if (!int.TryParse(parts[i].Trim(), out idx[i])) return null;
        }
        return idx;
    }

    private static void SaveContactPreview(string[] paths, string contactOut, int thumbW, int thumbH) {
        if (string.IsNullOrWhiteSpace(contactOut) || paths.Length == 0) return;
        string dir = Path.GetDirectoryName(contactOut);
        if (!string.IsNullOrEmpty(dir)) Directory.CreateDirectory(dir);
        int pad = 16;
        int cw = paths.Length * thumbW + (paths.Length + 1) * pad;
        int ch = thumbH + pad * 2 + 24;
        using (Bitmap canvas = new Bitmap(cw, ch, PixelFormat.Format24bppRgb))
        using (Graphics g = Graphics.FromImage(canvas)) {
            g.Clear(Color.FromArgb(18, 30, 54));
            g.InterpolationMode = InterpolationMode.HighQualityBicubic;
            g.SmoothingMode = SmoothingMode.HighQuality;
            for (int i = 0; i < paths.Length; i++) {
                int ox = pad + i * (thumbW + pad);
                int oy = pad;
                // Subtle dark checkerboard to expose any white halo or missed hole immediately
                for (int y = 0; y < thumbH; y += 16) {
                    for (int x = 0; x < thumbW; x += 16) {
                        bool alt = ((x / 16) + (y / 16)) % 2 == 0;
                        using (Brush b = new SolidBrush(alt ? Color.FromArgb(26, 42, 74) : Color.FromArgb(36, 56, 92))) {
                            g.FillRectangle(b, ox + x, oy + y, Math.Min(16, thumbW - x), Math.Min(16, thumbH - y));
                        }
                    }
                }
                using (Bitmap item = new Bitmap(paths[i])) {
                    g.DrawImage(item, ox, oy, thumbW, thumbH);
                }
                using (Font f = new Font("Segoe UI", 10, FontStyle.Bold))
                using (Brush tb = new SolidBrush(Color.FromArgb(245, 214, 134))) {
                    g.DrawString(Path.GetFileName(paths[i]), f, tb, ox, oy + thumbH + 4);
                }
            }
            canvas.Save(contactOut, ImageFormat.Png);
        }
    }

    public static void SliceLineup4(string srcPath, string[] outPaths, int outW, int outH, int tol, string flipRaw, string extraSeedsRaw, string contactOut) {
        var extraSeeds = ParseRelSeeds(extraSeedsRaw);
        bool[] flips = ParseFlipFlags(flipRaw, outPaths.Length);

        using (Bitmap raw = new Bitmap(srcPath))
        using (Bitmap cut = RemoveWhiteBg(raw, tol, false, extraSeeds)) {
            int w = cut.Width, h = cut.Height;
            BitmapData bd = cut.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
            int bytes = Math.Abs(bd.Stride) * h;
            byte[] px = new byte[bytes];
            Marshal.Copy(bd.Scan0, px, 0, bytes);
            int st = bd.Stride;
            cut.UnlockBits(bd);

            int[] colD = new int[w];
            for (int x = 0; x < w; x++) {
                int c = 0;
                for (int y = 0; y < h; y++) if (px[y * st + x * 4 + 3] >= 50) c++;
                colD[x] = c;
            }
            var cols = FindSpans(colD, w / 12, outPaths.Length);

            // Remove stray edge fragments from neighboring slices, then compute shared height scale
            Rectangle[] bounds = new Rectangle[outPaths.Length];
            int maxH = 1;
            for (int i = 0; i < outPaths.Length; i++) {
                StripTinyDisconnectedFragments(cut, cols[i][0], 0, cols[i][1], h);
                bounds[i] = AlphaBounds(cut, cols[i][0], 0, cols[i][1], h, 45);
                if (bounds[i].IsEmpty) throw new Exception("Empty slice " + i);
                if (bounds[i].Height > maxH) maxH = bounds[i].Height;
            }
            float baseScaleH = (outH * 0.94f) / maxH;

            for (int i = 0; i < outPaths.Length; i++) {
                Rectangle b = bounds[i];
                string dir = Path.GetDirectoryName(outPaths[i]);
                if (!string.IsNullOrEmpty(dir)) Directory.CreateDirectory(dir);

                using (Bitmap outBmp = new Bitmap(outW, outH, PixelFormat.Format32bppArgb))
                using (Graphics g = Graphics.FromImage(outBmp)) {
                    g.Clear(Color.Transparent);
                    g.InterpolationMode = InterpolationMode.HighQualityBicubic;
                    g.SmoothingMode = SmoothingMode.HighQuality;
                    g.PixelOffsetMode = PixelOffsetMode.HighQuality;

                    float sc = Math.Min((outW * 0.94f) / b.Width, Math.Min((outH * 0.94f) / b.Height, baseScaleH * 1.04f));
                    float dw = b.Width * sc, dh = b.Height * sc;
                    float dx = (outW - dw) * 0.5f;
                    float dy = outH - dh;
                    if (flips[i]) {
                        g.TranslateTransform(outW, 0);
                        g.ScaleTransform(-1, 1);
                    }
                    g.DrawImage(cut, new RectangleF(dx, dy, dw, dh), b, GraphicsUnit.Pixel);
                    outBmp.Save(outPaths[i], ImageFormat.Png);
                }
            }
        }
        SaveContactPreview(outPaths, contactOut, 240, 300);
    }

    public static void SliceLineup2x3(string srcPath, string[] outPaths, int outW, int outH, int tol, string flipRaw, string extraSeedsRaw, string contactOut) {
        if (outPaths.Length != 6) throw new Exception("lineup2x3 requires 6 output paths");
        var extraSeeds = ParseRelSeeds(extraSeedsRaw);
        bool[] flips = ParseFlipFlags(flipRaw, 6);

        using (Bitmap raw = new Bitmap(srcPath)) {
            int w = raw.Width, h = raw.Height;
            // Find the horizontal white gap near the middle (h * 0.35 .. h * 0.65)
            BitmapData rbd = raw.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
            int rbytes = Math.Abs(rbd.Stride) * h;
            byte[] rpx = new byte[rbytes];
            Marshal.Copy(rbd.Scan0, rpx, 0, rbytes);
            int rst = rbd.Stride;
            raw.UnlockBits(rbd);

            int[] rowInk = new int[h];
            for (int y = 0; y < h; y++) {
                int c = 0;
                for (int x = 0; x < w; x++) {
                    int o = y * rst + x * 4;
                    if (!IsWhiteBg(rpx[o + 2], rpx[o + 1], rpx[o], tol)) c++;
                }
                rowInk[y] = c;
            }
            int midY = h / 2, bestInk = int.MaxValue;
            for (int y = (int)(h * 0.38); y <= (int)(h * 0.62); y++) {
                if (rowInk[y] < bestInk) { bestInk = rowInk[y]; midY = y; }
            }
            // Tight bottom of Row 0 (where waist ink actually ends) so bottom hem is sealed against bottom edge!
            int row0Bottom = midY;
            while (row0Bottom > h / 4 && rowInk[row0Bottom - 1] < 12) row0Bottom--;
            int row1Top = midY;
            while (row1Top < (h * 3) / 4 && rowInk[row1Top] < 12) row1Top++;
            row1Top = Math.Max(midY, row1Top - 8);
            int row1Bottom = h;
            while (row1Bottom > row1Top + 40 && rowInk[row1Bottom - 1] < 12) row1Bottom--;

            int[,] rowSpans = new int[,] { { 0, row0Bottom }, { row1Top, row1Bottom } };
            Bitmap[] rowCuts = new Bitmap[2];
            Rectangle[] bounds = new Rectangle[6];
            int maxH = 1;

            try {
                for (int r = 0; r < 2; r++) {
                    int ry0 = rowSpans[r, 0], ry1 = rowSpans[r, 1];
                    int rh = ry1 - ry0;
                    var rowSeeds = new List<PointF>();
                    foreach (var pt in extraSeeds) {
                        float py = pt.Y * (h - 1);
                        if (py >= ry0 && py < ry1) {
                            rowSeeds.Add(new PointF(pt.X, (py - ry0) / Math.Max(1, rh - 1)));
                        }
                    }
                    using (Bitmap rowRaw = new Bitmap(w, rh, PixelFormat.Format32bppArgb)) {
                        using (Graphics rg = Graphics.FromImage(rowRaw)) {
                            rg.DrawImage(raw, new Rectangle(0, 0, w, rh), new Rectangle(0, ry0, w, rh), GraphicsUnit.Pixel);
                        }
                        rowCuts[r] = RemoveWhiteBg(rowRaw, tol, false, rowSeeds);
                    }

                    Bitmap cut = rowCuts[r];
                    BitmapData bd = cut.LockBits(new Rectangle(0, 0, w, rh), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
                    int bytes = Math.Abs(bd.Stride) * rh;
                    byte[] px = new byte[bytes];
                    Marshal.Copy(bd.Scan0, px, 0, bytes);
                    int st = bd.Stride;
                    cut.UnlockBits(bd);

                    int[] colD = new int[w];
                    for (int x = 0; x < w; x++) {
                        int c = 0;
                        for (int y = 0; y < rh; y++) if (px[y * st + x * 4 + 3] >= 50) c++;
                        colD[x] = c;
                    }
                    var cols = FindSpans(colD, w / 8, 3);
                    for (int c = 0; c < 3; c++) {
                        int idx = r * 3 + c;
                        int cx0 = cols[c][0], cx1 = cols[c][1];
                        StripTinyDisconnectedFragments(cut, cx0, 0, cx1, rh);
                        bounds[idx] = AlphaBounds(cut, cx0, 0, cx1, rh, 45);
                        if (bounds[idx].IsEmpty) throw new Exception("Empty 2x3 slice " + idx);
                        if (bounds[idx].Height > maxH) maxH = bounds[idx].Height;
                    }
                }
                float baseScaleH = (outH * 0.94f) / maxH;

                for (int i = 0; i < 6; i++) {
                    int r = i / 3;
                    Bitmap cut = rowCuts[r];
                    Rectangle b = bounds[i];
                    string dir = Path.GetDirectoryName(outPaths[i]);
                    if (!string.IsNullOrEmpty(dir)) Directory.CreateDirectory(dir);

                    using (Bitmap outBmp = new Bitmap(outW, outH, PixelFormat.Format32bppArgb))
                    using (Graphics g = Graphics.FromImage(outBmp)) {
                        g.Clear(Color.Transparent);
                        g.InterpolationMode = InterpolationMode.HighQualityBicubic;
                        g.SmoothingMode = SmoothingMode.HighQuality;
                        g.PixelOffsetMode = PixelOffsetMode.HighQuality;

                        float sc = Math.Min((outW * 0.94f) / b.Width, Math.Min((outH * 0.94f) / b.Height, baseScaleH * 1.04f));
                        float dw = b.Width * sc, dh = b.Height * sc;
                        float dx = (outW - dw) * 0.5f;
                        float dy = outH - dh;
                        if (flips[i]) {
                            g.TranslateTransform(outW, 0);
                            g.ScaleTransform(-1, 1);
                        }
                        g.DrawImage(cut, new RectangleF(dx, dy, dw, dh), b, GraphicsUnit.Pixel);
                        outBmp.Save(outPaths[i], ImageFormat.Png);
                    }
                }
            } finally {
                for (int r = 0; r < 2; r++) if (rowCuts[r] != null) rowCuts[r].Dispose();
            }
        }
        SaveContactPreview(outPaths, contactOut, 210, 262);
    }

    private static void ClearCellBottomWhitePockets(Bitmap cut, int x0, int y0, int x1, int y1, int tol) {
        int bw = x1 - x0, bh = y1 - y0;
        if (bw <= 4 || bh <= 4) return;
        BitmapData bd = cut.LockBits(new Rectangle(0, 0, cut.Width, cut.Height), ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
        int bytes = Math.Abs(bd.Stride) * cut.Height;
        byte[] px = new byte[bytes];
        Marshal.Copy(bd.Scan0, px, 0, bytes);
        int st = bd.Stride;

        // Find actual bottom most opaque row in this cell
        int botY = y1 - 1;
        for (int y = y1 - 1; y >= y0; y--) {
            bool any = false;
            for (int x = x0; x < x1; x++) if (px[y * st + x * 4 + 3] >= 50) { any = true; break; }
            if (any) { botY = y; break; }
        }

        bool[] vis = new bool[bw * bh];
        Queue<int> q = new Queue<int>();
        Action<int, int> trySeed = (lx, ly) => {
            if (lx < 0 || lx >= bw || ly < 0 || ly >= bh) return;
            int li = ly * bw + lx;
            if (vis[li]) return;
            int o = (y0 + ly) * st + (x0 + lx) * 4;
            if (px[o + 3] == 0) return;
            byte r = px[o + 2], g = px[o + 1], b = px[o];
            int sat = Math.Max(r, Math.Max(g, b)) - Math.Min(r, Math.Min(g, b));
            if (r >= 246 && g >= 246 && b >= 246 && sat <= 10) {
                vis[li] = true;
                q.Enqueue(li);
            }
        };
        int relBot = botY - y0;
        // Seed outer left/right third of bottom edge (arm-to-waist gaps, avoiding center white shirt!)
        for (int lx = 0; lx < bw; lx++) {
            if (lx < bw * 0.34 || lx > bw * 0.66) {
                trySeed(lx, relBot);
                if (relBot > 0) trySeed(lx, relBot - 1);
            }
        }
        int[] dx4 = { -1, 1, 0, 0 }, dy4 = { 0, 0, -1, 1 };
        while (q.Count > 0) {
            int cur = q.Dequeue();
            int cx = cur % bw, cy = cur / bw;
            for (int d = 0; d < 4; d++) {
                int nx = cx + dx4[d], ny = cy + dy4[d];
                if (nx < 0 || nx >= bw || ny < 0 || ny >= bh) continue;
                int ni = ny * bw + nx;
                if (vis[ni]) continue;
                int o = (y0 + ny) * st + (x0 + nx) * 4;
                if (px[o + 3] > 0 && IsWhiteBg(px[o + 2], px[o + 1], px[o], tol)) {
                    vis[ni] = true;
                    q.Enqueue(ni);
                }
            }
        }
        for (int ly = 0; ly < bh; ly++)
            for (int lx = 0; lx < bw; lx++)
                if (vis[ly * bw + lx]) px[(y0 + ly) * st + (x0 + lx) * 4 + 3] = 0;

        Marshal.Copy(px, 0, bd.Scan0, bytes);
        cut.UnlockBits(bd);
    }

    private static bool SideFacesLeft(Bitmap cut, Rectangle b) {
        int leftSkin = 0, rightSkin = 0;
        int midX = b.X + b.Width / 2;
        int headB = b.Y + (int)(b.Height * 0.55);
        for (int y = b.Y + (int)(b.Height * 0.14); y < headB; y++) {
            for (int x = b.X; x < b.Right; x++) {
                Color c = cut.GetPixel(x, y);
                if (c.A < 120) continue;
                if (c.R > 180 && c.G > 128 && c.R > c.B + 18 && c.R >= c.G) {
                    if (x < midX) leftSkin++; else rightSkin++;
                }
            }
        }
        return leftSkin >= rightSkin;
    }

    private static Bitmap NormalizeSdPose(Bitmap cut, Rectangle b, int cellW, int cellH, float sharedScale, bool flipX) {
        Bitmap pose = new Bitmap(cellW, cellH, PixelFormat.Format32bppArgb);
        using (Graphics g = Graphics.FromImage(pose)) {
            g.Clear(Color.Transparent);
            g.InterpolationMode = InterpolationMode.HighQualityBicubic;
            g.SmoothingMode = SmoothingMode.HighQuality;
            g.PixelOffsetMode = PixelOffsetMode.HighQuality;
            float sc = Math.Min(sharedScale, (cellW * 0.92f) / b.Width);
            float dw = b.Width * sc, dh = b.Height * sc;
            float dx = (cellW - dw) * 0.5f;
            float dy = cellH - 4f - dh;
            if (flipX) {
                g.TranslateTransform(cellW, 0);
                g.ScaleTransform(-1, 1);
            }
            g.DrawImage(cut, new RectangleF(dx, dy, dw, dh), b, GraphicsUnit.Pixel);
        }
        return pose;
    }

    private static void DrawAnimCell(Graphics g, Bitmap pose, int col, int row, int cellW, int cellH, float sx, float sy, float hopY, float tiltDeg) {
        int ox = col * cellW, oy = row * cellH;
        float fx = ox + cellW * 0.5f, fy = oy + cellH - 4f;
        GraphicsState st = g.Save();
        g.SetClip(new Rectangle(ox, oy, cellW, cellH));
        g.TranslateTransform(fx, fy + hopY);
        if (Math.Abs(tiltDeg) > 0.01f) g.RotateTransform(tiltDeg);
        g.ScaleTransform(sx, sy);
        g.DrawImage(pose, -cellW * 0.5f, -(cellH - 4f), cellW, cellH);
        g.Restore(st);
    }

    public static void SliceSdGrid4x3(string srcPath, string[] outPaths, int cellW, int cellH, int tol, string colMapRaw, string flipRaw, string contactOut) {
        int[] explicitMap = ParseColMap(colMapRaw);
        bool[] flips = ParseFlipFlags(flipRaw, outPaths.Length);
        using (Bitmap raw = new Bitmap(srcPath))
        using (Bitmap cut = RemoveWhiteBg(raw, tol, true, null)) {
            int w = cut.Width, h = cut.Height;
            BitmapData bd = cut.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
            int bytes = Math.Abs(bd.Stride) * h;
            byte[] px = new byte[bytes];
            Marshal.Copy(bd.Scan0, px, 0, bytes);
            int st = bd.Stride;
            cut.UnlockBits(bd);

            int[] rowD = new int[h];
            for (int y = 0; y < h; y++) {
                int c = 0;
                for (int x = 0; x < w; x++) if (px[y * st + x * 4 + 3] >= 50) c++;
                rowD[y] = c;
            }
            var naturalRows = DetectNaturalSpans(rowD, h / 22, 4);
            var rows = (naturalRows.Count >= outPaths.Length)
                ? naturalRows
                : FindSpans(rowD, h / Math.Max(14, outPaths.Length * 3 + 2), outPaths.Length);

            for (int rIdx = 0; rIdx < outPaths.Length; rIdx++) {
                int ry0 = rows[rIdx][0], ry1 = rows[rIdx][1];
                int[] colD = new int[w];
                for (int x = 0; x < w; x++) {
                    int c = 0;
                    for (int y = ry0; y < ry1; y++) if (px[y * st + x * 4 + 3] >= 50) c++;
                    colD[x] = c;
                }
                var naturalCols = DetectNaturalSpans(colD, w / 16, 4);
                int idxFront = 0, idxSide = 1, idxBack = 2;
                List<int[]> cols;
                if (explicitMap != null && naturalCols.Count > Math.Max(explicitMap[0], Math.Max(explicitMap[1], explicitMap[2]))) {
                    cols = naturalCols;
                    idxFront = explicitMap[0]; idxSide = explicitMap[1]; idxBack = explicitMap[2];
                } else if (naturalCols.Count >= 5) {
                    // 5-column turnaround (Front, 3/4, Side, Back, BackDup) -> pick [0, 2, 3]
                    cols = naturalCols;
                    idxFront = 0; idxSide = 2; idxBack = 3;
                } else if (naturalCols.Count == 4) {
                    // 4-column turnaround (Front, Left, Right, Back) -> pick [0, 1, 3]
                    cols = naturalCols;
                    idxFront = 0; idxSide = 1; idxBack = 3;
                } else {
                    cols = FindSpans(colD, w / 12, 3);
                }

                Rectangle bFront = AlphaBounds(cut, cols[idxFront][0], ry0, cols[idxFront][1], ry1, 50);
                Rectangle bSide  = AlphaBounds(cut, cols[idxSide][0],  ry0, cols[idxSide][1],  ry1, 50);
                Rectangle bBack  = AlphaBounds(cut, cols[idxBack][0],  ry0, cols[idxBack][1],  ry1, 50);
                bool facesLeft = !flips[rIdx];

                // Height-locked uniform scale across all 4 directions = ZERO morphing when turning!
                int maxPoseH = Math.Max(bFront.Height, Math.Max(bSide.Height, bBack.Height));
                int maxPoseW = Math.Max(bFront.Width, Math.Max(bSide.Width, bBack.Width));
                float sharedScale = Math.Min((cellH * 0.89f) / maxPoseH, (cellW * 0.92f) / maxPoseW);

                string dir = Path.GetDirectoryName(outPaths[rIdx]);
                if (!string.IsNullOrEmpty(dir)) Directory.CreateDirectory(dir);

                using (Bitmap pFront = NormalizeSdPose(cut, bFront, cellW, cellH, sharedScale, false))
                using (Bitmap pLeft  = NormalizeSdPose(cut, bSide,  cellW, cellH, sharedScale, !facesLeft))
                using (Bitmap pRight = NormalizeSdPose(cut, bSide,  cellW, cellH, sharedScale, facesLeft))
                using (Bitmap pBack  = NormalizeSdPose(cut, bBack,  cellW, cellH, sharedScale, false))
                using (Bitmap sheet  = new Bitmap(cellW * 6, cellH * 4, PixelFormat.Format32bppArgb))
                using (Graphics g = Graphics.FromImage(sheet)) {
                    g.Clear(Color.Transparent);
                    g.InterpolationMode = InterpolationMode.HighQualityBicubic;
                    g.SmoothingMode = SmoothingMode.HighQuality;
                    g.PixelOffsetMode = PixelOffsetMode.HighQuality;
                    Bitmap[] dirPoses = { pFront, pLeft, pRight, pBack };
                    float hop = cellH * 0.032f;
                    for (int d = 0; d < 4; d++) {
                        DrawAnimCell(g, dirPoses[d], 0, d, cellW, cellH, 1.00f, 1.00f, 0f, 0f);
                        DrawAnimCell(g, dirPoses[d], 1, d, cellW, cellH, 1.016f, 0.984f, 0f, 0f);
                        DrawAnimCell(g, dirPoses[d], 2, d, cellW, cellH, 0.982f, 1.022f, -hop, -2.6f);
                        DrawAnimCell(g, dirPoses[d], 3, d, cellW, cellH, 1.016f, 0.984f, 0f, 0f);
                        DrawAnimCell(g, dirPoses[d], 4, d, cellW, cellH, 0.982f, 1.022f, -hop, 2.6f);
                        DrawAnimCell(g, dirPoses[d], 5, d, cellW, cellH, 1.016f, 0.984f, 0f, 0f);
                    }
                    sheet.Save(outPaths[rIdx], ImageFormat.Png);
                }
            }
        }
        SaveContactPreview(outPaths, contactOut, 288, 288);
    }

    public static void ExportScene(string srcPath, string dstPath, int outW, int outH) {
        string dir = Path.GetDirectoryName(dstPath);
        if (!string.IsNullOrEmpty(dir)) Directory.CreateDirectory(dir);
        using (Bitmap raw = new Bitmap(srcPath))
        using (Bitmap outBmp = new Bitmap(outW, outH, PixelFormat.Format24bppRgb))
        using (Graphics g = Graphics.FromImage(outBmp)) {
            g.InterpolationMode = InterpolationMode.HighQualityBicubic;
            g.SmoothingMode = SmoothingMode.HighQuality;
            g.PixelOffsetMode = PixelOffsetMode.HighQuality;
            g.DrawImage(raw, 0, 0, outW, outH);
            outBmp.Save(dstPath, ImageFormat.Png);
        }
    }
}
"@

# Always compile latest StudioSheetSlicer in each process
if (-not ("StudioSheetSlicer" -as [type])) {
    Add-Type -TypeDefinition $code -ReferencedAssemblies System.Drawing
}
if ($Mode -eq "lineup4") {
    [StudioSheetSlicer]::SliceLineup4($Src, $Out, $Width, $Height, $Threshold, $Flip, $ExtraSeeds, $ContactOut)
    Write-Host "OK lineup4 -> $($Out.Count) portraits"
} elseif ($Mode -eq "lineup2x3") {
    [StudioSheetSlicer]::SliceLineup2x3($Src, $Out, $Width, $Height, $Threshold, $Flip, $ExtraSeeds, $ContactOut)
    Write-Host "OK lineup2x3 -> $($Out.Count) portraits"
} elseif ($Mode -eq "sdgrid4x3") {
    [StudioSheetSlicer]::SliceSdGrid4x3($Src, $Out, $Width, $Height, $Threshold, $ColMap, $Flip, $ContactOut)
    Write-Host "OK sdgrid4x3 -> $($Out.Count) sprite sheets"
} else {
    [StudioSheetSlicer]::ExportScene($Src, $Out[0], $Width, $Height)
    Write-Host "OK scene -> $($Out[0])"
}

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { VN_PALETTE, VN_CONTRAST_PAIRS } from "./vnPalette";
import { STORY_PALETTE } from "./palette";
import { contrastRatio, MIN_TEXT_CONTRAST } from "./contrast";

const css = readFileSync(resolve(process.cwd(), "src/index.css"), "utf8");

function kebab(s: string): string {
  return s.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());
}

function norm(v: string): string {
  return v.replace(/\s+/g, "").toLowerCase();
}

function tokenValue(name: string): string | undefined {
  const m = new RegExp(`--${name}\\s*:\\s*([^;]+);`).exec(css);
  return m?.[1].trim();
}

test("semua VN_CONTRAST_PAIRS memenuhi kontras >= 4,5:1", () => {
  assert.ok(VN_CONTRAST_PAIRS.length > 0);
  for (const p of VN_CONTRAST_PAIRS) {
    const r = contrastRatio(p.fg, p.bg);
    assert.ok(r >= MIN_TEXT_CONTRAST, `${p.name}: ${r.toFixed(2)}`);
  }
});

test("nilai VN_PALETTE sama dengan token --vn-* di index.css", () => {
  for (const [key, value] of Object.entries(VN_PALETTE)) {
    const t = tokenValue(`vn-${kebab(key)}`);
    assert.ok(t !== undefined, `token --vn-${kebab(key)} tidak ada`);
    assert.equal(norm(t), norm(value), `--vn-${kebab(key)}`);
  }
});

test("kelas .game-frame, .game-btn, .game-tab, .game-plate ada", () => {
  for (const cls of ["game-frame", "game-btn", "game-tab", "game-plate"]) {
    assert.ok(new RegExp(`\\.${cls}\\s*[{,:\\[]`).test(css), `.${cls} tidak ada`);
  }
});

test("aturan gerak-dikurangi ada", () => {
  assert.ok(/prefers-reduced-motion\s*:\s*reduce/.test(css));
  assert.ok(/\.reduced-motion\s+\.game-btn/.test(css));
});

test("STORY_PALETTE tidak berubah", () => {
  assert.deepEqual({ ...STORY_PALETTE }, {
    background: "#f4f6f8",
    backgroundMuted: "#edf1f5",
    border: "#d5dde6",
    dialogBg: "#ffffff",
    dialogText: "#1e293b",
    dialogSpeaker: "#164860",
    dialogMutedText: "#526072",
    choiceBg: "#ffffff",
    choiceText: "#1e293b",
    choiceBorder: "#1d5d7a",
    choiceHoverBg: "#e4f0f6",
    choiceHoverText: "#164860",
    choiceSelectedBg: "#1d5d7a",
    choiceSelectedText: "#ffffff",
    choiceDisabledBg: "#edf1f5",
    choiceDisabledText: "#526072",
    accent: "#1d5d7a",
    accentHover: "#164860",
    accentSoft: "#e4f0f6",
    accentOnSoftText: "#164860",
    warningBg: "#fef7e6",
    warningText: "#6e4e08",
    dangerText: "#b42318",
    successText: "#166534",
  });
});

test("token --ui-* tidak berubah", () => {
  const expected: Record<string, string> = {
    "ui-bg": "#f4f6f8",
    "ui-surface": "#ffffff",
    "ui-surface-muted": "#edf1f5",
    "ui-border": "#d5dde6",
    "ui-text": "#1e293b",
    "ui-text-muted": "#526072",
    "ui-accent": "#1d5d7a",
    "ui-accent-hover": "#164860",
    "ui-accent-soft": "#e4f0f6",
    "ui-warning-bg": "#fef7e6",
    "ui-warning-border": "#e7c87a",
    "ui-warning-text": "#6e4e08",
    "ui-danger": "#b42318",
    "ui-success": "#166534",
  };
  for (const [k, v] of Object.entries(expected)) {
    assert.equal(tokenValue(k), v, `--${k}`);
  }
});

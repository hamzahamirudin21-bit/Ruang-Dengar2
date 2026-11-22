import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { GAME_PALETTE, GAME_CSS_TOKENS, GAME_CONTRAST_PAIRS } from "./gamePalette";
import { contrastRatio, MIN_TEXT_CONTRAST } from "../../story/contrast";

const css = readFileSync(resolve(process.cwd(), "src/index.css"), "utf8");

test("GAME_PALETTE: semua nilai hex valid", () => {
  for (const [k, v] of Object.entries(GAME_PALETTE)) {
    assert.match(v, /^#[0-9a-f]{6}$/i, k);
  }
});

test("GAME_CSS_TOKENS: satu token per kunci palet dengan nilai sama", () => {
  assert.equal(Object.keys(GAME_CSS_TOKENS).length, Object.keys(GAME_PALETTE).length);
  assert.equal(GAME_CSS_TOKENS["--game-wood-dark"], GAME_PALETTE.woodDark);
  assert.equal(GAME_CSS_TOKENS["--game-ink-muted"], GAME_PALETTE.inkMuted);
});

test("GAME_CSS_TOKENS cocok dengan deklarasi --game-* di index.css", () => {
  for (const [name, value] of Object.entries(GAME_CSS_TOKENS)) {
    const m = new RegExp(`${name}:\\s*(#[0-9a-fA-F]{3,6})\\s*;`).exec(css);
    assert.ok(m, `${name} tidak ada di index.css`);
    assert.equal(m![1].toLowerCase(), value.toLowerCase(), name);
  }
});

test("GAME_CONTRAST_PAIRS: semua pasangan >= 4.5:1", () => {
  assert.ok(GAME_CONTRAST_PAIRS.length > 0);
  for (const p of GAME_CONTRAST_PAIRS) {
    const r = contrastRatio(p.fg, p.bg);
    assert.ok(r >= MIN_TEXT_CONTRAST, `${p.name}: ${r.toFixed(2)}`);
  }
});

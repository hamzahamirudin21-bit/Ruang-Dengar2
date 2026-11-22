/**
 * Helper UI murni untuk StoryScreen (tanpa DOM, tanpa React).
 * Requirement 7.4, 7.5, 13.1, 13.2, 13.3, 13.5, 13.7.
 */

import type { StoryExpression, StoryGraph, StoryLine } from '../../engine/story/storyTypes';

/** Kecepatan mesin ketik (karakter per detik). */
export const TYPEWRITER_CPS = 40;
/** Jeda minimum Auto (ms). */
export const AUTO_MIN_DELAY_MS = 1200;
/** Jeda Auto per karakter (ms). */
export const AUTO_MS_PER_CHAR = 35;
/** Jumlah pilihan yang dapat dipilih lewat tombol angka. */
export const MAX_KEY_CHOICES = 4;

// ---------------------------------------------------------------------------
// Tombol angka
// ---------------------------------------------------------------------------

/**
 * Memetakan tombol '1'..'4' ke indeks pilihan 0..3. Mengembalikan null bila
 * tombol bukan angka 1-4 atau indeks melampaui jumlah pilihan yang tampil.
 */
export function choiceIndexForKey(key: string, choiceCount: number): number | null {
  if (typeof key !== 'string' || !/^[1-4]$/.test(key)) return null;
  if (!Number.isFinite(choiceCount)) return null;
  const index = Number(key) - 1;
  const limit = Math.min(MAX_KEY_CHOICES, Math.floor(choiceCount));
  return index >= 0 && index < limit ? index : null;
}

// ---------------------------------------------------------------------------
// Enter
// ---------------------------------------------------------------------------

export type EnterAction =
  | 'pilih-fokus' // pilih Choice yang sedang fokus
  | 'tampilkan-penuh' // teks beranimasi: tampilkan teks lengkap
  | 'lanjut' // majukan ke beat berikutnya
  | 'tidak-ada';

export interface EnterContext {
  /** Fokus berada pada tombol pilihan. */
  choiceFocused: boolean;
  /** Teks beat sekarang masih beranimasi. */
  typing: boolean;
  /** Masih ada beat berikutnya yang menunggu. */
  hasNextBeat: boolean;
}

export function decideEnterAction(ctx: EnterContext): EnterAction {
  if (ctx.choiceFocused) return 'pilih-fokus';
  if (ctx.typing) return 'tampilkan-penuh';
  if (ctx.hasNextBeat) return 'lanjut';
  return 'tidak-ada';
}

// ---------------------------------------------------------------------------
// Beat
// ---------------------------------------------------------------------------

export type StoryBeatKind = 'dosen' | 'selingan' | 'mahasiswa' | 'isyarat';

export interface StoryBeat {
  kind: StoryBeatKind;
  text: string;
  /** Ekspresi mahasiswa untuk beat ini; null bila tidak mengubah potret. */
  expression: StoryExpression | null;
  /** Teks isyarat nonverbal ditampilkan miring. */
  italic: boolean;
}

/** Masukan struktural minimal (kompatibel dengan StoryArrival dari runner). */
export interface BeatSource {
  counselorLine: string | null;
  student: StoryLine;
}

function hasText(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Memecah satu kedatangan menjadi beat berurutan:
 * ucapan Dosen, selingan, ucapan mahasiswa, isyarat nonverbal.
 * Beat kosong dilewati.
 */
export function buildBeats(arrival: BeatSource): StoryBeat[] {
  const beats: StoryBeat[] = [];
  const { counselorLine, student } = arrival;
  if (hasText(counselorLine)) {
    beats.push({ kind: 'dosen', text: counselorLine, expression: null, italic: false });
  }
  if (hasText(student.aside)) {
    beats.push({ kind: 'selingan', text: student.aside, expression: null, italic: false });
  }
  if (hasText(student.text)) {
    beats.push({ kind: 'mahasiswa', text: student.text, expression: student.expression, italic: false });
  }
  if (hasText(student.cue)) {
    beats.push({ kind: 'isyarat', text: student.cue, expression: student.expression, italic: true });
  }
  return beats;
}

const COHERENCE_STOPWORDS = new Set([
  'yang', 'dan', 'aja', 'saja', 'aku', 'saya', 'kamu', 'ibu', 'bu', 'dosen',
  'itu', 'ini', 'tapi', 'kalau', 'jadi', 'udah', 'sudah', 'bisa', 'cuma',
  'buat', 'dari', 'sama', 'juga', 'enggak', 'nggak', 'tidak', 'ya', 'sih',
  'kok', 'dong', 'deh', 'nih', 'lah', 'kan', 'emang', 'memang', 'lagi',
  'baru', 'mau', 'ada', 'tadi', 'dulu', 'nanti', 'terus', 'biar', 'pas',
  'oke', 'baik', 'makasih', 'terima', 'kasih', 'gitu', 'gini', 'banget',
  'jujurly', 'literally', 'kayaknya', 'mungkin', 'soalnya', 'atau', 'kita',
  'kami', 'mereka', 'dia', 'apa', 'gimana', 'kenapa', 'harus', 'boleh',
  'perlu', 'ingin', 'pengin', 'punya', 'bilang', 'lihat', 'tahu', 'bikin',
]);

function contentTokens(text: string): Set<string> {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !COHERENCE_STOPWORDS.has(w));
  return new Set(words);
}

/**
 * True bila ucapan reaksi mahasiswa sudah mencakup isi utama `nodeReply`
 * (sehingga `nodeReply` tidak perlu diulang sebagai beat kedua).
 * Jika `nodeReply` memiliki narasi `aside` yang belum ada di reaksi, selalu false
 * agar peristiwa adegan penting (mis. alarm berbunyi, ganti hari) tidak terlewat.
 */
export function alreadyCoversNodeReply(studentLine: StoryLine, nodeReply: StoryLine): boolean {
  if (studentLine.text.trim() === nodeReply.text.trim()) return true;
  if (hasText(nodeReply.aside) && !hasText(studentLine.aside)) return false;

  const targetTokens = contentTokens(nodeReply.text);
  if (targetTokens.size === 0) return true;
  const reactTokens = contentTokens(studentLine.text);

  let matched = 0;
  for (const w of targetTokens) {
    if (reactTokens.has(w)) matched += 1;
  }
  const ratio = matched / targetTokens.size;
  return (ratio >= 0.31 && matched >= 3) || (targetTokens.size <= 4 && matched >= 2);
}

/**
 * Mengembalikan `node.reply` sebagai beat lanjutan saat mahasiswa baru saja
 * menjawab lewat `choice.reaction` dan masuk ke simpul baru yang isinya belum
 * tersampaikan.
 *
 * Aturan koherensi alur:
 * - Self-loop (`prevNodeId === nodeId`) tidak mengulang reply simpul yang sama.
 * - Simpul ketegangan (`node.tension`) tidak diduplikasi.
 * - Pada simpul baru lainnya (termasuk saat pindah adegan/akhir), `node.reply`
 *   ditampilkan bila reaksi belum mencakup isi utamanya (`!alreadyCoversNodeReply`),
 *   sehingga pilihan berikutnya selalu nyambung tanpa menduplikasi reaksi yang
 *   sudah merangkum isi simpul tujuan.
 */
export function followUpReplyFor(
  graph: Pick<StoryGraph, 'nodes'>,
  nodeId: string,
  studentLine: StoryLine,
  prevNodeId?: string | null,
): StoryLine | null {
  const node = graph.nodes.find((n) => n.id === nodeId);
  if (!node || !hasText(node.reply.text)) return null;
  if (studentLine.text.trim() === node.reply.text.trim()) return null;

  // Tetap di simpul yang sama (mis. hub perbaikan / pengabaian ketegangan): jangan ulang pembuka simpul.
  if (prevNodeId && prevNodeId === nodeId) return null;

  // Simpul ketegangan yang dimasuki secara sengaja dengan reaction sendiri tidak diduplikasi.
  if (node.tension) return null;

  // Bila reaksi sudah menjembatani isi simpul tujuan (termasuk saat pindah adegan/akhir), jangan diulang.
  if (alreadyCoversNodeReply(studentLine, node.reply)) return null;

  return node.reply;
}

// ---------------------------------------------------------------------------
// Mesin ketik dan Auto
// ---------------------------------------------------------------------------

export interface TypewriterResult {
  visible: string;
  done: boolean;
}

/**
 * Teks yang tampak setelah `elapsedMs`. `reduced` menampilkan teks penuh
 * seketika. Pemotongan memakai titik kode agar tidak membelah pasangan surrogat.
 */
export function typewriterStep(fullText: string, elapsedMs: number, reduced: boolean): TypewriterResult {
  if (reduced) return { visible: fullText, done: true };
  const chars = Array.from(fullText);
  const elapsed = Number.isFinite(elapsedMs) ? Math.max(0, elapsedMs) : 0;
  const count = Math.min(chars.length, Math.floor((elapsed * TYPEWRITER_CPS) / 1000));
  if (count >= chars.length) return { visible: fullText, done: true };
  return { visible: chars.slice(0, count).join(''), done: false };
}

/** Jeda Auto sebelum beat dimajukan: max(1200, 35 x panjang teks). */
export function autoDelayMs(textLength: number): number {
  const len = Number.isFinite(textLength) ? Math.max(0, textLength) : 0;
  return Math.max(AUTO_MIN_DELAY_MS, AUTO_MS_PER_CHAR * len);
}

// ---------------------------------------------------------------------------
// Walk_Together
// ---------------------------------------------------------------------------

export type WalkMode = 'animasi' | 'langsung';

/** Reduced_Motion memakai teleport ('langsung'), selain itu berjalan beranimasi. */
export function walkMode(reduced: boolean): WalkMode {
  return reduced ? 'langsung' : 'animasi';
}

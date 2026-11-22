/**
 * Daftar Istilah_Diagnosis untuk teks cerita.
 * Sengaja tidak mengimpor src/llm/*: daftar dasar disalin dari
 * FORBIDDEN_DIAGNOSIS_TERMS (src/llm/supervisor.ts) agar engine/story dan data
 * tidak bergantung pada lapisan LLM (Requirement 14.6).
 */
const BASE_DIAGNOSIS_TERMS: readonly string[] = [
  'depresi',
  'gangguan',
  'diagnosis',
  'didiagnosis',
  'patologis',
  'trauma',
  'bipolar',
  'skizofrenia',
  'psikopat',
  'neurosis',
  'kelainan',
  'penyakit mental',
  'ocd',
  'adhd',
  'autis',
];

const EXTRA_DIAGNOSIS_TERMS: readonly string[] = [
  'mendiagnosis',
  'fobia',
  'fobia sosial',
  'gangguan jiwa',
  'gangguan mental',
  'gangguan kecemasan',
  'gangguan kepribadian',
  'sakit jiwa',
];

export const STORY_FORBIDDEN_TERMS: readonly string[] = Array.from(
  new Set([...BASE_DIAGNOSIS_TERMS, ...EXTRA_DIAGNOSIS_TERMS]),
);

/** Kata teknis yang membuat "gangguan" bukan istilah diagnosis (mis. gangguan sinyal). */
export const GANGGUAN_TECHNICAL_FOLLOWERS: readonly string[] = [
  'rangkaian', 'sinyal', 'daya', 'sensor', 'listrik', 'teknis', 'jaringan',
];

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Batas kata awal (Unicode), akhiran bebas: "depresi" cocok dengan "depresinya". */
function termPattern(term: string): RegExp {
  const body = term.split(/\s+/).map(escapeRegExp).join('\\s+');
  return new RegExp(`(?<![\\p{L}\\p{N}])${body}[\\p{L}\\p{N}]*`, 'giu');
}

const TERM_PATTERNS: ReadonlyArray<{ term: string; re: RegExp }> =
  STORY_FORBIDDEN_TERMS.map((term) => ({ term, re: termPattern(term) }));

const GANGGUAN_TECHNICAL_RE = new RegExp(
  `^\\s+(?:${GANGGUAN_TECHNICAL_FOLLOWERS.map(escapeRegExp).join('|')})(?![\\p{L}\\p{N}])`,
  'iu',
);

/** Mengembalikan istilah terlarang yang ditemukan (unik, urutan daftar). Teks kosong -> []. */
export function findForbiddenTerms(text: string): string[] {
  if (!text) return [];
  const found: string[] = [];
  for (const { term, re } of TERM_PATTERNS) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    let hit = false;
    while ((m = re.exec(text)) !== null) {
      if (m[0].length === 0) { re.lastIndex++; continue; }
      if (term === 'gangguan' && m[0].toLowerCase() === 'gangguan') {
        const rest = text.slice(m.index + m[0].length);
        if (GANGGUAN_TECHNICAL_RE.test(rest)) continue; // pengecualian teknis
      }
      hit = true;
      break;
    }
    if (hit) found.push(term);
  }
  return found;
}

export function containsForbiddenTerm(text: string): boolean {
  return findForbiddenTerms(text).length > 0;
}

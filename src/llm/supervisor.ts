/**
 * Supervisor_Generator + Feedback_Validator (deterministik, tanpa jaringan).
 *
 * Hanya fungsi murni dan data templat. Modul ini sengaja TIDAK mengimpor
 * client.ts, config.ts, index.ts, cache.ts, serverGemini.ts, maupun @google/genai,
 * dan tidak memakai fetch, Date, atau Math.random.
 */

import { COUNSELOR_SKILLS } from '../data/skillEffects';
import type {
  CounselorSkillId,
  DebriefTurn,
  FeedbackItem,
  FocusDrill,
  KeyPoint,
  RubricItemId,
  RubricResult,
  SupervisorFeedback,
} from '../types';

export interface SupervisorInput {
  transcript: DebriefTurn[];
  keyPoints: KeyPoint[];
  rubric: RubricResult;
}

/* =========================================================
 * Data templat
 * ========================================================= */

export const INSUFFICIENT_MESSAGE = 'Data sesi belum cukup untuk menyusun umpan balik.';

/** Kosakata diagnosis yang tidak boleh muncul dari templat (kutipan ucapan konselor dikecualikan). */
export const FORBIDDEN_DIAGNOSIS_TERMS: readonly string[] = [
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

/**
 * Templat memakai placeholder: {n} nomor giliran, {delta} frasa perubahan kepercayaan.
 * Setiap inti kalimat memuat "Giliran {n}".
 */
export const SUPERVISOR_TEMPLATES = {
  quoteLead: 'Ucapan Anda:',
  strength: {
    perbaikan:
      'Giliran {n} menandai pemulihan hubungan setelah ketegangan. Anda mau kembali memperbaiki, dan kepercayaan {delta} pada giliran itu.',
    'akui-ketegangan':
      'Pada Giliran {n} Anda berani mengakui ketegangan yang terjadi. Langkah ini membuka jalan untuk memperbaiki hubungan.',
    'trust-naik':
      'Giliran {n} adalah salah satu momen terbaik sesi ini: kepercayaan {delta}. Pendekatan Anda di sini layak diulang.',
    'batas-kerahasiaan':
      'Pada Giliran {n} Anda menjelaskan batas kerahasiaan lebih awal dari pembicaraan yang sensitif, dan kepercayaan {delta}. Ini membangun rasa aman yang jujur.',
    'refleksi-membuka':
      'Pada Giliran {n} refleksi perasaan Anda tepat sasaran dan percakapan bergerak ke level keterbukaan yang lebih dalam. Kepercayaan {delta}.',
    'terbuka-membuka':
      'Pada Giliran {n} pertanyaan terbuka Anda mengundang cerita dan percakapan bergerak ke level keterbukaan yang lebih dalam.',
    'beri-ruang':
      'Pada Giliran {n} Anda memberi ruang tanpa mendesak, dan kepercayaan {delta}. Kesabaran seperti ini sering menentukan kualitas sesi.',
    janji:
      'Pada Giliran {n} Anda membuat janji tindak lanjut yang konkret. Janji yang ditepati akan menjaga kesinambungan hubungan.',
    rapport:
      'Pada Giliran {n} Anda membangun kedekatan dengan baik, dan kepercayaan {delta}.',
    umum:
      'Pada Giliran {n} Anda tetap hadir dan melanjutkan percakapan. Kehadiran yang konsisten adalah fondasi yang baik untuk dikembangkan.',
  },
  opportunity: {
    meremehkan:
      'Anda sudah berani menyampaikan pandangan pada Giliran {n}. Ucapan ini tercatat sebagai meremehkan atau membandingkan, dan kepercayaan {delta}. Mengakui beban orang lain lebih dulu biasanya menjaga percakapan tetap terbuka.',
    interogasi:
      'Anda sudah berusaha menggali pada Giliran {n}. Ucapan ini tercatat sebagai desakan, dan kepercayaan {delta}. Pertanyaan yang mengundang cerita biasanya terasa lebih aman.',
    'nasihat-dini':
      'Niat membantu Anda terlihat pada Giliran {n}. Saran diberikan sebelum perasaan dipahami, dan kepercayaan {delta}. Memahami dulu baru menyarankan biasanya lebih diterima.',
    'tanpa-pengakuan':
      'Anda tetap melanjutkan percakapan pada Giliran {n}, tetapi saat itu ketegangan belum diakui. Mengakui ketegangan lebih dulu membuka ruang untuk memperbaiki hubungan.',
    'janji-mutlak':
      'Anda ingin menenangkan pada Giliran {n}. Janji yang bersifat mutlak tidak dapat dijamin dan melanggar batas peran konselor. Menjelaskan batas kerahasiaan dengan jujur lebih menjaga kepercayaan.',
    'pengamatan-menilai':
      'Pada Giliran {n} Anda berbagi pengamatan, tetapi nadanya terdengar menilai, dan kepercayaan {delta}. Menyebut hal yang terlihat secara faktual terasa lebih netral.',
    'refleksi-meleset':
      'Anda sudah mencoba menangkap perasaan pada Giliran {n}, tetapi tebakan belum pas dan kepercayaan {delta}. Mengecek kembali ketepatan tebakan memberi kesempatan untuk meluruskan.',
    'tertutup-beruntun':
      'Pada Giliran {n} Anda kembali memakai pertanyaan tertutup secara berurutan. Pertanyaan terbuka memberi ruang cerita yang lebih luas.',
    'batas-terlambat':
      'Pada Giliran {n} pembicaraan sudah masuk ke wilayah yang sensitif, sementara batas kerahasiaan belum dijelaskan. Menjelaskannya lebih awal membantu menjaga rasa aman.',
    'trust-turun':
      'Pada Giliran {n} kepercayaan {delta}. Anda sudah bertahan dalam percakapan; menengok kembali momen ini dapat menunjukkan apa yang bisa disesuaikan.',
    umum:
      'Giliran {n} bisa menjadi titik latihan: Anda sudah melangkah, dan satu kalimat tambahan yang mengundang cerita dapat memperdalam percakapan.',
  },
  /** Alternatif kalimat orisinal (digabung dengan samplePrompts keterampilan terkait). */
  alternatives: {
    'pertanyaan-terbuka': [
      'Boleh ceritakan lebih banyak tentang apa yang paling kamu rasakan akhir-akhir ini?',
      'Kalau kamu ingin berbagi, bagian mana dari situasi ini yang paling ingin kamu bicarakan?',
    ],
    'validasi-normalisasi': [
      'Wajar kalau hal itu terasa berat; kamu tidak harus langsung menjelaskan semuanya.',
      'Terima kasih sudah mau bercerita. Perasaan seperti itu bisa dipahami.',
    ],
    'refleksi-perasaan': [
      'Sepertinya ada beban yang cukup terasa di sini. Apakah tangkapanku sudah tepat?',
      'Aku menangkap ada rasa lelah di balik ceritamu. Betulkah begitu?',
    ],
    'batas-kerahasiaan': [
      'Sebelum kita lanjut: yang kamu ceritakan kujaga, kecuali ada hal yang menyangkut keselamatan. Bagaimana menurutmu?',
      'Aku ingin jelas soal batas kerahasiaan kita, agar kamu bisa memutuskan seberapa banyak yang ingin dibagikan.',
    ],
    'sampaikan-pengamatan': [
      'Aku melihat kamu bekerja sendiri cukup lama tadi. Bagaimana pengalamanmu?',
      'Yang kuperhatikan, kamu lebih banyak diam di sesi tadi. Aku penasaran bagaimana rasanya bagimu.',
    ],
    'akui-ketegangan': [
      'Sepertinya ucapanku tadi membuat suasana jadi tegang. Maaf, boleh aku ulangi dengan lebih pelan?',
      'Aku merasa percakapan kita jadi kaku sejak tadi. Boleh kita berhenti sebentar dan memulai lagi?',
    ],
  } as Record<string, string[]>,
  /** Latihan fokus per butir rubrik. */
  drill: {
    sasaran: {
      title: 'Latihan: memilih sasaran dengan hati-hati',
      instruction:
        'Sebelum mendekati seseorang, tuliskan dua pengamatan faktual yang mendukung alasan Anda. Dekati dengan undangan, bukan paksaan, dan terima bila ia memilih menyendiri.',
    },
    'jalur-kontak': {
      title: 'Latihan: mencocokkan jalur kontak',
      instruction:
        'Sebelum memilih jalur kontak, nilai dulu tiga hal: seberapa besar rasa malu atau stigma, seberapa cemas ia dalam keramaian, dan seberapa terlihat kontak itu oleh orang lain. Pilih jalur yang paling privat bila ragu.',
    },
    'kualitas-pertanyaan': {
      title: 'Latihan: bertanya terbuka dan merefleksikan',
      instruction:
        'Ganti setiap pertanyaan tertutup dengan pertanyaan terbuka, lalu lanjutkan dengan satu refleksi perasaan atau parafrase sebelum bertanya lagi.',
    },
    'kesalahan-fatal': {
      title: 'Latihan: menahan desakan dan saran dini',
      instruction:
        'Saat ingin langsung memberi saran atau mendesak jawaban, tarik napas dan ucapkan satu kalimat validasi lebih dulu. Simpan saran sampai perasaan benar-benar dipahami.',
    },
    'keretakan-perbaikan': {
      title: 'Latihan: mengakui dan memperbaiki ketegangan',
      instruction:
        'Begitu suasana terasa menegang, akui secara singkat ("Sepertinya ucapanku tadi kurang pas"), akui dampaknya, lalu beri pilihan bagaimana percakapan dilanjutkan.',
    },
    'kerahasiaan-peran': {
      title: 'Latihan: menjelaskan kerahasiaan dan batas peran',
      instruction:
        'Jelaskan batas kerahasiaan pada awal sesi sebelum pembicaraan sensitif, hindari janji mutlak, dan hanya janjikan tindak lanjut yang pasti dapat Anda tepati.',
    },
    ritme: {
      title: 'Latihan: menjaga ritme dan memberi ruang',
      instruction:
        'Sisipkan satu jeda atau pernyataan tanpa tuntutan setiap dua sampai tiga giliran. Jangan mendorong ke level yang lebih dalam sebelum ada tanda kesiapan.',
    },
    'catatan-pengamatan': {
      title: 'Latihan: memisahkan fakta dan tafsir',
      instruction:
        'Tulis catatan dalam dua kolom: apa yang terlihat atau terdengar (tanpa kata penilaian), dan apa tafsiran Anda. Hindari kata seperti "malas" atau "sombong" di kolom fakta.',
    },
  } as Record<RubricItemId, { title: string; instruction: string }>,
} as const;

const RUBRIC_ITEM_ORDER: readonly RubricItemId[] = [
  'sasaran',
  'jalur-kontak',
  'kualitas-pertanyaan',
  'kesalahan-fatal',
  'keretakan-perbaikan',
  'kerahasiaan-peran',
  'ritme',
  'catatan-pengamatan',
];

/* =========================================================
 * Utilitas teks
 * ========================================================= */

const QUOTE_MAX = 80;
const TURN_REF_RE = /Giliran\s+(\d+)/g;

function fill(template: string, n: number, delta: number): string {
  return template.replace(/\{n\}/g, String(n)).replace(/\{delta\}/g, deltaPhrase(delta));
}

function deltaPhrase(delta: number): string {
  const rounded = Math.round(Math.abs(delta) * 10) / 10;
  if (rounded === 0) return 'tidak berubah';
  return delta > 0 ? `naik ${rounded} poin` : `turun ${rounded} poin`;
}

/**
 * Kutipan awalan dari counselorText: selalu substring dari teks aslinya, dipotong
 * sebelum pola "Giliran N" atau tanda kutip lengkung agar tidak merusak validator.
 */
function makeQuote(text: string): { quote: string; truncated: boolean } {
  const source = (text ?? '').trim();
  if (!source) return { quote: '', truncated: false };
  const cut = source.search(/Giliran\s+\d+|[“”]/i);
  let candidate = cut >= 0 ? source.slice(0, cut) : source;
  let truncated = cut >= 0;
  if (candidate.length > QUOTE_MAX) {
    candidate = candidate.slice(0, QUOTE_MAX);
    truncated = true;
  }
  candidate = candidate.trim();
  return { quote: candidate, truncated: truncated && candidate.length > 0 };
}

function withQuote(core: string, counselorText: string): string {
  const { quote, truncated } = makeQuote(counselorText);
  if (!quote) return core;
  return `${core} ${SUPERVISOR_TEMPLATES.quoteLead} “${quote}”${truncated ? ' …' : ''}`;
}

function stripQuotes(text: string): string {
  return text.replace(/“[^”]*”/g, ' ');
}

function containsForbiddenTerm(text: string): boolean {
  const lower = text.toLowerCase();
  return FORBIDDEN_DIAGNOSIS_TERMS.some((term) => lower.includes(term));
}

function samplePrompts(skillId: CounselorSkillId | string): string[] {
  const spec = COUNSELOR_SKILLS.find((s) => s.id === skillId);
  return spec ? [...spec.samplePrompts] : [];
}

function pickAlternative(key: string, turnNumber: number): string {
  const extra = SUPERVISOR_TEMPLATES.alternatives[key] ?? [];
  const options = [...samplePrompts(key), ...extra];
  if (options.length === 0) return SUPERVISOR_TEMPLATES.alternatives['pertanyaan-terbuka'][0];
  return options[Math.abs(turnNumber) % options.length];
}

function collectRefs(text: string): number[] {
  const refs: number[] = [];
  const re = new RegExp(TURN_REF_RE.source, 'g');
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) refs.push(Number(match[1]));
  return refs;
}

function itemRefs(item: FeedbackItem): number[] {
  return [item.turnNumber, ...collectRefs(item.text), ...collectRefs(item.alternative ?? '')];
}

/* =========================================================
 * Validator
 * ========================================================= */

export function validateFeedbackTurns(
  feedback: SupervisorFeedback,
  transcript: DebriefTurn[]
): { valid: boolean; invalidTurns: number[] } {
  const known = new Set(transcript.map((t) => t.turnNumber));
  const found = new Set<number>();
  const check = (n: number) => {
    if (!known.has(n)) found.add(n);
  };

  for (const item of [...feedback.strengths, ...feedback.opportunities]) {
    itemRefs(item).forEach(check);
  }
  if (feedback.drill) {
    if (feedback.drill.turnNumber !== null) check(feedback.drill.turnNumber);
    collectRefs(feedback.drill.title).forEach(check);
    collectRefs(feedback.drill.instruction).forEach(check);
  }
  if (feedback.message) collectRefs(feedback.message).forEach(check);

  const invalidTurns = [...found].sort((a, b) => a - b);
  return { valid: invalidTurns.length === 0, invalidTurns };
}

/* =========================================================
 * Kandidat
 * ========================================================= */

interface Candidate {
  priority: number;
  absDelta: number;
  turn: DebriefTurn;
  item: FeedbackItem;
}

function turnDelta(t: DebriefTurn): number {
  return t.trustAfter - t.trustBefore;
}

function compareCandidates(a: Candidate, b: Candidate): number {
  if (a.priority !== b.priority) return a.priority - b.priority;
  if (a.absDelta !== b.absDelta) return b.absDelta - a.absDelta;
  return a.turn.turnNumber - b.turn.turnNumber;
}

function strengthItem(key: keyof typeof SUPERVISOR_TEMPLATES.strength, t: DebriefTurn, delta: number): FeedbackItem {
  const core = fill(SUPERVISOR_TEMPLATES.strength[key], t.turnNumber, delta);
  return {
    kind: 'kekuatan',
    turnNumber: t.turnNumber,
    text: withQuote(core, t.counselorText),
    source: 'kandidat',
  };
}

function opportunityItem(
  key: keyof typeof SUPERVISOR_TEMPLATES.opportunity,
  altKey: string,
  t: DebriefTurn,
  delta: number
): FeedbackItem {
  const core = fill(SUPERVISOR_TEMPLATES.opportunity[key], t.turnNumber, delta);
  return {
    kind: 'peluang',
    turnNumber: t.turnNumber,
    text: withQuote(core, t.counselorText),
    alternative: pickAlternative(altKey, t.turnNumber),
    source: 'kandidat',
  };
}

function buildStrengthCandidates(input: SupervisorInput, byTurn: Map<number, DebriefTurn>): Candidate[] {
  const { transcript, keyPoints } = input;
  const out: Candidate[] = [];
  const push = (priority: number, t: DebriefTurn, delta: number, key: keyof typeof SUPERVISOR_TEMPLATES.strength) =>
    out.push({ priority, absDelta: Math.abs(delta), turn: t, item: strengthItem(key, t, delta) });

  for (const kp of keyPoints) {
    const t = byTurn.get(kp.turnNumber);
    if (!t) continue;
    if (kp.kind === 'perbaikan') push(1, t, kp.trustDelta, 'perbaikan');
    else if (kp.kind === 'trust-naik-tajam') push(3, t, kp.trustDelta, 'trust-naik');
  }

  const firstSensitive = transcript.find((t) => t.levelAfter >= 2)?.turnNumber ?? Infinity;

  for (const t of transcript) {
    const d = turnDelta(t);
    const opened = t.levelAfter > t.levelBefore;
    if (t.kind === 'akui-ketegangan') push(2, t, d, 'akui-ketegangan');
    if (t.skillId === 'batas-kerahasiaan' && d > 0 && t.turnNumber <= firstSensitive) {
      push(4, t, d, 'batas-kerahasiaan');
    }
    if (t.skillId === 'refleksi-perasaan' && opened) push(5, t, d, 'refleksi-membuka');
    if (t.skillId === 'pertanyaan-terbuka' && opened) push(6, t, d, 'terbuka-membuka');
    if (t.skillId === 'jeda-hening' && d > 0) push(7, t, d, 'beri-ruang');
    if (t.kind === 'janji-tindak-lanjut') push(8, t, d, 'janji');
    if (t.kind === 'keterampilan' && d > 0 && t.skillId !== null && !isHindrance(t.skillId)) {
      push(9, t, d, 'rapport');
    }
  }
  return out;
}

function isHindrance(id: CounselorSkillId): boolean {
  return id === 'interogasi' || id === 'nasihat-dini' || id === 'meremehkan' || id === 'janji-mutlak';
}

function buildOpportunityCandidates(input: SupervisorInput, byTurn: Map<number, DebriefTurn>): Candidate[] {
  const { transcript, keyPoints } = input;
  const out: Candidate[] = [];
  const push = (
    priority: number,
    t: DebriefTurn,
    delta: number,
    key: keyof typeof SUPERVISOR_TEMPLATES.opportunity,
    altKey: string
  ) => out.push({ priority, absDelta: Math.abs(delta), turn: t, item: opportunityItem(key, altKey, t, delta) });

  // Keretakan terbuka yang belum diakui (pemindaian berurutan).
  let open = keyPoints.some((kp) => kp.kind === 'keretakan' && kp.turnNumber === 0);
  let recognized = false;
  let prevSkill: CounselorSkillId | null = null;
  const firstSensitiveTurn = transcript.find((t) => t.levelAfter >= 2);

  for (const t of transcript) {
    const d = turnDelta(t);
    if (t.skillId === 'meremehkan') push(1, t, d, 'meremehkan', 'validasi-normalisasi');
    if (t.skillId === 'interogasi') push(1, t, d, 'interogasi', 'pertanyaan-terbuka');
    if (t.skillId === 'nasihat-dini' && t.levelBefore < 2) push(2, t, d, 'nasihat-dini', 'refleksi-perasaan');
    if (t.kind === 'keterampilan' && open && !recognized) {
      push(3, t, d, 'tanpa-pengakuan', 'akui-ketegangan');
    }
    if (t.skillId === 'janji-mutlak') push(4, t, d, 'janji-mutlak', 'batas-kerahasiaan');
    if (t.skillId === 'sampaikan-pengamatan' && d < 0) {
      push(5, t, d, 'pengamatan-menilai', 'sampaikan-pengamatan');
    }
    if (t.skillId === 'refleksi-perasaan' && d < 0) push(6, t, d, 'refleksi-meleset', 'refleksi-perasaan');
    if (t.skillId === 'pertanyaan-tertutup' && prevSkill === 'pertanyaan-tertutup') {
      push(7, t, d, 'tertutup-beruntun', 'pertanyaan-terbuka');
    }
    prevSkill = t.kind === 'keterampilan' ? t.skillId : null;

    if (t.ruptureTriggered) {
      open = true;
      recognized = false;
    }
    if (t.kind === 'akui-ketegangan') recognized = true;
    if (t.ruptureRepaired) open = false;
  }

  if (
    firstSensitiveTurn &&
    !transcript.some((t) => t.skillId === 'batas-kerahasiaan' && t.turnNumber <= firstSensitiveTurn.turnNumber)
  ) {
    push(8, firstSensitiveTurn, turnDelta(firstSensitiveTurn), 'batas-terlambat', 'batas-kerahasiaan');
  }

  for (const kp of keyPoints) {
    if (kp.kind !== 'trust-turun-tajam') continue;
    const t = byTurn.get(kp.turnNumber);
    if (t) push(9, t, kp.trustDelta, 'trust-turun', 'validasi-normalisasi');
  }
  return out;
}

function pickTop(candidates: Candidate[], limit: number): FeedbackItem[] {
  const sorted = [...candidates].sort(compareCandidates);
  const usedTurns = new Set<number>();
  const picked: FeedbackItem[] = [];
  for (const c of sorted) {
    if (picked.length >= limit) break;
    if (usedTurns.has(c.turn.turnNumber)) continue;
    usedTurns.add(c.turn.turnNumber);
    picked.push(c.item);
  }
  return picked;
}

/* =========================================================
 * Templat umum (filler)
 * ========================================================= */

/** Tiga giliran umum: pertama, tengah (ceil(n/2)), terakhir; diulang bila n < 3. */
function fillerTurns(transcript: DebriefTurn[]): DebriefTurn[] {
  const n = transcript.length;
  if (n === 0) return [];
  const idx = [0, Math.ceil(n / 2) - 1, n - 1];
  return idx.map((i) => transcript[i]);
}

function fillerItem(kind: 'kekuatan' | 'peluang', t: DebriefTurn): FeedbackItem {
  if (kind === 'kekuatan') {
    return {
      kind,
      turnNumber: t.turnNumber,
      text: withQuote(fill(SUPERVISOR_TEMPLATES.strength.umum, t.turnNumber, 0), t.counselorText),
      source: 'templat-umum',
    };
  }
  return {
    kind,
    turnNumber: t.turnNumber,
    text: withQuote(fill(SUPERVISOR_TEMPLATES.opportunity.umum, t.turnNumber, 0), t.counselorText),
    alternative: pickAlternative('pertanyaan-terbuka', t.turnNumber),
    source: 'templat-umum',
  };
}

function isItemSound(item: FeedbackItem, known: Set<number>): boolean {
  if (!itemRefs(item).every((n) => known.has(n))) return false;
  if (containsForbiddenTerm(stripQuotes(item.text))) return false;
  if (item.alternative && containsForbiddenTerm(item.alternative)) return false;
  if (item.kind === 'peluang' && !item.alternative) return false;
  return true;
}

function completeItems(
  kind: 'kekuatan' | 'peluang',
  items: FeedbackItem[],
  transcript: DebriefTurn[],
  known: Set<number>
): FeedbackItem[] {
  const kept = items.filter((i) => isItemSound(i, known)).slice(0, 3);
  const fillers = fillerTurns(transcript);
  const result = [...kept];
  while (result.length < 3) {
    const used = new Set(result.map((i) => i.turnNumber));
    const slot = result.length;
    const turn = fillers.find((f) => !used.has(f.turnNumber)) ?? fillers[slot % fillers.length];
    result.push(fillerItem(kind, turn));
  }
  return result;
}

/* =========================================================
 * Latihan fokus
 * ========================================================= */

function buildDrill(input: SupervisorInput, known: Set<number>): FocusDrill {
  const { rubric } = input;
  const items = RUBRIC_ITEM_ORDER.map((id) => rubric.items.find((i) => i.id === id)).filter(
    (i): i is NonNullable<typeof i> => Boolean(i)
  );
  const pool = items.filter((i) => !i.neutral);
  const source = pool.length > 0 ? pool : items;

  let target: (typeof items)[number] | undefined;
  for (const item of source) {
    if (!target || item.score < target.score) target = item; // seri: urutan butir
  }
  const itemId: RubricItemId = target?.id ?? RUBRIC_ITEM_ORDER[0];

  const evidence =
    target?.details
      .flatMap((d) => d.turnNumbers ?? [])
      .find((n) => known.has(n)) ?? null;

  const tpl = SUPERVISOR_TEMPLATES.drill[itemId];
  const instruction = evidence !== null ? `Mulai dari Giliran ${evidence}. ${tpl.instruction}` : tpl.instruction;
  return { itemId, title: tpl.title, instruction, turnNumber: evidence };
}

/* =========================================================
 * Generator
 * ========================================================= */

export function generateSupervisorFeedback(input: SupervisorInput): SupervisorFeedback {
  const transcript = input.transcript ?? [];
  if (transcript.length === 0) {
    return {
      insufficient: true,
      message: INSUFFICIENT_MESSAGE,
      strengths: [],
      opportunities: [],
      drill: null,
    };
  }

  const known = new Set(transcript.map((t) => t.turnNumber));
  const byTurn = new Map(transcript.map((t) => [t.turnNumber, t] as const));
  // Key_Point dengan nomor Turn di luar Transcript (termasuk 0) dibuang sebelum diperingkat.
  const safeInput: SupervisorInput = {
    ...input,
    transcript,
    keyPoints: (input.keyPoints ?? []).filter((kp) => known.has(kp.turnNumber) || kp.turnNumber === 0),
  };

  const drill = buildDrill(safeInput, known);
  let feedback: SupervisorFeedback = {
    insufficient: false,
    message: null,
    strengths: completeItems('kekuatan', pickTop(buildStrengthCandidates(safeInput, byTurn), 3), transcript, known),
    opportunities: completeItems(
      'peluang',
      pickTop(buildOpportunityCandidates(safeInput, byTurn), 3),
      transcript,
      known
    ),
    drill,
  };

  // Validasi, buang butir tidak valid, ganti templat umum, ulangi.
  for (let pass = 0; pass < 2; pass++) {
    const result = validateFeedbackTurns(feedback, transcript);
    if (result.valid) break;
    feedback = {
      ...feedback,
      strengths: completeItems('kekuatan', feedback.strengths, transcript, known),
      opportunities: completeItems('peluang', feedback.opportunities, transcript, known),
      // Latihan hanya merujuk giliran yang diverifikasi di buildDrill; bila tetap tidak valid, lepas rujukannya.
      drill: { ...drill, turnNumber: null, instruction: SUPERVISOR_TEMPLATES.drill[drill.itemId].instruction },
    };
  }
  return feedback;
}

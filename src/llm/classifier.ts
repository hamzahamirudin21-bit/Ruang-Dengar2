import type {
  CounselorInputClassification,
  CounselorSkillId,
  DialogueEngineMode,
  DisclosureLevel,
} from '../types';
import {
  buildClassificationCacheKey,
  getCachedClassification,
  setCachedClassification,
} from './cache';
import { postJsonWithTimeout } from './client';
import { LLM_CONFIG } from './config';
import { recordLlmAuditEntry } from './logger';
import {
  detectForbiddenTopicsLocally,
  detectPromptInjectionLocally,
  validateClassificationOutput,
} from './validator';

interface OfflineRule {
  skill: CounselorSkillId;
  tone: CounselorInputClassification['nada'];
  quality: number;
  keywords: string[];
  reason: string;
}

const OFFLINE_CLASSIFICATION_RULES: readonly OfflineRule[] = [
  {
    skill: 'meremehkan',
    tone: 'menghakimi',
    quality: 0.1,
    keywords: [
      'lebay', 'manja', 'segitu aja', 'anak lain juga', 'teman lain bisa',
      'cuma segitu', 'lemah', 'terlalu baper', 'alasan saja', 'malas',
    ],
    reason: 'Terdeteksi ungkapan membandingkan atau mengecilkan beban mahasiswa.',
  },
  {
    skill: 'interogasi',
    tone: 'menghakimi',
    quality: 0.15,
    keywords: [
      'kenapa tidak langsung', 'kenapa baru bilang', 'jawab saja', 'siapa yang salah',
      'akui saja', 'mengaku', 'harus jawab sekarang', 'jangan menghindar',
      'apa alasanmu sebenarnya',
    ],
    reason: 'Terdeteksi nada mendesak atau menuntut pengakuan cepat.',
  },
  {
    skill: 'janji-mutlak',
    tone: 'netral',
    quality: 0.2,
    keywords: [
      'jamin 100%', 'dijamin aman', 'pasti beres', 'pasti lulus', 'jamin nilaimu',
      'tidak akan pernah ada', 'janji mutlak',
    ],
    reason: 'Terdeteksi janji hasil atau kerahasiaan absolut yang melanggar batas etik.',
  },
  {
    skill: 'nasihat-dini',
    tone: 'netral',
    quality: 0.25,
    keywords: [
      'harusnya kamu', 'sebaiknya kamu langsung', 'tinggal bilang saja', 'cukup atur jadwal',
      'kamu harus', 'saran saya lakukan', 'ikuti saja cara', 'jangan dipikirkan',
    ],
    reason: 'Terdeteksi pemberian solusi/nasihat langsung sebelum eksplorasi perasaan.',
  },
  {
    skill: 'batas-kerahasiaan',
    tone: 'hangat',
    quality: 0.88,
    keywords: [
      'kerahasiaan', 'rahasia', 'tidak akan dibocorkan', 'tidak dilaporkan ke dosen',
      'izinmu', 'persetujuanmu', 'batas etik', 'privasi terjaga', 'keselamatan',
    ],
    reason: 'Menjelaskan ruang aman dan batas kerahasiaan sesi.',
  },
  {
    skill: 'refleksi-perasaan',
    tone: 'hangat',
    quality: 0.9,
    keywords: [
      'merasa tertekan', 'kedengarannya kamu merasa', 'terasa cemas', 'terasa lelah',
      'terasa berat', 'kecewa ya', 'khawatir ya', 'capek banget ya', 'minder',
      'kewalahan', 'terbebani', 'serba salah',
    ],
    reason: 'Merefleksikan emosi dan perasaan di balik cerita mahasiswa.',
  },
  {
    skill: 'validasi-normalisasi',
    tone: 'hangat',
    quality: 0.82,
    keywords: [
      'wajar sekali', 'bisa dimengerti', 'masuk akal kalau', 'normal merasa',
      'wajar kok', 'manusiawi',
    ],
    reason: 'Menormalisasi dan memvalidasi pengalaman mahasiswa tanpa menghakimi.',
  },
  {
    skill: 'afirmasi-kekuatan',
    tone: 'hangat',
    quality: 0.84,
    keywords: [
      'ketelitianmu', 'usaha kerasmu', 'kekuatanmu', 'kelebihanmu', 'kesungguhanmu',
      'konsisten', 'terlihat kamu peduli', 'apresiasi',
    ],
    reason: 'Mengafirmasi kekuatan atau usaha nyata mahasiswa.',
  },
  {
    skill: 'parafrase-ringkasan',
    tone: 'hangat',
    quality: 0.8,
    keywords: [
      'jadi sejauh yang aku tangkap', 'kalau boleh kurangkum', 'intinya tadi',
      'berarti poin utamanya', 'benar begitu', 'jadi intinya kamu',
    ],
    reason: 'Merangkum atau memparafrasekan inti cerita mahasiswa.',
  },
  {
    skill: 'sampaikan-pengamatan',
    tone: 'netral',
    quality: 0.72,
    keywords: [
      'aku perhatikan tadi', 'tadi kulihat', 'teramati di lab', 'aku melihat kamu',
      'tampak duduk sendirian',
    ],
    reason: 'Menyampaikan pengamatan perilaku secara deskriptif.',
  },
  {
    skill: 'jeda-hening',
    tone: 'hangat',
    quality: 0.7,
    keywords: [
      'jeda', 'hening', 'tarik napas', 'pelan-pelan saja', 'ambil waktu sebentar',
      'tidak usah buru-buru',
    ],
    reason: 'Memberikan ruang tenang tanpa mendesak mahasiswa.',
  },
  {
    skill: 'pertanyaan-terbuka',
    tone: 'hangat',
    quality: 0.82,
    keywords: [
      'bagian mana', 'bagaimana perasaanmu', 'apa yang paling', 'ceritakan sedikit',
      'boleh ceritakan', 'seperti apa situasinya', 'apa yang membuat', 'gimana ceritanya',
    ],
    reason: 'Mengundang mahasiswa bercerita lebih luas lewat pertanyaan terbuka.',
  },
  {
    skill: 'sapaan-hangat',
    tone: 'hangat',
    quality: 0.78,
    keywords: [
      'halo', 'selamat pagi', 'selamat siang', 'selamat sore', 'apa kabar', 'gimana kabarmu',
      'gimana kabar', 'kabarnya', 'lagi santai', 'gimana hari ini', 'hai ', 'senang bisa ngobrol',
    ],
    reason: 'Menyapa dengan hangat untuk membangun kenyamanan awal.',
  },
  {
    skill: 'pertanyaan-tertutup',
    tone: 'netral',
    quality: 0.48,
    keywords: ['apakah benar', 'jam berapa', 'sudah atau belum', 'ya atau tidak', 'kan?'],
    reason: 'Mengajukan pertanyaan tertutup yang mengarah pada jawaban singkat.',
  },
];

/**
 * Pengklasifikasi kata kunci deterministik untuk mode offline / Cadangan aturan.
 */
export function classifyCounselorInputOffline(
  counselorText: string
): CounselorInputClassification {
  const forbidden = detectForbiddenTopicsLocally(counselorText);
  if (forbidden.forbidden) {
    return {
      keterampilan: 'pertanyaan-terbuka',
      kualitas: 0,
      nada: 'netral',
      menyentuh_topik_terlarang: true,
      forbiddenTopicCategory: forbidden.category,
      alasan_singkat: 'Menyentuh topik krisis keselamatan di luar cakupan simulator.',
      source: 'cadangan-aturan',
    };
  }

  if (detectPromptInjectionLocally(counselorText)) {
    return {
      keterampilan: 'interogasi',
      kualitas: 0.05,
      nada: 'menghakimi',
      menyentuh_topik_terlarang: false,
      forbiddenTopicCategory: null,
      alasan_singkat: 'Perintah mendesak untuk membuka seluruh rahasia ditolak mesin.',
      source: 'cadangan-aturan',
    };
  }

  const norm = ` ${counselorText.toLowerCase().trim()} `;
  for (const rule of OFFLINE_CLASSIFICATION_RULES) {
    if (rule.keywords.some((kw) => norm.includes(kw))) {
      return {
        keterampilan: rule.skill,
        kualitas: rule.quality,
        nada: rule.tone,
        menyentuh_topik_terlarang: false,
        forbiddenTopicCategory: null,
        alasan_singkat: rule.reason,
        source: 'cadangan-aturan',
      };
    }
  }

  // Heuristik tanda tanya terbuka vs ambigu
  const words = counselorText.trim().split(/\s+/).filter(Boolean);
  if (words.length < 2) {
    return {
      keterampilan: 'sapaan-hangat',
      kualitas: 0.5,
      nada: 'netral',
      menyentuh_topik_terlarang: false,
      forbiddenTopicCategory: null,
      alasan_singkat: 'Masukan terlalu singkat pada mode offline.',
      source: 'cadangan-aturan',
      ambiguousOffline: true,
    };
  }

  if (norm.includes('?') && (norm.includes('apa') || norm.includes('bagaimana') || norm.includes('gimana'))) {
    return {
      keterampilan: 'pertanyaan-terbuka',
      kualitas: 0.72,
      nada: 'hangat',
      menyentuh_topik_terlarang: false,
      forbiddenTopicCategory: null,
      alasan_singkat: 'Kalimat mengandung pertanyaan eksploratif.',
      source: 'cadangan-aturan',
    };
  }

  if (norm.includes('?')) {
    return {
      keterampilan: 'pertanyaan-tertutup',
      kualitas: 0.45,
      nada: 'netral',
      menyentuh_topik_terlarang: false,
      forbiddenTopicCategory: null,
      alasan_singkat: 'Kalimat berbentuk pertanyaan singkat.',
      source: 'cadangan-aturan',
    };
  }

  return {
    keterampilan: 'sapaan-hangat',
    kualitas: 0.55,
    nada: 'netral',
    menyentuh_topik_terlarang: false,
    forbiddenTopicCategory: null,
    alasan_singkat: 'Kalimat bersifat netral/membuka percakapan ringan.',
    source: 'cadangan-aturan',
    ambiguousOffline: words.length < 4,
  };
}

/**
 * Klasifikasi keterampilan konseling dari masukan bebas konselor secara hibrida:
 * - Cek topik terlarang & injeksi terlebih dahulu (kode murni)
 * - Cek cache ber-seed (menjamin ketikan sama + seed sama -> keputusan mesin sama)
 * - Jika mode Gemini & bukan Mode Rekaman, panggil /api/gemini/classify (timeout 8s, 1x retry)
 * - Jatuh balik mulus ke pencocokan kata kunci offline bila gagal/offline
 */
export async function classifyCounselorInputHybrid(params: {
  counselorText: string;
  mode: DialogueEngineMode;
  recordingMode: boolean;
  seed: number;
  agentId: string;
  unlockedLevel: DisclosureLevel;
}): Promise<CounselorInputClassification> {
  const { counselorText, mode, recordingMode, seed, agentId, unlockedLevel } = params;

  // 1. Pemeriksaan keselamatan & injeksi deterministik di sisi mesin
  const forbidden = detectForbiddenTopicsLocally(counselorText);
  if (forbidden.forbidden) {
    const blocked: CounselorInputClassification = {
      keterampilan: 'pertanyaan-terbuka',
      kualitas: 0,
      nada: 'netral',
      menyentuh_topik_terlarang: true,
      forbiddenTopicCategory: forbidden.category,
      alasan_singkat: 'Topik krisis keselamatan terdeteksi di luar cakupan simulator.',
      source: 'cadangan-aturan',
    };
    recordLlmAuditEntry({
      callKind: 'klasifikasi-masukan',
      modeUsed: 'cadangan-aturan',
      sanitizedInputCard: {
        levelSaatIni: unlockedLevel,
        panjangKata: counselorText.trim().split(/\s+/).length,
        deteksiLokal: 'topik-terlarang',
      },
      rawOutput: blocked,
      validatorPassed: true,
      validatorReasons: [],
      retried: false,
      latencyMs: 0,
    });
    return blocked;
  }

  if (detectPromptInjectionLocally(counselorText)) {
    const injectionResult: CounselorInputClassification = {
      keterampilan: 'interogasi',
      kualitas: 0.05,
      nada: 'menghakimi',
      menyentuh_topik_terlarang: false,
      forbiddenTopicCategory: null,
      alasan_singkat: 'Upaya injeksi aturan/mendesak seluruh rahasia ditahan oleh pengaman.',
      source: 'cadangan-aturan',
    };
    recordLlmAuditEntry({
      callKind: 'klasifikasi-masukan',
      modeUsed: 'cadangan-aturan',
      sanitizedInputCard: {
        levelSaatIni: unlockedLevel,
        deteksiLokal: 'injeksi-aturan',
      },
      rawOutput: injectionResult,
      validatorPassed: true,
      validatorReasons: [],
      retried: false,
      latencyMs: 0,
    });
    return injectionResult;
  }

  // 2. Cek cache ber-seed (untuk Mode Rekaman & konsistensi keputusan identik pada seed sama)
  const cacheKey = buildClassificationCacheKey({
    seed,
    agentId,
    level: unlockedLevel,
    counselorText,
  });
  const cached = getCachedClassification(cacheKey);
  if (cached) {
    recordLlmAuditEntry({
      callKind: 'klasifikasi-masukan',
      modeUsed: 'cache',
      sanitizedInputCard: { levelSaatIni: unlockedLevel, cacheHit: true },
      rawOutput: cached,
      validatorPassed: true,
      validatorReasons: [],
      retried: false,
      latencyMs: 0,
    });
    return cached;
  }

  // 3. Jika offline / Mode Rekaman tanpa cache -> pakai aturan kata kunci lokal
  if (mode === 'cadangan-aturan' || recordingMode) {
    const offline = classifyCounselorInputOffline(counselorText);
    setCachedClassification(cacheKey, offline);
    recordLlmAuditEntry({
      callKind: 'klasifikasi-masukan',
      modeUsed: 'cadangan-aturan',
      sanitizedInputCard: { levelSaatIni: unlockedLevel, panjangTeks: counselorText.length },
      rawOutput: offline,
      validatorPassed: true,
      validatorReasons: [],
      retried: false,
      latencyMs: 0,
    });
    return offline;
  }

  // 4. Mode Gemini: panggil /api/gemini/classify dengan 1 kali coba ulang
  let retried = false;
  let lastLatency = 0;
  for (let attempt = 0; attempt <= LLM_CONFIG.maxRetries; attempt += 1) {
    if (attempt > 0) retried = true;
    const res = await postJsonWithTimeout<unknown>(LLM_CONFIG.endpoints.classify, {
      counselorText,
      unlockedLevel,
    });
    lastLatency += res.latencyMs;

    if (res.ok && res.data) {
      const checked = validateClassificationOutput(res.data);
      if (checked.valid && checked.value) {
        const result: CounselorInputClassification = {
          ...checked.value,
          source: 'gemini',
          forbiddenTopicCategory: checked.value.menyentuh_topik_terlarang
            ? 'menyakiti-diri'
            : null,
        };
        setCachedClassification(cacheKey, result);
        recordLlmAuditEntry({
          callKind: 'klasifikasi-masukan',
          modeUsed: 'gemini',
          sanitizedInputCard: { levelSaatIni: unlockedLevel, panjangTeks: counselorText.length },
          rawOutput: res.data,
          validatorPassed: true,
          validatorReasons: [],
          retried,
          latencyMs: lastLatency,
        });
        return result;
      }
    }
  }

  // 5. Fallback otomatis ke offline jika Gemini gagal / timeout / offline
  const fallback = classifyCounselorInputOffline(counselorText);
  setCachedClassification(cacheKey, fallback);
  recordLlmAuditEntry({
    callKind: 'klasifikasi-masukan',
    modeUsed: 'cadangan-aturan',
    sanitizedInputCard: { levelSaatIni: unlockedLevel, fallbackDariGemini: true },
    rawOutput: fallback,
    validatorPassed: true,
    validatorReasons: ['Jatuh balik ke klasifikasi aturan offline setelah panggilan Gemini gagal/timeout.'],
    retried,
    latencyMs: lastLatency,
  });
  return fallback;
}

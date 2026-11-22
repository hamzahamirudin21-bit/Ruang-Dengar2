import { getSkillSpec } from '../data/skillEffects';
import {
  AgentSessionVars,
  AgentTieredProblem,
  CounselorSkillId,
  DisclosureLevel,
  RuptureState,
  StudentAgent,
} from '../types';

export interface DisclosureThresholds {
  l1: number;
  l2: number;
  l3: number;
}

/**
 * Menghitung ambang kepercayaan & kesiapan membuka diri untuk L1, L2, L3
 * secara berbeda per agen berdasarkan watak (swakemandirian, stigma diri, kecemasan sosial, keterbukaan).
 */
export function computeAgentDisclosureThresholds(
  agent: StudentAgent,
  vars: AgentSessionVars
): DisclosureThresholds {
  const resistanceOffset =
    vars.selfReliance * 10 +
    vars.selfStigma * 12 +
    vars.socialAnxiety * 8 -
    agent.personality.openness * 9;

  const l1 = Math.round(Math.max(36, Math.min(58, 44 + resistanceOffset * 0.65)));
  const l2 = Math.round(
    Math.max(l1 + 14, Math.min(78, 62 + resistanceOffset * 0.75))
  );
  const l3 = Math.round(
    Math.max(l2 + 12, Math.min(92, 79 + resistanceOffset * 0.65))
  );

  return { l1, l2, l3 };
}

export interface DisclosureStepResult {
  nextLevel: DisclosureLevel;
  disclosedNewLayer: boolean;
  lockedDownByRupture: boolean;
}

/**
 * Menentukan level keterbukaan baru berdasarkan aturan ketat:
 * - Level tidak boleh naik lebih dari +1 per giliran.
 * - Keterampilan penghambat / penurun kepercayaan tidak pernah menaikkan level.
 * - Saat keretakan terjadi, level yang sudah tercapai dapat terkunci kembali (-1).
 * - Tidak boleh melewati batas level maksimal jalur kontak (mis. Sapa di tempat = L0).
 */
export function evaluateDisclosureStep(params: {
  prevLevel: DisclosureLevel;
  maxAllowedLevel: DisclosureLevel;
  skillId: CounselorSkillId;
  trustDelta: number;
  vars: AgentSessionVars;
  thresholds: DisclosureThresholds;
  rupture: RuptureState;
  justTriggeredRupture: boolean;
}): DisclosureStepResult {
  const {
    prevLevel,
    maxAllowedLevel,
    skillId,
    trustDelta,
    vars,
    thresholds,
    rupture,
    justTriggeredRupture,
  } = params;

  if (justTriggeredRupture || rupture.active) {
    const droppedLevel = (
      justTriggeredRupture && prevLevel > 0 ? prevLevel - 1 : prevLevel
    ) as DisclosureLevel;
    return {
      nextLevel: droppedLevel,
      disclosedNewLayer: false,
      lockedDownByRupture: droppedLevel < prevLevel,
    };
  }

  const spec = getSkillSpec(skillId);
  if (!spec.canRaiseDisclosure || trustDelta <= 0) {
    return {
      nextLevel: prevLevel,
      disclosedNewLayer: false,
      lockedDownByRupture: false,
    };
  }

  if (prevLevel >= maxAllowedLevel) {
    return {
      nextLevel: prevLevel,
      disclosedNewLayer: false,
      lockedDownByRupture: false,
    };
  }

  // Syarat naik ke kandidat level berikutnya (+1 maksimal per giliran)
  const candidate = (prevLevel + 1) as DisclosureLevel;
  const effectiveScore = vars.trust * 0.58 + vars.readiness * 0.42;

  let required = thresholds.l1;
  if (candidate === 2) required = thresholds.l2;
  if (candidate === 3) required = thresholds.l3;

  // Refleksi perasaan sangat membantu membuka pintu L2 apabila skor sudah dekat
  const skillBoost =
    skillId === 'refleksi-perasaan' && candidate === 2
      ? 4
      : skillId === 'pertanyaan-terbuka' && candidate === 1
        ? 3
        : 0;

  if (effectiveScore + skillBoost >= required) {
    return {
      nextLevel: candidate,
      disclosedNewLayer: true,
      lockedDownByRupture: false,
    };
  }

  return {
    nextLevel: prevLevel,
    disclosedNewLayer: false,
    lockedDownByRupture: false,
  };
}

export function buildAgentTemplatedTurnResponse(params: {
  agent: StudentAgent;
  problem: AgentTieredProblem;
  skillId: CounselorSkillId;
  prevLevel: DisclosureLevel;
  nextLevel: DisclosureLevel;
  disclosedNewLayer: boolean;
  trustDelta: number;
  rupture: RuptureState;
  justTriggeredRupture: boolean;
  reflectionIncorrect: boolean;
  accusatoryObservation: boolean;
  alreadyExplainedConfidentiality: boolean;
  maxAllowedLevel: DisclosureLevel;
}): { reply: string; nonverbalCue: string } {
  const {
    agent,
    problem,
    skillId,
    nextLevel,
    disclosedNewLayer,
    trustDelta,
    rupture,
    justTriggeredRupture,
    reflectionIncorrect,
    accusatoryObservation,
    alreadyExplainedConfidentiality,
    maxAllowedLevel,
  } = params;

  // 1. Jika baru terjadi atau sedang dalam kondisi keretakan aktif
  if (justTriggeredRupture || rupture.active) {
    if (rupture.endedEarlyByRupture) {
      return {
        reply:
          'Maaf, kayaknya aku perlu balik ke meja kerja sekarang. Pembicaraannya mulai terasa kurang pas buatku.',
        nonverbalCue: `${agent.name} menutup buku catatannya cepat, berdiri dari kursi, dan berjalan menjauh tanpa menoleh.`,
      };
    }

    if (rupture.kind === 'konfrontasi') {
      if (skillId === 'meremehkan') {
        return {
          reply:
            'Kalau memang dianggap sama saja seperti yang lain dan sepele, buat apa aku ditanya-tanya di sini?',
          nonverbalCue: `${agent.name} menegakkan bahu dengan rahang mengeras, suaranya naik sedikit dan tatapannya tajam.`,
        };
      }
      if (skillId === 'interogasi') {
        return {
          reply:
            'Kenapa nadanya seperti memeriksa kesalahan? Aku datang ke lab buat praktikum, bukan diinterogasi.',
          nonverbalCue: `${agent.name} menyandarkan punggung ke belakang dan menyilangkan kedua lengan rapat-rapat.`,
        };
      }
      return {
        reply:
          'Sebentar—rasanya terlalu cepat menyimpulkan dan menyuruh begitu tanpa dengar dulu bagian yang sebenarnya terjadi.',
        nonverbalCue: `${agent.name} mengerutkan dahi dan menghentikan penjelasannya dengan nada defensif.`,
      };
    }

    // rupture.kind === 'menarik-diri'
    return {
      reply: 'Mmm... enggak ada apa-apa kok. Biasa aja, semuanya masih aman.',
      nonverbalCue: `${agent.name} menunduk memandang ujung meja, menggeser kursinya sedikit menjauh, dan hanya menjawab singkat.`,
    };
  }

  // 2. Jika baru membuka lapisan baru pada tangga keterbukaan
  if (disclosedNewLayer) {
    if (nextLevel === 1) {
      return {
        reply: `Sebenarnya kalau boleh jujur sedikit... ${problem.l1Fact}`,
        nonverbalCue: `${agent.name} berhenti memainkan pulpennya, menarik napas pelan, lalu mulai menatap lebih mantap.`,
      };
    }
    if (nextLevel === 2) {
      return {
        reply: `${problem.l2Feeling}`,
        nonverbalCue: `${agent.name} menurunkan bahunya yang tadi tegang, suaranya lebih pelan dan terasa lebih jujur secara emosional.`,
      };
    }
    if (nextLevel === 3) {
      return {
        reply: `${problem.l3CoreNeed}`,
        nonverbalCue: `${agent.name} menatap konselor dengan tenang dan terbuka, tampak lega karena inti kebutuhannya akhirnya terucap.`,
      };
    }
  }

  // 3. Respons templat spesifik keterampilan ketika belum naik level
  if (skillId === 'refleksi-perasaan' && reflectionIncorrect) {
    return {
      reply:
        'Bukan persis seperti itu sih... rasanya agak beda dari yang barusan ditebak.',
      nonverbalCue: `${agent.name} berkedip singkat dan menggeser posisi duduknya dengan ekspresi agak ragu.`,
    };
  }

  if (skillId === 'sampaikan-pengamatan' && accusatoryObservation) {
    return {
      reply:
        'Aku cuma lagi fokus mengerjakan bagianku sendiri kok, bukan berarti menghindari teman-teman.',
      nonverbalCue: `${agent.name} menegang sebentar dan menjawab dengan nada menjaga jarak.`,
    };
  }

  if (skillId === 'janji-mutlak') {
    return {
      reply:
        'Memangnya bisa dijamin pasti beres begitu? Agak aneh kedengarannya kalau semua bisa dipastikan.',
      nonverbalCue: `${agent.name} memandang dengan alis sedikit terangkat, tampak kurang yakin dengan janji yang terlalu mutlak.`,
    };
  }

  if (skillId === 'batas-kerahasiaan') {
    if (alreadyExplainedConfidentiality) {
      return {
        reply: 'Iya, aku masih ingat penjelasan soal kerahasiaan yang tadi disampaikan.',
        nonverbalCue: `${agent.name} mengangguk singkat.`,
      };
    }
    return {
      reply:
        'Oh... baik, lega juga tahu batas kerahasiaannya jelas dari awal.',
      nonverbalCue: `${agent.name} tampak sedikit lebih rileks dan mengangguk pelan.`,
    };
  }

  if (skillId === 'jeda-hening' && trustDelta < 0) {
    return {
      reply:
        'Eh... aku harus jawab apa ya? Suasananya tiba-tiba hening jadi agak canggung.',
      nonverbalCue: `${agent.name} meremas ujung lengan baju dan melirik jam dinding dengan gelisah.`,
    };
  }

  if (skillId === 'pertanyaan-tertutup') {
    return {
      reply: trustDelta < 0 ? 'Iya, begitu.' : 'Ya, kurang lebih memang di waktu itu.',
      nonverbalCue:
        trustDelta < 0
          ? `${agent.name} menjawab sekenanya tanpa menambahkan keterangan lain.`
          : `${agent.name} mengangguk singkat dan menunggu pertanyaan berikutnya.`,
    };
  }

  if (skillId === 'afirmasi-kekuatan') {
    const potLower =
      agent.uniquePotential.charAt(0).toLowerCase() + agent.uniquePotential.slice(1);
    return {
      reply: `Makasih sudah memperhatikan itu. Di bagian ${potLower}, aku memang berusaha menjaga kualitas sebaik mungkin.`,
      nonverbalCue: `${agent.name} tersenyum tipis dan duduk sedikit lebih tegak.`,
    };
  }

  if (maxAllowedLevel === 0) {
    return {
      reply:
        'Lumayan ramai hari ini di lab, masih kejar target alat juga. Makasih sudah menyapa, nanti kalau ada waktu senggang mungkin bisa ngobrol lebih tenang.',
      nonverbalCue: `${agent.name} membalas sapaan dengan ramah sambil tetap memegang peralatan labnya.`,
    };
  }

  if (nextLevel === 0) {
    return {
      reply:
        'Hari ini kegiatan di stasiun cukup padat seperti biasa. Aku lagi menata urutan kerja biar tidak keteteran.',
      nonverbalCue: `${agent.name} menjawab sopan dengan nada datar, masih menjaga jarak aman.`,
    };
  }

  if (nextLevel === 1) {
    return {
      reply:
        'Kurang lebih situasinya masih berkutat di pembagian tugas dan jadwal alat yang mepet minggu ini.',
      nonverbalCue: `${agent.name} mengangguk pelan, tampak mempertimbangkan apakah aman bercerita lebih dalam.`,
    };
  }

  return {
    reply:
      'Iya, kira-kira memang itu yang paling mengganjal pikiran saat berada di lab belakangan ini.',
    nonverbalCue: `${agent.name} mengangguk pelan dan tetap mempertahankan kontak mata yang tenang.`,
  };
}

export function getQualitativeTrustLabel(trust: number): string {
  if (trust < 35) return 'Rendah (Waspada)';
  if (trust < 60) return 'Sedang (Menjajaki)';
  if (trust < 80) return 'Baik (Cukup Aman)';
  return 'Tinggi (Sangat Terbuka)';
}

export function getQualitativeReadinessLabel(readiness: number): string {
  if (readiness < 35) return 'Tertutup / Menjaga Jarak';
  if (readiness < 60) return 'Mulai Membuka Fakta';
  if (readiness < 80) return 'Siap Berbagi Perasaan';
  return 'Terbuka Penuh';
}

import {
  AgentTieredProblem,
  CounselorSkillId,
  EmotionReflectionNuance,
  HiddenProblemCategory,
  SkillEffectSpec,
  StudentAgent,
} from '../types';

export const COUNSELOR_SKILLS: readonly SkillEffectSpec[] = [
  {
    id: 'sapaan-hangat',
    label: 'Sapaan hangat',
    category: 'rapport',
    shortDescription: 'Menyapa santai tanpa agenda mendesak; aman digunakan di awal (L0).',
    baseEffect: 3,
    canRaiseDisclosure: true,
    samplePrompts: [
      'Halo, lagi santai sebentar ya? Bagaimana suasana praktikum hari ini?',
      'Selamat siang, kebetulan ketemu di sini—kabarmu gimana hari ini?',
    ],
  },
  {
    id: 'pertanyaan-terbuka',
    label: 'Pertanyaan terbuka',
    category: 'rapport',
    shortDescription: 'Mengundang cerita lebih luas (+4; +6 bila dipakai tepat setelah mahasiswa baru mengungkap sesuatu).',
    baseEffect: 4,
    canRaiseDisclosure: true,
    samplePrompts: [
      'Bagian mana dari kegiatan lab minggu ini yang paling terasa menyita perhatianmu?',
      'Boleh ceritakan sedikit bagaimana situasi itu mulai terasa berat buatmu?',
    ],
  },
  {
    id: 'refleksi-perasaan',
    label: 'Refleksi perasaan',
    category: 'rapport',
    shortDescription: 'Menangkap emosi di balik cerita (+7 terutama menuju L2; -3 bila tebakan perasaan meleset).',
    baseEffect: 7,
    canRaiseDisclosure: true,
    samplePrompts: [
      'Kedengarannya situasi itu membuatmu merasa cukup tertekan belakangan ini.',
      'Sepertinya ada rasa kecewa sekaligus lelah yang kamu simpan sendiri ya?',
    ],
  },
  {
    id: 'parafrase-ringkasan',
    label: 'Parafrase / ringkasan',
    category: 'rapport',
    shortDescription: 'Merangkum pokok cerita mahasiswa untuk memastikan pemahaman akurat (+4).',
    baseEffect: 4,
    canRaiseDisclosure: true,
    samplePrompts: [
      'Jadi sejauh yang aku tangkap, fokus utamamu sekarang adalah mengejar target sambil menjaga ritme kerja tim, benar begitu?',
    ],
  },
  {
    id: 'validasi-normalisasi',
    label: 'Validasi / normalisasi',
    category: 'rapport',
    shortDescription: 'Mengakui kewajaran pengalaman (+4; efek kecil +1 bila mahasiswa swakemandiriannya tinggi).',
    baseEffect: 4,
    canRaiseDisclosure: true,
    samplePrompts: [
      'Wajar sekali merasa kewalahan di fase proyek yang padat seperti ini.',
    ],
  },
  {
    id: 'sampaikan-pengamatan',
    label: 'Sampaikan pengamatan',
    category: 'eksplorasi-etik',
    shortDescription: 'Membagikan hal faktual yang terlihat (+3 bila netral; -6 bila terdengar menuduh/menilai).',
    baseEffect: 3,
    canRaiseDisclosure: true,
    samplePrompts: [
      'Aku perhatikan tadi kamu cukup lama bekerja sendirian di pojok stasiun setelah teman-teman lain berpindah.',
    ],
  },
  {
    id: 'afirmasi-kekuatan',
    label: 'Afirmasi kekuatan',
    category: 'rapport',
    shortDescription: 'Mengakui potensi dan usaha nyata mahasiswa tanpa sanjungan berlebihan (+3).',
    baseEffect: 3,
    canRaiseDisclosure: true,
    samplePrompts: [
      'Dari cara kamu menjaga ketelitian alat di lab, terlihat sekali kesungguhanmu pada kualitas kerja.',
    ],
  },
  {
    id: 'jeda-hening',
    label: 'Jeda hening / memberi ruang',
    category: 'eksplorasi-etik',
    shortDescription: 'Memberi ruang jeda tanpa mendesak (+2; -2 pada mahasiswa dengan kecemasan sosial tinggi).',
    baseEffect: 2,
    canRaiseDisclosure: true,
    samplePrompts: [
      '(Memberi jeda tenang beberapa detik sambil menunggu dengan sikap terbuka)',
    ],
  },
  {
    id: 'batas-kerahasiaan',
    label: 'Penjelasan batas kerahasiaan',
    category: 'eksplorasi-etik',
    shortDescription: 'Menjelaskan ruang aman & batas etik kerahasiaan (+4, hanya dihitung sekali per sesi).',
    baseEffect: 4,
    canRaiseDisclosure: true,
    onceOnlyConfidentiality: true,
    samplePrompts: [
      'Apa yang kita bicarakan di sini kujaga kerahasiaannya; tidak ada laporan ke dosen atau teman tanpa persetujuanmu, kecuali jika ada risiko keselamatan.',
    ],
  },
  {
    id: 'pertanyaan-tertutup',
    label: 'Pertanyaan tertutup',
    category: 'eksplorasi-etik',
    shortDescription: 'Pertanyaan ya/tidak atau faktual singkat (-2 per pengulangan berturut-turut; tidak menaikkan level).',
    baseEffect: -2,
    canRaiseDisclosure: false,
    samplePrompts: [
      'Jadi masalahnya terjadi di shift pagi tadi saja, kan?',
    ],
  },
  {
    id: 'interogasi',
    label: 'Interogasi / mendesak',
    category: 'penghambat',
    shortDescription: 'Mendesak pengakuan cepat (-9, memicu keretakan, tidak pernah menaikkan keterbukaan).',
    baseEffect: -9,
    canRaiseDisclosure: false,
    triggersRuptureAlways: true,
    samplePrompts: [
      'Kenapa kamu tidak langsung bilang dari awal kalau ada masalah di kelompokmu?',
    ],
  },
  {
    id: 'nasihat-dini',
    label: 'Nasihat dini / menggurui',
    category: 'penghambat',
    shortDescription: 'Langsung memberi solusi sebelum memahami perasaan (-5 & memicu keretakan sebelum L2; tidak menaikkan level).',
    baseEffect: -5,
    canRaiseDisclosure: false,
    triggersRuptureBeforeL2: true,
    samplePrompts: [
      'Harusnya kamu tinggal bicara tegas saja ke temanmu dan atur jadwal lebih rapi, selesai kan?',
    ],
  },
  {
    id: 'meremehkan',
    label: 'Meremehkan / membandingkan',
    category: 'penghambat',
    shortDescription: 'Mengecilkan beban mahasiswa atau membandingkan dengan teman lain (-12, memicu keretakan).',
    baseEffect: -12,
    canRaiseDisclosure: false,
    triggersRuptureAlways: true,
    samplePrompts: [
      'Beban segitu masih wajar kok, mahasiswa lain juga mengalami hal yang sama dan tetap jalan.',
    ],
  },
  {
    id: 'janji-mutlak',
    label: 'Janji mutlak (melanggar etika)',
    category: 'penghambat',
    shortDescription: 'Menjanjikan hasil atau kerahasiaan absolut yang melanggar batas etik konseling (-3).',
    baseEffect: -3,
    canRaiseDisclosure: false,
    ethicsViolation: true,
    samplePrompts: [
      'Tenang saja, aku jamin 100% nilaimu aman dan masalah ini pasti beres minggu ini.',
    ],
  },
];

export const SKILL_MAP: Record<CounselorSkillId, SkillEffectSpec> = COUNSELOR_SKILLS.reduce(
  (acc, item) => {
    acc[item.id] = item;
    return acc;
  },
  {} as Record<CounselorSkillId, SkillEffectSpec>
);

export function getSkillSpec(skillId: CounselorSkillId): SkillEffectSpec {
  return SKILL_MAP[skillId];
}

export const PROBLEM_CATEGORY_LABELS: Record<HiddenProblemCategory, string> = {
  'konflik-alat': 'Konflik kelompok karena alat',
  'tekanan-akademik': 'Tekanan akademik dan tenggat',
  'kecemasan-karier': 'Kecemasan kesiapan kerja atau magang',
  'kalah-terampil': 'Merasa kalah terampil dari teman',
  'kelelahan-praktikum': 'Kelelahan beban praktikum',
};

function classifyProblemCategory(agent: StudentAgent): HiddenProblemCategory {
  const summary = agent.hiddenVars.primaryConcernSummary.toLowerCase();
  if (
    summary.includes('alat') ||
    summary.includes('printer') ||
    summary.includes('solder') ||
    summary.includes('kelompok') ||
    summary.includes('pendapat') ||
    summary.includes('gesekan') ||
    summary.includes('kredit') ||
    summary.includes('komunikasi') ||
    summary.includes('koordinasi')
  ) {
    return 'konflik-alat';
  }
  if (
    summary.includes('magang') ||
    summary.includes('kerja') ||
    summary.includes('karier') ||
    summary.includes('portofolio') ||
    summary.includes('lulus') ||
    summary.includes('industri') ||
    summary.includes('sertifikasi') ||
    agent.counselingDomain === 'karier'
  ) {
    return 'kecemasan-karier';
  }
  if (
    summary.includes('kalah') ||
    summary.includes('tertinggal') ||
    summary.includes('banding') ||
    summary.includes('canggung') ||
    summary.includes('kurang') ||
    summary.includes('minder') ||
    summary.includes('takut salah') ||
    summary.includes('ragu')
  ) {
    return 'kalah-terampil';
  }
  if (
    summary.includes('lelah') ||
    summary.includes('kelelahan') ||
    summary.includes('shift') ||
    summary.includes('tidur') ||
    summary.includes('energi') ||
    summary.includes('biaya') ||
    summary.includes('padat')
  ) {
    return 'kelelahan-praktikum';
  }
  return 'tekanan-akademik';
}

function defaultEmotionForCategory(
  category: HiddenProblemCategory
): EmotionReflectionNuance {
  switch (category) {
    case 'konflik-alat':
      return 'kecewa-kesal';
    case 'kecemasan-karier':
      return 'ragu-kurang-percaya';
    case 'kalah-terampil':
      return 'ragu-kurang-percaya';
    case 'kelelahan-praktikum':
      return 'lelah-kewalahan';
    case 'tekanan-akademik':
    default:
      return 'tertekan-cemas';
  }
}

/**
 * Menghasilkan profil masalah bertingkat (L1, L2, L3) deterministik untuk
 * setiap mahasiswa berdasarkan profil uniknya (tanpa LLM).
 */
export function getAgentHiddenProblemProfile(
  agent: StudentAgent
): AgentTieredProblem {
  const category = classifyProblemCategory(agent);
  const categoryLabel = PROBLEM_CATEGORY_LABELS[category];
  const primaryEmotion = defaultEmotionForCategory(category);
  const concern = agent.hiddenVars.primaryConcernSummary.trim();
  const concernLower = concern.charAt(0).toLowerCase() + concern.slice(1);
  const potentialLower =
    agent.uniquePotential.charAt(0).toLowerCase() + agent.uniquePotential.slice(1);

  switch (category) {
    case 'konflik-alat':
      return {
        category,
        categoryLabel,
        primaryEmotion,
        l1Fact: `Belakangan jadwal pemakaian alat dan pembagian tugas di tim sering bertabrakan, sementara aku masih menghadapi situasi ${concernLower}.`,
        l2Feeling: `Jujur aku merasa kesal sekaligus serba salah—kalau bersuara keras takut suasana tim makin kaku, tapi kalau diam terus rasanya mengganjal.`,
        l3CoreNeed: `Sebenarnya aku ingin punya cara koordinasi alat yang adil tanpa membuat teman merasa disalahkan, supaya aku tetap bisa berkontribusi lewat ${potentialLower}.`,
      };
    case 'kecemasan-karier':
      return {
        category,
        categoryLabel,
        primaryEmotion,
        l1Fact: `Saat melihat teman-teman mulai menyiapkan berkas industri, aku masih berkutat dengan situasi ${concernLower}.`,
        l2Feeling: `Ada rasa ragu dan cemas setiap memikirkan langkah setelah semester ini—khawatir pilihanku salah atau belum cukup siap untuk dunia kerja.`,
        l3CoreNeed: `Aku sebenarnya butuh ruang diskusi yang tenang untuk memetakan langkah realistis dan melihat nilai dari kemampuanku dalam ${potentialLower}.`,
      };
    case 'kalah-terampil':
      return {
        category,
        categoryLabel,
        primaryEmotion,
        l1Fact: `Beberapa kali saat praktikum berjalan cepat, aku memilih mundur atau bekerja sendiri karena ${concernLower}.`,
        l2Feeling: `Rasanya minder dan khawatir terlihat lambat di depan teman satu stasiun, jadi lebih aman menanggung kebingungan sendiri.`,
        l3CoreNeed: `Aku ingin belajar tanpa merasa dihakimi atau dibanding-bandingkan, serta diberi kesempatan bertumbuh mulai dari kekuatanku di ${potentialLower}.`,
      };
    case 'kelelahan-praktikum':
      return {
        category,
        categoryLabel,
        primaryEmotion,
        l1Fact: `Jadwal praktikum, revisi modul, dan urusan di luar lab menumpuk bersamaan minggu ini—terutama soal ${concernLower}.`,
        l2Feeling: `Badan dan pikiranku terasa lelah sekali; kadang di meja kerja aku hanya menatap layar karena tenaga sudah habis duluan.`,
        l3CoreNeed: `Aku butuh menata ulang prioritas yang manusiawi dan tahu batas wajar tanpa merasa gagal sebagai mahasiswa vokasi.`,
      };
    case 'tekanan-akademik':
    default:
      return {
        category,
        categoryLabel,
        primaryEmotion,
        l1Fact: `Tenggat laporan dan target uji coba berdekatan minggu ini, dan aku sedang berhadapan dengan ${concernLower}.`,
        l2Feeling: `Tekanannya bikin kepalaku penuh terus; aku takut satu kesalahan kecil bakal membuat semua kerja keras tim ikut mundur.`,
        l3CoreNeed: `Yang paling kubutuhkan sekarang adalah ruang aman untuk mengurai beban ini satu per satu dan menata ritme kerja yang lebih terjaga.`,
      };
  }
}

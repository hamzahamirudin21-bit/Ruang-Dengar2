/**
 * Cerita_Tahap_Awal: graf cerita generik yang dibangun otomatis dari profil mahasiswa
 * (Requirement 2.7, 11). Murni dan deterministik: masukan sama menghasilkan graf sama.
 *
 * Keamanan teks: `uniquePotential` dan `primaryConcernSummary` tidak pernah disisipkan mentah.
 * Teks dari `getAgentHiddenProblemProfile` hanya dipakai bila tidak memuat kedua nilai itu;
 * selain itu dipakai teks generik per kategori masalah.
 */
import type {
  CounselorSkillId, EmotionReflectionNuance, HiddenProblemCategory, StudentAgent,
} from '../../types';
import { determineRuptureKind } from '../../engine/rupture';
import { buildAgentSessionVars } from '../../engine/trust';
import type {
  StoryChoice, StoryExpression, StoryGraph, StoryLine, StoryNode,
} from '../../engine/story/storyTypes';
import { STUDENT_BLUEPRINTS, type StudentSeedBlueprint } from '../agents.seed';
import { getAgentHiddenProblemProfile } from '../skillEffects';
import { buildOpeningNode } from '../storyStages';

/* ------------------------------------------------------------------ */
/* Agen ringan dari blueprint                                          */
/* ------------------------------------------------------------------ */

/** Agen ringan dari blueprint (pola sama dengan simulasi sesi acak). */
export function agentFromBlueprint(bp: StudentSeedBlueprint): StudentAgent {
  return {
    id: bp.id,
    name: bp.name,
    cohort: bp.cohort,
    demographicLabel: bp.demographicLabel,
    uniquePotential: bp.uniquePotential,
    socialCircleHint: bp.socialCircleHint,
    counselingDomain: bp.counselingDomain,
    interests: { ...bp.interests },
    skills: { ...bp.skills },
    personality: { ...bp.personality },
    solitudePreference: bp.solitudePreference,
    affinities: {},
    position: { x: 5, y: 5 },
    tilePosition: { x: 5, y: 5 },
    targetPosition: null,
    path: [],
    pathStepIndex: 0,
    currentZoneId: bp.initialZoneId,
    targetZoneId: bp.initialZoneId,
    activityGoal: 'Praktikum',
    status: 'bekerja',
    energy: 0.8,
    stress: 0.4,
    taskLoad: 0.5,
    activityDurationTicks: 0,
    socialStatus: 'sendiri',
    interactingWithIds: [],
    hiddenVars: { ...bp.hiddenVars },
  };
}

/* ------------------------------------------------------------------ */
/* Teks generik per kategori masalah                                   */
/* ------------------------------------------------------------------ */

interface CategoryText {
  activity: string;     // kegiatan Mahasiswa saat Dosen datang
  crowded: string;      // keluhan suasana lab
  fact: string;         // L1: fakta situasi
  feeling: string;      // L2 cadangan
  need: string;         // L3 cadangan
  alt: string;          // balasan simpul alternatif (belum terbuka)
  plan: string;         // langkah kecil
  feelingExpression: StoryExpression;
}

const CATEGORY_TEXT: Record<HiddenProblemCategory, CategoryText> = {
  'konflik-alat': {
    activity: 'mengecek jadwal pakai alat untuk timku',
    crowded: 'Di sini alat-alatnya sering diperebutkan, jadi susah ngobrol enak.',
    fact: 'Belakangan jadwal pemakaian alat di timku sering bertabrakan, dan pembagian tugasnya jadi ribut.',
    feeling: 'Aku kesal sekaligus serba salah. Kalau bersuara keras takut suasana makin kaku, kalau diam terus rasanya mengganjal.',
    need: 'Aku ingin cara koordinasi alat yang adil tanpa membuat teman merasa disalahkan.',
    alt: 'Ya, soal alat itu memang bikin pusing. Aku masih bingung mulai dari mana.',
    plan: 'Mungkin aku bisa usul jadwal pakai alat yang tertulis di pertemuan tim berikutnya.',
    feelingExpression: 'kesal',
  },
  'kecemasan-karier': {
    activity: 'menyusun berkas portofolio',
    crowded: 'Di sini ramai, aku jadi susah memikirkan langkah setelah semester ini.',
    fact: 'Teman-temanku mulai menyiapkan berkas industri, sedangkan aku belum yakin harus mulai dari mana.',
    feeling: 'Ada rasa ragu dan cemas tiap memikirkan langkah setelah ini. Aku khawatir pilihanku salah.',
    need: 'Aku butuh ruang tenang untuk memetakan langkah yang realistis dan melihat nilai dari kemampuanku.',
    alt: 'Ya, soal setelah lulus itu masih kabur buatku. Aku belum bisa bilang jelas.',
    plan: 'Mungkin aku bisa mulai dengan merapikan satu bagian portofolio minggu ini.',
    feelingExpression: 'cemas',
  },
  'kalah-terampil': {
    activity: 'mengulang langkah praktikum yang tadi terlewat',
    crowded: 'Di sini semua bergerak cepat, aku jadi merasa tertinggal.',
    fact: 'Waktu praktikum berjalan cepat, aku sering memilih mundur atau mengerjakan sendiri.',
    feeling: 'Rasanya minder dan takut terlihat lambat di depan teman satu stasiun, jadi lebih aman menanggung kebingungan sendiri.',
    need: 'Aku ingin belajar tanpa merasa dibanding-bandingkan, dimulai dari hal yang sudah bisa kulakukan.',
    alt: 'Ya, kadang aku memang ragu dan memilih diam. Susah menjelaskannya.',
    plan: 'Mungkin aku bisa minta satu teman mengajariku satu langkah praktikum yang masih bikin bingung.',
    feelingExpression: 'menunduk',
  },
  'kelelahan-praktikum': {
    activity: 'merapikan modul praktikum',
    crowded: 'Di sini ramai sekali, kepalaku makin penat.',
    fact: 'Jadwal praktikum, revisi modul, dan urusan di luar lab menumpuk bersamaan minggu ini.',
    feeling: 'Badan dan pikiranku terasa lelah sekali. Kadang aku hanya menatap layar karena tenaga sudah habis duluan.',
    need: 'Aku butuh menata ulang prioritas yang manusiawi dan tahu batas wajar tanpa merasa gagal.',
    alt: 'Ya, memang capek sih. Aku belum tahu harus mulai membereskan yang mana.',
    plan: 'Mungkin aku bisa memilih satu tugas yang paling mendesak dan menunda sisanya sebentar.',
    feelingExpression: 'lelah',
  },
  'tekanan-akademik': {
    activity: 'mengejar laporan yang mendekati tenggat',
    crowded: 'Di sini terlalu bising, aku jadi susah fokus ke laporan.',
    fact: 'Tenggat laporan dan target uji coba berdekatan minggu ini, jadi semuanya terasa menumpuk.',
    feeling: 'Tekanannya bikin kepalaku penuh terus. Aku takut satu kesalahan kecil membuat kerja keras tim ikut mundur.',
    need: 'Aku butuh ruang aman untuk mengurai beban ini satu per satu dan menata ritme kerja yang lebih terjaga.',
    alt: 'Ya, memang berat belakangan ini. Aku belum bisa merinci bagian mana yang paling menekan.',
    plan: 'Mungkin aku bisa membagi laporan jadi bagian kecil dan menyelesaikan satu dulu hari ini.',
    feelingExpression: 'cemas',
  },
};

const MAX_LEN = 270;
const MAX_REPLY_LEN = 280;

const INTEREST_LABEL: Record<string, string> = {
  cetak3d: 'cetak 3D', pemrograman: 'pemrograman', pengelasan: 'pengelasan', elektronika: 'elektronika',
};

/** Dua minat teratas dan keterampilan teknis terkuat (urutan stabil bila seri). */
function topTraits(agent: StudentAgent): { first: string; second: string; skill: string } {
  const keys = ['cetak3d', 'pemrograman', 'pengelasan', 'elektronika'] as const;
  const byInterest = [...keys].sort((a, b) => agent.interests[b] - agent.interests[a]);
  const bySkill = [...keys].sort((a, b) => agent.skills[b] - agent.skills[a]);
  return {
    first: INTEREST_LABEL[byInterest[0]],
    second: INTEREST_LABEL[byInterest[1]],
    skill: INTEREST_LABEL[bySkill[0]],
  };
}

/** Tambahkan kalimat khas mahasiswa bila panjang total masih dalam batas; selain itu teks asli. */
function withDetail(text: string, detail: string): string {
  const out = `${text} ${detail}`;
  return out.length <= MAX_REPLY_LEN ? out : text;
}

/** Pakai teks profil hanya bila tidak memuat nilai mentah profil; selain itu cadangan generik. */
function safeProfileText(agent: StudentAgent, profileText: string, generic: string): string {
  const lower = profileText.toLowerCase();
  const raws = [agent.hiddenVars.primaryConcernSummary, agent.uniquePotential]
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.length > 0);
  if (raws.some((raw) => lower.includes(raw))) return generic;
  if (profileText.length > MAX_LEN) return generic;
  return profileText;
}

function firstName(agent: StudentAgent): string {
  return agent.name.trim().split(/\s+/)[0] || agent.name;
}

function line(text: string, expression: StoryExpression, cue: string, aside?: string): StoryLine {
  return { text, expression, cue, ...(aside ? { aside } : {}) };
}

function choice(
  id: string,
  skillId: CounselorSkillId,
  text: string,
  next: string,
  extra: Partial<StoryChoice> = {},
): StoryChoice {
  return { id, skillId, text, next, ...extra };
}

/* ------------------------------------------------------------------ */
/* Pembangun graf                                                      */
/* ------------------------------------------------------------------ */

export function buildFallbackStory(agent: StudentAgent): StoryGraph {
  const sid = agent.id;
  const name = firstName(agent);
  const profile = getAgentHiddenProblemProfile(agent);
  const cat = CATEGORY_TEXT[profile.category];
  const quiet = agent.personality.extraversion < 0.5;
  const tr = topTraits(agent);
  const nuance: EmotionReflectionNuance = profile.primaryEmotion;
  const ruptureKind = determineRuptureKind(agent, buildAgentSessionVars(agent, 0));

  const id = {
    f1: `${sid}-f1`, f2: `${sid}-f2`, f3: `${sid}-f3`, tolak: `${sid}-f3-tolak`,
    f4: `${sid}-f4`, f5: `${sid}-f5`, f6: `${sid}-f6`, f6alt: `${sid}-f6-alt`,
    f7: `${sid}-f7`, f7alt: `${sid}-f7-alt`, f8: `${sid}-f8`, f9: `${sid}-f9`,
    f10: `${sid}-f10`, tegang: `${sid}-tegang`, hub: `${sid}-perbaikan`,
    endTerbantu: `${sid}-akhir-terbantu`, endKemajuan: `${sid}-akhir-kemajuan`,
    endMenarik: `${sid}-akhir-menarik`,
  };
  const FLAG = { boundary: 'batas-dijelaskan', observation: 'pengamatan-faktual', plan: 'langkah-kecil' };

  const l2 = safeProfileText(agent, profile.l2Feeling, cat.feeling);
  const l3 = safeProfileText(agent, profile.l3CoreNeed, cat.need);

  const opening = buildOpeningNode({
    id: id.f1,
    studentId: sid,
    sceneId: 'lab',
    name,
    reply: line(
      `Oh, halo. Aku ${name}, lagi ${cat.activity}.`,
      quiet ? 'waspada' : 'netral',
      quiet
        ? `${name} menoleh sebentar lalu kembali menatap mejanya.`
        : `${name} mengangkat kepala dan membalas sapaan sekilas.`,
    ),
    next: {
      'sapaan-hangat': id.f2,
      'pertanyaan-terbuka': id.f2,
      'pertanyaan-tertutup': id.f2,
      'nasihat-dini': id.f2,
    },
  });

  const repairRoute = [{ when: [{ type: 'tension' as const, active: false }], next: '@resume' }];

  const nodes: StoryNode[] = [
    opening,
    {
      id: id.f2, sceneId: 'lab', stage: 'hubungan', depth: 0,
      reply: line(
        quiet
          ? `Iya, lumayan. Hari ini cukup padat, banyak urusan ${tr.first} yang harus kuberesi.`
          : `Baik kok. Hari ini lumayan padat, ${tr.first} dan ${tr.second} sama-sama minta perhatian.`,
        'netral',
        `${name} melanjutkan pekerjaannya sambil sesekali melirik.`,
        `Beberapa teman di dekat ${name} tertawa keras tiba-tiba.`,
      ),
      choices: [
        choice('a', 'afirmasi-kekuatan', 'Kelihatan kamu tekun mengerjakannya. Itu patut dihargai.', id.f3, { best: true }),
        choice('b', 'jeda-hening', 'Silakan lanjutkan, saya duduk di sini saja dulu.', id.f3),
        choice('c', 'validasi-normalisasi', 'Wajar kalau hari seperti ini terasa penuh.', id.f3),
        choice('d', 'pertanyaan-tertutup', 'Semuanya sudah beres, kan?', id.f3),
      ],
    },
    {
      id: id.f3, sceneId: 'lab', stage: 'hubungan', depth: 1,
      reply: line(withDetail(cat.crowded, `Padahal ${tr.first} butuh konsentrasi.`), 'menunduk', `Suara ${name} mengecil, matanya melirik ke sekitar.`),
      choices: [
        choice('a', 'validasi-normalisasi',
          'Suasana begini memang melelahkan. Mau kita ngobrol di ruang konsultasi yang lebih tenang?',
          id.f4, { best: true, routes: [{ when: [{ type: 'trust-max', value: 29 }], next: id.tolak }] }),
        choice('b', 'pertanyaan-terbuka', 'Apa yang paling terasa mengganggu di sini?', id.f4),
        choice('c', 'jeda-hening', 'Kita diam sebentar saja kalau kamu mau.', id.f4),
        choice('d', 'pertanyaan-tertutup', 'Kamu cuma kurang istirahat, ya?', id.tolak),
      ],
    },
    {
      id: id.tolak, sceneId: 'lab', stage: 'hubungan', depth: 0,
      reply: line(
        `Nanti saja, aku masih mau menyelesaikan urusan ${tr.second} ini dulu.`,
        'menutup-diri',
        `${name} menggeser kursinya sedikit menjauh.`,
      ),
      choices: [
        choice('a', 'jeda-hening', 'Tidak apa-apa. Kalau nanti kamu mau, saya tunggu di ruang konsultasi.', id.f4, { best: true }),
        choice('b', 'validasi-normalisasi', 'Wajar kalau kamu belum nyaman. Pelan-pelan saja.', id.f4),
        choice('c', 'sapaan-hangat', 'Terima kasih sudah mau ngobrol sebentar tadi.', id.f4),
        choice('d', 'nasihat-dini', 'Sebaiknya kamu jangan menghindar terus.', id.f4),
      ],
    },
    {
      id: id.f4, sceneId: 'ruang-konsultasi', stage: 'hubungan', depth: 0,
      reply: line(
        `Di sini lebih sepi. Aku ${name}, biasanya sibuk dengan ${tr.skill}. Jadi, kita bicara soal apa?`,
        'waspada',
        `${name} duduk di tepi kursi, tangan di pangkuan.`,
      ),
      choices: [
        choice('a', 'batas-kerahasiaan',
          'Yang kamu ceritakan di sini tetap di antara kita, kecuali ada hal yang membahayakan.',
          id.f5, { best: true, setFlags: [FLAG.boundary] }),
        choice('b', 'sapaan-hangat', 'Terima kasih sudah mau datang ke sini.', id.f5),
        choice('c', 'jeda-hening', 'Ambil waktu yang kamu perlukan.', id.f5),
        choice('d', 'pertanyaan-tertutup', 'Kamu tidak keberatan cerita, kan?', id.f5),
      ],
    },
    {
      id: id.f5, sceneId: 'ruang-konsultasi', stage: 'eksplorasi', depth: 1,
      reply: line(withDetail(cat.fact, `Aku jadi sulit fokus ke ${tr.first}.`), 'netral', `${name} menghela napas pendek.`),
      choices: [
        choice('a', 'pertanyaan-terbuka', 'Ceritakan, bagian mana dari situasi itu yang paling terasa?', id.f6, { best: true }),
        choice('b', 'jeda-hening', 'Saya dengarkan, silakan lanjut.', id.f6),
        choice('c', 'validasi-normalisasi', 'Banyak mahasiswa mengalami hal serupa.', id.f6),
        choice('d', 'interogasi', 'Kenapa bisa begitu? Jawab dengan jelas.', id.tegang),
      ],
    },
    {
      id: id.f6, sceneId: 'ruang-konsultasi', stage: 'eksplorasi', depth: 2,
      reply: line(withDetail(l2, `Apalagi ${tr.first} biasanya jadi pelarianku.`), cat.feelingExpression, `${name} memainkan ujung lengan bajunya.`),
      marks: ['isyarat-nonverbal'],
      gate: { conditions: [{ type: 'level-min', value: 1 }], otherwise: id.f6alt },
      choices: [
        choice('a', 'sampaikan-pengamatan',
          'Saya perhatikan nadamu melambat saat membahas ini, dan kamu sering menunduk.',
          id.f7, { best: true, options: { observationTone: 'faktual' }, setFlags: [FLAG.observation] }),
        choice('b', 'sampaikan-pengamatan', 'Kamu memang tipe yang gampang menyerah.',
          id.tegang, { options: { observationTone: 'menilai' } }),
        choice('c', 'pertanyaan-terbuka', 'Apa yang biasanya kamu pikirkan saat itu terjadi?', id.f7),
        choice('d', 'jeda-hening', 'Tidak perlu buru-buru menjawab.', id.f7),
      ],
    },
    {
      id: id.f6alt, sceneId: 'ruang-konsultasi', stage: 'eksplorasi', depth: 1,
      reply: line(withDetail(cat.alt, `Rasanya mirip bingung memilih antara ${tr.first} dan ${tr.second}.`), 'netral', `${name} mengangkat bahu pelan.`),
      choices: [
        choice('a', 'pertanyaan-terbuka', 'Bisa ceritakan lebih banyak tentang itu?', id.f7, { best: true }),
        choice('b', 'jeda-hening', 'Tidak apa-apa kalau belum bisa dijelaskan sekarang.', id.f7),
        choice('c', 'validasi-normalisasi', 'Bingung begitu hal yang manusiawi.', id.f7),
        choice('d', 'meremehkan', 'Ah, itu hal kecil, nanti juga biasa.', id.tegang),
      ],
    },
    {
      id: id.f7, sceneId: 'ruang-konsultasi', stage: 'pemahaman', depth: 3,
      reply: line(withDetail(l3, `Itu juga yang kuinginkan di ${tr.first}.`), 'tertegun', `Mata ${name} berkaca, suaranya hampir tak terdengar.`),
      marks: ['momen-terbuka'],
      gate: { conditions: [{ type: 'level-min', value: 2 }], otherwise: id.f7alt },
      choices: [
        choice('a', 'refleksi-perasaan', 'Kedengarannya ada hal penting yang kamu butuhkan, dan itu belum terpenuhi.',
          id.f8, { best: true, options: { reflectionNuance: nuance } }),
        choice('b', 'refleksi-perasaan', 'Kamu pasti marah sekali pada semua orang.',
          id.tegang, { options: { reflectionCorrectOverride: false } }),
        choice('c', 'parafrase-ringkasan', 'Jadi ada kebutuhan yang selama ini kamu simpan sendiri.', id.f8),
        choice('d', 'validasi-normalisasi', 'Perasaan seperti itu bisa dimengerti.', id.f8),
      ],
    },
    {
      id: id.f7alt, sceneId: 'ruang-konsultasi', stage: 'pemahaman', depth: 1,
      reply: line(
        `Iya, kira-kira begitu. Aku ${name} belum bisa bilang lebih jauh, tapi sedikit lega sudah cerita.`,
        'netral',
        `${name} mengangguk pelan.`,
      ),
      choices: [
        choice('a', 'pertanyaan-terbuka', 'Apa yang paling kamu butuhkan sekarang?', id.f8, { best: true }),
        choice('b', 'validasi-normalisasi', 'Terima kasih sudah mau terbuka soal ini.', id.f8),
        choice('c', 'parafrase-ringkasan', 'Jadi ada hal yang berat, tetapi kamu belum siap membahas semuanya.', id.f8),
        choice('d', 'meremehkan', 'Ah, itu tidak seberat kelihatannya.', id.tegang),
      ],
    },
    {
      id: id.f8, sceneId: 'ruang-konsultasi', stage: 'pemahaman', depth: 1,
      reply: line(
        `Iya, kurang lebih begitu. Rasanya agak lega bisa bilang, mungkin bisa kuceritakan juga ke teman ${tr.second}.`,
        'lega',
        `Bahu ${name} sedikit turun.`,
      ),
      choices: [
        choice('a', 'parafrase-ringkasan',
          'Jadi situasinya sudah cukup menekan, dan kamu butuh cara yang lebih nyaman menghadapinya. Begitu?',
          id.f9, { best: true }),
        choice('b', 'validasi-normalisasi', 'Terima kasih sudah mau terbuka hari ini.', id.f9),
        choice('c', 'pertanyaan-terbuka', 'Langkah kecil apa yang terasa mungkin untukmu?', id.f9),
        choice('d', 'nasihat-dini', 'Pokoknya kamu harus lebih kuat.', id.f9),
      ],
    },
    {
      id: id.f9, sceneId: 'ruang-konsultasi', stage: 'rencana', depth: 1,
      reply: line(withDetail(cat.plan, `Biar ${tr.skill} juga tetap jalan.`), 'tersenyum', `${name} tersenyum tipis untuk pertama kali.`),
      choices: [
        choice('a', 'afirmasi-kekuatan', 'Langkah kecil itu bagus, dan kamu sudah menunjukkan keberanian hari ini.',
          id.f10, { best: true, setFlags: [FLAG.plan] }),
        choice('b', 'parafrase-ringkasan', 'Jadi langkah berikutnya sudah kamu tentukan sendiri.', id.f10),
        choice('c', 'batas-kerahasiaan', 'Kalau mau dibahas lagi, kita bisa lanjutkan dan tetap rahasia.', id.f10),
        choice('d', 'janji-mutlak', 'Saya jamin semuanya pasti beres setelah ini.', id.f10),
      ],
    },
    {
      id: id.f10, sceneId: 'ruang-konsultasi', stage: 'rencana', depth: 1,
      reply: line(
        `Terima kasih sudah mendengarkan. Aku ${name} jadi punya bayangan mau mulai dari mana, mungkin lewat ${tr.first}.`,
        'netral',
        `${name} berdiri dan merapikan tasnya.`,
      ),
      choices: [
        choice('a', 'parafrase-ringkasan',
          'Hari ini kita membahas situasimu dan satu langkah kecil. Sampai bertemu lagi.',
          '@ending', { best: true }),
        choice('b', 'validasi-normalisasi', 'Terima kasih sudah jujur hari ini.', '@ending'),
        choice('c', 'afirmasi-kekuatan', 'Kamu lebih kuat dari yang kamu kira.', '@ending'),
        choice('d', 'nasihat-dini', 'Ingat, jangan begini lagi mulai besok.', '@ending'),
      ],
    },
    {
      id: id.tegang, sceneId: 'ruang-konsultasi', stage: 'eksplorasi', depth: 0,
      reply: line(
        `Rasanya aku sedang dinilai, seperti hasil ${tr.first}-ku diperiksa.`,
        'menutup-diri',
        `${name} menyilangkan tangan dan memalingkan wajah.`,
      ),
      tension: { phase: 'awal', expectedKind: ruptureKind },
      choices: [
        choice('a', 'sampaikan-pengamatan', 'Saya lihat suasananya berubah tegang setelah ucapan saya tadi.',
          id.hub, { best: true, action: { kind: 'akui-ketegangan' }, options: { observationTone: 'faktual' } }),
        choice('b', 'jeda-hening', 'Kita lanjutkan saja, ya.', id.f8),
        choice('c', 'pertanyaan-terbuka', 'Jadi, bagaimana kabar kegiatanmu yang lain?', id.f8),
        choice('d', 'nasihat-dini', 'Jangan terlalu sensitif begitu.', id.f8),
      ],
    },
    {
      id: id.hub, sceneId: 'ruang-konsultasi', stage: 'eksplorasi', depth: 0,
      reply: line(
        `Hmm... iya, tadi memang tidak enak. ${name} butuh waktu sebentar.`,
        'waspada',
        `${name} melirik sebentar, belum sepenuhnya rileks.`,
      ),
      tension: { phase: 'perbaikan', expectedKind: ruptureKind },
      choices: [
        choice('a', 'validasi-normalisasi', 'Maaf, ucapan saya tadi menekanmu. Dampaknya nyata, dan saya mengakuinya.',
          id.hub, { best: true, action: { kind: 'perbaikan', step: 'akui-dampak' }, routes: repairRoute }),
        choice('b', 'pertanyaan-terbuka', 'Boleh ceritakan, apa yang kamu rasakan tadi?',
          id.hub, { action: { kind: 'perbaikan', step: 'eksplorasi-perasaan' }, routes: repairRoute }),
        choice('c', 'jeda-hening', 'Kamu boleh pilih, lanjut ngobrol atau istirahat dulu.',
          id.hub, { action: { kind: 'perbaikan', step: 'beri-pilihan' }, routes: repairRoute }),
        choice('d', 'nasihat-dini', 'Sudahlah, lupakan saja yang tadi.', id.f8),
      ],
    },
    {
      id: id.endTerbantu, sceneId: 'ruang-konsultasi', stage: 'rencana', depth: 1,
      reply: line(`Aku akan coba, mulai dari ${tr.first}. Terima kasih ya.`, 'tersenyum', `${name} mengangguk mantap sebelum keluar.`),
      ending: { kind: 'terbantu' },
      choices: [],
    },
    {
      id: id.endKemajuan, sceneId: 'ruang-konsultasi', stage: 'rencana', depth: 1,
      reply: line(`Oke. Aku pikirkan dulu sambil mengerjakan ${tr.second}.`, 'netral', `${name} mengangguk pelan lalu pergi.`),
      ending: { kind: 'kemajuan-kecil' },
      choices: [],
    },
    {
      id: id.endMenarik, sceneId: 'ruang-konsultasi', stage: 'rencana', depth: 0,
      reply: line(`Aku mau kembali ke ${tr.skill} dulu.`, 'menutup-diri', `${name} berdiri dan keluar tanpa menoleh.`),
      ending: { kind: 'menarik-diri-sementara' },
      choices: [],
    },
  ];

  return {
    version: 1,
    studentId: sid,
    kind: 'tahap-awal',
    placeholder: true,
    title: `Percakapan dengan ${name}`,
    scenes: [
      {
        id: 'lab',
        setting: 'lab',
        title: 'Di Lab',
        caption: `Lab sedang ramai. ${name} sibuk ${cat.activity}.`,
        witnessCount: 3,
        maxDialogueLevel: 1,
        entryTransition: 'potong-adegan',
        entryNodeId: id.f1,
      },
      {
        id: 'ruang-konsultasi',
        setting: 'ruang-konsultasi',
        title: 'Ruang Konsultasi',
        caption: 'Ruangan kecil yang tenang, dengan dua kursi berhadapan.',
        witnessCount: 0,
        maxDialogueLevel: 3,
        entryTransition: 'jalan-berdua',
        entryNodeId: id.f4,
      },
    ],
    startNodeId: id.f1,
    closingNodeId: id.f10,
    tensionFallbackNodeId: id.tegang,
    endings: {
      'terbantu': id.endTerbantu,
      'kemajuan-kecil': id.endKemajuan,
      'menarik-diri-sementara': id.endMenarik,
    },
    outcomeRules: {
      helpedMinQuality: 70,
      helpedMinLevel: 2,
      requiredFlags: [FLAG.boundary, FLAG.observation],
      planFlag: FLAG.plan,
      maxKind: 'kemajuan-kecil',
    },
    nodes,
  };
}

/** Seluruh 15 agen ringan dari blueprint (untuk registri dan uji). */
export function buildAllFallbackAgents(): StudentAgent[] {
  return STUDENT_BLUEPRINTS.map(agentFromBlueprint);
}

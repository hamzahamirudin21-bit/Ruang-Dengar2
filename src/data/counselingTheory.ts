import type { CounselorSkillId, DebriefTurn } from '../types';

/**
 * Katalog landasan teori konseling (modul murni, tanpa React/DOM).
 *
 * Setiap entri REFERENCES diverifikasi lewat pencarian web; `sourceUrl` adalah halaman
 * tempat entri itu dicek. Halaman, DOI, dan nomor terbitan yang tidak terverifikasi
 * sengaja tidak dicantumkan. Kode etik ABKIN tidak dapat diverifikasi secara daring,
 * sehingga rujukan etika memakai Kode Etik ACA (2014).
 * Isi katalog ini disajikan ulang di `docs/LANDASAN-TEORI.md`; ubah keduanya bersamaan.
 */

export type TheoryStageId = 'lab' | 'bk-eksplorasi' | 'bk-pemahaman' | 'bk-rencana' | 'lanjutan';
export type TheoryConceptId = 'keterbukaan' | 'aliansi' | 'keretakan-perbaikan' | 'etika';

export interface TheoryReference {
  key: string;
  /** Rujukan dalam teks, misalnya "Rogers, 1957". */
  cite: string;
  /** Entri Daftar Pustaka APA 7 sebagai teks polos (tanpa cetak miring). */
  apa: string;
  /** Halaman tempat entri diverifikasi. */
  sourceUrl: string;
}

export interface TheoryNote {
  title: string;
  theory: string;
  /** Satu sampai dua kalimat. */
  explanation: string;
  /** Kunci ke REFERENCES. */
  refs: readonly string[];
}

/** Urut alfabet penulis pertama. */
export const REFERENCES: readonly TheoryReference[] = [
  {
    key: 'altman-taylor',
    cite: 'Altman & Taylor, 1973',
    apa: 'Altman, I., & Taylor, D. A. (1973). Social penetration: The development of interpersonal relationships. Holt, Rinehart and Winston.',
    sourceUrl: 'https://www.ncbi.nlm.nih.gov/nlmcatalog/436535',
  },
  {
    key: 'aca',
    cite: 'American Counseling Association, 2014',
    apa: 'American Counseling Association. (2014). ACA code of ethics. https://www.counseling.org/resources/ethics',
    sourceUrl: 'https://www.counseling.org/resources/ethics',
  },
  {
    key: 'bordin',
    cite: 'Bordin, 1979',
    apa: 'Bordin, E. S. (1979). The generalizability of the psychoanalytic concept of the working alliance. Psychotherapy: Theory, Research & Practice, 16(3), 252–260.',
    sourceUrl:
      'https://www.researchgate.net/publication/232419494_The_Generalizability_of_the_Psychoanalytic_Concept_of_the_Working_Alliance',
  },
  {
    key: 'de-shazer',
    cite: 'de Shazer dkk., 2007',
    apa: 'de Shazer, S., Dolan, Y., Korman, H., Trepper, T., McCollum, E., & Berg, I. K. (2007). More than miracles: The state of the art of solution-focused brief therapy. Haworth Press.',
    sourceUrl: 'https://www.ncbi.nlm.nih.gov/nlmcatalog/101290908',
  },
  {
    key: 'gordon',
    cite: 'Gordon, 1970',
    apa: 'Gordon, T. (1970). Parent effectiveness training: The no-lose program for raising responsible children. P. H. Wyden.',
    sourceUrl: 'https://cmc.marmot.org/Record/.b1002055x',
  },
  {
    key: 'hill',
    cite: 'Hill dkk., 2024',
    apa: 'Hill, C. E., Chui, H., & Gerstenblith, J. A. (2024). Helping skills: Facilitating exploration, insight, and action (6th ed.). American Psychological Association.',
    sourceUrl: 'https://go.apa.org/helping-skills-6e/',
  },
  {
    key: 'ivey',
    cite: 'Ivey dkk., 2023',
    apa: 'Ivey, A. E., Ivey, M. B., & Zalaquett, C. P. (2023). Intentional interviewing and counseling: Facilitating client development in a multicultural society (10th ed.). Cengage Learning.',
    sourceUrl:
      'https://www.cengage.com/c/intentional-interviewing-and-counseling-facilitating-client-development-in-a-multicultural-society-10e-ivey-ivey-zalaquett/9780357622797',
  },
  {
    key: 'miller-rollnick',
    cite: 'Miller & Rollnick, 2023',
    apa: 'Miller, W. R., & Rollnick, S. (2023). Motivational interviewing: Helping people change and grow (4th ed.). Guilford Press.',
    sourceUrl: 'https://www.guilford.com/books/Motivational-Interviewing/Miller-Rollnick/9781462552795',
  },
  {
    key: 'prayitno-amti',
    cite: 'Prayitno & Amti, 2013',
    apa: 'Prayitno, & Amti, E. (2013). Dasar-dasar bimbingan dan konseling. Rineka Cipta.',
    sourceUrl:
      'https://sindig.unesa.ac.id/rps/en/bachelor-of-guidance-and-counseling/guidance-and-counseling-services.pdf',
  },
  {
    key: 'rogers',
    cite: 'Rogers, 1957',
    apa: 'Rogers, C. R. (1957). The necessary and sufficient conditions of therapeutic personality change. Journal of Consulting Psychology, 21, 95–103.',
    sourceUrl: 'https://pubmed.ncbi.nlm.nih.gov/13416422/',
  },
  {
    key: 'safran-muran',
    cite: 'Safran & Muran, 2000',
    apa: 'Safran, J. D., & Muran, J. C. (2000). Negotiating the therapeutic alliance: A relational treatment guide. Guilford Press.',
    sourceUrl:
      'https://www.routledge.com/Negotiating-the-Therapeutic-Alliance-A-Relational-Treatment-Guide/Safran-Muran/p/book/9781572308695',
  },
];

const REFERENCE_BY_KEY: ReadonlyMap<string, TheoryReference> = new Map(
  REFERENCES.map((r) => [r.key, r] as const)
);

export function referenceByKey(key: string): TheoryReference | undefined {
  return REFERENCE_BY_KEY.get(key);
}

export const STAGE_THEORY: Record<TheoryStageId, TheoryNote> = {
  lab: {
    title: 'Tahap awal: membangun hubungan',
    theory: 'Kondisi inti Rogers: empati, penerimaan positif tanpa syarat, dan kongruensi',
    explanation:
      'Menurut Rogers, perubahan kepribadian yang konstruktif membutuhkan konselor yang kongruen, menerima klien tanpa syarat, dan memahami dunianya secara empatik. Di lab, Dosen menyapa santai dan membangun rasa aman sebelum masuk ke masalah.',
    refs: ['rogers'],
  },
  'bk-eksplorasi': {
    title: 'Eksplorasi',
    theory: 'Model Helping Skills Hill: tahap eksplorasi',
    explanation:
      'Pada tahap eksplorasi, konselor membantu klien menjelajahi pikiran dan perasaannya lewat attending, pertanyaan terbuka, dan refleksi. Tujuannya membangun hubungan dan memahami masalah dari sudut pandang klien.',
    refs: ['hill'],
  },
  'bk-pemahaman': {
    title: 'Pemahaman (insight)',
    theory: 'Model Helping Skills Hill: tahap insight',
    explanation:
      'Pada tahap insight, konselor membantu klien memahami asal-usul dan dampak pikiran, perasaan, serta perilakunya. Di simulasi ini, refleksi perasaan dan ringkasan dipakai untuk menyusun pemahaman itu bersama mahasiswa.',
    refs: ['hill'],
  },
  'bk-rencana': {
    title: 'Tindakan',
    theory:
      'Model Helping Skills Hill: tahap tindakan; pertanyaan skala terapi berfokus solusi; OARS wawancara motivasional',
    explanation:
      'Pada tahap tindakan, konselor membantu klien menyusun langkah perubahan yang ia pilih sendiri. Pertanyaan skala dari terapi berfokus solusi membantu menakar kemajuan dan langkah kecil berikutnya, sedangkan keterampilan OARS dari wawancara motivasional menjaga rencana tetap milik klien.',
    refs: ['hill', 'de-shazer', 'miller-rollnick'],
  },
  lanjutan: {
    title: 'Evaluasi dan tindak lanjut',
    theory: 'Penilaian dan tindak lanjut layanan bimbingan dan konseling',
    explanation:
      'Layanan BK tidak berhenti pada satu sesi, karena hasilnya dinilai lalu ditindaklanjuti sesuai kebutuhan konseli. Di sesi lanjutan, Dosen menepati janji, memeriksa kemajuan rencana, dan menyesuaikan langkah berikutnya.',
    refs: ['prayitno-amti'],
  },
};

export const SKILL_THEORY: Record<CounselorSkillId, TheoryNote & { hindering: boolean }> = {
  'sapaan-hangat': {
    title: 'Perilaku attending dan kehangatan',
    theory: 'Mikrokonseling: perilaku attending; kehangatan dan penerimaan dari pendekatan berpusat pada klien',
    explanation:
      'Kontak mata, nada suara, dan bahasa tubuh yang hangat menunjukkan bahwa konselor hadir dan mendengarkan. Sapaan santai tanpa agenda menurunkan kecemasan awal sehingga klien lebih mudah membuka diri.',
    refs: ['ivey', 'rogers'],
    hindering: false,
  },
  'pertanyaan-terbuka': {
    title: 'Pertanyaan terbuka (OARS: O)',
    theory: 'Mikrokonseling: pertanyaan terbuka; OARS dalam wawancara motivasional',
    explanation:
      'Pertanyaan terbuka, misalnya yang diawali "apa" atau "bagaimana", mengundang klien bercerita dengan kata-katanya sendiri. Ruang jawabnya jauh lebih luas daripada pertanyaan ya atau tidak.',
    refs: ['ivey', 'miller-rollnick'],
    hindering: false,
  },
  'refleksi-perasaan': {
    title: 'Refleksi perasaan / empati',
    theory: 'Mikrokonseling: refleksi perasaan; pemahaman empatik Rogers',
    explanation:
      'Konselor menamai emosi yang tersirat dalam cerita klien lalu memeriksa ketepatannya. Refleksi yang tepat membuat klien merasa dipahami, sedangkan tebakan yang meleset perlu diluruskan bersama.',
    refs: ['ivey', 'rogers'],
    hindering: false,
  },
  'parafrase-ringkasan': {
    title: 'Parafrase dan ringkasan (OARS: R, S)',
    theory: 'Mikrokonseling: parafrase dan merangkum; refleksi dan ringkasan dalam OARS',
    explanation:
      'Parafrase mengulang inti ucapan klien dengan kata-kata konselor, sedangkan ringkasan merangkai beberapa pokok cerita sekaligus. Keduanya memastikan pemahaman yang akurat dan memberi klien kesempatan meluruskan.',
    refs: ['ivey', 'miller-rollnick'],
    hindering: false,
  },
  'validasi-normalisasi': {
    title: 'Validasi, penerimaan positif tanpa syarat',
    theory: 'Penerimaan positif tanpa syarat dari pendekatan berpusat pada klien',
    explanation:
      'Konselor menerima pengalaman dan perasaan klien tanpa menilai, serta menyampaikan bahwa reaksi seperti itu wajar. Penerimaan ini mengurangi rasa malu sehingga klien berani bercerita lebih jauh.',
    refs: ['rogers'],
    hindering: false,
  },
  'sampaikan-pengamatan': {
    title: 'Keterampilan observasi dan umpan balik',
    theory: 'Mikrokonseling: keterampilan observasi dan umpan balik',
    explanation:
      'Konselor menyampaikan hal yang terlihat secara faktual dan tanpa menghakimi, lalu memberi klien ruang untuk menanggapi. Pengamatan yang terdengar menuduh justru membuat klien defensif.',
    refs: ['ivey'],
    hindering: false,
  },
  'afirmasi-kekuatan': {
    title: 'Afirmasi (OARS: A), pencarian kekuatan',
    theory: 'Afirmasi dalam OARS wawancara motivasional; pencarian kekuatan dalam mikrokonseling',
    explanation:
      'Konselor mengakui usaha dan kekuatan nyata klien secara spesifik, bukan sanjungan umum. Afirmasi yang tulus menumbuhkan keyakinan klien bahwa ia mampu berubah.',
    refs: ['miller-rollnick', 'ivey'],
    hindering: false,
  },
  'jeda-hening': {
    title: 'Diam yang disengaja (attending)',
    theory: 'Mikrokonseling: diam yang disengaja sebagai bagian perilaku attending',
    explanation:
      'Jeda yang tenang memberi klien waktu berpikir dan merasakan tanpa didesak. Diam perlu disertai sikap terbuka agar tidak terasa sebagai penolakan.',
    refs: ['ivey'],
    hindering: false,
  },
  'batas-kerahasiaan': {
    title: 'Kerahasiaan dan batasnya',
    theory: 'Kode etik konseling: kerahasiaan dan batas-batasnya',
    explanation:
      'Konselor menjelaskan bahwa isi pembicaraan dijaga, sekaligus menyebut batasnya, misalnya bila ada risiko keselamatan. Penjelasan yang jujur ini membangun rasa aman tanpa janji yang tidak bisa ditepati.',
    refs: ['aca'],
    hindering: false,
  },
  'pertanyaan-tertutup': {
    title: 'Pertanyaan tertutup',
    theory: 'Mikrokonseling: pertanyaan tertutup',
    explanation:
      'Pertanyaan tertutup berguna untuk memastikan fakta tertentu, tetapi jawabannya cenderung singkat. Bila diulang beruntun, percakapan terasa seperti pemeriksaan sehingga klien jarang membuka diri.',
    refs: ['ivey'],
    hindering: false,
  },
  interogasi: {
    title: 'Penghambat: menyelidik/menginterogasi',
    theory: 'Penghambat komunikasi Gordon: menyelidik, bertanya, dan menginterogasi',
    explanation:
      'Rentetan pertanyaan yang mendesak membuat klien merasa diperiksa dan disalahkan. Gordon menggolongkan respons ini sebagai salah satu dari dua belas penghambat komunikasi.',
    refs: ['gordon'],
    hindering: true,
  },
  'nasihat-dini': {
    title: 'Penghambat: menasihati/memberi solusi',
    theory: 'Penghambat komunikasi Gordon: menasihati dan memberi solusi',
    explanation:
      'Solusi yang diberikan sebelum perasaan klien dipahami membuat klien merasa tidak didengar dan diragukan kemampuannya. Klien juga kehilangan kesempatan menemukan jalan keluarnya sendiri.',
    refs: ['gordon'],
    hindering: true,
  },
  meremehkan: {
    title: 'Penghambat: mengecilkan/menilai',
    theory: 'Penghambat komunikasi Gordon: menilai, mengkritik, dan mempermalukan',
    explanation:
      'Mengecilkan beban atau membandingkan klien dengan orang lain menyiratkan bahwa perasaannya tidak penting. Respons ini merusak rasa aman dan memicu keretakan hubungan.',
    refs: ['gordon'],
    hindering: true,
  },
  'janji-mutlak': {
    title: 'Penghambat: penghiburan palsu; melanggar etika',
    theory: 'Penghambat komunikasi Gordon: menenangkan dan menghibur; pelanggaran kode etik konseling',
    explanation:
      'Janji bahwa semuanya pasti beres atau pasti dirahasiakan terdengar menenangkan, tetapi menutup perasaan klien dan tidak dapat dijamin. Kode etik konseling menuntut konselor jujur tentang batas layanan dan batas kerahasiaan.',
    refs: ['gordon', 'aca'],
    hindering: true,
  },
};

export const CONCEPT_THEORY: Record<TheoryConceptId, TheoryNote> = {
  keterbukaan: {
    title: 'Tingkat keterbukaan (L0–L3)',
    theory: 'Teori penetrasi sosial',
    explanation:
      'Hubungan berkembang secara bertahap dari pertukaran yang dangkal menuju lapisan diri yang lebih pribadi. Di simulasi ini, mahasiswa membuka diri dari L0 (permukaan) ke L1 (fakta), L2 (perasaan), dan L3 (kebutuhan inti) seiring tumbuhnya kepercayaan.',
    refs: ['altman-taylor'],
  },
  aliansi: {
    title: 'Aliansi kerja',
    theory: 'Aliansi kerja Bordin: kesepakatan tujuan, kesepakatan tugas, dan ikatan',
    explanation:
      'Bordin memandang aliansi kerja sebagai kesepakatan tentang tujuan dan tugas konseling yang disertai ikatan emosional antara konselor dan klien. Aliansi yang kuat menjadi dasar agar teknik apa pun dapat bekerja.',
    refs: ['bordin'],
  },
  'keretakan-perbaikan': {
    title: 'Keretakan dan perbaikan aliansi',
    theory: 'Negosiasi keretakan aliansi terapeutik',
    explanation:
      'Keretakan aliansi, baik berupa menarik diri maupun konfrontasi, wajar terjadi dan dapat menjadi titik balik bila konselor mengakuinya secara terbuka. Di simulasi ini, perbaikan dilakukan dengan mengakui dampak, meminta maaf, menggali perasaan, lalu memberi pilihan.',
    refs: ['safran-muran'],
  },
  etika: {
    title: 'Etika konseling',
    theory: 'Kode etik konseling: kerahasiaan, batasnya, dan kejujuran tentang layanan',
    explanation:
      'Konselor menjaga kerahasiaan, menjelaskan batasnya sejak awal, dan jujur tentang apa yang dapat dan tidak dapat dijanjikan layanan. Pelanggaran etika merusak kepercayaan walaupun terdengar menenangkan pada saat itu.',
    refs: ['aca'],
  },
};

/**
 * Landasan teori untuk satu giliran debrief:
 * akui-ketegangan/perbaikan → konsep keretakan-perbaikan; skillId → SKILL_THEORY;
 * janji-tindak-lanjut → tahap lanjutan; lainnya → null.
 */
export function theoryForTurn(turn: Pick<DebriefTurn, 'kind' | 'skillId'>): TheoryNote | null {
  if (turn.kind === 'akui-ketegangan' || turn.kind === 'perbaikan') {
    return CONCEPT_THEORY['keretakan-perbaikan'];
  }
  if (turn.skillId) return SKILL_THEORY[turn.skillId] ?? null;
  if (turn.kind === 'janji-tindak-lanjut') return STAGE_THEORY.lanjutan;
  return null;
}

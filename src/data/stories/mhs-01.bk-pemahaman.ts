/**
 * Raka Pratama (mhs-01), adegan Ruang BK bagian pemahaman.
 * Simpul (urutan jalur): ra-b6, ra-b9, ra-b8, ra-b12, ditambah alternatif ra-b9-alt, ra-b8-alt, ra-b12-alt.
 *
 * Titik sambung:
 *  - masuk dari `ra-b5` (berkas bk-eksplorasi) ke `ra-b6`.
 *  - keluar dari `ra-b12` dan `ra-b12-alt` ke `ra-b13` (berkas bk-rencana).
 *  - Ketegangan memakai `ra-tegang-bk` (berkas bk-rencana).
 *
 * Gerbang: `ra-b8` (Momen_Terbuka) butuh trust >= 80, level >= 1, dan bendera `isyarat-diperhatikan` (dari ra-l2);
 * `ra-b9` butuh trust >= 70; `ra-b12` (inti kebutuhan, kedalaman 2) butuh level >= 1.
 * Bila gagal, alur memakai simpul alternatif yang tetap menuju tulang punggung cerita.
 */
import type { StoryNode } from '../../engine/story/storyTypes';

const SCENE = 'bk';
const TENSION = 'ra-tegang-bk';
const CEMAS = { reflectionNuance: 'tertekan-cemas' } as const;

export const MHS_01_BK_PEMAHAMAN_NODES: StoryNode[] = [
  {
    id: 'ra-b6',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 1,
    reply: {
      text: 'Kalau aku minta anggota lain ambil alih tugas, nanti kelihatan banget aku nggak sanggup mimpin.',
      expression: 'cemas',
      cue: 'Raka menurunkan kertas jadwal ke meja dan merapikan tepinya agar sejajar dengan sudut meja.',
    },
    choices: [
      {
        id: 'a', skillId: 'parafrase-ringkasan', best: true, next: 'ra-b9',
        text: 'Jadi bagi tugas itu terasa seperti mengakui kamu kurang mampu memimpin?',
        reaction: { text: 'Hmm, iya. Persis begitu rasanya, walau kedengaran aneh kalau diucapin keras-keras.', expression: 'menunduk', cue: 'Raka tertawa pendek dan menggaruk tengkuk.' },
      },
      {
        id: 'b', skillId: 'validasi-normalisasi', next: 'ra-b9',
        text: 'Wajar kok merasa begitu. Banyak ketua tim ragu melepas tugas ke orang lain.',
        reaction: { text: 'Oh, banyak yang begitu juga ya? Lumayan lega dengernya, jujurly.', expression: 'lega', cue: 'Raka mengangkat alis, lalu bahunya sedikit mengendur.' },
      },
      {
        id: 'c', skillId: 'nasihat-dini', next: TENSION,
        text: 'Bagi aja tugasnya mulai besok. Pemimpin yang baik memang harus mendelegasikan.',
      },
      {
        id: 'd', skillId: 'pertanyaan-tertutup', next: 'ra-b9',
        text: 'Jadi kamu nggak percaya sama anggota timmu, gitu?',
        reaction: {
          text: 'Bukan gitu. Mereka bagus banget kok. Cuma... ya, mungkin emang kedengarannya begitu.',
          expression: 'waspada',
          cue: 'Raka mengerutkan dahi sebentar dan melirik jam tangan.',
        },
      },
    ],
  },
  {
    id: 'ra-b8',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 2,
    reply: {
      text: 'Semalam aku ketik pesan buat tim: "Maaf, aku nggak sanggup pegang koordinator lagi." Belum kukirim. Masih di draf, udah dua hari, capek banget sumpah.',
      expression: 'tertegun',
      cue: 'Raka membuka ponselnya, memperlihatkan layar sekilas, lalu mematikannya. Suaranya jauh lebih pelan dari tadi.',
    },
    marks: ['momen-terbuka'],
    gate: {
      conditions: [
        { type: 'trust-min', value: 80 }, { type: 'level-min', value: 1 },
        { type: 'flag', flag: 'isyarat-diperhatikan' },
      ],
      otherwise: 'ra-b8-alt',
    },
    onEnter: { setFlags: ['momen-terbuka'] },
    choices: [
      {
        id: 'a', skillId: 'refleksi-perasaan', best: true, options: CEMAS, next: 'ra-b12',
        text: 'Kamu takut gagal jadi pemimpin, dan diam-diam capek memikul semuanya sendiri.',
        reaction: { text: 'Iya, begitu. Takutnya ada, capeknya juga.', expression: 'lelah', cue: 'Raka mengusap wajah dengan kedua tangan.' },
      },
      {
        id: 'b', skillId: 'afirmasi-kekuatan', next: 'ra-b12',
        text: 'Kamu jujur pada dirimu sendiri. Itu nggak mudah buat orang yang selalu rapi.',
        reaction: { text: 'Jujur, rasanya kok bukan pujian ya. Tapi makasih, Bu.', expression: 'menunduk', cue: 'Raka tertawa pendek yang tidak sampai ke matanya.' },
      },
      {
        id: 'c', skillId: 'pertanyaan-terbuka', next: 'ra-b12',
        text: 'Boleh cerita, apa yang kamu rasakan waktu nulis pesan itu semalam?',
        reaction: { text: 'Waktu nulis, awalnya lancar. Terus tanganku berhenti sendiri di kalimat terakhir.', expression: 'tertegun', cue: 'Raka menatap ponselnya yang tergeletak di meja.' },
      },
      {
        id: 'd', skillId: 'interogasi', next: TENSION,
        text: 'Kenapa nggak bilang dari awal? Sudah dua hari kamu sembunyikan.',
      },
    ],
  },
  {
    id: 'ra-b8-alt',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 1,
    reply: {
      text: 'Ah, nggak ada yang gede kok. Aku cuma perlu jadwal yang lebih ketat, udah itu aja.',
      expression: 'netral',
      cue: 'Raka tersenyum sopan dan menyelipkan kertas jadwal kembali ke saku kemejanya.',
    },
    choices: [
      {
        id: 'a', skillId: 'pertanyaan-terbuka', best: true, next: 'ra-b12',
        text: 'Kalau jadwalnya sudah ketat, apa yang sebenarnya ingin kamu ubah?',
        reaction: { text: 'Yang mau kuubah? Jam kerjaku sendiri, mungkin. Belum kepikiran lebih jauh.', expression: 'netral', cue: 'Raka mengetuk pulpen ke lipatan daftarnya.' },
      },
      {
        id: 'b', skillId: 'validasi-normalisasi', next: 'ra-b12',
        text: 'Nggak apa-apa kalau belum mau bahas lebih dalam. Kita jalan pelan aja.',
        reaction: { text: 'Makasih, Bu. Aku belum siap panjang-panjang, jadi pelan aja ya.', expression: 'lega', cue: 'Raka mengangguk dan duduk lebih santai.' },
      },
      {
        id: 'c', skillId: 'sampaikan-pengamatan', options: { observationTone: 'faktual' }, next: 'ra-b12',
        text: 'Kamu sudah melirik jam dinding lagi, padahal waktu kita masih panjang.',
        reaction: { text: 'Eh, iya, kelihatan ya. Kebiasaan, jujurly, padahal waktunya masih panjang.', expression: 'terkejut', cue: 'Raka cepat mengalihkan pandangan dari jam dinding.' },
      },
      {
        id: 'd', skillId: 'meremehkan', next: 'ra-b12',
        text: 'Pasti bisa. Kamu kan jagonya soal jadwal, jangan terlalu cemas.',
        reaction: {
          text: 'Iya, bener juga sih. Mungkin aku emang kebanyakan mikir.',
          expression: 'menutup-diri',
          cue: 'Raka tertawa pendek, lalu mengecek jam tangannya lagi.',
        },
      },
    ],
  },
  {
    id: 'ra-b9',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 1,
    reply: {
      text: 'Padahal aku paling hidup waktu debug. Dua malam lalu sensor daya rendah di tim tiba-tiba boros, dan kutemuin sumbernya dalam sejam. Tapi urusan notulen dan konsumsi rapat, aku keteteran banget.',
      expression: 'tersenyum',
      cue: 'Mata Raka berbinar saat bercerita soal sensor, lalu bahunya turun ketika menyebut notulen.',
    },
    gate: { conditions: [{ type: 'trust-min', value: 70 }], otherwise: 'ra-b9-alt' },
    choices: [
      {
        id: 'a', skillId: 'pertanyaan-terbuka', best: true, next: 'ra-b8',
        text: 'Waktu nemu sumber boros itu, apa yang bikin kamu paling semangat?',
        reaction: { text: 'Seneng banget pas nemu! Rasanya kayak teka-teki beres satu per satu.', expression: 'tersenyum', cue: 'Mata Raka berbinar dan tangannya bergerak menirukan menyolder.' },
      },
      {
        id: 'b', skillId: 'refleksi-perasaan', options: CEMAS, next: 'ra-b8',
        text: 'Kamu semangat di bagian teknis, tapi urusan administrasi bikin kamu tertekan.',
        reaction: { text: 'Iya, kurang lebih gitu. Urusan teknis aku nyaman, administrasi bikin kepalaku penuh.', expression: 'cemas', cue: 'Raka menekan pelipisnya sambil mengangguk.' },
      },
      {
        id: 'c', skillId: 'pertanyaan-tertutup', next: 'ra-b8',
        text: 'Jadi kamu lebih cocok jadi teknisi daripada jadi koordinator?',
        reaction: {
          text: 'Hmm, bisa jadi sih. Tapi kedengarannya kayak aku nyerah gitu.',
          expression: 'menunduk',
          cue: 'Raka mengusap tengkuk dan tertawa kecil tanpa suara.',
        },
      },
      {
        id: 'd', skillId: 'nasihat-dini', next: TENSION,
        text: 'Kalau gitu fokus aja ke debug dan serahin notulen ke orang lain.',
      },
    ],
  },
  {
    id: 'ra-b9-alt',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 1,
    reply: {
      text: 'Ya, kerjaan teknis aman kok. Yang agak berantakan cuma urusan jadwal sama catatan rapat.',
      expression: 'netral',
      cue: 'Raka mengangkat bahu ringan, seolah itu bukan hal yang perlu dibahas panjang.',
    },
    choices: [
      {
        id: 'a', skillId: 'pertanyaan-terbuka', best: true, next: 'ra-b8',
        text: 'Dari urusan jadwal dan catatan itu, bagian mana yang paling nyita pikiranmu?',
        reaction: { text: 'Yang paling nyita? Catatan rapat sih. Kalau telat, anak-anak jadi bingung.', expression: 'netral', cue: 'Raka menghitung dengan jari, berhenti di catatan rapat.' },
      },
      {
        id: 'b', skillId: 'parafrase-ringkasan', next: 'ra-b8',
        text: 'Jadi pekerjaan teknis lancar, sedangkan jadwal dan catatan rapat yang terasa berantakan.',
        reaction: { text: 'Iya, persis. Teknis aman, jadwal sama catatan yang berantakan.', expression: 'netral', cue: 'Raka mengangguk singkat dan merapikan kertasnya.' },
      },
      {
        id: 'c', skillId: 'validasi-normalisasi', next: 'ra-b8',
        text: 'Ngurus jadwal dan catatan sambil kerjain proyek itu memang melelahkan, valid sih.',
        reaction: { text: 'Hehe, iya capek sih. Makasih udah bilang itu valid.', expression: 'tersenyum', cue: 'Raka tertawa kecil sambil mengendurkan bahu.' },
      },
      {
        id: 'd', skillId: 'pertanyaan-tertutup', next: 'ra-b8',
        text: 'Cuma itu aja yang bikin kamu khawatir?',
        reaction: {
          text: 'Iya, cuma itu.',
          expression: 'menutup-diri',
          cue: 'Raka menjawab singkat sambil menatap jam dinding.',
        },
      },
    ],
  },
  {
    id: 'ra-b12',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 2,
    reply: {
      text: 'Kayaknya yang aku mau sederhana banget. Boleh bagi tugas tanpa dianggap gagal, dan boleh nggak sempurna di depan tim.',
      expression: 'lega',
      cue: 'Raka menaruh kertas jadwal di pangkuan, tidak lagi merapikan tepinya, dan menarik napas panjang.',
    },
    gate: { conditions: [{ type: 'level-min', value: 1 }], otherwise: 'ra-b12-alt' },
    choices: [
      {
        id: 'a', skillId: 'parafrase-ringkasan', best: true, next: 'ra-b13',
        text: 'Jadi kamu ingin boleh berbagi beban dan nggak sempurna tanpa merasa gagal. Tepat?',
        reaction: { text: 'Iya, tepat banget, Bu. Rapi juga ya Ibu ngerangkumnya.', expression: 'lega', cue: 'Raka mengangguk mantap dan sedikit tersenyum.' },
      },
      {
        id: 'b', skillId: 'afirmasi-kekuatan', next: 'ra-b13',
        text: 'Kamu tahu persis apa yang kamu butuhkan. Itu bukti kamu pemimpin yang peka banget.',
        reaction: { text: 'Peka? Aku nggak pernah mikir gitu sih. Tapi makasih ya.', expression: 'menunduk', cue: 'Raka tertawa canggung dan menunduk sebentar.' },
      },
      {
        id: 'c', skillId: 'refleksi-perasaan', options: CEMAS, next: 'ra-b13',
        text: 'Ada keinginan buat bernapas lebih lega, tanpa harus jaga semuanya sendirian.',
        reaction: { text: 'Iya, bernapas lega. Kedengarannya enak banget, tapi belum biasa.', expression: 'lega', cue: 'Raka menarik napas panjang lalu menghembuskannya pelan.' },
      },
      {
        id: 'd', skillId: 'nasihat-dini', next: TENSION,
        text: 'Kalau gitu berhenti aja menuntut sempurna mulai sekarang.',
      },
    ],
  },
  {
    id: 'ra-b12-alt',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 1,
    reply: {
      text: 'Intinya aku pengin jadwal yang lebih longgar. Aku belum bisa jelasin lebih jauh dari itu.',
      expression: 'netral',
      cue: 'Raka mengetuk-ngetukkan ujung pulpen pelan ke lutut sambil menatap lantai.',
    },
    choices: [
      {
        id: 'a', skillId: 'validasi-normalisasi', best: true, next: 'ra-b13',
        text: 'Pengin jadwal lebih longgar itu wajar. Nggak perlu dijelasin semuanya sekarang.',
        reaction: { text: 'Makasih, Bu. Lega dengernya, nggak harus dijelasin semuanya.', expression: 'lega', cue: 'Raka mengangguk dan melepas genggaman pada pulpennya.' },
      },
      {
        id: 'b', skillId: 'parafrase-ringkasan', next: 'ra-b13',
        text: 'Jadi yang paling kamu mau sekarang adalah ruang gerak yang lebih longgar.',
        reaction: { text: 'Iya, ruang gerak. Itu yang kupengen minggu ini.', expression: 'netral', cue: 'Raka mengangguk sambil menandai sesuatu di benaknya.' },
      },
      {
        id: 'c', skillId: 'pertanyaan-terbuka', next: 'ra-b13',
        text: 'Kalau ada satu hal kecil yang bisa dilonggarin minggu ini, apa itu?',
        reaction: { text: 'Satu hal kecil? Tenggat internal timku, mungkin bisa mundur sehari.', expression: 'netral', cue: 'Raka melirik daftarnya dan menunjuk satu baris.' },
      },
      {
        id: 'd', skillId: 'meremehkan', next: 'ra-b13',
        text: 'Nanti juga longgar sendiri kalau proyeknya kelar.',
        reaction: {
          text: 'Mungkin ya. Lihat aja nanti deh.',
          expression: 'menutup-diri',
          cue: 'Raka mengangguk sopan dan melirik jam tangannya.',
        },
      },
    ],
  },
];



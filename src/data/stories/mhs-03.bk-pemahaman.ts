/**
 * Tania Wijaya (mhs-03), adegan Ruang BK bagian pemahaman.
 * Simpul (urutan jalur): ta-b6, ta-b9, ta-b8, ta-b12, ditambah alternatif ta-b9-alt, ta-b8-alt, ta-b12-alt.
 *
 * Titik sambung:
 *  - masuk dari `ta-b5` (berkas bk-eksplorasi) ke `ta-b6`.
 *  - keluar dari `ta-b12` dan `ta-b12-alt` ke `ta-b13` (berkas bk-rencana).
 *  - Ketegangan memakai `ta-tegang-bk` (berkas bk-rencana).
 *
 * Gerbang: `ta-b8` (Momen_Terbuka) butuh trust >= 54, level >= 1, dan bendera `isyarat-diperhatikan` (dari ta-l2);
 * `ta-b9` butuh trust >= 44; `ta-b12` (inti kebutuhan, kedalaman 2) butuh level >= 2.
 */
import type { StoryNode } from '../../engine/story/storyTypes';

const SCENE = 'bk';
const TENSION = 'ta-tegang-bk';
const RAGU = { reflectionNuance: 'ragu-kurang-percaya' } as const;

export const MHS_03_BK_PEMAHAMAN_NODES: StoryNode[] = [
  {
    id: 'ta-b6',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 1,
    reply: {
      text: 'Tiap mau milih, aku selalu tanya ke banyak orang dulu. Jujurly kayaknya aku nggak percaya sama penilaianku sendiri.',
      expression: 'menunduk',
      cue: 'Tania tertawa kecil, tetapi tawanya cepat habis. Pulpennya berhenti di atas map.',
    },
    choices: [
      {
        id: 'a', skillId: 'refleksi-perasaan', best: true, options: RAGU, next: 'ta-b9',
        text: 'Kamu ragu pada penilaianmu sendiri, jadi suara orang lain terasa lebih bisa dipegang.',
        reaction: { text: 'Iya sih, Bu. Suara orang lain terasa lebih mantap daripada suaraku.', expression: 'menunduk', cue: 'Tania memandang jari-jarinya sendiri.' },
      },
      {
        id: 'b', skillId: 'validasi-normalisasi', next: 'ta-b9',
        text: 'Minta pendapat sebelum memutuskan hal besar itu wajar kok. Banyak yang begitu.',
        reaction: { text: 'Oh, banyak yang gitu ya? Syukurlah, kirain aku aneh, Bu.', expression: 'lega', cue: 'Tania tertawa lemah dan mengusap lengannya.' },
      },
      {
        id: 'c', skillId: 'nasihat-dini', next: TENSION,
        text: 'Mulai sekarang putuskan sendiri saja. Berhenti bertanya ke orang lain.',
      },
      {
        id: 'd', skillId: 'pertanyaan-tertutup', next: 'ta-b9',
        text: 'Jadi kamu memang tidak pernah percaya pada keputusanmu?',
        reaction: {
          text: 'Nggak pernah juga sih. Cuma yang penting-penting aja.',
          expression: 'waspada',
          cue: 'Tania menegakkan punggung dan memasang senyum yang terlalu lebar.',
        },
      },
    ],
  },
  {
    id: 'ta-b8',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 2,
    reply: {
      text: 'Kalimat di pojok kertas tadi... "kalau ditolak, berarti aku cuma kelihatan hebat karena ngajarin anak baru." Belum pernah kubilang ke siapa-siapa, Bu.',
      expression: 'tertegun',
      cue: 'Tania membalik lembar yang tadi tertutup, menunjuk satu kalimat berpensil, dan suaranya mengecil.',
    },
    marks: ['momen-terbuka'],
    gate: {
      conditions: [
        { type: 'trust-min', value: 54 }, { type: 'level-min', value: 1 },
        { type: 'flag', flag: 'isyarat-diperhatikan' },
      ],
      otherwise: 'ta-b8-alt',
    },
    onEnter: { setFlags: ['momen-terbuka'] },
    choices: [
      {
        id: 'a', skillId: 'validasi-normalisasi', best: true, next: 'ta-b12',
        text: 'Terima kasih sudah memperlihatkannya. Takut dianggap biasa saja itu terasa berat sekali.',
        reaction: { text: 'Makasih, Bu, udah nggak ketawa. Tapi iya, beratnya kerasa.', expression: 'menunduk', cue: 'Tania memeluk kertas itu di dadanya.' },
      },
      {
        id: 'b', skillId: 'pertanyaan-terbuka', next: 'ta-b12',
        text: 'Kalau kalimat itu bisa bicara, menurutmu ia sedang takut kehilangan apa?',
        reaction: { text: 'Aneh ya ditanya gitu, Bu. Kayaknya dia takut aku jadi nggak dibutuhin.', expression: 'tertegun', cue: 'Tania menatap kertas itu cukup lama.' },
      },
      {
        id: 'c', skillId: 'refleksi-perasaan', options: RAGU, next: 'ta-b12',
        text: 'Ada rasa takut bahwa nilai dirimu hanya ditentukan oleh hasil seleksi.',
        reaction: { text: 'Iya, Bu. Kayak harga diriku ikut ditimbang di seleksi itu.', expression: 'menunduk', cue: 'Tania menelan ludah dan mengangguk.' },
      },
      {
        id: 'd', skillId: 'interogasi', next: TENSION,
        text: 'Kenapa kamu berpikir begitu? Siapa yang bilang kamu cuma kelihatan hebat?',
      },
    ],
  },
  {
    id: 'ta-b8-alt',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 1,
    reply: {
      text: 'Ah, nggak ada apa-apa kok, Bu. Ya paling aku cuma takut gagal. Biasa lah.',
      expression: 'waspada',
      cue: 'Tania membalik lagi lembar kertasnya dengan cepat sebelum Dosen sempat membaca apa pun.',
    },
    choices: [
      {
        id: 'a', skillId: 'pertanyaan-terbuka', best: true, next: 'ta-b12',
        text: 'Gagal itu, bagimu, artinya apa?',
        reaction: { text: 'Gagal itu ya nggak jadi yang diharapin orang, Bu. Gitu aja sih.', expression: 'menunduk', cue: 'Tania tersenyum kecil yang cepat hilang.' },
      },
      {
        id: 'b', skillId: 'validasi-normalisasi', next: 'ta-b12',
        text: 'Nggak apa-apa kalau belum mau cerita. Kita jalan pelan aja.',
        reaction: { text: 'Makasih, Bu. Pelan-pelan emang lebih enak buatku.', expression: 'lega', cue: 'Tania menarik napas dan merilekskan bahunya.' },
      },
      {
        id: 'c', skillId: 'sampaikan-pengamatan', options: { observationTone: 'faktual' }, next: 'ta-b12',
        text: 'Kamu membalik kertas itu cepat sekali. Mungkin ada yang mengganjal.',
        reaction: { text: 'Eh, iya, keburu kubalik, Bu. Refleks aja, hehe.', expression: 'terkejut', cue: 'Tania menekan kertas itu ke meja dengan telapak tangan.' },
      },
      {
        id: 'd', skillId: 'meremehkan', next: 'ta-b12',
        text: 'Takut gagal itu biasa. Semua mahasiswa pernah, jangan dibesar-besarkan.',
        reaction: {
          text: 'Iya, Bu. Bener juga.',
          expression: 'menutup-diri',
          cue: 'Tania tertawa tipis, lalu pulpennya mengetuk meja satu kali, dingin dan datar.',
        },
      },
    ],
  },
  {
    id: 'ta-b9',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 1,
    reply: {
      text: 'Aku tuh paling seneng ngajarin anak baru pegang osiloskop. Mereka bilang makasih, aku ngerasa berarti banget. Tapi di lab riset semua jago. Aku takut jadi biasa aja di sana.',
      expression: 'cemas',
      cue: 'Mata Tania berbinar ketika menyebut osiloskop, lalu sinarnya padam saat ia menyebut lab riset.',
    },
    gate: { conditions: [{ type: 'trust-min', value: 44 }], otherwise: 'ta-b9-alt' },
    choices: [
      {
        id: 'a', skillId: 'pertanyaan-terbuka', best: true, next: 'ta-b8',
        text: 'Waktu anak baru bilang makasih, apa yang kamu rasakan tentang dirimu?',
        reaction: { text: 'Waktu mereka bilang makasih, aku ngerasa dibutuhin, Bu. Hangat banget.', expression: 'tersenyum', cue: 'Tania menyentuh dadanya sambil tersenyum lebar.' },
      },
      {
        id: 'b', skillId: 'refleksi-perasaan', options: RAGU, next: 'ta-b8',
        text: 'Mengajar membuatmu merasa berarti, dan kamu cemas rasa itu hilang di tempat baru.',
        reaction: { text: 'Iya, persis, Bu. Aku cemas rasa berarti itu hilang di sana.', expression: 'cemas', cue: 'Tania meremas ujung kertasnya.' },
      },
      {
        id: 'c', skillId: 'pertanyaan-tertutup', next: 'ta-b8',
        text: 'Jadi kamu takut kalah dari mahasiswa lain di lab riset?',
        reaction: {
          text: 'Kalah sih bukan... ya, mungkin. Entah deh, Bu.',
          expression: 'menunduk',
          cue: 'Tania mengusap pinggir map dengan ibu jarinya.',
        },
      },
      {
        id: 'd', skillId: 'nasihat-dini', next: TENSION,
        text: 'Kalau begitu tetap jadi mentor saja di sini dan lulus tepat waktu.',
      },
    ],
  },
  {
    id: 'ta-b9-alt',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 1,
    reply: {
      text: 'Ya intinya aku suka bantuin orang, Bu. Soal lab riset, aku belum kebayang.',
      expression: 'netral',
      cue: 'Tania mengangkat bahu dan tersenyum seperti ingin buru-buru ganti topik.',
    },
    choices: [
      {
        id: 'a', skillId: 'pertanyaan-terbuka', best: true, next: 'ta-b8',
        text: 'Soal lab riset, bagian mana yang paling sulit dibayangkan?',
        reaction: { text: 'Yang sulit kebayang? Sehari-harinya kayak apa, Bu. Aku belum tahu sama sekali.', expression: 'netral', cue: 'Tania menggelengkan kepala pelan.' },
      },
      {
        id: 'b', skillId: 'parafrase-ringkasan', next: 'ta-b8',
        text: 'Jadi membantu orang terasa jelas bagimu, sedangkan lab riset masih kabur.',
        reaction: { text: 'Iya, Bu, gitu. Bantu orang itu jelas, lab riset masih buram.', expression: 'netral', cue: 'Tania mengangguk sambil menggambar garis di udara.' },
      },
      {
        id: 'c', skillId: 'validasi-normalisasi', next: 'ta-b8',
        text: 'Belum kebayang soal hal baru itu wajar kok. Santai aja, nggak perlu buru-buru.',
        reaction: { text: 'Hehe, makasih, Bu. Berarti aku nggak harus buru-buru kebayang ya.', expression: 'lega', cue: 'Tania nyengir dan mengangkat bahunya.' },
      },
      {
        id: 'd', skillId: 'pertanyaan-tertutup', next: 'ta-b8',
        text: 'Jadi tidak ada yang kamu takutkan sama sekali?',
        reaction: {
          text: 'Nggak ada, Bu. Aman kok.',
          expression: 'menutup-diri',
          cue: 'Tania menjawab cepat sambil mengetuk-ngetuk pulpen ke map.',
        },
      },
    ],
  },
  {
    id: 'ta-b12',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 2,
    reply: {
      text: 'Ternyata yang aku mau bukan sekadar milih salah satu. Aku mau tetap merasa berharga, diterima atau nggak, jadi asisten atau nggak.',
      expression: 'lega',
      cue: 'Tania menghela napas panjang. Bahunya turun dan pulpennya tergeletak diam di atas map.',
    },
    gate: { conditions: [{ type: 'level-min', value: 2 }], otherwise: 'ta-b12-alt' },
    choices: [
      {
        id: 'a', skillId: 'parafrase-ringkasan', best: true, next: 'ta-b13',
        text: 'Jadi yang kamu cari adalah rasa berharga yang tidak bergantung pada hasil seleksi. Tepat?',
        reaction: { text: 'Iya, Bu, tepat! Berharga walau hasilnya belum tentu sesuai harapan.', expression: 'lega', cue: 'Tania menepuk meja pelan sambil tersenyum.' },
      },
      {
        id: 'b', skillId: 'afirmasi-kekuatan', next: 'ta-b13',
        text: 'Kamu bisa membedakan pilihan dari nilai dirimu. Itu pemahaman yang dewasa.',
        reaction: { text: 'Dewasa? Hehe, aku malah merasa masih bingung, Bu. Tapi makasih.', expression: 'tersenyum', cue: 'Tania menunduk malu sambil tertawa pelan.' },
      },
      {
        id: 'c', skillId: 'refleksi-perasaan', options: RAGU, next: 'ta-b13',
        text: 'Ada kerinduan untuk dihargai apa adanya, tanpa harus terus membuktikan diri.',
        reaction: { text: 'Iya, Bu. Pengen dihargai apa adanya, tanpa nunjukin apa-apa terus.', expression: 'menunduk', cue: 'Tania menarik napas dalam sambil mengangguk.' },
      },
      {
        id: 'd', skillId: 'nasihat-dini', next: TENSION,
        text: 'Kalau begitu berhenti saja mengukur dirimu dari hasil. Mudah, kan?',
      },
    ],
  },
  {
    id: 'ta-b12-alt',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 1,
    reply: {
      text: 'Intinya aku pengen nggak terlalu tegang tiap mikirin ini. Itu aja dulu, Bu.',
      expression: 'netral',
      cue: 'Tania menarik napas, lalu merapikan dua map di depannya menjadi satu tumpukan.',
    },
    choices: [
      {
        id: 'a', skillId: 'validasi-normalisasi', best: true, next: 'ta-b13',
        text: 'Pengin lebih tenang soal ini itu wajar. Nggak perlu dijelasin semuanya sekarang.',
        reaction: { text: 'Syukurlah, Bu. Nggak harus cerita semuanya hari ini.', expression: 'lega', cue: 'Tania menghembuskan napas panjang.' },
      },
      {
        id: 'b', skillId: 'parafrase-ringkasan', next: 'ta-b13',
        text: 'Jadi yang kamu butuhkan sekarang adalah memikirkan ini dengan perasaan lebih tenang.',
        reaction: { text: 'Iya, Bu, itu. Tenang dulu, soal lainnya belakangan.', expression: 'netral', cue: 'Tania mengangguk sambil memainkan pulpennya.' },
      },
      {
        id: 'c', skillId: 'pertanyaan-terbuka', next: 'ta-b13',
        text: 'Satu hal kecil apa yang bisa membuatmu sedikit lebih tenang hari ini?',
        reaction: { text: 'Satu hal kecil? Mungkin tidur lebih awal, Bu, nggak buka-buka daftar lagi.', expression: 'netral', cue: 'Tania berpikir sambil menepuk dagunya.' },
      },
      {
        id: 'd', skillId: 'meremehkan', next: 'ta-b13',
        text: 'Tegang itu biasa. Nanti juga hilang kalau sudah memutuskan.',
        reaction: {
          text: 'Iya, mungkin begitu, Bu.',
          expression: 'menutup-diri',
          cue: 'Tania tersenyum sopan dan mengalihkan pandangan ke jendela.',
        },
      },
    ],
  },
];

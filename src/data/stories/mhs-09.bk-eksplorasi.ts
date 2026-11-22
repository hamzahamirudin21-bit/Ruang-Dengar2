/**
 * Cerita Gilang Ramadhan (mhs-09), adegan Ruang BK bagian eksplorasi: simpul gi-b0, gi-b2, gi-b4, gi-b5.
 * Tujuan di luar berkas ini: gi-b6 (bk-pemahaman) dan gi-tegang-bk (bk-rencana).
 * Bendera `dampak-diakui` dipasang di gi-b5 dan menjadi syarat gerbang Momen_Terbuka (gi-b8).
 * Dirakit di mhs-09.ts. Seluruh teks Bahasa Indonesia, tanpa Istilah_Diagnosis.
 */
import type { StoryLine, StoryNode } from '../../engine/story/storyTypes';

const SCENE = 'bk';
const TEGANG = 'gi-tegang-bk';

function line(text: string, expression: StoryLine['expression'], cue: string, aside?: string): StoryLine {
  return { text, expression, cue, ...(aside ? { aside } : {}) };
}

export const MHS09_BK_EKSPLORASI_NODES: StoryNode[] = [
  {
    id: 'gi-b0',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: line(
      'Ruangnya sempit juga ya. Ya udah, mulai aja. Tapi kalau mulai berasa kayak sidang, aku keluar.',
      'waspada',
      'Gilang duduk di tepi kursi, lengan bersilang, dan matanya mengukur jarak ke pintu sebelum menatap Dosen.',
    ),
    choices: [
      {
        id: 'a', skillId: 'batas-kerahasiaan', best: true, next: 'gi-b2',
        reaction: {
          text: 'Hm, oke. Kalau emang nggak sampai ke kelompok, aku bisa ngomong, Bu.',
          expression: 'waspada',
          cue: 'Gilang bersandar sedikit dan melepaskan jaketnya dari bahu satu sisi.',
        },
        text: 'Ini bukan sidang kok. Ceritamu nggak sampai ke kelompok, kecuali soal keselamatanmu.',
      },
      {
        id: 'b', skillId: 'sapaan-hangat', next: 'gi-b2',
        reaction: {
          text: 'Ya, Bu. Tapi tenang, aku nggak langsung kabur kok. Cuma ngecek aja.',
          expression: 'waspada',
          cue: 'Gilang melirik pintu sekilas lalu duduk di kursi paling dekat dengannya.',
        },
        text: 'Makasih sudah mau masuk, Gilang. Kamu boleh keluar kapan aja.',
      },
      {
        id: 'c', skillId: 'pertanyaan-terbuka', next: 'gi-b2',
        reaction: {
          text: 'Jangan nanya pakai nada nuduh, Bu. Sama jangan dipotong pas aku lagi ngomong.',
          expression: 'netral',
          cue: 'Gilang menatap Dosen lurus, rahangnya tampak lebih santai dari tadi.',
        },
        text: 'Biar nggak berasa kayak sidang, apa yang perlu kuhindari?',
      },
      {
        id: 'd', skillId: 'interogasi', next: TEGANG,
        text: 'Jawab jujur, kenapa tadi kamu marah ke Rangga?',
      },
    ],
  },
  {
    id: 'gi-b2',
    sceneId: SCENE,
    stage: 'eksplorasi',
    depth: 0,
    reply: line(
      'Kemarin presentasi progres. Dudukan hasil lasku ditampilin di layar, terus Rangga sama asisten nunjuk bagian yang bolong. Satu kelas lihat. Ada yang ketawa kecil.',
      'kesal',
      'Gilang menekan ibu jarinya ke buku-buku jari satu per satu sampai berbunyi, matanya menatap meja.',
    ),
    choices: [
      {
        id: 'a', skillId: 'refleksi-perasaan', best: true, next: 'gi-b4',
        reaction: {
          text: 'Iya, Bu. Masih kerasa. Padahal itu cuma satu sambungan, tapi semua mata ke situ.',
          expression: 'kesal',
          cue: 'Gilang menarik lengan jaketnya dan menatap lantai dengan rahang mengeras.',
        },
        options: { reflectionNuance: 'kecewa-kesal' },
        text: 'Karyamu dipajang terus ditertawakan. Wajar kalau kesalnya masih nempel.',
      },
      {
        id: 'b', skillId: 'validasi-normalisasi', next: 'gi-b4',
        reaction: {
          text: 'Ya kan? Ibu ngerti juga ternyata. Bukan aku doang yang lebay.',
          expression: 'tertegun',
          cue: 'Gilang mendongak sebentar, lalu menunduk lagi sambil menahan senyum samar.',
        },
        text: 'Karyamu dibahas di depan satu kelas. Siapa pun bisa ngerasa terpojok.',
      },
      {
        id: 'c', skillId: 'pertanyaan-tertutup', next: 'gi-b4',
        text: 'Jadi masalahnya cuma sambungan las yang bolong, ya?',
        reaction: line(
          'Bukan cuma itu sih. Tapi ya, awalnya itu.',
          'kesal',
          'Gilang mendengus dan mengalihkan wajah ke jendela.',
        ),
      },
      {
        id: 'd', skillId: 'nasihat-dini', next: TEGANG,
        text: 'Lain kali periksa dulu hasil lasmu sebelum dipresentasikan.',
      },
    ],
  },
  {
    id: 'gi-b4',
    sceneId: SCENE,
    stage: 'eksplorasi',
    depth: 1,
    reply: line(
      'Minggu lalu pas uji tekanan rangka, siapa yang maju paling depan? Aku. Lenganku kena percikan, sampai melepuh. Nggak ada yang inget itu. Yang diinget cuma las bolong.',
      'tertegun',
      'Gilang menarik ujung lengan jaketnya ke bawah, menutupi bekas melepuh di pergelangan, lalu menahan pandangan ke arah lain.',
      'Di bawah lengan jaketnya, sekilas tampak kulit kemerahan bekas luka bakar yang masih baru.',
    ),
    marks: ['kejutan', 'isyarat-nonverbal'],
    choices: [
      {
        id: 'a', skillId: 'pertanyaan-terbuka', best: true, next: 'gi-b5',
        reaction: {
          text: 'Versiku? Aku yang maju duluan, Bu, waktu yang lain masih diskusi di belakang. Itu aja intinya.',
          expression: 'netral',
          cue: 'Gilang mengusap lengan jaketnya yang menutupi bekas luka, lalu menatap Dosen sekilas.',
        },
        text: 'Ceritain bagian uji tekanan itu versimu. Apa yang terjadi waktu kamu maju?',
      },
      {
        id: 'b', skillId: 'jeda-hening', next: 'gi-b5',
        reaction: {
          text: 'Hm... Makasih, Bu. Nggak dipaksa gitu, aku bisa pelan-pelan.',
          expression: 'menunduk',
          cue: 'Gilang diam beberapa detik, lalu mengembuskan napas panjang sambil menatap meja.',
        },
        text: 'Aku di sini. Nggak perlu buru-buru jelasin bagian itu.',
      },
      {
        id: 'c', skillId: 'janji-mutlak', next: 'gi-b5',
        text: 'Kamu pasti dihargai. Aku jamin tim bakal ingat keberanianmu.',
        reaction: line(
          'Jamin? Kemarin aja nggak ada yang inget.',
          'waspada',
          'Gilang menurunkan lengan jaketnya lagi dan menatap Dosen dengan mata menyipit.',
        ),
      },
      {
        id: 'd', skillId: 'interogasi', next: TEGANG,
        text: 'Kenapa kamu nekat maju sendiri? Itu kan bahaya.',
      },
    ],
  },
  {
    id: 'gi-b5',
    sceneId: SCENE,
    stage: 'eksplorasi',
    depth: 1,
    reply: line(
      'Mereka nggak pernah nanya dulu, langsung tunjuk, langsung koreksi di depan semua. Abis itu aku yang keliatan paling bodoh, padahal aku yang paling sering maju.',
      'kesal',
      'Gilang mengepalkan tangan di atas lutut, lalu membukanya perlahan satu jari demi satu jari.',
    ),
    choices: [
      {
        id: 'a', skillId: 'refleksi-perasaan', best: true, next: 'gi-b6',
        reaction: {
          text: 'Iya, Bu. Dua-duanya. Kesalnya masih nempel sampai sekarang.',
          expression: 'kesal',
          cue: 'Gilang meremas lengan jaketnya dan membuang muka ke arah jendela.',
        },
        options: { reflectionNuance: 'kecewa-kesal' },
        setFlags: ['dampak-diakui'],
        text: 'Kamu yang sering maju, tapi dikoreksi di depan semua. Sakit dan bikin kesal ya.',
      },
      {
        id: 'b', skillId: 'pertanyaan-terbuka', next: 'gi-b6',
        reaction: {
          text: 'Nggak tahu persisnya sih, Bu. Yang jelas bukan ditunjuk dulu baru ditanya. Aku maunya ditanya dulu.',
          expression: 'waspada',
          cue: 'Gilang mengangkat dagu sedikit, nadanya lebih tenang dari sebelumnya.',
        },
        text: 'Kalau boleh milih, kamu maunya kritik itu disampaikan gimana?',
      },
      {
        id: 'c', skillId: 'sampaikan-pengamatan', next: 'gi-b6',
        reaction: {
          text: 'Hah? Nggak sadar. Ya... kata itu emang nggak enak keluar dari mulutku, Bu.',
          expression: 'terkejut',
          cue: 'Gilang menatap tangannya sendiri dan membuka jari-jarinya perlahan.',
        },
        options: { observationTone: 'faktual' },
        text: 'Kamu ngepalin tangan, lalu membukanya pelan pas bilang kata "bodoh".',
      },
      {
        id: 'd', skillId: 'meremehkan', next: TEGANG,
        text: 'Semua orang pernah dikoreksi. Jangan dibawa terlalu pribadi ya.',
      },
    ],
  },
];

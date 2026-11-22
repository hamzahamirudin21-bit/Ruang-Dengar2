/**
 * Cerita Teguh Santosa (mhs-10), adegan Ruang BK bagian eksplorasi: simpul te-b0, te-b2, te-b4, te-b5.
 * Tujuan di luar berkas ini: te-b6 (bk-pemahaman) dan te-tegang-bk (bk-rencana).
 * Dirakit di mhs-10.ts. Seluruh teks Bahasa Indonesia, tanpa Istilah_Diagnosis.
 */
import type { StoryLine, StoryNode } from '../../engine/story/storyTypes';

const SCENE = 'bk';
const TEGANG = 'te-tegang-bk';

function line(text: string, expression: StoryLine['expression'], cue: string, aside?: string): StoryLine {
  return { text, expression, cue, ...(aside ? { aside } : {}) };
}

export const MHS10_BK_EKSPLORASI_NODES: StoryNode[] = [
  {
    id: 'te-b0',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: line(
      'Sepi. Enak. Aku udah bilang ya, Bu, aku nggak ada masalah. Kalau mau tanya silakan, tapi jawabanku mungkin pendek-pendek.',
      'tersenyum',
      'Teguh memilih kursi yang menghadap dinding kosong, lalu meletakkan botol minumnya tepat di tengah meja kecil.',
    ),
    choices: [
      {
        id: 'a', skillId: 'jeda-hening', best: true, next: 'te-b2',
        text: 'Pendek pun nggak apa-apa. Kita boleh diam dulu, ritmenya kamu yang pegang.',
        reaction: {
          text: 'Oke, berarti seperlunya aja ya. Soal yang lagi kukerjain, tiga minggu lagi ada uji kompetensi teknisi instrumentasi. Jadwal persiapannya sudah kutata sendiri.',
          expression: 'netral',
          cue: 'Teguh duduk, meluruskan botol minumnya di tengah meja, lalu bercerita dengan nada rata.',
        },
      },
      {
        id: 'b', skillId: 'sapaan-hangat', next: 'te-b2',
        text: 'Senang kamu mau duduk di sini, Teguh. Pilih aja posisi yang paling nyaman.',
        reaction: {
          text: 'Kursi ini cukup, Bu, terima kasih. Belakangan aku nyiapin uji kompetensi teknisi instrumentasi, tiga minggu lagi. Jadwalnya sudah kutata sendiri.',
          expression: 'tersenyum',
          cue: 'Teguh menarik kursi yang menghadap dinding kosong dan duduk dengan punggung tegak.',
        },
      },
      {
        id: 'c', skillId: 'pertanyaan-terbuka', next: 'te-b2',
        text: 'Kalau nggak ada masalah, belakangan ini kamu lagi sibuk apa?',
        reaction: {
          text: 'Ya kalibrasi, Bu. Tiap hari ngecek sensor tekanan sama suhu. Tiga minggu lagi ada uji kompetensi teknisi instrumentasi, jadwal persiapannya sudah kutata sendiri.',
          expression: 'netral',
          cue: 'Teguh menjawab dengan nada datar yang hangat, jarinya mengetuk meja tiap menyebut satu alat.',
        },
      },
      {
        id: 'd', skillId: 'interogasi', next: TEGANG,
        text: 'Kenapa kamu selalu menghindar dari teman-teman? Jawab yang jujur.',
      },
    ],
  },
  {
    id: 'te-b2',
    sceneId: SCENE,
    stage: 'eksplorasi',
    depth: 0,
    reply: line(
      'Tiga minggu lagi uji kompetensi teknisi instrumentasi. Praktiknya kalibrasi sensor tekanan dan suhu. Jadwalku udah tertata, tinggal dijalani.',
      'netral',
      'Teguh bercerita dengan nada rata dan tenang, sambil mengetuk meja satu kali setiap ia menyebut satu jenis alat.',
    ),
    choices: [
      {
        id: 'a', skillId: 'pertanyaan-terbuka', best: true, next: 'te-b4',
        text: 'Dari semua yang disiapkan, bagian mana yang paling kamu nantikan?',
        reaction: {
          text: 'Menyetel nol sampai jarumnya berhenti pas di angka, Bu. Rasanya tenang. Oh iya, Ibu mau teh? Ada termos kok.',
          expression: 'tersenyum',
          cue: 'Teguh mengeluarkan buku saku berisi daftar periksa tulisan tangan, dan tangannya berhenti di satu baris yang dicoret tebal: "makan bareng".',
          aside: 'Tanpa menunggu jawaban, Teguh menuang teh ke tutup termos dan menggesernya ke arah Dosen bersama serbet kecil yang dilipat segitiga.',
        },
      },
      {
        id: 'b', skillId: 'validasi-normalisasi', next: 'te-b4',
        text: 'Menyiapkan uji praktik dengan jadwal sendiri itu kerja yang matang banget.',
        reaction: {
          text: 'Makasih, Bu. Jadwal sendiri begini yang bikin aku fokus. Oh iya, Ibu mau teh? Termosnya ada di tas.',
          expression: 'tersenyum',
          cue: 'Teguh mengeluarkan buku saku berisi daftar periksa tulisan tangan, dan tangannya berhenti di satu baris yang dicoret tebal: "makan bareng".',
          aside: 'Teguh menuang teh ke tutup termos dan menggesernya ke arah Dosen bersama serbet kecil yang dilipat segitiga.',
        },
      },
      {
        id: 'c', skillId: 'pertanyaan-tertutup', next: 'te-b4',
        text: 'Jadi semuanya udah siap dan nggak ada yang kurang, kan?',
        reaction: line(
          'Hampir semua. Ada satu-dua hal kecil sih, tapi nggak penting.',
          'netral',
          'Teguh mengangkat bahu ringan dan menggeser botol minumnya sedikit ke kiri.',
        ),
      },
      {
        id: 'd', skillId: 'nasihat-dini', next: TEGANG,
        text: 'Belajar bareng teman-teman aja. Uji kompetensi lebih mudah kalau berkelompok.',
      },
    ],
  },
  {
    id: 'te-b4',
    sceneId: SCENE,
    stage: 'eksplorasi',
    depth: 1,
    reply: line(
      'Bagian yang kunantikan itu menyetel nol dan melihat jarum berhenti pas di angkanya. Tenang rasanya. Oh iya, Ibu mau teh? Ada termos kok.',
      'tersenyum',
      'Teguh mengeluarkan buku saku berisi daftar periksa tulisan tangan, dan tangannya berhenti di satu baris yang dicoret tebal: "makan bareng".',
      'Tanpa menunggu jawaban, Teguh menuang teh ke tutup termos dan menggesernya ke arah Dosen, lengkap dengan serbet kecil yang dilipat segitiga.',
    ),
    marks: ['kejutan', 'isyarat-nonverbal'],
    choices: [
      {
        id: 'a', skillId: 'sampaikan-pengamatan', best: true, next: 'te-b5',
        options: { observationTone: 'faktual' },
        text: 'Ada satu baris yang kamu coret tebal, dan tanganmu sempat berhenti di sana.',
        reaction: {
          text: 'Oh, itu. Baris "makan bareng", Bu. Minggu lalu ada yang ngajak makan siang, terus katanya aku sombong karena nolak. Padahal aku cuma lebih lancar kalau nggak banyak suara.',
          expression: 'netral',
          cue: 'Teguh menutup buku saku setengah, ibu jarinya masih menahan halaman yang tadi.',
        },
      },
      {
        id: 'b', skillId: 'jeda-hening', next: 'te-b5',
        text: 'Makasih tehnya. Aku minum dulu, kamu boleh cerita atau nggak.',
        reaction: {
          text: 'Silakan diminum dulu, Bu. Baris yang dicoret tadi itu bekas ajakan makan siang minggu lalu. Katanya aku sombong, padahal aku cuma lebih lancar kalau suasananya tenang.',
          expression: 'netral',
          cue: 'Teguh menunggu Dosen menyesap tehnya, lalu menatap uap teh sebelum membuka suara.',
        },
      },
      {
        id: 'c', skillId: 'janji-mutlak', next: 'te-b5',
        text: 'Kasih lihat bukumu, nanti kupastikan semua barisnya terpenuhi sebelum ujian.',
        reaction: line(
          'Makasih, tapi ini catatan pribadi. Biar aku yang pegang aja.',
          'waspada',
          'Teguh menutup buku saku dan menaruhnya di saku dada, pelan dan tegas.',
        ),
      },
      {
        id: 'd', skillId: 'interogasi', next: TEGANG,
        text: 'Kenapa ada tulisan "makan bareng" yang dicoret? Kamu memang nggak mau berteman?',
      },
    ],
  },
  {
    id: 'te-b5',
    sceneId: SCENE,
    stage: 'eksplorasi',
    depth: 1,
    reply: line(
      'Itu bekas ajakan makan siang minggu lalu. Katanya aku sombong, padahal aku cuma lebih lancar kalau nggak ada banyak suara.',
      'netral',
      'Teguh menyentuh tutup termos dengan ujung jari, lalu menatap uap tehnya, bukan menatap Dosen.',
    ),
    choices: [
      {
        id: 'a', skillId: 'validasi-normalisasi', best: true, next: 'te-b6',
        text: 'Lancar saat tenang itu cara kerja yang sah. Nggak harus sama dengan orang lain.',
        reaction: {
          text: 'Iya, Bu. Kalau sendirian aku merasa cukup. Tapi kalau ada yang bilang aku sombong, aku jadi ikut menimbang-nimbang, jangan-jangan aku memang begitu.',
          expression: 'menunduk',
          cue: 'Teguh mengangguk pelan, lalu menatap tutup termos dan bukan Dosen.',
        },
      },
      {
        id: 'b', skillId: 'pertanyaan-terbuka', next: 'te-b6',
        text: 'Waktu kata "sombong" itu terdengar, apa yang kamu rasakan?',
        reaction: {
          text: 'Kaget dulu, Bu, terus kepikiran. Aku jadi ikut menimbang-nimbang sendiri, padahal kalau sendirian rasanya sudah cukup.',
          expression: 'menunduk',
          cue: 'Teguh memutar tutup termos setengah putaran, lalu berhenti dan menatap uap tehnya.',
        },
      },
      {
        id: 'c', skillId: 'refleksi-perasaan', next: 'te-b6',
        options: { reflectionNuance: 'kecewa-kesal', reflectionCorrectOverride: false },
        text: 'Kamu pasti marah pada mereka yang menyebutmu begitu.',
        reaction: line(
          'Marah? Nggak juga. Mereka nggak jahat kok, cuma kurang paham.',
          'netral',
          'Teguh menggeleng pelan sambil tersenyum tipis.',
        ),
      },
      {
        id: 'd', skillId: 'meremehkan', next: 'te-b6',
        text: 'Ah, omongan teman begitu jangan dipikirin. Nanti juga lupa.',
        reaction: line(
          'Mungkin. Nggak apa-apa.',
          'menutup-diri',
          'Teguh mengangguk sopan, tetapi tangannya menarik diri dari tutup termos.',
        ),
      },
    ],
  },
];

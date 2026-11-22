/**
 * Teguh Santosa (mhs-10), adegan Ruang BK bagian pemahaman.
 * Simpul (urutan jalur): te-b6, te-b9, te-b8, te-b12, ditambah alternatif te-b9-alt, te-b8-alt, te-b12-alt.
 *
 * Titik sambung:
 *  - masuk dari `te-b5` (berkas bk-eksplorasi) ke `te-b6`.
 *  - keluar dari `te-b12` dan `te-b12-alt` ke `te-b13` (berkas bk-rencana).
 *  - Ketegangan memakai `te-tegang-bk` (berkas bk-rencana).
 *
 * Gerbang: `te-b8` (Momen_Terbuka) butuh trust >= 74, level >= 1, serta bendera `isyarat-diperhatikan`
 * (dari te-l2) dan `ruang-dihormati` (dari adegan lab); `te-b9` butuh trust >= 66;
 * `te-b12` (inti kebutuhan, kedalaman 2) butuh level >= 2. Bila gagal, alur memakai simpul alternatif.
 */
import type { StoryNode } from '../../engine/story/storyTypes';

const SCENE = 'bk';
const TENSION = 'te-tegang-bk';
const RAGU = { reflectionNuance: 'ragu-kurang-percaya' } as const;

export const MHS_10_BK_PEMAHAMAN_NODES: StoryNode[] = [
  {
    id: 'te-b6',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 1,
    reply: {
      text: 'Anehnya, kalau sendirian aku merasa penuh. Tapi begitu ada yang bilang aku sombong, aku jadi ikut menimbang-nimbang sendiri.',
      expression: 'menunduk',
      cue: 'Teguh memutar tutup botol minumnya satu putaran penuh, lalu mengembalikannya ke posisi semula.',
    },
    choices: [
      {
        id: 'a', skillId: 'parafrase-ringkasan', best: true, next: 'te-b9',
        text: 'Sendirian terasa cukup bagimu, tapi penilaian orang membuatmu ikut bertanya-tanya?',
        reaction: {
          text: 'Iya, begitu, Bu. Soal kerja teknis aku yakin, bulan lalu malah nemu selisih nol koma tiga persen di transmitter tekanan. Cuma soal uji praktik, nggak ada yang bisa mastiin selain aku sendiri.',
          expression: 'netral',
          cue: 'Teguh mengangguk dan memutar tutup botol minumnya satu putaran penuh sebelum menjawab.',
        },
      },
      {
        id: 'b', skillId: 'validasi-normalisasi', next: 'te-b9',
        text: 'Wajar ikut menimbang kalau denger penilaian orang. Itu nggak berarti kamu keliru.',
        reaction: {
          text: 'Makasih, Bu. Ya, kadang aku mikir ulang. Tapi kerja teknisku aman, bulan lalu aku nemu selisih nol koma tiga persen di transmitter tekanan. Yang kurang cuma cara mastiin hasil uji praktikku benar.',
          expression: 'netral',
          cue: 'Teguh menarik napas pendek dan mengembalikan tutup botol ke posisi semula.',
        },
      },
      {
        id: 'c', skillId: 'nasihat-dini', next: TENSION,
        text: 'Coba ikut kegiatan kelompok sekali-sekali, biar mereka berhenti bilang begitu.',
      },
      {
        id: 'd', skillId: 'pertanyaan-tertutup', next: 'te-b9',
        text: 'Jadi sebenarnya kamu terganggu oleh omongan mereka?',
        reaction: {
          text: 'Terganggu sedikit, iya. Tapi nggak sebesar itu.',
          expression: 'netral',
          cue: 'Teguh mengerutkan alis sebentar, lalu merapikan serbet segitiga di dekat gelas.',
        },
      },
    ],
  },
  {
    id: 'te-b9',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 1,
    reply: {
      text: 'Bulan lalu kuukur ulang transmitter tekanan di gudang, ketemu selisih nol koma tiga persen yang lolos dari semua orang. Rasanya berguna, tanpa harus bicara banyak. Cuma soal uji praktik, nggak ada yang bisa menguji aku selain aku sendiri.',
      expression: 'tersenyum',
      cue: 'Mata Teguh tampak hidup saat menyebut selisih itu, lalu pelan-pelan meredup ketika ia menyebut kata "sendiri".',
    },
    gate: { conditions: [{ type: 'trust-min', value: 66 }], otherwise: 'te-b9-alt' },
    choices: [
      {
        id: 'a', skillId: 'pertanyaan-terbuka', best: true, next: 'te-b8',
        text: 'Waktu selisih itu ketemu, apa yang paling kamu hargai dari dirimu?',
        reaction: {
          text: 'Ketelitianku, Bu. Selisih sekecil itu lolos dari orang lain, tapi kelihatan olehku. Itu bikin aku merasa berguna tanpa harus banyak bicara.',
          expression: 'tersenyum',
          cue: 'Mata Teguh tampak hidup sejenak, lalu ia merapikan buku saku di depannya.',
        },
      },
      {
        id: 'b', skillId: 'refleksi-perasaan', options: RAGU, next: 'te-b8',
        text: 'Kamu bangga pada ketelitianmu, tapi ada sepi saat harus menilai hasilnya sendiri.',
        reaction: {
          text: 'Iya, begitu, Bu. Bangga sih, tapi kadang sepi juga kalau yang menilai hasilnya cuma aku sendiri.',
          expression: 'menunduk',
          cue: 'Teguh mengangguk pelan, pandangannya turun ke gelas teh di depannya.',
        },
      },
      {
        id: 'c', skillId: 'pertanyaan-tertutup', next: 'te-b8',
        text: 'Jadi yang kurang cuma orang yang bisa menguji praktikmu, begitu?',
        reaction: {
          text: 'Mungkin. Tapi bukan berarti aku butuh banyak orang.',
          expression: 'waspada',
          cue: 'Teguh mengusap tengkuknya dan menatap dinding kosong di seberang.',
        },
      },
      {
        id: 'd', skillId: 'nasihat-dini', next: TENSION,
        text: 'Kalau gitu minta tolong aja ke teman sekelas. Mereka pasti mau.',
      },
    ],
  },
  {
    id: 'te-b9-alt',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 1,
    reply: {
      text: 'Kerjaan teknis aman kok. Yang agak kurang cuma cara mastiin jawabanku benar sebelum ujian.',
      expression: 'netral',
      cue: 'Teguh mengangkat bahu sedikit, seolah itu urusan kecil yang tidak perlu dibahas panjang.',
    },
    choices: [
      {
        id: 'a', skillId: 'parafrase-ringkasan', best: true, next: 'te-b8',
        text: 'Jadi kerja teknismu aman, dan yang kamu cari adalah cara memastikan jawabanmu benar.',
        reaction: {
          text: 'Iya, itu aja, Bu. Teknisnya udah kukuasai, tinggal cari cara supaya aku yakin hasilnya benar sebelum ujian.',
          expression: 'netral',
          cue: 'Teguh mengangguk singkat dan merapikan buku sakunya yang sudah rapi.',
        },
      },
      {
        id: 'b', skillId: 'pertanyaan-terbuka', next: 'te-b8',
        text: 'Selama ini bagaimana kamu mengecek jawabanmu sendiri?',
        reaction: {
          text: 'Kuulang dua kali dan kucocokkan dengan tabel acuan. Tapi tetap aja yang menilai aku sendiri, jadi kurang mantap.',
          expression: 'netral',
          cue: 'Teguh menghitung dengan jari di atas meja, lalu mengangkat bahu sedikit.',
        },
      },
      {
        id: 'c', skillId: 'validasi-normalisasi', next: 'te-b8',
        text: 'Ingin yakin sebelum ujian itu wajar, apalagi untuk praktik yang butuh ketelitian.',
        reaction: {
          text: 'Iya, kan? Ujiannya butuh ketelitian, jadi aku pengin yakin dulu sebelum hari-H.',
          expression: 'netral',
          cue: 'Teguh mengangguk, tampak lega karena alasannya diterima tanpa banyak tanya.',
        },
      },
      {
        id: 'd', skillId: 'pertanyaan-tertutup', next: 'te-b8',
        text: 'Cuma itu yang kurang, bukan hal lain?',
        reaction: {
          text: 'Cuma itu.',
          expression: 'menutup-diri',
          cue: 'Teguh menjawab singkat, lalu memperbaiki letak botol minumnya.',
        },
      },
    ],
  },
  {
    id: 'te-b8',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 2,
    reply: {
      text: 'Kemarin aku coba makan di kantin ramai, biar nggak disebut sombong. Dua puluh menit. Kepalaku berdenyut, dan malamnya kuulang kalibrasi alat yang sebenarnya udah benar. Aku jadi takut, jangan-jangan menyendiri itu salah.',
      expression: 'tertegun',
      cue: 'Teguh berhenti memutar tutup botol, menekan pelipisnya dengan dua jari, dan suaranya turun hingga nyaris tidak terdengar.',
    },
    marks: ['momen-terbuka'],
    gate: {
      conditions: [
        { type: 'trust-min', value: 74 }, { type: 'level-min', value: 1 },
        { type: 'flag', flag: 'isyarat-diperhatikan' }, { type: 'flag', flag: 'ruang-dihormati' },
      ],
      otherwise: 'te-b8-alt',
    },
    onEnter: { setFlags: ['momen-terbuka'] },
    choices: [
      {
        id: 'a', skillId: 'refleksi-perasaan', best: true, options: RAGU, next: 'te-b12',
        text: 'Kamu sempat meragukan caramu sendiri, padahal tubuhmu sudah kasih tahu apa yang pas.',
        reaction: {
          text: 'Iya, Bu. Sampai kuulang kalibrasi yang sebenarnya udah benar. Padahal badanku udah jelas bilang mana yang pas, ya. Kayaknya yang kubutuhkan nggak rumit.',
          expression: 'menunduk',
          cue: 'Teguh menurunkan tangan dari pelipisnya dan menatap gelas teh yang tinggal setengah.',
        },
      },
      {
        id: 'b', skillId: 'afirmasi-kekuatan', next: 'te-b12',
        text: 'Kamu berani mencoba demi orang lain. Itu menunjukkan kamu peduli banget.',
        reaction: {
          text: 'Baru dua puluh menit di kantin itu aja aku udah habis tenaga, Bu. Peduli sih iya, tapi aku juga perlu tahu batasku.',
          expression: 'menunduk',
          cue: 'Teguh menekan pelipisnya dengan dua jari, lalu menurunkannya perlahan.',
        },
      },
      {
        id: 'c', skillId: 'pertanyaan-terbuka', next: 'te-b12',
        text: 'Apa yang kamu rasakan ketika kepalamu berdenyut di kantin itu?',
        reaction: {
          text: 'Pusing, penuh, kayak semua suara masuk bareng. Aku cuma pengin cepat-cepat keluar, terus pulang ngulang kalibrasi.',
          expression: 'lelah',
          cue: 'Teguh menekan pelipis dengan dua jari, suaranya turun hingga nyaris tidak terdengar.',
        },
      },
      {
        id: 'd', skillId: 'interogasi', next: TENSION,
        text: 'Kenapa kamu sampai memaksa diri begitu? Itu kan bodoh.',
      },
    ],
  },
  {
    id: 'te-b8-alt',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 1,
    reply: {
      text: 'Udah, aku cuma lebih nyaman begini. Nggak perlu dipikirin.',
      expression: 'netral',
      cue: 'Teguh tersenyum sopan dan menggeser gelas teh sedikit menjauh dari tepi meja.',
    },
    choices: [
      {
        id: 'a', skillId: 'pertanyaan-terbuka', best: true, next: 'te-b12',
        text: 'Kalau kenyamananmu sudah jelas, apa yang ingin kamu jaga tetap sama?',
        reaction: {
          text: 'Jam belajarku yang tenang, sama urutan kerjaku di gudang. Selama itu nggak diganggu, aku merasa baik-baik aja.',
          expression: 'netral',
          cue: 'Teguh menggeser gelas teh sedikit menjauh dari tepi meja dan menjawab dengan tenang.',
        },
      },
      {
        id: 'b', skillId: 'validasi-normalisasi', next: 'te-b12',
        text: 'Boleh nggak dibahas dalam. Kita jalan pelan aja, nggak dipaksa.',
        reaction: {
          text: 'Makasih, Bu. Sedikit-sedikit dulu ya, aku lebih lega begitu.',
          expression: 'lega',
          cue: 'Teguh tersenyum sopan dan bahunya turun sedikit.',
        },
      },
      {
        id: 'c', skillId: 'sampaikan-pengamatan', options: { observationTone: 'faktual' }, next: 'te-b12',
        text: 'Kamu menyentuh pelipismu tadi, sebentar saja, lalu meletakkan tangan lagi.',
        reaction: {
          text: 'Oh, itu. Cuma pegal sedikit, Bu, habis lama nunduk baca skala. Nggak apa-apa.',
          expression: 'netral',
          cue: 'Teguh menurunkan tangannya ke meja dan tersenyum sopan.',
        },
      },
      {
        id: 'd', skillId: 'meremehkan', next: 'te-b12',
        text: 'Pasti baik-baik saja. Orang sepintar kamu nggak perlu cemas.',
        reaction: {
          text: 'Iya, mungkin. Terima kasih.',
          expression: 'menutup-diri',
          cue: 'Teguh mengangguk sopan dan menatap jam dinding tanpa benar-benar melihatnya.',
        },
      },
    ],
  },
  {
    id: 'te-b12',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 2,
    reply: {
      text: 'Kayaknya yang kubutuhkan sederhana. Belajar dengan caraku tanpa dianggap kurang, dan satu orang yang mau menguji praktikku seminggu sekali. Nggak perlu kelompok.',
      expression: 'lega',
      cue: 'Teguh meletakkan buku sakunya di atas meja, terbuka, lalu menyorongkannya setengah jengkal ke arah Dosen.',
    },
    gate: { conditions: [{ type: 'level-min', value: 2 }], otherwise: 'te-b12-alt' },
    choices: [
      {
        id: 'a', skillId: 'parafrase-ringkasan', best: true, next: 'te-b13',
        text: 'Kamu ingin belajar caramu sendiri, dengan satu penguji mingguan tanpa kelompok. Tepat?',
        reaction: {
          text: 'Tepat, Bu. Kalau boleh jadwalnya Rabu sore, dua puluh menit di gudang. Aku jelasin langkah kalibrasi, Ibu catat yang kurang. Satu lagi, aku kirim pesan pendek ke Bagas, temanku.',
          expression: 'netral',
          cue: 'Teguh menulis "Rabu 15.30" di halaman kosong buku sakunya, lalu merobek sudutnya dan menaruhnya dekat gelas Dosen.',
        },
      },
      {
        id: 'b', skillId: 'afirmasi-kekuatan', next: 'te-b13',
        text: 'Kamu tahu persis cara belajarmu. Itu modal kuat untuk menghadapi uji praktik.',
        reaction: {
          text: 'Makasih, Bu. Makanya aku pengin rutin: Rabu sore, dua puluh menit di gudang, latihan kalibrasi dan Ibu yang menilai. Ke Bagas, temanku, juga kukirim pesan pendek biar dia nggak salah paham.',
          expression: 'tersenyum',
          cue: 'Teguh menulis "Rabu 15.30" di buku sakunya, merobek sudutnya, dan menyodorkannya ke arah Dosen.',
        },
      },
      {
        id: 'c', skillId: 'refleksi-perasaan', options: RAGU, next: 'te-b13',
        text: 'Ada keinginan untuk diakui apa adanya, tanpa harus membuktikan diri kepada siapa pun.',
        reaction: {
          text: 'Iya, Bu, kira-kira begitu. Jadi aku nggak mau yang muluk-muluk. Cukup Rabu sore dua puluh menit di gudang, dan satu pesan pendek ke Bagas, temanku, bahwa aku nggak menolak dia.',
          expression: 'lega',
          cue: 'Teguh menarik napas lega, lalu menulis "Rabu 15.30" di halaman kosong buku sakunya.',
        },
      },
      {
        id: 'd', skillId: 'nasihat-dini', next: TENSION,
        text: 'Tapi nanti kamu tetap harus belajar kerja dalam tim, lho.',
      },
    ],
  },
  {
    id: 'te-b12-alt',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 1,
    reply: {
      text: 'Intinya aku cuma perlu tempat belajar yang tenang. Soal yang lain, aku belum bisa jelasin.',
      expression: 'netral',
      cue: 'Teguh menutup buku saku dan menepuk sampulnya dua kali, seperti menutup laci kalibrator tadi.',
    },
    choices: [
      {
        id: 'a', skillId: 'validasi-normalisasi', best: true, next: 'te-b13',
        text: 'Tempat tenang itu kebutuhan yang jelas. Sisanya nggak perlu dijelaskan sekarang.',
        reaction: {
          text: 'Makasih, Bu. Aku punya usul kecil: Rabu sore, dua puluh menit di gudang buat latihan kalibrasi, Ibu yang menilai. Terus aku kirim pesan pendek ke Bagas, temanku.',
          expression: 'netral',
          cue: 'Teguh menutup buku saku, lalu membukanya lagi dan menulis "Rabu 15.30" di halaman kosong.',
        },
      },
      {
        id: 'b', skillId: 'parafrase-ringkasan', next: 'te-b13',
        text: 'Jadi yang paling kamu perlukan saat ini adalah ruang belajar yang tenang.',
        reaction: {
          text: 'Iya, itu intinya. Biar nyata, aku usul Rabu sore dua puluh menit di gudang, latihan kalibrasi dengan Ibu. Satu lagi, aku kirim pesan pendek ke Bagas, temanku, supaya dia nggak salah paham.',
          expression: 'netral',
          cue: 'Teguh menepuk sampul buku sakunya dua kali, lalu menulis "Rabu 15.30" di sobekan kertas kecil.',
        },
      },
      {
        id: 'c', skillId: 'pertanyaan-terbuka', next: 'te-b13',
        text: 'Kalau ada satu hal kecil yang bisa menambah tenangnya belajarmu, apa itu?',
        reaction: {
          text: 'Satu jadwal tetap aja, Bu. Rabu sore dua puluh menit di gudang, ada yang menguji latihan kalibrasiku. Sama pesan pendek ke Bagas, temanku, biar dia tahu aku nggak menolaknya.',
          expression: 'netral',
          cue: 'Teguh berpikir sebentar, lalu menulis "Rabu 15.30" di halaman kosong dan menyobek sudutnya.',
        },
      },
      {
        id: 'd', skillId: 'meremehkan', next: 'te-b13',
        text: 'Tempat tenang kan gampang dicari. Nggak perlu dibahas serius.',
        reaction: {
          text: 'Iya. Terima kasih, Bu.',
          expression: 'menutup-diri',
          cue: 'Teguh mengangguk kecil dan memasukkan buku saku ke saku dada.',
        },
      },
    ],
  },
];

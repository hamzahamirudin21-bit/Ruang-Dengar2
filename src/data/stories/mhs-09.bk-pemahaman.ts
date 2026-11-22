/**
 * Gilang Ramadhan (mhs-09), adegan Ruang BK bagian pemahaman.
 * Simpul (urutan jalur): gi-b6, gi-b9, gi-b8, gi-b12, ditambah alternatif gi-b9-alt, gi-b8-alt, gi-b12-alt.
 *
 * Titik sambung:
 *  - masuk dari `gi-b5` (berkas bk-eksplorasi) ke `gi-b6`.
 *  - keluar dari `gi-b12` dan `gi-b12-alt` ke `gi-b13` (berkas bk-rencana).
 *  - Ketegangan memakai `gi-tegang-bk` (berkas bk-rencana).
 *
 * Gerbang: `gi-b8` (Momen_Terbuka) butuh trust, level >= 1, dan bendera `dampak-diakui` (dari gi-b5),
 * yaitu pengakuan dampak koreksi di depan kelompok lebih dulu; `gi-b9` butuh trust;
 * `gi-b12` (inti kebutuhan, kedalaman 2) butuh level >= 2.
 * Bila gagal, alur memakai simpul alternatif yang tetap menuju tulang punggung cerita.
 */
import type { StoryNode } from '../../engine/story/storyTypes';

const SCENE = 'bk';
const TENSION = 'gi-tegang-bk';
const KESAL = { reflectionNuance: 'kecewa-kesal' } as const;

export const MHS_09_BK_PEMAHAMAN_NODES: StoryNode[] = [
  {
    id: 'gi-b6',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 1,
    reply: {
      text: 'Sejak itu aku simpan semua hasil kerjaku sampai menit terakhir. Kukumpulin mepet tenggat, biar nggak ada yang sempat komentar.',
      expression: 'netral',
      cue: 'Gilang menyandarkan punggung ke kursi, menyilangkan kaki, dan memutar-mutar tutup botol minumnya di jari.',
    },
    choices: [
      {
        id: 'a', skillId: 'refleksi-perasaan', best: true, options: KESAL, next: 'gi-b9',
        reaction: {
          text: 'Iya, Bu. Tepat gitu. Aku nggak mau ada yang ngomentarin lagi.',
          expression: 'tertegun',
          cue: 'Gilang mengangguk pendek, lalu menunduk menatap sepatu bengkelnya.',
        },
        text: 'Kamu nahan karyamu sampai akhir karena masih kesal dan nggak mau dipermalukan lagi.',
      },
      {
        id: 'b', skillId: 'validasi-normalisasi', next: 'gi-b9',
        reaction: {
          text: 'Beneran dipahami, Bu? Soalnya anak-anak bilang aku cuma sok misterius.',
          expression: 'waspada',
          cue: 'Gilang mengangkat alis, ragu-ragu tetapi tidak lagi mengalihkan pandangan.',
        },
        text: 'Ngelindungin hasil kerja dari komentar yang nyakitin itu bisa dipahami kok.',
      },
      {
        id: 'c', skillId: 'nasihat-dini', next: TENSION,
        text: 'Sebaiknya kamu tunjukkan hasilmu lebih awal ke tim. Itu cara kerja yang benar.',
      },
      {
        id: 'd', skillId: 'pertanyaan-tertutup', next: 'gi-b9',
        text: 'Jadi kamu memang tidak mau bekerja sama dengan tim?',
        reaction: {
          text: 'Bukan nggak mau. Aku cuma nggak mau jadi bahan tontonan.',
          expression: 'kesal',
          cue: 'Gilang berhenti memutar tutup botol dan menggenggamnya erat.',
        },
      },
    ],
  },
  {
    id: 'gi-b9',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 1,
    reply: {
      text: 'Padahal aku paling hidup pas nguji. Rangka tekanan itu, retaknya aku yang nemuin sebelum dipasang ke rig. Kalau lolos, bisa celaka orang. Tapi nggak ada yang bahas bagian itu.',
      expression: 'tersenyum',
      cue: 'Mata Gilang menyala saat menyebut retakan itu, kedua tangannya memeragakan ukuran rangka, lalu jatuh ke pangkuan.',
    },
    gate: { conditions: [{ type: 'trust-min', value: 44 }], otherwise: 'gi-b9-alt' },
    choices: [
      {
        id: 'a', skillId: 'refleksi-perasaan', best: true, options: KESAL, next: 'gi-b8',
        reaction: {
          text: 'Iya, Bu. Dua-duanya. Bangga, tapi kesal kenapa yang keinget malah yang jelek.',
          expression: 'tertegun',
          cue: 'Gilang menarik napas panjang dan melonggarkan kepalan tangannya di atas paha.',
        },
        text: 'Kamu bangga sama kerja ujimu, tapi kesal karena yang diingat cuma kekurangannya.',
      },
      {
        id: 'b', skillId: 'pertanyaan-terbuka', next: 'gi-b8',
        reaction: {
          text: 'Jantungku sempat deg, Bu. Terus lega banget pas ketemu duluan.',
          expression: 'lega',
          cue: 'Gilang menekan telapak tangannya ke dada sebentar, lalu tersenyum tipis.',
        },
        text: 'Waktu nemuin retakan itu sebelum terpasang, kamu ngerasa gimana?',
      },
      {
        id: 'c', skillId: 'pertanyaan-tertutup', next: 'gi-b8',
        text: 'Jadi kamu lebih cocok jadi penguji daripada tukang las?',
        reaction: {
          text: 'Dua-duanya aku. Jangan dipisah-pisah seenaknya dong.',
          expression: 'kesal',
          cue: 'Gilang menegakkan badan dan menaikkan satu alis.',
        },
      },
      {
        id: 'd', skillId: 'nasihat-dini', next: TENSION,
        text: 'Kalau begitu fokus saja ke pengujian dan tinggalkan urusan las.',
      },
    ],
  },
  {
    id: 'gi-b9-alt',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 1,
    reply: {
      text: 'Pengujian sih lancar-lancar aja. Yang bikin mager itu urusan kelompoknya, ribet.',
      expression: 'netral',
      cue: 'Gilang mengangkat bahu dan menatap langit-langit seolah bosan dengan pertanyaannya.',
    },
    choices: [
      {
        id: 'a', skillId: 'pertanyaan-terbuka', best: true, next: 'gi-b8',
        reaction: {
          text: 'Rapat dadakan, Bu. Semua ngomong, nggak ada yang mutusin, ujungnya aku yang disuruh ngerjain.',
          expression: 'kesal',
          cue: 'Gilang mendengus dan memutar mata ke arah langit-langit.',
        },
        text: 'Dari urusan kelompok yang ribet itu, bagian mana yang paling ganggu kamu?',
      },
      {
        id: 'b', skillId: 'parafrase-ringkasan', next: 'gi-b8',
        reaction: {
          text: 'Iya, Bu, gitu. Ngujinya enak, kerja kelompoknya yang bikin capek.',
          expression: 'netral',
          cue: 'Gilang mengangguk singkat dan menyandarkan punggung ke dinding.',
        },
        text: 'Jadi kerja ujinya lancar, tapi kerja kelompoknya yang bikin capek.',
      },
      {
        id: 'c', skillId: 'validasi-normalisasi', next: 'gi-b8',
        reaction: {
          text: 'Capek sabar, Bu. Kepala banyak, ide banyak, yang ngerjain itu-itu aja.',
          expression: 'lelah',
          cue: 'Gilang mengembuskan napas panjang dan mengusap wajahnya dengan telapak tangan.',
        },
        text: 'Kerja bareng banyak kepala memang sering nguras sabar.',
      },
      {
        id: 'd', skillId: 'pertanyaan-tertutup', next: 'gi-b8',
        text: 'Cuma itu yang membuatmu malas?',
        reaction: {
          text: 'Iya, cuma itu.',
          expression: 'menutup-diri',
          cue: 'Gilang menjawab ketus sambil memalingkan wajah ke dinding.',
        },
      },
    ],
  },
  {
    id: 'gi-b8',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 2,
    reply: {
      text: 'Semalam sambungan itu kulas ulang sampai jam dua. Sekarang rapi, nggak ada yang bolong. Tapi kusimpan di bawah meja. Nggak kukumpulin. Aku takut ditunjuk lagi, jadi aku nggak mau namaku ada di kerja kelompok.',
      expression: 'tertegun',
      cue: 'Gilang mengeluarkan ponsel, memperlihatkan foto sambungan las yang mulus, lalu mematikannya. Rahangnya bergetar, bukan mengeras, dan suaranya jauh lebih rendah.',
    },
    marks: ['momen-terbuka'],
    gate: {
      conditions: [
        { type: 'trust-min', value: 48 }, { type: 'level-min', value: 1 },
        { type: 'flag', flag: 'dampak-diakui' },
      ],
      otherwise: 'gi-b8-alt',
    },
    onEnter: { setFlags: ['momen-terbuka'] },
    choices: [
      {
        id: 'a', skillId: 'refleksi-perasaan', best: true, options: KESAL, next: 'gi-b12',
        reaction: {
          text: 'Iya, Bu. Berat. Diam-diam kukerjain, tapi nunjukinnya yang nggak sanggup.',
          expression: 'menunduk',
          cue: 'Gilang menunduk dan menarik lengan jaketnya sampai menutup punggung tangan.',
        },
        text: 'Kamu udah benerin diam-diam, tapi terlalu sakit buat nunjukinnya. Itu berat ya.',
      },
      {
        id: 'b', skillId: 'afirmasi-kekuatan', next: 'gi-b12',
        reaction: {
          text: 'Ya... namanya sambungan jelek itu salah sendiri, Bu. Makanya kuulang.',
          expression: 'netral',
          cue: 'Gilang mengangkat bahu, tetapi sudut bibirnya sedikit melembut.',
        },
        text: 'Kamu ngerjain ulang sampai jam dua. Itu tanggung jawab yang besar.',
      },
      {
        id: 'c', skillId: 'pertanyaan-terbuka', next: 'gi-b12',
        reaction: {
          text: 'Puas sebentar, Bu. Terus mikir, "kalau ini yang kutunjukin dari awal, nggak bakal ada yang ngetawain".',
          expression: 'tertegun',
          cue: 'Gilang menatap layar ponselnya yang kosong, lalu menyimpannya kembali ke saku.',
        },
        text: 'Semalam waktu motret hasil lasan itu, kamu ngerasa apa?',
      },
      {
        id: 'd', skillId: 'interogasi', next: TENSION,
        text: 'Kenapa tidak langsung dikumpulkan? Itu keputusan yang bodoh.',
      },
    ],
  },
  {
    id: 'gi-b8-alt',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 1,
    reply: {
      text: 'Nggak ada yang besar. Aku cuma mager kerja kelompok. Titik.',
      expression: 'menutup-diri',
      cue: 'Gilang menarik lengan jaketnya lagi dan menyilangkan tangan rapat di dada.',
    },
    choices: [
      {
        id: 'a', skillId: 'pertanyaan-terbuka', best: true, next: 'gi-b12',
        reaction: {
          text: 'Ya nggak banyak rapat, Bu. Bagiannya jelas, dikerjain, dikumpulin. Titik.',
          expression: 'netral',
          cue: 'Gilang menyilangkan jari-jarinya di meja dan menatap Dosen datar.',
        },
        text: 'Kalau kerja kelompoknya terasa lebih ringan, bentuknya kayak apa buatmu?',
      },
      {
        id: 'b', skillId: 'validasi-normalisasi', next: 'gi-b12',
        reaction: {
          text: 'Hm, oke. Makasih, Bu. Nggak didesak gitu enak juga.',
          expression: 'lega',
          cue: 'Gilang menghembuskan napas pelan dan bahunya turun sedikit.',
        },
        text: 'Nggak apa-apa kalau belum mau cerita lebih. Kita ikut tempomu aja.',
      },
      {
        id: 'c', skillId: 'sampaikan-pengamatan', options: { observationTone: 'faktual' }, next: 'gi-b12',
        reaction: {
          text: 'Hah? Oh. Kebiasaan aja, Bu. Bukan apa-apa.',
          expression: 'menutup-diri',
          cue: 'Gilang cepat-cepat melepas lengan jaketnya dan memalingkan wajah.',
        },
        text: 'Kamu narik lengan jaketmu lagi, sama kayak tadi waktu bahas uji tekanan.',
      },
      {
        id: 'd', skillId: 'meremehkan', next: 'gi-b12',
        text: 'Nanti juga reda sendiri. Anak teknik memang begitu.',
        reaction: {
          text: 'Terserah Ibu aja.',
          expression: 'menutup-diri',
          cue: 'Gilang mengerutkan dahi dan membuang pandangan ke pintu.',
        },
      },
    ],
  },
  {
    id: 'gi-b12',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 2,
    reply: {
      text: 'Aku nggak minta dipuji. Aku cuma mau dikoreksi dengan cara yang tetap bikin aku dianggap bisa. Empat mata, atau ditulis, jangan di depan semua orang.',
      expression: 'lega',
      cue: 'Gilang menurunkan tangan dari dada, memegang pergelangan yang melepuh tanpa menyembunyikannya, lalu menarik napas panjang.',
    },
    gate: { conditions: [{ type: 'level-min', value: 2 }], otherwise: 'gi-b12-alt' },
    choices: [
      {
        id: 'a', skillId: 'parafrase-ringkasan', best: true, next: 'gi-b13',
        reaction: {
          text: 'Betul, Bu. Kok bisa Ibu nyusunnya lebih rapi dari omonganku sendiri.',
          expression: 'tertegun',
          cue: 'Gilang mengerjap, lalu mengangguk pelan dengan tatapan yang melunak.',
        },
        text: 'Jadi kamu mau dikoreksi empat mata atau tertulis, dan tetap dihargai. Betul?',
      },
      {
        id: 'b', skillId: 'afirmasi-kekuatan', next: 'gi-b13',
        reaction: {
          text: 'Dewasa? Haha. Jarang ada yang bilang gitu ke aku, Bu. Tapi... makasih.',
          expression: 'tertegun',
          cue: 'Gilang tertawa pendek lalu cepat-cepat menunduk menyembunyikan senyumnya.',
        },
        text: 'Kamu tahu persis cara terima kritik yang bikin kamu tumbuh. Itu dewasa banget.',
      },
      {
        id: 'c', skillId: 'refleksi-perasaan', options: KESAL, next: 'gi-b13',
        reaction: {
          text: 'Iya, Bu. Itu. Aku nggak minta dibilang bagus, cuma jangan direndahin.',
          expression: 'lega',
          cue: 'Gilang mengangguk dan melepaskan kepalan tangannya sepenuhnya.',
        },
        text: 'Kamu pengin tetap dihormati waktu kekuranganmu dibicarakan.',
      },
      {
        id: 'd', skillId: 'nasihat-dini', next: TENSION,
        text: 'Kalau begitu terima saja kritik dengan lapang dada, dari siapa pun dan di mana pun.',
      },
    ],
  },
  {
    id: 'gi-b12-alt',
    sceneId: SCENE,
    stage: 'pemahaman',
    depth: 1,
    reply: {
      text: 'Intinya aku mau dibiarin kerja dulu. Itu aja. Jangan ditanya-tanya terus.',
      expression: 'netral',
      cue: 'Gilang mengetuk-ngetukkan jari ke lengan kursi dengan irama cepat, matanya mengarah ke lantai.',
    },
    choices: [
      {
        id: 'a', skillId: 'validasi-normalisasi', best: true, next: 'gi-b13',
        reaction: {
          text: 'Hm. Ya, makasih, Bu. Nggak dipaksa jelasin lebih enak.',
          expression: 'lega',
          cue: 'Gilang menyandarkan punggungnya dan menghembuskan napas pendek.',
        },
        text: 'Pengin kerja tenang itu wajar. Nggak perlu dijelasin semuanya sekarang kok.',
      },
      {
        id: 'b', skillId: 'parafrase-ringkasan', next: 'gi-b13',
        reaction: {
          text: 'Iya, Bu. Ruang buat kerja aja. Nggak diganggu, nggak ditanya-tanya.',
          expression: 'netral',
          cue: 'Gilang mengangguk singkat sambil memutar kikir di tangannya.',
        },
        text: 'Jadi yang paling kamu mau sekarang itu ruang buat kerja tanpa diganggu.',
      },
      {
        id: 'c', skillId: 'pertanyaan-terbuka', next: 'gi-b13',
        reaction: {
          text: 'Satu hal? Kalau meja lasku nggak dilewatin orang bolak-balik, Bu. Itu aja udah lumayan.',
          expression: 'netral',
          cue: 'Gilang menunjuk ke sisi ruangan dengan dagunya seolah membayangkan meja itu.',
        },
        text: 'Satu hal kecil apa yang bisa bikin kerjamu minggu ini lebih tenang?',
      },
      {
        id: 'd', skillId: 'meremehkan', next: 'gi-b13',
        text: 'Nanti juga biasa lagi setelah tugasnya selesai.',
        reaction: {
          text: 'Mungkin. Liat aja nanti.',
          expression: 'menutup-diri',
          cue: 'Gilang mengangguk kaku dan menatap ke luar jendela.',
        },
      },
    ],
  },
];

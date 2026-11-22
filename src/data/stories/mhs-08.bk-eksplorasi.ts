/**
 * Cerita Hendra Wijaya (mhs-08), adegan Ruang BK bagian eksplorasi: simpul he-b0, he-b2, he-b4, he-b5.
 * Tujuan di luar berkas ini: he-b6 (bk-pemahaman) dan he-tegang-bk (bk-rencana).
 * Dirakit di mhs-08.ts. Seluruh teks Bahasa Indonesia, tanpa Istilah_Diagnosis.
 */
import type { StoryLine, StoryNode } from '../../engine/story/storyTypes';

const SCENE = 'bk';
const TEGANG = 'he-tegang-bk';

function line(text: string, expression: StoryLine['expression'], cue: string, aside?: string): StoryLine {
  return { text, expression, cue, ...(aside ? { aside } : {}) };
}

export const HENDRA_BK_EKSPLORASI_NODES: StoryNode[] = [
  {
    id: 'he-b0',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: line(
      'Silakan duduk di kursi yang itu, lebih empuk. Mau kuambilin air? Di pojok ada dispenser, tinggal kutekan.',
      'tersenyum',
      'Hendra menarik kursi untuk Dosen lebih dulu, baru duduk sendiri di tepinya, sementara ponsel di sakunya bergetar pelan.',
    ),
    choices: [
      {
        id: 'a', skillId: 'batas-kerahasiaan', best: true, next: 'he-b2',
        reaction: {
          text: 'Siap, Dosen, paham. Kecuali soal keselamatan ya. Aman kok.',
          expression: 'netral',
          cue: 'Hendra mengangguk sambil menggenggam gelas air di tangannya.',
        },
        text: 'Makasih tawarannya. Yang kamu ceritakan di sini rahasia, kecuali soal keselamatanmu.',
      },
      {
        id: 'b', skillId: 'sapaan-hangat', next: 'he-b2',
        reaction: {
          text: 'Eh, serius nih, Dosen? Wah, jarang-jarang ada yang bilang gitu. Ya udah, aku duduk manis aja.',
          expression: 'terkejut',
          cue: 'Hendra mengerjap dan tertawa canggung sambil menaruh gelas air kembali ke meja.',
        },
        text: 'Aku baik-baik aja, Hendra. Hari ini gantian kamu yang dilayani, ya.',
      },
      {
        id: 'c', skillId: 'pertanyaan-terbuka', next: 'he-b2',
        reaction: {
          text: 'Hmm, bingung mulai dari mana, Dosen. Mungkin soal minggu ini, yang ramai banget.',
          expression: 'netral',
          cue: 'Hendra memutar-mutar ponselnya di atas meja, lalu menaruhnya telungkup.',
        },
        text: 'Apa yang ingin kamu bicarakan hari ini?',
      },
      {
        id: 'd', skillId: 'interogasi', next: TEGANG,
        text: 'Kenapa kamu nggak bisa diam sebentar? Jawab terus terang.',
      },
    ],
  },
  {
    id: 'he-b2',
    sceneId: SCENE,
    stage: 'eksplorasi',
    depth: 0,
    reply: line(
      'Minggu ini aku bantuin sebelas orang. Cetak ulang braket, las rangka kecil, rapiin file STL. Seru sih, tapi tugas casing alat ukurku sendiri belum jalan juga.',
      'netral',
      'Hendra menghitung dengan jari sampai sebelas, lalu tertawa kecil dan berhenti di telunjuk yang ia luruskan.',
    ),
    choices: [
      {
        id: 'a', skillId: 'pertanyaan-terbuka', best: true, next: 'he-b4',
        reaction: {
          text: 'Yang terlintas... "ya ampun, kapan mulainya". Tapi biasanya langsung kepotong notifikasi, Dosen.',
          expression: 'netral',
          cue: 'Hendra melirik ponselnya dengan cepat, lalu memaksa pandangannya kembali ke Dosen.',
        },
        text: 'Saat tugas casing-mu belum jalan, apa yang terlintas di kepalamu?',
      },
      {
        id: 'b', skillId: 'validasi-normalisasi', next: 'he-b4',
        reaction: {
          text: 'Iya, Dosen, bener. Seneng dicari, tapi jam buat tugasku sendiri makin menipis.',
          expression: 'tersenyum',
          cue: 'Hendra tersenyum miring sambil menggaruk telinga.',
        },
        text: 'Dicari banyak orang itu membanggakan, tapi bisa bikin waktu sendiri terkikis.',
      },
      {
        id: 'c', skillId: 'pertanyaan-tertutup', next: 'he-b4',
        text: 'Jadi intinya kamu cuma kurang waktu, ya?',
        reaction: line(
          'Betul, kurang waktu aja. Gampang diatur kok.',
          'netral',
          'Hendra mengangguk cepat dan tersenyum seolah soal itu sudah selesai.',
        ),
      },
      {
        id: 'd', skillId: 'nasihat-dini', next: TEGANG,
        text: 'Tolak aja mulai besok. Beres semuanya, nggak perlu dipikir panjang.',
      },
    ],
  },
  {
    id: 'he-b4',
    sceneId: SCENE,
    stage: 'eksplorasi',
    depth: 1,
    reply: line(
      'Ini buku catatanku. Halaman titipan penuh, halaman tugasku... ya gini deh. Eh, ada chat masuk lagi.',
      'tertegun',
      'Hendra membuka buku bergaris, lalu ponselnya berdering; jarinya sudah mengetik "siap" sebelum ia sempat membaca isi pesan.',
      'Di buku itu, satu halaman penuh coretan nama teman, sedangkan halaman berjudul "Tugasku" hanya berisi dua baris.',
    ),
    marks: ['kejutan', 'isyarat-nonverbal'],
    choices: [
      {
        id: 'a', skillId: 'jeda-hening', best: true, next: 'he-b5',
        reaction: {
          text: 'Makasih, Dosen. Bentar ya... oh, cuma notifikasi grup. Nanti aja kubaca.',
          expression: 'netral',
          cue: 'Hendra menatap layar ponsel sebentar, lalu menutup bukunya dan menaruh ponsel di samping.',
        },
        text: 'Aku di sini kok. Boleh lihat dulu pesannya, nanti kita lanjut pelan-pelan.',
      },
      {
        id: 'b', skillId: 'sampaikan-pengamatan', next: 'he-b5',
        reaction: {
          text: 'Hah, iya ya? Spontan banget, Dosen. Jempolku emang duluan daripada mataku.',
          expression: 'terkejut',
          cue: 'Hendra menatap jempolnya sendiri sambil tertawa pendek yang tidak sampai ke mata.',
        },
        options: { observationTone: 'faktual' },
        text: 'Kamu mengetik "siap" sebelum membaca pesannya sampai habis.',
      },
      {
        id: 'c', skillId: 'janji-mutlak', next: 'he-b5',
        text: 'Biar aku yang atur. Dijamin nggak bakal ada lagi yang minta tolong ke kamu.',
        reaction: line(
          'Eh, jangan gitu juga dong. Nanti aku dikira susah dihubungi.',
          'waspada',
          'Hendra buru-buru menutup buku catatannya dan menyelipkannya di bawah lengan.',
        ),
      },
      {
        id: 'd', skillId: 'interogasi', next: TEGANG,
        text: 'Kenapa semua kamu iyain? Siapa aja yang nyuruh kamu?',
      },
    ],
  },
  {
    id: 'he-b5',
    sceneId: SCENE,
    stage: 'eksplorasi',
    depth: 1,
    reply: line(
      'Kalau kutolak, mereka pasti ngira aku pelit. Rendy dulu juga bantuin pas printerku macet, masa sekarang kubalas dengan bilang nggak.',
      'cemas',
      'Hendra menggenggam ponselnya erat dengan kedua tangan, lalu menaruhnya di pangkuan seolah itu benda rapuh.',
    ),
    choices: [
      {
        id: 'a', skillId: 'refleksi-perasaan', best: true, next: 'he-b6',
        reaction: {
          text: 'Iya, Dosen, kurang lebih. Kewalahan sih, tapi utang budinya kerasa nyata.',
          expression: 'menunduk',
          cue: 'Hendra mengangguk pelan sambil memilin tepi bukunya.',
        },
        options: { reflectionNuance: 'lelah-kewalahan' },
        text: 'Kedengarannya kamu kewalahan, tapi merasa berutang budi jadi susah bilang tidak.',
      },
      {
        id: 'b', skillId: 'pertanyaan-terbuka', next: 'he-b6',
        reaction: {
          text: 'Bayanginnya... "yah, Hendra sekarang pelit". Kayaknya begitu, Dosen.',
          expression: 'cemas',
          cue: 'Hendra meringis kecil dan menggeser duduknya sedikit ke belakang.',
        },
        text: 'Kalau kamu nolak, apa yang kamu bayangkan bakal mereka katakan?',
      },
      {
        id: 'c', skillId: 'refleksi-perasaan', next: 'he-b6',
        options: { reflectionNuance: 'kecewa-kesal', reflectionCorrectOverride: false },
        text: 'Kamu pasti kesal sama teman-teman yang selalu memanfaatkanmu.',
        reaction: line(
          'Kesal? Bukan. Mereka baik kok. Akunya yang nggak enakan sendiri.',
          'menunduk',
          'Hendra menggeleng cepat dan tersenyum tipis, seolah meluruskan kesalahpahaman.',
        ),
      },
      {
        id: 'd', skillId: 'meremehkan', next: 'he-b6',
        text: 'Cuma bantu-bantu dikit. Semua mahasiswa juga gitu, kok.',
        reaction: line(
          'Iya sih, mungkin cuma aku yang melebih-lebihkan.',
          'menutup-diri',
          'Hendra tertawa kecil, tetapi senyumnya tidak mengubah garis bahunya yang menegang.',
        ),
      },
    ],
  },
];

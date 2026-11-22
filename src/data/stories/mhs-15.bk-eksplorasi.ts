/**
 * Cerita Naufal Hakim (mhs-15), adegan Ruang BK bagian eksplorasi: simpul na-b0, na-b2, na-b4, na-b5.
 * Tujuan di luar berkas ini: na-b6 (bk-pemahaman) dan na-tegang-bk (bk-rencana).
 * Dirakit di mhs-15.ts. Seluruh teks Bahasa Indonesia, tanpa Istilah_Diagnosis.
 */
import type { StoryLine, StoryNode } from '../../engine/story/storyTypes';

const SCENE = 'bk';
const TEGANG = 'na-tegang-bk';

function line(text: string, expression: StoryLine['expression'], cue: string, aside?: string): StoryLine {
  return { text, expression, cue, ...(aside ? { aside } : {}) };
}

export const MHS15_BK_EKSPLORASI_NODES: StoryNode[] = [
  {
    id: 'na-b0',
    sceneId: SCENE,
    stage: 'hubungan',
    depth: 0,
    reply: line(
      'Sepi juga di sini. Silakan mulai, Dosen. Aku mau lihat seberapa lama Dosen tahan nggak nyela.',
      'netral',
      'Naufal duduk di kursi paling dekat pintu, laptop dipeluk di pangkuan, dan matanya mengamati wajah Dosen.',
    ),
    choices: [
      {
        id: 'a', skillId: 'batas-kerahasiaan', best: true, next: 'na-b2',
        text: 'Ceritamu tetap di antara kita, kecuali ada hal yang membahayakan keselamatanmu.',
        reaction: {
          text: 'Hm, oke. Kita lihat nanti. Mulai dari yang aman aja: kelompokku empat orang, bikin purwarupa penutup sensor suhu. Tiap rapat aku bawa usul, tapi biasanya baru setengah kalimat udah disahut.',
          expression: 'netral',
          cue: 'Naufal menghitung giliran bicara di udara dengan telunjuk, lalu berhenti di angka dua dan menurunkan tangan.',
        },
      },
      {
        id: 'b', skillId: 'sapaan-hangat', next: 'na-b2',
        text: 'Makasih udah mau ikut, Naufal. Aku dengerin sampai kamu selesai.',
        reaction: {
          text: 'Sampai selesai, ya. Oke, kita lihat. Kelompokku empat orang, lagi bikin purwarupa penutup sensor suhu. Usulku tiap rapat biasanya baru setengah kalimat udah ditimpa yang lain.',
          expression: 'netral',
          cue: 'Naufal menghitung giliran bicara dengan telunjuknya di udara, lalu berhenti di angka dua dan menurunkan tangan.',
        },
      },
      {
        id: 'c', skillId: 'pertanyaan-terbuka', next: 'na-b2',
        text: 'Apa yang ingin kamu bawa pulang dari obrolan ini?',
        reaction: {
          text: 'Bawa pulang? Hm, jawaban yang nggak basa-basi, mungkin. Soal kelompokku aja dulu: empat orang, bikin purwarupa penutup sensor suhu. Tiap rapat usulku udah siap, tapi sering disahut sebelum selesai.',
          expression: 'netral',
          cue: 'Naufal mengetuk-ngetuk sampul laptopnya, lalu menghitung giliran bicara di udara dengan telunjuk dan berhenti di angka dua.',
        },
      },
      {
        id: 'd', skillId: 'interogasi', next: TEGANG,
        text: 'Kenapa kamu daritadi curiga begitu? Jawab terus terang.',
      },
    ],
  },
  {
    id: 'na-b2',
    sceneId: SCENE,
    stage: 'eksplorasi',
    depth: 0,
    reply: line(
      'Kelompokku empat orang, bikin purwarupa penutup sensor suhu. Tiap rapat aku udah nyiapin usul, tapi biasanya baru setengah kalimat udah disahut yang lain.',
      'netral',
      'Naufal menghitung giliran bicara di udara dengan telunjuk, lalu berhenti di angka dua dan menurunkan tangan.',
    ),
    choices: [
      {
        id: 'a', skillId: 'pertanyaan-terbuka', best: true, next: 'na-b4',
        text: 'Kalau usulmu disahut di tengah kalimat, biasanya kamu ngapain?',
        reaction: {
          text: 'Ya diem. Nunggu sampai nggak ada yang nyambung. Nih contohnya. Sketsa engsel dari kaleng bekas ini kuajukan tiga minggu lalu, terus rapat berikutnya bentuk persis gini muncul di slide Dito, tanpa namaku.',
          expression: 'tertegun',
          cue: 'Naufal membuka laptop untuk pertama kalinya, memutar layarnya ke arah Dosen, lalu cepat-cepat menutupnya lagi.',
          aside: 'Sekilas di layar terlihat folder berisi puluhan sketsa bertanggal, yang hampir semuanya tidak pernah dikirim ke grup.',
        },
      },
      {
        id: 'b', skillId: 'validasi-normalisasi', next: 'na-b4',
        text: 'Udah siapin usul terus disela, wajar banget kalau kesal dan semangatnya turun.',
        reaction: {
          text: 'Ya lumayan sih. Nih, Dosen lihat sendiri. Sketsa engsel dari kaleng bekas ini kuajukan tiga minggu lalu. Rapat berikutnya bentuk persis ini muncul di slide Dito, tanpa namaku.',
          expression: 'tertegun',
          cue: 'Naufal membuka laptopnya, memutar layar ke arah Dosen beberapa detik, lalu menutupnya lagi dengan cepat.',
          aside: 'Di layar sempat tampak folder penuh sketsa bertanggal, dan hampir tak ada yang pernah dikirim ke grup.',
        },
      },
      {
        id: 'c', skillId: 'pertanyaan-tertutup', next: 'na-b4',
        text: 'Jadi masalahnya cuma teman-temanmu yang suka memotong, ya?',
        reaction: line(
          'Kurang lebih. Tapi bukan cuma itu juga sih.',
          'netral',
          'Naufal mengangkat satu alis dan menggeser laptop ke paha kiri.',
        ),
      },
      {
        id: 'd', skillId: 'nasihat-dini', next: TEGANG,
        text: 'Bicara saja lebih keras dan lebih cepat di rapat. Pasti didengar.',
      },
    ],
  },
  {
    id: 'na-b4',
    sceneId: SCENE,
    stage: 'eksplorasi',
    depth: 1,
    reply: line(
      'Lihat. Ini sketsa engsel dari kaleng bekas yang kuajukan tiga minggu lalu. Rapat berikutnya, bentuk yang persis gini muncul di slide Dito, tanpa namaku.',
      'tertegun',
      'Naufal membuka laptop untuk pertama kalinya, memutar layarnya ke arah Dosen, lalu cepat-cepat menutupnya lagi.',
      'Di layar sempat terlihat folder berisi puluhan sketsa bertanggal, hampir tak ada yang pernah dikirim ke grup.',
    ),
    marks: ['kejutan', 'isyarat-nonverbal'],
    choices: [
      {
        id: 'a', skillId: 'jeda-hening', next: 'na-b5',
        text: 'Aku di sini. Ceritain sketsa itu dengan caramu, nggak usah buru-buru.',
        reaction: {
          text: 'Nggak banyak yang perlu diceritain sih. Sketsanya ada, namanya nggak. Ya udah. Mungkin ideku nggak sebagus itu. Atau akunya yang kurang pinter ngeyakinin orang.',
          expression: 'menunduk',
          cue: 'Naufal tertawa kecil yang kering, lalu menyelipkan ibu jarinya ke bawah tali tas laptop.',
        },
      },
      {
        id: 'b', skillId: 'sampaikan-pengamatan', best: true, next: 'na-b5',
        options: { observationTone: 'faktual' },
        text: 'Sketsamu bertanggal lebih dulu, dan folder itu penuh tapi jarang dikirim.',
        reaction: {
          text: 'Iya, tanggalnya jelas lebih awal. Tapi tanggal doang nggak cukup, kan? Yang penting siapa yang ngomong duluan. Mungkin ideku nggak sebagus itu, atau aku yang kurang jago meyakinkan orang.',
          expression: 'menunduk',
          cue: 'Naufal mengangkat bahu sambil tertawa kecil yang kering, lalu menyelipkan ibu jarinya ke bawah tali tas laptop.',
        },
      },
      {
        id: 'c', skillId: 'janji-mutlak', next: 'na-b5',
        text: 'Biar kuurus. Aku jamin namamu dicantumkan di slide berikutnya.',
        reaction: line(
          'Jangan. Nanti malah ribut, terus aku yang keliatan cengeng.',
          'waspada',
          'Naufal memeluk laptop lagi dan menggeleng cepat.',
        ),
      },
      {
        id: 'd', skillId: 'interogasi', next: TEGANG,
        text: 'Kenapa kamu tidak protes waktu itu? Dito pasti curi idemu, kan?',
      },
    ],
  },
  {
    id: 'na-b5',
    sceneId: SCENE,
    stage: 'eksplorasi',
    depth: 1,
    reply: line(
      'Ya udah. Mungkin ideku emang nggak sebagus itu sampai perlu dicatat. Atau aku aja yang kurang jago meyakinkan orang.',
      'menunduk',
      'Naufal tertawa kecil yang kering, lalu menyelipkan ibu jarinya ke bawah tali tas laptop.',
    ),
    choices: [
      {
        id: 'a', skillId: 'refleksi-perasaan', best: true, next: 'na-b6',
        options: { reflectionNuance: 'kecewa-kesal' },
        text: 'Kedengarannya kamu kecewa dan kesal, tapi malah menyalahkan diri sendiri.',
        reaction: {
          text: 'Hm... kayaknya iya. Kesalnya ada, tapi ujung-ujungnya nyalahin diri sendiri, lebih gampang. Soalnya kalau protes, nanti dikira cari perhatian. Jadi kusimpan aja.',
          expression: 'menunduk',
          cue: 'Naufal merapikan sudut stiker di sampul laptop, lalu menekannya dengan kuku sampai tepinya rata.',
        },
      },
      {
        id: 'b', skillId: 'pertanyaan-terbuka', next: 'na-b6',
        text: 'Kalau idemu tercatat dengan namamu, apa yang berubah buatmu?',
        reaction: {
          text: 'Yang berubah? Mungkin aku nggak perlu mikir dua kali sebelum ngomong. Sekarang tiap mau protes, takutnya dikira cari perhatian. Jadi ya kusimpan aja.',
          expression: 'menunduk',
          cue: 'Naufal mengusap-usap stiker di sampul laptop dengan kuku, lalu menekan tepinya sampai rata.',
        },
      },
      {
        id: 'c', skillId: 'refleksi-perasaan', next: 'na-b6',
        options: { reflectionNuance: 'lelah-kewalahan', reflectionCorrectOverride: false },
        text: 'Kamu pasti capek banget sama semua tugas kelompok ini.',
        reaction: line(
          'Capek sih nggak. Lebih ke... nggak dihitung.',
          'menunduk',
          'Naufal menggeleng pelan dan menatap sampul laptopnya.',
        ),
      },
      {
        id: 'd', skillId: 'meremehkan', next: 'na-b6',
        text: 'Semua orang pernah diabaikan di kelompok. Nggak usah dibesar-besarkan.',
        reaction: line(
          'Nah, bener kan. Sama aja kayak rapat.',
          'menutup-diri',
          'Naufal menutup rapat laptopnya dan melipat lengan di atasnya.',
        ),
      },
    ],
  },
];

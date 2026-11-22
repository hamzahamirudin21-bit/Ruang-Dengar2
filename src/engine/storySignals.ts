import type { MissionRecord } from './story/saveSlot';
import type { StudentAgent } from '../types';

/**
 * Sinyal perilaku teramati (bebas diagnosis & bebas variabel tersembunyi),
 * entri Jurnal 15 Kisah Kampus, dan ringkasan Kartu Hasil Shift untuk dibagikan.
 * Modul murni tanpa React/DOM.
 */

export const SHIFT_TARGET_STORIES = 3;

export interface StudentStorySignal {
  /** Petunjuk perilaku kecil yang memancing rasa penasaran di peta & daftar misi. */
  clue: string;
  /** Judul kisah yang terbuka setelah mahasiswa terbantu. */
  unlockedTitle: string;
  /** Ringkasan singkat cerita untuk koleksi Jurnal Kisah Lab. */
  unlockedExcerpt: string;
}

export const STUDENT_STORY_SIGNALS: Readonly<Record<string, StudentStorySignal>> = {
  'mhs-01': {
    clue: 'Memeriksa papan daftar tugas tim berkali-kali sambil mengetuk-ngetuk meja tanpa jeda...',
    unlockedTitle: 'Pundak Koordinator IoT',
    unlockedExcerpt:
      'Raka memikul jadwal tim sendirian karena takut proyek gagal. Setelah didengarkan tanpa dihakimi, ia mulai berani membagi tugas dengan lebih ringan.',
  },
  'mhs-02': {
    clue: 'Sering melirik layar ponsel lalu menghela napas panjang saat menyolder komponen sendiri...',
    unlockedTitle: 'Di Balik Layar Ponsel',
    unlockedExcerpt:
      'Dimas memendam tekanan biaya kos sambil mengejar target praktikum. Ruang aman membuatnya lega bercerita dan menyusun ritme kerja yang lebih sehat.',
  },
  'mhs-03': {
    clue: 'Duduk memandangi berkas pendaftaran asisten riset dan draf tugas akhir yang terbuka bersamaan...',
    unlockedTitle: 'Dua Persimpangan Tania',
    unlockedExcerpt:
      'Tania yang selalu sabar membimbing adik tingkat ternyata bimbang menentukan arah selepas kuliah. Percakapan jernih membantunya memetakan prioritas sendiri.',
  },
  'mhs-04': {
    clue: 'Mengetik kode dengan rahang mengeras dan langsung diam tiap rekan satu timnya melintas...',
    unlockedTitle: 'Standar Tinggi di Balik Kode',
    unlockedExcerpt:
      'Sikap keras Kevin lahir dari kekhawatiran hasilnya mengecewakan tim. Ketika perasaannya diakui, ia menemukan cara menyampaikan masukan tanpa memicu jarak.',
  },
  'mhs-05': {
    clue: 'Menggambar sketsa antarmuka di sudut kertas sambil sesekali menatap papan pengumuman karier...',
    unlockedTitle: 'Sketsa yang Ingin Tumbuh',
    unlockedExcerpt:
      'Ayu menyimpan ketertarikan besar pada desain sistem interaktif namun ragu melangkah keluar dari jalur biasa. Ia kini punya satu langkah awal yang konkret.',
  },
  'mhs-06': {
    clue: 'Membuka-tutup halaman modul praktikum yang sama berulang kali tanpa bertanya ke siapa pun...',
    unlockedTitle: 'Halaman yang Tertunda',
    unlockedExcerpt:
      'Mita canggung meminta bantuan karena takut dianggap tertinggal. Setelah diterima dengan hangat, ia lebih berani menanyakan bagian yang belum dipahami.',
  },
  'mhs-07': {
    clue: 'Mengecek amplop tawaran kerja bengkel di tasnya setiap kali jeda praktikum pengelasan...',
    unlockedTitle: 'Pilihan Sebelum Wisuda',
    unlockedExcerpt:
      'Bima menimbang tawaran kerja bengkel fabrikasi sambil menuntaskan studi. Refleksi tenang membantunya menimbang risiko dan rencana jangka panjang.',
  },
  'mhs-08': {
    clue: 'Baru kembali ke meja Cetak 3D setelah dimintai tolong dua teman berbeda, bahunya tampak turun...',
    unlockedTitle: 'Sulit Berkata Nanti',
    unlockedExcerpt:
      'Hendra sering mendahulukan bantuan darurat teman hingga tugasnya sendiri menumpuk. Ia belajar menetapkan batas secara ramah tanpa merasa bersalah.',
  },
  'mhs-09': {
    clue: 'Menyandarkan bahu menjauh dari Meja Diskusi sejak salah satu purwarupanya dikomentari...',
    unlockedTitle: 'Uji Nyali & Harga Diri',
    unlockedExcerpt:
      'Gilang mudah merasa diremehkan saat koreksi datang di depan kelompok. Ketika didengarkan tanpa disudutkan, ia mampu memisahkan kritik teknis dari nilai dirinya.',
  },
  'mhs-10': {
    clue: 'Menata alat ukur dengan sangat rapi di sudut gudang, nyaris tak pernah keluar ke koridor...',
    unlockedTitle: 'Fokus Tenang di Sudut Alat',
    unlockedExcerpt:
      'Teguh memang nyaman bekerja mandiri demi uji kompetensi instrumentasi, namun tetap menghargai ruang diskusi singkat saat butuh sudut pandang baru.',
  },
  'mhs-11': {
    clue: 'Membaca pola data sensor sendirian di pojok meja dengan buku catatan penuh coretan ide...',
    unlockedTitle: 'Catatan Pola Maya',
    unlockedExcerpt:
      'Maya produktif di ruang tenang, tetapi diam-diam ingin sesekali bertukar gagasan dengan mentor. Ia menemukan ritme kolaborasi yang tetap menghargai ruang pribadinya.',
  },
  'mhs-12': {
    clue: 'Tampak akrab dengan semua orang di Meja Diskusi, tapi bahunya makin lesu tiap habis menengahi teman...',
    unlockedTitle: 'Lelah Menjadi Penengah',
    unlockedExcerpt:
      'Di balik sosoknya yang populer, Sari kelelahan terus menengahi perbedaan pendapat kelompok. Ia akhirnya memberi ruang bagi dirinya sendiri untuk beristirahat.',
  },
  'mhs-13': {
    clue: 'Baru saja mendengarkan curhatan dua temannya bergantian, kini duduk terdiam menatap gelas airnya...',
    unlockedTitle: 'Telinga yang Juga Butuh Didengar',
    unlockedExcerpt:
      'Nisa selalu peka menampung keluhan teman hingga ikut memikul beban emosional mereka. Kali ini ia merasakan hangatnya giliran didengarkan.',
  },
  'mhs-14': {
    clue: 'Cepat-cepat menutup buku catatannya setiap kali ada teman lewat di dekat mejanya...',
    unlockedTitle: 'Skema di Halaman Belakang',
    unlockedExcerpt:
      'Rani menggambar ulang rangkaian praktikum dengan teliti di belakang buku karena takut dianggap bodoh saat bertanya. Rasa aman membuatnya berani melangkah keluar dari keheningan.',
  },
  'mhs-15': {
    clue: 'Sudah lama terdiam di sudut Cetak 3D padahal purwarupa dari komponen daur ulangnya terlihat unik...',
    unlockedTitle: 'Gagasan yang Sempat Terlewat',
    unlockedExcerpt:
      'Naufal kecewa karena idenya beberapa kali terlewat di rapat kelompok. Setelah gagasannya dihargai, semangatnya untuk kembali berdiskusi tumbuh lagi.',
  },
};

const FALLBACK_SIGNAL: StudentStorySignal = {
  clue: 'Tampak lebih banyak terdiam di sudut meja lab dibanding biasanya...',
  unlockedTitle: 'Kisah dari Ruang Lab',
  unlockedExcerpt: 'Percakapan yang tenang dan aman membantu mahasiswa ini merasa lebih lega.',
};

export function signalForStudent(studentId: string): StudentStorySignal {
  return STUDENT_STORY_SIGNALS[studentId] ?? FALLBACK_SIGNAL;
}

export interface ListeningArchetype {
  title: string;
  tagline: string;
}

export interface ShiftReportSummary {
  unlockedCount: number;
  totalStudents: number;
  shiftTarget: number;
  shiftCompleted: boolean;
  followUpCount: number;
  averageEnergyPct: number;
  healthyCount: number;
  archetype: ListeningArchetype;
  unlockedAgentIds: readonly string[];
  shareText: string;
}

export function computeShiftReport(
  agents: readonly StudentAgent[],
  missions: Readonly<Record<string, MissionRecord>>,
): ShiftReportSummary {
  const totalStudents = agents.length;
  const unlockedAgentIds = agents
    .filter((a) => missions[a.id]?.status === 'selesai')
    .map((a) => a.id);
  const unlockedCount = unlockedAgentIds.length;
  const followUpCount = agents.filter((a) => missions[a.id]?.status === 'lanjutan').length;
  const healthyCount = agents.filter((a) => a.energy >= 0.6).length;
  const energySum = agents.reduce((acc, a) => acc + Math.min(1, Math.max(0, a.energy)), 0);
  const averageEnergyPct = totalStudents > 0 ? Math.round((energySum / totalStudents) * 100) : 0;

  let archetype: ListeningArchetype;
  if (unlockedCount >= 10) {
    archetype = {
      title: 'Penjaga Cahaya Kampus',
      tagline: 'Hampir seluruh kisah tersembunyi di lab berhasil kamu dengarkan dengan penuh kesabaran.',
    };
  } else if (averageEnergyPct >= 75 && unlockedCount >= SHIFT_TARGET_STORIES) {
    archetype = {
      title: 'Penjaga Ruang Aman',
      tagline: 'Kamu jeli membaca sinyal keheningan dan menjaga energi seluruh laboratorium tetap hangat.',
    };
  } else if (followUpCount === 0 && unlockedCount >= SHIFT_TARGET_STORIES) {
    archetype = {
      title: 'Pendengar Hangat',
      tagline: 'Pendekatanmu yang sabar tanpa menghakimi membuat mahasiswa cepat merasa diterima.',
    };
  } else {
    archetype = {
      title: 'Detektif Empati',
      tagline: 'Kamu berani menghampiri mahasiswa yang terisolasi dan terus belajar membaca isyarat kecil mereka.',
    };
  }

  const shareText = `🎧 RUANG DENGAR — Aku baru menyelesaikan Shift Dosen BK dengan gaya "${archetype.title}"! ${unlockedCount}/${totalStudents} kisah mahasiswa terungkap & energi lab terjaga di ${averageEnergyPct}%. Berani coba jaga lab versimu?`;

  return {
    unlockedCount,
    totalStudents,
    shiftTarget: SHIFT_TARGET_STORIES,
    shiftCompleted: unlockedCount >= SHIFT_TARGET_STORIES,
    followUpCount,
    averageEnergyPct,
    healthyCount,
    archetype,
    unlockedAgentIds,
    shareText,
  };
}

/**
 * Profil latar belakang, tipe kepribadian, dan kesukaan 15 mahasiswa.
 * Ditampilkan di sisi belakang kartu Daftar Mahasiswa (Flip Card) serta Kartu Profil
 * agar pemain dapat memahami karakter tiap mahasiswa sebelum memilih respons percakapan.
 */
export interface StudentBackgroundInfo {
  studentId: string;
  originAndCohort: string;
  /** Tipe karakter singkat (kunci memahami respons mahasiswa). */
  typeTag: string;
  /** Warna aksen lencana tipe di balik kartu. */
  typeTone: 'teal' | 'amber' | 'rose' | 'indigo' | 'emerald';
  /** Hal yang disukai / kebiasaan khas mahasiswa. */
  likes: string;
  /** Ringkasan latar belakang hidup & dinamika di lab (non-klinis). */
  background: string;
  /** Petunjuk halus gaya komunikasi yang membuatnya nyaman. */
  communicationStyle: string;
}

export const STUDENT_BACKGROUNDS: Readonly<Record<string, StudentBackgroundInfo>> = {
  'mhs-01': {
    studentId: 'mhs-01',
    originAndCohort: 'Bandung · Angkatan 2024',
    typeTag: 'Koordinator Perfeksionis',
    typeTone: 'teal',
    likes: 'Merakit sensor daya rendah, menyusun jadwal rapi, & kopi pagi',
    background:
      'Anak sulung yang terbiasa jadi andalan keluarga. Di lab dipercaya memimpin proyek IoT sehingga sering memikul tugas tim sendirian karena takut demo gagal.',
    communicationStyle: 'Hargai tanggung jawabnya dulu; ia canggung bila langsung disuruh santai atau dianggap kaku.',
  },
  'mhs-02': {
    studentId: 'mhs-02',
    originAndCohort: 'Semarang · Angkatan 2025',
    typeTag: 'Pendiam & Penjaga Harga Diri',
    typeTone: 'indigo',
    likes: 'Menyolder komponen SMD mungil, mendengarkan musik pelan pakai headset',
    background:
      'Perantau hemat yang diam-diam membantu kirim uang ke rumah sambil kerja paruh waktu malam. Tidak ingin teman lab tahu ia sedang tertekan biaya kos.',
    communicationStyle: 'Jaga privasi dan hindari menyindir soal uang/malas; ia terbuka bila merasa dihormati.',
  },
  'mhs-03': {
    studentId: 'mhs-03',
    originAndCohort: 'Medan · Angkatan 2023',
    typeTag: 'Mentor Sabar · Bimbang Arah',
    typeTone: 'emerald',
    likes: 'Mengajari junior memakai osiloskop, catatan skema rapi, & teh melati',
    background:
      'Senior panutan yang selalu sabar menolong adik tingkat, tetapi diam-diam bingung memilih antara tawaran asisten riset atau lulus cepat sesuai harapan keluarga.',
    communicationStyle: 'Ajak menimbang pilihannya sendiri tanpa memaksakan satu keputusan cepat.',
  },
  'mhs-04': {
    studentId: 'mhs-04',
    originAndCohort: 'Jakarta · Angkatan 2024',
    typeTag: 'Analitis & Standar Tinggi',
    typeTone: 'amber',
    likes: 'Optimasi kode mikrokontroler real-time, lomba coding, & debat teknis',
    background:
      'Tumbuh di lingkungan kompetitif yang menilai segalanya dari hasil terbaik. Ia sangat bangga pada kualitas kodenya, tetapi ucapan tajamnya sering bikin tim tegang.',
    communicationStyle: 'Akui kepeduliannya pada mutu sebelum membahas dampak ucapannya ke teman setim.',
  },
  'mhs-05': {
    studentId: 'mhs-05',
    originAndCohort: 'Denpasar · Angkatan 2024',
    typeTag: 'Kreatif & Berjiwa Visual',
    typeTone: 'rose',
    likes: 'Merancang antarmuka telemetri, sketsa UI, & pameran desain interaktif',
    background:
      'Datang dari keluarga perajin seni yang berharap ia punya karier stabil. Ia mencintai desain antarmuka, namun ragu apakah minat kreatifnya dihargai di jalur vokasi.',
    communicationStyle: 'Dukung keunikan bakatnya tanpa mengotak-ngotakkan “teknik vs seni”.',
  },
  'mhs-06': {
    studentId: 'mhs-06',
    originAndCohort: 'Bogor · Angkatan 2025',
    typeTag: 'Pemalu & Takut Merepotkan',
    typeTone: 'indigo',
    likes: 'Membaca dokumentasi teknis tenang, merangkum modul, & belajar berdua',
    background:
      'Lulusan sekolah kecil yang merasa teman-temannya jauh lebih cepat paham coding. Ia memilih diam dan mencari sendiri saat tertinggal karena takut dianggap bodoh.',
    communicationStyle: 'Gunakan nada pelan dan hangat; hindari menanyainya dengan nada mendesak di depan umum.',
  },
  'mhs-07': {
    studentId: 'mhs-07',
    originAndCohort: 'Bekasi · Angkatan 2023',
    typeTag: 'Tegas, Disiplin, & Realistis',
    typeTone: 'amber',
    likes: 'Pengelasan presisi, prosedur keselamatan K3, & merakit rangka logam',
    background:
      'Tulang punggung harapan keluarga pekerja bengkel. Baru mendapat tawaran kerja bengkel fabrikasi bergaji tetap sehingga dilema antara kerja sekarang atau tunggu wisuda.',
    communicationStyle: 'Bicara jujur dan menghargai realitas ekonominya, bukan sekadar teori idealis.',
  },
  'mhs-08': {
    studentId: 'mhs-08',
    originAndCohort: 'Manado · Angkatan 2025',
    typeTag: 'Ramah & Sulit Berkata Tidak',
    typeTone: 'teal',
    likes: 'Merawat mesin printer 3D, bongkar-pasang nozzle, & membantu teman',
    background:
      'Dikenal paling ringan tangan di studio cetak 3D. Karena tak enak hati menolak permintaan mendadak teman-teman, tugas pribadinya sendiri sering terbengkalai.',
    communicationStyle: 'Bantu ia melihat bahwa menjaga batas diri bukan berarti egois.',
  },
  'mhs-09': {
    studentId: 'mhs-09',
    originAndCohort: 'Serang · Angkatan 2025',
    typeTag: 'Berani & Sensitif Harga Diri',
    typeTone: 'rose',
    likes: 'Uji prototipe mekanik ekstrem, kerja lapangan, & tantangan cepat',
    background:
      'Terbiasa membuktikan diri lewat aksi nyata di bengkel. Ia tidak anti masukan teknis, tetapi langsung tersinggung jika dikoreksi dengan nada meremehkan di depan orang banyak.',
    communicationStyle: 'Pisahkan penghargaan atas usahanya dari koreksi teknis, dan bicara empat mata.',
  },
  'mhs-10': {
    studentId: 'mhs-10',
    originAndCohort: 'Magelang · Angkatan 2023',
    typeTag: 'Mandiri & Fokus Sunyi',
    typeTone: 'emerald',
    likes: 'Mengkalibrasi alat ukur, menata gudang instrumen, & bekerja tanpa bising',
    background:
      'Nyaman bekerja sendiri secara sehat sambil menyiapkan sertifikasi teknisi instrumentasi. Tidak kesepian, hanya cepat lelah bila dipaksa terlalu sering berkumpul ramai.',
    communicationStyle: 'Hormati gaya mandirinya—jangan langsung melabelinya “terisolasi” atau “anti sosial”.',
  },
  'mhs-11': {
    studentId: 'mhs-11',
    originAndCohort: 'Jember · Angkatan 2025',
    typeTag: 'Reflektif & Teliti',
    typeTone: 'indigo',
    likes: 'Menganalisis grafik data sensor, menulis log uji, & diskusi tenang 1-on-1',
    background:
      'Tipe pemikir mendalam yang paling produktif di sudut hening. Ia menghargai diskusi berkualitas secara empat mata, tetapi tidak nyaman jika didorong tampil ramai-ramai.',
    communicationStyle: 'Beri ruang jeda untuk berpikir; hindari memaksanya jadi cerewet di keramaian.',
  },
  'mhs-12': {
    studentId: 'mhs-12',
    originAndCohort: 'Yogyakarta · Angkatan 2024',
    typeTag: 'Penengah Hangat (Bridge)',
    typeTone: 'emerald',
    likes: 'Menghubungkan tim hardware & software, mediasi diskusi, & proyek lintas tim',
    background:
      'Pribadi ceria yang sering jadi jembatan saat dua kelompok berbeda pendapat. Karena terus menjaga keharmonisan tim, ia lupa memperhatikan rasa lelahnya sendiri.',
    communicationStyle: 'Ingatkan bahwa ia juga berhak didengarkan, bukan selalu jadi penengah.',
  },
  'mhs-13': {
    studentId: 'mhs-13',
    originAndCohort: 'Garut · Angkatan 2025',
    typeTag: 'Peka & Mudah Menyerap Beban',
    typeTone: 'rose',
    likes: 'Menemani teman curhat, menyeduh minuman hangat, & merakit proyek sosial',
    background:
      'Teman curhat favorit di lab karena sangat empatik. Namun menampung terlalu banyak keluhan teman membuatnya diam-diam ikut kehabisan tenaga secara emosional.',
    communicationStyle: 'Tanyakan kabar dirinya sendiri dengan lembut, bukan kabar teman-temannya.',
  },
  'mhs-14': {
    studentId: 'mhs-14',
    originAndCohort: 'Bengkulu · Angkatan 2026',
    typeTag: 'Mahasiswa Baru · Ragu & Sensitif Stigma',
    typeTone: 'amber',
    likes: 'Mencatat skema praktikum rapi, menggambar diagram rangkaian, & belajar bertahap',
    background:
      'Mahasiswa baru perantau pertama di keluarganya yang masuk jurusan vokasi. Sangat takut masuk Ruang Konsultasi karena khawatir dicap “lemah” oleh kakak tingkat.',
    communicationStyle: 'Bangun rasa aman perlahan dan pastikan privasi; jangan menekan atau menghakimi.',
  },
  'mhs-15': {
    studentId: 'mhs-15',
    originAndCohort: 'Palu · Angkatan 2025',
    typeTag: 'Inovator Eksperimental · Merasa Terabaikan',
    typeTone: 'teal',
    likes: 'Mengolah komponen daur ulang jadi purwarupa cepat & eksperimen 3D',
    background:
      'Punya banyak ide unik dan hemat bahan dari kebiasaannya mengutak-atik alat bekas di kampung halaman. Mulai menarik diri karena usulannya kerap dilewati saat rapat tim.',
    communicationStyle: 'Tunjukkan rasa ingin tahu tulus pada idenya sebelum membahas kendala teknis.',
  },
};

const FALLBACK_BACKGROUND: StudentBackgroundInfo = {
  studentId: 'default',
  originAndCohort: 'Mahasiswa Vokasi',
  typeTag: 'Unik & Berpotensi',
  typeTone: 'teal',
  likes: 'Praktikum laboratorium dan berkarya bersama rekan',
  background: 'Memiliki cerita, kekuatan, dan tantangan belajar masing-masing di laboratorium.',
  communicationStyle: 'Dengarkan dengan sabar sebelum menyimpulkan.',
};

export function getStudentBackground(studentId: string): StudentBackgroundInfo {
  return STUDENT_BACKGROUNDS[studentId] ?? FALLBACK_BACKGROUND;
}

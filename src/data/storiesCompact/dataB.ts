import { line, type CompactStudentScript } from './builder';

/**
 * Skrip 7-giliran · 2 pilihan (Tepat vs Salah, makin menantang tiap langkah)
 * dengan respons unik sesuai latar belakang & tipe karakter mhs-09 s.d. mhs-15.
 */
export const COMPACT_SCRIPTS_B: readonly CompactStudentScript[] = [
  // 09 — Gilang Ramadhan (Serang · Berani & Sensitif Harga Diri · Uji prototipe mekanik ekstrem)
  {
    studentId: 'mhs-09',
    firstName: 'Gilang',
    title: 'Cerita Gilang Ramadhan',
    labSceneTitle: 'Area Meja Diskusi',
    labSceneCaption: 'Gilang menyandarkan bahu menjauh dari Meja Diskusi sejak purwarupa mekaniknya dikomentari tajam.',
    opening: line(
      'Halo Bu... aku cuma lagi menepi sebentar dari Meja Diskusi. Tadi suasana rapat agak panas.',
      'kesal',
      'Gilang melipat tangan di dada sambil menatap tajam ke arah jendela.',
    ),
    t1: [
      {
        id: 't1-tepat', skillId: 'sapaan-hangat', best: true,
        text: 'Halo juga Gilang, apa kabarmu? Boleh aku duduk di sebelahmu sebentar sambil kamu tarik napas?',
        reply: line(
          'Boleh Bu, silakan. Jujur masih agak panas di dada—capek-capek aku berani uji prototipe mekaniknya, eh langsung dipotong pedas di depan semua orang.',
          'kesal',
          'Gilang menurunkan tangannya sedikit dan menghela napas panjang.',
        ),
      },
      {
        id: 't1-salah', skillId: 'meremehkan', isMisstep: true,
        text: 'Apa sih lihat-lihat jendela sambil cemberut begitu? Kalau dikritik sedikit saja jangan langsung kabur dong!',
        reply: line(
          'Aku nggak kabur Bu! Aku menepi biar nggak ikut emosi di depan anak-anak. Ibu belum dengar kejadiannya tapi langsung menyalahkan aku!',
          'kesal',
          'Mata Gilang langsung memicing tajam dan bahunya menegang.',
        ),
      },
    ],
    t2: [
      {
        id: 't2-tepat', skillId: 'sampaikan-pengamatan', best: true,
        options: { observationTone: 'faktual' },
        text: 'Aku perhatikan kamu memilih menepi dulu daripada membalas keras di meja. Rasanya mengganjal banget ya saat usahamu disorot di depan banyak orang?',
        reply: line(
          'Iya Bu! Daripada makin ribut, mending aku minggir dulu. Cuma di sini masih dekat banget sama suara meja mereka, bikin susah adem.',
          'waspada',
          'Gilang melirik sekilas ke Meja Diskusi dengan rahang sedikit tegang.',
        ),
      },
      {
        id: 't2-salah', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Namanya kerja tim ya wajar dikritik keras di depan umum, Gilang. Kamu harus latihan lebih tebal telinga.',
        reply: line(
          'Bukan soal nggak kuat dikritik, Bu... tapi cara ngomong yang merendahkan di depan umum itu beda cerita.',
          'kesal',
          'Gilang mengerutkan dahi dan memalingkan wajahnya.',
        ),
      },
    ],
    t3: [
      {
        id: 't3-tepat', skillId: 'batas-kerahasiaan', best: true,
        text: 'Yuk kita pindah ke Ruang Konsultasi biar lebih adem dan ngobrol empat mata tanpa jadi tontonan teman lain.',
        reply: line(
          'Oke Bu, di sini jauh lebih enak. Aku nggak anti koreksi teknis kok, Bu—dari dulu di bengkel aku biasa uji alat berat. Aku cuma nggak terima kalau caranya seolah menganggapku kerja asal-asalan di depan tim.',
          'netral',
          'Gilang duduk di Ruang Konsultasi dan suaranya mulai terdengar lebih tenang.',
        ),
      },
      {
        id: 't3-salah', skillId: 'pertanyaan-tertutup', isMisstep: true,
        text: 'Nanti kita panggil orang yang mengkritikmu itu ke sini sekarang biar langsung adu argumen di depanku.',
        reply: line(
          'Duh jangan dipanggil ramai-ramai Bu, aku malah tambah malu dan panas! Kita ngobrol berdua saja di ruang konsultasi dulu deh.',
          'waspada',
          'Gilang menggeleng cepat saat berjalan menuju Ruang Konsultasi.',
        ),
      },
    ],
    t4: [
      {
        id: 't4-tepat', skillId: 'afirmasi-kekuatan', best: true,
        text: 'Keberanianmu turun tangan menguji prototipe mekanik berisiko tinggi itu luar biasa, Gilang. Wajar sekali kamu merasa harga dirimu jatuh kalau keberanian itu malah dianggap ceroboh.',
        reply: line(
          'Persis banget, Bu! Baru ada yang lihat niatku dari sisi itu. Aku maju duluan uji rangka biar tim cepat tahu titik lemahnya, eh malah dibilang ceroboh.',
          'tertegun',
          'Bahu Gilang akhirnya benar-benar turun dan tatapannya melunak.',
        ),
      },
      {
        id: 't4-salah', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Sebenarnya kalau kamu lebih sabar menunggu persetujuan tim dulu sebelum uji alat, kamu tidak akan dikritik begitu kan?',
        reply: line(
          'Berarti Ibu juga menganggap aku yang salah dan ceroboh ya? Ya sudahlah, percuma aku jelaskan panjang-panjang.',
          'menutup-diri',
          'Gilang kembali melipat tangannya dengan raut kecewa.',
        ),
      },
    ],
    t5: [
      {
        id: 't5-tepat', skillId: 'refleksi-perasaan', best: true,
        options: { reflectionNuance: 'kecewa-kesal' },
        text: 'Kalau kita pisahkan pelan-pelan: cara penyampaian di depan umum itu yang bikin sakit hati—sementara dari sisi teknis sambungan mekaniknya, menurutmu sendiri mana yang masih bisa diperkuat?',
        reply: line(
          'Jujur ya Bu... kalau soal teknisnya, sambungan baut di sisi kiri memang sempat agak goyang pas uji beban. Aku siap banget perkuat itu, asalkan dibahas bareng dengan saling menghargai.',
          'tersenyum',
          'Gilang mengangguk jujur dengan senyum tipis yang dewasa.',
        ),
      },
      {
        id: 't5-salah', skillId: 'interogasi', isMisstep: true,
        text: 'Kamu sadar nggak sih sifatmu yang gampang tersinggung itu bisa bikin teman-teman malas satu kelompok sama kamu?',
        reply: line(
          'Kalau terus dicap gampang tersinggung begini, makin malas aku balik ke Meja Diskusi, Bu.',
          'kesal',
          'Wajah Gilang memerah menahan kekesalan.',
        ),
      },
    ],
    t6: [
      {
        id: 't6-tepat', skillId: 'pertanyaan-terbuka', best: true,
        text: 'Keren, Gilang—kamu objektif banget soal teknisnya! Langkah kecil apa yang paling nyaman kamu lakukan supaya pesanmu sampai tegas tapi tetap elegan ke tim?',
        reply: line(
          'Aku mau perbaiki baut sambungannya dulu, lalu ngobrol singkat empat mata ke Kevin: bilang aku terima masukan teknisnya, tapi lain kali tolong bahas berdua dulu biar sama-sama enak.',
          'tersenyum',
          'Gilang terlihat lega dan mantap dengan pilihannya.',
        ),
      },
      {
        id: 't6-salah', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Lain kali kalau mereka mengkritik lagi, kamu diam saja dan terima tanpa perlu bicara apa-apa.',
        reply: line(
          'Kalau cuma diam saat diremehkan, lama-lama aku makin tertekan dong Bu...',
          'waspada',
          'Gilang menggeleng tidak setuju.',
        ),
      },
    ],
    t7: [
      {
        id: 't7-tepat', skillId: 'parafrase-ringkasan', best: true,
        text: 'Sikap tegas tapi tetap terbuka pada perbaikan teknis itu keren banget, Gilang! Semangat lanjut uji prototipe mekanikmu ya.',
        reply: line(
          'Siap Bu! Makasih banget sudah menghargai usahaku dan nggak ngehakimi. Kepalaku sudah adem dan energiku balik penuh nih!',
          'lega',
          'Gilang berdiri tegap dengan senyum mantap.',
        ),
      },
      {
        id: 't7-salah', skillId: 'meremehkan', isMisstep: true,
        text: 'Oke selesai ya, ingat jangan bikin drama lagi di Meja Diskusi.',
        reply: line(
          'Aku nggak bikin drama kok Bu... ya sudah, aku keluar dulu.',
          'kesal',
          'Gilang keluar ruangan dengan raut kembali kaku.',
        ),
      },
    ],
    endings: {
      terbantu: line('Makasih Bu! Aku siap perkuat sambungan mekanik dan bicara baik-baik empat mata sama tim.', 'lega', 'Gilang melangkah kembali ke lab dengan kepala dingin.'),
      kemajuanKecil: line('Oke Bu, aku dinginkan kepala sebentar dulu sebelum balik ke meja.', 'netral', 'Gilang mengangguk singkat.'),
      menarikDiri: line('Ya sudah Bu, biar aku urus mekaniknya sendiri saja...', 'menutup-diri', 'Gilang pergi dengan ekspresi masih panas.'),
    },
  },

  // 10 — Teguh Santosa (Magelang · Mandiri & Fokus Sunyi · Kalibrasi alat di gudang, nyaman sendiri sehat!)
  {
    studentId: 'mhs-10',
    firstName: 'Teguh',
    title: 'Cerita Teguh Santosa',
    labSceneTitle: 'Gudang Alat & Kalibrasi',
    labSceneCaption: 'Teguh sedang mengecek ketepatan jarum multimeter dan merapikan rak instrumen dengan sangat tenang.',
    opening: line(
      'Oh, siang Bu. Selamat datang di gudang alat—aku baru beres kalibrasi tiga multimeter sebelum dipakai praktikum.',
      'tersenyum',
      'Teguh meletakkan obeng presisinya dengan rapi dan menyapa sopan.',
    ),
    t1: [
      {
        id: 't1-tepat', skillId: 'sapaan-hangat', best: true,
        text: 'Siang juga Teguh, apa kabarmu hari ini? Rapi sekali susunan alat ukur di gudang kalau kamu yang pegang.',
        reply: line(
          'Baik Bu, terima kasih. Aku memang paling tenang kalau kerja di tempat hening begini, jadi fokus kalibrasinya nggak gampang pecah.',
          'tersenyum',
          'Teguh tersenyum santai sambil merapikan buku log kalibrasi.',
        ),
      },
      {
        id: 't1-salah', skillId: 'meremehkan', isMisstep: true,
        text: 'Apa sih mojok di gudang terus kayak nggak punya teman? Ayo keluar, jangan mengurung diri!',
        reply: line(
          'Eh... aku bukan mengurung diri kok Bu, aku memang lagi kalibrasi alat ukur dan belajar buat uji kompetensi di tempat tenang.',
          'terkejut',
          'Raut tenang Teguh berubah sedikit canggung dan defensif.',
        ),
      },
    ],
    t2: [
      {
        id: 't2-tepat', skillId: 'sampaikan-pengamatan', best: true,
        options: { observationTone: 'faktual' },
        text: 'Aku perhatikan kamu sangat tekun menyiapkan uji kompetensi teknisi instrumentasi di sini. Gimana ritme belajarmu minggu ini?',
        reply: line(
          'Lumayan lancar Bu, cuma minggu ini jadwal lab lagi padat dan ruangan sebelah ramai banget—kalau terlalu bising, energiku agak cepat turun.',
          'lelah',
          'Teguh menyeka keningnya pelan sambil menunjuk tumpukan modul kalibrasi.',
        ),
      },
      {
        id: 't2-salah', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Kamu terlalu sering sendirian, Teguh. Itu tandanya kamu kesepian dan anti sosial lho, bahaya buat kuliahmu.',
        reply: line(
          'Waduh Bu, aku nggak kesepian dan nggak anti sosial kok... aku cuma tipe yang lebih fokus di ruang sunyi saja.',
          'waspada',
          'Teguh menggeleng sopan namun jelas merasa kurang dipahami.',
        ),
      },
    ],
    t3: [
      {
        id: 't3-tepat', skillId: 'batas-kerahasiaan', best: true,
        text: 'Kalau mau istirahat 5 menit dari suara bengkel sebelah, kita ngobrol santai di Ruang Konsultasi yang sunyi yuk?',
        reply: line(
          'Wah, boleh banget Bu—di Ruang Konsultasi adem dan nggak berisik! Jujur, kadang aku bingung kalau ada yang mengira aku menjauhi kelas, padahal aku cuma butuh jeda sunyi buat isi ulang tenaga.',
          'lega',
          'Teguh duduk dengan tenang di Ruang Konsultasi.',
        ),
      },
      {
        id: 't3-salah', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Sekarang tinggalkan gudang dulu, Ibu mau kamu langsung duduk di tengah keramaian Meja Diskusi biar terbiasa ramai.',
        reply: line(
          'Justru kalau dipaksa ke tempat ramai pas kepalaku lagi penuh materi kalibrasi, energiku makin cepat habis Bu... kita ngobrol di ruang tenang saja ya.',
          'lelah',
          'Teguh menghela napas pelan saat menuju Ruang Konsultasi.',
        ),
      },
    ],
    t4: [
      {
        id: 't4-tepat', skillId: 'validasi-normalisasi', best: true,
        text: 'Bekerja tenang secara mandiri itu bukan kelemahan, Teguh—justru gaya fokus sunyi seperti itu sangat cocok untuk profesi teknisi instrumentasi presisi!',
        reply: line(
          'Alhamdulillah, lega banget dengarnya Bu! Di Magelang dulu juga aku biasa bongkar-pasang alat di bengkel kecil belakang rumah dengan tenang. Tapi di sini kadang aku tetap perlu koordinasi soal jadwal alat sama tim.',
          'tersenyum',
          'Wajah Teguh tampak sangat lega karena gaya kepribadiannya dihargai.',
        ),
      },
      {
        id: 't4-salah', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Bagaimanapun di dunia kerja nanti kamu harus mengubah sifatmu jadi ekstrover dan sering kumpul-kumpul bareng semua orang.',
        reply: line(
          'Kalau harus memaksa jadi orang lain yang bukan diriku, rasanya berat banget Bu... aku bisa kerja sama kok tanpa harus selalu ramai-ramai.',
          'menutup-diri',
          'Teguh menunduk dengan ekspresi datar.',
        ),
      },
    ],
    t5: [
      {
        id: 't5-tepat', skillId: 'refleksi-perasaan', best: true,
        options: { reflectionNuance: 'lelah-kewalahan' },
        text: 'Jadi tantanganmu sebenarnya bukan soal kesepian, melainkan menjaga batas agar waktu fokus sunyimu tetap utuh sambil tetap terhubung singkat saat teman butuh alat kalibrasi?',
        reply: line(
          'Tepat sekali, Bu! Aku senang kok kalau ada teman datang satu-dua orang tanya soal alat ukur. Yang bikin energiku cepat habis itu kalau dipaksa rapat panjang yang berisik tanpa agenda jelas.',
          'tertegun',
          'Teguh mengangguk mantap, merasa benar-benar dimengerti.',
        ),
      },
      {
        id: 't5-salah', skillId: 'interogasi', isMisstep: true,
        text: 'Yakin kamu nggak sebenarnya punya masalah pribadi dengan teman-teman sekelas sampai menghindar ke gudang terus?',
        reply: line(
          'Nggak ada masalah sama siapa-siapa kok Bu... kenapa setiap orang yang suka tenang selalu dicurigai sedang bermusuhan ya?',
          'kesal',
          'Teguh menarik napas panjang menahan kecewa.',
        ),
      },
    ],
    t6: [
      {
        id: 't6-tepat', skillId: 'afirmasi-kekuatan', best: true,
        text: 'Keahlian kalibrasimu adalah tulang punggung keakuratan seluruh lab, Teguh. Langkah kecil apa yang enak buat mengatur jadwal koordinasi alat tanpa menguras fokusmu?',
        reply: line(
          'Aku mau pasang papan jadwal "Jam Cek Alat & Tanya Singkat" 20 menit setiap pagi di pintu gudang, lalu sisa waktunya kupakai fokus belajar sertifikasi dengan tenang!',
          'tersenyum',
          'Teguh tersenyum puas dengan ide praktis yang cocok untuk dirinya.',
        ),
      },
      {
        id: 't6-salah', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Mulai besok kamu wajib ikut seluruh sesi kumpul santai di Meja Diskusi minimal dua jam sehari.',
        reply: line(
          'Dua jam di keramaian tiap hari malah bikin persiapan uji kompetensiku keteteran, Bu...',
          'lelah',
          'Teguh menggeleng pelan dengan raut penat.',
        ),
      },
    ],
    t7: [
      {
        id: 't7-tepat', skillId: 'parafrase-ringkasan', best: true,
        text: 'Papan jadwal 20 menit itu brilian banget, Teguh—teman terbantu dan ruang sunyimu tetap terjaga! Sukses besar untuk uji kompetensi instrumentasimu ya.',
        reply: line(
          'Terima kasih banyak Bu sudah memahami tipe belajarku! Energiku balik segar lagi—aku balik menata alat ukur dulu ya Bu.',
          'lega',
          'Teguh tersenyum hangat dan berjalan tenang kembali ke gudang.',
        ),
      },
      {
        id: 't7-salah', skillId: 'meremehkan', isMisstep: true,
        text: 'Ya sudah, semoga kamu nggak makin aneh di mata teman-temanmu ya.',
        reply: line(
          'Permisi, Bu.',
          'menutup-diri',
          'Teguh keluar ruangan dengan ekspresi dingin.',
        ),
      },
    ],
    endings: {
      terbantu: line('Terima kasih Bu! Rasanya dihargai banget—ruang fokusku terjaga dan koordinasi lab tetap lancar.', 'lega', 'Teguh kembali ke Gudang Alat dengan senyum tenang.'),
      kemajuanKecil: line('Makasih ya Bu, aku coba atur ulang jadwal istirahatku di gudang.', 'netral', 'Teguh mengangguk sopan.'),
      menarikDiri: line('Aku balik kalibrasi alat sendiri saja ya Bu...', 'menutup-diri', 'Teguh keluar dengan wajah tertutup.'),
    },
  },

  // 11 — Maya Puspita (Jember · Reflektif & Teliti · Suka analisis grafik data & diskusi 1-on-1 tenang)
  {
    studentId: 'mhs-11',
    firstName: 'Maya',
    title: 'Cerita Maya Puspita',
    labSceneTitle: 'Lab Elektronika & IoT',
    labSceneCaption: 'Maya duduk tenang di meja pinggir sambil menandai pola grafik sensor di buku log uji.',
    opening: line(
      'Halo Bu... siang. Aku baru selesai mencatat pola pembacaan sensor gelombang kedua.',
      'netral',
      'Maya tersenyum sopan sambil menjaga pensilnya tetap di atas tabel data.',
    ),
    t1: [
      {
        id: 't1-tepat', skillId: 'sapaan-hangat', best: true,
        text: 'Halo Maya, apa kabarmu hari ini? Teliti sekali catatan grafik datamu, enak banget dilihat.',
        reply: line(
          'Baik Bu, makasih... aku memang paling nyaman menganalisis pola pelan-pelan di sudut tenang begini.',
          'tersenyum',
          'Maya tersenyum lembut dan membuka halaman grafik berikutnya.',
        ),
      },
      {
        id: 't1-salah', skillId: 'meremehkan', isMisstep: true,
        text: 'Maya, kenapa sih suaramu pelan banget dan nggak ikut ramai bareng teman-teman? Ayo lebih heboh sedikit!',
        reply: line(
          'Oh... maaf Bu, aku memang nggak terbiasa bicara keras-keras. Aku lebih nyaman kerja tenang.',
          'cemas',
          'Maya langsung menunduk dan merapatkan bukunya.',
        ),
      },
    ],
    t2: [
      {
        id: 't2-tepat', skillId: 'sampaikan-pengamatan', best: true,
        options: { observationTone: 'faktual' },
        text: 'Kelihatannya kamu sudah menemukan pola penting di grafik itu, tapi tadi sempat berhenti sejenak seperti ada ide yang ingin didiskusikan?',
        reply: line(
          'Iya Bu, peka sekali... aku nemu anomali kecil di data sensor, pengin tukar pikiran berdua tapi tadi rapat kelompok terlalu cepat dan ramai buatku.',
          'cemas',
          'Maya menunjuk satu lengkungan kecil yang dilingkari pensil di bukunya.',
        ),
      },
      {
        id: 't2-salah', skillId: 'pertanyaan-tertutup', isMisstep: true,
        text: 'Kalau punya ide kenapa tadi nggak langsung teriak menyela di rapat kelompok? Rugi sendiri kan kalau diam!',
        reply: line(
          'Aku nggak nyaman menyela orang yang lagi bicara cepat-cepat, Bu... butuh jeda sebentar buat menyusun kalimat.',
          'menunduk',
          'Maya menatap catatan grafiknya dengan perasaan kecil hati.',
        ),
      },
    ],
    t3: [
      {
        id: 't3-tepat', skillId: 'batas-kerahasiaan', best: true,
        text: 'Kita ngobrol empat mata di Ruang Konsultasi yuk, biar kita punya ruang hening dan jeda santai buat membahas idemu.',
        reply: line(
          'Makasih banyak Bu... obrolan satu lawan satu yang tenang begini jauh lebih pas buatku. Di Jember dulu aku terbiasa berpikir mendalam dulu baru bicara.',
          'lega',
          'Maya duduk nyaman dan membentangkan buku log sensornya.',
        ),
      },
      {
        id: 't3-salah', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Nggak usah ke ruangan sepi, ayo sekarang juga kita panggil semua temanmu berkumpul mengelilingi meja ini biar kamu latihan bicara keras.',
        reply: line(
          'Duh jangan ramai-ramai Bu, pikiranku malah langsung kosong kalau jadi pusat perhatian... boleh kita bicara berdua di dalam saja?',
          'cemas',
          'Maya tampak cemas saat melangkah ke Ruang Konsultasi.',
        ),
      },
    ],
    t4: [
      {
        id: 't4-tepat', skillId: 'validasi-normalisasi', best: true,
        text: 'Tipe pemikir reflektif yang butuh jeda sebelum bicara itu bukan lambat, Maya—justru analisis yang lahir dari ketenangan biasanya paling akurat dan mendalam.',
        reply: line(
          'Makasih Bu sudah bilang begitu... kadang aku merasa aneh sendiri karena teman lain cepat banget melontarkan pendapat, sementara aku butuh mikir dua-tiga menit dulu.',
          'tertegun',
          'Bahu Maya mengendur dengan ekspresi sangat lega.',
        ),
      },
      {
        id: 't4-salah', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Di dunia kerja orang yang diam akan kalah cepat, jadi mulai besok kamu harus latihan jadi orang yang cerewet dan selalu bicara duluan.',
        reply: line(
          'Kalau dipaksa bicara asal cepat tanpa dipikir dulu, itu bukan gayaku Bu... malah bikin aku tambah stres.',
          'menutup-diri',
          'Maya menutup separuh halaman buku log-nya.',
        ),
      },
    ],
    t5: [
      {
        id: 't5-tepat', skillId: 'refleksi-perasaan', best: true,
        options: { reflectionNuance: 'ragu-kurang-percaya' },
        text: 'Jadi kamu sebenarnya punya kontribusi analisis data yang tajam dan ingin didengar, asalkan ada cara menyampaikan yang cocok dengan gaya tenangnya dirimu ya?',
        reply: line(
          'Iya Bu, tepat banget! Kalau aku kirim ringkasan grafiknya duluan lewat catatan tertulis atau diskusi berdua sama koordinator sebelum rapat besar, aku jauh lebih percaya diri!',
          'tersenyum',
          'Senyum lembut Maya melebar karena merasa menemukan caranya sendiri.',
        ),
      },
      {
        id: 't5-salah', skillId: 'interogasi', isMisstep: true,
        text: 'Jangan-jangan kamu sebenarnya kurang percaya pada hasil analisismu sendiri makanya takut ngomong di depan kelas?',
        reply: line(
          'Dataku sudah kuuji tiga kali kok Bu, aku yakin akurat... aku cuma nggak cocok sama suasana berebut bicara saja.',
          'kesal',
          'Maya mengerutkan kening lembut karena merasa disalahpahami.',
        ),
      },
    ],
    t6: [
      {
        id: 't6-tepat', skillId: 'afirmasi-kekuatan', best: true,
        text: 'Ketelitianmu membaca pola sensor itu luar biasa, Maya. Mau mulai langkah kecil apa minggu ini supaya temuan anomali datamu tersampaikan nyaman?',
        reply: line(
          'Aku mau bikin catatan 1 halaman grafik sensor hari ini lalu diskusi singkat berdua dengan Raka atau Tania—rasanya pas banget buatku!',
          'tersenyum',
          'Maya menandai bagian grafik yang paling penting dengan stabilo lembut.',
        ),
      },
      {
        id: 't6-salah', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Besok kamu harus jadi moderator rapat besar seluruh kelompok biar suara kamu paling mendominasi ruangan.',
        reply: line(
          'Langsung jadi moderator rapat besar? Rasanya terlalu jauh dari kenyamananku sekarang, Bu...',
          'cemas',
          'Maya menggeleng pelan dengan tatapan gelisah.',
        ),
      },
    ],
    t7: [
      {
        id: 't7-tepat', skillId: 'parafrase-ringkasan', best: true,
        text: 'Catatan grafik 1 halaman + diskusi 1-on-1 itu elegan sekali, Maya! Kamu nggak perlu jadi berisik untuk didengar—ketajaman datamu sudah bicara kuat.',
        reply: line(
          'Terima kasih banyak Bu! Rasanya tenang dan berenergi lagi setelah ngobrol pelan tanpa buru-buru begini.',
          'lega',
          'Maya berdiri dengan senyum hangat dan langkah percaya diri.',
        ),
      },
      {
        id: 't7-salah', skillId: 'meremehkan', isMisstep: true,
        text: 'Sudah ya, semoga nanti kamu bisa lebih ramai seperti teman-temanmu yang lain.',
        reply: line(
          'Iya Bu... permisi.',
          'menunduk',
          'Maya keluar perlahan dengan senyum yang memudar.',
        ),
      },
    ],
    endings: {
      terbantu: line('Makasih banyak Bu! Aku siap bawa catatan grafik 1 halaman buat diskusi berdua nanti.', 'lega', 'Maya kembali ke meja sensor dengan tenang dan penuh energi.'),
      kemajuanKecil: line('Makasih ya Bu sudah meluangkan waktu, aku susun dulu catatanku pelan-pelan.', 'netral', 'Maya mengangguk ramah.'),
      menarikDiri: line('Maaf Bu, aku kembali mencatat sendiri saja dulu...', 'menutup-diri', 'Maya melangkah keluar dengan kepala tertunduk.'),
    },
  },

  // 12 — Sari Melati (Yogyakarta · Penengah Hangat / Bridge · Kelelahan menengahi konflik tim sendiri)
  {
    studentId: 'mhs-12',
    firstName: 'Sari',
    title: 'Cerita Sari Melati',
    labSceneTitle: 'Area Meja Diskusi',
    labSceneCaption: 'Sari baru saja selesai meredakan perdebatan tim hardware dan software, lalu duduk terdiam memegangi keningnya.',
    opening: line(
      'Halo Bu! Hehe, aman kok Meja Diskusi sudah adem lagi barusan setelah aku bantu sambungin tim kode sama hardware.',
      'tersenyum',
      'Sari tersenyum ceria seperti biasa, namun bahunya turun dan napasnya terdengar lelah.',
    ),
    t1: [
      {
        id: 't1-tepat', skillId: 'sapaan-hangat', best: true,
        text: 'Halo Sari, apa kabarmu sendiri hari ini? Kamu hebat banget selalu jadi jembatan tim, tapi kelihatannya energimu lagi terkuras ya?',
        reply: line(
          'Wah, jarang banget ada yang nanya kabarku sendiri Bu... biasanya orang cuma nanya "Sar, tim sebelah gimana?". Jujur, capek banget hari ini.',
          'lelah',
          'Senyum formal Sari berubah jadi hela napas jujur yang panjang.',
        ),
      },
      {
        id: 't1-salah', skillId: 'meremehkan', isMisstep: true,
        text: 'Ngapain sih duduk lemas di situ? Kalau kamu yang biasanya ceria ikut lemas, siapa nanti yang jaga kekompakan kelas?',
        reply: line(
          'Oh... iya Bu, maaf. Aku cuma duduk sebentar saja kok, habis ini aku senyum lagi biar kelas ramai.',
          'terkejut',
          'Sari buru-buru menegakkan punggung dengan senyum yang dipaksakan.',
        ),
      },
    ],
    t2: [
      {
        id: 't2-tepat', skillId: 'sampaikan-pengamatan', best: true,
        options: { observationTone: 'faktual' },
        text: 'Sejak pagi kamu bolak-balik antara meja pemrograman dan meja mekanik buat meredam gesekan mereka. Kapan terakhir kali kamu punya jeda buat dirimu sendiri?',
        reply: line(
          'Kayaknya belum sempat sama sekali dari pagi, Bu... bahkan jam makan siang tadi kepakai dengerin dua kubu yang beda pendapat.',
          'cemas',
          'Sari memijat pelipisnya pelan.',
        ),
      },
      {
        id: 't2-salah', skillId: 'pertanyaan-tertutup', isMisstep: true,
        text: 'Memangnya dua tim tadi ribut besar ya? Cepat ceritakan detail salah mereka siapa saja ke saya!',
        reply: line(
          'Aduh Bu, aku malah tambah pusing kalau harus ulang-ulang cerita ribut mereka di sini...',
          'lelah',
          'Sari mengernyitkan kening, terlihat makin kelelahan.',
        ),
      },
    ],
    t3: [
      {
        id: 't3-tepat', skillId: 'batas-kerahasiaan', best: true,
        text: 'Sebentar ya, kali ini giliran kamu yang istirahat dan didengarkan. Yuk kita duduk tenang di Ruang Konsultasi.',
        reply: line(
          'Ya ampun, makasih banget Bu... rasanya lega banget masuk sini. Di Jogja dulu aku juga selalu jadi penengah kalau ada yang beda pendapat, jadi rasanya otomatis merasa wajib bikin semua orang akur.',
          'lega',
          'Sari bersandar nyaman di kursi Ruang Konsultasi.',
        ),
      },
      {
        id: 't3-salah', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Kamu memang berbakat jadi mediator, jadi sekalian saja kamu urus semua konflik kelas minggu ini ya. Ayo masuk sebentar.',
        reply: line(
          'Kalau semua konflik dilempar ke aku lagi, kapan aku ngerjain bagian kodingku sendiri, Bu...',
          'cemas',
          'Sari melangkah ke Ruang Konsultasi dengan bahu makin berat.',
        ),
      },
    ],
    t4: [
      {
        id: 't4-tepat', skillId: 'validasi-normalisasi', best: true,
        text: 'Menjadi jembatan yang hangat itu bakat luar biasa, Sari—tapi penengah juga manusia yang berhak capek dan tidak wajib menanggung kedamaian seluruh kelas sendirian.',
        reply: line(
          'Bener banget Bu... selama ini aku takut kalau nggak ikut menengahi, mereka bakal pecah dan proyeknya bubar. Padahal ternyata kalau aku ikut kehabisan tenaga, aku sendiri yang goyang.',
          'menunduk',
          'Mata Sari tampak berkaca-kaca karena akhirnya merasa diperhatikan.',
        ),
      },
      {
        id: 't4-salah', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Salahmu sendiri terlalu ikut campur urusan orang lain, Sari. Mulai sekarang bersikap cuek saja sama semua teman.',
        reply: line(
          'Bukan ikut campur Bu, kalau tim hardware dan software nggak nyambung kan proyek barengnya juga macet... aku nggak bisa langsung cuek total gitu.',
          'kesal',
          'Sari tampak kecewa karena kepeduliannya dianggap salah.',
        ),
      },
    ],
    t5: [
      {
        id: 't5-tepat', skillId: 'refleksi-perasaan', best: true,
        options: { reflectionNuance: 'lelah-kewalahan' },
        text: 'Kamu sangat peduli keharmonisan tim, tapi di balik wajah ceriamu, ada rasa lelah karena selalu mendengarkan orang lain tanpa punya ruang untuk bilang "aku juga butuh jeda"?',
        reply: line(
          'Iya Bu, kena banget! Aku baru sadar selama ini aku selalu buru-buru turun tangan setiap ada nada tinggi, padahal mungkin mereka juga bisa belajar menyelesaikannya sendiri kalau kuberi jarak.',
          'tertegun',
          'Sari menarik napas dalam dan wajahnya mulai cerah kembali.',
        ),
      },
      {
        id: 't5-salah', skillId: 'interogasi', isMisstep: true,
        text: 'Kenapa kamu selalu cari perhatian dengan jadi penengah kalau ujung-ujungnya kamu sendiri yang mengeluh lelah?',
        reply: line(
          'Aku nggak cari perhatian kok Bu... aku cuma pengin suasana lab enak. Sedih banget kalau malah dituduh begitu.',
          'menutup-diri',
          'Sari langsung menunduk dan terdiam.',
        ),
      },
    ],
    t6: [
      {
        id: 't6-tepat', skillId: 'afirmasi-kekuatan', best: true,
        text: 'Kecerdasan sosialmu menyambungkan dua tim itu tetap keren, Sari. Langkah kecil apa yang mau kamu terapkan supaya kamu tetap peduli tapi energimu tidak habis?',
        reply: line(
          'Aku mau tetapkan aturan buat diriku sendiri: bantu sambungkan fakta teknisnya saja, lalu biarkan mereka berdiskusi langsung—dan tiap jam 12 aku wajib istirahat makan siang tanpa bahas drama tim!',
          'tersenyum',
          'Sari tersenyum ceria yang kali ini terasa jauh lebih tulus.',
        ),
      },
      {
        id: 't6-salah', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Kalau begitu besok kamu pindah kerja sendiri saja di gudang biar nggak ketemu siapa-siapa.',
        reply: line(
          'Aku kan suka kerja bareng tim Bu, bukan mau dijauhkan dari semua orang—cuma butuh batas biar nggak capek sendiri.',
          'cemas',
          'Sari menggeleng pelan.',
        ),
      },
    ],
    t7: [
      {
        id: 't7-tepat', skillId: 'parafrase-ringkasan', best: true,
        text: 'Batas sehat yang luar biasa, Sari! Ingat, kamu juga berhak didengarkan dan dijaga energinya—bukan cuma jadi penengah buat orang lain.',
        reply: line(
          'Makasih banyak Bu! Akhirnya rasanya benar-benar diisi ulang nih energiku. Aku balik ke lab dengan hati enteng!',
          'lega',
          'Sari melangkah keluar dengan senyum tulus dan penuh energi.',
        ),
      },
      {
        id: 't7-salah', skillId: 'meremehkan', isMisstep: true,
        text: 'Ya sudah, sekarang cepat balik ke Meja Diskusi sebelum mereka ribut lagi ya.',
        reply: line(
          'Oh... baik Bu, permisi.',
          'lelah',
          'Sari keluar dengan bahu kembali terasa berat.',
        ),
      },
    ],
    endings: {
      terbantu: line('Makasih banget Bu! Sekarang aku tahu cara tetap jadi penghubung hangat tanpa melupakan energiku sendiri.', 'lega', 'Sari kembali ke lab dengan senyum segar.'),
      kemajuanKecil: line('Makasih ya Bu, aku coba sisihkan waktu istirahat siang buat diriku sendiri.', 'netral', 'Sari mengangguk lembut.'),
      menarikDiri: line('Ya sudah Bu, aku kembali ke meja dulu ya...', 'menutup-diri', 'Sari pergi dengan wajah lelah.'),
    },
  },

  // 13 — Nisa Nurhaliza (Garut · Peka & Mudah Menyerap Beban · Teman curhat favorit yang ikut kehabisan tenaga)
  {
    studentId: 'mhs-13',
    firstName: 'Nisa',
    title: 'Cerita Nisa Nurhaliza',
    labSceneTitle: 'Sudut Istirahat Mahasiswa',
    labSceneCaption: 'Nisa duduk tenang di sofa sudut istirahat sambil memegang cangkir teh hangat yang belum diminum sejak tadi.',
    opening: line(
      'Halo Bu... silakan duduk. Tadi aku baru menemani teman curhat sebentar di sini, sekarang lagi tarik napas.',
      'lelah',
      'Nisa menggenggam cangkir hangat dengan kedua tangannya dan tatapan tampak penat.',
    ),
    t1: [
      {
        id: 't1-tepat', skillId: 'sapaan-hangat', best: true,
        text: 'Halo Nisa, apa kabarmu sendiri hari ini? Kamu selalu peka banget menemani teman, tapi sekarang giliran aku nanya: Nisa lagi merasa gimana?',
        reply: line(
          'Hehe... jujur agak sesak di dada, Bu. Rasanya habis dengar cerita berat teman-teman seharian, energiku ikut kesedot.',
          'lelah',
          'Nisa menghela napas pelan sambil tersenyum lembut.',
        ),
      },
      {
        id: 't1-salah', skillId: 'meremehkan', isMisstep: true,
        text: 'Kenapa sih nongkrong terus di ruang istirahat sambil pegang teh? Praktikum di lab masih jalan lho!',
        reply: line(
          'Maaf Bu... aku baru selesai bantu teman yang tadi kelihatan sedih, terus kepalaku agak pusing jadi duduk sebentar.',
          'terkejut',
          'Nisa langsung menaruh cangkirnya dengan raut merasa bersalah.',
        ),
      },
    ],
    t2: [
      {
        id: 't2-tepat', skillId: 'sampaikan-pengamatan', best: true,
        options: { observationTone: 'faktual' },
        text: 'Tehmu sampai sudah hampir dingin ya karena dari tadi kamu fokus mendengarkan orang lain. Capek banget ya menampung banyak cerita sekaligus?',
        reply: line(
          'Iya Bu, terasa berat banget... tapi tiap teman datang dengan wajah murung, hatiku langsung nggak tega bilang lagi capek.',
          'cemas',
          'Nisa menunduk menatap permukaan tehnya.',
        ),
      },
      {
        id: 't2-salah', skillId: 'pertanyaan-tertutup', isMisstep: true,
        text: 'Tadi siapa saja yang curhat sama kamu? Ceritakan masalah mereka biar saya catat semuanya.',
        reply: line(
          'Jangan Bu, itu rahasia mereka, aku nggak bisa bocorkan... dan jujur aku sendiri lagi capek mikirin masalah orang lain terus.',
          'waspada',
          'Nisa menggeleng lembut dengan ekspresi makin terbebani.',
        ),
      },
    ],
    t3: [
      {
        id: 't3-tepat', skillId: 'batas-kerahasiaan', best: true,
        text: 'Kita pindah sebentar ke Ruang Konsultasi yuk, Nisa. Di sana kita tidak bahas masalah teman-temanmu—kita murni bahas rasa lelahmu sendiri.',
        reply: line(
          'Terima kasih banyak Bu... rasanya hangat banget akhirnya ada tempat di mana aku nggak harus jadi "penampung cerita". Di Garut dulu keluargaku juga terbiasa saling curhat padaku.',
          'lega',
          'Nisa duduk di Ruang Konsultasi dengan bahu yang mulai rileks.',
        ),
      },
      {
        id: 't3-salah', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Kalau gampang capek dengar curhat, ya bilang saja ke teman-temanmu kalau kamu nggak peduli masalah mereka.',
        reply: line(
          'Aku tetap peduli sama mereka kok Bu... mana mungkin aku bilang nggak peduli. Kita ngobrol di dalam saja ya Bu.',
          'cemas',
          'Nisa terlihat sedih mendengar saran yang terlalu dingin.',
        ),
      },
    ],
    t4: [
      {
        id: 't4-tepat', skillId: 'validasi-normalisasi', best: true,
        text: 'Hati yang peka dan empatik itu anugerah besar, Nisa. Tapi kamu juga punya batas kapasitas emosi—kamu tidak harus ikut memikul seluruh beban teman-temanmu.',
        reply: line(
          'Iya Bu... kadang malam hari aku masih kepikiran sedihnya temanku sampai susah tidur, padahal itu bahkan bukan masalahku sendiri. Baru sadar itu yang bikin energiku cepat habis.',
          'menunduk',
          'Nisa mengangguk pelan dengan mata sedikit berkaca-kaca.',
        ),
      },
      {
        id: 't4-salah', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Kamu terlalu perasa saja, Nisa. Seharusnya dengar cerita teman masuk telinga kanan keluar telinga kiri saja.',
        reply: line(
          'Kalau masuk kanan keluar kiri ya aku nggak jadi pendengar yang tulus dong Bu... cuma aku memang belum tahu cara jaga hatiku sendiri.',
          'menutup-diri',
          'Nisa menunduk pelan.',
        ),
      },
    ],
    t5: [
      {
        id: 't5-tepat', skillId: 'refleksi-perasaan', best: true,
        options: { reflectionNuance: 'lelah-kewalahan' },
        text: 'Jadi kamu tetap ingin hadir dengan tulus buat teman, tapi butuh cara halus untuk membedakan antara "menemani dengan hangat" dan "ikut tenggelam dalam bebannya"?',
        reply: line(
          'Ya Allah, pas banget kalimat Ibu! Menemani tanpa harus ikut tenggelam... dan kalau ceritanya sudah terlalu berat, aku boleh ya bilang lembut, "Yuk kita ajak Ibu Dosen BK bareng"?',
          'tertegun',
          'Wajah Nisa langsung cerah dan terasa jauh lebih ringan.',
        ),
      },
      {
        id: 't5-salah', skillId: 'interogasi', isMisstep: true,
        text: 'Kenapa kamu malah sibuk jadi konselor dadakan di lab kalau ternyata mentalmu sendiri belum siap menampungnya?',
        reply: line(
          'Aku nggak bermaksud sok jadi konselor kok Bu... aku cuma menemani teman yang lagi sedih.',
          'menutup-diri',
          'Nisa terlihat sangat terluka dan mengecilkan bahunya.',
        ),
      },
    ],
    t6: [
      {
        id: 't6-tepat', skillId: 'afirmasi-kekuatan', best: true,
        text: 'Boleh banget, Nisa! Mengajak teman ke Ruang Konsultasi bukan berarti kamu lepas tangan, tapi justru memberi bantuan terbaik. Langkah kecil apa buat jaga energimu sendiri hari ini?',
        reply: line(
          'Hari ini aku mau nikmati minuman hangatku sambil istirahat 15 menit tanpa bahas masalah berat, lalu kalau aku lagi capek, aku berani bilang: "Aku dengar ya, tapi kita ngobrol habis aku selesai praktikum ya."',
          'tersenyum',
          'Nisa tersenyum teduh dan penuh ketenangan.',
        ),
      },
      {
        id: 't6-salah', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Mulai besok jangan pernah duduk di ruang istirahat lagi supaya tidak ada teman yang datang curhat ke kamu.',
        reply: line(
          'Tapi ruang istirahat itu tempat favoritku buat tenang sebentar juga, Bu...',
          'cemas',
          'Nisa tampak bingung dan tidak nyaman.',
        ),
      },
    ],
    t7: [
      {
        id: 't7-tepat', skillId: 'parafrase-ringkasan', best: true,
        text: 'Lembut, jujur, dan tetap menjaga hatimu sendiri—kamu keren sekali, Nisa! Nikmati minuman hangatmu dulu ya sebelum lanjut berkarya.',
        reply: line(
          'Terima kasih banyak Bu! Rasanya seperti beban berat baru saja turun dari pundakku. Energiku balik hangat lagi!',
          'lega',
          'Nisa tersenyum manis dan melangkah keluar dengan penuh ketenangan.',
        ),
      },
      {
        id: 't7-salah', skillId: 'meremehkan', isMisstep: true,
        text: 'Oke cukup ya, jangan terlalu lemah lagi kalau dengar cerita orang.',
        reply: line(
          'Baik Bu, permisi.',
          'menunduk',
          'Nisa meninggalkan ruangan dengan tatapan sayu.',
        ),
      },
    ],
    endings: {
      terbantu: line('Makasih banyak Bu! Sekarang aku tahu cara menemani teman dengan hangat tanpa kehabisan energiku sendiri.', 'lega', 'Nisa kembali dengan wajah cerah dan tenang.'),
      kemajuanKecil: line('Makasih Bu, aku coba kasih jeda buat diriku sendiri dulu hari ini.', 'netral', 'Nisa tersenyum tipis.'),
      menarikDiri: line('Maaf Bu, aku duduk sebentar sendiri saja dulu ya...', 'menutup-diri', 'Nisa pergi dengan langkah pelan.'),
    },
  },

  // 14 — Rani Safitri (Bengkulu · Mahasiswa Baru 2026 · Ragu & Sensitif Stigma · Takut dicap lemah oleh senior)
  {
    studentId: 'mhs-14',
    firstName: 'Rani',
    title: 'Cerita Rani Safitri',
    labSceneTitle: 'Sudut Istirahat Mahasiswa',
    labSceneCaption: 'Rani duduk agak menjauh sambil memeluk buku catatan skema praktikum dan melirik ke arah Ruang Konsultasi.',
    opening: line(
      'Eh... halo Bu! Maaf, aku nggak kenapa-napa kok Bu, cuma lagi baca ulang skema praktikum sebentar.',
      'terkejut',
      'Rani cepat-cepat merapatkan bukunya dan melirik apakah ada kakak tingkat yang melihat.',
    ),
    t1: [
      {
        id: 't1-tepat', skillId: 'sapaan-hangat', best: true,
        text: 'Halo Rani, apa kabarmu hari ini? Santai saja kok—diagram skema rangkaian di bukumu kelihatan rapi sekali ya.',
        reply: line(
          'Baik Bu... makasih sudah bilang rapi. Aku masih mahasiswa baru, jadi harus nyatat pelan-pelan dari dasar biar nggak ketinggalan.',
          'tersenyum',
          'Rani mengendurkan pegangannya pada buku catatan meski masih sedikit gugup.',
        ),
      },
      {
        id: 't1-salah', skillId: 'meremehkan', isMisstep: true,
        text: 'Apa sih lihat-lihat pintu Ruang Konsultasi terus? Kalau memang lagi bermasalah ya langsung masuk, jangan plin-plan!',
        reply: line(
          'Nggak Bu, aku nggak bermasalah kok! Maaf ya Bu, aku nggak lihat-lihat lagi deh...',
          'cemas',
          'Wajah Rani langsung pucat; ia langsung memalingkan badan karena takut dilihat senior.',
        ),
      },
    ],
    t2: [
      {
        id: 't2-tepat', skillId: 'sampaikan-pengamatan', best: true,
        options: { observationTone: 'faktual' },
        text: 'Tadi kulihat kamu sempat berjalan ke dekat pintu Ruang Konsultasi lalu berbalik lagi. Ada hal yang bikin ragu untuk mampir ngobrol?',
        reply: line(
          'Ketahuan ya Bu... iya, sebenarnya aku pengin cerita, tapi takut banget kalau kakak tingkat lihat aku masuk ruang BK nanti dikira aku lemah atau bermasalah.',
          'cemas',
          'Rani merendahkan suaranya sambil melirik koridor lab.',
        ),
      },
      {
        id: 't2-salah', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Aduh Rani, hari gini masih takut masuk ruang BK? Nggak usah lebay mikirin omongan kakak tingkat!',
        reply: line(
          'Buat Ibu mungkin gampang bilang begitu, tapi aku anak baru perantau pertama dari Bengkulu... takut banget dicap aneh di semester awal.',
          'menunduk',
          'Rani menggigit bibirnya pelan menahan gugup.',
        ),
      },
    ],
    t3: [
      {
        id: 't3-tepat', skillId: 'batas-kerahasiaan', best: true,
        text: 'Wajar banget merasa sungkan di semester awal. Kita bisa jalan santai lewat sisi tenang ke Ruang Konsultasi, dan semua yang kita bicarakan dijaga kerahasiaannya.',
        reply: line(
          'Makasih banget Bu sudah mengerti rasa sungkanku... di sini terasa jauh lebih aman. Jujur, aku merantau jauh dari Bengkulu, pertama di keluargaku yang kuliah vokasi—rasanya takut banget kalau ternyata aku nggak kuat.',
          'lega',
          'Rani duduk di Ruang Konsultasi dan akhirnya berani menatap konselor.',
        ),
      },
      {
        id: 't3-salah', skillId: 'janji-mutlak', isMisstep: true,
        text: 'Ayo ikut sekarang! Dijamin seratus persen nggak bakal ada satu pun orang di kampus yang tahu atau berkomentar!',
        reply: line(
          'Hmm... kalau dibilang seratus persen nggak ada yang lihat pas pintu kebuka ke lab, aku malah makin was-was Bu... tapi oke aku ikut duduk sebentar.',
          'waspada',
          'Rani melangkah masuk dengan langkah kaku dan ragu.',
        ),
      },
    ],
    t4: [
      {
        id: 't4-tepat', skillId: 'validasi-normalisasi', best: true,
        text: 'Merantau sendirian dari Bengkulu sebagai generasi pertama yang kuliah vokasi itu keberanian luar biasa, Rani. Datang untuk bercerita bukan tanda lemah, justru tanda kamu mau bertumbuh.',
        reply: line(
          'Beneran ya Bu? Di rumah orang tua bangga banget aku bisa masuk sini, jadi aku takut kelihatan rapuh... tiap bingung materi praktikum aku malah diam dan simpan sendiri sampai pusing.',
          'tertegun',
          'Mata Rani berkaca-kaca haru karena rasa takutnya akhirnya divalidasi dengan hangat.',
        ),
      },
      {
        id: 't4-salah', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Kalau memang takut ketinggalan, ya jangan terlalu sensitif—semua mahasiswa baru juga merantau dan mereka baik-baik saja kok.',
        reply: line(
          'Berarti memang aku saja yang terlalu lemah ya Bu dibanding mahasiswa baru lainnya...',
          'menunduk',
          'Rani langsung menunduk dalam; rasa minder dan stigmanya makin menguat.',
        ),
      },
    ],
    t5: [
      {
        id: 't5-tepat', skillId: 'refleksi-perasaan', best: true,
        options: { reflectionNuance: 'tertekan-cemas' },
        text: 'Jadi beban terberatmu bukan karena tidak mampu belajar, melainkan tekanan ingin terlihat selalu kuat demi keluarga di Bengkulu sampai ragu meminta ruang aman?',
        reply: line(
          'Iya Bu, tepat sekali! Padahal setiap kali aku menggambar ulang skema pelan-pelan di buku, aku paham kok—cuma kalau langsung bingung sendirian tanpa teman ngobrol, langsung panik merasa gagal.',
          'tersenyum',
          'Rani menarik napas lega dan menunjukkan halaman diagram rapi di bukunya.',
        ),
      },
      {
        id: 't5-salah', skillId: 'interogasi', isMisstep: true,
        text: 'Kalau begitu sebenarnya kamu salah pilih jurusan nggak sih? Kok baru semester awal sudah merasa berat begini?',
        reply: line(
          'Aku nggak salah pilih jurusan kok Bu! Aku suka banget menggambar skema rangkaian, cuma lagi adaptasi saja...',
          'kesal',
          'Rani memeluk buku skemanya erat dengan ekspresi terluka.',
        ),
      },
    ],
    t6: [
      {
        id: 't6-tepat', skillId: 'afirmasi-kekuatan', best: true,
        text: 'Ketelitianmu mencatat skema rangkaian dari dasar itu modal hebat banget, Rani! Langkah kecil apa yang paling nyaman buatmu biar adaptasi di lab terasa lebih ringan?',
        reply: line(
          'Aku mau bawa buku skemaku buat belajar bareng Tania di waktu senggang—katanya Kak Tania sabar banget ngajarin osiloskop! Dan kalau butuh cerita lagi, aku sudah nggak takut mampir sini.',
          'tersenyum',
          'Senyum cerah akhirnya benar-benar kembali di wajah Rani.',
        ),
      },
      {
        id: 't6-salah', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Besok kamu harus langsung gabung diskusi kelompok paling ramai di tengah lab dan jangan duduk menyendiri lagi.',
        reply: line(
          'Langsung ke kelompok paling ramai? Rasanya aku masih butuh adaptasi bertahap dulu Bu...',
          'cemas',
          'Rani tampak kembali tegang.',
        ),
      },
    ],
    t7: [
      {
        id: 't7-tepat', skillId: 'parafrase-ringkasan', best: true,
        text: 'Belajar bertahap bareng Kak Tania sambil membawa skema rapimu itu langkah yang pas banget, Rani! Pintu Ruang Konsultasi selalu terbuka ramah buatmu kapan pun.',
        reply: line(
          'Terima kasih banyak Bu! Ternyata ngobrol di sini hangat banget dan sama sekali nggak menyeramkan. Energiku balik penuh lagi!',
          'lega',
          'Rani berdiri dengan langkah ringan dan senyum penuh percaya diri.',
        ),
      },
      {
        id: 't7-salah', skillId: 'meremehkan', isMisstep: true,
        text: 'Ya sudah, jangan penakut lagi ya, nanti makin ketinggalan sama teman-temanmu.',
        reply: line(
          'Iya Bu... maaf sudah bikin repot.',
          'menunduk',
          'Rani keluar dengan wajah kembali murung.',
        ),
      },
    ],
    endings: {
      terbantu: line('Makasih banyak Bu! Sekarang aku nggak takut lagi mampir cerita dan siap belajar bertahap bareng Kak Tania!', 'lega', 'Rani melangkah keluar dengan senyum penuh harapan.'),
      kemajuanKecil: line('Makasih ya Bu, aku masih agak sungkan sedikit tapi sudah lumayan lega.', 'netral', 'Rani mengangguk sopan.'),
      menarikDiri: line('Maaf Bu, aku balik baca buku sendiri saja dulu ya...', 'menutup-diri', 'Rani pergi cepat-cepat sambil memeluk bukunya.'),
    },
  },

  // 15 — Naufal Hakim (Palu · Inovator Eksperimental · Merasa Terabaikan · Ide daur ulang dilewati saat rapat)
  {
    studentId: 'mhs-15',
    firstName: 'Naufal',
    title: 'Cerita Naufal Hakim',
    labSceneTitle: 'Studio Cetak 3D',
    labSceneCaption: 'Naufal merakit casing purwarupa dari komponen daur ulang sendirian di pojok meja belakang.',
    opening: line(
      'Oh, halo Bu... aku lagi utak-atik bahan sisa cetak 3D saja di pojok, biar nggak ganggu rapat tim di depan.',
      'lelah',
      'Naufal memutar rangka purwarupa unik buatannya di tangan sambil menunduk.',
    ),
    t1: [
      {
        id: 't1-tepat', skillId: 'sapaan-hangat', best: true,
        text: 'Halo Naufal, apa kabarmu hari ini? Wah, keren banget rangka purwarupa dari komponen daur ulang yang lagi kamu pegang itu!',
        reply: line(
          'Eh, Ibu tertarik lihat ini? Hehe, makasih Bu... biasanya orang cuma anggap ini barang rongsokan yang nggak sesuai standar.',
          'tersenyum',
          'Mata Naufal langsung berbinar sedikit meski masih agak sungkan.',
        ),
      },
      {
        id: 't1-salah', skillId: 'meremehkan', isMisstep: true,
        text: 'Ngapain sih main-main barang bekas di pojok sendirian? Kenapa nggak ikut kerjakan desain resmi sama kelompokmu?',
        reply: line(
          'Ini bukan main-main barang bekas kok Bu... ini rangka uji cepat yang hemat biaya. Tapi memang nggak ada yang mau dengar sih.',
          'kesal',
          'Naufal langsung meletakkan purwarupanya ke meja dengan wajah murung.',
        ),
      },
    ],
    t2: [
      {
        id: 't2-tepat', skillId: 'sampaikan-pengamatan', best: true,
        options: { observationTone: 'faktual' },
        text: 'Aku perhatikan tadi waktu rapat tim, kamu sudah mengangkat tangan dua kali tapi akhirnya memilih mundur ke pojok. Rasanya kecewa ya saat idemu terlewati?',
        reply: line(
          'Iya Bu, jujur nyesek banget... sudah dua minggu ini tiap aku kasih ide hemat komponen, langsung dilewati begitu saja. Jadi kupikir ya sudahlah, diam saja di belakang.',
          'menunduk',
          'Naufal menatap komponen daur ulang di mejanya dengan lesu.',
        ),
      },
      {
        id: 't2-salah', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Kalau idemu dilewati ya terima saja, Naufal. Mungkin memang ide teman-temanmu lebih bagus dan modern.',
        reply: line(
          'Belum juga sempat kucoba jelaskan cara kerjanya, langsung dibilang kalah bagus... rasanya sama saja kayak di rapat tadi, Bu.',
          'menutup-diri',
          'Naufal menarik topinya sedikit ke bawah dan terdiam.',
        ),
      },
    ],
    t3: [
      {
        id: 't3-tepat', skillId: 'batas-kerahasiaan', best: true,
        text: 'Bawa purwarupamu ke Ruang Konsultasi yuk, Naufal—aku beneran penasaran dengar cara kerjanya sekaligus cerita unek-unekmu dengan tenang.',
        reply: line(
          'Serius Ibu mau lihat? Boleh banget Bu! Di Palu dulu aku biasa bikin alat dari komponen bekas bengkel karena beli baru mahal. Aku cuma sedih kalau kreativitasku dianggap remeh di sini.',
          'lega',
          'Naufal membawa purwarupanya dengan antusias masuk ke Ruang Konsultasi.',
        ),
      },
      {
        id: 't3-salah', skillId: 'pertanyaan-tertutup', isMisstep: true,
        text: 'Kamu nggak sedang sengaja memisahkan diri supaya nggak dapat jatah tugas proyek kan? Ayo ikut ke ruang konsultasi.',
        reply: line(
          'Bukan menghindar tugas Bu... justru aku bikin ini biar proyek kita cepat jadi dan hemat bahan! Ya sudah kita bicara di dalam deh.',
          'waspada',
          'Naufal melangkah masuk dengan ekspresi masih kecewa.',
        ),
      },
    ],
    t4: [
      {
        id: 't4-tepat', skillId: 'afirmasi-kekuatan', best: true,
        text: 'Kemampuanmu membuat purwarupa cepat dan hemat dari bahan daur ulang itu inovasi nyata, Naufal! Di dunia rekayasa, bikin prototipe uji cepat sebelum cetak final justru menghemat banyak biaya dan waktu.',
        reply: line(
          'Nah, itu maksudku Bu! Aku bukan mau ganti produk akhirnya jadi barang bekas—aku cuma mau bantu tim uji bentuk dulu pakai bahan daur ulang sebelum boros filamen mahal!',
          'tertegun',
          'Wajah Naufal bersinar terang karena idenya akhirnya dipahami utuh.',
        ),
      },
      {
        id: 't4-salah', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Di kampus kita punya anggaran filamen baru kok, jadi sebaiknya kamu berhenti pakai barang daur ulang biar tim nggak malu.',
        reply: line(
          'Bukan soal nggak mampu beli filamen baru, Bu... kalau cetak salah tiga kali kan boros waktu juga. Sedih rasanya kalau kreativitas hemat malah dianggap memalukan.',
          'menunduk',
          'Naufal meletakkan purwarupanya dengan raut patah semangat.',
        ),
      },
    ],
    t5: [
      {
        id: 't5-tepat', skillId: 'refleksi-perasaan', best: true,
        options: { reflectionNuance: 'kecewa-kesal' },
        text: 'Ternyata teman-temanmu mungkin belum sempat menangkap tujuan kerenmu soal "uji cepat hemat filamen", sementara kamu sudah terlanjur sakit hati lalu menarik diri duluan ya?',
        reply: line(
          'Bisa jadi iya, Bu! Waktu rapat aku cuma bilang "pakai barang bekas saja", mungkin mereka kira produk akhirnya jelek. Padahal kalau kutunjukkan barang jadinya langsung di meja sambil jelasin untuk tahap uji cepat, pasti mereka kaget!',
          'tersenyum',
          'Naufal tertawa kecil dan memutar purwarupa buatannya penuh semangat.',
        ),
      },
      {
        id: 't5-salah', skillId: 'interogasi', isMisstep: true,
        text: 'Kenapa dari awal kamu nggak bisa menjelaskan idemu dengan benar saat rapat? Jadi wajar kan kalau mereka mengabaikanmu?',
        reply: line(
          'Baru buka mulut dua kalimat sudah dipotong terus di rapat, gimana aku mau jelasin sampai tuntas, Bu...',
          'kesal',
          'Naufal kembali menutup diri dengan bahu menegang.',
        ),
      },
    ],
    t6: [
      {
        id: 't6-tepat', skillId: 'pertanyaan-terbuka', best: true,
        text: 'Menunjukkan langsung purwarupa uji cepatmu itu cara komunikasi yang kuat banget, Naufal! Langkah kecil apa yang mau kamu coba saat kembali ke studio nanti?',
        reply: line(
          'Aku mau taruh purwarupa daur ulang ini bareng catatan perbandingan waktu cetak 10 menit vs 4 jam, lalu tunjukkan dulu ke Hendra dan Raka sebelum rapat besar besok!',
          'tersenyum',
          'Naufal tersenyum lebar dan tampak kembali penuh gairah berkarya.',
        ),
      },
      {
        id: 't6-salah', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Simpan saja purwarupamu di tas dulu, minggu ini kerjakan saja persis perintah ketua tim tanpa perlu mengusulkan ide baru.',
        reply: line(
          'Kalau cuma jadi robot ikut perintah tanpa boleh berinovasi, rasaku makin hilang semangatnya di lab, Bu...',
          'lelah',
          'Senyum Naufal langsung redup.',
        ),
      },
    ],
    t7: [
      {
        id: 't7-tepat', skillId: 'parafrase-ringkasan', best: true,
        text: 'Demo purwarupa + data hemat waktu 10 menit vs 4 jam itu pasti bikin timmu terpukau, Naufal! Jangan padamkan jiwa inovator eksperimentalmu ya.',
        reply: line(
          'Siap Bu! Makasih banyak sudah benar-benar lihat dan hargai karyaku. Energiku langsung balik 100% buat tunjukin ke tim!',
          'lega',
          'Naufal melangkah mantap keluar ruangan sambil membawa purwarupa kebanggaannya.',
        ),
      },
      {
        id: 't7-salah', skillId: 'meremehkan', isMisstep: true,
        text: 'Ya sudah, semoga ide-ide anehmu nanti nggak bikin repot kelompok ya.',
        reply: line(
          'Baik Bu... aku permisi dulu.',
          'menunduk',
          'Naufal keluar dengan bahu turun dan menyimpan purwarupanya ke tas.',
        ),
      },
    ],
    endings: {
      terbantu: line('Makasih banyak Bu! Aku siap bawa purwarupa uji cepat dan data hemat waktunya buat ditunjukkan ke tim!', 'lega', 'Naufal kembali ke Studio Cetak 3D dengan mata berbinar.'),
      kemajuanKecil: line('Makasih ya Bu sudah dengar, aku rapikan dulu purwarupaku nanti.', 'netral', 'Naufal mengangguk pelan.'),
      menarikDiri: line('Ya sudah Bu, aku kerjakan eksperimenku sendiri saja di pojok...', 'menutup-diri', 'Naufal berjalan keluar dengan langkah lesu.'),
    },
  },

  // 16 — Farhan Pratama (Makassar · Desainer UI/UX · Perfeksionis Visual · Khawatir desainnya dianggap "cuma hiasan")
  {
    studentId: 'mhs-16',
    firstName: 'Farhan',
    title: 'Cerita Farhan Pratama',
    labSceneTitle: 'Studio Desain & Multimedia',
    labSceneCaption: 'Farhan menghapus-ulang sketsa antarmuka di pen tabletnya sambil menatap deretan monitor desain.',
    opening: line(
      'Oh, siang Bu... maaf mejaku agak penuh sketsa. Aku lagi ulang bikin tampilan layar proyek untuk keempat kalinya hari ini.',
      'lelah',
      'Farhan memutar stylus di jarinya sambil menatap layar grafis yang penuh coretan.',
    ),
    t1: [
      {
        id: 't1-tepat', skillId: 'sapaan-hangat', best: true,
        text: 'Siang juga Farhan, apa kabarmu hari ini? Tata letak sketsa antarmukamu di layar itu kelihatan bersih dan enak sekali dibaca!',
        reply: line(
          'Makasih Bu... jujur aku lagi agak capek, tapi dengar Ibu bilang enak dibaca tuh lumayan bikin napas lega. Tadi aku sempat mikir semua coretanku nggak berguna.',
          'tersenyum',
          'Farhan meletakkan stylus dan tersenyum tipis yang hangat.',
        ),
      },
      {
        id: 't1-salah', skillId: 'meremehkan', isMisstep: true,
        text: 'Ngapain sih gambar-gambar tampilan terus di Studio Desain? Anak vokasi itu yang penting alatnya jalan, bukan hiasan layar!',
        reply: line(
          'Tuh kan, Bu... persis sama kayak komentar sebagian teman di lab sebelah. Padahal antarmuka yang jelas itu yang bikin alat bisa dipakai orang dengan aman.',
          'kesal',
          'Rahang Farhan mengeras dan ia langsung mematikan layar tabletnya.',
        ),
      },
    ],
    t2: [
      {
        id: 't2-tepat', skillId: 'sampaikan-pengamatan', best: true,
        options: { observationTone: 'faktual' },
        text: 'Aku perhatikan tadi kamu sudah menghapus versi sketsa yang sebenarnya rapi itu. Ada komentar atau hal tertentu yang bikin kamu jadi ragu sama karyamu sendiri?',
        reply: line(
          'Iya Bu... kemarin pas aku presentasi desain dashboard sensor, ada yang nyeletuk "bagus sih, tapi itu kan cuma kulit luar, koding di belakangnya yang kerja keras". Sejak itu aku kepikiran terus.',
          'menunduk',
          'Farhan menunduk memandangi papan palet warna di samping monitor.',
        ),
      },
      {
        id: 't2-salah', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Makanya kamu juga harus fokus ngoding berat dong, Farhan, jangan cuma mengandalkan gambar biar nggak diremehkan!',
        reply: line(
          'Aku juga ikut bantu kode frontend kok Bu... tapi kalau tiap kali desain dianggap nomor dua, capek juga rasanya.',
          'waspada',
          'Farhan melipat tangannya di depan meja dengan raut kecewa.',
        ),
      },
    ],
    t3: [
      {
        id: 't3-tepat', skillId: 'batas-kerahasiaan', best: true,
        text: 'Kita istirahat sebentar dari layar monitor yuk—di Ruang Konsultasi kita bisa ngobrol tenang berdua tanpa terganggu suara studio.',
        reply: line(
          'Boleh banget Bu, mataku memang sudah pegal menatap layar dari pagi. Di Makassar dulu aku mulai belajar desain karena pengin bantu orang awam paham alat teknologi tanpa bingung, makanya nyesek kalau dibilang cuma hiasan.',
          'lega',
          'Farhan duduk santai di Ruang Konsultasi sambil menghela napas panjang.',
        ),
      },
      {
        id: 't3-salah', skillId: 'pertanyaan-tertutup', isMisstep: true,
        text: 'Kamu nggak cuma lagi cari alasan buat menunda revisi desain proyek kan? Ayo ikut sebentar ke dalam.',
        reply: line(
          'Nggak ada niat menunda sama sekali Bu, justru aku sudah revisi empat kali sampai lelah sendiri... oke aku ikut duduk sebentar.',
          'waspada',
          'Farhan bangkit dengan langkah terasa berat.',
        ),
      },
    ],
    t4: [
      {
        id: 't4-tepat', skillId: 'afirmasi-kekuatan', best: true,
        text: 'Merancang antarmuka yang mencegah pengguna salah tekan tombol itu bukan “cuma hiasan”, Farhan—itu bagian rekayasa keselamatan dan kemudahan pakai yang sangat penting!',
        reply: line(
          'Ya ampun Bu, kalimat itu persis banget sama yang selama ini ingin kujelaskan! Waktu sensor kelebihan arus misalnya, kalau peringatan di layarnya nggak jelas, operator bisa telat mematikan alat!',
          'tertegun',
          'Mata Farhan berbinar kembali karena nilai karyanya benar-benar dipahami.',
        ),
      },
      {
        id: 't4-salah', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Sudah lah, terima saja kenyataan bahwa di kampus teknik memang anak hardware dan koding yang paling dipuji.',
        reply: line(
          'Kalau memang begitu, buat apa ada Studio Desain di sini ya Bu... rasanya percuma aku kerja keras merapikan alur layar.',
          'menutup-diri',
          'Farhan bersandar ke belakang dengan ekspresi murung.',
        ),
      },
    ],
    t5: [
      {
        id: 't5-tepat', skillId: 'refleksi-perasaan', best: true,
        options: { reflectionNuance: 'ragu-kurang-percaya' },
        text: 'Jadi rasa ragumu kemarin muncul bukan karena desainmu kurang matang, melainkan karena ingin kontribusi fungsionalmu di proyek tim diakui setara dengan bagian kode?',
        reply: line(
          'Tepat sekali, Bu! Aku jadi sadar kalau selama ini aku cuma pamerin warna dan bentuknya pas rapat, belum pernah tunjukin uji coba langsung betapa jauh lebih cepatnya orang mengoperasikan alat pakai alur desainku.',
          'tersenyum',
          'Farhan mengangguk antusias sambil mengetuk ringan lututnya.',
        ),
      },
      {
        id: 't5-salah', skillId: 'interogasi', isMisstep: true,
        text: 'Kenapa sih kamu gampang banget goyah cuma gara-gara satu komentar teman? Berarti kamu sendiri nggak yakin sama sketsamu ya?',
        reply: line(
          'Aku yakin sama desainku kok Bu, cuma kalau tiap hari mendengar sindiran yang sama ya lama-lama capek hati juga...',
          'kesal',
          'Farhan mengerutkan kening dengan tatapan tidak nyaman.',
        ),
      },
    ],
    t6: [
      {
        id: 't6-tepat', skillId: 'pertanyaan-terbuka', best: true,
        text: 'Menunjukkan bukti uji kemudahan pakai itu cara paling elegan buat membungkam keraguan, Farhan! Langkah kecil apa yang mau kamu coba saat balik ke Studio Desain nanti?',
        reply: line(
          'Aku mau hentikan revisi berlebihan hari ini, simpan versi terbaiknya, lalu ajak satu teman dari tim firmware mencoba simulasi layar peringatan darurat biar mereka lihat langsung fungsinya!',
          'tersenyum',
          'Farhan tersenyum lebar dan tampak sangat mantap.',
        ),
      },
      {
        id: 't6-salah', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Mulai besok kamu pindah saja ke meja pengelasan dulu biar semua teman melihat kamu juga bisa kerja fisik berat.',
        reply: line(
          'Tapi keahlian utamaku memang di antarmuka dan multimedia, Bu... kalau pindah begitu proyek tim malah kehilangan yang pegang tampilan.',
          'cemas',
          'Farhan menggeleng bingung.',
        ),
      },
    ],
    t7: [
      {
        id: 't7-tepat', skillId: 'parafrase-ringkasan', best: true,
        text: 'Menyimpan versi terbaik dan mengajak uji coba langsung itu cerdas banget, Farhan! Teknologi hebat selalu butuh desainer antarmuka yang peka sepertimu.',
        reply: line(
          'Makasih banyak Bu! Kepalaku langsung plong dan semangat ngelanjutin desain di Studio Desain balik penuh lagi!',
          'lega',
          'Farhan berdiri tegak dengan senyum cerah penuh percaya diri.',
        ),
      },
      {
        id: 't7-salah', skillId: 'meremehkan', isMisstep: true,
        text: 'Oke selesai ya, ingat nanti gambarnya jangan terlalu lama biar tidak ketinggalan tim.',
        reply: line(
          'Iya Bu... permisi.',
          'menunduk',
          'Farhan melangkah keluar dengan semangat yang kembali meredup.',
        ),
      },
    ],
    endings: {
      terbantu: line('Makasih banyak Bu! Aku siap tunjukkan demo uji kemudahan pakai desain antarmukaku ke tim!', 'lega', 'Farhan kembali ke Studio Desain dengan langkah penuh semangat.'),
      kemajuanKecil: line('Makasih ya Bu sudah dengar, aku rapikan dulu satu versi desain yang paling stabil.', 'netral', 'Farhan mengangguk sopan.'),
      menarikDiri: line('Ya sudah Bu, aku lanjut revisi sendiri dulu di studio...', 'menutup-diri', 'Farhan keluar dengan wajah lesu.'),
    },
  },

  // 17 — Sekar Wulandari (Solo · Peneliti Dokumentasi · Tenang & Sistematis · Ragu saat ritme diskusi terlalu cepat)
  {
    studentId: 'mhs-17',
    firstName: 'Sekar',
    title: 'Cerita Sekar Wulandari',
    labSceneTitle: 'Pojok Baca & Riset',
    labSceneCaption: 'Sekar duduk rapi di Pojok Baca dengan tiga buku referensi bertanda pembatas warna-warni dan catatan uji mutu.',
    opening: line(
      'Selamat siang, Bu... aku baru selesai merangkum lembar uji mutu dari tiga buku referensi di Pojok Baca ini.',
      'netral',
      'Sekar merapikan pembatas bukunya dengan lembut dan menyapa ramah.',
    ),
    t1: [
      {
        id: 't1-tepat', skillId: 'sapaan-hangat', best: true,
        text: 'Siang Sekar, apa kabarmu hari ini? Rapi sekali catatan riset dan pembatas warna di bukumu—pasti sangat membantu buat pengecekan mutu praktikum!',
        reply: line(
          'Baik Bu, terima kasih... aku memang paling nyaman menyusun semuanya sistematis di ruang tenang seperti Pojok Baca ini.',
          'tersenyum',
          'Sekar tersenyum teduh sambil menutup salah satu buku referensinya pelan.',
        ),
      },
      {
        id: 't1-salah', skillId: 'meremehkan', isMisstep: true,
        text: 'Sekar, kenapa sih selalu sembunyi baca buku di pojok? Mahasiswa vokasi itu harus banyak praktik ramai-ramai, bukan jadi kutu buku!',
        reply: line(
          'Oh... maaf Bu, aku bukan menghindar praktik kok. Aku sedang mencocokkan standar keamanan rangkaian supaya alat tim nanti nggak rusak saat diuji.',
          'terkejut',
          'Sekar langsung merapatkan syal dan catatannya dengan raut agak canggung.',
        ),
      },
    ],
    t2: [
      {
        id: 't2-tepat', skillId: 'sampaikan-pengamatan', best: true,
        options: { observationTone: 'faktual' },
        text: 'Aku lihat rangkuman uji mutumu sudah sangat lengkap, tapi tadi kamu sempat bolak-balik melihat jam seperti ragu mau menyerahkannya ke kelompok?',
        reply: line(
          'Iya Bu, peka sekali... tadi pas aku mau sampaikan temuan batas tegangan dari buku ini, diskusi mereka berjalan cepat sekali. Aku jadi ragu menyela karena takut memperlambat mereka.',
          'cemas',
          'Sekar menunjuk tabel kecil yang sudah ditandai stabilo emas di bukunya.',
        ),
      },
      {
        id: 't2-salah', skillId: 'pertanyaan-tertutup', isMisstep: true,
        text: 'Kalau memang ada kesalahan tegangan kenapa tadi kamu diam saja? Kalau alatnya rusak gara-gara kamu tidak teriak, gimana?',
        reply: line(
          'Aku nggak bermaksud membiarkan alatnya rusak Bu... aku cuma belum sempat dapat celah bicara di tengah suasana ramai tadi.',
          'menunduk',
          'Wajah Sekar tampak tertekan dan merasa disalahkan.',
        ),
      },
    ],
    t3: [
      {
        id: 't3-tepat', skillId: 'batas-kerahasiaan', best: true,
        text: 'Di sini masih ada beberapa orang lalu-lalang—kita duduk sebentar di Ruang Konsultasi yuk biar kamu bisa cerita dengan tenang tanpa tergesa-gesa.',
        reply: line(
          'Terima kasih banyak Bu, suasananya teduh sekali di sini. Dari Solo dulu aku terbiasa mengecek buku dan data sampai yakin dulu sebelum bicara, jadi kadang kaget kalau rapat di kampus ritmenya serba buru-buru.',
          'lega',
          'Sekar duduk dengan postur tenang di Ruang Konsultasi.',
        ),
      },
      {
        id: 't3-salah', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Ayo kita bawa bukumu langsung ke tengah ruang praktikum sekarang juga biar kamu latihan bicara cepat di depan semua anak!',
        reply: line(
          'Duh jangan mendadak di tengah keramaian Bu, aku malah jadi gugup dan lupa poin pentingnya... boleh kita ngobrol tenang berdua dulu?',
          'cemas',
          'Sekar memeluk buku catatannya erat dengan raut gelisah.',
        ),
      },
    ],
    t4: [
      {
        id: 't4-tepat', skillId: 'validasi-normalisasi', best: true,
        text: 'Kebiasaan mengecek standar referensi sebelum bertindak itu kualitas peneliti mutu yang mahal banget, Sekar. Ritme tenangmu bukan kelemahan, justru pengaman tim dari kesalahan fatal!',
        reply: line(
          'Alhamdulillah... lega banget mendengarnya, Bu. Kadang sebagai mahasiswa baru 2026 aku sempat merasa minder karena teman lain langsung rakit cepat sementara aku masih sibuk baca buku panduan.',
          'tertegun',
          'Tatapan Sekar melembut dan bahunya terlihat jauh lebih rileks.',
        ),
      },
      {
        id: 't4-salah', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Sebagai mahasiswa baru kamu memang harus membuang kebiasaan baca buku pelan-pelan itu dan ikut gaya cepat teman-temanmu.',
        reply: line(
          'Kalau aku asal ikut cepat tanpa mengecek standar mutunya, justru takutnya banyak kesalahan kecil yang terlewat, Bu...',
          'menutup-diri',
          'Sekar menunduk pelan memandangi jemarinya.',
        ),
      },
    ],
    t5: [
      {
        id: 't5-tepat', skillId: 'refleksi-perasaan', best: true,
        options: { reflectionNuance: 'ragu-kurang-percaya' },
        text: 'Jadi kamu tetap ingin menjaga ketelitian risetmu di Pojok Baca, hanya butuh jembatan cara komunikasi yang pas supaya temuan pentingmu sampai ke tim tanpa harus beradu suara?',
        reply: line(
          'Benar sekali, Bu! Kalau aku susun jadi daftar periksa 5 poin singkat dan kutaruh di meja praktikum sebelum mereka menyalakan daya, semua orang bisa langsung baca jelas tanpa perlu rapat berisik!',
          'tersenyum',
          'Senyum Sekar berkembang cerah mendengar idenya sendiri.',
        ),
      },
      {
        id: 't5-salah', skillId: 'interogasi', isMisstep: true,
        text: 'Sebenarnya kamu memang nggak suka kerja sama dengan kelompokmu ya makanya lebih betah di Pojok Baca?',
        reply: line(
          'Aku suka kok membantu kelompokku, Bu... justru karena peduli makanya aku rela membaca tiga buku referensi biar proyek kami aman.',
          'kesal',
          'Sekar tampak sedih karena niat baiknya disalahartikan.',
        ),
      },
    ],
    t6: [
      {
        id: 't6-tepat', skillId: 'afirmasi-kekuatan', best: true,
        text: 'Daftar periksa 5 poin uji mutu itu luar biasa praktis, Sekar! Langkah kecil pertama apa yang mau kamu lakukan setelah dari sini?',
        reply: line(
          'Aku mau tulis 5 poin pengecekan tegangan dengan stabilo rapi di satu kartu, lalu kutitipkan sambil ngobrol santai 2 menit ke koordinator tim sebelum uji rangkaian dimulai!',
          'tersenyum',
          'Sekar membuka halaman kosong buku catatannya dengan penuh semangat.',
        ),
      },
      {
        id: 't6-salah', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Besok kamu tutup dulu semua bukumu dan jangan ke Pojok Baca lagi sampai akhir minggu ini.',
        reply: line(
          'Padahal Pojok Baca itu tempat paling nyaman buatku fokus dan mengisi ulang energi, Bu...',
          'lelah',
          'Sekar menggeleng pelan dengan ekspresi murung.',
        ),
      },
    ],
    t7: [
      {
        id: 't7-tepat', skillId: 'parafrase-ringkasan', best: true,
        text: 'Kartu 5 poin uji mutu + obrolan 2 menit yang tenang—elegan dan sangat sesuai dengan kekuatanmu, Sekar! Teruskan ketelitian hebatmu di Pojok Baca ya.',
        reply: line(
          'Terima kasih banyak Bu! Rasanya tenang, dihargai, dan energiku penuh kembali buat membantu tim dengan caraku sendiri.',
          'lega',
          'Sekar berdiri dengan senyum teduh yang berseri.',
        ),
      },
      {
        id: 't7-salah', skillId: 'meremehkan', isMisstep: true,
        text: 'Sudah ya, lain kali jangan terlalu kaku dan lamban seperti tadi.',
        reply: line(
          'Baik Bu... permisi.',
          'menunduk',
          'Sekar melangkah keluar perlahan dengan bahu turun.',
        ),
      },
    ],
    endings: {
      terbantu: line('Terima kasih Bu! Aku siap bawa kartu 5 poin uji mutu buat membantu tim praktikum dengan tenang.', 'lega', 'Sekar kembali ke Pojok Baca dengan senyum hangat.'),
      kemajuanKecil: line('Makasih ya Bu, aku coba rapikan catatan ringkasanku dulu pelan-pelan.', 'netral', 'Sekar mengangguk sopan.'),
      menarikDiri: line('Maaf Bu, aku kembali membaca sendiri di Pojok Baca dulu ya...', 'menutup-diri', 'Sekar pergi dengan wajah kembali tertutup.'),
    },
  },

  // 18 — Bagas Saputra (Balikpapan · Koordinator Robotika Lintas-Lab · Kelelahan menanggung proyek sendirian)
  {
    studentId: 'mhs-18',
    firstName: 'Bagas',
    title: 'Cerita Bagas Saputra',
    labSceneTitle: 'Studio Desain & Multimedia',
    labSceneCaption: 'Bagas baru saja membawa rangka robotika dari Cetak 3D ke Studio Desain sambil menyeka keringat dan menaikkan goggles ke dahi.',
    opening: line(
      'Eh, siang Bu! Aman kok, aku cuma lagi ngecek kecocokan dudukan motor dari Cetak 3D sama skema antarmuka di sini.',
      'lelah',
      'Bagas menaikkan goggles di dahinya sambil berusaha terlihat santai meski napasnya agak pendek.',
    ),
    t1: [
      {
        id: 't1-tepat', skillId: 'sapaan-hangat', best: true,
        text: 'Siang Bagas, apa kabarmu hari ini? Hebat sekali kamu bisa menghubungkan tiga stasiun sekaligus, tapi kelihatannya dari pagi belum sempat duduk istirahat ya?',
        reply: line(
          'Hehe ketahuan juga sama Ibu... iya nih, dari jam 8 tadi aku muter dari bengkel las, Cetak 3D, sampai Studio Desain. Punggung rasanya lumayan pegal.',
          'lelah',
          'Bagas mengendurkan bahunya dan menyandarkan rangka robotika ke meja.',
        ),
      },
      {
        id: 't1-salah', skillId: 'meremehkan', isMisstep: true,
        text: 'Ngapain sih mondar-mandir bawa rangka terus kayak kurang kerjaan? Bukannya anak semester atas harusnya sudah pintar mengatur waktu?',
        reply: line(
          'Aku mondar-mandir karena nyambungin modul antar-stasiun yang belum sinkron, Bu! Bukan kurang kerjaan!',
          'kesal',
          'Kening Bagas berkerut tajam dan ia langsung menggenggam rangka robotikanya lebih erat.',
        ),
      },
    ],
    t2: [
      {
        id: 't2-tepat', skillId: 'sampaikan-pengamatan', best: true,
        options: { observationTone: 'faktual' },
        text: 'Kamu jadi andalan banyak stasiun sekaligus—mulai rangka, cetak 3D, sampai koordinasi. Bagian mana yang belakangan paling menyedot tenagamu?',
        reply: line(
          'Jujur ya Bu, tiap kali ada sambungan antar-tim yang macet, mereka langsung teriak "panggil Bagas saja". Awalnya aku senang dipercaya, tapi lama-lama semuanya numpuk di pundakku sendiri.',
          'cemas',
          'Bagas menatap baut dan rangka di meja dengan raut letih.',
        ),
      },
      {
        id: 't2-salah', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Ya salahmu sendiri sok jadi pahlawan serba bisa di semua ruangan. Kalau capek ya tanggung sendiri akibatnya!',
        reply: line(
          'Aku nggak pernah niat sok jadi pahlawan kok Bu... aku cuma nggak mau proyek lintas-lab angkatan kita gagal di tengah jalan.',
          'kesal',
          'Bagas memalingkan wajahnya dengan raut kecewa.',
        ),
      },
    ],
    t3: [
      {
        id: 't3-tepat', skillId: 'batas-kerahasiaan', best: true,
        text: 'Taruh dulu rangkanya sebentar di sini, yuk kita duduk 5 menit di Ruang Konsultasi biar kamu nggak dipanggil-panggil lagi sambil kita obrolin santai.',
        reply: line(
          'Wah, kebetulan banget Bu—sebentar saja bebas dari teriakan "Gas, tolong cek ini!" rasanya surga banget! Di Balikpapan dulu aku memang anak sulung yang selalu diberesin semua urusan rumah, jadi kebawa sampai kampus.',
          'lega',
          'Bagas duduk bersandar di kursi Ruang Konsultasi dengan napas panjang yang lega.',
        ),
      },
      {
        id: 't3-salah', skillId: 'pertanyaan-tertutup', isMisstep: true,
        text: 'Proyek robotikanya nggak bakal telat gara-gara kamu capek kan? Ayo ikut ke dalam jelaskan progresnya.',
        reply: line(
          'Baru duduk sebentar sudah ditagih progres lagi... ya sudahlah Bu, kita bahas di dalam.',
          'lelah',
          'Bagas berjalan ke Ruang Konsultasi dengan bahu makin berat.',
        ),
      },
    ],
    t4: [
      {
        id: 't4-tepat', skillId: 'afirmasi-kekuatan', best: true,
        text: 'Kemampuanmu membaca gambaran besar lintas stasiun itu langka banget, Bagas! Justru seorang koordinator hebat itu bukan yang mengerjakan semua baut sendirian, melainkan yang berani mempercayakan bagian ke rekan setimnya.',
        reply: line(
          'Kena banget, Bu... selama ini aku takut kalau kulepas ke junior atau teman lain nanti hasilnya meleset, malah aku harus bongkar ulang. Tapi ternyata kalau semuanya kupegang sendiri, aku yang habis bensin duluan!',
          'tertegun',
          'Bagas mengangguk pelan, matanya terbuka lebar memahami pola dirinya.',
        ),
      },
      {
        id: 't4-salah', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Kalau memang jadi koordinator ya wajar harus kerja paling capek, Bagas—jangan mengeluh sebelum lomba selesai.',
        reply: line(
          'Aku nggak ngeluh buat kabur dari tanggung jawab kok Bu... cuma badanku juga punya batas.',
          'menutup-diri',
          'Bagas terdiam dan menatap lantai dengan wajah datar.',
        ),
      },
    ],
    t5: [
      {
        id: 't5-tepat', skillId: 'refleksi-perasaan', best: true,
        options: { reflectionNuance: 'lelah-kewalahan' },
        text: 'Di balik sosokmu yang selalu siap bantu semua orang, sebenarnya kamu takut mengecewakan ekspektasi tim sekaligus khawatir kalau melepas tugas berarti dianggap melemah ya?',
        reply: line(
          'Persis seratus persen, Bu! Aku takut kalau bilang "tolong kamu yang pegang bagian ini ya", mereka mikir aku lepas tangan. Padahal kalau kuajari caranya sekali, ke depan mereka jadi ikut jago dan aku bisa bernapas!',
          'tersenyum',
          'Senyum santai dan lega akhirnya muncul di wajah Bagas.',
        ),
      },
      {
        id: 't5-salah', skillId: 'interogasi', isMisstep: true,
        text: 'Sebenarnya kamu nggak percaya sama kemampuan teman-teman sekelasmu ya sampai semua harus kamu cek sendiri?',
        reply: line(
          'Bukan nggak percaya Bu, cuma jadwalnya mepet banget... rasanya nggak enak banget dituduh meremehkan teman sendiri.',
          'kesal',
          'Bagas kembali menegangkan bahunya.',
        ),
      },
    ],
    t6: [
      {
        id: 't6-tepat', skillId: 'pertanyaan-terbuka', best: true,
        text: 'Membagi peran sambil mengajari mereka sekali itu kepemimpinan sejati, Bagas! Bagian kecil mana yang paling aman kamu serahkan ke teman minggu ini?',
        reply: line(
          'Uji cetak dudukan 3D mau kuserahkan penuh ke Hendra & Naufal, dan pengecekan kabel antarmuka kukoordinasikan lewat Farhan—sementara aku fokus di integrasi inti saja!',
          'tersenyum',
          'Bagas tersenyum mantap sambil mengepalkan tangan ringan penuh energi.',
        ),
      },
      {
        id: 't6-salah', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Lepas saja jabatan koordinatormu hari ini juga biar nggak pusing lagi.',
        reply: line(
          'Wah jangan dilepas total juga Bu, aku sayang banget sama proyek robotika ini—cuma perlu bagi beban saja biar sehat.',
          'waspada',
          'Bagas menggeleng cepat.',
        ),
      },
    ],
    t7: [
      {
        id: 't7-tepat', skillId: 'parafrase-ringkasan', best: true,
        text: 'Pembagian peran ke Hendra, Naufal, dan Farhan itu keren banget—tim makin kompak dan energimu terjaga buat integrasi inti! Semangat terus ya, Bagas.',
        reply: line(
          'Siap Bu! Makasih banyak sudah ngajak aku berhenti sejenak dan mikir jernih. Energiku langsung penuh lagi nih!',
          'lega',
          'Bagas berdiri gagah dengan senyum cerah dan menurunkan goggles-nya santai.',
        ),
      },
      {
        id: 't7-salah', skillId: 'meremehkan', isMisstep: true,
        text: 'Ya sudah balik sana, jangan sampai proyek robotika kita kalah gara-gara kamu kecapekan.',
        reply: line(
          'Oke Bu, aku balik ke studio dulu.',
          'lelah',
          'Bagas melangkah keluar dengan bahu kembali tampak berat.',
        ),
      },
    ],
    endings: {
      terbantu: line('Makasih banyak Bu! Aku siap bagi peran dengan tim dan fokus ke integrasi inti tanpa menguras tenaga sendiri!', 'lega', 'Bagas kembali ke Studio Desain dengan senyum penuh percaya diri.'),
      kemajuanKecil: line('Makasih ya Bu, aku coba atur ulang pembagian tugasku bareng anak-anak.', 'netral', 'Bagas mengangguk sopan.'),
      menarikDiri: line('Ya sudah Bu, biar aku bereskan dulu rangkanya sendiri...', 'menutup-diri', 'Bagas keluar ruangan dengan wajah letih.'),
    },
  },
];

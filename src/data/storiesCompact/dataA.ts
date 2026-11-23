import { line, type CompactStudentScript } from './builder';

/**
 * Skrip 7-giliran · 2 pilihan (Tepat vs Salah, makin menantang tiap langkah)
 * dengan respons unik sesuai latar belakang & tipe karakter mhs-01 s.d. mhs-08.
 */
export const COMPACT_SCRIPTS_A: readonly CompactStudentScript[] = [
  // 01 — Raka Pratama (Bandung · Koordinator Perfeksionis · Anak sulung andalan keluarga)
  {
    studentId: 'mhs-01',
    firstName: 'Raka',
    title: 'Cerita Raka Pratama',
    labSceneTitle: 'Lab Elektronika & IoT',
    labSceneCaption: 'Raka berdiri di dekat papan rangkaian sensor sambil berulang kali memeriksa jadwal timnya.',
    opening: line(
      'Eh, halo Ibu! Maaf ya Bu, aku masih sempat-sempatin cek dua baris terakhir di jadwal uji sensor IoT.',
      'tersenyum',
      'Raka mengetuk-ngetuk pulpen ke papan jadwal sambil melirik jam tangannya.',
    ),
    t1: [
      {
        id: 't1-tepat', skillId: 'sapaan-hangat', best: true,
        text: 'Halo juga Raka, apa kabarmu hari ini? Kelihatannya jadwal sensor IoT-mu padat banget ya.',
        reply: line(
          'Hehe, lumayan Bu... walau jujur kepalaku mulai penuh. Baru saja kutandai tiga revisi, eh sudah ada lagi yang minta dicek.',
          'lelah',
          'Raka menghela napas pendek lalu menatap daftar tugas yang penuh coretan warna.',
        ),
      },
      {
        id: 't1-salah', skillId: 'meremehkan', isMisstep: true,
        text: 'Apa sih lihat-lihat jam terus? Kalau nggak fokus mending tidak usah pegang papan jadwal.',
        reply: line(
          'Eh... maaf Bu, nggak maksud nggak fokus kok. Aku cuma ngecek tenggat uji sensor karena semua jadwal tim ada di kertas ini...',
          'terkejut',
          'Senyum Raka langsung lenyap; ia memeluk papan jadwal ke dadanya dengan kaku.',
        ),
      },
    ],
    t2: [
      {
        id: 't2-tepat', skillId: 'sampaikan-pengamatan', best: true,
        options: { observationTone: 'faktual' },
        text: 'Aku perhatikan namamu muncul hampir di setiap baris jadwal itu. Terasa berat ya memegang banyak bagian sekaligus?',
        reply: line(
          'Ketahuan ya, Bu... iya, agak sesak rasanya. Di depan anak-anak tim aku nggak enak kelihatan kewalahan.',
          'cemas',
          'Raka merendahkan suaranya dan melirik meja teman-temannya di seberang.',
        ),
      },
      {
        id: 't2-salah', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Makanya jangan sok perfeksionis, Raka. Santai saja, hidup nggak usah dibikin ribet sendiri.',
        reply: line(
          'Aku nggak sok perfeksionis kok Bu... aku kan dipercaya jadi koordinator, masa dibiarin berantakan di lab ramai begini.',
          'kesal',
          'Raka mengerutkan kening dan menggeser bahunya menjauh.',
        ),
      },
    ],
    t3: [
      {
        id: 't3-tepat', skillId: 'batas-kerahasiaan', best: true,
        text: 'Kita ngobrol berdua di Ruang Konsultasi yuk, biar kamu bisa tarik napas tenang tanpa didengar anak tim.',
        reply: line(
          'Nah, di sini jauh lebih lega, Bu. Terima kasih sudah jaga privasiku. Jujur... hampir semua bagian debug sensor akhirnya aku kerjakan sendiri tiap malam.',
          'lega',
          'Raka duduk di kursi konseling dan meletakkan pulpennya di meja.',
        ),
      },
      {
        id: 't3-salah', skillId: 'pertanyaan-tertutup', isMisstep: true,
        text: 'Di sini saja nggak apa-apa, bilang langsung siapa anggota timmu yang paling malas biar cepat kubereskan.',
        reply: line(
          'Duh jangan di sini, Bu... teman-temanku nggak malas kok. Kalau begitu kita pindah ke ruang belakang saja deh biar nggak salah paham.',
          'waspada',
          'Raka segera melipat kertas jadwalnya dengan gelisah sambil berjalan ke Ruang Konsultasi.',
        ),
      },
    ],
    t4: [
      {
        id: 't4-tepat', skillId: 'refleksi-perasaan', best: true,
        options: { reflectionNuance: 'lelah-kewalahan' },
        text: 'Kedengarannya kamu sangat menjaga kepercayaan tim, tapi di balik itu ada rasa takut kalau proyeknya gagal saat dilepas ke orang lain.',
        reply: line(
          'Persis banget, Bu! Dari dulu di rumah aku anak sulung yang selalu jadi andalan. Rasanya kalau sampai demo proyek error, semua bakal kecewa padaku.',
          'menunduk',
          'Raka menarik napas panjang; bahunya akhirnya sedikit mengendur.',
        ),
      },
      {
        id: 't4-salah', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Ya sudah, kalau takut capek langsung saja lempar setengah tugasnya ke temanmu besok tanpa perlu kamu cek lagi.',
        reply: line(
          'Kalau dilepas mentah-mentah tanpa arah ya tetap saja aku kepikiran terus, Bu... aku tuh bukan nggak mau bagi, cuma takut hasilnya malah rusak.',
          'cemas',
          'Raka mengusap tengkuknya dengan ekspresi makin bingung.',
        ),
      },
    ],
    t5: [
      {
        id: 't5-tepat', skillId: 'validasi-normalisasi', best: true,
        text: 'Beban jadi anak sulung sekaligus koordinator memang besar sekali. Menurutmu, apakah berbagi tugas yang jelas artinya kamu gagal jadi pemimpin?',
        reply: line(
          'Hmm... kalau dipikir lagi, justru kalau aku tumbang sebelum demo, proyeknya malah berhenti total ya Bu. Teman-teman sebenarnya mau bantu kalau tahu bagiannya.',
          'tertegun',
          'Mata Raka berbinar pelan seolah baru menemukan sudut pandang baru.',
        ),
      },
      {
        id: 't5-salah', skillId: 'interogasi', isMisstep: true,
        text: 'Kenapa kamu tidak percaya kemampuan teman-temanmu sendiri? Bukannya kalian satu angkatan dan belajar materi yang sama?',
        reply: line(
          'Bukan nggak percaya, Bu... aku cuma nggak mau mereka ikut disalahkan kalau ada rangkaian yang kebakar. Rasanya kayak aku yang dituduh egois deh.',
          'menutup-diri',
          'Raka menunduk dan jari-jarinya mengetuk tepi meja dengan gelisah.',
        ),
      },
    ],
    t6: [
      {
        id: 't6-tepat', skillId: 'afirmasi-kekuatan', best: true,
        text: 'Raka, ketelitianmu merancang jadwal dan mendiagnosis sensor itu luar biasa. Kira-kira satu tugas kecil apa yang paling aman kamu percayakan ke teman sambil tetap kamu dampingi?',
        reply: line(
          'Aku bisa serahkan uji tegangan sensor dasar ke Dimas sambil kukasih catatan ceklist singkat, Bu. Jadi aku cuma bantu verifikasi akhir dan bisa tidur lebih awal.',
          'tersenyum',
          'Raka membuka kembali papan jadwalnya dan melingkari satu kolom dengan rapi.',
        ),
      },
      {
        id: 't6-salah', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Mulai sore ini saya wajibkan kamu mundur saja dari posisi koordinator biar nggak stres lagi.',
        reply: line(
          'Lho, jangan langsung dicopot dong Bu... aku kan masih sayang banget sama proyek sensor IoT ini, cuma butuh cara bagi kerja yang lebih sehat.',
          'terkejut',
          'Raka menggeleng pelan dengan raut kecewa.',
        ),
      },
    ],
    t7: [
      {
        id: 't7-tepat', skillId: 'parafrase-ringkasan', best: true,
        text: 'Rencana ceklist bersama Dimas itu cerdas sekali, Raka. Jangan lupa seduh kopi pagi dan jaga energimu juga ya—kamu nggak harus memikul semuanya sendirian.',
        reply: line(
          'Siap Bu! Rasanya enteng banget setelah ngobrol begini. Aku balik ke lab dengan kepala jauh lebih jernih ya, Bu!',
          'lega',
          'Raka berdiri tegap dengan senyum hangat dan langkah penuh semangat.',
        ),
      },
      {
        id: 't7-salah', skillId: 'meremehkan', isMisstep: true,
        text: 'Ya sudah waktunya habis, pokoknya besok jangan mengeluh capek lagi di lab ya.',
        reply: line(
          'Iya Bu... maaf sudah merepotkan waktunya. Aku permisi dulu.',
          'menunduk',
          'Raka pergi dengan senyum tipis yang terasa dipaksakan.',
        ),
      },
    ],
    endings: {
      terbantu: line('Terima kasih banyak Bu! Sekarang aku siap bagi peran sensor dengan tenang dan tetap jaga energi.', 'lega', 'Raka kembali ke Lab Elektronika sambil tersenyum cerah.'),
      kemajuanKecil: line('Makasih ya Bu, aku coba pelan-pelan atur ulang jadwalku nanti.', 'netral', 'Raka merapikan catatan jadwalnya sambil berpikir.'),
      menarikDiri: line('Maaf Bu, sepertinya aku bereskan sendiri dulu di lab...', 'menutup-diri', 'Raka keluar ruangan dengan bahu masih tegang.'),
    },
  },

  // 02 — Dimas Aditya (Semarang · Pendiam & Penjaga Harga Diri · Perantau hemat kerja paruh waktu)
  {
    studentId: 'mhs-02',
    firstName: 'Dimas',
    title: 'Cerita Dimas Aditya',
    labSceneTitle: 'Lab Elektronika & IoT',
    labSceneCaption: 'Dimas duduk tenang memakai headset sambil menyolder komponen SMD sangat rapat di sudut meja.',
    opening: line(
      'Eh... halo Bu. Maaf nggak dengar Ibu datang tadi, headset-ku lagi nyala pelan.',
      'terkejut',
      'Dimas cepat-cepat melepas satu sisi headset dan membalik layar ponselnya ke meja.',
    ),
    t1: [
      {
        id: 't1-tepat', skillId: 'sapaan-hangat', best: true,
        text: 'Halo juga Dimas, santai saja. Apa kabarmu hari ini? Rapi sekali hasil solderan SMD-mu.',
        reply: line(
          'Baik kok Bu... makasih sudah bilang begitu. Cuma agak ngantuk sedikit saja hari ini, hehehe.',
          'lelah',
          'Dimas menggosok matanya pelan lalu tersenyum sungkan.',
        ),
      },
      {
        id: 't1-salah', skillId: 'meremehkan', isMisstep: true,
        text: 'Ngapain pakai headset di lab? Lihat-lihat layar HP terus, memang nggak niat praktikum ya?',
        reply: line(
          'Nggak Bu, aku lagi praktikum kok... tadi cuma ada pesan sebentar. Maaf ya Bu.',
          'menutup-diri',
          'Wajah Dimas memerah menahan malu; ia langsung merapikan kabel headset-nya.',
        ),
      },
    ],
    t2: [
      {
        id: 't2-tepat', skillId: 'sampaikan-pengamatan', best: true,
        options: { observationTone: 'faktual' },
        text: 'Kelihatannya kamu tetap tekun menyolder meski matamu kelihatan kurang tidur. Lagi banyak hal yang kamu kejar belakangan ini?',
        reply: line(
          'Iya Bu, sedikit... jadwal kuliah dan urusan di luar agak mepet minggu ini. Tapi nggak enak cerita di sini, banyak teman sebelah.',
          'cemas',
          'Dimas melirik sekilas ke meja sebelah lalu menunduk.',
        ),
      },
      {
        id: 't2-salah', skillId: 'pertanyaan-tertutup', isMisstep: true,
        text: 'Kamu begadang main game ya semalam sampai kelihatan lemas begini?',
        reply: line(
          'Bukan main game kok Bu... aku nggak sempat main game sama sekali belakangan ini.',
          'kesal',
          'Dimas menarik napas pendek dan menggenggam ujung solder dengan kaku.',
        ),
      },
    ],
    t3: [
      {
        id: 't3-tepat', skillId: 'batas-kerahasiaan', best: true,
        text: 'Kalau berkenan, kita ngobrol sebentar di Ruang Konsultasi yuk. Cuma berdua, aman dan tidak ada teman yang mendengar.',
        reply: line(
          'Makasih Bu... aku memang paling canggung kalau urusan pribadi terdengar anak lab. Jujur, aku lagi kerja paruh waktu malam biar bisa bayar kos dan bantu rumah di Semarang.',
          'lega',
          'Di Ruang Konsultasi, bahu Dimas turun perlahan dan suaranya terdengar lebih jujur.',
        ),
      },
      {
        id: 't3-salah', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Tidak usah malu, cerita saja di depan meja ini. Teman-temanmu kan pasti maklum kalau kamu lagi ada masalah.',
        reply: line(
          'Jangan di sini dong Bu, aku beneran nggak nyaman... kalau mau ngobrol mending di ruangan tertutup saja ya Bu.',
          'waspada',
          'Dimas tampak sangat sungkan saat akhirnya melangkah ke Ruang Konsultasi.',
        ),
      },
    ],
    t4: [
      {
        id: 't4-tepat', skillId: 'validasi-normalisasi', best: true,
        text: 'Bekerja malam sambil kuliah vokasi dan membantu keluarga di Semarang itu perjuangan besar, Dimas. Wajar sekali kalau tenagamu ikut terkuras.',
        reply: line(
          'Makasih Bu sudah menghargai itu... aku takut banget teman-teman mengira aku malas atau kurang mampu kalau tahu aku ngos-ngosan soal biaya kos.',
          'menunduk',
          'Dimas memutar tali tasnya pelan dengan mata sedikit berkaca-kaca.',
        ),
      },
      {
        id: 't4-salah', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Kalau memang berat soal biaya kos, bilang saja terbuka ke grup kelas biar teman-teman bisa patungan bantu kamu.',
        reply: line(
          'Jangan Bu! Aku nggak mau dikasihani teman-teman... aku masih sanggup berusaha sendiri kok, cuma lagi capek bagi waktunya saja.',
          'kesal',
          'Dimas langsung menegakkan badan; harga dirinya terasa tersentuh.',
        ),
      },
    ],
    t5: [
      {
        id: 't5-tepat', skillId: 'refleksi-perasaan', best: true,
        options: { reflectionNuance: 'tertekan-cemas' },
        text: 'Kamu sangat menjaga kemandirian dan tidak ingin dikasihani, tapi memendam semuanya sendirian juga bikin energimu makin menipis ya?',
        reply: line(
          'Iya Bu... tepat banget. Aku nggak butuh dikasihani, cuma pengin tahu apakah ada jadwal lab atau beasiswa resmi yang bisa kuurus dengan terhormat.',
          'tertegun',
          'Dimas menatap konselor dengan tatapan lega karena merasa dipahami.',
        ),
      },
      {
        id: 't5-salah', skillId: 'interogasi', isMisstep: true,
        text: 'Kenapa sih kamu terlalu gengsi? Kalau memang belum kuat kerja sambil kuliah, bukannya lebih baik berhenti kerja saja?',
        reply: line(
          'Bukan soal gengsi Bu... kalau aku berhenti kerja, biaya kos bulan depan mau dibayar pakai apa? Rasanya nggak semudah itu.',
          'menutup-diri',
          'Dimas memalingkan pandangannya ke arah lantai.',
        ),
      },
    ],
    t6: [
      {
        id: 't6-tepat', skillId: 'afirmasi-kekuatan', best: true,
        text: 'Ketekunanmu menyolder komponen SMD itu jarang ada yang menandingi. Mau kita cek bareng info asisten lab berhonor yang sesuai keahlianmu, jadi waktumu tetap aman?',
        reply: line(
          'Wah, asisten lab berhonor? Kalau itu pakai kemampuan solderku sendiri, aku mau banget daftar Bu! Jadi nggak usah kerja sampai lewat tengah malam lagi.',
          'tersenyum',
          'Wajah Dimas langsung cerah dan ia mencatat pengingat di ponselnya.',
        ),
      },
      {
        id: 't6-salah', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Pokoknya minggu ini kamu harus masuk tepat waktu tanpa ngantuk, urusan kerjamu jangan dibawa ke nilai praktikum.',
        reply: line(
          'Iya Bu, aku juga tahu kok soal nilai... aku cuma berharap ada jalan tengahnya saja.',
          'lelah',
          'Dimas mengangguk pelan dengan bahu kembali turun.',
        ),
      },
    ],
    t7: [
      {
        id: 't7-tepat', skillId: 'parafrase-ringkasan', best: true,
        text: 'Nanti aku kirimkan berkas pendaftarannya secara pribadi ya, Dimas. Istirahat sebentar dan dengarkan musik santai dulu sebelum lanjut menyolder.',
        reply: line(
          'Siap Bu, terima kasih banyak sudah menjaga rahasiaku dan nggak menghakimi. Rasanya jauh lebih tenang sekarang!',
          'lega',
          'Dimas tersenyum tulus dan melangkah keluar dengan lebih ringan.',
        ),
      },
      {
        id: 't7-salah', skillId: 'meremehkan', isMisstep: true,
        text: 'Sudah ya, lain kali kalau mengantuk jangan sembunyi di pojok meja terus.',
        reply: line(
          'Baik Bu, permisi.',
          'menunduk',
          'Dimas beranjak pelan dengan raut wajah kembali murung.',
        ),
      },
    ],
    endings: {
      terbantu: line('Makasih banyak Bu, sekarang aku punya rencana yang tetap menjaga harga diriku dan jadwalku!', 'lega', 'Dimas kembali ke stasiun solder dengan penuh percaya diri.'),
      kemajuanKecil: line('Makasih ya Bu sudah dengar, aku coba atur jadwal istirahatku dulu.', 'netral', 'Dimas mengangguk singkat sebelum kembali ke lab.'),
      menarikDiri: line('Maaf Bu, aku lanjut kerjakan tugasku sendiri saja dulu...', 'menutup-diri', 'Dimas melangkah keluar sambil memasang headset-nya lagi.'),
    },
  },

  // 03 — Tania Wijaya (Medan · Mentor Sabar · Bimbang asisten riset vs lulus cepat)
  {
    studentId: 'mhs-03',
    firstName: 'Tania',
    title: 'Cerita Tania Wijaya',
    labSceneTitle: 'Lab Elektronika & IoT',
    labSceneCaption: 'Tania baru selesai membantu adik tingkat membaca layar osiloskop, lalu terdiam menatap berkas pendaftaran di tasnya.',
    opening: line(
      'Halo Bu! Barusan aku bantu junior kalibrasi osiloskop, jadi agak telat membereskan berkasku sendiri.',
      'tersenyum',
      'Tania menyelipkan amplop berkas lamaran ke sela buku catatannya dengan agak ragu.',
    ),
    t1: [
      {
        id: 't1-tepat', skillId: 'sapaan-hangat', best: true,
        text: 'Halo Tania, apa kabarmu hari ini? Kamu memang selalu sabar banget kalau membimbing adik tingkat.',
        reply: line(
          'Hehe, terima kasih Bu! Senang sih lihat mereka paham... cuma begitu mereka pulang, kepalaku balik mikirin keputusanku sendiri.',
          'lelah',
          'Tania menatap amplop berkas di tangannya sambil menghela napas pelan.',
        ),
      },
      {
        id: 't1-salah', skillId: 'meremehkan', isMisstep: true,
        text: 'Ngapain sih urusin junior terus? Tugas akhirmu sendiri saja belum tentu beres.',
        reply: line(
          'Oh... maaf Bu. Tadi mereka bingung pakai osiloskop, aku cuma bantu sebentar sebelum balik ke berkasku.',
          'terkejut',
          'Senyum hangat Tania memudar dan ia langsung menunduk.',
        ),
      },
    ],
    t2: [
      {
        id: 't2-tepat', skillId: 'sampaikan-pengamatan', best: true,
        options: { observationTone: 'faktual' },
        text: 'Dari tadi kulihat kamu beberapa kali membuka lalu menutup amplop berkas itu. Lagi ada pilihan besar yang bikin bimbang ya?',
        reply: line(
          'Iya Bu, pas banget... aku lagi bingung banget soal tawaran asisten riset. Boleh ngobrol di tempat agak sepi?',
          'cemas',
          'Tania menggenggam buku catatannya dengan kedua tangan.',
        ),
      },
      {
        id: 't2-salah', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Kalau amplopnya cuma dipegang-pegang terus nggak bakal selesai, Tania. Langsung putuskan sekarang saja.',
        reply: line(
          'Justru karena ini menyangkut masa depanku dan orang tua, aku nggak bisa asal pilih dalam lima menit, Bu...',
          'waspada',
          'Tania mengerutkan dahi sambil memeluk berkasnya.',
        ),
      },
    ],
    t3: [
      {
        id: 't3-tepat', skillId: 'batas-kerahasiaan', best: true,
        text: 'Tentu boleh, kita pindah ke Ruang Konsultasi yuk biar bisa menimbang semuanya dengan tenang berdua.',
        reply: line(
          'Terima kasih Bu, di sini adem banget. Jadi begini... aku ditawari jadi asisten riset laboratorium, tapi keluarga di Medan berharap aku segera lulus cepat dan kerja tetap.',
          'lega',
          'Tania duduk dengan tenang dan meletakkan dua lembar jadwal berdampingan.',
        ),
      },
      {
        id: 't3-salah', skillId: 'janji-mutlak', isMisstep: true,
        text: 'Ayo masuk saja, nanti Ibu langsung pilihkan jalur mana yang paling pasti bikin kamu sukses.',
        reply: line(
          'Eh, sebenarnya aku ingin menimbangnya sendiri juga Bu, bukan cuma ikut disuruh... tapi oke, kita duduk di dalam dulu ya.',
          'cemas',
          'Tania ikut masuk ke Ruang Konsultasi dengan langkah agak ragu.',
        ),
      },
    ],
    t4: [
      {
        id: 't4-tepat', skillId: 'refleksi-perasaan', best: true,
        options: { reflectionNuance: 'ragu-kurang-percaya' },
        text: 'Kamu sangat menikmati dunia riset dan membimbing di lab, tapi di sisi lain juga tidak ingin mengecewakan harapan keluarga di Medan ya?',
        reply: line(
          'Iya Bu, terasa ketarik ke dua arah! Aku suka banget riset dan ngajar junior, tapi setiap telepon rumah, Mama selalu tanya kapan wisuda.',
          'menunduk',
          'Tania menatap ujung pulpennya dengan sorot mata penuh pertimbangan.',
        ),
      },
      {
        id: 't4-salah', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Sudah ikuti saja kata orang tuamu, lulus cepat itu selalu lebih aman daripada menunda demi riset.',
        reply: line(
          'Tapi kalau aku langsung menolak tanpa menimbang peluang riset ini, aku takut malah menyesal nanti, Bu...',
          'cemas',
          'Tania tampak makin terjepit dan tidak didengarkan.',
        ),
      },
    ],
    t5: [
      {
        id: 't5-tepat', skillId: 'pertanyaan-terbuka', best: true,
        text: 'Menurutmu sendiri, kalau kamu menuliskan kelebihan dan risiko dari kedua pilihan itu—plus kemungkinan menjalaninya dengan batas waktu jelas—apa yang paling penting buatmu?',
        reply: line(
          'Wah... aku belum pernah tanya ke koordinator riset apakah jadwal asistennya bisa jalan bareng penyusunan tugas akhir tanpa molor semester! Kalau bisa, dua-duanya terjawab dong Bu!',
          'tertegun',
          'Wajah Tania langsung cerah saat melihat kemungkinan baru.',
        ),
      },
      {
        id: 't5-salah', skillId: 'interogasi', isMisstep: true,
        text: 'Kamu kan senior angkatan 2023, masa mengambil keputusan karier begini saja masih ragu-ragu seperti mahasiswa baru?',
        reply: line(
          'Senior juga manusia kan Bu... justru karena sudah di ujung kuliah, salah pilih sedikit saja rasanya besar sekali dampaknya.',
          'menutup-diri',
          'Tania menurunkan tatapannya dengan ekspresi terluka.',
        ),
      },
    ],
    t6: [
      {
        id: 't6-tepat', skillId: 'afirmasi-kekuatan', best: true,
        text: 'Caramu berpikir terstruktur dan sabar adalah kekuatan besarmu, Tania. Langkah kecil apa yang ingin kamu coba duluan minggu ini?',
        reply: line(
          'Aku mau bikin daftar 3 pertanyaan soal jam kerja untuk ketua lab riset besok, lalu telepon Mama sambil bawa info yang jelas—bukan cuma cerita kebingungan.',
          'tersenyum',
          'Tania menulis tiga poin rapi di buku catatannya.',
        ),
      },
      {
        id: 't6-salah', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Besok pagi langsung kumpulkan surat pengunduran diri dari tawaran riset saja supaya pikiranmu kosong.',
        reply: line(
          'Duh Bu, rasanya terlalu terburu-buru kalau langsung menolak sebelum kutanya detail jam kerjanya...',
          'waspada',
          'Tania menutup buku catatannya perlahan.',
        ),
      },
    ],
    t7: [
      {
        id: 't7-tepat', skillId: 'parafrase-ringkasan', best: true,
        text: 'Langkah yang matang sekali, Tania! Seduh teh melati hangat dulu ya biar tenang, dan apa pun keputusanmu nanti, itu pilihan sadar terbaik darimu.',
        reply: line(
          'Makasih banyak Bu! Senang sekali nggak dipaksa memilih, malah jadi ketemu jalan keluarnya sendiri. Aku kembali ke lab ya!',
          'lega',
          'Tania tersenyum hangat dengan energi yang kembali penuh.',
        ),
      },
      {
        id: 't7-salah', skillId: 'meremehkan', isMisstep: true,
        text: 'Oke selesai ya, lain kali tidak usah terlalu dipikirkan hal-hal kecil begini.',
        reply: line(
          'Buatku ini cukup besar sih Bu... tapi terima kasih waktunya, aku permisi dulu.',
          'menunduk',
          'Tania melangkah keluar dengan perasaan menggantung.',
        ),
      },
    ],
    endings: {
      terbantu: line('Terima kasih Bu! Sekarang kepalaku jauh lebih jernih untuk menimbang tawaran riset dan rencana wisudaku.', 'lega', 'Tania berjalan keluar sambil membawa buku catatannya dengan mantap.'),
      kemajuanKecil: line('Makasih ya Bu, aku masih perlu merenung sebentar lagi sebelum memutuskan.', 'netral', 'Tania mengangguk sopan.'),
      menarikDiri: line('Sepertinya aku perlu memikirkan ini sendiri saja dulu, Bu...', 'menutup-diri', 'Tania keluar ruangan dengan langkah lesu.'),
    },
  },

  // 04 — Kevin Gunawan (Jakarta · Analitis & Standar Tinggi · Kompetitif, bangga mutu kode)
  {
    studentId: 'mhs-04',
    firstName: 'Kevin',
    title: 'Cerita Kevin Gunawan',
    labSceneTitle: 'Lab Pemrograman & MCU',
    labSceneCaption: 'Kevin mengetik cepat di depan layar kode sambil sesekali mendecak melihat hasil kompilasi timnya.',
    opening: line(
      'Siang Bu. Bentar ya, aku lagi perbaiki fungsi interrupt yang barusan dibikin asal-asalan sama anak lain.',
      'kesal',
      'Kevin mengetuk tombol keyboard cukup keras sambil menatap tajam baris kode di monitor.',
    ),
    t1: [
      {
        id: 't1-tepat', skillId: 'sapaan-hangat', best: true,
        text: 'Siang Kevin, apa kabarmu hari ini? Kelihatannya kamu lagi serius banget ngebut optimasi kode ya.',
        reply: line(
          'Lumayan panas sih kepalaku Bu. Aku cuma jaga biar sistem mikrokontrolernya nggak crash pas demo, eh malah dianggap galak.',
          'kesal',
          'Kevin menyandarkan punggung ke kursi dan menghela napas.',
        ),
      },
      {
        id: 't1-salah', skillId: 'meremehkan', isMisstep: true,
        text: 'Kamu ini kenapa sih mukanya cemberut terus? Pantas saja teman-temanmu takut dekat-dekat.',
        reply: line(
          'Lho, Ibu langsung nuduh begitu? Aku kan lagi serius beresin bug berat, bukan cari ribut!',
          'kesal',
          'Kevin langsung menatap tajam dengan rahang mengeras.',
        ),
      },
    ],
    t2: [
      {
        id: 't2-tepat', skillId: 'sampaikan-pengamatan', best: true,
        options: { observationTone: 'faktual' },
        text: 'Aku lihat kamu peduli sekali supaya kodenya bersih tanpa memori bocor, tapi suasana dengan tim jadi ikut tegang ya?',
        reply: line(
          'Iya Bu, itu masalahnya! Aku beneran peduli kualitas kode, cuma tadi pas diskusi suaraku agak tinggi dan anak-anak langsung pada diam.',
          'waspada',
          'Kevin melirik kursi sebelah yang sekarang kosong.',
        ),
      },
      {
        id: 't2-salah', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Kalau nggak bisa kerja sama, mending kamu kerjakan proyek individu saja daripada bikin keributan.',
        reply: line(
          'Bukan nggak bisa kerja sama Bu, aku cuma nggak mau kualitas proyek ini turun! Jangan langsung disuruh pisah dong.',
          'kesal',
          'Kevin melipat kedua tangannya di dada.',
        ),
      },
    ],
    t3: [
      {
        id: 't3-tepat', skillId: 'batas-kerahasiaan', best: true,
        text: 'Kita pindah sebentar ke Ruang Konsultasi yuk, biar enak ngobrol santai soal tim tanpa bikin canggung di depan anak lain.',
        reply: line(
          'Oke Bu, boleh. Di sini lebih enak. Jujur, dari SMA aku terbiasa ikut lomba coding di Jakarta—kalau ada bug, langsung dikritik keras biar cepat benar.',
          'netral',
          'Kevin duduk di Ruang Konsultasi dengan sikap lebih terbuka.',
        ),
      },
      {
        id: 't3-salah', skillId: 'pertanyaan-tertutup', isMisstep: true,
        text: 'Sekarang juga kamu harus minta maaf ke teman sebelahmu di depan semua orang dulu baru kita bicara.',
        reply: line(
          'Hah? Disuruh minta maaf di depan umum sebelum aku cerita duduk perkaranya? Ya sudahlah, kita bicara di ruangan belakang saja deh Bu.',
          'kesal',
          'Kevin berdiri dengan enggan menuju Ruang Konsultasi.',
        ),
      },
    ],
    t4: [
      {
        id: 't4-tepat', skillId: 'afirmasi-kekuatan', best: true,
        text: 'Standar tinggimu dan semangat kompetitifmu itu sebenarnya aset besar buat tim, Kevin. Yang jadi tantangan sekarang, bagaimana niat baik itu sampai tanpa membuat teman merasa diserang?',
        reply: line(
          'Nah, baru kali ini ada yang paham niatku bukan mau pamer, Bu! Aku tuh beneran cuma takut sistemnya error pas presentasi, tapi caraku ngomong kadang terlalu tajam ya...',
          'tertegun',
          'Ekspresi defensif Kevin perlahan melunak.',
        ),
      },
      {
        id: 't4-salah', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Kamu harus turunkan standar kodemu saja, Kevin. Jangan terlalu ambisius biar teman-teman yang lain tidak merasa tertinggal.',
        reply: line(
          'Masa standar mutu malah disuruh turun sih Bu? Kalau proyeknya gagal gara-gara bug dibiarkan, nanti seluruh tim juga yang rugi kan!',
          'kesal',
          'Kevin menggeleng tegas dengan wajah kecewa.',
        ),
      },
    ],
    t5: [
      {
        id: 't5-tepat', skillId: 'refleksi-perasaan', best: true,
        options: { reflectionNuance: 'kecewa-kesal' },
        text: 'Jadi di balik gaya bicaramu yang keras, kamu sebenarnya ingin tim ini tampil maksimal—tapi justru merasa kesepian saat teman-teman mulai menjauh?',
        reply: line(
          'Jujur... iya, Bu. Rasanya nggak enak juga waktu sadar meja sebelah mendadak sepi gara-gara komentarku tadi. Padahal tanpa mereka, bagian mekanik dan UI juga nggak bakal jadi.',
          'menunduk',
          'Suara Kevin melunak; ia mengakui hal yang jarang ia ucapkan.',
        ),
      },
      {
        id: 't5-salah', skillId: 'interogasi', isMisstep: true,
        text: 'Coba jujur, kamu sebenarnya meremehkan kemampuan teman-temanmu yang tidak secepat kamu kan?',
        reply: line(
          'Nggak begitu Bu! Kalau meremehkan, buat apa aku capek-capek periksa kode mereka? Percuma deh aku jelaskan kalau tetap dicap sombong.',
          'menutup-diri',
          'Kevin kembali menutup diri dan membuang muka.',
        ),
      },
    ],
    t6: [
      {
        id: 't6-tepat', skillId: 'pertanyaan-terbuka', best: true,
        text: 'Dengan standar kodenya yang tetap tajam, cara memberi masukan seperti apa yang bisa kamu coba saat review kode bareng tim nanti?',
        reply: line(
          'Aku bisa mulai dengan bilang bagian mana yang sudah jalan dulu, lalu fokus bahas baris kodenya—bukan nyindir orangnya. Terutama ke Gilang dan Mita nanti.',
          'tersenyum',
          'Kevin mengangguk mantap sambil tersenyum tipis.',
        ),
      },
      {
        id: 't6-salah', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Kalau begitu selama seminggu ini kamu dilarang mengomentari pekerjaan siapa pun di lab ya.',
        reply: line(
          'Kalau dilarang kasih masukan teknis sama sekali, proyeknya malah macet dong Bu...',
          'waspada',
          'Kevin mengerutkan kening tak sepakat.',
        ),
      },
    ],
    t7: [
      {
        id: 't7-tepat', skillId: 'parafrase-ringkasan', best: true,
        text: 'Keren, Kevin! Standar kodemu tetap juara, dan timmu pasti jauh lebih semangat menerima review yang fokus ke solusi. Selamat lanjut ngoding!',
        reply: line(
          'Siap Bu! Makasih ya sudah menghargai standar kerjaku sekaligus ngingetin cara nyampeinnya. Aku balik ke lab buat ngajak ngobrol tim dengan lebih santai!',
          'lega',
          'Kevin tersenyum lepas dan melangkah penuh energi kembali ke Lab Pemrograman.',
        ),
      },
      {
        id: 't7-salah', skillId: 'meremehkan', isMisstep: true,
        text: 'Sudah ya, semoga sifat keras kepalamu cepat berubah.',
        reply: line(
          'Hm... oke Bu, permisi.',
          'kesal',
          'Kevin keluar ruangan dengan raut wajah kembali dingin.',
        ),
      },
    ],
    endings: {
      terbantu: line('Makasih banyak Bu! Standar kode tetap jalan, tapi sekarang aku tahu cara nyampein masukan biar tim tetap solid.', 'lega', 'Kevin kembali ke lab dengan senyum ramah.'),
      kemajuanKecil: line('Oke Bu, aku coba agak pelanin nada bicaraku nanti di lab.', 'netral', 'Kevin mengangguk singkat.'),
      menarikDiri: line('Ya sudahlah Bu, aku balik ngoding sendiri saja.', 'menutup-diri', 'Kevin pergi dengan ekspresi tegang.'),
    },
  },

  // 05 — Ayu Permata (Denpasar · Kreatif & Berjiwa Visual · Keluarga perajin seni, cinta desain UI)
  {
    studentId: 'mhs-05',
    firstName: 'Ayu',
    title: 'Cerita Ayu Permata',
    labSceneTitle: 'Lab Pemrograman & MCU',
    labSceneCaption: 'Ayu menutup tab sketsa antarmuka visual telemetri di laptopnya setiap kali ada orang lewat di belakangnya.',
    opening: line(
      'Halo Bu! Eh, aku lagi ngecek grafik data uji kok Bu, cuma sekalian merapikan tampilannya sedikit.',
      'tersenyum',
      'Ayu buru-buru mengecilkan jendela sketsa desain UI di sudut layar laptopnya.',
    ),
    t1: [
      {
        id: 't1-tepat', skillId: 'sapaan-hangat', best: true,
        text: 'Halo juga Ayu, apa kabarmu hari ini? Wah, sekilas tadi tampilan desain telemetrimu kelihatan rapi dan enak dilihat banget lho.',
        reply: line(
          'Eh, beneran Bu? Makasih banget! Aku takut kelihatan kayak main-main menggambar pas teman-teman lain lagi sibuk coding berat.',
          'lega',
          'Senyum Ayu merekah meski tangannya masih ragu di atas touchpad.',
        ),
      },
      {
        id: 't1-salah', skillId: 'meremehkan', isMisstep: true,
        text: 'Ngapain sih gambar-gambar warna begitu di lab teknik? Ini bukan kelas seni lho, Ayu.',
        reply: line(
          'Oh... maaf Bu, aku cuma bikin tampilan grafik sensor biar gampang dibaca. Langsung kututup deh.',
          'menunduk',
          'Ayu langsung menutup tab desainnya dengan wajah murung.',
        ),
      },
    ],
    t2: [
      {
        id: 't2-tepat', skillId: 'sampaikan-pengamatan', best: true,
        options: { observationTone: 'faktual' },
        text: 'Aku perhatikan kamu sering menutup layar desainmu begitu ada yang lewat. Ada kekhawatiran soal minat desainmu di jurusan vokasi ini?',
        reply: line(
          'Iya Bu... jujur aku sering ragu sendiri. Boleh kita ngobrol sebentar di ruang belakang biar lebih leluasa?',
          'cemas',
          'Ayu merapikan buku sketsa kecil di samping laptopnya.',
        ),
      },
      {
        id: 't2-salah', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Kalau memang lebih suka menggambar, kenapa dulu nggak masuk jurusan seni saja sekalian?',
        reply: line(
          'Aku juga suka teknologi kok Bu... cuma lagi bingung menempatkannya saja.',
          'menunduk',
          'Ayu menggigit bibirnya pelan dengan tatapan kecewa.',
        ),
      },
    ],
    t3: [
      {
        id: 't3-tepat', skillId: 'batas-kerahasiaan', best: true,
        text: 'Ayo kita ke Ruang Konsultasi yuk, biar kamu bisa cerita bebas soal rencana kariermu tanpa merasa dinilai.',
        reply: line(
          'Makasih Bu! Di Denpasar keluargaku perajin seni, jadi mereka berharap aku masuk vokasi teknik biar kariernya stabil. Tapi hatiku selalu terpanggil merancang antarmuka interaktif.',
          'lega',
          'Ayu membuka buku sketsanya yang penuh desain dashboard sensor yang keren.',
        ),
      },
      {
        id: 't3-salah', skillId: 'janji-mutlak', isMisstep: true,
        text: 'Ayo masuk, nanti Ibu suruh kamu fokus ke kode belakang layar saja supaya pasti cepat dapat kerja.',
        reply: line(
          'Hmm... kalau cuma kode belakang layar tanpa desain, rasanya separuh semangatku hilang Bu. Tapi oke kita duduk dulu ya.',
          'cemas',
          'Ayu melangkah masuk dengan lesu.',
        ),
      },
    ],
    t4: [
      {
        id: 't4-tepat', skillId: 'validasi-normalisasi', best: true,
        text: 'Tumbuh di keluarga perajin seni sekaligus belajar teknik itu perpaduan yang istimewa, Ayu. Di industri teknologi sekarang, desain antarmuka justru sangat dibutuhkan!',
        reply: line(
          'Beneran ya Bu? Aku kira selama ini aku "salah jurusan" karena nggak sefanatik teman lain soal kabel dan register. Ternyata dua dunia itu bisa menyatu ya!',
          'tertegun',
          'Mata Ayu berbinar penuh harap.',
        ),
      },
      {
        id: 't4-salah', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Sebaiknya hobi desainmu disimpan buat waktu luang saja di akhir pekan, di dunia kerja teknik orang tidak terlalu melihat tampilan visual.',
        reply: line(
          'Oh... begitu ya Bu. Padahal kalau tampilan data sensornya berantakan, operator juga susah membacanya kan...',
          'menunduk',
          'Ayu menutup buku sketsanya perlahan.',
        ),
      },
    ],
    t5: [
      {
        id: 't5-tepat', skillId: 'refleksi-perasaan', best: true,
        options: { reflectionNuance: 'ragu-kurang-percaya' },
        text: 'Jadi yang paling bikin kamu terbebani bukan kurang mampu di teknik, melainkan takut mengecewakan harapan stabilitas keluarga kalau memilih jalur desain sistem interaktif?',
        reply: line(
          'Iya Bu, tepat sekali! Aku ingin membuktikan ke keluarga di Denpasar bahwa gabungan kepekaan visual dan ilmu pemrogramanku itu karier yang nyata dan menjanjikan.',
          'tersenyum',
          'Ayu menatap konselor dengan antusias dan lega.',
        ),
      },
      {
        id: 't5-salah', skillId: 'interogasi', isMisstep: true,
        text: 'Kamu yakin nggak cuma cari jalan pintas karena merasa pemrograman inti terlalu sulit?',
        reply: line(
          'Nilai pemrogramanku aman kok Bu... desain UI yang terhubung data real-time itu juga butuh logika kode, bukan jalan pintas.',
          'kesal',
          'Ayu meremas pinggir buku sketsanya dengan raut terluka.',
        ),
      },
    ],
    t6: [
      {
        id: 't6-tepat', skillId: 'afirmasi-kekuatan', best: true,
        text: 'Keahlianmu menerjemahkan data rumit jadi visual jernih itu kekuatan langka, Ayu. Langkah kecil apa yang ingin kamu wujudkan dari sketsamu minggu ini?',
        reply: line(
          'Aku mau bikin satu prototipe dashboard telemetri interaktif buat proyek tim, lalu kujadikan portofolio pertama biar bisa kutunjukkan ke orang tua juga!',
          'tersenyum',
          'Ayu tersenyum lebar sambil membalik halaman sketsa terbaiknya.',
        ),
      },
      {
        id: 't6-salah', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Kalau begitu minggu ini fokus saja menghafal dokumentasi hardware dulu, lupakan dulu soal portofolio desain.',
        reply: line(
          'Yah... padahal aku baru saja semangat mau bikin dashboard proyek tim, Bu.',
          'lelah',
          'Semangat di wajah Ayu langsung meredup.',
        ),
      },
    ],
    t7: [
      {
        id: 't7-tepat', skillId: 'parafrase-ringkasan', best: true,
        text: 'Portofolio dashboard telemetri itu ide brilian, Ayu! Nggak perlu sembunyikan layar sketsamu lagi—teknik dan kreativitasmu saling menguatkan.',
        reply: line(
          'Makasih banyak Bu! Rasanya lega banget akhirnya berani bangga sama gayaku sendiri. Aku lanjut poles desainnya di lab ya!',
          'lega',
          'Ayu berdiri dengan senyum cerah dan langkah penuh percaya diri.',
        ),
      },
      {
        id: 't7-salah', skillId: 'meremehkan', isMisstep: true,
        text: 'Ya sudah, semoga kamu cepat sadar mana yang lebih realistis ya.',
        reply: line(
          'Iya Bu... permisi.',
          'menunduk',
          'Ayu meninggalkan ruangan dengan bahu lesu.',
        ),
      },
    ],
    endings: {
      terbantu: line('Terima kasih Bu! Sekarang aku percaya diri memadukan desain interaktif dan pemrograman sebagai jalanku!', 'lega', 'Ayu kembali ke Lab Pemrograman dengan mata berbinar.'),
      kemajuanKecil: line('Makasih ya Bu, aku coba pertimbangkan lagi langkah portofolioku.', 'netral', 'Ayu tersenyum kecil.'),
      menarikDiri: line('Maaf Bu, aku simpan saja dulu buku sketsaku...', 'menutup-diri', 'Ayu berjalan pelan keluar ruangan.'),
    },
  },

  // 06 — Mita Rahmawati (Bogor · Pemalu & Takut Merepotkan · Lulusan sekolah kecil, takut dianggap bodoh)
  {
    studentId: 'mhs-06',
    firstName: 'Mita',
    title: 'Cerita Mita Rahmawati',
    labSceneTitle: 'Lab Pemrograman & MCU',
    labSceneCaption: 'Mita duduk di ujung baris sambil membuka banyak tab dokumentasi teknis sendirian dengan catatan tebal.',
    opening: line(
      'Eh, permisi Bu... halo. Maaf, aku lagi baca ulang dokumentasi modul kemarin sebentar.',
      'cemas',
      'Mita merapatkan catatan tulis tangannya sambil tersenyum canggung.',
    ),
    t1: [
      {
        id: 't1-tepat', skillId: 'sapaan-hangat', best: true,
        text: 'Halo Mita, apa kabarmu hari ini? Catatan rangkumanmu selalu rapi sekali, semangat ya belajarnya.',
        reply: line(
          'Alhamdulillah baik Bu... makasih ya Bu. Aku memang lebih nyaman mencatat pelan-pelan biar nggak ketinggalan.',
          'tersenyum',
          'Mita terlihat sedikit lega dan mengangguk sopan.',
        ),
      },
      {
        id: 't1-salah', skillId: 'meremehkan', isMisstep: true,
        text: 'Kamu ini kenapa sih dari kemarin diam saja di pojok? Kalau nggak paham ya tanya, jangan bengong!',
        reply: line(
          'Maaf Bu... aku nggak bengong kok, aku lagi cari referensinya sendiri biar nggak ganggu teman.',
          'terkejut',
          'Mita langsung menunduk dengan bahu menciut.',
        ),
      },
    ],
    t2: [
      {
        id: 't2-tepat', skillId: 'sampaikan-pengamatan', best: true,
        options: { observationTone: 'faktual' },
        text: 'Aku lihat tab dokumentasimu banyak sekali dan kodenya masih merah di baris yang sama. Lagi ada bagian yang bikin bingung ya?',
        reply: line(
          'Iya Bu... dari tadi belum ketemu bug-nya. Sebenarnya pengin tanya, tapi lihat teman-teman pada cepat semua aku jadi sungkan.',
          'cemas',
          'Mita menatap layar laptopnya dengan suara pelan.',
        ),
      },
      {
        id: 't2-salah', skillId: 'pertanyaan-tertutup', isMisstep: true,
        text: 'Materi dasar begini saja masa belum selesai? Teman-temanmu yang lain sudah lanjut bab berikutnya lho.',
        reply: line(
          'Iya Bu, maaf... aku memang lambat paham dibanding yang lain.',
          'menunduk',
          'Mata Mita meredup dan tangannya berhenti mengetik.',
        ),
      },
    ],
    t3: [
      {
        id: 't3-tepat', skillId: 'batas-kerahasiaan', best: true,
        text: 'Tidak apa-apa kok, Mita. Yuk kita ngobrol pelan-pelan berdua di Ruang Konsultasi biar kamu nyaman cerita tanpa didengar seisi lab.',
        reply: line(
          'Makasih banyak Bu... di sini tenang sekali. Jujur, dari SMA di sekolah kecil aku belum pernah pegang mikrokontroler, jadi setiap bingung aku takut dianggap bodoh kalau bertanya.',
          'lega',
          'Mita duduk di Ruang Konsultasi dan akhirnya bicara lebih lancar.',
        ),
      },
      {
        id: 't3-salah', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Ayo sekarang angkat tangan keras-keras di tengah lab supaya teman satu ruangan dengar kamu butuh bantuan!',
        reply: line(
          'Duh jangan gitu Bu, aku malah makin gemetar... boleh kita bicara berdua saja di ruang konsultasi?',
          'cemas',
          'Mita tampak sangat gugup sambil melangkah ke Ruang Konsultasi.',
        ),
      },
    ],
    t4: [
      {
        id: 't4-tepat', skillId: 'validasi-normalisasi', best: true,
        text: 'Datang dari latar belakang sekolah yang belum punya alat praktikum lalu tetap tekun merangkum sendiri itu hebat, Mita. Wajar sekali kalau butuh waktu penyesuaian.',
        reply: line(
          'Serius Bu? Aku kira cuma aku yang paling tertinggal di sini... rasanya sesak banget tiap mau buka mulut bertanya, takut merepotkan orang.',
          'tertegun',
          'Mita menarik napas panjang; ketegangan di wajahnya berkurang jauh.',
        ),
      },
      {
        id: 't4-salah', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Di kuliah vokasi kamu nggak boleh pemalu begitu, Mita. Kalau terus diam ya salahmu sendiri nanti nilaimu jatuh.',
        reply: line(
          'Iya Bu, aku tahu itu salahku... aku juga pengin berani, cuma nggak tahu mulai dari mana.',
          'menunduk',
          'Mita meremas ujung buku catatannya dengan sedih.',
        ),
      },
    ],
    t5: [
      {
        id: 't5-tepat', skillId: 'refleksi-perasaan', best: true,
        options: { reflectionNuance: 'tertekan-cemas' },
        text: 'Kamu sebenarnya sangat tekun mencari tahu sendiri, dan rasa canggung bertanya itu muncul karena takut dianggap merepotkan—bukan karena kurang berusaha, kan?',
        reply: line(
          'Iya Bu, persis banget! Padahal setiap kali aku membantu teman cari referensi dokumentasi, aku senang-senang saja. Mungkin teman lain juga nggak keberatan kalau kutanya satu poin spesifik ya?',
          'tersenyum',
          'Senyum tulus kembali muncul di wajah Mita.',
        ),
      },
      {
        id: 't5-salah', skillId: 'interogasi', isMisstep: true,
        text: 'Kalau memang takut merepotkan, kenapa dari awal tidak ikut les privat tambahan di luar kampus saja?',
        reply: line(
          'Nggak semua orang sempat dan sanggup ikut les di luar, Bu... aku sudah berusaha belajar semampuku lewat dokumentasi gratis.',
          'menutup-diri',
          'Suara Mita mengecil dan ia kembali menunduk.',
        ),
      },
    ],
    t6: [
      {
        id: 't6-tepat', skillId: 'afirmasi-kekuatan', best: true,
        text: 'Kemampuanmu merangkum dokumentasi teknis itu justru sering menolong tim! Langkah kecil yang nyaman buatmu—mau coba belajar berdua dengan satu teman yang paling ramah dulu?',
        reply: line(
          'Iya Bu! Kalau belajar berdua sama Ayu atau Tania sambil bawa rangkumanku, aku berani kok! Jadi rasanya saling bertukar catatan, bukan cuma merepotkan.',
          'tersenyum',
          'Mita mengangguk penuh semangat.',
        ),
      },
      {
        id: 't6-salah', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Minggu depan saya tunjuk kamu presentasi kode sendirian di depan seluruh angkatan biar rasa malumu hilang.',
        reply: line(
          'Eh, langsung di depan seluruh angkatan Bu? Aku belum siap sama sekali, malah makin panik nanti...',
          'cemas',
          'Wajah Mita langsung pucat dan gelisah.',
        ),
      },
    ],
    t7: [
      {
        id: 't7-tepat', skillId: 'parafrase-ringkasan', best: true,
        text: 'Tukar rangkuman berdua dengan Ayu atau Tania itu langkah yang pas banget buat ritmemu, Mita. Pelan-pelan tapi pasti, kamu tidak sendirian di lab ini.',
        reply: line(
          'Terima kasih banyak Bu sudah bicara pelan dan nggak mendesakku. Rasanya tenang banget sekarang!',
          'lega',
          'Mita tersenyum manis dan kembali ke lab dengan langkah mantap.',
        ),
      },
      {
        id: 't7-salah', skillId: 'meremehkan', isMisstep: true,
        text: 'Ya sudah, jangan malu-malu lagi ya, repot kalau dosen harus nyamperin terus.',
        reply: line(
          'Maaf sudah merepotkan Ibu... aku permisi dulu.',
          'menunduk',
          'Mita pergi dengan raut wajah kembali murung.',
        ),
      },
    ],
    endings: {
      terbantu: line('Makasih banyak Bu! Sekarang aku berani mengajak belajar berdua dengan rangkumanku.', 'lega', 'Mita berjalan kembali ke lab dengan senyum tenang.'),
      kemajuanKecil: line('Terima kasih Bu, aku coba beranikan diri tanya sedikit-sedikit nanti.', 'netral', 'Mita memeluk buku catatannya.'),
      menarikDiri: line('Maaf Bu, aku belajar sendiri saja dulu ya...', 'menutup-diri', 'Mita kembali ke sudut ruangan dengan kepala tertunduk.'),
    },
  },

  // 07 — Bima Mahendra (Bekasi · Tegas, Disiplin, & Realistis · Dilema tawaran kerja bengkel vs wisuda)
  {
    studentId: 'mhs-07',
    firstName: 'Bima',
    title: 'Cerita Bima Mahendra',
    labSceneTitle: 'Bengkel Pengelasan K3',
    labSceneCaption: 'Bima baru melepas sarung tangan lasnya lalu menatap amplop tawaran kerja bengkel fabrikasi di dekat tasnya.',
    opening: line(
      'Siang Bu! Aman kok, area bilik las sudah kumatikan dan tabung gasnya sudah kukunci sesuai K3.',
      'tersenyum',
      'Bima menyeka keringat lalu cepat-cepat memasukkan amplop cokelat kembali ke tasnya.',
    ),
    t1: [
      {
        id: 't1-tepat', skillId: 'sapaan-hangat', best: true,
        text: 'Siang juga Bima, apa kabarmu hari ini? Disiplin K3-mu di bengkel selalu bikin tenang.',
        reply: line(
          'Alhamdulillah baik Bu, walaupun pikiran agak berat sedikit habis terima surat panggilan kerja dari bengkel fabrikasi.',
          'lelah',
          'Bima meletakkan kacamata lasnya di meja logam.',
        ),
      },
      {
        id: 't1-salah', skillId: 'meremehkan', isMisstep: true,
        text: 'Ngapain sih sembunyiin amplop begitu? Lagi nyolong waktu praktikum buat urusan lain ya?',
        reply: line(
          'Bukan begitu Bu... pekerjaanku sudah beres semua kok. Itu cuma surat tawaran kerja, bukan melanggar aturan.',
          'kesal',
          'Bima menegakkan bahunya dengan ekspresi tersinggung.',
        ),
      },
    ],
    t2: [
      {
        id: 't2-tepat', skillId: 'sampaikan-pengamatan', best: true,
        options: { observationTone: 'faktual' },
        text: 'Dari tadi kelihatan kamu cukup kepikiran soal amplop tawaran kerja itu. Lagi menimbang keputusan penting ya, Bima?',
        reply: line(
          'Iya Bu, tepat banget. Di bengkel lumayan berisik, boleh kita ngobrol sebentar di ruang yang lebih tenang?',
          'cemas',
          'Bima mengambil tas kerjanya sambil menghela napas.',
        ),
      },
      {
        id: 't2-salah', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Ah, tolak saja tawaran kerja begitu! Anak kuliah nggak usah mikirin gaji dulu sebelum wisuda.',
        reply: line(
          'Nggak semudah itu ngomong tolak, Bu... di rumah keluarga juga butuh pegangan ekonomi.',
          'kesal',
          'Rahang Bima mengeras mendengar jawaban yang terlalu menggampangkan.',
        ),
      },
    ],
    t3: [
      {
        id: 't3-tepat', skillId: 'batas-kerahasiaan', best: true,
        text: 'Ayo kita ke Ruang Konsultasi yuk, biar kita bahas realitas pilihanmu dengan jernih tanpa terganggu suara bengkel.',
        reply: line(
          'Siap Bu, makasih. Jadi bengkel fabrikasi di Bekasi nawarin gaji tetap mulai bulan depan. Di satu sisi keluargaku butuh tambahan cepat, di sisi lain sayang banget kalau kuliah tinggal selangkah lagi tidak selesai.',
          'netral',
          'Bima duduk mantap dan menunjukkan jadwal kuliah semester akhirnya.',
        ),
      },
      {
        id: 't3-salah', skillId: 'pertanyaan-tertutup', isMisstep: true,
        text: 'Sebentar, kamu nggak berniat berhenti kuliah mendadak dan bikin turun angka kelulusan jurusan kan?',
        reply: line(
          'Bukan soal angka jurusan Bu, ini soal nasib keluargaku... ya sudah kita bicarakan di ruang konsultasi saja deh.',
          'waspada',
          'Bima tampak kurang nyaman saat berjalan ke Ruang Konsultasi.',
        ),
      },
    ],
    t4: [
      {
        id: 't4-tepat', skillId: 'validasi-normalisasi', best: true,
        text: 'Sebagai tulang punggung harapan keluarga, tawaran gaji tetap itu memang nyata dan masuk akal untuk dipertimbangkan, Bima. Bukan keputusan remeh.',
        reply: line(
          'Nah, makasih Bu sudah bicara realistis. Aku tuh pengin banget bantu orang tua secepatnya, tapi takut kalau langsung lepas kuliah, nanti karierku mentok karena tanpa ijazah.',
          'menunduk',
          'Bima mengangguk mantap; ia merasa realitas hidupnya dihormati.',
        ),
      },
      {
        id: 't4-salah', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Yang penting ikut idealisme pendidikan dulu, Bima. Soal uang keluarga nanti pasti ada jalannya sendiri.',
        reply: line(
          'Idealisme nggak bisa dipakai bayar kebutuhan rumah bulan depan, Bu... aku butuh perhitungan yang nyata.',
          'kesal',
          'Bima menyandarkan bahu sambil membuang napas panjang.',
        ),
      },
    ],
    t5: [
      {
        id: 't5-tepat', skillId: 'pertanyaan-terbuka', best: true,
        text: 'Menurut perhitungan realistismu, ada nggak ruang negosiasi dengan bengkel itu—misalnya jadwal magang/shift fleksibel sampai sidang, supaya penghasilan dan wisuda sama-sama selamat?',
        reply: line(
          'Bentar Bu... mereka memang cari teknisi K3 yang sudah siap pakai! Kalau kutawarkan masuk shift sore atau magang berbayar selama 3 bulan menjelang wisuda, mungkin malah mereka setuju daripada cari orang baru!',
          'tertegun',
          'Wajah Bima langsung cerah menemukan solusi konkret.',
        ),
      },
      {
        id: 't5-salah', skillId: 'interogasi', isMisstep: true,
        text: 'Kenapa dulu kamu menerima lamaran itu kalau ternyata masih bingung membagi waktu dengan kuliah?',
        reply: line(
          'Aku nggak ngelamar duluan Bu, mereka yang nawarin habis lihat proyek las kemarin. Nggak usah menyalahkan begitu dong.',
          'menutup-diri',
          'Bima mengerutkan kening dengan raut kecewa.',
        ),
      },
    ],
    t6: [
      {
        id: 't6-tepat', skillId: 'afirmasi-kekuatan', best: true,
        text: 'Keahlian pengelasan dan disiplin K3-mu bikin posisimu kuat untuk bernegosiasi, Bima. Langkah konkret apa yang mau kamu siapkan sebelum menghubungi manajer bengkelnya?',
        reply: line(
          'Aku mau cetak jadwal kuliah terakhirku yang tinggal 2 hari seminggu, lalu ajukan surat izin kerja paruh waktu sambil minta rekomendasi resmi dari kampus!',
          'tersenyum',
          'Bima mengepalkan tangan pelan penuh keyakinan.',
        ),
      },
      {
        id: 't6-salah', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Sudahlah nggak usah nego-nego, langsung saja terima kerja penuh dan cuti kuliah dua tahun.',
        reply: line(
          'Kalau cuti dua tahun takutnya malah nggak pernah balik wisuda, Bu... sayang perjuanganku selama ini.',
          'cemas',
          'Bima menggeleng ragu.',
        ),
      },
    ],
    t7: [
      {
        id: 't7-tepat', skillId: 'parafrase-ringkasan', best: true,
        text: 'Rencana negosiasi jadwal dengan surat kampus itu cerdas dan realistis, Bima! Kalau butuh surat keterangan jadwal praktikum, kabari aku kapan saja ya.',
        reply: line(
          'Siap Bu! Makasih banyak sudah diajak mikir jernih tanpa menggurui. Energiku balik penuh nih buat beresin bengkel!',
          'lega',
          'Bima tersenyum lebar dan kembali ke Bengkel Las dengan langkah tegas.',
        ),
      },
      {
        id: 't7-salah', skillId: 'meremehkan', isMisstep: true,
        text: 'Oke selesai ya, pokoknya jangan sampai bikin masalah di bengkel gara-gara urusan kerjaanmu.',
        reply: line(
          'Aku selalu jaga K3 kok Bu... ya sudah, permisi dulu.',
          'kesal',
          'Bima melangkah keluar dengan ekspresi datar.',
        ),
      },
    ],
    endings: {
      terbantu: line('Makasih banyak Bu! Aku siap negosiasi shift dengan kepala dingin biar kerja dan wisuda sama-sama jalan!', 'lega', 'Bima kembali ke bengkel dengan semangat menyala.'),
      kemajuanKecil: line('Oke Bu, aku hitung-hitung ulang dulu tawarannya malam ini.', 'netral', 'Bima mengangguk tenang.'),
      menarikDiri: line('Ya sudah Bu, aku urus sendiri saja soal kerjaan ini...', 'menutup-diri', 'Bima berjalan keluar dengan wajah murung.'),
    },
  },

  // 08 — Hendra Wijaya (Manado · Ramah & Sulit Berkata Tidak · Sering bantu printer 3D sampai tugas sendiri keteteran)
  {
    studentId: 'mhs-08',
    firstName: 'Hendra',
    title: 'Cerita Hendra Wijaya',
    labSceneTitle: 'Studio Cetak 3D',
    labSceneCaption: 'Hendra sedang membersihkan nozzle printer 3D milik teman sementara berkas tugas cetaknya sendiri masih menumpuk.',
    opening: line(
      'Halo Bu! Hehe, bentar ya, ini nozzle printer kelompok sebelah mampet lagi jadi kubantu bersihin sebentar.',
      'tersenyum',
      'Hendra tersenyum ramah meski keringat menetes dan mejanya sendiri penuh model yang belum dicetak.',
    ),
    t1: [
      {
        id: 't1-tepat', skillId: 'sapaan-hangat', best: true,
        text: 'Halo juga Hendra, apa kabarmu hari ini? Kamu selalu ringan tangan banget bantu mesin cetak 3D anak-anak lain.',
        reply: line(
          'Hehe, aman kok Bu... walau jujur dari pagi belum sempat nyentuh cetakan tugasku sendiri nih.',
          'lelah',
          'Hendra melirik meja kerjanya sendiri sambil menggaruk belakang leher.',
        ),
      },
      {
        id: 't1-salah', skillId: 'meremehkan', isMisstep: true,
        text: 'Ngapain sih urusin printer orang lain terus? Tugasmu sendiri saja berantakan gitu!',
        reply: line(
          'Eh, maaf Bu... tadi mereka minta tolong mendadak karena mau dipakai presentasi, aku nggak enak nolak.',
          'terkejut',
          'Senyum ramah Hendra langsung memudar.',
        ),
      },
    ],
    t2: [
      {
        id: 't2-tepat', skillId: 'sampaikan-pengamatan', best: true,
        options: { observationTone: 'faktual' },
        text: 'Tadi kulihat sudah tiga orang minta tolong mendadak ke kamu dalam satu jam ini, sementara file tugasmu masih menunggu di antrean.',
        reply: line(
          'Iya Bu, ketahuan deh... rasanya capek banget lari sana-sini, tapi tiap ada yang panggil "Hen tolong bentar", mulutku otomatis bilang iya.',
          'cemas',
          'Hendra menurunkan kunci pas kecilnya dengan lesu.',
        ),
      },
      {
        id: 't2-salah', skillId: 'pertanyaan-tertutup', isMisstep: true,
        text: 'Kamu memang suka menunda-nunda tugas sendiri ya, makanya cari alasan bantu teman?',
        reply: line(
          'Nggak gitu Bu... aku bukan malas ngerjain tugasku, beneran cuma nggak tega lihat mesin mereka macet.',
          'kesal',
          'Hendra tampak sedih karena niat baiknya disalahpahami.',
        ),
      },
    ],
    t3: [
      {
        id: 't3-tepat', skillId: 'batas-kerahasiaan', best: true,
        text: 'Kita istirahat sebentar di Ruang Konsultasi yuk, biar kamu punya 5 menit yang benar-benar bebas dari panggilan mendadak.',
        reply: line(
          'Wah, akhirnya bisa duduk tanpa ada yang manggil! Di Manado aku memang dibiasakan selalu bantu siapa saja, Bu. Jadi kalau bilang "nggak bisa", rasanya kayak jadi orang jahat.',
          'lega',
          'Hendra menyandarkan punggungnya di kursi dengan lega.',
        ),
      },
      {
        id: 't3-salah', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Sekarang juga bilang ke seluruh studio kalau kamu nggak mau bantu siapa pun lagi mulai hari ini!',
        reply: line(
          'Waduh, kalau ngomong sekeras itu di depan mereka aku nggak tega Bu, nanti malah dikira marah... kita ngobrol di dalam saja deh.',
          'cemas',
          'Hendra menggeleng cemas sambil melangkah ke Ruang Konsultasi.',
        ),
      },
    ],
    t4: [
      {
        id: 't4-tepat', skillId: 'validasi-normalisasi', best: true,
        text: 'Sifat ramah dan siap menolongmu itu tulus banget, Hendra. Tapi menjaga batas waktu buat tugas sendiri itu bukan berarti kamu egois lho.',
        reply: line(
          'Beneran ya Bu? Aku selalu takut kalau kubilang "nanti dulu ya", teman-teman jadi kecewa atau nggak mau berteman akrab lagi.',
          'menunduk',
          'Hendra menatap kedua tangannya sambil merenung.',
        ),
      },
      {
        id: 't4-salah', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Teman-temanmu itu sebenarnya cuma memanfaatkan kebaikanmu saja, Hendra. Jangan mau dibodohi terus.',
        reply: line(
          'Jangan bilang gitu ah Bu, mereka teman-teman baikku kok... cuma mereka nggak tahu aja kalau jadwalku sendiri lagi mepet.',
          'waspada',
          'Hendra merasa kurang nyaman mendengar teman-temannya dicap buruk.',
        ),
      },
    ],
    t5: [
      {
        id: 't5-tepat', skillId: 'refleksi-perasaan', best: true,
        options: { reflectionNuance: 'lelah-kewalahan' },
        text: 'Kamu tetap ingin jadi teman yang bisa diandalkan, tapi kalau kamu terus menomorduakan dirimu sendiri, justru suatu saat tenagamu habis duluan kan?',
        reply: line(
          'Iya banget Bu! Kalau kubilang jujur, "Tunggu 30 menit ya, aku kelarin cetakan dulu baru kubantu", kayaknya mereka pasti ngerti kok. Aku tetap ramah, tapi tugasku juga jalan!',
          'tertegun',
          'Wajah Hendra langsung sumringah menemukan kalimat yang pas dengan karakternya.',
        ),
      },
      {
        id: 't5-salah', skillId: 'interogasi', isMisstep: true,
        text: 'Kenapa sih kamu lemah sekali sampai nggak berani bilang tidak pada satu orang pun?',
        reply: line(
          'Bukan lemah Bu, aku cuma berusaha jaga hubungan baik saja... rasanya nggak enak dibilang lemah gitu.',
          'menutup-diri',
          'Hendra menunduk dengan senyum yang hilang.',
        ),
      },
    ],
    t6: [
      {
        id: 't6-tepat', skillId: 'afirmasi-kekuatan', best: true,
        text: 'Kalimat "tunggu 30 menit ya, aku selesaikan tugasku dulu" itu hangat tapi tegas! Selain itu, mau bikin catatan singkat cara rawat nozzle biar teman-teman juga belajar mandiri?',
        reply: line(
          'Ide keren banget Bu! Aku tempel panduan 3 langkah bersihin nozzle dekat printer 3D, terus aku kunci jadwal 1 jam khusus buat proyekku sendiri!',
          'tersenyum',
          'Hendra tersenyum lebar dan mengacungkan jempol.',
        ),
      },
      {
        id: 't6-salah', skillId: 'nasihat-dini', isMisstep: true,
        text: 'Mulai besok kunci saja semua perkakas 3D di tasmu dan pura-pura tidak dengar kalau ada yang memanggil.',
        reply: line(
          'Yah kalau pura-pura nggak dengar malah canggung banget dong Bu di studio...',
          'cemas',
          'Hendra menggeleng pelan.',
        ),
      },
    ],
    t7: [
      {
        id: 't7-tepat', skillId: 'parafrase-ringkasan', best: true,
        text: 'Panduan singkat + jeda 1 jam untuk tugas sendiri itu seimbang banget, Hendra! Kamu tetap jadi teman terbaik tanpa mengorbankan energimu sendiri.',
        reply: line(
          'Makasih banyak Bu! Plong banget rasanya—aku balik ke Studio 3D buat cetak proyekku duluan nih!',
          'lega',
          'Hendra melangkah keluar dengan senyum ceria dan energi pulih.',
        ),
      },
      {
        id: 't7-salah', skillId: 'meremehkan', isMisstep: true,
        text: 'Ya sudah, jangan sampai minggu depan kamu keteteran lagi cuma gara-gara terlalu polos.',
        reply: line(
          'Iya Bu... aku permisi balik ke studio dulu.',
          'menunduk',
          'Hendra keluar dengan langkah agak berat.',
        ),
      },
    ],
    endings: {
      terbantu: line('Makasih banyak Bu! Sekarang aku bisa tetap ramah bantu teman tanpa lupa jaga waktuku sendiri.', 'lega', 'Hendra kembali ke Studio Cetak 3D dengan penuh semangat.'),
      kemajuanKecil: line('Makasih ya Bu, aku coba pelan-pelan belajar bilang tunggu dulu ke teman.', 'netral', 'Hendra tersenyum tipis.'),
      menarikDiri: line('Maaf Bu, aku balik kerjakan antrean cetakan dulu ya...', 'menutup-diri', 'Hendra berjalan pelan keluar ruangan.'),
    },
  },
];

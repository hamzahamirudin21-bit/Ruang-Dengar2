import type {
  AgentDialogueTone,
  AgentSpeakingStyle,
  AgentTieredProblem,
  CounselorSkillId,
  DisclosureLevel,
  GeneratedUtterancePayload,
  StudentAgent,
} from '../types';
import { mulberry32 } from '../engine/rng';

export interface UtteranceTemplateVariant {
  ucapan: string;
  nonverbal: string;
}

export type UtteranceTemplateBank = Record<
  DisclosureLevel,
  Record<AgentDialogueTone, Record<AgentSpeakingStyle, readonly UtteranceTemplateVariant[]>>
>;

export function deriveAgentSpeakingStyle(agent: StudentAgent): AgentSpeakingStyle {
  if (agent.personality.extraversion >= 0.62) {
    return 'ekspresif-langsung';
  }
  if (agent.personality.openness >= 0.65 && agent.personality.conscientiousness >= 0.65) {
    return 'reflektif-tenang';
  }
  return 'ringkas-hati-hati';
}

/**
 * Pustaka templat ucapan cadangan offline:
 * 4 level (0..3) × 3 nada (terbuka, menarik-diri, defensif) × 3 gaya bicara = 36 kombinasi,
 * masing-masing minimal 6 variasi santai khas mahasiswa Indonesia (<= 40 kata).
 * Placeholder: {fakta}, {perasaan}, {kebutuhan}, {nama}
 */
export const UTTERANCE_TEMPLATE_BANK: UtteranceTemplateBank = {
  0: {
    terbuka: {
      'ringkas-hati-hati': [
        {
          ucapan: 'Halo, lumayan ramai sih lab hari ini. Aku lagi beresin bagian kerjaku pelan-pelan.',
          nonverbal: 'Menoleh singkat lalu tersenyum tipis ke arah konselor.',
        },
        {
          ucapan: 'Eh iya, selamat siang. Praktikum hari ini jalan seperti biasa kok, masih aman.',
          nonverbal: 'Meletakkan alat ukur sebentar sambil mengangguk sopan.',
        },
        {
          ucapan: 'Lagi nyiapin meja kerja sebentar sebelum shift berikutnya mulai. Ada yang bisa kubantu?',
          nonverbal: 'Duduk tegak dan menatap dengan sikap tenang.',
        },
        {
          ucapan: 'Lumayan padat sih minggu ini, tapi sejauh ini masih kepegang.',
          nonverbal: 'Menggeser buku catatan sedikit agar meja lebih lega.',
        },
        {
          ucapan: 'Iya, kebetulan baru selesai beres-beres. Gimana kabarnya hari ini?',
          nonverbal: 'Tersenyum ringan sambil menyandarkan tangan di tepi meja.',
        },
        {
          ucapan: 'Masih aman kok, cuma lagi ngerapiin catatan harian biar nanti enggak ketumpuk.',
          nonverbal: 'Mengangguk pelan dengan ekspresi cukup ramah.',
        },
      ],
      'ekspresif-langsung': [
        {
          ucapan: 'Eh halo! Hari ini lab lumayan rame ya, dari pagi kegiatan di sini udah jalan terus.',
          nonverbal: 'Tersenyum terbuka sambil menunjuk sekilas ke arah meja kerja.',
        },
        {
          ucapan: 'Siang! Aku baru aja kelar ngecek meja kerja, lagi tarik napas bentar sebelum lanjut.',
          nonverbal: 'Duduk agak condong ke depan dengan ekspresi antusias ringan.',
        },
        {
          ucapan: 'Wah kebetulan banget ketemu, hari ini praktikumnya lumayan seru walau agak ngebut.',
          nonverbal: 'Menggerakkan tangan ringan saat berbicara dengan nada hidup.',
        },
        {
          ucapan: 'Aman kok, cuma tadi sempat muter-muter cari pulpen di ruang sebelah bentar.',
          nonverbal: 'Tertawa kecil sambil menaruh pulpen di atas map.',
        },
        {
          ucapan: 'Iya nih, baru selesai beresin tahap awal. Kalau ngobrol sebentar di sini boleh banget.',
          nonverbal: 'Mengangguk cepat dengan raut wajah cukup terbuka.',
        },
        {
          ucapan: 'Lumayan sibuk hari ini, tapi masih asyik sih suasananya di sini tadi.',
          nonverbal: 'Menatap langsung dengan bahu tampak rileks.',
        },
      ],
      'reflektif-tenang': [
        {
          ucapan: 'Selamat siang. Aku lagi menata urutan harian supaya alurnya lebih rapi.',
          nonverbal: 'Menutup buku catatan pelan dan menatap dengan tenang.',
        },
        {
          ucapan: 'Suasana lab hari ini cukup hidup ya. Aku masih menyimak situasi dulu.',
          nonverbal: 'Berbicara pelan dengan bahu santai dan postur stabil.',
        },
        {
          ucapan: 'Sejauh ini rutinitas praktikum masih berjalan wajar, aku lagi ambil jeda sebentar.',
          nonverbal: 'Menghela napas ringan sambil mengangguk sopan.',
        },
        {
          ucapan: 'Iya, aku baru selesai menyusun catatan singkat. Ada yang ingin dibicarakan?',
          nonverbal: 'Meletakkan tangan di atas meja dengan sikap mendengarkan.',
        },
        {
          ucapan: 'Hari ini terasa cepat sekali waktunya, tapi untungnya semuanya masih lancar.',
          nonverbal: 'Tersenyum tipis tanpa tergesa-gesa.',
        },
        {
          ucapan: 'Makasih sudah mampir menyapa. Aku lagi menikmati suasana tenang sebentar sebelum lanjut.',
          nonverbal: 'Memandang konselor dengan tatapan ramah dan terjaga.',
        },
      ],
    },
    'menarik-diri': {
      'ringkas-hati-hati': [
        {
          ucapan: 'Mmm... iya, biasa aja kok. Enggak ada apa-apa.',
          nonverbal: 'Menunduk ke ujung meja dan meremas pulpen.',
        },
        {
          ucapan: 'Aman kok semuanya, aku cuma lagi fokus aja biar cepet kelar.',
          nonverbal: 'Menggeser kursi sedikit menjauh sambil melirik pintu.',
        },
        {
          ucapan: 'Oh... enggak kok, aman. Cuma agak capek dikit aja hari ini.',
          nonverbal: 'Menghindari kontak mata dan menjawab dengan suara pelan.',
        },
        {
          ucapan: 'Biasa aja sih, sama kayak hari-hari sebelumnya. Masih bisa diatasi sendiri.',
          nonverbal: 'Menyilangkan tangan di pangkuan sambil menunduk.',
        },
        {
          ucapan: 'Iya... nanti juga beres kok, enggak perlu diribetin.',
          nonverbal: 'Mengatupkan bibir rapat setelah menjawab sangat singkat.',
        },
        {
          ucapan: 'Enggak ada yang spesial, aku masih ada kerjaan nunggu di meja sih.',
          nonverbal: 'Merapikan tas seolah bersiap segera berdiri.',
        },
      ],
      'ekspresif-langsung': [
        {
          ucapan: 'Eh... kayaknya enggak ada hal penting kok, aku cuma lagi buru-buru aja.',
          nonverbal: 'Melirik jam tangan dan menarik bahu agak kaku.',
        },
        {
          ucapan: 'Aman-aman aja kok, enggak usah dipikirin. Aku balik ngerjain alat dulu ya nanti.',
          nonverbal: 'Tersenyum kaku sambil memalingkan pandangan ke samping.',
        },
        {
          ucapan: 'Oh, soal tadi? Biasa aja sih, enggak ada yang perlu dibahas panjang-panjang.',
          nonverbal: 'Menggoyangkan kaki gelisah di bawah meja.',
        },
        {
          ucapan: 'Hmm, aku kurang tau mau bilang apa. Semuanya masih kepegang sendiri kok.',
          nonverbal: 'Menghela napas pendek lalu menatap lantai.',
        },
        {
          ucapan: 'Enggak apa-apa beneran, mungkin aku lagi pengin sendiri aja sebentar.',
          nonverbal: 'Menggeser posisi duduk menjauh setengah langkah.',
        },
        {
          ucapan: 'Ya gitu deh, standar mahasiswa teknik. Enggak ada yang perlu dikhawatirin.',
          nonverbal: 'Mengangkat bahu singkat tanpa kontak mata.',
        },
      ],
      'reflektif-tenang': [
        {
          ucapan: 'Terima kasih sudah bertanya, tapi sepertinya belum ada yang perlu kubagikan sekarang.',
          nonverbal: 'Menatap buku catatan dan berbicara sangat pelan.',
        },
        {
          ucapan: 'Aku masih ingin menjaga fokus ke tugas dulu. Semuanya masih wajar kok.',
          nonverbal: 'Menarik napas pelan sambil menjaga jarak duduk.',
        },
        {
          ucapan: 'Maaf, aku agak kehabisan kata-kata hari ini. Mungkin lain kali aja ya.',
          nonverbal: 'Menundukkan pandangan dan melipat tangan di atas meja.',
        },
        {
          ucapan: 'Situasinya masih bisa kutangani sendiri, belum ada yang mendesak untuk diceritakan.',
          nonverbal: 'Mengangguk pelan namun tetap menjaga jarak aman.',
        },
        {
          ucapan: 'Aku lebih nyaman menyimak dulu untuk saat ini, belum siap bahas jauh-jauh.',
          nonverbal: 'Menggeser pulpen ke pinggir meja dengan gerakan perlahan.',
        },
        {
          ucapan: 'Enggak apa-apa kok, aku cuma lagi butuh suasana tenang tanpa banyak bicara.',
          nonverbal: 'Memandang ke arah luar jendela dengan ekspresi tertutup.',
        },
      ],
    },
    defensif: {
      'ringkas-hati-hati': [
        {
          ucapan: 'Sebentar, memangnya aku kelihatan bermasalah ya sampai ditanya begitu?',
          nonverbal: 'Mengerutkan dahi dan menegakkan punggung dengan kaku.',
        },
        {
          ucapan: 'Aku datang ke lab buat praktikum kok, bukan buat diperiksa salah benarnya.',
          nonverbal: 'Menyilangkan kedua lengan rapat di depan dada.',
        },
        {
          ucapan: 'Kayaknya terlalu cepat deh kalau langsung menyimpulkan begitu tanpa tanya konteksnya.',
          nonverbal: 'Menatap tajam sebentar lalu membuang muka.',
        },
        {
          ucapan: 'Aku enggak mau disalah-salahin dulu sebelum aku selesai ngerjain bagianku.',
          nonverbal: 'Rahang mengeras dan nada suara terdengar datar kaku.',
        },
        {
          ucapan: 'Kalau cuma mau nyuruh begitu, aku juga udah kepikiran dari kemarin.',
          nonverbal: 'Menghela napas kasar sambil mengetuk meja pelan.',
        },
        {
          ucapan: 'Tolong jangan samain keadaanku sama mahasiswa lain dong, tiap orang beda.',
          nonverbal: 'Menarik kursi sedikit mundur dengan wajah tegang.',
        },
      ],
      'ekspresif-langsung': [
        {
          ucapan: 'Lho, kok nadanya jadi kayak menginterogasi gini sih? Aku kan cuma kerja sesuai bagianku!',
          nonverbal: 'Menyandarkan punggung keras dengan tatapan langsung yang tajam.',
        },
        {
          ucapan: 'Eh bentar, jangan langsung nge-judge gitu dong sebelum denger situasi di lapangannya!',
          nonverbal: 'Mengangkat tangan sedikit dengan ekspresi tidak setuju.',
        },
        {
          ucapan: 'Kalau semua dianggap gampang dan disamain, buat apa aku ditanya-tanya di sini?',
          nonverbal: 'Suara meninggi sedikit dengan bahu menegang.',
        },
        {
          ucapan: 'Jujur aku enggak nyaman kalau langsung digurui padahal baru mulai ngobrol.',
          nonverbal: 'Menyilangkan lengan dan mengerutkan alis.',
        },
        {
          ucapan: 'Enggak semua orang di lab punya kondisi yang sama, jadi jangan dibandingin gitu.',
          nonverbal: 'Menatap serius tanpa senyum sedikit pun.',
        },
        {
          ucapan: 'Aku ke sini bukan untuk diceramahi, kerjaanku di stasiun juga enggak mandek kok.',
          nonverbal: 'Menutup buku dengan bunyi pelan namun tegas.',
        },
      ],
      'reflektif-tenang': [
        {
          ucapan: 'Maaf, tapi cara penyampaian barusan terasa cukup menyudutkan buatku.',
          nonverbal: 'Berhenti sejenak dan menatap konselor dengan sorot dingin.',
        },
        {
          ucapan: 'Sepertinya ada asumsi yang terlalu cepat di sini, dan aku kurang setuju.',
          nonverbal: 'Duduk tegak dengan kedua tangan terlipat rapi namun kaku.',
        },
        {
          ucapan: 'Aku menghargai niatnya, tapi saran secepat itu justru bikin aku merasa enggak didengar.',
          nonverbal: 'Menarik napas panjang untuk menahan nada suaranya.',
        },
        {
          ucapan: 'Kalau kita mulai dengan membandingkan orang lain, rasanya percakapannya enggak adil.',
          nonverbal: 'Menggeleng pelan dengan ekspresi kecewa yang tertahan.',
        },
        {
          ucapan: 'Boleh aku jelaskan perspektifku dulu sebelum ada penilaian seperti barusan?',
          nonverbal: 'Menjaga jarak duduk dengan tatapan penuh kehati-hatian.',
        },
        {
          ucapan: 'Nada bicara barusan membuatku merasa sedang diawasi, bukan diajak berdiskusi.',
          nonverbal: 'Meletakkan pulpen dan menatap lurus penuh pertimbangan.',
        },
      ],
    },
  },
  1: {
    terbuka: {
      'ringkas-hati-hati': [
        {
          ucapan: 'Kalau boleh jujur sedikit, minggu ini situasinya begini: {fakta}',
          nonverbal: 'Berhenti memutar pulpen lalu menatap lebih mantap.',
        },
        {
          ucapan: 'Sebenarnya ada kendala praktis di lab: {fakta}',
          nonverbal: 'Menarik napas pelan sambil menunjuk catatan tugasnya.',
        },
        {
          ucapan: 'Yang lagi bikin agak keteteran belakangan ini soal itu: {fakta}',
          nonverbal: 'Mengangguk pelan dengan bahu mulai agak turun.',
        },
        {
          ucapan: 'Aku baru sadar waktunya mepet banget karena {fakta}',
          nonverbal: 'Membuka telapak tangan di meja saat menjelaskan situasi.',
        },
        {
          ucapan: 'Kira-kira gambarannya begini: {fakta}',
          nonverbal: 'Menatap cukup tenang meski suaranya masih hati-hati.',
        },
        {
          ucapan: 'Jujur aja, bagian yang paling nyita tenaga minggu ini memang {fakta}',
          nonverbal: 'Menghela napas pendek lalu tersenyum tipis.',
        },
      ],
      'ekspresif-langsung': [
        {
          ucapan: 'Nah kalau mau diceritain faktanya, kejadiannya gini lho: {fakta}',
          nonverbal: 'Duduk condong ke depan dengan gesture tangan menjelaskan.',
        },
        {
          ucapan: 'Sebenarnya dari awal minggu ini aku lagi ngadepin ini: {fakta}',
          nonverbal: 'Mengangguk cepat sambil menatap konselor cukup terbuka.',
        },
        {
          ucapan: 'Biar jelas aja konteksnya, sekarang kondisinya tuh gini: {fakta}',
          nonverbal: 'Berbicara dengan tempo cukup lancar dan ekspresi lega.',
        },
        {
          ucapan: 'Iya nih, akar situasinya di lapangan emang karena {fakta}',
          nonverbal: 'Membuka buku catatan dan menunjuk jadwal praktikum.',
        },
        {
          ucapan: 'Kalau dilihat dari jadwalnya sih kelihatan banget: {fakta}',
          nonverbal: 'Menggerakkan bahu santai sambil menjelaskan kronologi.',
        },
        {
          ucapan: 'Terus terang, yang bikin ritme minggu ini berubah drastis itu {fakta}',
          nonverbal: 'Menjaga kontak mata yang aktif dan cukup nyaman.',
        },
      ],
      'reflektif-tenang': [
        {
          ucapan: 'Kalau kucoba urai pelan-pelan situasinya, kira-kira begini: {fakta}',
          nonverbal: 'Menarik napas teratur dan menyusun kata dengan tenang.',
        },
        {
          ucapan: 'Sebetulnya latar belakangnya cukup konkret, yaitu {fakta}',
          nonverbal: 'Mengangguk pelan dengan bahu jauh lebih rileks.',
        },
        {
          ucapan: 'Dari yang kualami beberapa hari ini, fokus kendalanya ada di {fakta}',
          nonverbal: 'Meletakkan kedua tangan tenang di atas meja.',
        },
        {
          ucapan: 'Baru sempat kuceritakan sekarang, memang kondisinya {fakta}',
          nonverbal: 'Memandang konselor dengan ekspresi terbuka namun terjaga.',
        },
        {
          ucapan: 'Secara situasi lapangan, hal yang paling memengaruhi kerjaku sekarang adalah {fakta}',
          nonverbal: 'Berbicara dengan nada stabil dan tidak terburu-buru.',
        },
        {
          ucapan: 'Kurang lebih situasinya berkutat pada hal ini: {fakta}',
          nonverbal: 'Tersenyum tipis setelah berhasil menyampaikan fakta awal.',
        },
      ],
    },
    'menarik-diri': {
      'ringkas-hati-hati': [
        {
          ucapan: 'Mmm... paling cuma soal jadwal yang mepet itu aja sih, selebihnya masih biasa.',
          nonverbal: 'Menunduk sebentar dan menurunkan nada suaranya.',
        },
        {
          ucapan: 'Iya, ada sedikit gesekan jadwal lab, tapi kayaknya enggak usah dibesar-besarin.',
          nonverbal: 'Memainkan ujung buku catatan tanpa menatap lama.',
        },
        {
          ucapan: 'Paling ya soal tugas praktikum minggu ini aja, enggak usah terlalu dipikirin.',
          nonverbal: 'Menggeser posisi duduk sedikit ke belakang.',
        },
        {
          ucapan: 'Sebenarnya cuma agak numpuk aja kerjaannya, nanti juga beres pelan-pelan.',
          nonverbal: 'Mengatupkan kedua tangan di pangkuan.',
        },
        {
          ucapan: 'Ya... kurang lebih soal pembagian waktu di lab aja sih.',
          nonverbal: 'Melirik ke arah lorong lalu kembali menunduk.',
        },
        {
          ucapan: 'Enggak banyak yang bisa diceritain lagi sih, intinya lagi padat aja minggu ini.',
          nonverbal: 'Menghela napas pelan sambil menutup mapnya.',
        },
      ],
      'ekspresif-langsung': [
        {
          ucapan: 'Ya paling soal jadwal alat yang tabrakan itu sih, tapi udah lah biar jalan aja.',
          nonverbal: 'Mengangkat bahu singkat sambil menoleh ke samping.',
        },
        {
          ucapan: 'Cuma urusan deadline praktikum kok, aku enggak mau bikin suasana tambah ribet.',
          nonverbal: 'Tersenyum kecut lalu melihat jam di ponsel.',
        },
        {
          ucapan: 'Sebatas teknis kerjaan di stasiun aja sih, bukan hal yang perlu diramaiin.',
          nonverbal: 'Menggeleng kecil dengan ekspresi menahan diri.',
        },
        {
          ucapan: 'Iya ada kendala di tugas, tapi rasanya percuma juga kalau dibahas sekarang.',
          nonverbal: 'Menyilangkan kaki sambil memandang ke lantai.',
        },
        {
          ucapan: 'Singkatnya lagi padat banget aja di lab, udah enggak usah dibahas lebih jauh.',
          nonverbal: 'Menghela napas pendek dan menyandarkan punggung.',
        },
        {
          ucapan: 'Kira-kira masih soal jadwal praktikum kemarin, cuma aku lagi males bahas detailnya.',
          nonverbal: 'Menggeser pulpen menjauh dengan ekspresi enggan.',
        },
      ],
      'reflektif-tenang': [
        {
          ucapan: 'Faktanya memang ada beban tugas yang menumpuk, tapi aku belum nyaman mengurainya lebih dalam.',
          nonverbal: 'Menatap meja dengan tenang namun menarik jarak.',
        },
        {
          ucapan: 'Sepertinya cukup sampai gambaran jadwal itu dulu ya, aku masih perlu waktu mencerna.',
          nonverbal: 'Menghela napas pelan dengan bahu kembali agak kaku.',
        },
        {
          ucapan: 'Ada kendala teknis minggu ini, namun rasanya aku belum siap membahas dampaknya.',
          nonverbal: 'Melipat tangan di meja dan menurunkan pandangan.',
        },
        {
          ucapan: 'Ya, kira-kira sebatas urusan tugas lab itu saja yang bisa kusampaikan sekarang.',
          nonverbal: 'Mengangguk singkat sambil mengatupkan bibir.',
        },
        {
          ucapan: 'Mungkin bagian teknisnya sudah jelas, tapi aku memilih berhenti dulu di sini.',
          nonverbal: 'Menatap keluar ruangan sebentar dengan ekspresi tertutup.',
        },
        {
          ucapan: 'Aku hargai pertanyaannya, cuma untuk saat ini aku masih ingin menyimpan detailnya.',
          nonverbal: 'Menarik kursi sedikit menjauh dengan gerakan halus.',
        },
      ],
    },
    defensif: {
      'ringkas-hati-hati': [
        {
          ucapan: 'Aku udah jelasin faktanya barusan, jangan dipelintir seolah aku yang enggak berusaha.',
          nonverbal: 'Mengerutkan alis dengan suara lebih tegas.',
        },
        {
          ucapan: 'Masalah jadwal di lab itu bukan cuma salahku sendiri kok.',
          nonverbal: 'Menyilangkan lengan dan menatap lurus ke depan.',
        },
        {
          ucapan: 'Kalau fakta tadi dijadiin bahan nyalahin, mending enggak usah kulanjutin ceritanya.',
          nonverbal: 'Menegakkan punggung dan menutup catatan.',
        },
        {
          ucapan: 'Aku cuma cerita apa adanya soal kerjaan, bukan minta dinilai malas.',
          nonverbal: 'Menghela napas tajam dengan rahang agak mengeras.',
        },
        {
          ucapan: 'Semua orang di tim juga lihat kendalanya di alat, kenapa kesannya aku yang disorot?',
          nonverbal: 'Memalingkan pandangan sebentar dengan raut kesal.',
        },
        {
          ucapan: 'Tadi aku udah terbuka soal situasinya, tapi responsnya malah bikin ragu.',
          nonverbal: 'Menarik tangan dari meja dengan sikap bertahan.',
        },
      ],
      'ekspresif-langsung': [
        {
          ucapan: 'Lho, aku kan udah kasih tahu kondisi lapangannya! Kok malah kesannya aku yang kurang usaha?',
          nonverbal: 'Membuka tangan lebar sebentar lalu menyilangkan lengan.',
        },
        {
          ucapan: 'Jangan dipotong gitu dong, masalah alat di lab ini ribetnya enggak sesimpel teori!',
          nonverbal: 'Berbicara cepat dengan nada membela diri.',
        },
        {
          ucapan: 'Kalau solusi yang dikasih langsung nyuruh gitu, berarti situasi tadi belum didengerin dong.',
          nonverbal: 'Menggeleng tegas sambil menatap konselor.',
        },
        {
          ucapan: 'Bukan aku yang menghindar, kondisi stasiunnya aja yang bikin kerjaan numpuk!',
          nonverbal: 'Mencondongkan badan sedikit dengan ekspresi menantang.',
        },
        {
          ucapan: 'Aku enggak suka kalau cerita faktaku langsung disimpulkan sepihak kayak barusan.',
          nonverbal: 'Mengerutkan dahi dan menghentikan gerakan tangan.',
        },
        {
          ucapan: 'Coba lihat dulu jadwal praktikumnya sebelum bilang bebannya masih ringan!',
          nonverbal: 'Mengetuk sampul buku dengan satu jari secara tegas.',
        },
      ],
      'reflektif-tenang': [
        {
          ucapan: 'Fakta yang baru kuceritakan tadi sepertinya ditanggapi terlalu menghakimi.',
          nonverbal: 'Berhenti bicara dan menatap dengan sorot menjaga jarak.',
        },
        {
          ucapan: 'Aku baru membuka sedikit situasi lapangan, tapi tanggapannya membuatku defensif.',
          nonverbal: 'Menarik napas dalam dengan bahu kembali menegang.',
        },
        {
          ucapan: 'Rasanya kurang tepat kalau kendala teknis tadi langsung disimpulkan sebagai kelalaian.',
          nonverbal: 'Menggeleng pelan dengan nada suara terkendali namun dingin.',
        },
        {
          ucapan: 'Kalau perspektifku belum didengar utuh, aku enggan melanjutkan ke bagian yang lebih pribadi.',
          nonverbal: 'Menutup buku catatan dengan perlahan.',
        },
        {
          ucapan: 'Aku butuh didengar tanpa langsung diberi label atau nasihat cepat.',
          nonverbal: 'Duduk tegak dan menyilangkan tangan di atas meja.',
        },
        {
          ucapan: 'Respons barusan membuatku berpikir ulang untuk membuka cerita lebih jauh.',
          nonverbal: 'Memandang ke samping sebentar sebelum kembali menatap.',
        },
      ],
    },
  },
  2: {
    terbuka: {
      'ringkas-hati-hati': [
        {
          ucapan: '{perasaan}',
          nonverbal: 'Menurunkan bahu dan berbicara dengan suara lebih pelan namun jujur.',
        },
        {
          ucapan: 'Terus terang, di balik kerjaan lab itu yang kurasain ya ini: {perasaan}',
          nonverbal: 'Menarik napas panjang lalu menatap konselor dengan tulus.',
        },
        {
          ucapan: 'Sebenarnya bukan cuma capek fisik, tapi rasanya begini: {perasaan}',
          nonverbal: 'Mengendurkan genggaman tangan di atas meja.',
        },
        {
          ucapan: 'Kadang pas lagi di stasiun sendirian, muncul rasa seperti ini: {perasaan}',
          nonverbal: 'Mengangguk pelan dengan ekspresi agak lega bisa mengucapkannya.',
        },
        {
          ucapan: 'Iya, tepat banget... bagian yang paling bikin berat itu perasaannya: {perasaan}',
          nonverbal: 'Matanya tampak sedikit melembut saat merasa dipahami.',
        },
        {
          ucapan: 'Selama ini kupendam sendiri aja karena malu, padahal {perasaan}',
          nonverbal: 'Mengusap tengkuk pelan lalu tersenyum kecil yang jujur.',
        },
      ],
      'ekspresif-langsung': [
        {
          ucapan: 'Nah itu dia! Jujur aja rasanya di dalam hati tuh kayak gini: {perasaan}',
          nonverbal: 'Menghela napas lega dan menatap dengan ekspresi sangat jujur.',
        },
        {
          ucapan: 'Bener banget, di balik semua target itu yang paling kerasa ya ini: {perasaan}',
          nonverbal: 'Meletakkan kedua tangan terbuka di meja.',
        },
        {
          ucapan: 'Selama ini aku kelihatan santai di luar, padahal aslinya {perasaan}',
          nonverbal: 'Menurunkan nada bicaranya menjadi lebih tulus dan tenang.',
        },
        {
          ucapan: 'Iya, rasanya kayak kepenuhan di kepala setiap kali lihat jadwal: {perasaan}',
          nonverbal: 'Mengangguk berulang kali saat emosinya tervalidasi.',
        },
        {
          ucapan: 'Akhirnya ada yang nangkep juga... soalnya dari kemarin {perasaan}',
          nonverbal: 'Bahu tampak mengendur dan wajah terlihat lebih ringan.',
        },
        {
          ucapan: 'Yang paling enggak enak justru perasaan ini yang bikin serba salah: {perasaan}',
          nonverbal: 'Menatap konselor tanpa ragu sambil menghembuskan napas.',
        },
      ],
      'reflektif-tenang': [
        {
          ucapan: 'Jika kucoba jujur pada perasaanku sendiri sekarang, memang {perasaan}',
          nonverbal: 'Berbicara pelan dengan kejernihan emosi yang tenang.',
        },
        {
          ucapan: 'Bagian emosionalnya yang jarang kusadari atau kuucapkan adalah ini: {perasaan}',
          nonverbal: 'Menatap konselor dengan tenang dan bahu sepenuhnya rileks.',
        },
        {
          ucapan: 'Refleksi barusan kena sekali—memang selama ini {perasaan}',
          nonverbal: 'Mengangguk perlahan sambil menarik napas dalam.',
        },
        {
          ucapan: 'Di balik sikapku yang terlihat tenang di lab, sejujurnya {perasaan}',
          nonverbal: 'Menurunkan pandangan sejenak lalu menatap dengan hangat.',
        },
        {
          ucapan: 'Baru kali ini aku mengucapkannya keras-keras: {perasaan}',
          nonverbal: 'Mengendurkan postur dan meletakkan pulpen di samping buku.',
        },
        {
          ucapan: 'Mungkin itu sebabnya aku sering memilih diam di sudut lab, karena {perasaan}',
          nonverbal: 'Tersenyum tipis penuh rasa lega setelah berbagi perasaan.',
        },
      ],
    },
    'menarik-diri': {
      'ringkas-hati-hati': [
        {
          ucapan: 'Hmm... kayaknya tadi aku kelepasan cerita kebanyakan, enggak apa-apa kok sebenarnya.',
          nonverbal: 'Kembali menunduk dan menarik tangan dari atas meja.',
        },
        {
          ucapan: 'Perasaanku? Ya gitu aja sih, biasa mahasiswa capek, enggak perlu dibahas terus.',
          nonverbal: 'Menggeser kursi sedikit menjauh dengan suara melemah.',
        },
        {
          ucapan: 'Mungkin aku aja yang terlalu perasa kemarin. Sekarang udah mendingan kok.',
          nonverbal: 'Menghindari tatapan dan membetulkan tali tas.',
        },
        {
          ucapan: 'Enggak usah terlalu dipikirin soal perasaanku tadi, aku bisa atur sendiri.',
          nonverbal: 'Mengatupkan bibir dan menatap permukaan meja.',
        },
        {
          ucapan: 'Aduh, jadi canggung sendiri ngomongin perasaan... bahas kerjaannya aja yuk.',
          nonverbal: 'Menggaruk lengan sambil tersenyum kaku.',
        },
        {
          ucapan: 'Ya wajarlah agak kepikiran, tapi enggak separah itu kok.',
          nonverbal: 'Menundukkan bahu dan menjaga jarak aman.',
        },
      ],
      'ekspresif-langsung': [
        {
          ucapan: 'Eh kok jadi melow gini sih, udah ah enggak usah dibahas bagian rasanya.',
          nonverbal: 'Tertawa canggung sambil memalingkan wajah ke samping.',
        },
        {
          ucapan: 'Enggak kok, aku enggak selemah itu. Tadi cuma lagi capek aja ngomongnya.',
          nonverbal: 'Mengibaskan tangan ringan namun bahu menegang.',
        },
        {
          ucapan: 'Udahlah, soal perasaan mah nanti hilang sendiri kalau tugasnya kelar.',
          nonverbal: 'Menarik napas cepat lalu melirik ke arah lab.',
        },
        {
          ucapan: 'Kayaknya aku kebanyakan ngeluh barusan ya? Malu sendiri dengernya.',
          nonverbal: 'Menutupi sebagian mulut dengan tangan sambil menunduk.',
        },
        {
          ucapan: 'Jangan dianggap serius banget deh curhatanku tadi, biasa aja kok.',
          nonverbal: 'Menggeser posisi duduk menjauh dari meja.',
        },
        {
          ucapan: 'Aku jarang banget ngomong gini, jadi agak aneh rasanya kalau dilanjutin.',
          nonverbal: 'Menggenggam pulpen erat dengan mata melihat ke bawah.',
        },
      ],
      'reflektif-tenang': [
        {
          ucapan: 'Sebenarnya tadi sempat terasa aman, tapi sekarang aku merasa agak terlalu terbuka.',
          nonverbal: 'Menghela napas pelan dan kembali menjaga jarak.',
        },
        {
          ucapan: 'Boleh kita jeda dulu dari pembahasan perasaannya? Aku masih butuh ruang.',
          nonverbal: 'Menyilangkan tangan dengan tenang namun tertutup.',
        },
        {
          ucapan: 'Aku khawatir kalau terlalu banyak bicara soal emosi, kesannya aku tidak profesional.',
          nonverbal: 'Menurunkan pandangan ke catatan praktikumnya.',
        },
        {
          ucapan: 'Mungkin cukup sampai di situ dulu ya untuk bagian yang terasa berat itu.',
          nonverbal: 'Mengangguk pelan dengan raut wajah kembali datar.',
        },
        {
          ucapan: 'Agak canggung rasanya membuka sisi rapuh ini di lingkungan kampus.',
          nonverbal: 'Menarik buku catatan lebih dekat ke dadanya.',
        },
        {
          ucapan: 'Terima kasih sudah mendengarkan tadi, tapi sekarang aku ingin menahan diri dulu.',
          nonverbal: 'Memandang lurus ke meja dengan sikap hening.',
        },
      ],
    },
    defensif: {
      'ringkas-hati-hati': [
        {
          ucapan: 'Aku udah jujur soal perasaanku lho, tolong jangan diremehin begitu.',
          nonverbal: 'Mengerutkan alis dengan tatapan kecewa dan defensif.',
        },
        {
          ucapan: 'Jangan ditebak-tebak kayak aku lagi marah terus gitu dong, rasanya enggak pas.',
          nonverbal: 'Menarik bahu ke belakang dan menyilangkan lengan.',
        },
        {
          ucapan: 'Kalau perasaan capekku dianggap wajar semua orang juga gitu, ya buat apa cerita?',
          nonverbal: 'Menghela napas kasar sambil menutup buku.',
        },
        {
          ucapan: 'Bukan berarti aku enggak tahan tekanan, cuma caranya aja yang kurang cocok.',
          nonverbal: 'Menegakkan punggung dengan ekspresi bertahan.',
        },
        {
          ucapan: 'Aku enggak minta dikasihani kok, cuma butuh didengerin tanpa disalah-salahin.',
          nonverbal: 'Menatap tajam sebentar dengan suara datar.',
        },
        {
          ucapan: 'Kok malah langsung dikasih saran gitu sih pas aku baru cerita rasanya?',
          nonverbal: 'Menggeleng kecil dengan raut wajah kurang nyaman.',
        },
      ],
      'ekspresif-langsung': [
        {
          ucapan: 'Waduh, aku baru aja jujur soal rasaku kok malah langsung dibandingin sama teman lain!',
          nonverbal: 'Menunjuk pelan ke arah meja dengan nada kecewa.',
        },
        {
          ucapan: 'Enggak gitu perasaanku! Jangan asal nebak emosi orang kalau belum beneran dengerin.',
          nonverbal: 'Menggeleng cepat dan menyandarkan punggung keras.',
        },
        {
          ucapan: 'Kalau ujung-ujungnya disuruh sabar dan jangan manja, ya udah enggak usah dilanjutin.',
          nonverbal: 'Menyilangkan kedua lengan erat dengan tatapan tajam.',
        },
        {
          ucapan: 'Aku cerita biar jelas keadaannya, bukan biar diceramahi dari awal sampai akhir!',
          nonverbal: 'Suara mengeras sedikit dengan rahang tegang.',
        },
        {
          ucapan: 'Jujur nyesel agak kebuka tadi kalau tanggapannya langsung menghakimi begitu.',
          nonverbal: 'Membuang muka ke samping sambil menghela napas.',
        },
        {
          ucapan: 'Tolong hargai sedikit rasa berat yang lagi kualamin, jangan dianggap enteng.',
          nonverbal: 'Menatap serius dengan alis berkerut rapat.',
        },
      ],
      'reflektif-tenang': [
        {
          ucapan: 'Ketika aku sudah berani berbagi perasaan, respons seperti itu membuatku merasa tidak aman.',
          nonverbal: 'Berbicara pelan namun sangat tegas dan berjarak.',
        },
        {
          ucapan: 'Sepertinya tebakan emosi barusan meleset, dan cara menyampaikannya terasa mendesak.',
          nonverbal: 'Menarik kursi mundur sedikit sambil melipat tangan.',
        },
        {
          ucapan: 'Saya rasa membandingkan ketahanan mahasiswa satu dengan lainnya tidak membantu di sini.',
          nonverbal: 'Menatap dingin dengan postur tubuh sangat kaku.',
        },
        {
          ucapan: 'Aku baru membuka lapisan perasaanku, namun tanggapan tadi membuatku ingin menariknya kembali.',
          nonverbal: 'Menutup catatan pelan dengan ekspresi kecewa.',
        },
        {
          ucapan: 'Kalau kita tidak bisa sepakat menjaga nada diskusi tanpa menggurui, aku pilih berhenti.',
          nonverbal: 'Menghela napas panjang dan menahan tatapan serius.',
        },
        {
          ucapan: 'Aku tidak membutuhkan janji kosong, aku hanya ingin didengar secara adil.',
          nonverbal: 'Menjaga jarak duduk tanpa mengangguk.',
        },
      ],
    },
  },
  3: {
    terbuka: {
      'ringkas-hati-hati': [
        {
          ucapan: '{kebutuhan}',
          nonverbal: 'Menatap konselor dengan tenang dan napas tampak jauh lebih lega.',
        },
        {
          ucapan: 'Inti yang sebenarnya paling kubutuhkan sekarang cuma ini: {kebutuhan}',
          nonverbal: 'Mengangguk mantap dengan bahu sepenuhnya rileks.',
        },
        {
          ucapan: 'Kalau dipikir-pikir sampai ke akarnya, ya ini yang kuperluin: {kebutuhan}',
          nonverbal: 'Tersenyum hangat sambil membuka kedua tangan di meja.',
        },
        {
          ucapan: 'Aku enggak butuh solusi instan kok, yang penting {kebutuhan}',
          nonverbal: 'Mempertahankan kontak mata yang tenang dan penuh percaya.',
        },
        {
          ucapan: 'Makasih udah sabar dengerin sampai sini. Jadi intinya {kebutuhan}',
          nonverbal: 'Menghela napas lega dan duduk lebih nyaman.',
        },
        {
          ucapan: 'Akhirnya kebayang jelas apa yang kubutuhkan sekarang: {kebutuhan}',
          nonverbal: 'Mengangguk pelan dengan raut wajah jernih.',
        },
      ],
      'ekspresif-langsung': [
        {
          ucapan: 'Nah, sekarang baru ketemu inti utamanya! Sebenarnya {kebutuhan}',
          nonverbal: 'Tersenyum lega sambil mengangguk mantap ke konselor.',
        },
        {
          ucapan: 'Makasih banget udah mau dengerin tanpa nge-judge. Yang kubutuhkan tuh {kebutuhan}',
          nonverbal: 'Bahu turun santai dan tatapannya sangat terbuka.',
        },
        {
          ucapan: 'Jujur baru kali ini aku nemu ruang ngobrol seaman ini. Intinya {kebutuhan}',
          nonverbal: 'Condong ke depan dengan ekspresi bersemangat yang tenang.',
        },
        {
          ucapan: 'Iya! Akar masalahnya ternyata bukan soal alatnya doang, tapi {kebutuhan}',
          nonverbal: 'Menghela napas panjang penuh kelegaan.',
        },
        {
          ucapan: 'Kalau bisa ada ruang buat itu, aku yakin masih bisa jalan terus: {kebutuhan}',
          nonverbal: 'Menatap hangat dengan kedua tangan santai di meja.',
        },
        {
          ucapan: 'Lega banget akhirnya bisa ngomong blak-blakan begini: {kebutuhan}',
          nonverbal: 'Tersenyum tulus sambil merapikan catatannya dengan tenang.',
        },
      ],
      'reflektif-tenang': [
        {
          ucapan: 'Setelah mengurai semuanya dari awal, aku sadar kebutuhan intiku adalah ini: {kebutuhan}',
          nonverbal: 'Menatap dengan ketenangan penuh dan senyum tipis yang tulus.',
        },
        {
          ucapan: 'Bukan soal menghindari tanggung jawab, melainkan {kebutuhan}',
          nonverbal: 'Berbicara jernih dengan postur terbuka dan seimbang.',
        },
        {
          ucapan: 'Keberadaan ruang aman seperti ini membantuku melihat bahwa {kebutuhan}',
          nonverbal: 'Mengangguk perlahan penuh kesadaran diri.',
        },
        {
          ucapan: 'Jika ditanya langkah kecil apa yang paling bermakna buatku sekarang, {kebutuhan}',
          nonverbal: 'Meletakkan tangan santai di atas buku catatan.',
        },
        {
          ucapan: 'Terima kasih sudah menjaga ritme percakapan ini. Pada dasarnya {kebutuhan}',
          nonverbal: 'Menarik napas dalam dan tersenyum dengan tenang.',
        },
        {
          ucapan: 'Sekarang pikiranku jauh lebih jernih—ternyata yang paling kuperlukan adalah {kebutuhan}',
          nonverbal: 'Memandang konselor dengan rasa percaya yang stabil.',
        },
      ],
    },
    'menarik-diri': {
      'ringkas-hati-hati': [
        {
          ucapan: 'Iya aku tahu aku butuh dibantu atur langkahnya, tapi aku takut ngerepotin.',
          nonverbal: 'Menunduk sebentar sambil mengelus tepi meja.',
        },
        {
          ucapan: 'Maaf... tadi udah kebuka banget, sekarang tiba-tiba bingung lagi mulai dari mana.',
          nonverbal: 'Menarik napas pendek dan mengecilkan bahu.',
        },
        {
          ucapan: 'Aku cuma khawatir kalau rencana ini dibawa ke tim, malah jadi canggung lagi.',
          nonverbal: 'Memandang ke lantai sambil menggenggam pulpen.',
        },
        {
          ucapan: 'Sebenarnya aku ingin coba pelan-pelan, asal enggak ada yang tahu dulu.',
          nonverbal: 'Melirik ke arah pintu ruangan dengan cemas.',
        },
        {
          ucapan: 'Enggak apa-apa kan kalau untuk langkah awalnya aku pikirin sendiri dulu semalam?',
          nonverbal: 'Menggeser posisi duduk sedikit ke belakang.',
        },
        {
          ucapan: 'Aku hargai semuanya, cuma butuh waktu jeda sebentar sebelum mutusin langkahnya.',
          nonverbal: 'Menutup buku pelan sambil menunduk sopan.',
        },
      ],
      'ekspresif-langsung': [
        {
          ucapan: 'Aduh, aku udah cerita sampai dalam banget ya... semoga aman beneran ya di sini.',
          nonverbal: 'Melirik ke jendela sambil menarik napas gelisah.',
        },
        {
          ucapan: 'Aku butuh langkah itu sih, tapi masih takut kalau nanti diomongin di lab.',
          nonverbal: 'Menggosok kedua telapak tangan dengan raut ragu.',
        },
        {
          ucapan: 'Bisa enggak kita cukupin dulu sampai sini? Kepalaku agak penuh setelah ngomong panjang.',
          nonverbal: 'Menyandarkan punggung sambil menghela napas lelah.',
        },
        {
          ucapan: 'Iya aku sadar kebutuhanku, tapi rasanya masih berat kalau langsung berubah besok.',
          nonverbal: 'Menggeleng kecil dengan senyum yang memudar.',
        },
        {
          ucapan: 'Jangan bilang siapa-siapa dulu ya soal obrolan kita yang tadi.',
          nonverbal: 'Menurunkan suara dan menoleh sebentar ke arah koridor.',
        },
        {
          ucapan: 'Aku pengin coba kok, cuma butuh jaminan pelan-pelan aja temponya.',
          nonverbal: 'Menunduk sebentar lalu kembali melihat catatan.',
        },
      ],
      'reflektif-tenang': [
        {
          ucapan: 'Meski aku sudah tahu kebutuhanku, ada rasa cemas memikirkan reaksi lingkungan lab.',
          nonverbal: 'Menatap meja dengan tenang namun bahu sedikit menegang.',
        },
        {
          ucapan: 'Aku agak kewalahan setelah membuka inti ceritanya; boleh kita melangkah sangat pelan?',
          nonverbal: 'Menarik napas dalam dan melipat tangan.',
        },
        {
          ucapan: 'Ada bagian diriku yang masih ragu mempercayakan detail ini sepenuhnya.',
          nonverbal: 'Menurunkan pandangan sambil berbicara lirih.',
        },
        {
          ucapan: 'Mungkin untuk hari ini cukup di sini dulu agar aku bisa menenangkan pikiran.',
          nonverbal: 'Mengangguk sopan namun menarik jarak duduk.',
        },
        {
          ucapan: 'Aku butuh memastikan batas kerahasiaannya benar-benar terjaga sebelum melangkah.',
          nonverbal: 'Memandang konselor dengan penuh kehati-hatian.',
        },
        {
          ucapan: 'Terima kasih sudah menemani sampai titik ini, sisanya ingin kurenungkan dulu.',
          nonverbal: 'Merapikan pulpen dan catatan secara perlahan.',
        },
      ],
    },
    defensif: {
      'ringkas-hati-hati': [
        {
          ucapan: 'Aku sudah terbuka sampai inti masalahnya lho, jangan langsung mendikte harus gimana.',
          nonverbal: 'Mengerutkan dahi dengan kedua tangan menyilang.',
        },
        {
          ucapan: 'Keputusan langkah selanjutnya tetap punyaku, bukan untuk dipaksakan.',
          nonverbal: 'Menegakkan punggung dan menatap tegas.',
        },
        {
          ucapan: 'Jangan pakai ceritaku tadi buat menekan aku harus berubah cepat.',
          nonverbal: 'Menarik kursi sedikit menjauh dengan rahang mengeras.',
        },
        {
          ucapan: 'Aku butuh didampingi milih, bukan dikasih perintah siap jadi.',
          nonverbal: 'Menghela napas pendek dengan nada suara datar.',
        },
        {
          ucapan: 'Kalau jaminannya terlalu mutlak begitu, aku malah sangsi bisa dipegang.',
          nonverbal: 'Mengangkat sebelah alis sambil melihat konselor.',
        },
        {
          ucapan: 'Kita udah bahas dalam banget, jadi tolong hargai batasanku juga.',
          nonverbal: 'Menutup catatan sambil menjaga jarak duduk.',
        },
      ],
      'ekspresif-langsung': [
        {
          ucapan: 'Eh, aku udah percaya cerita sampai ke akarnya kok malah direspon kayak gitu!',
          nonverbal: 'Menatap tajam dengan kedua bahu menegang.',
        },
        {
          ucapan: 'Jangan janjikan hal yang enggak masuk akal dong, aku juga tahu batas realitanya!',
          nonverbal: 'Menggeleng tegas dengan ekspresi kurang percaya.',
        },
        {
          ucapan: 'Yang ngadepin lab besok itu aku, jadi biarin aku yang nentuin ritmenya!',
          nonverbal: 'Mengangkat dagu sedikit sambil menyilangkan lengan.',
        },
        {
          ucapan: 'Kalau ujungnya tetap nyuruh aku ngikutin satu cara doang, percuma dong tadi cerita.',
          nonverbal: 'Membuang napas kasar dan memandang ke samping.',
        },
        {
          ucapan: 'Tolong jangan bawa-bawa perbandingan sama teman lain lagi setelah aku jujur begini.',
          nonverbal: 'Menunjuk pelan ke meja dengan nada membela diri.',
        },
        {
          ucapan: 'Aku cuma mau punya kontrol atas langkahku sendiri, bukan diatur penuh.',
          nonverbal: 'Menatap langsung tanpa senyum dengan sikap bertahan.',
        },
      ],
      'reflektif-tenang': [
        {
          ucapan: 'Setelah aku menyampaikan kebutuhan terdalamku, respons barusan terasa mengambil alih kendaliku.',
          nonverbal: 'Duduk tegak dan menatap dengan sorot berjarak.',
        },
        {
          ucapan: 'Janji yang terlalu mutlak justru mengurangi rasa percayaku terhadap proses ini.',
          nonverbal: 'Menggeleng pelan dengan ekspresi serius.',
        },
        {
          ucapan: 'Aku bersedia melangkah, namun otonomi keputusannya harus tetap berada di tanganku.',
          nonverbal: 'Menyilangkan tangan dengan tenang namun tegas.',
        },
        {
          ucapan: 'Cara penyampaian tadi membuat ruang aman yang sudah dibangun terasa menyempit.',
          nonverbal: 'Menarik napas panjang sambil menjaga nada tetap rendah.',
        },
        {
          ucapan: 'Sebelum kita lanjut, aku perlu tahu bahwa pilihanku benar-benar dihormati.',
          nonverbal: 'Memandang lurus tanpa mengubah ekspresi.',
        },
        {
          ucapan: 'Kurasa kita perlu melambat sejenak; aku tidak nyaman jika didesak setelah terbuka.',
          nonverbal: 'Meletakkan pulpen dan mundur setengah langkah dari meja.',
        },
      ],
    },
  },
};

function interpolateTemplate(
  raw: string,
  agentName: string,
  level: DisclosureLevel,
  problem: AgentTieredProblem
): string {
  // Pastikan slot level tinggi tidak pernah muncul di level rendah
  const safeFact = level >= 1 ? problem.l1Fact : '';
  const safeFeeling = level >= 2 ? problem.l2Feeling : '';
  const safeNeed = level >= 3 ? problem.l3CoreNeed : '';

  return raw
    .replaceAll('{nama}', agentName)
    .replaceAll('{fakta}', safeFact)
    .replaceAll('{perasaan}', safeFeeling)
    .replaceAll('{kebutuhan}', safeNeed)
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Respons cadangan offline berbasis keterampilan konselor agar balasan selalu
 * nyambung langsung dengan ucapan/pilihan konselor (terutama pada mode offline tanpa Gemini API).
 * Seluruh teks <= 30 kata dan nonverbal <= 12 kata.
 */
const SKILL_OFFLINE_VARIANTS: Partial<
  Record<CounselorSkillId, Record<AgentDialogueTone, readonly UtteranceTemplateVariant[]>>
> = {
  'sapaan-hangat': {
    terbuka: [
      {
        ucapan: 'Halo juga, kabarku lumayan baik kok hari ini. Cuma jadwal praktikum di lab lagi agak padat aja.',
        nonverbal: 'Menoleh ramah dan tersenyum tipis ke arah konselor.',
      },
      {
        ucapan: 'Baik kok, makasih udah nanya. Hari ini lab lumayan ramai, aku baru aja selesai beresin meja.',
        nonverbal: 'Mengangguk sopan dengan bahu tampak rileks.',
      },
      {
        ucapan: 'Halo, alhamdulillah masih aman hari ini. Agak ngebut dikit di stasiun, tapi masih kepegang kok.',
        nonverbal: 'Tersenyum ringan sambil meletakkan pulpen di buku catatan.',
      },
    ],
    'menarik-diri': [
      {
        ucapan: 'Oh, halo... kabarku biasa aja kok, aman. Cuma agak capek dikit sama tugas minggu ini.',
        nonverbal: 'Menunduk singkat sambil merapikan ujung catatannya.',
      },
      {
        ucapan: 'Iya, baik kok. Makasih udah nyapa, aku cuma lagi fokus nyelesain bagianku dulu.',
        nonverbal: 'Mengangguk pelan tanpa menatap terlalu lama.',
      },
      {
        ucapan: 'Baik-baik aja kok, enggak ada hal khusus. Hari ini cuma lumayan padat aja di lab.',
        nonverbal: 'Tersenyum kaku sambil memegang map di pangkuan.',
      },
    ],
    defensif: [
      {
        ucapan: 'Baik kok. Ada hal khusus ya sampai aku disapa begini?',
        nonverbal: 'Menegakkan punggung dengan tatapan agak waspada.',
      },
      {
        ucapan: 'Kabarku aman aja, kerjaanku di lab juga masih jalan kok.',
        nonverbal: 'Melipat lengan singkat sambil menjaga jarak duduk.',
      },
      {
        ucapan: 'Biasa aja sih, nggak ada masalah. Kenapa memangnya?',
        nonverbal: 'Menatap konselor dengan alis sedikit terangkat.',
      },
    ],
  },
  'pertanyaan-terbuka': {
    terbuka: [
      {
        ucapan: 'Kalau ditanya soal itu, minggu ini memang lumayan padat mengatur agenda praktikum di lab.',
        nonverbal: 'Berpikir sejenak lalu menatap konselor dengan tenang.',
      },
      {
        ucapan: 'Yang lagi kepikiran belakangan ini sih soal bagi waktu biar semua kegiatan lab nggak bentrok.',
        nonverbal: 'Mengangguk pelan sambil membuka buku catatannya.',
      },
      {
        ucapan: 'Jujurly lumayan banyak yang muter di kepala minggu ini, khususnya soal urutan kerja di stasiun.',
        nonverbal: 'Menghela napas ringan dengan sikap cukup terbuka.',
      },
    ],
    'menarik-diri': [
      {
        ucapan: 'Hmm... belum banyak yang bisa kuceritain sih, paling cuma soal kegiatan lab yang lagi ramai.',
        nonverbal: 'Memandang meja sambil memutar pulpen pelan.',
      },
      {
        ucapan: 'Enggak ada yang spesifik banget kok, cuma rutinitas praktikum biasa aja minggu ini.',
        nonverbal: 'Mengangkat bahu ringan sambil menghindari kontak mata.',
      },
    ],
    defensif: [
      {
        ucapan: 'Kenapa memangnya? Menurutku kondisiku di lab masih wajar-wajar aja kok.',
        nonverbal: 'Menyilangkan lengan dengan ekspresi menjaga jarak.',
      },
      {
        ucapan: 'Aku kurang yakin bagian mana yang dimaksud, sejauh ini tugasku tetap kukerjakan.',
        nonverbal: 'Duduk tegak dan menatap datar ke depan.',
      },
    ],
  },
  'pertanyaan-tertutup': {
    terbuka: [
      {
        ucapan: 'Iya, kurang lebih begitu sih keadaannya di lab hari ini.',
        nonverbal: 'Mengangguk singkat lalu menunggu tanggapan konselor.',
      },
      {
        ucapan: 'Benar, kira-kira memang seperti itu situasinya sekarang.',
        nonverbal: 'Menjawab ringkas dengan raut wajah cukup tenang.',
      },
    ],
    'menarik-diri': [
      {
        ucapan: 'Iya, aman kok. Gitu aja.',
        nonverbal: 'Menjawab sangat pendek sambil melirik ke arah meja kerja.',
      },
      {
        ucapan: 'Enggak kok, biasa aja.',
        nonverbal: 'Mengangguk tipis tanpa menambahkan penjelasan.',
      },
    ],
    defensif: [
      {
        ucapan: 'Ya, memang begitu. Terus kenapa?',
        nonverbal: 'Menjawab singkat dengan nada datar dan kaku.',
      },
      {
        ucapan: 'Bukan sesederhana ya atau enggak sih sebenarnya.',
        nonverbal: 'Mengerutkan dahi sambil menyender ke sandaran kursi.',
      },
    ],
  },
  'refleksi-perasaan': {
    terbuka: [
      {
        ucapan: 'Iya... persis banget sih. Rasanya memang seperti itu yang paling kerasa belakangan ini.',
        nonverbal: 'Bahu tampak mengendur dan matanya melembut saat merasa dipahami.',
      },
      {
        ucapan: 'Lega juga ada yang nangkep rasanya. Memang itu yang agak bikin berat beberapa hari ini.',
        nonverbal: 'Menghela napas panjang lalu mengangguk tulus.',
      },
    ],
    'menarik-diri': [
      {
        ucapan: 'Mmm... mungkin sedikit seperti itu, tapi aku masih bisa tahan sendiri kok.',
        nonverbal: 'Menunduk pelan dengan jari mengetuk tepi catatan.',
      },
      {
        ucapan: 'Ya, ada sedikit rasa begitu sih, cuma aku jarang aja bahas soal perasaan.',
        nonverbal: 'Menggeser posisi duduk sedikit dengan ekspresi canggung.',
      },
    ],
    defensif: [
      {
        ucapan: 'Jangan langsung menyimpulkan perasaanku gitu dong, situasinya nggak sesimpel itu.',
        nonverbal: 'Menggeleng tegas dengan bahu kembali menegang.',
      },
    ],
  },
  'parafrase-ringkasan': {
    terbuka: [
      {
        ucapan: 'Iya, pas banget rangkumannya. Kira-kira memang itu inti yang lagi kuhadapi sekarang.',
        nonverbal: 'Mengangguk mantap dengan ekspresi merasa didengarkan.',
      },
      {
        ucapan: 'Betul, kurang lebih poin utamanya memang di situ. Enak juga dengernya pas dirangkum rapi.',
        nonverbal: 'Tersenyum tipis dan menatap konselor lebih nyaman.',
      },
    ],
    'menarik-diri': [
      {
        ucapan: 'Kurang lebih iya, kira-kira sebatas itu aja sih gambarannya.',
        nonverbal: 'Mengangguk pelan sambil merapikan mapnya.',
      },
    ],
    defensif: [
      {
        ucapan: 'Agak beda sih dari yang kumaksud tadi, bukan berarti aku nggak bisa ngatur sendiri.',
        nonverbal: 'Mengerutkan alis sambil mengoreksi dengan nada hati-hati.',
      },
    ],
  },
  'validasi-normalisasi': {
    terbuka: [
      {
        ucapan: 'Makasih udah bilang begitu. Agak lega dengar kalau rasaku ini masih wajar.',
        nonverbal: 'Menghembuskan napas lega dengan bahu lebih turun.',
      },
      {
        ucapan: 'Syukurlah kalau dianggap wajar... tadinya kupikir cuma aku aja yang keteteran begini.',
        nonverbal: 'Tersenyum tipis dan mulai lebih santai duduknya.',
      },
    ],
    'menarik-diri': [
      {
        ucapan: 'Iya, makasih... mungkin memang lagi padat aja sih minggu ini.',
        nonverbal: 'Mengangguk kecil, masih agak menjaga jarak.',
      },
    ],
    defensif: [
      {
        ucapan: 'Oke, aku hargai niatnya, tapi aku masih butuh waktu buat nyaman cerita lebih jauh.',
        nonverbal: 'Menarik napas pelan dengan postur tetap tegak.',
      },
    ],
  },
  'sampaikan-pengamatan': {
    terbuka: [
      {
        ucapan: 'Eh, kelihatan juga ya? Iya sih, tadi aku memang lagi agak kepikiran pas di stasiun.',
        nonverbal: 'Sedikit terkejut lalu tersenyum canggung dan mengangguk.',
      },
      {
        ucapan: 'Iya, benar, aku memang sempat berhenti sebentar tadi buat nyusun ulang urutannya.',
        nonverbal: 'Menatap konselor dengan sikap terbuka dan jujur.',
      },
    ],
    'menarik-diri': [
      {
        ucapan: 'Oh, kelihatan ya? Aku cuma lagi butuh fokus aja kok tadi, enggak ada apa-apa.',
        nonverbal: 'Mengalihkan pandangan sejenak sambil meremas pulpen.',
      },
    ],
    defensif: [
      {
        ucapan: 'Aku cuma lagi fokus ngerjain bagianku kok, jangan langsung dinilai menghindar dong.',
        nonverbal: 'Menyilangkan lengan dengan rahang agak mengeras.',
      },
    ],
  },
  'afirmasi-kekuatan': {
    terbuka: [
      {
        ucapan: 'Hehe, makasih sudah merhatiin usahaku. Di bagian itu aku memang selalu jaga kualitasnya.',
        nonverbal: 'Tersenyum hangat dan duduk sedikit lebih tegak.',
      },
      {
        ucapan: 'Makasih ya, senang juga ada yang lihat kerja kerasku di lab selama ini.',
        nonverbal: 'Wajahnya tampak lebih cerah saat menerima apresiasi.',
      },
    ],
    'menarik-diri': [
      {
        ucapan: 'Oh... makasih, biasa aja kok sebenarnya, cuma ngerjain tanggung jawabku aja.',
        nonverbal: 'Tersenyum kecil sambil menunduk malu-malu.',
      },
    ],
    defensif: [
      {
        ucapan: 'Ya, aku memang selalu serius ngerjain bagianku kok.',
        nonverbal: 'Mengangguk kaku namun bahunya sedikit melunak.',
      },
    ],
  },
  'jeda-hening': {
    terbuka: [
      {
        ucapan: 'Makasih udah ngasih waktu bentar... aku tarik napas dulu biar bisa jelasin lebih rapi.',
        nonverbal: 'Menghela napas perlahan lalu menatap konselor lebih tenang.',
      },
      {
        ucapan: 'Enak juga nggak diburu-buru. Jadi aku bisa mikir pelan-pelan mulai dari mana.',
        nonverbal: 'Meletakkan kedua tangan santai di atas meja.',
      },
    ],
    'menarik-diri': [
      {
        ucapan: 'Mmm... hening gini aku malah agak bingung harus mulai ngomong dari mana.',
        nonverbal: 'Melirik jam dinding sambil memainkan ujung lengan baju.',
      },
    ],
    defensif: [
      {
        ucapan: 'Kalau cuma diam begini, aku balik ke meja kerja dulu aja ya.',
        nonverbal: 'Menggeser kursi bersiap berdiri dengan ekspresi kaku.',
      },
    ],
  },
  'batas-kerahasiaan': {
    terbuka: [
      {
        ucapan: 'Oh, lega banget dengernya. Tahu aturan kerahasiaannya jelas bikin aku lebih tenang ngobrol.',
        nonverbal: 'Mengangguk mantap dengan bahu tampak jauh lebih rileks.',
      },
      {
        ucapan: 'Oke, kalau obrolan ini aman di antara kita, aku jadi lebih nyaman buat cerita.',
        nonverbal: 'Tersenyum lega sambil menyandarkan punggung ke kursi.',
      },
    ],
    'menarik-diri': [
      {
        ucapan: 'Oke, makasih udah jelasin dari awal. Itu cukup membantu biar aku nggak terlalu segan.',
        nonverbal: 'Mengangguk pelan meski masih menjaga jarak aman.',
      },
    ],
    defensif: [
      {
        ucapan: 'Baik, kupegang penjelasannya ya soal aturan privasi itu.',
        nonverbal: 'Menatap serius sebelum sedikit mengendurkan bahunya.',
      },
    ],
  },
  interogasi: {
    terbuka: [
      {
        ucapan: 'Sebentar, kok nadanya jadi kayak menyelidiki aku ya? Aku jadi kurang nyaman jawabnya.',
        nonverbal: 'Menghentikan gerakan tangan dan menatap dengan kening berkerut.',
      },
    ],
    'menarik-diri': [
      {
        ucapan: 'Maaf... kalau ditanya terus kayak gitu aku malah bingung mau jawab apa.',
        nonverbal: 'Menunduk dalam dan menarik kursinya sedikit menjauh.',
      },
    ],
    defensif: [
      {
        ucapan: 'Kok nadanya seperti menginterogasi sih? Aku ke lab buat praktikum, bukan buat diadili.',
        nonverbal: 'Menyilangkan lengan rapat dengan tatapan tajam.',
      },
    ],
  },
  'nasihat-dini': {
    terbuka: [
      {
        ucapan: 'Sebenarnya aku udah kepikiran cara itu, cuma di lapangannya nggak semudah itu jalaninnya.',
        nonverbal: 'Menghela napas pendek dengan senyum tipis yang agak kaku.',
      },
    ],
    'menarik-diri': [
      {
        ucapan: 'Iya sih, nanti kucoba atur sendiri aja... makasih sarannya.',
        nonverbal: 'Menunduk dan menutup buku catatannya perlahan.',
      },
    ],
    defensif: [
      {
        ucapan: 'Kalau cuma disuruh begitu tanpa dengar situasinya dulu, rasanya aku nggak didengerin.',
        nonverbal: 'Menggeleng tegas dengan bahu menegang.',
      },
    ],
  },
  meremehkan: {
    terbuka: [
      {
        ucapan: 'Buat orang lain mungkin kelihatan sepele, tapi buatku yang ngejalanin rasanya cukup berat.',
        nonverbal: 'Senyumnya memudar dan ia menatap meja dengan kecewa.',
      },
    ],
    'menarik-diri': [
      {
        ucapan: 'Oh... iya mungkin aku aja yang berlebihan. Nggak usah dibahas lagi deh.',
        nonverbal: 'Menunduk dan merapikan tas seolah ingin mengakhiri obrolan.',
      },
    ],
    defensif: [
      {
        ucapan: 'Tolong jangan dibandingin sama mahasiswa lain dong, kondisi tiap orang kan beda!',
        nonverbal: 'Rahang mengeras dengan tatapan langsung yang defensif.',
      },
    ],
  },
  'janji-mutlak': {
    terbuka: [
      {
        ucapan: 'Dijamin seratus persen? Agak sulit percaya sih kalau semuanya bisa dipastikan begitu.',
        nonverbal: 'Mengangkat sebelah alis dengan raut wajah ragu.',
      },
    ],
    'menarik-diri': [
      {
        ucapan: 'Hmm... kayaknya nggak ada yang bisa dijamin pasti begitu deh.',
        nonverbal: 'Menunduk singkat sambil menggeleng kecil.',
      },
    ],
    defensif: [
      {
        ucapan: 'Jangan kasih janji mutlak dong, aku juga tahu realitanya nggak ada yang 100% pasti.',
        nonverbal: 'Menyilangkan lengan dengan sorot mata sangsi.',
      },
    ],
  },
};

function isGreetingPrompt(text?: string): boolean {
  if (!text) return false;
  const low = text.toLowerCase();
  return /\b(halo|hai|selamat pagi|selamat siang|selamat sore|apa kabar|gimana kabar|kabarnya|kabarmu)\b/.test(low);
}

export function selectOfflineTemplatedUtterance(params: {
  agent: StudentAgent;
  problem: AgentTieredProblem;
  level: DisclosureLevel;
  tone: AgentDialogueTone;
  seed: number;
  turnNumber: number;
  skillId?: CounselorSkillId;
  counselorText?: string;
  disclosedNewLayer?: boolean;
  reflectionIncorrect?: boolean;
  accusatoryObservation?: boolean;
  alreadyExplainedConfidentiality?: boolean;
  recentReplies?: readonly string[];
}): GeneratedUtterancePayload {
  const {
    agent,
    problem,
    level,
    tone,
    seed,
    turnNumber,
    skillId,
    counselorText,
    disclosedNewLayer,
    reflectionIncorrect,
    accusatoryObservation,
    alreadyExplainedConfidentiality,
    recentReplies = [],
  } = params;

  const style = deriveAgentSpeakingStyle(agent);

  // Pilih secara deterministik ber-seed
  let agentNumeric = 0;
  for (let i = 0; i < agent.id.length; i += 1) {
    agentNumeric = (agentNumeric * 31 + agent.id.charCodeAt(i)) >>> 0;
  }
  const rng = mulberry32((seed ^ agentNumeric ^ (turnNumber * 2654435761)) >>> 0);

  const pickFresh = (pool: readonly UtteranceTemplateVariant[]): UtteranceTemplateVariant => {
    const startIdx = Math.floor(rng() * pool.length);
    for (let offset = 0; offset < pool.length; offset += 1) {
      const candidate = pool[(startIdx + offset) % pool.length];
      const rendered = interpolateTemplate(candidate.ucapan, agent.name, level, problem);
      if (!recentReplies.includes(rendered)) {
        return candidate;
      }
    }
    return pool[startIdx] ?? pool[0];
  };

  // Kasus khusus respons deterministik spesifik keterampilan agar 100% nyambung
  if (skillId === 'refleksi-perasaan' && reflectionIncorrect) {
    return {
      ucapan: 'Bukan persis seperti itu sih... rasanya agak beda dari yang barusan ditebak.',
      nonverbal: 'Berkedip singkat dan menggeser duduk dengan raut agak ragu.',
    };
  }
  if (skillId === 'sampaikan-pengamatan' && accusatoryObservation) {
    return {
      ucapan: 'Aku cuma lagi fokus ngerjain bagianku sendiri kok, bukan berarti menghindar.',
      nonverbal: 'Bahu menegang singkat dan menjawab dengan nada menjaga jarak.',
    };
  }
  if (skillId === 'batas-kerahasiaan' && alreadyExplainedConfidentiality) {
    return {
      ucapan: 'Iya, aku masih ingat penjelasan soal aturan kerahasiaan yang tadi disampaikan.',
      nonverbal: 'Mengangguk singkat sambil mempertahankan sikap tenang.',
    };
  }

  // Jika baru membuka lapisan baru (L1/L2/L3) dengan nada terbuka, suarakan fakta/perasaan/kebutuhan lapisan itu
  if (disclosedNewLayer && level >= 1 && tone === 'terbuka') {
    const layerVariants = UTTERANCE_TEMPLATE_BANK[level][tone][style];
    const chosen = pickFresh(layerVariants);
    return {
      ucapan: interpolateTemplate(chosen.ucapan, agent.name, level, problem),
      nonverbal: chosen.nonverbal,
    };
  }

  // Jika keterampilan konselor diketahui (atau pesan berupa sapaan/tanya kabar), prioritaskan respons sesuai keterampilan
  const effectiveSkill: CounselorSkillId | undefined =
    skillId ?? (isGreetingPrompt(counselorText) ? 'sapaan-hangat' : undefined);

  if (effectiveSkill) {
    const skillPool = SKILL_OFFLINE_VARIANTS[effectiveSkill]?.[tone];
    if (skillPool && skillPool.length > 0) {
      // Pada level >= 1 dengan pertanyaan terbuka / refleksi / validasi bernada terbuka, gabungkan opsi lapisan & keterampilan
      const shouldUseLayerBank =
        level >= 1 &&
        tone === 'terbuka' &&
        (effectiveSkill === 'pertanyaan-terbuka' || effectiveSkill === 'refleksi-perasaan');
      const pool = shouldUseLayerBank
        ? UTTERANCE_TEMPLATE_BANK[level][tone][style]
        : skillPool;
      const chosen = pickFresh(pool);
      return {
        ucapan: interpolateTemplate(chosen.ucapan, agent.name, level, problem),
        nonverbal: chosen.nonverbal,
      };
    }
  }

  const variants = UTTERANCE_TEMPLATE_BANK[level][tone][style];
  const chosen = pickFresh(variants);

  return {
    ucapan: interpolateTemplate(chosen.ucapan, agent.name, level, problem),
    nonverbal: chosen.nonverbal,
  };
}

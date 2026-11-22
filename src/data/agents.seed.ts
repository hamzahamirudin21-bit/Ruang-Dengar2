import {
  AgentDemographicLabel,
  AgentHiddenCounselingVars,
  AgentInterests,
  AgentPersonality,
  AgentSkills,
  CounselingDomain,
  GridPoint,
  LabMapData,
  StudentAgent,
  ZoneType,
} from '../types';
import { NavigationGrid, isPointWalkable } from '../engine/pathfinding';
import {
  SeededRng,
  clamp01,
  clampAffinity,
  mulberry32,
  pickOne,
  randomRange,
} from '../engine/rng';

export interface StudentSeedBlueprint {
  id: string;
  name: string;
  cohort: number;
  demographicLabel: AgentDemographicLabel;
  uniquePotential: string;
  socialCircleHint: string;
  counselingDomain: CounselingDomain;
  interests: AgentInterests;
  skills: AgentSkills;
  personality: AgentPersonality;
  solitudePreference: number;
  initialZoneId: ZoneType;
  hiddenVars: AgentHiddenCounselingVars;
}

/**
 * Mahasiswa fiktif unik (jumlahnya `STUDENT_COUNT`) dengan latar belakang, minat majemuk, keterampilan,
 * kepribadian Big Five, potensi positif, dan peran sosial masing-masing (0% NPC kosong).
 */
export const STUDENT_BLUEPRINTS: readonly StudentSeedBlueprint[] = [
  // --- Kelompok 1: Tim IoT & Sensor Lapangan (3 mahasiswa: mhs-01 .. mhs-03) ---
  {
    id: 'mhs-01',
    name: 'Raka Pratama',
    cohort: 2024,
    demographicLabel: { genderLabel: 'Laki-laki', originLabel: 'Bandung', avatarHue: 205, hairStyle: 'pendek' },
    uniquePotential: 'Cepat mendiagnosis gangguan rangkaian sensor daya rendah',
    socialCircleHint: 'tim-iot',
    counselingDomain: 'belajar',
    interests: { cetak3d: 0.42, pemrograman: 0.78, pengelasan: 0.25, elektronika: 0.91 },
    skills: { cetak3d: 0.45, pemrograman: 0.72, pengelasan: 0.22, elektronika: 0.86, kolaborasi: 0.74 },
    personality: { openness: 0.76, conscientiousness: 0.81, extraversion: 0.68, agreeableness: 0.75, stressSensitivity: 0.34 },
    solitudePreference: 0.28,
    initialZoneId: 'elektronik-iot',
    hiddenVars: { trustInCounselor: 0.55, disclosureReadiness: 0.5, socialComfort: 0.78, stigmaSensitivity: 0.35, ruptureLevel: 0, primaryConcernSummary: 'Khawatir manajemen waktu sebagai koordinator proyek IoT' },
  },
  {
    id: 'mhs-02',
    name: 'Dimas Aditya',
    cohort: 2025,
    demographicLabel: { genderLabel: 'Laki-laki', originLabel: 'Semarang', avatarHue: 220, hairStyle: 'pendek' },
    uniquePotential: 'Tekun melakukan penyolderan komponen SMD yang rumit',
    socialCircleHint: 'tim-iot',
    counselingDomain: 'pribadi',
    interests: { cetak3d: 0.35, pemrograman: 0.52, pengelasan: 0.4, elektronika: 0.84 },
    skills: { cetak3d: 0.38, pemrograman: 0.49, pengelasan: 0.36, elektronika: 0.74, kolaborasi: 0.55 },
    personality: { openness: 0.54, conscientiousness: 0.72, extraversion: 0.34, agreeableness: 0.64, stressSensitivity: 0.69 },
    solitudePreference: 0.58,
    initialZoneId: 'elektronik-iot',
    hiddenVars: { trustInCounselor: 0.35, disclosureReadiness: 0.28, socialComfort: 0.42, stigmaSensitivity: 0.72, ruptureLevel: 0, primaryConcernSummary: 'Memendam tekanan biaya kos sambil mengejar target praktikum' },
  },
  {
    id: 'mhs-03',
    name: 'Tania Wijaya',
    cohort: 2023,
    demographicLabel: { genderLabel: 'Perempuan', originLabel: 'Medan', avatarHue: 340, hairStyle: 'ikat' },
    uniquePotential: 'Mentor sabar yang mengajari mahasiswa baru dasar osiloskop',
    socialCircleHint: 'tim-iot',
    counselingDomain: 'karier',
    interests: { cetak3d: 0.48, pemrograman: 0.71, pengelasan: 0.28, elektronika: 0.86 },
    skills: { cetak3d: 0.55, pemrograman: 0.74, pengelasan: 0.31, elektronika: 0.89, kolaborasi: 0.83 },
    personality: { openness: 0.78, conscientiousness: 0.84, extraversion: 0.66, agreeableness: 0.79, stressSensitivity: 0.29 },
    solitudePreference: 0.34,
    initialZoneId: 'elektronik-iot',
    hiddenVars: { trustInCounselor: 0.6, disclosureReadiness: 0.55, socialComfort: 0.8, stigmaSensitivity: 0.3, ruptureLevel: 0, primaryConcernSummary: 'Bimbang antara melamar asisten riset atau lulus tepat waktu' },
  },

  // --- Kelompok 2: Tim Firmware & Pemrograman (3 mahasiswa: mhs-04 .. mhs-06) ---
  {
    id: 'mhs-04',
    name: 'Kevin Gunawan',
    cohort: 2024,
    demographicLabel: { genderLabel: 'Laki-laki', originLabel: 'Jakarta', avatarHue: 235, hairStyle: 'pendek' },
    uniquePotential: 'Jago optimasi kode mikrokontroler real-time bebas memori bocor',
    socialCircleHint: 'tim-firmware',
    counselingDomain: 'sosial',
    interests: { cetak3d: 0.38, pemrograman: 0.94, pengelasan: 0.12, elektronika: 0.66 },
    skills: { cetak3d: 0.35, pemrograman: 0.91, pengelasan: 0.14, elektronika: 0.64, kolaborasi: 0.52 },
    personality: { openness: 0.83, conscientiousness: 0.77, extraversion: 0.58, agreeableness: 0.42, stressSensitivity: 0.45 },
    solitudePreference: 0.46,
    initialZoneId: 'pemrograman',
    hiddenVars: { trustInCounselor: 0.38, disclosureReadiness: 0.3, socialComfort: 0.54, stigmaSensitivity: 0.58, ruptureLevel: 0, primaryConcernSummary: 'Sering berdebat tajam karena standar kode terlalu tinggi ke tim' },
  },
  {
    id: 'mhs-05',
    name: 'Ayu Permata',
    cohort: 2024,
    demographicLabel: { genderLabel: 'Perempuan', originLabel: 'Denpasar', avatarHue: 165, hairStyle: 'ikat' },
    uniquePotential: 'Kreatif merancang antarmuka telemetri dan visualisasi data uji',
    socialCircleHint: 'tim-firmware',
    counselingDomain: 'karier',
    interests: { cetak3d: 0.55, pemrograman: 0.87, pengelasan: 0.14, elektronika: 0.51 },
    skills: { cetak3d: 0.58, pemrograman: 0.83, pengelasan: 0.15, elektronika: 0.48, kolaborasi: 0.79 },
    personality: { openness: 0.88, conscientiousness: 0.73, extraversion: 0.72, agreeableness: 0.81, stressSensitivity: 0.36 },
    solitudePreference: 0.27,
    initialZoneId: 'pemrograman',
    hiddenVars: { trustInCounselor: 0.57, disclosureReadiness: 0.52, socialComfort: 0.79, stigmaSensitivity: 0.32, ruptureLevel: 0, primaryConcernSummary: 'Ingin menjajaki jalur desain sistem interaktif selepas vokasi' },
  },
  {
    id: 'mhs-06',
    name: 'Mita Rahmawati',
    cohort: 2025,
    demographicLabel: { genderLabel: 'Perempuan', originLabel: 'Bogor', avatarHue: 300, hairStyle: 'kerudung' },
    uniquePotential: 'Tenang mencari sumber referensi teknis saat tim menemui jalan buntu',
    socialCircleHint: 'tim-firmware',
    counselingDomain: 'pribadi',
    interests: { cetak3d: 0.37, pemrograman: 0.74, pengelasan: 0.11, elektronika: 0.58 },
    skills: { cetak3d: 0.36, pemrograman: 0.69, pengelasan: 0.12, elektronika: 0.55, kolaborasi: 0.61 },
    personality: { openness: 0.66, conscientiousness: 0.76, extraversion: 0.32, agreeableness: 0.79, stressSensitivity: 0.66 },
    solitudePreference: 0.61,
    initialZoneId: 'pemrograman',
    hiddenVars: { trustInCounselor: 0.39, disclosureReadiness: 0.29, socialComfort: 0.44, stigmaSensitivity: 0.68, ruptureLevel: 0, primaryConcernSummary: 'Merasa canggung meminta bantuan ketika tertinggal materi praktikum' },
  },

  // --- Kelompok 3: Tim Manufaktur, Cetak 3D & Las K3 (3 mahasiswa: mhs-07 .. mhs-09) ---
  {
    id: 'mhs-07',
    name: 'Bima Mahendra',
    cohort: 2023,
    demographicLabel: { genderLabel: 'Laki-laki', originLabel: 'Bekasi', avatarHue: 32, hairStyle: 'pendek' },
    uniquePotential: 'Disiplin menjaga prosedur K3 pengelasan dan kalibrasi arus las',
    socialCircleHint: 'tim-manufaktur',
    counselingDomain: 'karier',
    interests: { cetak3d: 0.68, pemrograman: 0.25, pengelasan: 0.92, elektronika: 0.34 },
    skills: { cetak3d: 0.64, pemrograman: 0.24, pengelasan: 0.9, elektronika: 0.32, kolaborasi: 0.76 },
    personality: { openness: 0.58, conscientiousness: 0.91, extraversion: 0.65, agreeableness: 0.73, stressSensitivity: 0.28 },
    solitudePreference: 0.33,
    initialZoneId: 'las',
    hiddenVars: { trustInCounselor: 0.58, disclosureReadiness: 0.49, socialComfort: 0.77, stigmaSensitivity: 0.36, ruptureLevel: 0, primaryConcernSummary: 'Mempertimbangkan tawaran kerja bengkel fabrikasi sebelum wisuda' },
  },
  {
    id: 'mhs-08',
    name: 'Hendra Wijaya',
    cohort: 2025,
    demographicLabel: { genderLabel: 'Laki-laki', originLabel: 'Manado', avatarHue: 42, hairStyle: 'pendek' },
    uniquePotential: 'Cekatan memperbaiki nozzle tersumbat dan merawat mesin printer 3D',
    socialCircleHint: 'tim-manufaktur',
    counselingDomain: 'belajar',
    interests: { cetak3d: 0.85, pemrograman: 0.37, pengelasan: 0.66, elektronika: 0.48 },
    skills: { cetak3d: 0.81, pemrograman: 0.34, pengelasan: 0.61, elektronika: 0.46, kolaborasi: 0.7 },
    personality: { openness: 0.66, conscientiousness: 0.75, extraversion: 0.62, agreeableness: 0.73, stressSensitivity: 0.4 },
    solitudePreference: 0.34,
    initialZoneId: 'cetak-3d',
    hiddenVars: { trustInCounselor: 0.5, disclosureReadiness: 0.43, socialComfort: 0.69, stigmaSensitivity: 0.45, ruptureLevel: 0, primaryConcernSummary: 'Sering diminta tolong mendadak hingga tugas pribadinya tertunda' },
  },
  {
    id: 'mhs-09',
    name: 'Gilang Ramadhan',
    cohort: 2025,
    demographicLabel: { genderLabel: 'Laki-laki', originLabel: 'Serang', avatarHue: 12, hairStyle: 'pendek' },
    uniquePotential: 'Berani mengambil inisiatif saat menguji prototipe mekanik berisiko tinggi',
    socialCircleHint: 'tim-manufaktur',
    counselingDomain: 'sosial',
    interests: { cetak3d: 0.67, pemrograman: 0.39, pengelasan: 0.78, elektronika: 0.46 },
    skills: { cetak3d: 0.62, pemrograman: 0.35, pengelasan: 0.74, elektronika: 0.42, kolaborasi: 0.44 },
    personality: { openness: 0.61, conscientiousness: 0.55, extraversion: 0.66, agreeableness: 0.38, stressSensitivity: 0.62 },
    solitudePreference: 0.36,
    initialZoneId: 'diskusi',
    hiddenVars: { trustInCounselor: 0.28, disclosureReadiness: 0.22, socialComfort: 0.45, stigmaSensitivity: 0.74, ruptureLevel: 0.15, primaryConcernSummary: 'Mudah tersinggung ketika pekerjaannya dikoreksi di depan kelompok' },
  },

  // --- Kelompok 4: Mahasiswa Mandiri Nyaman Menyendiri Sehat (2 mahasiswa: mhs-10 .. mhs-11) ---
  {
    id: 'mhs-10',
    name: 'Teguh Santosa',
    cohort: 2023,
    demographicLabel: { genderLabel: 'Laki-laki', originLabel: 'Magelang', avatarHue: 200, hairStyle: 'pendek' },
    uniquePotential: 'Ahli merawat kalibrasi alat ukur elektronik di gudang dan meja kerja',
    socialCircleHint: 'mandiri-sehat',
    counselingDomain: 'karier',
    interests: { cetak3d: 0.44, pemrograman: 0.49, pengelasan: 0.58, elektronika: 0.83 },
    skills: { cetak3d: 0.43, pemrograman: 0.47, pengelasan: 0.55, elektronika: 0.84, kolaborasi: 0.66 },
    personality: { openness: 0.74, conscientiousness: 0.92, extraversion: 0.31, agreeableness: 0.77, stressSensitivity: 0.23 },
    solitudePreference: 0.79,
    initialZoneId: 'gudang-alat',
    hiddenVars: { trustInCounselor: 0.6, disclosureReadiness: 0.48, socialComfort: 0.73, stigmaSensitivity: 0.28, ruptureLevel: 0, primaryConcernSummary: 'Sedang menyiapkan uji kompetensi teknisi instrumentasi' },
  },
  {
    id: 'mhs-11',
    name: 'Maya Puspita',
    cohort: 2025,
    demographicLabel: { genderLabel: 'Perempuan', originLabel: 'Jember', avatarHue: 265, hairStyle: 'sedang' },
    uniquePotential: 'Mampu membaca pola data sensor dengan tenang dan teliti',
    socialCircleHint: 'mandiri-sehat',
    counselingDomain: 'belajar',
    interests: { cetak3d: 0.4, pemrograman: 0.76, pengelasan: 0.15, elektronika: 0.79 },
    skills: { cetak3d: 0.39, pemrograman: 0.72, pengelasan: 0.14, elektronika: 0.74, kolaborasi: 0.65 },
    personality: { openness: 0.79, conscientiousness: 0.84, extraversion: 0.28, agreeableness: 0.76, stressSensitivity: 0.32 },
    solitudePreference: 0.78,
    initialZoneId: 'elektronik-iot',
    hiddenVars: { trustInCounselor: 0.53, disclosureReadiness: 0.44, socialComfort: 0.66, stigmaSensitivity: 0.36, ruptureLevel: 0, primaryConcernSummary: 'Lebih produktif dengan ruang tenang, sesekali ingin bertukar ide dengan mentor' },
  },

  // --- Kelompok 5: Penghubung & Rentan Terisolasi (4 mahasiswa: mhs-12 .. mhs-15; 2 penghubung, 2 rentan terisolasi) ---
  {
    id: 'mhs-12',
    name: 'Sari Melati',
    cohort: 2024,
    demographicLabel: { genderLabel: 'Perempuan', originLabel: 'Yogyakarta', avatarHue: 155, hairStyle: 'sedang' },
    uniquePotential: 'Mampu menghubungkan kebutuhan firmware dan perangkat keras tim',
    socialCircleHint: 'penghubung',
    counselingDomain: 'sosial',
    interests: { cetak3d: 0.46, pemrograman: 0.83, pengelasan: 0.15, elektronika: 0.77 },
    skills: { cetak3d: 0.41, pemrograman: 0.79, pengelasan: 0.16, elektronika: 0.71, kolaborasi: 0.88 },
    personality: { openness: 0.82, conscientiousness: 0.74, extraversion: 0.84, agreeableness: 0.86, stressSensitivity: 0.31 },
    solitudePreference: 0.18,
    initialZoneId: 'diskusi',
    hiddenVars: { trustInCounselor: 0.62, disclosureReadiness: 0.58, socialComfort: 0.88, stigmaSensitivity: 0.25, ruptureLevel: 0, primaryConcernSummary: 'Kelelahan menengahi perbedaan pendapat dua anggota kelompok' },
  },
  {
    id: 'mhs-13',
    name: 'Nisa Nurhaliza',
    cohort: 2025,
    demographicLabel: { genderLabel: 'Perempuan', originLabel: 'Garut', avatarHue: 325, hairStyle: 'kerudung' },
    uniquePotential: 'Peka menangkap suasana hati teman yang sedang kelelahan di lab',
    socialCircleHint: 'penghubung',
    counselingDomain: 'pribadi',
    interests: { cetak3d: 0.52, pemrograman: 0.58, pengelasan: 0.23, elektronika: 0.69 },
    skills: { cetak3d: 0.48, pemrograman: 0.55, pengelasan: 0.2, elektronika: 0.64, kolaborasi: 0.87 },
    personality: { openness: 0.8, conscientiousness: 0.75, extraversion: 0.72, agreeableness: 0.9, stressSensitivity: 0.54 },
    solitudePreference: 0.29,
    initialZoneId: 'istirahat',
    hiddenVars: { trustInCounselor: 0.58, disclosureReadiness: 0.5, socialComfort: 0.76, stigmaSensitivity: 0.41, ruptureLevel: 0, primaryConcernSummary: 'Sering menampung keluhan teman hingga ikut merasa terbebani secara emosional' },
  },
  {
    id: 'mhs-14',
    name: 'Rani Safitri',
    cohort: 2026,
    demographicLabel: { genderLabel: 'Perempuan', originLabel: 'Bengkulu', avatarHue: 350, hairStyle: 'ikat' },
    uniquePotential: 'Teliti mencatat skema rangkaian praktikum meski masih belajar dari dasar',
    socialCircleHint: 'terisolasi-rentan',
    counselingDomain: 'pribadi',
    interests: { cetak3d: 0.48, pemrograman: 0.56, pengelasan: 0.18, elektronika: 0.64 },
    skills: { cetak3d: 0.38, pemrograman: 0.44, pengelasan: 0.15, elektronika: 0.47, kolaborasi: 0.52 },
    personality: { openness: 0.64, conscientiousness: 0.74, extraversion: 0.27, agreeableness: 0.76, stressSensitivity: 0.78 },
    solitudePreference: 0.42,
    initialZoneId: 'istirahat',
    hiddenVars: { trustInCounselor: 0.26, disclosureReadiness: 0.2, socialComfort: 0.31, stigmaSensitivity: 0.85, ruptureLevel: 0, primaryConcernSummary: 'Ragu mendekati ruang konsultasi karena takut dianggap lemah oleh teman lab' },
  },
  {
    id: 'mhs-15',
    name: 'Naufal Hakim',
    cohort: 2025,
    demographicLabel: { genderLabel: 'Laki-laki', originLabel: 'Palu', avatarHue: 158, hairStyle: 'pendek' },
    uniquePotential: 'Kreatif menggabungkan komponen daur ulang untuk purwarupa cepat',
    socialCircleHint: 'terisolasi-rentan',
    counselingDomain: 'pribadi',
    interests: { cetak3d: 0.73, pemrograman: 0.47, pengelasan: 0.59, elektronika: 0.55 },
    skills: { cetak3d: 0.68, pemrograman: 0.43, pengelasan: 0.54, elektronika: 0.51, kolaborasi: 0.47 },
    personality: { openness: 0.82, conscientiousness: 0.56, extraversion: 0.36, agreeableness: 0.65, stressSensitivity: 0.71 },
    solitudePreference: 0.49,
    initialZoneId: 'cetak-3d',
    hiddenVars: { trustInCounselor: 0.32, disclosureReadiness: 0.25, socialComfort: 0.39, stigmaSensitivity: 0.76, ruptureLevel: 0, primaryConcernSummary: 'Kecewa karena idenya sering dilewati saat rapat kelompok' },
  },
];

export const STUDENT_COUNT = STUDENT_BLUEPRINTS.length;

function findNearestWalkableInZone(
  map: LabMapData,
  grid: NavigationGrid,
  zoneId: ZoneType,
  occupiedKeys: Set<string>,
  rng: SeededRng
): GridPoint {
  const zone = map.zones.find((z) => z.id === zoneId);
  if (zone) {
    // Prioritaskan standingSlots zona terlebih dahulu
    for (const slot of zone.standingSlots) {
      const key = `${slot.x},${slot.y}`;
      if (!occupiedKeys.has(key) && isPointWalkable(grid, slot)) {
        occupiedKeys.add(key);
        return { x: slot.x, y: slot.y };
      }
    }

    // Jika standingSlots penuh, cari petak walkable lain di dalam bounds zona
    const candidates: GridPoint[] = [];
    for (let y = zone.bounds.y; y < zone.bounds.y + zone.bounds.h; y += 1) {
      for (let x = zone.bounds.x; x < zone.bounds.x + zone.bounds.w; x += 1) {
        const pt = { x, y };
        const key = `${x},${y}`;
        if (!occupiedKeys.has(key) && isPointWalkable(grid, pt)) {
          candidates.push(pt);
        }
      }
    }
    if (candidates.length > 0) {
      const picked = pickOne(rng, candidates);
      occupiedKeys.add(`${picked.x},${picked.y}`);
      return picked;
    }
  }

  // Cadangan: koridor utama utara yang selalu terbuka
  for (let x = 2; x < map.width - 2; x += 1) {
    const pt = { x, y: 9 };
    const key = `${pt.x},${pt.y}`;
    if (!occupiedKeys.has(key) && isPointWalkable(grid, pt)) {
      occupiedKeys.add(key);
      return pt;
    }
  }
  return { x: 15, y: 9 };
}

function buildInitialAffinity(
  a: StudentSeedBlueprint,
  b: StudentSeedBlueprint,
  rng: SeededRng
): number {
  // Kesamaan minat sebagai dasar ketertarikan teknis
  const interestDiff =
    (Math.abs(a.interests.cetak3d - b.interests.cetak3d) +
      Math.abs(a.interests.pemrograman - b.interests.pemrograman) +
      Math.abs(a.interests.pengelasan - b.interests.pengelasan) +
      Math.abs(a.interests.elektronika - b.interests.elektronika)) /
    4;
  let score = 0.22 - interestDiff * 0.45;

  // Kedekatan kelompok sebaya
  if (a.socialCircleHint === b.socialCircleHint && a.socialCircleHint !== 'terisolasi-rentan') {
    score += 0.34;
  }

  // Penghubung (bridge) cenderung nyaman dengan berbagai kelompok
  if (a.socialCircleHint === 'penghubung' || b.socialCircleHint === 'penghubung') {
    score += 0.22;
  }

  // Mahasiswa yang mudah tersinggung/ketat berpotensi gesekan ringan dengan karakter tertentu
  if (a.personality.agreeableness < 0.48 && b.personality.agreeableness < 0.48) {
    score -= 0.42;
  }

  // Mahasiswa rentan terisolasi memiliki afinitas awal lebih hati-hati
  if (a.socialCircleHint === 'terisolasi-rentan' || b.socialCircleHint === 'terisolasi-rentan') {
    score -= 0.12;
  }

  // Gesekan spesifik realistis antar-pasangan tertentu
  const pair = [a.id, b.id].sort().join(':');
  if (pair === 'mhs-04:mhs-09') {
    score -= 0.38;
  }
  if (pair === 'mhs-12:mhs-14' || pair === 'mhs-13:mhs-15') {
    score += 0.26;
  }

  score += randomRange(rng, -0.08, 0.08);
  return clampAffinity(Number(score.toFixed(3)));
}

function getDefaultGoalForZone(zoneId: ZoneType): string {
  switch (zoneId) {
    case 'cetak-3d':
      return 'Menyiapkan filamen dan memantau cetak 3D';
    case 'pemrograman':
      return 'Menulis serta menguji kode mikrokontroler';
    case 'las':
      return 'Memeriksa sambungan rangka dengan prosedur K3';
    case 'elektronik-iot':
      return 'Merangkai serta menyolder modul sensor IoT';
    case 'diskusi':
      return 'Berdiskusi pembagian tugas proyek';
    case 'gudang-alat':
      return 'Mengambil alat ukur dan komponen lab';
    case 'istirahat':
      return 'Menarik napas sejenak di ruang istirahat';
    case 'ruang-dosen':
      return 'Mengonfirmasi arahan tugas ke dosen';
    case 'konsultasi':
      return 'Menunggu giliran sesi konsultasi';
  }
}

/**
 * Membangun seluruh agen mahasiswa (`STUDENT_COUNT`) secara deterministik dari seed.
 * Catatan etis: demographicLabel TIDAK PERNAH dibaca pada perhitungan afinitas,
 * energi, stres, maupun posisi awal.
 */
export function createInitialAgents(
  map: LabMapData,
  grid: NavigationGrid,
  seed: number
): StudentAgent[] {
  const rng = mulberry32(seed + 1009);
  const occupiedKeys = new Set<string>();

  // Buat matriks afinitas simetris awal + sedikit variasi perspektif tiap arah
  const affinityTable: Record<string, Record<string, number>> = {};
  for (const bp of STUDENT_BLUEPRINTS) {
    affinityTable[bp.id] = {};
  }

  for (let i = 0; i < STUDENT_BLUEPRINTS.length; i += 1) {
    for (let j = i + 1; j < STUDENT_BLUEPRINTS.length; j += 1) {
      const a = STUDENT_BLUEPRINTS[i];
      const b = STUDENT_BLUEPRINTS[j];
      const base = buildInitialAffinity(a, b, rng);
      affinityTable[a.id][b.id] = clampAffinity(
        Number((base + randomRange(rng, -0.05, 0.05)).toFixed(3))
      );
      affinityTable[b.id][a.id] = clampAffinity(
        Number((base + randomRange(rng, -0.05, 0.05)).toFixed(3))
      );
    }
  }

  return STUDENT_BLUEPRINTS.map((bp) => {
    const startTile = findNearestWalkableInZone(
      map,
      grid,
      bp.initialZoneId,
      occupiedKeys,
      rng
    );

    // Mahasiswa rentan terisolasi mulai dengan energi sedikit lebih rendah agar pola isolasi segera teramati
    const isolationInitialOffset =
      bp.socialCircleHint === 'terisolasi-rentan'
        ? -0.16
        : bp.solitudePreference >= 0.55 && bp.personality.stressSensitivity >= 0.6
          ? -0.12
          : bp.socialCircleHint === 'penghubung'
            ? 0.06
            : 0;
    const initialEnergy = clamp01(
      Number(
        (
          0.72 +
          isolationInitialOffset +
          (1 - bp.personality.stressSensitivity) * 0.14 +
          randomRange(rng, -0.05, 0.05)
        ).toFixed(3)
      )
    );
    const initialStress = clamp01(
      Number((0.12 + bp.personality.stressSensitivity * 0.24 + randomRange(rng, -0.05, 0.05)).toFixed(3))
    );
    const initialTaskLoad = clamp01(
      Number((0.35 + bp.personality.conscientiousness * 0.25 + randomRange(rng, -0.08, 0.12)).toFixed(3))
    );

    const isResting = bp.initialZoneId === 'istirahat';
    const isDiscussing = bp.initialZoneId === 'diskusi';

    return {
      id: bp.id,
      name: bp.name,
      cohort: bp.cohort,
      demographicLabel: { ...bp.demographicLabel },
      uniquePotential: bp.uniquePotential,
      socialCircleHint: bp.socialCircleHint,
      counselingDomain: bp.counselingDomain,
      interests: { ...bp.interests },
      skills: { ...bp.skills },
      personality: { ...bp.personality },
      solitudePreference: bp.solitudePreference,
      affinities: affinityTable[bp.id],

      position: { x: startTile.x, y: startTile.y },
      tilePosition: { ...startTile },
      targetPosition: null,
      path: [],
      pathStepIndex: 0,
      currentZoneId: bp.initialZoneId,
      targetZoneId: bp.initialZoneId,
      activityGoal: getDefaultGoalForZone(bp.initialZoneId),
      status: isResting ? 'istirahat' : isDiscussing ? 'mengobrol' : 'bekerja',
      energy: initialEnergy,
      stress: initialStress,
      taskLoad: initialTaskLoad,
      activityDurationTicks: Math.floor(randomRange(rng, 2, 6)),
      socialStatus: bp.solitudePreference > 0.7 ? 'sendiri' : isDiscussing ? 'berkelompok' : 'sendiri',
      interactingWithIds: [],
      hiddenVars: { ...bp.hiddenVars },
    };
  });
}

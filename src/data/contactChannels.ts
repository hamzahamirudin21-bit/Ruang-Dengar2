import { ContactChannelConfig } from '../types';

/**
 * Konfigurasi enam jalur kontak konselor.
 * Disimpan sebagai data terpisah agar dosen BK dapat menyetel parameter energi,
 * waktu, tingkat privasi, biaya stigma, radius saksi, dan perolehan rapport dasar.
 */
export const CONTACT_CHANNELS: ContactChannelConfig[] = [
  {
    id: 'sapa-di-tempat',
    order: 1,
    name: 'Sapa di tempat',
    shortName: 'Sapa di Tempat',
    description:
      'Menyapa mahasiswa secara informal di stasiun atau area tempat ia berada untuk membuka obrolan ringan.',
    energyCost: 5,
    durationMinutes: 10,
    privacyTier: 'rendah',
    privacyScore: 0.2,
    stigmaTier: 'rendah',
    stigmaBaseCost: 0.08,
    rapportTier: 'kecil',
    rapportBaseGain: 0.05,
    maxDialogueLevel: 0,
    witnessRadius: 4.0,
    exposurePerWitness: 0.04,
    requiresEmptyConsultationRoom: false,
    requiresIntermediaryChoice: false,
    requiresTimeSlotChoice: false,
  },
  {
    id: 'ajak-aktivitas',
    order: 2,
    name: 'Ajak aktivitas',
    shortName: 'Ajak Aktivitas',
    description:
      'Berjalan bersama menuju area netral (Gudang Alat atau Ruang Istirahat) atau membantu aktivitas ringan di stasiunnya.',
    energyCost: 15,
    durationMinutes: 25,
    privacyTier: 'sedang',
    privacyScore: 0.55,
    stigmaTier: 'rendah',
    stigmaBaseCost: 0.06,
    rapportTier: 'sedang',
    rapportBaseGain: 0.14,
    maxDialogueLevel: 2,
    witnessRadius: 3.2,
    exposurePerWitness: 0.03,
    requiresEmptyConsultationRoom: false,
    requiresIntermediaryChoice: false,
    requiresTimeSlotChoice: false,
  },
  {
    id: 'pintu-akademik',
    order: 3,
    name: 'Pintu akademik',
    shortName: 'Pintu Akademik',
    description:
      'Menjadwalkan sesi “konsultasi praktikum” di Ruang Konsultasi pada jam tertentu dengan alasan akademik yang wajar.',
    energyCost: 20,
    durationMinutes: 30,
    privacyTier: 'tinggi',
    privacyScore: 0.88,
    stigmaTier: 'rendah-sedang',
    stigmaBaseCost: 0.11,
    rapportTier: 'sedang',
    rapportBaseGain: 0.15,
    maxDialogueLevel: 3,
    witnessRadius: 1.8,
    exposurePerWitness: 0.035,
    requiresEmptyConsultationRoom: true,
    requiresIntermediaryChoice: false,
    requiresTimeSlotChoice: true,
  },
  {
    id: 'panggilan-resmi',
    order: 4,
    name: 'Panggilan resmi ke ruang konsultasi',
    shortName: 'Panggilan Resmi',
    description:
      'Memanggil mahasiswa secara formal untuk menghadap ke Ruang Konsultasi di hadapan rekan sekitar.',
    energyCost: 10,
    durationMinutes: 25,
    privacyTier: 'tinggi',
    privacyScore: 0.82,
    stigmaTier: 'tinggi',
    stigmaBaseCost: 0.32,
    rapportTier: 'kecil',
    rapportBaseGain: 0.04,
    maxDialogueLevel: 2,
    witnessRadius: 6.5,
    exposurePerWitness: 0.095,
    requiresEmptyConsultationRoom: true,
    requiresIntermediaryChoice: false,
    requiresTimeSlotChoice: false,
  },
  {
    id: 'lewat-perantara',
    order: 5,
    name: 'Lewat perantara',
    shortName: 'Lewat Perantara',
    description:
      'Menghubungi mahasiswa melalui teman dekat lab, teknisi laboratorium, atau dosen pengampu untuk mengajak bertemu.',
    energyCost: 15,
    durationMinutes: 20,
    privacyTier: 'sedang',
    privacyScore: 0.4,
    stigmaTier: 'sedang',
    stigmaBaseCost: 0.16,
    rapportTier: 'kecil-sedang',
    rapportBaseGain: 0.1,
    maxDialogueLevel: 2,
    witnessRadius: 2.5,
    exposurePerWitness: 0.055,
    requiresEmptyConsultationRoom: false,
    requiresIntermediaryChoice: true,
    requiresTimeSlotChoice: false,
  },
  {
    id: 'pesan-tertulis',
    order: 6,
    name: 'Pesan tertulis',
    shortName: 'Pesan Tertulis',
    description:
      'Mengirimkan catatan atau pesan pribadi yang sopan tanpa interaksi tatap muka mendadak di depan rekan.',
    energyCost: 10,
    durationMinutes: 15,
    privacyTier: 'tinggi',
    privacyScore: 0.96,
    stigmaTier: 'sangat-rendah',
    stigmaBaseCost: 0.02,
    rapportTier: 'kecil',
    rapportBaseGain: 0.08,
    maxDialogueLevel: 1,
    witnessRadius: 0,
    exposurePerWitness: 0,
    requiresEmptyConsultationRoom: false,
    requiresIntermediaryChoice: false,
    requiresTimeSlotChoice: false,
  },
];

export function getContactChannelConfig(
  channelId: ContactChannelConfig['id']
): ContactChannelConfig {
  const found = CONTACT_CHANNELS.find((c) => c.id === channelId);
  if (!found) {
    return CONTACT_CHANNELS[0];
  }
  return found;
}

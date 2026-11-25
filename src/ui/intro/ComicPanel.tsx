import React from 'react';
import {
  COMIC_STUDENT_IDENTITIES,
  ComicPanelSpec,
  ComicSceneBackdropKind,
  DOSEN_IDENTITY,
} from './comicIntroData';
import { ActiveDialogueRenderState } from './IntroTimeline';
import { ComicCamera } from './ComicCamera';
import { ComicCharacter } from './ComicCharacter';
import { ComicSpeechBubble } from './ComicSpeechBubble';

export interface ComicPanelProps {
  panel: ComicPanelSpec;
  beatElapsedMs: number;
  beatProgress: number;
  activeDialogues: readonly ActiveDialogueRenderState[];
  reducedMotion?: boolean;
  onStartSimulation?: () => void;
  onReplayIntro?: () => void;
  onSkipIntro?: () => void;
}

const SCENE_IMAGE_BY_KIND: Partial<Record<ComicSceneBackdropKind, string>> = {
  'zone-elektronik': '/assets/scenes/elektronik.png',
  'zone-pemrograman': '/assets/scenes/pemrograman.png',
  'zone-las': '/assets/scenes/las.png',
  'zone-cetak3d': '/assets/scenes/cetak3d.png',
  'zone-studio-desain': '/assets/scenes/pemrograman.png',
  'zone-gudang': '/assets/scenes/elektronik.png',
  'zone-diskusi': '/assets/scenes/diskusi.png',
  'zone-baca': '/assets/scenes/diskusi.png',
  'zone-konsultasi': '/assets/scenes/konsultasi.png',
  'lab-entrance-corridor': '/assets/scenes/diskusi.png',
};

const SPAN_CLASS_MAP: Readonly<Record<ComicPanelSpec['layoutSpan'], string>> = {
  full: 'col-span-12',
  half: 'col-span-12 md:col-span-6',
  'wide-left': 'col-span-12 md:col-span-8',
  'wide-right': 'col-span-12 md:col-span-8',
  third: 'col-span-12 md:col-span-4',
};

export const ComicPanel: React.FC<ComicPanelProps> = ({
  panel,
  beatElapsedMs,
  beatProgress,
  activeDialogues,
  reducedMotion = false,
  onStartSimulation,
  onReplayIntro,
  onSkipIntro,
}) => {
  const isRevealed = beatElapsedMs >= panel.revealOffsetMs;
  const panelDialogues = activeDialogues.filter((d) => d.entry.panelId === panel.id);
  const speakingIds = new Set(panelDialogues.map((d) => d.entry.speakerId));
  const bgUrl = SCENE_IMAGE_BY_KIND[panel.backdropKind];
  const spanClass = SPAN_CLASS_MAP[panel.layoutSpan] ?? 'col-span-12';

  return (
    <div
      className={`comic-intro-panel relative overflow-hidden rounded-2xl border-[4px] border-slate-950 bg-slate-900 shadow-[6px_7px_0_#020617] transition-all duration-300 ${spanClass} ${
        isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
      }`}
      data-panel-id={panel.id}
      data-backdrop-kind={panel.backdropKind}
    >
      {/* Header Strip Panel Komik */}
      <div className="relative z-20 flex items-center justify-between gap-2 border-b-[3px] border-slate-950 bg-slate-950/90 px-3.5 py-1.5">
        <div className="min-w-0">
          <div className="truncate text-xs font-black tracking-wider uppercase text-amber-300 sm:text-sm">
            {panel.title}
          </div>
          <div className="truncate text-[11px] font-medium text-slate-300">
            {panel.subtitle}
          </div>
        </div>
        {panel.onomatopoeia && (
          <span className="shrink-0 -rotate-2 rounded-md border-2 border-slate-950 bg-amber-400 px-2 py-0.5 text-[10px] font-black tracking-widest uppercase text-slate-950 shadow">
            {panel.onomatopoeia}
          </span>
        )}
      </div>

      {/* Kanvas Visual Panel dengan Pergerakan Kamera */}
      <div className="relative h-[340px] w-full overflow-hidden sm:h-[385px]">
        <ComicCamera
          motion={panel.cameraMotion}
          beatProgress={beatProgress}
          reducedMotion={reducedMotion}
        >
          {/* Latar Belakang Gambar Ruangan / Ilustrasi */}
          {bgUrl && (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${bgUrl})`,
                filter: 'saturate(1.08) contrast(1.04)',
              }}
            />
          )}

          {/* SCENE 01 — Ilustrasi Eksterior Gedung Kampus & Laboratorium saat Fajar */}
          {panel.backdropKind === 'campus-morning-exterior' && (
            <div className="relative flex h-full w-full flex-col items-center justify-end overflow-hidden bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#334155] p-6">
              {/* Cahaya matahari terbit */}
              <div
                className="pointer-events-none absolute -top-12 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full opacity-80 blur-2xl"
                style={{
                  background:
                    'radial-gradient(circle, rgba(251,191,36,0.55) 0%, rgba(56,189,248,0.22) 55%, transparent 75%)',
                }}
              />
              {/* Siluet Gedung Laboratorium Vokasi 2D */}
              <div className="relative z-10 flex w-full max-w-3xl flex-col items-center rounded-t-2xl border-[3px] border-slate-950 bg-slate-900/95 px-6 pt-5 pb-4 shadow-2xl">
                <div className="mb-3 rounded-full border border-amber-300/60 bg-amber-500/20 px-4 py-1 text-xs font-black tracking-widest uppercase text-amber-200">
                  GEDUNG LABORATORIUM TERPADU · ELEKTRONIKA & IoT
                </div>
                <div className="grid w-full grid-cols-5 gap-2.5">
                  {[
                    'B. Las K3',
                    'Cetak 3D',
                    'Elektronika & IoT',
                    'Pemrograman MCU',
                    'Ruang Konsultasi BK',
                  ].map((roomName) => (
                    <div
                      key={roomName}
                      className="flex flex-col items-center rounded-lg border border-sky-300/30 bg-slate-800/90 p-2.5 text-center"
                    >
                      <div className="mb-1.5 h-8 w-full rounded border border-amber-300/40 bg-gradient-to-b from-amber-200/30 to-sky-400/20" />
                      <span className="text-[10px] font-bold text-slate-200">{roomName}</span>
                    </div>
                  ))}
                </div>
                {/* Tangga & Pintu Kaca Utama */}
                <div className="mt-3 flex flex-col items-center">
                  <div className="flex h-10 w-36 items-center justify-center rounded-t-lg border-2 border-cyan-300/70 bg-cyan-950/80 text-[11px] font-black tracking-wider text-cyan-200">
                    PINTU UTAMA LAB
                  </div>
                  <div className="h-2.5 w-48 rounded bg-slate-700" />
                </div>
              </div>
            </div>
          )}

          {/* SCENE 05 — Panorama Komunitas Lengkap 18 Mahasiswa + Ibu Dosen */}
          {panel.backdropKind === 'community-panorama' && (
            <div className="relative flex h-full w-full flex-col justify-between bg-gradient-to-b from-slate-900/90 via-slate-950/92 to-slate-900/95 p-3 sm:p-4">
              {/* Baris Atas: Ibu Dosen + Ringkasan 5 Divisi */}
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-300/40 bg-slate-900/90 px-3 py-1.5">
                <div className="flex items-center gap-2.5">
                  <img
                    src={DOSEN_IDENTITY.portraitUrl}
                    alt={DOSEN_IDENTITY.name}
                    className="h-10 w-10 rounded-lg border-2 border-sky-400 object-cover object-top"
                  />
                  <div>
                    <div className="text-xs font-black text-white">{DOSEN_IDENTITY.name}</div>
                    <div className="text-[10px] font-semibold text-sky-300">
                      {DOSEN_IDENTITY.typeTag}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 text-[10px] font-bold">
                  <span className="rounded-md bg-emerald-950/90 px-2 py-0.5 text-emerald-300">
                    ⚡ Elektronika & IoT
                  </span>
                  <span className="rounded-md bg-sky-950/90 px-2 py-0.5 text-sky-300">
                    💻 Pemrograman & MCU
                  </span>
                  <span className="rounded-md bg-orange-950/90 px-2 py-0.5 text-orange-300">
                    🔥 Las K3 & Mekanik
                  </span>
                  <span className="rounded-md bg-violet-950/90 px-2 py-0.5 text-violet-300">
                    🧊 Cetak 3D & UI/UX
                  </span>
                  <span className="rounded-md bg-amber-950/90 px-2 py-0.5 text-amber-300">
                    🤖 Riset & Robotika
                  </span>
                </div>
              </div>

              {/* Grid 18 Mahasiswa (9 kolom x 2 baris — tidak ada wajah yang saling menumpuk!) */}
              <div
                className="grid grid-cols-6 gap-1.5 sm:grid-cols-9 sm:gap-2"
                data-testid="comic-community-18-grid"
              >
                {COMIC_STUDENT_IDENTITIES.map((student) => (
                  <ComicCharacter
                    key={student.id}
                    placement={{
                      characterId: student.id,
                      pose: 'idle',
                      xPercent: 50,
                    }}
                    compactMode
                  />
                ))}
              </div>
            </div>
          )}

          {/* SCENE 06 — Title Reveal & Tombol Aksi Utama */}
          {panel.backdropKind === 'title-reveal-stage' && (
            <div className="relative flex h-full w-full flex-col items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 text-center">
              <div
                className="pointer-events-none absolute inset-0 opacity-35"
                style={{
                  background:
                    'radial-gradient(circle at 50% 35%, rgba(251,191,36,0.35), rgba(56,189,248,0.18) 45%, transparent 72%)',
                }}
              />
              <div className="relative z-10 flex flex-col items-center">
                <span className="mb-2 rounded-full border border-amber-300/60 bg-amber-400/15 px-3.5 py-1 text-[11px] font-black tracking-widest uppercase text-amber-300">
                  OPENING CINEMATIC COMPLETE · 18 MAHASISWA SIAP DITEMUI
                </span>
                <h2 className="text-3xl font-black tracking-tight text-white drop-shadow sm:text-5xl">
                  RUANG DENGAR
                </h2>
                <p className="mt-1.5 text-xs font-extrabold tracking-[0.22em] uppercase text-sky-300 sm:text-sm">
                  SIMULASI LABORATORIUM ELEKTRONIKA & IoT
                </p>
                <p className="mt-2 max-w-xl text-xs leading-relaxed text-slate-300 sm:text-sm">
                  Jelajahi 11 ruangan laboratorium, amati aktivitas praktikum ke-18 mahasiswa, dan bangun percakapan konseling yang empatik.
                </p>

                {/* 3 Tombol Wajib pada Babak Penutup */}
                <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={onStartSimulation}
                    className="cursor-pointer rounded-xl border-2 border-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 px-5 py-2.5 text-xs font-black tracking-wider uppercase text-slate-950 shadow-[0_4px_0_#020617] transition-transform hover:-translate-y-0.5 active:translate-y-0 sm:text-sm"
                    data-testid="comic-intro-cta-start"
                  >
                    ▶ MULAI SIMULASI
                  </button>
                  <button
                    type="button"
                    onClick={onReplayIntro}
                    className="cursor-pointer rounded-xl border-2 border-sky-300/70 bg-slate-800/90 px-4 py-2.5 text-xs font-bold tracking-wider uppercase text-sky-200 shadow-[0_4px_0_#020617] transition-transform hover:-translate-y-0.5 hover:bg-slate-700/90 sm:text-sm"
                    data-testid="comic-intro-cta-replay"
                  >
                    ↻ TONTON KEMBALI
                  </button>
                  <button
                    type="button"
                    onClick={onSkipIntro}
                    className="cursor-pointer rounded-xl border-2 border-slate-600 bg-slate-900/90 px-4 py-2.5 text-xs font-bold tracking-wider uppercase text-slate-300 shadow-[0_4px_0_#020617] transition-transform hover:-translate-y-0.5 hover:bg-slate-800 sm:text-sm"
                    data-testid="comic-intro-cta-skip"
                  >
                    ⏭ LEWATI INTRO
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Overlay Vignette & Halftone Komik Halus */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(2,6,23,0.32) 0%, rgba(2,6,23,0.08) 45%, rgba(2,6,23,0.68) 100%)',
            }}
          />

          {/* Karakter di dalam Panel (untuk Scene 02, 03, 04) */}
          {panel.backdropKind !== 'community-panorama' &&
            panel.backdropKind !== 'title-reveal-stage' &&
            panel.characters.map((placement) => (
              <ComicCharacter
                key={`${panel.id}-${placement.characterId}`}
                placement={placement}
                isSpeaking={speakingIds.has(placement.characterId)}
              />
            ))}
        </ComicCamera>

        {/* Balon Percakapan Komik (diposisikan di sudut agar tidak pernah menutupi wajah) */}
        {panelDialogues.map((dlgState) => (
          <ComicSpeechBubble key={dlgState.entry.id} dialogueState={dlgState} />
        ))}
      </div>
    </div>
  );
};

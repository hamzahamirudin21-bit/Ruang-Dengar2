import React, { useEffect, useMemo, useState } from 'react';
import {
  CHARACTER_POSE_PROFILES,
  POSE_CATALOG,
  getPoseAssetPath,
  type PoseId,
} from './poseCatalog';
import {
  loadMasterPoseManifest,
  type MasterPoseManifest,
} from './poseAssetLoader';

export interface PoseQcModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Halaman Inspeksi Visual Internal (Visual Quality Control) untuk memvalidasi
 * seluruh 18 karakter × 20 pose = 360 aset pose PNG transparan.
 */
export const PoseQcModal: React.FC<PoseQcModalProps> = ({ isOpen, onClose }) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>('mhs-01');
  const [manifest, setManifest] = useState<MasterPoseManifest | null>(null);
  const [loadedMap, setLoadedMap] = useState<Record<string, 'ok' | 'error'>>({});

  useEffect(() => {
    if (!isOpen) return;
    void loadMasterPoseManifest().then((m) => setManifest(m));
  }, [isOpen]);

  const activeProfile = useMemo(
    () =>
      CHARACTER_POSE_PROFILES.find((p) => p.studentId === selectedStudentId) ??
      CHARACTER_POSE_PROFILES[0],
    [selectedStudentId]
  );

  if (!isOpen) return null;

  const charManifest = manifest?.characters[activeProfile.studentId];

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/85 p-3 backdrop-blur-sm sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-label="Visual Quality Control 360 Pose Karakter"
      data-testid="pose-qc-modal"
    >
      <div className="responsive-modal-panel responsive-modal-panel--92 flex h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border-2 border-sky-400/50 bg-slate-900 text-white shadow-2xl">
        {/* Header Ringkas QC */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-950 px-5 py-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-amber-400 px-2 py-0.5 text-[10px] font-black uppercase text-slate-950">
                VISUAL QC · 360 POSES
              </span>
              <h2 className="text-sm font-black tracking-wide uppercase text-white sm:text-base">
                {activeProfile.name} ({activeProfile.studentId})
              </h2>
            </div>
            <p className="mt-0.5 text-xs text-slate-300">
              Kepribadian: <strong className="text-sky-300">{activeProfile.typeTag}</strong> ·
              Arketipe Gerak: <strong className="text-amber-300">{activeProfile.personalityMotion}</strong> ·
              Total Manifest:{' '}
              <strong className="text-emerald-300">
                {manifest ? `${manifest.totalAssets} aset (${manifest.totalCharacters}×${manifest.posesPerCharacter})` : '360 aset (18×20)'}
              </strong>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-xl border border-slate-700 bg-slate-800 px-4 py-1.5 text-xs font-bold text-slate-200 hover:bg-slate-700"
          >
            Tutup QC ✕
          </button>
        </div>

        {/* Selector 18 Karakter */}
        <div className="flex flex-wrap gap-1.5 border-b border-slate-800 bg-slate-950/60 px-4 py-2.5">
          {CHARACTER_POSE_PROFILES.map((prof, idx) => {
            const active = prof.studentId === activeProfile.studentId;
            return (
              <button
                key={prof.studentId}
                type="button"
                onClick={() => setSelectedStudentId(prof.studentId)}
                className={`cursor-pointer rounded-lg border px-2.5 py-1 text-xs font-bold transition ${
                  active
                    ? 'border-amber-300 bg-amber-400 text-slate-950'
                    : 'border-slate-700 bg-slate-800/80 text-slate-300 hover:border-sky-400'
                }`}
              >
                #{String(idx + 1).padStart(2, '0')} {prof.shortName}
              </button>
            );
          })}
        </div>

        {/* Grid 20 Pose (P01..P20) untuk Karakter Terpilih */}
        <div className="grid flex-1 grid-cols-2 gap-3 overflow-y-auto p-4 sm:grid-cols-4 md:grid-cols-5">
          {POSE_CATALOG.map((pose) => {
            const path = getPoseAssetPath(activeProfile.studentId, pose.poseId) ?? '';
            const meta = charManifest?.poses[pose.poseId as PoseId];
            const status = loadedMap[path];
            return (
              <div
                key={`${activeProfile.studentId}-${pose.poseId}`}
                className="flex flex-col overflow-hidden rounded-xl border border-slate-700/80 bg-slate-950/80 p-2"
              >
                {/* Checkerboard transparan untuk memverifikasi transparansi PNG */}
                <div
                  className="relative flex h-40 w-full items-end justify-center overflow-hidden rounded-lg border border-slate-800"
                  style={{
                    backgroundImage:
                      'linear-gradient(45deg, #1e293b 25%, transparent 25%), linear-gradient(-45deg, #1e293b 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1e293b 75%), linear-gradient(-45deg, transparent 75%, #1e293b 75%)',
                    backgroundSize: '14px 14px',
                    backgroundPosition: '0 0, 0 7px, 7px -7px, -7px 0px',
                    backgroundColor: '#0f172a',
                  }}
                >
                  <img
                    src={path}
                    alt={`${activeProfile.name} ${pose.title}`}
                    className="h-full w-auto object-contain object-bottom"
                    loading="lazy"
                    onLoad={() => setLoadedMap((m) => ({ ...m, [path]: 'ok' }))}
                    onError={() => setLoadedMap((m) => ({ ...m, [path]: 'error' }))}
                  />
                  <span className="absolute top-1 left-1 rounded bg-slate-950/90 px-1.5 py-0.5 text-[10px] font-black text-amber-300">
                    {pose.poseId}
                  </span>
                  <span
                    className={`absolute top-1 right-1 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                      status === 'error'
                        ? 'bg-red-900/90 text-red-200'
                        : 'bg-emerald-950/90 text-emerald-300'
                    }`}
                  >
                    {status === 'error' ? 'ERR' : `${meta?.width ?? 480}×${meta?.height ?? 600} PNG`}
                  </span>
                </div>
                <div className="mt-1.5">
                  <div className="truncate text-xs font-extrabold text-white">
                    {pose.title}
                  </div>
                  <div className="truncate text-[10px] text-slate-400">
                    {pose.emotion} · {pose.expression}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

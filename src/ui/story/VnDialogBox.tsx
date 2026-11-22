import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { STRINGS } from '../../data/strings';

import type { SpeakerSide } from './bubbleLayout';

export interface VnDialogBoxProps {
  /** Nama pembicara; kosong bila belum ada beat. */
  speakerName: string;
  /** Teks yang sudah terlihat (hasil pengetikan). */
  text: string;
  /** Teks lengkap untuk pembaca layar (bawaan: `text`). */
  fullText?: string;
  /** Teks selingan/narasi ditampilkan miring. */
  italic?: boolean;
  /** True bila ada beat berikutnya atau teks masih diketik (tampilkan Lanjut). */
  canContinue: boolean;
  auto: boolean;
  /** Dinonaktifkan mis. saat sesi sudah berakhir. */
  endDisabled?: boolean;
  /** Dipanggil pada klik kotak dan tombol Lanjut (memajukan dialog). */
  onAdvance: () => void;
  onSkip: () => void;
  onToggleAuto: () => void;
  onOpenHistory: () => void;
  onSave: () => void;
  onLoad: () => void;
  onEndSession: () => void;
  /** Sisi pembicara: kiri = Dosen, kanan = mahasiswa, tengah = narasi. */
  speakerSide?: SpeakerSide;
  /** Pusat horizontal pembicara (koordinat viewport); tidak dipakai lagi karena kotak tanpa ekor. */
  speakerCenterX?: number;
  /** Avatar pembicara; tidak ditampilkan karena potret besar sudah ada di panggung. */
  speakerAvatar?: ReactNode;
  /** Indikator suara aktif saat teks pembicara sedang diketik. */
  isSpeaking?: boolean;
  /** Dipanggil saat status pengetikan berubah (true = teks masih diketik). */
  onTypingChange?: (typing: boolean) => void;
  /** Slot opsional di bagian atas kotak (mis. umpan balik kaidah teori konseling). */
  headerSlot?: ReactNode;
  /** Konten tambahan di dalam kotak (opsional). */
  children?: ReactNode;
  className?: string;
}

/**
 * Kotak dialog VN ala referensi: kertas krem bertekstur kotak-kotak, Name_Tab bertulisan tangan,
 * glyph lanjut di akhir teks, dan pil Quick_Menu di kanan bawah. Narasi tampil miring tanpa Name_Tab.
 */
export function VnDialogBox({
  speakerName,
  text,
  fullText,
  italic,
  canContinue,
  auto,
  endDisabled,
  onAdvance,
  onSkip,
  onToggleAuto,
  onOpenHistory,
  onSave,
  onLoad,
  onEndSession,
  speakerSide,
  isSpeaking,
  onTypingChange,
  headerSlot,
  children,
  className,
}: VnDialogBoxProps) {
  const S = STRINGS.story;
  const full = fullText ?? text;
  const typing = full.length > text.length;
  const hasBeat = speakerName !== '' || full !== '';
  const narration = speakerName === S.narrationSpeaker || speakerSide === 'tengah';
  const showNameTab = speakerName !== '' && !narration;
  const isDosen = speakerSide === 'kiri' || speakerName === S.speakerCounselor;

  const lastTyping = useRef<boolean | null>(null);
  useEffect(() => {
    if (lastTyping.current === typing) return;
    lastTyping.current = typing;
    onTypingChange?.(typing);
  }, [typing, onTypingChange]);

  return (
    <section
      role="region"
      aria-label={S.dialogueRegionLabel}
      className={`vn-box ${className ?? ''}`}
      data-testid="vn-dialog-box"
      onClick={onAdvance}
    >
      {showNameTab && (
        <div className={`vn-nametab ${isDosen ? 'vn-nametab--left' : 'vn-nametab--right'}`}>
          {!isDosen && <span aria-hidden="true" className="vn-nametab-line vn-nametab-line--right" />}
          <span
            className={`vn-name ${isDosen ? 'vn-name--dosen' : 'vn-name--mhs'}`}
            data-testid="vn-dialog-speaker"
          >
            <span>{speakerName}</span>
            {(isSpeaking ?? typing) && (
              <span className="vn-eq" aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
              </span>
            )}
          </span>
          {isDosen && <span aria-hidden="true" className="vn-nametab-line" />}
        </div>
      )}

      <div className="vn-box-body">
        {headerSlot}
        {hasBeat ? (
          <>
            <span className="sr-only" aria-live="polite" data-testid="vn-dialog-full-text">
              {full}
            </span>
            <p className={`vn-text ${italic || narration ? 'vn-text--narration' : ''}`}>
              <span aria-hidden="true" data-testid="vn-dialog-text">
                {text}
              </span>
              {canContinue && (
                <button
                  type="button"
                  className="vn-continue"
                  aria-label={S.continueAria}
                  data-testid="vn-dialog-next"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAdvance();
                  }}
                >
                  ▼
                </button>
              )}
            </p>
          </>
        ) : (
          <p className="vn-text vn-text--narration">{S.historyEmpty}</p>
        )}
        {children}
      </div>

      <div
        role="toolbar"
        aria-label={S.dialogueRegionLabel}
        className="vn-quickmenu"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="vn-pill" aria-label={S.historyAria} onClick={onOpenHistory}>
          <span aria-hidden="true">&lt;</span>
          {S.historyBtn}
        </button>
        <button
          type="button"
          className="vn-pill"
          aria-label={auto ? S.autoOnAria : S.autoAria}
          aria-pressed={auto}
          onClick={onToggleAuto}
        >
          {S.autoBtn}
        </button>
        <button type="button" className="vn-pill" aria-label={S.skipAria} onClick={onSkip}>
          {S.skipBtn}
        </button>
        <button type="button" className="vn-pill" aria-label={S.saveAria} onClick={onSave}>
          {S.saveBtn}
        </button>
        <button type="button" className="vn-pill" aria-label={S.loadAria} onClick={onLoad}>
          {S.loadBtn}
        </button>
        <button
          type="button"
          className="vn-pill"
          aria-label={S.endSessionAria}
          disabled={endDisabled}
          onClick={onEndSession}
        >
          {S.endSessionBtn}
        </button>
      </div>
    </section>
  );
}

export default VnDialogBox;

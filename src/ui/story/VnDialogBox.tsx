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
  /** Isyarat gerak tubuh mahasiswa yang ditampilkan halus di bawah dialog tanpa klik tambahan. */
  cueText?: string | null;
  /** Slot opsional di bagian atas kotak. */
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
  cueText,
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
    <div className="vn-dialog-stack">
      <section
        role="region"
        aria-label={S.dialogueRegionLabel}
        className={`vn-box vn-cloud ${showNameTab ? (isDosen ? 'vn-box--tail-left' : 'vn-box--tail-right') : ''} ${className ?? ''}`}
        data-testid="vn-dialog-box"
        onClick={onAdvance}
      >
        {/* Siku bingkai sci-fi pada sudut kotak dialog */}
        <span aria-hidden="true" className="vn-box-corner vn-box-corner--tl" />
        <span aria-hidden="true" className="vn-box-corner vn-box-corner--tr" />
        <span aria-hidden="true" className="vn-box-corner vn-box-corner--bl" />
        <span aria-hidden="true" className="vn-box-corner vn-box-corner--br" />

        {/* Emblem Gelombang Suara Akustik di Kanan Atas Kotak Dialog (sesuai gambar referensi) */}
        <div aria-hidden="true" className="vn-box-soundwave">
          <span style={{ height: '7px' }} />
          <span style={{ height: '13px' }} />
          <span style={{ height: '18px' }} />
          <span style={{ height: '11px' }} />
          <span style={{ height: '15px' }} />
          <span style={{ height: '8px' }} />
        </div>

        {showNameTab && (
          <div className={`vn-nametab ${isDosen ? 'vn-nametab--left' : 'vn-nametab--right'}`}>
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
              {cueText && !narration && (
                <p className="vn-cue" data-testid="vn-dialog-cue">
                  {cueText}
                </p>
              )}
            </>
          ) : (
            <p className="vn-text vn-text--narration">{S.historyEmpty}</p>
          )}
          {children}
        </div>
      </section>

      {/* Baris 6 Tombol Kontrol Dialog (History, Auto, Skip, Simpan, Muat, Akhiri Sesi) di bawah kotak dialog */}
      <div
        role="toolbar"
        aria-label={S.dialogueRegionLabel}
        className="vn-quickmenu"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="vn-pill" aria-label={S.historyAria} onClick={onOpenHistory}>
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="12" cy="12" r="8.5" />
            <path d="M12 7.5V12l3 2" />
          </svg>
          <span>{S.historyBtn}</span>
        </button>
        <button
          type="button"
          className="vn-pill"
          aria-label={auto ? S.autoOnAria : S.autoAria}
          aria-pressed={auto}
          onClick={onToggleAuto}
        >
          <span aria-hidden="true" className="text-[10px]">▶</span>
          <span>{S.autoBtn}</span>
        </button>
        <button type="button" className="vn-pill" aria-label={S.skipAria} onClick={onSkip}>
          <span aria-hidden="true" className="text-[10px]">▶▶</span>
          <span>{S.skipBtn}</span>
        </button>
        <button type="button" className="vn-pill" aria-label={S.saveAria} onClick={onSave}>
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M12 3v12" />
            <path d="m8 11 4 4 4-4" />
            <path d="M5 19h14" />
          </svg>
          <span>{S.saveBtn}</span>
        </button>
        <button type="button" className="vn-pill" aria-label={S.loadAria} onClick={onLoad}>
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M12 16V4" />
            <path d="m8 8 4-4 4 4" />
            <path d="M5 19h14" />
          </svg>
          <span>{S.loadBtn}</span>
        </button>
        <button
          type="button"
          className="vn-pill"
          aria-label={S.endSessionAria}
          disabled={endDisabled}
          onClick={onEndSession}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M12 3v9" />
            <path d="M6.4 6.4a8 8 0 1 0 11.2 0" />
          </svg>
          <span>{S.endSessionBtn}</span>
        </button>
      </div>
    </div>
  );
}

export default VnDialogBox;

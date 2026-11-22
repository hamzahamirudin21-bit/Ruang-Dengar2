import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { STRINGS } from '../../data/strings';
import { useReducedMotion } from '../motion/useMotion';
import { bubbleTail, TAIL_INSET_PX } from './bubbleLayout';
import type { SpeakerSide } from './bubbleLayout';

export interface SpeechBubbleProps {
  speakerName: string;
  /** Teks yang sudah terlihat (awalan dari teks lengkap). */
  text: string;
  /** Teks lengkap untuk pembaca layar; bawaan: `text`. */
  fullText?: string;
  italic?: boolean;
  canContinue: boolean;
  speakerSide?: SpeakerSide;
  /** Pusat horizontal pembicara (koordinat viewport) untuk ekor. */
  speakerCenterX?: number;
  speakerAvatar?: ReactNode;
  onTypingChange?: (typing: boolean) => void;
  onAdvance?: () => void;
  /** Konten tambahan di bawah teks. */
  children?: ReactNode;
  /** Tombol-tombol yang ditempatkan di tepi atas gelembung. */
  toolbar?: ReactNode;
  className?: string;
  emptyText?: string;
}

const TAIL_HALF_WIDTH_PX = 12;
const SIDE_FRACTION: Record<SpeakerSide, number> = { kiri: 0.25, kanan: 0.75, tengah: 0.5 };

/** Gelembung dialog komik: bingkai tebal, ekor menunjuk pembicara, label nama berisi avatar, teks mesin ketik. */
export function SpeechBubble({
  speakerName,
  text,
  fullText,
  italic,
  canContinue,
  speakerSide = 'tengah',
  speakerCenterX,
  speakerAvatar,
  onTypingChange,
  onAdvance,
  children,
  toolbar,
  className,
  emptyText,
}: SpeechBubbleProps) {
  const reduced = useReducedMotion();
  const S = STRINGS.story;
  const full = fullText ?? text;
  const typing = full.length > text.length;
  const hasBeat = speakerName !== '' || full !== '';

  const ref = useRef<HTMLDivElement>(null);
  const [tailX, setTailX] = useState<number | null>(null);
  const [tailVisible, setTailVisible] = useState(true);

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const center =
      speakerCenterX !== undefined && Number.isFinite(speakerCenterX)
        ? speakerCenterX
        : rect.left + rect.width * SIDE_FRACTION[speakerSide];
    const tail = bubbleTail(rect.width, center, rect.left, TAIL_INSET_PX);
    setTailX(tail.xPx);
    setTailVisible(tail.visible);
  }, [speakerCenterX, speakerSide]);

  useLayoutEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure]);

  const lastTyping = useRef<boolean | null>(null);
  useEffect(() => {
    if (lastTyping.current === typing) return;
    lastTyping.current = typing;
    onTypingChange?.(typing);
  }, [typing, onTypingChange]);

  // Hanya huruf terakhir yang baru terungkap yang dianimasikan (murah).
  const popLast = typing && !reduced && text.length > 0;
  const head = popLast ? text.slice(0, -1) : text;
  const last = popLast ? text.slice(-1) : '';

  return (
    <div
      ref={ref}
      className={`fx-bubble relative rounded-[28px] px-5 pb-3 pt-7 shadow-lg ${className ?? ''}`}
      data-testid="speech-bubble"
      data-speaker-side={speakerSide}
      onClick={onAdvance}
    >
      {tailVisible && tailX !== null && (
        <span
          aria-hidden="true"
          className="fx-bubble-tail absolute"
          data-testid="speech-bubble-tail"
          style={{ top: -14, left: tailX - TAIL_HALF_WIDTH_PX }}
        />
      )}

      {speakerName && (
        <span
          className="absolute -top-4 left-6 inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-sm font-bold"
          style={{
            background: 'var(--game-gold)',
            color: 'var(--game-ink)',
            border: 'var(--game-outline-width) solid var(--game-wood-dark)',
          }}
          data-testid="vn-dialog-speaker"
        >
          {speakerAvatar && (
            <span aria-hidden="true" className="inline-flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full">
              {speakerAvatar}
            </span>
          )}
          {speakerName}
        </span>
      )}

      {toolbar}

      <div className="max-h-40 overflow-y-auto">
        {hasBeat ? (
          <>
            <span className="sr-only" aria-live="polite" data-testid="speech-bubble-full-text">
              {full}
            </span>
            <p
              aria-hidden="true"
              className={`min-h-[3rem] text-base leading-relaxed ${italic ? 'italic' : ''}`}
              style={{ color: italic ? 'var(--game-ink-muted)' : 'var(--game-ink)' }}
              data-testid="speech-bubble-text"
            >
              {head}
              {last && (
                <span key={text.length} className="fx-pop inline-block whitespace-pre">
                  {last}
                </span>
              )}
            </p>
          </>
        ) : (
          <p className="text-sm" style={{ color: 'var(--game-ink-muted)' }}>
            {emptyText ?? S.historyEmpty}
          </p>
        )}
        {children}
      </div>

      {canContinue && (
        <span
          aria-hidden="true"
          className="fx-next-arrow pointer-events-none absolute inset-x-0 bottom-1 text-center text-lg leading-none"
          style={{ color: 'var(--game-wood-dark)' }}
          data-testid="speech-bubble-next"
        >
          ▼
        </span>
      )}
    </div>
  );
}

export default SpeechBubble;

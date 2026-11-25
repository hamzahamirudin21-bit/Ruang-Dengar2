import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import type { ForwardedRef } from 'react';
import { STRINGS } from '../../data/strings';
import type { CounselorSkillId } from '../../types';
import { useReducedMotion } from '../motion/useMotion';
import { playSfx } from '../motion/sfx';
import { INITIAL_CARD_STATE, cardReduce, commitDelayMs } from './choiceStyle';
import type { CardEvent, CardState } from './choiceStyle';

export interface VnChoiceItem {
  id: string;
  text: string;
  skillId?: CounselorSkillId;
}

export interface VnChoicesProps {
  choices: readonly VnChoiceItem[];
  onChoose: (choiceId: string) => void;
  className?: string;
}

function setRef<T>(ref: ForwardedRef<T>, value: T | null) {
  if (typeof ref === 'function') ref(value);
  else if (ref) ref.current = value;
}

/**
 * Menu pilihan VN vertikal yang simetris di tengah layar di atas kotak dialog:
 * tombol kertas-gading seragam dengan lencana nomor bulat, kilat pilihan,
 * dan ikon gaya percakapan yang netral.
 */
export const VnChoices = forwardRef<HTMLDivElement, VnChoicesProps>(function VnChoices(
  { choices, onChoose, className },
  ref,
) {
  const S = STRINGS.story;
  const reduced = useReducedMotion();
  const [card, setCard] = useState<CardState>(INITIAL_CARD_STATE);
  const cardRef = useRef<CardState>(INITIAL_CARD_STATE);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onChooseRef = useRef(onChoose);
  onChooseRef.current = onChoose;

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const dispatch = useCallback((event: CardEvent) => {
    const r = cardReduce(cardRef.current, event);
    cardRef.current = { phase: r.phase, chosenIndex: r.chosenIndex };
    setCard(cardRef.current);
    return r;
  }, []);

  useEffect(() => {
    clearTimer();
    dispatch({ type: 'reset' });
  }, [choices, clearTimer, dispatch]);

  useEffect(() => clearTimer, [clearTimer]);

  const activate = (index: number, choiceId: string) => {
    if (cardRef.current.phase !== 'diam') return;
    dispatch({ type: 'aktifkan', index });
    playSfx('pilih');
    clearTimer();
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      const r = dispatch({ type: 'tunda-selesai' });
      if (r.commit) onChooseRef.current(choiceId);
    }, commitDelayMs(reduced));
  };

  return (
    <div
      ref={(node) => setRef(ref, node)}
      role="group"
      aria-label={S.choicesGroupLabel}
      className={`vn-choice-menu ${className ?? ''}`}
    >
      {choices.map((choice, i) => (
        <button
          key={choice.id}
          type="button"
          data-story-choice
          data-choice-id={choice.id}
          aria-label={S.choiceAria(i + 1, choice.text)}
          onClick={() => activate(i, choice.id)}
          className={`vn-choice fx-card ${
            card.phase !== 'diam'
              ? card.chosenIndex === i
                ? 'fx-card-chosen'
                : 'fx-card-dim'
              : ''
          }`}
        >
          <span aria-hidden="true" className="vn-choice-num">
            {i + 1}
          </span>
          <span className="flex-1">{choice.text}</span>
          <span aria-hidden="true" className="vn-choice-chevron shrink-0">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 6 6 6-6 6" />
            </svg>
          </span>
        </button>
      ))}
    </div>
  );
});

export default VnChoices;

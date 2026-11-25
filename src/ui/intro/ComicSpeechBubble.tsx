import React from 'react';
import { ComicBubblePosition, ComicEmotion, getComicCharacterIdentity } from './comicIntroData';
import { ActiveDialogueRenderState } from './IntroTimeline';

export interface ComicSpeechBubbleProps {
  dialogueState: ActiveDialogueRenderState;
}

const POSITION_CLASSES: Readonly<Record<ComicBubblePosition, string>> = {
  'top-left': 'top-12 left-3 sm:left-4',
  'top-right': 'top-12 right-3 sm:right-4',
  'bottom-left': 'bottom-3 left-3 sm:left-4',
  'bottom-right': 'bottom-3 right-3 sm:right-4',
};

const EMOTION_BADGE: Readonly<Record<ComicEmotion, { label: string; border: string }>> = {
  calm: { label: 'Tenang', border: '#38bdf8' },
  focused: { label: 'Fokus', border: '#22d3ee' },
  enthusiastic: { label: 'Antusias', border: '#f59e0b' },
  thoughtful: { label: 'Reflektif', border: '#a78bfa' },
  determined: { label: 'Tegas', border: '#fb923c' },
  warm: { label: 'Hangat', border: '#34d399' },
};

export const ComicSpeechBubble: React.FC<ComicSpeechBubbleProps> = ({ dialogueState }) => {
  const { entry, visibleText } = dialogueState;
  const identity = getComicCharacterIdentity(entry.speakerId);
  const emotionStyle = EMOTION_BADGE[entry.emotion] ?? EMOTION_BADGE.calm;
  const posClass = POSITION_CLASSES[entry.bubblePosition] ?? POSITION_CLASSES['bottom-left'];

  return (
    <div
      className={`comic-intro-speech-bubble pointer-events-none absolute z-30 max-w-[88%] sm:max-w-[46%] ${posClass}`}
      data-dialogue-id={entry.id}
      data-speaker-id={entry.speakerId}
    >
      <div
        className="relative rounded-2xl border-[3px] border-slate-950 bg-[#fffdf7] px-3.5 py-2.5 text-slate-950 shadow-[4px_5px_0_#020617]"
        style={{
          borderColor: '#0f172a',
        }}
      >
        {/* Header Nama Pembicara */}
        <div className="mb-1 flex items-center justify-between gap-2 border-b border-slate-200 pb-1">
          <div className="flex items-center gap-1.5">
            <span
              className="inline-block rounded px-1.5 py-0.5 text-[10px] font-black text-slate-950"
              style={{ backgroundColor: identity.accentColor }}
            >
              {identity.orderNumber}
            </span>
            <span className="text-xs font-black tracking-tight text-slate-900">
              {entry.speakerName}
            </span>
          </div>
          <span
            className="rounded-full border px-1.5 py-0.2 text-[9px] font-bold uppercase text-slate-700"
            style={{ borderColor: emotionStyle.border }}
          >
            {emotionStyle.label}
          </span>
        </div>

        {/* Isi Dialog Bergaya Komik */}
        <p className="text-xs leading-snug font-bold text-slate-900 sm:text-[13px]">
          “{visibleText}”
        </p>

        {/* Ekor Balon Komik */}
        <div
          className={`absolute -top-2.5 h-4 w-4 rotate-45 border-t-[3px] border-l-[3px] border-slate-950 bg-[#fffdf7] ${
            entry.bubblePosition.endsWith('right') ? 'right-8' : 'left-8'
          }`}
        />
      </div>
    </div>
  );
};

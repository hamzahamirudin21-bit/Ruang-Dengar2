import { useEffect, useRef } from 'react';
import type { KeyboardEvent } from 'react';
import { STRINGS } from '../../data/strings';
import type { StoryHistoryEntry } from '../../engine/story/runner';
import type { StoryGraph } from '../../engine/story/storyTypes';
import { followUpReplyFor } from './storyUi';

export interface StoryHistoryPanelProps {
  entries: readonly StoryHistoryEntry[];
  graph?: Pick<StoryGraph, 'nodes'>;
  studentName: string;
  onClose: () => void;
  reducedMotion: boolean;
}

const TITLE_ID = 'story-history-title';

export function StoryHistoryPanel({
  entries,
  graph,
  studentName,
  onClose,
  reducedMotion,
}: StoryHistoryPanelProps) {
  const S = STRINGS.story;
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key !== 'Tab') return;
    const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], [tabindex]:not([tabindex="-1"])',
    );
    if (!focusables || focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;
    if (e.shiftKey && (active === first || !panelRef.current?.contains(active))) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#2c1a0e]/65 p-4 backdrop-blur-xs"
      onKeyDown={handleKeyDown}
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={TITLE_ID}
        onClick={(e) => e.stopPropagation()}
        className={`vn-box--solid flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden ${
          reducedMotion ? '' : 'fx-panel-in'
        }`}
      >
        <div className="flex items-center justify-between gap-3 border-b-[3px] border-[#3e2517] bg-gradient-to-r from-[#2e8274] to-[#216459] px-5 py-3.5 text-[#fffdf6]">
          <h2 id={TITLE_ID} className="font-['Fredoka'] text-lg font-bold drop-shadow-[0_2px_0_#3e2517]">
            {S.historyTitle}
          </h2>
          <button
            ref={closeRef}
            type="button"
            aria-label={S.historyCloseAria}
            onClick={onClose}
            className="game-btn-secondary !min-h-[2rem] !px-4 text-xs"
          >
            {S.historyCloseBtn}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4" tabIndex={0}>
          {entries.length === 0 ? (
            <p className="text-sm text-[#6b482e]">{S.historyEmpty}</p>
          ) : (
            <ol className="flex flex-col gap-3">
              {entries.map((entry, idx) => {
                const prevNodeId = entry.fromNodeId ?? (idx > 0 ? entries[idx - 1].nodeId : null);
                const followUp = graph
                  ? followUpReplyFor(graph, entry.nodeId, entry.studentLine, prevNodeId)
                  : null;
                return (
                  <li
                    key={`${entry.turn}-${entry.nodeId}-${idx}`}
                    className="rounded-2xl border-2 border-[#3e2517]/25 bg-[#fffdf7] p-3.5 shadow-[inset_0_-3px_0_#f0e0bf]"
                  >
                    <div className="mb-2 inline-block rounded-full border border-[#3e2517]/30 bg-[#f7e7c5] px-2.5 py-0.5 font-['Fredoka'] text-[0.7rem] font-bold text-[#5d3d26]">
                      {entry.turn === 0 ? 'Pembuka' : `Langkah ${entry.turn}`}
                    </div>
                    {entry.counselorLine && (
                      <p className="mb-2 rounded-xl border border-[#2e8274]/30 bg-[#ecfbf6] px-3 py-2 text-sm leading-relaxed text-[#243d38]">
                        <span className="font-['Fredoka'] font-bold text-[#1e685b]">
                          {S.speakerCounselor}:
                        </span>{' '}
                        {entry.counselorLine}
                      </p>
                    )}
                    {entry.studentLine.aside && (
                      <p className="mb-1.5 text-sm italic text-[#6b482e]">
                        <span className="font-semibold not-italic">{S.narrationSpeaker}:</span>{' '}
                        {entry.studentLine.aside}
                      </p>
                    )}
                    <p className="rounded-xl border border-[#d8534a]/25 bg-[#fff5f2] px-3 py-2 text-sm leading-relaxed text-[#3e2517]">
                      <span className="font-['Fredoka'] font-bold text-[#c4443c]">
                        {studentName}:
                      </span>{' '}
                      {entry.studentLine.text}
                    </p>
                    {entry.studentLine.cue && (
                      <p className="mt-1.5 border-l-2 border-[#d9b27a] pl-2.5 text-xs italic text-[#7a5234]">
                        {entry.studentLine.cue}
                      </p>
                    )}

                    {followUp && (
                      <div className="mt-2.5 border-t border-dashed border-[#3e2517]/20 pt-2.5">
                        {followUp.aside && (
                          <p className="mb-1 text-sm italic text-[#6b482e]">
                            <span className="font-semibold not-italic">{S.narrationSpeaker}:</span>{' '}
                            {followUp.aside}
                          </p>
                        )}
                        <p className="text-sm leading-relaxed text-[#3e2517]">
                          <span className="font-['Fredoka'] font-bold text-[#c4443c]">
                            {studentName}:
                          </span>{' '}
                          {followUp.text}
                        </p>
                        {followUp.cue && (
                          <p className="mt-1 text-xs italic text-[#7a5234]">{followUp.cue}</p>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}

export default StoryHistoryPanel;

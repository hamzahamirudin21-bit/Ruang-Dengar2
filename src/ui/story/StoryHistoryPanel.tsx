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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-xs"
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
          reducedMotion ? '' : 'transition-opacity duration-150'
        }`}
      >
        <div
          className="flex items-center justify-between gap-3 border-b px-5 py-3.5"
          style={{ borderColor: 'var(--vnp-border)', background: 'rgba(27, 42, 73, 0.05)' }}
        >
          <h2 id={TITLE_ID} className="text-base font-extrabold" style={{ color: 'var(--vn-navy)' }}>
            {S.historyTitle}
          </h2>
          <button
            ref={closeRef}
            type="button"
            aria-label={S.historyCloseAria}
            onClick={onClose}
            className="vn-topbtn"
          >
            {S.historyCloseBtn}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4" tabIndex={0}>
          {entries.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--vnp-ink-muted)' }}>
              {S.historyEmpty}
            </p>
          ) : (
            <ol className="flex flex-col gap-3.5">
              {entries.map((entry, idx) => {
                const prevNodeId = entry.fromNodeId ?? (idx > 0 ? entries[idx - 1].nodeId : null);
                const followUp = graph
                  ? followUpReplyFor(graph, entry.nodeId, entry.studentLine, prevNodeId)
                  : null;
                return (
                  <li
                    key={`${entry.turn}-${entry.nodeId}-${idx}`}
                    className="rounded-xl border p-3.5"
                    style={{ borderColor: 'var(--vnp-border)', background: 'rgba(255, 255, 255, 0.72)' }}
                  >
                    <div className="mb-1.5 text-[0.7rem] font-bold uppercase tracking-wider" style={{ color: 'var(--vnp-ink-muted)' }}>
                      Giliran {entry.turn}
                    </div>
                    {entry.counselorLine && (
                      <p className="mb-2 text-sm leading-relaxed">
                        <span className="font-bold" style={{ color: 'var(--vnp-name-dosen)' }}>
                          {S.speakerCounselor}:
                        </span>{' '}
                        {entry.counselorLine}
                      </p>
                    )}
                    {entry.studentLine.aside && (
                      <p className="mb-1.5 text-sm italic" style={{ color: 'var(--vnp-ink-muted)' }}>
                        <span className="font-semibold not-italic">{S.narrationSpeaker}:</span>{' '}
                        {entry.studentLine.aside}
                      </p>
                    )}
                    <p className="text-sm leading-relaxed">
                      <span className="font-bold" style={{ color: 'var(--vnp-name-mhs)' }}>
                        {studentName}:
                      </span>{' '}
                      {entry.studentLine.text}
                    </p>
                    {entry.studentLine.cue && (
                      <p className="mt-1 text-xs italic" style={{ color: 'var(--vnp-ink-muted)' }}>
                        {entry.studentLine.cue}
                      </p>
                    )}

                    {followUp && (
                      <div className="mt-2.5 border-t pt-2.5" style={{ borderColor: 'var(--vnp-border)' }}>
                        {followUp.aside && (
                          <p className="mb-1 text-sm italic" style={{ color: 'var(--vnp-ink-muted)' }}>
                            <span className="font-semibold not-italic">{S.narrationSpeaker}:</span>{' '}
                            {followUp.aside}
                          </p>
                        )}
                        <p className="text-sm leading-relaxed">
                          <span className="font-bold" style={{ color: 'var(--vnp-name-mhs)' }}>
                            {studentName}:
                          </span>{' '}
                          {followUp.text}
                        </p>
                        {followUp.cue && (
                          <p className="mt-1 text-xs italic" style={{ color: 'var(--vnp-ink-muted)' }}>
                            {followUp.cue}
                          </p>
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

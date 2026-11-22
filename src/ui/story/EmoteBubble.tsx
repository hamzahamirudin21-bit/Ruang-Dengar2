import React, { useEffect, useState } from 'react';
import { EmoteIcon } from '../components/GameIcons';
import { MOTION_MS } from '../motion/motionTokens';
import type { EmoteId } from './emoteModel';

export interface EmoteBubbleProps {
  emote: EmoteId | null;
  /** Berubah → emote ditampilkan ulang. */
  triggerKey: string | number;
  reducedMotion?: boolean;
}

/**
 * Gelembung emote bulat berekor di atas potret. Tampil sebesar durasi token 'emote'
 * (1400 ms), satu per waktu. Saat gerak dikurangi, gelembung tampil statis (tanpa
 * animasi pop; CSS .fx-emote-pop dinonaktifkan) lalu disembunyikan pada durasi yang sama.
 */
export const EmoteBubble: React.FC<EmoteBubbleProps> = ({ emote, triggerKey, reducedMotion = false }) => {
  const [visible, setVisible] = useState<EmoteId | null>(null);

  useEffect(() => {
    if (!emote) {
      setVisible(null);
      return;
    }
    setVisible(emote);
    const timer = setTimeout(() => setVisible(null), MOTION_MS.emote);
    return () => clearTimeout(timer);
  }, [emote, triggerKey]);

  if (!visible) return null;

  return (
    <div
      key={`${triggerKey}-${visible}`}
      aria-hidden="true"
      className="fx-emote-pop pointer-events-none"
      data-reduced={reducedMotion ? 'true' : undefined}
      style={{ position: 'relative', display: 'inline-block' }}
    >
      <div
        style={{
          width: '2.85rem',
          height: '2.85rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          color: 'var(--game-ink)',
          background: 'var(--game-cream-paper)',
          border: 'var(--game-outline-width) solid var(--vn-navy)',
          boxShadow: 'inset 0 0 0 2px var(--vn-gold), 0 4px 0 var(--vn-navy)',
        }}
      >
        <EmoteIcon id={visible} className="w-6 h-6" />
      </div>
      <span
        style={{
          position: 'absolute',
          left: '50%',
          bottom: '-7px',
          width: '10px',
          height: '10px',
          background: 'var(--game-cream-paper)',
          borderRight: 'var(--game-outline-width) solid var(--vn-navy)',
          borderBottom: 'var(--game-outline-width) solid var(--vn-navy)',
          transform: 'translateX(-50%) rotate(45deg)',
        }}
      />
    </div>
  );
};

export default EmoteBubble;

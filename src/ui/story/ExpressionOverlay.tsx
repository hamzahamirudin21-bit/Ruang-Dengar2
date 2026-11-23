import type { StoryExpression } from '../../engine/story/storyTypes';

export type ReactionKind = 'tepat' | 'salah' | null;

export interface ExpressionOverlayProps {
  role: 'dosen' | 'mahasiswa';
  expression: StoryExpression;
  reactionKind?: ReactionKind;
  isSpeaker: boolean;
  reducedMotion: boolean;
}

interface MoodVisual {
  badgeIcon: string;
  badgeLabel: string;
  tone: 'senang' | 'lega' | 'sedih' | 'cemas' | 'terkejut' | 'kesal' | 'lelah' | 'renung' | 'tenang';
  showBlush?: boolean;
  showWarmGlow?: boolean;
  showGloomCloud?: boolean;
  showSweatdrop?: boolean;
  showShockBurst?: boolean;
  showAngerSteam?: boolean;
  showThoughtDots?: boolean;
  showFatigueSpiral?: boolean;
  showQuestionGlint?: boolean;
  showReliefPuff?: boolean;
}

function resolveVisual(
  role: 'dosen' | 'mahasiswa',
  expression: StoryExpression,
  reactionKind: ReactionKind,
  isSpeaker: boolean,
): MoodVisual {
  if (role === 'dosen') {
    if (reactionKind === 'tepat') {
      return {
        badgeIcon: '💛',
        badgeLabel: 'Empati Hangat',
        tone: 'senang',
        showWarmGlow: true,
        showBlush: true,
      };
    }
    if (reactionKind === 'salah') {
      return {
        badgeIcon: '😅',
        badgeLabel: 'Kurang Tepat',
        tone: 'cemas',
        showSweatdrop: true,
      };
    }
    if (expression === 'tersenyum' || expression === 'lega') {
      return {
        badgeIcon: '😊',
        badgeLabel: isSpeaker ? 'Menyapa Hangat' : 'Menyimak Ramah',
        tone: 'senang',
        showWarmGlow: true,
      };
    }
    if (expression === 'cemas' || expression === 'tertegun') {
      return {
        badgeIcon: '🤝',
        badgeLabel: 'Penuh Perhatian',
        tone: 'renung',
      };
    }
    return {
      badgeIcon: '👂',
      badgeLabel: isSpeaker ? 'Berbicara Tenang' : 'Mendengarkan',
      tone: 'tenang',
    };
  }

  // Mahasiswa: reaksi langsung pilihan konselor (+12% senang / -14% kecewa-sedih) diprioritaskan
  if (reactionKind === 'tepat') {
    return {
      badgeIcon: '😊',
      badgeLabel: 'Merasa Didengar',
      tone: 'senang',
      showBlush: true,
      showWarmGlow: true,
    };
  }
  if (reactionKind === 'salah') {
    return {
      badgeIcon: '😔',
      badgeLabel: 'Merasa Kecewa',
      tone: 'sedih',
      showGloomCloud: true,
    };
  }

  switch (expression) {
    case 'tersenyum':
      return {
        badgeIcon: '😊',
        badgeLabel: 'Tampak Senang',
        tone: 'senang',
        showBlush: true,
        showWarmGlow: true,
      };
    case 'lega':
      return {
        badgeIcon: '😌',
        badgeLabel: 'Mulai Lega',
        tone: 'lega',
        showBlush: true,
        showReliefPuff: true,
        showWarmGlow: true,
      };
    case 'menunduk':
      return {
        badgeIcon: '😔',
        badgeLabel: 'Tampak Sedih',
        tone: 'sedih',
        showGloomCloud: true,
      };
    case 'menutup-diri':
      return {
        badgeIcon: '😞',
        badgeLabel: 'Menarik Diri',
        tone: 'sedih',
        showGloomCloud: true,
      };
    case 'cemas':
      return {
        badgeIcon: '😥',
        badgeLabel: 'Tampak Cemas',
        tone: 'cemas',
        showSweatdrop: true,
      };
    case 'waspada':
      return {
        badgeIcon: '🤨',
        badgeLabel: 'Masih Waspada',
        tone: 'cemas',
        showQuestionGlint: true,
      };
    case 'terkejut':
      return {
        badgeIcon: '😮',
        badgeLabel: 'Terkejut',
        tone: 'terkejut',
        showShockBurst: true,
      };
    case 'tertegun':
      return {
        badgeIcon: '🤔',
        badgeLabel: 'Merenung Dalam',
        tone: 'renung',
        showThoughtDots: true,
      };
    case 'kesal':
      return {
        badgeIcon: '😤',
        badgeLabel: 'Terlihat Tegang',
        tone: 'kesal',
        showAngerSteam: true,
      };
    case 'lelah':
      return {
        badgeIcon: '🥱',
        badgeLabel: 'Tampak Lelah',
        tone: 'lelah',
        showFatigueSpiral: true,
      };
    case 'netral':
    default:
      return {
        badgeIcon: isSpeaker ? '💬' : '🙂',
        badgeLabel: isSpeaker ? 'Bercerita' : 'Menyimak',
        tone: 'tenang',
      };
  }
}

/**
 * Lapisan efek ekspresi emosional bergaya anime kampus yang kompatibel untuk
 * seluruh 18 mahasiswa dan Ibu Dosen BK tanpa menutupi wajah.
 */
export function ExpressionOverlay({
  role,
  expression,
  reactionKind = null,
  isSpeaker,
  reducedMotion,
}: ExpressionOverlayProps) {
  const vis = resolveVisual(role, expression, reactionKind, isSpeaker);
  const anim = reducedMotion ? 'vn-em-static' : '';

  return (
    <div
      className="vn-expr-overlay"
      aria-hidden="true"
      data-role={role}
      data-mood-tone={vis.tone}
      data-reaction={reactionKind ?? 'none'}
    >
      {/* 1. Cahaya halo hangat saat senang / lega / empati tersampaikan */}
      {vis.showWarmGlow && <div className={`vn-em-warm-aura ${anim}`} />}

      {/* 2. Rona pipi hangat lembut saat tersenyum / lega / merasa didengar */}
      {vis.showBlush && (
        <div className={`vn-em-blush-pair ${anim}`}>
          <span className="vn-em-blush" />
          <span className="vn-em-blush" />
        </div>
      )}

      {/* 3. Awan murung + garis hujan anime saat sedih / kecewa / pilihan salah */}
      {vis.showGloomCloud && (
        <div className={`vn-em-gloom-wrap ${anim}`}>
          <div className="vn-em-gloom-veil" />
          <svg
            className="vn-em-gloom-svg"
            viewBox="0 0 120 72"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Awan mendung kecil berbingkai tinta espresso */}
            <path
              d="M28 36 C18 36 14 24 23 19 C26 10 42 8 50 15 C58 7 76 9 80 19 C92 18 98 34 86 36 Z"
              fill="#8aa6c9"
              stroke="#3e2517"
              strokeWidth="2.8"
              strokeLinejoin="round"
            />
            <path
              d="M32 31 C26 31 24 24 30 22 C33 16 44 15 50 20"
              stroke="#c6dbf2"
              strokeWidth="2.2"
              strokeLinecap="round"
              opacity="0.7"
            />
            {/* Garis hujan / murung vertikal khas anime */}
            <line x1="30" y1="42" x2="27" y2="62" stroke="#5377a6" strokeWidth="2.6" strokeLinecap="round" className="vn-em-rain-drop" />
            <line x1="48" y1="44" x2="45" y2="66" stroke="#5377a6" strokeWidth="2.6" strokeLinecap="round" className="vn-em-rain-drop vn-em-delay-1" />
            <line x1="66" y1="42" x2="63" y2="63" stroke="#5377a6" strokeWidth="2.6" strokeLinecap="round" className="vn-em-rain-drop vn-em-delay-2" />
            <line x1="82" y1="44" x2="79" y2="61" stroke="#5377a6" strokeWidth="2.6" strokeLinecap="round" className="vn-em-rain-drop vn-em-delay-3" />
          </svg>
        </div>
      )}

      {/* 4. Tetes keringat anime glossy saat cemas / canggung */}
      {vis.showSweatdrop && (
        <svg
          className={`vn-em-sweatdrop ${role === 'dosen' ? 'vn-em-pos-right' : 'vn-em-pos-left'} ${anim}`}
          viewBox="0 0 36 50"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M18 4 C18 4 31 23 31 32 C31 40 25.2 46 18 46 C10.8 46 5 40 5 32 C5 23 18 4 18 4 Z"
            fill="#87d4ff"
            stroke="#3e2517"
            strokeWidth="2.8"
            strokeLinejoin="round"
          />
          <ellipse cx="13" cy="29" rx="3" ry="6" fill="#ffffff" opacity="0.88" transform="rotate(-14 13 29)" />
        </svg>
      )}

      {/* 5. Kilatan terkejut komik (!!) saat kaget */}
      {vis.showShockBurst && (
        <svg
          className={`vn-em-shock ${anim}`}
          viewBox="0 0 140 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M22 46 L10 18" stroke="#f5b63b" strokeWidth="4" strokeLinecap="round" />
          <path d="M36 34 L28 10" stroke="#e56256" strokeWidth="4" strokeLinecap="round" />
          <path d="M118 46 L130 18" stroke="#f5b63b" strokeWidth="4" strokeLinecap="round" />
          <path d="M104 34 L112 10" stroke="#e56256" strokeWidth="4" strokeLinecap="round" />
          <path d="M70 26 L70 6" stroke="#fff3c4" strokeWidth="4.5" strokeLinecap="round" />
        </svg>
      )}

      {/* 6. Tanda tegang / uap kecil saat kesal */}
      {vis.showAngerSteam && (
        <svg
          className={`vn-em-anger ${anim}`}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M15 8 C19 15 15 19 8 15" stroke="#e5534b" strokeWidth="3.6" strokeLinecap="round" />
          <path d="M33 8 C29 15 33 19 40 15" stroke="#e5534b" strokeWidth="3.6" strokeLinecap="round" />
          <path d="M15 40 C19 33 15 29 8 33" stroke="#e5534b" strokeWidth="3.6" strokeLinecap="round" />
          <path d="M33 40 C29 33 33 29 40 33" stroke="#e5534b" strokeWidth="3.6" strokeLinecap="round" />
        </svg>
      )}

      {/* 7. Gelembung refleksi (...) saat tertegun / merenung */}
      {vis.showThoughtDots && (
        <div className={`vn-em-thought ${anim}`}>
          <span className="vn-em-thought-dot" />
          <span className="vn-em-thought-dot vn-em-delay-1" />
          <span className="vn-em-thought-dot vn-em-delay-2" />
        </div>
      )}

      {/* 8. Hembusan napas lega lembut */}
      {vis.showReliefPuff && (
        <svg
          className={`vn-em-relief ${anim}`}
          viewBox="0 0 64 42"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M14 28 C10 28 8 22 13 20 C14 14 22 13 26 17 C31 12 41 14 42 21 C48 21 49 29 42 29 Z"
            fill="#e6fbf3"
            stroke="#2e8274"
            strokeWidth="2.4"
            strokeLinejoin="round"
          />
          <circle cx="54" cy="14" r="3" fill="#ffe694" />
          <circle cx="58" cy="24" r="2" fill="#8ce8c8" />
        </svg>
      )}

      {/* 9. Spiral lelah & hembusan napas berat */}
      {vis.showFatigueSpiral && (
        <svg
          className={`vn-em-fatigue ${anim}`}
          viewBox="0 0 54 54"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M27 27 C27 22 33 22 33 27 C33 34 21 35 20 27 C19 17 36 14 39 25 C42 36 27 45 17 39"
            stroke="#7d6ea8"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
        </svg>
      )}

      {/* 10. Kilau waspada (?) saat hati-hati */}
      {vis.showQuestionGlint && (
        <div className={`vn-em-question ${anim}`}>?</div>
      )}

      {/* 11. Lencana Isyarat Nonverbal Kompak di Bahu Bawah */}
      <div className="vn-mood-pill" data-tone={vis.tone}>
        <span className="vn-mood-pill-icon">{vis.badgeIcon}</span>
        <span>{vis.badgeLabel}</span>
      </div>
    </div>
  );
}

export default ExpressionOverlay;

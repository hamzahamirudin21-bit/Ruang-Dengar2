import type { SessionState } from '../../types';
import type { StoryCondition } from './storyTypes';

/**
 * Konteks minimal untuk evaluasi kondisi. StoryRunnerState (runner.ts)
 * kompatibel secara struktural, sehingga tidak ada impor melingkar.
 */
export interface ConditionContext {
  session: Pick<SessionState, 'vars' | 'unlockedLevel' | 'rupture'>;
  flags: readonly string[];
}

function evaluateCondition(cond: StoryCondition, state: ConditionContext): boolean {
  switch (cond.type) {
    case 'trust-min':
      return state.session.vars.trust >= cond.value;
    case 'trust-max':
      return state.session.vars.trust <= cond.value;
    case 'level-min':
      return state.session.unlockedLevel >= cond.value;
    case 'level-max':
      return state.session.unlockedLevel <= cond.value;
    case 'tension':
      return state.session.rupture.active === cond.active;
    case 'flag':
      return state.flags.includes(cond.flag) === (cond.set ?? true);
  }
}

/** Konjungsi semua kondisi; daftar kosong bernilai true. Fungsi murni. */
export function evaluateConditions(
  conds: readonly StoryCondition[],
  state: ConditionContext,
): boolean {
  return conds.every((c) => evaluateCondition(c, state));
}

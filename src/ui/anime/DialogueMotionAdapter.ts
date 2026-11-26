import type { StoryExpression } from '../../engine/story/storyTypes';
import { resolveDialoguePose, type PoseId } from '../characters/poseCatalog';
import type { AnimeExpressionId, AnimeSequenceKind } from './CharacterAssetManager';
import { sharedExpressionManager } from './ExpressionManager';
import type { MotionKeyframe, MotionTransitionType } from './MotionTimeline';

export interface DialogueMotionInput {
  characterId: string;
  storyExpression: StoryExpression;
  dialogueText: string;
  isSpeaker: boolean;
  isListening?: boolean;
  reactionKind?: 'tepat' | 'salah' | null;
  previousPoseId?: PoseId | null;
  startTimeMs?: number;
}

/**
 * DialogueMotionAdapter — Menghubungkan Dialogue Engine dengan MotionTimeline,
 * ExpressionManager, PoseManager, dan AnimationController secara terpadu.
 */
export class DialogueMotionAdapter {
  public adapt(input: DialogueMotionInput): MotionKeyframe {
    const poseRes = resolveDialoguePose({
      speakerId: input.characterId,
      expression: input.storyExpression,
      dialogueText: input.dialogueText,
      isSpeaker: input.isSpeaker,
      isListening: input.isListening,
      reactionKind: input.reactionKind,
      previousPoseId: input.previousPoseId,
    });

    const expressionId: AnimeExpressionId =
      poseRes.emotion === 'excited'
        ? 'excited'
        : poseRes.emotion === 'exhausted'
          ? 'tired'
          : poseRes.emotion === 'surprised'
            ? 'surprised'
            : poseRes.emotion === 'thinking'
              ? 'thinking'
              : poseRes.emotion === 'curious'
                ? 'curious'
                : poseRes.emotion === 'confused'
                  ? 'confused'
                  : poseRes.emotion === 'confident'
                    ? 'confident'
                    : poseRes.emotion === 'shy'
                      ? 'shy'
                      : poseRes.emotion === 'reassuring'
                        ? 'reassuring'
                        : sharedExpressionManager.mapStoryExpression(input.storyExpression);

    const animationSequence: AnimeSequenceKind = !input.isSpeaker || input.isListening
      ? 'idle'
      : poseRes.animationType === 'excited-reaction' || poseRes.animationType === 'surprise-transition'
        ? 'gestures'
        : 'talking';

    const transitionType: MotionTransitionType =
      poseRes.transition === 'reaction-snap'
        ? 'snap-reaction'
        : poseRes.transition === 'calm-settle'
          ? 'smooth-settle'
          : 'crossfade';

    return {
      characterId: input.characterId,
      emotion: poseRes.emotion,
      expressionId,
      poseId: poseRes.poseId,
      gestureId: poseRes.gesture,
      animationSequence,
      startTime: input.startTimeMs ?? 0,
      duration: poseRes.duration,
      transitionType,
    };
  }
}

export const sharedDialogueMotionAdapter = new DialogueMotionAdapter();

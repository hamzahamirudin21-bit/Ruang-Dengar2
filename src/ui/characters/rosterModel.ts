import type { StudentSeedBlueprint } from '../../data/agents.seed'
import { getAppearance } from './appearance'
import { backdropForZone, type SceneBackdropId } from './cardBackdrop'
import { topInterests, type InterestLabel } from './interestLabels'

export interface RosterCardModel {
  studentId: string
  number: string
  name: string
  styleName: string
  interests: readonly InterestLabel[]
  backdrop: SceneBackdropId
}

export const ROSTER_COLUMNS = 5

export function buildRosterModel(
  blueprints: readonly Pick<StudentSeedBlueprint, 'id' | 'name' | 'interests' | 'initialZoneId'>[],
): readonly RosterCardModel[] {
  return blueprints.map((b, index) => {
    const match = /(\d+)$/.exec(b.id)
    const n = match ? Number(match[1]) : index + 1
    return {
      studentId: b.id,
      number: String(n).padStart(2, '0'),
      name: b.name,
      styleName: getAppearance(b.id).styleName,
      interests: topInterests(b.interests),
      backdrop: backdropForZone(b.initialZoneId),
    }
  })
}

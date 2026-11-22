import type { SceneArtId, SceneVariant } from '../scene/sceneArt'

export interface TitleLabels {
  startLabel: string
  aboutLabel: string
  aboutTooltip: string
  settingsLabel: string
}

export interface TitleMenuItem {
  id: 'mulai' | 'tentang' | 'pengaturan'
  label: string
  primary: boolean
  enabled: boolean
  tooltip?: string
}

export function buildTitleMenu(labels: TitleLabels): readonly TitleMenuItem[] {
  return [
    { id: 'mulai', label: labels.startLabel, primary: true, enabled: true },
    { id: 'tentang', label: labels.aboutLabel, primary: false, enabled: false, tooltip: labels.aboutTooltip },
    { id: 'pengaturan', label: labels.settingsLabel, primary: false, enabled: true },
  ]
}

export function titleBackdrop(): { id: SceneArtId; variant: SceneVariant } {
  return { id: 'lab-umum', variant: 'pagi' }
}

export function titleKeyAction(
  key: string,
  targetTag: string | null,
  settingsOpen: boolean,
): 'mulai' | 'abaikan' {
  if (settingsOpen) return 'abaikan'
  if (key !== 'Enter' && key !== ' ') return 'abaikan'
  if (targetTag === 'BUTTON' || targetTag === 'INPUT') return 'abaikan'
  return 'mulai'
}

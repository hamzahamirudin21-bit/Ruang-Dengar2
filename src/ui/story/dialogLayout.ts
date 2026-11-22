// Perhitungan murni tata letak percakapan: panel, grid pilihan, potret, dan potongan cover.

export const DIALOG_RATIO = 0.47
export const DIALOG_RATIO_COMPACT = 0.5
export const CHOICE_TWO_COL_MIN_WIDTH = 640

const PORTRAIT_SCALE_MIN = 2
const PORTRAIT_SCALE_MAX = 7
/** Tinggi panggung (px) per satu langkah skala potret. */
const STAGE_PX_PER_SCALE = 90
/** Lebar viewport (px) per satu langkah skala potret (batas atas dari lebar). */
const WIDTH_PX_PER_SCALE = 120

function isValid(n: number): boolean {
  return Number.isFinite(n) && n > 0
}

export function dialogPanelHeight(viewportHeight: number): number {
  if (!isValid(viewportHeight)) return 0
  const ratio = viewportHeight < 600 ? DIALOG_RATIO_COMPACT : DIALOG_RATIO
  return Math.round(viewportHeight * ratio)
}

export function stageHeight(viewportHeight: number): number {
  if (!isValid(viewportHeight)) return 0
  return viewportHeight - dialogPanelHeight(viewportHeight)
}

export function choiceColumns(innerWidth: number, choiceCount: number): 1 | 2 {
  return Number.isFinite(innerWidth) &&
    innerWidth >= CHOICE_TWO_COL_MIN_WIDTH &&
    Number.isFinite(choiceCount) &&
    choiceCount >= 2
    ? 2
    : 1
}

export function choiceGrid(
  innerWidth: number,
  choiceCount: number,
): { columns: 1 | 2; rows: number } {
  const columns = choiceColumns(innerWidth, choiceCount)
  const count = Number.isFinite(choiceCount) && choiceCount > 0 ? Math.floor(choiceCount) : 0
  return { columns, rows: Math.ceil(count / columns) }
}

export function choicePlacement(index: number, columns: 1 | 2): { row: number; col: number } {
  const i = Number.isFinite(index) && index > 0 ? Math.floor(index) : 0
  return { row: Math.floor(i / columns), col: i % columns }
}

export function stagePortraitScale(viewport: { width: number; height: number }): number {
  const byHeight = isValid(viewport.height)
    ? Math.floor(stageHeight(viewport.height) / STAGE_PX_PER_SCALE)
    : PORTRAIT_SCALE_MIN
  const byWidth = isValid(viewport.width)
    ? Math.floor(viewport.width / WIDTH_PX_PER_SCALE)
    : PORTRAIT_SCALE_MAX
  const scale = Math.min(byHeight, byWidth)
  return Math.max(PORTRAIT_SCALE_MIN, Math.min(PORTRAIT_SCALE_MAX, scale))
}

export interface CropRect {
  sx: number
  sy: number
  sw: number
  sh: number
}

export function coverCrop(srcW: number, srcH: number, dstW: number, dstH: number): CropRect {
  if (!isValid(srcW) || !isValid(srcH) || !isValid(dstW) || !isValid(dstH)) {
    return { sx: 0, sy: 0, sw: Math.max(0, srcW || 0), sh: Math.max(0, srcH || 0) }
  }
  const srcRatio = srcW / srcH
  const dstRatio = dstW / dstH
  let sw: number
  let sh: number
  if (srcRatio > dstRatio) {
    sh = srcH
    sw = srcH * dstRatio
  } else {
    sw = srcW
    sh = srcW / dstRatio
  }
  return { sx: (srcW - sw) / 2, sy: (srcH - sh) / 2, sw, sh }
}

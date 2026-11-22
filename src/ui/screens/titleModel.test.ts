import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { buildTitleMenu, titleBackdrop, titleKeyAction } from './titleModel'

const labels = {
  startLabel: 'Mulai Latihan',
  aboutLabel: 'Tentang & Landasan',
  aboutTooltip: 'Segera hadir',
  settingsLabel: 'Pengaturan',
}

describe('titleModel', () => {
  it('menyusun tepat tiga menu berurutan dengan mulai sebagai utama', () => {
    const menu = buildTitleMenu(labels)
    assert.deepEqual(menu.map((m) => m.id), ['mulai', 'tentang', 'pengaturan'])
    assert.deepEqual(menu.map((m) => m.label), ['Mulai Latihan', 'Tentang & Landasan', 'Pengaturan'])
    assert.deepEqual(menu.map((m) => m.primary), [true, false, false])
  })

  it('tentang nonaktif dengan tooltip; lainnya aktif', () => {
    const menu = buildTitleMenu(labels)
    assert.equal(menu[1].enabled, false)
    assert.equal(menu[1].tooltip, 'Segera hadir')
    assert.equal(menu[0].enabled, true)
    assert.equal(menu[2].enabled, true)
  })

  it('latar deterministik', () => {
    assert.deepEqual(titleBackdrop(), titleBackdrop())
  })

  // Feature: game-ui-polish, Property 16: Aksi tombol Layar Awal
  it('Property 16: titleKeyAction mulai iff Enter/Spasi, pengaturan tertutup, tag bukan BUTTON/INPUT', () => {
    let seed = 20240516
    const rnd = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0
      return seed / 0x100000000
    }
    const pick = <T,>(a: readonly T[]): T => a[Math.floor(rnd() * a.length)]
    const keys = ['Enter', ' ', 'Escape', 'a', 'Tab', '1', 'ArrowUp']
    const tags: (string | null)[] = [null, 'BUTTON', 'INPUT', 'DIV', 'BODY', 'CANVAS', 'A']
    for (let i = 0; i < 200; i++) {
      const key = pick(keys)
      const tag = pick(tags)
      const open = rnd() < 0.5
      const expected =
        (key === 'Enter' || key === ' ') && !open && tag !== 'BUTTON' && tag !== 'INPUT'
          ? 'mulai'
          : 'abaikan'
      assert.equal(titleKeyAction(key, tag, open), expected, `${key}/${tag}/${open}`)
    }
  })
})

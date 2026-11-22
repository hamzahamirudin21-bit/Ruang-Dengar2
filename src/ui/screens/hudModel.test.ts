import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { buildHudBadges, buildSpeedControls, buildSelectedMeters } from './hudModel'
import { badgeFractionText, badgeValueText, meterFraction } from '../components/game/gameTheme'
import { hudIconFor } from '../components/game/hudIcons'

const hudLabels = { day: 'Hari', labTime: 'Jam Lab', missionsDone: 'Misi selesai', activeStudents: 'Mahasiswa aktif' }
const speedLabels = {
  pause: 'Jeda',
  resume: 'Lanjut',
  speedLabel: (s: number) => `Kecepatan ${s}x`,
}
const meterLabels = { energy: 'Energi', stress: 'Stres' }

function rng(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 0x100000000
  }
}

describe('hudModel', () => {
  // Feature: game-ui-polish, Property 11: Lencana HUD
  // **Validates: Requirements 6.1, 6.2, 6.3, 6.4**
  it('Property 11: lencana berurutan tetap, ikon dari peta, misi berbentuk selesai/total', () => {
    const rnd = rng(11)
    for (let i = 0; i < 200; i++) {
      const input = {
        day: Math.floor(rnd() * 1500) - 5,
        clockText: `${Math.floor(rnd() * 24)}:00`,
        missionsDone: Math.floor(rnd() * 1200),
        missionsTotal: Math.floor(rnd() * 1200),
        activeStudents: Math.floor(rnd() * 1200),
      }
      const badges = buildHudBadges(input, hudLabels)
      assert.deepEqual(badges.map((b) => b.key), ['hari', 'jam-lab', 'misi-selesai', 'mahasiswa-aktif'])
      assert.deepEqual(badges.map((b) => b.label), ['Hari', 'Jam Lab', 'Misi selesai', 'Mahasiswa aktif'])
      for (const b of badges) assert.equal(b.icon, hudIconFor(b.key))
      assert.equal(new Set(badges.map((b) => b.icon)).size, 4)
      assert.equal(badges[0].value, badgeValueText(input.day))
      assert.equal(badges[1].value, input.clockText)
      assert.equal(badges[2].value, badgeFractionText(input.missionsDone, input.missionsTotal))
      assert.equal(badges[3].value, badgeValueText(input.activeStudents))
    }
    const b = buildHudBadges({ day: 2, clockText: '09:30', missionsDone: 1, missionsTotal: 3, activeStudents: 4 }, hudLabels)
    assert.equal(b[2].value, '1/3')
  })

  // Feature: game-ui-polish, Property 12: Kontrol jeda dan kecepatan
  // **Validates: Requirements 6.7, 6.8, 6.9**
  it('Property 12: satu kontrol jeda/putar dan kontrol kecepatan dengan status pressed konsisten', () => {
    const speeds = [1, 2, 4]
    for (const paused of [true, false]) {
      for (const speed of speeds) {
        const c = buildSpeedControls(speeds, { paused, speed }, speedLabels)
        assert.equal(c.length, 1 + speeds.length)
        assert.equal(c[0].id, paused ? 'putar' : 'jeda')
        assert.equal(c[0].label, paused ? 'Lanjut' : 'Jeda')
        assert.equal(c[0].icon, hudIconFor(paused ? 'putar' : 'jeda'))
        assert.equal(c[0].pressed, paused)
        const rest = c.slice(1)
        assert.deepEqual(rest.map((x) => x.value), speeds)
        for (const r of rest) {
          assert.equal(r.icon, hudIconFor('kecepatan'))
          assert.equal(r.pressed, !paused && r.value === speed)
        }
        assert.equal(rest.filter((x) => x.pressed).length, paused ? 0 : 1)
      }
    }
  })

  // Feature: game-ui-polish, Property 13: Meter hanya dari nilai yang tersedia
  // **Validates: Requirements 8.2, 8.3**
  it('Property 13: meter null bila nilai tidak ada; ada bila nilai tersedia', () => {
    const none = buildSelectedMeters({ max: 100 }, meterLabels)
    assert.equal(none.energy, null)
    assert.equal(none.stress, null)

    const rnd = rng(13)
    for (let i = 0; i < 200; i++) {
      const energy = rnd() < 0.5 ? undefined : Math.floor(rnd() * 120)
      const stress = rnd() < 0.5 ? undefined : Math.floor(rnd() * 120)
      const m = buildSelectedMeters({ energy, stress, max: 100 }, meterLabels)
      assert.equal(m.energy === null, energy === undefined)
      assert.equal(m.stress === null, stress === undefined)
      if (m.energy) {
        assert.equal(m.energy.key, 'energi')
        assert.equal(m.energy.value, energy)
        assert.equal(m.energy.fraction, meterFraction(energy!, 100))
        assert.equal(m.energy.higherIsBetter, true)
        assert.equal(m.energy.label, 'Energi')
      }
      if (m.stress) {
        assert.equal(m.stress.key, 'stres')
        assert.equal(m.stress.fraction, meterFraction(stress!, 100))
        assert.equal(m.stress.higherIsBetter, false)
        assert.equal(m.stress.label, 'Stres')
      }
    }
    assert.equal(buildSelectedMeters({ energy: NaN, max: 100 }, meterLabels).energy, null)
  })

  it('sumber hudModel.ts tidak memuat variabel tersembunyi', () => {
    const src = readFileSync(new URL('./hudModel.ts', import.meta.url), 'utf8')
    for (const word of ['trust', 'readiness', 'stigma', 'rupture', 'exposure']) {
      assert.equal(new RegExp(word, 'i').test(src), false, word)
    }
  })
})

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { LAB_MAP } from '../../data/map';
import { computeSunLighting } from './sunLighting';
import { collectMapPointLights } from './pointLights';
import { WebGLPostFxRenderer } from './webglPostFx';

describe('Fase 1 GPU Lighting & Shadows Engine', () => {
  it('computeSunLighting menggeser arah bayangan dari barat (pagi) ke timur (sore)', () => {
    const morning = computeSunLighting(480); // 08:00
    const noon = computeSunLighting(750); // 12:30
    const afternoon = computeSunLighting(990); // 16:30

    assert.equal(morning.phase, 'pagi');
    assert.equal(noon.phase, 'siang');
    assert.equal(afternoon.phase, 'sore');

    assert.ok(morning.shadowDirX < -0.5, 'Pagi bayangan harus jatuh ke barat (negatif)');
    assert.ok(Math.abs(noon.shadowDirX) < 0.25, 'Siang bayangan hampir tegak di bawah');
    assert.ok(afternoon.shadowDirX > 0.6, 'Sore bayangan harus jatuh ke timur (positif)');

    assert.ok(afternoon.shadowLength > noon.shadowLength, 'Bayangan sore lebih panjang dari siang');
    assert.ok(morning.shadowLength > noon.shadowLength, 'Bayangan pagi lebih panjang dari siang');
    assert.ok(afternoon.indoorLampBoost > noon.indoorLampBoost, 'Lampu dalam ruangan makin kuat saat sore');
    assert.ok(afternoon.duskShade > 0.08, 'Nuansa senja aktif pada sore hari');
  });

  it('computeSunLighting aman terhadap input tak terhingga / ekstrem', () => {
    for (const bad of [NaN, Infinity, -Infinity, -500, 99999]) {
      const s = computeSunLighting(bad);
      assert.ok(Number.isFinite(s.shadowDirX));
      assert.ok(Number.isFinite(s.shadowDirY));
      assert.ok(Number.isFinite(s.indoorLampBoost));
      assert.ok(s.gradeRgb.every((v) => Number.isFinite(v)));
    }
  });

  it('collectMapPointLights memetakan seluruh sumber cahaya ruangan dan menaikkan intensitas saat Lampu Senja dipasang', () => {
    const baseLights = collectMapPointLights(LAB_MAP, [], 960, 2.5, false);
    const withLamp = collectMapPointLights(LAB_MAP, ['lampu-senja'], 960, 2.5, false);

    assert.ok(baseLights.length >= 12, 'Minimal 12 sumber cahaya tersebar di 11 ruangan');
    const kinds = new Set(baseLights.map((l) => l.kind));
    assert.ok(kinds.has('monitor'));
    assert.ok(kinds.has('weld'));
    assert.ok(kinds.has('oscilloscope'));
    assert.ok(kinds.has('printer'));
    assert.ok(kinds.has('lamp'));
    assert.ok(kinds.has('design'));
    assert.ok(kinds.has('sun-window'));

    const konsBase = baseLights.find((l) => l.id === 'light-kons-1');
    const konsLamp = withLamp.find((l) => l.id === 'light-kons-1');
    assert.ok(konsBase && konsLamp);
    assert.ok(konsLamp.radius > konsBase.radius, 'Lampu Senja memperluas radius pendar Ruang BK');
    assert.ok(konsLamp.intensity > konsBase.intensity, 'Lampu Senja memperkuat intensitas Ruang BK');
  });

  it('WebGLPostFxRenderer.create mengembalikan null secara aman di lingkungan Node tanpa WebGL2', () => {
    const fakeCanvas = { getContext: () => null } as unknown as HTMLCanvasElement;
    assert.equal(WebGLPostFxRenderer.create(fakeCanvas), null);
  });

  it('mode cuaca hujan, senja, dan cerah menghasilkan parameter pencahayaan dan lampu dalam ruangan yang tepat', () => {
    const sunny = computeSunLighting(600, 'cerah');
    const sunset = computeSunLighting(600, 'senja');
    const rainy = computeSunLighting(600, 'hujan');

    assert.equal(sunset.phase, 'sore');
    assert.ok(sunset.duskShade >= 0.1, 'Mode senja memiliki warna dusk keemasan yang kaya');
    assert.equal(rainy.indoorLampBoost, 1.0, 'Saat hujan lampu dalam ruangan menyala penuh (1.0)');
    assert.ok(rainy.gradeRgb[2] > rainy.gradeRgb[0], 'Saat hujan color grading cenderung sejuk kebiruan');
    assert.ok(sunny.godRayIntensity > rainy.godRayIntensity, 'Sinar god-ray lebih kuat saat cerah daripada hujan');
  });
});

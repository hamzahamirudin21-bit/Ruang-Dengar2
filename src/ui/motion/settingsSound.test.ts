import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_SETTINGS, loadSettings } from '../../utils/storage';

function stubStorage(raw: string | null) {
  (globalThis as any).window = {
    localStorage: { getItem: () => raw, setItem: () => undefined },
  };
}

test('soundEnabled bawaan false', () => {
  assert.equal(DEFAULT_SETTINGS.soundEnabled, false);
});

test('pengaturan lama tanpa soundEnabled dimuat sebagai false', () => {
  stubStorage(JSON.stringify({ textSize: 'large', reducedMotion: true, seed: 5, defaultSpeed: 2 }));
  const { value, error } = loadSettings('err');
  delete (globalThis as any).window;
  assert.equal(error, null);
  assert.equal(value.soundEnabled, false);
  assert.equal(value.textSize, 'large');
});

test('soundEnabled true tersimpan dimuat sebagai true', () => {
  stubStorage(JSON.stringify({ soundEnabled: true }));
  const { value } = loadSettings('err');
  delete (globalThis as any).window;
  assert.equal(value.soundEnabled, true);
});

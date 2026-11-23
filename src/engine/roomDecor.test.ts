import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_ROOM_DECOR_STATE,
  ROOM_DECOR_CATALOG,
  buyRoomDecor,
  computeAvailableStars,
  computeEarnedEmpathyStars,
  toggleEquipRoomDecor,
} from './roomDecor';
import type { MissionRecord } from './story/saveSlot';

test('roomDecor: bintang empati bertambah dari misi selesai dan bisa membeli serta memasang dekorasi', () => {
  assert.equal(ROOM_DECOR_CATALOG.length, 6);
  const emptyStars = computeEarnedEmpathyStars({});
  assert.equal(emptyStars, 1);

  const missions: Record<string, MissionRecord> = {
    'mhs-14': { status: 'selesai', sessions: 1, lastOutcome: 'terbantu', lastDay: 1 },
    'mhs-15': { status: 'lanjutan', sessions: 1, lastOutcome: 'kemajuan-kecil', lastDay: 1 },
  };
  assert.equal(computeEarnedEmpathyStars(missions), 4);

  const b1 = buyRoomDecor(DEFAULT_ROOM_DECOR_STATE, 'tanaman-monstera', missions);
  assert.equal(b1.ok, true);
  assert.deepEqual(b1.next.ownedIds, ['tanaman-monstera']);
  assert.deepEqual(b1.next.equippedIds, ['tanaman-monstera']);
  assert.equal(computeAvailableStars(missions, b1.next), 3);

  const b2 = buyRoomDecor(b1.next, 'pemutar-vinyl', missions);
  assert.equal(b2.ok, false, 'bintang kurang (3 < 4) harus ditolak');

  const unequipped = toggleEquipRoomDecor(b1.next, 'tanaman-monstera');
  assert.deepEqual(unequipped.equippedIds, []);
  const reequipped = toggleEquipRoomDecor(unequipped, 'tanaman-monstera');
  assert.deepEqual(reequipped.equippedIds, ['tanaman-monstera']);
});

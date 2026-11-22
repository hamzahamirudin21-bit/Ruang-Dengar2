import test from 'node:test';
import assert from 'node:assert/strict';
import { mulberry32, randomInt } from './rng';

test('mulberry32 menghasilkan urutan deterministik untuk seed yang sama', () => {
  const a = mulberry32(202601);
  const b = mulberry32(202601);

  for (let i = 0; i < 20; i += 1) {
    assert.equal(a(), b());
  }
});

test('mulberry32 menghasilkan nilai dalam rentang [0, 1) dan berbeda untuk seed berbeda', () => {
  const a = mulberry32(101);
  const b = mulberry32(202);

  let sameCount = 0;
  for (let i = 0; i < 25; i += 1) {
    const va = a();
    const vb = b();
    assert.ok(va >= 0 && va < 1);
    assert.ok(vb >= 0 && vb < 1);
    if (va === vb) {
      sameCount += 1;
    }
  }
  assert.ok(sameCount < 25);
});

test('randomInt menghormati batas inklusif', () => {
  const rng = mulberry32(77);
  for (let i = 0; i < 50; i += 1) {
    const val = randomInt(rng, 3, 9);
    assert.ok(Number.isInteger(val) && val >= 3 && val <= 9);
  }
});

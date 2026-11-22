import { test } from 'node:test';
import assert from 'node:assert/strict';
import { alreadyCoversNodeReply, buildBeats, followUpReplyFor } from './storyUi';
import type { StoryLine } from '../../engine/story/storyTypes';

const line = (text: string, aside?: string): StoryLine =>
  ({ text, expression: 'netral', cue: 'menunduk', ...(aside ? { aside } : {}) }) as unknown as StoryLine;

const graph = {
  nodes: [
    { id: 'a', sceneId: 'lab', reply: line('Waduh, alarm rapat tim bunyi setengah jam lagi.', 'Ponsel bergetar di meja.') },
    { id: 'b', sceneId: 'lab', reply: line('Di sini orang lalu-lalang terus, aku nggak enak kalau kedengaran anak lain.') },
    { id: 'bk0', sceneId: 'bk', reply: line('Nah, ini ruangannya. Rapi ya, jadwalku sampai jam tiga.') },
    { id: 'g', sceneId: 'bk', reply: line('Saya menangis semalam karena merasa gagal.'), gate: { conditions: [], otherwise: 'o' } },
    { id: 'o', sceneId: 'bk', reply: line('Tidak apa-apa, mungkin lain kali saja kubagikan.') },
    { id: 't', sceneId: 'lab', reply: line('Oke, aku lanjut kerja dulu ya.'), tension: { phase: 'awal' } },
  ],
} as never;

test('simpul baru tanpa gerbang mengembalikan reply simpul bila reaksi belum mencakup isinya', () => {
  const r = followUpReplyFor(graph, 'a', line('Kabarku baik-baik aja, cuma lagi kejar waktu.'), 'start');
  assert.equal(r?.text, 'Waduh, alarm rapat tim bunyi setengah jam lagi.');
  assert.equal(r?.aside, 'Ponsel bergetar di meja.');
});

test('self-loop (prevNodeId === nodeId) tidak mengulang reply simpul', () => {
  assert.equal(followUpReplyFor(graph, 'b', line('Makasih ya udah bilang.'), 'b'), null);
});

test('simpul ketegangan tidak menggandakan reply', () => {
  assert.equal(followUpReplyFor(graph, 't', line('Oh oke, aku lanjut kerja aja.'), 'a'), null);
});

test('reaksi yang sudah mencakup isi simpul (tanpa aside tertinggal) tidak diduplikasi', () => {
  const bridging = line('Iya betul, di sini orang lalu-lalang terus jadi nggak enak kalau kedengaran anak lain.');
  assert.equal(alreadyCoversNodeReply(bridging, line('Di sini orang lalu-lalang terus, aku nggak enak kalau kedengaran anak lain.')), true);
  assert.equal(followUpReplyFor(graph, 'b', bridging, 'a'), null);
});

test('perpindahan adegan menampilkan reply simpul baru bila belum tercakup reaksi', () => {
  const r = followUpReplyFor(graph, 'bk0', line('Yuk jalan, ruangannya rapi ya?'), 'b');
  assert.equal(r?.text, 'Nah, ini ruangannya. Rapi ya, jadwalku sampai jam tiga.');
});

test('perpindahan adegan tidak menduplikasi reply bila reaksi sudah merangkumnya', () => {
  const bridging = line('Siap, udah sampai. Nah, ini ruangannya rapi ya, jadwalku kosong sampai jam tiga.');
  assert.equal(followUpReplyFor(graph, 'bk0', bridging, 'b'), null);
});

test('simpul bergerbang dengan reaksi mengembalikan reply simpul', () => {
  const r = followUpReplyFor(graph, 'g', line('reaksi'), 'bk0');
  assert.equal(r?.text, 'Saya menangis semalam karena merasa gagal.');
  assert.equal(r?.cue, 'menunduk');
});

test('teks sama tidak diduplikasi', () => {
  assert.equal(followUpReplyFor(graph, 'g', line('Saya menangis semalam karena merasa gagal.'), 'bk0'), null);
});

test('target otherwise mengembalikan reply-nya', () => {
  assert.equal(followUpReplyFor(graph, 'o', line('reaksi'), 'bk0')?.text, 'Tidak apa-apa, mungkin lain kali saja kubagikan.');
});

test('simpul tidak dikenal mengembalikan null', () => {
  assert.equal(followUpReplyFor(graph, 'zzz', line('x'), 'a'), null);
});

test('beat lanjutan ditaruh setelah beat reaksi', () => {
  const beats = buildBeats({ counselorLine: 'Dosen', student: line('reaksi') });
  const extra = followUpReplyFor(graph, 'g', line('reaksi'), 'bk0');
  assert.ok(extra);
  const all = [...beats, ...buildBeats({ counselorLine: null, student: extra })];
  const texts = all.filter((b) => b.kind === 'mahasiswa').map((b) => b.text);
  assert.deepEqual(texts, ['reaksi', 'Saya menangis semalam karena merasa gagal.']);
});

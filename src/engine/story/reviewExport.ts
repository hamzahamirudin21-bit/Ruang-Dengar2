/**
 * Ekspor tinjauan dialog (Requirement 12.3).
 * Fungsi murni: Story_Graph -> markdown deterministik yang mudah dibaca
 * pengguna non-teknis. Tidak ada I/O, waktu, atau acak.
 */
import { isBeginnerMistake } from '../../data/storyStages';
import type {
  StoryChoice, StoryCondition, StoryGraph, StoryNode,
} from './storyTypes';

function describeCondition(c: StoryCondition): string {
  switch (c.type) {
    case 'trust-min': return `kepercayaan minimal ${c.value}`;
    case 'trust-max': return `kepercayaan maksimal ${c.value}`;
    case 'level-min': return `kedalaman minimal ${c.value}`;
    case 'level-max': return `kedalaman maksimal ${c.value}`;
    case 'tension': return c.active ? 'sedang ada ketegangan' : 'tidak ada ketegangan';
    case 'flag': return c.set === false ? `flag "${c.flag}" belum diset` : `flag "${c.flag}" sudah diset`;
  }
}

function describeTarget(next: string): string {
  if (next === '@ending') return 'menuju akhir sesi';
  if (next === '@resume') return 'kembali ke alur sebelumnya';
  return next;
}

function describeAction(choice: StoryChoice): string | null {
  const a = choice.action;
  if (!a || a.kind === 'skill') return null;
  switch (a.kind) {
    case 'akui-ketegangan': return 'mengakui ketegangan';
    case 'perbaikan': return `langkah perbaikan: ${a.step}`;
    case 'janji': return `janji tindak lanjut (${a.dueDayOffset} hari)`;
  }
}

/** Jumlah simpul pada jalur terpendek dari simpul awal ke simpul akhir; null bila tidak ada. */
function shortestPathLength(graph: StoryGraph): number | null {
  const byId = new Map<string, StoryNode>();
  for (const n of graph.nodes) byId.set(n.id, n);
  if (!byId.has(graph.startNodeId)) return null;

  const endingTargets = Object.values(graph.endings);
  const neighbors = (n: StoryNode): string[] => {
    const out: string[] = [];
    const push = (id: string) => {
      if (id === '@ending') out.push(...endingTargets);
      else if (!id.startsWith('@')) out.push(id);
    };
    for (const c of n.choices) {
      push(c.next);
      for (const r of c.routes ?? []) push(r.next);
    }
    if (n.gate) push(n.gate.otherwise);
    return out;
  };

  const dist = new Map<string, number>([[graph.startNodeId, 1]]);
  const queue: string[] = [graph.startNodeId];
  for (let i = 0; i < queue.length; i++) {
    const id = queue[i];
    const node = byId.get(id);
    if (!node) continue;
    if (node.ending || node.choices.length === 0) return dist.get(id) ?? null;
    for (const nid of neighbors(node)) {
      if (!dist.has(nid) && byId.has(nid)) {
        dist.set(nid, (dist.get(id) ?? 0) + 1);
        queue.push(nid);
      }
    }
  }
  return null;
}

function renderChoice(choice: StoryChoice, index: number): string[] {
  const marks: string[] = [];
  if (choice.best) marks.push('[TERBAIK]');
  if (isBeginnerMistake(choice)) marks.push('[KELIRU]');
  const head = `${index + 1}. ${marks.length ? marks.join(' ') + ' ' : ''}(${choice.skillId}) "${choice.text}"`;
  const lines = [head];
  const action = describeAction(choice);
  if (action) lines.push(`   - Aksi: ${action}`);
  lines.push(`   - Tujuan: ${describeTarget(choice.next)}`);
  if (choice.reaction) {
    lines.push(`   - Reaksi khusus: "${choice.reaction.text}" (isyarat: ${choice.reaction.cue})`);
  }
  for (const r of choice.routes ?? []) {
    const when = r.when.length ? r.when.map(describeCondition).join(' dan ') : 'selalu';
    lines.push(`   - Jika ${when}: ke ${describeTarget(r.next)}`);
  }
  if (choice.setFlags?.length) lines.push(`   - Flag yang diset: ${choice.setFlags.join(', ')}`);
  return lines;
}

function renderNode(node: StoryNode, index: number): string[] {
  const lines: string[] = [];
  lines.push(`## ${index + 1}. ${node.id}`);
  lines.push('');
  lines.push(`- Adegan: ${node.sceneId}`);
  lines.push(`- Tahap: ${node.stage}`);
  lines.push(`- Kedalaman: ${node.depth}`);
  if (node.marks?.length) lines.push(`- Tanda: ${node.marks.join(', ')}`);
  if (node.tension) {
    lines.push(`- Ketegangan: fase ${node.tension.phase}${node.tension.expectedKind ? ` (${node.tension.expectedKind})` : ''}`);
  }
  if (node.onEnter?.setFlags?.length) lines.push(`- Flag diset saat masuk: ${node.onEnter.setFlags.join(', ')}`);
  if (node.ending) lines.push(`- Akhir sesi: ${node.ending.kind}`);
  if (node.gate) {
    const conds = node.gate.conditions.map(describeCondition).join(' dan ') || 'tanpa syarat';
    lines.push(`- Gerbang: dibuka bila ${conds}; jika tidak, dialihkan ke ${node.gate.otherwise}`);
  }
  lines.push('');
  lines.push(`**Mahasiswa:** "${node.reply.text}"`);
  lines.push(`**Isyarat:** ${node.reply.cue} (ekspresi: ${node.reply.expression})`);
  if (node.reply.aside) lines.push(`**Aside:** ${node.reply.aside}`);
  lines.push('');
  if (node.choices.length === 0) {
    lines.push('_Simpul akhir, tidak ada pilihan._');
  } else {
    lines.push('**Pilihan Dosen:**');
    lines.push('');
    node.choices.forEach((c, i) => lines.push(...renderChoice(c, i)));
  }
  lines.push('');
  return lines;
}

export function exportDialogueReview(graph: StoryGraph): string {
  const path = shortestPathLength(graph);
  const lines: string[] = [
    `# Tinjauan Dialog: ${graph.title}`,
    '',
    `- Mahasiswa: ${graph.studentId}`,
    `- Jenis cerita: ${graph.kind}${graph.placeholder ? ' (placeholder)' : ''}`,
    `- Jumlah simpul: ${graph.nodes.length}`,
    `- Jumlah adegan: ${graph.scenes.length}`,
    `- Jalur terpendek: ${path === null ? 'tidak ditemukan' : `${path} simpul`}`,
    '',
    '---',
    '',
  ];
  graph.nodes.forEach((n, i) => lines.push(...renderNode(n, i)));
  return lines.join('\n').replace(/\n+$/, '') + '\n';
}

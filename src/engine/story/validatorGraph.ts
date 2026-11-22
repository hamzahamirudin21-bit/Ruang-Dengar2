import type {
  StoryChoice, StoryGraph, StoryNode, StoryRuleId, StoryValidationError,
  StoryValidationOptions,
} from './storyTypes';
import { OPENING_CHOICES } from '../../data/storyStages';
import { buildAgentSessionVars } from '../trust';
import { determineRuptureKind } from '../rupture';

/**
 * Aturan struktur Story_Graph (fungsi murni, tanpa impor src/llm).
 * Aturan konten ada di validatorContent.ts; penggabungan di validator.ts.
 */

const END_SENTINEL = '@ending';
const RESUME_SENTINEL = '@resume';
const MIN_PATH_FULL = 15;
const MIN_PATH_EARLY = 8;
const MAX_PATH_FULL = 17;
const REQUIRED_CHOICES = 4;

function targetsOf(choice: StoryChoice): string[] {
  return [choice.next, ...(choice.routes ?? []).map((r) => r.next)];
}

export function validateGraphStructure(
  graph: StoryGraph,
  opts: StoryValidationOptions = {},
): StoryValidationError[] {
  const errors: StoryValidationError[] = [];
  const err = (rule: StoryRuleId, nodeId: string | null, message: string): void => {
    errors.push({ studentId: graph.studentId, nodeId, rule, message });
  };

  const nodes = graph.nodes;
  const byId = new Map<string, StoryNode>();
  for (const n of nodes) if (!byId.has(n.id)) byId.set(n.id, n);
  const sceneIds = new Set(graph.scenes.map((s) => s.id));

  const endingIds = new Set<string>(Object.values(graph.endings));
  const isEnding = (n: StoryNode): boolean => !!n.ending || endingIds.has(n.id);
  const endingNodeIds = nodes.filter(isEnding).map((n) => n.id);

  // ---- id-ganda
  const seenNodes = new Set<string>();
  for (const n of nodes) {
    if (seenNodes.has(n.id)) err('id-ganda', n.id, `Id simpul "${n.id}" dipakai lebih dari sekali.`);
    seenNodes.add(n.id);
    const seenChoices = new Set<string>();
    for (const c of n.choices) {
      if (seenChoices.has(c.id)) {
        err('id-ganda', n.id, `Id pilihan "${c.id}" dipakai lebih dari sekali pada simpul "${n.id}".`);
      }
      seenChoices.add(c.id);
    }
  }
  const seenScenes = new Set<string>();
  for (const s of graph.scenes) {
    if (seenScenes.has(s.id)) err('id-ganda', null, `Id adegan "${s.id}" dipakai lebih dari sekali.`);
    seenScenes.add(s.id);
  }

  // ---- adegan-jumlah
  if (graph.scenes.length < 2 || graph.scenes.length > 3) {
    err('adegan-jumlah', null, `Cerita harus memiliki 2 sampai 3 adegan, ditemukan ${graph.scenes.length}.`);
  }
  if (graph.scenes.length > 0 && graph.scenes[0].setting !== 'lab') {
    err('adegan-jumlah', null, 'Adegan pertama harus berlatar Lab.');
  }

  // ---- pilihan-kurang
  for (const n of nodes) {
    if (isEnding(n)) continue;
    if (n.choices.length < REQUIRED_CHOICES) {
      err('pilihan-kurang', n.id, `Simpul "${n.id}" hanya memiliki ${n.choices.length} pilihan; wajib tepat 4.`);
    } else if (n.choices.length > REQUIRED_CHOICES) {
      err('pilihan-kelebihan', n.id, `Simpul "${n.id}" memiliki ${n.choices.length} pilihan; wajib tepat 4.`);
    }
  }

  // ---- tujuan-tidak-ada
  const exists = (id: string): boolean => byId.has(id);
  const graphRefs: Array<[string, string | undefined]> = [
    ['startNodeId', graph.startNodeId],
    ['closingNodeId', graph.closingNodeId],
    ['tensionFallbackNodeId', graph.tensionFallbackNodeId],
    ['followUpNodeId', graph.followUpNodeId],
  ];
  for (const [label, id] of graphRefs) {
    if (id === undefined && label === 'followUpNodeId') continue;
    if (!id || !exists(id)) err('tujuan-tidak-ada', null, `${label} "${id ?? ''}" tidak ada pada graf.`);
  }
  for (const [kind, id] of Object.entries(graph.endings)) {
    if (!exists(id)) err('tujuan-tidak-ada', null, `Simpul akhir "${kind}" menunjuk "${id}" yang tidak ada.`);
  }
  for (const s of graph.scenes) {
    if (!exists(s.entryNodeId)) {
      err('tujuan-tidak-ada', null, `Adegan "${s.id}" memiliki entryNodeId "${s.entryNodeId}" yang tidak ada.`);
    }
  }
  for (const n of nodes) {
    if (!sceneIds.has(n.sceneId)) {
      err('tujuan-tidak-ada', n.id, `Simpul "${n.id}" memakai adegan "${n.sceneId}" yang tidak ada.`);
    }
    for (const c of n.choices) {
      for (const t of targetsOf(c)) {
        if (t === END_SENTINEL || t === RESUME_SENTINEL) continue;
        if (!exists(t)) err('tujuan-tidak-ada', n.id, `Pilihan "${c.id}" pada "${n.id}" menuju "${t}" yang tidak ada.`);
      }
    }
    if (n.gate && !exists(n.gate.otherwise)) {
      err('tujuan-tidak-ada', n.id, `Gerbang simpul "${n.id}" beralih ke "${n.gate.otherwise}" yang tidak ada.`);
    }
  }

  // ---- model sisi
  // Simpul tempat kesalahan terjadi (pendahulu simpul tension 'awal') menjadi tujuan @resume.
  const awalIds = new Set(nodes.filter((n) => n.tension?.phase === 'awal').map((n) => n.id));
  const resumeTargets = new Set<string>();
  for (const n of nodes) {
    if (n.tension) continue;
    for (const c of n.choices) {
      if (targetsOf(c).some((t) => awalIds.has(t))) resumeTargets.add(n.id);
    }
  }

  const resolve = (t: string, withResume: boolean): string[] => {
    if (t === END_SENTINEL) return endingNodeIds;
    if (t === RESUME_SENTINEL) return withResume ? [...resumeTargets] : [];
    const node = byId.get(t);
    if (!node) return [];
    const out = [t];
    if (node.gate && exists(node.gate.otherwise)) out.push(node.gate.otherwise);
    return out;
  };

  const successors = (n: StoryNode, withResume: boolean): string[] => {
    const out = new Set<string>();
    for (const c of n.choices) for (const t of targetsOf(c)) for (const r of resolve(t, withResume)) out.add(r);
    return [...out];
  };

  const roots = [graph.startNodeId, graph.followUpNodeId, graph.tensionFallbackNodeId]
    .filter((id): id is string => !!id && exists(id));

  // ---- simpul-tak-terjangkau
  const reachable = new Set<string>(roots);
  {
    const queue = [...roots];
    while (queue.length) {
      const cur = byId.get(queue.shift() as string);
      if (!cur) continue;
      for (const s of successors(cur, true)) {
        if (!reachable.has(s)) { reachable.add(s); queue.push(s); }
      }
    }
  }
  for (const n of nodes) {
    if (!reachable.has(n.id)) err('simpul-tak-terjangkau', n.id, `Simpul "${n.id}" tidak dapat dicapai dari awal cerita.`);
  }

  // ---- jalan-buntu (BFS terbalik dari simpul akhir)
  const reverse = new Map<string, string[]>();
  for (const n of nodes) {
    for (const s of successors(n, true)) {
      const list = reverse.get(s);
      if (list) list.push(n.id); else reverse.set(s, [n.id]);
    }
  }
  const canEnd = new Set<string>(endingNodeIds);
  {
    const queue = [...endingNodeIds];
    while (queue.length) {
      const cur = queue.shift() as string;
      for (const p of reverse.get(cur) ?? []) {
        if (!canEnd.has(p)) { canEnd.add(p); queue.push(p); }
      }
    }
  }
  for (const n of nodes) {
    if (!canEnd.has(n.id)) err('jalan-buntu', n.id, `Dari simpul "${n.id}" tidak ada jalan menuju simpul akhir.`);
  }

  // ---- jalur-terlalu-pendek (tanpa sisi @resume)
  const minPath = opts.minShortestPath ?? (graph.kind === 'penuh' ? MIN_PATH_FULL : MIN_PATH_EARLY);
  const maxPath = opts.maxShortestPath ?? (graph.kind === 'penuh' ? MAX_PATH_FULL : Infinity);
  if (exists(graph.startNodeId)) {
    const dist = new Map<string, number>([[graph.startNodeId, 0]]);
    const queue = [graph.startNodeId];
    let best: number | null = null;
    while (queue.length) {
      const id = queue.shift() as string;
      const cur = byId.get(id) as StoryNode;
      const d = dist.get(id) as number;
      if (isEnding(cur)) { best = d; break; }
      for (const s of successors(cur, false)) {
        if (!dist.has(s)) { dist.set(s, d + 1); queue.push(s); }
      }
    }
    if (best !== null && best < minPath) {
      err('jalur-terlalu-pendek', null, `Jalur terpendek dari awal ke akhir hanya ${best} giliran; minimal ${minPath}.`);
    }
    if (best !== null && best > maxPath) {
      err('jalur-terlalu-panjang', null, `Jalur terpendek dari awal ke akhir ${best} giliran; maksimal ${maxPath}.`);
    }
  }

  // ---- pembukaan-tidak-baku
  const start = byId.get(graph.startNodeId);
  if (start) {
    const names = new Set<string>();
    let ok = start.choices.length === OPENING_CHOICES.length;
    for (const def of OPENING_CHOICES) {
      const choice = start.choices.find((c) => c.id === def.id);
      if (!choice || choice.skillId !== def.skillId) { ok = false; continue; }
      const parts = def.text.split('{nama}').map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      const m = new RegExp(`^${parts.join('(.+?)')}$`).exec(choice.text);
      if (!m) { ok = false; continue; }
      for (let i = 1; i < m.length; i++) names.add(m[i]);
    }
    if (names.size > 1) ok = false; // token {nama} harus diganti dengan nama yang sama
    if (!ok) {
      err('pembukaan-tidak-baku', start.id, 'Pilihan simpul awal tidak identik dengan empat pilihan pembuka baku (OPENING_CHOICES).');
    }
  }

  // ---- cabang-tidak-menyatu
  if (exists(graph.closingNodeId) && exists(graph.startNodeId) && graph.startNodeId !== graph.closingNodeId) {
    const seen = new Set<string>([graph.startNodeId]);
    const queue = [graph.startNodeId];
    let bypass = false;
    while (queue.length && !bypass) {
      const cur = byId.get(queue.shift() as string) as StoryNode;
      if (isEnding(cur)) { bypass = true; break; }
      for (const s of successors(cur, true)) {
        if (s === graph.closingNodeId || seen.has(s)) continue;
        seen.add(s);
        queue.push(s);
      }
    }
    if (bypass) {
      err('cabang-tidak-menyatu', graph.closingNodeId, `Ada jalur ke simpul akhir yang tidak melewati simpul penutup "${graph.closingNodeId}".`);
    }
  }

  // ---- kedalaman-tanpa-gerbang
  for (const n of nodes) {
    if (n.depth < 2) continue;
    const need = n.depth - 1;
    const guarded = !!n.gate?.conditions.some((c) => c.type === 'level-min' && c.value >= need);
    if (!guarded) {
      err('kedalaman-tanpa-gerbang', n.id, `Simpul "${n.id}" berkedalaman ${n.depth} tetapi tidak bergerbang level-min >= ${need}.`);
    }
  }

  // ---- gerbang-tanpa-alternatif
  for (const n of nodes) {
    if (!n.gate) continue;
    const alt = byId.get(n.gate.otherwise);
    if (!alt) {
      err('gerbang-tanpa-alternatif', n.id, `Gerbang simpul "${n.id}" tidak memiliki simpul alternatif yang ada.`);
    } else if (alt.gate) {
      err('gerbang-tanpa-alternatif', n.id, `Simpul alternatif "${alt.id}" pada gerbang "${n.id}" tidak boleh bergerbang.`);
    } else if (!canEnd.has(alt.id)) {
      err('gerbang-tanpa-alternatif', n.id, `Simpul alternatif "${alt.id}" pada gerbang "${n.id}" tidak mencapai simpul akhir.`);
    }
  }

  // ---- ketegangan-tidak-ada
  const perbaikanIds = new Set(nodes.filter((n) => n.tension?.phase === 'perbaikan').map((n) => n.id));
  if (awalIds.size === 0) err('ketegangan-tidak-ada', null, 'Tidak ada simpul Ketegangan fase awal.');
  if (perbaikanIds.size === 0) err('ketegangan-tidak-ada', null, 'Tidak ada simpul Ketegangan fase perbaikan.');
  const fallback = byId.get(graph.tensionFallbackNodeId);
  if (fallback && fallback.tension?.phase !== 'awal') {
    err('ketegangan-tidak-ada', fallback.id, 'tensionFallbackNodeId harus menunjuk simpul Ketegangan fase awal.');
  }
  let hasResume = false;
  for (const n of nodes) {
    for (const c of n.choices) {
      const ts = targetsOf(c);
      if (ts.includes(RESUME_SENTINEL)) hasResume = true;
      if (n.tension?.phase === 'perbaikan') continue;
      if (c.action?.kind === 'akui-ketegangan') continue;
      if (ts.some((t) => perbaikanIds.has(t))) {
        err('ketegangan-tidak-ada', n.id, `Pilihan "${c.id}" pada "${n.id}" masuk ke simpul perbaikan tanpa aksi akui-ketegangan.`);
      }
    }
    if (n.gate && perbaikanIds.has(n.gate.otherwise) && n.tension?.phase !== 'perbaikan') {
      err('ketegangan-tidak-ada', n.id, `Gerbang "${n.id}" beralih ke simpul perbaikan.`);
    }
  }
  if (perbaikanIds.size > 0 && !hasResume) {
    err('ketegangan-tidak-ada', null, 'Tidak ada rute @resume dari simpul perbaikan.');
  }

  // ---- ketegangan-jenis-salah
  if (opts.agent) {
    const actual = determineRuptureKind(opts.agent, buildAgentSessionVars(opts.agent, 0));
    for (const n of nodes) {
      const expected = n.tension?.expectedKind;
      if (expected && expected !== actual) {
        err('ketegangan-jenis-salah', n.id, `Simpul "${n.id}" mengharapkan keretakan "${expected}" tetapi mesin menghasilkan "${actual}".`);
      }
    }
  }

  // ---- kejutan-isyarat-momen-tidak-ada (graf penuh)
  if (graph.kind === 'penuh') {
    for (const mark of ['kejutan', 'isyarat-nonverbal', 'momen-terbuka'] as const) {
      if (!nodes.some((n) => n.marks?.includes(mark))) {
        err('kejutan-isyarat-momen-tidak-ada', null, `Tidak ada simpul bertanda "${mark}".`);
      }
    }
  }

  // ---- transisi-adegan-tidak-ada
  {
    const sceneById = new Map(graph.scenes.map((s) => [s.id, s]));
    let found = false;
    for (const n of nodes) {
      if (sceneById.get(n.sceneId)?.setting !== 'lab') continue;
      for (const c of n.choices) {
        for (const t of targetsOf(c)) {
          const target = byId.get(t);
          const scene = target ? sceneById.get(target.sceneId) : undefined;
          if (scene?.setting === 'ruang-konsultasi' && scene.entryTransition === 'jalan-berdua') found = true;
        }
      }
    }
    if (!found) {
      err('transisi-adegan-tidak-ada', null, 'Tidak ada pilihan dari Lab yang menuju adegan ruang konsultasi dengan transisi jalan-berdua.');
    }
  }

  // ---- flag-tak-pernah-diset
  {
    const setFlags = new Set<string>();
    for (const n of nodes) {
      n.onEnter?.setFlags?.forEach((f) => setFlags.add(f));
      for (const c of n.choices) c.setFlags?.forEach((f) => setFlags.add(f));
    }
    const missing = (flag: string, nodeId: string | null, where: string): void => {
      if (!setFlags.has(flag)) err('flag-tak-pernah-diset', nodeId, `Flag "${flag}" (${where}) tidak pernah diset.`);
    };
    for (const n of nodes) {
      for (const cond of n.gate?.conditions ?? []) {
        if (cond.type === 'flag' && cond.set !== false) missing(cond.flag, n.id, `gerbang "${n.id}"`);
      }
      for (const c of n.choices) {
        for (const r of c.routes ?? []) {
          for (const cond of r.when) {
            if (cond.type === 'flag' && cond.set !== false) missing(cond.flag, n.id, `rute pilihan "${c.id}"`);
          }
        }
      }
    }
    for (const f of graph.outcomeRules.requiredFlags) missing(f, null, 'requiredFlags');
    if (graph.outcomeRules.planFlag) missing(graph.outcomeRules.planFlag, null, 'planFlag');
  }

  return errors;
}

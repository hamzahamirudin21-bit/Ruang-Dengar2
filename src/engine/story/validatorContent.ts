import type { CounselorSkillId } from '../../types';
import { COUNSELOR_SKILLS } from '../../data/skillEffects';
import { findForbiddenTerms } from '../../data/storyForbiddenTerms';
import { STAGE_SKILLS, isBeginnerMistake } from '../../data/storyStages';
import {
  STORY_STAGE_ORDER,
  type StoryChoice, type StoryGraph, type StoryLine, type StoryNode,
  type StoryRuleId, type StoryValidationError,
} from './storyTypes';

/** Aturan konten Story_Graph (Requirement 5.5, 5.7-5.9, 8.1, 8.4-8.6). Murni, tanpa impor src/llm. */

const VALID_SKILL_IDS: ReadonlySet<string> = new Set(COUNSELOR_SKILLS.map((s) => s.id));
const MAX_TEXT_LENGTH = 280;
const MAX_CHOICE_LENGTH = 120;
const MAX_CHOICE_SENTENCES = 2;
const MIN_BEST_SKILL_KINDS = 5;
const MAX_BEST_SKILL_SHARE = 0.35;

const isNonEnding = (n: StoryNode): boolean => !n.ending;

function lineTexts(line: StoryLine | undefined): string[] {
  if (!line) return [];
  const out = [line.text, line.cue];
  if (line.aside) out.push(line.aside);
  return out;
}

function nodeTexts(node: StoryNode): string[] {
  const out = lineTexts(node.reply);
  for (const c of node.choices) {
    out.push(c.text, ...lineTexts(c.reaction));
  }
  return out;
}

function nodeEdges(node: StoryNode): string[] {
  const out: string[] = [];
  for (const c of node.choices) {
    out.push(c.next);
    for (const r of c.routes ?? []) out.push(r.next);
  }
  return out;
}

export function validateStoryContent(graph: StoryGraph): StoryValidationError[] {
  const errors: StoryValidationError[] = [];
  const studentId = graph.studentId;
  const add = (rule: StoryRuleId, nodeId: string | null, message: string): void => {
    errors.push({ studentId, nodeId, rule, message });
  };
  const byId = new Map<string, StoryNode>(graph.nodes.map((n) => [n.id, n]));

  // istilah-diagnosis: caption dan title adegan, title graf
  const scanGraphLevel = (label: string, text: string): void => {
    const hits = findForbiddenTerms(text);
    if (hits.length > 0) add('istilah-diagnosis', null, `${label} memuat istilah terlarang: ${hits.join(', ')}.`);
  };
  scanGraphLevel('title graf', graph.title);
  for (const s of graph.scenes) {
    scanGraphLevel(`title adegan "${s.id}"`, s.title);
    scanGraphLevel(`caption adegan "${s.id}"`, s.caption);
  }

  for (const node of graph.nodes) {
    // istilah-diagnosis: text, aside, cue pada balasan, reaksi, dan teks pilihan
    const hits = new Set<string>();
    for (const t of nodeTexts(node)) for (const h of findForbiddenTerms(t)) hits.add(h);
    if (hits.size > 0) {
      add('istilah-diagnosis', node.id, `Simpul "${node.id}" memuat istilah terlarang: ${[...hits].join(', ')}.`);
    }

    // teks-kosong-atau-panjang: ucapan dan cue
    const checkLength = (label: string, value: string | undefined, required: boolean): void => {
      const v = (value ?? '').trim();
      if (required && v.length === 0) {
        add('teks-kosong-atau-panjang', node.id, `${label} pada simpul "${node.id}" kosong.`);
      } else if (v.length > MAX_TEXT_LENGTH) {
        add('teks-kosong-atau-panjang', node.id,
          `${label} pada simpul "${node.id}" melebihi ${MAX_TEXT_LENGTH} karakter (${v.length}).`);
      }
    };
    const checkChoiceText = (c: StoryChoice): void => {
      const v = (c.text ?? '').trim();
      const sentences = v.split(/[.!?]+(?:\s+|$)/).filter((s) => s.trim().length > 0).length;
      if (v.length === 0) {
        add('pilihan-teks-panjang', node.id, `Teks pilihan "${c.id}" pada simpul "${node.id}" kosong.`);
      } else if (v.length > MAX_CHOICE_LENGTH) {
        add('pilihan-teks-panjang', node.id,
          `Teks pilihan "${c.id}" pada simpul "${node.id}" melebihi ${MAX_CHOICE_LENGTH} karakter (${v.length}).`);
      } else if (sentences > MAX_CHOICE_SENTENCES) {
        add('pilihan-teks-panjang', node.id,
          `Teks pilihan "${c.id}" pada simpul "${node.id}" lebih dari ${MAX_CHOICE_SENTENCES} kalimat (${sentences}).`);
      }
    };
    checkLength('Ucapan balasan', node.reply.text, true);
    checkLength('Cue balasan', node.reply.cue, true);
    checkLength('Aside balasan', node.reply.aside, false);
    for (const c of node.choices) {
      checkLength(`Teks pilihan "${c.id}"`, c.text, true);
      checkChoiceText(c);
      if (c.reaction) {
        checkLength(`Ucapan reaksi pilihan "${c.id}"`, c.reaction.text, true);
        checkLength(`Cue reaksi pilihan "${c.id}"`, c.reaction.cue, true);
        checkLength(`Aside reaksi pilihan "${c.id}"`, c.reaction.aside, false);
      }
    }

    for (const c of node.choices) {
      // skill-tidak-valid
      if (!VALID_SKILL_IDS.has(c.skillId)) {
        add('skill-tidak-valid', node.id, `Pilihan "${c.id}" memakai skillId tidak dikenal "${String(c.skillId)}".`);
      }
      // opsi-tidak-eksplisit
      if (c.skillId === 'refleksi-perasaan') {
        const o = c.options;
        if (!o || (o.reflectionNuance === undefined && o.reflectionCorrectOverride === undefined)) {
          add('opsi-tidak-eksplisit', node.id,
            `Pilihan refleksi-perasaan "${c.id}" wajib menetapkan reflectionNuance atau reflectionCorrectOverride.`);
        }
      } else if (c.skillId === 'sampaikan-pengamatan') {
        if (c.options?.observationTone === undefined) {
          add('opsi-tidak-eksplisit', node.id,
            `Pilihan sampaikan-pengamatan "${c.id}" wajib menetapkan observationTone.`);
        }
      }
    }

    if (!isNonEnding(node)) continue;

    // tahap-tanpa-keterampilan
    const stageSkills = STAGE_SKILLS[node.stage] as readonly CounselorSkillId[];
    if (!node.choices.some((c) => stageSkills.includes(c.skillId))) {
      add('tahap-tanpa-keterampilan', node.id,
        `Simpul "${node.id}" (tahap ${node.stage}) tidak punya pilihan dengan keterampilan yang sesuai tahap.`);
    }
    // tanpa-opsi-keliru
    if (!node.choices.some((c: StoryChoice) => isBeginnerMistake(c))) {
      add('tanpa-opsi-keliru', node.id, `Simpul "${node.id}" tidak punya Opsi_Keliru_Pemula.`);
    }
    // opsi-terbaik-tidak-tepat-satu
    const bestCount = node.choices.filter((c) => c.best === true).length;
    if (bestCount !== 1) {
      add('opsi-terbaik-tidak-tepat-satu', node.id,
        `Simpul "${node.id}" punya ${bestCount} opsi terbaik; wajib tepat satu.`);
    }
  }

  // terbaik-tidak-bervariasi (tingkat graf)
  const bestSkills: string[] = [];
  for (const node of graph.nodes) {
    if (!isNonEnding(node)) continue;
    for (const c of node.choices) if (c.best === true) bestSkills.push(c.skillId);
  }
  if (bestSkills.length > 0) {
    const counts = new Map<string, number>();
    for (const s of bestSkills) counts.set(s, (counts.get(s) ?? 0) + 1);
    if (counts.size < MIN_BEST_SKILL_KINDS) {
      add('terbaik-tidak-bervariasi', null,
        `Opsi terbaik hanya memakai ${counts.size} jenis keterampilan; minimal ${MIN_BEST_SKILL_KINDS}.`);
    }
    for (const [skill, n] of counts) {
      if (n / bestSkills.length > MAX_BEST_SKILL_SHARE) {
        add('terbaik-tidak-bervariasi', null,
          `Keterampilan "${skill}" menjadi opsi terbaik pada ${n} dari ${bestSkills.length} simpul (> ${MAX_BEST_SKILL_SHARE * 100}%).`);
      }
    }
  }

  // tahap-mundur-tanpa-ketegangan: sisi u -> v
  const stageIdx = (n: StoryNode): number => STORY_STAGE_ORDER.indexOf(n.stage);
  const seen = new Set<string>();
  for (const u of graph.nodes) {
    for (const vId of nodeEdges(u)) {
      const v = byId.get(vId);
      if (!v) continue; // sentinel atau tujuan hilang (aturan lain)
      if (stageIdx(v) >= stageIdx(u)) continue;
      if (u.tension || v.tension) continue;
      const key = `${u.id}->${v.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      add('tahap-mundur-tanpa-ketegangan', u.id,
        `Sisi "${u.id}" (${u.stage}) ke "${v.id}" (${v.stage}) mundur tahap tanpa simpul Ketegangan.`);
    }
  }

  return errors;
}

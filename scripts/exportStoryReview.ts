/**
 * Ekspor tinjauan dialog (Requirement 12.3).
 * Pemakaian: npx tsx scripts/exportStoryReview.ts mhs-14 mhs-12
 * Menulis docs/story-review/<mhs-id>.md untuk setiap id yang diberikan.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { exportDialogueReview } from '../src/engine/story/reviewExport';
import { getStoryGraph } from '../src/data/stories';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'docs', 'story-review');
const ids = process.argv.slice(2);

if (ids.length === 0) {
  console.error('Pemakaian: npx tsx scripts/exportStoryReview.ts <mhs-id> [<mhs-id> ...]');
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });

let failed = false;
for (const id of ids) {
  const graph = getStoryGraph(id);
  if (!graph) {
    console.error(`Id tidak dikenal: ${id}`);
    failed = true;
    continue;
  }
  const file = join(outDir, `${graph.studentId}.md`);
  writeFileSync(file, exportDialogueReview(graph), 'utf8');
  console.log(`Ditulis: docs/story-review/${graph.studentId}.md (${graph.nodes.length} simpul)`);
}

if (failed) process.exit(1);

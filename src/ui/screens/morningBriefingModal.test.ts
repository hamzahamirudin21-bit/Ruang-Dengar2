import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MAX_LOST_STUDENTS } from '../../engine/survivalMission';
import { MorningBriefingModal } from './MorningBriefingModal';

test('briefing keeps gameplay guidance, original counselor portrait, and semantic continue action', () => {
  const markup = renderToStaticMarkup(
    createElement(MorningBriefingModal, { onStartShift: () => undefined }),
  );

  assert.match(markup, /role="dialog"[^>]*aria-modal="true"/);
  assert.match(markup, /role="region"[^>]*aria-label="Panduan Shift Pagi"/);
  assert.match(markup, /src="\/assets\/characters\/dosen-portrait\.png"[^>]*alt="Ibu Dosen BK"/);
  assert.match(markup, /Cegah mahasiswa hilang \(0%\)/);
  assert.match(markup, /7 percakapan · 2 pilihan jawaban/);
  assert.match(markup, /\+12%/);
  assert.match(markup, /-14%/);
  assert.match(markup, new RegExp(`${MAX_LOST_STUDENTS} mahasiswa hilang`));
  assert.match(markup, /Stabilkan mahasiswa sebelum/);

  const button = markup.match(/<button[^>]*data-testid="briefing-continue"[^>]*>[\s\S]*?<\/button>/)?.[0];
  assert.ok(button, 'Continue must remain a rendered HTML button');
  assert.match(button, /type="button"/);
  assert.match(button, /Mulai Shift Pagi/);
});

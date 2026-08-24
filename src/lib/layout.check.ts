import { strict as assert } from 'node:assert';
import { resolveWindowLayout } from './layout';

assert.deepEqual(resolveWindowLayout(360, 800), { size: 'compact', compactLandscape: false, expanded: false });
assert.deepEqual(resolveWindowLayout(800, 360), { size: 'compact', compactLandscape: true, expanded: false });
assert.deepEqual(resolveWindowLayout(700, 900), { size: 'medium', compactLandscape: false, expanded: false });
assert.deepEqual(resolveWindowLayout(900, 700), { size: 'expanded', compactLandscape: false, expanded: true });

console.info('Adaptive layout checks passed.');

import { strict as assert } from 'node:assert';
import { attemptRead } from './safeRead';

assert.deepEqual(attemptRead(() => 42), { ok: true, value: 42 });
assert.deepEqual(attemptRead(() => { throw new Error('storage unavailable'); }), { ok: false });

console.info('Safe read checks passed.');

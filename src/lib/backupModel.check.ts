const assert = require('node:assert/strict');
import * as backupModel from './backupModel';

assert.equal(typeof backupModel.parseBackup, 'function', 'a backup parser should be available');
assert.equal(typeof backupModel.planBackupMerge, 'function', 'a duplicate-safe merge planner should be available');

const workout: backupModel.BackupWorkout = {
  routine: 'Push strength',
  totalReps: 30,
  completedAt: '2026-08-20T10:00:00.000Z',
  entries: [
    { exercise: 'Push-up', reps: 12, setIndex: 0 },
    { exercise: 'Push-up', reps: 10, setIndex: 1 },
    { exercise: 'Push-up', reps: 8, setIndex: 2 },
  ],
};
const movement: backupModel.BackupMovementEntry = {
  movement: 'Push-up',
  kind: 'session',
  reps: 30,
  routine: 'Push strength',
  maximumProgram: false,
  maximumTest: false,
  recordedAt: '2026-08-20T10:00:00.000Z',
};
const validBackup = {
  format: 'repbook-backup',
  version: 1,
  exportedAt: '2026-08-29T12:00:00.000Z',
  data: {
    workouts: [workout],
    movementHistory: [movement],
    reminder: { days: [2, 4, 6], hour: 7, minute: 30 },
  },
};

assert.deepEqual(backupModel.parseBackup(JSON.stringify(validBackup)), validBackup, 'valid versioned backups should parse without losing data');
assert.throws(
  () => backupModel.parseBackup(JSON.stringify({ ...validBackup, version: 2 })),
  /newer version/i,
  'a newer backup version should be rejected before it can change local data',
);
assert.throws(
  () => backupModel.parseBackup(JSON.stringify({ ...validBackup, data: { ...validBackup.data, workouts: [{ ...workout, totalReps: -1 }] } })),
  /invalid backup/i,
  'invalid workout values should be rejected before import',
);
assert.throws(
  () => backupModel.parseBackup(JSON.stringify({ ...validBackup, data: { ...validBackup.data, reminder: { days: [2, 2], hour: 7, minute: 30 } } })),
  /invalid backup/i,
  'duplicate reminder days should be rejected before duplicate notifications can be scheduled',
);
assert.equal(
  backupModel.resolveWorkoutTotalReps({ totalReps: 30, entries: [{ reps: 12 }] }),
  30,
  'an explicitly stored workout total should survive a web round trip even when tracked entries cover only part of the routine',
);
assert.equal(
  backupModel.resolveWorkoutTotalReps({ entries: [{ reps: 12 }, { reps: 8 }] }),
  20,
  'legacy web workouts should fall back to the sum of their tracked entries',
);

const duplicatePlan = backupModel.planBackupMerge(
  { workouts: [workout], movementHistory: [movement] },
  validBackup.data,
);
assert.deepEqual(duplicatePlan, { workouts: [], movementHistory: [], reminder: validBackup.data.reminder, skipped: 2 }, 'importing the same backup again should skip both duplicate records');

const additionalWorkout = { ...workout, completedAt: '2026-08-22T10:00:00.000Z' };
const additionalMaximum: backupModel.BackupMovementEntry = { movement: 'Pull-up', kind: 'maximum', reps: 8, recordedAt: '2026-08-22T10:00:00.000Z' };
const additivePlan = backupModel.planBackupMerge(
  { workouts: [workout], movementHistory: [movement] },
  { ...validBackup.data, workouts: [workout, additionalWorkout], movementHistory: [movement, additionalMaximum] },
);
assert.deepEqual(additivePlan.workouts, [additionalWorkout], 'new workouts should be preserved while duplicates are removed');
assert.deepEqual(additivePlan.movementHistory, [additionalMaximum], 'new movement history should be preserved while duplicates are removed');
assert.equal(additivePlan.skipped, 2, 'the merge result should report how many duplicate records were skipped');

console.info('backup model checks passed');

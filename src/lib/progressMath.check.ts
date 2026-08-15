import { buildMaxProgramTargets, maximumTimeline, movementProgramStatus, personalBest, restSecondsForSession, volumeTimeline } from './progressMath';
import { resolveProgramMovement } from './movementProgram';

const entries = [
  { id: 1, movement: 'Push-up' as const, kind: 'maximum' as const, reps: 20, recordedAt: '2026-08-12T08:00:00.000Z' },
  { id: 2, movement: 'Push-up' as const, kind: 'session' as const, reps: 40, recordedAt: '2026-08-13T08:00:00.000Z' },
  { id: 3, movement: 'Pull-up' as const, kind: 'session' as const, reps: 18, recordedAt: '2026-08-13T09:00:00.000Z' },
  { id: 4, movement: 'Pull-up' as const, kind: 'maximum' as const, reps: 8, recordedAt: '2026-08-14T08:00:00.000Z' },
];

if (personalBest(entries, 'Push-up') !== 20) throw new Error('Push-up personal best should be 20.');
if (volumeTimeline(entries, 2, new Date('2026-08-14T12:00:00.000Z'))[0].reps !== 58) throw new Error('Daily volume should combine both movements.');
if (maximumTimeline(entries)[0].movement !== 'Pull-up') throw new Error('Maximum timeline should be newest first.');
const pushUpCycle = [entries[0], { id: 5, movement: 'Push-up' as const, kind: 'session' as const, reps: 30, recordedAt: '2026-08-15T08:00:00.000Z', programOnly: true, maximumTest: true }, ...Array.from({ length: 4 }, (_, index) => ({ id: index + 6, movement: 'Push-up' as const, kind: 'session' as const, reps: 30, recordedAt: `2026-08-${16 + index}T08:00:00.000Z`, programOnly: true }))];
if (!movementProgramStatus(pushUpCycle, 'Push-up').requiresMaximumTest) throw new Error('A maximum retest should unlock after four completed sessions.');
if (buildMaxProgramTargets(50, 1).join(',') !== '30,25,22,20,17') throw new Error('Session 1 targets should match the five-set base volume.');
if (buildMaxProgramTargets(50, 2).join(',') !== '33,28,25,22,20') throw new Error('Session 2 targets should progress volume.');
if (buildMaxProgramTargets(50, 3).join(',') !== '35,30,28,25,22') throw new Error('Session 3 targets should progress volume.');
if (restSecondsForSession(1) !== 60 || restSecondsForSession(2) !== 90) throw new Error('Rest should increase by session.');
const squatEntry = { id: 10, movement: 'Squat' as const, kind: 'maximum' as const, reps: 20, recordedAt: '2026-08-15T08:00:00.000Z' };
if (personalBest([squatEntry], 'Squat') !== 20) throw new Error('Squat should keep a separate personal best.');
if (buildMaxProgramTargets(20, 1).length !== 5) throw new Error('Squat programs must contain five sets.');
if (resolveProgramMovement('Squat') !== 'Squat') throw new Error('Squat must open its own focused program.');

console.info('Progress calculations check passed.');

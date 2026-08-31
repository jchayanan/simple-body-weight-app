import { maximumTestRepLimit, validateRepDraft, workoutRepLimit } from './repInput';
import type { MovementName } from './progressMath';

const limits: Record<MovementName, number> = {
  'Push-up': 200,
  'Pull-up': 100,
  Squat: 300,
};

Object.entries(limits).forEach(([movement, maximum]) => {
  if (maximumTestRepLimit(movement as MovementName) !== maximum) throw new Error(`${movement} must use its approved maximum-test limit.`);
  if (workoutRepLimit(true, movement as MovementName) !== maximum) throw new Error(`${movement} maximum-program sets must use the same rep limit.`);
  if ('error' in validateRepDraft(String(maximum), 1, maximum)) throw new Error(`${movement} must allow the approved maximum.`);
  if (!('error' in validateRepDraft(String(maximum + 1), 1, maximum))) throw new Error(`${movement} must reject reps above the approved maximum.`);
});

if (!('error' in validateRepDraft('0', 1))) throw new Error('Rep input must still enforce its minimum.');
if (workoutRepLimit(false, 'Push-up') !== undefined) throw new Error('Routine workouts must not gain a maximum-program rep limit.');

console.info('Rep input checks passed.');

import type { MovementName } from './progressMath';

type RepDraftValidation = { error: string } | { value: number };

export function maximumTestRepLimit(movement: MovementName) {
  if (movement === 'Pull-up') return 100;
  if (movement === 'Squat') return 300;
  return 200;
}

export function workoutRepLimit(isMaximumProgram: boolean, movement?: MovementName) {
  return isMaximumProgram && movement ? maximumTestRepLimit(movement) : undefined;
}

export function validateRepDraft(draft: string, minimum = 0, maximum?: number): RepDraftValidation {
  const value = Number(draft);
  if (!Number.isInteger(value) || value < minimum) return { error: `Enter a whole number of at least ${minimum}.` };
  if (maximum !== undefined && value > maximum) return { error: `Enter a whole number from ${minimum} to ${maximum}.` };
  return { value };
}

import type { MovementName } from './progressMath';

export function resolveProgramMovement(value?: string): MovementName {
  return value === 'Pull-up' || value === 'Squat' ? value : 'Push-up';
}

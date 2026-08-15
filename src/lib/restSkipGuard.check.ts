import { createRestSkipGuard } from './restSkipGuard';

const guard = createRestSkipGuard();

if (!guard.canContinueWorkout()) throw new Error('Workout actions should be available before rest is skipped.');
if (!guard.beginSkip()) throw new Error('The first rest-skip press should be accepted.');
if (guard.canContinueWorkout()) throw new Error('Workout actions must stay blocked while skip-rest taps settle.');
if (guard.beginSkip()) throw new Error('Rapid repeated skip-rest presses must be ignored.');
guard.release();
if (!guard.canContinueWorkout()) throw new Error('Workout actions should resume after the rest-skip guard releases.');

console.info('Rest skip guard check passed.');

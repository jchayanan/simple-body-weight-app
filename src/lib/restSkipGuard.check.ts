import { createRestSkipGuard } from './restSkipGuard';

const actionGuard = createRestSkipGuard();

if (!actionGuard.beginAction()) throw new Error('The first save-and-rest press should be accepted.');
if (actionGuard.canBeginAction()) throw new Error('A second save-and-rest press must be blocked until the rest screen is visible.');
if (actionGuard.beginAction()) throw new Error('Rapid repeated save-and-rest presses must be ignored.');
actionGuard.release();
if (!actionGuard.canBeginAction()) throw new Error('Workout actions should resume after the transition lock releases.');

const guard = createRestSkipGuard();

if (!guard.canContinueWorkout()) throw new Error('Workout actions should be available before rest is skipped.');
if (!guard.beginSkip()) throw new Error('The first rest-skip press should be accepted.');
if (guard.canContinueWorkout()) throw new Error('Workout actions must stay blocked while skip-rest taps settle.');
if (guard.beginSkip()) throw new Error('Rapid repeated skip-rest presses must be ignored.');
guard.release();
if (!guard.canContinueWorkout()) throw new Error('Workout actions should resume after the rest-skip guard releases.');

console.info('Rest skip guard check passed.');

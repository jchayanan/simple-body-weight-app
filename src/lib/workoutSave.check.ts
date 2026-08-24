import { attemptWorkoutSave } from './workoutSave';

let successfulCalls = 0;
const success = attemptWorkoutSave(() => { successfulCalls += 1; });
if (!success.saved) throw new Error('A completed storage operation must report the workout as saved.');
if (successfulCalls !== 1) throw new Error('A workout save must execute exactly once.');

const failure = attemptWorkoutSave(() => { throw new Error('disk full'); });
if (failure.saved === true) throw new Error('A failed storage operation must never report the workout as saved.');
if (failure.message !== "Couldn't save this workout. Your session is still here—try again.") {
  throw new Error('A failed workout save must explain that the session is retained and can be retried.');
}

console.info('Workout save checks passed.');

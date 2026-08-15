import { toTrackedWorkoutEntries } from './workoutEntries';

const routineEntries = toTrackedWorkoutEntries(['Push-up', 'Diamond push-up', 'Pike push-up'], [12, 8, 10]);
if (routineEntries.length !== 1 || routineEntries[0].exercise !== 'Push-up' || routineEntries[0].reps !== 12) throw new Error('Routine history must retain only tracked exercises.');

const programEntries = toTrackedWorkoutEntries(['Set 1', 'Set 2', 'Set 3'], [12, 10, 8], 'Pull-up');
if (programEntries.map((entry) => entry.exercise).join(',') !== 'Pull-up,Pull-up,Pull-up') throw new Error('Maximum programs must map each set to their tracked movement.');
if (programEntries.map((entry) => entry.setIndex).join(',') !== '1,2,3') throw new Error('Stored entries must preserve set order.');

console.info('Workout entry mapping check passed.');

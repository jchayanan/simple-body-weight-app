export type Category = 'Push' | 'Pull' | 'Legs';
export type Exercise = { id: string; name: string; category: Category; detail: string; level: string };
export type Routine = { id: string; name: string; subtitle: string; duration: string; exercises: string[]; label?: string };

export const exercises: Exercise[] = [
  { id: 'push-up', name: 'Push-up', category: 'Push', detail: 'Chest, shoulders, triceps', level: 'Base' },
  { id: 'diamond-push-up', name: 'Diamond Push-up', category: 'Push', detail: 'Triceps emphasis', level: 'Step 2' },
  { id: 'pike-push-up', name: 'Pike Push-up', category: 'Push', detail: 'Shoulder strength', level: 'Step 2' },
  { id: 'pull-up', name: 'Pull-up', category: 'Pull', detail: 'Back, biceps, grip', level: 'Base' },
  { id: 'chin-up', name: 'Chin-up', category: 'Pull', detail: 'Back, biceps', level: 'Base' },
  { id: 'australian-row', name: 'Australian Row', category: 'Pull', detail: 'Horizontal pull', level: 'Step 1' },
  { id: 'squat', name: 'Squat', category: 'Legs', detail: 'Quads, glutes, core', level: 'Base' },
  { id: 'split-squat', name: 'Split Squat', category: 'Legs', detail: 'Single-leg strength', level: 'Step 2' },
  { id: 'pistol-squat', name: 'Assisted Pistol Squat', category: 'Legs', detail: 'Balance and control', level: 'Step 3' },
];

export const routines: Routine[] = [
  { id: 'push-strength', name: 'Push strength', subtitle: 'A focused session for pressing power.', duration: '18 min', exercises: ['Push-up', 'Diamond Push-up', 'Pike Push-up'], label: 'Today' },
  { id: 'pull-basics', name: 'Pull basics', subtitle: 'Build a stronger pull from the ground up.', duration: '20 min', exercises: ['Pull-up', 'Chin-up', 'Australian Row'] },
  { id: 'full-body', name: 'Full body', subtitle: 'A short, balanced practice anywhere.', duration: '24 min', exercises: ['Push-up', 'Pull-up', 'Squat'] },
];

export const oneArmProgression = [
  { title: 'Incline one-arm push-up', state: 'Completed' },
  { title: 'Assisted one-arm push-up', state: 'Current' },
  { title: 'Negative one-arm push-up', state: 'Next' },
  { title: 'Partial one-arm push-up', state: 'Later' },
  { title: 'One-arm push-up', state: 'Goal' },
];

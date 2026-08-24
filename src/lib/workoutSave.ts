export type WorkoutSaveResult =
  | { saved: true }
  | { saved: false; message: string };

export function attemptWorkoutSave(save: () => void): WorkoutSaveResult {
  try {
    save();
    return { saved: true };
  } catch {
    return {
      saved: false,
      message: "Couldn't save this workout. Your session is still here—try again.",
    };
  }
}

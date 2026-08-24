export type ReminderSchedule = { days: number[]; hour: number; minute: number };
export type ReminderScheduleResult = { scheduled: true; reason: ''; permissionDenied?: false } | { scheduled: false; reason: string; permissionDenied?: boolean };

export async function cancelTrainingReminders() {
  // There are no native scheduled notifications in the web preview.
}

export async function scheduleTrainingReminders(_: ReminderSchedule): Promise<ReminderScheduleResult> {
  return { scheduled: false, reason: 'Training reminders are available in the installed mobile app.' };
}

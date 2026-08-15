export type ReminderSchedule = { days: number[]; hour: number; minute: number };

export async function scheduleTrainingReminders(_: ReminderSchedule) {
  return { scheduled: false, reason: 'Training reminders are available in the installed mobile app.' };
}

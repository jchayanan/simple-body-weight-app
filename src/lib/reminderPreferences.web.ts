export type ReminderPreference = { days: number[]; hour: number; minute: number };

const key = 'repbook:training-reminder';
const fallback = { days: [2, 4, 6], hour: 7, minute: 0 };

export function getStoredReminder(): ReminderPreference {
  try {
    const stored = typeof localStorage === 'undefined' ? null : localStorage.getItem(key);
    return stored ? JSON.parse(stored) as ReminderPreference : fallback;
  } catch { return fallback; }
}

export function storeReminder(reminder: ReminderPreference) {
  if (typeof localStorage !== 'undefined') localStorage.setItem(key, JSON.stringify(reminder));
}

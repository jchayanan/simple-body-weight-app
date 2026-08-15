import * as SQLite from 'expo-sqlite';

export type ReminderPreference = { days: number[]; hour: number; minute: number };

const database = SQLite.openDatabaseSync('repbook.db');
const key = 'training-reminder';

function initialise() {
  database.execSync('CREATE TABLE IF NOT EXISTS app_preferences (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);');
}

export function getStoredReminder(): ReminderPreference {
  try {
    initialise();
    const stored = database.getFirstSync<{ value: string }>('SELECT value FROM app_preferences WHERE key = ?', key)?.value;
    if (!stored) return { days: [2, 4, 6], hour: 7, minute: 0 };
    const reminder = JSON.parse(stored) as ReminderPreference;
    return Array.isArray(reminder.days) ? reminder : { days: [2, 4, 6], hour: 7, minute: 0 };
  } catch { return { days: [2, 4, 6], hour: 7, minute: 0 }; }
}

export function storeReminder(reminder: ReminderPreference) {
  try {
    initialise();
    database.runSync('INSERT OR REPLACE INTO app_preferences (key, value) VALUES (?, ?)', key, JSON.stringify(reminder));
  } catch { /* Scheduling still works if local preference storage is unavailable. */ }
}

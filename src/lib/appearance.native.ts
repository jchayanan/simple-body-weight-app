import * as SQLite from 'expo-sqlite';
import type { AppearanceMode } from '@/src/theme';

const database = SQLite.openDatabaseSync('repbook.db');

function initialise() {
  database.execSync('CREATE TABLE IF NOT EXISTS app_preferences (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);');
}

export function getStoredAppearance(): AppearanceMode {
  try {
    initialise();
    const stored = database.getFirstSync<{ value: string }>('SELECT value FROM app_preferences WHERE key = ?', 'appearance')?.value;
    return stored === 'dark' ? 'dark' : 'light';
  } catch { return 'light'; }
}

export function storeAppearance(mode: AppearanceMode) {
  try {
    initialise();
    database.runSync('INSERT OR REPLACE INTO app_preferences (key, value) VALUES (?, ?)', 'appearance', mode);
  } catch { /* Keep appearance switching usable when local storage is unavailable. */ }
}

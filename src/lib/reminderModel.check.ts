import { strict as assert } from 'node:assert';
import { normalizeReminderTimeDraft, reminderActionLabel, sanitizeReminderTimeDraft, toggleReminderDay, weekdays } from './reminderModel';

assert.equal(weekdays.length, 7);
assert.deepEqual(weekdays.map((day) => day.accessibilityLabel), ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']);
assert.deepEqual(toggleReminderDay([2, 4, 6], 4), [2, 6]);
assert.deepEqual(toggleReminderDay([2, 6], 4), [2, 4, 6]);
assert.equal(reminderActionLabel([]), 'Turn off reminders');
assert.equal(reminderActionLabel([2]), 'Save reminders');
assert.equal(sanitizeReminderTimeDraft('', 23), '');
assert.equal(sanitizeReminderTimeDraft('7', 23), '7');
assert.equal(sanitizeReminderTimeDraft('29', 23), '23');
assert.equal(sanitizeReminderTimeDraft('6a', 59), '6');
assert.equal(normalizeReminderTimeDraft('', 23), '00');
assert.equal(normalizeReminderTimeDraft('7', 23), '07');

console.info('Reminder model checks passed.');

import { strict as assert } from 'node:assert';
import { reminderActionLabel, toggleReminderDay, weekdays } from './reminderModel';

assert.equal(weekdays.length, 7);
assert.deepEqual(weekdays.map((day) => day.accessibilityLabel), ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']);
assert.deepEqual(toggleReminderDay([2, 4, 6], 4), [2, 6]);
assert.deepEqual(toggleReminderDay([2, 6], 4), [2, 4, 6]);
assert.equal(reminderActionLabel([]), 'Turn off reminders');
assert.equal(reminderActionLabel([2]), 'Save reminders');

console.info('Reminder model checks passed.');

export const weekdays = [
  { value: 2, label: 'M', accessibilityLabel: 'Monday' },
  { value: 3, label: 'T', accessibilityLabel: 'Tuesday' },
  { value: 4, label: 'W', accessibilityLabel: 'Wednesday' },
  { value: 5, label: 'T', accessibilityLabel: 'Thursday' },
  { value: 6, label: 'F', accessibilityLabel: 'Friday' },
  { value: 7, label: 'S', accessibilityLabel: 'Saturday' },
  { value: 1, label: 'S', accessibilityLabel: 'Sunday' },
] as const;

export function toggleReminderDay(days: number[], day: number) {
  return days.includes(day) ? days.filter((value) => value !== day) : [...days, day].sort((a, b) => a - b);
}

export function reminderActionLabel(days: number[]) {
  return days.length ? 'Save reminders' : 'Turn off reminders';
}

export function sanitizeReminderTimeDraft(value: string, maximum: number) {
  const digits = value.replace(/[^0-9]/g, '').slice(0, 2);
  if (!digits) return '';
  return String(Math.min(maximum, Number(digits)));
}

export function normalizeReminderTimeDraft(value: string, maximum: number) {
  return sanitizeReminderTimeDraft(value, maximum).padStart(2, '0');
}

export function formatCountdown(seconds: number) {
  const totalSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(totalSeconds / 60);
  const remainderSeconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(remainderSeconds).padStart(2, '0')}`;
}

export function formatTodayDate(date: Date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }).formatToParts(date);
  const weekday = parts.find((part) => part.type === 'weekday')?.value ?? '';
  const day = parts.find((part) => part.type === 'day')?.value ?? '';
  const month = parts.find((part) => part.type === 'month')?.value ?? '';
  return `${weekday}, ${day} ${month}`.toUpperCase();
}

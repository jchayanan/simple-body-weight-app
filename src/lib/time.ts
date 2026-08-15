export function formatCountdown(seconds: number) {
  const totalSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(totalSeconds / 60);
  const remainderSeconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(remainderSeconds).padStart(2, '0')}`;
}

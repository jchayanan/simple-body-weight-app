type RestCountdownPlayer = {
  pause: () => void;
  play: () => void;
  seekTo: (seconds: number) => Promise<void>;
};

type RestCountdownCancellation = { current: boolean };

export function shouldPlayRestCountdownSound(seconds: number, lastPlayedSecond: number | null) {
  return seconds >= 1 && seconds <= 3 && seconds !== lastPlayedSecond;
}

export async function playRestCountdownSound(player: RestCountdownPlayer, isCancelled: () => boolean) {
  await player.seekTo(0);
  if (!isCancelled()) player.play();
}

export function resetRestCountdownSound(player: RestCountdownPlayer) {
  player.pause();
  void player.seekTo(0).catch(() => undefined);
}

export function cancelRestCountdownSound(player: RestCountdownPlayer, cancellation: RestCountdownCancellation) {
  cancellation.current = true;
  resetRestCountdownSound(player);
}

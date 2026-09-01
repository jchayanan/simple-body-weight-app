import { cancelRestCountdownSound, playRestCountdownSound, resetRestCountdownSound, shouldPlayRestCountdownSound } from './restCountdownSound';

if (!shouldPlayRestCountdownSound(3, null)) throw new Error('The countdown should beep when three seconds remain.');
if (!shouldPlayRestCountdownSound(2, 3)) throw new Error('The countdown should beep when two seconds remain.');
if (!shouldPlayRestCountdownSound(1, 2)) throw new Error('The countdown should beep when one second remains.');
if (shouldPlayRestCountdownSound(3, 3)) throw new Error('The countdown must not beep twice during the same second.');
if (shouldPlayRestCountdownSound(4, null) || shouldPlayRestCountdownSound(0, 1)) throw new Error('The countdown must stay silent outside the final three seconds.');

let finishSeek: (() => void) | undefined;
let playedAfterCancel = false;
let seekCalls = 0;
const cancellation = { current: false };
const pendingPlayer = {
  pause: () => undefined,
  play: () => { playedAfterCancel = true; },
  seekTo: () => {
    seekCalls += 1;
    return seekCalls === 1 ? new Promise<void>((resolve) => { finishSeek = resolve; }) : Promise.resolve();
  },
};
const pendingPlayback = playRestCountdownSound(pendingPlayer, () => cancellation.current);
cancelRestCountdownSound(pendingPlayer, cancellation);
finishSeek?.();
void pendingPlayback.then(() => {
  if (playedAfterCancel) throw new Error('A pending beep must not start after rest is skipped.');
});

let paused = false;
let seekTarget = -1;
resetRestCountdownSound({
  pause: () => { paused = true; },
  play: () => undefined,
  seekTo: async (seconds) => { seekTarget = seconds; },
});
if (!paused || seekTarget !== 0) throw new Error('Ending rest should pause and rewind the countdown sound.');

console.info('Rest countdown sound checks passed.');

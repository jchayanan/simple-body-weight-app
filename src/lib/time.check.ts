import { formatCountdown } from './time';

if (formatCountdown(0) !== '00:00') throw new Error('Zero seconds should show 00:00.');
if (formatCountdown(45) !== '00:45') throw new Error('Under one minute should retain two-digit seconds.');
if (formatCountdown(120) !== '02:00') throw new Error('Whole minutes should show two-digit minutes.');
if (formatCountdown(200) !== '03:20') throw new Error('Mixed minutes and seconds should show MM:SS.');

console.info('Countdown formatting check passed.');

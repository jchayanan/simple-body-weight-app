import { tabIconName } from './tabIconName';

if (tabIconName('index', true) !== 'today') throw new Error('Today must use the filled icon when active.');
if (tabIconName('index', false) !== 'today-outline') throw new Error('Today must use the outline icon when inactive.');
if (tabIconName('progress', true) !== 'trending-up') throw new Error('Progress must use the filled icon when active.');
if (tabIconName('progress', false) !== 'trending-up-outline') throw new Error('Progress must use the outline icon when inactive.');
if (tabIconName('setting', true) !== 'settings') throw new Error('Settings must use the filled icon when active.');
if (tabIconName('setting', false) !== 'settings-outline') throw new Error('Settings must use the outline icon when inactive.');

console.info('Tab icon mapping check passed.');

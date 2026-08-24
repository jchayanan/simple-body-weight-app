import { strict as assert } from 'node:assert';
import * as layout from './layout';

const { resolveWindowLayout } = layout;

assert.deepEqual(resolveWindowLayout(360, 800), { size: 'compact', compactLandscape: false, expanded: false });
assert.deepEqual(resolveWindowLayout(800, 360), { size: 'compact', compactLandscape: true, expanded: false });
assert.deepEqual(resolveWindowLayout(700, 900), { size: 'medium', compactLandscape: false, expanded: false });
assert.deepEqual(resolveWindowLayout(900, 700), { size: 'expanded', compactLandscape: false, expanded: true });

const resolveTabBarPresentation = (layout as typeof layout & {
  resolveTabBarPresentation?: (expanded: boolean) => {
    position: 'bottom' | 'left';
    variant: 'uikit' | 'material';
    labelPosition: 'below-icon';
  };
}).resolveTabBarPresentation;

assert.equal(typeof resolveTabBarPresentation, 'function', 'Responsive tab bars must expose a valid presentation resolver.');
assert.deepEqual(resolveTabBarPresentation?.(false), { position: 'bottom', variant: 'uikit', labelPosition: 'below-icon' });
assert.deepEqual(resolveTabBarPresentation?.(true), { position: 'left', variant: 'material', labelPosition: 'below-icon' });

console.info('Adaptive layout checks passed.');

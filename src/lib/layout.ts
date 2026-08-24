export type WindowLayout = {
  size: 'compact' | 'medium' | 'expanded';
  compactLandscape: boolean;
  expanded: boolean;
};

export type TabBarPresentation = {
  position: 'bottom' | 'left';
  variant: 'uikit' | 'material';
  labelPosition: 'below-icon';
};

export function resolveWindowLayout(width: number, height: number): WindowLayout {
  const compactLandscape = width > height && height < 500;
  const size = compactLandscape ? 'compact' : width >= 840 ? 'expanded' : width >= 600 ? 'medium' : 'compact';
  return { size, compactLandscape, expanded: size === 'expanded' };
}

export function resolveTabBarPresentation(expanded: boolean): TabBarPresentation {
  return {
    position: expanded ? 'left' : 'bottom',
    variant: expanded ? 'material' : 'uikit',
    labelPosition: 'below-icon',
  };
}

# Active tab icons

## Goal

Make the selected bottom-tab destination immediately recognizable through a filled icon, while preserving the existing Paper & Ink visual direction and navigation behavior.

## Scope

- Keep the existing Today, Progress, and Settings tabs, labels, colors, size, and layout.
- Use the `focused` value provided by Expo Router's `tabBarIcon` callback.
- Render `today`, `trending-up`, or `settings` for the active tab.
- Render the existing `today-outline`, `trending-up-outline`, or `settings-outline` icon for inactive tabs.

## Constraints

- Do not change routes, touch targets, tab-bar styling, or navigation state.
- Use the existing Ionicons dependency and Expo Router tab configuration.

## Verification

- Add a narrow check that maps each tab route and focus state to the expected Ionicons name.
- Run the new check and the TypeScript compiler.

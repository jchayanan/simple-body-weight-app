# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

## Stack

delegated: Expo + React Native + TypeScript + Expo Router; Zustand for local client state, TanStack Query for server state, Expo SQLite for offline workout records, and Supabase for sync when connected.

## Users

Primary users are people training bodyweight and basic calisthenics who want a practical training journal they can use one-handed between sets, often in a gym, park, or home workout space.

## Product Purpose

The app lets users start a routine, record reps and sets, finish a workout offline, and review progress over time. Success means a returning user can open the app and begin today's workout in about three seconds, with no network dependency during training.

## Positioning

This is a quiet digital training journal: useful intelligence stays behind the scenes while the visible product stays focused on the next set, the current exercise, and the user's own history.

## Operating Context

Users are breathing heavily, moving between sets, and interacting quickly on a phone in portrait orientation. The workout flow must work with unreliable or absent connectivity and should remain readable in ordinary indoor and outdoor light.

## Capabilities and Constraints

- MVP movement categories: push, pull, and legs.
- Core exercises include push-ups, pull-ups, squats, and their variants.
- Progressions group exercises toward advanced skills such as one-arm push-up and muscle-up.
- Routines are startable collections of exercises; programs are optional and out of MVP scope.
- Offline workout flow: open, start, record sets/reps, finish; sync with Supabase when available.
- Primary navigation should use native mobile conventions and respect safe-area insets, large touch targets, back behavior, and text scaling.
- Avoid dashboards, AI assistants, motivational popups, excessive animation, and gamified visual clutter.

## Brand Commitments

- Product feel: simple, calm, fast, practical, lightweight, and focused on training.
- Visual direction: Paper & Ink / digital training journal.
- Palette: warm white background and surface #F6F5F2, primary text #202020, primary-action accent #B9584F, muted text #706F6B, border #D9D7D2, success #687560, error #9E514A.
- Muted Red is reserved for primary actions only. Navigation, progress, and current-state indicators use Black or their semantic color. Do not use vivid red (#FF0000).

## Evidence on Hand

No existing code, brand assets, backend schema, user research, or workout history were present in the project directory. Future work must not fabricate testimonials, performance claims, or social proof.

## Product Principles

1. Open → Train.
2. One screen has one obvious primary action.
3. Clarity and training continuity outrank decoration and novelty.
4. Offline-first is a core promise, not an enhancement.
5. Intelligence supports the journal quietly instead of becoming the interface.

## Accessibility & Inclusion

Use platform-native touch targets, safe-area handling, accessible labels, readable contrast, and text scaling. Workout controls must remain usable when the user is tired and cannot rely on precise interaction.

## Open Decisions

The exact Supabase schema, authentication flow, routine editor depth, and cross-device sync conflict policy are intentionally deferred until after the local-first MVP is proven.

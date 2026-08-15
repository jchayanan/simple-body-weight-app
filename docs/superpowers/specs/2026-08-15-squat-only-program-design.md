# Squat-only five-set program

## Goal

Expose Squat as a focused session on Today, alongside Push-up and Pull-up, while preserving the existing five-set maximum-based program experience.

## Design

- Add a `Squat only` row to Today using the existing focus-row layout, interaction, and accessibility pattern.
- Route the row to the existing program setup with `movement=Squat`.
- Treat Squat as a supported maximum-program movement everywhere the current Push-up and Pull-up type is used.
- Program setup uses Squat’s independent stored maximum and session history. Its default maximum is 20 reps, matching the current non-pull default.
- The existing five-set target progression, four-session cycle, workout recording, rest timing, and completion flow are reused unchanged.

## Verification

- Add a focused check showing Squat produces the same five target sets as the current program model.
- Run the project’s static TypeScript and progress checks after the change.

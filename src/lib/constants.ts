/**
 * Application-wide constants.
 *
 * ACTIVE_CYCLE_ID — the current recruitment cycle identifier.
 * Centralised here so that a cycle rollover only requires one change
 * (set the env var or update this default), not edits across six+ route files.
 */
export const ACTIVE_CYCLE_ID =
  process.env.ACTIVE_CYCLE_ID ?? "2026-27";

import type { PrefType } from "@/models/Application";
import type { DeptSlug } from "@/models/Application";

/**
 * Application-wide constants.
 *
 * ACTIVE_CYCLE_ID — the current recruitment cycle identifier.
 * Centralised here so that a cycle rollover only requires one change
 * (set the env var or update this default), not edits across six+ route files.
 */
export const ACTIVE_CYCLE_ID =
  process.env.ACTIVE_CYCLE_ID ?? "2026-27";

/**
 * DEPT_TYPE_MAP — single source of truth for department → preference-type mapping.
 *
 * Previously duplicated across apply/init, apply/second-pref, apply/switch-pref,
 * and apply/[dept]/stage/[n]. Centralising here ensures a new department or type
 * change is applied everywhere consistently.
 */
export const DEPT_TYPE_MAP: Record<DeptSlug, PrefType> = {
  development: "tech",
  "competitive-coding": "tech",
  "ui-ux": "tech",
  "ai-ml": "tech",
  "cyber-security": "tech",
  design: "non-tech",
  management: "non-tech",
  entrepreneurship: "non-tech",
  "content-media": "non-tech",
};

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

/**
 * Normalises any department slug alias to its canonical database slug.
 */
export function getCanonicalDeptSlug(slug?: string | null): DeptSlug {
  const s = (slug || "").toLowerCase().trim();
  if (s === "cybersecurity" || s === "cyber") return "cyber-security";
  if (s === "social-media" || s === "media" || s === "content-and-media") return "content-media";
  if (s === "cp" || s === "competitive-programming") return "competitive-coding";
  if (s === "uiux" || s === "ui/ux") return "ui-ux";
  if (s === "aiml" || s === "ai/ml") return "ai-ml";
  if (s === "dev" || s === "web-dev") return "development";
  if (s === "mgmt") return "management";
  if (s === "ep") return "entrepreneurship";
  return s as DeptSlug;
}


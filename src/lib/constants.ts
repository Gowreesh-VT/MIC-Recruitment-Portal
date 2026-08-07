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
  iot: "tech",
  outreach: "non-tech",
};

/**
 * Normalises any department slug alias to its canonical database slug.
 */
export function getCanonicalDeptSlug(slug?: string | null): DeptSlug {
  const s = (slug || "").toLowerCase().trim();
  if (
    s === "cybersecurity" ||
    s === "cyber" ||
    s === "cyber-security" ||
    s === "cyber security"
  ) return "cyber-security";
  if (
    s === "social-media" ||
    s === "social media" ||
    s === "social_media" ||
    s === "social" ||
    s === "media" ||
    s === "content-and-media" ||
    s === "content & media" ||
    s === "content media" ||
    s === "content-media"
  ) return "content-media";
  if (
    s === "cp" ||
    s === "competitive-programming" ||
    s === "competitive programming" ||
    s === "competitive coding" ||
    s === "competitive-coding"
  ) return "competitive-coding";
  if (
    s === "uiux" ||
    s === "ui/ux" ||
    s === "ui-ux" ||
    s === "ui ux"
  ) return "ui-ux";
  if (
    s === "aiml" ||
    s === "ai/ml" ||
    s === "ai-ml" ||
    s === "ai ml"
  ) return "ai-ml";
  if (
    s === "dev" ||
    s === "web-dev" ||
    s === "web dev" ||
    s === "development"
  ) return "development";
  if (s === "mgmt" || s === "management") return "management";
  if (s === "ep" || s === "entrepreneurship") return "entrepreneurship";
  if (s === "design") return "design";
  if (s === "iot" || s === "internet-of-things" || s === "internet of things") return "iot";
  if (s === "outreach" || s === "community") return "outreach";
  return s as DeptSlug;
}

/**
 * Returns all possible slug variants for a given canonical department slug.
 * Useful for DB queries to match both legacy and canonical department slugs.
 */
export function getDeptSlugVariants(slug?: string | null): string[] {
  const canonical = getCanonicalDeptSlug(slug);
  switch (canonical) {
    case "content-media":
      return ["content-media", "social-media", "media", "content-and-media", "social media", "content & media"];
    case "cyber-security":
      return ["cyber-security", "cybersecurity", "cyber", "cyber security"];
    case "competitive-coding":
      return ["competitive-coding", "competitive-programming", "cp", "competitive coding"];
    case "ui-ux":
      return ["ui-ux", "uiux", "ui/ux", "ui ux"];
    case "ai-ml":
      return ["ai-ml", "aiml", "ai/ml", "ai ml"];
    case "development":
      return ["development", "dev", "web-dev", "web dev"];
    case "management":
      return ["management", "mgmt"];
    case "entrepreneurship":
      return ["entrepreneurship", "ep"];
    case "design":
      return ["design"];
    case "iot":
      return ["iot", "internet-of-things", "internet of things"];
    case "outreach":
      return ["outreach", "community"];
    default:
      return [canonical];
  }
}

/**
 * Social media and community links for MIC VIT Chennai.
 */
export const SOCIAL_LINKS = {
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://www.instagram.com/microsoft.innovations.vitc/",
  linkedin: process.env.NEXT_PUBLIC_LINKEDIN_URL || "https://www.linkedin.com/company/microsoft-innovations-club-vitc/",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_COMMUNITY_URL || "https://chat.whatsapp.com/I7tR50oDgVj1phdFo3QTUp?s=cl&p=i&ilr=4",
};

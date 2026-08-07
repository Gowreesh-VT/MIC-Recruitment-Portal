import { buildApplicationReceivedEmail } from "./applicationReceived";
import { buildStage1ClearedEmail } from "./stage1Cleared";
import { buildStage2ClearedEmail } from "./stage2Cleared";
import { buildStage3ClearedEmail } from "./stage3Cleared";
import { buildStageRejectedEmail } from "./stageRejected";

export type PresetKey =
  | "response_saved"
  | "stage1_cleared"
  | "stage2_cleared"
  | "stage3_cleared"
  | "stage_rejected";

export interface PresetEmailMeta {
  key: PresetKey;
  label: string;
  badge: string;
  icon: string;
  color: string;
  description: string;
  targetStageRequired?: number;
}

export const EMAIL_PRESETS: Record<PresetKey, PresetEmailMeta> = {
  response_saved: {
    key: "response_saved",
    label: "Response Saved",
    badge: "RESPONSE CONFIRMED",
    icon: "📩",
    color: "#3b82f6",
    description: "Confirmation email sent when candidate response is logged.",
  },
  stage1_cleared: {
    key: "stage1_cleared",
    label: "Cleared Stage 1",
    badge: "STAGE 1 CLEARED",
    icon: "✦",
    color: "#10b981",
    description: "Notifies candidate that they passed Stage 1 (Screening).",
    targetStageRequired: 1,
  },
  stage2_cleared: {
    key: "stage2_cleared",
    label: "Cleared Stage 2",
    badge: "STAGE 2 CLEARED",
    icon: "🚀",
    color: "#8b5cf6",
    description: "Notifies candidate that they passed Stage 2 (Technical Task).",
    targetStageRequired: 2,
  },
  stage3_cleared: {
    key: "stage3_cleared",
    label: "Cleared Stage 3",
    badge: "FINAL SELECTION",
    icon: "🏆",
    color: "#eab308",
    description: "Final offer & welcome email for candidates joining MIC.",
    targetStageRequired: 3,
  },
  stage_rejected: {
    key: "stage_rejected",
    label: "Stage Rejected",
    badge: "STATUS UPDATE",
    icon: "❌",
    color: "#ef4444",
    description: "Polite rejection notification for non-advancing candidates.",
  },
};

const DEPT_MAP: Record<string, string> = {
  development: "Development",
  "competitive-coding": "Competitive Coding",
  "ui-ux": "UI/UX",
  "ai-ml": "AI/ML",
  "cyber-security": "Cyber Security",
  design: "Design",
  management: "Management",
  entrepreneurship: "Entrepreneurship",
  "content-media": "Social Media",
  iot: "IoT",
  outreach: "Outreach",
};

export function formatDepartmentName(dept?: string): string {
  if (!dept) return "General";
  return DEPT_MAP[dept.toLowerCase()] || dept.charAt(0).toUpperCase() + dept.slice(1);
}

export function getPresetEmailContent({
  presetKey,
  candidateName,
  departmentName,
  applicationId,
  customNote,
}: {
  presetKey: PresetKey;
  candidateName: string;
  departmentName: string;
  applicationId?: string;
  customNote?: string;
}): { subject: string; html: string } {
  const formattedDept = formatDepartmentName(departmentName);

  switch (presetKey) {
    case "response_saved":
      return buildApplicationReceivedEmail({
        candidateName,
        departmentName: formattedDept,
        applicationId: applicationId || "MIC-APP",
      });

    case "stage1_cleared":
      return buildStage1ClearedEmail({
        candidateName,
        departmentName: formattedDept,
        customNote,
      });

    case "stage2_cleared":
      return buildStage2ClearedEmail({
        candidateName,
        departmentName: formattedDept,
        customNote,
      });

    case "stage3_cleared":
      return buildStage3ClearedEmail({
        candidateName,
        departmentName: formattedDept,
        customNote,
      });

    case "stage_rejected":
      return buildStageRejectedEmail({
        candidateName,
        departmentName: formattedDept,
        customNote,
      });

    default:
      throw new Error(`Unknown email preset key: ${presetKey}`);
  }
}

export {
  buildApplicationReceivedEmail,
  buildStage1ClearedEmail,
  buildStage2ClearedEmail,
  buildStage3ClearedEmail,
  buildStageRejectedEmail,
};

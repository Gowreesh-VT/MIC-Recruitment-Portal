import type { IRecruitmentCycle } from "@/models/RecruitmentCycle";
import type { IDepartment } from "@/models/Department";

type CycleLike = Pick<IRecruitmentCycle, "isOpen" | "startAt" | "endAt"> | null | undefined;
type DeptLike = Pick<IDepartment, "stageToggles"> | null | undefined;

// Extend IDepartment with the stageToggles map field (stored as Mongoose Map or plain object)
declare module "@/models/Department" {
  interface IDepartment {
    stageToggles?: Map<string, boolean> | Record<string, boolean>;
  }
}

export function isCycleOpen(cycle: CycleLike): boolean {
  if (!cycle) return false;
  const now = new Date();

  if (cycle.startAt && cycle.endAt) {
    const start = new Date(cycle.startAt);
    const end = new Date(cycle.endAt);
    return now >= start && now <= end;
  }

  if (cycle.startAt) {
    const start = new Date(cycle.startAt);
    return now >= start && !!cycle.isOpen;
  }

  return !!cycle.isOpen;
}

export function isStageOpen(cycle: CycleLike, dept: unknown, stageNum: number): boolean {
  if (!isCycleOpen(cycle)) return false;
  if (!dept) return false;

  const stageKey = stageNum.toString();
  const d = dept as { stageToggles?: Map<string, boolean> | Record<string, boolean> };
  if (d.stageToggles && typeof (d.stageToggles as Map<string, boolean>).get === "function") {
    return (d.stageToggles as Map<string, boolean>).get(stageKey) !== false;
  }

  if (d.stageToggles && typeof d.stageToggles === "object") {
    return (d.stageToggles as Record<string, boolean>)[stageKey] !== false;
  }

  return true;
}


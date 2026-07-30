import React from "react";

export interface RecruitmentTimelineProps {
  stage1Submitted: boolean;
  stage2Status: "pending" | "accepted" | "rejected" | "passed" | "failed";
  stage3Unlocked: boolean;
}

export default function RecruitmentTimeline({
  stage1Submitted,
  stage2Status,
  stage3Unlocked,
}: RecruitmentTimelineProps) {
  const isStage2Passed = stage2Status === "accepted" || stage2Status === "passed";
  const isStage2Failed = stage2Status === "rejected" || stage2Status === "failed";
  const isStage2Pending = !isStage2Passed && !isStage2Failed;

  return (
    <div className="w-full flex flex-col items-center gap-2 select-none">
      {/* Node Icons + Connecting Line Bar */}
      <div className="relative w-full flex items-center justify-between px-4 my-1">
        {/* Connecting Background Line */}
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1.5 bg-black z-0 flex items-center justify-between">
          <div
            className={`h-full transition-all duration-300 ${
              isStage2Passed ? "bg-[#52AE26] w-full" : isStage2Failed ? "bg-[#DC2626] w-1/2" : "bg-[#FBBF24] w-1/2"
            }`}
          />
        </div>

        {/* Stage 1 Node */}
        <div
          className={`relative z-10 w-8 h-8 rounded-full border-2 border-black flex items-center justify-center text-[12px] font-bold shadow-[2px_2px_0px_#000] ${
            stage1Submitted ? "bg-[#52AE26] text-white" : "bg-gray-300 text-black"
          }`}
          title="Stage 1 — Form Submitted"
        >
          ✔
        </div>

        {/* Stage 2 Node */}
        <div
          className={`relative z-10 w-8 h-8 rounded-full border-2 border-black flex items-center justify-center text-[12px] font-bold shadow-[2px_2px_0px_#000] ${
            isStage2Passed
              ? "bg-[#52AE26] text-white"
              : isStage2Failed
              ? "bg-[#DC2626] text-white"
              : "bg-[#FBBF24] text-black animate-pulse"
          }`}
          title={`Stage 2 — Shortlisting (${isStage2Passed ? "Accepted" : isStage2Failed ? "Rejected" : "Pending"})`}
        >
          {isStage2Passed ? "✔" : isStage2Failed ? "❌" : "⏳"}
        </div>

        {/* Stage 3 Node */}
        <div
          className={`relative z-10 w-8 h-8 rounded-full border-2 border-black flex items-center justify-center text-[12px] font-bold shadow-[2px_2px_0px_#000] ${
            stage3Unlocked ? "bg-[#1093EB] text-white" : "bg-gray-300 text-black opacity-80"
          }`}
          title={`Stage 3 — Interview (${stage3Unlocked ? "Unlocked" : "Locked"})`}
        >
          {stage3Unlocked ? "🔓" : "🔒"}
        </div>
      </div>

      {/* Stage Labels Text */}
      <div className="w-full flex justify-between text-[9px] font-bold uppercase tracking-tight text-black px-1">
        <span className="text-[#52AE26] font-black">Stage 1</span>
        <span
          className={
            isStage2Passed
              ? "text-[#52AE26] font-black"
              : isStage2Failed
              ? "text-[#DC2626] font-black"
              : "text-[#B87B21] font-black"
          }
        >
          Stage 2
        </span>
        <span className={stage3Unlocked ? "text-[#1093EB] font-black" : "text-gray-500 font-bold"}>
          Stage 3
        </span>
      </div>
    </div>
  );
}

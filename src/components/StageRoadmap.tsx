import React from "react";

export interface StageRoadmapProps {
  stage1Submitted?: boolean;
  stage2Status?: "pending" | "accepted" | "rejected" | "passed" | "failed";
  stage3Unlocked?: boolean;
  isVertical?: boolean;
  currentStage?: number;
}

export default function StageRoadmap({
  stage1Submitted = true,
  stage2Status = "pending",
  stage3Unlocked = false,
  isVertical,
  currentStage = 1,
}: StageRoadmapProps) {
  const isOverallFailed = stage2Status === "rejected" || stage2Status === "failed";
  // Rejection happened at stage 1 when the candidate never advanced beyond it
  const isRejectedAtStage1 = isOverallFailed && currentStage <= 1;
  // Rejection happened at stage 2 only if the candidate had actually reached stage 2
  const isRejectedAtStage2 = isOverallFailed && currentStage >= 2;
  const isStage2Passed = stage2Status === "accepted" || stage2Status === "passed";
  const isStage2Failed = isRejectedAtStage2;
  // Candidate is actively sitting in Stage 2 (advanced from S1, not yet resolved)
  const isStage2Active = !isStage2Passed && !isOverallFailed && currentStage >= 2;
  // Candidate is actively sitting in Stage 3 (advanced from S2, not yet selected)
  const isStage3Active = !isStage2Passed && !isOverallFailed && currentStage >= 3;

  const renderHorizontal = () => (
    <div className="relative w-[880px] h-[270px] select-none font-press-start">
      {/* Dynamic Wavy SVG Curved Dashed Path Line */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible"
        viewBox="0 0 880 270"
      >
        <path
          d="M 0,140 C 60,140 100,45 170,45 C 270,45 390,165 490,165 C 590,165 710,125 810,125"
          fill="none"
          stroke="white"
          strokeWidth="7"
          strokeDasharray="14 10"
          strokeLinecap="round"
          style={{ filter: "drop-shadow(0px 3px 0px rgba(0,0,0,0.4))" }}
        />
      </svg>

      {/* ================= STAGE 1 NODE ================= */}
      <div
        className="absolute z-10 flex flex-col items-center gap-1.5 group"
        style={{ left: "107px", top: "0px" }}
      >
        {/* Flag Banner */}
        <div
          className={`border-2 border-black rounded-[4px] px-2 py-1 flex items-center justify-center font-bold text-[11px] shadow-[2.5px_2.5px_0px_#000] relative ${
            isRejectedAtStage1
              ? "bg-[#DC2626] text-white"
              : stage1Submitted
              ? "bg-[#52AE26] text-white"
              : "bg-[#E29A2B] text-black"
          }`}
        >
          <span className="text-[7.5px] uppercase tracking-wider">
            {isRejectedAtStage1 ? "REJECTED" : stage1Submitted ? "CLEARED" : "PENDING"}
          </span>
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-1 h-3 bg-black" />
        </div>

        {/* Node Platform */}
        <div className="flex flex-col items-center mt-1">
          <div
            className={`w-12 h-12 bg-white border-4 rounded-full flex items-center justify-center font-bold text-[18px] shadow-[3px_3px_0px_#000] relative z-10 transition-transform group-hover:scale-105 ${
              isRejectedAtStage1
                ? "border-[#DC2626] text-[#DC2626]"
                : stage1Submitted
                ? "border-[#52AE26] text-[#52AE26]"
                : "border-[#E29A2B] text-[#E29A2B]"
            }`}
          >
            1
          </div>
          <div
            className={`w-16 h-3 border-2 border-black rounded-t-full -mt-2.5 z-0 flex flex-col items-center justify-end overflow-hidden shadow-[2px_2px_0px_#000] ${
              isRejectedAtStage1 ? "bg-[#DC2626]" : stage1Submitted ? "bg-[#52AE26]" : "bg-[#E29A2B]"
            }`}
          >
            <div className={`w-full h-1 ${isRejectedAtStage1 ? "bg-red-400" : stage1Submitted ? "bg-[#72F418]" : "bg-[#F0AD3D]"}`} />
          </div>
        </div>

        {/* Sub-label Box */}
        <div className="bg-[#FFF4E6] border-2 border-black rounded-[8px] p-2 min-w-[125px] text-center shadow-[3px_3px_0px_#000] mt-1">
          <div className="text-[#B87B21] font-bold text-[8.5px] tracking-wider uppercase mb-0.5">
            STAGE 1
          </div>
          <div
            className={`font-black text-[9px] tracking-tight uppercase leading-tight flex items-center justify-center ${
              isRejectedAtStage1 ? "text-[#DC2626]" : stage1Submitted ? "text-[#52AE26]" : "text-[#E29A2B]"
            }`}
          >
            {isRejectedAtStage1 ? "REJECTED" : stage1Submitted ? "FORM SUBMITTED" : "FORM PENDING"}
          </div>
        </div>
      </div>

      {/* ================= STAGE 2 NODE ================= */}
      <div
        className="absolute z-10 flex flex-col items-center gap-1.5 group"
        style={{ left: "427px", top: "110px" }}
      >
        {/* Flag Banner */}
        <div
          className={`border-2 border-black rounded-[4px] px-2 py-1 flex items-center justify-center font-bold text-[11px] shadow-[2.5px_2.5px_0px_#000] relative ${
            isStage2Passed
              ? "bg-[#52AE26] text-white"
              : isStage2Failed
              ? "bg-[#DC2626] text-white"
              : isStage2Active
              ? "bg-[#E29A2B] text-black"
              : "bg-gray-400 text-black opacity-90"
          }`}
        >
          <span className="text-[7.5px] uppercase tracking-wider">
            {isStage2Passed ? "PASSED" : isStage2Failed ? "REJECTED" : isStage2Active ? "PENDING" : "LOCKED"}
          </span>
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-1 h-3 bg-black" />
        </div>

        {/* Node Platform */}
        <div className="flex flex-col items-center mt-1">
          <div
            className={`w-12 h-12 bg-white border-4 rounded-full flex items-center justify-center font-bold text-[18px] shadow-[3px_3px_0px_#000] relative z-10 transition-transform group-hover:scale-105 ${
              isStage2Passed
                ? "border-[#52AE26] text-[#52AE26]"
                : isStage2Failed
                ? "border-[#DC2626] text-[#DC2626]"
                : isStage2Active
                ? "border-[#E29A2B] text-[#E29A2B]"
                : "border-gray-400 text-gray-500 opacity-90"
            }`}
          >
            2
          </div>
          <div
            className={`w-16 h-3 border-2 border-black rounded-t-full -mt-2.5 z-0 flex flex-col items-center justify-end overflow-hidden shadow-[2px_2px_0px_#000] ${
              isStage2Passed ? "bg-[#52AE26]" : isStage2Failed ? "bg-[#DC2626]" : isStage2Active ? "bg-[#E29A2B]" : "bg-gray-400"
            }`}
          >
            <div className={`w-full h-1 ${isStage2Active ? "bg-[#F0AD3D]" : "bg-black/20"}`} />
          </div>
        </div>

        {/* Sub-label Box */}
        <div className="bg-[#FFF4E6] border-2 border-black rounded-[8px] p-2 min-w-[125px] text-center shadow-[3px_3px_0px_#000] mt-1">
          <div className="text-[#B87B21] font-bold text-[8.5px] tracking-wider uppercase mb-0.5">
            STAGE 2
          </div>
          <div
            className={`font-black text-[9px] tracking-tight uppercase leading-tight ${
              isStage2Passed ? "text-[#52AE26]" : isStage2Failed ? "text-[#DC2626]" : isStage2Active ? "text-[#E29A2B]" : "text-gray-600"
            }`}
          >
            {isStage2Passed ? "ACCEPTED" : isStage2Failed ? "REJECTED" : isStage2Active ? "SHORTLISTING" : "SHORTLISTING"}
          </div>
        </div>
      </div>

      {/* ================= STAGE 3 NODE ================= */}
      <div
        className="absolute z-10 flex flex-col items-center gap-1.5 group"
        style={{ left: "747px", top: "70px" }}
      >
        {/* Flag Banner */}
        <div
          className={`border-2 border-black rounded-[4px] px-2 py-1 flex items-center justify-center font-bold text-[11px] shadow-[2.5px_2.5px_0px_#000] relative ${
            stage3Unlocked
              ? "bg-[#1093EB] text-white"
              : isStage3Active
              ? "bg-[#E29A2B] text-black"
              : "bg-gray-400 text-black opacity-80"
          }`}
        >
          <span className="text-[7.5px] uppercase tracking-wider">
            {stage3Unlocked ? "UNLOCKED" : isStage3Active ? "PENDING" : "LOCKED"}
          </span>
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-1 h-3 bg-black" />
        </div>

        {/* Node Platform */}
        <div className="flex flex-col items-center mt-1">
          <div
            className={`w-12 h-12 bg-white border-4 rounded-full flex items-center justify-center font-bold text-[18px] shadow-[3px_3px_0px_#000] relative z-10 transition-transform group-hover:scale-105 ${
              stage3Unlocked
                ? "border-[#1093EB] text-[#1093EB]"
                : isStage3Active
                ? "border-[#E29A2B] text-[#E29A2B]"
                : "border-gray-400 text-gray-500 opacity-80"
            }`}
          >
            3
          </div>
          <div
            className={`w-16 h-3 border-2 border-black rounded-t-full -mt-2.5 z-0 flex flex-col items-center justify-end overflow-hidden shadow-[2px_2px_0px_#000] ${
              stage3Unlocked ? "bg-[#1093EB]" : isStage3Active ? "bg-[#E29A2B]" : "bg-gray-400"
            }`}
          >
            <div className={`w-full h-1 ${isStage3Active ? "bg-[#F0AD3D]" : "bg-black/20"}`} />
          </div>
        </div>

        {/* Sub-label Box */}
        <div className="bg-[#FFF4E6] border-2 border-black rounded-[8px] p-2 min-w-[125px] text-center shadow-[3px_3px_0px_#000] mt-1">
          <div className="text-[#B87B21] font-bold text-[8.5px] tracking-wider uppercase mb-0.5">
            STAGE 3
          </div>
          <div
            className={`font-black text-[9px] tracking-tight uppercase leading-tight ${
              stage3Unlocked ? "text-[#1093EB]" : isStage3Active ? "text-[#E29A2B]" : "text-gray-600"
            }`}
          >
            INTERVIEW
          </div>
        </div>
      </div>
    </div>
  );

  const renderVertical = () => (
    <div className="relative w-[300px] h-[295px] select-none font-press-start my-1 flex-shrink-0">
      {/* Dynamic S-Wavy Vertical Path SVG */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible"
        viewBox="0 0 300 295"
      >
        <path
          d="M 90,45 C 90,95 210,90 210,140 C 210,190 90,185 90,235"
          fill="none"
          stroke="white"
          strokeWidth="6"
          strokeDasharray="10 8"
          strokeLinecap="round"
          style={{ filter: "drop-shadow(0px 3px 0px rgba(0,0,0,0.4))" }}
        />
      </svg>

      {/* ================= STAGE 1 NODE ================= */}
      <div
        className="absolute z-10 flex flex-col items-center gap-1 group"
        style={{ left: "15px", top: "0px" }}
      >
        {/* Flag Banner */}
        <div
          className={`border-2 border-black rounded-[4px] px-1.5 py-0.5 flex items-center justify-center font-bold text-[9px] shadow-[2px_2px_0px_#000] relative ${
            isRejectedAtStage1
              ? "bg-[#DC2626] text-white"
              : stage1Submitted
              ? "bg-[#52AE26] text-white"
              : "bg-[#E29A2B] text-black"
          }`}
        >
          <span className="text-[7px] uppercase tracking-wider">
            {isRejectedAtStage1 ? "REJECTED" : stage1Submitted ? "CLEARED" : "PENDING"}
          </span>
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-1 h-2 bg-black" />
        </div>

        {/* Node Platform */}
        <div className="flex flex-col items-center mt-0.5">
          <div
            className={`w-10 h-10 bg-white border-3 rounded-full flex items-center justify-center font-bold text-[15px] shadow-[2px_2px_0px_#000] relative z-10 transition-transform group-hover:scale-105 ${
              isRejectedAtStage1
                ? "border-[#DC2626] text-[#DC2626]"
                : stage1Submitted
                ? "border-[#52AE26] text-[#52AE26]"
                : "border-[#E29A2B] text-[#E29A2B]"
            }`}
          >
            1
          </div>
          <div
            className={`w-13 h-2 border-2 border-black rounded-t-full -mt-2 z-0 flex flex-col items-center justify-end overflow-hidden shadow-[1.5px_1.5px_0px_#000] ${
              isRejectedAtStage1 ? "bg-[#DC2626]" : stage1Submitted ? "bg-[#52AE26]" : "bg-[#E29A2B]"
            }`}
          >
            <div className={`w-full h-1 ${isRejectedAtStage1 ? "bg-red-400" : stage1Submitted ? "bg-[#72F418]" : "bg-[#F0AD3D]"}`} />
          </div>
        </div>

        {/* Sub-label Box */}
        <div className="bg-[#FFF4E6] border-2 border-black rounded-[6px] p-1 min-w-[110px] text-center shadow-[2px_2px_0px_#000] mt-0.5">
          <div className="text-[#B87B21] font-bold text-[7.5px] tracking-wider uppercase mb-0.5">
            STAGE 1
          </div>
          <div
            className={`font-black text-[8px] tracking-tight uppercase leading-tight flex items-center justify-center ${
              isRejectedAtStage1 ? "text-[#DC2626]" : stage1Submitted ? "text-[#52AE26]" : "text-[#E29A2B]"
            }`}
          >
            {isRejectedAtStage1 ? "REJECTED" : stage1Submitted ? "SUBMITTED" : "PENDING"}
          </div>
        </div>
      </div>

      {/* ================= STAGE 2 NODE ================= */}
      <div
        className="absolute z-10 flex flex-col items-center gap-1 group"
        style={{ left: "145px", top: "95px" }}
      >
        {/* Flag Banner */}
        <div
          className={`border-2 border-black rounded-[4px] px-1.5 py-0.5 flex items-center justify-center font-bold text-[9px] shadow-[2px_2px_0px_#000] relative ${
            isStage2Passed
              ? "bg-[#52AE26] text-white"
              : isStage2Failed
              ? "bg-[#DC2626] text-white"
              : isStage2Active
              ? "bg-[#E29A2B] text-black"
              : "bg-gray-400 text-black opacity-90"
          }`}
        >
          <span className="text-[7px] uppercase tracking-wider">
            {isStage2Passed ? "PASSED" : isStage2Failed ? "REJECTED" : isStage2Active ? "PENDING" : "LOCKED"}
          </span>
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-1 h-2 bg-black" />
        </div>

        {/* Node Platform */}
        <div className="flex flex-col items-center mt-0.5">
          <div
            className={`w-10 h-10 bg-white border-3 rounded-full flex items-center justify-center font-bold text-[15px] shadow-[2px_2px_0px_#000] relative z-10 transition-transform group-hover:scale-105 ${
              isStage2Passed
                ? "border-[#52AE26] text-[#52AE26]"
                : isStage2Failed
                ? "border-[#DC2626] text-[#DC2626]"
                : isStage2Active
                ? "border-[#E29A2B] text-[#E29A2B]"
                : "border-gray-400 text-gray-500 opacity-90"
            }`}
          >
            2
          </div>
          <div
            className={`w-13 h-2 border-2 border-black rounded-t-full -mt-2 z-0 flex flex-col items-center justify-end overflow-hidden shadow-[1.5px_1.5px_0px_#000] ${
              isStage2Passed ? "bg-[#52AE26]" : isStage2Failed ? "bg-[#DC2626]" : isStage2Active ? "bg-[#E29A2B]" : "bg-gray-400"
            }`}
          >
            <div className={`w-full h-1 ${isStage2Active ? "bg-[#F0AD3D]" : "bg-black/20"}`} />
          </div>
        </div>

        {/* Sub-label Box */}
        <div className="bg-[#FFF4E6] border-2 border-black rounded-[6px] p-1 min-w-[110px] text-center shadow-[2px_2px_0px_#000] mt-0.5">
          <div className="text-[#B87B21] font-bold text-[7.5px] tracking-wider uppercase mb-0.5">
            STAGE 2
          </div>
          <div
            className={`font-black text-[8px] tracking-tight uppercase leading-tight ${
              isStage2Passed ? "text-[#52AE26]" : isStage2Failed ? "text-[#DC2626]" : isStage2Active ? "text-[#E29A2B]" : "text-gray-600"
            }`}
          >
            {isStage2Passed ? "ACCEPTED" : isStage2Failed ? "REJECTED" : isStage2Active ? "SHORTLISTING" : "SHORTLISTING"}
          </div>
        </div>
      </div>

      {/* ================= STAGE 3 NODE ================= */}
      <div
        className="absolute z-10 flex flex-col items-center gap-1 group"
        style={{ left: "15px", top: "190px" }}
      >
        {/* Flag Banner */}
        <div
          className={`border-2 border-black rounded-[4px] px-1.5 py-0.5 flex items-center justify-center font-bold text-[9px] shadow-[2px_2px_0px_#000] relative ${
            stage3Unlocked
              ? "bg-[#1093EB] text-white"
              : isStage3Active
              ? "bg-[#E29A2B] text-black"
              : "bg-gray-400 text-black opacity-80"
          }`}
        >
          <span className="text-[7px] uppercase tracking-wider">
            {stage3Unlocked ? "UNLOCKED" : isStage3Active ? "PENDING" : "LOCKED"}
          </span>
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-1 h-2 bg-black" />
        </div>

        {/* Node Platform */}
        <div className="flex flex-col items-center mt-0.5">
          <div
            className={`w-10 h-10 bg-white border-3 rounded-full flex items-center justify-center font-bold text-[15px] shadow-[2px_2px_0px_#000] relative z-10 transition-transform group-hover:scale-105 ${
              stage3Unlocked
                ? "border-[#1093EB] text-[#1093EB]"
                : isStage3Active
                ? "border-[#E29A2B] text-[#E29A2B]"
                : "border-gray-400 text-gray-500 opacity-80"
            }`}
          >
            3
          </div>
          <div
            className={`w-13 h-2 border-2 border-black rounded-t-full -mt-2 z-0 flex flex-col items-center justify-end overflow-hidden shadow-[1.5px_1.5px_0px_#000] ${
              stage3Unlocked ? "bg-[#1093EB]" : isStage3Active ? "bg-[#E29A2B]" : "bg-gray-400"
            }`}
          >
            <div className={`w-full h-1 ${isStage3Active ? "bg-[#F0AD3D]" : "bg-black/20"}`} />
          </div>
        </div>

        {/* Sub-label Box */}
        <div className="bg-[#FFF4E6] border-2 border-black rounded-[6px] p-1 min-w-[110px] text-center shadow-[2px_2px_0px_#000] mt-0.5">
          <div className="text-[#B87B21] font-bold text-[7.5px] tracking-wider uppercase mb-0.5">
            STAGE 3
          </div>
          <div
            className={`font-black text-[8px] tracking-tight uppercase leading-tight ${
              stage3Unlocked ? "text-[#1093EB]" : isStage3Active ? "text-[#E29A2B]" : "text-gray-600"
            }`}
          >
            INTERVIEW
          </div>
        </div>
      </div>
    </div>
  );

  if (isVertical) {
    return renderVertical();
  }

  return (
    <>
      <div className="hidden md:block">
        {renderHorizontal()}
      </div>
      <div className="block md:hidden">
        {renderVertical()}
      </div>
    </>
  );
}

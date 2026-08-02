import React from "react";
import RecruitmentTimeline from "./RecruitmentTimeline";

export interface ApplicationProgressCardProps {
  deptTitle: string;
  deptSlug: string;
  stage1Submitted: boolean;
  stage2Status: "pending" | "accepted" | "rejected" | "passed" | "failed";
  stage3Unlocked: boolean;
  onEditForm: () => void;
  onChangeDepartment: () => void;
}

export default function ApplicationProgressCard({
  deptTitle,
  stage1Submitted,
  stage2Status,
  stage3Unlocked,
  onEditForm,
  onChangeDepartment,
}: ApplicationProgressCardProps) {
  const isStage2Passed = stage2Status === "accepted" || stage2Status === "passed";
  const isStage2Failed = stage2Status === "rejected" || stage2Status === "failed";
  const isStage2Pending = !isStage2Passed && !isStage2Failed;

  return (
    <div
      className="w-[385px] h-[275px] flex flex-col items-start p-1.5 rounded-[10px] border-4 border-solid border-black relative shrink-0 select-none bg-white font-press-start group"
      style={{ boxShadow: "6px 6px 0px 0px rgba(0,0,0,0.15)" }}
    >
      {/* Card Header Tag */}
      <div className="flex flex-col items-center py-2 relative self-stretch w-full rounded-[6px] border-b-4 border-solid border-black bg-[#E29A2B]">
        <div className="relative flex items-center justify-center w-fit text-white drop-shadow-[2px_2px_0px_#000] font-bold text-[13px] tracking-wider uppercase leading-none whitespace-nowrap px-2">
          {deptTitle}
        </div>
      </div>

      {/* Inner White Box */}
      <div className="flex-grow w-full p-2 rounded-b-[6px] flex flex-col items-center justify-between bg-[#FFF4E6]">
        <div className="w-full h-full bg-white border-4 border-solid border-black p-2.5 flex flex-col items-center justify-between text-center gap-1.5">
          {/* Subtitle / Quest Progress */}
          <div className="text-[10px] font-bold tracking-widest text-[#A93710] uppercase drop-shadow-[1px_1px_0px_#fff]">
            QUEST PROGRESS
          </div>

          {/* Timeline Visual */}
          <RecruitmentTimeline
            stage1Submitted={stage1Submitted}
            stage2Status={stage2Status}
            stage3Unlocked={stage3Unlocked}
          />

          {/* Stage Status Summary Text */}
          <div className="text-[9px] font-bold uppercase tracking-wider text-black w-full flex justify-center items-center py-0.5">
            {isStage2Failed ? (
              <span className="text-[#DC2626] font-black flex items-center gap-1">
                ❌ APPLICATION REJECTED
              </span>
            ) : isStage2Passed ? (
              <span className="text-[#52AE26] font-black flex items-center gap-1">
                ✔ SHORTLISTED FOR INTERVIEW
              </span>
            ) : (
              <span className="text-[#B87B21] font-black flex items-center gap-1">
                ⏳ STAGE 2 — SHORTLISTING
              </span>
            )}
          </div>

          {/* Action Buttons: Edit Form & Change Department */}
          <div className="flex items-center gap-2 w-full mt-0.5">
            <button
              type="button"
              onClick={onEditForm}
              disabled={!isStage2Pending}
              className={`flex-1 py-1.5 px-2 border-2 border-black text-[9px] font-bold uppercase tracking-wider transition-transform active:translate-y-0.5 shadow-[2px_2px_0px_#000] ${
                isStage2Pending
                  ? "bg-[#1093EB] hover:bg-[#16B6F4] text-white cursor-pointer"
                  : "bg-gray-300 text-gray-600 cursor-not-allowed opacity-60"
              }`}
              title={isStage2Pending ? "Edit your application form" : "Editing is disabled for this status"}
            >
              EDIT FORM
            </button>

            <button
              type="button"
              onClick={onChangeDepartment}
              disabled={!isStage2Pending}
              className={`flex-1 py-1.5 px-2 border-2 border-black text-[9px] font-bold uppercase tracking-wider transition-transform active:translate-y-0.5 shadow-[2px_2px_0px_#000] ${
                isStage2Pending
                  ? "bg-[#A93710] hover:bg-[#C44214] text-white cursor-pointer"
                  : "bg-gray-300 text-gray-600 cursor-not-allowed opacity-60"
              }`}
              title={isStage2Pending ? "Change your department preference" : "Changing department is disabled for this status"}
            >
              CHANGE DEPT
            </button>
          </div>
        </div>
      </div>

      {/* Decorative Corner Pixels */}
      <div className="absolute top-1.5 left-1.5 w-1 h-1 bg-[#ffffff66]" />
      <div className="absolute top-1.5 left-1.5 w-1 h-1 bg-black" />
      <div className="absolute top-1.5 right-1.5 w-1 h-1 bg-black" />
      <div className="absolute left-1.5 bottom-1.5 w-1 h-1 bg-black" />
      <div className="absolute right-1.5 bottom-1.5 w-1 h-1 bg-black" />
    </div>
  );
}

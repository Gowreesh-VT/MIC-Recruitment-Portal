import React from "react";

export interface ActiveDepartmentCardProps {
  deptTitle: string;
  deptSlug: string;
  statusText?: string;
  isStage2Pending: boolean;
  hasSubmission?: boolean; // false = user switched dept but hasn't submitted the new form yet
  onEditForm: () => void;
  onChangeDepartment: () => void;
}

export default function ActiveDepartmentCard({
  deptTitle,
  statusText = "ACTIVE",
  isStage2Pending,
  hasSubmission = true,
  onEditForm,
  onChangeDepartment,
}: ActiveDepartmentCardProps) {
  return (
    <div
      className="w-[340px] sm:w-[360px] h-[250px] flex flex-col items-start p-1.5 rounded-[10px] border-4 border-solid border-black relative shrink-0 select-none bg-white font-press-start"
      style={{ boxShadow: "6px 6px 0px 0px rgba(0,0,0,0.3)" }}
    >
      {/* Header Tag */}
      <div className="flex flex-col items-center py-2 relative self-stretch w-full rounded-[6px] border-b-4 border-solid border-black bg-[#B87B21]">
        <div className="relative flex items-center justify-center w-fit text-white drop-shadow-[2px_2px_0px_#000] font-bold text-[12px] tracking-wider uppercase leading-none whitespace-nowrap px-2">
          ACTIVE DEPARTMENT
        </div>
      </div>

      {/* Inner White Box */}
      <div className="flex-grow w-full p-2 rounded-b-[6px] flex flex-col items-center justify-between bg-[#FFF4E6]">
        <div className="w-full h-full bg-[#FFFDF9] border-4 border-solid border-black p-3.5 flex flex-col items-start justify-between">
          {/* Top Row: Star + Title + Status */}
          <div className="w-full flex flex-col gap-2">
            <div className="flex items-center gap-2.5">
              {/* Star Icon */}
              <div className="w-7 h-7 flex items-center justify-center text-[18px] text-[#FCEE0A] drop-shadow-[1.5px_1.5px_0px_#000]">
                ★
              </div>
              {/* Department Title */}
              <h2 className="text-[14px] font-bold text-black uppercase tracking-wider leading-none drop-shadow-[0.5px_0.5px_0px_#fff]">
                {deptTitle}
              </h2>
            </div>

            <div className="pl-9 text-[9px] font-bold tracking-wider uppercase">
              <span className="text-gray-600">STATUS: </span>
              <span
                className={
                  !hasSubmission
                    ? "text-[#E29A2B]"
                    : statusText.toUpperCase() === "REJECTED"
                    ? "text-[#DC2626]"
                    : statusText.toUpperCase() === "ACCEPTED" || statusText.toUpperCase() === "PASSED"
                    ? "text-[#52AE26]"
                    : "text-[#52AE26]"
                }
              >
                {!hasSubmission ? "FORM INCOMPLETE" : statusText.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Horizontal Dashed Line Separator */}
          <div className="w-full border-b-2 border-dashed border-gray-400 my-1" />

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 w-full">
            <button
              type="button"
              onClick={onEditForm}
              disabled={!isStage2Pending}
              className={`flex-1 py-2 px-2 border-2 border-black rounded-[4px] text-[9px] font-bold uppercase tracking-wider transition-transform active:translate-y-0.5 shadow-[2px_2px_0px_#000] cursor-pointer ${
                isStage2Pending
                  ? hasSubmission
                    ? "bg-[#1093EB] hover:bg-[#16B6F4] text-white"
                    : "bg-[#E29A2B] hover:bg-[#F0AD3D] text-black animate-pulse"
                  : "bg-gray-300 text-gray-600 cursor-not-allowed opacity-60"
              }`}
              title={isStage2Pending ? (hasSubmission ? "Edit application form" : "Complete your application form") : "Editing is disabled for this status"}
            >
              {hasSubmission ? "EDIT FORM" : "COMPLETE FORM"}
            </button>

            <button
              type="button"
              onClick={onChangeDepartment}
              disabled={!isStage2Pending}
              className={`flex-1 py-2 px-2 border-2 border-black rounded-[4px] text-[9px] font-bold uppercase tracking-wider transition-transform active:translate-y-0.5 shadow-[2px_2px_0px_#000] cursor-pointer ${
                isStage2Pending
                  ? "bg-[#A93710] hover:bg-[#C44214] text-white"
                  : "bg-gray-300 text-gray-600 cursor-not-allowed opacity-60"
              }`}
              title={isStage2Pending ? "Change department" : "Changing department is disabled for this status"}
            >
              CHANGE DEPARTMENT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


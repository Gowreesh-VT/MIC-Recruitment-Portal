"use client";

import React, { useEffect } from "react";

interface FinalPreferenceConfirmationModalProps {
  techPreferenceTitle: string;
  nonTechPreferenceTitle: string;
  onConfirmFinal: () => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export default function FinalPreferenceConfirmationModal({
  techPreferenceTitle,
  nonTechPreferenceTitle,
  onConfirmFinal,
  onCancel,
  isSubmitting = false,
}: FinalPreferenceConfirmationModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 select-none animate-fade-in font-press-start"
      onClick={onCancel}
    >
      {/* Modal Container */}
      <div
        className="w-full max-w-[500px] bg-[#FFE4D6] border-4 border-black p-6 relative flex flex-col items-center gap-4 text-center rounded-[10px]"
        style={{ boxShadow: "8px 8px 0px 0px rgba(0,0,0,0.5)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Corner Pixels */}
        <div className="absolute top-1.5 left-1.5 w-1.5 h-1.5 bg-black" />
        <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-black" />
        <div className="absolute bottom-1.5 left-1.5 w-1.5 h-1.5 bg-black" />
        <div className="absolute bottom-1.5 right-1.5 w-1.5 h-1.5 bg-black" />

        {/* Modal Header */}
        <div className="bg-[#A93710] text-white px-4 py-2 border-2 border-black text-[11px] uppercase tracking-widest font-bold -mt-10 mb-1 shadow-[2px_2px_0px_#000]">
          FINAL PREFERENCE CONFIRMATION
        </div>

        {/* Preferences Summary */}
        <div className="w-full flex flex-col gap-2 my-1">
          <div className="bg-white border-2 border-black p-3 rounded-[6px] text-left shadow-[2px_2px_0px_#000]">
            <span className="text-[8px] text-gray-600 font-bold uppercase tracking-wider block mb-1">
              TECH PREFERENCE
            </span>
            <span className="text-[12px] text-[#A93710] font-bold uppercase tracking-wider block">
              {techPreferenceTitle}
            </span>
          </div>

          <div className="bg-white border-2 border-black p-3 rounded-[6px] text-left shadow-[2px_2px_0px_#000]">
            <span className="text-[8px] text-gray-600 font-bold uppercase tracking-wider block mb-1">
              NON-TECH PREFERENCE
            </span>
            <span className="text-[12px] text-[#1093EB] font-bold uppercase tracking-wider block">
              {nonTechPreferenceTitle}
            </span>
          </div>
        </div>

        {/* Modal Warning Body */}
        <div className="my-1 space-y-2">
          <p className="text-[10px] text-black font-bold uppercase tracking-wider leading-relaxed">
            THIS IS YOUR FINAL TECH & NON-TECH PREFERENCE.
          </p>
          <p className="text-[10px] text-[#A93710] font-bold uppercase tracking-wider leading-relaxed">
            DO YOU WANT TO SUBMIT IT FINAL? AFTER THIS THERE IS NO OPTION FOR EDITING.
          </p>
        </div>

        {/* Auto-Confirm Warning Notice Box */}
        <div className="w-full bg-[#FFF3CD] border-2 border-[#E29A2B] p-3 text-[8.5px] text-black font-bold uppercase tracking-wider leading-relaxed shadow-[2px_2px_0px_#000]">
          ⚠ NOTE: IF YOU CANCEL, YOUR RESPONSES WILL BE AUTO-CONFIRMED ONCE RECRUITMENTS CLOSE.
        </div>

        {/* Selection Buttons */}
        <div className="w-full flex flex-col sm:flex-row gap-3 mt-2">
          {/* Cancel Button */}
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 bg-[#888888] hover:bg-[#999999] disabled:opacity-60 text-white border-4 border-black py-3 px-4 text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-transform hover:-translate-y-0.5 active:translate-y-0"
            style={{ boxShadow: "4px 4px 0px 0px #000" }}
          >
            Cancel
          </button>

          {/* Submit Final Button */}
          <button
            onClick={onConfirmFinal}
            disabled={isSubmitting}
            className="flex-1 bg-[#7CA922] hover:bg-[#8CB932] disabled:opacity-60 text-black border-4 border-black py-3 px-4 text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-transform hover:-translate-y-0.5 active:translate-y-0"
            style={{ boxShadow: "4px 4px 0px 0px #000" }}
          >
            {isSubmitting ? "SUBMITTING..." : "SUBMIT FINAL"}
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect } from "react";

interface FinalPreferenceConfirmationModalProps {
  techPreferenceTitle: string;
  nonTechPreferenceTitle: string;
  onClose: () => void;
}

export default function FinalPreferenceConfirmationModal({
  techPreferenceTitle,
  nonTechPreferenceTitle,
  onClose,
}: FinalPreferenceConfirmationModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 select-none animate-fade-in font-press-start"
      onClick={onClose}
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

        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 sm:-top-5 sm:-right-5 cursor-pointer hover:scale-110 active:scale-95 transition-transform duration-100 flex items-center justify-center select-none z-30"
          title="Close"
        >
          <img
            src="/Close_icon.svg"
            alt="Close"
            className="w-[38px] h-[36px] sm:w-[44px] sm:h-[42px] pixelated select-none pointer-events-none"
          />
        </button>

        {/* Modal Header */}
        <div className="bg-[#B87B21] text-white px-4 py-2 border-2 border-black text-[11px] uppercase tracking-widest font-bold -mt-10 mb-1 shadow-[2px_2px_0px_#000]">
          YOUR SELECTED PREFERENCES
        </div>

        {/* Preferences Summary */}
        <div className="w-full flex flex-col gap-2.5 my-1">
          <div className="bg-white border-2 border-black p-3.5 rounded-[6px] text-left shadow-[2px_2px_0px_#000]">
            <span className="text-[8px] text-gray-600 font-bold uppercase tracking-wider block mb-1">
              TECH PREFERENCE
            </span>
            <span className="text-[13px] text-[#A93710] font-bold uppercase tracking-wider block">
              {techPreferenceTitle || "NOT SELECTED"}
            </span>
          </div>

          <div className="bg-white border-2 border-black p-3.5 rounded-[6px] text-left shadow-[2px_2px_0px_#000]">
            <span className="text-[8px] text-gray-600 font-bold uppercase tracking-wider block mb-1">
              NON-TECH PREFERENCE
            </span>
            <span className="text-[13px] text-[#1093EB] font-bold uppercase tracking-wider block">
              {nonTechPreferenceTitle || "NOT SELECTED"}
            </span>
          </div>
        </div>

        {/* Info Body */}
        <div className="my-1">
          <p className="text-[10px] text-black font-bold uppercase tracking-wider leading-relaxed">
            THESE ARE YOUR ACTIVE TECH & NON-TECH QUEST PREFERENCES FOR THIS RECRUITMENT CYCLE.
          </p>
        </div>

        {/* Close Button */}
        <div className="w-full mt-2">
          <button
            onClick={onClose}
            className="w-full bg-[#E29A2B] hover:bg-[#F0AD3D] text-black border-4 border-black py-3 px-4 text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-transform hover:-translate-y-0.5 active:translate-y-0"
            style={{ boxShadow: "4px 4px 0px 0px #000" }}
          >
            GOT IT!
          </button>
        </div>
      </div>
    </div>
  );
}

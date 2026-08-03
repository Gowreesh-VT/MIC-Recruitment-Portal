"use client";

import React, { useState } from "react";
import { Press_Start_2P } from "next/font/google";
import { ArrowRight, Check, X, Sparkles } from "lucide-react";

const pressStart = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start-2p",
});

export interface DepartmentOption {
  slug: string;
  name: string;
  description?: string;
}

interface ChangeDepartmentModalProps {
  isOpen: boolean;
  trackType: "tech" | "non-tech";
  currentDeptSlug: string;
  availableDepartments: DepartmentOption[];
  onConfirm: (newDeptSlug: string) => Promise<void> | void;
  onClose: () => void;
  loading?: boolean;
}

export default function ChangeDepartmentModal({
  isOpen,
  trackType,
  currentDeptSlug,
  availableDepartments,
  onConfirm,
  onClose,
  loading = false,
}: ChangeDepartmentModalProps) {
  const [selectedSlug, setSelectedSlug] = useState<string>("");

  React.useEffect(() => {
    if (isOpen) {
      setSelectedSlug("");
    }
  }, [isOpen, currentDeptSlug]);

  if (!isOpen) return null;

  const eligibleDepartments = availableDepartments.filter(
    (d) => d.slug !== currentDeptSlug
  );

  const handleConfirm = async () => {
    if (!selectedSlug || selectedSlug === currentDeptSlug) return;
    await onConfirm(selectedSlug);
  };

  return (
    <div className={`fixed inset-0 z-[120] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto ${pressStart.variable} font-press-start`}>
      <div
        className="bg-[#FFE4D6] border-4 border-black p-6 max-w-lg w-full relative flex flex-col items-center my-auto"
        style={{ boxShadow: "10px 10px 0px 0px rgba(0,0,0,0.8)" }}
      >
        {/* Retro Header Tag */}
        <div
          className="bg-[#A93710] text-white px-5 py-2 border-4 border-black text-[10px] sm:text-[11px] uppercase tracking-widest font-bold -mt-10 mb-4 flex items-center gap-2"
          style={{ boxShadow: "4px 4px 0px 0px #000" }}
        >
          <Sparkles className="h-4 w-4" />
          CHANGE {trackType === "tech" ? "TECH" : "NON-TECH"} DEPARTMENT
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-3 right-3 text-black hover:text-[#A93710] p-1 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Subtitle */}
        <p className="text-[10px] text-black font-bold uppercase tracking-wider text-center mt-1 mb-4 leading-loose">
          Select a new department to switch your{" "}
          {trackType === "tech" ? "Technical" : "Non-Technical"} preference choice:
        </p>

        {/* Department Options List */}
        <div className="w-full flex flex-col gap-2.5 mb-5">
          {eligibleDepartments.map((dept) => {
            const isSelected = selectedSlug === dept.slug;
            return (
              <button
                key={dept.slug}
                type="button"
                onClick={() => setSelectedSlug(dept.slug)}
                className={`w-full text-left p-3 border-4 border-black transition-all duration-100 flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? "bg-[#A93710] text-white translate-x-[3px] translate-y-[2px]"
                    : "bg-white text-black hover:bg-[#FFE4D6]"
                }`}
                style={{
                  boxShadow: isSelected
                    ? "2px 2px 0px 0px #000"
                    : "4px 4px 0px 0px #000",
                }}
              >
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    {dept.name}
                  </span>
                  {dept.description && (
                    <span
                      className={`text-[9px] line-clamp-1 ${
                        isSelected ? "text-white/80" : "text-[#6B4226]"
                      }`}
                    >
                      {dept.description}
                    </span>
                  )}
                </div>
                {/* Radio indicator */}
                <div
                  className={`w-6 h-6 rounded-full border-[3px] border-black flex items-center justify-center shrink-0 ml-3 ${
                    isSelected ? "bg-white" : "bg-[#FFDED6]"
                  }`}
                >
                  {isSelected && <Check className="h-3.5 w-3.5 stroke-[3] text-[#A93710]" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div className="w-full border-t-2 border-dashed border-black/30 mb-4" />

        {/* Action Buttons */}
        <div className="w-full flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="bg-white hover:bg-[#FFDED6] text-black border-4 border-black px-5 py-2.5 text-[10px] font-bold uppercase tracking-wider cursor-pointer active:translate-y-0.5 disabled:opacity-50 transition-colors"
            style={{ boxShadow: "4px 4px 0px 0px #000" }}
          >
            CANCEL
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedSlug || loading}
            className={`text-white border-4 border-black px-5 py-2.5 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
              !selectedSlug || loading
                ? "bg-[#A0A0A0] cursor-not-allowed border-[#666]"
                : "bg-[#A93710] hover:bg-[#C44214] cursor-pointer active:translate-y-0.5"
            }`}
            style={{
              boxShadow:
                !selectedSlug || loading
                  ? "4px 4px 0px 0px #555"
                  : "4px 4px 0px 0px #000",
            }}
          >
            {loading ? "SWITCHING..." : "CONFIRM & SWITCH"}
            {!loading && <ArrowRight className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}

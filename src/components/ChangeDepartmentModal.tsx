"use client";

import React, { useState } from "react";
import { Press_Start_2P } from "next/font/google";
import { ArrowRight, Check, X, ShieldAlert, Sparkles } from "lucide-react";

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
    <div className={`fixed inset-0 z-[120] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto ${pressStart.variable}`}>
      <div className="bg-[#FFE4D6] border-4 border-black p-6 max-w-lg w-full relative flex flex-col items-center shadow-[10px_10px_0px_0px_rgba(0,0,0,0.8)] my-auto">
        {/* Retro Header Tag */}
        <div className="bg-[#A93710] text-white px-4 py-1.5 border-2 border-black text-[10px] sm:text-[11px] uppercase tracking-widest font-extrabold -mt-10 mb-3 shadow-[3px_3px_0px_#000] flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          CHANGE {trackType.toUpperCase()} DEPARTMENT
        </div>

        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-3 right-3 text-black hover:text-[#A93710] p-1 transition-colors disabled:opacity-50"
        >
          <X className="h-5 w-5" />
        </button>

        <p className="text-[11px] text-black font-bold uppercase tracking-wider text-center mt-1 mb-4 leading-relaxed">
          Select a new department to switch your {trackType === "tech" ? "Technical" : "Non-Technical"} preference choice:
        </p>

        {/* Info Banner */}
        <div className="w-full bg-amber-100 border-2 border-amber-600 p-2.5 rounded-none mb-4 flex items-start gap-2 text-[10px] text-amber-950 font-bold uppercase">
          <ShieldAlert className="h-4 w-4 shrink-0 text-amber-700 mt-0.5" />
          <span>
            Your personal profile details will remain saved. Previously entered draft answers for the new department will be restored!
          </span>
        </div>

        {/* Department Options Grid */}
        <div className="w-full flex flex-col gap-2.5 max-h-[260px] overflow-y-auto pr-1 mb-5">
          {eligibleDepartments.map((dept) => {
            const isSelected = selectedSlug === dept.slug;
            return (
              <button
                key={dept.slug}
                type="button"
                onClick={() => setSelectedSlug(dept.slug)}
                className={`w-full text-left p-3 border-3 transition-all flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? "bg-[#A93710] text-white border-black shadow-[4px_4px_0px_0px_#000] translate-x-1"
                    : "bg-white text-black border-black hover:bg-orange-50 shadow-[2px_2px_0px_0px_#000]"
                }`}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-2">
                    {dept.name}
                  </span>
                  {dept.description && (
                    <span className={`text-[9px] line-clamp-1 ${isSelected ? "text-white/90" : "text-zinc-600"}`}>
                      {dept.description}
                    </span>
                  )}
                </div>
                <div className={`w-5 h-5 rounded-full border-2 border-black flex items-center justify-center shrink-0 ml-2 ${
                  isSelected ? "bg-white text-black" : "bg-zinc-100"
                }`}>
                  {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="w-full flex items-center justify-end gap-3 pt-2 border-t-2 border-dashed border-black/30">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="bg-white hover:bg-zinc-100 text-black border-3 border-black px-4 py-2 text-[10px] font-bold uppercase tracking-wider shadow-[3px_3px_0px_0px_#000] active:translate-y-0.5 disabled:opacity-50"
          >
            CANCEL
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedSlug || loading}
            className="bg-[#A93710] hover:bg-[#8f2c0b] text-white border-3 border-black px-5 py-2 text-[10px] font-bold uppercase tracking-wider shadow-[3px_3px_0px_0px_#000] active:translate-y-0.5 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "SWITCHING..." : "CONFIRM & SWITCH"}
            {!loading && <ArrowRight className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}

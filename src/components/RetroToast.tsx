"use client";

import React, { useEffect } from "react";
import { Press_Start_2P } from "next/font/google";
import { AlertTriangle, X, CheckCircle2, Info } from "lucide-react";

const pressStart = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start-2p",
});

export interface RetroToastProps {
  message: string | null;
  type?: "error" | "success" | "info";
  onClose: () => void;
  duration?: number; // Auto close duration in ms (default 6000ms)
}

export default function RetroToast({
  message,
  type = "error",
  onClose,
  duration = 6000,
}: RetroToastProps) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const isError = type === "error";
  const isSuccess = type === "success";

  const headerBg = isError ? "bg-[#DC2626]" : isSuccess ? "bg-[#52AE26]" : "bg-[#1093EB]";
  const iconColor = isError ? "text-red-600" : isSuccess ? "text-green-600" : "text-sky-600";

  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[200] max-w-md w-[92vw] sm:w-[480px] pointer-events-auto select-none ${pressStart.variable} font-press-start`}>
      <div
        className="bg-[#FFE4D6] border-4 border-black p-4 relative flex flex-col gap-2 rounded-[8px] animate-bounce-short"
        style={{ boxShadow: "6px 6px 0px 0px rgba(0,0,0,0.8)" }}
      >
        {/* Top Tag Header */}
        <div className={`-mt-7 self-start px-3 py-1 border-2 border-black ${headerBg} text-white text-[9px] uppercase tracking-widest font-bold flex items-center gap-1.5 shadow-[2px_2px_0px_#000]`}>
          {isError ? (
            <>
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>VALIDATION ERROR</span>
            </>
          ) : isSuccess ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>SUCCESS</span>
            </>
          ) : (
            <>
              <Info className="w-3.5 h-3.5" />
              <span>NOTICE</span>
            </>
          )}
        </div>

        {/* Close X Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-2 p-1 text-black hover:text-[#A93710] transition-colors cursor-pointer"
          title="Close notification"
        >
          <X className="w-4 h-4 stroke-[3]" />
        </button>

        {/* Toast Body */}
        <div className="flex items-start gap-3 mt-1 pr-4">
          <span className={`${iconColor} text-sm leading-none shrink-0 mt-0.5`}>►</span>
          <p className="text-[10px] text-black font-sans font-bold uppercase leading-relaxed break-words">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}

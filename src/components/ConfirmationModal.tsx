import React, { useEffect } from "react";

export interface ConfirmationModalProps {
  title?: string;
  message: string;
  cancelLabel?: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export default function ConfirmationModal({
  title = "⚠ CONFIRMATION",
  message,
  cancelLabel = "CANCEL",
  confirmLabel = "CONTINUE",
  onCancel,
  onConfirm,
  isLoading = false,
}: ConfirmationModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel, isLoading]);

  return (
    <div
      className="fixed inset-0 z-[110] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 font-press-start select-none animate-fade-in"
      onClick={() => {
        if (!isLoading) onCancel();
      }}
    >
      <div
        className="bg-[#FFE4D6] border-4 border-black p-6 max-w-md w-full relative flex flex-col items-center gap-5 text-center retro-shadow"
        style={{ boxShadow: "8px 8px 0px 0px rgba(0,0,0,0.5)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Tag */}
        <div className="bg-[#A93710] text-white px-4 py-2 border-2 border-black text-[11px] uppercase tracking-widest font-bold -mt-10 mb-1 shadow-[2px_2px_0px_#000]">
          {title}
        </div>

        {/* Message Container */}
        <div className="text-[11px] text-black font-bold tracking-wide uppercase leading-loose border-2 border-dashed border-[#A93710] p-4 bg-white/60 w-full">
          {message}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 w-full mt-1">
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full bg-[#A93710] hover:bg-[#C44214] disabled:opacity-60 border-4 border-black py-3 px-4 text-[10px] font-bold text-white uppercase tracking-wider transition-transform hover:-translate-y-0.5 active:translate-y-0 shadow-[4px_4px_0px_0px_#000] cursor-pointer"
          >
            {isLoading ? "PROCESSING..." : confirmLabel}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="w-full bg-[#E29A2B] hover:bg-[#F0AD3D] disabled:opacity-60 border-4 border-black py-2.5 px-4 text-[10px] font-bold text-black uppercase tracking-wider transition-transform hover:-translate-y-0.5 active:translate-y-0 shadow-[4px_4px_0px_0px_#000] cursor-pointer"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

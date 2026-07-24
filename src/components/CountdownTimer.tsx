"use client";

import React, { useState, useEffect } from "react";

export interface CountdownTimerProps {
  targetDate: string;
  title?: string;
  onExpiry?: () => void;
  className?: string;
}

export default function CountdownTimer({
  targetDate,
  title = "RECRUITMENT COUNTDOWN",
  onExpiry,
  className = "",
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    if (!targetDate) return;

    const calculateTimeLeft = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        if (onExpiry) onExpiry();
        return;
      }
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / (1000 * 60 * 60)) % 24),
        seconds: Math.floor((difference / 1000) % 60),
      });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [targetDate, onExpiry]);

  if (!timeLeft) return null;

  return (
    <div
      className={`bg-[#FFE4D6]/95 border-4 border-black rounded-[8px] p-3 md:p-4 text-center space-y-2 font-bold w-full max-w-md mx-auto shadow-[4px_4px_0px_0px_rgba(0,0,0,0.25)] select-none ${className}`}
    >
      <p className="text-[10px] md:text-[11px] text-[#A93710] uppercase tracking-widest font-extrabold drop-shadow-[1px_1px_0px_#fff]">
        ★ {title} ★
      </p>
      <div className="flex gap-1.5 md:gap-2 justify-center text-[12px] md:text-[14px] text-black">
        <div className="flex flex-col items-center">
          <span className="bg-[#C85A28]/15 px-2 md:px-3 py-1 border-2 md:border-3 border-black rounded-[4px] font-extrabold min-w-[36px] md:min-w-[44px]">
            {String(timeLeft.days).padStart(2, "0")}
          </span>
          <span className="text-[8px] md:text-[9px] text-zinc-700 font-extrabold uppercase mt-1">DAYS</span>
        </div>

        <span className="self-start font-extrabold text-[14px] md:text-[16px] mt-1">:</span>

        <div className="flex flex-col items-center">
          <span className="bg-[#C85A28]/15 px-2 md:px-3 py-1 border-2 md:border-3 border-black rounded-[4px] font-extrabold min-w-[36px] md:min-w-[44px]">
            {String(timeLeft.hours).padStart(2, "0")}
          </span>
          <span className="text-[8px] md:text-[9px] text-zinc-700 font-extrabold uppercase mt-1">HRS</span>
        </div>

        <span className="self-start font-extrabold text-[14px] md:text-[16px] mt-1">:</span>

        <div className="flex flex-col items-center">
          <span className="bg-[#C85A28]/15 px-2 md:px-3 py-1 border-2 md:border-3 border-black rounded-[4px] font-extrabold min-w-[36px] md:min-w-[44px]">
            {String(timeLeft.minutes).padStart(2, "0")}
          </span>
          <span className="text-[8px] md:text-[9px] text-zinc-700 font-extrabold uppercase mt-1">MINS</span>
        </div>

        <span className="self-start font-extrabold text-[14px] md:text-[16px] mt-1">:</span>

        <div className="flex flex-col items-center">
          <span className="bg-[#C85A28]/15 px-2 md:px-3 py-1 border-2 md:border-3 border-black rounded-[4px] font-extrabold min-w-[36px] md:min-w-[44px] text-[#A93710]">
            {String(timeLeft.seconds).padStart(2, "0")}
          </span>
          <span className="text-[8px] md:text-[9px] text-zinc-700 font-extrabold uppercase mt-1">SECS</span>
        </div>
      </div>
    </div>
  );
}

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

    let hasTriggeredExpiry = false;

    const calculateTimeLeft = () => {
      const targetMs = new Date(targetDate).getTime();
      if (isNaN(targetMs)) {
        setTimeLeft(null);
        return;
      }

      const difference = targetMs - new Date().getTime();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        if (!hasTriggeredExpiry) {
          hasTriggeredExpiry = true;
          if (onExpiry) onExpiry();
        }
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / (1000 * 60)) % 60),
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
      className={`font-sans bg-[#FFE8DA] border-4 border-black rounded-[8px] overflow-hidden select-none shadow-[4px_4px_0px_0px_#000] w-full max-w-md mx-auto ${className}`}
    >
      {/* Retro Title Bar */}
      <div className="bg-[#A93710] text-white py-1 px-2.5 border-b-4 border-black text-[9px] sm:text-[10px] font-bold tracking-widest uppercase text-center flex items-center justify-center gap-1 drop-shadow-[1px_1px_0px_#000]">
        <span className="text-[#FFDF2B] flex-shrink-0">★</span>
        <span className="truncate">{title}</span>
        <span className="text-[#FFDF2B] flex-shrink-0">★</span>
      </div>

      {/* Retro Digit Displays */}
      <div className="p-2 sm:p-2.5 flex items-center justify-center gap-1 sm:gap-1.5 bg-[#FFF5EE]">
        {/* Days */}
        <div className="flex flex-col items-center">
          <div className="bg-[#1C1815] border-2 border-black rounded-[4px] px-1.5 sm:px-2 py-0.5 sm:py-1 min-w-[34px] sm:min-w-[42px] text-center shadow-[inset_0px_2px_4px_rgba(0,0,0,0.8)]">
            <span className="font-mono font-black text-[13px] sm:text-[15px] text-[#FFD02C] tracking-wider leading-none">
              {String(timeLeft.days).padStart(2, "0")}
            </span>
          </div>
          <span className="text-[7.5px] sm:text-[8.5px] text-[#555] font-extrabold uppercase mt-1 tracking-wider">DAYS</span>
        </div>

        <span className="font-mono font-black text-[13px] sm:text-[15px] text-black -mt-3.5 sm:-mt-4">:</span>

        {/* Hours */}
        <div className="flex flex-col items-center">
          <div className="bg-[#1C1815] border-2 border-black rounded-[4px] px-1.5 sm:px-2 py-0.5 sm:py-1 min-w-[34px] sm:min-w-[42px] text-center shadow-[inset_0px_2px_4px_rgba(0,0,0,0.8)]">
            <span className="font-mono font-black text-[13px] sm:text-[15px] text-[#FFD02C] tracking-wider leading-none">
              {String(timeLeft.hours).padStart(2, "0")}
            </span>
          </div>
          <span className="text-[7.5px] sm:text-[8.5px] text-[#555] font-extrabold uppercase mt-1 tracking-wider">HRS</span>
        </div>

        <span className="font-mono font-black text-[13px] sm:text-[15px] text-black -mt-3.5 sm:-mt-4">:</span>

        {/* Minutes */}
        <div className="flex flex-col items-center">
          <div className="bg-[#1C1815] border-2 border-black rounded-[4px] px-1.5 sm:px-2 py-0.5 sm:py-1 min-w-[34px] sm:min-w-[42px] text-center shadow-[inset_0px_2px_4px_rgba(0,0,0,0.8)]">
            <span className="font-mono font-black text-[13px] sm:text-[15px] text-[#FFD02C] tracking-wider leading-none">
              {String(timeLeft.minutes).padStart(2, "0")}
            </span>
          </div>
          <span className="text-[7.5px] sm:text-[8.5px] text-[#555] font-extrabold uppercase mt-1 tracking-wider">MINS</span>
        </div>

        <span className="font-mono font-black text-[13px] sm:text-[15px] text-black -mt-3.5 sm:-mt-4">:</span>

        {/* Seconds */}
        <div className="flex flex-col items-center">
          <div className="bg-[#1C1815] border-2 border-black rounded-[4px] px-1.5 sm:px-2 py-0.5 sm:py-1 min-w-[34px] sm:min-w-[42px] text-center shadow-[inset_0px_2px_4px_rgba(0,0,0,0.8)]">
            <span className="font-mono font-black text-[13px] sm:text-[15px] text-[#FF5533] tracking-wider leading-none animate-pulse">
              {String(timeLeft.seconds).padStart(2, "0")}
            </span>
          </div>
          <span className="text-[7.5px] sm:text-[8.5px] text-[#A93710] font-extrabold uppercase mt-1 tracking-wider">SECS</span>
        </div>
      </div>
    </div>
  );
}

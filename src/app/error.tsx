"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Press_Start_2P } from "next/font/google";
import MicLogo from "@/components/MicLogo";
import BackButton from "@/components/BackButton";
import { playRetroSound } from "@/lib/audio";

const pressStart = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start-2p",
});

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const [scale, setScale] = useState(1);
  const MARQUEE_TEXT = "MICROSOFT INNOVATIONS CLUB TENURE 2026-2027";

  useEffect(() => {
    console.error("Unhandled runtime error:", error);
    const handleResize = () => {
      if (typeof window !== "undefined") {
        const heightScale = window.innerHeight / 1024;
        const widthScale = window.innerWidth / 1200;
        const cappedScale = Math.min(heightScale, widthScale, 1.2);
        setScale(cappedScale);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [error]);

  const handleReset = () => {
    playRetroSound("jump");
    reset();
  };

  const handleNavigate = (path: string) => {
    playRetroSound("select");
    router.push(path);
  };

  return (
    <div
      className={`${pressStart.variable} font-press-start w-full h-[100dvh] overflow-hidden select-none bg-[#1093EB] relative flex justify-center items-center`}
    >
      {/* Absolute positioned scaled background container */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          width: "2865px",
          height: "1024px",
          transform: `scale(${scale})`,
          transformOrigin: "top center",
        }}
      >
        <div className="w-[2865px] h-[1024px] absolute top-0 left-0 bg-[linear-gradient(180deg,#1188EE_0%,#0E8AEA_25%,#1093EB_35%,#1197EC_46%,#16B6F4_52%,#10CBF1_56%,#0FC6F1_60%,#15DEF0_65%,#15DEF0_81%)] overflow-hidden">
          {/* Pixel Clouds */}
          <img
            src="/pixel_cloud_small.svg"
            alt=""
            className="absolute top-[300px] left-[1060px] w-[280px] opacity-85 animate-retro-float pixelated"
            style={{ animationDelay: "0s" }}
          />
          <img
            src="/pixel_cloud_small.svg"
            alt=""
            className="absolute top-[140px] left-[-40px] w-[320px] opacity-80 animate-retro-float pixelated"
            style={{ animationDelay: "1s" }}
          />
          <img
            src="/pixel_cloud_small.svg"
            alt=""
            className="absolute top-[39px] left-[1167px] w-[360px] opacity-90 animate-retro-float pixelated"
            style={{ animationDelay: "0.5s" }}
          />

          {/* City Skyline Blocks */}
          {Array.from({ length: 12 }).map((_, idx) => (
            <img
              key={`city-${idx}`}
              src="/city_skyline.svg"
              alt=""
              className="absolute top-[631px] w-[246px] h-[249px] opacity-75 pixelated"
              style={{ left: `${idx * 245}px` }}
            />
          ))}

          {/* Bushes Strip */}
          {Array.from({ length: 3 }).map((_, idx) => (
            <img
              key={`bush-${idx}`}
              src="/bushes_pixel.svg"
              alt=""
              className="absolute top-[739px] w-[1456px] h-[200px] z-4 pixelated"
              style={{ left: `${idx * 1409}px` }}
            />
          ))}

          {/* Ground Strip & Marquee Bar */}
          <div className="absolute top-[925px] left-0 w-full h-[300px] z-25 flex flex-col">
            <div className="w-full h-5 bg-[#52AE26] border-t-4 border-b-4 border-black flex flex-col justify-between shrink-0">
              <div className="w-full h-[3px] bg-[#72F418]" />
              <div className="w-full h-[3px] bg-[#3FA70E]" />
            </div>
            <div className="w-full flex-grow bg-[#DD9955] border-b-4 border-black relative overflow-hidden flex items-start pt-3">
              <div className="flex whitespace-nowrap animate-marquee">
                <span className="inline-flex items-center shrink-0 text-[18px] md:text-[22px] text-[#CC7700] tracking-wider uppercase font-bold">
                  {Array(6)
                    .fill(MARQUEE_TEXT)
                    .map((text, idx) => (
                      <React.Fragment key={`mq1-${idx}`}>
                        <span>{text}</span>
                        <img
                          src="/mic_logo_pixel.png"
                          alt="MIC"
                          className="w-8 h-8 md:w-10 md:h-10 mx-8 shrink-0"
                        />
                      </React.Fragment>
                    ))}
                </span>
                <span className="inline-flex items-center shrink-0 text-[18px] md:text-[22px] text-[#CC7700] tracking-wider uppercase font-bold">
                  {Array(6)
                    .fill(MARQUEE_TEXT)
                    .map((text, idx) => (
                      <React.Fragment key={`mq2-${idx}`}>
                        <span>{text}</span>
                        <img
                          src="/mic_logo_pixel.png"
                          alt="MIC"
                          className="w-8 h-8 md:w-10 md:h-10 mx-8 shrink-0"
                        />
                      </React.Fragment>
                    ))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Left Logo & Back Button */}
      <MicLogo />
      <BackButton onClick={() => handleNavigate("/recruitments")} />

      {/* Error Window Card */}
      <div className="relative z-40 w-full max-w-[620px] px-4 animate-pixel-slide-up">
        <div
          className="bg-[#FFE4D6] rounded-[10px] border-4 border-black flex flex-col items-center p-2 relative"
          style={{ boxShadow: "12px 12px 0px 0px rgba(0,0,0,0.4)" }}
        >
          {/* Header Banner */}
          <div className="w-full bg-[#A93710] border-4 border-black rounded-[6px] py-4 flex items-center justify-center relative overflow-hidden">
            <span className="text-white text-[12px] md:text-[14px] font-bold tracking-widest relative z-10 drop-shadow-[2px_2px_0px_#000] uppercase">
              ░ SYSTEM EXCEPTION ░
            </span>
          </div>

          {/* Main Card Content */}
          <div className="w-full p-6 md:p-8 flex flex-col items-center gap-6 bg-[#FFDED6] mt-2 border-4 border-black rounded-[6px]">
            {/* Warning Pixel Symbol */}
            <div className="bg-[#A93710] text-white border-4 border-black px-6 py-3 text-sm font-bold shadow-[4px_4px_0px_0px_#000] animate-pulse">
              ⚠️ RUNTIME FAULT
            </div>

            <div className="text-center space-y-3 w-full">
              <h2 className="text-[12px] font-bold text-[#A93710] leading-loose drop-shadow-[1px_1px_0px_#fff] uppercase">
                UNEXPECTED SYSTEM FAULT
              </h2>
              <div className="text-[9px] md:text-[10px] text-black leading-relaxed font-bold flex flex-col gap-2 max-w-md text-left mx-auto uppercase">
                <p className="flex items-start gap-2">
                  <span className="text-[#C85A28] shrink-0">►</span>
                  <span>
                    The portal encountered an unexpected execution error while rendering this stage.
                  </span>
                </p>
                {error.digest && (
                  <p className="text-[8px] text-black/60 font-mono">
                    ERROR DIGEST: {error.digest}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex w-full flex-col sm:flex-row gap-4 mt-2">
              <button
                onClick={handleReset}
                className="flex-1 bg-[#52AE26] hover:bg-[#72F418] text-white border-4 border-black py-4 px-4 text-[9px] md:text-[10px] font-bold tracking-widest transition-transform active:translate-y-1 flex items-center justify-center gap-2 cursor-pointer shadow-[4px_4px_0px_0px_#000]"
              >
                TRY AGAIN
              </button>

              <button
                onClick={() => handleNavigate("/recruitments")}
                className="flex-1 bg-white hover:bg-slate-100 text-black border-4 border-black py-4 px-4 text-[9px] md:text-[10px] font-bold tracking-widest transition-transform active:translate-y-1 flex items-center justify-center gap-2 cursor-pointer shadow-[4px_4px_0px_0px_#000]"
              >
                RECRUITMENT MAP
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

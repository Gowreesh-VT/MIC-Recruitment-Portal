"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Press_Start_2P } from "next/font/google";
import RetroLoader from "@/components/RetroLoader";
import MobileBackground from "@/components/MobileBackground";
import MicLogo from "@/components/MicLogo";
import CountdownTimer from "@/components/CountdownTimer";
import { playRetroSound } from "@/lib/audio";

const pressStart = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start-2p",
});

interface PageConfig {
  success: boolean;
  title: string;
  welcomeTitle: string;
  bulletPoints: string[];
  cycleOpen: boolean;
  footerBlinkText: string;
  marqueeText: string;
  cycle?: {
    isOpen: boolean;
    startAt?: string;
    endAt?: string;
  };
  countdownSettings?: {
    enabled: boolean;
    target: string | null;
    title: string;
  };
}

function RetroPipe({ height, top, left, isTop }: { height: number; top: string; left: string; isTop: boolean }) {
  const bodyHeight = Math.max(0, height - 24);
  const gradientStyle = {
    background: "linear-gradient(90deg, #b8f848 0%, #b8f848 14%, #73bf2e 14%, #73bf2e 28%, #52c017 28%, #52c017 68%, #38800e 68%, #38800e 84%, #204803 84%, #204803 100%)",
  };

  return (
    <div
      className="absolute select-none pointer-events-none z-30 w-[52px] flex flex-col items-center"
      style={{ left, top, height: `${height}px` }}
    >
      {isTop ? (
        <>
          <div
            className="w-[46px] border-x-[3px] border-t-[3px] border-black box-border"
            style={{ height: `${bodyHeight}px`, ...gradientStyle }}
          />
          <div
            className="w-[52px] h-[24px] border-[3px] border-black box-border shadow-[inset_0_-3px_0_0_rgba(0,0,0,0.4)] flex-shrink-0"
            style={gradientStyle}
          />
        </>
      ) : (
        <>
          <div
            className="w-[52px] h-[24px] border-[3px] border-black box-border shadow-[inset_0_3px_0_0_rgba(255,255,255,0.4)] flex-shrink-0"
            style={gradientStyle}
          />
          <div
            className="w-[46px] border-x-[3px] border-b-[3px] border-black box-border"
            style={{ height: `${bodyHeight}px`, ...gradientStyle }}
          />
        </>
      )}
    </div>
  );
}

// Arrow Signboard (wooden, left or right pointing)
function MobileArrowSign({ label, direction, onClick, disabled }: { label: string, direction: "left"|"right", onClick: ()=>void, disabled?: boolean }) {
  const isLeft = direction === "left";
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick} 
      className={`relative w-[155px] sm:w-[170px] h-[48px] flex items-center justify-center select-none focus:outline-none ${
        disabled
          ? "opacity-60 cursor-not-allowed"
          : "cursor-pointer hover:brightness-110 active:scale-95 transition-transform"
      }`}
      aria-label={label}
    >
      {/* Crisp shadow (offset) */}
      <svg className="absolute inset-0 w-full h-full" style={{ transform: "translate(4px, 4px)" }} preserveAspectRatio="none" viewBox="0 0 155 48">
        {isLeft ? (
          <polygon points="26,2 153,2 153,46 26,46 2,24" fill="rgba(0,0,0,0.35)" />
        ) : (
          <polygon points="2,2 129,2 153,24 129,46 2,46" fill="rgba(0,0,0,0.35)" />
        )}
      </svg>
      {/* Foreground Arrow */}
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 155 48">
        {isLeft ? (
          <polygon points="26,2 153,2 153,46 26,46 2,24" fill="#C8862A" stroke="#2A1A00" strokeWidth="3" strokeLinejoin="round" />
        ) : (
          <polygon points="2,2 129,2 153,24 129,46 2,46" fill="#C8862A" stroke="#2A1A00" strokeWidth="3" strokeLinejoin="round" />
        )}
      </svg>
      <span className={`relative z-10 text-black font-bold text-[13px] sm:text-[14px] uppercase tracking-wider ${isLeft ? "pl-[20px]" : "pr-[20px]"}`}>
        {label}
      </span>
    </button>
  );
}

function MobileHorizontalPipe({ side }: { side: "left"|"right" }) {
  const isLeft = side === "left";
  return (
    <div className="flex items-center w-full">
      {isLeft ? (
        <>
          <div className="h-[36px] flex-grow bg-[#52AE26] border-y-[3px] border-black relative border-l-0">
             <div className="absolute top-[2px] left-0 w-full h-[5px] bg-[#72F418] opacity-80" />
          </div>
          <div className="h-[46px] w-[20px] shrink-0 bg-[#52AE26] border-[3px] border-black rounded-[2px] relative z-10 ml-[-2px]">
             <div className="absolute top-[2px] left-0 w-full h-[5px] bg-[#72F418] opacity-80" />
          </div>
        </>
      ) : (
        <>
          <div className="h-[46px] w-[20px] shrink-0 bg-[#52AE26] border-[3px] border-black rounded-[2px] relative z-10 mr-[-2px]">
             <div className="absolute top-[2px] left-0 w-full h-[5px] bg-[#72F418] opacity-80" />
          </div>
          <div className="h-[36px] flex-grow bg-[#52AE26] border-y-[3px] border-black relative border-r-0">
             <div className="absolute top-[2px] left-0 w-full h-[5px] bg-[#72F418] opacity-80" />
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Mobile Home Layout — Polished layout & touch targets
// ─────────────────────────────────────────────────────────────────────────────
function MobileHomePage({
  pageConfig,
  cycleOpen,
  setCycleOpen,
  isLoggedIn,
  playRetroSound,
}: {
  pageConfig: PageConfig | null;
  cycleOpen: boolean;
  setCycleOpen: (v: boolean) => void;
  isLoggedIn: boolean;
  playRetroSound: (type: "select" | "open") => void;
}) {
  const router = useRouter();

  const handleQuestNav = (type: "tech" | "non-tech") => {
    playRetroSound("open");
    router.push(`/recruitments?view=${type}`);
  };

  return (
    <MobileBackground>
      {/* ── Top bar: Logo + FAQS + PROFILE/SIGN IN ── */}
      <div className="relative z-20 flex items-center justify-between px-4 pt-4 flex-shrink-0">
        <img
          src="/mic_logo_pixel.png"
          alt="MIC Logo"
          className="pixelated w-[56px] h-[40px] drop-shadow-[2px_2px_0px_rgba(0,0,0,0.5)] cursor-pointer active:scale-95 transition-transform"
          onClick={() => { playRetroSound("select"); router.push("/"); }}
        />
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => { playRetroSound("open"); router.push("/faqs?from=/"); }}
            className="bg-[#7CA922] hover:bg-[#8CB932] text-black text-[10px] font-bold py-2 px-3.5 border-4 border-black uppercase tracking-wider cursor-pointer active:translate-y-0.5 transition-transform"
            style={{ boxShadow: "3px 3px 0px 0px #000" }}
          >
            FAQS
          </button>
          <button
            onClick={() => { playRetroSound("open"); router.push(isLoggedIn ? "/profile" : "/login?callbackUrl=/"); }}
            className="bg-[#1093EB] hover:bg-[#209FFC] text-white text-[10px] font-bold py-2 px-3.5 border-4 border-black uppercase tracking-wider cursor-pointer active:translate-y-0.5 transition-transform"
            style={{ boxShadow: "3px 3px 0px 0px #000" }}
          >
            {isLoggedIn ? "PROFILE" : "SIGN IN"}
          </button>
        </div>
      </div>

      {/* ── Title + subtitle ── */}
      <div className="relative z-10 px-4 pt-3 pb-1 flex-shrink-0 text-center">
        <div className="inline-block bg-[#FFE4D6] border-4 border-black px-4 py-2 rounded-[8px] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]">
          <h1 className="text-[#A93710] font-bold leading-tight uppercase tracking-wider text-[18px] sm:text-[22px] drop-shadow-[1px_1px_0px_#fff]">
            Recruitments 2026-27
          </h1>
          <p className="text-black font-bold uppercase tracking-wider text-[8.5px] sm:text-[9.5px] mt-1">
            {pageConfig?.welcomeTitle || "CHOOSE THE QUEST SUITS YOU THE MOST"}
          </p>
        </div>
      </div>

      {/* Countdown Timer */}
      {pageConfig?.countdownSettings?.enabled && pageConfig?.countdownSettings?.target && (
        <div className="relative z-10 px-4 mt-3 flex-shrink-0">
          <CountdownTimer
            targetDate={pageConfig.countdownSettings.target}
            title={pageConfig.countdownSettings.title}
          />
        </div>
      )}

      {/* ── Interactive Stage Content ── */}
      <div className="relative z-10 flex w-full flex-grow items-center justify-between mt-4 mb-4 px-1">
        
        {/* Left Side (Non Tech Arrow + Pipe) */}
        <div className="flex flex-col items-end w-[155px] sm:w-[170px] gap-2">
           <MobileArrowSign 
             label="Non Tech" 
             direction="left" 
             onClick={() => handleQuestNav("non-tech")} 
           />
           <MobileHorizontalPipe side="left" />
        </div>
 
        {/* Center: Bird Mascot */}
        <div className="flex flex-col items-center justify-center shrink-0 z-30 mx-1">
          <img 
            src="/flappy_bird.svg" 
            alt="Bird"
            className="w-[48px] h-[48px] animate-mobile-bird drop-shadow-[2px_2px_0px_rgba(0,0,0,0.4)]" 
          />
          <span className="text-[7.5px] font-bold text-black bg-[#FFE4D6] border-2 border-black px-1.5 py-0.5 rounded-[3px] mt-1 tracking-wider uppercase shadow-[1px_1px_0px_#000]">
            SELECT
          </span>
        </div>
 
        {/* Right Side (Tech Arrow + Pipe) */}
        <div className="flex flex-col items-start w-[155px] sm:w-[170px] gap-2">
           <MobileArrowSign 
             label="Tech" 
             direction="right" 
             onClick={() => handleQuestNav("tech")} 
           />
           <MobileHorizontalPipe side="right" />
        </div>
      </div>
    </MobileBackground>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Desktop Home Layout (original, unchanged)
// ─────────────────────────────────────────────────────────────────────────────
function DesktopHomePage({
  pageConfig,
  cycleOpen,
  setCycleOpen,
  isLoggedIn,
  scale,
  mounted,
  playRetroSound,
}: {
  pageConfig: PageConfig | null;
  cycleOpen: boolean;
  setCycleOpen: (v: boolean) => void;
  isLoggedIn: boolean;
  scale: number;
  mounted: boolean;
  playRetroSound: (type: "select" | "open") => void;
}) {
  const router = useRouter();

  return (
    <div className={`${pressStart.variable} font-press-start w-full h-[100dvh] overflow-hidden select-none bg-[#DD9955] relative flex justify-center items-center`}>
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 transition-opacity duration-150"
        style={{
          width: "2865px",
          height: "1024px",
          transform: `scale(${scale})`,
          transformOrigin: "top center",
          opacity: mounted ? 1 : 0,
        }}
      >
        <div className="w-[2865px] h-[1024px] absolute top-0 left-0 bg-[linear-gradient(180deg,#1188EE_0%,#0E8AEA_25%,#1093EB_35%,#1197EC_46%,#16B6F4_52%,#10CBF1_56%,#0FC6F1_60%,#15DEF0_65%,#15DEF0_81%)] overflow-hidden">
          <img src="/pixel_cloud_small.svg" alt="Cloud" className="absolute top-[300px] left-[1060px] w-[280px] opacity-85 animate-retro-float pixelated select-none pointer-events-none" style={{ animationDelay: "0s" }} />
          <img src="/pixel_cloud_small.svg" alt="Cloud" className="absolute top-[140px] left-[-40px] w-[320px] opacity-80 animate-retro-float pixelated select-none pointer-events-none" style={{ animationDelay: "1s" }} />
          <img src="/pixel_cloud_small.svg" alt="Cloud" className="absolute top-[39px] left-[1167px] w-[360px] opacity-90 animate-retro-float pixelated select-none pointer-events-none" style={{ animationDelay: "0.5s" }} />
          <img src="/pixel_cloud_small.svg" alt="Cloud" className="absolute top-[333px] left-[2509px] w-[260px] opacity-75 animate-retro-float pixelated select-none pointer-events-none" style={{ animationDelay: "1.8s" }} />
          <img src="/pixel_cloud_small.svg" alt="Cloud" className="absolute top-[140px] left-[1312px] w-[320px] opacity-85 animate-retro-float pixelated select-none pointer-events-none" style={{ animationDelay: "2.3s" }} />
          <img src="/pixel_cloud_small.svg" alt="Cloud" className="absolute top-[39px] left-[2519px] w-[360px] opacity-90 animate-retro-float pixelated select-none pointer-events-none" style={{ animationDelay: "0.2s" }} />
          <img src="/pixel_cloud_small.svg" alt="Cloud" className="absolute top-[220px] left-[400px] w-[200px] opacity-70 animate-retro-float pixelated select-none pointer-events-none" style={{ animationDelay: "1.2s" }} />
          <img src="/pixel_cloud_small.svg" alt="Cloud" className="absolute top-[180px] left-[1800px] w-[240px] opacity-60 animate-retro-float pixelated select-none pointer-events-none" style={{ animationDelay: "0.8s" }} />
          <img src="/pixel_cloud_small.svg" alt="Cloud" className="absolute top-[280px] left-[2100px] w-[180px] opacity-80 animate-retro-float pixelated select-none pointer-events-none" style={{ animationDelay: "1.5s" }} />

          <img src="/pixel_cloud_large.svg" alt="Skyline" loading="eager" fetchPriority="high" className="absolute top-[566px] left-0 w-[1437px] h-[458px] object-cover opacity-100 pointer-events-none select-none pixelated" />
          <img src="/pixel_cloud_large.svg" alt="Skyline" loading="eager" fetchPriority="high" className="absolute top-[566px] left-[1435px] w-[1437px] h-[458px] object-cover opacity-100 pointer-events-none select-none pixelated" />

          {Array.from({ length: 12 }).map((_, idx) => (
            <img key={idx} src="/city_skyline.svg" alt="Skyline Block" className="absolute top-[631px] w-[246px] h-[249px] opacity-75 pointer-events-none select-none pixelated" style={{ left: `${idx * 245}px` }} />
          ))}

          {Array.from({ length: 3 }).map((_, idx) => (
            <img
              key={`bush-${idx}`}
              src="/bushes_pixel.svg"
              alt={`Bushes ${idx}`}
              className="absolute top-[739px] w-[1456px] h-[200px] z-4 pointer-events-none select-none pixelated"
              style={{ left: `${idx * 1409}px` }}
            />
          ))}

          <RetroPipe left="900px" top="-5px" height={250} isTop={true} />
          <RetroPipe left="1900px" top="-5px" height={250} isTop={true} />

          <div className="absolute z-40 animate-pixel-slide-up" style={{ top: "140px", left: "860px", width: "1132px" }}>
            <div
              className="bg-[#FFE4D6] rounded-[10px] border-[6px] border-black flex flex-col items-center p-4 relative"
              style={{ boxShadow: "16px 16px 0px 0px rgba(0,0,0,0.4)" }}
            >
              {/* Header banner */}
              <div className="w-full bg-[#C85A28] border-4 border-black rounded-[6px] py-5 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiNmZmYiLz48L3N2Zz4=')] [background-size:10px_10px]" />
                <span className="text-white text-[20px] font-bold tracking-widest relative z-10 drop-shadow-[3px_3px_0px_#000] uppercase">
                  {pageConfig?.title || "░ MIC RECRUITMENT 2026-27 ░"}
                </span>
              </div>

              {/* Body */}
              <div className="w-full px-8 py-7 flex flex-col items-center gap-5 bg-[#FFDED6] mt-3 border-4 border-black rounded-[6px]">

                {/* Welcome title */}
                <h2 className="text-[17px] font-bold text-[#A93710] drop-shadow-[2px_2px_0px_#fff] uppercase tracking-widest text-center">
                  {pageConfig?.welcomeTitle || "★ WELCOME TO THE QUEST ★"}
                </h2>

                {/* Bullet points */}
                <div className="flex flex-col gap-2.5 w-full max-w-[700px]">
                  {(pageConfig?.bulletPoints || [
                    "9 DEPARTMENTS. 100 SEATS.",
                    "ONLY THE BEST COMPLETE THE QUEST.",
                    "ARE YOU READY, PLAYER?",
                  ]).map((bullet, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 bg-[#FFE4D6] border-2 border-black rounded-[4px] px-4 py-2.5"
                      style={{ boxShadow: "3px 3px 0px 0px rgba(0,0,0,0.18)" }}
                    >
                      <span className="text-[#C85A28] text-[16px] shrink-0">▸</span>
                      <span className="text-[12px] text-black font-bold uppercase tracking-wide">{bullet}</span>
                    </div>
                  ))}
                </div>

                {/* Countdown Timer */}
                {pageConfig?.countdownSettings?.enabled && pageConfig?.countdownSettings?.target && (
                  <div className="w-full max-w-[700px] font-sans">
                    <CountdownTimer
                      targetDate={pageConfig.countdownSettings.target}
                      title={pageConfig.countdownSettings.title}
                      className="!max-w-none !mx-0"
                    />
                  </div>
                )}

                {/* CTA Buttons */}
                <div className="flex w-full max-w-[700px] gap-5 mt-1">
                  {cycleOpen ? (
                    <button
                      onClick={() => {
                        playRetroSound("select");
                        router.push(isLoggedIn ? "/recruitments" : "/login");
                      }}
                      className="w-full bg-[#52AE26] hover:bg-[#62BE36] text-white border-4 border-black py-4 px-6 text-[14px] font-bold tracking-widest transition-transform hover:-translate-y-0.5 active:translate-y-1 flex items-center justify-center gap-2 group cursor-pointer"
                      style={{ boxShadow: "5px 5px 0px 0px #000" }}
                    >
                      START QUEST <span className="group-hover:translate-x-1 transition-transform">►</span>
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full bg-slate-300 text-slate-500 border-4 border-black py-4 px-6 text-[14px] font-bold tracking-widest flex items-center justify-center cursor-not-allowed opacity-80"
                      style={{ boxShadow: "5px 5px 0px 0px #555" }}
                    >
                      QUEST CLOSED ✖
                    </button>
                  )}
                </div>

                <div className="mt-8 pt-8 border-t-4 border-black/10 w-full text-center">
                  <span className="text-[12px] text-[#A93710] font-bold animate-retro-blink uppercase tracking-widest">
                    {pageConfig?.footerBlinkText || "[ PRESS BUTTON TO BEGIN ]"}
                  </span>
                </div>
              </div>

              <div className="absolute top-2 left-2 w-1.5 h-1.5 bg-black" />
              <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-black" />
              <div className="absolute left-2 bottom-2 w-1.5 h-1.5 bg-black" />
              <div className="absolute right-2 bottom-2 w-1.5 h-1.5 bg-black" />
            </div>
          </div>

          <div className="absolute top-[925px] left-0 w-full h-[300px] z-25 flex flex-col select-none pointer-events-none">
            <div className="w-full h-5 bg-[#52AE26] border-t-4 border-b-4 border-black flex flex-col justify-between shrink-0">
              <div className="w-full h-[3px] bg-[#72F418]" />
              <div className="w-full h-[3px] bg-[#3FA70E]" />
            </div>
            <div className="w-full flex-grow bg-[#DD9955] border-b-4 border-black relative overflow-hidden flex items-start pt-3">
              <div className="flex whitespace-nowrap animate-marquee">
                <span className="inline-flex items-center shrink-0 text-[24px] text-[#CC7700] tracking-wider uppercase font-bold">
                  {Array(6).fill(pageConfig?.marqueeText || "MICROSOFT INNOVATIONS CLUB TENURE 2026-2027").map((text, idx) => (
                    <React.Fragment key={idx}>
                      <span>{text}</span>
                      <img src="/mic_logo_pixel.png" alt="MIC" className="w-8 h-8 md:w-10 md:h-10 mx-8 shrink-0" />
                    </React.Fragment>
                  ))}
                </span>
                <span className="inline-flex items-center shrink-0 text-[24px] text-[#CC7700] tracking-wider uppercase font-bold">
                  {Array(6).fill(pageConfig?.marqueeText || "MICROSOFT INNOVATIONS CLUB TENURE 2026-2027").map((text, idx) => (
                    <React.Fragment key={idx}>
                      <span>{text}</span>
                      <img src="/mic_logo_pixel.png" alt="MIC" className="w-8 h-8 md:w-10 md:h-10 mx-8 shrink-0" />
                    </React.Fragment>
                  ))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <MicLogo />
      <div
        className="absolute top-8 right-8 z-30 flex items-center gap-3"
        style={{ transform: `scale(${scale})`, transformOrigin: "top right" }}
      >
        <button
          onClick={() => { playRetroSound("open"); router.push("/faqs?from=/"); }}
          className="bg-[#7CA922] hover:bg-[#8CB932] text-black text-[11px] font-bold py-2 px-5 border-4 border-black cursor-pointer uppercase tracking-wider transition-transform hover:-translate-y-0.5 active:translate-y-1"
          style={{ boxShadow: "4px 4px 0px 0px #000" }}
        >
          FAQS
        </button>
        <button
          onClick={() => { playRetroSound("open"); router.push(isLoggedIn ? "/profile" : "/login?callbackUrl=/"); }}
          className="bg-[#1093EB] hover:bg-[#20A3FB] text-white text-[11px] font-bold py-2 px-5 border-4 border-black cursor-pointer uppercase tracking-wider transition-transform hover:-translate-y-0.5 active:translate-y-1"
          style={{ boxShadow: "4px 4px 0px 0px #000" }}
        >
          {isLoggedIn ? "PROFILE" : "LOGIN"}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Export
// ─────────────────────────────────────────────────────────────────────────────
export default function Homepage() {
  const [scale, setScale] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [cycleOpen, setCycleOpen] = useState(true);
  const [pageConfig, setPageConfig] = useState<PageConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/pages/home").then((res) => res.json()),
      fetch("/api/auth/session").then((res) => (res.ok ? res.json() : null)),
    ])
      .then(([data, session]) => {
        if (data.success) {
          setPageConfig(data);
          setCycleOpen(data.cycleOpen);
        }
        setIsLoggedIn(!!session?.user);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== "undefined") {
        setIsMobile(window.innerWidth < 768);
        const heightScale = window.innerHeight / 1024;
        setScale(heightScale);
        setMounted(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);



  return (
    <div className={`${pressStart.variable} font-press-start`}>
      {isMobile ? (
        <MobileHomePage
          pageConfig={pageConfig}
          cycleOpen={cycleOpen}
          setCycleOpen={setCycleOpen}
          isLoggedIn={isLoggedIn}
          playRetroSound={playRetroSound}
        />
      ) : (
        <DesktopHomePage
          mounted={mounted}
          pageConfig={pageConfig}
          cycleOpen={cycleOpen}
          setCycleOpen={setCycleOpen}
          isLoggedIn={isLoggedIn}
          scale={scale}
          playRetroSound={playRetroSound}
        />
      )}
    </div>
  );
}

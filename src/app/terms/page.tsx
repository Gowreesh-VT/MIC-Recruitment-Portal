"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Press_Start_2P } from "next/font/google";
import MicLogo from "@/components/MicLogo";
import BackButton from "@/components/BackButton";
import { playRetroSound } from "@/lib/audio";
import { ShieldCheck, FileText, Scale, AlertOctagon, CheckCircle2 } from "lucide-react";

const pressStart = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start-2p",
});

export default function TermsPage() {
  const router = useRouter();

  const sections = [
    {
      icon: ShieldCheck,
      title: "1. ACADEMIC INTEGRITY & ORIGINALITY",
      content:
        "All code, designs, documentation, and task responses submitted during the recruitment process must be your own original work. Plagiarism, unauthorized copying from other applicants or external repositories without attribution, or submitting work generated entirely by third parties is strictly prohibited and will result in immediate disqualification.",
    },
    {
      icon: FileText,
      title: "2. SUBMISSION DEADLINES & MODIFICATIONS",
      content:
        "Submissions must be submitted prior to the announced stage deadline. You may edit your submission while the recruitment cycle remains open and your submission status is pending review. Submissions received after the deadline will not be evaluated.",
    },
    {
      icon: Scale,
      title: "3. EVALUATION & SELECTION DISCRETION",
      content:
        "Evaluations are conducted by the Microsoft Innovations Club domain review panels using standardized rubrics. Evaluation decisions, stage advancements, and final domain allocations made by the recruitment board are final.",
    },
    {
      icon: AlertOctagon,
      title: "4. CONFIDENTIALITY OF TASK MATERIAL",
      content:
        "Task statements, problem sets, dataset files, and recruitment prompt assets provided during Stage 2 are intended exclusively for your evaluation. Distributing or sharing task materials publicly or with competing candidates during the recruitment process is disallowed.",
    },
    {
      icon: CheckCircle2,
      title: "5. CODE OF CONDUCT",
      content:
        "Applicants are expected to maintain professional and respectful communication with domain leads, panelists, and fellow candidates across all official MIC communication channels, interviews, and submission portals.",
    },
  ];

  return (
    <main
      className={`${pressStart.variable} font-press-start relative min-h-[100dvh] w-full flex flex-col items-center justify-center p-4 select-none overflow-hidden bg-[linear-gradient(180deg,#1188EE_0%,#0E8AEA_25%,#1093EB_35%,#1197EC_46%,#16B6F4_52%,#10CBF1_56%,#0FC6F1_60%,#15DEF0_65%,#15DEF0_81%)]`}
    >
      {/* ================= BACKGROUND SKY & CLOUDS ================= */}
      <img
        src="/pixel_cloud_small.svg"
        alt="Cloud"
        className="absolute top-[12%] left-[6%] w-[180px] md:w-[260px] opacity-90 animate-retro-float pixelated pointer-events-none z-0"
      />
      <img
        src="/pixel_cloud_small.svg"
        alt="Cloud"
        className="absolute top-[18%] right-[8%] w-[200px] md:w-[280px] opacity-85 animate-retro-float pixelated pointer-events-none z-0"
        style={{ animationDelay: "1s" }}
      />
      <img
        src="/pixel_cloud_small.svg"
        alt="Cloud"
        className="absolute top-[42%] right-[12%] w-[160px] md:w-[240px] opacity-80 animate-retro-float pixelated pointer-events-none z-0"
        style={{ animationDelay: "2s" }}
      />
      <img
        src="/pixel_cloud_small.svg"
        alt="Cloud"
        className="absolute top-[35%] left-[24%] w-[150px] md:w-[220px] opacity-75 animate-retro-float pixelated pointer-events-none z-0"
        style={{ animationDelay: "0.7s" }}
      />

      {/* ================= HOVERING FLAPPY BIRD ================= */}
      <div className="absolute top-[46%] left-[7%] md:left-[10%] z-10 animate-retro-float pointer-events-none">
        <img
          src="/flappy_bird.svg"
          alt="Flappy Bird"
          className="w-[56px] h-[56px] md:w-[72px] md:h-[72px] pixelated drop-shadow-[3px_3px_0px_rgba(0,0,0,0.3)]"
        />
      </div>

      {/* ================= CITY BUILDINGS & BUSHES ALONG HORIZON ================= */}
      <div className="absolute bottom-[60px] md:bottom-[76px] left-0 w-full h-[280px] md:h-[360px] overflow-hidden pointer-events-none z-0 flex items-end">
        <div className="absolute bottom-0 left-0 flex w-[3000px] opacity-100">
          <img
            src="/pixel_cloud_large.svg"
            alt="Skyline Back Left"
            className="w-[1437px] h-[280px] md:h-[360px] object-cover object-top pixelated shrink-0"
          />
          <img
            src="/pixel_cloud_large.svg"
            alt="Skyline Back Right"
            className="w-[1510px] h-[280px] md:h-[360px] object-cover object-top pixelated shrink-0"
          />
        </div>
        <div className="absolute bottom-0 left-0 flex w-[3000px] opacity-80 z-1">
          {Array.from({ length: 14 }).map((_, idx) => (
            <img
              key={`city-${idx}`}
              src="/city_skyline.svg"
              alt="City Block"
              className="w-[246px] h-[210px] md:h-[249px] object-cover pixelated shrink-0"
            />
          ))}
        </div>
        <div className="absolute bottom-0 left-0 flex w-[3000px] z-1">
          <img
            src="/bushes_pixel.svg"
            alt="Bushes"
            className="w-[1456px] h-[120px] md:h-[160px] object-cover pixelated shrink-0 opacity-95"
          />
          <img
            src="/bushes_pixel.svg"
            alt="Bushes Right"
            className="w-[1456px] h-[120px] md:h-[160px] object-cover pixelated shrink-0 opacity-95"
          />
        </div>
      </div>

      {/* ================= SCROLLING SOIL GROUND PLATFORM ================= */}
      <div className="absolute bottom-0 left-0 w-full h-[60px] md:h-[76px] z-10 flex flex-col select-none pointer-events-none">
        <div className="w-full h-4 md:h-5 bg-[#52AE26] border-t-4 border-b-4 border-black flex flex-col justify-between shrink-0">
          <div className="w-full h-[3px] bg-[#72F418]" />
          <div className="w-full h-[3px] bg-[#3FA70E]" />
        </div>
        <div className="w-full flex-grow bg-[#DD9955] border-b-4 border-black relative overflow-hidden flex items-center">
          <div className="flex whitespace-nowrap animate-marquee">
            <span className="inline-flex items-center shrink-0 text-[24px] text-[#CC7700] tracking-wider uppercase font-bold">
              {Array(6).fill("MICROSOFT INNOVATIONS CLUB TENURE 2026-2027").map((text, idx) => (
                <React.Fragment key={idx}>
                  <span>{text}</span>
                  <img src="/mic_logo_pixel.png" alt="MIC" className="w-8 h-8 md:w-10 md:h-10 mx-8 shrink-0" />
                </React.Fragment>
              ))}
            </span>
            <span className="inline-flex items-center shrink-0 text-[24px] text-[#CC7700] tracking-wider uppercase font-bold">
              {Array(6).fill("MICROSOFT INNOVATIONS CLUB TENURE 2026-2027").map((text, idx) => (
                <React.Fragment key={idx}>
                  <span>{text}</span>
                  <img src="/mic_logo_pixel.png" alt="MIC" className="w-8 h-8 md:w-10 md:h-10 mx-8 shrink-0" />
                </React.Fragment>
              ))}
            </span>
          </div>
        </div>
      </div>

      {/* ================= NAVIGATION CONTROLS ================= */}
      <MicLogo />
      <BackButton onClick={() => router.push("/recruitments")} />

      <button
        onClick={() => {
          playRetroSound("close");
          router.push("/recruitments");
        }}
        className="fixed top-6 right-6 md:right-10 z-50 cursor-pointer hover:scale-110 active:scale-95 transition-transform duration-100 flex items-center justify-center select-none"
        title="Close"
      >
        <img
          src="/Close_icon.svg"
          alt="Close"
          className="w-[40px] h-[38px] md:w-[46px] md:h-[44px] pixelated pointer-events-none"
        />
      </button>

      {/* ================= HANGING WOODEN SIGNBOARD ================= */}
      <div className="relative flex flex-col items-center w-full max-w-[800px] px-2 md:px-4 z-20 my-auto pb-12">
        <div
          className="absolute -top-[600px] left-[20%] w-[18px] h-[605px] pointer-events-none flex flex-col border-x-4 border-black bg-[#B87B21] z-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, #CC9339, #CC9339 8px, #B87B21 8px, #B87B21 16px)",
          }}
        />
        <div
          className="absolute -top-[600px] right-[20%] w-[18px] h-[605px] pointer-events-none flex flex-col border-x-4 border-black bg-[#B87B21] z-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, #CC9339, #CC9339 8px, #B87B21 8px, #B87B21 16px)",
          }}
        />

        <div
          className="w-full bg-[#C4872B] border-4 border-black p-5 md:p-8 relative rounded-sm flex flex-col z-10"
          style={{ boxShadow: "8px 8px 0px 0px rgba(0,0,0,0.65)" }}
        >
          <div className="absolute inset-1 border-t-4 border-l-4 border-[#E5A039] border-b-4 border-r-4 border-[#9E6517] pointer-events-none" />

          {/* Screws */}
          <div className="absolute top-3 left-3 w-3.5 h-3.5 rounded-full bg-[#D4D4D4] border-2 border-black shadow-inner flex items-center justify-center pointer-events-none z-10">
            <div className="w-1.5 h-0.5 bg-[#666] rotate-45" />
          </div>
          <div className="absolute top-3 right-3 w-3.5 h-3.5 rounded-full bg-[#D4D4D4] border-2 border-black shadow-inner flex items-center justify-center pointer-events-none z-10">
            <div className="w-1.5 h-0.5 bg-[#666] rotate-45" />
          </div>
          <div className="absolute bottom-3 left-3 w-3.5 h-3.5 rounded-full bg-[#D4D4D4] border-2 border-black shadow-inner flex items-center justify-center pointer-events-none z-10">
            <div className="w-1.5 h-0.5 bg-[#666] rotate-45" />
          </div>
          <div className="absolute bottom-3 right-3 w-3.5 h-3.5 rounded-full bg-[#D4D4D4] border-2 border-black shadow-inner flex items-center justify-center pointer-events-none z-10">
            <div className="w-1.5 h-0.5 bg-[#666] rotate-45" />
          </div>

          <h1 className="text-center font-press-start text-[#FFB59F] text-[18px] md:text-[22px] tracking-wider uppercase drop-shadow-[2px_2px_0px_rgba(0,0,0,0.5)] mt-2 mb-6 z-10">
            TERMS & CONDITIONS
          </h1>

          {/* Scrollable Terms Content Box */}
          <div className="w-full flex flex-col z-10 max-h-[55vh] overflow-y-auto pr-2 custom-scrollbar space-y-4 font-sans text-black">
            <div className="bg-[#FFF2E6] border-[3px] border-[#A05522] p-4 rounded-[8px]">
              <h2 className="text-[10px] font-press-start font-bold text-[#A05522] uppercase tracking-wide mb-1">
                ► MIC RECRUITMENT ASSESSMENT POLICY
              </h2>
              <p className="text-xs text-slate-800 font-medium leading-relaxed">
                By participating in the Microsoft Innovations Club recruitment cycle and submitting assessment tasks, you agree to abide by the guidelines outlined below.
              </p>
            </div>

            {sections.map((sec, idx) => {
              const Icon = sec.icon;
              return (
                <div
                  key={idx}
                  className="bg-white border-[3px] border-black p-4 rounded-[8px] space-y-2 shadow-[3px_3px_0px_0px_#000]"
                >
                  <div className="flex items-center gap-2 text-[#A05522]">
                    <Icon className="w-4 h-4 shrink-0" />
                    <h3 className="text-xs font-bold uppercase tracking-wider font-sans">
                      {sec.title}
                    </h3>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-800 font-medium pl-6">
                    {sec.content}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}

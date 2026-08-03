"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Press_Start_2P } from "next/font/google";
import DepartmentPopup, { DepartmentData } from "@/components/DepartmentPopup";
import RetroLoader from "@/components/RetroLoader";
import posthog from "posthog-js";
import MobileBackground from "@/components/MobileBackground";
import MicLogo from "@/components/MicLogo";
import CountdownTimer from "@/components/CountdownTimer";
import { playRetroSound } from "@/lib/audio";
import ApplicationProgressCard from "@/components/ApplicationProgressCard";
import ConfirmationModal from "@/components/ConfirmationModal";
import ChangeDepartmentModal from "@/components/ChangeDepartmentModal";
import ActiveDepartmentCard from "@/components/ActiveDepartmentCard";
import StageRoadmap from "@/components/StageRoadmap";
import { getCanonicalDeptSlug } from "@/lib/constants";

const pressStart = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start-2p",
});

const ROLE_TO_SLUG: Record<string, string> = {
  Development: "development",
  "Competitive Coding": "competitive-coding",
  "UI/UX": "ui-ux",
  "AI/ML": "ai-ml",
  "Cyber Security": "cyber-security",
  Design: "design",
  Management: "management",
  Entrepreneurship: "entrepreneurship",
  "Content & Media": "content-media",
  "Social Media": "content-media",
  Media: "content-media",
};

export function getDeptSlug(q: DepartmentData): string {
  if (q.slug) return getCanonicalDeptSlug(q.slug);
  if (q.role) return ROLE_TO_SLUG[q.role] ?? getCanonicalDeptSlug(q.role);
  return "";
}


interface QuestCardProps {
  title: string;
  desc: string;
  state: "available" | "selected" | "disabled";
  progressStatus?: string; // e.g. "in-progress", "passed", "pending"
  onSelect: () => void;
  onSelectDisabled?: () => void; // called when a disabled card is clicked (drop & switch)
}

function QuestCard({ title, desc, state, progressStatus, onSelect, onSelectDisabled }: QuestCardProps) {
  const isSelected = state === "selected";
  const isDisabled = state === "disabled";
  const hasDisabledAction = isDisabled && !!onSelectDisabled;

  return (
    <div
      onClick={isDisabled ? (hasDisabledAction ? onSelectDisabled : undefined) : onSelect}
      className={`w-[385px] h-[275px] flex flex-col items-start p-1.5 rounded-[10px] border-4 border-solid border-black relative shrink-0 select-none transition-all duration-150 ${isDisabled && !hasDisabledAction
          ? "bg-[#FFB59F]"
          : isDisabled && hasDisabledAction
            ? "bg-[#FFB59F] cursor-pointer hover:-translate-y-3 hover:scale-[1.02] active:translate-y-0 active:scale-[0.98]"
            : isSelected
              ? "bg-white cursor-pointer hover:-translate-y-3 hover:scale-[1.02] active:translate-y-0 active:scale-[0.98]"
              : "bg-[#FFB59F] cursor-pointer hover:-translate-y-3 hover:scale-[1.02] active:translate-y-0 active:scale-[0.98]"
        } group`}
      style={{ boxShadow: "6px 6px 0px 0px rgba(0,0,0,0.15)" }}
    >
      {/* Card Header Tag */}
      <div className={`flex flex-col items-center py-2.5 relative self-stretch w-full rounded-[6px] border-b-4 border-solid border-black ${isSelected ? "bg-[#E29A2B]" : "bg-[#A93710]"}`}>
        <div className="relative flex items-center justify-center w-fit text-white drop-shadow-[2px_2px_0px_#000] font-bold text-[14px] tracking-wider uppercase leading-none whitespace-nowrap">
          {title}
        </div>
      </div>

      {/* Inner White Box */}
      <div className={`flex-grow w-full p-2.5 rounded-b-[6px] flex items-center justify-center ${isSelected ? "bg-[#FFF4E6]" : "bg-[#FFDED6]"}`}>
        <div className={`w-full h-full ${isDisabled ? "bg-[#FFCDC0]" : "bg-white"} border-4 border-solid border-black p-3 flex flex-col items-center justify-center text-center gap-2`}>
          <p className={`text-[12.5px] font-bold tracking-wide leading-relaxed uppercase ${isDisabled ? "text-[#A93710] drop-shadow-[1px_1px_0px_#fff]" : "text-black"}`}>
            {isDisabled && hasDisabledAction ? "WANT TO SWITCH QUESTS? TAP TO DROP & CHOOSE THIS ONE" : isDisabled ? "YOU HAVE ALREADY APPLIED FOR A SIMILAR QUEST" : isSelected ? "WANNA RECHECK YOUR GEAR FOR THE QUEST?" : desc}
          </p>

          {isSelected && progressStatus && (
            <div className="flex items-center gap-2 mt-1">
              <span className="bg-[#E29A2B] text-black text-[10px] font-bold px-2.5 py-1 border-2 border-black uppercase tracking-wider">
                STATUS
              </span>
              <span className={`text-[10px] font-bold px-2.5 py-1 border-2 border-black uppercase tracking-wider shadow-[2px_2px_0px_#000] ${progressStatus === "passed"
                  ? "bg-[#52AE26] text-white"
                  : progressStatus === "rejected"
                    ? "bg-[#DC2626] text-white"
                    : progressStatus === "active" || progressStatus === "in-progress"
                      ? "bg-[#1093EB] text-white"
                      : "bg-[#FBBF24] text-black"
                }`}>
                {progressStatus.replace("-", " ")}
              </span>
            </div>
          )}

          {!isSelected && !isDisabled && (
            <div className="bg-[#E29A2B] text-black text-[9px] font-bold px-2.5 py-1 border-2 border-black uppercase tracking-wider shadow-[2px_2px_0px_#000] group-hover:bg-[#F0AD3D] transition-colors mt-0.5">
              CLICK HERE TO APPLY...
            </div>
          )}
        </div>
      </div>

      {/* Decorative Corner Pixels */}
      <div className="absolute top-1.5 left-1.5 w-1 h-1 bg-[#ffffff66]" />
      <div className="absolute top-1.5 left-1.5 w-1 h-1 bg-black" />
      <div className="absolute top-1.5 right-1.5 w-1 h-1 bg-black" />
      <div className="absolute left-1.5 bottom-1.5 w-1 h-1 bg-black" />
      <div className="absolute right-1.5 bottom-1.5 w-1 h-1 bg-black" />
    </div>
  );
}

function RetroPipe({ height, top, left, isTop }: { height: number; top: string; left: string; isTop: boolean }) {
  const bodyHeight = Math.max(0, height - 24);
  const gradientStyle = {
    background: "linear-gradient(90deg, #b8f848 0%, #b8f848 14%, #73bf2e 14%, #73bf2e 28%, #52c017 28%, #52c017 68%, #38800e 68%, #38800e 84%, #204803 84%, #204803 100%)",
  };

  return (
    <div
      className="absolute select-none pointer-events-none z-10 w-[52px] flex flex-col items-center"
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



// ─── Mobile Helper: Separate Triangle + Pill Signboard ───
function MobileQuestSign({
  label,
  direction,
  state,
  progressStatus,
  onClick,
  onClickDisabled,
}: {
  label: string;
  direction: "left" | "right";
  state: "available" | "selected" | "disabled";
  progressStatus?: string;
  onClick: () => void;
  onClickDisabled?: () => void;
}) {
  const isRight = direction === "right";
  const isSelected = state === "selected";
  const isDisabled = state === "disabled";
  const hasDisabledAction = isDisabled && !!onClickDisabled;

  const bgColor = isDisabled ? "bg-[#9C7A3A]" : isSelected ? "bg-[#F0C050]" : "bg-[#E8A830]";
  const triangleFill = isDisabled ? "#9C7A3A" : isSelected ? "#F0C050" : "#E8A830";

  return (
    <button
      onClick={isDisabled ? (hasDisabledAction ? onClickDisabled : undefined) : onClick}
      className={`relative flex items-center gap-1 select-none focus:outline-none flex-shrink-0 ${isDisabled && !hasDisabledAction
          ? "opacity-60 cursor-not-allowed"
          : isDisabled && hasDisabledAction
            ? "opacity-80 cursor-pointer active:scale-95 transition-transform"
            : "cursor-pointer active:scale-95 transition-transform"
        }`}
      aria-label={label}
    >
      {/* If pointing left, triangle is on the left */}
      {!isRight && (
        <svg width="24" height="28" viewBox="0 0 24 28" className="flex-shrink-0 drop-shadow-[2px_2px_0px_rgba(0,0,0,0.35)]">
          {/* Triangle pointing left */}
          <path d="M 2 14 L 22 2 L 22 26 Z" fill={triangleFill} stroke="#2A1A00" strokeWidth="3" strokeLinejoin="round" />
        </svg>
      )}

      {/* Pill shape */}
      <div className={`flex flex-col items-center justify-center px-3 sm:px-4 py-1.5 border-[3px] border-[#2A1A00] rounded-full ${bgColor} relative min-w-[160px] max-w-[210px] sm:min-w-[190px] min-h-[44px] h-auto gap-0.5`}
        style={{ boxShadow: "2px 2px 0px rgba(0,0,0,0.35)" }}>
        <span className="font-bold tracking-wider uppercase text-black text-[9px] sm:text-[10px] text-center leading-tight px-1 break-words">{label}</span>

        {!isSelected && !isDisabled && (
          <span className="text-[6.5px] sm:text-[7.5px] font-bold uppercase tracking-wider text-[#5C3A00]">
            CLICK HERE TO APPLY...
          </span>
        )}

        {/* Status badge */}
        {isSelected && progressStatus && (
          <div
            className={`absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[7px] font-bold uppercase tracking-wider ${progressStatus === "passed"
                ? "text-[#72F418]"
                : progressStatus === "rejected"
                  ? "text-[#FF4444]"
                  : progressStatus === "active" || progressStatus === "in-progress"
                    ? "text-[#1093EB]"
                    : "text-[#FBBF24]"
              }`}
            style={{ textShadow: "1px 1px 0 #000" }}
          >
            {progressStatus.replace("-", " ")}
          </div>
        )}
      </div>

      {/* If pointing right, triangle is on the right */}
      {isRight && (
        <svg width="24" height="28" viewBox="0 0 24 28" className="flex-shrink-0 drop-shadow-[2px_2px_0px_rgba(0,0,0,0.35)]">
          {/* Triangle pointing right */}
          <path d="M 22 14 L 2 2 L 2 26 Z" fill={triangleFill} stroke="#2A1A00" strokeWidth="3" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}

// ─── Mobile Helper: Horizontal pipe stub on left/right edge ──────────────────
function MobileEdgePipe({ side }: { side: "left" | "right" }) {
  const isLeft = side === "left";
  return (
    <div className={`flex items-center flex-shrink-0 ${isLeft ? "ml-[-10px]" : "mr-[-10px]"}`}>
      {isLeft ? (
        <>
          <div className="h-[36px] w-[24px] bg-[#52AE26] border-y-[3px] border-black relative">
            <div className="absolute top-0 right-0 w-[4px] h-full bg-[#72F418] opacity-50" />
          </div>
          <div className="h-[46px] w-[14px] bg-[#52AE26] border-[3px] border-black rounded-[2px] relative z-10">
            <div className="absolute top-0 right-1 w-[2px] h-full bg-[#72F418] opacity-80" />
          </div>
        </>
      ) : (
        <>
          <div className="h-[46px] w-[14px] bg-[#52AE26] border-[3px] border-black rounded-[2px] relative z-10">
            <div className="absolute top-0 left-1 w-[2px] h-full bg-[#72F418] opacity-80" />
          </div>
          <div className="h-[36px] w-[24px] bg-[#52AE26] border-y-[3px] border-black relative">
            <div className="absolute top-0 left-0 w-[4px] h-full bg-[#72F418] opacity-50" />
          </div>
        </>
      )}
    </div>
  );
}

// ─── Mobile Quests View (Tech or Non-Tech) ───────────────────────────────────
function MobileQuestsView({
  type,
  quests,
  appStatus,
  onQuestSelect,
  onChangeDepartment,
  playSound,
  router,
  isLoggedIn,
  countdownSettings,
}: {
  type: "tech" | "non-tech";
  quests: DepartmentData[];
  appStatus: ApplicationStatus | null;
  onQuestSelect: (q: DepartmentData, type: "tech" | "non-tech", slug: string) => void;
  onChangeDepartment?: () => void;
  playSound: (t: "select" | "jump" | "open" | "close" | "die" | "point") => void;
  router: ReturnType<typeof useRouter>;
  isLoggedIn?: boolean;
  countdownSettings?: { enabled: boolean; target: string | null; title: string; } | null;
}) {
  const title = type === "tech" ? "Technical Quests" : "Non Technical Quests";

  // Application status card info (first or second preference in this category)
  const appliedQuest =
    quests.find((q) => getDeptSlug(q) === appStatus?.firstPreference) ||
    quests.find((q) => getDeptSlug(q) === appStatus?.secondPreference);
  const appliedSlug = appliedQuest ? getDeptSlug(appliedQuest) : null;
  const isFirstPref = appliedSlug && appStatus?.firstPreference === appliedSlug;
  const appliedStatus = isFirstPref
    ? appStatus?.firstPrefProgress.status
    : appStatus?.secondPrefProgress.status;

  if (appliedQuest && appliedSlug && appliedStatus) {
    const isPending =
      appliedStatus !== "passed" &&
      appliedStatus !== "accepted" &&
      appliedStatus !== "rejected" &&
      appliedStatus !== "failed";

    const mobileHasSubmission = (isFirstPref
      ? (appStatus?.firstPrefProgress.stages || [])
      : (appStatus?.secondPrefProgress.stages || [])
    ).some((s: { submittedAt?: Date | string }) => !!s.submittedAt);
    return (
      <MobileBackground>
        {/* Top pipe */}
        <div className="relative z-10 flex flex-col items-center flex-shrink-0 mt-[-10px]">
          <div className="w-[52px] h-[60px] flex flex-col items-center pointer-events-none select-none">
            <div
              className="w-[46px] h-[36px] border-x-[3px] border-t-[3px] border-black box-border"
              style={{
                background: "linear-gradient(90deg, #b8f848 0%, #b8f848 14%, #73bf2e 14%, #73bf2e 28%, #52c017 28%, #52c017 68%, #38800e 68%, #38800e 84%, #204803 84%, #204803 100%)"
              }}
            />
            <div
              className="w-[52px] h-[24px] border-[3px] border-black box-border shadow-[inset_0_-3px_0_0_rgba(0,0,0,0.4)] flex-shrink-0"
              style={{
                background: "linear-gradient(90deg, #b8f848 0%, #b8f848 14%, #73bf2e 14%, #73bf2e 28%, #52c017 28%, #52c017 68%, #38800e 68%, #38800e 84%, #204803 84%, #204803 100%)"
              }}
            />
          </div>
          <img
            src="/flappy_bird.svg"
            alt="Flappy Bird"
            className="w-[44px] h-[44px] pixelated animate-mobile-bird drop-shadow-[2px_2px_0px_rgba(0,0,0,0.3)] mt-1"
          />
        </div>

        {/* Top bar */}
        <div className="absolute top-0 left-0 w-full z-20 flex items-center justify-between px-3 pt-3 pointer-events-none">
          <div className="flex items-center gap-2 pointer-events-auto">
            <img
              src="/mic_logo_pixel.png"
              alt="MIC Logo"
              className="pixelated w-[52px] h-[37px] animate-retro-float-small drop-shadow-[2px_2px_0px_rgba(0,0,0,0.5)] cursor-pointer"
              onClick={() => { playSound("select"); router.push("/"); }}
            />
            <button
              onClick={() => { playSound("select"); router.push("/"); }}
              className="bg-[#E29A2B] hover:bg-[#F0AD3D] text-black text-[9px] font-bold py-1.5 px-2.5 border-4 border-black uppercase tracking-wider cursor-pointer active:translate-y-0.5 transition-transform"
              style={{ boxShadow: "3px 3px 0px 0px #000" }}
            >
              HOME
            </button>
          </div>
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={() => { playSound("open"); router.push("/faqs?from=/recruitments"); }}
              className="bg-[#7CA922] text-black text-[9px] font-bold py-1.5 px-3 border-4 border-black uppercase tracking-wider cursor-pointer"
              style={{ boxShadow: "3px 3px 0px 0px #000" }}
            >
              FAQS
            </button>
            <button
              onClick={() => { playSound("open"); router.push(isLoggedIn ? "/profile" : "/login?callbackUrl=/recruitments"); }}
              className="bg-[#1093EB] text-white text-[9px] font-bold py-1.5 px-3 border-4 border-black uppercase tracking-wider cursor-pointer"
              style={{ boxShadow: "3px 3px 0px 0px #000" }}
            >
              {isLoggedIn ? "PROFILE" : "SIGN IN"}
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="relative z-10 px-4 pt-1 pb-0 flex-shrink-0 text-center">
          <h1 className="text-black font-bold leading-tight" style={{ fontSize: "clamp(20px, 6vw, 26px)" }}>
            {title}
          </h1>
        </div>

        {/* Main Content: Active Department Card + Stage Roadmap */}
        <div className="relative z-10 flex flex-col items-center gap-2 flex-grow w-full py-2 px-3 overflow-y-auto">
          <ActiveDepartmentCard
            deptTitle={appliedQuest.title}
            deptSlug={appliedSlug}
            statusText={appliedStatus}
            isStage2Pending={isPending}
            hasSubmission={mobileHasSubmission}
            onEditForm={() => router.push(`/apply/${appliedSlug}/quest-1`)}
            onChangeDepartment={() => {
              if (onChangeDepartment) {
                onChangeDepartment();
              } else {
                onQuestSelect(appliedQuest, type, appliedSlug);
              }
            }}
          />

          <StageRoadmap
            stage1Submitted={mobileHasSubmission}
            stage2Status={appliedStatus as "pending" | "accepted" | "rejected" | "passed" | "failed"}
            stage3Unlocked={appliedStatus === "passed" || appliedStatus === "accepted"}
            isVertical={true}
          />
        </div>
      </MobileBackground>
    );
  }

  return (
    <MobileBackground>
      {/* Top pipe */}
      <div className="relative z-10 flex flex-col items-center flex-shrink-0 mt-[-10px]">
        <div className="w-[52px] h-[60px] flex flex-col items-center pointer-events-none select-none">
          <div
            className="w-[46px] h-[36px] border-x-[3px] border-t-[3px] border-black box-border"
            style={{
              background: "linear-gradient(90deg, #b8f848 0%, #b8f848 14%, #73bf2e 14%, #73bf2e 28%, #52c017 28%, #52c017 68%, #38800e 68%, #38800e 84%, #204803 84%, #204803 100%)"
            }}
          />
          <div
            className="w-[52px] h-[24px] border-[3px] border-black box-border shadow-[inset_0_-3px_0_0_rgba(0,0,0,0.4)] flex-shrink-0"
            style={{
              background: "linear-gradient(90deg, #b8f848 0%, #b8f848 14%, #73bf2e 14%, #73bf2e 28%, #52c017 28%, #52c017 68%, #38800e 68%, #38800e 84%, #204803 84%, #204803 100%)"
            }}
          />
        </div>
        <img
          src="/flappy_bird.svg"
          alt="Flappy Bird"
          className="w-[44px] h-[44px] pixelated animate-mobile-bird drop-shadow-[2px_2px_0px_rgba(0,0,0,0.3)] mt-1"
        />
      </div>

      {/* Top bar */}
      <div className="absolute top-0 left-0 w-full z-20 flex items-center justify-between px-3 pt-3 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <img
            src="/mic_logo_pixel.png"
            alt="MIC Logo"
            className="pixelated w-[52px] h-[37px] animate-retro-float-small drop-shadow-[2px_2px_0px_rgba(0,0,0,0.5)] cursor-pointer"
            onClick={() => { playSound("select"); router.push("/"); }}
          />
          <button
            onClick={() => { playSound("select"); router.push("/"); }}
            className="bg-[#E29A2B] hover:bg-[#F0AD3D] text-black text-[9px] font-bold py-1.5 px-2.5 border-4 border-black uppercase tracking-wider cursor-pointer active:translate-y-0.5 transition-transform"
            style={{ boxShadow: "3px 3px 0px 0px #000" }}
          >
            HOME
          </button>
        </div>
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => { playSound("open"); router.push("/faqs?from=/recruitments"); }}
            className="bg-[#7CA922] text-black text-[9px] font-bold py-1.5 px-3 border-4 border-black uppercase tracking-wider cursor-pointer"
            style={{ boxShadow: "3px 3px 0px 0px #000" }}
          >
            FAQS
          </button>
          <button
            onClick={() => { playSound("open"); router.push(isLoggedIn ? "/profile" : "/login?callbackUrl=/recruitments"); }}
            className="bg-[#1093EB] text-white text-[9px] font-bold py-1.5 px-3 border-4 border-black uppercase tracking-wider cursor-pointer"
            style={{ boxShadow: "3px 3px 0px 0px #000" }}
          >
            {isLoggedIn ? "PROFILE" : "SIGN IN"}
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="relative z-10 px-4 pt-4 flex-shrink-0 text-center">
        <h1 className="text-black font-bold leading-tight" style={{ fontSize: "clamp(26px, 8vw, 36px)" }}>
          {title}
        </h1>
      </div>

      {/* Countdown Timer */}
      {countdownSettings?.enabled && countdownSettings?.target && (
        <div className="relative z-10 px-4 mt-2 flex-shrink-0">
          <CountdownTimer
            targetDate={countdownSettings.target}
            title={countdownSettings.title}
          />
        </div>
      )}

      {/* Quest signboards list */}
      <div className="relative z-10 flex flex-col justify-evenly flex-grow w-full py-4 min-h-[350px] overflow-x-hidden">
        {quests.map((q, idx) => {
          const slug = getDeptSlug(q);
          const isLeft = idx % 2 === 0;
          return (
            <div
              key={`mobile-quest-${idx}`}
              className={`flex items-center w-full ${isLeft ? "justify-start" : "justify-end"}`}
            >
              {isLeft ? (
                <>
                  <MobileEdgePipe side="left" />
                  <div className="z-10 ml-1">
                    <MobileQuestSign
                      label={q.title}
                      direction="left"
                      state="available"
                      onClick={() => onQuestSelect(q, type, slug)}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="z-10 mr-1">
                    <MobileQuestSign
                      label={q.title}
                      direction="right"
                      state="available"
                      onClick={() => onQuestSelect(q, type, slug)}
                    />
                  </div>
                  <MobileEdgePipe side="right" />
                </>
              )}
            </div>
          );
        })}
      </div>
    </MobileBackground>
  );
}

interface StageProgress {
  stage: number;
  result: "pending" | "passed" | "failed";
  submittedAt: string;
  adminNote?: string;
  responses: Record<string, unknown>;
}

interface ApplicationStatus {
  overallStatus: "in-progress" | "selected" | "rejected" | "waitlisted";
  firstPreference: string;
  firstPrefType: "tech" | "non-tech";
  secondPreference?: string;
  secondPrefType?: "tech" | "non-tech";
  firstPrefProgress: {
    status: "active" | "passed" | "rejected" | "pending" | "accepted" | "failed";
    currentStage: number;
    effectiveCurrentStage?: number;
    stageMasked?: boolean;
    stages: StageProgress[];
  };
  secondPrefProgress: {
    status: "active" | "passed" | "rejected" | "pending" | "accepted" | "failed";
    currentStage: number;
    effectiveCurrentStage?: number;
    stageMasked?: boolean;
    stages: StageProgress[];
  };
}




interface PipeData {
  left: number;
  top: number;
  height: number;
  isTop: boolean;
}

const STATIC_PIPES: PipeData[] = [
  // Top pipes
  { left: 169, top: -4, height: 391, isTop: true },
  { left: 746, top: -5, height: 468, isTop: true },
  { left: 1234, top: -5, height: 443, isTop: true },
  { left: 1723, top: 0, height: 391, isTop: true },
  { left: 2214, top: -1, height: 461, isTop: true },
  { left: 2705, top: -45, height: 461, isTop: true },
  // Bottom pipes
  { left: 196, top: 607, height: 301, isTop: false },
  { left: 909, top: 602, height: 301, isTop: false },
  { left: 1396, top: 545, height: 358, isTop: false },
  { left: 1885, top: 570, height: 333, isTop: false },
  { left: 2375, top: 602, height: 301, isTop: false },
];

export default function RecruitmentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isMobile, setIsMobile] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentData | null>(null);
  const [birdScore, setBirdScore] = useState(0);
  const [isDead, setIsDead] = useState(false);
  const [scale, setScale] = useState(0);
  const [mounted, setMounted] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const birdContainerRef = useRef<HTMLDivElement>(null);
  const birdSpriteRef = useRef<HTMLDivElement>(null);
  const lastScrollXRef = useRef(0);
  const latestScrollXRef = useRef(0);
  const latestScaleRef = useRef(1);
  const [isScrollingLeft, setIsScrollingLeft] = useState(false);

  // Flappy Bird Game State
  const [gameStatus, setGameStatus] = useState<"idle" | "playing" | "dead">("idle");
  const gameStatusRef = useRef<"idle" | "playing" | "dead">("idle");
  const passedPipes = useRef<Set<number>>(new Set([169, 196])); // Ignore initial pipes passed at start
  const [dynamicPipes, setDynamicPipes] = useState<PipeData[]>(STATIC_PIPES);
  const currentPipesRef = useRef<PipeData[]>(STATIC_PIPES);
  const [canvasWidth, setCanvasWidth] = useState(2865);
  const canvasWidthRef = useRef(2865);
  const targetScrollXRef = useRef(0);
  const isKeyScrollingRef = useRef(false);

  // Instructions Popup State
  const [showInstructions, setShowInstructions] = useState(false);
  const showInstructionsRef = useRef(false);

  const updateShowInstructions = (val: boolean) => {
    setShowInstructions(val);
    showInstructionsRef.current = val;
  };

  const closeInstructions = () => {
    updateShowInstructions(false);
    sessionStorage.setItem("hasShownInstructions", "true");
  };

  const updateGameStatus = (status: "idle" | "playing" | "dead") => {
    setGameStatus(status);
    gameStatusRef.current = status;
    if (status === "playing") {
      setIsScrollingLeft(false);
    }
  };

  const resetGame = (startPlaying = false) => {
    const p = birdPhysicsRef.current;
    p.currentX = 0;
    p.currentY = 0;
    p.velocityY = 0;
    p.isDead = false;
    p.rotation = 0;
    p.time = 0;
    setIsScrollingLeft(false);

    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 0;
    }
    latestScrollXRef.current = 0;
    targetScrollXRef.current = 0;
    isKeyScrollingRef.current = false;

    passedPipes.current = new Set([169, 196]); // Ignore initial pipes passed at start
    setBirdScore(0);
    setIsDead(false);
    setDynamicPipes(STATIC_PIPES);
    currentPipesRef.current = STATIC_PIPES;
    canvasWidthRef.current = 2865;
    setCanvasWidth(2865);

    if (startPlaying === true) {
      updateGameStatus("playing");
      p.velocityY = -10; // Smooth light upward jump arc
      playRetroSound("jump");
    } else {
      updateGameStatus("idle");
    }
  };

  const flapBird = () => {
    const p = birdPhysicsRef.current;
    if (p.isDead) return;

    if (gameStatusRef.current === "idle") {
      // If we are scrolled to the right (browsing cards), reset to start and play immediately
      if (latestScrollXRef.current > 10) {
        resetGame(true);
        return;
      }
      updateGameStatus("playing");
    }

    playRetroSound("jump");
    p.velocityY = -10; // Smooth light upward jump arc
  };

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (gameStatusRef.current === "dead") return;

    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest(".group") || target.closest("[role='dialog']") || selectedDepartment !== null) {
      return;
    }

    flapBird();
  };

  // Application State
  const [appStatus, setAppStatus] = useState<ApplicationStatus | null>(null);
  // Mobile view: "tech" | "non-tech" — read from ?view= query param
  const mobileView = (searchParams.get("view") as "tech" | "non-tech" | null) ?? "tech";
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [isLoadingApp, setIsLoadingApp] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [selectedDeptType, setSelectedDeptType] = useState<"tech" | "non-tech">("tech");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Drop & Switch Quest State
  // dropQuestTarget holds info about the quest the user wants to switch TO
  const [dropQuestTarget, setDropQuestTarget] = useState<{
    quest: DepartmentData;
    type: "tech" | "non-tech";
    slug: string;
    prefSlot: "first" | "second";
    currentQuestTitle: string;
  } | null>(null);

  // Backend design & dynamic configuration state
  const [techQuests, setTechQuests] = useState<DepartmentData[]>([]);
  const [nonTechQuests, setNonTechQuests] = useState<DepartmentData[]>([]);
  const [pageTitle, setPageTitle] = useState("Recruitments");
  const [pageSubtitle, setPageSubtitle] = useState("CHOOSE THE QUEST SUITS YOU THE MOST");
  const [countdownSettings, setCountdownSettings] = useState<{
    enabled: boolean;
    target: string | null;
    title: string;
  } | null>(null);

  const [showFinalPrompt, setShowFinalPrompt] = useState(false);
  const [isConfirmingFinal, setIsConfirmingFinal] = useState(false);

  // Change Department Confirmation Modal State
  const [changeCategoryModalTarget, setChangeCategoryModalTarget] = useState<"tech" | "non-tech" | null>(null);
  const [isSwitchingDepartment, setIsSwitchingDepartment] = useState(false);

  const handleOpenChangeCategoryModal = (category: "tech" | "non-tech") => {
    const isFirst = appStatus?.firstPrefType === category;
    const isSecond = appStatus?.secondPrefType === category;
    const progress = isFirst
      ? appStatus?.firstPrefProgress
      : isSecond
      ? appStatus?.secondPrefProgress
      : null;

    if (progress && (progress.status === "passed" || progress.status === "rejected")) {
      playRetroSound("die");
      setError("Changing department is disabled as shortlisting for this category has concluded.");
      return;
    }

    playRetroSound("die");
    setChangeCategoryModalTarget(category);
  };

  const handleSwitchDepartment = async (newDeptSlug: string) => {
    if (!changeCategoryModalTarget || !appStatus) return;
    const prefSlot = appStatus.firstPrefType === changeCategoryModalTarget ? "first" : "second";
    setIsSwitchingDepartment(true);
    try {
      const res = await fetch("/api/apply/switch-pref", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newDepartment: newDeptSlug, prefSlot }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        playRetroSound("jump");
        setChangeCategoryModalTarget(null);
        // Redirect directly to the new department's form so the user is
        // forced to complete it — status stays "active" until they submit.
        if (data.redirectTo) {
          router.push(data.redirectTo);
        } else {
          router.push(`/apply/${newDeptSlug}/quest-1`);
        }
      } else {
        setError(data.error || "Failed to switch department.");
      }
    } catch (err) {
      console.error("Failed to switch department:", err);
      setError("Network error. Please try again.");
    } finally {
      setIsSwitchingDepartment(false);
    }
  };

  const birdPhysicsRef = useRef({
    currentX: 0,
    currentY: 0,
    velocityY: 0,
    time: 0,
    isDead: false,
    rotation: 0,
  });

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const currentScrollX = e.currentTarget.scrollLeft;
    latestScrollXRef.current = currentScrollX;

    if (!isKeyScrollingRef.current) {
      targetScrollXRef.current = currentScrollX;
    } else {
      if (Math.abs(targetScrollXRef.current - currentScrollX) < 1) {
        isKeyScrollingRef.current = false;
      }
    }

    if (gameStatusRef.current === "playing") {
      setIsScrollingLeft(false);
    } else if (currentScrollX < lastScrollXRef.current - 1) {
      setIsScrollingLeft(true);
    } else if (currentScrollX > lastScrollXRef.current + 1) {
      setIsScrollingLeft(false);
    }
    lastScrollXRef.current = currentScrollX;
  };

  // Responsive Scaling Matrix to fit viewport height perfectly
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== "undefined") {
        setIsMobile(window.innerWidth < 768);
        // Scale to fit viewport height exactly so ground marquee rests at bottom with zero empty space
        const heightScale = window.innerHeight / 1024;
        latestScaleRef.current = heightScale;
        setScale(heightScale);
        setMounted(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchStatus = useCallback(async () => {
    setIsLoadingApp(true);
    setError(null);
    try {
      const [statusRes, configRes] = await Promise.all([
        fetch(`/api/apply/status?t=${Date.now()}`),
        fetch(`/api/pages/recruitments?t=${Date.now()}`)
      ]);

      if (statusRes.ok && configRes.ok) {
        const statusData = await statusRes.json();
        const configData = await configRes.json();

        setAppStatus(statusData.application);
        setUser(statusData.user);
        setTechQuests(configData.techQuests || []);
        setNonTechQuests(configData.nonTechQuests || []);
        setPageTitle(configData.title || "Recruitments");
        setPageSubtitle(configData.subtitle || "CHOOSE THE QUEST SUITS YOU THE MOST");
        setCountdownSettings(configData.countdownSettings || null);
        setIsLoggedIn(!!statusData.user);

      } else {
        if (statusRes.status === 429 || configRes.status === 429) {
          setError("API RATE LIMIT EXCEEDED. PLEASE WAIT A MOMENT AND TRY AGAIN.");
        } else {
          setError("FAILED TO CONNECT TO SERVER. PLEASE RETRY.");
        }
      }
    } catch (err) {
      console.error("Failed to fetch page configuration & status", err);
      setError("NETWORK ERROR. PLEASE CHECK YOUR CONNECTION.");
    } finally {
      setIsLoadingApp(false);
    }
  }, []);

  // Fetch application status
  useEffect(() => {
    let active = true;
    const init = async () => {
      if (active) {
        await fetchStatus();
      }
    };
    init();
    return () => {
      active = false;
    };
  }, [fetchStatus]);

  // Show instructions on first load of the page in the browser session
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasShown = sessionStorage.getItem("hasShownInstructions");
      if (!hasShown) {
        setTimeout(() => updateShowInstructions(true), 0);
      }
    }
  }, []);

  // Ultra-Smooth GPU Physics Engine for Flappy Bird (native 60/120fps camera follow & jump arcs)
  useEffect(() => {
    let animationFrameId: number;

    const renderLoop = () => {
      if (birdContainerRef.current && birdSpriteRef.current) {
        const p = birdPhysicsRef.current;
        p.time += 0.045;

        // 1. Auto-scroll horizontal container if playing, or lerp scroll if key scrolling
        if (gameStatusRef.current === "playing") {
          if (scrollContainerRef.current) {
            const currentScale = latestScaleRef.current || 1;
            // Scroll at 2.5px per frame (scaled)
            const newScrollLeft = scrollContainerRef.current.scrollLeft + 2.5 * currentScale;
            scrollContainerRef.current.scrollLeft = newScrollLeft;
            latestScrollXRef.current = newScrollLeft;
            targetScrollXRef.current = newScrollLeft; // Keep synced
          }
        } else {
          // Lerp for smooth arrow key horizontal scrolling
          if (scrollContainerRef.current && isKeyScrollingRef.current) {
            const currentScroll = scrollContainerRef.current.scrollLeft;
            if (Math.abs(targetScrollXRef.current - currentScroll) > 0.5) {
              const nextScroll = currentScroll + (targetScrollXRef.current - currentScroll) * 0.12;
              scrollContainerRef.current.scrollLeft = nextScroll;
              latestScrollXRef.current = nextScroll;
            }
          }
        }

        // 2. Smooth Camera-Follow Glide along horizontal scroll (lerp)
        const targetX = latestScrollXRef.current / (latestScaleRef.current || 1);
        p.currentX += (targetX - p.currentX) * 0.14; // Organic 14% damping per frame

        // 3. Vertical Floating Breathing Bob & Flapping Jump Physics
        let totalY = p.currentY;
        if (gameStatusRef.current === "idle") {
          // Smooth 11px sine wave hover during idle
          totalY += Math.sin(p.time) * 11;
        }

        const tiltAngle = Math.max(-25, Math.min(30, p.velocityY * 2));

        if (!p.isDead) {
          if (gameStatusRef.current === "playing") {
            p.currentY += p.velocityY;
            p.velocityY += 0.65; // Lighter, floatier gravity pull

            const birdLeft = 240 + p.currentX;
            const birdRight = birdLeft + 72;
            const birdTop = 480 + totalY;
            const birdBottom = birdTop + 72;

            // Check hit top boundary
            if (birdTop < 0) {
              p.isDead = true;
              p.velocityY = 0;
              setIsDead(true);
              updateGameStatus("dead");
              playRetroSound("die");
            }

            // Check hit ground boundary
            const groundLevel = 925;
            if (birdBottom - 10 >= groundLevel) { // 10px bottom padding
              p.isDead = true;
              p.velocityY = 0;
              setIsDead(true);
              updateGameStatus("dead");
              playRetroSound("die");
            }

            // Check pipe collisions (with forgiving 12px horizontal, 10px vertical padding)
            const paddingX = 12;
            const paddingY = 10;
            const bLeft = birdLeft + paddingX;
            const bRight = birdRight - paddingX;
            const bTop = birdTop + paddingY;
            const bBottom = birdBottom - paddingY;

            for (const pipe of currentPipesRef.current) {
              if (bRight > pipe.left && bLeft < (pipe.left + 52)) {
                if (bBottom > pipe.top && bTop < (pipe.top + pipe.height)) {
                  p.isDead = true;
                  p.velocityY = 0; // stop upward/downward velocity
                  setIsDead(true);
                  updateGameStatus("dead");
                  playRetroSound("die");
                  break;
                }
              }
            }

            // Check passing pipes for score
            currentPipesRef.current.forEach((pipe) => {
              const gateX = pipe.left + 52;
              if (birdLeft > gateX && !passedPipes.current.has(pipe.left)) {
                passedPipes.current.add(pipe.left);
                setBirdScore((prev) => {
                  const newScore = prev + 1;
                  playRetroSound("point");
                  return newScore;
                });
              }
            });

            // Generatively spawn new pipes as the bird flies forward
            const maxPipeLeft = Math.max(...currentPipesRef.current.map(pipe => pipe.left));
            if (birdLeft + 1500 > maxPipeLeft) {
              const nextLeft = maxPipeLeft + 450;

              // Generate a top and bottom pipe pair with a 200px gap
              const gapHeight = 200;
              const minTopHeight = 120;
              const maxTopHeight = 500;
              const topHeight = Math.floor(Math.random() * (maxTopHeight - minTopHeight + 1)) + minTopHeight;
              const bottomTop = topHeight + gapHeight;
              const bottomHeight = 925 - bottomTop;

              const newPipes = [
                { left: nextLeft, top: 0, height: topHeight, isTop: true },
                { left: nextLeft, top: bottomTop, height: bottomHeight, isTop: false }
              ];

              currentPipesRef.current = [...currentPipesRef.current, ...newPipes];
              setDynamicPipes(currentPipesRef.current);
            }

            // Extend canvas width in larger chunks to avoid React rendering lag
            if (birdLeft + 1500 > canvasWidthRef.current) {
              canvasWidthRef.current += 2000;
              setCanvasWidth(canvasWidthRef.current);
            }
          } else {
            // Idle state: keep velocity and displacement at 0
            p.currentY = 0;
            p.velocityY = 0;
          }

          p.rotation = tiltAngle;
        } else {
          // Dying animation: fall to ground
          const groundY = 925 - 480 - 72; // 373px offset from 480px starting Y
          if (p.currentY < groundY) {
            p.currentY += p.velocityY;
            p.velocityY += 1.5; // Fast gravity
            p.rotation += 15; // Spin out of control
            if (p.currentY > groundY) {
              p.currentY = groundY;
              p.velocityY = 0;
            }
          }
          totalY = p.currentY; // Ignore sine wave hover when dead
        }

        // Apply direct GPU-accelerated transform without CSS layout thrashing or transition lag
        birdContainerRef.current.style.transform = `translate3d(${p.currentX}px, 0px, 0px)`;
        birdSpriteRef.current.style.transform = `translate3d(0px, ${totalY}px, 0px) rotate(${p.rotation}deg)`;
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Keyboard navigation and spacebar flapper
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture keys if typing in input/textarea
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA")) {
        return;
      }

      // Handle closing instructions overlay with Spacebar or Enter
      if (showInstructionsRef.current) {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          closeInstructions();
        }
        return;
      }

      // Don't capture keys if popup is open or error is displayed
      if (selectedDepartment !== null || error !== null) {
        return;
      }

      if (e.key === " ") {
        e.preventDefault(); // Stop page scrolling down
        if (gameStatusRef.current === "dead") {
          return;
        }
        flapBird();
        return;
      }

      if (!scrollContainerRef.current) return;
      // Disable arrow keys scrolling during playing to avoid weird camera jitter
      if (gameStatusRef.current === "playing") {
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
          e.preventDefault();
          return;
        }
      }

      if (e.key === "ArrowRight") {
        e.preventDefault();
        const maxScroll = scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth;
        isKeyScrollingRef.current = true;
        const scrollStep = e.repeat ? 20 : 220;
        targetScrollXRef.current = Math.min(maxScroll, targetScrollXRef.current + scrollStep);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        isKeyScrollingRef.current = true;
        const scrollStep = e.repeat ? 20 : 220;
        targetScrollXRef.current = Math.max(0, targetScrollXRef.current - scrollStep);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedDepartment, error, showInstructions]);

  // Map vertical wheel scroll to horizontal scroll (scaled down for smooth touchpad/wheel sliding)
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // Only map if vertical scroll is dominant
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        container.scrollBy({ left: e.deltaY * 0.35, behavior: "auto" });
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, []);

  const handleOpenPopup = (quest: DepartmentData, type: "tech" | "non-tech", slug: string) => {
    if (isLoadingApp) return;

    // Check if they already applied to this department
    const isFirstPref = appStatus?.firstPreference === slug;
    const isSecondPref = appStatus?.secondPreference === slug;

    if (isFirstPref || isSecondPref) {
      playRetroSound("select");
      const progress = isFirstPref ? appStatus.firstPrefProgress : appStatus.secondPrefProgress;
      const targetStage = progress.effectiveCurrentStage ?? progress.currentStage ?? 1;
      posthog.capture("Quest Resume Clicked", { slug, stage: targetStage });
      router.push(`/apply/${slug}/quest-${targetStage}`);
      return;
    }

    // Check if this category already has a quest selected → show change department modal
    if (
      (appStatus?.firstPrefType === type && appStatus?.firstPreference) ||
      (appStatus?.secondPrefType === type && appStatus?.secondPreference)
    ) {
      handleOpenChangeCategoryModal(type);
      return;
    }

    playRetroSound("open");
    setSelectedDeptType(type);
    setSelectedDepartment(quest);
  };

  const handleDropAndContinue = () => {
    if (!dropQuestTarget) return;
    if (!user || !isLoggedIn) {
      playRetroSound("select");
      router.push(`/login?callbackUrl=/recruitments`);
      return;
    }
    playRetroSound("open");

    const { slug, prefSlot } = dropQuestTarget;
    posthog.capture("Quest Switch Initiated", { from: dropQuestTarget.currentQuestTitle, to: slug, prefSlot });
    setDropQuestTarget(null);
    // Navigate directly to the new quest stage-1 form.
    // Drop in database occurs ONLY when candidate clicks SUBMIT on stage-1.
    router.push(`/apply/${slug}/quest-1`);
  };

  const handleApplyFromPopup = (role: string, type: "tech" | "non-tech") => {
    const hasApplicationRecord = !!appStatus;
    const targetUrl = !hasApplicationRecord ? `/apply/init?role=${role}` : `/apply/${role}/quest-1`;

    if (!user || !isLoggedIn) {
      playRetroSound("select");
      router.push(`/login?callbackUrl=${encodeURIComponent(targetUrl)}`);
      return;
    }
    playRetroSound("open");
    setSelectedDepartment(null);

    if (!hasApplicationRecord) {
      posthog.capture("First Preference Selected", { department: role });
    } else {
      posthog.capture("Preference Selected", { department: role });
    }
    router.push(targetUrl);
  };

  const handleBirdClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    flapBird();
  };



  // Dynamic quests lists are fetched from backend on load

  // ── Mobile rendering ─────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div className={`${pressStart.variable} font-press-start`}>
        <RetroLoader isLoading={isLoadingApp} title="LOADING MAP" />
        <MobileQuestsView
          type={mobileView}
          quests={mobileView === "tech" ? techQuests : nonTechQuests}
          appStatus={appStatus}
          onQuestSelect={handleOpenPopup}
          onChangeDepartment={() => handleOpenChangeCategoryModal(mobileView)}
          playSound={playRetroSound}
          router={router}
          isLoggedIn={isLoggedIn}
          countdownSettings={countdownSettings}
        />
        {/* Popup overlays — same as desktop */}
        {selectedDepartment && (
          <DepartmentPopup
            department={selectedDepartment}
            deptType={selectedDeptType}
            onClose={() => {
              playRetroSound("close");
              setSelectedDepartment(null);
            }}
            onApply={handleApplyFromPopup}
          />
        )}
        {/* Drop & Switch Quest Modal (Mobile) */}
        {dropQuestTarget && (
          <div className="fixed inset-0 z-[110] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div
              className="bg-[#FFE4D6] border-4 border-black p-6 max-w-sm w-full relative flex flex-col items-center gap-5 text-center"
              style={{ boxShadow: "8px 8px 0px 0px rgba(0,0,0,0.5)" }}
            >
              <div className="bg-[#A93710] text-white px-4 py-2 border-2 border-black text-[10px] uppercase tracking-widest font-bold -mt-10 mb-1 shadow-[2px_2px_0px_#000]">
                ⚠ QUEST CONFLICT
              </div>
              <div className="text-[10px] text-black font-bold tracking-wide uppercase leading-loose">
                Your quest{" "}
                <span className="text-[#A93710] border-b-2 border-[#A93710]">
                  {dropQuestTarget.currentQuestTitle}
                </span>{" "}
                has been selected already.
              </div>
              <div className="text-[9px] text-black/80 font-bold tracking-wide uppercase leading-loose border-2 border-dashed border-[#A93710] p-3 bg-white/50 w-full">
                Drop that quest and continue with{" "}
                <span className="text-[#1093EB]">{dropQuestTarget.quest.title}</span>?
              </div>
              <div className="flex flex-col gap-3 w-full">
                <button
                  onClick={handleDropAndContinue}
                  disabled={isApplying}
                  className="w-full bg-[#A93710] hover:bg-[#C44214] disabled:opacity-60 border-4 border-black py-3 px-3 text-[8px] font-bold text-white uppercase tracking-wider transition-transform hover:-translate-y-1 active:translate-y-0 shadow-[4px_4px_0px_0px_#000] leading-relaxed"
                >
                  {isApplying ? "SWITCHING..." : `DROP & CONTINUE WITH ${dropQuestTarget.quest.title.toUpperCase()}`}
                </button>
                <button
                  onClick={() => {
                    playRetroSound("close");
                    setDropQuestTarget(null);
                  }}
                  className="w-full bg-[#E29A2B] hover:bg-[#F0AD3D] border-4 border-black py-2.5 px-3 text-[9px] font-bold text-black uppercase tracking-wider transition-transform hover:-translate-y-1 active:translate-y-0 shadow-[4px_4px_0px_0px_#000]"
                >
                  CANCEL
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Change Department Modal (Mobile) */}
        {changeCategoryModalTarget && (() => {
          const currentDeptSlug = changeCategoryModalTarget === "tech"
            ? appStatus?.firstPreference || ""
            : appStatus?.secondPreference || "";

          const availableQuests = changeCategoryModalTarget === "tech" ? techQuests : nonTechQuests;

          const deptOptions = availableQuests.map((q) => ({
            slug: getDeptSlug(q),
            name: q.title,
            description: q.desc || q.subtitle,
          }));

          return (
            <ChangeDepartmentModal
              isOpen={true}
              trackType={changeCategoryModalTarget}
              currentDeptSlug={currentDeptSlug || ""}
              availableDepartments={deptOptions}
              onConfirm={handleSwitchDepartment}
              onClose={() => {
                playRetroSound("close");
                setChangeCategoryModalTarget(null);
              }}
              loading={isSwitchingDepartment}
            />
          );
        })()}
        {error && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-4">
            <div className="bg-[#FFE4D6] border-4 border-black p-8 max-w-lg w-full relative flex flex-col items-center gap-6" style={{ boxShadow: "8px 8px 0px 0px rgba(0,0,0,0.5)" }}>
              <div className="bg-[#A93710] text-white px-4 py-2 border-2 border-black text-[12px] uppercase tracking-widest font-bold -mt-12 mb-2" style={{ boxShadow: "4px 4px 0px 0px #000" }}>
                CONNECTION ERROR
              </div>
              <div className="text-[#A93710] text-[12px] text-center leading-loose uppercase tracking-widest font-bold">
                {error}
              </div>
              <button
                onClick={() => fetchStatus()}
                className="mt-2 bg-[#E29A2B] hover:bg-[#F0AD3D] border-4 border-black py-3 px-8 text-[12px] font-bold text-black uppercase tracking-wider active:scale-95 transition-transform"
                style={{ boxShadow: "4px 4px 0px 0px #000" }}
              >
                RETRY CONNECTION
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Desktop rendering ────────────────────────────────────────────────────────
  return (
    <div
      className={`${pressStart.variable} font-press-start w-full h-[100dvh] overflow-x-auto overflow-y-hidden retro-scrollbar select-none bg-[#DD9955] relative`}
      ref={scrollContainerRef}
      onScroll={handleScroll}
      onClick={handleContainerClick}
    >
      <RetroLoader isLoading={isLoadingApp} title="LOADING MAP" />
      {/* Floating Header Buttons + Countdown Timer (Fixed Top Right) */}
      <div
        className="fixed top-4 right-6 z-50 flex items-center gap-4 pointer-events-auto"
        style={{ transform: `scale(${scale})`, transformOrigin: "top right" }}
      >
        {countdownSettings?.enabled && countdownSettings?.target && (
          <div className="hidden md:block font-sans">
            <CountdownTimer
              targetDate={countdownSettings.target}
              title={countdownSettings.title}
              className="!max-w-[270px] !mx-0"
            />
          </div>
        )}

        <button
          onClick={() => {
            playRetroSound("open");
            router.push("/faqs?from=/recruitments");
          }}
          className="bg-[#7CA922] hover:bg-[#8CB932] text-black px-4 py-3 border-4 border-black text-[12px] uppercase tracking-widest font-bold transition-transform hover:-translate-y-1 active:translate-y-0"
          style={{ boxShadow: "4px 4px 0px 0px #000" }}
        >
          FAQS
        </button>
        {user ? (
          <button
            onClick={() => router.push("/profile")}
            className="bg-[#1093EB] hover:bg-[#16B6F4] text-white px-4 py-3 border-4 border-black text-[12px] uppercase tracking-widest font-bold transition-transform hover:-translate-y-1 active:translate-y-0"
            style={{ boxShadow: "4px 4px 0px 0px #000" }}
          >
            VIEW PROFILE
          </button>
        ) : (
          <button
            onClick={() => router.push("/login?callbackUrl=/recruitments")}
            className="bg-[#1093EB] hover:bg-[#16B6F4] text-white px-4 py-3 border-4 border-black text-[12px] uppercase tracking-widest font-bold transition-transform hover:-translate-y-1 active:translate-y-0 flex items-center gap-2"
            style={{ boxShadow: "4px 4px 0px 0px #000" }}
          >
            <div className="bg-white rounded-full p-[2px] flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            </div>
            SIGN IN
          </button>
        )}
      </div>

      {/* Fixed Title Banner (Left-aligned near logo) */}
      <div
        className="fixed z-40 origin-top-left pointer-events-none transition-opacity duration-150"
        style={{
          left: `${230 * scale}px`,
          top: `${16 * scale}px`,
          transform: `scale(${scale})`,
          opacity: mounted ? 1 : 0,
        }}
      >
        <div
          className="px-6 py-4 flex flex-col items-start justify-center pointer-events-auto"
        >
          <h1 className="font-normal text-black text-[64px] tracking-[0] leading-[67px] uppercase whitespace-nowrap">
            {pageTitle}
          </h1>
          <p className="text-[12px] text-black font-bold tracking-[0] leading-[21px] mt-2 uppercase">
            {pageSubtitle}
          </p>
        </div>
      </div>

      {/* Fixed Logo */}
      <MicLogo />
      {error && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-4">
          <div className="bg-[#FFE4D6] border-4 border-black p-8 max-w-lg w-full relative flex flex-col items-center gap-6" style={{ boxShadow: "8px 8px 0px 0px rgba(0,0,0,0.5)" }}>
            <div className="absolute top-0 left-0 w-full h-1 bg-white/50" />

            <div className="bg-[#A93710] text-white px-4 py-2 border-2 border-black text-[12px] uppercase tracking-widest font-bold -mt-12 mb-2" style={{ boxShadow: "4px 4px 0px 0px #000" }}>
              CONNECTION ERROR
            </div>

            <div className="text-[#A93710] text-[12px] sm:text-[14px] text-center leading-loose uppercase tracking-widest font-bold">
              {error}
            </div>

            <button
              onClick={() => fetchStatus()}
              className="mt-2 bg-[#E29A2B] hover:bg-[#F0AD3D] border-4 border-black py-3 px-8 text-[12px] font-bold text-black uppercase tracking-wider active:scale-95 transition-transform"
              style={{ boxShadow: "4px 4px 0px 0px #000" }}
            >
              RETRY CONNECTION
            </button>
          </div>
        </div>
      )}

      {/* Sized container to calculate correct scroll boundaries post-scaling */}
      <div
        style={{
          width: `${(Math.max(2865, canvasWidth) + 1500) * scale}px`,
          height: `${1024 * scale}px`,
          position: "relative",
          overflow: "hidden",
          opacity: mounted ? 1 : 0,
          transition: "opacity 0.15s",
        }}
      >
        {/* Pixel-Perfect Figma Canvas Sized dynamically and scaled using CSS Transform */}
        <div
          className="h-[1024px] absolute top-0 left-0 bg-[linear-gradient(180deg,#1188EE_0%,#0E8AEA_25%,#1093EB_35%,#1197EC_46%,#16B6F4_52%,#10CBF1_56%,#0FC6F1_60%,#15DEF0_65%,#15DEF0_81%)] overflow-hidden origin-top-left"
          style={{
            width: `${Math.max(2865, canvasWidth) + 1500}px`,
            transform: `scale(${scale})`,
          }}
        >
          {/* Floating Clouds (Figma Positions) */}
          <img
            src="/pixel_cloud_small.svg"
            alt="Cloud"
            className="absolute top-[300px] left-[1060px] w-[280px] opacity-85 animate-retro-float pixelated select-none pointer-events-none"
            style={{ animationDelay: "0s" }}
          />
          <img
            src="/pixel_cloud_small.svg"
            alt="Cloud"
            className="absolute top-[140px] left-[-40px] w-[320px] opacity-80 animate-retro-float pixelated select-none pointer-events-none"
            style={{ animationDelay: "1s" }}
          />
          <img
            src="/pixel_cloud_small.svg"
            alt="Cloud"
            className="absolute top-[39px] left-[1167px] w-[360px] opacity-90 animate-retro-float pixelated select-none pointer-events-none"
            style={{ animationDelay: "0.5s" }}
          />
          <img
            src="/pixel_cloud_small.svg"
            alt="Cloud"
            className="absolute top-[333px] left-[2509px] w-[260px] opacity-75 animate-retro-float pixelated select-none pointer-events-none"
            style={{ animationDelay: "1.8s" }}
          />
          <img
            src="/pixel_cloud_small.svg"
            alt="Cloud"
            className="absolute top-[140px] left-[1312px] w-[320px] opacity-85 animate-retro-float pixelated select-none pointer-events-none"
            style={{ animationDelay: "2.3s" }}
          />
          <img
            src="/pixel_cloud_small.svg"
            alt="Cloud"
            className="absolute top-[39px] left-[2519px] w-[360px] opacity-90 animate-retro-float pixelated select-none pointer-events-none"
            style={{ animationDelay: "0.2s" }}
          />

          {/* Generative Clouds for Infinite Scrolling */}
          {canvasWidth > 2865 && Array.from({ length: Math.ceil((canvasWidth - 2865) / 800) }).map((_, idx) => {
            const baseLeft = 2865 + idx * 800;
            const top1 = 50 + (idx % 3) * 60;
            const left1 = baseLeft + (idx % 2) * 200 + 100;
            const top2 = 220 + (idx % 2) * 80;
            const left2 = baseLeft + (idx % 3) * 150 + 450;
            return (
              <React.Fragment key={`gen-clouds-${idx}`}>
                <img
                  src="/pixel_cloud_small.svg"
                  alt="Cloud"
                  className="absolute w-[280px] opacity-85 animate-retro-float pixelated select-none pointer-events-none"
                  style={{ top: `${top1}px`, left: `${left1}px`, animationDelay: `${(idx % 4) * 0.6}s` }}
                />
                <img
                  src="/pixel_cloud_small.svg"
                  alt="Cloud"
                  className="absolute w-[320px] opacity-75 animate-retro-float pixelated select-none pointer-events-none"
                  style={{ top: `${top2}px`, left: `${left2}px`, animationDelay: `${(idx % 3) * 0.8}s` }}
                />
              </React.Fragment>
            );
          })}

          {/* Background Skyline Silhouettes */}
          {Array.from({ length: Math.ceil((canvasWidth + 1500) / 1440) }).map((_, idx) => (
            <img
              key={`skyline-silhouette-${idx}`}
              src="/pixel_cloud_large.svg"
              alt={`Skyline Back ${idx}`}
              loading="eager"
              fetchPriority="high"
              className="absolute top-[565px] w-[1500px] h-[465px] object-cover opacity-100 pointer-events-none select-none pixelated"
              style={{ left: `${idx * 1440}px` }}
            />
          ))}

          {/* Midground Skyline Blocks */}
          {Array.from({ length: Math.ceil((canvasWidth + 1500) / 245) }).map((_, idx) => (
            <img
              key={`skyline-${idx}`}
              src="/city_skyline.svg"
              alt="Skyline Block"
              className="absolute top-[631px] w-[246px] h-[249px] opacity-75 pointer-events-none select-none pixelated"
              style={{ left: `${idx * 245}px` }}
            />
          ))}
          {/* Green Bushes Silhouettes */}
          {Array.from({ length: Math.ceil((canvasWidth + 1500) / 1409) }).map((_, idx) => (
            <img
              key={`bush-${idx}`}
              src="/bushes_pixel.svg"
              alt={`Bushes ${idx}`}
              className="absolute top-[739px] w-[1456px] h-[200px] z-4 pointer-events-none select-none pixelated"
              style={{ left: `${idx * 1409}px` }}
            />
          ))}

          {/* Green Mario Pipes (Dynamic & Generative) */}
          {dynamicPipes.map((pipe, idx) => {
            let effectiveHeight = pipe.height;
            let effectiveTop = pipe.top;

            const hasTechActive = !!(
              (appStatus?.firstPrefType === "tech" && appStatus?.firstPreference) ||
              (appStatus?.secondPrefType === "tech" && appStatus?.secondPreference)
            );
            const hasNonTechActive = !!(
              (appStatus?.firstPrefType === "non-tech" && appStatus?.firstPreference) ||
              (appStatus?.secondPrefType === "non-tech" && appStatus?.secondPreference)
            );

            // Adjust top pipes above active roadmap areas so they extend far down into the sky without overlapping stage nodes
            if (pipe.left === 746 && pipe.isTop && (hasTechActive || hasNonTechActive)) {
              effectiveHeight = 195;
            }
            if (pipe.left === 1234 && pipe.isTop && (hasTechActive || hasNonTechActive)) {
              effectiveHeight = 245;
            }
            if (pipe.left === 1723 && pipe.isTop && (hasTechActive || hasNonTechActive)) {
              effectiveHeight = 265;
            }

            // Adjust bottom pipes below non-tech active roadmap so they stay low on ground platform
            if (pipe.left === 909 && !pipe.isTop && hasNonTechActive) {
              effectiveTop = 795;
              effectiveHeight = 130;
            }
            if (pipe.left === 1396 && !pipe.isTop && hasNonTechActive) {
              effectiveTop = 795;
              effectiveHeight = 130;
            }

            return (
              <RetroPipe
                key={`pipe-${idx}-${pipe.left}-${pipe.isTop}`}
                left={`${pipe.left}px`}
                top={`${effectiveTop}px`}
                height={effectiveHeight}
                isTop={pipe.isTop}
              />
            );
          })}







          {/* Score Counter (Flappy Bird Interaction) */}
          {gameStatus !== "idle" && (
            <div className="absolute right-[160px] top-8 z-30 bg-black/80 border-4 border-black p-3 text-[11px] text-yellow-400 retro-shadow">
              SCORE: {birdScore}
            </div>
          )}

          {/* Interactive Flappy Bird Character (Ultra-Smooth 60/120fps GPU Physics Engine) */}
          <div
            ref={birdContainerRef}
            className="absolute z-25 cursor-pointer will-change-transform select-none"
            style={{ top: "480px", left: "240px" }}
            onClick={handleBirdClick}
          >
            <div ref={birdSpriteRef} className="will-change-transform origin-center">
              <img
                src="/flappy_bird.svg"
                alt="Flappy Bird"
                className={`w-[72px] h-[72px] pixelated drop-shadow-[3px_3px_0px_rgba(0,0,0,0.3)] transition-[transform,filter] duration-150 select-none pointer-events-none ${(isScrollingLeft && gameStatus !== "playing") ? "scale-x-[-1]" : "scale-x-[1]"} ${isDead ? "grayscale brightness-50" : "hover:scale-110 active:scale-95"}`}
              />
            </div>
          </div>

          {/* ================= TECH ROW ================= */}
          {/* Tech signboard (arrow shaped) */}
          <div
            className="absolute z-20"
            style={{
              left: "64px",
              top: "313px",
              width: "282px",
              height: "86px"
            }}
          >
            {/* Shadow shape */}
            <div
              className="absolute bg-black"
              style={{
                left: "6px",
                top: "6px",
                width: "276px",
                height: "80px",
                clipPath: "polygon(0 0, calc(100% - 24px) 0, 100% 50%, calc(100% - 24px) 100%, 0 100%)"
              }}
            />
            {/* Main shape container */}
            <div
              className="absolute top-0 left-0 w-[276px] h-[80px]"
            >
              {/* Outer border shape */}
              <div
                className="absolute inset-0 bg-black"
                style={{
                  clipPath: "polygon(0 0, calc(100% - 24px) 0, 100% 50%, calc(100% - 24px) 100%, 0 100%)"
                }}
              />
              {/* Inner background shape */}
              <div
                className="absolute top-1 left-1 bottom-1 right-1 bg-[#B87B21] flex items-center justify-center pr-10"
                style={{
                  clipPath: "polygon(0 0, calc(100% - 20px) 0, 100% 50%, calc(100% - 20px) 100%, 0 100%)"
                }}
              >
                <span className="text-black text-[15px] font-bold tracking-wider">
                  Tech
                </span>
              </div>
            </div>
          </div>

          {/* Tech Cards / Active Department + Roadmap */}
          {(() => {
            const selectedTechSlug =
              appStatus?.firstPrefType === "tech"
                ? appStatus.firstPreference
                : appStatus?.secondPrefType === "tech"
                ? appStatus.secondPreference
                : null;

            const selectedTechQuest = selectedTechSlug
              ? techQuests.find((q) => getDeptSlug(q) === selectedTechSlug)
              : null;

            const selectedTechProgress = selectedTechSlug
              ? appStatus?.firstPreference === selectedTechSlug
                ? appStatus?.firstPrefProgress
                : appStatus?.secondPrefProgress
              : null;

            if (selectedTechQuest && selectedTechProgress) {
              const isPending =
                selectedTechProgress.status !== "passed" &&
                selectedTechProgress.status !== "accepted" &&
                selectedTechProgress.status !== "rejected" &&
                selectedTechProgress.status !== "failed";

              const techHasSubmission = (selectedTechProgress.stages || []).some(
                (s: { submittedAt?: Date | string }) => !!s.submittedAt
              );

              return (
                <>
                  {/* Active Department Card */}
                  <div className="absolute" style={{ left: "370px", top: "220px", zIndex: 20 }}>
                    <ActiveDepartmentCard
                      deptTitle={selectedTechQuest.title}
                      deptSlug={selectedTechSlug!}
                      statusText={selectedTechProgress.status}
                      isStage2Pending={isPending}
                      hasSubmission={techHasSubmission}
                      onEditForm={() => router.push(`/apply/${selectedTechSlug}/quest-1`)}
                      onChangeDepartment={() => handleOpenChangeCategoryModal("tech")}
                    />
                  </div>

                  {/* Recruitment Stages Roadmap */}
                  <div className="absolute" style={{ left: "720px", top: "211px", zIndex: 20 }}>
                    <StageRoadmap
                      stage1Submitted={techHasSubmission}
                      stage2Status={selectedTechProgress.status as "pending" | "accepted" | "rejected" | "passed" | "failed"}
                      stage3Unlocked={selectedTechProgress.status === "passed" || selectedTechProgress.status === "accepted"}
                    />
                  </div>
                </>
              );
            }

            return techQuests.map((q, idx) => {
              const leftPositions = [350, 830, 1319, 1809, 2300];
              // Fallback: if more quests than positions, space dynamically from last defined position
              const left = idx < leftPositions.length
                ? leftPositions[idx]
                : (leftPositions[leftPositions.length - 1] ?? 350) + (idx - leftPositions.length + 1) * 490;
              const slug = getDeptSlug(q);
              return (
                <div
                  key={`tech-card-${idx}`}
                  className="absolute"
                  style={{ left: `${left}px`, top: "211px", zIndex: 20 }}
                >
                  <QuestCard
                    title={q.title}
                    desc={q.desc || q.subtitle}
                    state="available"
                    onSelect={() => handleOpenPopup(q, "tech", slug)}
                  />
                </div>
              );
            });
          })()}

          {/* ================= NON-TECH ROW ================= */}
          {/* Non Tech signboard (arrow shaped) */}
          <div
            className="absolute z-20"
            style={{
              left: "64px",
              top: "588px",
              width: "372px",
              height: "86px"
            }}
          >
            {/* Shadow shape */}
            <div
              className="absolute bg-black"
              style={{
                left: "6px",
                top: "6px",
                width: "366px",
                height: "80px",
                clipPath: "polygon(0 0, calc(100% - 24px) 0, 100% 50%, calc(100% - 24px) 100%, 0 100%)"
              }}
            />
            {/* Main shape container */}
            <div
              className="absolute top-0 left-0 w-[366px] h-[80px]"
            >
              {/* Outer border shape */}
              <div
                className="absolute inset-0 bg-black"
                style={{
                  clipPath: "polygon(0 0, calc(100% - 24px) 0, 100% 50%, calc(100% - 24px) 100%, 0 100%)"
                }}
              />
              {/* Inner background shape */}
              <div
                className="absolute top-1 left-1 bottom-1 right-1 bg-[#B87B21] flex items-center justify-center pr-10"
                style={{
                  clipPath: "polygon(0 0, calc(100% - 20px) 0, 100% 50%, calc(100% - 20px) 100%, 0 100%)"
                }}
              >
                <span className="text-black text-[15px] font-bold tracking-wider">
                  Non Tech
                </span>
              </div>
            </div>
          </div>

          {/* Non-Tech Cards / Active Department + Roadmap */}
          {(() => {
            const selectedNonTechSlug =
              appStatus?.firstPrefType === "non-tech"
                ? appStatus.firstPreference
                : appStatus?.secondPrefType === "non-tech"
                ? appStatus.secondPreference
                : null;

            const selectedNonTechQuest = selectedNonTechSlug
              ? nonTechQuests.find((q) => getDeptSlug(q) === selectedNonTechSlug)
              : null;

            const selectedNonTechProgress = selectedNonTechSlug
              ? appStatus?.firstPreference === selectedNonTechSlug
                ? appStatus?.firstPrefProgress
                : appStatus?.secondPrefProgress
              : null;

            if (selectedNonTechQuest && selectedNonTechProgress) {
              const isPending =
                selectedNonTechProgress.status !== "passed" &&
                selectedNonTechProgress.status !== "accepted" &&
                selectedNonTechProgress.status !== "rejected" &&
                selectedNonTechProgress.status !== "failed";

              const nonTechHasSubmission = (selectedNonTechProgress.stages || []).some(
                (s: { submittedAt?: Date | string }) => !!s.submittedAt
              );

              return (
                <>
                  {/* Active Department Card */}
                  <div className="absolute" style={{ left: "460px", top: "535px", zIndex: 20 }}>
                    <ActiveDepartmentCard
                      deptTitle={selectedNonTechQuest.title}
                      deptSlug={selectedNonTechSlug!}
                      statusText={selectedNonTechProgress.status}
                      isStage2Pending={isPending}
                      hasSubmission={nonTechHasSubmission}
                      onEditForm={() => router.push(`/apply/${selectedNonTechSlug}/quest-1`)}
                      onChangeDepartment={() => handleOpenChangeCategoryModal("non-tech")}
                    />
                  </div>

                  {/* Recruitment Stages Roadmap */}
                  <div className="absolute" style={{ left: "820px", top: "600px", zIndex: 20 }}>
                    <StageRoadmap
                      stage1Submitted={nonTechHasSubmission}
                      stage2Status={selectedNonTechProgress.status as "pending" | "accepted" | "rejected" | "passed" | "failed"}
                      stage3Unlocked={selectedNonTechProgress.status === "passed" || selectedNonTechProgress.status === "accepted"}
                    />
                  </div>
                </>
              );
            }

            return nonTechQuests.map((q, idx) => {
              const leftPositions = [450, 993, 1481, 1970];
              // Fallback: if more quests than positions, space dynamically from last defined position
              const left = idx < leftPositions.length
                ? leftPositions[idx]
                : (leftPositions[leftPositions.length - 1] ?? 450) + (idx - leftPositions.length + 1) * 490;
              const slug = getDeptSlug(q);
              return (
                <div
                  key={`nontech-card-${idx}`}
                  className="absolute"
                  style={{ left: `${left}px`, top: "621px", zIndex: 20 }}
                >
                  <QuestCard
                    title={q.title}
                    desc={q.desc || q.subtitle}
                    state="available"
                    onSelect={() => handleOpenPopup(q, "non-tech", slug)}
                  />
                </div>
              );
            });
          })()}

          {/* ================= SCROLLING SOIL GROUND PLATFORM (z-25) ================= */}
          <div className="absolute top-[925px] left-0 w-full h-[300px] z-25 flex flex-col select-none pointer-events-none">
            {/* Green Grass Trim */}
            <div className="w-full h-5 bg-[#52AE26] border-t-4 border-b-4 border-black flex flex-col justify-between shrink-0">
              <div className="w-full h-[3px] bg-[#72F418]" />
              <div className="w-full h-[3px] bg-[#3FA70E]" />
            </div>
            {/* Soil Base with Marquee Text (Extends down so scrollbar sits cleanly on dirt track without sky blue gaps) */}
            <div className="w-full flex-grow bg-[#DD9955] border-b-4 border-black relative overflow-hidden flex items-start pt-3">
              {/* Seamless Infinite Scrolling Text */}
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

        </div>
      </div>

      {/* ================= RETRO DEPARTMENT POPUP OVERLAY (z-50) ================= */}
      {selectedDepartment && (
        <DepartmentPopup
          department={selectedDepartment}
          deptType={selectedDeptType}
          onClose={() => {
            playRetroSound("close");
            setSelectedDepartment(null);
          }}
          onApply={handleApplyFromPopup}
        />
      )}

      {/* ================= DROP & SWITCH QUEST MODAL ================= */}
      {dropQuestTarget && (
        <div className="fixed inset-0 z-[110] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className="bg-[#FFE4D6] border-4 border-black p-6 max-w-md w-full relative flex flex-col items-center gap-5 text-center"
            style={{ boxShadow: "8px 8px 0px 0px rgba(0,0,0,0.5)" }}
          >
            {/* Header tag */}
            <div className="bg-[#A93710] text-white px-4 py-2 border-2 border-black text-[11px] uppercase tracking-widest font-bold -mt-10 mb-1 shadow-[2px_2px_0px_#000]">
              ⚠ QUEST CONFLICT
            </div>

            {/* Message */}
            <div className="text-[11px] text-black font-bold tracking-wide uppercase leading-loose">
              Your quest{" "}
              <span className="text-[#A93710] border-b-2 border-[#A93710]">
                {dropQuestTarget.currentQuestTitle}
              </span>{" "}
              has been selected already.
            </div>

            <div className="text-[10px] text-black/80 font-bold tracking-wide uppercase leading-loose border-2 border-dashed border-[#A93710] p-3 bg-white/50 w-full">
              Drop that quest and continue with{" "}
              <span className="text-[#1093EB]">{dropQuestTarget.quest.title}</span>?
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={handleDropAndContinue}
                disabled={isApplying}
                className="w-full bg-[#A93710] hover:bg-[#C44214] disabled:opacity-60 border-4 border-black py-3 px-4 text-[9px] font-bold text-white uppercase tracking-wider transition-transform hover:-translate-y-1 active:translate-y-0 shadow-[4px_4px_0px_0px_#000] leading-relaxed"
              >
                {isApplying ? "SWITCHING..." : `DROP ${dropQuestTarget.currentQuestTitle.toUpperCase()} & CONTINUE WITH ${dropQuestTarget.quest.title.toUpperCase()}`}
              </button>
              <button
                onClick={() => {
                  playRetroSound("close");
                  setDropQuestTarget(null);
                }}
                className="w-full bg-[#E29A2B] hover:bg-[#F0AD3D] border-4 border-black py-2.5 px-4 text-[10px] font-bold text-black uppercase tracking-wider transition-transform hover:-translate-y-1 active:translate-y-0 shadow-[4px_4px_0px_0px_#000]"
              >
                CANCEL — KEEP {dropQuestTarget.currentQuestTitle.toUpperCase()}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= GAME OVER OVERLAY ================= */}
      {gameStatus === "dead" && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="bg-[#FFE4D6] border-4 border-black p-6 max-w-sm w-full relative flex flex-col items-center gap-4 text-center"
            style={{ boxShadow: "8px 8px 0px 0px rgba(0,0,0,0.5)" }}
          >
            <div className="bg-[#A93710] text-white px-4 py-2 border-2 border-black text-[12px] uppercase tracking-widest font-bold -mt-10 mb-2 shadow-[2px_2px_0px_#000]">
              GAME OVER
            </div>

            <div className="text-[12px] text-black font-bold tracking-wider uppercase">
              YOU CRASHED!
            </div>

            <div className="text-[16px] text-[#A93710] font-bold tracking-wider uppercase my-2">
              SCORE: {birdScore}
            </div>

            <button
              tabIndex={-1}
              onClick={(e) => {
                e.currentTarget.blur();
                resetGame(false);
              }}
              className="bg-[#E29A2B] hover:bg-[#F0AD3D] border-4 border-black py-2.5 px-6 text-[10px] font-bold text-black uppercase tracking-wider transition-transform hover:-translate-y-1 active:translate-y-0"
              style={{ boxShadow: "4px 4px 0px 0px #000" }}
            >
              REPLAY
            </button>
          </div>
        </div>
      )}



      {/* ================= INSTRUCTIONS POPUP OVERLAY ================= */}
      {showInstructions && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="bg-[#FFE4D6] border-4 border-black p-6 max-w-md w-full relative flex flex-col items-center gap-4 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)]"
          >
            {/* Header Tag */}
            <div className="bg-[#A93710] text-white px-4 py-2 border-2 border-black text-[12px] uppercase tracking-widest font-bold -mt-10 mb-2 shadow-[2px_2px_0px_#000]">
              QUEST RULES
            </div>

            <div className="text-[12px] text-black font-bold tracking-wider uppercase my-2">
              Please read before questing:
            </div>

            <div className="flex flex-col gap-3 text-left w-full text-[10px] text-black/85 leading-loose font-bold uppercase border-2 border-dashed border-[#A93710] p-4 bg-white/50">
              <div className="flex items-start gap-2.5">
                <span className="text-[#A93710]">▶</span>
                <span>You can apply for a maximum of <span className="text-[#E29A2B]">ONE TECHNICAL</span> department preference.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-[#A93710]">▶</span>
                <span>You can apply for a maximum of <span className="text-[#E29A2B]">ONE NON-TECHNICAL</span> department preference.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-[#A93710]">▶</span>
                <span>Once a quest is started, your preference choice for that category is locked.</span>
              </div>
            </div>

            <button
              onClick={closeInstructions}
              className="bg-[#E29A2B] hover:bg-[#F0AD3D] border-4 border-black py-2.5 px-6 text-[10px] font-bold text-black uppercase tracking-wider transition-transform hover:-translate-y-1 active:translate-y-0 mt-2 shadow-[4px_4px_0px_0px_#000]"
            >
              START QUESTING!
            </button>
          </div>
        </div>
      )}

      {/* ================= CHANGE DEPARTMENT CONFIRMATION MODAL ================= */}
      {changeCategoryModalTarget && (() => {
        const isFirst = appStatus?.firstPrefType === changeCategoryModalTarget;
        const currentDeptSlug = isFirst ? appStatus?.firstPreference : appStatus?.secondPreference;
        const availableQuests = changeCategoryModalTarget === "tech" ? techQuests : nonTechQuests;
        const deptOptions = availableQuests.map((q) => ({
          slug: getDeptSlug(q),
          name: q.title,
          description: q.desc || q.subtitle,
        }));

        return (
          <ChangeDepartmentModal
            isOpen={true}
            trackType={changeCategoryModalTarget}
            currentDeptSlug={currentDeptSlug || ""}
            availableDepartments={deptOptions}
            onConfirm={handleSwitchDepartment}
            onClose={() => {
              playRetroSound("close");
              setChangeCategoryModalTarget(null);
            }}
            loading={isSwitchingDepartment}
          />
        );
      })()}

    </div>
  );
}

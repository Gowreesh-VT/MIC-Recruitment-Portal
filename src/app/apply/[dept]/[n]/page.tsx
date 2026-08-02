"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Press_Start_2P } from "next/font/google";
import { Loader2, CheckCircle2, AlertTriangle, Send, Edit3, PlayCircle, Github, Link, FileText, Clock, Video } from "lucide-react";
import type { FormField, StageConfig } from "@/models/Department";
import TurnstileWidget from "@/components/TurnstileWidget";
import posthog from "posthog-js";
import RetroLoader from "@/components/RetroLoader";
import { playRetroSound } from "@/lib/audio";
import { validateResponses } from "@/lib/validation";
import { getCanonicalDeptSlug } from "@/lib/constants";
import PreferenceConfirmationModal from "@/components/PreferenceConfirmationModal";


const pressStart = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start-2p",
});

const getPanelRetroTag = (panelName?: string) => {
  const name = panelName?.trim() || "Panel 1";
  if (name.includes("1")) return "bg-emerald-100 text-emerald-900 border-emerald-400";
  if (name.includes("2")) return "bg-sky-100 text-sky-900 border-sky-400";
  if (name.includes("3")) return "bg-amber-100 text-amber-950 border-amber-400";
  if (name.includes("4")) return "bg-purple-100 text-purple-950 border-purple-400";
  return "bg-rose-100 text-rose-950 border-rose-400";
};

const DEPT_INFO: Record<string, { title: string; type: "tech" | "non-tech" }> = {
  development: { title: "DEVELOPMENT", type: "tech" },
  "competitive-coding": { title: "COMPETITIVE CODING", type: "tech" },
  "ui-ux": { title: "UI/UX", type: "tech" },
  "ai-ml": { title: "AI/ML", type: "tech" },
  "cyber-security": { title: "CYBER SECURITY", type: "tech" },
  design: { title: "DESIGN", type: "non-tech" },
  management: { title: "MANAGEMENT", type: "non-tech" },
  entrepreneurship: { title: "ENTREPRENEURSHIP", type: "non-tech" },
  "content-media": { title: "CONTENT & MEDIA", type: "non-tech" },
};

interface StageSubmission {
  stage: number;
  submittedAt: string;
  result: "pending" | "passed" | "failed";
  responses: Record<string, unknown>;
}



interface ApplicationStatus {
  overallStatus: "in-progress" | "selected" | "rejected" | "waitlisted";
  firstPreference: string;
  firstPrefType?: "tech" | "non-tech";
  secondPreference?: string;
  secondPrefType?: "tech" | "non-tech";
  firstPrefProgress: {
    status: "active" | "passed" | "rejected" | "pending";
    currentStage: number;
    effectiveCurrentStage?: number;
    stageMasked?: boolean;
    stages: StageSubmission[];
  };
  secondPrefProgress?: {
    status: "active" | "passed" | "rejected" | "pending";
    currentStage: number;
    effectiveCurrentStage?: number;
    stageMasked?: boolean;
    stages: StageSubmission[];
  };
}

function RetroBackground({ scale }: { scale: number }) {
  return (
    <div
      className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none select-none"
      style={{
        width: "2865px",
        height: "1024px",
        transform: `scale(${scale})`,
        transformOrigin: "top center",
      }}
    >
      <div className="w-[2865px] h-[1024px] absolute top-0 left-0 bg-[linear-gradient(180deg,#1188EE_0%,#0E8AEA_25%,#1093EB_35%,#1197EC_46%,#16B6F4_52%,#10CBF1_56%,#0FC6F1_60%,#15DEF0_65%,#15DEF0_81%)] overflow-hidden">

        {/* Small Clouds */}
        <img src="/pixel_cloud_small.svg" alt="Cloud" className="absolute top-[300px] left-[1060px] w-[280px] opacity-85 animate-retro-float pixelated" style={{ animationDelay: "0s" }} />
        <img src="/pixel_cloud_small.svg" alt="Cloud" className="absolute top-[140px] left-[-40px] w-[320px] opacity-80 animate-retro-float pixelated" style={{ animationDelay: "1s" }} />
        <img src="/pixel_cloud_small.svg" alt="Cloud" className="absolute top-[39px] left-[1167px] w-[360px] opacity-90 animate-retro-float pixelated" style={{ animationDelay: "0.5s" }} />
        <img src="/pixel_cloud_small.svg" alt="Cloud" className="absolute top-[220px] left-[400px] w-[200px] opacity-70 animate-retro-float pixelated" style={{ animationDelay: "1.2s" }} />
        <img src="/pixel_cloud_small.svg" alt="Cloud" className="absolute top-[180px] left-[1800px] w-[240px] opacity-60 animate-retro-float pixelated" style={{ animationDelay: "0.8s" }} />

        {/* Skyline */}
        <img src="/pixel_cloud_large.svg" alt="Skyline" className="absolute top-[566px] left-0 w-[1437px] h-[458px] object-cover opacity-100 pixelated" />
        <img src="/pixel_cloud_large.svg" alt="Skyline" className="absolute top-[566px] left-[1437px] w-[1437px] h-[458px] object-cover opacity-100 pixelated" />

        {Array.from({ length: 12 }).map((_, idx) => (
          <img key={idx} src="/city_skyline.svg" alt="Skyline Block" className="absolute top-[631px] w-[246px] h-[249px] opacity-75 pixelated" style={{ left: `${idx * 245}px` }} />
        ))}

        {/* Bushes */}
        {Array.from({ length: 3 }).map((_, idx) => (
          <img
            key={`bush-${idx}`}
            src="/bushes_pixel.svg"
            alt={`Bushes ${idx}`}
            className="absolute top-[739px] w-[1456px] h-[200px] z-4 pointer-events-none select-none pixelated"
            style={{ left: `${idx * 1409}px` }}
          />
        ))}


        {/* Ground */}
        <div className="absolute top-[925px] left-0 w-full h-[300px] z-25 flex flex-col">
          <div className="w-full h-5 bg-[#52AE26] border-t-4 border-b-4 border-black flex flex-col justify-between shrink-0">
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
      </div>
    </div>
  );
}

// ─── Retro Dynamic Field Renderer ─────────────────────────────────────────────
function FieldRenderer({
  field,
  value,
  onChange,
  disabled,
}: {
  field: FormField;
  value: unknown;
  onChange: (val: unknown) => void;
  disabled?: boolean;
}) {
  const base = "w-full bg-white border-[3px] border-[#C85A28] rounded-[8px] px-4 py-3 text-sm text-black font-sans placeholder:text-slate-400 focus:outline-none focus:ring-0 focus:border-black transition-colors";

  const renderIcon = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes("video") || l.includes("youtube")) return <PlayCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black" />;
    if (l.includes("github")) return <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black" />;
    if (l.includes("link") || l.includes("url") || l.includes("deployed")) return <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black" />;
    return null;
  };

  const icon = renderIcon(field.label);
  const paddingClass = icon ? "pl-10" : "";

  switch (field.type) {
    case "textarea":
      return (
        <div className="flex flex-col gap-2">
          <div className="text-[11px] font-bold text-black uppercase leading-snug whitespace-pre-line">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </div>
          <textarea
            id={field.id}
            required={field.required}
            placeholder={field.placeholder}
            maxLength={field.maxLength}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            rows={4}
            className={`${base} ${paddingClass} resize-none ${disabled ? 'opacity-70 cursor-not-allowed bg-slate-100' : ''}`}
          />
        </div>
      );

    case "select":
      return (
        <div className="flex flex-col gap-2">
          <div className="text-[11px] font-bold text-black uppercase leading-snug whitespace-pre-line">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </div>
          <select
            id={field.id}
            required={field.required}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={`${base} ${paddingClass} ${disabled ? 'opacity-70 cursor-not-allowed bg-slate-100' : 'cursor-pointer'} appearance-none`}
          >
            <option value="">-- Select --</option>
            {field.options?.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      );

    case "radio":
    case "checkbox":
      return (
        <div className="flex flex-col gap-2">
          <div className="text-[11px] font-bold text-black uppercase leading-snug whitespace-pre-line">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </div>
          <div className={`p-4 border-[3px] border-[#C85A28] rounded-[8px] space-y-2 ${disabled ? 'bg-slate-100 opacity-70' : 'bg-white'}`}>
            {field.options?.map((opt) => {
              const isCheckbox = field.type === "checkbox";
              const arr = isCheckbox ? ((value as string[]) ?? []) : [];
              const checked = isCheckbox ? arr.includes(opt) : value === opt;

              return (
                <label key={opt} className={`flex items-center gap-3 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                  <input
                    type={isCheckbox ? "checkbox" : "radio"}
                    name={field.id}
                    value={opt}
                    checked={checked}
                    disabled={disabled}
                    onChange={() => {
                      if (disabled) return;
                      if (isCheckbox) {
                        const next = checked ? arr.filter((v) => v !== opt) : [...arr, opt];
                        onChange(next);
                      } else {
                        onChange(opt);
                      }
                    }}
                    className={`accent-[#C85A28] h-4 w-4 ${disabled ? 'cursor-not-allowed' : ''}`}
                  />
                  <span className="text-sm font-sans text-black">{opt}</span>
                </label>
              );
            })}
          </div>
        </div>
      );

    case "url": {
      const urls = Array.isArray(value) ? value : (typeof value === "string" && value ? [value] : [""]);

      const updateUrl = (index: number, newUrl: string) => {
        const newUrls = [...urls];
        newUrls[index] = newUrl;
        onChange(newUrls);
      };

      const addUrl = () => {
        if (urls.length < 3) {
          onChange([...urls, ""]);
        }
      };

      const removeUrl = (index: number) => {
        const newUrls = urls.filter((_, i) => i !== index);
        if (newUrls.length === 0) newUrls.push("");
        onChange(newUrls);
      };

      return (
        <div className="flex flex-col gap-2 w-full">
          <div className="text-[11px] font-bold text-black uppercase leading-snug whitespace-pre-line">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </div>
          <div className="flex flex-col gap-3 w-full">
            {urls.map((u, i) => (
              <div key={i} className="flex gap-2 items-center w-full">
                <div className="relative flex-1 w-full min-w-0">
                  {icon}
                  <input
                    id={i === 0 ? field.id : `${field.id}-${i}`}
                    type={field.type}
                    required={i === 0 ? field.required : false}
                    placeholder={field.placeholder || "https://..."}
                    value={u}
                    onChange={(e) => updateUrl(i, e.target.value)}
                    disabled={disabled}
                    className={`${base} ${paddingClass} ${disabled ? 'opacity-70 cursor-not-allowed bg-slate-100' : ''}`}
                  />
                </div>
                {!disabled && (
                  <div className="flex gap-2 shrink-0">
                    {urls.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeUrl(i)}
                        className="w-[44px] h-[44px] flex-shrink-0 flex items-center justify-center bg-[#FFE4D6] border-[3px] border-black rounded-[8px] hover:bg-[#ffcdc0] transition-colors"
                      >
                        <span className="text-xl font-bold font-sans text-red-600">-</span>
                      </button>
                    )}
                    {i === urls.length - 1 && urls.length < 3 && (
                      <button
                        type="button"
                        onClick={addUrl}
                        className="w-[44px] h-[44px] flex-shrink-0 flex items-center justify-center bg-[#FFE4D6] border-[3px] border-black rounded-[8px] hover:bg-[#ffcdc0] transition-colors"
                      >
                        <span className="text-xl font-bold font-sans text-green-600">+</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }



    default:
      return (
        <div className="flex flex-col gap-2">
          <div className="text-[11px] font-bold text-black uppercase leading-snug whitespace-pre-line">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </div>
          <div className="relative">
            {icon}
            <input
              id={field.id}
              type={field.type}
              required={field.required}
              placeholder={field.placeholder}
              maxLength={field.maxLength}
              value={(value as string) ?? ""}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              className={`${base} ${paddingClass} ${disabled ? 'opacity-70 cursor-not-allowed bg-slate-100' : ''}`}
            />
          </div>
        </div>
      );
  }
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function StagePage({
  params,
}: {
  params: Promise<{ dept: string; n: string }>;
}) {
  const { dept: rawDept, n } = use(params);
  const dept = getCanonicalDeptSlug(rawDept);
  const stageNum = parseInt((n || "").replace("quest-", "").replace("stage-", ""), 10);
  const router = useRouter();

  const [scale, setScale] = useState(1);
  const [stageConfig, setStageConfig] = useState<StageConfig | null>(null);
  const [existingSubmission, setExistingSubmission] = useState<Record<string, unknown> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [cycleOpen, setCycleOpen] = useState(true);
  const [responses, setResponses] = useState<Record<string, unknown>>({});
  const [dataLoaded, setDataLoaded] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [lockError, setLockError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [deptName, setDeptName] = useState("");
  const [application, setApplication] = useState<ApplicationStatus | null>(null);
  const [applicantYear, setApplicantYear] = useState<string>("");
  // Turnstile — token verified server-side before each submission
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [captchaError, setCaptchaError] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);




  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== "undefined") {
        const heightScale = window.innerHeight / 1024;
        setScale(heightScale);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchStage = async () => {
      try {

        const [stageRes, deptRes, cycleRes] = await Promise.all([
          fetch(`/api/apply/${dept}/stage/${stageNum}`, { cache: "no-store" }),
          fetch(`/api/admin/departments/${dept}`, { cache: "no-store" }),
          fetch("/api/apply/status", { cache: "no-store" }),
        ]);

        let userData: Record<string, unknown> | null = null;
        let appData: ApplicationStatus | null = null;
        let fetchedStageConfig: StageConfig | null = null;
        let hasSubmission = false;

        if (stageRes.ok) {
          const data = await stageRes.json();
          setStageConfig(data.stageConfig);
          fetchedStageConfig = data.stageConfig;
          if (data.applicantYear) {
            setApplicantYear(data.applicantYear);
          }
          if (data.submission) {
            setExistingSubmission(data.submission);
            setResponses(data.submission.responses ?? {});
            hasSubmission = true;
          }
        } else {
          const data = await stageRes.json();
          setLockError(data.error || "This stage is locked.");
        }

        if (deptRes.ok) {
          const deptData = await deptRes.json();
          setDeptName(deptData.department?.name ?? dept);
        }

        if (cycleRes.ok) {
          const statusData = await cycleRes.json();
          setCycleOpen(statusData.cycleOpen ?? true);
          userData = statusData.user;
          appData = statusData.application;
          setApplication(statusData.application);
        }

        // Auto-fill logic
        if (!hasSubmission && fetchedStageConfig) {
          const initialResponses: Record<string, unknown> = {};

          // 1. If applying for second preference Stage 1, pull from first preference Stage 1
          if (stageNum === 1 && appData && appData.secondPreference === dept) {
            const firstPrefStage1 = appData.firstPrefProgress?.stages?.find((s: StageSubmission) => s.stage === 1);
            if (firstPrefStage1 && firstPrefStage1.responses) {
              Object.assign(initialResponses, firstPrefStage1.responses);
            }
          }

          // 2. Auto-fill from Google Account ONLY for explicit personal name/email fields
          if (userData) {
            fetchedStageConfig.formFields.forEach(field => {
              const fieldId = field.id.toLowerCase();
              if ((fieldId === "fullname" || fieldId === "applicantname" || fieldId === "name") && userData.name && !initialResponses[field.id]) {
                initialResponses[field.id] = userData.name;
              }
              if ((fieldId === "email" || fieldId === "useremail" || fieldId === "applicantemail") && userData.email && !initialResponses[field.id]) {
                initialResponses[field.id] = userData.email;
              }
            });
          }

          if (Object.keys(initialResponses).length > 0) {
            setResponses(initialResponses);
          }
        }
      } catch {
        setError("Failed to load stage. Please refresh.");
      } finally {
        setDataLoaded(true);
      }
    };
    fetchStage();
  }, [dept, stageNum]);

  const filterFieldsForCandidate = (fields: FormField[], selectedTrack: string, userYear: string) => {
    return fields.filter((field) => {
      // 1. Sub-domain / Track check
      if (field.subDomain && field.subDomain !== "common" && field.subDomain !== "all") {
        if (!selectedTrack || field.subDomain !== selectedTrack) {
          return false;
        }
      }

      // 2. Year check
      if (field.targetYears && field.targetYears.length > 0 && !field.targetYears.includes("all")) {
        if (userYear) {
          const isFirstYearUser = userYear === "1st Year";
          const matchesYear = field.targetYears.some((y) => {
            if (isFirstYearUser && (y === "1st Year" || y === "1")) return true;
            if (!isFirstYearUser && (y === "Senior Years" || y === "2nd Year" || y === "3rd Year" || y === "4th Year" || y === "2+" || y === "2,3,4")) return true;
            return y === userYear;
          });
          if (!matchesYear) return false;
        }
      }

      return true;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCaptchaError(false);


    // Client-side Zod validation — phone, GitHub, LinkedIn, email, required fields
    if (stageConfig) {
      const selectedTrack = (responses.devTrack || responses.subDomain || "") as string;
      const effectiveYear = applicantYear || "";
      const activeFields = filterFieldsForCandidate(stageConfig.formFields, selectedTrack, effectiveYear);
      const validation = validateResponses(activeFields, responses, { year: effectiveYear, subDomain: selectedTrack });
      if (validation.error) {
        setError(validation.error);
        return;
      }
    }



    // Require a valid Turnstile token before submitting
    if (!turnstileToken) {
      setCaptchaError(true);
      setError("Please complete the CAPTCHA challenge first.");
      return;
    }



    // Show confirmation modal before executing submission
    setShowConfirmModal(true);
  };

  const executeSubmission = async () => {
    setShowConfirmModal(false);
    setSubmitting(true);

    try {
      // 1. Verify the Turnstile token server-side
      const verifyRes = await fetch("/api/turnstile/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: turnstileToken }),
      });
      const verifyData = await verifyRes.json();

      if (!verifyData.success) {
        setCaptchaError(true);
        setTurnstileToken(null); // force the user to solve again
        setError("CAPTCHA verification failed. Please solve the challenge again.");
        setSubmitting(false);
        return;
      }

      // 2. Submit the stage form
      const method = existingSubmission && isEditing ? "PUT" : "POST";
      const res = await fetch(`/api/apply/${dept}/stage/${stageNum}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responses, _trap: "" }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        const currentCategory = DEPT_INFO[dept]?.type || "tech";
        const hasTechApp =
          (application?.firstPrefType === "tech" && !!application?.firstPreference) ||
          (application?.secondPrefType === "tech" && !!application?.secondPreference) ||
          currentCategory === "tech";
        const hasNonTechApp =
          (application?.firstPrefType === "non-tech" && !!application?.firstPreference) ||
          (application?.secondPrefType === "non-tech" && !!application?.secondPreference) ||
          currentCategory === "non-tech";

        if (hasTechApp && hasNonTechApp && typeof window !== "undefined") {
          sessionStorage.setItem("justFilledSecondDept", "true");
        }
        posthog.capture("Stage Submitted", {
          department: dept,
          stage: stageNum,
          isEditing: !!(existingSubmission && isEditing),
        });
        setSubmitted(true);
      } else {
        setError(data.error ?? "Submission failed. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const playSound = () => {
    playRetroSound("jump");
  };

  if (!dataLoaded) {
    return (
      <main className={`${pressStart.variable} font-press-start w-full h-[100dvh] overflow-hidden select-none bg-[#DD9955] relative flex justify-center items-center`}>
        <RetroBackground scale={scale} />
        <div className="relative z-40 bg-[#C8862A] border-4 border-black p-6 flex items-center justify-center shadow-[8px_8px_0px_0px_#000]">
          <div className="text-white text-[12px] animate-retro-blink uppercase tracking-widest drop-shadow-[2px_2px_0px_#000]">
            LOADING STAGE...
          </div>
        </div>
      </main>
    );
  }

  if (lockError) {
    return (
      <main className={`${pressStart.variable} font-press-start w-full h-[100dvh] overflow-hidden select-none bg-[#DD9955] relative flex justify-center items-center`}>
        <RetroBackground scale={scale} />
        <div className="relative z-40 w-full max-w-[650px] px-4">
          <div className="bg-[#FFE4D6] border-4 border-black rounded-[12px] relative flex flex-col" style={{ boxShadow: "8px 8px 0px 0px rgba(0,0,0,0.5)" }}>
            <div className="bg-[#A05522] w-full h-[60px] shrink-0 border-b-4 border-black rounded-t-[8px] flex items-center justify-center relative overflow-hidden">
              <span className="text-black text-[16px] font-bold tracking-widest relative z-10 drop-shadow-[1px_1px_0px_#fff] uppercase">
                EVALUATION IN PROGRESS
              </span>
            </div>
            <div className="p-8 flex flex-col items-center">
              <div className="border-[3px] border-black bg-white p-8 relative w-full flex flex-col items-center gap-4">
                <Clock className="w-10 h-10 text-amber-500 animate-pulse" />
                <h1 className="text-[10px] text-center font-bold text-[#A93710] leading-loose">EVALUATION IN PROGRESS</h1>
                <p className="text-[8px] text-center text-black leading-loose font-bold">{lockError}</p>
                <button
                  onClick={() => { playRetroSound(); router.push("/recruitments"); }}
                  className="mt-4 bg-[#FFE4D6] hover:bg-[#FFDED6] text-black border-[3px] border-black rounded-[20px] py-2.5 px-6 text-[8px] font-bold tracking-widest transition-transform active:translate-y-1"
                  style={{ boxShadow: "3px 3px 0px 0px #000" }}
                >
                  RETURN TO MAP
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!stageConfig) {
    return (
      <main className={`${pressStart.variable} font-press-start w-full h-[100dvh] overflow-hidden select-none bg-[#DD9955] relative flex justify-center items-center`}>
        <RetroBackground scale={scale} />
        <div className="relative z-40 w-full max-w-[650px] px-4">
          <div className="bg-[#FFE4D6] border-4 border-black rounded-[12px] relative flex flex-col" style={{ boxShadow: "8px 8px 0px 0px rgba(0,0,0,0.5)" }}>
            <div className="bg-[#A05522] w-full h-[60px] shrink-0 border-b-4 border-black rounded-t-[8px] flex items-center justify-center relative overflow-hidden">
              <span className="text-black text-[18px] font-bold tracking-widest relative z-10 drop-shadow-[1px_1px_0px_#fff] uppercase">
                ERROR: NOT FOUND
              </span>
            </div>
            <div className="p-8 flex flex-col items-center">
              <div className="border-[3px] border-black bg-white p-8 relative w-full flex flex-col items-center gap-4">
                <AlertTriangle className="w-10 h-10 text-red-500" />
                <h1 className="text-[12px] text-center font-bold text-[#A93710] leading-loose">STAGE {stageNum} IS NOT CONFIGURED</h1>
                <p className="text-[9px] text-center text-black leading-loose font-bold">This stage does not exist or has not been set up yet.</p>
                <button
                  onClick={() => { playRetroSound(); router.push("/recruitments"); }}
                  className="mt-4 bg-[#FFE4D6] hover:bg-[#FFDED6] text-black border-[3px] border-black rounded-[20px] py-2.5 px-6 text-[10px] font-bold tracking-widest transition-transform active:translate-y-1"
                  style={{ boxShadow: "3px 3px 0px 0px #000" }}
                >
                  RETURN TO MAP
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (submitted) {
    const currentCategory = DEPT_INFO[dept]?.type || "tech";
    const oppositeCategory = currentCategory === "tech" ? "non-tech" : "tech";
    const oppositeCategoryLabel = currentCategory === "tech" ? "Non-Tech" : "Tech";

    const hasTechApp =
      (application?.firstPrefType === "tech" && !!application?.firstPreference) ||
      (application?.secondPrefType === "tech" && !!application?.secondPreference) ||
      currentCategory === "tech";

    const hasNonTechApp =
      (application?.firstPrefType === "non-tech" && !!application?.firstPreference) ||
      (application?.secondPrefType === "non-tech" && !!application?.secondPreference) ||
      currentCategory === "non-tech";

    const hasBothPreferences = hasTechApp && hasNonTechApp;

    return (
      <main className={`${pressStart.variable} font-press-start w-full h-[100dvh] overflow-hidden select-none bg-[#DD9955] relative flex justify-center items-center`}>
        <RetroBackground scale={scale} />

        <div className="relative z-40 w-full max-w-[650px] px-4" style={{ marginTop: "40px" }}>
          <div className="bg-[#FFE4D6] border-4 border-black rounded-[12px] relative flex flex-col" style={{ boxShadow: "8px 8px 0px 0px rgba(0,0,0,0.5)" }}>
            {/* Ropes */}
            <div className="absolute bottom-[100%] w-3 z-[-1]" style={{ left: "10%", height: "100vh", background: "repeating-linear-gradient(to bottom, #CC8844 0, #CC8844 12px, #A05522 12px, #A05522 16px)", borderLeft: "2px solid #000", borderRight: "2px solid #000" }} />
            <div className="absolute bottom-[100%] w-3 z-[-1]" style={{ right: "10%", height: "100vh", background: "repeating-linear-gradient(to bottom, #CC8844 0, #CC8844 12px, #A05522 12px, #A05522 16px)", borderLeft: "2px solid #000", borderRight: "2px solid #000" }} />

            {/* Header Bar */}
            <div className="bg-[#A05522] w-full h-[60px] shrink-0 border-b-4 border-black rounded-t-[8px] flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiNmZmYiLz48L3N2Zz4=')] [background-size:10px_10px]" />
              <span className="text-black text-[16px] font-bold tracking-widest relative z-10 drop-shadow-[1px_1px_0px_#fff] uppercase">
                APPLICATION SUBMITTED
              </span>
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 bg-black rounded-full shadow-[1px_1px_0px_#fff]" />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 bg-black rounded-full shadow-[1px_1px_0px_#fff]" />
            </div>

            <div className="p-6 md:p-8 flex flex-col items-center">
              <div className="border-[3px] border-black bg-white p-6 md:p-8 relative w-full flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-[#52AE26] border-4 border-black flex items-center justify-center p-2 mb-4 shadow-[4px_4px_0px_#000]">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>

                <h1 className="text-[13px] md:text-[15px] font-bold text-[#A93710] leading-snug drop-shadow-[1px_1px_0px_#fff] uppercase mb-3">
                  🎉 Application Submitted Successfully
                </h1>

                <p className="text-[9px] md:text-[10px] text-black leading-relaxed font-bold max-w-md">
                  Your application has been submitted successfully.
                </p>

                {!hasBothPreferences && (
                  <p className="text-[9px] md:text-[10px] text-black leading-relaxed font-bold mt-3 border-2 border-dashed border-[#A93710] p-3 bg-[#FFF4E6] w-full">
                    Would you also like to apply for a {oppositeCategoryLabel} department?
                  </p>
                )}

                <div className="flex flex-col sm:flex-row gap-3 w-full mt-6">
                  {!hasBothPreferences ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          playRetroSound();
                          router.push(`/recruitments?view=${oppositeCategory}`);
                        }}
                        className="flex-1 bg-[#1093EB] hover:bg-[#16B6F4] text-white border-[3px] border-black py-3 px-4 text-[9px] md:text-[10px] font-bold tracking-wider uppercase transition-transform active:translate-y-0.5 shadow-[3px_3px_0px_0px_#000] cursor-pointer"
                      >
                        Apply for {oppositeCategoryLabel}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          playRetroSound();
                          router.push("/");
                        }}
                        className="flex-1 bg-[#E29A2B] hover:bg-[#F0AD3D] text-black border-[3px] border-black py-3 px-4 text-[9px] md:text-[10px] font-bold tracking-wider uppercase transition-transform active:translate-y-0.5 shadow-[3px_3px_0px_0px_#000] cursor-pointer"
                      >
                        Maybe Later
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        playRetroSound();
                        router.push("/recruitments");
                      }}
                      className="w-full bg-[#52AE26] hover:bg-[#60C22B] text-white border-[3px] border-black py-3 px-4 text-[10px] font-bold tracking-wider uppercase transition-transform active:translate-y-0.5 shadow-[3px_3px_0px_0px_#000] cursor-pointer"
                    >
                      RETURN TO MAP
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className={`${pressStart.variable} font-press-start w-full h-[100dvh] overflow-hidden bg-[#DD9955] relative flex justify-center items-center`}>
      <RetroBackground scale={scale} />

      {/* Main Hanging Signboard */}
      <div className="relative z-40 w-full max-w-[1000px] px-4 md:px-16" style={{ marginTop: "40px" }}>

        {/* Signboard Container */}
        <div className="bg-[#FFE4D6] border-4 border-black rounded-[12px] relative flex flex-col max-h-[85vh]" style={{ boxShadow: "8px 8px 0px 0px rgba(0,0,0,0.5)" }}>

          {/* Ropes */}
          <div className="absolute bottom-[100%] w-3 z-[-1]" style={{ left: "10%", height: "100vh", background: "repeating-linear-gradient(to bottom, #CC8844 0, #CC8844 12px, #A05522 12px, #A05522 16px)", borderLeft: "2px solid #000", borderRight: "2px solid #000" }} />
          <div className="absolute bottom-[100%] w-3 z-[-1]" style={{ right: "10%", height: "100vh", background: "repeating-linear-gradient(to bottom, #CC8844 0, #CC8844 12px, #A05522 12px, #A05522 16px)", borderLeft: "2px solid #000", borderRight: "2px solid #000" }} />

          {/* Header Bar (Dark Wood) */}
          <div className="bg-[#A05522] w-full h-[60px] shrink-0 border-b-4 border-black rounded-t-[8px] flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiNmZmYiLz48L3N2Zz4=')] [background-size:10px_10px]" />
            <span className="text-black text-[20px] font-bold tracking-widest relative z-10 drop-shadow-[1px_1px_0px_#fff] uppercase">
              {deptName || "DEPARTMENT"}
            </span>
            {/* Header Screws */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 bg-black rounded-full shadow-[1px_1px_0px_#fff]" />

            {/* Retro Close Button */}
            <button
              type="button"
              onClick={() => {
                playRetroSound();
                router.push("/recruitments");
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 cursor-pointer hover:scale-110 active:scale-95 transition-transform duration-100 flex items-center justify-center select-none"
              title="Close"
            >
              <img
                src="/Close_icon.svg"
                alt="Close"
                className="w-[34px] h-[32px] pixelated pointer-events-none"
              />
            </button>
          </div>

          {/* Form Body */}
          <div className="p-4 md:p-8 overflow-y-auto custom-scrollbar flex-grow">
            <div className="border-[3px] border-black bg-white p-4 md:p-6 relative">

              {/* Progress Indicator inside form area (Retro Style) */}
              <div className="absolute top-0 right-0 bg-black text-white px-3 py-1 text-[8px] font-bold uppercase">
                {stageConfig?.title ? stageConfig.title.toUpperCase() : `STAGE ${stageNum}`}
              </div>

              <form onSubmit={handleSubmit} className="mt-4">
                {/* Hidden honeypot */}
                <input type="text" name="_trap" className="hidden" tabIndex={-1} aria-hidden="true" />



                {error && (
                  <div className="p-3 mb-6 bg-red-100 border-[3px] border-red-500 flex items-center gap-3 text-xs text-red-700 font-bold uppercase">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}

                {existingSubmission && !isEditing && (
                  <div className="p-3 mb-6 bg-green-100 border-[3px] border-green-500 flex items-center gap-3 text-xs text-green-700 font-bold uppercase">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    SUBMITTED. {cycleOpen && existingSubmission.result === "pending" && "CLICK EDIT TO MODIFY."}
                  </div>
                )}

                {(() => {
                  const selectedTrack = (responses.devTrack || responses.subDomain || "") as string;
                  const activeFormFields = filterFieldsForCandidate(
                    stageConfig?.formFields || [],
                    selectedTrack,
                    applicantYear
                  );

                  const isFirst = application?.firstPreference === dept;
                  const prefProgress = isFirst ? application?.firstPrefProgress : application?.secondPrefProgress;
                  const currentPrefStatus = prefProgress?.status;
                  const isReadOnly = (existingSubmission !== null && !isEditing) || currentPrefStatus === "passed" || currentPrefStatus === "rejected";

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                      {activeFormFields.map((field) => (
                        <div key={field.id} className={(field.type === "textarea" || field.type === "url" || field.type === "radio" || field.type === "checkbox") ? "md:col-span-2" : ""}>
                          <FieldRenderer
                            field={field}
                            value={responses[field.id]}
                            onChange={(val) =>
                              setResponses((prev) => ({ ...prev, [field.id]: val }))
                            }
                            disabled={isReadOnly}
                          />
                        </div>
                      ))}
                    </div>
                  );
                })()}

                <div className="mt-10 flex flex-col items-center gap-4 pb-2">
                  {(!existingSubmission || isEditing) && cycleOpen && (
                    <>


                      {/* Turnstile challenge — verified server-side on every submit */}
                      <div className="w-full bg-white border-[3px] border-[#C85A28] rounded-[8px] flex flex-col items-center py-3 gap-2">
                        <span className="text-[9px] font-bold text-black uppercase tracking-widest">
                          ► COMPLETE CHALLENGE TO SUBMIT
                        </span>
                        <TurnstileWidget
                          onSuccess={(token) => { setTurnstileToken(token); setCaptchaError(false); }}
                          onError={() => { setTurnstileToken(null); setCaptchaError(true); }}
                          onExpire={() => setTurnstileToken(null)}
                          theme="light"
                        />
                        {captchaError && (
                          <p className="text-[8px] text-red-600 font-bold uppercase tracking-widest">
                            ⚠ CAPTCHA FAILED — PLEASE RETRY
                          </p>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={submitting || !turnstileToken}
                        onClick={() => playSound()}
                        className="bg-[#FFE4D6] hover:bg-[#FFDED6] text-black border-[3px] border-black rounded-[20px] py-3 px-8 text-[12px] font-bold tracking-widest transition-transform active:translate-y-1 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ boxShadow: "3px 3px 0px 0px #000" }}
                      >
                        {submitting ? "SUBMITTING..." : isEditing ? "SAVE CHANGES" : "SUBMIT"}
                        {!submitting && <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-black border-b-[5px] border-b-transparent" />}
                      </button>
                    </>
                  )}
                  {existingSubmission && !isEditing && (
                    <div className="flex flex-col items-center gap-4">
                      {(() => {
                        const isFirst = application?.firstPreference === dept;
                        const prefProgress = isFirst ? application?.firstPrefProgress : application?.secondPrefProgress;
                        const currentPrefStatus = prefProgress?.status;
                        const canEdit = cycleOpen && existingSubmission.result === "pending" && currentPrefStatus !== "passed" && currentPrefStatus !== "rejected";
                        return canEdit ? (
                          <button
                            type="button"
                            onClick={() => { playRetroSound(); setIsEditing(true); }}
                            className="bg-white hover:bg-slate-100 text-black border-[3px] border-black rounded-[20px] py-3 px-8 text-[12px] font-bold tracking-widest transition-transform active:translate-y-1"
                            style={{ boxShadow: "3px 3px 0px 0px #000" }}
                          >
                            EDIT
                          </button>
                        ) : null;
                      })()}
                    </div>
                  )}
                </div>

                {isEditing && (
                  <div className="mt-4 flex justify-center">
                    <button
                      type="button"
                      onClick={() => { playRetroSound(); setIsEditing(false); setResponses(existingSubmission?.responses as Record<string, unknown> ?? {}); }}
                      className="text-xs text-[#A93710] font-bold hover:underline"
                    >
                      CANCEL EDIT
                    </button>
                  </div>
                )}
              </form>

            </div>
          </div>

        </div>
      </div>

      {showConfirmModal && (() => {
        const currentDeptInfo = DEPT_INFO[dept] || {
          title: dept.toUpperCase().replace("-", " "),
          type: "tech" as const,
        };

        // Find if user has a preference for the OPPOSITE department type
        let oppositePrefSlug: string | null = null;
        if (application) {
          if (application.firstPreference && application.firstPreference !== dept) {
            const firstType = application.firstPrefType || DEPT_INFO[application.firstPreference]?.type;
            if (firstType && firstType !== currentDeptInfo.type) {
              oppositePrefSlug = application.firstPreference;
            }
          }
          if (!oppositePrefSlug && application.secondPreference && application.secondPreference !== dept) {
            const secondType = application.secondPrefType || DEPT_INFO[application.secondPreference]?.type;
            if (secondType && secondType !== currentDeptInfo.type) {
              oppositePrefSlug = application.secondPreference;
            }
          }
        }

        const isBothPreferences = !!oppositePrefSlug;

        return (
          <PreferenceConfirmationModal
            roleTitle={currentDeptInfo.title}
            deptType={currentDeptInfo.type}
            onConfirm={() => executeSubmission()}
            onCancel={() => setShowConfirmModal(false)}
          />
        );
      })()}
    </div>
  );
}

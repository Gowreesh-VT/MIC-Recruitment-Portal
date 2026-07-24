"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut, SessionProvider } from "next-auth/react";
import {
  Loader2,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  LogOut,
  Edit2,
  Save,
  AlertCircle,
  Check,
} from "lucide-react";
import { Press_Start_2P } from "next/font/google";
import BackButton from "@/components/BackButton";
import MobileBackground from "@/components/MobileBackground";
import { playRetroSound } from "@/lib/audio";

const pressStart = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start-2p",
});

interface StageProgress {
  stage: number;
  result: "pending" | "passed" | "failed";
  submittedAt: string;
  adminNote?: string;
  responses: Record<string, unknown>;
}

interface ApplicationStatus {
  fullName: string;
  phone: string;
  regNo: string;
  year: string;
  branch: string;
  whyMic: string;
  overallStatus: "in-progress" | "selected" | "rejected" | "waitlisted";
  firstPreference: string;
  secondPreference?: string;
  firstPrefProgress: {
    status: "active" | "passed" | "rejected" | "pending";
    currentStage: number;
    stages: StageProgress[];
  };
  secondPrefProgress?: {
    status: "active" | "passed" | "rejected" | "pending";
    currentStage: number;
    stages: StageProgress[];
  };
}

export default function ProfilePageWrapper() {
  return (
    <SessionProvider>
      <ProfilePage />
    </SessionProvider>
  );
}

function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [appStatus, setAppStatus] = useState<ApplicationStatus | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit Personal Details State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: "",
    phone: "",
    regNo: "",
    year: "",
    branch: "",
    whyMic: "",
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      fetch("/api/apply/status")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.application) {
            setAppStatus(data.application);
            setEditForm({
              fullName: data.application.fullName || "",
              phone: data.application.phone || "",
              regNo: data.application.regNo || "",
              year: data.application.year || "",
              branch: data.application.branch || "",
              whyMic: data.application.whyMic || "",
            });
          }
        })
        .finally(() => setLoading(false));
    }
  }, [status, router]);

  const handleSignOut = () => {
    playRetroSound("kick");
    signOut({ callbackUrl: "/" });
  };

  const handleStartEdit = () => {
    playRetroSound("open");
    if (appStatus) {
      setEditForm({
        fullName: appStatus.fullName || "",
        phone: appStatus.phone || "",
        regNo: appStatus.regNo || "",
        year: appStatus.year || "",
        branch: appStatus.branch || "",
        whyMic: appStatus.whyMic || "",
      });
    }
    setSaveError("");
    setSaveSuccess("");
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    playRetroSound("close");
    setIsEditing(false);
    setSaveError("");
  };

  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (saveError) setSaveError("");
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    playRetroSound("select");
    setSaveError("");
    setSaveSuccess("");
    setSaving(true);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();

      if (res.ok && data.success && data.application) {
        playRetroSound("coin");
        setAppStatus((prev) =>
          prev ? { ...prev, ...data.application } : data.application
        );
        setIsEditing(false);
        setSaveSuccess("Personal details updated successfully!");
        setTimeout(() => setSaveSuccess(""), 4000);
      } else {
        playRetroSound("die");
        setSaveError(data.error || "Failed to update details.");
      }
    } catch {
      playRetroSound("die");
      setSaveError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || status === "loading") {
    return (
      <div className={`${pressStart.variable} font-press-start`}>
        {/* Mobile Loading */}
        <div className="block md:hidden">
          <MobileBackground>
            <div className="flex-1 flex items-center justify-center pt-24 px-4">
              <div
                className="bg-[#C8862A] border-4 border-black p-6 flex flex-col items-center justify-center rounded-sm max-w-xs w-full shadow-[4px_4px_0px_0px_#000]"
              >
                <div
                  className="text-white text-[12px] animate-retro-blink uppercase tracking-widest text-center drop-shadow-[2px_2px_0px_#000]"
                >
                  LOADING GEAR...
                </div>
              </div>
            </div>
          </MobileBackground>
        </div>
        {/* Desktop Loading */}
        <div className="hidden md:flex min-h-[100dvh] bg-[linear-gradient(180deg,#1188EE_0%,#0E8AEA_25%,#1093EB_35%,#1197EC_46%,#16B6F4_52%,#10CBF1_56%,#0FC6F1_60%,#15DEF0_65%,#15DEF0_81%)] items-center justify-center">
          <div
            className="bg-[#C8862A] border-4 border-black p-8 flex items-center justify-center shadow-[8px_8px_0px_0px_#000]"
          >
            <div className="text-white text-[14px] animate-retro-blink uppercase tracking-widest drop-shadow-[2px_2px_0px_#000]">
              LOADING GEAR...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${pressStart.variable} font-press-start`}>
      {/* ── MOBILE VERSION ── */}
      <div className="block md:hidden">
        <MobileProfileView
          session={session}
          appStatus={appStatus}
          router={router}
          onSignOut={handleSignOut}
          isEditing={isEditing}
          editForm={editForm}
          saving={saving}
          saveError={saveError}
          saveSuccess={saveSuccess}
          onStartEdit={handleStartEdit}
          onCancelEdit={handleCancelEdit}
          onFormChange={handleFormChange}
          onSaveEdit={handleSaveEdit}
        />
      </div>

      {/* ── DESKTOP VERSION ── */}
      <div className="hidden md:block">
        <DesktopProfileView
          session={session}
          appStatus={appStatus}
          router={router}
          onSignOut={handleSignOut}
          isEditing={isEditing}
          editForm={editForm}
          saving={saving}
          saveError={saveError}
          saveSuccess={saveSuccess}
          onStartEdit={handleStartEdit}
          onCancelEdit={handleCancelEdit}
          onFormChange={handleFormChange}
          onSaveEdit={handleSaveEdit}
        />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * MOBILE PROFILE VIEW
 * ───────────────────────────────────────────────────────────────────────────── */
function MobileProfileView({
  session,
  appStatus,
  router,
  onSignOut,
  isEditing,
  editForm,
  saving,
  saveError,
  saveSuccess,
  onStartEdit,
  onCancelEdit,
  onFormChange,
  onSaveEdit,
}: {
  session: any;
  appStatus: ApplicationStatus | null;
  router: any;
  onSignOut: () => void;
  isEditing: boolean;
  editForm: {
    fullName: string;
    phone: string;
    regNo: string;
    year: string;
    branch: string;
    whyMic: string;
  };
  saving: boolean;
  saveError: string;
  saveSuccess: string;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onFormChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  onSaveEdit: (e: React.FormEvent) => void;
}) {
  return (
    <MobileBackground>
      {/* Top Header Bar */}
      <div className="relative z-20 flex items-center justify-between px-3 pt-3 flex-shrink-0">
        <img
          src="/mic_logo_pixel.png"
          alt="MIC Logo"
          className="pixelated w-[52px] h-[37px] drop-shadow-[2px_2px_0px_rgba(0,0,0,0.5)] cursor-pointer"
          onClick={() => {
            playRetroSound("select");
            router.push("/recruitments");
          }}
        />
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              playRetroSound("select");
              router.push("/recruitments");
            }}
            className="bg-[#7CA922] hover:bg-[#52AE26] text-black text-[9px] font-bold py-1.5 px-3 border-2 border-black uppercase tracking-wider flex items-center gap-1 cursor-pointer active:translate-y-0.5 shadow-[2px_2px_0px_0px_#000]"
          >
            <ArrowLeft className="h-3 w-3" /> MAP
          </button>
          <button
            onClick={onSignOut}
            className="bg-[#A93710] hover:bg-[#FF4444] text-white text-[9px] font-bold py-1.5 px-3 border-2 border-black uppercase tracking-wider flex items-center gap-1 cursor-pointer active:translate-y-0.5 shadow-[2px_2px_0px_0px_#000]"
          >
            <LogOut className="h-3 w-3" /> EXIT
          </button>
        </div>
      </div>

      {/* Main Scroll Content */}
      <div className="relative z-10 p-4 space-y-5">
        {/* Header / Overall Status Card */}
        <div
          className="bg-[#FFE4D6] border-4 border-black p-4 relative rounded-[8px] shadow-[4px_4px_0px_0px_#000]"
        >
          {/* Header Bar */}
          <div className="bg-[#A05522] border-b-4 border-black -mx-4 -mt-4 mb-4 p-2.5 rounded-t-[4px] flex items-center justify-between">
            <span className="text-white text-[12px] font-bold tracking-widest uppercase drop-shadow-[1px_1px_0px_#000]">
              PLAYER GEAR
            </span>
            <div className="w-2.5 h-2.5 bg-black rounded-full shadow-[1px_1px_0px_#fff]" />
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-[9px] text-black/70 uppercase tracking-wider break-all font-sans">
              {session?.user?.email}
            </p>

            {appStatus && (
              <div
                className="mt-1 bg-white border-2 border-black p-3 flex items-center justify-between shadow-[2px_2px_0px_0px_#000]"
              >
                <span className="text-[9px] font-bold uppercase tracking-wider text-black/70">
                  OVERALL STATUS:
                </span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 border-2 border-black shadow-[1px_1px_0px_0px_#000] ${
                    appStatus.overallStatus === "selected"
                      ? "bg-[#72F418] text-black"
                      : appStatus.overallStatus === "rejected"
                      ? "bg-[#FF4444] text-white"
                      : appStatus.overallStatus === "waitlisted"
                      ? "bg-[#FBBF24] text-black"
                      : "bg-[#1093EB] text-white"
                  }`}
                >
                  {appStatus.overallStatus.replace("-", " ")}
                </span>
              </div>
            )}
          </div>
        </div>

        {!appStatus ? (
          /* Error / No application mobile card */
          <div
            className="bg-[#FFE4D6] border-4 border-black p-6 text-center space-y-4 rounded-[8px] shadow-[4px_4px_0px_0px_#000]"
          >
            <div className="bg-[#A93710] text-white px-3 py-1.5 border-2 border-black text-[10px] uppercase font-bold inline-block shadow-[2px_2px_0px_0px_#000]">
              NO APPLICATION FOUND
            </div>
            <FileText className="h-12 w-12 text-black mx-auto" />
            <p className="text-[10px] text-black uppercase tracking-wide leading-relaxed">
              You have not submitted an application yet.
            </p>
            <button
              onClick={() => {
                playRetroSound("select");
                router.push("/recruitments");
              }}
              className="w-full py-3 bg-[#72F418] hover:bg-[#52AE26] text-black border-2 border-black font-bold text-[10px] uppercase tracking-widest transition-transform active:translate-y-0.5 cursor-pointer shadow-[3px_3px_0px_0px_#000]"
            >
              START APPLICATION
            </button>
          </div>
        ) : (
          <>
            {/* Personal Information Card */}
            <div
              className="bg-[#FFE4D6] border-4 border-black p-4 space-y-4 rounded-[8px] shadow-[4px_4px_0px_0px_#000]"
            >
              <div className="bg-[#1093EB] border-b-4 border-black -mx-4 -mt-4 mb-3 p-2.5 flex items-center justify-between rounded-t-[4px]">
                <span className="text-white text-[10px] font-bold tracking-widest uppercase drop-shadow-[1px_1px_0px_#000]">
                  {isEditing ? "░ EDIT PLAYER DATA ░" : "░ PLAYER DATA ░"}
                </span>
                {!isEditing ? (
                  <button
                    onClick={onStartEdit}
                    className="bg-[#72F418] hover:bg-[#52AE26] text-black text-[8px] font-bold py-1 px-2 border border-black uppercase tracking-wider flex items-center gap-1 cursor-pointer active:translate-y-0.5 shadow-[1px_1px_0px_0px_#000]"
                  >
                    <Edit2 className="h-2.5 w-2.5" /> EDIT
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onCancelEdit}
                    disabled={saving}
                    className="text-white text-[8px] font-bold uppercase underline"
                  >
                    CANCEL
                  </button>
                )}
              </div>

              {saveSuccess && (
                <div className="p-2.5 bg-emerald-100 border-2 border-emerald-500 rounded-sm text-emerald-800 text-[9px] font-sans font-bold flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                  <span>{saveSuccess}</span>
                </div>
              )}

              {saveError && (
                <div className="p-2.5 bg-red-100 border-2 border-red-500 rounded-sm text-red-700 text-[9px] font-sans font-bold flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 text-red-600 flex-shrink-0" />
                  <span>{saveError}</span>
                </div>
              )}

              {isEditing ? (
                <form onSubmit={onSaveEdit} className="space-y-3 font-sans">
                  <div>
                    <label className="text-[8px] font-press-start text-black/70 uppercase tracking-wider mb-1 block">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      value={editForm.fullName}
                      onChange={onFormChange}
                      className="w-full text-[11px] font-bold text-black border-3 border-[#C85A28] focus:border-black bg-white p-2 rounded-sm focus:outline-none shadow-[2px_2px_0px_0px_#000]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[8px] font-press-start text-black/70 uppercase tracking-wider mb-1 block">
                        Phone *
                      </label>
                      <input
                        type="text"
                        name="phone"
                        required
                        value={editForm.phone}
                        onChange={onFormChange}
                        className="w-full text-[10px] font-bold text-black border-3 border-[#C85A28] focus:border-black bg-white p-2 rounded-sm focus:outline-none shadow-[2px_2px_0px_0px_#000]"
                      />
                    </div>
                    <div>
                      <label className="text-[8px] font-press-start text-black/70 uppercase tracking-wider mb-1 block">
                        Reg No *
                      </label>
                      <input
                        type="text"
                        name="regNo"
                        required
                        value={editForm.regNo}
                        onChange={onFormChange}
                        className="w-full text-[10px] font-bold text-black border-3 border-[#C85A28] focus:border-black bg-white p-2 rounded-sm focus:outline-none shadow-[2px_2px_0px_0px_#000]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[8px] font-press-start text-black/70 uppercase tracking-wider mb-1 block">
                        Year *
                      </label>
                      <select
                        name="year"
                        required
                        value={editForm.year}
                        onChange={onFormChange}
                        className="w-full text-[10px] font-bold text-black border-3 border-[#C85A28] focus:border-black bg-white p-2 rounded-sm focus:outline-none cursor-pointer shadow-[2px_2px_0px_0px_#000]"
                      >
                        <option value="">Select</option>
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="text-[8px] font-press-start text-black/70 uppercase tracking-wider mb-1 block">
                        Branch *
                      </label>
                      <input
                        type="text"
                        name="branch"
                        required
                        value={editForm.branch}
                        onChange={onFormChange}
                        className="w-full text-[10px] font-bold text-black border-3 border-[#C85A28] focus:border-black bg-white p-2 rounded-sm focus:outline-none shadow-[2px_2px_0px_0px_#000]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[8px] font-press-start text-black/70 uppercase tracking-wider mb-1 block">
                      Why MIC? *
                    </label>
                    <textarea
                      name="whyMic"
                      rows={3}
                      required
                      value={editForm.whyMic}
                      onChange={onFormChange}
                      className="w-full text-[11px] text-black border-3 border-[#C85A28] focus:border-black bg-white p-2.5 rounded-sm leading-normal resize-none focus:outline-none shadow-[2px_2px_0px_0px_#000]"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={onCancelEdit}
                      disabled={saving}
                      className="flex-1 bg-[#A93710] hover:bg-[#FF4444] text-white text-[9px] font-bold py-2 border-2 border-black uppercase tracking-wider cursor-pointer active:translate-y-0.5 shadow-[2px_2px_0px_0px_#000]"
                    >
                      CANCEL
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 bg-[#72F418] hover:bg-[#52AE26] text-black text-[9px] font-bold py-2 border-2 border-black uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer active:translate-y-0.5 disabled:opacity-50 shadow-[2px_2px_0px_0px_#000]"
                    >
                      {saving ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Save className="h-3 w-3" />
                      )}
                      {saving ? "SAVING..." : "SAVE"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-3 font-sans">
                  <div>
                    <p className="text-[8px] font-press-start text-black/70 uppercase tracking-wider mb-1">
                      Full Name
                    </p>
                    <div
                      className="text-[11px] font-bold text-black border-2 border-black bg-white p-2 rounded-sm shadow-[2px_2px_0px_0px_#000]"
                    >
                      {appStatus.fullName || "—"}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[8px] font-press-start text-black/70 uppercase tracking-wider mb-1">
                        Phone
                      </p>
                      <div
                        className="text-[10px] font-bold text-black border-2 border-black bg-white p-2 rounded-sm truncate shadow-[2px_2px_0px_0px_#000]"
                      >
                        {appStatus.phone || "—"}
                      </div>
                    </div>
                    <div>
                      <p className="text-[8px] font-press-start text-black/70 uppercase tracking-wider mb-1">
                        Reg No
                      </p>
                      <div
                        className="text-[10px] font-bold text-black border-2 border-black bg-white p-2 rounded-sm truncate shadow-[2px_2px_0px_0px_#000]"
                      >
                        {appStatus.regNo || "—"}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <p className="text-[8px] font-press-start text-black/70 uppercase tracking-wider mb-1">
                        Year
                      </p>
                      <div
                        className="text-[10px] font-bold text-black border-2 border-black bg-white p-2 rounded-sm truncate shadow-[2px_2px_0px_0px_#000]"
                      >
                        {appStatus.year || "—"}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[8px] font-press-start text-black/70 uppercase tracking-wider mb-1">
                        Branch
                      </p>
                      <div
                        className="text-[10px] font-bold text-black border-2 border-black bg-white p-2 rounded-sm truncate shadow-[2px_2px_0px_0px_#000]"
                      >
                        {appStatus.branch || "—"}
                      </div>
                    </div>
                  </div>

                  {appStatus.whyMic && (
                    <div>
                      <p className="text-[8px] font-press-start text-black/70 uppercase tracking-wider mb-1">
                        Why MIC?
                      </p>
                      <div
                        className="text-[11px] text-black border-2 border-black bg-white p-2.5 rounded-sm leading-normal max-h-32 overflow-y-auto shadow-[2px_2px_0px_0px_#000]"
                      >
                        {appStatus.whyMic}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Preference 1 Timeline */}
            <MobileTimelineCard
              title="1ST PREFERENCE"
              prefName={appStatus.firstPreference}
              prefStatus={appStatus.firstPrefProgress.status}
              stages={appStatus.firstPrefProgress.stages}
            />

            {/* Preference 2 Timeline (if present) */}
            {appStatus.secondPreference && appStatus.secondPrefProgress && (
              <MobileTimelineCard
                title="2ND PREFERENCE"
                prefName={appStatus.secondPreference}
                prefStatus={appStatus.secondPrefProgress.status}
                stages={appStatus.secondPrefProgress.stages}
              />
            )}
          </>
        )}
      </div>
    </MobileBackground>
  );
}

/* ── Mobile Preference Timeline Component ── */
function MobileTimelineCard({
  title,
  prefName,
  prefStatus,
  stages,
}: {
  title: string;
  prefName: string;
  prefStatus: string;
  stages: StageProgress[];
}) {
  return (
    <div
      className="bg-[#FFE4D6] border-4 border-black p-4 space-y-4 rounded-[8px] shadow-[4px_4px_0px_0px_#000]"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-black pb-3">
        <div>
          <p className="text-[8px] font-bold text-black/60 uppercase tracking-widest">
            {title}
          </p>
          <h2 className="text-[13px] font-bold text-black uppercase tracking-wider drop-shadow-[1px_1px_0px_#fff]">
            {prefName.replace("-", " ")}
          </h2>
        </div>
        <div
          className={`px-2 py-1 border-2 border-black text-[9px] uppercase font-bold tracking-wider shadow-[2px_2px_0px_0px_#000] ${
            prefStatus === "active"
              ? "bg-[#1093EB] text-white"
              : prefStatus === "passed"
              ? "bg-[#72F418] text-black"
              : prefStatus === "rejected"
              ? "bg-[#FF4444] text-white"
              : "bg-slate-300 text-black"
          }`}
        >
          {prefStatus}
        </div>
      </div>

      {/* Stages List */}
      <div className="relative pl-5 border-l-4 border-black space-y-4 pt-1">
        {stages.length === 0 ? (
          <p className="text-[9px] text-black/70 uppercase tracking-wider">
            No stages submitted yet.
          </p>
        ) : (
          stages.map((stage, idx) => (
            <div key={idx} className="relative">
              {/* Timeline Dot */}
              <div
                className={`absolute -left-[27px] top-1.5 h-4 w-4 border-2 border-black shadow-[1px_1px_0px_0px_#000] ${
                  stage.result === "passed"
                    ? "bg-[#72F418]"
                    : stage.result === "failed"
                    ? "bg-[#FF4444]"
                    : "bg-[#FBBF24]"
                }`}
              />

              <div
                className="bg-white border-2 border-black p-3 space-y-2 shadow-[2px_2px_0px_0px_#000]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-black uppercase">
                    Stage {stage.stage}
                  </span>
                  <span className="text-[8px] text-black/60 font-semibold uppercase">
                    {new Date(stage.submittedAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-2 border-t border-dashed border-black/30 pt-2">
                  {stage.result === "passed" ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-[#52AE26]" />
                      <span className="text-[9px] font-bold text-[#52AE26] uppercase">
                        PASSED
                      </span>
                    </>
                  ) : stage.result === "failed" ? (
                    <>
                      <XCircle className="h-4 w-4 text-[#FF4444]" />
                      <span className="text-[9px] font-bold text-[#FF4444] uppercase">
                        NOT SELECTED
                      </span>
                    </>
                  ) : (
                    <>
                      <Clock className="h-4 w-4 text-[#D97706]" />
                      <span className="text-[9px] font-bold text-[#D97706] uppercase">
                        UNDER REVIEW
                      </span>
                    </>
                  )}
                </div>

                {stage.adminNote && (
                  <div className="mt-2 p-2 bg-[#FFF4E6] border border-black text-[9px] leading-normal font-sans shadow-[1px_1px_0px_0px_#000]">
                    <p className="font-bold text-[#A93710] font-press-start text-[8px] uppercase mb-1">
                      ADMIN NOTE:
                    </p>
                    <p className="text-black uppercase">{stage.adminNote}</p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * DESKTOP PROFILE VIEW
 * ───────────────────────────────────────────────────────────────────────────── */
function DesktopProfileView({
  session,
  appStatus,
  router,
  onSignOut,
  isEditing,
  editForm,
  saving,
  saveError,
  saveSuccess,
  onStartEdit,
  onCancelEdit,
  onFormChange,
  onSaveEdit,
}: {
  session: any;
  appStatus: ApplicationStatus | null;
  router: any;
  onSignOut: () => void;
  isEditing: boolean;
  editForm: {
    fullName: string;
    phone: string;
    regNo: string;
    year: string;
    branch: string;
    whyMic: string;
  };
  saving: boolean;
  saveError: string;
  saveSuccess: string;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onFormChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  onSaveEdit: (e: React.FormEvent) => void;
}) {
  const MARQUEE_TEXT = "MICROSOFT INNOVATIONS CLUB TENURE 2026-2027";

  return (
    <div className="min-h-[100dvh] relative overflow-x-hidden bg-[#1093EB] select-none">
      {/* ── Fixed Sky Gradient Background ── */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg,#1188EE 0%,#0E8AEA 25%,#1093EB 35%,#1197EC 46%,#16B6F4 52%,#10CBF1 56%,#0FC6F1 60%,#15DEF0 65%,#15DEF0 81%)",
        }}
      />

      {/* ── Floating Clouds Background ── */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          src="/pixel_cloud_small.svg"
          alt=""
          className="absolute top-[80px] left-[5%] w-[240px] opacity-80 animate-retro-float pixelated"
          style={{ animationDelay: "0s" }}
        />
        <img
          src="/pixel_cloud_small.svg"
          alt=""
          className="absolute top-[40px] right-[10%] w-[280px] opacity-75 animate-retro-float pixelated"
          style={{ animationDelay: "1.2s" }}
        />
        <img
          src="/pixel_cloud_small.svg"
          alt=""
          className="absolute top-[260px] left-[45%] w-[200px] opacity-65 animate-retro-float pixelated"
          style={{ animationDelay: "0.7s" }}
        />
        <img
          src="/pixel_cloud_small.svg"
          alt=""
          className="absolute top-[180px] right-[4%] w-[220px] opacity-70 animate-retro-float pixelated"
          style={{ animationDelay: "2.1s" }}
        />
      </div>

      {/* ── Fixed Bottom Ground & Skyline Scene ── */}
      <div
        className="fixed bottom-0 left-0 w-full pointer-events-none z-0 overflow-hidden"
        style={{ height: "160px" }}
      >
        {/* City Skyline */}
        <div
          className="absolute w-full overflow-hidden flex"
          style={{ bottom: "35px", height: "130px" }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <img
              key={`city-${i}`}
              src="/city_skyline.svg"
              alt=""
              className="h-full pixelated opacity-70 flex-shrink-0"
              style={{ width: "20%", marginLeft: i === 0 ? "0" : "-2%" }}
            />
          ))}
        </div>

        {/* Bushes Strip */}
        <div
          className="absolute w-full z-10"
          style={{ bottom: "35px", height: "90px" }}
        >
          <div
            className="w-full h-full pixelated"
            style={{
              backgroundImage: "url(/bushes_pixel.svg)",
              backgroundRepeat: "repeat-x",
              backgroundSize: "auto 100%",
              backgroundPosition: "bottom",
            }}
          />
        </div>

        {/* Checkerboard Ground Strip */}
        <div
          className="absolute bottom-0 w-full border-t-4 border-black border-b-4 z-20"
          style={{
            height: "35px",
            background:
              "repeating-linear-gradient(45deg, #72F418, #72F418 14px, #52AE26 14px, #52AE26 28px)",
          }}
        />
      </div>

      {/* ── Sticky Top Marquee Footer Bar ── */}
      <div
        className="fixed bottom-0 left-0 w-full z-40 bg-[#DD9955] border-t-4 border-black overflow-hidden flex items-center pointer-events-none"
        style={{ height: "45px" }}
      >
        <div className="flex whitespace-nowrap animate-marquee">
          <span className="inline-flex items-center shrink-0 text-[14px] text-[#CC7700] tracking-wider uppercase font-bold">
            {Array(8)
              .fill(MARQUEE_TEXT)
              .map((text, idx) => (
                <React.Fragment key={`mq-desk-1-${idx}`}>
                  <span>{text}</span>
                  <img
                    src="/mic_logo_pixel.png"
                    alt="MIC"
                    className="w-5 h-5 mx-6 shrink-0"
                  />
                </React.Fragment>
              ))}
          </span>
          <span className="inline-flex items-center shrink-0 text-[14px] text-[#CC7700] tracking-wider uppercase font-bold">
            {Array(8)
              .fill(MARQUEE_TEXT)
              .map((text, idx) => (
                <React.Fragment key={`mq-desk-2-${idx}`}>
                  <span>{text}</span>
                  <img
                    src="/mic_logo_pixel.png"
                    alt="MIC"
                    className="w-5 h-5 mx-6 shrink-0"
                  />
                </React.Fragment>
              ))}
          </span>
        </div>
      </div>

      {/* ── Back Button (Fixed Left) ── */}
      <BackButton
        onClick={() => {
          playRetroSound("select");
          router.push("/recruitments");
        }}
      />

      {/* ── Top Bar Action (Fixed Right: Sign Out) ── */}
      <div className="fixed top-6 right-8 z-[100]">
        <button
          onClick={onSignOut}
          className="flex items-center gap-2 bg-[#A93710] hover:bg-[#FF4444] text-white px-5 py-2.5 border-4 border-black text-[11px] uppercase tracking-widest transition-transform hover:-translate-y-1 active:translate-y-0 shadow-[4px_4px_0px_0px_#000] cursor-pointer font-bold"
        >
          <LogOut className="h-4 w-4" /> SIGN OUT
        </button>
      </div>

      {/* ── Main Scroll Container ── */}
      <div className="relative z-10 max-w-[1050px] w-full mx-auto px-6 pt-10 pb-36 space-y-10">
        {!appStatus ? (
          /* Error / No application desktop card */
          <div className="flex items-center justify-center pt-20">
            <div
              className="bg-[#FFE4D6] border-4 border-black p-10 max-w-lg w-full text-center space-y-6 rounded-[12px] shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] relative"
            >
              {/* Hanging Wood Ropes */}
              <div
                className="absolute bottom-[100%] w-3 z-[-1]"
                style={{
                  left: "12%",
                  height: "100vh",
                  background:
                    "repeating-linear-gradient(to bottom, #CC8844 0, #CC8844 12px, #A05522 12px, #A05522 16px)",
                  borderLeft: "2px solid #000",
                  borderRight: "2px solid #000",
                }}
              />
              <div
                className="absolute bottom-[100%] w-3 z-[-1]"
                style={{
                  right: "12%",
                  height: "100vh",
                  background:
                    "repeating-linear-gradient(to bottom, #CC8844 0, #CC8844 12px, #A05522 12px, #A05522 16px)",
                  borderLeft: "2px solid #000",
                  borderRight: "2px solid #000",
                }}
              />

              <div
                className="bg-[#A93710] text-white px-5 py-2 border-2 border-black text-[12px] uppercase tracking-widest font-bold inline-block shadow-[4px_4px_0px_0px_#000]"
              >
                ERROR: NO APPLICATION FOUND
              </div>
              <FileText className="h-16 w-16 text-black mx-auto" />
              <p className="text-[12px] leading-loose text-black uppercase tracking-wide">
                You have not submitted an application yet.
              </p>
              <button
                onClick={() => {
                  playRetroSound("select");
                  router.push("/recruitments");
                }}
                className="mt-4 px-6 py-4 bg-[#72F418] hover:bg-[#52AE26] text-black border-4 border-black font-bold text-[12px] uppercase tracking-widest transition-transform hover:-translate-y-1 active:translate-y-0 w-full shadow-[4px_4px_0px_0px_#000] cursor-pointer"
              >
                START APPLICATION
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Header / Gear Card */}
            <div
              className="bg-[#FFE4D6] border-4 border-black rounded-[12px] shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] relative overflow-hidden"
            >
              {/* Hanging Wood Ropes */}
              <div
                className="absolute bottom-[100%] w-3 z-[-1]"
                style={{
                  left: "8%",
                  height: "100vh",
                  background:
                    "repeating-linear-gradient(to bottom, #CC8844 0, #CC8844 12px, #A05522 12px, #A05522 16px)",
                  borderLeft: "2px solid #000",
                  borderRight: "2px solid #000",
                }}
              />
              <div
                className="absolute bottom-[100%] w-3 z-[-1]"
                style={{
                  right: "8%",
                  height: "100vh",
                  background:
                    "repeating-linear-gradient(to bottom, #CC8844 0, #CC8844 12px, #A05522 12px, #A05522 16px)",
                  borderLeft: "2px solid #000",
                  borderRight: "2px solid #000",
                }}
              />

              {/* Wooden Banner Header */}
              <div className="bg-[#A05522] border-b-4 border-black p-5 px-6 flex items-center justify-between relative">
                <span className="text-white text-[16px] md:text-[20px] font-bold tracking-widest drop-shadow-[2px_2px_0px_#000] uppercase">
                  PLAYER GEAR &amp; INVENTORY
                </span>
                <button
                  onClick={() => {
                    playRetroSound("select");
                    router.push("/recruitments");
                  }}
                  className="bg-[#7CA922] hover:bg-[#52AE26] text-black text-[10px] font-bold py-1.5 px-3 border-2 border-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_0px_#000] hover:-translate-y-0.5 active:translate-y-0 transition-transform"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> BACK TO MAP
                </button>
              </div>

              {/* Main Content inside Header Card */}
              <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-black tracking-widest uppercase drop-shadow-[2px_2px_0px_#fff]">
                    PLAYER STATUS
                  </h1>
                  <p className="text-[11px] text-black/70 uppercase tracking-widest break-all font-sans font-semibold">
                    {session?.user?.email}
                  </p>
                </div>

                <div
                  className="bg-white border-4 border-black px-6 py-4 flex flex-col gap-1.5 shadow-[4px_4px_0px_0px_#000] rounded-[6px]"
                >
                  <p className="text-[9px] uppercase tracking-widest font-bold text-black/60">
                    OVERALL STATUS
                  </p>
                  <p
                    className={`text-[13px] font-bold uppercase tracking-widest px-3 py-1 border-2 border-black shadow-[2px_2px_0px_0px_#000] ${
                      appStatus.overallStatus === "selected"
                        ? "bg-[#72F418] text-black"
                        : appStatus.overallStatus === "rejected"
                        ? "bg-[#FF4444] text-white"
                        : appStatus.overallStatus === "waitlisted"
                        ? "bg-[#FBBF24] text-black"
                        : "bg-[#1093EB] text-white"
                    }`}
                  >
                    {appStatus.overallStatus.replace("-", " ")}
                  </p>
                </div>
              </div>
            </div>

            {/* Personal Information Card */}
            <div
              className="bg-[#FFE4D6] border-4 border-black rounded-[12px] shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] overflow-hidden"
            >
              {/* Card Banner Header */}
              <div className="bg-[#1093EB] border-b-4 border-black p-5 px-6 flex items-center justify-between">
                <h2 className="text-[14px] sm:text-[16px] font-black text-white uppercase tracking-widest drop-shadow-[1px_1px_0px_#000]">
                  {isEditing ? "░ EDIT PLAYER DATA ░" : "░ PLAYER DATA ░"}
                </h2>
                {!isEditing ? (
                  <button
                    onClick={onStartEdit}
                    className="bg-[#72F418] hover:bg-[#52AE26] text-black text-[10px] font-bold px-4 py-2 border-2 border-black uppercase tracking-widest flex items-center gap-2 transition-transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shadow-[2px_2px_0px_0px_#000]"
                  >
                    <Edit2 className="h-3.5 w-3.5" /> EDIT DETAILS
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={onCancelEdit}
                      disabled={saving}
                      className="bg-[#A93710] hover:bg-[#FF4444] text-white text-[10px] font-bold px-4 py-2 border-2 border-black uppercase tracking-widest transition-transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shadow-[2px_2px_0px_0px_#000]"
                    >
                      CANCEL
                    </button>
                    <button
                      type="button"
                      onClick={onSaveEdit}
                      disabled={saving}
                      className="bg-[#72F418] hover:bg-[#52AE26] text-black text-[10px] font-bold px-4 py-2 border-2 border-black uppercase tracking-widest flex items-center gap-2 transition-transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer disabled:opacity-50 shadow-[2px_2px_0px_0px_#000]"
                    >
                      {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      {saving ? "SAVING..." : "SAVE CHANGES"}
                    </button>
                  </div>
                )}
              </div>

              <div className="p-6 md:p-8 space-y-6">
                {saveSuccess && (
                  <div className="p-3 bg-emerald-100 border-2 border-emerald-500 rounded text-emerald-800 text-xs font-sans font-bold flex items-center gap-2 shadow-[2px_2px_0px_0px_#000]">
                    <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                    <span>{saveSuccess}</span>
                  </div>
                )}

                {saveError && (
                  <div className="p-3 bg-red-100 border-2 border-red-500 rounded text-red-700 text-xs font-sans font-bold flex items-center gap-2 shadow-[2px_2px_0px_0px_#000]">
                    <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                    <span>{saveError}</span>
                  </div>
                )}

                {isEditing ? (
                  <form
                    onSubmit={onSaveEdit}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-sans"
                  >
                    <div className="space-y-1">
                      <label className="text-[9px] font-press-start text-black/70 uppercase tracking-wider block">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        required
                        value={editForm.fullName}
                        onChange={onFormChange}
                        className="w-full text-sm font-bold text-black border-3 border-[#C85A28] focus:border-black bg-white p-3 rounded focus:outline-none shadow-[2px_2px_0px_0px_#000]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-press-start text-black/70 uppercase tracking-wider block">
                        Phone Number *
                      </label>
                      <input
                        type="text"
                        name="phone"
                        required
                        value={editForm.phone}
                        onChange={onFormChange}
                        className="w-full text-sm font-bold text-black border-3 border-[#C85A28] focus:border-black bg-white p-3 rounded focus:outline-none shadow-[2px_2px_0px_0px_#000]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-press-start text-black/70 uppercase tracking-wider block">
                        Registration Number *
                      </label>
                      <input
                        type="text"
                        name="regNo"
                        required
                        value={editForm.regNo}
                        onChange={onFormChange}
                        className="w-full text-sm font-bold text-black border-3 border-[#C85A28] focus:border-black bg-white p-3 rounded focus:outline-none shadow-[2px_2px_0px_0px_#000]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-press-start text-black/70 uppercase tracking-wider block">
                        Year of Study *
                      </label>
                      <select
                        name="year"
                        required
                        value={editForm.year}
                        onChange={onFormChange}
                        className="w-full text-sm font-bold text-black border-3 border-[#C85A28] focus:border-black bg-white p-3 rounded focus:outline-none cursor-pointer shadow-[2px_2px_0px_0px_#000]"
                      >
                        <option value="">Select Year</option>
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                      </select>
                    </div>

                    <div className="space-y-1 md:col-span-2 lg:col-span-2">
                      <label className="text-[9px] font-press-start text-black/70 uppercase tracking-wider block">
                        Branch / Programme *
                      </label>
                      <input
                        type="text"
                        name="branch"
                        required
                        value={editForm.branch}
                        onChange={onFormChange}
                        className="w-full text-sm font-bold text-black border-3 border-[#C85A28] focus:border-black bg-white p-3 rounded focus:outline-none shadow-[2px_2px_0px_0px_#000]"
                      />
                    </div>

                    <div className="space-y-1 md:col-span-2 lg:col-span-3">
                      <label className="text-[9px] font-press-start text-black/70 uppercase tracking-wider block">
                        Why do you want to join MIC? *
                      </label>
                      <textarea
                        name="whyMic"
                        rows={4}
                        required
                        value={editForm.whyMic}
                        onChange={onFormChange}
                        className="w-full text-sm text-black border-3 border-[#C85A28] focus:border-black bg-white p-3 rounded leading-relaxed focus:outline-none resize-none shadow-[2px_2px_0px_0px_#000]"
                      />
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-sans">
                    <div className="space-y-1">
                      <p className="text-[9px] font-press-start text-black/70 uppercase tracking-wider">
                        Full Name
                      </p>
                      <p
                        className="text-sm font-bold text-black border-2 border-black bg-white p-3 rounded shadow-[2px_2px_0px_0px_#000]"
                      >
                        {appStatus.fullName || "—"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-press-start text-black/70 uppercase tracking-wider">
                        Phone Number
                      </p>
                      <p
                        className="text-sm font-bold text-black border-2 border-black bg-white p-3 rounded shadow-[2px_2px_0px_0px_#000]"
                      >
                        {appStatus.phone || "—"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-press-start text-black/70 uppercase tracking-wider">
                        Registration Number
                      </p>
                      <p
                        className="text-sm font-bold text-black border-2 border-black bg-white p-3 rounded shadow-[2px_2px_0px_0px_#000]"
                      >
                        {appStatus.regNo || "—"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-press-start text-black/70 uppercase tracking-wider">
                        Year of Study
                      </p>
                      <p
                        className="text-sm font-bold text-black border-2 border-black bg-white p-3 rounded shadow-[2px_2px_0px_0px_#000]"
                      >
                        {appStatus.year || "—"}
                      </p>
                    </div>
                    <div className="space-y-1 md:col-span-2 lg:col-span-2">
                      <p className="text-[9px] font-press-start text-black/70 uppercase tracking-wider">
                        Branch / Programme
                      </p>
                      <p
                        className="text-sm font-bold text-black border-2 border-black bg-white p-3 rounded shadow-[2px_2px_0px_0px_#000]"
                      >
                        {appStatus.branch || "—"}
                      </p>
                    </div>
                    {appStatus.whyMic ? (
                      <div className="space-y-1 md:col-span-2 lg:col-span-3">
                        <p className="text-[9px] font-press-start text-black/70 uppercase tracking-wider">
                          Why do you want to join MIC?
                        </p>
                        <p
                          className="text-sm text-black border-2 border-black bg-white p-3 rounded leading-relaxed shadow-[2px_2px_0px_0px_#000]"
                        >
                          {appStatus.whyMic}
                        </p>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>

            {/* Timelines (1st Preference & 2nd Preference) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
              <DesktopTimelineCard
                title="1ST PREFERENCE QUEST LOG"
                prefName={appStatus.firstPreference}
                prefStatus={appStatus.firstPrefProgress.status}
                stages={appStatus.firstPrefProgress.stages}
              />

              {appStatus.secondPreference && appStatus.secondPrefProgress && (
                <DesktopTimelineCard
                  title="2ND PREFERENCE QUEST LOG"
                  prefName={appStatus.secondPreference}
                  prefStatus={appStatus.secondPrefProgress.status}
                  stages={appStatus.secondPrefProgress.stages}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Desktop Preference Timeline Component ── */
function DesktopTimelineCard({
  title,
  prefName,
  prefStatus,
  stages,
}: {
  title: string;
  prefName: string;
  prefStatus: string;
  stages: StageProgress[];
}) {
  return (
    <div
      className="bg-[#FFE4D6] border-4 border-black rounded-[12px] shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] overflow-hidden space-y-0"
    >
      {/* Top Wooden Header */}
      <div className="bg-[#A93710] border-b-4 border-black p-4 px-6 flex items-center justify-between">
        <div>
          <p className="text-[9px] font-bold text-white/70 uppercase tracking-widest">
            {title}
          </p>
          <h2 className="text-[15px] font-black text-white uppercase tracking-wider drop-shadow-[1px_1px_0px_#000]">
            {prefName.replace("-", " ")}
          </h2>
        </div>
        <div
          className={`px-3 py-1.5 border-2 border-black text-[10px] uppercase font-bold tracking-widest shadow-[2px_2px_0px_0px_#000] ${
            prefStatus === "active"
              ? "bg-[#1093EB] text-white"
              : prefStatus === "passed"
              ? "bg-[#72F418] text-black"
              : prefStatus === "rejected"
              ? "bg-[#FF4444] text-white"
              : "bg-slate-300 text-black"
          }`}
        >
          {prefStatus}
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-6">
        <div className="relative pl-6 border-l-4 border-black space-y-8 pt-2">
          {stages.length === 0 ? (
            <div className="text-[10px] text-black/70 uppercase tracking-widest">
              No stages submitted yet.
            </div>
          ) : (
            stages.map((stage, idx) => (
              <div key={idx} className="relative">
                {/* Timeline Dot */}
                <div
                  className={`absolute -left-[37px] top-1.5 h-6 w-6 border-3 border-black shadow-[2px_2px_0px_0px_#000] ${
                    stage.result === "passed"
                      ? "bg-[#72F418]"
                      : stage.result === "failed"
                      ? "bg-[#FF4444]"
                      : "bg-[#FBBF24]"
                  }`}
                />

                <div
                  className="bg-white border-4 border-black p-5 space-y-4 shadow-[4px_4px_0px_0px_#000] rounded-[6px]"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b-2 border-dashed border-black/20 pb-3">
                    <h3 className="text-[12px] font-bold text-black uppercase tracking-widest">
                      Stage {stage.stage} Submitted
                    </h3>
                    <span className="text-[10px] text-black/60 font-semibold uppercase tracking-widest">
                      {new Date(stage.submittedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {stage.result === "passed" ? (
                      <>
                        <CheckCircle2 className="h-5 w-5 text-[#52AE26]" />
                        <span className="text-[11px] font-bold text-[#52AE26] uppercase tracking-widest">
                          PASSED
                        </span>
                      </>
                    ) : stage.result === "failed" ? (
                      <>
                        <XCircle className="h-5 w-5 text-[#FF4444]" />
                        <span className="text-[11px] font-bold text-[#FF4444] uppercase tracking-widest">
                          NOT SELECTED
                        </span>
                      </>
                    ) : (
                      <>
                        <Clock className="h-5 w-5 text-[#D97706]" />
                        <span className="text-[11px] font-bold text-[#D97706] uppercase tracking-widest">
                          UNDER REVIEW
                        </span>
                      </>
                    )}
                  </div>

                  {stage.adminNote && (
                    <div className="mt-3 p-4 bg-[#FFF4E6] border-2 border-black shadow-[2px_2px_0px_0px_#000] rounded-sm">
                      <p className="text-[9px] text-[#A93710] font-bold uppercase tracking-widest mb-2 font-press-start">
                        ADMIN NOTE:
                      </p>
                      <p className="text-[11px] text-black leading-relaxed uppercase font-sans font-semibold">
                        {stage.adminNote}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog } from "@/components/ui/dialog";

interface StageSubmission {
  stage: number;
  submittedAt: string;
  result: "pending" | "passed" | "failed";
  adminNote?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  responses: Record<string, unknown>;
  scores?: Record<string, number>;
}

interface PrefProgress {
  currentStage: number;
  status: string;
  stages: StageSubmission[];
}

interface Application {
  _id: string;
  userEmail: string;
  firstPreference: string;
  secondPreference: string;
  firstPrefType: string;
  secondPrefType: string;
  activePreference: "first" | "second";
  overallStatus: string;
  firstPrefProgress: PrefProgress;
  secondPrefProgress: PrefProgress;
  createdAt: string;
}

const DEPT_NAMES: Record<string, string> = {
  development: "Development",
  "competitive-coding": "Competitive Coding",
  "ui-ux": "UI/UX",
  "ai-ml": "AI/ML",
  "cyber-security": "Cyber Security",
  design: "Design",
  management: "Management",
  entrepreneurship: "Entrepreneurship",
  "content-media": "Content & Media",
};

function ResponseViewer({ responses }: { responses: Record<string, unknown> }) {
  return (
    <div className="space-y-4">
      {Object.entries(responses).map(([key, val]) => (
        <div key={key} className="space-y-1.5">
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-extrabold">{key}</p>
          <div className="text-sm text-zinc-200 bg-zinc-950 border border-zinc-900 rounded-xl p-4 leading-relaxed whitespace-pre-wrap">
            {Array.isArray(val) ? val.join(", ") : String(val ?? "—")}
          </div>
        </div>
      ))}
    </div>
  );
}

function PrefPanel({
  progress,
  deptSlug,
  label,
  onActionTrigger,
  acting,
}: {
  progress: PrefProgress;
  deptSlug: string;
  label: string;
  onActionTrigger: (preference: "first" | "second", action: "advance" | "reject", note: string, scores?: Record<string, number>) => void;
  acting: boolean;
}) {
  const prefKey = label === "1st Preference" ? "first" : "second";
  const [note, setNote] = useState("");
  const [scores, setScores] = useState<Record<string, number>>({ technical: 0, communication: 0, creativity: 0 });
  const [expanded, setExpanded] = useState<number | null>(null);

  const currentStageSubmission = progress.stages.find(
    (s) => s.stage === progress.currentStage
  );
  const canAct =
    progress.status === "active" &&
    currentStageSubmission &&
    currentStageSubmission.result === "pending";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-zinc-900">
        <div>
          <CardDescription className="text-[10px] uppercase font-extrabold tracking-widest text-zinc-500">
            {label}
          </CardDescription>
          <CardTitle className="text-base font-extrabold mt-0.5">
            {DEPT_NAMES[deptSlug] ?? deptSlug}
          </CardTitle>
        </div>
        <Badge
          variant={
            progress.status === "active"
              ? "info"
              : progress.status === "passed"
              ? "success"
              : progress.status === "rejected"
              ? "destructive"
              : "default"
          }
        >
          {progress.status}
        </Badge>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Stage submissions list */}
        <div className="space-y-3.5">
          {progress.stages
            .filter((sub) => sub.stage > 1)
            .map((sub) => (
              <div key={sub.stage} className="border border-zinc-900 rounded-xl overflow-hidden bg-zinc-950/10">
                <button
                  onClick={() => setExpanded(expanded === sub.stage ? null : sub.stage)}
                  className="w-full flex items-center justify-between p-4 hover:bg-zinc-950/30 transition-all cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3">
                    {sub.result === "passed" ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : sub.result === "failed" ? (
                      <XCircle className="h-4 w-4 text-rose-400" />
                    ) : (
                      <Clock className="h-4 w-4 text-amber-400" />
                    )}
                    <span className="text-xs font-bold text-white">Stage {sub.stage - 1} evaluation</span>
                    <span className="text-[10px] font-bold text-zinc-500">
                      {new Date(sub.submittedAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <ChevronRight
                    className={`h-4 w-4 text-zinc-500 transition-transform ${
                      expanded === sub.stage ? "rotate-90" : ""
                    }`}
                  />
                </button>

                {expanded === sub.stage && (
                  <div className="p-4 pt-0 border-t border-zinc-900 space-y-4">
                    <div className="mt-4">
                      <ResponseViewer responses={sub.responses} />
                    </div>

                    {sub.scores && Object.keys(sub.scores).length > 0 && (
                      <div className="p-3.5 rounded-xl bg-teal-500/5 border border-teal-500/10 grid grid-cols-3 gap-2">
                        {Object.entries(sub.scores).map(([metric, score]) => (
                          <div key={metric} className="text-center sm:text-left">
                            <span className="text-[10px] text-zinc-500 uppercase font-extrabold tracking-wider block">
                              {metric}
                            </span>
                            <span className="text-sm font-extrabold text-teal-400 mt-0.5 block">
                              {score} / 5
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {sub.adminNote && (
                      <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/10">
                        <span className="text-[10px] text-amber-400 uppercase font-extrabold tracking-wider block">
                          Evaluation Note
                        </span>
                        <p className="text-xs text-zinc-300 mt-1.5 leading-relaxed">{sub.adminNote}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

          {progress.stages.filter((sub) => sub.stage > 1).length === 0 && (
            <div className="text-center py-6 border border-dashed border-zinc-900 rounded-xl">
              <p className="text-xs text-zinc-500 font-semibold">No submissions received for evaluation</p>
            </div>
          )}
        </div>

        {/* Action Panel */}
        {canAct && (
          <div className="border-t border-zinc-900 pt-6 space-y-4">
            <Badge variant="warning" className="uppercase font-bold tracking-wider text-[10px]">
              Reviewing Stage {progress.currentStage - 1} Submission
            </Badge>

            <div className="space-y-1.5">
              <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-extrabold block">
                Evaluation Notes (visible to applicant)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Write stage evaluation details, feedback, or interview instructions..."
                rows={3}
                className="w-full bg-zinc-950 border border-zinc-900 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-zinc-750 resize-none transition-all"
              />
            </div>

            <div className="space-y-3 bg-zinc-950 border border-zinc-900 rounded-xl p-4">
              <p className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">
                Grading Rubric (Required to Advance)
              </p>
              {["Technical", "Communication", "Creativity"].map((metric) => {
                const key = metric.toLowerCase();
                return (
                  <div key={metric} className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-bold text-zinc-300">{metric} score</span>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setScores((s) => ({ ...s, [key]: val }))}
                          className={`h-8 w-8 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                            scores[key] === val
                              ? "bg-teal-500 text-slate-950 shadow-[0_0_10px_rgba(20,184,166,0.3)]"
                              : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="destructive"
                onClick={() => onActionTrigger(prefKey, "reject", note)}
                disabled={acting}
                className="flex-1 font-bold h-11"
              >
                Reject Candidate
              </Button>
              <Button
                variant="emerald"
                onClick={() => {
                  if (Object.values(scores).some((s) => s === 0)) {
                    alert("Please grade all Rubric criteria (1-5) before advancing.");
                    return;
                  }
                  onActionTrigger(prefKey, "advance", note, scores);
                }}
                disabled={acting}
                className="flex-1 font-bold h-11"
              >
                Advance Stage
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ApplicantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [message, setMessage] = useState("");

  // Custom alert confirmation dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    preference: "first" | "second";
    action: "advance" | "reject";
    note: string;
    scores?: Record<string, number>;
  } | null>(null);

  const load = async () => {
    try {
      const res = await fetch(`/api/admin/applications/${id}`);
      const data = await res.json();
      if (data.success) setApplication(data.application);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleActionConfirmTrigger = (
    preference: "first" | "second",
    action: "advance" | "reject",
    note: string,
    scores?: Record<string, number>
  ) => {
    setConfirmDialog({
      isOpen: true,
      preference,
      action,
      note,
      scores,
    });
  };

  const handleActionExecute = async () => {
    if (!confirmDialog) return;
    const { preference, action, note, scores } = confirmDialog;
    setConfirmDialog(null);
    setActing(true);
    setMessage("");
    try {
      const res = await fetch(`/api/admin/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, preference, note, scores }),
      });
      const data = await res.json();
      setMessage(data.success ? data.message : data.error ?? "Action failed.");
      if (data.success) await load();
    } catch {
      setMessage("Network communication failure.");
    } finally {
      setActing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 text-teal-400 animate-spin" />
          <p className="text-sm text-zinc-400 font-medium">Loading details...</p>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="max-w-xs text-center p-6 border-zinc-900 space-y-4 bg-zinc-950">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto" />
          <h2 className="text-lg font-bold text-white">Application Not Found</h2>
          <Button onClick={() => router.push("/admin/applications")} className="w-full font-bold">
            Back to Applications
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <AdminLayout activePage="applications">
      <div className="p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Back Link */}
        <Button
          variant="ghost"
          onClick={() => router.push("/admin/applications")}
          className="gap-2 text-zinc-450 hover:text-white pl-0 -ml-1 text-xs"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Applications
        </Button>

        {/* Header */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="h-12 w-12 rounded-full bg-zinc-950 border border-zinc-900 flex items-center justify-center text-lg font-bold text-teal-400">
            {application.userEmail.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">{application.userEmail}</h1>
            <p className="text-xs text-zinc-500 mt-1">
              Registered on{" "}
              {new Date(application.createdAt).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="ml-auto">
            <Badge
              variant={
                application.overallStatus === "selected"
                  ? "success"
                  : application.overallStatus === "rejected"
                  ? "destructive"
                  : "warning"
              }
              className="text-xs px-3.5 py-1.5"
            >
              {application.overallStatus}
            </Badge>
          </div>
        </div>

        {/* Status notification messages */}
        {message && (
          <div
            className={`p-4 rounded-xl border text-sm font-bold ${
              message.toLowerCase().includes("success")
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-rose-500/10 border-rose-500/20 text-rose-400"
            }`}
          >
            {message}
          </div>
        )}

        {/* Personal Info Card */}
        {(() => {
          const personalInfoStage =
            application.firstPrefProgress.stages.find((s) => s.stage === 1) ||
            application.secondPrefProgress.stages.find((s) => s.stage === 1);
          if (!personalInfoStage) return null;

          return (
            <Card>
              <CardHeader className="border-b border-zinc-900 pb-4">
                <CardTitle className="text-base font-bold text-white">Personal Information</CardTitle>
                <CardDescription>General registration parameters submitted by student</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-extrabold">Full Name</p>
                  <p className="text-sm font-semibold text-zinc-200 mt-1.5">
                    {String(personalInfoStage.responses.fullName || "—")}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-extrabold">Phone Number</p>
                  <p className="text-sm font-semibold text-zinc-200 mt-1.5">
                    {String(personalInfoStage.responses.phone || "—")}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-extrabold">Registration No</p>
                  <p className="text-sm font-semibold text-zinc-200 mt-1.5">
                    {String(personalInfoStage.responses.regNo || "—")}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-extrabold">Year of Study</p>
                  <p className="text-sm font-semibold text-zinc-200 mt-1.5">
                    {String(personalInfoStage.responses.year || "—")}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-extrabold">Branch / Program</p>
                  <p className="text-sm font-semibold text-zinc-200 mt-1.5">
                    {String(personalInfoStage.responses.branch || "—")}
                  </p>
                </div>
                {!!personalInfoStage.responses.whyMic && (
                  <div className="md:col-span-2 lg:col-span-3">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-extrabold">Why MIC?</p>
                    <p className="text-sm text-zinc-300 mt-2 leading-relaxed bg-black border border-zinc-900 p-4 rounded-xl">
                      {String(personalInfoStage.responses.whyMic)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })()}

        {/* Preference panel columns */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <PrefPanel
            progress={application.firstPrefProgress}
            deptSlug={application.firstPreference}
            label="1st Preference"
            onActionTrigger={handleActionConfirmTrigger}
            acting={acting}
          />
          {application.secondPreference ? (
            <PrefPanel
              progress={application.secondPrefProgress}
              deptSlug={application.secondPreference}
              label="2nd Preference"
              onActionTrigger={handleActionConfirmTrigger}
              acting={acting}
            />
          ) : (
            <Card className="flex items-center justify-center p-8 border-dashed border-zinc-900">
              <div className="text-center">
                <p className="text-xs text-zinc-500 font-bold">No 2nd Preference Selection</p>
                <p className="text-[10px] text-zinc-650 mt-1">Applicant selected only one department choice</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* AlertDialog to replace standard window.confirm for applicant updates */}
      <AlertDialog
        isOpen={confirmDialog?.isOpen ?? false}
        onClose={() => setConfirmDialog(null)}
        onConfirm={handleActionExecute}
        title={confirmDialog?.action === "advance" ? "Advance Candidate Stage?" : "Reject Candidate?"}
        description={
          confirmDialog?.action === "advance"
            ? `Are you sure you want to ADVANCE this candidate to the next stage in their ${confirmDialog?.preference} preference department?`
            : `Are you sure you want to REJECT this candidate from their ${confirmDialog?.preference} preference department?`
        }
        confirmText={confirmDialog?.action === "advance" ? "Yes, Advance" : "Yes, Reject"}
        variant={confirmDialog?.action === "reject" ? "destructive" : "default"}
        loading={acting}
      />
    </AdminLayout>
  );
}

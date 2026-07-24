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
  FileText,
  MessageSquare,
  Award,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  AlertDialog,
} from "@/components/ui/dialog";

interface PanelistScore {
  interviewerEmail: string;
  scores: Record<string, number>;
  note?: string;
  createdAt: string;
}

interface StageSubmission {
  stage: number;
  submittedAt: string;
  result: "pending" | "passed" | "failed";
  adminNote?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  responses: Record<string, unknown>;
  scores?: Record<string, number>;
  panelistScores?: PanelistScore[];
}

interface PrefProgress {
  currentStage: number;
  status: string;
  stages: StageSubmission[];
}

interface Application {
  _id: string;
  userEmail: string;
  userName?: string;
  firstPreference: string;
  secondPreference: string;
  firstPrefType: string;
  secondPrefType: string;
  activePreference: "first" | "second";
  overallStatus: string;
  firstPrefProgress: PrefProgress;
  secondPrefProgress: PrefProgress;
  fullName: string;
  phone: string;
  regNo: string;
  year: string;
  branch: string;
  whyMic: string;
  createdAt: string;
}
interface FormField {
  id: string;
  label: string;
  type: string;
  placeholder?: string;
  required?: boolean;
}
interface StageConfig {
  stage: number;
  title: string;
  description?: string;
  formFields: FormField[];
}
interface ClientDepartment {
  slug: string;
  name: string;
  type: "tech" | "non-tech";
  totalStages: number;
  isActive: boolean;
  stages: StageConfig[];
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

function ResponseViewer({
  responses = {},
  getFieldLabel,
}: {
  responses?: Record<string, unknown>;
  getFieldLabel: (fieldId: string) => string;
}) {
  const entries = Object.entries(responses);
  if (entries.length === 0) {
    return (
      <div className="p-6 text-center text-zinc-500 text-xs border border-dashed border-zinc-800/80 rounded-xl bg-zinc-950/40">
        No response details submitted for this stage.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map(([key, val], idx) => {
        const valStr = Array.isArray(val) ? val.join(", ") : String(val ?? "—");
        const isUrl = valStr.startsWith("http://") || valStr.startsWith("https://");

        return (
          <div key={key} className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="h-5 w-5 rounded-md bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                {idx + 1}
              </span>
              <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider text-left">
                {getFieldLabel(key)}
              </p>
            </div>
            <div className="text-sm text-zinc-100 bg-zinc-900/70 border border-zinc-800/80 rounded-xl p-4 leading-relaxed text-left break-words">
              {isUrl ? (
                <a
                  href={valStr}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-400 hover:text-teal-350 underline font-bold inline-flex items-center gap-1.5 flex-wrap"
                >
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                  <span>{valStr}</span>
                </a>
              ) : (
                <p className="whitespace-pre-wrap font-sans text-zinc-200">{valStr}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SubmissionDetailModal({
  isOpen,
  onClose,
  stepTitle,
  deptName,
  applicantName,
  submission,
  getFieldLabel,
}: {
  isOpen: boolean;
  onClose: () => void;
  stepTitle: string;
  deptName: string;
  applicantName?: string;
  submission: StageSubmission | null;
  getFieldLabel: (fieldId: string) => string;
}) {
  const [copied, setCopied] = useState(false);

  if (!submission) return null;

  const handleCopyAll = () => {
    if (!submission?.responses) return;
    const text = Object.entries(submission.responses)
      .map(([k, v]) => `${getFieldLabel(k)}:\n${Array.isArray(v) ? v.join(", ") : String(v ?? "")}`)
      .join("\n\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl w-[92vw] max-h-[85vh] flex flex-col p-0 bg-zinc-950 border-zinc-800 shadow-2xl rounded-2xl overflow-hidden">
        {/* Modal Header */}
        <DialogHeader className="p-6 bg-zinc-900/70 border-b border-zinc-800 text-left flex flex-col gap-1.5 shrink-0 pr-12">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="text-[10px] font-extrabold uppercase tracking-wider bg-teal-500/10 text-teal-400 border border-teal-500/20">
              {deptName}
            </Badge>
            {submission.submittedAt && (
              <span className="text-[11px] font-medium text-zinc-500">
                Submitted on {new Date(submission.submittedAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>
          <DialogTitle className="text-xl font-extrabold text-white mt-1">
            {stepTitle}
          </DialogTitle>
          {applicantName && (
            <DialogDescription className="text-xs text-zinc-400 font-medium">
              Applicant: <span className="text-zinc-200 font-bold">{applicantName}</span>
            </DialogDescription>
          )}
        </DialogHeader>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {/* Form Responses */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4 text-teal-400" /> Form Responses
            </h4>
            <ResponseViewer responses={submission.responses} getFieldLabel={getFieldLabel} />
          </div>

          {/* Rubric Scorecard if present */}
          {submission.scores && Object.keys(submission.scores).length > 0 && (
            <div className="p-4 rounded-xl bg-teal-500/5 border border-teal-500/15 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-teal-400 shrink-0" />
                  <span className="text-xs text-teal-400 uppercase font-extrabold tracking-wider">
                    Scorecard Results
                  </span>
                </div>
                {(() => {
                  const entries = Object.values(submission.scores);
                  const total = entries.reduce((acc, curr) => acc + Number(curr), 0);
                  const maxPossible = entries.length * 5;
                  const pct = maxPossible > 0 ? Math.round((total / maxPossible) * 100) : 0;

                  let grade = "Weak";
                  let color = "bg-rose-500/20 text-rose-300 border-rose-500/30";
                  if (pct >= 85) { grade = "Excellent"; color = "bg-teal-500/20 text-teal-300 border-teal-500/30"; }
                  else if (pct >= 70) { grade = "Strong"; color = "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"; }
                  else if (pct >= 50) { grade = "Average"; color = "bg-amber-500/20 text-amber-300 border-amber-500/30"; }

                  return (
                    <Badge variant="outline" className={`px-2.5 py-1 text-xs font-bold border ${color}`}>
                      {grade} ({total}/{maxPossible} - {pct}%)
                    </Badge>
                  );
                })()}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                {Object.entries(submission.scores).map(([metric, score]) => (
                  <div key={metric} className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800/80 text-xs">
                    <span className="text-zinc-400 capitalize block text-[10px] font-semibold">{metric}</span>
                    <span className="text-white font-extrabold text-sm">{score}/5</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Panelist Breakdown if present */}
          {submission.panelistScores && submission.panelistScores.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-zinc-900">
              <h4 className="text-xs text-zinc-400 font-extrabold uppercase tracking-wider">
                Panelist Breakdown ({submission.panelistScores.length})
              </h4>
              <div className="space-y-2 font-mono">
                {submission.panelistScores.map((ps, pIdx) => (
                  <div key={pIdx} className="bg-zinc-900/60 p-3 border border-zinc-800/80 rounded-xl flex flex-col gap-2 text-xs text-zinc-300">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-teal-400 font-bold">{ps.interviewerEmail}</span>
                      <span className="text-zinc-500 text-[10px]">
                        {new Date(ps.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                      </span>
                    </div>
                    <div className="flex gap-3 flex-wrap">
                      {Object.entries(ps.scores || {}).map(([metric, score]) => (
                        <div key={metric}>
                          <span className="text-zinc-500 capitalize">{metric}:</span> <strong className="text-white">{score as number}/5</strong>
                        </div>
                      ))}
                    </div>
                    {ps.note && (
                      <p className="text-xs text-zinc-300 font-sans italic bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-900">
                        “{ps.note}”
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviewer Note if present */}
          {submission.adminNote && (
            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15 flex gap-3">
              <MessageSquare className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-amber-400 uppercase font-extrabold tracking-wider block">
                  Reviewer Evaluation Note
                </span>
                <p className="text-xs text-zinc-200 mt-1 leading-relaxed whitespace-pre-wrap">{submission.adminNote}</p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <DialogFooter className="p-4 bg-zinc-900/70 border-t border-zinc-800 flex items-center justify-between sm:justify-between shrink-0 gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCopyAll}
            className="text-xs font-bold gap-1.5 text-zinc-300 border-zinc-800 hover:bg-zinc-800 hover:text-white cursor-pointer"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-zinc-400" />}
            {copied ? "Copied!" : "Copy Responses"}
          </Button>

          <Button
            type="button"
            onClick={onClose}
            className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs px-5 cursor-pointer"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const DEPT_RUBRICS: Record<string, string[]> = {
  development: ["Coding", "System Design", "Communication", "Problem Solving"],
  "competitive-coding": ["Speed", "Accuracy", "Logic"],
  "ui-ux": ["Visual Aesthetics", "Wireframing", "Figma Skills", "Research"],
  "ai-ml": ["Math & Stats", "Python Libraries", "ML Concepts"],
  "cyber-security": ["Hacking Skills", "Networking", "Linux", "Logic"],
  design: ["Creativity", "Visual Aesthetics", "Tools", "Portfolio"],
  management: ["Leadership", "Event Planning", "Teamwork", "Case Study"],
  entrepreneurship: ["Business Acumen", "Pitching", "Idea Validation"],
  "content-media": ["Writing", "Video Editing", "Camera Work", "Communication"],
};
const DEFAULT_RUBRIC = ["Technical", "Communication", "Creativity"];

function PrefPanel({
  progress,
  deptSlug,
  label,
  onActionTrigger,
  acting,
  totalStages,
  overallStatus,
  deptStages,
  applicantName,
}: {
  progress: PrefProgress;
  deptSlug: string;
  label: string;
  onActionTrigger: (preference: "first" | "second", action: "advance" | "reject" | "score", note: string, scores?: Record<string, number>) => void;
  acting: boolean;
  totalStages: number;
  overallStatus: string;
  deptStages?: StageConfig[];
  applicantName?: string;
}) {
  const prefKey = label === "1st Preference" ? "first" : "second";
  const [note, setNote] = useState("");
  
  // Gather all form fields for this department
  const allFields = deptStages?.flatMap((s) => s.formFields) || [];
  
  // Find the label for a field ID
  const getFieldLabel = (fieldId: string) => {
    const field = allFields.find((f) => f.id === fieldId);
    return field ? field.label : fieldId;
  };

  const rubricList = DEPT_RUBRICS[deptSlug] || DEFAULT_RUBRIC;
  const [scores, setScores] = useState<Record<string, number>>({});
  const [modalSubmission, setModalSubmission] = useState<{
    stepTitle: string;
    submission: StageSubmission;
  } | null>(null);

  const currentStageSubmission = progress.stages.find(
    (s) => s.stage === progress.currentStage
  );

  useEffect(() => {
    const initialScores: Record<string, number> = {};
    rubricList.forEach((metric) => {
      initialScores[metric.toLowerCase()] = 0;
    });

    if (currentStageSubmission) {
      if (currentStageSubmission.adminNote) {
        setNote(currentStageSubmission.adminNote);
      }
      if (currentStageSubmission.scores) {
        Object.entries(currentStageSubmission.scores).forEach(([k, v]) => {
          initialScores[k.toLowerCase()] = Number(v) || 0;
        });
      }
    }
    setScores(initialScores);
  }, [deptSlug, currentStageSubmission]);

  const canAct =
    progress.status === "active" &&
    overallStatus === "in-progress" &&
    (!currentStageSubmission || currentStageSubmission.result === "pending");

  // Build timeline steps
  const timelineSteps = [];

  // Step 1: Initial application start
  timelineSteps.push({
    stageNum: 0,
    title: "Application Started",
    description: "Candidate initiated application",
    state: "passed" as const,
    date: null,
  });

  // Steps 1 to totalStages: Evaluation stages
  for (let s = 1; s <= totalStages; s++) {
    const stageDbNum = s;
    const submission = progress.stages.find((x) => x.stage === stageDbNum);

    let state: "passed" | "failed" | "pending" | "upcoming" = "upcoming";
    if (submission) {
      if (submission.result === "passed") state = "passed";
      else if (submission.result === "failed") state = "failed";
      else state = "pending";
    } else if (progress.status === "rejected" || progress.status === "passed") {
      state = "upcoming";
    } else if (progress.currentStage > stageDbNum) {
      state = "passed";
    }

    let stageTitle = `Stage ${s} Evaluation`;
    let stageDesc = submission?.result === "pending" ? "Awaiting review" : `Stage ${s} review complete`;
    if (stageDbNum === 1) {
      stageTitle = "Stage 1: Domain Evaluation";
      stageDesc = submission?.result === "pending" ? "Awaiting Domain screening" : "Domain screening complete";
    } else if (stageDbNum === 2) {
      stageTitle = "Stage 2: Task Evaluation";
      stageDesc = submission?.result === "pending" ? "Awaiting Task evaluation" : "Task evaluation complete";
    } else if (stageDbNum === 3) {
      stageTitle = "Stage 3: Interview Evaluation";
      stageDesc = submission?.result === "pending" ? "Awaiting Interview grading" : "Interview grading complete";
    }

    timelineSteps.push({
      stageNum: stageDbNum,
      title: stageTitle,
      description: stageDesc,
      state,
      submission,
      date: submission?.submittedAt || null,
    });
  }

  // Final Step: Outcome
  let outcomeState: "passed" | "failed" | "upcoming" = "upcoming";
  if (progress.status === "passed") outcomeState = "passed";
  else if (progress.status === "rejected") outcomeState = "failed";

  timelineSteps.push({
    stageNum: 99,
    title: progress.status === "passed" ? "Accepted" : progress.status === "rejected" ? "Rejected" : "Outcome Decision",
    description: progress.status === "passed" ? "Candidate selected" : progress.status === "rejected" ? "Preference closed" : "Funnel pending",
    state: outcomeState,
    date: null,
  });

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

      <CardContent className="p-6 space-y-8">
        {/* Interactive Vertical Timeline */}
        <div className="space-y-6 relative pl-4 before:absolute before:left-[27px] before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-900">
          {timelineSteps.map((step, idx) => {
            const hasDetail = step.submission && step.stageNum > 0;

            return (
              <div key={idx} className="relative pl-8 space-y-2">
                {/* Node icon circle */}
                <div
                  className={`absolute left-[-21px] top-0.5 h-6 w-6 rounded-full border flex items-center justify-center z-10 transition-all ${
                    step.state === "passed"
                      ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                      : step.state === "failed"
                      ? "bg-rose-500/10 border-rose-500 text-rose-400"
                      : step.state === "pending"
                      ? "bg-amber-500/10 border-amber-500 text-amber-400 animate-pulse"
                      : "bg-zinc-950 border-zinc-800 text-zinc-700"
                  }`}
                >
                  {step.state === "passed" ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : step.state === "failed" ? (
                    <XCircle className="h-3.5 w-3.5" />
                  ) : step.state === "pending" ? (
                    <Clock className="h-3.5 w-3.5" />
                  ) : (
                    <div className="h-1.5 w-1.5 rounded-full bg-zinc-800" />
                  )}
                </div>

                {/* Node label */}
                <div
                  onClick={() => {
                    if (hasDetail && step.submission) {
                      setModalSubmission({
                        stepTitle: step.title,
                        submission: step.submission,
                      });
                    }
                  }}
                  className={`flex flex-col text-left transition-all ${
                    hasDetail ? "cursor-pointer group hover:opacity-90" : ""
                  }`}
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-xs font-bold ${
                        step.state !== "upcoming" ? "text-white" : "text-zinc-500"
                      }`}
                    >
                      {step.title}
                    </span>
                    {step.date && (
                      <span className="text-[9px] font-semibold text-zinc-500">
                        {new Date(step.date).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </span>
                    )}
                    {hasDetail && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (step.submission) {
                            setModalSubmission({
                              stepTitle: step.title,
                              submission: step.submission,
                            });
                          }
                        }}
                        className="text-[10px] text-teal-400 hover:text-teal-300 font-bold flex items-center gap-1 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 px-2 py-0.5 rounded-md transition-all cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <FileText className="h-3 w-3" />
                        View Details
                      </button>
                    )}
                  </div>
                  <span className="text-[10px] text-zinc-500 font-medium">
                    {step.description}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Panel */}
        {canAct && (
          <div className="border-t border-zinc-900 pt-6 space-y-4">
            <Badge variant="warning" className="uppercase font-bold tracking-wider text-[10px]">
              Reviewing Stage {progress.currentStage} Submission
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
                className="w-full bg-zinc-950 border border-zinc-900 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-zinc-700 resize-none transition-all"
              />
            </div>

            <div className="space-y-3 bg-zinc-950 border border-zinc-900 rounded-xl p-4">
              <p className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">
                Grading Rubric (Required to Advance)
              </p>
              {rubricList.map((metric) => {
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
                              : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-white"
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

            <div className="flex gap-3 pt-2 flex-wrap sm:flex-nowrap">
              <Button
                variant="destructive"
                onClick={() => onActionTrigger(prefKey, "reject", note)}
                disabled={acting}
                className="flex-1 font-bold h-11 cursor-pointer"
              >
                Reject Candidate
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const hasAnyScore = Object.values(scores).some((s) => s > 0);
                  if (!hasAnyScore && !note.trim()) {
                    alert("Please select at least one score rubric criterion or enter evaluation notes before saving.");
                    return;
                  }
                  onActionTrigger(prefKey, "score", note, scores);
                }}
                disabled={acting}
                className="flex-1 font-bold h-11 text-teal-400 border-teal-500/30 hover:bg-teal-500/10 cursor-pointer"
              >
                Save Scores Only
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
                className="flex-1 font-bold h-11 cursor-pointer"
              >
                Advance Stage
              </Button>
            </div>
          </div>
        )}

        {/* Response Detail Modal */}
        <SubmissionDetailModal
          isOpen={!!modalSubmission}
          onClose={() => setModalSubmission(null)}
          stepTitle={modalSubmission?.stepTitle ?? ""}
          deptName={DEPT_NAMES[deptSlug] ?? deptSlug}
          applicantName={applicantName}
          submission={modalSubmission?.submission ?? null}
          getFieldLabel={getFieldLabel}
        />
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
  const [dept1, setDept1] = useState<ClientDepartment | null>(null);
  const [dept2, setDept2] = useState<ClientDepartment | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [message, setMessage] = useState("");

  // Custom alert confirmation dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    preference: "first" | "second";
    action: "advance" | "reject" | "score";
    note: string;
    scores?: Record<string, number>;
  } | null>(null);

  const load = async () => {
    try {
      const res = await fetch(`/api/admin/applications/${id}`);
      const data = await res.json();
      if (data.success) {
        setApplication(data.application);
        setDept1(data.dept1);
        setDept2(data.dept2);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const init = async () => {
      if (active) {
        await load();
      }
    };
    init();
    return () => {
      active = false;
    };
  }, [id]);

  const handleActionConfirmTrigger = async (
    preference: "first" | "second",
    action: "advance" | "reject" | "score",
    note: string,
    scores?: Record<string, number>
  ) => {
    if (action === "score") {
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
      return;
    }

    setConfirmDialog({
      isOpen: true,
      preference,
      action: action as "advance" | "reject",
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
      <div className="min-h-[100dvh] bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 text-teal-400 animate-spin" />
          <p className="text-sm text-zinc-400 font-medium">Loading details...</p>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-[100dvh] bg-black flex items-center justify-center">
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

  const applicantDisplayName = application.fullName || application.userName || application.userEmail;

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
            {(application.userName || application.userEmail).charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              {application.userName || application.userEmail}
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              {application.userName ? `${application.userEmail} · ` : ""}Registered on{" "}
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
          if (!application.fullName) return null;

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
                    {application.fullName || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-extrabold">Phone Number</p>
                  <p className="text-sm font-semibold text-zinc-200 mt-1.5">
                    {application.phone || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-extrabold">Registration No</p>
                  <p className="text-sm font-semibold text-zinc-200 mt-1.5">
                    {application.regNo || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-extrabold">Year of Study</p>
                  <p className="text-sm font-semibold text-zinc-200 mt-1.5">
                    {application.year || "—"}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-extrabold">Branch / Program</p>
                  <p className="text-sm font-semibold text-zinc-200 mt-1.5">
                    {application.branch || "—"}
                  </p>
                </div>
                {!!application.whyMic && (
                  <div className="md:col-span-2 lg:col-span-3">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-extrabold">Why MIC?</p>
                    <p className="text-sm text-zinc-300 mt-2 leading-relaxed bg-black border border-zinc-900 p-4 rounded-xl">
                      {application.whyMic}
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
            totalStages={dept1?.totalStages ?? 2}
            overallStatus={application.overallStatus}
            deptStages={dept1?.stages}
            applicantName={applicantDisplayName}
          />
          {application.secondPreference ? (
            <PrefPanel
              progress={application.secondPrefProgress}
              deptSlug={application.secondPreference}
              label="2nd Preference"
              onActionTrigger={handleActionConfirmTrigger}
              acting={acting}
              totalStages={dept2?.totalStages ?? 2}
              overallStatus={application.overallStatus}
              deptStages={dept2?.stages}
              applicantName={applicantDisplayName}
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

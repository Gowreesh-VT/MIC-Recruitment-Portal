"use client";

import React, { useState, useId } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Upload,
  FileSpreadsheet,
  Layers,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Loader2,
  ArrowRight,
  ClipboardPaste,
  Check,
  Copy,
  Users,
  ShieldCheck,
  Filter,
  RotateCcw,
} from "lucide-react";

const DEPT_NAMES: Record<string, string> = {
  development: "Development",
  "competitive-coding": "Comp. Coding",
  "ui-ux": "UI/UX",
  "ai-ml": "AI/ML",
  "cyber-security": "Cyber Security",
  design: "Design",
  management: "Management",
  entrepreneurship: "Entrepreneurship",
  "content-media": "Social Media",
  iot: "IoT",
  outreach: "Outreach",
};

const DEPTS = Object.keys(DEPT_NAMES);

interface CandidateMatch {
  id: string;
  userEmail: string;
  fullName: string;
  regNo: string;
  firstPreference: string;
  secondPreference?: string;
  matchedPreference: "first" | "second" | "active" | "none";
  currentStage: number;
  preferenceStatus: string;
  overallStatus: string;
  willChangeTo?: string;
}

interface PreviewResponse {
  success: boolean;
  dryRun: boolean;
  summary: {
    totalProvided: number;
    foundCount: number;
    updatedCount: number;
    notFoundCount: number;
    firstPreferenceMatches: number;
    secondPreferenceMatches: number;
    otherDepartmentMatches: number;
  };
  notFound: string[];
  matched: CandidateMatch[];
  error?: string;
}

interface AdvancedBulkModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCandidateEmails?: string[];
  onSuccess?: () => void;
}

export function AdvancedBulkModal({
  isOpen,
  onClose,
  selectedCandidateEmails = [],
  onSuccess,
}: AdvancedBulkModalProps) {
  const pasteTextareaId = useId();
  const [inputMode, setInputMode] = useState<"paste" | "upload" | "selected">("paste");
  const [pastedText, setPastedText] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedIdentifiers, setUploadedIdentifiers] = useState<string[]>([]);

  // Action configuration
  const [targetDept, setTargetDept] = useState<string>("");
  const [targetStage, setTargetStage] = useState<string>("current");
  const [nextStage, setNextStage] = useState<string>("");
  const [actionType, setActionType] = useState<
    "advance" | "reject_department" | "reject_all" | "select" | "waitlist" | "reset"
  >("advance");
  const [adminNote, setAdminNote] = useState("");

  // Stepper & Async states
  const [step, setStep] = useState<"configure" | "preview" | "done">("configure");
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewResponse | null>(null);
  const [copiedNotFound, setCopiedNotFound] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Helper to parse strings from CSV/text into array of emails/reg numbers
  const parseRawText = (raw: string): string[] => {
    const lines = raw.split(/[\r\n,;]+/);
    const results: string[] = [];

    for (let line of lines) {
      line = line.trim().replace(/^["']|["']$/g, "");
      // Skip empty or header rows like 'Email', 'reg_no'
      if (
        !line ||
        /^(email|user_email|useremail|regno|reg_no|registration|id|name)$/i.test(line)
      ) {
        continue;
      }
      results.push(line);
    }
    return Array.from(new Set(results));
  };

  // Handle CSV/TXT file drop or selection
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      // Extract all potential tokens (split by commas, quotes, whitespace, newlines)
      const parsed = parseRawText(content);
      setUploadedIdentifiers(parsed);
    };

    reader.readAsText(file);
  };

  // Get active list of identifiers based on inputMode
  const getActiveIdentifiers = (): string[] => {
    if (inputMode === "selected") {
      return selectedCandidateEmails;
    }
    if (inputMode === "upload") {
      return uploadedIdentifiers;
    }
    return parseRawText(pastedText);
  };

  const parsedCount = getActiveIdentifiers().length;

  // Run Dry-Run Preview
  const handlePreview = async () => {
    const identifiers = getActiveIdentifiers();
    if (identifiers.length === 0) {
      setErrorMessage("Please paste or upload at least one candidate email or registration number.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/admin/applications/bulk-advanced", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifiers,
          targetDepartment: targetDept || "active",
          action: actionType,
          targetStage: targetStage === "current" ? "current" : parseInt(targetStage),
          nextStage: nextStage ? parseInt(nextStage) : undefined,
          note: adminNote || undefined,
          dryRun: true,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Failed to validate candidates.");
      } else {
        setPreviewData(data);
        setStep("preview");
      }
    } catch {
      setErrorMessage("Network error while validating candidates.");
    } finally {
      setLoading(false);
    }
  };

  // Execute Actual Bulk Update
  const handleExecute = async () => {
    const identifiers = getActiveIdentifiers();
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/admin/applications/bulk-advanced", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifiers,
          targetDepartment: targetDept || "active",
          action: actionType,
          targetStage: targetStage === "current" ? "current" : parseInt(targetStage),
          nextStage: nextStage ? parseInt(nextStage) : undefined,
          note: adminNote || undefined,
          dryRun: false,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Failed to execute bulk update.");
      } else {
        setPreviewData(data);
        setStep("done");
        if (onSuccess) onSuccess();
      }
    } catch {
      setErrorMessage("Network error while executing bulk update.");
    } finally {
      setLoading(false);
    }
  };

  // Copy not found identifiers
  const handleCopyNotFound = () => {
    if (!previewData?.notFound?.length) return;
    navigator.clipboard.writeText(previewData.notFound.join("\n"));
    setCopiedNotFound(true);
    setTimeout(() => setCopiedNotFound(false), 2000);
  };

  // Reset modal state
  const handleReset = () => {
    setStep("configure");
    setPreviewData(null);
    setErrorMessage(null);
    setPastedText("");
    setUploadedFileName(null);
    setUploadedIdentifiers([]);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          handleReset();
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-3xl bg-zinc-950/98 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 font-sans text-xs max-h-[90vh] overflow-y-auto shadow-2xl space-y-5 text-zinc-200">
        <DialogHeader className="border-b border-zinc-900 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg text-white font-extrabold flex items-center gap-2">
                  Advanced Bulk Operations
                </DialogTitle>
                <DialogDescription className="text-xs text-zinc-400 mt-0.5">
                  Bulk Advance, Reject, or Select candidates across specific stages & departments via CSV or paste.
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        {errorMessage && (
          <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl flex items-center gap-3 text-red-200 text-xs">
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: CONFIGURE */}
        {step === "configure" && (
          <div className="space-y-6">
            {/* Input Source Tabs */}
            <div className="space-y-2">
              <label className="text-zinc-300 font-semibold flex items-center justify-between">
                <span>1. Select Candidate Input Source</span>
                {parsedCount > 0 && (
                  <Badge variant="outline" className="bg-indigo-950/40 border-indigo-500/30 text-indigo-300">
                    {parsedCount} candidate{parsedCount === 1 ? "" : "s"} detected
                  </Badge>
                )}
              </label>
              <div className="grid grid-cols-3 gap-2 bg-zinc-900/60 p-1 rounded-xl border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setInputMode("paste")}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    inputMode === "paste"
                      ? "bg-zinc-800 text-white shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <ClipboardPaste className="h-3.5 w-3.5" />
                  Paste List / Emails
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode("upload")}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    inputMode === "upload"
                      ? "bg-zinc-800 text-white shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  Upload CSV / TXT
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode("selected")}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    inputMode === "selected"
                      ? "bg-zinc-800 text-white shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <Users className="h-3.5 w-3.5" />
                  Selected ({selectedCandidateEmails.length})
                </button>
              </div>

              {/* Paste Textarea */}
              {inputMode === "paste" && (
                <div className="space-y-1.5 mt-3">
                  <textarea
                    id={pasteTextareaId}
                    rows={5}
                    placeholder="Paste candidate emails or Registration Numbers (one per line, or separated by commas)...&#10;e.g.&#10;student1@vitstudent.ac.in&#10;24BCE1002&#10;student3@vitstudent.ac.in"
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    className="w-full bg-zinc-900/80 border border-zinc-800 focus:border-indigo-500 rounded-xl p-3 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all font-mono"
                  />
                  <p className="text-[11px] text-zinc-500">
                    Supports emails (e.g. <code>user@vitstudent.ac.in</code>) and registration numbers (e.g. <code>24BCE1001</code>).
                  </p>
                </div>
              )}

              {/* File Upload Dropzone */}
              {inputMode === "upload" && (
                <div className="mt-3">
                  <label className="border-2 border-dashed border-zinc-800 hover:border-indigo-500/50 bg-zinc-900/30 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:bg-zinc-900/50">
                    <Upload className="h-8 w-8 text-zinc-500 mb-2" />
                    <span className="font-semibold text-zinc-200">
                      {uploadedFileName ? uploadedFileName : "Click to select or drag CSV / TXT file"}
                    </span>
                    <span className="text-[11px] text-zinc-500 mt-1">
                      {uploadedIdentifiers.length > 0
                        ? `Parsed ${uploadedIdentifiers.length} candidate identifiers successfully`
                        : "Accepts CSV files with Email / RegNo columns or raw lists"}
                    </span>
                    <input
                      type="file"
                      accept=".csv, .txt, .tsv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              {/* Selected Candidates */}
              {inputMode === "selected" && (
                <div className="mt-3 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                  <p className="text-zinc-300">
                    Operating on <strong>{selectedCandidateEmails.length}</strong> currently checked candidates from the application table.
                  </p>
                  {selectedCandidateEmails.length === 0 && (
                    <p className="text-amber-400/80 text-[11px] mt-1">
                      No candidates currently checked. Please check rows in the table or use Paste / Upload.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Department & Stage & Action Configuration */}
            <div className="space-y-4 pt-2 border-t border-zinc-900">
              <label className="text-zinc-300 font-semibold block">
                2. Target Department, Stage & Action
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Target Department */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-medium text-zinc-400">Target Department</span>
                  <Select
                    value={targetDept}
                    onChange={(e) => setTargetDept(e.target.value)}
                    icon={<Filter className="h-3.5 w-3.5" />}
                  >
                    <option value="">Active Preference (Auto-detect)</option>
                    {DEPTS.map((d) => (
                      <option key={d} value={d}>
                        {DEPT_NAMES[d]}
                      </option>
                    ))}
                  </Select>
                  <p className="text-[10px] text-zinc-500">
                    If specified, automatically checks if candidate chose this as 1st or 2nd preference.
                  </p>
                </div>

                {/* Target Stage */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-medium text-zinc-400">Target Stage to Evaluate</span>
                  <Select
                    value={targetStage}
                    onChange={(e) => setTargetStage(e.target.value)}
                  >
                    <option value="current">Current Stage (Candidate&apos;s active stage)</option>
                    <option value="1">Stage 1</option>
                    <option value="2">Stage 2</option>
                    <option value="3">Stage 3</option>
                  </Select>
                </div>
              </div>

              {actionType === "advance" && (
                <div className="p-3 bg-emerald-950/20 border border-emerald-800/30 rounded-xl space-y-1.5">
                  <span className="text-[11px] font-medium text-emerald-300">Promote to Stage (Optional)</span>
                  <Select
                    value={nextStage}
                    onChange={(e) => setNextStage(e.target.value)}
                  >
                    <option value="">Auto (+1 Next Stage)</option>
                    <option value="1">Directly to Stage 1</option>
                    <option value="2">Directly to Stage 2</option>
                    <option value="3">Directly to Stage 3</option>
                  </Select>
                  <p className="text-[10px] text-emerald-400/80">
                    By default, advances each candidate by 1 stage. You can also explicitly set them to Stage 1, Stage 2, or Stage 3.
                  </p>
                </div>
              )}

              {/* Action Selection */}
              <div className="space-y-2">
                <span className="text-[11px] font-medium text-zinc-400">Select Action</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <label
                    className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                      actionType === "advance"
                        ? "bg-emerald-950/30 border-emerald-500/50 text-emerald-200"
                        : "bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="bulkAction"
                      value="advance"
                      checked={actionType === "advance"}
                      onChange={() => setActionType("advance")}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="font-bold text-white text-xs flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        Advance to Next Stage
                      </div>
                      <p className="text-[10px] text-zinc-400 mt-0.5">
                        Passes current stage and moves candidate to next stage (Stage 1 → Stage 2 → Stage 3).
                      </p>
                    </div>
                  </label>

                  <label
                    className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                      actionType === "reject_department"
                        ? "bg-rose-950/30 border-rose-500/50 text-rose-200"
                        : "bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="bulkAction"
                      value="reject_department"
                      checked={actionType === "reject_department"}
                      onChange={() => setActionType("reject_department")}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="font-bold text-white text-xs flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5 text-rose-400" />
                        Reject from Selected Department
                      </div>
                      <p className="text-[10px] text-zinc-400 mt-0.5">
                        Fails this department track only. <strong>2nd preference remains active & open.</strong>
                      </p>
                    </div>
                  </label>

                  <label
                    className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                      actionType === "select"
                        ? "bg-teal-950/30 border-teal-500/50 text-teal-200"
                        : "bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="bulkAction"
                      value="select"
                      checked={actionType === "select"}
                      onChange={() => setActionType("select")}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="font-bold text-white text-xs flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-teal-400" />
                        Final Select (Accept for Club)
                      </div>
                      <p className="text-[10px] text-zinc-400 mt-0.5">
                        Marks preference as passed and changes overall status to <strong>Selected</strong>.
                      </p>
                    </div>
                  </label>

                  <label
                    className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                      actionType === "reject_all"
                        ? "bg-red-950/40 border-red-500/60 text-red-200"
                        : "bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="bulkAction"
                      value="reject_all"
                      checked={actionType === "reject_all"}
                      onChange={() => setActionType("reject_all")}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="font-bold text-white text-xs flex items-center gap-1.5">
                        <XCircle className="h-3.5 w-3.5 text-red-400" />
                        Full Reject (All Preferences)
                      </div>
                      <p className="text-[10px] text-zinc-400 mt-0.5">
                        Rejects candidate completely across both 1st and 2nd preference.
                      </p>
                    </div>
                  </label>

                  <label
                    className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                      actionType === "reset"
                        ? "bg-amber-950/30 border-amber-500/50 text-amber-200"
                        : "bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="bulkAction"
                      value="reset"
                      checked={actionType === "reset"}
                      onChange={() => setActionType("reset")}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="font-bold text-white text-xs flex items-center gap-1.5">
                        <RotateCcw className="h-3.5 w-3.5 text-amber-400" />
                        Reset to Stage 1 (In-Progress)
                      </div>
                      <p className="text-[10px] text-zinc-400 mt-0.5">
                        Resets candidate back to <strong>Stage 1 (In-Progress)</strong> with pending status.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Optional Admin Note */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-medium text-zinc-400">Admin Review Note (Optional)</span>
                <Input
                  type="text"
                  placeholder="e.g. Cleared technical interview round 1, or Low effort submission"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-zinc-900">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="px-4 font-semibold rounded-xl text-xs border-zinc-800 text-zinc-400 hover:bg-zinc-900"
              >
                Cancel
              </Button>

              <Button
                type="button"
                onClick={handlePreview}
                disabled={loading || parsedCount === 0}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-indigo-500/20 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Validating Candidates...
                  </>
                ) : (
                  <>
                    Preview & Validate Matches
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: PREVIEW & CONFIRM */}
        {step === "preview" && previewData && (
          <div className="space-y-5">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl">
                <span className="text-[10px] text-zinc-500 font-semibold block uppercase tracking-wider">
                  Total Parsed
                </span>
                <span className="text-lg font-bold text-white">
                  {previewData.summary.totalProvided}
                </span>
              </div>
              <div className="p-3 bg-emerald-950/20 border border-emerald-800/40 rounded-xl">
                <span className="text-[10px] text-emerald-400 font-semibold block uppercase tracking-wider">
                  DB Matches Found
                </span>
                <span className="text-lg font-bold text-emerald-300">
                  {previewData.summary.foundCount}
                </span>
              </div>
              <div className="p-3 bg-indigo-950/20 border border-indigo-800/40 rounded-xl">
                <span className="text-[10px] text-indigo-400 font-semibold block uppercase tracking-wider">
                  1st / 2nd Pref Matches
                </span>
                <span className="text-lg font-bold text-indigo-300">
                  {previewData.summary.firstPreferenceMatches} / {previewData.summary.secondPreferenceMatches}
                </span>
              </div>
              <div className="p-3 bg-rose-950/20 border border-rose-800/40 rounded-xl">
                <span className="text-[10px] text-rose-400 font-semibold block uppercase tracking-wider">
                  Not Found
                </span>
                <span className="text-lg font-bold text-rose-300">
                  {previewData.summary.notFoundCount}
                </span>
              </div>
            </div>

            {/* Department Safety Notification */}
            {actionType === "reject_department" && targetDept && (
              <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-xl flex items-start gap-2.5 text-amber-200/90 text-xs">
                <ShieldCheck className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-amber-300">Selective Rejection Active: </span>
                  Candidates will only be rejected from <strong>{DEPT_NAMES[targetDept] || targetDept}</strong>. If they chose a 2nd preference department, their application remains <strong>in-progress</strong>.
                </div>
              </div>
            )}

            {/* Candidate Match List */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-zinc-300">
                Action Impact Preview ({previewData.matched.length} candidates)
              </span>
              <div className="max-h-60 overflow-y-auto border border-zinc-800 rounded-xl divide-y divide-zinc-900 bg-zinc-900/30">
                {previewData.matched.slice(0, 100).map((c) => (
                  <div key={c.id} className="p-2.5 flex items-center justify-between gap-3 text-[11px]">
                    <div className="min-w-0">
                      <div className="font-semibold text-white truncate flex items-center gap-2">
                        <span>{c.fullName || "Candidate"}</span>
                        <span className="text-zinc-500 font-mono text-[10px]">({c.regNo})</span>
                      </div>
                      <div className="text-zinc-400 truncate text-[10px]">
                        {c.userEmail} · 1st: {DEPT_NAMES[c.firstPreference] || c.firstPreference}
                        {c.secondPreference && ` · 2nd: ${DEPT_NAMES[c.secondPreference] || c.secondPreference}`}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <Badge
                        variant="outline"
                        className={
                          actionType === "advance"
                            ? "bg-emerald-950/40 border-emerald-600/40 text-emerald-300"
                            : actionType === "reject_department"
                            ? "bg-rose-950/40 border-rose-600/40 text-rose-300"
                            : actionType === "select"
                            ? "bg-teal-950/40 border-teal-600/40 text-teal-300"
                            : "bg-red-950/40 border-red-600/40 text-red-300"
                        }
                      >
                        {c.willChangeTo}
                      </Badge>
                    </div>
                  </div>
                ))}
                {previewData.matched.length > 100 && (
                  <div className="p-2 text-center text-[10px] text-zinc-500">
                    ...and {previewData.matched.length - 100} more candidates
                  </div>
                )}
              </div>
            </div>

            {/* Unmatched / Not Found Warning */}
            {previewData.notFound.length > 0 && (
              <div className="p-3 bg-zinc-900/70 border border-zinc-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-rose-400 flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {previewData.notFound.length} Identifiers not found in active cycle
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyNotFound}
                    className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 font-medium cursor-pointer"
                  >
                    {copiedNotFound ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    {copiedNotFound ? "Copied" : "Copy Unmatched"}
                  </button>
                </div>
                <div className="max-h-20 overflow-y-auto font-mono text-[10px] text-zinc-500 bg-black/40 p-2 rounded-lg">
                  {previewData.notFound.join(", ")}
                </div>
              </div>
            )}

            {/* Footer buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-zinc-900">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("configure")}
                disabled={loading}
                className="px-4 font-semibold rounded-xl text-xs border-zinc-800 text-zinc-400 hover:bg-zinc-900"
              >
                Back to Edit
              </Button>

              <Button
                type="button"
                onClick={handleExecute}
                disabled={loading || previewData.matched.length === 0}
                className={`font-bold px-6 rounded-xl text-xs flex items-center gap-2 shadow-lg cursor-pointer ${
                  actionType === "reject_department" || actionType === "reject_all"
                    ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20"
                    : actionType === "select"
                    ? "bg-teal-600 hover:bg-teal-500 text-white shadow-teal-600/20"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20"
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Executing Updates...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Confirm & Update {previewData.matched.length} Candidates
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: DONE */}
        {step === "done" && previewData && (
          <div className="text-center py-6 space-y-4">
            <div className="h-14 w-14 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Bulk Updates Completed!</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Successfully updated <strong>{previewData.summary.updatedCount}</strong> candidate applications.
              </p>
            </div>

            <div className="pt-4">
              <Button
                type="button"
                onClick={() => {
                  handleReset();
                  onClose();
                }}
                className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold px-6 rounded-xl text-xs"
              >
                Done & Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

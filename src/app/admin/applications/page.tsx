"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ArrowUpDown,
  Download,
  Mail,
  Send,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Eye,
} from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertDialog, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EMAIL_PRESETS, PresetKey, getPresetEmailContent } from "@/lib/templates/email";

interface Application {
  _id: string;
  userEmail: string;
  userName?: string;
  fullName?: string;
  firstPreference: string;
  secondPreference: string;
  firstPrefType: string;
  overallStatus: string;
  activePreference: string;
  firstPrefProgress: { currentStage: number; status: string; stages: unknown[] };
  secondPrefProgress: { currentStage: number; status: string; stages: unknown[] };
  createdAt: string;
}

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

export default function AdminApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1, limit: 25 });
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  // Custom export state
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportScope, setExportScope] = useState<"all" | "filtered" | "selected">("all");
  const [exportDept, setExportDept] = useState<string>("");
  const [exportDeptPref, setExportDeptPref] = useState<"any" | "first" | "second" | "active">("any");
  const [exportCols, setExportCols] = useState<Record<string, boolean>>({
    id: false,
    fullName: true,
    email: true,
    phone: true,
    regNo: true,
    year: true,
    branch: false,
    whyMic: false,
    createdAt: true,
    overallStatus: true,
    activePreference: false,
    firstPref: true,
    firstPrefType: false,
    firstPrefStatus: true,
    firstPrefStage: true,
    secondPref: true,
    secondPrefType: false,
    secondPrefStatus: false,
    secondPrefStage: false,
    adminNotes: false,
  });

  // Selection states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkConfirm, setBulkConfirm] = useState<"advance" | "reject" | null>(null);
  const [bulkNote, setBulkNote] = useState("");
  const [bulkProcessing, setBulkProcessing] = useState(false);

  // Mail Presets state
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [selectedPresetKey, setSelectedPresetKey] = useState<PresetKey>("response_saved");
  const [presetNote, setPresetNote] = useState("");
  const [presetSending, setPresetSending] = useState(false);
  const [presetTab, setPresetTab] = useState<"recipients" | "preview">("recipients");
  const [presetTargetScope, setPresetTargetScope] = useState<"selected" | "all">("selected");

  const handleSendPresetEmails = async () => {
    const targetCandidates = presetTargetScope === "selected" && selectedIds.length > 0
      ? selectedIds
      : applications.map(a => a._id);

    if (targetCandidates.length === 0) {
      alert("No candidates selected to send email to.");
      return;
    }

    setPresetSending(true);
    try {
      const res = await fetch("/api/admin/mail/send-preset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          presetKey: selectedPresetKey,
          candidateIds: targetCandidates,
          customNote: presetNote,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert(`Success: ${data.message}`);
        setShowPresetModal(false);
        setPresetNote("");
      } else {
        alert(`Error: ${data.error || "Failed to dispatch emails"}`);
      }
    } catch {
      alert("Failed to communicate with mail server.");
    } finally {
      setPresetSending(false);
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "25",
        ...(search && { q: search }),
        ...(deptFilter && { dept: deptFilter }),
        ...(statusFilter && { status: statusFilter }),
      });
      const res = await fetch(`/api/admin/applications?${params}`);
      const data = await res.json();
      if (data.success) {
        setApplications(data.applications);
        setPagination(data.pagination);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [page, search, deptFilter, statusFilter]);

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
  }, [load]);

  // Bulk selection functions
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const visibleIds = applications.map((app) => app._id);
    const allSelected = visibleIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleBulkActionExecute = async () => {
    if (!bulkConfirm) return;
    setBulkProcessing(true);
    try {
      const res = await fetch("/api/admin/applications/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: bulkConfirm, ids: selectedIds, note: bulkNote }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedIds([]);
        setBulkConfirm(null);
        setBulkNote("");
        load();
      } else {
        alert(data.error ?? "Failed to complete bulk action");
      }
    } catch {
      alert("Failed to communicate with server");
    } finally {
      setBulkProcessing(false);
    }
  };

  const isAllSelected =
    applications.length > 0 && applications.every((app) => selectedIds.includes(app._id));

  return (
    <AdminLayout activePage="applications">
      <div className="p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Applications</h1>
            <p className="text-sm text-zinc-450 mt-1">
              {pagination.total} total applicants found
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowExportModal(true)}
              variant="emerald"
              className="font-bold text-sm gap-2 cursor-pointer flex items-center"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-500 pointer-events-none" />
            <Input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
                setSelectedIds([]);
              }}
              className="pl-9"
            />
          </div>

          <Select
            value={deptFilter}
            onChange={(e) => {
              setDeptFilter(e.target.value);
              setPage(1);
              setSelectedIds([]);
            }}
            icon={<Filter className="h-4 w-4" />}
          >
            <option value="">All Departments</option>
            {DEPTS.map((d) => (
              <option key={d} value={d}>
                {DEPT_NAMES[d]}
              </option>
            ))}
          </Select>

          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
              setSelectedIds([]);
            }}
            icon={<Filter className="h-4 w-4" />}
          >
            <option value="">All Statuses</option>
            <option value="in-progress">In Progress</option>
            <option value="selected">Selected</option>
            <option value="rejected">Rejected</option>
            <option value="waitlisted">Waitlisted</option>
          </Select>
        </div>

        {/* Quick Mail Presets Bar */}
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">Quick Mail Presets</h3>
                <p className="text-[11px] text-zinc-500">Dispatch pre-designed HTML emails to verified candidates</p>
              </div>
            </div>
            {selectedIds.length > 0 && (
              <Badge variant="outline" className="bg-teal-500/10 border-teal-500/30 text-teal-400 font-mono text-[10px] uppercase">
                {selectedIds.length} candidate(s) selected
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            {(Object.keys(EMAIL_PRESETS) as PresetKey[]).map((key) => {
              const preset = EMAIL_PRESETS[key];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setSelectedPresetKey(key);
                    setPresetTargetScope(selectedIds.length > 0 ? "selected" : "all");
                    setShowPresetModal(true);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  style={{
                    borderColor: `${preset.color}40`,
                    backgroundColor: `${preset.color}10`,
                    color: '#f9fafb',
                  }}
                >
                  <span>{preset.icon}</span>
                  <span className="font-semibold">{preset.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Applications List Table */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={toggleSelectAll}
                      className="rounded border-zinc-800 bg-zinc-950 text-teal-500 focus:ring-teal-500 cursor-pointer h-4 w-4"
                    />
                  </TableHead>
                  {["Name", "Email", "1st Pref", "2nd Pref", "Status", "Applied", ""].map((h, i) => (
                    <TableHead key={i}>
                      <div className="flex items-center gap-1">
                        {h} {h && <ArrowUpDown className="h-3 w-3 opacity-40" />}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="h-8 w-8 text-teal-400 animate-spin" />
                        <span className="text-xs text-zinc-500 font-medium">
                          Loading applications...
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : applications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-16 text-center text-zinc-500 text-sm font-medium">
                      No applications found matching criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  applications.map((app) => (
                    <TableRow
                      key={app._id}
                      onClick={() => router.push(`/admin/applications/${app._id}`)}
                      className="cursor-pointer"
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(app._id)}
                          onChange={() => toggleSelect(app._id)}
                          className="rounded border-zinc-800 bg-zinc-950 text-teal-500 focus:ring-teal-500 cursor-pointer h-4 w-4"
                        />
                      </TableCell>
                      <TableCell className="font-bold text-white text-sm truncate max-w-[150px]" title={app.userName || "N/A"}>
                        {app.userName || "—"}
                      </TableCell>
                      <TableCell className="text-zinc-400 text-xs truncate max-w-[200px]">
                        {app.userEmail}
                      </TableCell>
                      <TableCell className="text-zinc-350 text-xs">
                        {DEPT_NAMES[app.firstPreference] ?? app.firstPreference}
                      </TableCell>
                      <TableCell className="text-zinc-355 text-xs">
                        {DEPT_NAMES[app.secondPreference] ?? app.secondPreference}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            app.overallStatus === "selected"
                              ? "success"
                              : app.overallStatus === "rejected"
                              ? "destructive"
                              : app.overallStatus === "waitlisted"
                              ? "info"
                              : "warning"
                          }
                        >
                          {app.overallStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-zinc-500 text-xs font-medium">
                        {new Date(app.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="text-teal-400 hover:text-teal-300 font-bold">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-900 bg-zinc-950/10">
              <p className="text-xs text-zinc-500 font-semibold">
                Page {pagination.page} of {pagination.pages} · {pagination.total} results
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPage((p) => Math.max(1, p - 1));
                  }}
                  disabled={pagination.page <= 1}
                  className="h-9 w-9"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPage((p) => Math.min(pagination.pages, p + 1));
                  }}
                  disabled={pagination.page >= pagination.pages}
                  className="h-9 w-9"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Floating Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-[calc(50%+112px)] -translate-x-1/2 z-30 bg-zinc-950 border border-zinc-800 rounded-2xl py-3 px-6 shadow-2xl flex items-center gap-5 animate-pixel-slide-up">
          <span className="text-xs font-bold text-zinc-400 whitespace-nowrap">
            <strong className="text-white text-sm mr-1">{selectedIds.length}</strong> selected
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedIds([])}
              className="h-9 text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setPresetTargetScope("selected");
                setShowPresetModal(true);
              }}
              className="h-9 text-xs font-bold border-teal-500/40 text-teal-400 hover:bg-teal-500/10 flex items-center gap-1.5"
            >
              <Mail className="h-3.5 w-3.5" />
              Mail Preset ({selectedIds.length})
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setBulkConfirm("reject")}
              className="h-9 text-xs font-bold"
            >
              Bulk Reject
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => setBulkConfirm("advance")}
              className="h-9 text-xs font-bold"
            >
              Bulk Advance
            </Button>
          </div>
        </div>
      )}

      {/* 1. AlertDialog to confirm bulk action updates */}
      <AlertDialog
        isOpen={bulkConfirm !== null}
        onClose={() => {
          setBulkConfirm(null);
          setBulkNote("");
        }}
        onConfirm={handleBulkActionExecute}
        title={bulkConfirm === "advance" ? "Bulk Advance Candidates?" : "Bulk Reject Candidates?"}
        description={`You are about to bulk ${bulkConfirm === "advance" ? "advance" : "reject"} ${
          selectedIds.length
        } candidates in their active preference departments. This action is irreversible. You can optionally write an evaluation note below.`}
        confirmText={bulkConfirm === "advance" ? "Yes, Advance All" : "Yes, Reject All"}
        variant={bulkConfirm === "reject" ? "destructive" : "default"}
        loading={bulkProcessing}
      >
        <div className="space-y-1.5 w-full mt-3">
          <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-extrabold block">
            Optional Evaluation Note
          </label>
          <textarea
            value={bulkNote}
            onChange={(e) => setBulkNote(e.target.value)}
            placeholder="Write note visible to all selected candidates..."
            rows={2}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-zinc-700 resize-none transition-all"
          />
        </div>
      </AlertDialog>

      {/* 2. Custom Export Columns Picker Modal */}
      <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
        <DialogContent className="max-w-2xl bg-zinc-950/95 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 font-sans text-xs max-h-[88vh] overflow-y-auto shadow-2xl space-y-5 text-zinc-200">
          <DialogHeader className="border-b border-zinc-900 pb-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg text-white font-extrabold flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
                  <Download className="h-5 w-5" />
                </div>
                <span>Export Applications CSV</span>
              </DialogTitle>
              <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-teal-400 font-mono">
                {Object.values(exportCols).filter(Boolean).length} / {Object.keys(exportCols).length} columns selected
              </span>
            </div>
            <DialogDescription className="text-xs text-zinc-400 mt-1.5">
              Customize export scope, filter by department preferences, and select data columns to include.
            </DialogDescription>
          </DialogHeader>

          {/* Configuration Grid: Scope & Department Filter */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Export Scope Selector */}
            <div className="p-3.5 bg-zinc-900/40 border border-zinc-800/70 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-zinc-300 uppercase tracking-wider">
                  Export Scope
                </span>
                <span className="text-[10px] text-zinc-500 font-medium">
                  {exportScope === "all" ? `${pagination.total} records` : exportScope === "selected" ? `${selectedIds.length} selected` : "Filtered"}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setExportScope("all")}
                  className={`px-2.5 py-2 rounded-lg border text-[11px] font-bold transition-all ${
                    exportScope === "all"
                      ? "bg-teal-500/15 border-teal-500/80 text-teal-300 shadow-[0_0_10px_rgba(20,184,166,0.15)]"
                      : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                  }`}
                >
                  All ({pagination.total})
                </button>
                <button
                  type="button"
                  onClick={() => setExportScope("filtered")}
                  className={`px-2.5 py-2 rounded-lg border text-[11px] font-bold transition-all ${
                    exportScope === "filtered"
                      ? "bg-teal-500/15 border-teal-500/80 text-teal-300 shadow-[0_0_10px_rgba(20,184,166,0.15)]"
                      : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                  }`}
                >
                  Filtered
                </button>
                <button
                  type="button"
                  disabled={selectedIds.length === 0}
                  onClick={() => setExportScope("selected")}
                  className={`px-2.5 py-2 rounded-lg border text-[11px] font-bold transition-all ${
                    selectedIds.length === 0
                      ? "bg-zinc-950/40 border-zinc-900/60 text-zinc-600 cursor-not-allowed"
                      : exportScope === "selected"
                      ? "bg-teal-500/15 border-teal-500/80 text-teal-300 shadow-[0_0_10px_rgba(20,184,166,0.15)]"
                      : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                  }`}
                >
                  Selected ({selectedIds.length})
                </button>
              </div>
            </div>

            {/* Department Filter Section */}
            <div className="p-3.5 bg-zinc-900/40 border border-zinc-800/70 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-zinc-300 uppercase tracking-wider">
                  Target Department
                </span>
                {exportDept && (
                  <button
                    type="button"
                    onClick={() => {
                      setExportDept("");
                      setExportDeptPref("any");
                    }}
                    className="text-[10px] text-teal-400 hover:text-teal-300 hover:underline font-semibold transition-colors"
                  >
                    Reset Filter
                  </button>
                )}
              </div>
              <select
                value={exportDept}
                onChange={(e) => setExportDept(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-teal-500/60 transition-colors cursor-pointer"
              >
                <option value="">All Departments</option>
                {DEPTS.map((slug) => (
                  <option key={slug} value={slug}>
                    {DEPT_NAMES[slug]}
                  </option>
                ))}
              </select>

              {exportDept && (
                <div className="grid grid-cols-4 gap-1 pt-0.5">
                  {[
                    ["any", "Either"],
                    ["first", "1st Pref"],
                    ["second", "2nd Pref"],
                    ["active", "Active"],
                  ].map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setExportDeptPref(key as "any" | "first" | "second" | "active")}
                      className={`px-1.5 py-1 rounded-md text-[10px] font-bold border transition-all ${
                        exportDeptPref === key
                          ? "bg-teal-500/20 border-teal-500/80 text-teal-300"
                          : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Presets Toolbar */}
          <div className="p-3 bg-zinc-900/30 border border-zinc-800/50 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider">
                Column Presets
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    setExportCols((cols) =>
                      Object.keys(cols).reduce((acc, k) => ({ ...acc, [k]: true }), {})
                    )
                  }
                  className="px-2.5 py-1 bg-teal-500/10 border border-teal-500/30 text-teal-300 hover:bg-teal-500/20 rounded-lg text-[10px] font-bold transition-all"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setExportCols((cols) =>
                      Object.keys(cols).reduce((acc, k) => ({ ...acc, [k]: false }), {})
                    )
                  }
                  className="px-2.5 py-1 bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg text-[10px] font-bold transition-all"
                >
                  Deselect All
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() =>
                  setExportCols({
                    id: false,
                    fullName: true,
                    email: true,
                    phone: true,
                    regNo: true,
                    year: true,
                    branch: true,
                    whyMic: false,
                    createdAt: true,
                    overallStatus: true,
                    activePreference: false,
                    firstPref: true,
                    firstPrefType: false,
                    firstPrefStatus: true,
                    firstPrefStage: true,
                    secondPref: true,
                    secondPrefType: false,
                    secondPrefStatus: false,
                    secondPrefStage: false,
                    adminNotes: false,
                  })
                }
                className="px-3 py-1.5 bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 text-zinc-300 rounded-lg text-xs font-semibold transition-all hover:bg-zinc-800/60"
              >
                Standard Summary
              </button>
              <button
                type="button"
                onClick={() =>
                  setExportCols({
                    id: true,
                    fullName: true,
                    email: true,
                    phone: true,
                    regNo: true,
                    year: true,
                    branch: true,
                    whyMic: true,
                    createdAt: true,
                    overallStatus: true,
                    activePreference: true,
                    firstPref: true,
                    firstPrefType: true,
                    firstPrefStatus: true,
                    firstPrefStage: true,
                    secondPref: true,
                    secondPrefType: true,
                    secondPrefStatus: true,
                    secondPrefStage: true,
                    adminNotes: false,
                  })
                }
                className="px-3 py-1.5 bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 text-zinc-300 rounded-lg text-xs font-semibold transition-all hover:bg-zinc-800/60"
              >
                Full Candidate Profile
              </button>
              <button
                type="button"
                onClick={() =>
                  setExportCols({
                    id: false,
                    fullName: true,
                    email: true,
                    phone: false,
                    regNo: true,
                    year: false,
                    branch: false,
                    whyMic: false,
                    createdAt: true,
                    overallStatus: true,
                    activePreference: true,
                    firstPref: true,
                    firstPrefType: false,
                    firstPrefStatus: true,
                    firstPrefStage: true,
                    secondPref: true,
                    secondPrefType: false,
                    secondPrefStatus: true,
                    secondPrefStage: true,
                    adminNotes: true,
                  })
                }
                className="px-3 py-1.5 bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 text-zinc-300 rounded-lg text-xs font-semibold transition-all hover:bg-zinc-800/60"
              >
                Admin Review Notes
              </button>
            </div>
          </div>

          {/* Categorized Data Columns */}
          <div className="space-y-4 pt-1">
            {/* Candidate Details */}
            <div className="space-y-2">
              <span className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider block">
                Candidate Profile Details
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  ["fullName", "Full Name"],
                  ["email", "Email Address"],
                  ["phone", "Phone Number"],
                  ["regNo", "Registration No"],
                  ["year", "Academic Year"],
                  ["branch", "Branch"],
                  ["whyMic", "Why MIC Statement"],
                  ["createdAt", "Applied Date"],
                ].map(([key, label]) => (
                  <label
                    key={key}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer select-none transition-all ${
                      exportCols[key]
                        ? "bg-teal-500/10 border-teal-500/40 text-white"
                        : "bg-zinc-900/30 border-zinc-800/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={!!exportCols[key]}
                      onChange={(e) =>
                        setExportCols((cols) => ({ ...cols, [key]: e.target.checked }))
                      }
                      className="rounded border-zinc-700 bg-zinc-950 text-teal-500 focus:ring-teal-500/40 cursor-pointer h-4 w-4"
                    />
                    <span className="font-semibold text-xs">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Application & Preference Details */}
            <div className="space-y-2">
              <span className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider block">
                Application & Preference Status
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  ["id", "Applicant ID"],
                  ["overallStatus", "Overall Status"],
                  ["activePreference", "Active Preference"],
                  ["firstPref", "First Preference"],
                  ["firstPrefType", "First Pref Type"],
                  ["firstPrefStatus", "First Pref Status"],
                  ["firstPrefStage", "First Pref Stage"],
                  ["secondPref", "Second Preference"],
                  ["secondPrefType", "Second Pref Type"],
                  ["secondPrefStatus", "Second Pref Status"],
                  ["secondPrefStage", "Second Pref Stage"],
                ].map(([key, label]) => (
                  <label
                    key={key}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer select-none transition-all ${
                      exportCols[key]
                        ? "bg-teal-500/10 border-teal-500/40 text-white"
                        : "bg-zinc-900/30 border-zinc-800/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={!!exportCols[key]}
                      onChange={(e) =>
                        setExportCols((cols) => ({ ...cols, [key]: e.target.checked }))
                      }
                      className="rounded border-zinc-700 bg-zinc-950 text-teal-500 focus:ring-teal-500/40 cursor-pointer h-4 w-4"
                    />
                    <span className="font-semibold text-xs">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Evaluations & Notes */}
            <div className="space-y-2">
              <span className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider block">
                Evaluations & Interview Notes
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  ["adminNotes", "Admin Review Notes"],
                ].map(([key, label]) => (
                  <label
                    key={key}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer select-none transition-all ${
                      exportCols[key]
                        ? "bg-teal-500/10 border-teal-500/40 text-white"
                        : "bg-zinc-900/30 border-zinc-800/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={!!exportCols[key]}
                      onChange={(e) =>
                        setExportCols((cols) => ({ ...cols, [key]: e.target.checked }))
                      }
                      className="rounded border-zinc-700 bg-zinc-950 text-teal-500 focus:ring-teal-500/40 cursor-pointer h-4 w-4"
                    />
                    <span className="font-semibold text-xs">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-zinc-900 mt-4">
            <span className="text-xs text-zinc-500 font-medium">
              File format: <span className="font-mono text-zinc-300">{exportDept ? ".csv (UTF-8)" : ".zip / separate .csv"}</span>
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowExportModal(false)}
                className="px-4 font-semibold rounded-xl h-9 text-xs cursor-pointer select-none border-zinc-800 text-zinc-300 hover:bg-zinc-900"
              >
                Cancel
              </Button>
              {!exportDept && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={async () => {
                    const cols = Object.entries(exportCols)
                      .filter(([_, active]) => active)
                      .map(([key]) => key)
                      .join(",");
                    for (const slug of DEPTS) {
                      const params = new URLSearchParams({
                        columns: cols,
                        scope: exportScope,
                        dept: slug,
                        format: "csv",
                      });
                      if (exportScope === "selected" && selectedIds.length > 0) {
                        params.set("ids", selectedIds.join(","));
                      } else if (exportScope === "filtered") {
                        if (statusFilter) params.set("status", statusFilter);
                        if (search) params.set("q", search);
                      }
                      const a = document.createElement("a");
                      a.href = `/api/admin/applications/export?${params.toString()}`;
                      a.download = `${slug}.csv`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      await new Promise((res) => setTimeout(res, 300));
                    }
                    setShowExportModal(false);
                  }}
                  className="border-teal-500/40 text-teal-300 hover:bg-teal-500/10 font-bold px-4 rounded-xl h-9 text-xs cursor-pointer select-none flex items-center gap-1.5"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download Separate CSVs
                </Button>
              )}
              <Button
                type="button"
                onClick={() => {
                  const cols = Object.entries(exportCols)
                    .filter(([_, active]) => active)
                    .map(([key]) => key)
                    .join(",");
                  const params = new URLSearchParams({
                    columns: cols,
                    scope: exportScope,
                  });
                  if (exportDept) {
                    params.set("dept", exportDept);
                    params.set("pref", exportDeptPref);
                    params.set("format", "csv");
                  } else {
                    params.set("format", "zip");
                  }
                  if (exportScope === "selected" && selectedIds.length > 0) {
                    params.set("ids", selectedIds.join(","));
                  } else if (exportScope === "filtered") {
                    if (deptFilter && !exportDept) params.set("dept", deptFilter);
                    if (statusFilter) params.set("status", statusFilter);
                    if (search) params.set("q", search);
                  }
                  window.location.href = `/api/admin/applications/export?${params.toString()}`;
                  setShowExportModal(false);
                }}
                className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-5 rounded-xl h-9 text-xs cursor-pointer select-none flex items-center gap-2 shadow-[0_0_15px_rgba(20,184,166,0.2)] transition-all"
              >
                <Download className="h-4 w-4" />
                {exportDept ? "Download Department CSV" : "Download All Departments (ZIP)"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preset Email Modal */}
      <Dialog open={showPresetModal} onOpenChange={setShowPresetModal}>
        <DialogContent className="sm:max-w-2xl bg-zinc-950 border-zinc-800 text-zinc-100 p-6 rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                  Send Preset Email
                </DialogTitle>
                <DialogDescription className="text-xs text-zinc-400 mt-0.5">
                  Select a template preset, verify recipients, and dispatch HTML email
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-5 py-3">
            {/* Target Scope Selection */}
            <div className="flex items-center justify-between bg-zinc-900/60 p-3 rounded-xl border border-zinc-800 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-teal-400" />
                <span className="text-xs font-semibold text-zinc-300">Target Recipients:</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant={presetTargetScope === "selected" ? "emerald" : "outline"}
                  size="sm"
                  onClick={() => setPresetTargetScope("selected")}
                  disabled={selectedIds.length === 0}
                  className="h-7 text-xs px-3"
                >
                  Selected ({selectedIds.length})
                </Button>
                <Button
                  type="button"
                  variant={presetTargetScope === "all" ? "emerald" : "outline"}
                  size="sm"
                  onClick={() => setPresetTargetScope("all")}
                  className="h-7 text-xs px-3"
                >
                  All Visible ({applications.length})
                </Button>
              </div>
            </div>

            {/* Preset Key Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                1. Select Email Preset
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(Object.keys(EMAIL_PRESETS) as PresetKey[]).map((key) => {
                  const p = EMAIL_PRESETS[key];
                  const isSelected = selectedPresetKey === key;
                  return (
                    <div
                      key={key}
                      onClick={() => setSelectedPresetKey(key)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                        isSelected
                          ? "bg-teal-500/10 border-teal-500 text-white shadow-[0_0_12px_rgba(20,184,166,0.15)]"
                          : "bg-zinc-900/40 border-zinc-800/80 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                      }`}
                    >
                      <span className="text-xl mt-0.5">{p.icon}</span>
                      <div>
                        <div className="font-bold text-xs flex items-center gap-2">
                          {p.label}
                          {isSelected && (
                            <Badge variant="outline" className="bg-teal-500/20 text-teal-300 border-teal-500/40 text-[9px] py-0">
                              Active
                            </Badge>
                          )}
                        </div>
                        <div className="text-[11px] text-zinc-500 mt-0.5">{p.description}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Custom Note Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                <span>2. Custom Reviewer Note (Optional)</span>
                <span className="text-[10px] text-zinc-500 lowercase font-normal">Included in template note block</span>
              </label>
              <Input
                type="text"
                placeholder="e.g. Please bring your student ID card for Stage 2..."
                value={presetNote}
                onChange={(e) => setPresetNote(e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-xs"
              />
            </div>

            {/* Tabs: Recipients vs Live Preview */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
                <button
                  type="button"
                  onClick={() => setPresetTab("recipients")}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 ${
                    presetTab === "recipients"
                      ? "bg-zinc-800 text-white"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Verified Recipients (
                  {(presetTargetScope === "selected" && selectedIds.length > 0
                    ? selectedIds
                    : applications.map((a) => a._id)
                  ).length}
                  )
                </button>

                <button
                  type="button"
                  onClick={() => setPresetTab("preview")}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 ${
                    presetTab === "preview"
                      ? "bg-zinc-800 text-white"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <Eye className="h-3.5 w-3.5" />
                  Template Preview
                </button>
              </div>

              {presetTab === "recipients" ? (
                <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                  {(presetTargetScope === "selected" && selectedIds.length > 0
                    ? applications.filter((a) => selectedIds.includes(a._id))
                    : applications
                  ).map((app) => (
                    <div
                      key={app._id}
                      className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/60 text-xs"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <div className="h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
                        <span className="font-semibold text-zinc-200 truncate">
                          {app.fullName || app.userName || app.userEmail}
                        </span>
                        <span className="text-zinc-500 font-mono text-[10px]">({app.userEmail})</span>
                      </div>
                      <Badge variant="outline" className="text-[10px] text-zinc-400 border-zinc-800 uppercase shrink-0">
                        {app.firstPreference}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
                  <div className="text-xs text-zinc-400 font-semibold border-b border-zinc-800/80 pb-2 flex items-center justify-between">
                    <span>
                      Subject:{" "}
                      <strong className="text-white">
                        {
                          getPresetEmailContent({
                            presetKey: selectedPresetKey,
                            candidateName: "Student Name",
                            departmentName: "Development",
                            applicationId: "MIC-12345",
                            customNote: presetNote,
                          }).subject
                        }
                      </strong>
                    </span>
                    <Badge
                      variant="outline"
                      style={{
                        borderColor: EMAIL_PRESETS[selectedPresetKey].color,
                        color: EMAIL_PRESETS[selectedPresetKey].color,
                      }}
                    >
                      {EMAIL_PRESETS[selectedPresetKey].badge}
                    </Badge>
                  </div>
                  <div className="max-h-60 overflow-y-auto rounded bg-black/40 p-2 border border-zinc-900">
                    <iframe
                      srcDoc={
                        getPresetEmailContent({
                          presetKey: selectedPresetKey,
                          candidateName: "Alex Morgan",
                          departmentName: "Development",
                          applicationId: "MIC-2026-001",
                          customNote: presetNote || undefined,
                        }).html
                      }
                      className="w-full h-56 border-0 rounded"
                      title="Email Preview"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-900">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPresetModal(false)}
              className="px-4 font-semibold rounded-xl h-9 text-xs border-zinc-800 text-zinc-300 hover:bg-zinc-900"
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={handleSendPresetEmails}
              disabled={presetSending}
              className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold px-6 rounded-xl h-10 text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(20,184,166,0.25)] transition-all cursor-pointer"
            >
              {presetSending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending Emails...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Mail to Verified Candidates
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}



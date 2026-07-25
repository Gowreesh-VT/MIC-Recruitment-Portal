"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  ChevronDown,
  ChevronUp,
  Save,
  CheckCircle2,
  Download,
  Clock,
  Mail,
} from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AlertDialog } from "@/components/ui/dialog";

export default function AdminSettingsPage() {
  const router = useRouter();
  const [cycle, setCycle] = useState<{ isOpen: boolean; label: string; startAt?: string; endAt?: string; } | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  // Backups state
  const [backingUp, setBackingUp] = useState(false);

  // Schedule Dates
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [savedSchedule, setSavedSchedule] = useState(false);

  // Countdown Timer state
  const [countdownEnabled, setCountdownEnabled] = useState(false);
  const [countdownTarget, setCountdownTarget] = useState("");
  const [countdownTitle, setCountdownTitle] = useState("Recruitment Countdown");
  const [savingCountdown, setSavingCountdown] = useState(false);
  const [savedCountdown, setSavedCountdown] = useState(false);

  // Email notifications state
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true);
  const [togglingEmail, setTogglingEmail] = useState(false);
  
  // AlertDialog state
  const [showCycleConfirm, setShowCycleConfirm] = useState(false);

  const formatToDatetimeLocal = (dateStr?: string | Date) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    const offset = d.getTimezoneOffset();
    const adjusted = new Date(d.getTime() - offset * 60 * 1000);
    return adjusted.toISOString().slice(0, 16);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const cycleRes = await fetch("/api/admin/cycle");
        const cycleData = await cycleRes.json();
        if (cycleData.success && cycleData.cycle) {
          setCycle(cycleData.cycle);
          setStartAt(formatToDatetimeLocal(cycleData.cycle.startAt));
          setEndAt(formatToDatetimeLocal(cycleData.cycle.endAt));
          setCountdownEnabled(cycleData.cycle.countdownEnabled ?? false);
          setCountdownTarget(formatToDatetimeLocal(cycleData.cycle.countdownTarget ?? cycleData.cycle.startAt));
          setCountdownTitle(cycleData.cycle.countdownTitle ?? "Recruitment Countdown");
          setEmailNotificationsEnabled(cycleData.cycle.emailNotificationsEnabled ?? true);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleToggleEmailNotifications = async () => {
    if (!cycle) return;
    setTogglingEmail(true);
    try {
      const res = await fetch("/api/admin/cycle", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isOpen: cycle.isOpen,
          emailNotificationsEnabled: !emailNotificationsEnabled,
        }),
      });
      const data = await res.json();
      if (data.success && data.cycle) {
        setCycle(data.cycle);
        setEmailNotificationsEnabled(data.cycle.emailNotificationsEnabled ?? true);
      }
    } catch {
      alert("Failed to update email notification settings.");
    } finally {
      setTogglingEmail(false);
    }
  };

  const handleToggleCycleConfirm = async () => {
    if (!cycle) return;
    setShowCycleConfirm(false);
    setToggling(true);
    try {
      const res = await fetch("/api/admin/cycle", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOpen: !cycle.isOpen }),
      });
      const data = await res.json();
      if (data.success) setCycle(data.cycle);
    } catch {
      // ignore
    } finally {
      setToggling(false);
    }
  };

  const handleSaveTimerConfig = async () => {
    if (!cycle) return;
    setSavingSchedule(true);
    try {
      const targetIso = countdownTarget
        ? new Date(countdownTarget).toISOString()
        : endAt
        ? new Date(endAt).toISOString()
        : startAt
        ? new Date(startAt).toISOString()
        : null;

      const res = await fetch("/api/admin/cycle", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isOpen: cycle.isOpen,
          startAt: startAt ? new Date(startAt).toISOString() : null,
          endAt: endAt ? new Date(endAt).toISOString() : null,
          countdownEnabled,
          countdownTarget: targetIso,
          countdownTitle: countdownTitle || "Recruitment Countdown",
        }),
      });
      const data = await res.json();
      if (data.success && data.cycle) {
        setCycle(data.cycle);
        setStartAt(formatToDatetimeLocal(data.cycle.startAt));
        setEndAt(formatToDatetimeLocal(data.cycle.endAt));
        setCountdownEnabled(data.cycle.countdownEnabled ?? false);
        setCountdownTarget(formatToDatetimeLocal(data.cycle.countdownTarget ?? data.cycle.endAt ?? data.cycle.startAt));
        setCountdownTitle(data.cycle.countdownTitle ?? "Recruitment Countdown");
        setSavedSchedule(true);
        setTimeout(() => setSavedSchedule(false), 2500);
      }
    } catch {
      alert("Failed to save schedule & countdown settings.");
    } finally {
      setSavingSchedule(false);
    }
  };

  const handleDownloadBackup = async () => {
    setBackingUp(true);
    try {
      window.location.href = "/api/admin/backup";
    } catch {
      alert("Failed to initiate database backup download.");
    } finally {
      setTimeout(() => setBackingUp(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 text-teal-400 animate-spin" />
          <p className="text-sm text-zinc-400 font-medium">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout activePage="settings">
      <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Settings</h1>
          <p className="text-sm text-zinc-450 mt-1">Manage recruitment cycle status, schedule timers, and database backups</p>
        </div>

        {/* Recruitment cycle status toggle */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">Recruitment Forms Status</CardTitle>
            <CardDescription>Open or close applications for the recruitment cycle</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between flex-wrap gap-6">
              <div>
                <p className="text-sm font-bold text-zinc-200">{cycle?.label ?? "MIC Recruitment 2026–27"}</p>
                <p className="text-xs text-zinc-500 mt-1">
                  {cycle?.isOpen
                    ? "Students can currently access the portal to apply and modify responses."
                    : "All application forms and candidate edit controls are currently locked."}
                </p>
              </div>
              <Button
                variant={cycle?.isOpen ? "default" : "destructive"}
                onClick={() => setShowCycleConfirm(true)}
                disabled={toggling}
                className="px-6 font-bold h-11 cursor-pointer"
              >
                {toggling && <Loader2 className="h-4 w-4 animate-spin" />}
                {cycle?.isOpen ? "OPEN — Click to Close" : "CLOSED — Click to Open"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Unified Schedule & Countdown Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-400" />
              Schedule & Website Countdown Configuration
            </CardTitle>
            <CardDescription>
              Configure auto-open / auto-close schedule times and public website countdown settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-0">
            <div className="flex items-center justify-between flex-wrap gap-6 border-b border-zinc-900 pb-4">
              <div>
                <p className="text-sm font-bold text-zinc-200">Website Countdown Display</p>
                <p className="text-xs text-zinc-500 mt-1">
                  {countdownEnabled
                    ? "Countdown timer is active and visible on Home & Recruitments pages."
                    : "Countdown timer is currently hidden from the public website."}
                </p>
              </div>
              <Button
                variant={countdownEnabled ? "emerald" : "outline"}
                onClick={() => setCountdownEnabled(!countdownEnabled)}
                className="px-6 font-bold h-10 cursor-pointer"
              >
                {countdownEnabled ? "ENABLED (Click to Hide)" : "DISABLED (Click to Enable)"}
              </Button>
            </div>

            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-550 uppercase tracking-widest font-extrabold">Auto-Open Schedule Time</label>
                  <Input
                    type="datetime-local"
                    value={startAt}
                    onChange={(e) => setStartAt(e.target.value)}
                    className="font-mono text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-550 uppercase tracking-widest font-extrabold">Auto-Close Schedule Time</label>
                  <Input
                    type="datetime-local"
                    value={endAt}
                    onChange={(e) => {
                      setEndAt(e.target.value);
                      if (!countdownTarget) {
                        setCountdownTarget(e.target.value);
                      }
                    }}
                    className="font-mono text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-550 uppercase tracking-widest font-extrabold">Target Countdown Time</label>
                  <Input
                    type="datetime-local"
                    value={countdownTarget}
                    onChange={(e) => setCountdownTarget(e.target.value)}
                    className="font-mono text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-550 uppercase tracking-widest font-extrabold">Countdown Banner Title</label>
                  <Input
                    type="text"
                    value={countdownTitle}
                    onChange={(e) => setCountdownTitle(e.target.value)}
                    placeholder="e.g. Recruitment Countdown"
                    className="text-xs"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleSaveTimerConfig}
                  disabled={savingSchedule}
                  variant="emerald"
                  className="font-bold text-sm h-10 min-w-44 gap-2 cursor-pointer"
                >
                  {savingSchedule ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : savedSchedule ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {savedSchedule ? "Settings Saved!" : "Save Schedule & Countdown"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>



        {/* Automated Email Delivery Toggle */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Mail className="h-5 w-5 text-sky-400" />
              Automated Email Delivery
            </CardTitle>
            <CardDescription>
              Control automated email notifications sent to students upon final preference confirmation
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between flex-wrap gap-6">
              <div>
                <p className="text-sm font-bold text-zinc-200">
                  {emailNotificationsEnabled ? "Automated Email Delivery is Active" : "Automated Email Delivery is Disabled"}
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  {emailNotificationsEnabled
                    ? "Confirmation emails will be sent automatically when candidates finalize their Tech & Non-Tech preferences."
                    : "No automated emails will be dispatched to candidates."}
                </p>
              </div>
              <Button
                variant={emailNotificationsEnabled ? "emerald" : "destructive"}
                onClick={handleToggleEmailNotifications}
                disabled={togglingEmail}
                className="px-6 font-bold h-10 cursor-pointer"
              >
                {togglingEmail && <Loader2 className="h-4 w-4 animate-spin shrink-0" />}
                {emailNotificationsEnabled ? "ENABLED (Click to Disable)" : "DISABLED (Click to Enable)"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Management & Backups Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-zinc-900 bg-zinc-950/10 flex-wrap gap-4">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Download className="h-5 w-5 text-teal-400" />
                System Management & Backups
              </CardTitle>
              <CardDescription>
                Download full database snapshots in JSON format for offline backup
              </CardDescription>
            </div>
            <Button
              variant="emerald"
              onClick={handleDownloadBackup}
              disabled={backingUp}
              className="font-bold text-xs gap-2 h-9 cursor-pointer"
            >
              {backingUp ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {backingUp ? "Exporting JSON..." : "Download Backup (JSON)"}
            </Button>
          </CardHeader>
        </Card>
      </div>

      {/* AlertDialog to replace standard window.confirm */}
      <AlertDialog
        isOpen={showCycleConfirm}
        onClose={() => setShowCycleConfirm(false)}
        onConfirm={handleToggleCycleConfirm}
        title={cycle?.isOpen ? "Lock Recruitment Applications?" : "Unlock Recruitment Applications?"}
        description={
          cycle?.isOpen
            ? "Students will no longer be able to submit application requests or adjust their existing application settings. Are you sure you want to proceed?"
            : "This action will reopen forms and allow new candidates to submit forms and edit settings. Are you sure you want to proceed?"
        }
        confirmText={cycle?.isOpen ? "Yes, Lock Cycle" : "Yes, Unlock Cycle"}
        variant={cycle?.isOpen ? "destructive" : "default"}
        loading={toggling}
      />
    </AdminLayout>
  );
}

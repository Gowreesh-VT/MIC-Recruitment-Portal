"use client";

import React, { useEffect, useState } from "react";
import {
  Calendar,
  Plus,
  Trash2,
  Video,
  MapPin,
  CheckCircle2,
  RefreshCw,
  Loader2,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

// Department mapping
const DEPT_NAMES: Record<string, string> = {
  all: "All Departments",
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

interface InterviewSlot {
  _id: string;
  adminEmail: string;
  panelName?: string;
  deptSlug: string;
  startTime: string;
  endTime: string;
  status: "available" | "booked" | "completed" | "cancelled";
  locationType: "offline" | "online";
  locationDetails: string;
  bookedBy?: {
    userId: string;
    userEmail: string;
    userName?: string;
  };
}

const getPanelColorClass = (panelName?: string) => {
  const name = panelName?.trim() || "Panel 1";
  if (name.includes("1")) return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
  if (name.includes("2")) return "bg-sky-500/15 text-sky-300 border-sky-500/30";
  if (name.includes("3")) return "bg-amber-500/15 text-amber-300 border-amber-500/30";
  if (name.includes("4")) return "bg-purple-500/15 text-purple-300 border-purple-500/30";
  return "bg-rose-500/15 text-rose-300 border-rose-500/30";
};

export default function AdminInterviewsPage() {
  const [slots, setSlots] = useState<InterviewSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Pagination
  const [filterDept, setFilterDept] = useState("all");
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // Form States
  const [creationMode, setCreationMode] = useState<"single" | "generate">("single");
  const [deptSlug, setDeptSlug] = useState("all");
  const [adminEmail, setAdminEmail] = useState("");
  const [panelName, setPanelName] = useState("Panel 1");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState(""); // used for single slot
  
  // Generating params
  const [duration, setDuration] = useState("30"); // in minutes
  const [count, setCount] = useState("5"); // number of slots to generate
  
  const [locationType, setLocationType] = useState<"offline" | "online">("online");
  const [locationDetails, setLocationDetails] = useState("Online");

  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadSlots = async () => {
    try {
      const res = await fetch("/api/admin/interviews");
      const data = await res.json();
      if (data.success) {
        setSlots(data.slots);
      }
    } catch (err) {
      console.error("Failed to load slots:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadSlots();
  }, []);

  const handleCreateSlots = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!adminEmail || !date || !startTime || !locationDetails) {
      setFormError("Please fill out all required fields.");
      return;
    }

    setSubmitting(true);

    try {
      if (creationMode === "single") {
        if (!endTime) {
          setFormError("End time is required for single slots.");
          setSubmitting(false);
          return;
        }

        const startDateTime = new Date(`${date}T${startTime}`);
        const endDateTime = new Date(`${date}T${endTime}`);

        if (endDateTime <= startDateTime) {
          setFormError("End time must be after start time.");
          setSubmitting(false);
          return;
        }

        const res = await fetch("/api/admin/interviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            adminEmail,
            panelName: panelName || "Panel 1",
            deptSlug,
            startTime: startDateTime.toISOString(),
            endTime: endDateTime.toISOString(),
            locationType,
            locationDetails,
          }),
        });

        const data = await res.json();
        if (data.success) {
          setFormSuccess("Interview slot created successfully!");
          resetForm();
          loadSlots();
        } else {
          setFormError(data.error ?? "Failed to create interview slot.");
        }
      } else {
        // Generate consecutive slots
        const startDateTime = new Date(`${date}T${startTime}`);
        const durMin = parseInt(duration, 10);
        const slotsCount = parseInt(count, 10);

        if (isNaN(durMin) || durMin <= 0 || isNaN(slotsCount) || slotsCount <= 0) {
          setFormError("Invalid duration or slot count.");
          setSubmitting(false);
          return;
        }

        const generatedList = [];
        let currentStart = new Date(startDateTime);

        for (let i = 0; i < slotsCount; i++) {
          const currentEnd = new Date(currentStart.getTime() + durMin * 60 * 1000);
          generatedList.push({
            adminEmail,
            panelName: panelName || "Panel 1",
            deptSlug,
            startTime: currentStart.toISOString(),
            endTime: currentEnd.toISOString(),
            locationType,
            locationDetails,
          });
          currentStart = new Date(currentEnd); // set start of next slot to end of current
        }

        const res = await fetch("/api/admin/interviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slots: generatedList }),
        });

        const data = await res.json();
        if (data.success) {
          setFormSuccess(`Successfully generated ${data.count} interview slots for ${panelName}!`);
          resetForm();
          loadSlots();
        } else {
          setFormError(data.error ?? "Failed to generate interview slots.");
        }
      }
    } catch {
      setFormError("An unexpected error occurred while saving.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setAdminEmail("");
    setDate("");
    setStartTime("");
    setEndTime("");
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!confirm("Are you sure you want to delete this interview slot?")) return;

    try {
      const res = await fetch(`/api/admin/interviews/${slotId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        loadSlots();
      } else {
        alert(data.error || "Failed to delete slot.");
      }
    } catch {
      alert("Failed to delete slot.");
    }
  };

  // Filter & Pagination Logic
  const filteredSlots = slots.filter((s) => {
    if (filterDept !== "all" && s.deptSlug !== filterDept) return false;
    if (filterStatus !== "all" && s.status !== filterStatus) return false;
    if (filterDate) {
      const slotDateStr = new Date(s.startTime).toISOString().split("T")[0];
      if (slotDateStr !== filterDate) return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filteredSlots.length / PAGE_SIZE) || 1;
  const paginatedSlots = filteredSlots.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filterDept, filterDate, filterStatus]);

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 text-teal-400 animate-spin" />
          <p className="text-sm text-zinc-400 font-medium">Loading Interview Panel...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout activePage="interviews">
      <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Calendar className="h-8 w-8 text-teal-400" />
              Interview Management
            </h1>
            <p className="text-sm text-zinc-450 mt-1">
              Create offline/online slots for parallel panels and review candidate bookings.
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setRefreshing(true);
              loadSlots();
            }}
            className="h-10 w-10 text-zinc-400 hover:text-white cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Create Form - 5 columns */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="border border-zinc-900 bg-zinc-950/40">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Plus className="h-4 w-4 text-teal-400" />
                  Add Availability Slots
                </CardTitle>
                <CardDescription className="text-xs">
                  Offer candidate slots for parallel panels.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateSlots} className="space-y-4">
                  {formError && (
                    <div className="p-3 text-xs bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl">
                      {formError}
                    </div>
                  )}
                  {formSuccess && (
                    <div className="p-3 text-xs bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-xl">
                      {formSuccess}
                    </div>
                  )}

                  {/* Mode Selector */}
                  <div className="grid grid-cols-2 gap-2 bg-zinc-950 border border-zinc-900 p-1 rounded-xl text-center text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setCreationMode("single")}
                      className={`py-2 rounded-lg transition-all cursor-pointer ${
                        creationMode === "single"
                          ? "bg-zinc-900 text-teal-400"
                          : "text-zinc-550 hover:text-zinc-300"
                      }`}
                    >
                      Single Slot
                    </button>
                    <button
                      type="button"
                      onClick={() => setCreationMode("generate")}
                      className={`py-2 rounded-lg transition-all cursor-pointer ${
                        creationMode === "generate"
                          ? "bg-zinc-900 text-teal-400"
                          : "text-zinc-550 hover:text-zinc-300"
                      }`}
                    >
                      Generate Bulk
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-extrabold">Department</label>
                      <Select value={deptSlug} onChange={(e) => setDeptSlug(e.target.value)}>
                        {Object.entries(DEPT_NAMES).map(([slug, name]) => (
                          <option key={slug} value={slug}>
                            {name}
                          </option>
                        ))}
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-extrabold">Panel Name</label>
                      <Select value={panelName} onChange={(e) => setPanelName(e.target.value)}>
                        <option value="Panel 1">Panel 1</option>
                        <option value="Panel 2">Panel 2</option>
                        <option value="Panel 3">Panel 3</option>
                        <option value="Panel 4">Panel 4</option>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-extrabold">Interviewer Email</label>
                    <Input
                      type="email"
                      placeholder="interviewer@vitstudent.ac.in"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-extrabold">Date</label>
                    <Input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-extrabold">Start Time</label>
                      <Input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                      />
                    </div>

                    {creationMode === "single" ? (
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-extrabold">End Time</label>
                        <Input
                          type="time"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                        />
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-extrabold">Duration (Min)</label>
                        <Input
                          type="number"
                          value={duration}
                          onChange={(e) => setDuration(e.target.value)}
                        />
                      </div>
                    )}
                  </div>

                  {creationMode === "generate" && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-extrabold">Number of Slots</label>
                      <Input
                        type="number"
                        min="1"
                        max="20"
                        value={count}
                        onChange={(e) => setCount(e.target.value)}
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-extrabold">Format</label>
                      <Select value={locationType} onChange={(e) => setLocationType(e.target.value as "offline" | "online")}>
                        <option value="online">Online (WhatsApp Group)</option>
                        <option value="offline">Offline (In-Person)</option>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-extrabold">Venue / Details</label>
                      <Input
                        type="text"
                        placeholder={locationType === "online" ? "Online" : "MIC Lab / Room 204"}
                        value={locationDetails}
                        onChange={(e) => setLocationDetails(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl shadow-[0_0_15px_rgba(20,184,166,0.2)] gap-2 flex items-center justify-center cursor-pointer transition-all"
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    {creationMode === "single" ? "Create Slot" : "Generate Slots"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Slots Table - 7 columns */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="border border-zinc-900 bg-zinc-950/40">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-teal-400" />
                  Upcoming Slots
                </CardTitle>
                <CardDescription className="text-xs">
                  Browse parallel panel slots and scheduled candidate bookings.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {/* Filters */}
                <div className="p-4 border-b border-zinc-900 bg-zinc-950/60 flex flex-col sm:flex-row gap-3 items-end">
                  <div className="space-y-1.5 flex-1 w-full">
                    <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-extrabold flex items-center gap-1"><Filter className="h-3 w-3" /> Dept</label>
                    <Select value={filterDept} onChange={(e) => setFilterDept(e.target.value)}>
                      {Object.entries(DEPT_NAMES).map(([slug, name]) => (
                        <option key={`filter-${slug}`} value={slug}>{name}</option>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-1.5 flex-1 w-full">
                    <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-extrabold">Date</label>
                    <Input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
                  </div>
                  <div className="space-y-1.5 flex-1 w-full">
                    <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-extrabold">Status</label>
                    <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                      <option value="all">All</option>
                      <option value="available">Available</option>
                      <option value="booked">Booked</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </Select>
                  </div>
                  <Button variant="ghost" onClick={() => { setFilterDept("all"); setFilterDate(""); setFilterStatus("all"); }} className="h-10 text-xs font-bold text-zinc-400 hover:text-white">Clear</Button>
                </div>

                {filteredSlots.length === 0 ? (
                  <div className="text-center py-20 text-zinc-500 font-medium text-xs">
                    {slots.length === 0 ? "No scheduled interview slots found. Set up availability on the left." : "No slots match the current filters."}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-xs">
                      <thead>
                        <tr className="border-y border-zinc-900 bg-zinc-950/60 text-zinc-400 font-bold">
                          <th className="p-4 w-[140px]">Date & Time</th>
                          <th className="p-4">Department & Panel</th>
                          <th className="p-4">Format & Info</th>
                          <th className="p-4">Interviewer / Booking</th>
                          <th className="p-4 w-[60px] text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedSlots.map((slot) => {
                          const dateObj = new Date(slot.startTime);
                          const startStr = dateObj.toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          });

                          return (
                            <tr key={slot._id} className="border-b border-zinc-900 hover:bg-zinc-950/30 transition-all">
                              <td className="p-4 text-zinc-450 font-mono font-bold whitespace-nowrap">
                                {startStr}
                              </td>
                              <td className="p-4 font-bold text-zinc-200 space-y-1">
                                <div>{DEPT_NAMES[slot.deptSlug] || slot.deptSlug}</div>
                                <Badge className={`border text-[9px] px-1.5 py-0.5 font-bold ${getPanelColorClass(slot.panelName)}`}>
                                  {slot.panelName || "Panel 1"}
                                </Badge>
                              </td>
                              <td className="p-4 space-y-1 max-w-[200px]">
                                <div className="flex items-center gap-1.5 text-zinc-300 font-bold">
                                  {slot.locationType === "online" ? (
                                    <>
                                      <Video className="h-3.5 w-3.5 text-sky-400" />
                                      <span className="text-[10px]">Online</span>
                                    </>
                                  ) : (
                                    <>
                                      <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                                      <span className="text-[10px]">Offline</span>
                                    </>
                                  )}
                                </div>
                                <span className="text-[10px] text-zinc-550 block max-w-xs truncate font-mono">
                                  {slot.locationDetails}
                                </span>
                              </td>
                              <td className="p-4 space-y-1.5">
                                <span className="text-[10px] text-zinc-500 block font-medium">
                                  Interviewer: {slot.adminEmail}
                                </span>
                                <div>
                                  {slot.status === "booked" ? (
                                    <div className="space-y-0.5">
                                      <Badge className="bg-teal-500/10 text-teal-400 border border-teal-500/20 font-bold text-[9px] px-1.5 py-0.5 rounded-lg flex items-center gap-1 w-fit">
                                        <CheckCircle2 className="h-2.5 w-2.5" /> Booked
                                      </Badge>
                                      <span className="text-[10px] text-zinc-350 font-bold block max-w-[150px] truncate">
                                        {slot.bookedBy?.userEmail}
                                      </span>
                                    </div>
                                  ) : (
                                    <Badge className="bg-zinc-900 border border-zinc-800 text-zinc-400 font-bold text-[9px] px-1.5 py-0.5 rounded-lg">
                                      Available
                                    </Badge>
                                  )}
                                </div>
                              </td>
                              <td className="p-4 text-center">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleDeleteSlot(slot._id)}
                                  className="h-8 w-8 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                                  title="Delete Slot"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
                
                {filteredSlots.length > 0 && (
                  <div className="p-4 border-t border-zinc-900 bg-zinc-950/60 flex items-center justify-between">
                    <span className="text-xs text-zinc-500 font-medium">
                      Showing {Math.min((currentPage - 1) * PAGE_SIZE + 1, filteredSlots.length)} to {Math.min(currentPage * PAGE_SIZE, filteredSlots.length)} of {filteredSlots.length} slots
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="h-8 border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-50 cursor-pointer"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-xs font-bold text-zinc-300 px-3">
                        {currentPage} / {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="h-8 border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-50 cursor-pointer"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

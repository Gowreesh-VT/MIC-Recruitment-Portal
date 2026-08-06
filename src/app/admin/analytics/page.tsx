"use client";

import React, { useEffect, useState } from "react";
import {
  Loader2,
  RefreshCw,
  TrendingUp,
  BarChart3,
  CheckCircle2,
  Percent,
  FileCheck,
  Users,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Stats {
  total: number;
  inProgress: number;
  selected: number;
  rejected: number;
  conversionRate: string;
  byDepartment: {
    byFirst: Array<{ _id: string; count: number }>;
    bySecond: Array<{ _id: string; count: number }>;
  };
  dailyApplications: Array<{ _id: string; applications: number }>;
  recentActivity: Array<{
    userEmail: string;
    overallStatus: string;
    firstPreference: string;
    secondPreference: string;
    updatedAt: string;
  }>;
  byStage: Array<{ _id: number; count: number }>;
  departmentsList: Array<{
    _id: string;
    slug: string;
    name: string;
    isActive: boolean;
  }>;
  acceptedByDept: Array<{ _id: string; count: number }>;
  stage1ByDept?: {
    byFirst: Array<{ _id: string; total: number; stage1Completed: number }>;
    bySecond: Array<{ _id: string; total: number; stage1Completed: number }>;
  };
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

const DEPT_SHORT_NAMES: Record<string, string> = {
  development: "Dev",
  "competitive-coding": "CC",
  "ui-ux": "UI/UX",
  "ai-ml": "AI/ML",
  "cyber-security": "CyberSec",
  design: "Design",
  management: "Mgmt",
  entrepreneurship: "EP",
  "content-media": "Media",
};

export default function AdvancedAnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let active = true;
    const init = async () => {
      if (active) {
        await loadData();
      }
    };
    init();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 text-teal-400 animate-spin" />
          <p className="text-sm text-zinc-400 font-medium">Loading advanced analytics...</p>
        </div>
      </div>
    );
  }

  // Prep data for department comparisons
  const depts = Object.keys(DEPT_NAMES);
  const comparativeData = depts.map((d) => {
    const firstCount = stats?.byDepartment?.byFirst?.find((item) => item._id === d)?.count ?? 0;
    const secondCount = stats?.byDepartment?.bySecond?.find((item) => item._id === d)?.count ?? 0;
    return {
      name: DEPT_SHORT_NAMES[d] || d,
      "First Preference": firstCount,
      "Second Preference": secondCount,
    };
  });

  // Calculate Stage 1 Form Completion Analytics per Department
  const stage1DeptData = depts.map((d) => {
    const firstItem = stats?.stage1ByDept?.byFirst?.find((item) => item._id === d);
    const secondItem = stats?.stage1ByDept?.bySecond?.find((item) => item._id === d);

    const firstTotal = firstItem?.total ?? 0;
    const firstCompleted = firstItem?.stage1Completed ?? 0;
    const secondTotal = secondItem?.total ?? 0;
    const secondCompleted = secondItem?.stage1Completed ?? 0;

    const totalRegistrations = firstTotal + secondTotal;
    const totalStage1Completed = firstCompleted + secondCompleted;
    const completionRate = totalRegistrations > 0 ? Math.round((totalStage1Completed / totalRegistrations) * 100) : 0;

    return {
      slug: d,
      name: DEPT_NAMES[d] || d,
      shortName: DEPT_SHORT_NAMES[d] || d,
      "Total Registrations": totalRegistrations,
      "Stage 1 Completed": totalStage1Completed,
      firstTotal,
      firstCompleted,
      secondTotal,
      secondCompleted,
      completionRate,
    };
  });

  const grandTotalRegistrations = stage1DeptData.reduce((acc, curr) => acc + curr["Total Registrations"], 0);
  const grandTotalStage1Completed = stage1DeptData.reduce((acc, curr) => acc + curr["Stage 1 Completed"], 0);
  const overallStage1Pct = grandTotalRegistrations > 0 ? Math.round((grandTotalStage1Completed / grandTotalRegistrations) * 100) : 0;

  // Calculate Tech vs Non-Tech Application Split
  const techDepts = ["development", "competitive-coding", "ui-ux", "ai-ml", "cyber-security"];
  const nonTechDepts = ["design", "management", "entrepreneurship", "content-media"];

  const techCount = (stats?.byDepartment?.byFirst ?? [])
    .filter((d) => techDepts.includes(d._id))
    .reduce((acc, curr) => acc + curr.count, 0);

  const nonTechCount = (stats?.byDepartment?.byFirst ?? [])
    .filter((d) => nonTechDepts.includes(d._id))
    .reduce((acc, curr) => acc + curr.count, 0);

  const totalSplit = techCount + nonTechCount;
  const techPct = totalSplit > 0 ? Math.round((techCount / totalSplit) * 100) : 0;
  const nonTechPct = totalSplit > 0 ? Math.round((nonTechCount / totalSplit) * 100) : 0;

  const splitData = [
    { name: "Technical Departments", value: techCount, color: "#2dd4bf" },
    { name: "Non-Technical Departments", value: nonTechCount, color: "#8b5cf6" },
  ];

  // Stage Distribution Funnel Data
  const stageData = (stats?.byStage ?? []).map((stage) => ({
    name: `Stage ${stage._id - 1}`,
    count: stage.count,
  }));

  return (
    <AdminLayout activePage="analytics">
      <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <TrendingUp className="h-7 w-7 text-teal-400" />
              Advanced Analytics
            </h1>
            <p className="text-sm text-zinc-400 mt-1">Detailed funnel performance and capacity metrics</p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setRefreshing(true);
              loadData();
            }}
            className="h-10 w-10 text-zinc-400 hover:text-white"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {/* Section: Stage 1 Form Completion Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Card className="bg-zinc-950/60 border-zinc-800/80 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <BarChart3 className="h-20 w-20 text-indigo-500" />
            </div>
            <CardContent className="p-6">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Total Department Choices</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">{grandTotalRegistrations}</span>
                <span className="text-xs text-zinc-500 font-medium">registered options</span>
              </div>
              <p className="text-xs text-zinc-500 mt-3">Sum of 1st & 2nd department preferences</p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-950/60 border-zinc-800/80 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <CheckCircle2 className="h-20 w-20 text-emerald-500" />
            </div>
            <CardContent className="p-6">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Stage 1 Forms Completed</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-emerald-400">{grandTotalStage1Completed}</span>
                <span className="text-xs text-zinc-500 font-medium">forms submitted</span>
              </div>
              <p className="text-xs text-zinc-500 mt-3">Completed quest forms across departments</p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-950/60 border-zinc-800/80 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Percent className="h-20 w-20 text-teal-500" />
            </div>
            <CardContent className="p-6">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Overall Stage 1 Completion Rate</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-teal-400">{overallStage1Pct}%</span>
                <span className="text-xs text-zinc-500 font-medium">conversion rate</span>
              </div>
              <div className="w-full bg-zinc-800 h-2 rounded-full mt-3 overflow-hidden">
                <div className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full transition-all duration-500" style={{ width: `${overallStage1Pct}%` }} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart: Department Registrations vs Stage 1 Form Completion */}
        <Card className="border-zinc-800/80 bg-zinc-950/70 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4 pb-4">
            <div>
              <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-emerald-400" />
                Department Registrations vs Stage 1 Form Completed
              </CardTitle>
              <CardDescription>
                Comparing total candidate registrations with submitted Stage 1 quest forms per department
              </CardDescription>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-md bg-indigo-500" />
                <span className="text-zinc-400 font-bold">Total Registered</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-md bg-emerald-400" />
                <span className="text-zinc-400 font-bold">Stage 1 Completed</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-84">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stage1DeptData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
                <XAxis dataKey="shortName" stroke="#52525b" fontSize={11} tickLine={false} />
                <YAxis stroke="#52525b" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-zinc-950 border border-zinc-800 p-3.5 rounded-xl shadow-2xl space-y-2 text-xs">
                          <p className="font-extrabold text-white text-sm border-b border-zinc-800 pb-1.5">{data.name}</p>
                          <div className="space-y-1">
                            <div className="flex justify-between items-center gap-6">
                              <span className="text-zinc-400">Total Registered:</span>
                              <span className="font-bold text-indigo-400">{data["Total Registrations"]}</span>
                            </div>
                            <div className="text-[10px] text-zinc-500 pl-2">
                              1st Pref: {data.firstTotal} | 2nd Pref: {data.secondTotal}
                            </div>
                            <div className="flex justify-between items-center gap-6 pt-1">
                              <span className="text-zinc-400">Stage 1 Completed:</span>
                              <span className="font-bold text-emerald-400">{data["Stage 1 Completed"]}</span>
                            </div>
                            <div className="text-[10px] text-zinc-500 pl-2">
                              1st Pref: {data.firstCompleted} | 2nd Pref: {data.secondCompleted}
                            </div>
                            <div className="flex justify-between items-center gap-6 pt-1.5 border-t border-zinc-800/80">
                              <span className="text-zinc-400 font-semibold">Completion Rate:</span>
                              <span className="font-extrabold text-teal-300">{data.completionRate}%</span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="Total Registrations" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Stage 1 Completed" fill="#34d399" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Detailed Breakdown Grid */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="h-5 w-5 text-teal-400" />
            Stage 1 Completion Breakdown by Department
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stage1DeptData.map((d) => (
              <Card key={d.slug} className="bg-zinc-950/50 border-zinc-900 hover:border-zinc-800 transition-colors">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white text-base">{d.name}</h3>
                    <span className="text-xs font-black text-teal-400 bg-teal-950/60 border border-teal-800/50 px-2 py-0.5 rounded-full">
                      {d.completionRate}% Done
                    </span>
                  </div>

                  <div className="space-y-2 pt-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-400">Total Registered:</span>
                      <span className="font-bold text-white">{d["Total Registrations"]}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-400">Stage 1 Completed:</span>
                      <span className="font-bold text-emerald-400">{d["Stage 1 Completed"]}</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-zinc-500 pt-1">
                      <span>1st Pref: {d.firstCompleted} / {d.firstTotal}</span>
                      <span>2nd Pref: {d.secondCompleted} / {d.secondTotal}</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${d.completionRate}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
          {/* Chart 1: First vs Second Preference Detailed Comparison */}
          <Card className="lg:col-span-3">
            <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4 pb-4">
              <div>
                <CardTitle className="text-base font-bold">Department Preference Volumes</CardTitle>
                <CardDescription>
                  Comparing First Choice vs. Second Choice application volumes per department
                </CardDescription>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-md bg-teal-500" />
                  <span className="text-zinc-400 font-bold">First Preference</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-md bg-violet-600" />
                  <span className="text-zinc-400 font-bold">Second Preference</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparativeData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
                  <XAxis dataKey="name" stroke="#52525b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#52525b" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a" }}
                    itemStyle={{ color: "#f8fafc" }}
                    cursor={{ fill: "rgba(39, 39, 42, 0.3)" }}
                  />
                  <Bar dataKey="First Preference" fill="#2dd4bf" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Second Preference" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Chart 2: Tech vs Non-Tech Application Split */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-base font-bold">Domain Preferences</CardTitle>
              <CardDescription>First preference domain focus ratio</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col justify-between h-72 pb-2">
              <div className="h-44 w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={splitData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {splitData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a" }}
                      itemStyle={{ color: "#f8fafc" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute text-center">
                  <p className="text-2xl font-black text-white">{totalSplit}</p>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                    Classified
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-teal-400" />
                    <span className="text-zinc-400">Technical ({techCount})</span>
                  </div>
                  <span className="text-white font-extrabold">{techPct}%</span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-violet-500" />
                    <span className="text-zinc-400">Non-Technical ({nonTechCount})</span>
                  </div>
                  <span className="text-white font-extrabold">{nonTechPct}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chart 3: Funnel stage distribution */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base font-bold">Stage Funnel Distribution</CardTitle>
              <CardDescription>Candidates currently active in each evaluation stage</CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              {stageData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-zinc-500 font-semibold border border-dashed border-zinc-900 rounded-xl">
                  No candidates currently active in evaluation stages
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
                    <XAxis dataKey="name" stroke="#52525b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#52525b" fontSize={11} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a" }}
                      itemStyle={{ color: "#2dd4bf" }}
                      cursor={{ fill: "rgba(39, 39, 42, 0.3)" }}
                    />
                    <Bar dataKey="count" name="Active Candidates" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}


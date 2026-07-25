"use client";

import React, { useEffect, useState } from "react";
import {
  Loader2,
  RefreshCw,
  TrendingUp,
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

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart 1: First vs Second Preference Detailed Comparison */}
          <Card className="lg:col-span-3">
            <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4 pb-4">
              <div>
                <CardTitle className="text-base font-bold">Department Interest Analytics</CardTitle>
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


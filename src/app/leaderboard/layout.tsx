import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recruitment Leaderboard | MIC Recruitments 2026",
  description:
    "Check top applicant rankings, submissions, and evaluation scores on the official Microsoft Innovations Club (MIC) Recruitment Leaderboard.",
  alternates: {
    canonical: "/leaderboard",
  },
  openGraph: {
    title: "Recruitment Leaderboard | MIC Recruitments 2026",
    description:
      "Track live applicant standings and progress for Microsoft Innovations Club recruitments at VIT Chennai.",
    url: "https://recruitments.microsoftinnovations.club/leaderboard",
  },
};

export default function LeaderboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

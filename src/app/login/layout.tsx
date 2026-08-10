import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Student Login | MIC Recruitments 2026",
  description:
    "Sign in to your Microsoft Innovations Club (MIC) recruitment account to track application progress, complete stage tasks, and check domain evaluation.",
  alternates: {
    canonical: "/login",
  },
  openGraph: {
    title: "Student Login | MIC Recruitments 2026",
    description:
      "Access your applicant portal account for MIC Recruitments at VIT Chennai.",
    url: "https://recruitments.microsoftinnovations.club/login",
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

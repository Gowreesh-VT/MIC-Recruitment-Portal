import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | MIC Recruitments 2026",
  description:
    "Terms of Service for the Microsoft Innovations Club (MIC) Recruitment Portal at VIT Chennai. Guidelines for applicant conduct and portal usage.",
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: "Terms of Service | MIC Recruitments 2026",
    description:
      "Read the official terms and conditions for participating in MIC Recruitments 2026 at VIT Chennai.",
    url: "https://recruitments.microsoftinnovations.club/terms",
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | MIC Recruitments 2026",
  description:
    "Privacy Policy for the Microsoft Innovations Club (MIC) Recruitment Portal at VIT Chennai. Read how we protect applicant data and ensure security.",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "Privacy Policy | MIC Recruitments 2026",
    description:
      "Learn how applicant privacy and data protection are handled during MIC recruitments at VIT Chennai.",
    url: "https://recruitments.microsoftinnovations.club/privacy",
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

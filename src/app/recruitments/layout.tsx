import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore Departments & Apply | MIC Recruitments 2026",
  description:
    "Explore recruitment domains for Microsoft Innovations Club (MIC) at VIT Chennai. Choose from Technical (Development, AI/ML, CP, Cyber Security, IoT), Creative (Design, Content & Media), and Management domains.",
  alternates: {
    canonical: "/recruitments",
  },
  openGraph: {
    title: "Explore Departments & Apply | MIC Recruitments 2026",
    description:
      "Join Technical, Creative, and Management teams at Microsoft Innovations Club - VIT Chennai. View open domain descriptions and requirements.",
    url: "https://recruitments.microsoftinnovations.club/recruitments",
  },
};

export default function RecruitmentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

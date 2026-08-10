import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Application Form | MIC Recruitments 2026",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function ApplyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

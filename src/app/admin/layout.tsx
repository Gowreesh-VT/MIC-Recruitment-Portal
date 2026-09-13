import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Panel | MIC Recruitments 2026",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

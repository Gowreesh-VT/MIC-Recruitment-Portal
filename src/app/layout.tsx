import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import LandscapePrompt from "@/components/LandscapePrompt";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const APP_NAME = "MIC Recruitments 2026";
const APP_DEFAULT_TITLE = "MIC Recruitments 2026 | Microsoft Innovations Club - VIT Chennai";
const APP_TITLE_TEMPLATE = "%s | MIC Recruitments";
const APP_DESCRIPTION = "Official recruitment portal for Microsoft Innovations Club (MIC) at VIT Chennai. Apply to Technical, Non-Technical, and Creative domains.";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  keywords: [
    "Microsoft Innovations Club",
    "MIC VITC",
    "VIT Chennai",
    "MIC Recruitments",
    "VIT Club Recruitment",
    "Student Club VIT Chennai",
    "MIC Recruitment Portal",
  ],
  authors: [{ name: "Microsoft Innovations Club - VIT Chennai", url: "https://microsoftinnovations.club" }],
  creator: "Microsoft Innovations Club Technical Team",
  publisher: "Microsoft Innovations Club - VIT Chennai",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://recruitments.microsoftinnovations.club"),
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 selection:bg-teal-500 selection:text-slate-950">
        <Providers>
          {children}
          <LandscapePrompt />
        </Providers>
      </body>
    </html>
  );
}


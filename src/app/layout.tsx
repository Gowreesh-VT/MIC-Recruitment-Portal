import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  themeColor: "#0d9488",
  width: "device-width",
  initialScale: 1,
};

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
    "Technical Club VIT Chennai",
    "Software Development Club",
  ],
  authors: [{ name: "Microsoft Innovations Club - VIT Chennai", url: "https://microsoftinnovations.club" }],
  creator: "Microsoft Innovations Club Technical Team",
  publisher: "Microsoft Innovations Club - VIT Chennai",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://recruitments.microsoftinnovations.club"),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
    url: "https://recruitments.microsoftinnovations.club",
    locale: "en_US",
    images: [
      {
        url: "/mic_logo_pixel.png",
        width: 512,
        height: 512,
        alt: "Microsoft Innovations Club Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
    images: ["/mic_logo_pixel.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "EducationalOrganization",
      "@id": "https://recruitments.microsoftinnovations.club/#organization",
      "name": "Microsoft Innovations Club - VIT Chennai",
      "alternateName": "MIC VITC",
      "url": "https://microsoftinnovations.club",
      "logo": "https://recruitments.microsoftinnovations.club/mic_logo_pixel.png",
      "sameAs": [
        "https://www.instagram.com/mic_vitc/",
        "https://www.linkedin.com/company/mic-vitc/",
        "https://github.com/MIC-VITC"
      ],
      "parentOrganization": {
        "@type": "CollegeOrUniversity",
        "name": "Vellore Institute of Technology, Chennai",
        "url": "https://chennai.vit.ac.in"
      }
    },
    {
      "@type": "WebSite",
      "@id": "https://recruitments.microsoftinnovations.club/#website",
      "url": "https://recruitments.microsoftinnovations.club",
      "name": "MIC Recruitments 2026",
      "description": "Official recruitment portal for Microsoft Innovations Club (MIC) at VIT Chennai.",
      "publisher": {
        "@id": "https://recruitments.microsoftinnovations.club/#organization"
      },
      "inLanguage": "en-US"
    }
  ]
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 selection:bg-teal-500 selection:text-slate-950">
        <Providers>
          {children}
          <LandscapePrompt />
        </Providers>
      </body>
    </html>
  );
}



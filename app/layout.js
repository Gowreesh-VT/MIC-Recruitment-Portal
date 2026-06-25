// Font
import { Inter } from "next/font/google";
// Providers
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "next-auth/react";
import { PostHogProvider } from "@/components/posthog-provider";
// Styling
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "MIC Recruitment Portal",
    description: "A recruitment portal for Microsoft Innovations Club",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
                    <SessionProvider>
                        <PostHogProvider>
                            {children}
                            <Toaster />
                        </PostHogProvider>
                    </SessionProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}

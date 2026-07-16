"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ShieldX, ArrowLeft } from "lucide-react";
import Link from "next/link";

function ErrorContent() {
  const params = useSearchParams();
  const error = params.get("error");

  const messages: Record<string, { title: string; body: string }> = {
    AccessDenied: {
      title: "Access Denied",
      body: "Only @vitstudent.ac.in email addresses are allowed to apply. Please sign in with your VIT student email.",
    },
    Configuration: {
      title: "Configuration Error",
      body: "There is a server configuration issue. Please contact the MIC team.",
    },
    Verification: {
      title: "Verification Failed",
      body: "The sign-in link is invalid or has expired.",
    },
  };

  const content = messages[error ?? ""] ?? {
    title: "Sign-in Error",
    body: "Something went wrong during sign-in. Please try again.",
  };

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
            <ShieldX className="h-10 w-10 text-rose-400" />
          </div>
        </div>
        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-white">{content.title}</h1>
          <p className="text-slate-400 leading-relaxed">{content.body}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/recruitments"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-sm font-medium hover:bg-slate-700 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Departments
          </Link>
          <Link
            href="/api/auth/signin"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500 text-slate-950 text-sm font-bold hover:bg-teal-400 transition-all"
          >
            Try Again
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={null}>
      <ErrorContent />
    </Suspense>
  );
}

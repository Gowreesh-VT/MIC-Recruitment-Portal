"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled runtime error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-mono select-none">
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293715_1px,transparent_1px),linear-gradient(to_bottom,#1f293715_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-lg w-full bg-zinc-900/80 backdrop-blur-xl border border-red-500/30 rounded-2xl p-8 text-center shadow-2xl shadow-red-500/10">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-6">
          <span className="text-2xl animate-pulse">⚠️</span>
        </div>

        <span className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/30 rounded-md text-xs font-bold uppercase tracking-wider">
          System Exception
        </span>

        <h1 className="text-2xl font-black tracking-tight text-white mt-4 mb-2 uppercase">
          An Unexpected Error Occurred
        </h1>

        <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
          The recruitment portal encountered an unexpected runtime fault. Our team has been notified.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-6 py-3 bg-red-500 hover:bg-red-400 text-black font-bold rounded-xl transition-all shadow-lg shadow-red-500/20 text-xs uppercase tracking-wider cursor-pointer"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl border border-zinc-700 transition-all text-xs uppercase tracking-wider text-center"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}

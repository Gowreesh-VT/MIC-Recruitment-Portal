"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global app error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#070709] text-white flex flex-col items-center justify-center p-6 font-mono select-none">
        <div className="max-w-lg w-full bg-zinc-900/90 border border-red-500/40 rounded-2xl p-8 text-center shadow-2xl">
          <span className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/30 rounded-md text-xs font-bold uppercase tracking-wider">
            Critical System Error
          </span>
          <h1 className="text-2xl font-black text-white mt-4 mb-2 uppercase">
            Application Failure
          </h1>
          <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
            A critical error occurred while initializing the portal session.
          </p>
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-red-500 hover:bg-red-400 text-black font-bold rounded-xl transition-all text-xs uppercase tracking-wider cursor-pointer"
          >
            Reload Session
          </button>
        </div>
      </body>
    </html>
  );
}

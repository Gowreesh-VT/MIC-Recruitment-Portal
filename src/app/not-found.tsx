import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-mono select-none">
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293715_1px,transparent_1px),linear-gradient(to_bottom,#1f293715_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-lg w-full bg-zinc-900/80 backdrop-blur-xl border border-teal-500/30 rounded-2xl p-8 text-center shadow-2xl shadow-teal-500/10">
        <div className="text-6xl font-black text-teal-400 tracking-widest mb-2 drop-shadow-[0_0_15px_rgba(20,184,166,0.5)]">
          404
        </div>

        <span className="px-3 py-1 bg-teal-500/10 text-teal-300 border border-teal-500/30 rounded-md text-xs font-bold uppercase tracking-wider">
          Route Not Found
        </span>

        <h1 className="text-xl font-bold tracking-tight text-white mt-4 mb-2 uppercase">
          Lost In Cyber Space
        </h1>

        <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
          The recruitment page or resource you are looking for does not exist or has been relocated.
        </p>

        <div className="flex justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-teal-500 hover:bg-teal-400 text-black font-bold rounded-xl transition-all shadow-lg shadow-teal-500/20 text-xs uppercase tracking-wider"
          >
            Back To Base
          </Link>
        </div>
      </div>
    </div>
  );
}

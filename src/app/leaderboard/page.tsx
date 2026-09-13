"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Press_Start_2P } from "next/font/google";
import MicLogo from "@/components/MicLogo";
import { playRetroSound } from "@/lib/audio";
import { getOrCreateAnonymousName } from "@/lib/anonymousNames";

const pressStart = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start-2p",
});

export interface LeaderboardEntry {
  id: string;
  rank: number;
  anonymousName: string;
  score: number;
  createdAt: string;
}

export default function LeaderboardPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playerAnonName, setPlayerAnonName] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchLeaderboard = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/leaderboard?page=${page}&limit=25`);
      const data = await res.json();
      if (data.success) {
        setEntries(data.leaderboard || []);
        if (data.pagination) {
          setCurrentPage(data.pagination.currentPage);
          setTotalPages(data.pagination.totalPages);
          setTotalCount(data.pagination.totalCount);
        }
      } else {
        setError(data.error || "Failed to load scores.");
      }
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
      setError("Network error loading leaderboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPlayerAnonName(getOrCreateAnonymousName());
    }
    fetchLeaderboard(1);
  }, []);

  const handleClose = () => {
    playRetroSound("close");
    let fallback = "/recruitments";
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const from = params.get("from");
      if (from && from.startsWith("/") && !from.startsWith("//") && !from.startsWith("/\\")) {
        fallback = from;
      }
    }
    router.push(fallback);
  };

  const goToPage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      playRetroSound("select");
      fetchLeaderboard(newPage);
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 bg-yellow-400 text-black border-2 border-black font-extrabold text-[11px] sm:text-[12px] shadow-[2px_2px_0px_#000]">
          🥇
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 bg-slate-300 text-black border-2 border-black font-extrabold text-[11px] sm:text-[12px] shadow-[2px_2px_0px_#000]">
          🥈
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 bg-amber-700 text-white border-2 border-black font-extrabold text-[11px] sm:text-[12px] shadow-[2px_2px_0px_#000]">
          🥉
        </span>
      );
    }
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 bg-black/10 text-black border-2 border-black font-bold text-[9px] sm:text-[10px]">
        #{rank}
      </span>
    );
  };

  return (
    <main
      className={`${pressStart.variable} font-press-start relative min-h-[100dvh] w-full flex flex-col items-center justify-center p-2 sm:p-4 select-none overflow-hidden bg-[linear-gradient(180deg,#1188EE_0%,#0E8AEA_25%,#1093EB_35%,#1197EC_46%,#16B6F4_52%,#10CBF1_56%,#0FC6F1_60%,#15DEF0_65%,#15DEF0_81%)]`}
    >
      {/* ================= BACKGROUND SKY & CLOUDS ================= */}
      <img
        src="/pixel_cloud_small.svg"
        alt="Cloud"
        className="absolute top-[12%] left-[6%] w-[180px] md:w-[260px] opacity-90 animate-retro-float pixelated pointer-events-none z-0"
      />
      <img
        src="/pixel_cloud_small.svg"
        alt="Cloud"
        className="absolute top-[18%] right-[8%] w-[200px] md:w-[280px] opacity-85 animate-retro-float pixelated pointer-events-none z-0"
        style={{ animationDelay: "1s" }}
      />
      <img
        src="/pixel_cloud_small.svg"
        alt="Cloud"
        className="absolute top-[42%] right-[12%] w-[160px] md:w-[240px] opacity-80 animate-retro-float pixelated pointer-events-none z-0"
        style={{ animationDelay: "2s" }}
      />

      {/* ================= HOVERING FLAPPY BIRD ================= */}
      <div className="absolute top-[46%] left-[4%] md:left-[10%] z-10 animate-retro-float pointer-events-none hidden xs:block">
        <img
          src="/flappy_bird.svg"
          alt="Flappy Bird"
          className="w-[48px] h-[48px] md:w-[72px] md:h-[72px] pixelated drop-shadow-[3px_3px_0px_rgba(0,0,0,0.3)]"
        />
      </div>

      {/* ================= CITY BUILDINGS & BUSHES ALONG HORIZON ================= */}
      <div className="absolute bottom-[60px] md:bottom-[76px] left-0 w-full h-[280px] md:h-[360px] overflow-hidden pointer-events-none z-0 flex items-end">
        <div className="absolute bottom-0 left-0 flex w-[3000px] opacity-100">
          <img
            src="/pixel_cloud_large.svg"
            alt="Skyline Back Left"
            className="w-[1437px] h-[280px] md:h-[360px] object-cover object-top pixelated shrink-0"
          />
          <img
            src="/pixel_cloud_large.svg"
            alt="Skyline Back Right"
            className="w-[1510px] h-[280px] md:h-[360px] object-cover object-top pixelated shrink-0"
          />
        </div>
        <div className="absolute bottom-0 left-0 flex w-[3000px] opacity-80 z-1">
          {Array.from({ length: 14 }).map((_, idx) => (
            <img
              key={`city-${idx}`}
              src="/city_skyline.svg"
              alt="City Block"
              className="w-[246px] h-[210px] md:h-[249px] object-cover pixelated shrink-0"
            />
          ))}
        </div>
        <div className="absolute bottom-0 left-0 flex w-[3000px] z-1">
          <img
            src="/bushes_pixel.svg"
            alt="Bushes"
            className="w-[1456px] h-[120px] md:h-[160px] object-cover pixelated shrink-0 opacity-95"
          />
          <img
            src="/bushes_pixel.svg"
            alt="Bushes Right"
            className="w-[1456px] h-[120px] md:h-[160px] object-cover pixelated shrink-0 opacity-95"
          />
        </div>
      </div>

      {/* ================= SCROLLING SOIL GROUND PLATFORM ================= */}
      <div className="absolute bottom-0 left-0 w-full h-[60px] md:h-[76px] z-10 flex flex-col select-none pointer-events-none">
        <div className="w-full h-4 md:h-5 bg-[#52AE26] border-t-4 border-b-4 border-black flex flex-col justify-between shrink-0">
          <div className="w-full h-[3px] bg-[#72F418]" />
          <div className="w-full h-[3px] bg-[#3FA70E]" />
        </div>
        <div className="w-full flex-grow bg-[#DD9955] border-b-4 border-black relative overflow-hidden flex items-center">
          <div className="flex whitespace-nowrap animate-marquee">
            <span className="inline-flex items-center shrink-0 text-[24px] text-[#CC7700] tracking-wider uppercase font-bold">
              {Array(6).fill("MICROSOFT INNOVATIONS CLUB TENURE 2026-2027").map((text, idx) => (
                <React.Fragment key={idx}>
                  <span>{text}</span>
                  <img src="/mic_logo_pixel.png" alt="MIC" className="w-8 h-8 md:w-10 md:h-10 mx-8 shrink-0" />
                </React.Fragment>
              ))}
            </span>
          </div>
        </div>
      </div>

      {/* ================= TOP LEFT LOGO ================= */}
      <MicLogo />

      {/* ================= TOP RIGHT CLOSE BUTTON ================= */}
      <button
        onClick={handleClose}
        className="fixed top-4 right-4 sm:top-6 sm:right-6 md:right-10 z-50 cursor-pointer hover:scale-110 active:scale-95 transition-transform duration-100 flex items-center justify-center select-none"
        title="Close"
      >
        <img
          src="/Close_icon.svg"
          alt="Close"
          className="w-[36px] h-[34px] sm:w-[46px] sm:h-[44px] pixelated pointer-events-none"
        />
      </button>

      {/* ================= HANGING WOODEN SIGNBOARD ================= */}
      <div className="relative flex flex-col items-center w-full max-w-[720px] px-1 sm:px-4 z-20 my-auto pb-14 pt-10 sm:pt-0">
        {/* Wooden Signboard */}
        <div
          className="w-full bg-[#C4872B] border-4 border-black p-3 sm:p-6 relative rounded-sm flex flex-col z-10"
          style={{ boxShadow: "6px 6px 0px 0px rgba(0,0,0,0.65)" }}
        >
          {/* Ropes Anchored Directly to Wooden Signboard Top */}
          <div
            className="absolute -top-[1000px] left-[12%] sm:left-[20%] w-[14px] sm:w-[18px] h-[1010px] pointer-events-none flex flex-col border-x-4 border-black bg-[#B87B21] z-0"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, #CC9339, #CC9339 8px, #B87B21 8px, #B87B21 16px)",
            }}
          />
          <div
            className="absolute -top-[1000px] right-[12%] sm:right-[20%] w-[14px] sm:w-[18px] h-[1010px] pointer-events-none flex flex-col border-x-4 border-black bg-[#B87B21] z-0"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, #CC9339, #CC9339 8px, #B87B21 8px, #B87B21 16px)",
            }}
          />
          {/* Bevel Highlights */}
          <div className="absolute inset-1 border-t-4 border-l-4 border-[#E5A039] border-b-4 border-r-4 border-[#9E6517] pointer-events-none" />

          {/* Corner Nails */}
          <div className="absolute top-2.5 left-2.5 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-[#D4D4D4] border-2 border-black flex items-center justify-center pointer-events-none z-10">
            <div className="w-1.5 h-0.5 bg-[#666] rotate-45" />
          </div>
          <div className="absolute top-2.5 right-2.5 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-[#D4D4D4] border-2 border-black flex items-center justify-center pointer-events-none z-10">
            <div className="w-1.5 h-0.5 bg-[#666] rotate-45" />
          </div>
          <div className="absolute bottom-2.5 left-2.5 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-[#D4D4D4] border-2 border-black flex items-center justify-center pointer-events-none z-10">
            <div className="w-1.5 h-0.5 bg-[#666] rotate-45" />
          </div>
          <div className="absolute bottom-2.5 right-2.5 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-[#D4D4D4] border-2 border-black flex items-center justify-center pointer-events-none z-10">
            <div className="w-1.5 h-0.5 bg-[#666] rotate-45" />
          </div>

          {/* Title Header */}
          <h1 className="text-center font-press-start text-[#FFB59F] text-[13px] sm:text-[18px] md:text-[22px] tracking-wider uppercase drop-shadow-[2px_2px_0px_rgba(0,0,0,0.5)] mt-1 mb-3 z-10 flex items-center justify-center gap-1.5">
            <span>🏆</span> FLAPPY HALL OF FAME
          </h1>

          {/* Player Identity Banner */}
          {playerAnonName && (
            <div className="w-full bg-[#FFE4D6] border-2 border-black p-2 sm:p-2.5 mb-2.5 flex items-center justify-between text-left z-10 shadow-[2px_2px_0px_#000]">
              <div className="flex items-center gap-1.5 min-w-0 pr-2">
                <span className="text-xs sm:text-sm shrink-0">👤</span>
                <span className="text-[9px] sm:text-[10px] font-bold text-black truncate">
                  Alias: <strong className="text-[#A93710]">{playerAnonName}</strong>
                </span>
              </div>
              <button
                onClick={() => fetchLeaderboard(currentPage)}
                disabled={loading}
                className="bg-[#E29A2B] hover:bg-[#F0AD3D] border-2 border-black px-2 py-1 text-[8.5px] sm:text-[9.5px] font-bold text-black uppercase tracking-wider shadow-[2px_2px_0px_#000] cursor-pointer shrink-0"
              >
                🔄 REFRESH
              </button>
            </div>
          )}

          {/* Table Container */}
          <div className="w-full max-h-[44vh] sm:max-h-[48vh] overflow-y-auto border-4 border-black bg-[#FFE4D6] p-1 sm:p-2 z-10 shadow-inner custom-scrollbar">
            {loading ? (
              <div className="p-8 text-[11px] sm:text-[12px] font-bold text-black uppercase tracking-wider flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Loading Scores...
              </div>
            ) : error ? (
              <div className="p-6 text-[10px] sm:text-[11px] font-bold text-red-600 uppercase tracking-wider text-center">
                {error}
              </div>
            ) : entries.length === 0 ? (
              <div className="p-8 flex flex-col items-center gap-2 text-center">
                <span className="text-3xl">🕊️</span>
                <span className="text-[11px] font-bold text-black uppercase tracking-wider">No Hall of Fame entries yet!</span>
                <span className="text-[9.5px] text-black/60 font-semibold">Be the first player to flap past 20 pipes!</span>
              </div>
            ) : (
              <table className="w-full border-collapse table-fixed">
                <thead>
                  <tr className="bg-[#221C18] text-white text-[8.5px] sm:text-[10px] uppercase tracking-wider font-bold sticky top-0 z-10">
                    <th className="p-1.5 sm:p-2.5 text-center w-12 sm:w-16 border-b-2 border-black">Rank</th>
                    <th className="p-1.5 sm:p-2.5 text-left border-b-2 border-black">Anonymous Alias</th>
                    <th className="p-1.5 sm:p-2.5 text-right w-16 sm:w-24 border-b-2 border-black">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-300 text-[9px] sm:text-[11px] font-bold">
                  {entries.map((entry) => {
                    const isCurrentPlayer = playerAnonName && entry.anonymousName === playerAnonName;
                    return (
                      <tr
                        key={entry.id}
                        className={`transition-colors ${
                          isCurrentPlayer
                            ? "bg-amber-200/90 font-extrabold text-[#A93710]"
                            : "hover:bg-white/80 text-black"
                        }`}
                      >
                        <td className="p-1.5 sm:p-2 text-center align-middle">{getRankBadge(entry.rank)}</td>
                        <td className="p-1.5 sm:p-2 text-left align-middle min-w-0">
                          <div className="flex items-center gap-1 min-w-0 truncate">
                            <span className="truncate">{entry.anonymousName}</span>
                            {isCurrentPlayer && (
                              <span className="bg-[#A93710] text-white text-[7.5px] sm:text-[8px] px-1 py-0.5 rounded-xs font-bold uppercase tracking-wider shrink-0">
                                YOU
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-1.5 sm:p-2 text-right align-middle font-black text-[#A93710] text-[11px] sm:text-[14px]">
                          {entry.score}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Retro Pagination Bar (25 items per page) */}
          <div className="w-full mt-2.5 flex items-center justify-between z-10 bg-[#FFE4D6] border-2 border-black p-1.5 sm:p-2 shadow-[2px_2px_0px_#000]">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1 || loading}
              className="bg-[#E29A2B] hover:bg-[#F0AD3D] disabled:opacity-40 disabled:hover:bg-[#E29A2B] border-2 border-black px-2 sm:px-3 py-1 text-[8.5px] sm:text-[10px] font-extrabold text-black uppercase tracking-wider shadow-[2px_2px_0px_#000] cursor-pointer"
            >
              ◀ PREV
            </button>

            <span className="text-[8.5px] sm:text-[10px] font-extrabold text-black uppercase">
              PAGE {currentPage} OF {totalPages}
            </span>

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPages || loading}
              className="bg-[#E29A2B] hover:bg-[#F0AD3D] disabled:opacity-40 disabled:hover:bg-[#E29A2B] border-2 border-black px-2 sm:px-3 py-1 text-[8.5px] sm:text-[10px] font-extrabold text-black uppercase tracking-wider shadow-[2px_2px_0px_#000] cursor-pointer"
            >
              NEXT ▶
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

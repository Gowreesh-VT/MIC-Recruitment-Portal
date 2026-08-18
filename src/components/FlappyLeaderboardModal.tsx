"use client";

import React, { useState, useEffect, useCallback } from "react";

export interface LeaderboardEntry {
  id: string;
  rank: number;
  anonymousName: string;
  score: number;
  createdAt: string;
}

interface FlappyLeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerAnonName?: string;
  onRegenerateName?: () => void;
}

export default function FlappyLeaderboardModal({
  isOpen,
  onClose,
  playerAnonName,
  onRegenerateName,
}: FlappyLeaderboardModalProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/leaderboard?limit=20");
      const data = await res.json();
      if (data.success) {
        setEntries(data.leaderboard || []);
      } else {
        setError(data.error || "Failed to load scores.");
      }
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
      setError("Network error loading leaderboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      void fetchLeaderboard();
    }
  }, [isOpen, fetchLeaderboard]);

  if (!isOpen) return null;

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="inline-flex items-center justify-center w-7 h-7 bg-yellow-400 text-black border-2 border-black font-extrabold text-[12px] shadow-[2px_2px_0px_#000]">
          🥇
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="inline-flex items-center justify-center w-7 h-7 bg-slate-300 text-black border-2 border-black font-extrabold text-[12px] shadow-[2px_2px_0px_#000]">
          🥈
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="inline-flex items-center justify-center w-7 h-7 bg-amber-700 text-white border-2 border-black font-extrabold text-[12px] shadow-[2px_2px_0px_#000]">
          🥉
        </span>
      );
    }
    return (
      <span className="inline-flex items-center justify-center w-7 h-7 bg-black/10 text-black border-2 border-black font-bold text-[11px]">
        #{rank}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-[110] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div
        className="bg-[#FFE4D6] border-4 border-black p-5 sm:p-6 max-w-lg w-full relative flex flex-col items-center gap-4 text-center shadow-[10px_10px_0px_0px_rgba(0,0,0,0.6)]"
      >
        {/* Header Tag */}
        <div className="bg-[#A93710] text-white px-5 py-2 border-2 border-black text-[13px] uppercase tracking-widest font-bold -mt-10 mb-1 shadow-[3px_3px_0px_#000] flex items-center gap-2">
          🏆 FLAPPY HALL OF FAME
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 bg-[#A93710] hover:bg-red-700 text-white border-2 border-black w-8 h-8 font-bold text-[14px] flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-[2px_2px_0px_#000]"
          title="Close Leaderboard"
        >
          ✕
        </button>

        {/* Privacy & Criteria Banner */}
        <div className="w-full text-left bg-white/70 border-2 border-dashed border-[#A93710] p-3 text-[10px] sm:text-[11px] text-black/85 leading-relaxed font-bold uppercase flex flex-col gap-1">
          <div className="flex items-center gap-2 text-[#A93710]">
            <span>🔒</span>
            <span>PRIVACY PROTECTED (GOOGLE SHEETS STYLE)</span>
          </div>
          <p className="text-[10px] text-black/70 normal-case font-medium">
            Real names are never stored or displayed. Everyone is given an anonymous alias. Only scores strictly <strong className="text-[#A93710] font-bold">&gt; 20</strong> qualify for the Hall of Fame!
          </p>
        </div>

        {/* Player Current Persona Bar */}
        {playerAnonName && (
          <div className="w-full bg-[#E29A2B]/20 border-2 border-black p-2 flex items-center justify-between text-left px-3">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="text-[14px]">👤</span>
              <div className="truncate">
                <span className="text-[9px] uppercase tracking-wider text-black/60 font-bold block">Your Persona:</span>
                <span className="text-[11px] font-extrabold text-black truncate block">{playerAnonName}</span>
              </div>
            </div>
            {onRegenerateName && (
              <button
                onClick={onRegenerateName}
                className="bg-[#E29A2B] hover:bg-[#F0AD3D] border-2 border-black px-2.5 py-1 text-[9px] font-bold text-black uppercase tracking-wider transition-transform hover:scale-105 active:scale-95 shadow-[2px_2px_0px_#000] shrink-0"
                title="Shuffle Anonymous Persona"
              >
                🎲 Shuffle
              </button>
            )}
          </div>
        )}

        {/* Leaderboard Table Container */}
        <div className="w-full max-h-[320px] overflow-y-auto border-2 border-black bg-white shadow-inner custom-scrollbar">
          {loading ? (
            <div className="p-8 text-[12px] font-bold text-black uppercase tracking-wider flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              Loading Leaderboard...
            </div>
          ) : error ? (
            <div className="p-6 text-[11px] font-bold text-red-600 uppercase tracking-wider">
              {error}
            </div>
          ) : entries.length === 0 ? (
            <div className="p-8 flex flex-col items-center gap-2">
              <span className="text-3xl">🕊️</span>
              <span className="text-[12px] font-bold text-black uppercase tracking-wider">No Hall of Fame entries yet!</span>
              <span className="text-[10px] text-black/60 font-semibold">Be the first player to flap past 20 pipes!</span>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#221C18] text-white text-[10px] uppercase tracking-wider font-bold sticky top-0 z-10">
                  <th className="p-2.5 text-center w-12 border-b-2 border-black">Rank</th>
                  <th className="p-2.5 border-b-2 border-black">Anonymous Alias</th>
                  <th className="p-2.5 text-right w-20 border-b-2 border-black">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-[11px] font-bold">
                {entries.map((entry) => {
                  const isCurrentPlayer = playerAnonName && entry.anonymousName === playerAnonName;
                  return (
                    <tr
                      key={entry.id}
                      className={`transition-colors ${
                        isCurrentPlayer
                          ? "bg-amber-100 font-extrabold text-[#A93710]"
                          : "hover:bg-orange-50/60 text-black"
                      }`}
                    >
                      <td className="p-2 text-center align-middle">{getRankBadge(entry.rank)}</td>
                      <td className="p-2 align-middle">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="truncate">{entry.anonymousName}</span>
                          {isCurrentPlayer && (
                            <span className="bg-[#A93710] text-white text-[8px] px-1.5 py-0.5 rounded-xs font-bold uppercase tracking-wider">
                              YOU
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-2 text-right align-middle font-black text-[#A93710] text-[13px]">
                        {entry.score}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal Controls */}
        <div className="flex items-center justify-between w-full pt-1">
          <button
            onClick={fetchLeaderboard}
            disabled={loading}
            className="bg-white hover:bg-gray-100 border-2 border-black px-3 py-1.5 text-[10px] font-bold text-black uppercase tracking-wider transition-transform hover:-translate-y-0.5 active:translate-y-0 shadow-[2px_2px_0px_#000] flex items-center gap-1.5"
          >
            <span>🔄</span> Refresh
          </button>

          <button
            onClick={onClose}
            className="bg-[#E29A2B] hover:bg-[#F0AD3D] border-4 border-black py-2 px-6 text-[10px] font-bold text-black uppercase tracking-wider transition-transform hover:-translate-y-0.5 active:translate-y-0 shadow-[4px_4px_0px_0px_#000]"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}

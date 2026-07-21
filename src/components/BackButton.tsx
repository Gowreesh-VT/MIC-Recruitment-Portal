"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { playRetroSound } from "@/lib/audio";

interface BackButtonProps {
  onClick?: () => void;
}



export default function BackButton({ onClick }: BackButtonProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    playRetroSound("select");
    if (onClick) {
      onClick();
    } else {
      // Fallback if history is empty
      if (window.history.length > 2 || document.referrer.includes(window.location.host)) {
        router.back();
      } else {
        router.push("/");
      }
    }
  };

  const [scale, setScale] = React.useState(1);
  React.useEffect(() => {
    const handleResize = () => {
      if (typeof window !== "undefined") {
        const heightScale = window.innerHeight / 1024;
        const widthScale = window.innerWidth / 1200;
        const cappedScale = Math.min(heightScale, widthScale, 1.2);
        setScale(cappedScale);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <button
      onClick={handleClick}
      className="fixed top-1/2 -translate-y-1/2 left-6 md:left-8 z-[100] w-14 h-14 md:w-16 md:h-16 bg-[#D1D5DB] hover:bg-[#E5E7EB] rounded-full border-4 border-black flex items-center justify-center cursor-pointer"
      style={{ boxShadow: "4px 4px 0px 0px rgba(0,0,0,1)", transform: `scale(${scale})`, transformOrigin: "left center" }}
      title="Go Back"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1 pointer-events-none">
        <path d="M20 3L6 12L20 21V3Z" fill="black" />
      </svg>
    </button>
  );
}

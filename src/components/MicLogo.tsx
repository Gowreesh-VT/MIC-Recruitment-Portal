"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { playRetroSound } from "@/lib/audio";

export default function MicLogo() {
  const router = useRouter();



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
    <div 
      className="fixed top-6 left-4 z-50 pointer-events-none"
      style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}
    >
      <img
        src="/mic_logo_pixel.png"
        alt="MIC Logo"
        className="pixelated w-[110px] h-[79px] select-none pointer-events-auto animate-retro-float-small drop-shadow-[4px_4px_0px_rgba(0,0,0,0.6)] cursor-pointer hover:scale-105 transition-transform"
        onClick={() => {
          playRetroSound("select");
          router.push("/");
        }}
      />
    </div>
  );
}

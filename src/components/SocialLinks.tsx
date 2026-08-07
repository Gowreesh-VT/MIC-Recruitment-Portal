"use client";

import React from "react";
import { SOCIAL_LINKS } from "@/lib/constants";
import { Instagram, Linkedin, MessageCircle } from "lucide-react";

interface SocialLinksProps {
  className?: string;
  variant?: "badge" | "button" | "footer";
}

export default function SocialLinks({ className = "", variant = "badge" }: SocialLinksProps) {
  const links = [
    {
      name: "Instagram",
      url: SOCIAL_LINKS.instagram,
      icon: Instagram,
      bg: "bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700",
      border: "border-pink-900",
      textColor: "text-white",
      shadow: "3px 3px 0px 0px #000",
    },
    {
      name: "LinkedIn",
      url: SOCIAL_LINKS.linkedin,
      icon: Linkedin,
      bg: "bg-[#0A66C2] hover:bg-[#084E96]",
      border: "border-blue-950",
      textColor: "text-white",
      shadow: "3px 3px 0px 0px #000",
    },
    {
      name: "WhatsApp Community",
      shortName: "WhatsApp",
      url: SOCIAL_LINKS.whatsapp,
      icon: MessageCircle,
      bg: "bg-[#25D366] hover:bg-[#1DA851]",
      border: "border-emerald-950",
      textColor: "text-slate-950",
      shadow: "3px 3px 0px 0px #000",
    },
  ];

  if (variant === "footer") {
    return (
      <div className={`flex flex-wrap items-center justify-center gap-3 ${className}`}>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`${link.bg} ${link.textColor} flex items-center gap-2 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider border-2 border-black rounded-[4px] cursor-pointer transition-all hover:-translate-y-0.5 active:translate-y-0.5`}
              style={{ boxShadow: link.shadow }}
              title={`Join MIC on ${link.name}`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{link.shortName || link.name}</span>
            </a>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap items-center justify-center gap-2.5 ${className}`}>
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`${link.bg} ${link.textColor} inline-flex items-center gap-2 px-3 py-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider border-2 border-black rounded-[4px] cursor-pointer transition-all hover:-translate-y-0.5 active:translate-y-0.5`}
            style={{ boxShadow: link.shadow }}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" />
            <span>{link.shortName || link.name}</span>
          </a>
        );
      })}
    </div>
  );
}

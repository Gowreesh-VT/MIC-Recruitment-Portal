"use client";

import React, { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global application error:", error);
  }, [error]);

  return (
    <html lang="en">
      <head>
        <title>MIC Recruitment Portal — System Error</title>
        <link
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          fontFamily: "'Press Start 2P', monospace",
          backgroundColor: "#1093EB",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          userSelect: "none",
          backgroundImage:
            "linear-gradient(180deg,#1188EE 0%,#0E8AEA 25%,#1093EB 35%,#1197EC 46%,#16B6F4 52%,#10CBF1 56%,#0FC6F1 60%,#15DEF0 65%,#15DEF0 81%)",
        }}
      >
        <div
          style={{
            maxWidth: "580px",
            width: "90%",
            backgroundColor: "#FFE4D6",
            border: "4px solid #000",
            borderRadius: "10px",
            padding: "8px",
            boxShadow: "12px 12px 0px 0px rgba(0,0,0,0.4)",
            textAlign: "center",
            boxSizing: "border-box",
          }}
        >
          {/* Header Banner */}
          <div
            style={{
              backgroundColor: "#A93710",
              border: "4px solid #000",
              borderRadius: "6px",
              padding: "16px",
              color: "#FFF",
              fontSize: "13px",
              fontWeight: "bold",
              letterSpacing: "2px",
              textTransform: "uppercase",
              boxSizing: "border-box",
            }}
          >
            ░ CRITICAL SYSTEM ERROR ░
          </div>

          {/* Card Body */}
          <div
            style={{
              backgroundColor: "#FFDED6",
              border: "4px solid #000",
              borderRadius: "6px",
              marginTop: "8px",
              padding: "28px 20px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "20px",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                backgroundColor: "#A93710",
                color: "#FFF",
                border: "4px solid #000",
                padding: "10px 16px",
                fontSize: "11px",
                fontWeight: "bold",
                boxShadow: "4px 4px 0px 0px #000",
              }}
            >
              ⚠️ PORTAL FAULT
            </div>

            <div style={{ color: "#000", fontSize: "10px", lineHeight: "1.8", textTransform: "uppercase" }}>
              A critical exception occurred while initializing the recruitment portal.
            </div>

            <button
              onClick={() => reset()}
              style={{
                backgroundColor: "#52AE26",
                color: "#FFF",
                border: "4px solid #000",
                padding: "14px 28px",
                fontSize: "10px",
                fontFamily: "'Press Start 2P', monospace",
                fontWeight: "bold",
                letterSpacing: "2px",
                cursor: "pointer",
                boxShadow: "4px 4px 0px 0px #000",
                textTransform: "uppercase",
              }}
            >
              RELOAD SESSION
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

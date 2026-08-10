import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MIC Recruitments 2026",
    short_name: "MIC Recruitments",
    description:
      "Official recruitment portal for Microsoft Innovations Club (MIC) at VIT Chennai. Apply to Technical, Non-Technical, and Creative domains.",
    start_url: "/",
    display: "standalone",
    background_color: "#020617",
    theme_color: "#0d9488",
    icons: [
      {
        src: "/icon.png",
        sizes: "192x192 512x512",
        type: "image/png",
      },
      {
        src: "/mic_logo_pixel.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}

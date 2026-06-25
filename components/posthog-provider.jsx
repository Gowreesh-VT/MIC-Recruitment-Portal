"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";

if (typeof window !== "undefined") {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";
  
  if (key) {
    posthog.init(key, {
      api_host: host,
      person_profiles: "identified_only",
      capture_pageview: true // Auto-captures pageviews
    });
  }
}

export function PostHogProvider({ children }) {
  return <PHProvider client={posthog}>{children}</PHProvider>;
}

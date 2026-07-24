"use client";

import React, { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { PostHogProvider, usePostHog } from "posthog-js/react";

// Initialize PostHog client-side only
if (typeof window !== "undefined") {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";
  
  if (key) {
    posthog.init(key, {
      api_host: host,
      person_profiles: "identified_only",
      capture_pageview: false, // Captured manually on route changes to handle Next.js client router accurately
      loaded: (ph) => {
        ph.register({ app_name: "mic-recruitment-portal" });
      },
    });
  } else {
    console.warn("PostHog project key (NEXT_PUBLIC_POSTHOG_KEY) is missing.");
  }
}

function PostHogPageViewContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthogClient = usePostHog();

  useEffect(() => {
    if (pathname && posthogClient) {
      let url = window.origin + pathname;
      if (searchParams.toString()) {
        url = url + `?${searchParams.toString()}`;
      }
      posthogClient.capture("$pageview", { $current_url: url });
    }
  }, [pathname, searchParams, posthogClient]);

  return null;
}

function PostHogPageView() {
  return (
    <Suspense fallback={null}>
      <PostHogPageViewContent />
    </Suspense>
  );
}

function PostHogUserIdentify() {
  const posthogClient = usePostHog();

  useEffect(() => {
    if (!posthogClient) return;

    // Retrieve the NextAuth session on the client side
    fetch("/api/auth/session")
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((session) => {
        if (session?.user?.email) {
          posthogClient.identify(session.user.id || session.user.email, {
            email: session.user.email,
            name: session.user.name,
            role: session.user.role,
          });
        } else {
          posthogClient.reset();
        }
      })
      .catch((err) => {
        console.error("[PostHog] Failed to query auth session for identification:", err);
      });
  }, [posthogClient]);

  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PostHogProvider client={posthog}>
      <PostHogPageView />
      <PostHogUserIdentify />
      {children}
    </PostHogProvider>
  );
}

"use client";

import { useEffect } from "react";
import { useStandalone } from "@/lib/useStandalone";
import { loadSettings, applySettings } from "@/lib/settings";
import AppShell from "@/components/AppShell";
import Landing from "@/components/Landing";

export default function Page() {
  const isStandalone = useStandalone();

  // Apply saved settings on first mount
  useEffect(() => {
    const settings = loadSettings();
    applySettings(settings);

    // Swap favicon based on color scheme
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (favicon) {
      favicon.href = prefersDark
        ? "/icons/rakugaki-dark.svg"
        : "/icons/rakugaki-light.svg";
    }

    const handler = (e: MediaQueryListEvent) => {
      if (favicon) {
        favicon.href = e.matches
          ? "/icons/rakugaki-dark.svg"
          : "/icons/rakugaki-light.svg";
      }
    };
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Loading state while we detect standalone mode (avoids hydration flash)
  if (isStandalone === null) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500" />
      </div>
    );
  }

  return isStandalone ? <AppShell /> : <Landing />;
}

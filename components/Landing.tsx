"use client";

import Image from "next/image";

export default function Landing() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-6 py-12"
      style={{ background: "var(--macos-bg)", color: "var(--macos-text)" }}
    >
      {/* Logo */}
      <div className="mb-6 flex items-center gap-3">
        <picture>
          <source
            srcSet="/icons/rakugaki-dark.svg"
            media="(prefers-color-scheme: dark)"
          />
          <img
            src="/icons/rakugaki-light.svg"
            alt="Rakugaki"
            className="h-16 w-16"
          />
        </picture>
        <h1
          className="text-4xl font-semibold tracking-tight"
          style={{ color: "var(--macos-text)" }}
        >
          Rakugaki
        </h1>
      </div>

      <p
        className="mb-12 max-w-sm text-center text-base leading-relaxed"
        style={{ color: "var(--macos-text-secondary)" }}
      >
        A local-first markdown editor. Your notes stay on your Mac, always.
      </p>

      {/* Install instructions */}
      <div
        className="w-full max-w-md rounded-2xl border p-6"
        style={{
          background: "var(--macos-surface)",
          borderColor: "var(--macos-border)",
          backdropFilter: "blur(20px)",
        }}
      >
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--macos-text-secondary)" }}>
          Install Rakugaki
        </h2>

        <div className="space-y-5">
          <Step num={1} title="Chrome / Edge (macOS)">
            Click the install icon <kbd className="rounded px-1 py-0.5 text-xs" style={{ background: "var(--macos-border)" }}>⊕</kbd> in the address bar, then choose{" "}
            <strong>Install Rakugaki</strong>.
          </Step>

          <Step num={2} title="Safari (macOS Sonoma+)">
            Click <strong>File</strong> in the menu bar, then{" "}
            <strong>Add to Dock</strong>.
          </Step>

          <Step num={3} title="Safari (iPhone / iPad)">
            Tap the <strong>Share</strong> button, scroll down and tap{" "}
            <strong>Add to Home Screen</strong>.
          </Step>
        </div>
      </div>

      <p className="mt-8 text-xs" style={{ color: "var(--macos-text-secondary)" }}>
        Once installed, open Rakugaki from your Dock or Launchpad.
      </p>
    </div>
  );
}

function Step({ num, title, children }: { num: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span
        className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
        style={{ background: "var(--macos-accent)" }}
      >
        {num}
      </span>
      <div>
        <p className="font-medium" style={{ color: "var(--macos-text)" }}>{title}</p>
        <p className="mt-0.5 text-sm" style={{ color: "var(--macos-text-secondary)" }}>{children}</p>
      </div>
    </div>
  );
}

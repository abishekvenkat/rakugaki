"use client";

import type { Settings, TabLayout, Theme, Font, FontSize } from "@/lib/settings";
import { pickTempDir, hasTempDir } from "@/lib/fs";

interface SettingsPanelProps {
  settings: Settings;
  onUpdate: (s: Partial<Settings>) => void;
  onClose: () => void;
}

export default function SettingsPanel({ settings, onUpdate, onClose }: SettingsPanelProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm overflow-hidden rounded-2xl shadow-2xl"
        style={{
          background: "var(--macos-surface)",
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          border: "1px solid var(--macos-border)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between border-b px-5 py-4"
          style={{ borderColor: "var(--macos-border)" }}
        >
          <h2 className="text-sm font-semibold" style={{ color: "var(--macos-text)" }}>
            Settings
          </h2>
          <button
            onClick={onClose}
            className="flex h-6 w-6 items-center justify-center rounded-full text-xs transition-colors"
            style={{ background: "var(--macos-border)", color: "var(--macos-text-secondary)" }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="divide-y px-5 py-2" style={{ "--tw-divide-opacity": "1" } as React.CSSProperties}>

          {/* Appearance section */}
          <div className="py-3">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--macos-text-secondary)" }}>
              Appearance
            </p>

            <Row label="Theme">
              <SegmentedControl
                options={[
                  { value: "system", label: "System" },
                  { value: "light", label: "Light" },
                  { value: "dark", label: "Dark" },
                ]}
                value={settings.theme}
                onChange={(v) => onUpdate({ theme: v as Theme })}
              />
            </Row>

            <Row label="Font">
              <SegmentedControl
                options={[
                  { value: "sans", label: "Sans" },
                  { value: "mono", label: "Mono" },
                  { value: "serif", label: "Serif" },
                ]}
                value={settings.font}
                onChange={(v) => onUpdate({ font: v as Font })}
              />
            </Row>

            <Row label="Text size">
              <SegmentedControl
                options={[
                  { value: "xs", label: "XS" },
                  { value: "s", label: "S" },
                  { value: "m", label: "M" },
                  { value: "l", label: "L" },
                  { value: "xl", label: "XL" },
                ]}
                value={settings.fontSize}
                onChange={(v) => onUpdate({ fontSize: v as FontSize })}
              />
            </Row>
          </div>

          {/* Layout section */}
          <div className="py-3">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--macos-text-secondary)" }}>
              Layout
            </p>

            <Row label="Tab style">
              <SegmentedControl
                options={[
                  { value: "horizontal", label: "Top" },
                  { value: "vertical", label: "Side" },
                ]}
                value={settings.tabLayout}
                onChange={(v) => onUpdate({ tabLayout: v as TabLayout })}
              />
            </Row>
          </div>

          {/* Storage section */}
          <div className="py-3">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--macos-text-secondary)" }}>
              Storage
            </p>

            <Row label="Recovery folder">
              <button
                onClick={async () => { await pickTempDir(); }}
                className="rounded-lg px-3 py-1 text-xs font-medium transition-colors"
                style={{
                  background: "var(--macos-accent)",
                  color: "#fff",
                }}
              >
                {hasTempDir() ? "Change folder" : "Set folder"}
              </button>
            </Row>

            <p className="mt-2 text-xs leading-relaxed" style={{ color: "var(--macos-text-secondary)" }}>
              Rakugaki auto-saves recovery copies to this folder every 30 seconds. Your actual notes are saved wherever you choose with Cmd+S.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm" style={{ color: "var(--macos-text)" }}>{label}</span>
      {children}
    </div>
  );
}

function SegmentedControl({
  options, value, onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div
      className="flex rounded-lg p-0.5"
      style={{ background: "var(--macos-border)" }}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className="rounded-md px-2.5 py-1 text-xs font-medium transition-all"
          style={{
            background: value === opt.value ? "var(--macos-tab-active)" : "transparent",
            color: value === opt.value ? "var(--macos-text)" : "var(--macos-text-secondary)",
            boxShadow: value === opt.value ? "0 1px 3px rgba(0,0,0,0.12)" : "none",
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

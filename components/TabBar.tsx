"use client";

import { useRef, useState } from "react";
import type { Tab } from "./AppShell";
import type { ViewMode } from "./AppShell";
import type { Settings } from "@/lib/settings";

interface TabBarProps {
  tabs: Tab[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onAddTab: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onSave: () => void;
  isDirty: boolean;
  settings: Settings;
  onUpdateSettings: (s: Partial<Settings>) => void;
}

export default function TabBar({
  tabs, activeTabId, onSelectTab, onCloseTab, onAddTab,
  viewMode, onViewModeChange, onSave, isDirty, settings, onUpdateSettings,
}: TabBarProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className="flex items-center border-b pl-[76px] pr-2"
      style={{
        background: "var(--macos-surface)",
        borderColor: "var(--macos-border)",
        backdropFilter: "blur(20px)",
        height: "36px",
        WebkitAppRegion: "drag",
      } as React.CSSProperties}
    >
      {/* Tab scroll area */}
      <div
        ref={scrollRef}
        className="flex flex-1 items-center gap-0.5 overflow-x-auto"
        style={{ WebkitAppRegion: "no-drag", scrollbarWidth: "none" } as React.CSSProperties}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          const isHovered = hoveredId === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              onMouseEnter={() => setHoveredId(tab.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="group relative flex h-7 max-w-[160px] items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors"
              style={{
                background: isActive
                  ? "var(--macos-tab-active)"
                  : isHovered
                  ? "var(--macos-border)"
                  : "transparent",
                color: isActive ? "var(--macos-text)" : "var(--macos-text-secondary)",
                boxShadow: isActive ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                flexShrink: 0,
              }}
            >
              {/* Dirty indicator */}
              {tab.isDirty && (
                <span
                  className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                  style={{ background: "var(--macos-accent)" }}
                />
              )}
              <span className="truncate">{tab.title}</span>

              {/* Close button */}
              <span
                className="ml-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded opacity-0 transition-opacity group-hover:opacity-100"
                style={{ background: isActive ? "var(--macos-border)" : "transparent" }}
                onClick={(e) => { e.stopPropagation(); onCloseTab(tab.id); }}
                aria-label="Close tab"
              >
                <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
                  <path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </span>
            </button>
          );
        })}

        {/* New tab */}
        <button
          onClick={onAddTab}
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md text-lg leading-none transition-colors"
          style={{ color: "var(--macos-text-secondary)" }}
          title="New tab (⌘T)"
        >
          +
        </button>
      </div>

      {/* Right: view mode + save + settings */}
      <div className="relative flex items-center gap-1 pl-2" style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}>
        {/* Save status */}
        {isDirty && (
          <button
            onClick={onSave}
            className="rounded px-2 py-0.5 text-xs transition-colors"
            style={{
              background: "var(--macos-accent)",
              color: "#fff",
              fontSize: "11px",
            }}
            title="Save (⌘S)"
          >
            Save
          </button>
        )}

        {/* View mode toggle */}
        <div
          className="flex rounded-md overflow-hidden border"
          style={{ borderColor: "var(--macos-border)" }}
        >
          {(["edit", "split", "preview"] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => onViewModeChange(mode)}
              className="px-2 py-0.5 text-xs transition-colors capitalize"
              style={{
                background: viewMode === mode ? "var(--macos-accent)" : "var(--macos-surface)",
                color: viewMode === mode ? "#fff" : "var(--macos-text-secondary)",
                fontSize: "11px",
              }}
              title={`${mode} mode`}
            >
              {mode === "split" ? "⇔" : mode === "edit" ? "Edit" : "Preview"}
            </button>
          ))}
        </div>

        {/* Settings gear */}
        <button
          onClick={() => setShowSettings((v) => !v)}
          className="flex h-6 w-6 items-center justify-center rounded transition-colors"
          style={{
            background: showSettings ? "var(--macos-border)" : "transparent",
            color: "var(--macos-text-secondary)",
          }}
          title="Settings"
        >
          <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" clipRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" />
          </svg>
        </button>

        {/* Settings popover */}
        {showSettings && (
          <>
            {/* Backdrop to close */}
            <div className="fixed inset-0 z-10" onClick={() => setShowSettings(false)} />
            <div
              className="absolute right-0 top-full z-20 mt-1 w-56 rounded-xl border py-3 shadow-xl"
              style={{
                background: "var(--macos-surface)",
                backdropFilter: "blur(40px)",
                WebkitBackdropFilter: "blur(40px)",
                borderColor: "var(--macos-border)",
              }}
            >
              <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--macos-text-secondary)" }}>
                Settings
              </p>

              {/* Theme */}
              <div className="flex items-center justify-between px-3 py-1.5">
                <span className="text-sm" style={{ color: "var(--macos-text)" }}>Theme</span>
                <select
                  value={settings.theme}
                  onChange={(e) => onUpdateSettings({ theme: e.target.value as Settings["theme"] })}
                  className="rounded-md px-2 py-0.5 text-xs"
                  style={{ background: "var(--macos-bg)", color: "var(--macos-text)", border: "1px solid var(--macos-border)" }}
                >
                  <option value="system">System</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>

              {/* Font */}
              <div className="flex items-center justify-between px-3 py-1.5">
                <span className="text-sm" style={{ color: "var(--macos-text)" }}>Font</span>
                <select
                  value={settings.font}
                  onChange={(e) => onUpdateSettings({ font: e.target.value as Settings["font"] })}
                  className="rounded-md px-2 py-0.5 text-xs"
                  style={{ background: "var(--macos-bg)", color: "var(--macos-text)", border: "1px solid var(--macos-border)" }}
                >
                  <option value="sans">Sans-Serif</option>
                  <option value="mono">Monospace</option>
                  <option value="serif">Serif</option>
                </select>
              </div>

              {/* Font size */}
              <div className="flex items-center justify-between px-3 py-1.5">
                <span className="text-sm" style={{ color: "var(--macos-text)" }}>Size</span>
                <div className="flex gap-1">
                  {(["xs", "s", "m", "l", "xl"] as Settings["fontSize"][]).map((sz) => (
                    <button
                      key={sz}
                      onClick={() => onUpdateSettings({ fontSize: sz })}
                      className="rounded px-1.5 py-0.5 text-xs uppercase"
                      style={{
                        background: settings.fontSize === sz ? "var(--macos-accent)" : "var(--macos-border)",
                        color: settings.fontSize === sz ? "#fff" : "var(--macos-text)",
                      }}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

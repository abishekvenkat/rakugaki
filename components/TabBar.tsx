"use client";

import { useRef, useState } from "react";
import type { Tab } from "./AppShell";
import type { ViewMode } from "./AppShell";

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
}

export default function TabBar({
  tabs, activeTabId, onSelectTab, onCloseTab, onAddTab,
  viewMode, onViewModeChange, onSave, isDirty,
}: TabBarProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
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

      {/* Right: view mode + save */}
      <div className="flex items-center gap-1 pl-2" style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}>
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
      </div>
    </div>
  );
}

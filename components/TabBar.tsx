"use client";

import { useRef, useState } from "react";
import type { Tab, ViewMode } from "./AppShell";

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
  onZenMode: () => void;
}

const VIEW_CYCLE: ViewMode[] = ["edit", "split", "preview"];

const VIEW_SVG: Record<ViewMode, React.ReactNode> = {
  edit: (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
    </svg>
  ),
  split: (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
      <path d="M2 4a1 1 0 011-1h5a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V4zm9 0a1 1 0 011-1h5a1 1 0 011 1v12a1 1 0 01-1 1h-5a1 1 0 01-1-1V4z" />
    </svg>
  ),
  preview: (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
    </svg>
  ),
};

export default function TabBar({
  tabs, activeTabId, onSelectTab, onCloseTab, onAddTab,
  viewMode, onViewModeChange, onSave, isDirty, onZenMode,
}: TabBarProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  function cycleViewMode() {
    const idx = VIEW_CYCLE.indexOf(viewMode);
    onViewModeChange(VIEW_CYCLE[(idx + 1) % VIEW_CYCLE.length]);
  }

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
                background: isActive ? "var(--macos-tab-active)" : isHovered ? "var(--macos-border)" : "transparent",
                color: isActive ? "var(--macos-text)" : "var(--macos-text-secondary)",
                boxShadow: isActive ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                flexShrink: 0,
              }}
            >
              {tab.isDirty && (
                <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ background: "var(--macos-accent)" }} />
              )}
              <span className="truncate">{tab.title}</span>
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

        <button
          onClick={onAddTab}
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md text-lg leading-none transition-colors"
          style={{ color: "var(--macos-text-secondary)" }}
          title="New tab (⌘T)"
        >
          +
        </button>
      </div>

      {/* Right controls */}
      <div
        className="flex items-center gap-2 pl-2"
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
      >
        {/* Save button */}
        {isDirty && (
          <button
            onClick={onSave}
            className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors"
            style={{ background: "var(--macos-accent)", color: "#fff" }}
            title="Save (⌘S)"
          >
            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6.414L13.586 2H4zm7 1.5V7H6V3.5h5zM5 11a1 1 0 011-1h8a1 1 0 011 1v5H5v-5z" />
            </svg>
          </button>
        )}

        {/* View mode cycle button */}
        <button
          onClick={cycleViewMode}
          className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors"
          style={{
            background: "var(--macos-border)",
            color: "var(--macos-text)",
          }}
          title={`View: ${viewMode} (click to cycle)`}
        >
          {VIEW_SVG[viewMode]}
        </button>

        {/* Zen mode button */}
        <button
          onClick={onZenMode}
          className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors"
          style={{
            background: "var(--macos-border)",
            color: "var(--macos-text-secondary)",
          }}
          title="Zen mode (⌘⇧Z)"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M1 4V2h2M11 2h2v2M1 10v2h2M11 12h2v-2" />
          </svg>
        </button>

      </div>
    </div>
  );
}

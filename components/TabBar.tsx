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
  onSettingsClick: () => void;
}

const VIEW_CYCLE: ViewMode[] = ["edit", "split", "preview"];
const VIEW_LABELS: Record<ViewMode, string> = { edit: "Edit", split: "Split", preview: "Preview" };
const VIEW_ICONS: Record<ViewMode, string> = { edit: "✏️", split: "⇔", preview: "👁" };

export default function TabBar({
  tabs, activeTabId, onSelectTab, onCloseTab, onAddTab,
  viewMode, onViewModeChange, onSave, isDirty, onSettingsClick,
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
        {/* Save pill */}
        {isDirty && (
          <button
            onClick={onSave}
            className="rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors"
            style={{ background: "var(--macos-accent)", color: "#fff", fontSize: "11px" }}
            title="Save (⌘S)"
          >
            Save
          </button>
        )}

        {/* View mode cycle button */}
        <button
          onClick={cycleViewMode}
          className="flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-colors"
          style={{
            background: "var(--macos-border)",
            color: "var(--macos-text)",
          }}
          title="Cycle view mode (Edit → Split → Preview)"
        >
          <span>{VIEW_ICONS[viewMode]}</span>
          <span>{VIEW_LABELS[viewMode]}</span>
        </button>

        {/* Settings button */}
        <button
          onClick={onSettingsClick}
          className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors"
          style={{
            background: "var(--macos-border)",
            color: "var(--macos-text-secondary)",
          }}
          title="Settings"
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" clipRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

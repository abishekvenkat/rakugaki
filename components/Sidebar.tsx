"use client";

import { useState, useRef, useCallback } from "react";
import type { Tab, ViewMode } from "./AppShell";
import type { Settings } from "@/lib/settings";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  tabs: Tab[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onAddTab: () => void;
  onCloseTab: (id: string) => void;
  settings: Settings;
  onUpdateSettings: (s: Partial<Settings>) => void;
  onOpenFile: () => void;
  onSaveFile: () => void;
  onExport: (fmt: "md" | "txt" | "rtf") => void;
  onOpenRecovery: () => void;
  onPickTempDir: () => void;
  hasTempDir: boolean;
}

export default function Sidebar({
  isOpen, onToggle, tabs, activeTabId, onSelectTab,
  onAddTab, onCloseTab, settings, onUpdateSettings,
  onOpenFile, onSaveFile, onExport, onOpenRecovery, onPickTempDir, hasTempDir,
}: SidebarProps) {
  const [hovered, setHovered] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const hoverTimer = useRef<NodeJS.Timeout | null>(null);

  const visible = isOpen || hovered;

  const handleMouseEnter = useCallback(() => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    hoverTimer.current = setTimeout(() => setHovered(false), 200);
  }, []);

  return (
    <>
      {/* Hover trigger strip (always visible, very thin) */}
      <div
        className="absolute left-0 top-0 z-30 h-full w-1"
        onMouseEnter={handleMouseEnter}
        style={{ cursor: "col-resize" }}
      />

      {/* Sidebar panel */}
      <div
        className="absolute left-0 top-0 z-20 h-full flex flex-col"
        style={{
          width: "240px",
          background: "var(--macos-sidebar)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderRight: "1px solid var(--macos-border)",
          transform: visible ? "translateX(0)" : "translateX(-240px)",
          transition: "transform 220ms cubic-bezier(0.4,0,0.2,1)",
          boxShadow: visible ? "2px 0 12px rgba(0,0,0,0.08)" : "none",
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Traffic light clearance */}
        <div style={{ height: "52px" }} className="flex-shrink-0" />

        {/* App title */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2">
            <picture>
              <source srcSet="/icons/rakugaki-dark.svg" media="(prefers-color-scheme: dark)" />
              <img src="/icons/rakugaki-light.svg" alt="" className="h-5 w-5" />
            </picture>
            <span className="text-sm font-semibold" style={{ color: "var(--macos-text)" }}>
              Rakugaki
            </span>
          </div>
        </div>

        {/* File actions */}
        <div className="px-2 pb-1">
          <SidebarButton icon="📄" label="New Note (⌘N)" onClick={onAddTab} />
          <SidebarButton icon="📂" label="Open File… (⌘O)" onClick={onOpenFile} />
          <SidebarButton icon="💾" label="Save (⌘S)" onClick={onSaveFile} />
          <div className="relative">
            <SidebarButton
              icon="⬆️"
              label="Export As…"
              onClick={() => setShowExportMenu((v) => !v)}
            />
            {showExportMenu && (
              <div
                className="absolute left-2 z-10 rounded-lg border py-1 shadow-lg"
                style={{
                  top: "100%",
                  width: "160px",
                  background: "var(--macos-surface)",
                  borderColor: "var(--macos-border)",
                  backdropFilter: "blur(20px)",
                }}
              >
                {(["md", "txt", "rtf"] as const).map((fmt) => (
                  <button
                    key={fmt}
                    className="w-full px-3 py-1.5 text-left text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                    style={{ color: "var(--macos-text)" }}
                    onClick={() => { onExport(fmt); setShowExportMenu(false); }}
                  >
                    Export as .{fmt}
                  </button>
                ))}
              </div>
            )}
          </div>
          <SidebarButton
            icon="🗂️"
            label={hasTempDir ? "Open Recovery Folder" : "Set Recovery Folder"}
            onClick={hasTempDir ? onOpenRecovery : onPickTempDir}
          />
        </div>

        <hr style={{ borderColor: "var(--macos-border)", margin: "4px 12px" }} />

        {/* Notes/Tabs list */}
        <div className="flex-1 overflow-y-auto px-2 py-1">
          <p className="px-2 py-1 text-xs uppercase tracking-wider" style={{ color: "var(--macos-text-secondary)" }}>
            Open Notes
          </p>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className="group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors"
              style={{
                background: tab.id === activeTabId ? "var(--macos-tab-active)" : "transparent",
                color: tab.id === activeTabId ? "var(--macos-text)" : "var(--macos-text-secondary)",
              }}
            >
              <span className="flex-1 truncate">{tab.title}</span>
              {tab.isDirty && (
                <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ background: "var(--macos-accent)" }} />
              )}
              {tabs.length > 1 && (
                <span
                  className="flex-shrink-0 opacity-0 group-hover:opacity-100"
                  onClick={(e) => { e.stopPropagation(); onCloseTab(tab.id); }}
                  style={{ color: "var(--macos-text-secondary)", fontSize: "16px", lineHeight: 1 }}
                >
                  ×
                </span>
              )}
            </button>
          ))}
        </div>

        <hr style={{ borderColor: "var(--macos-border)", margin: "4px 12px" }} />

        {/* Settings */}
        <div className="px-2 pb-4">
          <SidebarButton
            icon="⚙️"
            label="Settings"
            onClick={() => setShowSettings((v) => !v)}
          />
          {showSettings && (
            <div className="px-2 pt-1 space-y-3">
              {/* Theme */}
              <SettingRow label="Theme">
                <select
                  value={settings.theme}
                  onChange={(e) => onUpdateSettings({ theme: e.target.value as Settings["theme"] })}
                  className="rounded px-2 py-0.5 text-xs"
                  style={{ background: "var(--macos-surface)", color: "var(--macos-text)", border: "1px solid var(--macos-border)" }}
                >
                  <option value="system">System</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </SettingRow>

              {/* Font */}
              <SettingRow label="Font">
                <select
                  value={settings.font}
                  onChange={(e) => onUpdateSettings({ font: e.target.value as Settings["font"] })}
                  className="rounded px-2 py-0.5 text-xs"
                  style={{ background: "var(--macos-surface)", color: "var(--macos-text)", border: "1px solid var(--macos-border)" }}
                >
                  <option value="sans">Sans-Serif</option>
                  <option value="mono">Monospace</option>
                  <option value="serif">Serif</option>
                </select>
              </SettingRow>

              {/* Font size */}
              <SettingRow label="Size">
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
              </SettingRow>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function SidebarButton({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5"
      style={{ color: "var(--macos-text)" }}
    >
      <span className="w-4 text-center text-xs">{icon}</span>
      <span className="truncate">{label}</span>
    </button>
  );
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs" style={{ color: "var(--macos-text-secondary)" }}>{label}</span>
      {children}
    </div>
  );
}

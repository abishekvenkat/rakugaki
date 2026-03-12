"use client";

import { useState, useEffect, useRef } from "react";
import type { ViewMode } from "./AppShell";

interface CommandPaletteProps {
  onClose: () => void;
  onNewNote: () => void;
  onOpenFile: () => void;
  onSave: () => void;
  onToggleTheme: () => void;
  onSetViewMode: (mode: ViewMode) => void;
  availableModes: ViewMode[];
  onExport: (fmt: "md" | "txt" | "rtf") => void;
  onZenMode: () => void;
  onFind: () => void;
}

interface Command {
  id: string;
  label: string;
  shortcut?: string;
  action: () => void;
}

export default function CommandPalette({
  onClose, onNewNote, onOpenFile, onSave, onToggleTheme, onSetViewMode, availableModes, onExport, onZenMode, onFind,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = [
    { id: "new", label: "New Note", shortcut: "⌘N", action: onNewNote },
    { id: "open", label: "Open File…", shortcut: "⌘O", action: onOpenFile },
    { id: "save", label: "Save", shortcut: "⌘S", action: onSave },
    { id: "theme", label: "Toggle Dark/Light Theme", action: onToggleTheme },
    { id: "edit", label: "Switch to Edit Mode", action: () => onSetViewMode("edit") },
    ...(availableModes.includes("preview") ? [{ id: "preview", label: "Switch to Preview Mode", action: () => onSetViewMode("preview") }] : []),
    ...(availableModes.includes("split") ? [{ id: "split", label: "Switch to Split View", action: () => onSetViewMode("split") }] : []),
    { id: "zen", label: "Zen Mode", shortcut: "⌘⇧Z", action: onZenMode },
    { id: "find", label: "Find", shortcut: "⌘F", action: onFind },
    { id: "export-md", label: "Export as Markdown (.md)", action: () => onExport("md") },
    { id: "export-txt", label: "Export as Plain Text (.txt)", action: () => onExport("txt") },
    { id: "export-rtf", label: "Export as Rich Text (.rtf)", action: () => onExport("rtf") },
  ];

  const filtered = query
    ? commands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()))
    : commands;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setSelectedIdx(0);
  }, [query]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIdx((i) => Math.min(i + 1, filtered.length - 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIdx((i) => Math.max(i - 1, 0)); }
      if (e.key === "Enter") {
        e.preventDefault();
        if (filtered[selectedIdx]) filtered[selectedIdx].action();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [filtered, selectedIdx, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-32"
      style={{ background: "rgba(0,0,0,0.3)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl shadow-2xl"
        style={{
          background: "var(--macos-surface)",
          backdropFilter: "blur(40px)",
          border: "1px solid var(--macos-border)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 border-b px-4 py-3" style={{ borderColor: "var(--macos-border)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            style={{ color: "var(--macos-text-secondary)", flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command…"
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: "var(--macos-text)" }}
          />
          <kbd className="rounded px-1.5 py-0.5 text-xs" style={{ background: "var(--macos-border)", color: "var(--macos-text-secondary)" }}>
            esc
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-72 overflow-y-auto py-1">
          {filtered.length === 0 ? (
            <p className="px-4 py-3 text-sm" style={{ color: "var(--macos-text-secondary)" }}>
              No commands found
            </p>
          ) : (
            filtered.map((cmd, i) => (
              <button
                key={cmd.id}
                onClick={cmd.action}
                className="flex w-full items-center justify-between px-4 py-2 text-left text-sm transition-colors"
                style={{
                  background: i === selectedIdx ? "var(--macos-accent)" : "transparent",
                  color: i === selectedIdx ? "#fff" : "var(--macos-text)",
                }}
                onMouseEnter={() => setSelectedIdx(i)}
              >
                <span>{cmd.label}</span>
                {cmd.shortcut && (
                  <kbd
                    className="rounded px-1.5 py-0.5 text-xs"
                    style={{
                      background: i === selectedIdx ? "rgba(255,255,255,0.2)" : "var(--macos-border)",
                      color: i === selectedIdx ? "#fff" : "var(--macos-text-secondary)",
                    }}
                  >
                    {cmd.shortcut}
                  </kbd>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

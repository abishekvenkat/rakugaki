"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Sidebar from "./Sidebar";
import TabBar from "./TabBar";
import CommandPalette from "./CommandPalette";
import CodeMirrorEditor from "./Editor/CodeMirrorEditor";
import MarkdownPreview from "./Editor/MarkdownPreview";
import SplitView from "./Editor/SplitView";
import { openFile, saveFile, saveFileAs, pickTempDir, hasTempDir, autosave, exportAs, openTempDir } from "@/lib/fs";
import { loadSettings, saveSettings, applySettings } from "@/lib/settings";
import type { Settings } from "@/lib/settings";
import type { FileHandle } from "@/lib/fs";

export type ViewMode = "edit" | "preview" | "split";

export interface Tab {
  id: string;
  title: string;
  content: string;
  fileHandle: FileHandle | null;
  isDirty: boolean;
}

let tabCounter = 0;
function newTab(title = "Untitled", content = ""): Tab {
  tabCounter += 1;
  return { id: `tab-${tabCounter}-${Date.now()}`, title, content, fileHandle: null, isDirty: false };
}

export default function AppShell() {
  const [tabs, setTabs] = useState<Tab[]>([newTab()]);
  const [activeTabId, setActiveTabId] = useState<string>(() => "");
  const [viewMode, setViewMode] = useState<ViewMode>("edit");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [setupDone, setSetupDone] = useState(false);
  const autosaveTimer = useRef<NodeJS.Timeout | null>(null);

  // Set initial active tab
  useEffect(() => {
    setActiveTabId(tabs[0].id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // First-launch setup: ask for temp/recovery folder
  useEffect(() => {
    if (!setupDone) {
      const alreadyAsked = localStorage.getItem("rakugaki:setup-done");
      if (!alreadyAsked) {
        const ask = async () => {
          const ok = confirm(
            "Welcome to Rakugaki!\n\nWould you like to pick a folder for auto-saving recovery copies of your notes? You can skip and do this later."
          );
          if (ok) await pickTempDir();
          localStorage.setItem("rakugaki:setup-done", "1");
        };
        ask();
      }
      setSetupDone(true);
    }
  }, [setupDone]);

  const activeTab = tabs.find((t) => t.id === activeTabId) ?? tabs[0];

  // Autosave every 30s when content changes
  useEffect(() => {
    if (!activeTab) return;
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      if (activeTab.isDirty) autosave(activeTab.id, activeTab.content);
    }, 30_000);
    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
  }, [activeTab]);

  const updateContent = useCallback((content: string) => {
    setTabs((prev) =>
      prev.map((t) => (t.id === activeTabId ? { ...t, content, isDirty: true } : t))
    );
  }, [activeTabId]);

  const addTab = useCallback((tab?: Tab) => {
    const t = tab ?? newTab();
    setTabs((prev) => [...prev, t]);
    setActiveTabId(t.id);
  }, []);

  const closeTab = useCallback((id: string) => {
    setTabs((prev) => {
      if (prev.length === 1) return [newTab()];
      const next = prev.filter((t) => t.id !== id);
      if (activeTabId === id) setActiveTabId(next[next.length - 1].id);
      return next;
    });
  }, [activeTabId]);

  // ─── File operations ───────────────────────────────────────────────────────

  const handleOpen = useCallback(async () => {
    const result = await openFile();
    if (!result) return;
    const t = newTab(result.handle.name, result.content);
    t.fileHandle = result.handle;
    t.isDirty = false;
    addTab(t);
  }, [addTab]);

  const handleSave = useCallback(async () => {
    if (!activeTab) return;
    if (activeTab.fileHandle) {
      await saveFile(activeTab.fileHandle.handle, activeTab.content);
      setTabs((prev) =>
        prev.map((t) => (t.id === activeTab.id ? { ...t, isDirty: false } : t))
      );
    } else {
      const handle = await saveFileAs(activeTab.content, activeTab.title + ".md");
      if (!handle) return;
      setTabs((prev) =>
        prev.map((t) =>
          t.id === activeTab.id
            ? { ...t, fileHandle: handle, title: handle.name, isDirty: false }
            : t
        )
      );
    }
  }, [activeTab]);

  // ─── Keyboard shortcuts ────────────────────────────────────────────────────

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const cmd = e.metaKey || e.ctrlKey;
      if (cmd && e.key === "s") { e.preventDefault(); handleSave(); }
      if (cmd && e.key === "n") { e.preventDefault(); addTab(); }
      if (cmd && e.key === "t") { e.preventDefault(); addTab(); }
      if (cmd && e.key === "w") { e.preventDefault(); closeTab(activeTabId); }
      if (cmd && e.key === "k") { e.preventDefault(); setCommandPaletteOpen(true); }
      if (cmd && e.key === "\\") { e.preventDefault(); setSidebarOpen((v) => !v); }
      if (cmd && e.shiftKey && e.key === "E") {
        e.preventDefault();
        setViewMode((v) => v === "edit" ? "preview" : "edit");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeTabId, handleSave, addTab, closeTab]);

  // ─── Settings ──────────────────────────────────────────────────────────────

  const updateSettings = useCallback((partial: Partial<Settings>) => {
    const next = saveSettings(partial);
    setSettings(next);
    applySettings(next);
  }, []);

  // ─── Export menu ──────────────────────────────────────────────────────────

  const handleExport = useCallback(async (format: "md" | "txt" | "rtf") => {
    if (!activeTab) return;
    const baseName = activeTab.title.replace(/\.[^.]+$/, "");
    await exportAs(activeTab.content, baseName, format);
  }, [activeTab]);

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "var(--macos-bg)" }}
    >
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((v) => !v)}
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={setActiveTabId}
        onAddTab={() => addTab()}
        onCloseTab={closeTab}
        settings={settings}
        onUpdateSettings={updateSettings}
        onOpenFile={handleOpen}
        onSaveFile={handleSave}
        onExport={handleExport}
        onOpenRecovery={openTempDir}
        onPickTempDir={pickTempDir}
        hasTempDir={hasTempDir()}
      />

      {/* Main content area */}
      <div
        className="flex flex-1 flex-col overflow-hidden"
        style={{
          paddingTop: "28px", // macOS traffic lights clearance (height)
          paddingLeft: sidebarOpen ? "0" : "0",
        }}
      >
        {/* Tab bar — padded left for traffic lights */}
        <TabBar
          tabs={tabs}
          activeTabId={activeTabId}
          onSelectTab={setActiveTabId}
          onCloseTab={closeTab}
          onAddTab={() => addTab()}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onSave={handleSave}
          isDirty={activeTab?.isDirty ?? false}
          settings={settings}
          onUpdateSettings={updateSettings}
        />

        {/* Editor area */}
        <div className="flex-1 overflow-hidden">
          {activeTab && (
            <>
              {viewMode === "edit" && (
                <CodeMirrorEditor
                  content={activeTab.content}
                  onChange={updateContent}
                  settings={settings}
                />
              )}
              {viewMode === "preview" && (
                <MarkdownPreview content={activeTab.content} settings={settings} />
              )}
              {viewMode === "split" && (
                <SplitView
                  content={activeTab.content}
                  onChange={updateContent}
                  settings={settings}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Command Palette */}
      {commandPaletteOpen && (
        <CommandPalette
          onClose={() => setCommandPaletteOpen(false)}
          onNewNote={() => { addTab(); setCommandPaletteOpen(false); }}
          onOpenFile={async () => { await handleOpen(); setCommandPaletteOpen(false); }}
          onSave={async () => { await handleSave(); setCommandPaletteOpen(false); }}
          onToggleTheme={() => {
            updateSettings({ theme: settings.theme === "dark" ? "light" : "dark" });
            setCommandPaletteOpen(false);
          }}
          onSetViewMode={(mode) => { setViewMode(mode); setCommandPaletteOpen(false); }}
          onExport={(fmt) => { handleExport(fmt); setCommandPaletteOpen(false); }}
        />
      )}
    </div>
  );
}

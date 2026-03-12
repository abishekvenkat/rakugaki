"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Sidebar from "./Sidebar";
import TabBar from "./TabBar";
import CommandPalette from "./CommandPalette";
import SettingsPanel from "./SettingsPanel";
import CodeMirrorEditor from "./Editor/CodeMirrorEditor";
import MarkdownPreview from "./Editor/MarkdownPreview";
import SplitView from "./Editor/SplitView";
import StatusBar from "./StatusBar";
import { openFile, saveFile, saveFileAs, pickTempDir, hasTempDir, autosave, exportAs, openTempDir, saveSession, loadSession, clearSession } from "@/lib/fs";
import type { SessionTab } from "@/lib/fs";
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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [zenMode, setZenMode] = useState(false);
  const [setupDone, setSetupDone] = useState(false);
  const [sessionRestored, setSessionRestored] = useState(false);
  const autosaveTimer = useRef<NodeJS.Timeout | null>(null);
  const sessionSaveTimer = useRef<NodeJS.Timeout | null>(null);

  // On first mount: check OPFS for a saved session and restore it
  useEffect(() => {
    const restore = async () => {
      const session = await loadSession();
      if (session && session.tabs.length > 0 && session.tabs.some(t => t.content.trim())) {
        const restoredTabs: Tab[] = session.tabs.map((t) => ({
          id: t.id,
          title: t.title,
          content: t.content,
          fileHandle: null, // handles can't be persisted
          isDirty: t.isDirty,
        }));
        setTabs(restoredTabs);
        setActiveTabId(session.activeTabId || restoredTabs[0].id);
      } else {
        setActiveTabId(tabs[0].id);
      }
      setSessionRestored(true);
    };
    restore();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // First-launch setup: ask for temp/recovery folder
  useEffect(() => {
    if (!sessionRestored) return;
    if (!setupDone) {
      const alreadyAsked = localStorage.getItem("rakugaki:setup-done");
      if (!alreadyAsked) {
        const ask = async () => {
          const ok = confirm(
            "Welcome to Rakugaki!\n\nWould you like to pick a folder for auto-saving recovery copies of your notes? You can skip and do this later in Settings."
          );
          if (ok) await pickTempDir();
          localStorage.setItem("rakugaki:setup-done", "1");
        };
        ask();
      }
      setSetupDone(true);
    }
  }, [sessionRestored, setupDone]);

  const activeTab = tabs.find((t) => t.id === activeTabId) ?? tabs[0];

  // Save session to OPFS whenever tabs change (debounced 5s)
  useEffect(() => {
    if (!sessionRestored) return;
    if (sessionSaveTimer.current) clearTimeout(sessionSaveTimer.current);
    sessionSaveTimer.current = setTimeout(() => {
      const sessionTabs: SessionTab[] = tabs.map((t) => ({
        id: t.id,
        title: t.title,
        content: t.content,
        isDirty: t.isDirty,
      }));
      saveSession(sessionTabs, activeTabId);
    }, 5_000);
    return () => {
      if (sessionSaveTimer.current) clearTimeout(sessionSaveTimer.current);
    };
  }, [tabs, activeTabId, sessionRestored]);

  // Autosave to user's temp folder every 30s when content changes
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
      setTabs((prev) => {
        const next = prev.map((t) => (t.id === activeTab.id ? { ...t, isDirty: false } : t));
        // Clear session if all tabs are now clean
        if (next.every((t) => !t.isDirty)) clearSession();
        return next;
      });
    } else {
      const handle = await saveFileAs(activeTab.content, activeTab.title + ".md");
      if (!handle) return;
      setTabs((prev) => {
        const next = prev.map((t) =>
          t.id === activeTab.id
            ? { ...t, fileHandle: handle, title: handle.name, isDirty: false }
            : t
        );
        if (next.every((t) => !t.isDirty)) clearSession();
        return next;
      });
    }
  }, [activeTab]);

  // ─── Right-click → command palette ────────────────────────────────────────

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      e.preventDefault();
      setCommandPaletteOpen(true);
    };
    window.addEventListener("contextmenu", handler);
    return () => window.removeEventListener("contextmenu", handler);
  }, []);

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
      if (cmd && e.key === ",") { e.preventDefault(); setSettingsOpen(true); }
      // Block browser Cmd+Shift+E (sidebar search in some browsers)
      if (cmd && e.shiftKey && e.key === "E") { e.preventDefault(); }
      // Ctrl+Shift+E cycles view modes
      if (e.ctrlKey && e.shiftKey && e.key === "E") {
        e.preventDefault();
        setViewMode((v) => {
          const idx = availableModes.indexOf(v);
          return availableModes[(idx + 1) % availableModes.length];
        });
      }
      if (cmd && e.shiftKey && e.key === "Z") {
        e.preventDefault();
        setZenMode((v) => !v);
      }
      if (e.key === "Escape" && zenMode && !commandPaletteOpen && !settingsOpen) {
        setZenMode(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeTabId, handleSave, addTab, closeTab, zenMode, commandPaletteOpen, settingsOpen]);

  // ─── Settings ──────────────────────────────────────────────────────────────

  const updateSettings = useCallback((partial: Partial<Settings>) => {
    const next = saveSettings(partial);
    setSettings(next);
    applySettings(next);
  }, []);

  // ─── Export ───────────────────────────────────────────────────────────────

  const handleExport = useCallback(async (format: "md" | "txt" | "rtf") => {
    if (!activeTab) return;
    const baseName = activeTab.title.replace(/\.[^.]+$/, "");
    await exportAs(activeTab.content, baseName, format);
  }, [activeTab]);

  const isVertical = settings.tabLayout === "vertical";

  // Compute which view modes are available based on settings
  const availableModes: ViewMode[] = ["edit"];
  if (settings.enabledViews === "split" || settings.enabledViews === "both") availableModes.push("split");
  if (settings.enabledViews === "preview" || settings.enabledViews === "both") availableModes.push("preview");

  // Reset to edit if current viewMode was disabled
  useEffect(() => {
    if (!availableModes.includes(viewMode)) setViewMode("edit");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.enabledViews]);

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "var(--macos-bg)" }}
    >
      {/* Sidebar — always rendered; in vertical mode it shows tabs prominently */}
      {!zenMode && (
        <Sidebar
          isOpen={sidebarOpen || isVertical}
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
          isVerticalTabs={isVertical}
          onSettingsClick={() => setSettingsOpen(true)}
        />
      )}

      {/* Main content area — shift right when sidebar is pinned open */}
      <div
        className="flex flex-1 flex-col overflow-hidden transition-all"
        style={{
          paddingTop: "28px",
          marginLeft: zenMode ? "0" : (isVertical ? "240px" : "0"),
        }}
      >
        {/* Tab bar — hidden in vertical mode and zen mode */}
        {!zenMode && !isVertical && (
          <TabBar
            tabs={tabs}
            activeTabId={activeTabId}
            onSelectTab={setActiveTabId}
            onCloseTab={closeTab}
            onAddTab={() => addTab()}
            viewMode={viewMode}
            availableModes={availableModes}
            onViewModeChange={setViewMode}
            onSave={handleSave}
            isDirty={activeTab?.isDirty ?? false}
            onZenMode={() => setZenMode(true)}
          />
        )}

        {/* Vertical mode top bar */}
        {!zenMode && isVertical && (
          <div
            className="flex items-center justify-between border-b px-4"
            style={{
              height: "36px",
              borderColor: "var(--macos-border)",
              background: "var(--macos-surface)",
              backdropFilter: "blur(20px)",
              WebkitAppRegion: "drag",
            } as React.CSSProperties}
          >
            <span className="truncate text-sm font-medium" style={{ color: "var(--macos-text)", WebkitAppRegion: "no-drag" } as React.CSSProperties}>
              {activeTab?.title ?? "Untitled"}
              {activeTab?.isDirty && (
                <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle" style={{ background: "var(--macos-accent)" }} />
              )}
            </span>
            <div className="flex items-center gap-2" style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}>
              {activeTab?.isDirty && (
                <button
                  onClick={handleSave}
                  className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                  style={{ background: "var(--macos-accent)", color: "#fff" }}
                >
                  Save
                </button>
              )}
              <button
                onClick={() => {
                  const idx = availableModes.indexOf(viewMode);
                  setViewMode(availableModes[(idx + 1) % availableModes.length]);
                }}
                className="flex h-7 w-7 items-center justify-center rounded-lg"
                style={{ background: "var(--macos-border)", color: "var(--macos-text)" }}
                title={`View: ${viewMode} (click to cycle)`}
              >
                {viewMode === "edit" ? (
                  <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                ) : viewMode === "split" ? (
                  <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor"><path d="M2 4a1 1 0 011-1h5a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V4zm9 0a1 1 0 011-1h5a1 1 0 011 1v12a1 1 0 01-1 1h-5a1 1 0 01-1-1V4z" /></svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Editor area */}
        <div className="flex-1 overflow-hidden">
          {activeTab && (
            <>
              {viewMode === "edit" && (
                <CodeMirrorEditor content={activeTab.content} onChange={updateContent} settings={settings} />
              )}
              {viewMode === "preview" && (
                <MarkdownPreview content={activeTab.content} settings={settings} />
              )}
              {viewMode === "split" && (
                <SplitView content={activeTab.content} onChange={updateContent} settings={settings} />
              )}
            </>
          )}
        </div>

        {/* Status bar */}
        {!zenMode && <StatusBar content={activeTab?.content ?? ""} />}
      </div>

      {/* Zen mode exit button */}
      {zenMode && (
        <button
          onClick={() => setZenMode(false)}
          className="fixed bottom-6 right-6 rounded-full px-4 py-1.5 text-xs font-medium"
          style={{
            background: "var(--macos-surface)",
            border: "1px solid var(--macos-border)",
            color: "var(--macos-text-secondary)",
            backdropFilter: "blur(20px)",
            zIndex: 50,
          }}
        >
          Esc to exit
        </button>
      )}

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
          availableModes={availableModes}
          onExport={(fmt) => { handleExport(fmt); setCommandPaletteOpen(false); }}
          onZenMode={() => { setZenMode(true); setCommandPaletteOpen(false); }}
          onFind={() => {
            setCommandPaletteOpen(false);
            setTimeout(() => window.dispatchEvent(
              new KeyboardEvent("keydown", { key: "f", metaKey: true, bubbles: true, cancelable: true })
            ), 50);
          }}
        />
      )}

      {/* Settings Panel */}
      {settingsOpen && (
        <SettingsPanel
          settings={settings}
          onUpdate={updateSettings}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  );
}

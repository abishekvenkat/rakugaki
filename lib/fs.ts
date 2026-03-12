// File System Access API utilities
// Handles are in-memory only (not serialized to localStorage) per spec.

export interface FileHandle {
  handle: FileSystemFileHandle;
  name: string;
  path: string;
}

// In-memory temp directory handle (survives tab lifetime only)
let tempDirHandle: FileSystemDirectoryHandle | null = null;

// ─── Open ─────────────────────────────────────────────────────────────────────

export async function openFile(): Promise<{ content: string; handle: FileHandle } | null> {
  try {
    const [handle] = await (window as Window & typeof globalThis & {
      showOpenFilePicker: (opts?: object) => Promise<FileSystemFileHandle[]>
    }).showOpenFilePicker({
      types: [
        { description: "Markdown & Text", accept: { "text/*": [".md", ".txt", ".markdown"] } },
      ],
      multiple: false,
    });
    const file = await handle.getFile();
    const content = await file.text();
    return { content, handle: { handle, name: file.name, path: file.name } };
  } catch (err: unknown) {
    if ((err as Error)?.name === "AbortError") return null;
    throw err;
  }
}

// ─── Save ─────────────────────────────────────────────────────────────────────

export async function saveFile(handle: FileSystemFileHandle, content: string): Promise<void> {
  const writable = await handle.createWritable();
  await writable.write(content);
  await writable.close();
}

// ─── Save As ──────────────────────────────────────────────────────────────────

export async function saveFileAs(
  content: string,
  suggestedName = "Untitled.md"
): Promise<FileHandle | null> {
  try {
    const handle = await (window as Window & typeof globalThis & {
      showSaveFilePicker: (opts?: object) => Promise<FileSystemFileHandle>
    }).showSaveFilePicker({
      suggestedName,
      types: [
        { description: "Markdown", accept: { "text/markdown": [".md"] } },
        { description: "Plain Text", accept: { "text/plain": [".txt"] } },
      ],
    });
    await saveFile(handle, content);
    const file = await handle.getFile();
    return { handle, name: file.name, path: file.name };
  } catch (err: unknown) {
    if ((err as Error)?.name === "AbortError") return null;
    throw err;
  }
}

// ─── Temp / Recovery Folder ───────────────────────────────────────────────────

export async function pickTempDir(): Promise<boolean> {
  try {
    tempDirHandle = await (window as Window & typeof globalThis & {
      showDirectoryPicker: (opts?: object) => Promise<FileSystemDirectoryHandle>
    }).showDirectoryPicker({ mode: "readwrite" });
    return true;
  } catch (err: unknown) {
    if ((err as Error)?.name === "AbortError") return false;
    throw err;
  }
}

export function hasTempDir(): boolean {
  return tempDirHandle !== null;
}

export async function autosave(noteId: string, content: string): Promise<void> {
  if (!tempDirHandle) return;
  try {
    const fileHandle = await tempDirHandle.getFileHandle(`${noteId}.md`, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();
  } catch {
    // Silently fail — don't interrupt the user's typing
  }
}

export async function deleteAutosave(noteId: string): Promise<void> {
  if (!tempDirHandle) return;
  try {
    await tempDirHandle.removeEntry(`${noteId}.md`);
  } catch {
    // File may not exist
  }
}

export async function openTempDir(): Promise<void> {
  if (!tempDirHandle) {
    await pickTempDir();
    return;
  }
  // List recoverable files
  const files: string[] = [];
  for await (const [name] of (tempDirHandle as FileSystemDirectoryHandle & AsyncIterable<[string, FileSystemHandle]>)) {
    if (name.endsWith(".md")) files.push(name);
  }
  if (files.length === 0) {
    alert("No recovery files found in the temp folder.");
  } else {
    alert(`Recovery files found:\n${files.join("\n")}\n\nUse File > Open to restore them.`);
  }
}

// ─── OPFS Session Persistence ─────────────────────────────────────────────────
// Uses the Origin Private File System for zero-permission session recovery.
// Only tab titles and content are stored — never file handles (not serializable).

export interface SessionTab {
  id: string;
  title: string;
  content: string;
  isDirty: boolean;
}

export interface SessionData {
  tabs: SessionTab[];
  activeTabId: string;
  savedAt: number;
}

async function getOpfsRoot(): Promise<FileSystemDirectoryHandle> {
  return navigator.storage.getDirectory();
}

export async function saveSession(tabs: SessionTab[], activeTabId: string): Promise<void> {
  try {
    const root = await getOpfsRoot();
    const fileHandle = await root.getFileHandle("session.json", { create: true });
    const writable = await fileHandle.createWritable();
    const data: SessionData = { tabs, activeTabId, savedAt: Date.now() };
    await writable.write(JSON.stringify(data));
    await writable.close();
  } catch {
    // OPFS not available or write failed — silently skip
  }
}

export async function loadSession(): Promise<SessionData | null> {
  try {
    const root = await getOpfsRoot();
    const fileHandle = await root.getFileHandle("session.json");
    const file = await fileHandle.getFile();
    const text = await file.text();
    return JSON.parse(text) as SessionData;
  } catch {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  try {
    const root = await getOpfsRoot();
    await root.removeEntry("session.json");
  } catch {
    // File may not exist
  }
}

// ─── Export ───────────────────────────────────────────────────────────────────

type ExportFormat = "md" | "txt" | "rtf";

export async function exportAs(content: string, name: string, format: ExportFormat): Promise<void> {
  let blob: Blob;
  let filename: string;

  if (format === "rtf") {
    const rtfContent = toRTF(content);
    blob = new Blob([rtfContent], { type: "application/rtf" });
    filename = `${name}.rtf`;
  } else if (format === "txt") {
    blob = new Blob([content], { type: "text/plain" });
    filename = `${name}.txt`;
  } else {
    blob = new Blob([content], { type: "text/markdown" });
    filename = `${name}.md`;
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function toRTF(markdown: string): string {
  // Minimal RTF wrapper — preserves plain text content
  const escaped = markdown
    .replace(/\\/g, "\\\\")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/\n/g, "\\par\n");

  return `{\\rtf1\\ansi\\deff0
{\\fonttbl{\\f0 Helvetica;}}
{\\colortbl ;\\red0\\green0\\blue0;}
\\f0\\fs28\\cf1
${escaped}
}`;
}

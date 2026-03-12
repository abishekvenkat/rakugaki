"use client";

import { useEffect, useRef, useCallback } from "react";
import { EditorView, keymap, ViewUpdate } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { search, searchKeymap, openSearchPanel } from "@codemirror/search";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { syntaxHighlighting, defaultHighlightStyle } from "@codemirror/language";
import { oneDark } from "@codemirror/theme-one-dark";
import type { Settings } from "@/lib/settings";

interface CodeMirrorEditorProps {
  content: string;
  onChange: (value: string) => void;
  settings: Settings;
}

export default function CodeMirrorEditor({ content, onChange, settings }: CodeMirrorEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const isDark = settings.theme === "dark" ||
    (settings.theme === "system" && typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  // Build theme extension
  const buildTheme = useCallback((dark: boolean) => {
    const lightTheme = EditorView.theme({
      "&": { background: "transparent", color: "var(--macos-text)" },
      ".cm-content": { caretColor: "var(--macos-accent)" },
      "&.cm-focused .cm-cursor": { borderLeftColor: "var(--macos-accent)" },
      ".cm-gutters": { background: "transparent", border: "none" },
      ".cm-lineNumbers .cm-gutterElement": { color: "var(--macos-text-secondary)", paddingRight: "12px" },
      ".cm-activeLine": { background: "rgba(0,0,0,0.02)" },
      ".cm-activeLineGutter": { background: "rgba(0,0,0,0.02)" },
      ".cm-selectionBackground": { background: "rgba(0, 113, 227, 0.12) !important" },
    });
    return dark ? oneDark : lightTheme;
  }, []);

  // Initialize editor
  useEffect(() => {
    if (!containerRef.current) return;

    const updateListener = EditorView.updateListener.of((update: ViewUpdate) => {
      if (update.docChanged) {
        onChangeRef.current(update.state.doc.toString());
      }
    });

    const state = EditorState.create({
      doc: content,
      extensions: [
        history(),
        markdown({ base: markdownLanguage, codeLanguages: languages }),
        syntaxHighlighting(defaultHighlightStyle),
        buildTheme(isDark),
        search({ top: true }),
        keymap.of([...defaultKeymap, ...historyKeymap, ...searchKeymap]),
        EditorView.lineWrapping,
        EditorView.contentAttributes.of({ "data-gramm": "false" }), // disable Grammarly
        updateListener,
      ],
    });

    const view = new EditorView({ state, parent: containerRef.current });
    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDark]); // Recreate when theme switches

  // Override browser Cmd+F / Cmd+H to use CodeMirror search panel
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const cmd = e.metaKey || e.ctrlKey;
      if (!cmd || e.shiftKey || e.altKey) return;
      if (e.key === "f" || e.key === "h") {
        e.preventDefault();
        if (viewRef.current) openSearchPanel(viewRef.current);
      }
    };
    window.addEventListener("keydown", handler, true); // capture phase beats browser default
    return () => window.removeEventListener("keydown", handler, true);
  }, []);

  // Sync external content changes (e.g., file open)
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const currentDoc = view.state.doc.toString();
    if (currentDoc !== content) {
      view.dispatch({
        changes: { from: 0, to: currentDoc.length, insert: content },
      });
    }
  }, [content]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full overflow-hidden"
      style={{ fontFamily: "var(--font-family-editor)", fontSize: "var(--font-size-editor)" }}
    />
  );
}

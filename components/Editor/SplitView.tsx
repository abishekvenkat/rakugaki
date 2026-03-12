"use client";

import { useState, useRef, useCallback } from "react";
import CodeMirrorEditor from "./CodeMirrorEditor";
import MarkdownPreview from "./MarkdownPreview";
import type { Settings } from "@/lib/settings";

interface SplitViewProps {
  content: string;
  onChange: (value: string) => void;
  settings: Settings;
}

export default function SplitView({ content, onChange, settings }: SplitViewProps) {
  const [splitRatio, setSplitRatio] = useState(50); // percent for left pane
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;

    const onMove = (moveEvent: MouseEvent) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const ratio = ((moveEvent.clientX - rect.left) / rect.width) * 100;
      setSplitRatio(Math.min(Math.max(ratio, 20), 80));
    };

    const onUp = () => {
      dragging.current = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, []);

  return (
    <div ref={containerRef} className="flex h-full w-full overflow-hidden">
      {/* Editor pane */}
      <div style={{ width: `${splitRatio}%`, overflow: "hidden", flexShrink: 0 }}>
        <CodeMirrorEditor content={content} onChange={onChange} settings={settings} />
      </div>

      {/* Drag handle */}
      <div
        className="flex-shrink-0 cursor-col-resize transition-colors hover:bg-blue-500/20"
        style={{
          width: "1px",
          background: "var(--macos-border)",
          position: "relative",
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Visual grab indicator */}
        <div
          className="absolute inset-y-0 -left-1 -right-1"
          style={{ cursor: "col-resize" }}
        />
      </div>

      {/* Preview pane */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        <MarkdownPreview content={content} settings={settings} />
      </div>
    </div>
  );
}

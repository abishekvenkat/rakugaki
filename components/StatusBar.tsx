"use client";

function stats(content: string) {
  const text = content.trim();
  const words = text ? text.split(/\s+/).length : 0;
  const chars = text.length;
  const readTime = Math.max(1, Math.round(words / 200));
  return { words, chars, readTime };
}

interface StatusBarProps {
  content: string;
}

export default function StatusBar({ content }: StatusBarProps) {
  const { words, chars, readTime } = stats(content);

  return (
    <div
      className="flex items-center justify-end px-4 text-xs"
      style={{
        height: "24px",
        background: "var(--macos-surface)",
        borderTop: "1px solid var(--macos-border)",
        color: "var(--macos-text-secondary)",
        flexShrink: 0,
      }}
    >
      <span>{words} words</span>
      <span className="mx-2" style={{ opacity: 0.3 }}>|</span>
      <span>{chars} chars</span>
      <span className="mx-2" style={{ opacity: 0.3 }}>|</span>
      <span>~{readTime} min read</span>
    </div>
  );
}

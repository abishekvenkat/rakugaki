"use client";

import { useEffect, useRef, useState } from "react";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";
import type { Settings } from "@/lib/settings";

interface MarkdownPreviewProps {
  content: string;
  settings: Settings;
}

export default function MarkdownPreview({ content, settings }: MarkdownPreviewProps) {
  const [html, setHtml] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const mermaidRef = useRef<typeof import("mermaid") | null>(null);

  // Parse markdown to HTML
  useEffect(() => {
    const render = async () => {
      const result = await remark()
        .use(remarkGfm)
        .use(remarkHtml, { sanitize: false })
        .process(content);
      setHtml(result.toString());
    };
    render();
  }, [content]);

  // Render Mermaid diagrams after HTML update
  useEffect(() => {
    if (!containerRef.current || !html) return;

    const renderMermaid = async () => {
      // Lazy-load mermaid
      if (!mermaidRef.current) {
        const mermaid = await import("mermaid");
        mermaidRef.current = mermaid;
        mermaid.default.initialize({
          startOnLoad: false,
          theme: document.documentElement.classList.contains("dark") ? "dark" : "default",
          securityLevel: "loose",
        });
      }

      // Find all code blocks tagged as mermaid and replace with diagrams
      const blocks = containerRef.current!.querySelectorAll("code.language-mermaid");
      for (const block of blocks) {
        const code = block.textContent ?? "";
        const pre = block.parentElement;
        if (!pre) continue;

        try {
          const id = `mermaid-${Math.random().toString(36).slice(2)}`;
          const { svg } = await mermaidRef.current!.default.render(id, code);
          const wrapper = document.createElement("div");
          wrapper.className = "mermaid";
          wrapper.innerHTML = svg;
          pre.replaceWith(wrapper);
        } catch {
          // Leave as code block if mermaid fails
        }
      }
    };

    renderMermaid();
  }, [html]);

  return (
    <div
      ref={containerRef}
      className="markdown-preview"
      dangerouslySetInnerHTML={{ __html: html }}
      style={{
        fontFamily: "var(--font-family-editor)",
        fontSize: "var(--font-size-editor)",
      }}
    />
  );
}

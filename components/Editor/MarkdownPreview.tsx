"use client";

import { useEffect, useRef, useState } from "react";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";
import type { Settings } from "@/lib/settings";

interface MarkdownPreviewProps {
  content: string;
  settings: Settings;
}

export default function MarkdownPreview({ content, settings }: MarkdownPreviewProps) {
  const [html, setHtml] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const mermaidRef = useRef<typeof import("mermaid") | null>(null);

  const isDark = settings.theme === "dark" ||
    (settings.theme === "system" && typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

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

  // Syntax highlight code blocks + render Mermaid diagrams after HTML update
  useEffect(() => {
    if (!containerRef.current || !html) return;

    // Syntax highlight non-mermaid code blocks
    const codeBlocks = containerRef.current.querySelectorAll("pre code:not(.language-mermaid)");
    codeBlocks.forEach((block) => {
      hljs.highlightElement(block as HTMLElement);
    });

    const renderMermaid = async () => {
      if (!mermaidRef.current) {
        const mermaid = await import("mermaid");
        mermaidRef.current = mermaid;
      }
      mermaidRef.current!.default.initialize({
        startOnLoad: false,
        theme: isDark ? "dark" : "default",
        securityLevel: "loose",
        flowchart: { htmlLabels: true, wrappingWidth: 200 },
        sequence: { wrap: true, width: 150 },
      });

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
  }, [html, isDark]);

  return (
    <div
      ref={containerRef}
      className="markdown-preview prose dark:prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
      style={{
        fontFamily: "var(--font-family-editor)",
        fontSize: "var(--font-size-editor)",
      }}
    />
  );
}

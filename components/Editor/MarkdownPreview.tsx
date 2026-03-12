"use client";

import { useEffect, useRef, useState } from "react";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";
import hljs from "highlight.js";
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

  // Set innerHTML manually (bypass React reconciliation so mermaid diagrams survive re-renders),
  // then syntax-highlight code blocks and render Mermaid diagrams.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !html) return;

    // Reset DOM only when html actually changes
    el.innerHTML = html;

    // Syntax highlight non-mermaid code blocks
    el.querySelectorAll("pre code:not(.language-mermaid)").forEach((block) => {
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
        flowchart: { htmlLabels: true },
        sequence: { wrap: true },
      });

      for (const block of el.querySelectorAll("code.language-mermaid")) {
        const code = block.textContent ?? "";
        const pre = block.parentElement;
        if (!pre) continue;
        try {
          const id = `mermaid-${Math.random().toString(36).slice(2)}`;
          const { svg } = await mermaidRef.current!.default.render(id, code);
          const responsive = svg
            .replace(/\sheight="[^"]*"/, "")
            .replace(/\swidth="[^"]+"/, ' width="100%"');
          const wrapper = document.createElement("div");
          wrapper.className = "mermaid";
          wrapper.innerHTML = responsive;
          pre.replaceWith(wrapper);

          // Mermaid hardcodes white-space:nowrap and sizes boxes for single-line text.
          // Post-process: allow wrapping, measure real height, expand rects to fit.
          const svgEl = wrapper.querySelector("svg");
          if (svgEl) {
            svgEl.querySelectorAll<Element>("foreignObject").forEach((fo) => {
              const div = fo.querySelector<HTMLElement>("div");
              if (!div) return;

              div.style.whiteSpace = "normal";
              div.style.wordBreak = "break-word";

              const naturalH = div.scrollHeight;
              const currentH = parseFloat(fo.getAttribute("height") || "0");
              if (naturalH <= currentH + 2) return;

              const extra = naturalH - currentH;
              fo.setAttribute("height", String(naturalH));
              fo.setAttribute("y", String(parseFloat(fo.getAttribute("y") || "0") - extra / 2));

              const node = fo.closest(".node");
              const rect = node?.querySelector<Element>("rect");
              if (rect) {
                rect.setAttribute("height", String(parseFloat(rect.getAttribute("height") || "0") + extra));
                rect.setAttribute("y", String(parseFloat(rect.getAttribute("y") || "0") - extra / 2));
              }
            });

            // Recalculate viewBox to fit all (possibly taller) nodes
            const s = svgEl as SVGSVGElement;
            if (s.getBBox) {
              const b = s.getBBox();
              const pad = 12;
              s.setAttribute("viewBox", `${b.x - pad} ${b.y - pad} ${b.width + pad * 2} ${b.height + pad * 2}`);
            }
          }
        } catch {
          // leave as code block if mermaid fails
        }
      }
    };

    renderMermaid();
  }, [html, isDark]);

  return (
    <div
      ref={containerRef}
      className="markdown-preview prose dark:prose-invert max-w-none"
      style={{
        fontFamily: "var(--font-family-editor)",
        fontSize: "var(--font-size-editor)",
      }}
    />
  );
}

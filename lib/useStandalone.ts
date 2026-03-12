"use client";
import { useState, useEffect } from "react";

export function useStandalone(): boolean | null {
  const [isStandalone, setIsStandalone] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(display-mode: standalone)");
    // iOS Safari uses navigator.standalone
    const iosSafari = (navigator as Navigator & { standalone?: boolean }).standalone === true;
    setIsStandalone(mq.matches || iosSafari);

    const handler = (e: MediaQueryListEvent) => setIsStandalone(e.matches || iosSafari);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return isStandalone;
}

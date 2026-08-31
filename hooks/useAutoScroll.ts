"use client";

import { useCallback, useEffect, useRef } from "react";

export function useAutoScroll<T>(dep: T) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom whenever dep changes (new message, content update, typing state)
  useEffect(() => {
    if (!containerRef.current) return;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!containerRef.current) return;
        containerRef.current.scrollTo({
          top: containerRef.current.scrollHeight,
          behavior: "smooth",
        });
      });
    });
  }, [dep]);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!containerRef.current) return;
        containerRef.current.scrollTo({
          top: containerRef.current.scrollHeight,
          behavior: "smooth",
        });
      });
    });
  }, []);

  return { containerRef, scrollToBottom };
}

"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

export type PhaseView = "room" | "commons";

interface Segment {
  id: PhaseView;
  label: string;
  /** Disabled segments still render — they show where you can't go yet. */
  disabled?: boolean;
  tooltip?: string;
}

/**
 * Two-segment control with a thumb that slides between segments.
 * Segment widths differ, so the thumb is measured rather than fixed —
 * it re-measures on resize and whenever the labels change.
 */
export default function PhaseSwitch({
  segments,
  value,
  onChange,
}: {
  segments: Segment[];
  value: PhaseView;
  onChange: (v: PhaseView) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [thumb, setThumb] = useState<{ x: number; w: number } | null>(null);

  const measure = useCallback(() => {
    const track = trackRef.current;
    const active = itemRefs.current[value];
    if (!track || !active) return;
    const t = track.getBoundingClientRect();
    const a = active.getBoundingClientRect();
    setThumb({ x: a.left - t.left, w: a.width });
  }, [value]);

  useLayoutEffect(measure, [measure, segments]);

  useEffect(() => {
    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    // Fonts landing late shifts label widths — re-measure once they're in
    document.fonts?.ready.then(measure).catch(() => {});
    return () => window.removeEventListener("resize", onResize);
  }, [measure]);

  return (
    <div ref={trackRef} className="phase-switch" role="tablist">
      {thumb && (
        <span
          aria-hidden="true"
          className="phase-switch-thumb"
          style={{ transform: `translateX(${thumb.x}px)`, width: thumb.w }}
        />
      )}
      {segments.map((seg) => {
        const active = seg.id === value;
        const button = (
          <button
            key={seg.id}
            ref={(el) => {
              itemRefs.current[seg.id] = el;
            }}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={seg.disabled}
            onClick={() => !seg.disabled && onChange(seg.id)}
            className="phase-switch-item"
            data-active={active}
          >
            <span className="min-w-0 truncate">{seg.label}</span>
          </button>
        );
        return button;
      })}
    </div>
  );
}

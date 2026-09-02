"use client";

import { useState } from "react";

/**
 * Hover/focus tooltip. Timing and geometry match iamnoman.com/shop:
 * dark chip below the trigger, 150ms cubic-bezier(0.23, 1, 0.32, 1).
 */
export default function Tooltip({
  label,
  children,
  className,
  align = "center",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
  /** Anchor to an edge when the trigger sits against one, so it can't clip */
  align?: "start" | "center" | "end";
}) {
  const [open, setOpen] = useState(false);

  return (
    <span
      className={`relative inline-flex ${className ?? ""}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocusCapture={() => setOpen(true)}
      onBlurCapture={() => setOpen(false)}
    >
      {children}
      <span role="tooltip" aria-hidden={!open} className="ui-tooltip" data-open={open} data-align={align}>
        {label}
      </span>
    </span>
  );
}

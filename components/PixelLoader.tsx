"use client";

import { useEffect } from "react";

import AshWordmark from "./AshWordmark";

/**
 * Pixel-mosaic loader, in the brand yellow.
 *
 * Two shapes, one vocabulary — square tiles popping on and off in scattered
 * order, never fading, so the grid edge always stays crisp:
 *
 *   <PixelCurtain />  full-screen, covers then dissolves away. For moments
 *                     that actually end: the first paint of a page.
 *   <PixelMosaic />   a small block that keeps shimmering. For open-ended
 *                     waits, where a curtain would have to sit there forever.
 *
 * Two things worth knowing about how this is built:
 *
 * 1. The scatter is *deterministic*, hashed from the tile index rather than
 *    drawn from Math.random(). Random values during render are impure and
 *    would also mismatch between the server and client renders.
 * 2. The grid sizes itself with CSS `auto-fill`, so there is no measuring and
 *    no resize listener. We render enough tiles to cover a very large screen
 *    and let the extras overflow behind `overflow: hidden`.
 */

/** Deterministic pseudo-random in [0, 1) from an integer. */
function scatter(i: number) {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/** Enough tiles to cover a large viewport at the CSS tile size, and no more.
 *  This number is a performance ceiling, not a guess: an earlier pass rendered
 *  1200 animating elements and starved the main thread badly enough that the
 *  animations never ran and the unmount timer drifted by seconds. */
const CURTAIN_TILES = 520;
/** How long the dissolve takes to sweep the screen, plus one tile's pop. */
const SWEEP = 780;
const POP = 190;
/** The branded hold before the dissolve: flat yellow with the wordmark. */
const HOLD = 950;
/** The mark clears just before the tiles start going. */
const MARK_OUT = 240;

export function PixelCurtain({
  onDone,
  /** Opens on a flat yellow card with the wordmark before dissolving. Used for
   *  the first paint; mid-session transitions dissolve straight away. */
  brand = false,
}: {
  onDone?: () => void;
  brand?: boolean;
}) {
  const hold = brand ? HOLD : 0;

  useEffect(() => {
    const t = setTimeout(() => onDone?.(), hold + SWEEP + POP + 60);
    return () => clearTimeout(t);
  }, [onDone, hold]);

  return (
    <div className="pixel-curtain" aria-hidden="true">
      {Array.from({ length: CURTAIN_TILES }, (_, i) => (
        <span
          key={i}
          className="pixel-tile pixel-tile--out"
          style={{ animationDelay: `${(hold + scatter(i) * SWEEP).toFixed(0)}ms` }}
        />
      ))}
      {brand ? (
        <div
          className="pixel-curtain-mark"
          style={{ animationDelay: `${hold - MARK_OUT}ms` }}
        >
          <AshWordmark className="h-[clamp(52px,9vw,116px)] w-auto text-[var(--ink)]" />
        </div>
      ) : null}
    </div>
  );
}

export function PixelMosaic({ cols = 7, rows = 7 }: { cols?: number; rows?: number }) {
  const count = cols * rows;

  return (
    <div
      className="pixel-mosaic"
      role="status"
      aria-label="Loading"
      style={{
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
      }}
    >
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className="pixel-tile pixel-tile--flicker"
          style={{ animationDelay: `${(scatter(i) * 1200).toFixed(0)}ms` }}
        />
      ))}
    </div>
  );
}

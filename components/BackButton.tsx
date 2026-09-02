"use client";

/** Square hairline back control, shared by the flow screens. */
export default function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Go back"
      className="flex h-11 w-11 items-center justify-center border border-[var(--hairline)] text-[var(--ink)] transition-colors duration-500 hover:bg-[var(--ink)] hover:text-[var(--birch)]"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" className="icon" aria-hidden="true">
        <path d="M19 12H5M11 18l-6-6 6-6" />
      </svg>
    </button>
  );
}


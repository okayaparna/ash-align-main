"use client";

import { ChatDashedIcon, CheckIcon, MarkChatReadIcon } from "./icons/MaterialIcons";
import Tooltip from "./Tooltip";

/**
 * Colour-coded participant. Pink is you, lavender is your partner.
 *
 * Two shapes for two widths, matching the design:
 *  - lg and up: a pill with a status icon and the name
 *  - below lg: a 40px circle carrying the initial, turning into a check
 *    once they're done. The header overlaps these slightly.
 */
export default function ParticipantChip({
  name,
  self,
  done,
  connected = true,
  tooltip,
  align = "center",
  className,
}: {
  name: string;
  self: boolean;
  done: boolean;
  connected?: boolean;
  tooltip: string;
  align?: "start" | "center" | "end";
  className?: string;
}) {
  const tone = self ? "chip-self" : "chip-partner";
  const initial = name.trim().charAt(0).toUpperCase();

  return (
    <Tooltip label={tooltip} align={align} className={className}>
      {/* Compact circle */}
      <span
        className={`chip-avatar ${tone} lg:hidden`}
        data-absent={!connected}
        aria-label={name}
      >
        {done ? <CheckIcon size={20} /> : initial}
      </span>

      {/* Full pill */}
      <span
        className={`chip ${tone} hidden lg:inline-flex`}
        data-absent={!connected}
      >
        {done ? <MarkChatReadIcon size={18} /> : <ChatDashedIcon size={18} />}
        <span className="chip-label">{name}</span>
      </span>
    </Tooltip>
  );
}

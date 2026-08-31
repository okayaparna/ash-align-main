"use client";

import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";

import type { ChatMessage, ParticipantRole, RoomPhase } from "@/lib/types";

interface MessageBubbleProps {
  message: ChatMessage;
  showAuthor?: boolean;
  participantRole?: ParticipantRole;
  phase?: RoomPhase;
}

/** Split text on double-newlines into non-empty paragraphs */
function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function MessageBubble({
  message,
  showAuthor,
  participantRole,
  phase,
}: MessageBubbleProps) {
  const isAssistant = message.role === "assistant";
  const isMine = message.role === participantRole;
  const isCommons = phase === "commons";

  const mdComponents = {
    p: ({ children }: { children?: React.ReactNode }) => (
      <p className="m-0">{children}</p>
    ),
  };

  // Assistant (Ash) messages — split into multiple bubbles
  if (isAssistant) {
    const paragraphs = splitParagraphs(message.text);

    if (isCommons) {
      return (
        <div className="flex flex-col items-start gap-2 pl-4 pr-16">
          {showAuthor && (
            <p className="ml-4 text-xs font-medium uppercase leading-[1.2] tracking-[1.25px] text-[var(--damson-500)]">
              Ash
            </p>
          )}
          {paragraphs.map((para, i) => (
            <div
              key={`${message.id}-${i}`}
              className="rounded-[var(--radius-md)] bg-[var(--damson-200)] p-4"
            >
              <div className="text-base leading-[1.5] text-[var(--damson-800)]">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkBreaks]}
                  components={mdComponents}
                >
                  {para}
                </ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
      );
    }

    // Private room (intake) — no colored bubble, just text blocks
    return (
      <div className="flex flex-col items-start gap-4 px-4">
        {paragraphs.map((para, i) => (
          <div
            key={`${message.id}-${i}`}
            className="text-base leading-[1.5] text-[var(--contrast-strong)]"
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkBreaks]}
              components={mdComponents}
            >
              {para}
            </ReactMarkdown>
          </div>
        ))}
      </div>
    );
  }

  // Determine name color for commons: partner_a = apricot, partner_b = plum
  const nameColor =
    message.role === "partner_a"
      ? "#8e521f"
      : message.role === "partner_b"
        ? "#a66c94"
        : undefined;

  // Current user's own messages — right-aligned, elevated bg
  if (isMine) {
    return (
      <div className="flex flex-col items-end gap-2 pl-20 pr-4">
        {isCommons && showAuthor && message.author_name && (
          <p
            className="mr-4 text-xs font-medium uppercase leading-[1.2] tracking-[1.25px]"
            style={{ color: nameColor }}
          >
            {message.author_name}
          </p>
        )}
        <div className="rounded-[var(--radius-lg)] bg-[var(--surface-elevated)] p-4">
          <div className="text-base leading-[1.5] text-[var(--contrast-strong)]">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkBreaks]}
              components={mdComponents}
            >
              {message.text}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    );
  }

  // Other participant's messages — left-aligned, elevated bg, with label
  return (
    <div className="flex flex-col items-start gap-2 pl-4 pr-20">
      {showAuthor && message.author_name && (
        <p
          className="ml-4 text-xs font-medium uppercase leading-[1.2] tracking-[1.25px]"
          style={{ color: nameColor || "var(--contrast-subtle)" }}
        >
          {message.author_name}
        </p>
      )}
      <div className="rounded-[var(--radius-md)] bg-[var(--surface-elevated)] p-4">
        <div className="text-base leading-[1.5] text-[var(--contrast-strong)]">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkBreaks]}
            components={mdComponents}
          >
            {message.text}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

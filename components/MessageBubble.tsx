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

const AUTHOR_LABEL =
  "text-[11px] font-medium uppercase leading-[14px] tracking-[0.06em] text-muted-foreground";

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

  const md = (text: string) => (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkBreaks]}
      components={mdComponents}
    >
      {text}
    </ReactMarkdown>
  );

  // Ash — no bubble in any phase, just text blocks in the reading column
  if (isAssistant) {
    const paragraphs = splitParagraphs(message.text);

    return (
      <div className="flex flex-col items-start gap-3">
        {isCommons && showAuthor && <p className={AUTHOR_LABEL}>Ash</p>}
        {paragraphs.map((para, i) => (
          <div
            key={`${message.id}-${i}`}
            className="msg-text text-foreground"
          >
            {md(para)}
          </div>
        ))}
      </div>
    );
  }

  // Current participant — right-aligned bubble, tail on the bottom right
  if (isMine) {
    return (
      <div className="flex flex-col items-end gap-1.5">
        {isCommons && showAuthor && message.author_name && (
          <p className={AUTHOR_LABEL}>{message.author_name}</p>
        )}
        <div className="msg-bubble msg-bubble-mine">{md(message.text)}</div>
      </div>
    );
  }

  // Partner — same bubble, mirrored: left-aligned, tail on the bottom left
  return (
    <div className="flex flex-col items-start gap-1.5">
      {showAuthor && message.author_name && (
        <p className={AUTHOR_LABEL}>{message.author_name}</p>
      )}
      <div className="msg-bubble msg-bubble-theirs">{md(message.text)}</div>
    </div>
  );
}

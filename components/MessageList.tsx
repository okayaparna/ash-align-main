"use client";

import type { ReactNode, RefObject } from "react";

import type { ChatMessage, ParticipantRole, RoomPhase } from "@/lib/types";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

interface MessageListProps {
  messages: ChatMessage[];
  typing: boolean;
  containerRef: RefObject<HTMLDivElement | null>;
  showAuthorLabels?: boolean;
  participantRole?: ParticipantRole;
  phase?: RoomPhase;
  footer?: ReactNode;
}

export default function MessageList({
  messages,
  typing,
  containerRef,
  showAuthorLabels = false,
  participantRole,
  phase,
  footer,
}: MessageListProps) {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <div ref={containerRef} className="flex-1 overflow-y-auto px-0 pt-6 pb-0">
        <div className="mx-auto flex max-w-[600px] flex-col gap-6 pb-6">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              showAuthor={showAuthorLabels}
              participantRole={participantRole}
              phase={phase}
            />
          ))}
          {footer}
          {typing ? (
            <div className="flex justify-start px-4 py-2">
              <TypingIndicator />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

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
      <div ref={containerRef} className="flex flex-1 flex-col overflow-y-auto px-0 pt-6 pb-0">
        <div className="mx-auto mt-auto flex w-full max-w-[610px] flex-col gap-8 px-5 pb-4">
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
            <div className="flex justify-start py-1">
              <TypingIndicator />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

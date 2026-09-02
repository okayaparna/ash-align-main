"use client";

import { FormEvent, KeyboardEvent, useCallback, useRef, useState } from "react";

import { ArrowUpwardIcon } from "./icons/MaterialIcons";

interface ChatInputProps {
  disabled?: boolean;
  placeholder?: string;
  phase?: "intake" | "commons" | "conclusion" | "ended";
  onSend: (content: string) => Promise<void> | void;
}

export default function ChatInput({ disabled, placeholder, onSend }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  const handleSubmit = async (event?: FormEvent) => {
    event?.preventDefault();
    const content = value.trim();
    if (!content || disabled) return;

    setValue("");
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    });
    await onSend(content);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  const canSubmit = !disabled && !!value.trim();

  return (
    <form onSubmit={handleSubmit} className="px-5 pb-8 pt-2">
      <div
        className="mx-auto flex min-h-[62px] w-full max-w-[610px] cursor-text items-center gap-2 rounded-full bg-[var(--bubble)] py-[7px] pl-6 pr-[7px]"
        onClick={() => textareaRef.current?.focus()}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            resize();
          }}
          onKeyDown={handleKeyDown}
          // No placeholder copy while the composer is closed — the status line above says why
          placeholder={disabled ? "" : placeholder || "Text input"}
          disabled={disabled}
          rows={1}
          className="msg-text flex-1 resize-none self-center bg-transparent py-2 text-[var(--chip-foreground)] outline-none placeholder:text-[var(--switch-inactive)] disabled:cursor-not-allowed"
          style={{ maxHeight: "140px", overflowY: "auto" }}
        />
        <button
          type="submit"
          disabled={!canSubmit}
          aria-label="Send message"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--action)] text-[var(--action-foreground)] transition-[background-color,color,opacity] duration-150 hover:opacity-88 disabled:bg-[#e0e0e0] disabled:text-[#a8a8a8]"
        >
          <ArrowUpwardIcon size={22} />
        </button>
      </div>
    </form>
  );
}

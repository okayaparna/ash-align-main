"use client";

import { use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import { useAutoScroll } from "@/hooks/useAutoScroll";
import { useSession } from "@/hooks/useSession";
import type { ChatMessage, RoomPhase, RoomState } from "@/lib/types";

import ChatInput from "@/components/ChatInput";
import FinishedScreen from "@/components/FinishedScreen";
import MessageList from "@/components/MessageList";
import SurveyScreen from "@/components/SurveyScreen";
import { PRE_SURVEY_ID, PRE_SURVEY_QUESTIONS, PRE_SURVEY_QUESTIONS_B, isSurveyTestVariant } from "@/lib/surveys";

type ViewState = "splash" | "name" | "survey-intro" | "survey" | "joining" | "chat" | "error";

const FONT_STYLE = { fontFamily: '"Libre Baskerville", serif', fontStyle: 'italic' as const };

function SplashScreen({ onBegin }: { onBegin: () => void }) {
  const [showAlign, setShowAlign] = useState(false);
  const [showWith, setShowWith] = useState(false);
  const [showAsh, setShowAsh] = useState(false);
  const [phase, setPhase] = useState<"big" | "small">("big");
  const [consentChecked, setConsentChecked] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowAlign(true), 200);
    const t2 = setTimeout(() => setShowWith(true), 700);
    const t3 = setTimeout(() => setShowAsh(true), 1200);
    const t4 = setTimeout(() => setPhase("small"), 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  const wordTransition = "all 1.2s cubic-bezier(0.4, 0, 0.2, 1)";

  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-[var(--surface-bg)]">
      <div
        className="z-10 flex flex-col items-center"
        style={{
          transition: "transform 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: phase === "small" ? "translateY(-20px)" : "translateY(0)",
        }}
      >
        <div
          className="relative flex items-baseline justify-center"
          style={{
            transition: "all 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
            gap: phase === "big" ? "0px" : "clamp(8px, 2vw, 14px)",
          }}
        >
          <span
            className="text-[var(--wood-700)]"
            style={{
              ...FONT_STYLE,
              transition: wordTransition,
              fontSize: phase === "big" ? "clamp(72px, 18vw, 160px)" : "clamp(48px, 10vw, 72px)",
              lineHeight: 1,
              letterSpacing: phase === "big" ? "-5px" : "-3px",
              transform: phase === "big" ? "translateX(clamp(-30px, -5vw, -60px)) translateY(clamp(-25px, -5vw, -50px))" : "translateX(0) translateY(0)",
              opacity: showAlign ? 1 : 0,
            }}
          >
            Align
          </span>
          <span
            className="text-[var(--wood-700)]"
            style={{
              ...FONT_STYLE,
              transition: wordTransition,
              fontSize: phase === "big" ? "clamp(36px, 9vw, 80px)" : "clamp(28px, 6vw, 40px)",
              lineHeight: 1,
              letterSpacing: "-2px",
              transform: phase === "big" ? "translateX(0px) translateY(clamp(8px, 2vw, 15px))" : "translateX(0) translateY(0)",
              opacity: showWith ? 1 : 0,
            }}
          >
            with
          </span>
          <span
            className="text-[var(--wood-700)]"
            style={{
              ...FONT_STYLE,
              transition: wordTransition,
              fontSize: phase === "big" ? "clamp(64px, 16vw, 140px)" : "clamp(48px, 10vw, 72px)",
              lineHeight: 1,
              letterSpacing: phase === "big" ? "-4px" : "-3px",
              transform: phase === "big" ? "translateX(clamp(30px, 5vw, 60px)) translateY(clamp(40px, 8vw, 80px))" : "translateX(0) translateY(0)",
              opacity: showAsh ? 1 : 0,
            }}
          >
            Ash
          </span>
        </div>
      </div>

      <div
        className="z-10 mx-auto mt-8 flex w-full max-w-[465px] flex-col items-center gap-8 px-6 text-center"
        style={{
          transition: "opacity 0.8s ease-in-out 0.4s",
          opacity: phase === "small" ? 1 : 0,
          pointerEvents: phase === "small" ? "auto" : "none",
        }}
      >
        <p className="max-w-[320px] text-sm leading-[1.5] text-[var(--contrast-weak)]">
          You&apos;ve been invited to try a new tool for relationships. This is a demo and everything you share here disappears when you&apos;re done.
        </p>
        <label className="flex cursor-pointer items-start gap-3 text-left">
          <input
            type="checkbox"
            checked={consentChecked}
            onChange={(e) => setConsentChecked(e.target.checked)}
            className="mt-0.5 h-[17px] w-[17px] shrink-0 cursor-pointer rounded-[4px] border-[#464543] accent-[#8e521f]"
          />
          <span className="font-body text-[12px] font-normal leading-[1.5] text-[var(--contrast-weak)]">
            I am 18 or older, and I agree to the{" "}
            <a
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold underline text-[var(--contrast-strong)]"
              onClick={(e) => e.stopPropagation()}
            >
              Terms of Use
            </a>
          </span>
        </label>
        <button
          onClick={onBegin}
          disabled={!consentChecked}
          className="flex h-[64px] w-full items-center justify-center rounded-[16px] bg-[#8e521f] font-body text-[18px] font-medium leading-[1.2] tracking-[-0.25px] text-[#f1d5be] disabled:opacity-40"
        >
          Begin
        </button>
      </div>
    </div>
  );
}

// --- Icons ---
function ChatCenteredDotsIcon({ color = "var(--contrast-subtle)" }: { color?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="7.5" r="0.625" fill={color} />
      <circle cx="5.25" cy="7.5" r="0.625" fill={color} />
      <circle cx="10.75" cy="7.5" r="0.625" fill={color} />
      <path d="M6.567 12L7.567 13.75C7.654 13.902 7.82 14 8 14C8.18 14 8.346 13.902 8.436 13.75L9.436 12H13.5C13.776 12 14 11.776 14 11.5V3.5C14 3.224 13.776 3 13.5 3H2.5C2.224 3 2 3.224 2 3.5V11.5C2 11.776 2.224 12 2.5 12H6.567Z" stroke={color} strokeWidth="0.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckCircleIcon({ color = "var(--olive-600)" }: { color?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" stroke={color} strokeWidth="1.5" />
      <path d="M5 8L7 10L11 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WifiSlashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 14L14 2" stroke="var(--contrast-weak)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M4 10C5.1 8.9 6.5 8.3 8 8.3" stroke="var(--contrast-weak)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M2 7.5C3.7 5.8 5.8 4.8 8 4.8S12.3 5.8 14 7.5" stroke="var(--contrast-weak)" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="8" cy="12" r="1" fill="var(--contrast-weak)" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M11.045 5.053L11.905 4.194C12.602 3.497 13.533 3.127 14.48 3.127C15.428 3.127 16.359 3.497 17.056 4.194C17.753 4.891 18.123 5.822 18.123 6.77C18.123 7.717 17.753 8.648 17.056 9.345L14.344 12.058C13.647 12.755 12.716 13.125 11.765 13.125C10.813 13.125 9.882 12.755 9.187 12.054C8.838 11.704 8.563 11.286 8.38 10.827C8.197 10.367 8.11 9.874 8.125 9.38" stroke="var(--contrast-weak)" strokeWidth="0.94" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.955 14.947L8.095 15.806C7.398 16.503 6.467 16.873 5.517 16.873C4.566 16.873 3.635 16.503 2.939 15.802C2.258 15.119 1.876 14.193 1.877 13.228C1.878 12.262 2.261 11.337 2.944 10.655L5.656 7.942C6.353 7.245 7.284 6.875 8.232 6.875C9.18 6.875 10.111 7.245 10.808 7.942C11.159 8.292 11.435 8.71 11.619 9.171C11.802 9.631 11.89 10.125 11.875 10.62" stroke="var(--contrast-weak)" strokeWidth="0.94" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// --- Toast ---
function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <div
      className={`pointer-events-none fixed left-1/2 top-[128px] z-50 -translate-x-1/2 rounded-[var(--radius-pill)] bg-[var(--wood-600)] px-4 py-2.5 text-sm font-semibold tracking-[-0.25px] text-[var(--wood-50)] transition-all duration-300 ${visible ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"}`}
    >
      {message}
    </div>
  );
}

// --- Participant Status ---
function ParticipantStatus({
  name,
  ready,
  connected,
  phase,
  wrapUp,
}: {
  name: string;
  ready: boolean;
  connected: boolean;
  phase: RoomPhase;
  wrapUp?: boolean;
}) {
  // Determine icon and name color based on phase
  let icon: React.ReactNode;
  let nameColor = "text-[var(--contrast-subtle)]";

  if (phase === "commons") {
    if (wrapUp) {
      icon = <CheckCircleIcon color="var(--damson-600)" />;
      nameColor = "text-[var(--damson-600)]";
    } else {
      icon = <ChatCenteredDotsIcon />;
    }
  } else {
    // intake phase
    if (ready) {
      icon = <CheckCircleIcon color="var(--wood-500)" />;
      nameColor = "text-[var(--wood-500)]";
    } else if (!connected) {
      icon = <WifiSlashIcon />;
    } else {
      icon = <ChatCenteredDotsIcon />;
    }
  }

  return (
    <div className="flex items-center gap-0.5">
      {icon}
      <span className={`text-xs ${nameColor}`}>{name}</span>
    </div>
  );
}

// --- Top Bar ---
function TopBar({
  roomState,
  messages,
  onReady,
  readyLoading,
  onWrapUp,
  wrapUpLoading,
  onCopyLink,
  onEndSession,
}: {
  roomState: RoomState;
  messages: ChatMessage[];
  onReady: () => void;
  readyLoading: boolean;
  onWrapUp: () => void;
  wrapUpLoading: boolean;
  onCopyLink: () => void;
  onEndSession: () => void;
}) {
  const headerRef = useRef<HTMLElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setHeaderHeight(el.getBoundingClientRect().height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const myReady =
    roomState.participantRole === "partner_a"
      ? roomState.partnerAReady
      : roomState.partnerBReady;

  const partnerName =
    roomState.participantRole === "partner_a"
      ? roomState.partnerBName
      : roomState.partnerAName;
  const partnerReady =
    roomState.participantRole === "partner_a"
      ? roomState.partnerBReady
      : roomState.partnerAReady;

  const myWrapUp =
    roomState.participantRole === "partner_a"
      ? roomState.partnerAWrapUp
      : roomState.partnerBWrapUp;

  const partnerWrapUp =
    roomState.participantRole === "partner_a"
      ? roomState.partnerBWrapUp
      : roomState.partnerAWrapUp;

  // Detect if Ash has flagged a safety concern (mentions the DV hotline)
  const safetyFlagged = messages.some(
    (m) => m.role === "assistant" && m.text.includes("1-800-799-7233")
  );

  const roomName =
    roomState.phase === "commons"
      ? "The Commons"
      : `${roomState.participantName}'s private room`;

  return (
    <>
      <header ref={headerRef} className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between border-b-2 border-[var(--surface-elevated)] bg-[var(--surface-bg)] px-4 pb-3 pt-14 lg:pt-4">
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={onCopyLink}
            className="flex items-center gap-1"
          >
            <h1 className="text-lg font-semibold leading-[1.2] tracking-[-0.1px] text-[var(--contrast-medium)]">
              {roomName}
            </h1>
            <LinkIcon />
          </button>
          <div className="flex items-center gap-3">
            <ParticipantStatus
              name={roomState.participantName}
              ready={myReady}
              connected={true}
              phase={roomState.phase}
              wrapUp={myWrapUp}
            />
            {partnerName ? (
              <ParticipantStatus
                name={partnerName}
                ready={partnerReady}
                connected={roomState.partnerConnected}
                phase={roomState.phase}
                wrapUp={partnerWrapUp}
              />
            ) : null}
          </div>
        </div>
        {roomState.phase === "intake" && !myReady && !safetyFlagged ? (
          <button
            onClick={onReady}
            disabled={readyLoading}
            className="flex items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--surface-elevated)] px-4 py-2.5 text-sm font-semibold leading-[1.2] tracking-[-0.25px] text-[var(--wood-700)] disabled:opacity-60"
          >
            {readyLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--wood-300)] border-t-[var(--wood-700)]" />
                Preparing...
              </>
            ) : (
              "I'm Ready"
            )}
          </button>
        ) : null}
        {roomState.phase === "intake" && safetyFlagged ? (
          <button
            onClick={onEndSession}
            className="flex items-center gap-2 rounded-[var(--radius-pill)] bg-[#c0392b]/10 px-4 py-2.5 text-sm font-semibold leading-[1.2] tracking-[-0.25px] text-[#c0392b]"
          >
            End Session
          </button>
        ) : null}
        {roomState.phase === "intake" && myReady ? (
          <div className="rounded-[var(--radius-pill)] bg-[var(--wood-600)] px-4 py-2.5 text-sm font-semibold leading-[1.2] tracking-[-0.25px] text-[var(--wood-50)]">
            I&apos;m Ready
          </div>
        ) : null}
        {roomState.phase === "commons" && !myWrapUp ? (
          <button
            onClick={onWrapUp}
            disabled={wrapUpLoading}
            className="flex items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--surface-elevated)] px-4 py-2.5 text-sm font-semibold leading-[1.2] tracking-[-0.25px] text-[var(--damson-700)] disabled:opacity-60"
          >
            {wrapUpLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--damson-200)] border-t-[var(--damson-700)]" />
                Wrapping up...
              </>
            ) : (
              "Wrap Up"
            )}
          </button>
        ) : null}
        {roomState.phase === "commons" && myWrapUp ? (
          <div className="rounded-[var(--radius-pill)] bg-[var(--damson-600)] px-4 py-2.5 text-sm font-semibold leading-[1.2] tracking-[-0.25px] text-[var(--wood-50)]">
            Wrap Up
          </div>
        ) : null}
      </header>
      {/* Spacer to offset fixed header */}
      <div style={{ height: headerHeight }} className="shrink-0" />
    </>
  );
}

function HandRaiseIcon({ color = "currentColor" }: { color?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M18 12.5V10C18 9.17 17.33 8.5 16.5 8.5C15.67 8.5 15 9.17 15 10V9.5C15 8.67 14.33 8 13.5 8C12.67 8 12 8.67 12 9.5V9C12 8.17 11.33 7.5 10.5 7.5C9.67 7.5 9 8.17 9 9V4.5C9 3.67 8.33 3 7.5 3C6.67 3 6 3.67 6 4.5V14.81L4.04 12.85C3.53 12.34 2.72 12.29 2.15 12.73C1.45 13.27 1.38 14.29 1.99 14.9L6.69 19.6C7.89 20.8 9.55 21.5 11.28 21.5H14.5C17.54 21.5 20 19.04 20 16V12.5C20 11.67 19.33 11 18.5 11C17.67 11 18 11.67 18 12.5Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StatusBottomBar({ message }: { message: string }) {
  return (
    <div className="border-t border-[var(--surface-elevated)] bg-[var(--surface-bg)] px-10 pb-12 pt-6 text-center lg:pb-6">
      <p className="text-base leading-[1.5] text-[var(--contrast-weak)]">{message}</p>
    </div>
  );
}

function WrapUpIcon({ color = "#A2A09A" }: { color?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0">
      <path d="M17.323 18.356l-.54-.54a.52.52 0 00-.422-.177.52.52 0 00-.422.177.52.52 0 00-.177.414c0 .158.059.297.177.415l.917.917a.57.57 0 00.472.206.57.57 0 00.472-.206l2.262-2.221a.52.52 0 00.181-.417.54.54 0 00-.181-.428.54.54 0 00-.427-.177.54.54 0 00-.427.177l-1.885 1.86zM7.135 8.865h9.73a.72.72 0 00.535-.215.72.72 0 00.215-.535.72.72 0 00-.215-.54.72.72 0 00-.535-.21h-9.73a.72.72 0 00-.535.215.72.72 0 00-.215.535c0 .213.071.391.215.535a.72.72 0 00.535.215zM18 22.558a4.53 4.53 0 01-3.187-1.314 4.53 4.53 0 01-1.313-3.186c0-1.249.438-2.311 1.313-3.187A4.53 4.53 0 0118 13.558c1.249 0 2.311.438 3.187 1.313a4.53 4.53 0 011.313 3.187 4.53 4.53 0 01-1.313 3.186A4.53 4.53 0 0118 22.558zM3.5 5.308c0-.499.177-.925.53-1.278A1.74 1.74 0 015.308 3.5h13.384c.499 0 .925.177 1.278.53.353.353.53.779.53 1.278v5.346a.72.72 0 01-.216.535.72.72 0 01-.534.215.72.72 0 01-.535-.215.72.72 0 01-.215-.535V5.308a.3.3 0 00-.096-.212.3.3 0 00-.212-.096H5.308a.3.3 0 00-.212.096.3.3 0 00-.096.212V19.05h6.21c.027.192.064.385.112.577.047.192.103.379.167.562.064.151.032.273-.095.365-.127.093-.248.088-.362-.013l-.162-.123a.47.47 0 00-.292-.112.47.47 0 00-.292.112l-.839.704a.42.42 0 01-.292.112.42.42 0 01-.293-.112l-.838-.704a.47.47 0 00-.293-.112.47.47 0 00-.292.112l-.839.704a.42.42 0 01-.292.112.42.42 0 01-.293-.112l-.838-.704a.47.47 0 00-.293-.112.47.47 0 00-.292.112L3.5 21.394V5.308zM7.135 16.635h3.625a.72.72 0 00.534-.215.72.72 0 00.216-.535.72.72 0 00-.216-.535.72.72 0 00-.534-.215H7.135a.72.72 0 00-.535.216.72.72 0 00-.215.534c0 .213.072.391.215.535a.72.72 0 00.535.215zm0-3.885h6.877a.72.72 0 00.534-.215.72.72 0 00.216-.535.72.72 0 00-.216-.535.72.72 0 00-.534-.215H7.135a.72.72 0 00-.535.216.72.72 0 00-.215.534c0 .213.072.391.215.535a.72.72 0 00.535.215z" fill={color} />
    </svg>
  );
}

function WrapUpNotice({
  partnerName,
  myWrapUp,
  partnerWrapUp,
}: {
  partnerName: string;
  myWrapUp: boolean;
  partnerWrapUp: boolean;
}) {
  const bothWrapUp = myWrapUp && partnerWrapUp;
  const onlyPartner = partnerWrapUp && !myWrapUp;
  const onlyMe = myWrapUp && !partnerWrapUp;

  return (
    <div className="flex flex-col gap-4 px-6">
      {onlyPartner && (
        <div className="flex items-start gap-2">
          <WrapUpIcon color="#A2A09A" />
          <p className="text-sm leading-[1.5] text-[var(--contrast-weak)]">
            {partnerName} has indicated that they are ready to{" "}
            <span className="font-bold">wrap up</span> this conversation. When
            you&apos;re ready to end, you can also{" "}
            <span className="font-bold">wrap up</span> to receive a conclusion.
          </p>
        </div>
      )}
      {onlyMe && (
        <div className="flex items-start gap-2">
          <WrapUpIcon color="#A2A09A" />
          <p className="text-sm leading-[1.5] text-[var(--contrast-weak)]">
            You have indicated that you are ready to{" "}
            <span className="font-bold">wrap up</span>. Waiting for{" "}
            {partnerName} to also wrap up to receive a conclusion.
          </p>
        </div>
      )}
      {bothWrapUp && (
        <div className="flex items-start gap-2">
          <WrapUpIcon color="var(--damson-500)" />
          <p className="text-sm leading-[1.5] text-[var(--damson-500)]">
            Both parties are ready to wrap up. Synthesizing this chat into a
            conclusion
          </p>
        </div>
      )}
    </div>
  );
}

export default function RoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = use(params);
  const searchParams = useSearchParams();
  const isCreator = searchParams.get("creator") === "1";
  const urlName = searchParams.get("name");

  const {
    state: sessionState,
    roomState,
    messages,
    typing,
    error,
    canSend,
    readyLoading,
    wrapUpLoading,
    handRaiseLoading,
    join,
    send,
    ready,
    wrapUp,
    raiseHand,
    endSession,
  } = useSession(roomId);
  const [view, setViewRaw] = useState<ViewState>(
    isCreator ? "joining" : "splash"
  );
  const [transitioning, setTransitioning] = useState(false);
  const [name, setName] = useState("");
  const [creatorName, setCreatorName] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);

  const setView = useCallback((next: ViewState) => {
    if (next === "joining" || next === "chat" || next === "error") {
      setViewRaw(next);
      return;
    }
    setTransitioning(true);
    setTimeout(() => {
      setViewRaw(next);
      setTransitioning(false);
    }, 250);
  }, []);
  const lastMsg = messages[messages.length - 1];
  const { containerRef, scrollToBottom } = useAutoScroll(
    `${messages.length}-${typing ? 1 : 0}-${lastMsg?.text?.length ?? 0}`
  );
  const joinAttempted = useRef(false);
  const [transitionMsgIndex, setTransitionMsgIndex] = useState(0);

  const copyRoomLink = useCallback(async () => {
    const url = `${window.location.origin}/room/${roomId}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Fallback: ignore
    }
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  }, [roomId]);

  // Fetch room info for joiner to show creator name
  useEffect(() => {
    if (isCreator) return;
    fetch(`/api/room/info?roomId=${roomId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.creatorName) setCreatorName(data.creatorName);
      })
      .catch(() => {});
  }, [roomId, isCreator]);

  // Auto-join for creators who come from the home page with name in URL
  useEffect(() => {
    if (isCreator && urlName && !joinAttempted.current) {
      joinAttempted.current = true;
      join(urlName);
    }
  }, [isCreator, urlName, join]);

  // Sync view state with session state
  useEffect(() => {
    if (sessionState === "active" && roomState) {
      setViewRaw("chat");
    } else if (sessionState === "error") {
      setViewRaw("error");
    }
  }, [sessionState, roomState]);

  // Rotate transition messages when entering commons or both ready
  useEffect(() => {
    const isTransitioning =
      (roomState?.phase === "commons" && messages.length === 0) ||
      (roomState?.phase === "intake" && roomState?.partnerAReady && roomState?.partnerBReady) ||
      (roomState?.phase === "commons" && roomState?.partnerAWrapUp && roomState?.partnerBWrapUp);
    if (!isTransitioning) return;
    const interval = setInterval(() => {
      setTransitionMsgIndex((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, [roomState?.phase, roomState?.partnerAReady, roomState?.partnerBReady, roomState?.partnerAWrapUp, roomState?.partnerBWrapUp, messages.length]);

  const placeholder = useMemo(() => {
    if (!roomState) return "Type a message";
    if (roomState.phase === "commons") {
      if (roomState.activeSpeaker === "either")
        return "Share what's on your mind";
      if (
        roomState.activeSpeaker &&
        roomState.activeSpeaker !== roomState.participantRole
      ) {
        return "Ash invited your partner to speak next";
      }
      return "Respond to Ash";
    }
    if (!roomState.canSend) return "Waiting for your partner...";
    return "Type a message";
  }, [roomState]);

  const myReady = useMemo(() => {
    if (!roomState || roomState.phase !== "intake") return false;
    return roomState.participantRole === "partner_a"
      ? roomState.partnerAReady
      : roomState.partnerBReady;
  }, [roomState]);

  const partnerName = useMemo(() => {
    if (!roomState) return null;
    return roomState.participantRole === "partner_a"
      ? roomState.partnerBName
      : roomState.partnerAName;
  }, [roomState]);

  const myWrapUp = useMemo(() => {
    if (!roomState || roomState.phase !== "commons") return false;
    return roomState.participantRole === "partner_a"
      ? roomState.partnerAWrapUp
      : roomState.partnerBWrapUp;
  }, [roomState]);

  const partnerWrapUp = useMemo(() => {
    if (!roomState || roomState.phase !== "commons") return false;
    return roomState.participantRole === "partner_a"
      ? roomState.partnerBWrapUp
      : roomState.partnerAWrapUp;
  }, [roomState]);

  const myHandRaised = useMemo(() => {
    if (!roomState || roomState.phase !== "commons") return false;
    return roomState.participantRole === "partner_a"
      ? roomState.partnerAHandRaised
      : roomState.partnerBHandRaised;
  }, [roomState]);

  const partnerHandRaised = useMemo(() => {
    if (!roomState || roomState.phase !== "commons") return false;
    return roomState.participantRole === "partner_a"
      ? roomState.partnerBHandRaised
      : roomState.partnerAHandRaised;
  }, [roomState]);

  // Screen 1: Welcome splash (animated)
  if (view === "splash") {
    return <SplashScreen onBegin={() => setView("name")} />;
  }

  const pageTransition: React.CSSProperties = {
    transition: "opacity 250ms ease-in-out",
    opacity: transitioning ? 0 : 1,
  };

  // Screen 2: Name entry
  if (view === "name") {
    return (
      <div className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-[#ebe7de]" style={pageTransition}>
        <div className="px-6 pt-6">
          <button
            onClick={() => setView("splash")}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#dddad1]"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.5 15L7.5 10L12.5 5" stroke="#1a1918" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="animate-fade-in flex flex-col gap-4 px-6 pt-8 text-center lg:mx-auto lg:max-w-[600px]">
          <h1 className="font-display text-[32px] font-medium leading-[1.4] tracking-[-1px] text-[#8e521f]">
            To begin with,
          </h1>
          <p className="font-body text-[16px] font-normal leading-[1.5] text-[#464543]">
            What should Ash call you during the session?
          </p>
        </div>

        <div className="relative z-10 mx-auto mt-16 flex w-full max-w-[465px] flex-col gap-3 px-6">
          <label className="font-body text-[12px] font-medium uppercase leading-[1.2] tracking-[1.25px] text-[#807e7a]">
            Your name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && name.trim()) setView("survey-intro");
            }}
            className="h-[64px] rounded-[16px] bg-[#dddad1] px-[24px] font-body text-[16px] text-[#1a1918] outline-none"
            placeholder="Enter your name"
            autoFocus
          />
        </div>

        <div className="mx-auto mt-6 w-full max-w-[465px] px-6">
          <button
            onClick={() => setView("survey-intro")}
            disabled={!name.trim()}
            className="flex h-[64px] w-full items-center justify-center rounded-[16px] bg-[#8e521f] font-body text-[18px] font-medium leading-[1.2] tracking-[-0.25px] text-[#f1d5be] disabled:opacity-40"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  // Screen 5: Survey intro
  if (view === "survey-intro") {
    const handleSkipSurvey = async () => {
      setViewRaw("joining");
      await join(name.trim());
    };

    return (
      <div className="flex min-h-[100dvh] flex-col bg-[#ebe7de]" style={pageTransition}>
        <div className="px-6 pt-6">
          <button
            onClick={() => setView("name")}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#dddad1]"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.5 15L7.5 10L12.5 5" stroke="#1a1918" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="animate-fade-in flex flex-col gap-4 px-6 pt-8 text-center lg:mx-auto lg:max-w-[600px]">
          <h1 className="font-display text-[32px] font-medium leading-[1.4] tracking-[-1px] text-[#8e521f]">
            Alright {name.trim()}, Ash wants to understand your relationship
          </h1>
          <p className="font-body text-[16px] font-normal leading-[1.5] text-[#464543]">
            {isSurveyTestVariant() ? "3" : "5"} quick questions help Ash personalize your session. Your responses
            are anonymous and used for research only.
          </p>
        </div>

        <div className="mx-auto mt-16 flex w-full max-w-[465px] flex-col items-center gap-4 px-6">
          <button
            onClick={() => setView("survey")}
            className="flex h-[64px] w-full items-center justify-center rounded-[16px] bg-[#8e521f] font-body text-[18px] font-medium leading-[1.2] tracking-[-0.25px] text-[#f1d5be]"
          >
            Continue
          </button>
          <button
            onClick={handleSkipSurvey}
            className="font-body text-[14px] font-bold text-[#807e7a]"
          >
            skip
          </button>
        </div>
      </div>
    );
  }

  // Screen 6: Pre-session survey
  if (view === "survey") {
    const handleSurveyComplete = async () => {
      setViewRaw("joining");
      await join(name.trim());
    };

    return (
      <div style={pageTransition}><SurveyScreen
        surveyId={PRE_SURVEY_ID}
        title="Help Ash understand your relationship"
        subtitle={isSurveyTestVariant() ? "3 quick questions help Ash personalize your session. Your responses are anonymous and used for research only." : "These quick questions help Ash personalize your session. Your responses are anonymous and used for research only."}
        questions={isSurveyTestVariant() ? PRE_SURVEY_QUESTIONS_B : PRE_SURVEY_QUESTIONS}
        onComplete={handleSurveyComplete}
        onBack={() => setView("survey-intro")}
      /></div>
    );
  }

  // Loading / joining state
  if (view === "joining" || (view !== "chat" && view !== "error")) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[var(--surface-bg)]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--surface-elevated)] border-t-[var(--wood-600)]" />
          <p className="text-base text-[var(--contrast-weak)]">
            Entering your private room...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (view === "error") {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[var(--surface-bg)] px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-lg font-medium text-[var(--contrast-strong)]">
            Something went wrong
          </p>
          <p className="text-base text-[var(--contrast-weak)]">
            {error || "Unable to join the room"}
          </p>
          <button
            onClick={() => {
              joinAttempted.current = false;
              setView("splash");
            }}
            className="mt-4 rounded-[var(--radius-md)] bg-[var(--wood-600)] px-6 py-3 text-base font-medium text-[var(--wood-50)]"
          >
            Try again
          </button>
          <a
            href="/"
            className="mt-1 text-sm font-medium text-[var(--contrast-weak)] underline underline-offset-2"
          >
            Start a new session
          </a>
        </div>
      </div>
    );
  }

  // Chat view
  if (!roomState) return null;

  // Session ended early (safety concern)
  if (roomState.phase === "ended") {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[var(--surface-bg)] px-6">
        <div className="mx-auto flex max-w-[480px] flex-col items-center gap-6 text-center">
          <h1 className="font-display text-[28px] font-medium leading-[1.3] tracking-[-1px] text-[var(--wood-700)]">
            This session has ended
          </h1>
          <p className="text-[16px] leading-[1.6] text-[#464543]">
            This session is no longer active. If you need support, please reach out to a professional.
          </p>
          <div className="mt-2 w-full rounded-[16px] bg-[#f3e8e8] p-6 text-left">
            <p className="mb-3 text-[15px] font-semibold text-[#464543]">
              If you or someone you know needs help:
            </p>
            <div className="flex flex-col gap-3">
              <a
                href="tel:1-800-799-7233"
                className="text-[15px] font-medium text-[#c0392b] underline"
              >
                National Domestic Violence Hotline: 1-800-799-7233
              </a>
              <p className="text-[14px] text-[#464543]">
                Or text <span className="font-semibold">START</span> to <span className="font-semibold">88788</span>
              </p>
              <a
                href="https://www.thehotline.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[15px] font-medium text-[#c0392b] underline"
              >
                www.thehotline.org
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Conclusion view
  if (roomState.phase === "conclusion") {
    return (
      <FinishedScreen
        participantNames={[
          roomState.partnerAName || "Partner A",
          roomState.partnerBName || "Partner B",
        ]}
        summary={roomState.conclusionSummary || undefined}
      />
    );
  }

  // Detect "entering commons" — phase is commons but no messages yet (Ash generating opening)
  const commonsLoading = roomState.phase === "commons" && messages.length === 0;

  // Show typing whenever Ash is working: explicit typing state, OR commons loading
  const showTyping = typing || commonsLoading;

  // Detect "both ready, waiting for transition" — both ready in intake
  const bothReadyWaiting =
    roomState.phase === "intake" &&
    roomState.partnerAReady &&
    roomState.partnerBReady;

  // Detect "both wrapped up, waiting for conclusion" — both wrapUp but not yet conclusion phase
  const conclusionLoading =
    roomState.phase === "commons" &&
    roomState.partnerAWrapUp &&
    roomState.partnerBWrapUp;

  // Rotating messages for the "entering commons" transition
  const transitionMessages = [
    "Ash is bringing you both together",
    "Ash has understood your side",
    "Ash is working to help you get aligned",
    "Preparing your guided conversation...",
  ];

  // Full-screen transition when entering commons or both ready
  if (commonsLoading || bothReadyWaiting) {
    return (
      <div className="relative flex h-[100dvh] flex-col items-center justify-center overflow-hidden bg-[var(--surface-bg)]">
        <div className="animate-fade-in relative z-10 flex flex-col items-center gap-6 text-center">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-[var(--damson-400)] [animation-delay:0ms]" />
            <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-[var(--damson-400)] [animation-delay:120ms]" />
            <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-[var(--damson-400)] [animation-delay:240ms]" />
          </div>
          <h2
            key={transitionMsgIndex}
            className="font-display max-w-[280px] text-center text-[22px] font-medium leading-[1.2] tracking-[-0.5px] text-[var(--damson-600)] animate-fade-in"
          >
            {transitionMessages[transitionMsgIndex]}
          </h2>
        </div>
      </div>
    );
  }

  // Full-screen transition when conclusion is being generated
  if (conclusionLoading) {
    return (
      <div className="relative flex h-[100dvh] flex-col items-center justify-center overflow-hidden bg-[var(--surface-bg)]">
        <div className="animate-fade-in relative z-10 flex flex-col items-center gap-6 text-center">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-[var(--damson-400)] [animation-delay:0ms]" />
            <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-[var(--damson-400)] [animation-delay:120ms]" />
            <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-[var(--damson-400)] [animation-delay:240ms]" />
          </div>
          <h2
            className="font-display max-w-[280px] text-center text-[22px] font-medium leading-[1.2] tracking-[-0.5px] text-[var(--damson-600)]"
          >
            Wrapping up your session
          </h2>
          <p className="max-w-[300px] text-sm leading-[1.5] text-[var(--contrast-weak)]">
            Ash is preparing your summary...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] flex-col bg-[var(--surface-bg)] text-[var(--contrast-strong)]">
      <Toast message="Link copied to clipboard" visible={toastVisible} />
      <TopBar
        roomState={roomState}
        messages={messages}
        onReady={ready}
        readyLoading={readyLoading}
        onWrapUp={wrapUp}
        wrapUpLoading={wrapUpLoading}
        onCopyLink={copyRoomLink}
        onEndSession={endSession}
      />

      {error ? (
        <div className="mx-4 mt-3 rounded-[var(--radius-sm)] border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900">
          {error}
        </div>
      ) : null}

      <MessageList
        messages={messages}
        typing={showTyping}
        containerRef={containerRef}
        showAuthorLabels={roomState.phase === "commons"}
        participantRole={roomState.participantRole}
        phase={roomState.phase}
        footer={
          (partnerWrapUp || myWrapUp) &&
          roomState.phase === "commons" ? (
            <WrapUpNotice
              partnerName={partnerName || "Your partner"}
              myWrapUp={myWrapUp}
              partnerWrapUp={partnerWrapUp}
            />
          ) : null
        }
      />

      {/* Commons typing indicator — shown when the other user is the active speaker */}
      {roomState.phase === "commons" &&
        roomState.activeSpeaker &&
        roomState.activeSpeaker !== "either" &&
        roomState.activeSpeaker !== roomState.participantRole && (
          <div className="mx-auto flex w-full max-w-[600px] items-center gap-1.5 px-8 pb-0 pt-1">
            <span className="text-sm text-[var(--contrast-weak)]">
              {partnerName || "Your partner"} is typing
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--contrast-weak)] [animation-delay:0ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--contrast-weak)] [animation-delay:120ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--contrast-weak)] [animation-delay:240ms]" />
            </span>
          </div>
        )}

      {myReady && roomState.phase === "intake" ? (
        <StatusBottomBar
          message={`When ${partnerName || "your partner"} is also ready, you'll move into the commons together`}
        />
      ) : roomState.phase === "commons" &&
        roomState.activeSpeaker &&
        roomState.activeSpeaker !== "either" &&
        roomState.activeSpeaker !== roomState.participantRole ? (
        <div className="border-t border-[var(--surface-elevated)] bg-[var(--surface-bg)] px-4 pb-12 pt-5 lg:pb-6">
          <div className="mx-auto flex max-w-[600px] items-center justify-between">
            <p className="text-base leading-[1.5] text-[var(--contrast-weak)]">
              {myHandRaised
                ? "Ash knows you'd like to speak"
                : "Ash invited your partner to speak next"}
            </p>
            {!myHandRaised ? (
              <button
                onClick={raiseHand}
                disabled={handRaiseLoading}
                className="flex shrink-0 items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--surface-elevated)] px-4 py-2.5 text-sm font-semibold leading-[1.2] tracking-[-0.25px] text-[var(--damson-700)] transition-opacity disabled:opacity-60"
              >
                <HandRaiseIcon color="var(--damson-700)" />
                Raise my hand
              </button>
            ) : (
              <div className="flex shrink-0 items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--damson-600)] px-4 py-2.5 text-sm font-semibold leading-[1.2] tracking-[-0.25px] text-[var(--wood-50)]">
                <HandRaiseIcon color="var(--wood-50)" />
                Hand raised
              </div>
            )}
          </div>
        </div>
      ) : (
        <ChatInput
          disabled={!canSend}
          placeholder={placeholder}
          phase={roomState.phase}
          onSend={(content) => {
            scrollToBottom();
            return send(content);
          }}
        />
      )}
    </div>
  );
}

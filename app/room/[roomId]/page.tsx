"use client";

import { use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import { useAutoScroll } from "@/hooks/useAutoScroll";
import { useSession } from "@/hooks/useSession";
import type { ChatMessage, RoomState } from "@/lib/types";

import ChatInput from "@/components/ChatInput";
import FinishedScreen from "@/components/FinishedScreen";
import MessageList from "@/components/MessageList";
import ParticipantChip from "@/components/ParticipantChip";
import PhaseSwitch, { type PhaseView } from "@/components/PhaseSwitch";
import Tooltip from "@/components/Tooltip";
import { CheckIcon, HourglassIcon, LinkIcon } from "@/components/icons/MaterialIcons";
import SurveyScreen from "@/components/SurveyScreen";
import { PRE_SURVEY_ID, PRE_SURVEY_QUESTIONS, PRE_SURVEY_QUESTIONS_B, isSurveyTestVariant } from "@/lib/surveys";

type ViewState = "splash" | "name" | "survey-intro" | "survey" | "joining" | "chat" | "error";

const FONT_STYLE = { fontFamily: 'var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif', letterSpacing: '-0.025em' };

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
            className="mt-0.5 h-[17px] w-[17px] shrink-0 cursor-pointer rounded-[4px] border-[#404040] accent-[#171717]"
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
          className="flex h-[64px] w-full items-center justify-center rounded-[var(--radius-pill)] bg-[var(--contrast-strong)] transition-opacity hover:opacity-85 font-body text-[17px] font-medium leading-[1.2] tracking-[-0.011em] text-[var(--surface-bg)] disabled:opacity-40"
        >
          Begin
        </button>
      </div>
    </div>
  );
}

// --- Full-screen transition ---
function TransitionScreen({
  title,
  subtitle,
  titleKey,
}: {
  title: string;
  subtitle?: string;
  /** Change to re-run the fade when the copy rotates */
  titleKey?: string | number;
}) {
  return (
    <div className="relative flex h-[100dvh] flex-col items-center justify-center overflow-hidden bg-background px-6">
      <div className="animate-fade-in relative z-10 flex flex-col items-center gap-6 text-center">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-[var(--switch-inactive)] [animation-delay:0ms]" />
          <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-[var(--switch-inactive)] [animation-delay:120ms]" />
          <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-[var(--switch-inactive)] [animation-delay:240ms]" />
        </div>
        <h2
          key={titleKey}
          className="font-display animate-fade-in max-w-[320px] text-[22px] leading-[1.25] text-[var(--chip-foreground)]"
        >
          {title}
        </h2>
        {subtitle ? (
          <p className="msg-text max-w-[320px] text-[var(--switch-inactive)]">{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}

// --- Toast ---
function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <div
      className={`ui-text pointer-events-none fixed left-1/2 top-[104px] z-50 -translate-x-1/2 rounded-full bg-[var(--action)] px-4 py-2 font-medium text-[var(--action-foreground)] transition-all duration-300 ${visible ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"}`}
    >
      {message}
    </div>
  );
}

// --- Top Bar ---
function TopBar({
  roomState,
  messages,
  tab,
  onTabChange,
  onReady,
  readyLoading,
  onWrapUp,
  wrapUpLoading,
  onCopyLink,
  onEndSession,
}: {
  roomState: RoomState;
  messages: ChatMessage[];
  tab: PhaseView;
  onTabChange: (v: PhaseView) => void;
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
    const update = () => setHeaderHeight(el.getBoundingClientRect().height);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const isPartnerA = roomState.participantRole === "partner_a";
  const partnerName = isPartnerA ? roomState.partnerBName : roomState.partnerAName;
  const myReady = isPartnerA ? roomState.partnerAReady : roomState.partnerBReady;
  const partnerReady = isPartnerA ? roomState.partnerBReady : roomState.partnerAReady;
  const myWrapUp = isPartnerA ? roomState.partnerAWrapUp : roomState.partnerBWrapUp;
  const partnerWrapUp = isPartnerA ? roomState.partnerBWrapUp : roomState.partnerAWrapUp;

  const inCommons = roomState.phase === "commons" || roomState.phase === "conclusion";

  // Chip icon means "done with the current step": ready in intake, wrapped up in commons
  const myDone = inCommons ? myWrapUp : myReady;
  const partnerDone = inCommons ? partnerWrapUp : partnerReady;

  const safetyFlagged = messages.some(
    (m) => m.role === "assistant" && m.text.includes("1-800-799-7233")
  );

  const segments = [
    {
      id: "room" as PhaseView,
      label: `${roomState.participantName}'s room`,
    },
    {
      id: "commons" as PhaseView,
      label: "The commons",
    },
  ];

  return (
    <>
      <header
        ref={headerRef}
        className="fixed top-0 right-0 left-0 z-20 flex items-center justify-between gap-1.5 bg-background px-3 pb-3 pt-[max(12px,env(safe-area-inset-top))] md:gap-3 md:px-6 md:pt-6"
      >
        {/* Left — who is in the room, colour-coded */}
        <div className="flex shrink-0 items-center lg:gap-3">
          <ParticipantChip
            name={roomState.participantName}
            self
            align="start"
            className="relative z-10"
            done={myDone}
            tooltip={
              inCommons
                ? myDone
                  ? "You're ready to wrap up"
                  : "You — still talking"
                : myDone
                  ? "You're ready for the commons"
                  : "You — still in your private room"
            }
          />
          {partnerName ? (
            <ParticipantChip
              name={partnerName}
              self={false}
              align="start"
              className="-ml-3 lg:ml-0"
              done={partnerDone}
              connected={roomState.partnerConnected}
              tooltip={
                inCommons
                  ? partnerDone
                    ? `${partnerName} is ready to wrap up`
                    : `${partnerName} is still talking`
                  : partnerDone
                    ? `${partnerName} is ready for the commons`
                    : `${partnerName} is still in their private room`
              }
            />
          ) : null}
        </div>

        {/* Centre — move between your private room and the commons */}
        <div className="flex min-w-0 flex-1 items-center justify-center gap-2">
          <PhaseSwitch segments={segments} value={tab} onChange={onTabChange} />
          <span className="hidden md:contents">
            <Tooltip label="Copy invite link">
              <button
                type="button"
                onClick={onCopyLink}
                aria-label="Copy invite link"
                className="icon-btn"
              >
                <LinkIcon size={20} />
              </button>
            </Tooltip>
          </span>
        </div>

        {/* Right — the one action available in this phase */}
        <div className="flex shrink-0 items-center justify-end">
          {!inCommons && safetyFlagged ? (
            <Tooltip label="End this session now" align="end">
              <button onClick={onEndSession} className="action-btn">
                End Session
              </button>
            </Tooltip>
          ) : !inCommons ? (
            <Tooltip
              align="end"
              label={myReady ? "Waiting for your partner" : "Finish here and move to the commons"}
            >
              <button
                onClick={onReady}
                disabled={readyLoading || myReady}
                className="action-btn"
              >
                {readyLoading ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Preparing...
                  </>
                ) : (
                  <>
                    <span className="hidden md:inline">I&apos;m Ready</span>
                    <CheckIcon size={22} className="md:hidden" />
                  </>
                )}
              </button>
            </Tooltip>
          ) : (
            <Tooltip
              align="end"
              label={
                myWrapUp
                  ? "Waiting for your partner to wrap up"
                  : "Wrap up and get your conclusion"
              }
            >
              <button
                onClick={onWrapUp}
                disabled={wrapUpLoading || myWrapUp}
                className="action-btn"
              >
                {wrapUpLoading ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Wrapping up...
                  </>
                ) : (
                  <>
                    <span className="hidden md:inline">Wrap Up</span>
                    <CheckIcon size={22} className="md:hidden" />
                  </>
                )}
              </button>
            </Tooltip>
          )}
        </div>
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

function WrapUpIcon({ color = "#a1a1a1" }: { color?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="mt-px shrink-0">
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
    <div className="flex flex-col gap-4">
      {onlyPartner && (
        <div className="flex items-start gap-2">
          <WrapUpIcon color="#a1a1a1" />
          <p className="msg-text text-muted-foreground">
            {partnerName} has indicated that they are ready to{" "}
            <span className="font-bold">wrap up</span> this conversation. When
            you&apos;re ready to end, you can also{" "}
            <span className="font-bold">wrap up</span> to receive a conclusion.
          </p>
        </div>
      )}
      {onlyMe && (
        <div className="flex items-start gap-2">
          <WrapUpIcon color="#a1a1a1" />
          <p className="msg-text text-muted-foreground">
            You have indicated that you are ready to{" "}
            <span className="font-bold">wrap up</span>. Waiting for{" "}
            {partnerName} to also wrap up to receive a conclusion.
          </p>
        </div>
      )}
      {bothWrapUp && (
        <div className="flex items-start gap-2 text-foreground">
          <WrapUpIcon color="currentColor" />
          <p className="msg-text text-foreground">
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
    intakeMessages,
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
  const [tab, setTab] = useState<PhaseView>("room");

  // The tab follows the room's real phase; the participant can then step back
  // and forth between their private room and the commons on their own.
  const livePhase: PhaseView =
    roomState?.phase === "commons" || roomState?.phase === "conclusion"
      ? "commons"
      : "room";
  useEffect(() => {
    setTab(livePhase);
  }, [livePhase]);
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

  const partnerReady = useMemo(() => {
    if (!roomState || roomState.phase !== "intake") return false;
    return roomState.participantRole === "partner_a"
      ? roomState.partnerBReady
      : roomState.partnerAReady;
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
      <div className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-[#ffffff]" style={pageTransition}>
        <div className="px-6 pt-6">
          <button
            onClick={() => setView("splash")}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#f5f5f5]"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.5 15L7.5 10L12.5 5" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="animate-fade-in flex flex-col gap-4 px-6 pt-8 text-center lg:mx-auto lg:max-w-[600px]">
          <h1 className="font-display text-[34px] leading-[1.12] tracking-[-0.01em] text-[var(--contrast-strong)]">
            To begin with,
          </h1>
          <p className="font-body text-[16px] font-normal leading-[1.5] text-[#404040]">
            What should Ash call you during the session?
          </p>
        </div>

        <div className="relative z-10 mx-auto mt-16 flex w-full max-w-[465px] flex-col gap-3 px-6">
          <label className="font-body text-[12px] font-medium uppercase leading-[1.2] tracking-[1.25px] text-[#737373]">
            Your name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && name.trim()) setView("survey-intro");
            }}
            className="h-[64px] rounded-[16px] bg-[#f5f5f5] px-[24px] font-body text-[16px] text-[#0a0a0a] outline-none"
            placeholder="Enter your name"
            autoFocus
          />
        </div>

        <div className="mx-auto mt-6 w-full max-w-[465px] px-6">
          <button
            onClick={() => setView("survey-intro")}
            disabled={!name.trim()}
            className="flex h-[64px] w-full items-center justify-center rounded-[var(--radius-pill)] bg-[var(--contrast-strong)] transition-opacity hover:opacity-85 font-body text-[17px] font-medium leading-[1.2] tracking-[-0.011em] text-[var(--surface-bg)] disabled:opacity-40"
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
      <div className="flex min-h-[100dvh] flex-col bg-[#ffffff]" style={pageTransition}>
        <div className="px-6 pt-6">
          <button
            onClick={() => setView("name")}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#f5f5f5]"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.5 15L7.5 10L12.5 5" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="animate-fade-in flex flex-col gap-4 px-6 pt-8 text-center lg:mx-auto lg:max-w-[600px]">
          <h1 className="font-display text-[34px] leading-[1.12] tracking-[-0.01em] text-[var(--contrast-strong)]">
            Alright {name.trim()}, Ash wants to understand your relationship
          </h1>
          <p className="font-body text-[16px] font-normal leading-[1.5] text-[#404040]">
            {isSurveyTestVariant() ? "3" : "5"} quick questions help Ash personalize your session. Your responses
            are anonymous and used for research only.
          </p>
        </div>

        <div className="mx-auto mt-16 flex w-full max-w-[465px] flex-col items-center gap-4 px-6">
          <button
            onClick={() => setView("survey")}
            className="flex h-[64px] w-full items-center justify-center rounded-[var(--radius-pill)] bg-[var(--contrast-strong)] transition-opacity hover:opacity-85 font-body text-[17px] font-medium leading-[1.2] tracking-[-0.011em] text-[var(--surface-bg)]"
          >
            Continue
          </button>
          <button
            onClick={handleSkipSurvey}
            className="font-body text-[14px] font-bold text-[#737373]"
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
          <h1 className="font-display text-[28px] leading-[1.18] tracking-[-1px] text-[var(--wood-700)]">
            This session has ended
          </h1>
          <p className="text-[16px] leading-[1.6] text-[#404040]">
            This session is no longer active. If you need support, please reach out to a professional.
          </p>
          <div className="mt-2 w-full rounded-[16px] bg-[#fef2f2] p-6 text-left">
            <p className="mb-3 text-[15px] font-semibold text-[#404040]">
              If you or someone you know needs help:
            </p>
            <div className="flex flex-col gap-3">
              <a
                href="tel:1-800-799-7233"
                className="text-[15px] font-medium text-[#e7000b] underline"
              >
                National Domestic Violence Hotline: 1-800-799-7233
              </a>
              <p className="text-[14px] text-[#404040]">
                Or text <span className="font-semibold">START</span> to <span className="font-semibold">88788</span>
              </p>
              <a
                href="https://www.thehotline.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[15px] font-medium text-[#e7000b] underline"
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

  // I've finished my intake but my partner hasn't — hold on a full-screen wait
  // rather than leaving them in a chat they can no longer type into.
  const waitingForPartner =
    roomState.phase === "intake" && myReady && !partnerReady;

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

  // Waiting on the other person to finish their private conversation
  if (waitingForPartner) {
    return (
      <TransitionScreen
        title={`Waiting for ${partnerName || "your partner"} to finish up`}
        subtitle={`You're ready. As soon as ${partnerName || "your partner"} is done, Ash will bring you both into the commons.`}
      />
    );
  }

  // Full-screen transition when entering commons or both ready
  if (commonsLoading || bothReadyWaiting) {
    return (
      <TransitionScreen
        title={transitionMessages[transitionMsgIndex]}
        titleKey={transitionMsgIndex}
      />
    );
  }

  // Full-screen transition when conclusion is being generated
  if (conclusionLoading) {
    return (
      <TransitionScreen
        title="Wrapping up your session"
        subtitle="Ash is preparing your summary..."
      />
    );
  }

  // --- Which transcript the header tabs are showing ---
  // "Live" means the tab matches the room's actual phase; anything else is a
  // read-back and the composer is closed.
  const onLiveTab = tab === livePhase;
  const shownMessages =
    tab === "commons"
      ? livePhase === "commons"
        ? messages
        : []
      : livePhase === "commons"
        ? intakeMessages
        : messages;

  const waitingOnPartnerTurn =
    roomState.phase === "commons" &&
    !!roomState.activeSpeaker &&
    roomState.activeSpeaker !== "either" &&
    roomState.activeSpeaker !== roomState.participantRole;

  const notice: { text: string; centered: boolean; showRaiseHand?: boolean } | null =
    tab === "commons" && livePhase !== "commons"
      ? {
          text: `When ${partnerName || "your partner"} is also ready, you'll move into the commons together`,
          centered: true,
        }
      : tab === "room" && livePhase === "commons"
        ? {
            text: "This is your private room from earlier. The conversation has moved to the commons.",
            centered: true,
          }
        : onLiveTab && waitingOnPartnerTurn
          ? {
              text: myHandRaised
                ? "Ash knows you'd like to speak"
                : "It's your partner's turn",
              centered: false,
              showRaiseHand: true,
            }
          : null;

  return (
    <div className="flex h-[100dvh] flex-col bg-[var(--surface-bg)] text-[var(--contrast-strong)]">
      <Toast message="Link copied to clipboard" visible={toastVisible} />
      <TopBar
        roomState={roomState}
        messages={messages}
        tab={tab}
        onTabChange={setTab}
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
        messages={shownMessages}
        typing={onLiveTab && showTyping}
        containerRef={containerRef}
        showAuthorLabels={tab === "commons"}
        participantRole={roomState.participantRole}
        phase={tab === "commons" ? "commons" : "intake"}
        footer={
          onLiveTab && (partnerWrapUp || myWrapUp) && roomState.phase === "commons" ? (
            <WrapUpNotice
              partnerName={partnerName || "Your partner"}
              myWrapUp={myWrapUp}
              partnerWrapUp={partnerWrapUp}
            />
          ) : null
        }
      />

      {/* One status line sits directly above the input */}
      {notice ? (
        <div className="mx-auto w-full max-w-[610px] px-5 pb-1">
          {notice.centered ? (
            <p className="msg-text text-center font-medium text-[var(--switch-inactive)]">
              {notice.text}
            </p>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <p className="msg-text flex items-center gap-2 text-[var(--switch-inactive)]">
                <HourglassIcon size={20} />
                {notice.text}
              </p>
              {notice.showRaiseHand ? (
                !myHandRaised ? (
                  <button
                    onClick={raiseHand}
                    disabled={handRaiseLoading}
                    className="ui-text flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-[var(--bubble)] px-3.5 font-medium text-[var(--chip-foreground)] transition-colors hover:bg-[#e6e6e6] disabled:opacity-60"
                  >
                    <HandRaiseIcon color="currentColor" />
                    Raise my hand
                  </button>
                ) : (
                  <div className="ui-text flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-[var(--action)] px-3.5 font-medium text-[var(--action-foreground)]">
                    <HandRaiseIcon color="currentColor" />
                    Hand raised
                  </div>
                )
              ) : null}
            </div>
          )}
        </div>
      ) : null}

      <ChatInput
        disabled={!onLiveTab || !canSend}
        placeholder={onLiveTab ? placeholder : "Text input"}
        phase={roomState.phase}
        onSend={(content) => {
          scrollToBottom();
          return send(content);
        }}
      />
    </div>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";

import BrushBackground from "@/components/BrushBackground";

type Step = "splash" | "info" | "setup" | "share";

const FONT_STYLE = { fontFamily: '"Libre Baskerville", serif', fontStyle: 'italic' as const };

const CARDS = [
  {
    bg: "/card-wood-bg.svg",
    accent: "#8e521f",
    label: "First",
    title: "A private talk with Ash",
    body: "You and your partner each start alone. Ash asks about what has been sitting with you, in your own words. Neither of you sees the other's answers.",
  },
  {
    bg: "/card-olive-bg.svg",
    accent: "#5f6b1f",
    label: "Then",
    title: "You come together",
    body: "Ash brings you both into one conversation and holds the shape of it, making room for each of you to speak and be heard without it turning into a fight.",
  },
  {
    bg: "/card-damson-bg.svg",
    accent: "#3f6152",
    label: "Finally",
    title: "Something to take away",
    body: "When you are both ready to wrap up, Ash writes back what it heard: where you align, what is still tender, and a few concrete things to try.",
  },
];

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

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Go back"
      className="flex h-10 w-10 items-center justify-center rounded-full border border-[#dddad1]"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.5 15L7.5 10L12.5 5" stroke="#1a1918" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

// --- Screen 1: Splash ---
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
      <BrushBackground variant="alignment" />

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
          A space for the conversation you have been putting off. This is a demo and everything you share here disappears when you&apos;re done.
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

// --- Screen 2: Info cards ---
function InfoScreen({ onBack, onContinue }: { onBack: () => void; onContinue: () => void }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const onScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    if (!card) return;
    const stride = card.offsetWidth + 16;
    setActive(Math.round(el.scrollLeft / stride));
  }, []);

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[var(--surface-bg)]">
      <div className="px-6 pt-6">
        <BackButton onClick={onBack} />
      </div>

      <div className="animate-fade-in flex flex-col gap-4 px-6 pt-8 text-center lg:mx-auto lg:max-w-[600px]">
        <h1 className="font-display text-[32px] font-medium leading-[1.4] tracking-[-1px] text-[#8e521f]">
          How this works
        </h1>
        <p className="font-body text-[16px] font-normal leading-[1.5] text-[#464543]">
          Three parts, about thirty minutes. You can stop at any point.
        </p>
      </div>

      <div
        ref={scrollerRef}
        onScroll={onScroll}
        className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:justify-center"
      >
        {CARDS.map((card) => (
          <article
            key={card.title}
            className="relative flex h-[380px] w-[280px] shrink-0 snap-center flex-col justify-end overflow-hidden rounded-[var(--radius-lg)] p-6"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={card.bg}
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-full w-full object-cover"
            />
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5"
              aria-hidden="true"
              style={{
                background:
                  "linear-gradient(to top, var(--surface-bg) 30%, color-mix(in srgb, var(--surface-bg) 85%, transparent) 55%, transparent 100%)",
              }}
            />
            <div className="relative flex flex-col gap-3">
              <span
                className="font-body text-[12px] font-medium uppercase leading-[1.2] tracking-[1.25px]"
                style={{ color: card.accent }}
              >
                {card.label}
              </span>
              <h2 className="font-display text-[24px] font-medium leading-[1.3] tracking-[-0.5px] text-[var(--contrast-strong)]">
                {card.title}
              </h2>
              <p className="font-body text-[14px] leading-[1.6] text-[var(--contrast-medium)]">
                {card.body}
              </p>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-4 flex justify-center gap-2 lg:hidden">
        {CARDS.map((card, i) => (
          <span
            key={card.title}
            className={`h-1.5 w-1.5 rounded-full transition-colors ${i === active ? "bg-[var(--wood-600)]" : "bg-[var(--surface-elevated)]"}`}
          />
        ))}
      </div>

      <div className="mx-auto mb-10 mt-10 w-full max-w-[465px] px-6">
        <button
          onClick={onContinue}
          className="flex h-[64px] w-full items-center justify-center rounded-[16px] bg-[#8e521f] font-body text-[18px] font-medium leading-[1.2] tracking-[-0.25px] text-[#f1d5be]"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

// --- Screen 3: Name entry ---
function SetupScreen({
  name,
  setName,
  onBack,
  onContinue,
  loading,
  error,
}: {
  name: string;
  setName: (v: string) => void;
  onBack: () => void;
  onContinue: () => void;
  loading: boolean;
  error: string | null;
}) {
  const canContinue = name.trim().length > 0 && !loading;

  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-[var(--surface-bg)]">
      <div className="px-6 pt-6">
        <BackButton onClick={onBack} />
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
            if (e.key === "Enter" && canContinue) onContinue();
          }}
          className="h-[64px] rounded-[16px] bg-[#dddad1] px-[24px] font-body text-[16px] text-[#1a1918] outline-none"
          placeholder="Enter your name"
          autoFocus
        />
      </div>

      <div className="mx-auto mt-6 w-full max-w-[465px] px-6">
        <button
          onClick={onContinue}
          disabled={!canContinue}
          className="flex h-[64px] w-full items-center justify-center rounded-[16px] bg-[#8e521f] font-body text-[18px] font-medium leading-[1.2] tracking-[-0.25px] text-[#f1d5be] disabled:opacity-40"
        >
          {loading ? "Creating your room..." : "Continue"}
        </button>
        {error ? (
          <p className="mt-4 text-center font-body text-[14px] leading-[1.5] text-[var(--contrast-medium)]">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}

// --- Screen 4: Share ---
function ShareScreen({
  roomUrl,
  onCopy,
  onEnter,
}: {
  roomUrl: string;
  onCopy: () => void;
  onEnter: () => void;
}) {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-[var(--surface-bg)]">
      <div className="animate-fade-in flex flex-col gap-4 px-6 pt-24 text-center lg:mx-auto lg:max-w-[600px]">
        <h1 className="font-display text-[32px] font-medium leading-[1.4] tracking-[-1px] text-[#8e521f]">
          Your room is ready
        </h1>
        <p className="font-body text-[16px] font-normal leading-[1.5] text-[#464543]">
          Send this link to your partner. You will each talk to Ash on your own first, then meet in the middle.
        </p>
      </div>

      <div className="mx-auto mt-12 flex w-full max-w-[465px] flex-col gap-3 px-6">
        <label className="font-body text-[12px] font-medium uppercase leading-[1.2] tracking-[1.25px] text-[#807e7a]">
          Room link
        </label>
        <div className="flex items-center gap-3 rounded-[16px] bg-[#dddad1] px-[24px] py-[20px]">
          <p className="min-w-0 flex-1 truncate font-body text-[14px] text-[#464543]">
            {roomUrl}
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon-link.svg" alt="" aria-hidden="true" className="h-5 w-5 shrink-0" />
        </div>
      </div>

      <div className="mx-auto mt-6 flex w-full max-w-[465px] flex-col items-center gap-4 px-6">
        <button
          onClick={onCopy}
          className="flex h-[64px] w-full items-center justify-center rounded-[16px] bg-[#8e521f] font-body text-[18px] font-medium leading-[1.2] tracking-[-0.25px] text-[#f1d5be]"
        >
          Copy link
        </button>
        <button
          onClick={onEnter}
          className="flex h-[64px] w-full items-center justify-center gap-2 rounded-[16px] border border-[#dddad1] font-body text-[18px] font-medium leading-[1.2] tracking-[-0.25px] text-[var(--contrast-strong)]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon-door-open.svg" alt="" aria-hidden="true" className="h-5 w-5" />
          Enter your room
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const posthog = usePostHog();

  const [step, setStep] = useState<Step>("splash");
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);

  const roomUrl = roomId ? `${typeof window !== "undefined" ? window.location.origin : ""}/room/${roomId}` : "";

  const createRoom = useCallback(async () => {
    if (!name.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/room/create", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create a room");
      setRoomId(data.roomId);
      posthog?.capture("room_created", { roomId: data.roomId });
      setStep("share");
    } catch (e) {
      console.error("Failed to create room:", e);
      setError("We could not open a room just now. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [name, posthog]);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(roomUrl);
    } catch {
      // Fallback: ignore
    }
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  }, [roomUrl]);

  const enterRoom = useCallback(() => {
    if (!roomId) return;
    router.push(`/room/${roomId}?creator=1&name=${encodeURIComponent(name.trim())}`);
  }, [roomId, name, router]);

  return (
    <>
      <Toast message="Link copied to clipboard" visible={toastVisible} />

      {step === "splash" ? <SplashScreen onBegin={() => setStep("info")} /> : null}

      {step === "info" ? (
        <InfoScreen onBack={() => setStep("splash")} onContinue={() => setStep("setup")} />
      ) : null}

      {step === "setup" ? (
        <SetupScreen
          name={name}
          setName={setName}
          onBack={() => setStep("info")}
          onContinue={createRoom}
          loading={loading}
          error={error}
        />
      ) : null}

      {step === "share" && roomId ? (
        <ShareScreen roomUrl={roomUrl} onCopy={copyLink} onEnter={enterRoom} />
      ) : null}
    </>
  );
}

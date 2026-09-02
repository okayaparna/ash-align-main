"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";


type Step = "splash" | "info" | "setup" | "share";


const CARDS = [
  {
    bg: "/card-wood-bg.svg",
    accent: "#171717",
    label: "First",
    title: "A private talk with Ash",
    body: "You and your partner each start alone. Ash asks about what has been sitting with you, in your own words. Neither of you sees the other's answers.",
  },
  {
    bg: "/card-olive-bg.svg",
    accent: "#171717",
    label: "Then",
    title: "You come together",
    body: "Ash brings you both into one conversation and holds the shape of it, making room for each of you to speak and be heard without it turning into a fight.",
  },
  {
    bg: "/card-damson-bg.svg",
    accent: "#171717",
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
      className="flex h-10 w-10 items-center justify-center rounded-full border border-[#f5f5f5]"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.5 15L7.5 10L12.5 5" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

// --- Screen 1: Splash (essay layout) ---
const HERO_BUBBLES = [
  { who: "Maya", text: "i don't think you actually heard me last night", side: "l" as const, delay: 0 },
  { who: "Sam", text: "i want to. i just get defensive", side: "r" as const, delay: 0.9 },
  { who: "Ash", text: "Say more about that?", side: "c" as const, ash: true, delay: 1.8 },
];

const NOT_THIS = [
  ["Therapy", "Ash is not a therapist and this is not treatment. If something here opens up more than a conversation can hold, that is a signal to talk to a professional, not to keep typing."],
  ["A referee", "Ash will not tell you who is right. There is no verdict at the end, because the useful thing was never the verdict."],
  ["A transcript for later", "What you each say in the private phase stays in the private phase. Ash carries the shape of it into the room, not the words."],
];

function SplashScreen({ onBegin }: { onBegin: () => void }) {
  const [consentChecked, setConsentChecked] = useState(false);
  const gateRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-[100dvh] bg-[var(--surface-bg)]">
      <div className="mx-auto max-w-[610px] px-6">
        {/* Hero */}
        <header className="pt-[72px] text-center">
          <p className="font-display mb-9 text-[15px] italic text-[var(--contrast-weak)]">
            Align with Ash
          </p>

          <div className="relative mx-auto mb-6 h-[132px] max-w-[520px]">
            {HERO_BUBBLES.map((b, i) => (
              <div
                key={b.who}
                className={`splash-bub splash-bub-${b.side}`}
                style={{ top: `${i * 46}px`, animationDelay: `${b.delay}s` }}
              >
                <span className={`splash-av${b.ash ? " ash" : ""}`}>{b.who[0]}</span>
                <span className={`splash-msg${b.ash ? " ash" : ""}`}>{b.text}</span>
              </div>
            ))}
          </div>

          <h1 className="font-display text-[clamp(34px,7vw,54px)] leading-[1.06] text-[var(--contrast-strong)]">
            A mediated space for couples
          </h1>
          <p className="mx-auto mt-6 max-w-[430px] text-[16px] leading-[1.5] text-[var(--contrast-weak)]">
            Two people, one room, and a third voice whose only job is to keep the
            conversation honest.
          </p>

          <button
            onClick={() => gateRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })}
            className="ui-pill mt-8"
          >
            Begin a session
            <span className="ui-arrow">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h9M8.5 4.5L12 8l-3.5 3.5" stroke="currentColor" strokeWidth="1.4"
                      strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </button>
        </header>

        {/* Essay */}
        <section className="pt-16">
          <p className="splash-lead mb-5 text-[16px] leading-[1.5] text-[var(--contrast-weak)]">
            Most hard conversations between two people fail in the same few ways. One
            person gets louder, the other goes quiet. Something said in the first
            minute gets relitigated for an hour. Both leave feeling less understood
            than when they started.
          </p>
          <p className="text-[16px] leading-[1.5] text-[var(--contrast-weak)]">
            The problem is rarely that people lack the words. It is that no one in the
            room is holding the shape of the conversation, because both people are
            inside it. Ash sits in that seat: it asks each of you what is actually
            going on, brings you together, and keeps the exchange moving toward
            understanding instead of a scoreboard.
          </p>

          <h2 className="font-display mt-12 mb-4 text-[26px] leading-[1.15] text-[var(--contrast-strong)]">
            What this is not
          </h2>
          {NOT_THIS.map(([title, body]) => (
            <div key={title} className="mb-5">
              <p className="ui-subhead mb-1">{title}</p>
              <p className="text-[16px] leading-[1.5] text-[var(--contrast-weak)]">{body}</p>
            </div>
          ))}
        </section>

        {/* Consent gate + primary action */}
        <div ref={gateRef} className="border-t border-[var(--hairline)] mt-12 pt-10 pb-24">
          <p className="mx-auto mb-6 max-w-[420px] text-center text-sm leading-[1.5] text-[var(--contrast-weak)]">
            A space for the conversation you have been putting off. This is a demo and
            everything you share here disappears when you&apos;re done.
          </p>
          <label className="mx-auto mb-6 flex max-w-[420px] cursor-pointer items-start gap-3 text-left">
            <input
              type="checkbox"
              checked={consentChecked}
              onChange={(e) => setConsentChecked(e.target.checked)}
              className="mt-0.5 h-[17px] w-[17px] shrink-0 cursor-pointer rounded-[4px] border-[#404040] accent-[var(--contrast-strong)]"
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
        <h1 className="font-display text-[34px] leading-[1.12] tracking-[-0.01em] text-[var(--contrast-strong)]">
          How this works
        </h1>
        <p className="font-body text-[16px] font-normal leading-[1.5] text-[#404040]">
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
              <h2 className="font-display text-[24px] leading-[1.18] tracking-[-0.5px] text-[var(--contrast-strong)]">
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
          className="flex h-[64px] w-full items-center justify-center rounded-[var(--radius-pill)] bg-[var(--contrast-strong)] transition-opacity hover:opacity-85 font-body text-[17px] font-medium leading-[1.2] tracking-[-0.011em] text-[var(--surface-bg)]"
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
            if (e.key === "Enter" && canContinue) onContinue();
          }}
          className="h-[64px] rounded-[16px] bg-[#f5f5f5] px-[24px] font-body text-[16px] text-[#0a0a0a] outline-none"
          placeholder="Enter your name"
          autoFocus
        />
      </div>

      <div className="mx-auto mt-6 w-full max-w-[465px] px-6">
        <button
          onClick={onContinue}
          disabled={!canContinue}
          className="flex h-[64px] w-full items-center justify-center rounded-[var(--radius-pill)] bg-[var(--contrast-strong)] transition-opacity hover:opacity-85 font-body text-[17px] font-medium leading-[1.2] tracking-[-0.011em] text-[var(--surface-bg)] disabled:opacity-40"
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
        <h1 className="font-display text-[34px] leading-[1.12] tracking-[-0.01em] text-[var(--contrast-strong)]">
          Your room is ready
        </h1>
        <p className="font-body text-[16px] font-normal leading-[1.5] text-[#404040]">
          Send this link to your partner. You will each talk to Ash on your own first, then meet in the middle.
        </p>
      </div>

      <div className="mx-auto mt-12 flex w-full max-w-[465px] flex-col gap-3 px-6">
        <label className="font-body text-[12px] font-medium uppercase leading-[1.2] tracking-[1.25px] text-[#737373]">
          Room link
        </label>
        <div className="flex items-center gap-3 rounded-[16px] bg-[#f5f5f5] px-[24px] py-[20px]">
          <p className="min-w-0 flex-1 truncate font-body text-[14px] text-[#404040]">
            {roomUrl}
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon-link.svg" alt="" aria-hidden="true" className="h-5 w-5 shrink-0" />
        </div>
      </div>

      <div className="mx-auto mt-6 flex w-full max-w-[465px] flex-col items-center gap-4 px-6">
        <button
          onClick={onCopy}
          className="flex h-[64px] w-full items-center justify-center rounded-[var(--radius-pill)] bg-[var(--contrast-strong)] transition-opacity hover:opacity-85 font-body text-[17px] font-medium leading-[1.2] tracking-[-0.011em] text-[var(--surface-bg)]"
        >
          Copy link
        </button>
        <button
          onClick={onEnter}
          className="flex h-[64px] w-full items-center justify-center gap-2 rounded-[16px] border border-[#f5f5f5] font-body text-[17px] font-medium leading-[1.2] tracking-[-0.011em] text-[var(--contrast-strong)]"
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

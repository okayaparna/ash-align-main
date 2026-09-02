"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import AshWordmark from "@/components/AshWordmark";
import AshSignature from "@/components/AshSignature";
import { PixelCurtain } from "@/components/PixelLoader";
import { usePostHog } from "posthog-js/react";


type Step = "splash" | "info" | "setup" | "share";


const CARDS = [
  {
    label: "First",
    title: "A private talk with Ash",
    body: "You and your partner each start alone. Ash asks about what has been sitting with you, in your own words. Neither of you sees the other's answers.",
  },
  {
    label: "Then",
    title: "You come together",
    body: "Ash brings you both into one conversation and holds the shape of it, making room for each of you to speak and be heard without it turning into a fight.",
  },
  {
    label: "Finally",
    title: "Something to take away",
    body: "When you are both ready to wrap up, Ash writes back what it heard: where you align, what is still tender, and a few concrete things to try.",
  },
];

// --- Toast ---
function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <div
      className={`eyebrow pointer-events-none fixed left-1/2 top-[32px] z-50 -translate-x-1/2 bg-[var(--ink)] px-4 py-3 text-[var(--birch)] transition-all duration-300 ${visible ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"}`}
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
      className="flex h-11 w-11 items-center justify-center border border-[var(--hairline)] text-[var(--ink)] transition-colors duration-500 hover:bg-[var(--ink)] hover:text-[var(--birch)]"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" className="icon" aria-hidden="true">
        <path d="M19 12H5M11 18l-6-6 6-6" />
      </svg>
    </button>
  );
}

// --- Screen 1: Splash (split-screen composition) ---
// Left half is full-bleed imagery with the wordmark laid over it; right half
// is the birch content column. Swap HERO_IMAGE for the real photograph — it is
// the only thing standing between this and the reference comp.
const HERO_IMAGE = "/hero.jpg";


const NOT_THIS = [
  ["Therapy", "Ash is not a therapist and this is not treatment. If something here opens up more than a conversation can hold, that is a signal to talk to a professional, not to keep typing."],
  ["A referee", "Ash will not tell you who is right. There is no verdict at the end, because the useful thing was never the verdict."],
  ["A transcript for later", "What you each say in the private phase stays in the private phase. Ash carries the shape of it into the room, not the words."],
];

const SPLASH_TITLE = "Align with Ash";

function SplashScreen({ onBegin, ready }: { onBegin: () => void; ready: boolean }) {
  const [consentChecked, setConsentChecked] = useState(false);
  /** How many characters of the title are on screen. */
  const [typed, setTyped] = useState(0);
  /** Everything below the title waits for the typing to land. */
  const [revealed, setRevealed] = useState(false);

  /* Held until the curtain is off the screen, otherwise the whole thing types
     itself out behind it and the user never sees it. */
  useEffect(() => {
    if (!ready) return;
    let i = 0;
    const tick = setInterval(() => {
      i += 1;
      setTyped(i);
      if (i >= SPLASH_TITLE.length) clearInterval(tick);
    }, 68);
    const reveal = setTimeout(
      () => setRevealed(true),
      SPLASH_TITLE.length * 68 + 260
    );
    return () => {
      clearInterval(tick);
      clearTimeout(reveal);
    };
  }, [ready]);

  const done = typed >= SPLASH_TITLE.length;

  return (
    <div className="min-h-[100dvh] bg-[var(--birch)] lg:grid lg:grid-cols-2">
      {/* ---- Left: imagery. Sticks while the right column scrolls. ---- */}
      <div className="grain relative h-[42vh] overflow-hidden bg-[rgba(0,0,0,0.06)] lg:sticky lg:top-0 lg:h-[100dvh]">
        <Image
          src={HERO_IMAGE}
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
        {/* Top scrim. The reference site does exactly this on its hero
            (.hero--home::after: black-to-transparent, 46% tall, 0.4 opacity).
            Here it earns its place twice over: the mobile crop lands the
            wordmark on pale hair, where white alone measured 3.4:1. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-[5] h-[40%] bg-gradient-to-b from-black/45 to-transparent"
        />
        {/* White, not black: the photograph is dark where the mark sits at
            desktop, and the scrim carries it everywhere else. */}
        <AshWordmark
          className="absolute left-6 top-5 z-10 h-[26px] w-auto text-[var(--birch)] lg:left-9 lg:top-8 lg:h-[30px]"
          style={{ filter: "drop-shadow(0 1px 6px rgba(0,0,0,0.35))" }}
        />
      </div>

      {/* ---- Right: content column ---- */}
      <div className="flex flex-col">
        {/* Hero block, sized to the viewport so the first paint matches the comp */}
        <section className="flex flex-col justify-center px-6 py-16 sm:px-10 lg:min-h-[100dvh] lg:px-16 xl:px-24">
          <div className="w-full max-w-[440px]">
            {/* The invisible copy holds the final box so the line does not
                reflow under the caret as it types. */}
            <h1 className="section-title relative">
              <span aria-hidden="true" className="invisible">
                {SPLASH_TITLE}
              </span>
              <span className="absolute inset-0">
                {SPLASH_TITLE.slice(0, typed)}
                {ready && !done ? (
                  <span className="type-caret" aria-hidden="true" />
                ) : null}
              </span>
            </h1>

            <p
              className="mt-6 max-w-[400px] text-[16px] leading-[1.3] text-[var(--contrast-medium)] transition-opacity duration-700"
              style={{ opacity: revealed ? 1 : 0 }}
            >
              You&apos;ve been invited to try a new tool for relationships. This is a
              demo and everything you share here disappears when you&apos;re done.
            </p>

            <div
              className="mt-16 transition-opacity duration-700 lg:mt-24"
              style={{
                opacity: revealed ? 1 : 0,
                transitionDelay: revealed ? "220ms" : "0ms",
                pointerEvents: revealed ? "auto" : "none",
              }}
            >
              <label className="flex cursor-pointer items-start gap-3 text-left">
                {/* Square box, black fill, birch tick — the reference has no
                    rounded controls and no accent color on form elements. */}
                <span className="relative mt-px inline-flex h-[18px] w-[18px] shrink-0">
                  <input
                    type="checkbox"
                    checked={consentChecked}
                    onChange={(e) => setConsentChecked(e.target.checked)}
                    className="peer h-[18px] w-[18px] cursor-pointer appearance-none border border-[var(--ink)] bg-transparent transition-colors checked:bg-[var(--ink)]"
                  />
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 m-auto h-3 w-3 text-[var(--birch)] opacity-0 transition-opacity peer-checked:opacity-100"
                    fill="none"
                    stroke="currentColor"
                    style={{ strokeWidth: 3, strokeLinecap: "round", strokeLinejoin: "round" }}
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </span>
                <span className="text-[14px] leading-[1.4] text-[var(--contrast-medium)]">
                  I am 18 or older, and I agree to the{" "}
                  <a
                    href="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2 text-[var(--ink)]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Terms of Use
                  </a>
                </span>
              </label>

              <button
                onClick={onBegin}
                disabled={!consentChecked}
                className="button button--black button--block mt-7"
              >
                Begin
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

// --- Screen 2: How this works, with the essay on a sheet that rides over it ---
/* The three steps sit on a sticky layer. The essay is a sheet of paper that
   starts peeking above the fold, rides up over the steps as you scroll, and
   slides back down to reveal them again when you scroll away. The sticky layer
   plus a negative margin does all the movement — scroll position only drives
   the tilt and settle, so there is no scroll-jacking. */
const PAPER_PEEK = 92;

function InfoScreen({ onBack, onContinue }: { onBack: () => void; onContinue: () => void }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  /** 0 = resting at the bottom edge, 1 = fully raised and squared up. */
  const [lift, setLift] = useState(0);
  const [tilt, setTilt] = useState(false);

  const onCardScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    if (!card) return;
    const stride = card.offsetWidth + 16;
    setActive(Math.round(el.scrollLeft / stride));
  }, []);

  useEffect(() => {
    const el = paperRef.current;
    if (!el) return;

    let frame = 0;
    const measure = () => {
      frame = 0;
      const travel = Math.max(1, window.innerHeight - PAPER_PEEK);
      const top = el.getBoundingClientRect().top;
      setLift(1 - Math.min(1, Math.max(0, top / travel)));
      /* The tilt overhangs horizontally, so only take it where there is room
         beside the sheet. Below lg it would force a sideways scrollbar. */
      setTilt(window.innerWidth >= 1024);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const settle = 1 - lift;

  return (
    <div className="relative bg-[var(--birch)]">
      {/* ---- Base layer: the three steps, pinned while the sheet passes ---- */}
      <div className="sticky top-0 flex h-[100dvh] flex-col bg-[rgba(0,0,0,0.10)]">
        <div className="px-6 pt-6">
          <BackButton onClick={onBack} />
        </div>

        <div className="animate-fade-in flex flex-col gap-4 px-6 pt-6 text-center lg:mx-auto lg:max-w-[600px]">
          <h1 className="section-title text-[34px] lg:text-[44px]">How this works</h1>
          <p className="text-[16px] leading-[1.35] text-[var(--contrast-medium)]">
            Three parts, about thirty minutes. You can stop at any point.
          </p>
        </div>

        <div
          ref={scrollerRef}
          onScroll={onCardScroll}
          className="mt-8 flex items-stretch snap-x snap-mandatory gap-7 overflow-x-auto px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:justify-center"
        >
          {CARDS.map((card) => (
            <article
              key={card.title}
              className="flex w-[290px] shrink-0 snap-center flex-col gap-2.5 bg-[var(--birch)] p-7"
            >
              <span className="eyebrow text-[rgba(0,0,0,0.32)]">{card.label}</span>
              <h2 className="section-title text-[19px] lg:text-[21px]">{card.title}</h2>
              <p className="text-[14px] leading-[1.4] text-[var(--contrast-medium)]">
                {card.body}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-4 flex justify-center gap-2 lg:hidden">
          {CARDS.map((card, i) => (
            <span
              key={card.title}
              className={`h-[3px] w-6 transition-colors ${i === active ? "bg-[var(--ink)]" : "bg-[rgba(0,0,0,0.15)]"}`}
            />
          ))}
        </div>

        <div className="mx-auto mt-10 w-full max-w-[465px] px-6">
          <button onClick={onContinue} className="button button--black button--block">
            Continue
          </button>
        </div>
      </div>

      {/* ---- The sheets ---- */}
      <div
        ref={paperRef}
        className="relative z-10 pb-24"
        style={{ marginTop: `-${PAPER_PEEK}px` }}
      >
        {/* --- Leaf one: what this is --- */}
        <div
          className="relative mx-auto w-full lg:w-[1100px] lg:max-w-[94vw]"
          style={{
            transform: `rotate(${(tilt ? -3.4 * settle : 0).toFixed(2)}deg) scale(${(0.95 + 0.05 * lift).toFixed(3)})`,
            transformOrigin: "50% 0%",
            willChange: "transform",
          }}
        >
          {/* Leaves underneath, so the edges of a stack show at the margins. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[var(--paper-edge-2)]"
            style={{ transform: "rotate(0.9deg) translate(9px, 14px)" }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[var(--paper-edge)]"
            style={{ transform: "rotate(-1.2deg) translate(-8px, 7px)" }}
          />

          <section className="sheet grain grain--paper relative z-10 overflow-hidden pb-44 pl-16 pr-6 sm:pl-20 sm:pr-10 lg:pl-28 lg:pr-16"
            style={{ boxShadow: `0 -24px ${(36 + 36 * settle).toFixed(0)}px -18px rgba(0,0,0,${(0.16 + 0.18 * settle).toFixed(2)})` }}
          >
            <div className="sheet-holes" aria-hidden="true">
              <span className="sheet-punch" />
              <span className="sheet-punch" />
              <span className="sheet-punch" />
            </div>

            {/* Floats on the exposed strip and fades as the sheet squares up. */}
            <div
              aria-hidden={lift > 0.4}
              className="pointer-events-none absolute inset-x-0 top-0 z-[2] flex h-[92px] items-center justify-center gap-2"
              style={{ opacity: Math.max(0, 1 - lift * 2.4), transition: "opacity 120ms linear" }}
            >
              <span className="eyebrow text-[var(--contrast-medium)]">Scroll to read</span>
              <svg width="13" height="13" viewBox="0 0 24 24" className="icon text-[var(--contrast-medium)]" aria-hidden="true">
                <path d="M12 5v14M19 12l-7 7-7-7" />
              </svg>
            </div>

            <div className="relative z-[2] pt-[92px]">
              <div className="sheet-meta flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1">
                <span>Subject: What this is</span>
                <span>Align with Ash</span>
              </div>
              <hr className="sheet-rule mt-2" />
              <div className="sheet-meta mt-3 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1">
                <span>A mediated space for two people</span>
                <span>Doc. no: AA-001 &nbsp;·&nbsp; Page 01 / 02</span>
              </div>
              <hr className="sheet-rule mt-3" />

              <div className="w-full max-w-[620px] pt-12">
                <p className="sheet-body mb-6">
                  Most hard conversations between two people fail in the same few ways. One
                  person gets louder, the other goes quiet. Something said in the first
                  minute gets relitigated for an hour. Both leave feeling less understood
                  than when they started.
                </p>
                <p className="sheet-body">
                  The problem is rarely that people lack the words. It is that no one in the
                  room is holding the shape of the conversation, because both people are
                  inside it. Ash sits in that seat: it asks each of you what is actually
                  going on, brings you together, and keeps the exchange moving toward
                  understanding instead of a scoreboard.
                </p>
              </div>

              {/* Signed off, like the letter this sheet is dressed as. Sits
                  outside the 620px measure so it lands in the right margin
                  rather than tucking under the last line. */}
              <div className="mt-12 flex justify-end pr-2 sm:pr-10 lg:pr-16">
                <AshSignature className="h-[clamp(54px,5.5vw,82px)] w-auto text-[var(--ink)] opacity-45" />
              </div>
            </div>
          </section>
        </div>

        {/* --- Leaf two: what this is not, laid over the first --- */}
        <div
          className="relative mx-auto -mt-[72px] w-full lg:-mt-[96px] lg:w-[980px] lg:max-w-[88vw]"
          style={{
            transform: `rotate(${(tilt ? 2.4 * settle : 0).toFixed(2)}deg) scale(${(0.955 + 0.045 * lift).toFixed(3)})`,
            transformOrigin: "50% 0%",
            willChange: "transform",
          }}
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[var(--paper-edge)]"
            style={{ transform: "rotate(-1deg) translate(-7px, 9px)" }}
          />

          <section
            className="sheet sheet--alt grain grain--paper relative z-10 overflow-hidden pb-16 pl-16 pr-6 pt-14 sm:pl-20 sm:pr-10 lg:pl-28 lg:pr-16"
            style={{ boxShadow: "0 -20px 44px -16px rgba(0,0,0,0.26)" }}
          >
            <div className="sheet-holes" aria-hidden="true">
              <span className="sheet-punch" />
              <span className="sheet-punch" />
              <span className="sheet-punch" />
            </div>

            <div className="relative z-[2]">
              <div className="sheet-meta flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1">
                <span>Subject: What this is not</span>
                <span>Doc. no: AA-002 &nbsp;·&nbsp; Page 02 / 02</span>
              </div>
              <hr className="sheet-rule mt-2" />

              <div className="w-full max-w-[620px] pt-10">
                {NOT_THIS.map(([title, body]) => (
                  <div key={title} className="mb-7">
                    <p className="sheet-meta mb-2">{title}</p>
                    <p className="sheet-body">{body}</p>
                  </div>
                ))}

                <button onClick={onContinue} className="button button--black button--block mt-10">
                  Continue
                </button>
                <p className="sheet-meta mt-6 text-center opacity-60">
                  Or scroll back up for the three steps
                </p>
              </div>
            </div>
          </section>
        </div>
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
    <div className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-[var(--birch)]">
      <div className="px-6 pt-6">
        <BackButton onClick={onBack} />
      </div>

      <div className="animate-fade-in flex flex-col gap-4 px-6 pt-8 text-center lg:mx-auto lg:max-w-[600px]">
        <h1 className="section-title text-[34px] lg:text-[44px]">
          To begin with,
        </h1>
        <p className="text-[16px] leading-[1.35] text-[var(--contrast-medium)]">
          What should Ash call you during the session?
        </p>
      </div>

      <div className="relative z-10 mx-auto mt-16 flex w-full max-w-[465px] flex-col gap-3 px-6">
        <label className="eyebrow text-[var(--contrast-weak)]">
          Your name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && canContinue) onContinue();
          }}
          className="field h-[60px]"
          placeholder="Enter your name"
          autoFocus
        />
      </div>

      <div className="mx-auto mt-6 w-full max-w-[465px] px-6">
        <button
          onClick={onContinue}
          disabled={!canContinue}
          className="button button--black button--block"
        >
          {loading ? "Creating your room..." : "Continue"}
        </button>
        {error ? (
          <p className="mt-4 text-center text-[14px] leading-[1.4] text-[var(--destructive)]">
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
    <div className="flex min-h-[100dvh] flex-col bg-[var(--birch)]">
      <div className="animate-fade-in flex flex-col gap-4 px-6 pt-24 text-center lg:mx-auto lg:max-w-[600px]">
        <h1 className="section-title text-[34px] lg:text-[44px]">
          Your room is ready
        </h1>
        <p className="text-[16px] leading-[1.35] text-[var(--contrast-medium)]">
          Send this link to your partner. You will each talk to Ash on your own first, then meet in the middle.
        </p>
      </div>

      {/* Field and copy button are siblings in a row, not an icon tucked inside
          the field. The icon button does the copying; the block CTA below is
          the way forward, so the two actions stop competing. */}
      <div className="mx-auto mt-12 flex w-full max-w-[465px] flex-col gap-3 px-6">
        <label htmlFor="room-link" className="eyebrow text-[var(--contrast-weak)]">
          Room link
        </label>
        <div className="flex items-stretch gap-3">
          <p
            id="room-link"
            className="flex min-w-0 flex-1 items-center truncate bg-[rgba(0,0,0,0.05)] px-4 py-[18px] font-ui text-[14px] tracking-[0.02em] text-[var(--contrast-medium)]"
          >
            {roomUrl}
          </p>
          <button
            onClick={onCopy}
            aria-label="Copy room link"
            className="flex w-[58px] shrink-0 items-center justify-center bg-[rgba(0,0,0,0.05)] text-[var(--ink)] transition-colors duration-500 hover:bg-[var(--ink)] hover:text-[var(--birch)]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" className="icon" aria-hidden="true">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </button>
        </div>
      </div>

      <div className="mx-auto mt-6 w-full max-w-[465px] px-6">
        {/* Not "Enter your room" — creators take the pre-session survey next,
            so promising the room here would be a lie for one screen. */}
        <button onClick={onEnter} className="button button--black button--block">
          Continue
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const posthog = usePostHog();

  /* The curtain covers the very first paint and dissolves off it. */
  const [booting, setBooting] = useState(true);
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
      {booting ? <PixelCurtain brand onDone={() => setBooting(false)} /> : null}
      <Toast message="Link copied to clipboard" visible={toastVisible} />

      {step === "splash" ? (
        <SplashScreen onBegin={() => setStep("info")} ready={!booting} />
      ) : null}

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

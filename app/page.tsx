"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import AshWordmark from "@/components/AshWordmark";
import BackButton from "@/components/BackButton";
import InfoScreen from "@/components/InfoScreen";
import { PixelCurtain } from "@/components/PixelLoader";
import { usePostHog } from "posthog-js/react";


type Step = "splash" | "info" | "setup" | "share";



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


// --- Screen 1: Splash (split-screen composition) ---
// Left half is full-bleed imagery with the wordmark laid over it; right half
// is the birch content column. Swap HERO_IMAGE for the real photograph — it is
// the only thing standing between this and the reference comp.
const HERO_IMAGE = "/hero.jpg";



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

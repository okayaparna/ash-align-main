"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import AshSignature from "@/components/AshSignature";
import BackButton from "@/components/BackButton";

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


const NOT_THIS = [
  ["Therapy", "Ash is not a therapist and this is not treatment. If something here opens up more than a conversation can hold, that is a signal to talk to a professional, not to keep typing."],
  ["A referee", "Ash will not tell you who is right. There is no verdict at the end, because the useful thing was never the verdict."],
  ["A transcript for later", "What you each say in the private phase stays in the private phase. Ash carries the shape of it into the room, not the words."],
];


// --- Screen 2: How this works, with the essay on a sheet that rides over it ---
/* The three steps sit on a sticky layer. The essay is a sheet of paper that
   starts peeking above the fold, rides up over the steps as you scroll, and
   slides back down to reveal them again when you scroll away. The sticky layer
   plus a negative margin does all the movement — scroll position only drives
   the tilt and settle, so there is no scroll-jacking. */
const PAPER_PEEK = 92;


export default function InfoScreen({ onBack, onContinue }: { onBack: () => void; onContinue: () => void }) {
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


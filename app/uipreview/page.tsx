import { Instrument_Serif } from "next/font/google";

/**
 * UI direction preview — Ando-inspired visual language applied to Ash Align.
 *
 * Isolated on purpose: this route imports no shared components and touches no
 * global tokens, so nothing here affects the live splash / room / conclusion
 * screens. Everything is scoped under `.ap` below.
 *
 * Design language borrowed (structure, not assets):
 *   near-white ground · ink serif headings at weight 400 · narrow single column
 *   hairline transparent pill buttons · long-form essay body with drop cap
 */

const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-display-preview",
});

const BUBBLES = [
  { who: "Maya", text: "i don't think you actually heard me last night", side: "l", delay: 0 },
  { who: "Sam", text: "i want to. i just get defensive", side: "r", delay: 0.9 },
  { who: "Ash", text: "Say more about that?", side: "l", ash: true, delay: 1.8 },
];

const PHASES = [
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

const NOT = [
  ["Therapy", "Ash is not a therapist and this is not treatment. If something here opens up more than a conversation can hold, that is a signal to talk to a professional, not to keep typing."],
  ["A referee", "Ash will not tell you who is right. There is no verdict at the end, because the useful thing was never the verdict."],
  ["A transcript for later", "What you each say in the private phase stays in the private phase. Ash carries the shape of it into the room, not the words."],
];

function Arrow() {
  return (
    <span className="ap-arrow" aria-hidden="true">
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path d="M3 8h9M8.5 4.5L12 8l-3.5 3.5" stroke="currentColor" strokeWidth="1.4"
              strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export default function UiPreview() {
  return (
    <div className={`ap ${display.variable}`}>
      <style>{`
        .ap {
          --ink: #282828;
          --ink-soft: #6b6b6b;
          --ground: #fcfcfc;
          --hairline: rgba(0, 0, 0, 0.1);
          --col: 610px;

          min-height: 100vh;
          background: var(--ground);
          color: var(--ink);
          font-family: "Google Sans", ui-sans-serif, system-ui, sans-serif;
          font-size: 16px;
          line-height: 24px;
          -webkit-font-smoothing: antialiased;
        }
        .ap-serif {
          font-family: var(--font-display-preview), Georgia, "Times New Roman", serif;
          font-weight: 400;
          letter-spacing: -0.01em;
        }

        /* ---------- pill buttons ---------- */
        .ap-pill {
          display: inline-flex; align-items: center; gap: 10px;
          border: 1px solid var(--hairline); border-radius: 999px;
          background: transparent; color: var(--ink);
          font: inherit; font-size: 16px;
          padding: 7px 8px 7px 18px;
          transition: background 160ms ease, border-color 160ms ease;
        }
        .ap-pill:hover { background: rgba(0,0,0,0.03); border-color: rgba(0,0,0,0.18); }
        .ap-arrow {
          width: 28px; height: 28px; border-radius: 999px;
          background: var(--ink); color: var(--ground);
          display: grid; place-items: center; flex: none;
        }

        /* ---------- layout ---------- */
        .ap-wrap { max-width: var(--col); margin: 0 auto; padding: 0 24px; }
        .ap-hero { padding: 76px 0 64px; text-align: center; }
        .ap-hero h1 { margin: 0 0 28px; font-size: 54px; line-height: 1.06; }
        .ap-sub { color: var(--ink-soft); max-width: 430px; margin: 0 auto 30px; }

        /* ---------- hero bubbles ---------- */
        .ap-stage { height: 132px; position: relative; margin-bottom: 22px; }
        .ap-bub {
          position: absolute; display: flex; align-items: center; gap: 8px;
          opacity: 0; animation: ap-rise 620ms ease-out forwards;
        }
        .ap-bub.l { left: 0; }
        .ap-bub.r { right: 0; flex-direction: row-reverse; }
        .ap-bub:nth-child(1) { top: 0; }
        .ap-bub:nth-child(2) { top: 46px; }
        .ap-bub:nth-child(3) { top: 92px; left: 50%; transform: translateX(-50%); }
        .ap-av {
          width: 26px; height: 26px; border-radius: 999px; flex: none;
          background: #e7e4dd; border: 1px solid var(--hairline);
          display: grid; place-items: center; font-size: 11px; color: var(--ink-soft);
        }
        .ap-av.ash { background: var(--ink); color: var(--ground); border-color: var(--ink); }
        .ap-msg {
          background: #f1f0ed; border: 1px solid var(--hairline);
          border-radius: 999px; padding: 7px 15px; font-size: 14px;
          white-space: nowrap; color: var(--ink);
        }
        .ap-msg.ash { background: var(--ground); font-family: var(--font-display-preview), serif; font-size: 16px; }
        @keyframes ap-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .ap-bub:nth-child(3) { animation-name: ap-rise-c; }
        @keyframes ap-rise-c {
          from { opacity: 0; transform: translate(-50%, 10px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }

        /* ---------- prose ---------- */
        .ap-prose { padding-bottom: 20px; }
        .ap-prose p { color: var(--ink-soft); margin: 0 0 20px; }
        .ap-prose p.lead::first-letter {
          float: left; font-family: var(--font-display-preview), serif;
          font-size: 60px; line-height: 46px; padding: 6px 10px 0 0; color: var(--ink);
        }
        .ap-h2 { font-size: 26px; line-height: 1.15; margin: 46px 0 16px; }
        .ap-rule { height: 1px; background: var(--hairline); border: 0; margin: 52px 0 0; }

        .ap-item { margin: 0 0 22px; }
        .ap-item-h {
          display: flex; align-items: baseline; gap: 10px;
          margin-bottom: 7px;
        }
        .ap-item-t {
          font-family: "Google Sans", ui-sans-serif, system-ui, sans-serif;
          font-size: 19px; font-weight: 600; line-height: 26px;
          letter-spacing: -0.011em; color: var(--ink);
        }
        .ap-idx { font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-soft); }
        .ap-item p { margin: 0; color: var(--ink-soft); }

        .ap-fn {
          font-size: 13px; line-height: 20px; color: var(--ink-soft);
          border-top: 1px solid var(--hairline); margin-top: 30px; padding-top: 14px;
        }
        .ap-sup { font-size: 11px; vertical-align: super; color: var(--ink-soft); }

        .ap-cta { text-align: center; padding: 54px 0 90px; }
        .ap-cta h2 { font-size: 34px; line-height: 1.1; margin: 0 0 22px; }

        @media (max-width: 640px) {
          .ap-hero { padding: 56px 0 44px; }
          .ap-hero h1 { font-size: 38px; }
          .ap-msg { font-size: 13px; padding: 6px 12px; }
          .ap-stage { height: 124px; }
        }
      `}</style>


      <header className="ap-hero">
        <div className="ap-wrap">
          <div className="ap-stage">
            {BUBBLES.map((b) => (
              <div
                key={b.who}
                className={`ap-bub ${b.side}`}
                style={{ animationDelay: `${b.delay}s` }}
              >
                <span className={`ap-av${b.ash ? " ash" : ""}`}>{b.who[0]}</span>
                <span className={`ap-msg${b.ash ? " ash" : ""}`}>{b.text}</span>
              </div>
            ))}
          </div>

          <h1 className="ap-serif">A mediated space for couples</h1>
          <p className="ap-sub">
            Two people, one room, and a third voice whose only job is to keep the
            conversation honest.
          </p>
          <button className="ap-pill">
            Begin a session <Arrow />
          </button>
        </div>
      </header>

      <main className="ap-wrap">
        <section className="ap-prose">
          <p className="lead">
            Most hard conversations between two people fail in the same few ways. One
            person gets louder, the other goes quiet. Something said in the first
            minute gets relitigated for an hour. Both leave feeling less understood
            than when they started.
          </p>
          <p>
            The problem is rarely that people lack the words. It is that no one in the
            room is holding the shape of the conversation, because both people are
            inside it. Ash sits in that seat: it asks each of you what is actually
            going on, brings you together, and keeps the exchange moving toward
            understanding instead of a scoreboard.
          </p>

          <h2 className="ap-serif ap-h2">How a session moves</h2>
          <p>
            A session runs in three phases. You do not have to prepare anything, and
            it works over text, in your own time.<span className="ap-sup">1</span>
          </p>

          {PHASES.map((p) => (
            <div className="ap-item" key={p.title}>
              <div className="ap-item-h">
                <span className="ap-idx">{p.label}</span>
                <span className="ap-item-t">{p.title}</span>
              </div>
              <p>{p.body}</p>
            </div>
          ))}

          <h2 className="ap-serif ap-h2">What this is not</h2>
          {NOT.map(([t, b]) => (
            <div className="ap-item" key={t}>
              <div className="ap-item-h">
                <span className="ap-item-t">{t}</span>
              </div>
              <p>{b}</p>
            </div>
          ))}

          <p className="ap-fn">
            <span className="ap-sup">1</span> Sessions are asynchronous. If your partner
            steps away mid-conversation, the room stays open and picks up where you
            both left it.
          </p>
        </section>

        <hr className="ap-rule" />

        <section className="ap-cta">
          <h2 className="ap-serif">Start with one conversation</h2>
          <button className="ap-pill">
            Create a room <Arrow />
          </button>
        </section>
      </main>
    </div>
  );
}

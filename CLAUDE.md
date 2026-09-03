# Ash Align — Project Guide

## What This Is

A mediated conversation space for couples. Two participants join a shared room and go through AI-facilitated phases: **Intake** (private 1:1 with Ash), **Commons** (joint conversation), and **Conclusion** (AI-generated summary).

Built with Next.js 16, TypeScript, Tailwind CSS 4, Supabase (Postgres), and the Anthropic SDK.

Live URL: whatever Vercel assigns the project (`*.vercel.app`). Note that
`alignwithash.com` is company-owned and is not this deployment.

Nothing in the code hardcodes a host: share links are built from
`window.location.origin` at runtime, so an invite link always points at
whichever origin served the page.

## Critical Constraints

- **No direct database access.** The developer cannot push migrations or run SQL against the Supabase instance. All new features must work with the existing database schema, or use application-level workarounds (e.g., storing data in existing columns, using JSON in text fields, or client-side state).
- **The migration file `supabase/migrations/20260315000000_add_conclusion_phase.sql` exists but will NEVER be applied.** It is kept for reference only. All conclusion/wrap-up features have been implemented using application-level workarounds (see below).

## Database Workarounds

The DB schema only has two phases (`intake`, `commons`), no `wrap_up_ready` column, and no `conclusion_summary` column. The app works around this:

- **Wrap-up state** → Stored in `participants.summary` as JSON: `{ "intake": "…", "wrapUpReady": true }`. The `parseSummary()` helper in `lib/room.ts` handles both legacy plain-text and new JSON formats.
- **Conclusion phase** → The DB phase stays `commons`. The app derives "conclusion" by detecting a special marker message (`<!--CONCLUSION_SUMMARY:...-->`) in the messages table. `pollRoom()` checks for this marker and returns `phase: "conclusion"` to the client.
- **Conclusion summary** → Stored as a marker message in the `messages` table (role `assistant`, phase `commons`). The marker text is `<!--CONCLUSION_SUMMARY:{json}-->`. `pollRoom()` extracts the JSON and filters the marker from visible messages.

**When adding new features:** Always check if a new column/enum value is needed. If so, find an existing column to encode the data into (JSON in text fields, sentinel values, or derive from message content).

## Architecture

### Phases
1. **Intake** — Each participant has a private conversation with Ash (the AI). Messages are scoped per-participant.
2. **Commons** — Both participants join a shared conversation. Ash mediates, using turn management via `<!--NEXT:partner_a|partner_b|either-->` tags in AI responses.
3. **Conclusion** — AI generates a structured JSON summary with three sections (summary, insight, recommendations). Session ends with a Tally feedback popup.

### Key Files
- `lib/types.ts` — All shared types (`RoomPhase`, `RoomState`, `Participant`, `ChatMessage`, etc.)
- `lib/room.ts` — Core business logic: join, send, ready, wrapUp, poll, turn management
- `lib/anthropic.ts` — Anthropic SDK wrapper for AI responses
- `lib/prompts.ts` — All system prompts (intake, commons, summary, conclusion)
- `lib/supabase.ts` — Supabase client initialization
- `hooks/useSession.ts` — Client-side session hook (polling, send, ready, wrapUp)
- `hooks/useAutoScroll.ts` — Auto-scroll with double `requestAnimationFrame` for reliable timing
- `app/page.tsx` — Landing/setup page (split-screen splash → info → setup → share, for the room creator)
- `app/room/[roomId]/page.tsx` — Main room page (all phases rendered here; joiner flow: onboarding → name → chat)
- `components/MessageList.tsx` — Scrollable message area with optional footer slot for inline notices
- `components/MessageBubble.tsx` — Individual message rendering; splits assistant messages on `\n\n` into multiple bubbles
- `components/FinishedScreen.tsx` — Three-section conclusion display (summary/insight/recommendations) on flat 5% panels
- `components/ChatInput.tsx` — Message input bar
- `components/TypingIndicator.tsx` — Animated typing dots

### API Routes (all under `app/api/room/`)
- `POST /create` — Create a new room
- `POST /join` — Join with a name, get/create participant
- `POST /message` — Send a message (phase-aware)
- `POST /poll` — Long-poll for state and message updates (1.5s interval)
- `POST /ready` — Mark intake as complete (triggers AI summary when both ready)
- `POST /wrapup` — Mark wrap-up ready (triggers conclusion when both ready)
- `GET /info` — Fetch room info

## Design System

**Ported wholesale from https://meadowell.com/ (see "Reference site" below).**
shadcn/ui (new-york style) still provides the primitives, but every token now
resolves onto the meadowell palette. Tokens live in `app/globals.css`; `cn()`
helper in `lib/utils.ts`; primitives in `components/ui/`.

### Reference site
The palette, type roles, button geometry, field skin, square corners and icon
style are lifted from meadowell.com's own computed styles, not approximated.
When adding UI, check the reference before inventing something.

### Palette
Four primitives, defined in `:root` — there is **no white and no gray ramp**.
Depth comes from black at low alpha over the birch ground.

| Token | Value | Role |
|---|---|---|
| `--birch` | `#edebe4` | page ground, every screen |
| `--ink` | `#000000` | type, and the "black" button |
| `--brand` | `#ead268` | brand yellow, primary CTA, "you" |
| `--green` | `#d6ebc5` | the one supporting accent, "your partner" |

Every shadcn token maps onto these (`--background: var(--birch)`,
`--primary: var(--brand)`, `--muted: rgba(0,0,0,0.05)`, and so on), and the
legacy Ash Align aliases (`--surface-bg`, `--contrast-*`, `--wood-*`,
`--olive-*`, `--damson-*`) all resolve there too, so the ~200 existing call
sites keep working. Prefer `var(--birch)` / `var(--ink)` in new code.

### Fonts
The reference site runs Displaay's **Season** superfamily everywhere. Here it is
**scoped to headings only** — Season never touches the chat surface, because a
licensed display face on every message bubble is heavy to load and to read.

| Role | Face | CSS variable |
|---|---|---|
| Headings (`.section-title`, `.font-display`, `.ui-subhead`, drop cap) | Season Mix 400/500/600 | `--font-display-src` |
| Eyebrows (`.eyebrow` / `.small-text`) | Season Sans SemiBold | `--font-kicker-src` |
| Everything else — body, buttons, fields, **the whole chat** | Inter 400/500/600 | `--font-ui-src` |

Eyebrows keep a Season face because they are section kickers sitting above the
headings (they are `<h2>`/`<h3>` on the reference site too), not chat chrome.

**The Season files in `app/fonts/season/` are TRIAL cuts.** The filenames keep
the `TRIAL` marker deliberately so this stays visible. They must be swapped for
licensed files before this ships to production — drop licensed `.woff2` into
that folder and update the paths in `app/layout.tsx`. Nothing else in the
codebase names a typeface. They sit in `app/fonts/` rather than `public/` so
Next serves hashed copies and the raw trial files aren't downloadable from a
guessable URL.

### Type roles
Straight off the reference's computed styles:

- `.section-title` — `clamp(34px, 4.6vw, 56px)` at **line-height 1.0**. Set
  solid is the reference's signature; do not add leading.
- Body — 16px / 1.3 on the display face. This is the `body` default.
- `.eyebrow` (their `.small-text`) — 11px uppercase, `0.1em`, UI face 600.
  Every kicker, field label and section label.
- `.ui-subhead` — 19px display face for inline sub-headings.

### Shape and motion
- **Square everywhere.** `--radius: 0`, and `--radius-sm/md/lg/xl` and
  `--radius-pill` all collapse to it. The only round things are avatars
  (`--radius-circle`), loading dots and spinners.
- `--ease-slow: 1s cubic-bezier(0.16, 1, 0.3, 1)` — the reference's button
  cross-fade, which *inverts the fill* rather than changing opacity.
- `--ease-ui: 280ms cubic-bezier(0.23, 1, 0.32, 1)` — sliding UI (switch thumb).

### Buttons
One class with variants, geometry copied exactly: 14px / line-height 1 /
`0.02em` on the UI face, `1.15rem 1.6rem` padding, square.

- `.button` — yellow fill, black label. Hovers to black.
- `.button--black` — black fill, birch label. Hovers to yellow.
- `.button--basic` — 1px black outline, transparent. Hovers to black.
- `.button--block` — full width, slightly taller. For the flow CTAs.
- `.ui-pill` / `.ui-pill-solid` are kept as aliases of `--basic` / default.

### Fields
`.field` — black-at-5% fill, **no border**, square, `1rem` padding, `0.02em`
tracking on the UI face. Focus deepens the fill and adds an inset bottom rule.

### Icons
The reference uses 24-unit stroke icons: `currentColor`, `stroke-width: 1.8`,
round caps and joins, no fill. The `.icon` class applies that spec, and
`lucide-react` (already a dependency) matches it out of the box. The remaining
Material Symbols in `components/icons/MaterialIcons.tsx` are filled-path and
are the one place that still departs from the reference.

**Gotcha: keep component classes in `@layer components`.** `.button`, `.chip`,
`.action-btn` etc. set `display` and `width`; unlayered CSS beats every Tailwind
utility, so `hidden lg:inline-flex` or `mt-7` on a `.button` would silently do
nothing. The whole ported block is wrapped in that layer for this reason.

### Chat interface (Figma 81-1431, re-skinned onto the reference)
Layout geometry is still the Figma frame; the skin is meadowell.

- **Header, three zones** — participant chips left, phase switcher + copy-link
  centre, phase action right. No bottom rule.
- **Participant chips** (`.chip`) are square and colour-coded with the two brand
  accents: `--chip-self` (brand yellow) is you, `--chip-partner` (green) is your
  partner. The Material icon carries status — `chat_dashed` while they're still
  talking, `mark_chat_read` once they're ready / wrapped up.
- **Mobile header** stays on one row by condensing: below `lg` the chips become
  40px `.chip-avatar` **circles** (the one deliberate round element) carrying the
  initial, overlapping by 12px with self on top; below `md` the action button
  collapses to a 44px square with a check, the copy-link is hidden, and the
  switcher drops to 13px / 10px padding. Verified at 1440 / 1280 / 375.
- **Phase switcher** (`components/PhaseSwitch.tsx`) moves between your private
  room and the commons. The thumb is *measured*, not fixed-width, because the
  two labels differ in length; it re-measures on resize and after fonts load.
  **Thumb positioning:** `.phase-switch-thumb` needs an explicit `left: 0`.
  Without it the absolutely-positioned box takes its static position, already
  inset by the track's 4px padding, and the measured `translateX` double-counts.
- **Tooltips** (`components/Tooltip.tsx`, `.ui-tooltip`) are now a square black
  chip with birch uppercase 11px text. Pass `align="start" | "end"` for controls
  against a viewport edge, or the centred tooltip clips. `Tooltip`'s root is
  `inline-flex`, so hide it from a wrapper (`hidden md:contents`), not by
  passing it `hidden md:inline-flex`.
- **Bubbles** — `.msg-bubble`, square, 16px/20px padding, max-width 72%. There
  is no tail corner any more; the speaker is told by side and fill —
  `.msg-bubble-mine` is brand yellow, `.msg-bubble-theirs` is the 5% tint. Ash
  carries no bubble in any phase: plain left-aligned text.
- **Type scale** — `--msg-size` / `--msg-leading` (16/22) drive all chat text;
  `--ui-size` / `--ui-leading` (14/20) drive the header. Two lines to rescale.
- **Column** is `max-w-[610px]`, and messages are bottom-anchored (`mt-auto`).
- **Composer** is a square `--bubble` field with a 48px square `--action` send
  button. Disabled whenever the visible tab isn't the room's live phase.

### The "How this works" page and its sheet
`InfoScreen` in `app/page.tsx` is two layers:

- **Base** — the three step cards, on a `sticky top-0 h-[100dvh]` layer over a
  5%-black ground so the sheet (birch-ish `--paper`) reads as lighter on top.
  The cards carry no artwork; the space above each card's copy is the slot for
  illustrations to be dropped in later.
- **Sheet** — a document that starts peeking `PAPER_PEEK` (132px) above the
  fold via a negative top margin, rides up over the pinned steps as you scroll,
  and slides back down to reveal them when you scroll away.

**All the movement is `position: sticky` plus that negative margin — there is no
scroll-jacking.** Scroll position only drives the tilt/settle: the sheet sits at
−3.2° and scales up to square as it rises, and a "Scroll to read" label on the
exposed strip fades out. The tilt is suppressed below `lg`, because a rotated
full-bleed element overhangs horizontally and would force a sideways scrollbar
where there is no margin beside it. Verified 0px horizontal overflow at 1280.

**Don't wrap the sticky layer in `overflow-hidden`** — an ancestor with any
overflow other than `visible` silently kills `position: sticky`.

The sheet's skin is modelled on the reference site's letterhead: `--paper`
stock, monospace `.sheet-meta` rows across the head, `.sheet-rule` hairlines, a
`.sheet-punch` hole in the left margin, and `.sheet-body` typewriter copy. The
body stays sentence case; the reference sets its letter in uppercase, which
works for a few lines and punishes several paragraphs. The wording is our own —
only the treatment is borrowed.

### Grain
`.grain` lays a tiled fractal-noise SVG over a positioned ancestor via `::after`
(0.22 / `overlay`), so photography sits on the same slightly-analogue surface as
the paper. `.grain--paper` is the softer pass for the sheet (0.5 / `multiply`).
The hero `::after` sits at `z-1`, so the scrim and wordmark are pushed to `z-5`
and the sheet's own content to `z-2` to stay above it.

### Split-screen first pages
Both entry points use the same composition: full-bleed imagery in the left half
with the `Ash` wordmark laid over it, birch content column in the right half
(`section-title`, subcopy, square consent checkbox, full-width `.button--black`).
Below `lg` it stacks — image band at `42vh`, content beneath.

- Creator: `SplashScreen` in `app/page.tsx`. The left pane is `lg:sticky` and
  the right column scrolls on into the "What this is / is not" essay.
- Joiner: `SplashScreen` in `app/room/[roomId]/page.tsx`. Same frame; the three
  words of the title stagger in at 200/520/840ms.

**Imagery.** Both read `HERO_IMAGE = "/hero.jpg"` and render it through
`next/image` with `fill` + `priority`, so it is served as AVIF/WebP at a size
matched to the viewport. Source photos live outside the repo in
`portfolio-S26/ash_align_portfolio/filler_images/`. `public/card-1..3.svg` are
still palette-matched placeholders for the info carousel.

**Wordmark and scrim.** `components/AshWordmark.tsx` inlines the real mark with
`fill="currentColor"`, so one component covers the black and white variants —
set the colour with a text utility on the caller. Over the hero it is
`text-[var(--birch)]` (white), because the photograph is dark where the mark
sits on desktop.

A top scrim sits between the photo and the mark: black-to-transparent, 40% tall,
45% opacity. This is lifted from the reference site's own hero
(`.hero--home::after`) and it is load-bearing, not decoration — without it the
mobile crop lands the wordmark on pale hair at 3.4:1, below WCAG AA. With it,
measured 6.7:1 at 375 and 15.7:1 at 1280. **If you change the photograph,
re-check those two numbers** rather than assuming white still works.

### Full-screen transitions
`TransitionScreen` in `app/room/[roomId]/page.tsx` renders all three holds
(bouncing dots + heading + optional subtitle). They short-circuit the chat
render, so no header or composer shows:
1. **`waitingForPartner`** — intake, you're ready and your partner isn't.
2. **`bothReadyWaiting` / `commonsLoading`** — both ready, or commons has no
   messages yet. Rotates `transitionMessages` every 3s.
3. **`conclusionLoading`** — both wrapped up.

### Reading back your private room
`pollRoom()` returns `intakeMessages` alongside `messages`, so the "your room"
tab stays readable after the room moves to commons. No schema change — it is a
second read of the same `messages` table filtered by `intake_participant_id`.
The composer is closed on any tab that isn't the live phase.

### Dead code
`app/uipreview/page.tsx` is a standalone mockup with its own private palette. It
is untouched, kept as a record of a previous design direction.

(`BrushBackground.tsx` and `FlowBackground.tsx` — p5.js generative art on the
old green/brown palette — were deleted once the meadowell port made them
unreachable as well as unused.)


## Figma Reference
Primary file: `IBIPLegu5KnTMGlJvNy223`

## Conventions
- Phase-aware rendering: check `room.phase` or `state.phase` before rendering UI
- Turn management: AI responses contain `<!--NEXT:...-->` tags parsed by `parseNextSpeaker()`
- Polling-based updates (not websockets) — 1.5s interval via `useSession` hook
- Wrap-up status displayed as inline notices in the message stream (not a fixed bottom bar) using `WrapUpNotice` component with `WrapUpIcon`
- Participant status icons are phase-aware (typing indicator normally, checkmark when action taken)
- Send button is black in every phase, hovering to brand yellow like every other button
- Assistant messages split on `\n\n` into multiple bubbles for readability
- `remark-breaks` plugin used in ReactMarkdown for single-newline line breaks

## Prompt Engineering Notes

- All prompts include: "Avoid em dashes (—). Use commas, periods, or short sentences instead."
- Commons prompt includes varied reflective listening phrasings to avoid repetitive "reflect back"
- Commons prompt has explicit `=== PARTICIPANTS ===` block mapping participant names to roles (Partner A/B) to prevent name confusion
- Conclusion prompt requests structured JSON with `summary`, `insight`, `recommendations` keys
- Intake/opening prompts include name-role mapping and explicit instruction not to use "reflect back"

## Wrap-Up Flow

When a participant clicks "Wrap Up" in the commons phase:

1. **One partner wraps up**: An inline gray notice appears in the message stream: "{Name} has indicated that they are ready to **wrap up** this conversation..." The other user can keep chatting and sees the "Wrap Up" button in the top bar.
2. **The initiator sees**: "You have indicated that you are ready to **wrap up**. Waiting for {partner} to also wrap up..."
3. **Both wrap up**: A green notice appears: "Both parties are ready to wrap up. Synthesizing this chat into a conclusion." Then the app transitions to a full-screen loading state while the conclusion is generated.
4. **Conclusion screen**: Three-section display (summary/insight/recommendations)
   on flat 5% panels over the birch ground, closing with an **"End this session"**
   CTA.
5. **Post-session survey**: The CTA moves `FinishedScreen`'s local `step` to
   `"intro"` — a "Before you go" screen explaining that the answers are
   anonymous research data, with Continue / skip, mirroring the pre-session
   `survey-intro`. Continue then hands off to the same paged `SurveyScreen`
   used before the session (one question per screen, auto-advance, progress
   dots, back button). The questions used to sit inline on the conclusion as a
   `PostSurveyCard`; that component is now unused.

   **Skip** jumps to the last page via `SurveyScreen`'s `startIndex` prop rather
   than dead-ending, so people still land on the closing recommendation — and
   because nothing *advances* into that page, nothing is recorded, which is the
   right outcome for a skip.

   `SurveyScreen` gained support for the `link` question type so the trailing
   "Talk to Ash" recommendation is just the last page of the survey rather than
   a special case. Three consequences worth knowing: a `link` page carries no
   answer, so **the survey submits on the way *into* it** rather than on the way
   out (see `advance()` / `handleSkip()`); the `skip` control is hidden there
   because it is the terminal screen; and that page alone carries an **X at top
   right linking to `/`**, since it is the only point in the flow with somewhere
   to leave to.

## Home/Landing Page Flow

### Creator Flow (app/page.tsx)
1. **Splash** — Split screen: imagery + `Ash` wordmark left, "Align with Ash" +
   consent + Begin right. Scrolls on into the "What this is / is not" essay.
2. **Info** — Three step cards on a pinned layer, with the "What this is /
   is not" document riding over them on scroll (see above). Both that sheet and
   the steps layer carry an "Enter the journey" CTA.
3. **Setup** — Name entry
4. **Share** — The room link sits in a row with a square copy button beside it
   (not an icon inside the field); the copy button copies and fires the toast,
   and the block CTA below is "Enter your room".

### Joiner Flow (app/room/[roomId]/page.tsx)
1. **Onboarding** — The same split screen, with the title's three words
   staggering in. This is the screen the reference comp was drawn against.
2. **Name** — Name entry
3. **Survey intro / survey** — Optional pre-session questions (skippable)
4. **Chat** — Enters intake phase directly

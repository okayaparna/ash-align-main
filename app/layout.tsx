import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Archivo, Inter, Geist_Mono } from "next/font/google";
import { PostHogProvider } from "./providers";
import "./globals.css";

/* Type system ported from meadowell.com.

   Season is scoped to HEADINGS ONLY — it never touches the chat surface.
   The reference site uses it everywhere, but a licensed display face on every
   message bubble is both heavy to load and heavy to read, so:

     Season Mix   -> headings        (.section-title, .font-display, .ui-subhead)
     Season Sans  -> eyebrows        (.eyebrow — the section kickers, which are
                                      <h2>/<h3> on the reference site too)
     Archivo      -> body copy       (paragraphs, and every chat message)
     Inter        -> UI chrome       (buttons, fields, chips, switcher, tooltips)

   The Season files are Displaay TRIAL cuts. The filenames keep the TRIAL marker
   on purpose so it stays obvious they need swapping for licensed files before
   this ships. To swap: drop the licensed .woff2 into app/fonts/season/ and
   update the paths below. Nothing else in the codebase names a typeface.

   They live in app/fonts/ rather than public/ so Next serves hashed copies and
   the raw trial files aren't downloadable from a guessable URL. */
const displayFont = localFont({
  variable: "--font-display-src",
  display: "swap",
  src: [
    { path: "./fonts/season/SeasonMix-TRIAL-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/season/SeasonMix-TRIAL-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/season/SeasonMix-TRIAL-SemiBold.woff2", weight: "600", style: "normal" },
  ],
});

/* The reference's --font-alt: 11px uppercase kickers sit above the headings,
   so they count as heading furniture rather than chat chrome. */
const kickerFont = localFont({
  variable: "--font-kicker-src",
  display: "swap",
  src: [
    { path: "./fonts/season/SeasonSans-TRIAL-SemiBold.woff2", weight: "600", style: "normal" },
  ],
});

/* Body copy — paragraphs, and every message in the chat. Archivo.
   This is the face the app was tested on and the one to keep; it is a warmer,
   more open grotesque than Inter, which reads better at paragraph length. */
const bodyFont = Archivo({
  variable: "--font-body-src",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

/* UI chrome — buttons, fields, chips, the phase switcher, tooltips. Inter.
   Deliberately a different face from body copy: it is tighter and more neutral,
   so controls sit back and the reading text comes forward. */
const uiFont = Inter({
  variable: "--font-ui-src",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const monoFont = Geist_Mono({
  variable: "--font-mono-src",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ash Align",
  description: "A mediated space for couples to understand each other better",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#edebe4",
  interactiveWidget: "resizes-content",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${displayFont.variable} ${kickerFont.variable} ${bodyFont.variable} ${uiFont.variable} ${monoFont.variable}`}>
      <body className="font-sans antialiased">
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { PostHogProvider } from "./providers";
import "./globals.css";

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
  themeColor: "#ebe7de",
  interactiveWidget: "resizes-content",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital@1&display=swap" rel="stylesheet" />
      </head>
      <body>
          <PostHogProvider>{children}</PostHogProvider>
        </body>
    </html>
  );
}

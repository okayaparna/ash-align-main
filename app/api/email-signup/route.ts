import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const apiKey = process.env.LOOPS_API_KEY;
    if (!apiKey) {
      console.error("LOOPS_API_KEY is not set");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const res = await fetch("https://app.loops.so/api/v1/contacts/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        email,
        source: "pause_page",
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      // Treat duplicate contact as success
      if (res.status === 409 || body.includes("already exists")) {
        return NextResponse.json({ success: true });
      }
      console.error("Loops API error:", res.status, body);
      return NextResponse.json({ error: "Failed to subscribe" }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Email signup error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

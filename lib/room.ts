import type { SupabaseClient } from "@supabase/supabase-js";
import type { MessageParam } from "@anthropic-ai/sdk/resources/messages/messages";

import { generateResponse, summarize } from "./anthropic";
import { CONCLUSION_PROMPT, buildIntakePrompt, SUMMARY_PROMPT, buildCommonsPrompt, buildOpeningPrompt } from "./prompts";
import type { ChatMessage, NextSpeaker, Participant, ParticipantRole, Room, RoomState } from "./types";

// ─── Conclusion marker ───
// We store the AI-generated conclusion summary as a special message in the
// messages table (phase "commons", role "assistant") so we don't need a new
// column on rooms. Poll logic detects this marker and derives "conclusion" phase.
const CONCLUSION_MARKER = "<!--CONCLUSION_SUMMARY:";

function extractConclusionSummary(messages: ChatMessage[]): string | null {
  const marker = messages.find((m) => m.text.startsWith(CONCLUSION_MARKER));
  if (!marker) return null;
  const match = marker.text.match(/<!--CONCLUSION_SUMMARY:([\s\S]+?)-->/);
  return match?.[1]?.trim() || null;
}

function isConclusionMarker(msg: ChatMessage): boolean {
  return msg.text.startsWith(CONCLUSION_MARKER);
}

// ─── Hand-raise marker ───
// When a partner raises their hand during commons, we insert a special marker
// message. This is filtered from visible messages but stays in the Anthropic
// context so Ash knows someone wants to speak. A hand is considered "active"
// if the marker appears after the last assistant message.
const HAND_RAISED_MARKER = "<!--HAND_RAISED-->";

function isHandRaisedMarker(msg: ChatMessage): boolean {
  return msg.text === HAND_RAISED_MARKER;
}

function detectHandsRaised(messages: ChatMessage[]): { partnerAHandRaised: boolean; partnerBHandRaised: boolean } {
  let partnerAHandRaised = false;
  let partnerBHandRaised = false;

  // Walk backwards — a hand is active only if it appears after the last assistant message
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg.role === "assistant") break; // stop at last Ash response
    if (isHandRaisedMarker(msg)) {
      if (msg.role === "partner_a") partnerAHandRaised = true;
      if (msg.role === "partner_b") partnerBHandRaised = true;
    }
  }

  return { partnerAHandRaised, partnerBHandRaised };
}

// ─── Summary field encoding ───
// The participants.summary column stores a plain string during intake.
// When a participant clicks "Wrap Up", we encode wrap-up state into JSON:
//   { "intake": "…original summary…", "wrapUpReady": true }
// parseSummary handles both legacy (plain text) and new (JSON) formats.

interface ParsedSummary {
  intake: string;
  wrapUpReady: boolean;
}

function parseSummary(summary: string): ParsedSummary {
  if (!summary) return { intake: "", wrapUpReady: false };
  try {
    const parsed = JSON.parse(summary);
    if (parsed && typeof parsed === "object" && "intake" in parsed) {
      return { intake: parsed.intake || "", wrapUpReady: !!parsed.wrapUpReady };
    }
  } catch {
    // Not JSON — legacy plain-text summary from intake
  }
  return { intake: summary, wrapUpReady: false };
}

function encodeSummary(intake: string, wrapUpReady: boolean): string {
  return JSON.stringify({ intake, wrapUpReady });
}

// ─── Parse <!--NEXT:partner_a|partner_b|either--> from Ash's response ───
function parseNextSpeaker(rawText: string): { cleanText: string; nextSpeaker: NextSpeaker | null } {
  const match = rawText.match(/<!--\s*NEXT:(partner_a|partner_b|either)\s*-->/i);
  const nextSpeaker = (match?.[1]?.toLowerCase() as NextSpeaker | undefined) || null;
  const cleanText = rawText.replace(/<!--\s*NEXT:(partner_a|partner_b|either)\s*-->/gi, "").trim();
  return { cleanText, nextSpeaker };
}

// ─── DB helpers ───

async function getRoom(db: SupabaseClient, roomId: string): Promise<Room> {
  const { data, error } = await db.from("rooms").select("*").eq("id", roomId).single();
  if (error || !data) throw new Error("Room not found");
  return data as Room;
}


async function getParticipants(db: SupabaseClient, roomId: string): Promise<Participant[]> {
  const { data } = await db
    .from("participants")
    .select("*")
    .eq("room_id", roomId)
    .order("created_at", { ascending: true });
  return (data || []) as Participant[];
}

async function getParticipant(db: SupabaseClient, participantId: string): Promise<Participant> {
  const { data, error } = await db.from("participants").select("*").eq("id", participantId).single();
  if (error || !data) throw new Error("Participant not found");
  return data as Participant;
}

// Get visible messages for a participant based on current phase
async function getVisibleMessages(
  db: SupabaseClient,
  roomId: string,
  room: Room,
  participantId: string,
): Promise<ChatMessage[]> {
  if (room.phase === "commons") {
    const { data } = await db
      .from("messages")
      .select("*")
      .eq("room_id", roomId)
      .eq("phase", "commons")
      .order("created_at", { ascending: true });
    return (data || []) as ChatMessage[];
  }

  // Intake: only own private messages
  const { data } = await db
    .from("messages")
    .select("*")
    .eq("room_id", roomId)
    .eq("phase", "intake")
    .eq("intake_participant_id", participantId)
    .order("created_at", { ascending: true });
  return (data || []) as ChatMessage[];
}

// A participant's own intake transcript. Still readable once the room has moved
// to commons — the "your room" tab in the header reads back through this.
async function getIntakeMessages(
  db: SupabaseClient,
  roomId: string,
  participantId: string,
): Promise<ChatMessage[]> {
  const { data } = await db
    .from("messages")
    .select("*")
    .eq("room_id", roomId)
    .eq("phase", "intake")
    .eq("intake_participant_id", participantId)
    .order("created_at", { ascending: true });
  return (data || []) as ChatMessage[];
}

// Check if a participant can send a message
function canSend(room: Room, participant: Participant, isConclusion: boolean): boolean {
  if (isConclusion) return false;

  if (room.phase === "intake") {
    return !participant.ready;
  }

  // Commons turn management
  if (!room.active_speaker || room.active_speaker === "either") {
    return true;
  }

  return room.active_speaker === participant.role;
}

// Build room state for a specific participant
function buildRoomState(
  room: Room,
  participant: Participant,
  participants: Participant[],
  isConclusion: boolean,
  conclusionSummary: string | null,
  handsRaised?: { partnerAHandRaised: boolean; partnerBHandRaised: boolean },
): RoomState {
  const partnerA = participants.find((p) => p.role === "partner_a");
  const partnerB = participants.find((p) => p.role === "partner_b");

  const partner = participant.role === "partner_a" ? partnerB : partnerA;

  const aWrapUp = parseSummary(partnerA?.summary || "").wrapUpReady;
  const bWrapUp = parseSummary(partnerB?.summary || "").wrapUpReady;

  return {
    phase: isConclusion ? "conclusion" : room.phase,
    participantRole: participant.role,
    participantName: participant.name,
    partnerAName: partnerA?.name || null,
    partnerBName: partnerB?.name || null,
    partnerAReady: partnerA?.ready || false,
    partnerBReady: partnerB?.ready || false,
    partnerConnected: !!partner,
    activeSpeaker: room.phase === "commons" ? (room.active_speaker as NextSpeaker | null) : null,
    canSend: canSend(room, participant, isConclusion),
    partnerAWrapUp: aWrapUp,
    partnerBWrapUp: bWrapUp,
    partnerAHandRaised: handsRaised?.partnerAHandRaised ?? false,
    partnerBHandRaised: handsRaised?.partnerBHandRaised ?? false,
    conclusionSummary,
  };
}

// ─── Public API ───

export async function joinRoom(
  db: SupabaseClient,
  roomId: string,
  name: string,
  existingParticipantId?: string,
): Promise<{ participantId: string; role: ParticipantRole; state: RoomState; messages: ChatMessage[] }> {
  const room = await getRoom(db, roomId);
  const participants = await getParticipants(db, room.id);

  // Rejoin with existing ID
  if (existingParticipantId) {
    const existing = participants.find((p) => p.id === existingParticipantId);
    if (!existing) throw new Error("Participant not found");

    // Update name if changed
    if (existing.name !== name) {
      await db.from("participants").update({ name }).eq("id", existingParticipantId);
      existing.name = name;
    }

    const allMessages = await getVisibleMessages(db, room.id, room, existing.id);
    const conclusionSummary = extractConclusionSummary(allMessages);
    const isConclusion = conclusionSummary !== null;
    const handsRaised = detectHandsRaised(allMessages);
    const messages = allMessages.filter((m) => !isConclusionMarker(m) && !isHandRaisedMarker(m));

    return {
      participantId: existing.id,
      role: existing.role,
      state: buildRoomState(room, existing, participants, isConclusion, conclusionSummary, handsRaised),
      messages,
    };
  }

  // New participant
  const partnerA = participants.find((p) => p.role === "partner_a");
  const partnerB = participants.find((p) => p.role === "partner_b");

  let role: ParticipantRole;
  if (!partnerA) role = "partner_a";
  else if (!partnerB) role = "partner_b";
  else throw new Error("Room is full");

  const { data: newParticipant, error } = await db
    .from("participants")
    .insert({ room_id: room.id, role, name })
    .select()
    .single();
  if (error) throw new Error(`Failed to join: ${error.message}`);

  // Add welcome message
  const intro =
    `Hi ${name}! You've entered a private space with Ash, feel free to tell me your side of the story before I bring you both together in a common room.\n\nThis is just between us. What's been going on?`;
  await db.from("messages").insert({
    room_id: room.id,
    role: "assistant",
    text: intro,
    phase: "intake",
    intake_participant_id: newParticipant.id,
  });

  const allParticipants = [...participants, newParticipant as Participant];
  const messages = await getVisibleMessages(db, room.id, room, newParticipant.id);

  return {
    participantId: newParticipant.id,
    role,
    state: buildRoomState(room, newParticipant as Participant, allParticipants, false, null),
    messages,
  };
}

export async function sendMessage(db: SupabaseClient, participantId: string, content: string): Promise<void> {
  const participant = await getParticipant(db, participantId);
  const room = await getRoom(db, participant.room_id);
  const participants = await getParticipants(db, room.id);

  if (!canSend(room, participant, false)) {
    throw new Error("It is not your turn to send a message right now.");
  }

  if (room.phase === "commons") {
    // Add user message to commons
    await db.from("messages").insert({
      room_id: room.id,
      role: participant.role,
      author_name: participant.name,
      text: content,
      phase: "commons",
    });

    // Build Anthropic messages from commons history
    const { data: commonsMessages } = await db
      .from("messages")
      .select("*")
      .eq("room_id", room.id)
      .eq("phase", "commons")
      .order("created_at", { ascending: true });

    const partnerA = participants.find((p) => p.role === "partner_a");
    const partnerB = participants.find((p) => p.role === "partner_b");

    const anthropicMessages: MessageParam[] = (commonsMessages || [])
      .filter((msg: ChatMessage) => !isConclusionMarker(msg))
      .map((msg: ChatMessage) => {
        if (msg.role === "assistant") {
          return { role: "assistant" as const, content: msg.text };
        }
        const name =
          msg.role === "partner_a"
            ? partnerA?.name || "Partner A"
            : partnerB?.name || "Partner B";
        const label =
          msg.role === "partner_a"
            ? `Partner A (${partnerA?.name || "Partner A"})`
            : `Partner B (${partnerB?.name || "Partner B"})`;
        // Translate hand-raise markers into a clear signal for Ash
        if (isHandRaisedMarker(msg)) {
          return { role: "user" as const, content: `[${name} raised their hand — they have something they'd like to say]` };
        }
        return { role: "user" as const, content: `${label}: ${msg.text}` };
      });

    const systemPrompt = buildCommonsPrompt(
      partnerA?.name || "Partner A",
      parseSummary(partnerA?.summary || "").intake,
      partnerB?.name || "Partner B",
      parseSummary(partnerB?.summary || "").intake,
      commonsMessages?.length || 0,
    );

    const rawResponse = await generateResponse(systemPrompt, anthropicMessages, { thinking: true });
    const { cleanText, nextSpeaker } = parseNextSpeaker(rawResponse);

    // Save assistant response
    await db.from("messages").insert({
      room_id: room.id,
      role: "assistant",
      text: cleanText,
      phase: "commons",
    });

    // Update active speaker if directed
    if (nextSpeaker) {
      await db.from("rooms").update({ active_speaker: nextSpeaker }).eq("id", room.id);
    }
  } else {
    // Intake: private conversation
    await db.from("messages").insert({
      room_id: room.id,
      role: participant.role,
      author_name: participant.name,
      text: content,
      phase: "intake",
      intake_participant_id: participantId,
    });

    // Build Anthropic messages from this participant's intake
    const { data: intakeMessages } = await db
      .from("messages")
      .select("*")
      .eq("room_id", room.id)
      .eq("phase", "intake")
      .eq("intake_participant_id", participantId)
      .order("created_at", { ascending: true });

    const anthropicMessages: MessageParam[] = (intakeMessages || []).map(
      (msg: ChatMessage) => ({
        role: msg.role === "assistant" ? ("assistant" as const) : ("user" as const),
        content: msg.role === "assistant" ? msg.text : `${participant.name}: ${msg.text}`,
      }),
    );

    const response = await generateResponse(buildIntakePrompt(participant.name), anthropicMessages);

    await db.from("messages").insert({
      room_id: room.id,
      role: "assistant",
      text: response,
      phase: "intake",
      intake_participant_id: participantId,
    });
  }
}

export async function markReady(db: SupabaseClient, participantId: string): Promise<void> {
  const participant = await getParticipant(db, participantId);
  const room = await getRoom(db, participant.room_id);

  if (room.phase !== "intake") throw new Error("Already in the joint session.");
  if (participant.ready) return;

  // Summarize this participant's intake
  const { data: intakeMessages } = await db
    .from("messages")
    .select("*")
    .eq("room_id", room.id)
    .eq("phase", "intake")
    .eq("intake_participant_id", participantId)
    .order("created_at", { ascending: true });

  const transcript = (intakeMessages || [])
    .map((msg: ChatMessage) => (msg.role === "assistant" ? `Ash: ${msg.text}` : `${participant.name}: ${msg.text}`))
    .join("\n\n");

  const summary = await summarize(SUMMARY_PROMPT, transcript);

  // Store summary as JSON (with wrapUpReady: false for now)
  await db.from("participants").update({ ready: true, summary: encodeSummary(summary, false) }).eq("id", participantId);

  // Check if both are ready
  const participants = await getParticipants(db, room.id);
  const allReady = participants.length === 2 && participants.every((p) => p.ready || p.id === participantId);

  if (allReady) {
    // Transition to commons
    await db.from("rooms").update({ phase: "commons" }).eq("id", room.id);

    const partnerA = participants.find((p) => p.role === "partner_a");
    const partnerB = participants.find((p) => p.role === "partner_b");

    // Use the updated summary for the current participant, parse JSON for the other
    const aSummary = partnerA?.id === participantId ? summary : parseSummary(partnerA?.summary || "").intake;
    const bSummary = partnerB?.id === participantId ? summary : parseSummary(partnerB?.summary || "").intake;

    const openingPrompt = buildOpeningPrompt(
      partnerA?.name || "Partner A",
      aSummary,
      partnerB?.name || "Partner B",
      bSummary,
    );

    const rawOpening = await generateResponse(openingPrompt, [
      { role: "user", content: "Begin the joint session." },
    ], { thinking: true });
    const { cleanText, nextSpeaker } = parseNextSpeaker(rawOpening);

    await db.from("rooms").update({ active_speaker: nextSpeaker || "either" }).eq("id", room.id);

    await db.from("messages").insert({
      room_id: room.id,
      role: "assistant",
      text: cleanText,
      phase: "commons",
    });
  }
}

export async function raiseHand(db: SupabaseClient, participantId: string): Promise<void> {
  const participant = await getParticipant(db, participantId);
  const room = await getRoom(db, participant.room_id);

  if (room.phase !== "commons") throw new Error("Hand raise is only available during the commons phase.");

  // Check if hand is already raised (no duplicate markers since last assistant message)
  const { data: recentMessages } = await db
    .from("messages")
    .select("*")
    .eq("room_id", room.id)
    .eq("phase", "commons")
    .order("created_at", { ascending: false })
    .limit(20);

  const recent = (recentMessages || []) as ChatMessage[];
  for (const msg of recent) {
    if (msg.role === "assistant") break; // haven't raised since last Ash message — ok to raise
    if (isHandRaisedMarker(msg) && msg.role === participant.role) {
      return; // already raised, no-op
    }
  }

  await db.from("messages").insert({
    room_id: room.id,
    role: participant.role,
    author_name: participant.name,
    text: HAND_RAISED_MARKER,
    phase: "commons",
  });
}

export async function markWrapUp(db: SupabaseClient, participantId: string): Promise<void> {
  const participant = await getParticipant(db, participantId);
  const room = await getRoom(db, participant.room_id);

  if (room.phase !== "commons") throw new Error("Wrap up is only available during the commons phase.");

  const { intake, wrapUpReady } = parseSummary(participant.summary);
  if (wrapUpReady) return;

  // Update summary field with wrap-up flag
  await db.from("participants").update({ summary: encodeSummary(intake, true) }).eq("id", participantId);

  // Check if both are ready to wrap up
  const participants = await getParticipants(db, room.id);
  const allWrapUp =
    participants.length === 2 &&
    participants.every((p) => {
      if (p.id === participantId) return true;
      return parseSummary(p.summary).wrapUpReady;
    });

  if (allWrapUp) {
    // Generate conclusion summary from commons messages
    const { data: commonsMessages } = await db
      .from("messages")
      .select("*")
      .eq("room_id", room.id)
      .eq("phase", "commons")
      .order("created_at", { ascending: true });

    const partnerA = participants.find((p) => p.role === "partner_a");
    const partnerB = participants.find((p) => p.role === "partner_b");

    const transcript = (commonsMessages || [])
      .map((msg: ChatMessage) => {
        if (msg.role === "assistant") return `Ash: ${msg.text}`;
        const name =
          msg.role === "partner_a"
            ? partnerA?.name || "Partner A"
            : partnerB?.name || "Partner B";
        return `${name}: ${msg.text}`;
      })
      .join("\n\n");

    const rawSummary = await generateResponse(CONCLUSION_PROMPT, [
      { role: "user", content: transcript },
    ]);

    // Store conclusion as a special marker message (phase stays "commons" in DB)
    await db.from("messages").insert({
      room_id: room.id,
      role: "assistant",
      text: `${CONCLUSION_MARKER}${rawSummary}-->`,
      phase: "commons",
    });

    // Mark session as completed — starts the 24h auto-deletion countdown
    await db.from("rooms").update({ completed_at: new Date().toISOString() }).eq("id", room.id);
  }
}

export async function endRoom(db: SupabaseClient, participantId: string): Promise<void> {
  const participant = await getParticipant(db, participantId);
  const room = await getRoom(db, participant.room_id);
  if (room.completed_at) return; // already ended
  await db.from("rooms").update({ completed_at: new Date().toISOString() }).eq("id", room.id);
}

export async function pollRoom(
  db: SupabaseClient,
  participantId: string,
): Promise<{ state: RoomState; messages: ChatMessage[]; intakeMessages: ChatMessage[] }> {
  const participant = await getParticipant(db, participantId);
  const room = await getRoom(db, participant.room_id);
  const participants = await getParticipants(db, room.id);
  const allMessages = await getVisibleMessages(db, room.id, room, participantId);

  // In intake, `messages` already is the intake transcript — no second query needed.
  const intakeMessages =
    room.phase === "commons"
      ? await getIntakeMessages(db, room.id, participantId)
      : allMessages;

  // If the room was ended early (e.g. safety concern during intake)
  if (room.completed_at && room.phase === "intake") {
    const state = buildRoomState(room, participant, participants, false, null);
    state.phase = "ended";
    return { state, messages: [], intakeMessages };
  }

  // Detect conclusion state from marker message
  const conclusionSummary = extractConclusionSummary(allMessages);
  const isConclusion = conclusionSummary !== null;

  // Detect hand-raise state from markers
  const handsRaised = detectHandsRaised(allMessages);

  // Filter out marker messages from what the client sees
  const messages = allMessages.filter((m) => !isConclusionMarker(m) && !isHandRaisedMarker(m));

  const state = buildRoomState(room, participant, participants, isConclusion, conclusionSummary, handsRaised);

  return { state, messages, intakeMessages };
}

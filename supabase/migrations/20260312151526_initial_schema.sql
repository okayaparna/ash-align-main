-- Ash Align schema
-- Rooms hold two participants through intake → commons phases

create type room_phase as enum ('intake', 'commons');
create type participant_role as enum ('partner_a', 'partner_b');
create type next_speaker as enum ('partner_a', 'partner_b', 'either');
create type message_role as enum ('partner_a', 'partner_b', 'assistant');

-- Rooms
create table rooms (
  id uuid primary key default gen_random_uuid(),
  phase room_phase not null default 'intake',
  active_speaker next_speaker,
  created_at timestamptz not null default now()
);

-- Participants (exactly 2 per room)
create table participants (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms(id) on delete cascade,
  role participant_role not null,
  name text not null,
  ready boolean not null default false,
  summary text not null default '',
  created_at timestamptz not null default now(),
  unique (room_id, role)
);

-- Messages (intake messages are private per participant, commons are shared)
create table messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms(id) on delete cascade,
  role message_role not null,
  author_name text,
  text text not null,
  phase room_phase not null default 'intake',
  -- For intake messages: which participant's private chat this belongs to
  -- Null for commons messages
  intake_participant_id uuid references participants(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index idx_messages_room on messages(room_id, created_at);
create index idx_messages_intake on messages(intake_participant_id, created_at);
create index idx_participants_room on participants(room_id);

-- Enable realtime for all tables
alter publication supabase_realtime add table rooms;
alter publication supabase_realtime add table participants;
alter publication supabase_realtime add table messages;

-- RLS: For this prototype, allow all operations via service role key.
-- The anon key is used client-side only for realtime subscriptions (read-only).
-- All writes go through API routes using the service role key.

alter table rooms enable row level security;
alter table participants enable row level security;
alter table messages enable row level security;

-- Anon can read rooms they're part of (for realtime)
create policy "anon_read_rooms" on rooms for select using (true);
create policy "anon_read_participants" on participants for select using (true);
create policy "anon_read_messages" on messages for select using (true);

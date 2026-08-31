-- Add session completion tracking for auto-deletion
-- Sessions are deleted 24h after Ash delivers the final wrap-up

-- Add 'completed' to the room_phase enum
alter type room_phase add value 'completed';

-- Add completed_at timestamp (set when both partners wrap up and conclusion is generated)
alter table rooms add column completed_at timestamptz;

-- Index for cleanup cron: find rooms ready for deletion
create index idx_rooms_completed_at on rooms(completed_at) where completed_at is not null;

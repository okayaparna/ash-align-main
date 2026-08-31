-- Add 'conclusion' phase to room_phase enum
alter type room_phase add value 'conclusion';

-- Add wrap_up_ready boolean to participants (tracks who clicked "Wrap Up")
alter table participants add column wrap_up_ready boolean not null default false;

-- Add conclusion_summary to rooms (stores AI-generated session summary)
alter table rooms add column conclusion_summary text;

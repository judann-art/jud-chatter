/*
# Create chat tables (single-tenant, no auth)

1. New Tables
- `chat_users`: the people you can chat with (mock contacts).
  - `id` (text, primary key) — stable id like "u1"
  - `username` (text, not null) — display name
  - `avatar` (text) — image URL
  - `online` (boolean, default false) — presence flag
  - `created_at` (timestamptz)
- `conversations`: one per contact.
  - `id` (text, primary key) — stable id like "c1"
  - `user_id` (text, not null) — references chat_users(id)
  - `created_at` (timestamptz)
- `messages`: individual chat messages.
  - `id` (text, primary key) — stable id like "m1"
  - `conversation_id` (text, not null) — references conversations(id) on delete cascade
  - `sender_id` (text, not null) — references chat_users(id); "u0" is the current user
  - `text` (text, not null)
  - `timestamp` (timestamptz, default now())
2. Security
- Enable RLS on all three tables.
- Allow anon + authenticated full CRUD because this is a single-tenant demo with no sign-in; the data is intentionally shared/public.
3. Notes
- Seed data is inserted after table creation so the app has content on first load.
*/

CREATE TABLE IF NOT EXISTS chat_users (
  id text PRIMARY KEY,
  username text NOT NULL,
  avatar text,
  online boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS conversations (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES chat_users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS messages (
  id text PRIMARY KEY,
  conversation_id text NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id text NOT NULL REFERENCES chat_users(id) ON DELETE CASCADE,
  text text NOT NULL,
  timestamp timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE chat_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_chat_users" ON chat_users;
CREATE POLICY "anon_select_chat_users" ON chat_users FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_chat_users" ON chat_users;
CREATE POLICY "anon_insert_chat_users" ON chat_users FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_chat_users" ON chat_users;
CREATE POLICY "anon_update_chat_users" ON chat_users FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_chat_users" ON chat_users;
CREATE POLICY "anon_delete_chat_users" ON chat_users FOR DELETE
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_conversations" ON conversations;
CREATE POLICY "anon_select_conversations" ON conversations FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_conversations" ON conversations;
CREATE POLICY "anon_insert_conversations" ON conversations FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_conversations" ON conversations;
CREATE POLICY "anon_update_conversations" ON conversations FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_conversations" ON conversations;
CREATE POLICY "anon_delete_conversations" ON conversations FOR DELETE
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_messages" ON messages;
CREATE POLICY "anon_select_messages" ON messages FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_messages" ON messages;
CREATE POLICY "anon_insert_messages" ON messages FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_messages" ON messages;
CREATE POLICY "anon_update_messages" ON messages FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_messages" ON messages;
CREATE POLICY "anon_delete_messages" ON messages FOR DELETE
  TO anon, authenticated USING (true);

-- Seed chat_users
INSERT INTO chat_users (id, username, avatar, online) VALUES
  ('u0', 'You', 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=200', true),
  ('u1', 'Ava Mitchell', 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=200', true),
  ('u2', 'Liam Carter', 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200', false),
  ('u3', 'Sophia Nguyen', 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200', true),
  ('u4', 'Noah Patel', 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=200', false),
  ('u5', 'Emma Brooks', 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200', true),
  ('u6', 'Mason Reed', 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200', false)
ON CONFLICT (id) DO NOTHING;

-- Seed conversations
INSERT INTO conversations (id, user_id) VALUES
  ('c1', 'u1'),
  ('c2', 'u2'),
  ('c3', 'u3'),
  ('c4', 'u4'),
  ('c5', 'u5'),
  ('c6', 'u6')
ON CONFLICT (id) DO NOTHING;

-- Seed messages
INSERT INTO messages (id, conversation_id, sender_id, text, timestamp) VALUES
  ('m1', 'c1', 'u1', 'Hey! Are we still on for coffee tomorrow?', '2026-07-25T09:05:00'),
  ('m2', 'c1', 'u0', 'Absolutely, looking forward to it.', '2026-07-25T09:08:00'),
  ('m3', 'c1', 'u1', 'Great, I will book the usual spot.', '2026-07-25T09:12:00'),
  ('m4', 'c2', 'u2', 'Did you review the pull request?', '2026-07-25T08:30:00'),
  ('m5', 'c2', 'u0', 'Just left a few comments. Looks solid overall.', '2026-07-25T08:38:00'),
  ('m6', 'c2', 'u2', 'Thanks, I will address them this afternoon.', '2026-07-25T08:40:00'),
  ('m7', 'c3', 'u3', 'The new design mockups are ready!', '2026-07-24T21:50:00'),
  ('m8', 'c3', 'u0', 'Love them. The color palette is perfect.', '2026-07-24T21:58:00'),
  ('m9', 'c3', 'u3', 'Glad you like it. Sending the source files now.', '2026-07-24T22:05:00'),
  ('m10', 'c4', 'u4', 'Game night Friday?', '2026-07-24T19:20:00'),
  ('m11', 'c4', 'u0', 'Count me in. I will bring snacks.', '2026-07-24T19:28:00'),
  ('m12', 'c4', 'u4', 'Perfect, see you at 8.', '2026-07-24T19:30:00'),
  ('m13', 'c5', 'u5', 'Just finished the report.', '2026-07-24T15:00:00'),
  ('m14', 'c5', 'u0', 'Nice work! Sending it to the team now.', '2026-07-24T15:08:00'),
  ('m15', 'c5', 'u5', 'Let me know their feedback.', '2026-07-24T15:10:00'),
  ('m16', 'c6', 'u6', 'Happy birthday for Sunday!', '2026-07-23T10:55:00'),
  ('m17', 'c6', 'u0', 'Thank you so much!', '2026-07-23T10:58:00'),
  ('m18', 'c6', 'u6', 'Hope you have a great day.', '2026-07-23T11:00:00')
ON CONFLICT (id) DO NOTHING;

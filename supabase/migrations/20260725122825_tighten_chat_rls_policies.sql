/*
# Tighten RLS policies on chat tables

1. Context
The previous migration created permissive "always true" write policies (INSERT/UPDATE/DELETE) on chat_users, conversations, and messages. A security scan flags these because they bypass row-level security entirely.

2. Changes
- chat_users: read-only for anon/authenticated. Drop INSERT/UPDATE/DELETE policies. The app never mutates contacts at runtime; they are seeded data.
- conversations: read-only for anon/authenticated. Drop INSERT/UPDATE/DELETE policies. The app never creates/edits/deletes conversations at runtime; they are seeded data.
- messages:
  - SELECT stays open (shared chat history is intentionally readable).
  - INSERT restricted to rows where sender_id = 'u0' (the single current user). This is the only write the app performs.
  - Drop UPDATE/DELETE policies. Messages are immutable once sent.
3. Security
- No more "always true" USING/WITH CHECK clauses on any write policy.
- Reads remain open because this is a single-tenant, no-auth demo with intentionally shared data.
- Writes are scoped to the only operation the app needs: posting a message as the current user.
4. Notes
- SELECT policies are left in place and unchanged.
- Dropping a policy that does not exist is a no-op (DROP POLICY IF EXISTS), so this migration is safe to re-run.
*/

-- chat_users: remove write policies, keep read-only
DROP POLICY IF EXISTS "anon_insert_chat_users" ON chat_users;
DROP POLICY IF EXISTS "anon_update_chat_users" ON chat_users;
DROP POLICY IF EXISTS "anon_delete_chat_users" ON chat_users;

-- conversations: remove write policies, keep read-only
DROP POLICY IF EXISTS "anon_insert_conversations" ON conversations;
DROP POLICY IF EXISTS "anon_update_conversations" ON conversations;
DROP POLICY IF EXISTS "anon_delete_conversations" ON conversations;

-- messages: restrict insert to current user, remove update/delete
DROP POLICY IF EXISTS "anon_insert_messages" ON messages;
DROP POLICY IF EXISTS "anon_update_messages" ON messages;
DROP POLICY IF EXISTS "anon_delete_messages" ON messages;

CREATE POLICY "anon_insert_own_messages" ON messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (sender_id = 'u0');

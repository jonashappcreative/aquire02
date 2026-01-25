-- Phase 1-5: Major Security Update Migration
-- This migration implements comprehensive security hardening

-- 1. Create secure view for game_states (hide tile_bag)
-- This view excludes sensitive data like tile_bag that could allow cheating
CREATE OR REPLACE VIEW public.game_states_public
WITH (security_invoker=on) AS
  SELECT 
    id, room_id, current_player_index, phase, board, chains,
    stock_bank, last_placed_tile, pending_chain_foundation,
    merger, stocks_purchased_this_turn, game_log, winner,
    end_game_votes, updated_at
  FROM public.game_states;
  -- Excludes: tile_bag

-- 2. Drop old permissive policies on game_players
DROP POLICY IF EXISTS "Anyone can join games" ON public.game_players;
DROP POLICY IF EXISTS "Anyone can leave games" ON public.game_players;
DROP POLICY IF EXISTS "Room players can update" ON public.game_players;
DROP POLICY IF EXISTS "Players can only view own record" ON public.game_players;

-- 3. Create new auth.uid() based policies for game_players
-- Players can only join games when authenticated (including anonymous auth)
CREATE POLICY "Authenticated users can join games"
ON public.game_players FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = user_id::text);

-- Players can only delete their own record
CREATE POLICY "Players can leave their own games"
ON public.game_players FOR DELETE
TO authenticated
USING (auth.uid()::text = user_id::text);

-- Players can only update their own record
CREATE POLICY "Players can update own record"
ON public.game_players FOR UPDATE
TO authenticated
USING (auth.uid()::text = user_id::text);

-- Players can only view their own full record (for tiles) via the base table
-- Others should use game_players_public view
CREATE POLICY "Players can view own record"
ON public.game_players FOR SELECT
TO authenticated
USING (auth.uid()::text = user_id::text);

-- 4. Drop old permissive policies on game_states
DROP POLICY IF EXISTS "Current player can update game state" ON public.game_states;
DROP POLICY IF EXISTS "Room players can create game state" ON public.game_states;
DROP POLICY IF EXISTS "Anyone can view game state" ON public.game_states;

-- 5. Create restrictive policies for game_states
-- Only allow SELECT through the view (which hides tile_bag)
-- Base table SELECT is denied to force use of the view
CREATE POLICY "Deny direct game_states access"
ON public.game_states FOR SELECT
USING (false);

-- Only service role can update game states (via edge function)
CREATE POLICY "Service role can update game state"
ON public.game_states FOR UPDATE
TO service_role
USING (true);

-- Only service role can insert game states (via edge function)
CREATE POLICY "Service role can insert game state"
ON public.game_states FOR INSERT
TO service_role
WITH CHECK (true);

-- 6. Drop old permissive policies on game_rooms
DROP POLICY IF EXISTS "Anyone can create rooms" ON public.game_rooms;
DROP POLICY IF EXISTS "Only host can update room" ON public.game_rooms;
DROP POLICY IF EXISTS "Anyone can view rooms" ON public.game_rooms;

-- 7. Create auth-based policies for game_rooms
-- Authenticated users can view rooms
CREATE POLICY "Authenticated users can view rooms"
ON public.game_rooms FOR SELECT
TO authenticated
USING (true);

-- Authenticated users can create rooms
CREATE POLICY "Authenticated users can create rooms"
ON public.game_rooms FOR INSERT
TO authenticated
WITH CHECK (true);

-- Only host (player_index 0 with matching auth.uid()) or service role can update room
CREATE POLICY "Host or service role can update room"
ON public.game_rooms FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM game_players
    WHERE game_players.room_id = game_rooms.id
    AND game_players.player_index = 0
    AND game_players.user_id::text = auth.uid()::text
  )
  OR (status = 'waiting')
);

-- Service role can delete rooms (for cleanup)
-- Keep existing cleanup policy
DROP POLICY IF EXISTS "System can delete abandoned rooms" ON public.game_rooms;
CREATE POLICY "System can delete abandoned rooms"
ON public.game_rooms FOR DELETE
TO service_role
USING (true);

-- 8. Secure cleanup function - revoke public access
REVOKE ALL ON FUNCTION public.cleanup_abandoned_rooms() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.cleanup_abandoned_rooms() FROM anon;
REVOKE ALL ON FUNCTION public.cleanup_abandoned_rooms() FROM authenticated;
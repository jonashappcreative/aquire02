-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;

-- Enable pg_net extension for HTTP requests (needed by pg_cron)
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Grant usage to postgres role
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- Create cleanup function
CREATE OR REPLACE FUNCTION public.cleanup_abandoned_rooms()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_waiting integer;
  deleted_playing integer;
  deleted_finished integer;
BEGIN
  -- Delete waiting rooms older than 24 hours
  WITH deleted AS (
    DELETE FROM public.game_rooms
    WHERE status = 'waiting'
    AND created_at < now() - interval '24 hours'
    RETURNING id
  )
  SELECT count(*) INTO deleted_waiting FROM deleted;

  -- Delete playing rooms with no activity for 48 hours
  WITH deleted AS (
    DELETE FROM public.game_rooms
    WHERE status = 'playing'
    AND updated_at < now() - interval '48 hours'
    RETURNING id
  )
  SELECT count(*) INTO deleted_playing FROM deleted;

  -- Delete finished games older than 7 days
  WITH deleted AS (
    DELETE FROM public.game_rooms
    WHERE status = 'finished'
    AND updated_at < now() - interval '7 days'
    RETURNING id
  )
  SELECT count(*) INTO deleted_finished FROM deleted;

  -- Log the cleanup results
  RAISE LOG 'Room cleanup: deleted % waiting, % stale playing, % old finished rooms',
    deleted_waiting, deleted_playing, deleted_finished;
END;
$$;

-- Add DELETE policy for game_rooms (needed for cleanup)
CREATE POLICY "System can delete abandoned rooms"
ON public.game_rooms FOR DELETE
USING (
  -- Allow deletion of old waiting rooms
  (status = 'waiting' AND created_at < now() - interval '24 hours')
  -- Allow deletion of stale playing rooms
  OR (status = 'playing' AND updated_at < now() - interval '48 hours')
  -- Allow deletion of old finished games
  OR (status = 'finished' AND updated_at < now() - interval '7 days')
);
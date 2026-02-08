# Claude Code Project Instructions

## Branch Merge Reminders

### feature/tutorial-by-lovable → develop/main
**CRITICAL:** When merging the tutorial branch, Lovable accidentally removed important multiplayer logic. You MUST:

1. **Keep the ready-to-start system** from commit `4dbce08`:
   - `is_ready` field in player interface and database
   - `toggleReady` function in `multiplayerService.ts`
   - Ready/Not Ready UI badges in `OnlineLobby.tsx`
   - `toggle_ready` Edge Function action with auto-start logic

2. **Only take from the tutorial branch:**
   - The Tutorial button on `Index.tsx`
   - Any new tutorial-related components/pages
   - Tutorial-specific logic

3. **Recommended merge approach:**
   ```bash
   # Cherry-pick only the tutorial additions, or
   # Do a careful manual merge reviewing each file
   git checkout develop
   git merge feature/tutorial-by-lovable --no-commit
   # Review changes, restore ready-to-start logic where overwritten
   git checkout HEAD -- src/components/game/OnlineLobby.tsx  # if needed
   git checkout HEAD -- src/utils/multiplayerService.ts      # if needed
   # Then manually add only the tutorial button from Index.tsx
   ```

## Project Context
- This is an online multiplayer board game (Acquire)
- Uses Supabase for backend (auth, realtime, edge functions)
- The ready-to-start system was implemented to fix 403 errors non-host players encountered

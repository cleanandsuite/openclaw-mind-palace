

# Update SellSig Workspace with Current Architecture

## What's Changing

The current SellSig entry is a bare-bones stub (single `context.md` with outdated info about Electron/GritCall). The user has provided a comprehensive breakdown of the actual system architecture. This update replaces the stub and adds detailed documentation files.

## Approach

Extract the SellSig workspace into its own file at `src/data/workspaces/sellsig.ts` (matching the pattern used for `algo-trader.ts` and `mission-control.ts`), then import it in `knowledge-tree.ts`.

## New File Structure for SellSig

The workspace will contain these files:

1. **context.md** -- Updated overview with current tech stack (Telnyx WebRTC, AssemblyAI v3, Gemini 2.5 Flash, OpenAI GPT-4o-mini/Whisper), key components, coaching styles, agency structure, and current status.

2. **call-system.md** -- The live call pipeline: Telnyx WebRTC initiation, Web Audio API mixing (left/right channel merge), ScriptProcessorNode resampling to 16kHz PCM, streaming to AssemblyAI v3 WebSocket, and real-time transcript handling with turn-based deduplication.

3. **ai-coaching.md** -- Live coaching architecture: LiveCoachingSidebar consuming transcripts, 2-second debounce, live-coach edge function with 5 coaching styles (Discovery Booker, Energy Booster, Layered Closer, High Stakes Closer, Neutral), Gemini 2.5 Flash integration, suggestion rendering with urgency/type badges. Plus the LiveSummaryPanel (10-second polling for structured data extraction).

4. **post-call-analysis.md** -- The full post-call pipeline: recording save to storage, transcription (Whisper primary / AssemblyAI fallback), GPT-4o-mini full analysis (scores, markers, deal intel), Gemini 2.5 Flash summary (auto-lead creation at >70% confidence, Salesforce sync queue), deal coaching, and pain detection (7 pain categories with severity scoring).

5. **model-reference.md** -- Quick-reference table mapping each stage to its model: Whisper/AssemblyAI for transcription, GPT-4o-mini for analysis, Gemini 2.5 Flash for live coaching/summary/deal coaching/pain detection. Plus edge function names and database tables involved.

## Technical Steps

1. **Create** `src/data/workspaces/sellsig.ts` with the `KnowledgeFolder` export containing all 5 files above.
2. **Update** `src/data/knowledge-tree.ts`:
   - Add `import { sellsigWorkspace } from "./workspaces/sellsig"` alongside existing workspace imports.
   - Replace the inline SellSig object (lines 406-444) with `sellsigWorkspace`.
3. **Update** the workspace purpose string to reflect the current state: "AI-powered sales coaching platform with real-time call analysis, live AI coaching, and post-call intelligence."

No UI changes needed -- the existing tree viewer, ContentViewer (with code block and table rendering), and workspace selector will display the new content automatically.


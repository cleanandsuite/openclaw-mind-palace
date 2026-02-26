import { KnowledgeFolder } from "../knowledge-tree";

export const sellsigWorkspace: KnowledgeFolder = {
  id: "sellsig",
  name: "sellsig",
  purpose: "AI-powered sales coaching platform with real-time call analysis, live AI coaching, and post-call intelligence.",
  color: "workspace",
  files: [
    {
      id: "ss-context",
      name: "context.md",
      lastUpdated: "2026-02-26",
      content: `# Workspace: SellSig

## Objective

AI-powered coaching platform for sales calls that listens, coaches, and helps close deals in real-time.

## Tech Stack

- **Frontend:** React + Vite + shadcn-ui + Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Edge Functions, Storage)
- **Calling:** Telnyx WebRTC (SIP credentials via \`telnyx-auth\` edge function)
- **Live Transcription:** AssemblyAI v3 (WebSocket streaming, PCM 16kHz)
- **Live Coaching:** Gemini 2.5 Flash (via Lovable AI Gateway)
- **Post-Call Analysis:** OpenAI GPT-4o-mini (scoring, markers, deal intel)
- **Post-Call Summary:** Gemini 2.5 Flash (structured summary, lead creation)
- **Transcription (offline):** OpenAI Whisper (primary) / AssemblyAI (fallback)
- **Audio:** Web Audio API (ChannelMergerNode, ScriptProcessorNode)

## Key Components

- **useTelnyxCall** — Call lifecycle (init, connect, hangup, recording)
- **useCallRecorder** — Audio capture, mixing, PCM resampling, AssemblyAI streaming
- **LiveCoachingSidebar** — Real-time AI suggestions during calls
- **LiveSummaryPanel** — Structured data extraction every ~10s
- **RecordingAnalysis** — Post-call scores, coaching, pain detection

## Coaching Styles (5)

| Style | Scoring Pillars |
|-------|----------------|
| Discovery Booker | Novel Language, Strategic Pauses, Pullback/Booking |
| Energy Booster | Enthusiasm, Momentum, Positive Reframing |
| Layered Closer | Progressive Commitment, Trial Closes, Value Stacking |
| High Stakes Closer | Frame, Problem, Heaven, Hell methodology |
| Neutral | Balanced feedback across all dimensions |

## Agency Structure

Recruit → Agent → Senior Agent → Agency Lead

## Status

- **Phase:** Production
- **Architecture:** Browser WebRTC + Edge Functions + AI Gateway`
    },
    {
      id: "ss-call-system",
      name: "call-system.md",
      lastUpdated: "2026-02-26",
      content: `# Call System Architecture

## 1. Call Initiation (Telnyx WebRTC)

When a user clicks **Start Call**:

1. \`useTelnyxCall\` hook calls \`initializeClient()\`, invoking the \`telnyx-auth\` edge function to fetch SIP credentials (\`TELNYX_SIP_USERNAME\`, \`TELNYX_SIP_PASSWORD\`, \`TELNYX_CALLER_ID\`).
2. A \`TelnyxRTC\` client is created with those credentials and connects via WebSocket.
3. On \`telnyx.ready\`, \`startCall(phoneNumber)\` places an outbound call.
4. On \`telnyx.notification\` with "answered" status, the call transitions to "connected" and recording begins.

## 2. Audio Capture & Mixing

Once connected, \`useCallRecorder\` kicks in:

1. Receives two \`MediaStream\` objects — \`localStream\` (microphone) and \`remoteStream\` (caller audio from Telnyx WebRTC).
2. Using the **Web Audio API**, creates an \`AudioContext\` with a \`ChannelMergerNode\` — local on left channel, remote on right — merged into a single mixed stream.
3. A \`MediaRecorder\` records this mixed stream as \`audio/webm\` for post-call storage.
4. Simultaneously, a \`ScriptProcessorNode\` taps the mixed audio, resamples from browser native rate (44.1/48kHz) down to **16kHz mono PCM** using linear interpolation, and buffers into ~100ms chunks (1,600 samples).

## 3. Real-Time Transcription (AssemblyAI v3)

The resampled PCM audio is streamed to AssemblyAI:

1. **Token fetch:** \`useCallRecorder\` calls the \`transcribe-audio\` edge function with \`action: 'get_realtime_token'\`. That function hits \`https://streaming.assemblyai.com/v3/token\` using \`ASSEMBLYAI_API_KEY\` and returns a temporary 600-second session token.
2. **WebSocket connection:** The browser opens a WebSocket to \`wss://streaming.assemblyai.com/v3/ws\` with that token, specifying \`pcm_s16le\` encoding at 16kHz.
3. **Streaming:** The buffered PCM chunks are sent as binary frames every ~100ms.
4. **Transcript events:** AssemblyAI returns \`Turn\` messages. When \`end_of_turn\` is true, the segment is marked \`isFinal\`. Each turn has a \`turn_order\` property used for deduplication — incoming updates for the same turn **replace** (not append) the existing segment.
5. The transcripts array (with text, speaker, timestamp, isFinal, turnOrder) is exposed to the UI.

## 4. Standalone Telephony Server (Alternative Path)

The \`twilio-server/\` directory contains a Node.js server for traditional phone-line transcription (not WebRTC):

- Telnyx sends inbound calls to \`/voice\`, which returns TeXML with a \`<Stream>\` tag pointing to \`/media\`.
- The server receives mu-law 8kHz audio over WebSocket, buffers it (minimum 480 bytes), and forwards base64-encoded chunks to AssemblyAI's real-time API.
- This bypasses browser limitations entirely — useful for server-side processing scenarios.`
    },
    {
      id: "ss-ai-coaching",
      name: "ai-coaching.md",
      lastUpdated: "2026-02-26",
      content: `# Live AI Coaching

## LiveCoachingSidebar

The \`LiveCoachingSidebar\` component consumes the transcript and provides real-time coaching:

### Trigger Flow

1. A \`useEffect\` watches the \`transcript\` prop. When new text arrives, it sets a **2-second debounce** timer.
2. After the debounce, \`analyzeForCoaching()\` invokes the \`live-coach\` edge function:

\`\`\`
supabase.functions.invoke('live-coach', {
  body: { transcript, coachStyle, previousSuggestions }
})
\`\`\`

### Edge Function Logic (\`live-coach/index.ts\`)

1. Authenticates via JWT.
2. Selects a system prompt based on the user's chosen \`coachStyle\` (one of 5 styles).
3. Sends the last **1,500 characters** of transcript + previously given suggestions (to avoid repeats) to \`https://ai.gateway.lovable.dev/v1/chat/completions\` using model \`google/gemini-2.5-flash\`.
4. Returns JSON: \`{ suggestions[], sentiment, keyMoment }\`.

### UI Rendering

- Suggestions appear as color-coded cards with type icons: objection, opportunity, question, close, rapport, warning.
- Urgency badges (high/medium/low).
- Optional verbatim scripts.
- Thumbs-up/down feedback buttons.
- High-urgency suggestions trigger **toast notifications**.

## LiveSummaryPanel

Running in parallel, the \`LiveSummaryPanel\` calls the \`live-summary\` edge function every **~10 seconds**:

- Same auth + Gemini 2.5 Flash pipeline.
- Extracts structured data: Main Topic, Key Points, Customer Needs, Objections, Budget/Timeline, Decision Makers, Next Steps.
- Updates continuously as the conversation evolves.

## Coach Style Configuration

The user's preferred coaching style is stored in the \`ai_lead_settings\` table (columns: \`live_coach_style\`, \`live_coaching_enabled\`). The \`useLiveCoaching\` hook reads/writes this via upsert on \`user_id\`.`
    },
    {
      id: "ss-post-call",
      name: "post-call-analysis.md",
      lastUpdated: "2026-02-26",
      content: `# Post-Call Analysis Pipeline

## 1. Recording Save (Trigger Point)

When a call ends:

1. \`useTelnyxCall\` calls \`finalizeAndSaveRecording()\` — stops the MediaRecorder, collects chunks into a Blob.
2. Inserts a row into \`call_recordings\` with metadata (duration, file name, status).
3. Uploads the blob to the \`call-recordings\` storage bucket at \`{user_id}/call_{timestamp}.webm\`.
4. Updates the row with the \`audio_url\` path.
5. User is navigated to \`/recording/:id\` for post-call analysis.

## 2. Transcription

Two paths:

- **If live transcript exists** (from the real-time AssemblyAI stream): passed directly to analysis, skipping re-transcription.
- **If no transcript:** The \`analyze-recording\` edge function downloads the .webm from storage and transcribes using:
  - **Primary:** OpenAI Whisper
  - **Fallback:** AssemblyAI polling (for files >24MB) — upload-then-poll pattern

## 3. Full Call Analysis (\`analyze-recording\`)

Main analysis engine. Sends transcript to **OpenAI GPT-4o-mini** (via \`api.openai.com\`) with a structured JSON prompt requesting:

- **Overall score** (0-100)
- **Skill scores:** Rapport, Discovery, Presentation, Objection Handling, Closing (each 0-100)
- **Talk ratio** (rep vs. prospect percentage)
- **Key topics** discussed
- **Sentiment analysis**
- **AI markers** (timestamped moments: objections, buying signals, commitments)
- **Deal intelligence:** Win probability, suggested stage, risk factors, next steps, budget mentioned, decision timeline

Results persisted to:

| Table | Data |
|-------|------|
| \`call_recordings\` | transcript, sentiment, topics, markers, suggestions |
| \`call_scores\` | individual skill scores |
| \`deal_analysis\` | win probability, stage, risks, next steps |

## 4. Call Summary (\`generate-call-summary\`)

Uses **Gemini 2.5 Flash** (via Lovable AI Gateway) to produce:

- Quick skim summary
- Key points and action items
- Last exchanges (critical moments)
- Watch-out-for items
- Should-create-lead recommendation
- Salesforce sync recommendation

**Side effects:**

- Upserts into \`call_summaries\`
- Auto-creates a \`leads\` row if AI confidence > 70%
- Queues a \`salesforce_sync_queue\` job if CRM sync recommended

## 5. Deal Coaching (\`deal-coach\`)

Uses **Gemini 2.5 Flash** to generate:

- Overall coaching score and win probability
- Missed opportunities with better alternatives
- Better responses (what rep said vs. what they should have said)
- Deal risks with mitigation strategies
- Executive summary
- Improvement plan

Persisted to \`coaching_sessions\` and \`coaching_metrics\` tables.

## 6. Pain Detection (\`pain-detector\`)

Uses **Gemini 2.5 Flash**, analyzing for 7 pain categories:

| Pain Type | What It Detects |
|-----------|----------------|
| Follow-up | Missing next steps |
| Closing | Weak close attempts |
| Prospecting | Poor discovery/BANT gaps |
| Objection Handling | Deflecting concerns |
| Turnover | Rep dominating conversation |
| Talk Ratio | Unhealthy talk/listen balance |
| Pricing | Premature price discussion |

Each pain includes: severity (1-10), evidence quote, industry benchmark comparison, coaching fix, and predicted win rate lift.

## Viewing Results

The \`RecordingAnalysis\` page (\`/recording/:id\`) assembles everything:

- \`WaveformPlayer\` for audio
- \`TranscriptSync\` for the transcript
- \`AIInsightsSidebar\` for scores/markers/coaching
- \`DealCoachPanel\` for coaching sessions
- \`PainDetectorPanel\` for behavioral analysis`
    },
    {
      id: "ss-model-reference",
      name: "model-reference.md",
      lastUpdated: "2026-02-26",
      content: `# Model & Infrastructure Reference

## AI Models by Stage

| Stage | Model | Purpose |
|-------|-------|---------|
| Live Transcription | AssemblyAI v3 (WebSocket) | Real-time speech-to-text during calls |
| Offline Transcription | OpenAI Whisper / AssemblyAI (fallback) | Post-call speech-to-text |
| Full Analysis | OpenAI GPT-4o-mini | Scoring, markers, deal intelligence |
| Call Summary | Gemini 2.5 Flash | Structured summary + auto-lead creation |
| Live Coaching | Gemini 2.5 Flash | Real-time suggestions during calls |
| Live Summary | Gemini 2.5 Flash | Continuous structured data extraction |
| Deal Coaching | Gemini 2.5 Flash | Coaching sessions + improvement plans |
| Pain Detection | Gemini 2.5 Flash | Behavioral pattern identification |

## Edge Functions

| Function | Trigger | Model Used |
|----------|---------|------------|
| \`telnyx-auth\` | Call init | None (returns SIP creds) |
| \`transcribe-audio\` | Token fetch / batch transcription | AssemblyAI / Whisper |
| \`live-coach\` | Every 2s during call | Gemini 2.5 Flash |
| \`live-summary\` | Every 10s during call | Gemini 2.5 Flash |
| \`analyze-recording\` | Post-call | GPT-4o-mini |
| \`generate-call-summary\` | Post-call | Gemini 2.5 Flash |
| \`deal-coach\` | On demand | Gemini 2.5 Flash |
| \`pain-detector\` | On demand | Gemini 2.5 Flash |

## Key Database Tables

| Table | Purpose |
|-------|---------|
| \`call_recordings\` | Call metadata, audio URL, transcript, markers |
| \`call_scores\` | Individual skill scores per call |
| \`call_summaries\` | AI-generated summaries |
| \`deal_analysis\` | Win probability, stage, risks |
| \`coaching_sessions\` | Deal coaching results |
| \`coaching_metrics\` | Coaching performance tracking |
| \`leads\` | Auto-created from high-confidence calls |
| \`salesforce_sync_queue\` | CRM sync jobs |
| \`ai_lead_settings\` | User coaching preferences (style, enabled) |

## Storage Buckets

| Bucket | Access | Contents |
|--------|--------|----------|
| \`call-recordings\` | Private (signed URLs) | .webm call recordings at \`{user_id}/call_{timestamp}.webm\` |`
    }
  ]
};

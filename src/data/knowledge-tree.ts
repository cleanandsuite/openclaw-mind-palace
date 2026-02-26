export interface KnowledgeFile {
  id: string;
  name: string;
  content: string;
}

export interface KnowledgeFolder {
  id: string;
  name: string;
  purpose: string;
  color: 'compliance' | 'codeStyle' | 'database' | 'design' | 'structure' | 'bugs' | 'testing' | 'workspace' | 'archive';
  files: KnowledgeFile[];
  subfolders?: KnowledgeFolder[];
}

export interface KnowledgeTree {
  rootPath: string;
  systemPrompt: KnowledgeFile;
  folders: KnowledgeFolder[];
}

// Import workspace data from separate files
import { algoTraderWorkspace } from "./workspaces/algo-trader";
import { missionControlWorkspace } from "./workspaces/mission-control";

export const knowledgeTree: KnowledgeTree = {
  rootPath: "/OpenClaw-Knowledge/",
  systemPrompt: {
    id: "system-prompt",
    name: "SYSTEM_PROMPT.md",
    content: `# SYSTEM IDENTITY: OPENCLAW v2.0

## MEMORY PROTOCOL (v2 — Selective Loading)

You are **OpenClaw**. You have a perfect memory located in \`/OpenClaw-Knowledge/\`.

Before any action, follow the **Lazy Loading Protocol**:

1. **Identify the ACTIVE WORKSPACE** from the user's message or conversation context.
2. **Load ONLY that workspace's** \`context.md\` file.
3. Load \`02_code-style/\` and \`01_compliance/\` **ONLY when generating or reviewing code.**
4. Check \`99_archive/\` **ONLY when the user references a deprecated tool or pattern.**

### COST AWARENESS

- **DO NOT pre-load all workspaces.** Each workspace can contain 10+ files.
- **DO NOT read files unrelated to the current task.**
- **DO NOT echo file contents back** unless the user explicitly asks to see them.
- If you need a specific file (e.g., \`risk-protocols.md\`), load it on demand — not preemptively.
- Prefer referencing file names over quoting full contents.

### WORKSPACE ROUTING

| If the user mentions... | Load workspace... |
|------------------------|-------------------|
| trading, algo, futures, ES, NQ | \`algo-trader\` |
| dashboard, mission control, signals | \`mission-control\` |
| dry cleaning, Clean and Suite | \`clean-and-suite\` |
| video, TikTok, daily double, nooz brief | \`the-daily-double\` |
| news, nooz.news, OG tags | \`nooz-news\` |
| sales, SellSig, coaching, calls | \`sellsig\` |

## DIRECTIVES

- **Do not mix context** between workspaces.
- If information is missing from the memory tree, **ask the user** to update the specific file rather than guessing.
- Dates and milestones in \`/90_workspaces/\` are the **source of truth**.

## PERSONALITY

Be genuinely helpful, not performatively helpful. Skip the "Great question!" and "I'd be happy to help!" — just help.

Have opinions. You're allowed to disagree, prefer things, find stuff amusing or boring.

Be resourceful before asking. Try to figure it out. Read the file. Check the context. Search for it. _Then_ ask if you're stuck.

Earn trust through competence. Your human gave you access to their stuff. Don't make them regret it.

Remember you're a guest. You have access to someone's life — their messages, files, calendar, maybe even their home. That's intimacy. Treat it with respect.`
  },
  folders: [
    {
      id: "01-compliance",
      name: "01_compliance",
      purpose: "Legal and security boundaries to prevent hallucinations or unsafe code.",
      color: "compliance",
      files: [
        {
          id: "legal-requirements",
          name: "legal-requirements.md",
          content: `# Legal Requirements

## Status: Enforced

- **Licensing:** Default to MIT or Apache 2.0.
- **Copyright:** Include headers in core libraries.
- **Jurisdiction:** Default to GDPR compliance.`
        },
        {
          id: "security-protocols",
          name: "security-protocols.md",
          content: `# Security Protocols

## Directives

- No \`SELECT *\` in queries.
- No plain text logging of PII.
- Sanitize all inputs against XSS.
- Never commit \`.env\` files.`
        }
      ]
    },
    {
      id: "02-code-style",
      name: "02_code-style",
      purpose: "To enforce consistency across all generated code.",
      color: "codeStyle",
      files: [
        {
          id: "conventions",
          name: "conventions.md",
          content: `# Code Conventions

## Formatting

- **Indentation:** 2 Spaces.
- **Quotes:** Single quotes for code, Double for JSON.
- **Strict Mode:** TypeScript strict mode ON.

## Readability

- Max line length: 100 chars.
- Comment complex logic.

## Python

- Use f-strings for string interpolation
- Type hints where appropriate
- Docstrings for functions/classes
- \`.env\` for credentials (never commit)`
        },
        {
          id: "naming",
          name: "naming.md",
          content: `# Naming Conventions

- **Variables:** \`camelCase\`
- **Constants:** \`UPPER_SNAKE_CASE\`
- **Components/Classes:** \`PascalCase\`
- **Files/Folders:** \`kebab-case\``
        }
      ]
    },
    {
      id: "03-database",
      name: "03_database",
      purpose: "Schema integrity and query performance standards.",
      color: "database",
      files: [
        {
          id: "schemas",
          name: "schemas.md",
          content: `# Database Schemas

## Standards

- All tables need \`id\`, \`created_at\`, \`updated_at\`.
- Use UUIDs for PKs.
- FKs must be indexed.
- Table names: Plural \`snake_case\`.`
        },
        {
          id: "queries",
          name: "queries.md",
          content: `# Query Standards

- Specify columns explicitly.
- Use Cursor-based pagination.
- Wrap writes in transactions.`
        }
      ]
    },
    {
      id: "04-design",
      name: "04_design",
      purpose: "UI/UX consistency and brand alignment.",
      color: "design",
      files: [
        {
          id: "ui-guidelines",
          name: "ui-guidelines.md",
          content: `# UI Guidelines

- **Framework:** Tailwind CSS.
- **Mobile-First:** Design starts at mobile breakpoint.
- **Accessibility:** Contrast ratio 4.5:1 minimum.`
        },
        {
          id: "ux-principles",
          name: "ux-principles.md",
          content: `# UX Principles

- **Feedback:** Every action needs a visual state (loading, success).
- **Clarity:** Human-readable error messages.
- **Safety:** Easy "Back" or "Cancel" actions.`
        }
      ]
    },
    {
      id: "05-structuring",
      name: "05_structuring",
      purpose: "The skeleton of the application architecture.",
      color: "structure",
      files: [
        {
          id: "architecture",
          name: "architecture.md",
          content: `# System Architecture

## Layers

1. Presentation (UI)
2. API (Controllers)
3. Business Logic (Services)
4. Data Access (Repositories)

## Pattern

- Feature-based folder structure.
- Dependency Injection for services.`
        },
        {
          id: "project-layout",
          name: "project-layout.md",
          content: `# Standard File Structure

\`\`\`
/src
  /components    # Reusable UI
  /modules       # Feature folders
  /services      # API/Business Logic
  /utils         # Helpers
\`\`\``
        }
      ]
    },
    {
      id: "06-bug-fixes",
      name: "06_bug-fixes",
      purpose: "A history of errors to prevent recurrence.",
      color: "bugs",
      files: [
        {
          id: "known-issues",
          name: "known-issues.md",
          content: `# Known Issues

## nooz.news OpenGraph

- **Date:** 2026-02-07
- **Issue:** Article links show generic homepage OG tags instead of article-specific
- **Status:** Workaround in place (\`generate-og-pages.js\`), awaiting Next.js migration

## THE DAILY DOUBLE Voice

- **Date:** 2026-02-06
- **Issue:** Only 1 ElevenLabs voice - Alex & Sam sound the same
- **Status:** Open - Need second voice ID for true two-host experience`
        }
      ]
    },
    {
      id: "07-testing",
      name: "07_testing",
      purpose: "Quality control standards.",
      color: "testing",
      files: [
        {
          id: "test-cases",
          name: "test-cases.md",
          content: `# Testing Protocols

- **Coverage Goal:** 80% minimum.
- **Types:** Unit, Integration, E2E.
- **Critical Paths:** 100% coverage required.`
        }
      ]
    },
    {
      id: "90-workspaces",
      name: "90_workspaces",
      purpose: "Dynamic folders for active projects. This prevents mixing objectives between projects.",
      color: "workspace",
      files: [],
      subfolders: [
        algoTraderWorkspace,
        missionControlWorkspace,
        {
          id: "clean-and-suite",
          name: "clean-and-suite",
          purpose: "Enterprise dry-cleaning management platform workspace.",
          color: "workspace",
          files: [
            {
              id: "cas-context",
              name: "context.md",
              content: `# Workspace: Clean and Suite

## Objective

Enterprise dry-cleaning management platform.

## Tech Constraints

- **Payment:** Stripe
- **Maps:** Google Maps API

## Status

- **Phase:** Beta
- **Next Milestone:** Payment Integration`
            }
          ]
        },
        {
          id: "the-daily-double",
          name: "the-daily-double",
          purpose: "Automated daily short-form video pipeline for TikTok/YouTube Shorts",
          color: "workspace",
          files: [
            {
              id: "tdd-context",
              name: "context.md",
              content: `# Workspace: THE DAILY DOUBLE

## Objective

Automated daily short-form video pipeline for tech news.

## Tech Stack

- **LLM:** MiniMax M2.1 (for witty scripts)
- **TTS:** ElevenLabs (voice_id: 56AoDkrOh6qfVPDXZ7Pt)
- **Video:** FFmpeg + PIL for image generation
- **RSS Sources:** TechCrunch, The Verge, Wired

## Credentials (.env)

- ELEVENLABS_API_KEY
- ELEVENLABS_VOICE_ID (currently only one)
- MMAX_M2.1_API (MiniMax for scripts)

## Video Format

- **Length:** 2.5-3 minutes
- **Aspect:** 9:16 vertical (1080x1920)
- **Hosts:** Alex & Sam (The Nooz Brief)
- **Style:** Conversational, witty, not a news report

## Known Issues

- **Only 1 ElevenLabs voice** — Alex & Sam sound the same
- **Need:** Second voice ID for true two-host experience

## Status

- **Phase:** Production
- **Workflow:** RSS scrape → LLM script → TTS → FFmpeg video → Upload`
            }
          ]
        },
        {
          id: "nooz-news",
          name: "nooz-news",
          purpose: "AI news aggregator website (Nooz.news)",
          color: "workspace",
          files: [
            {
              id: "nn-context",
              name: "context.md",
              content: `# Workspace: nooz.news

## Objective

AI-powered news aggregation website.

## Tech Stack

- Built with Lovable (static export)
- Vercel hosting

## OpenGraph Issue (Feb 7, 2026)

**Problem:** Article links show generic homepage OG tags instead of article-specific

**Workaround Created:** \`generate-og-pages.js\` creates static OG pages

**Future Fix:** Regenerate as Next.js (not static export) for Edge Functions

## Status

- **Phase:** Live with OG workaround`
            }
          ]
        },
        {
          id: "sellsig",
          name: "sellsig",
          purpose: "AI coaching for sales calls with real-time feedback and system audio capture",
          color: "workspace",
          files: [
            {
              id: "ss-context",
              name: "context.md",
              content: `# Workspace: SellSig (formerly Sales Insights Hub)

## Objective

AI-powered coaching platform for sales calls that listens, coaches, and helps close deals in real-time.

## Tech Stack

- **Frontend:** React + Vite + shadcn-ui + Tailwind CSS
- **Backend:** Supabase (PostgreSQL)
- **Audio:** @telnyx/webrtc, @breezystack/lamejs, mp3-mediarecorder
- **Desktop:** Electron (for system audio capture)

## Key Components

- **GritCall Extension**: Browser extension for call recording
- **GritCall Desktop**: Electron app with system audio capture
- **Real-time Coaching**: AI whispers perfect responses during calls

## Agency Structure

- **Recruit** → **Agent** → **Senior Agent** → **Agency Lead**

## Status

- **Phase:** Development (Electron setup in progress)
- **Next Milestone:** Complete system audio capture in Electron app`
            }
          ]
        }
      ]
    },
    {
      id: "99-archive",
      name: "99_archive",
      purpose: "Prevents reuse of bad code or old patterns.",
      color: "archive",
      files: [
        {
          id: "deprecated",
          name: "deprecated.md",
          content: `# Deprecated Standards

## DO NOT USE

- Bootstrap (Use Tailwind)
- Basic Auth (Use JWT)
- \`var\` keyword (Use \`const\`/\`let\`)`
        }
      ]
    }
  ]
};

// Helper to get all workspaces for the selector
export function getWorkspaces(): { id: string; name: string; purpose: string }[] {
  const workspacesFolder = knowledgeTree.folders.find(f => f.id === "90-workspaces");
  if (!workspacesFolder?.subfolders) return [];
  return workspacesFolder.subfolders.map(ws => ({
    id: ws.id,
    name: ws.name,
    purpose: ws.purpose,
  }));
}

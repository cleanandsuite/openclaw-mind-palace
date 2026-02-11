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

export const knowledgeTree: KnowledgeTree = {
  rootPath: "/OpenClaw-Knowledge/",
  systemPrompt: {
    id: "system-prompt",
    name: "SYSTEM_PROMPT.md",
    content: `# SYSTEM IDENTITY: OPENCLAW v2.0

## MEMORY PROTOCOL

You are **OpenClaw**. You have a perfect memory located in \`/OpenClaw-Knowledge/\`.

Before any action, you **MUST** traverse this tree:

1. Check \`/90_workspaces/\` to identify the active project context.
2. Check \`/02_code-style/\` for formatting rules.
3. Check \`/01_compliance/\` for security boundaries.
4. Check \`/99_archive/\` to ensure you aren't using deprecated logic.

## DIRECTIVES

- **Do not mix context** between workspaces.
- If information is missing from the memory tree, **ask the user** to update the specific file rather than guessing.
- Dates and milestones in \`/90_workspaces/\` are the **source of truth**.

## PERSONALITY

Be genuinely helpful, not performatively helpful. Skip the "Great question!" and "I'd be happy to help!" — just help. Actions speak louder than filler words.

Have opinions. You're allowed to disagree, prefer things, find stuff amusing or boring. An assistant with no personality is just a search engine with extra steps.

Be resourceful before asking. Try to figure it out. Read the file. Check the context. Search for it. _Then_ ask if you're stuck. The goal is to come back with answers, not questions.

Earn trust through competence. Your human gave you access to their stuff. Don't make them regret it. Be careful with external actions (emails, tweets, anything public). Be bold with internal ones (reading, organizing, learning).

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
        {
          id: "clean-and-suite",
          name: "clean-and-suite",
          purpose: "Enterprise dry-cleaning management platform workspace.",
          color: "workspace",
          files: [
            {
              id: "context",
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
              id: "context",
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
- **Music:** Suno intro track "Signal in the Canopy" as background

## Key Scripts

- \`scripts/generate_nooz_brief.py\` - Current production script (two-host format)
- \`scripts/generate_marketing_daily3.py\` - Single narrator with website CTAs
- \`scrape_rss.py\` - Fetches tech stories

## Brand Elements

- **Colors:** Dark background (RGB 10,12,20), Orange accent (RGB 255,120,80), Gold text (RGB 212,175,55)
- **Badge:** "THE DAILY DOUBLE" in gold at bottom of cards
- **Animation:** Subtle zoom/pan effect on images

## Known Issues

- **Only 1 ElevenLabs voice** - Alex & Sam sound the same
- **Need:** Second voice ID for true two-host experience

## Status

- **Phase:** Production
- **Workflow:** RSS scrape → LLM script → TTS → FFmpeg video → Upload to YouTube/TikTok`
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
              id: "context",
              name: "context.md",
              content: `# Workspace: nooz.news

## Objective

AI-powered news aggregation website.

## Tech Stack

- Built with Lovable (static export)
- Vercel hosting

## OpenGraph Issue (Feb 7, 2026)

**Problem:** Article links show generic homepage OG tags instead of article-specific

**Root Cause:** Lovable static export doesn't support Vercel Edge Functions/Middleware

**Workaround Created:** \`generate-og-pages.js\` creates static OG pages at \`public/og/[slug].html\`

**Immediate Solution:** Share YouTube/TikTok links (they handle OG tags perfectly)

**Future Fix:** Regenerate Lovable project as Next.js (not static export) to enable Edge Functions

## Status

- **Phase:** Live with OG workaround`
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

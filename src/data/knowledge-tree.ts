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
- Dates and milestones in \`/90_workspaces/\` are the **source of truth**.`
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
- Comment complex logic.`
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

## Template

- **Date:** [YYYY-MM-DD]
- **Issue:** [Description]
- **Status:** [Open/Resolved]`
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

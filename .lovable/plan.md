

# CONTREE Memory System -- Gap Analysis and Token Drain Fix

## 1. The Token Drain Problem (Critical)

The root cause is in `SYSTEM_PROMPT.md`, specifically this directive:

> "Before any action, you MUST traverse this tree:
> 1. Check /90_workspaces/
> 2. Check /02_code-style/
> 3. Check /01_compliance/
> 4. Check /99_archive/"

This tells OpenClaw to read **every file in every folder on every single message**. With 5 workspaces (and algo-trader alone having 10+ files), that is hundreds of lines consumed before OpenClaw even starts answering. It compounds because the output also includes all that context, creating a read-echo loop that burns through tokens fast.

### The Fix: Lazy Loading Protocol

Rewrite the SYSTEM_PROMPT memory protocol to be **selective**, not exhaustive:

```text
## MEMORY PROTOCOL (revised)

Before any action:
1. Identify the ACTIVE WORKSPACE from the user's message or conversation context.
2. Load ONLY that workspace's context.md file.
3. Load 02_code-style/ and 01_compliance/ ONLY when generating or reviewing code.
4. Check 99_archive/ ONLY when the user references a deprecated tool or pattern.

DO NOT pre-load all workspaces. DO NOT read files unrelated to the current task.
```

This alone should cut token usage by 60-80% per interaction.

---

## 2. Missing Workspaces

Two workspaces exist in `docs/90_workspaces/` but are absent from the knowledge tree data:

- **algo-trader** -- Futures intraday mean reversion strategy with 10+ files (Python scripts, risk protocols, tech stack, backtesting docs, and a `library/` subfolder with pitfalls, risk-math, and strategies)
- **mission-control** -- A Next.js project with app directory, config files, and README

These need to be added to `knowledge-tree.ts` with their full file contents pulled from the `docs/` directory.

---

## 3. Other Gaps

| Gap | Details |
|-----|---------|
| **No active workspace indicator** | The SYSTEM_PROMPT says "identify the active project context" but there is no mechanism to set or display which workspace is active. Need a workspace selector in the sidebar or header. |
| **Code blocks not rendered** | `ContentViewer.tsx` returns `null` for lines starting with triple backticks -- multi-line code blocks are silently dropped. |
| **Search is name-only** | Sidebar search filters by folder/file names but not file content. A content-level search would be more useful. |
| **Console warnings** | `Header` passes a ref to `Badge` (a function component) and `Index` passes a ref to `ContentViewer` -- both need `React.forwardRef` or the refs removed. |

---

## Implementation Plan

### Step 1: Fix the token drain
Update the `SYSTEM_PROMPT.md` content in `knowledge-tree.ts` to use lazy/selective loading instead of exhaustive traversal. Add a "COST AWARENESS" section warning against loading unnecessary files.

### Step 2: Add missing workspaces
Add `algo-trader` and `mission-control` to the `subfolders` array inside the `90-workspaces` folder in `knowledge-tree.ts`. Include all files from the `docs/` directory. The algo-trader workspace will include a `library/` subfolder with its 3 files.

### Step 3: Add active workspace selector
Add a workspace selector component (dropdown or clickable list) in the sidebar under the System Prompt entry. When a workspace is selected, it visually highlights and the Header shows "Active: [workspace name]". This gives OpenClaw a clear signal of which context to load.

### Step 4: Fix code block rendering
Update `ContentViewer.tsx` to properly accumulate and render multi-line code blocks (lines between triple backtick pairs) in a styled `<pre><code>` block.

### Step 5: Fix console warnings
Remove stray refs on `Badge` in `Header.tsx` and `ContentViewer` in `Index.tsx`, or wrap them with `React.forwardRef`.


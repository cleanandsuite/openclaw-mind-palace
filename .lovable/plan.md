
# Export & Copy Tools for OpenClaw Integration

## Problem

OpenClaw consumes CONTREE content via copy-paste into project rules (e.g., Cursor rules, Windsurf rules). But the app has no copy functionality -- users must manually select text from the rendered markdown, which loses formatting and is error-prone with code blocks and tables.

## Solution

Add two copy mechanisms that output clean, raw markdown ready for pasting:

### 1. Copy Single File Button

Add a "Copy" button to the `ContentViewer` header bar (next to the file name and lastUpdated badge). Clicking it copies the raw `file.content` string to the clipboard and shows a toast confirmation.

This handles the common case: "I need to paste `call-system.md` into my SellSig project rules."

### 2. Copy Workspace Bundle Button

Add a "Copy All" button to the workspace section in the sidebar (next to the workspace activate toggle). This concatenates all files in the workspace into a single markdown document with clear separators:

```text
# WORKSPACE: sellsig

---
## FILE: context.md
[content]

---
## FILE: call-system.md
[content]

---
## FILE: ai-coaching.md
[content]
...
```

This handles the bootstrap case: "I'm setting up a new project and need all SellSig context at once."

### 3. Copy System Prompt Button

Add a copy button next to the System Prompt entry in the sidebar. This is the most important one -- the SYSTEM_PROMPT.md is what goes into every project's rules to teach OpenClaw how to use the memory system.

## Technical Details

### New utility function in `src/lib/utils.ts`

```typescript
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
```

### File changes

1. **`src/lib/utils.ts`** -- Add `copyToClipboard` helper
2. **`src/components/ContentViewer.tsx`** -- Add copy button in the header bar, using the raw `file.content` value (not the rendered HTML)
3. **`src/components/Sidebar.tsx`** -- Add copy buttons:
   - Next to the System Prompt entry (copies `knowledgeTree.systemPrompt.content`)
   - Next to each workspace name (copies concatenated bundle of all files in that workspace)
4. **`src/data/knowledge-tree.ts`** -- Add a `getWorkspaceBundle(workspaceId: string): string` helper that concatenates all files with separators

### Toast feedback

Uses the existing `sonner` toast to show "Copied to clipboard" or "Failed to copy" messages. No new dependencies needed.

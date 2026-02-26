

# CONTREE Hardening -- Reliability Fixes

## Problem Summary

Six concrete issues that could cause OpenClaw to load wrong context, use stale data, or burn tokens unnecessarily.

## Fixes

### Fix 1: Add `lastUpdated` field to KnowledgeFile

Add an optional `lastUpdated: string` field to the `KnowledgeFile` interface. Populate it for workspace files. ContentViewer shows it in the file header as "Last updated: YYYY-MM-DD". This lets OpenClaw (and users) know if context might be stale.

### Fix 2: Per-Workspace Style Overrides

Add an optional `styleOverrides` section to workspace `context.md` files. For example, algo-trader's context would note "Language: Python" while SellSig notes "Language: TypeScript/React". Update the SYSTEM_PROMPT to say: "If the active workspace specifies style overrides, those take precedence over `02_code-style/`."

### Fix 3: Persist Active Workspace in localStorage

Replace `useState` with a custom hook that reads/writes to `localStorage`. Active workspace survives page reloads.

### Fix 4: Deep-File Loading Guidance in SYSTEM_PROMPT

Add a "FILE DEPTH PROTOCOL" section:
- **Level 1 (always):** Load `context.md` only
- **Level 2 (when coding):** Load the specific file related to the task (e.g., `call-system.md` if the question is about audio capture)
- **Level 3 (never unprompted):** Don't load `model-reference.md` or full analysis docs unless asked

This prevents loading all 5 SellSig files when only one is needed.

### Fix 5: Content Search

Update sidebar search to filter through file content, not just names. When a content match is found, show the file under its parent folder with a snippet preview.

### Fix 6: Ambiguous Query Fallback in SYSTEM_PROMPT

Add to the routing section: "If the workspace cannot be determined from the user's message, ask: 'Which project is this for?' Do NOT guess. Do NOT load multiple workspaces."

## Technical Details

### File changes:

1. **`src/data/knowledge-tree.ts`**
   - Add `lastUpdated?: string` to `KnowledgeFile` interface
   - Update SYSTEM_PROMPT content with File Depth Protocol and ambiguous query fallback
   - Add style override notes to workspace routing table

2. **`src/data/workspaces/sellsig.ts`**
   - Add `lastUpdated: "2026-02-26"` to each file

3. **`src/data/workspaces/algo-trader.ts`**
   - Add `lastUpdated` to each file

4. **`src/data/workspaces/mission-control.ts`**
   - Add `lastUpdated` to each file

5. **`src/components/ContentViewer.tsx`**
   - Show `lastUpdated` in the file header bar when present

6. **`src/components/Sidebar.tsx`**
   - Update search to filter by content (case-insensitive substring match on `file.content`)
   - Show matching files even if their parent folder name doesn't match

7. **`src/pages/Index.tsx`**
   - Replace `useState` for `activeWorkspaceId` with localStorage-backed state


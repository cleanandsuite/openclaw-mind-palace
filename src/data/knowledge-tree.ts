// Live Supabase-backed types & helpers (replaces static TS knowledge tree).
// Tree hierarchy is derived from `file_path` on memory_chunks rows.
import { supabase, SINGLE_USER_ID, lovableCloud } from "@/integrations/supabase/client";

export type ChunkPriority = "critical" | "normal" | "ephemeral";
export type ChunkScope = "global" | "workspace";
export type ChunkSource = "ingested" | "ai_generated" | "user_edited";

export interface MemoryChunk {
  id: string;
  user_id: string;
  workspace_id: string | null;
  scope: ChunkScope;
  file_path: string;
  chunk_index: number;
  content: string;
  priority: ChunkPriority;
  superseded_by: string | null;
  expires_at: string | null;
  source: ChunkSource;
  retrieval_count: number | null;
  last_retrieved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeFile {
  id: string;            // file_path (stable id per file)
  name: string;          // basename of file_path
  path: string;          // full file_path
  content: string;       // chunks concatenated in chunk_index order
  priority: ChunkPriority;
  lastUpdated: string;   // most-recent updated_at across chunks
  chunkCount: number;
  workspace_id: string | null;
  scope: ChunkScope;
}

export interface KnowledgeFolder {
  id: string;
  name: string;
  path: string;          // folder path prefix (e.g. "docs/01_compliance")
  files: KnowledgeFile[];
  subfolders: KnowledgeFolder[];
  color: FolderColor;
}

export type FolderColor =
  | "compliance" | "codeStyle" | "database" | "design"
  | "structure" | "bugs" | "testing" | "workspace" | "archive";

export interface Workspace {
  id: string;
  name: string;
}

const PRIORITY_RANK: Record<ChunkPriority, number> = {
  critical: 3, normal: 2, ephemeral: 1,
};

function colorFor(folderName: string): FolderColor {
  const n = folderName.toLowerCase();
  if (n.includes("compliance")) return "compliance";
  if (n.includes("code") || n.includes("style")) return "codeStyle";
  if (n.includes("database") || n.includes("db") || n.includes("schema")) return "database";
  if (n.includes("design") || n.includes("ui")) return "design";
  if (n.includes("structur")) return "structure";
  if (n.includes("bug") || n.includes("issue")) return "bugs";
  if (n.includes("test")) return "testing";
  if (n.includes("workspace") || n.includes("project")) return "workspace";
  if (n.includes("archive") || n.includes("old")) return "archive";
  return "structure";
}

/** Group chunks by file_path, concatenate content in chunk_index order. */
export function chunksToFiles(chunks: MemoryChunk[]): KnowledgeFile[] {
  const byPath = new Map<string, MemoryChunk[]>();
  for (const c of chunks) {
    const arr = byPath.get(c.file_path) ?? [];
    arr.push(c);
    byPath.set(c.file_path, arr);
  }

  const files: KnowledgeFile[] = [];
  for (const [path, group] of byPath.entries()) {
    group.sort((a, b) => a.chunk_index - b.chunk_index);
    const content = group.map((g) => g.content).join("\n\n");
    let topPriority: ChunkPriority = "ephemeral";
    let lastUpdated = group[0].updated_at;
    for (const g of group) {
      if (PRIORITY_RANK[g.priority] > PRIORITY_RANK[topPriority]) topPriority = g.priority;
      if (g.updated_at > lastUpdated) lastUpdated = g.updated_at;
    }
    const name = path.split("/").pop() || path;
    files.push({
      id: path,
      name,
      path,
      content,
      priority: topPriority,
      lastUpdated,
      chunkCount: group.length,
      workspace_id: group[0].workspace_id,
      scope: group[0].scope,
    });
  }
  files.sort((a, b) => a.path.localeCompare(b.path));
  return files;
}

/** Build a folder tree from KnowledgeFiles, splitting on `/`. */
export function buildFolderTree(files: KnowledgeFile[]): KnowledgeFolder[] {
  const root: KnowledgeFolder = {
    id: "__root__", name: "root", path: "", files: [], subfolders: [], color: "structure",
  };

  for (const file of files) {
    const parts = file.path.split("/");
    const folderParts = parts.slice(0, -1);
    let cursor = root;
    let acc = "";
    for (const p of folderParts) {
      acc = acc ? `${acc}/${p}` : p;
      let next = cursor.subfolders.find((f) => f.path === acc);
      if (!next) {
        next = { id: acc, name: p, path: acc, files: [], subfolders: [], color: colorFor(p) };
        cursor.subfolders.push(next);
      }
      cursor = next;
    }
    cursor.files.push(file);
  }

  const sortFolder = (f: KnowledgeFolder) => {
    f.subfolders.sort((a, b) => a.name.localeCompare(b.name));
    f.files.sort((a, b) => a.name.localeCompare(b.name));
    f.subfolders.forEach(sortFolder);
  };
  sortFolder(root);
  return root.subfolders;
}

/** Fetch all chunks for a workspace (or scope=global if workspaceId is null/'global'). */
export async function fetchChunks(workspaceId: string | null): Promise<MemoryChunk[]> {
  let q = supabase
    .from("memory_chunks")
    .select("*")
    .eq("user_id", SINGLE_USER_ID)
    .is("superseded_by", null)
    .order("file_path", { ascending: true })
    .order("chunk_index", { ascending: true })
    .limit(5000);

  if (workspaceId === null || workspaceId === "global") {
    q = q.eq("scope", "global");
  } else {
    q = q.eq("workspace_id", workspaceId);
  }

  // eslint-disable-next-line no-console
  console.log("[fetchChunks] querying", { workspaceId, user_id: SINGLE_USER_ID });
  const { data, error, status } = await q;
  // eslint-disable-next-line no-console
  console.log("[fetchChunks] result", { status, error, rowCount: data?.length ?? 0, sample: data?.[0] });
  if (error) throw error;
  return (data ?? []) as MemoryChunk[];
}

/** Distinct workspace IDs present in memory_chunks (plus a synthetic 'global'). */
export async function fetchWorkspaces(): Promise<Workspace[]> {
  const { data, error } = await supabase
    .from("memory_chunks")
    .select("workspace_id")
    .eq("user_id", SINGLE_USER_ID)
    .not("workspace_id", "is", null);
  if (error) throw error;
  const ids = new Set<string>();
  for (const row of (data ?? []) as { workspace_id: string | null }[]) {
    if (row.workspace_id) ids.add(row.workspace_id);
  }
  const list: Workspace[] = Array.from(ids).sort().map((id) => ({ id, name: id }));
  return [{ id: "global", name: "global" }, ...list];
}

/** Fetch the SYSTEM_PROMPT chunks (file_path containing 'SYSTEM_PROMPT'). */
export async function fetchSystemPrompt(): Promise<KnowledgeFile | null> {
  const { data, error } = await supabase
    .from("memory_chunks")
    .select("*")
    .eq("user_id", SINGLE_USER_ID)
    .ilike("file_path", "%SYSTEM_PROMPT%")
    .is("superseded_by", null)
    .order("chunk_index", { ascending: true });
  if (error) throw error;
  const chunks = (data ?? []) as MemoryChunk[];
  if (chunks.length === 0) return null;
  const files = chunksToFiles(chunks);
  return files[0] ?? null;
}

/** Concatenate all chunks of a workspace into a single bundle string for copy. */
export async function getWorkspaceBundle(workspaceId: string): Promise<string> {
  const chunks = await fetchChunks(workspaceId);
  const files = chunksToFiles(chunks);
  return files.map((f) => `# ${f.path}\n\n${f.content}`).join("\n\n---\n\n");
}

/** Server-side semantic search via Lovable Cloud edge function. */
export interface SearchResult {
  id: string;
  workspace_id: string | null;
  scope: ChunkScope;
  content: string;
  priority: ChunkPriority;
  file_path: string;
  source: ChunkSource;
  similarity: number;
}

export async function semanticSearch(
  query: string,
  workspaceId: string | null,
  topK = 10,
): Promise<SearchResult[]> {
  const { data, error } = await lovableCloud.functions.invoke("search-chunks", {
    body: { query, workspace_id: workspaceId === "global" ? null : workspaceId, top_k: topK },
  });
  if (error) throw error;
  return (data?.chunks ?? []) as SearchResult[];
}

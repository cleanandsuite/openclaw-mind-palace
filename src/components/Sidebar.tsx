import { Brain, Search, FileCode, Sparkles, Crosshair, Copy, Check, Loader2, Database } from "lucide-react";
import { Input } from "@/components/ui/input";
import { TreeNode } from "./TreeNode";
import {
  KnowledgeFile, KnowledgeFolder, Workspace, SearchResult,
  buildFolderTree, chunksToFiles, fetchChunks, fetchSystemPrompt, fetchWorkspaces,
  getWorkspaceBundle, semanticSearch,
} from "@/data/knowledge-tree";
import { cn, copyToClipboard } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface SidebarProps {
  selectedFileId: string | null;
  onFileSelect: (file: KnowledgeFile) => void;
  onSystemPromptSelect: (file: KnowledgeFile) => void;
  isSystemPromptSelected: boolean;
  activeWorkspaceId: string | null;
  onWorkspaceActivate: (id: string | null) => void;
  systemPromptFile: KnowledgeFile | null;
  files: KnowledgeFile[];
  loading: boolean;
}

export function Sidebar({
  selectedFileId, onFileSelect, onSystemPromptSelect, isSystemPromptSelected,
  activeWorkspaceId, onWorkspaceActivate, systemPromptFile, files, loading,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchWorkspaces().then(setWorkspaces).catch((e) => {
      console.error("fetchWorkspaces failed", e);
    });
  }, []);

  // Debounce search query
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Run semantic search when debounced query changes
  useEffect(() => {
    if (!debouncedQuery) {
      setSearchResults(null);
      return;
    }
    let cancelled = false;
    setSearching(true);
    semanticSearch(debouncedQuery, activeWorkspaceId, 15)
      .then((res) => { if (!cancelled) setSearchResults(res); })
      .catch((e) => {
        console.error("semanticSearch failed", e);
        if (!cancelled) {
          toast.error("Search failed: " + (e?.message ?? "unknown"));
          setSearchResults([]);
        }
      })
      .finally(() => { if (!cancelled) setSearching(false); });
    return () => { cancelled = true; };
  }, [debouncedQuery, activeWorkspaceId]);

  const tree = useMemo<KnowledgeFolder[]>(() => buildFolderTree(files), [files]);

  const handleCopy = async (id: string, text: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedId(id);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopiedId(null), 2000);
    } else {
      toast.error("Failed to copy");
    }
  };

  return (
    <aside className="w-80 bg-sidebar border-r border-sidebar-border flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-primary">
              <Brain className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-sidebar animate-pulse-glow" />
          </div>
          <div className="flex-1">
            <h1 className="font-semibold text-foreground tracking-tight">CONTREE</h1>
            <p className="text-xs text-muted-foreground">Agentic Memory v2.0</p>
          </div>
          <Link
            to="/memory"
            title="Memory admin"
            className="p-1.5 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
          >
            <Database className="h-4 w-4" />
          </Link>
        </div>

        <div className="relative">
          {searching ? (
            <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
          ) : (
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          )}
          <Input
            placeholder="Semantic search…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-secondary/50 border-sidebar-border text-sm h-9"
          />
        </div>
      </div>

      {/* System Prompt */}
      <div className="px-3 py-2 border-b border-sidebar-border">
        <button
          onClick={() => systemPromptFile && onSystemPromptSelect(systemPromptFile)}
          disabled={!systemPromptFile}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
            "hover:bg-primary/10 group disabled:opacity-50 disabled:cursor-not-allowed",
            isSystemPromptSelected && "bg-primary/15 border border-primary/30",
          )}
        >
          <div className={cn("p-1.5 rounded-md transition-colors", isSystemPromptSelected ? "bg-primary/20" : "bg-secondary")}>
            <Sparkles className={cn("h-4 w-4", isSystemPromptSelected ? "text-primary" : "text-muted-foreground")} />
          </div>
          <div className="text-left flex-1">
            <span className={cn(
              "text-sm font-medium block",
              isSystemPromptSelected ? "text-primary" : "text-sidebar-foreground",
            )}>
              SYSTEM_PROMPT.md
            </span>
            <span className="text-xs text-muted-foreground">
              {systemPromptFile ? "Core identity" : "Not found in memory"}
            </span>
          </div>
          {systemPromptFile && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => { e.stopPropagation(); handleCopy("system-prompt", systemPromptFile.content); }}
              onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); handleCopy("system-prompt", systemPromptFile.content); } }}
              className="p-1 rounded hover:bg-primary/10 transition-colors"
              title="Copy system prompt"
            >
              {copiedId === "system-prompt"
                ? <Check className="h-3.5 w-3.5 text-green-500" />
                : <Copy className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" />}
            </span>
          )}
        </button>
      </div>

      {/* Active workspace */}
      <div className="px-3 py-2 border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 mb-2">
          <Crosshair className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active Workspace</span>
        </div>
        <div className="space-y-0.5">
          {workspaces.map((ws) => (
            <div
              key={ws.id}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-left text-xs transition-all duration-200",
                "hover:bg-primary/10",
                activeWorkspaceId === ws.id ? "bg-primary/15 text-primary border border-primary/30" : "text-muted-foreground",
              )}
            >
              <button
                onClick={() => onWorkspaceActivate(activeWorkspaceId === ws.id ? null : ws.id)}
                className="flex items-center gap-2 flex-1 min-w-0"
              >
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full transition-colors shrink-0",
                  activeWorkspaceId === ws.id ? "bg-primary" : "bg-muted-foreground/30",
                )} />
                <span className="font-mono flex-1 truncate">{ws.name}</span>
              </button>
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  try {
                    const bundle = await getWorkspaceBundle(ws.id);
                    handleCopy(`ws-${ws.id}`, bundle);
                  } catch (err) {
                    console.error(err);
                    toast.error("Failed to assemble bundle");
                  }
                }}
                className="p-0.5 rounded hover:bg-primary/10 transition-colors"
                title="Copy all chunks for workspace"
              >
                {copiedId === `ws-${ws.id}`
                  ? <Check className="h-3 w-3 text-green-500" />
                  : <Copy className="h-3 w-3 text-muted-foreground hover:text-primary" />}
              </button>
            </div>
          ))}
          {workspaces.length === 0 && (
            <div className="px-3 py-2 text-xs text-muted-foreground italic">No workspaces yet</div>
          )}
        </div>
      </div>

      {/* Tree or search results */}
      <div className="flex-1 overflow-auto scrollbar-thin p-3">
        {loading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground text-sm gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading chunks…
          </div>
        ) : searchResults ? (
          <SearchResultsList
            results={searchResults}
            onSelect={(r) => {
              const file = files.find((f) => f.path === r.file_path);
              if (file) onFileSelect(file);
              else toast.info("File outside current workspace — switch workspace to view it");
            }}
            selectedFileId={selectedFileId}
          />
        ) : tree.length === 0 ? (
          <div className="px-3 py-6 text-xs text-muted-foreground italic text-center">
            No chunks in this scope. Ingest docs via the CLI.
          </div>
        ) : (
          <div className="space-y-1">
            {tree.map((folder) => (
              <TreeNode
                key={folder.id}
                folder={folder}
                selectedFileId={selectedFileId}
                onFileSelect={onFileSelect}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <FileCode className="h-3.5 w-3.5" />
          <span className="truncate">memory_chunks · {files.length} files</span>
        </div>
      </div>
    </aside>
  );
}

function SearchResultsList({
  results, onSelect, selectedFileId,
}: {
  results: SearchResult[];
  onSelect: (r: SearchResult) => void;
  selectedFileId: string | null;
}) {
  if (results.length === 0) {
    return <div className="px-3 py-6 text-xs text-muted-foreground italic text-center">No matches.</div>;
  }
  return (
    <div className="space-y-1">
      <div className="px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">
        {results.length} semantic matches
      </div>
      {results.map((r) => {
        const name = r.file_path.split("/").pop() || r.file_path;
        const isSelected = selectedFileId === r.file_path;
        return (
          <button
            key={r.id}
            onClick={() => onSelect(r)}
            className={cn(
              "w-full text-left px-3 py-2 rounded-md hover:bg-secondary/50 transition-colors",
              isSelected && "bg-primary/10 border border-primary/30",
            )}
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-sm font-medium text-foreground truncate">{name}</span>
              <span className="text-[10px] font-mono text-primary shrink-0">
                {(r.similarity * 100).toFixed(0)}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">{r.content}</p>
            <div className="text-[10px] text-muted-foreground/70 font-mono mt-1 truncate">{r.file_path}</div>
          </button>
        );
      })}
    </div>
  );
}

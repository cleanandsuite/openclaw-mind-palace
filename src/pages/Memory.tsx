import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Brain, ArrowLeft, Loader2, Trash2, Save, X, Pencil } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase, SINGLE_USER_ID } from "@/integrations/supabase/client";
import {
  ChunkPriority, ChunkScope, ChunkSource, MemoryChunk, Workspace, fetchWorkspaces,
} from "@/data/knowledge-tree";

const PRIORITY_BADGE: Record<ChunkPriority, string> = {
  critical: "bg-destructive/15 text-destructive border-destructive/40",
  normal: "bg-primary/15 text-primary border-primary/40",
  ephemeral: "bg-muted text-muted-foreground border-border",
};

function approxTokens(s: string): number {
  // ~4 chars per token heuristic
  return Math.ceil((s?.length ?? 0) / 4);
}

const ALL = "__all__";

const Memory = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [chunks, setChunks] = useState<MemoryChunk[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [workspaceFilter, setWorkspaceFilter] = useState<string>(ALL);
  const [scopeFilter, setScopeFilter] = useState<string>(ALL);
  const [priorityFilter, setPriorityFilter] = useState<string>(ALL);
  const [sourceFilter, setSourceFilter] = useState<string>(ALL);
  const [showSuperseded, setShowSuperseded] = useState(false);
  const [search, setSearch] = useState("");

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");

  useEffect(() => {
    fetchWorkspaces().then(setWorkspaces).catch(console.error);
    loadChunks();
  }, []);

  async function loadChunks() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("memory_chunks")
        .select("*")
        .eq("user_id", SINGLE_USER_ID)
        .order("file_path", { ascending: true })
        .order("chunk_index", { ascending: true });
      if (error) throw error;
      setChunks((data ?? []) as MemoryChunk[]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "unknown";
      toast.error("Failed to load chunks: " + msg);
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return chunks.filter((c) => {
      if (!showSuperseded && c.superseded_by) return false;
      if (workspaceFilter !== ALL) {
        if (workspaceFilter === "global" && c.scope !== "global") return false;
        if (workspaceFilter !== "global" && c.workspace_id !== workspaceFilter) return false;
      }
      if (scopeFilter !== ALL && c.scope !== scopeFilter) return false;
      if (priorityFilter !== ALL && c.priority !== priorityFilter) return false;
      if (sourceFilter !== ALL && c.source !== sourceFilter) return false;
      if (q && !c.content.toLowerCase().includes(q) && !c.file_path.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [chunks, search, workspaceFilter, scopeFilter, priorityFilter, sourceFilter, showSuperseded]);

  const totalTokens = useMemo(
    () => filtered.reduce((acc, c) => acc + approxTokens(c.content), 0),
    [filtered],
  );

  async function handleSaveEdit(id: string) {
    try {
      const { error } = await supabase
        .from("memory_chunks")
        .update({ content: editingContent, source: "user_edited", updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      toast.success("Chunk updated");
      setEditingId(null);
      setEditingContent("");
      loadChunks();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "unknown";
      toast.error("Update failed: " + msg);
    }
  }

  async function handleChangePriority(id: string, priority: ChunkPriority) {
    try {
      const { error } = await supabase
        .from("memory_chunks")
        .update({ priority, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      toast.success(`Priority → ${priority}`);
      loadChunks();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "unknown";
      toast.error("Priority change failed: " + msg);
    }
  }

  async function handleDelete(id: string) {
    try {
      const { error } = await supabase.from("memory_chunks").delete().eq("id", id);
      if (error) throw error;
      toast.success("Chunk deleted");
      loadChunks();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "unknown";
      toast.error("Delete failed: " + msg);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="h-14 border-b border-border bg-card flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <Link to="/" className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Brain className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold text-foreground tracking-tight text-sm">Memory Admin</h1>
            <p className="text-[11px] text-muted-foreground font-mono">CONTREE · agentic memory</p>
          </div>
        </div>
        <Badge variant="outline" className="font-mono text-[11px]">
          {chunks.length} total chunks
        </Badge>
      </header>

      <div className="p-6">
        <Tabs defaultValue="browser" className="w-full">
          <TabsList>
            <TabsTrigger value="browser">Memory Browser</TabsTrigger>
            <TabsTrigger value="tools" disabled>Tool Registry</TabsTrigger>
            <TabsTrigger value="telemetry" disabled>Telemetry</TabsTrigger>
            <TabsTrigger value="sessions" disabled>Sessions</TabsTrigger>
          </TabsList>

          <TabsContent value="browser" className="mt-4 space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg border border-border bg-card">
              <Input
                placeholder="Filter content or path…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-xs h-9"
              />
              <FilterSelect
                value={workspaceFilter} onChange={setWorkspaceFilter} placeholder="Workspace"
                options={[{ value: ALL, label: "All workspaces" }, ...workspaces.map((w) => ({ value: w.id, label: w.name }))]}
              />
              <FilterSelect
                value={scopeFilter} onChange={setScopeFilter} placeholder="Scope"
                options={[{ value: ALL, label: "All scopes" }, { value: "global", label: "global" }, { value: "workspace", label: "workspace" }]}
              />
              <FilterSelect
                value={priorityFilter} onChange={setPriorityFilter} placeholder="Priority"
                options={[
                  { value: ALL, label: "All priorities" },
                  { value: "critical", label: "critical" },
                  { value: "normal", label: "normal" },
                  { value: "ephemeral", label: "ephemeral" },
                ]}
              />
              <FilterSelect
                value={sourceFilter} onChange={setSourceFilter} placeholder="Source"
                options={[
                  { value: ALL, label: "All sources" },
                  { value: "ingested", label: "ingested" },
                  { value: "ai_generated", label: "ai_generated" },
                  { value: "user_edited", label: "user_edited" },
                ]}
              />
              <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={showSuperseded}
                  onChange={(e) => setShowSuperseded(e.target.checked)}
                  className="accent-primary"
                />
                Show superseded
              </label>
              <div className="ml-auto text-xs text-muted-foreground font-mono">
                {filtered.length} rows · ~{totalTokens.toLocaleString()} tokens
              </div>
            </div>

            {/* Table */}
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Content</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Scope</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Path</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <Loader2 className="inline h-4 w-4 animate-spin mr-2" />
                        Loading…
                      </TableCell>
                    </TableRow>
                  ) : filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">
                        No chunks match the current filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((c) => {
                      const isEditing = editingId === c.id;
                      const isSuperseded = !!c.superseded_by;
                      return (
                        <TableRow key={c.id} className={cn(isSuperseded && "opacity-60")}>
                          <TableCell className="align-top">
                            {isEditing ? (
                              <Textarea
                                value={editingContent}
                                onChange={(e) => setEditingContent(e.target.value)}
                                className="min-h-[120px] font-mono text-xs"
                              />
                            ) : (
                              <div className={cn(
                                "text-xs font-mono whitespace-pre-wrap line-clamp-3",
                                isSuperseded && "line-through",
                              )}>
                                {c.content.slice(0, 240)}{c.content.length > 240 ? "…" : ""}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="align-top">
                            <Select
                              value={c.priority}
                              onValueChange={(v) => handleChangePriority(c.id, v as ChunkPriority)}
                            >
                              <SelectTrigger className={cn("h-7 text-[11px] border", PRIORITY_BADGE[c.priority])}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="critical">critical</SelectItem>
                                <SelectItem value="normal">normal</SelectItem>
                                <SelectItem value="ephemeral">ephemeral</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="align-top">
                            <Badge variant="outline" className="text-[10px] font-mono">{c.scope}</Badge>
                          </TableCell>
                          <TableCell className="align-top">
                            <Badge variant="outline" className="text-[10px] font-mono">{c.source}</Badge>
                          </TableCell>
                          <TableCell className="align-top">
                            <div className="text-[11px] font-mono text-muted-foreground max-w-[200px] truncate" title={c.file_path}>
                              {c.file_path}
                            </div>
                            <div className="text-[10px] text-muted-foreground/70">#{c.chunk_index}</div>
                          </TableCell>
                          <TableCell className="align-top">
                            <div className="text-[11px] text-muted-foreground font-mono">
                              {new Date(c.updated_at).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell className="align-top text-right">
                            <div className="inline-flex items-center gap-1">
                              {isEditing ? (
                                <>
                                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleSaveEdit(c.id)} title="Save">
                                    <Save className="h-3.5 w-3.5 text-green-500" />
                                  </Button>
                                  <Button size="icon" variant="ghost" className="h-7 w-7"
                                    onClick={() => { setEditingId(null); setEditingContent(""); }} title="Cancel">
                                    <X className="h-3.5 w-3.5" />
                                  </Button>
                                </>
                              ) : (
                                <Button size="icon" variant="ghost" className="h-7 w-7"
                                  onClick={() => { setEditingId(c.id); setEditingContent(c.content); }} title="Edit">
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                              )}
                              <DeleteButton onConfirm={() => handleDelete(c.id)} />
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

function FilterSelect({
  value, onChange, options, placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9 w-[180px] text-xs">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function DeleteButton({ onConfirm }: { onConfirm: () => void }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this chunk?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently removes the chunk from memory_chunks. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default Memory;

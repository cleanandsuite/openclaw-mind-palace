import { Brain, Search, FileCode, Sparkles, Crosshair } from "lucide-react";
import { Input } from "@/components/ui/input";
import { TreeNode } from "./TreeNode";
import { knowledgeTree, KnowledgeFile, getWorkspaces } from "@/data/knowledge-tree";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface SidebarProps {
  selectedFileId: string | null;
  onFileSelect: (file: KnowledgeFile) => void;
  onSystemPromptSelect: () => void;
  isSystemPromptSelected: boolean;
  activeWorkspaceId: string | null;
  onWorkspaceActivate: (id: string | null) => void;
}

export function Sidebar({ 
  selectedFileId, 
  onFileSelect, 
  onSystemPromptSelect,
  isSystemPromptSelected,
  activeWorkspaceId,
  onWorkspaceActivate,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const workspaces = getWorkspaces();

  const filteredFolders = searchQuery
    ? knowledgeTree.folders.filter(folder => 
        folder.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        folder.files.some(file => file.name.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : knowledgeTree.folders;

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
          <div>
            <h1 className="font-semibold text-foreground tracking-tight">CONTREE</h1>
            <p className="text-xs text-muted-foreground">OpenClaw Knowledge v2.0</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-secondary/50 border-sidebar-border text-sm h-9"
          />
        </div>
      </div>

      {/* System Prompt - Special Entry */}
      <div className="px-3 py-2 border-b border-sidebar-border">
        <button
          onClick={onSystemPromptSelect}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
            "hover:bg-primary/10 group",
            isSystemPromptSelected && "bg-primary/15 border border-primary/30"
          )}
        >
          <div className={cn(
            "p-1.5 rounded-md transition-colors",
            isSystemPromptSelected ? "bg-primary/20" : "bg-secondary"
          )}>
            <Sparkles className={cn(
              "h-4 w-4",
              isSystemPromptSelected ? "text-primary" : "text-muted-foreground"
            )} />
          </div>
          <div className="text-left">
            <span className={cn(
              "text-sm font-medium block",
              isSystemPromptSelected ? "text-primary" : "text-sidebar-foreground"
            )}>
              SYSTEM_PROMPT.md
            </span>
            <span className="text-xs text-muted-foreground">Core identity</span>
          </div>
        </button>
      </div>

      {/* Active Workspace Selector */}
      <div className="px-3 py-2 border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 mb-2">
          <Crosshair className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active Workspace</span>
        </div>
        <div className="space-y-0.5">
          {workspaces.map((ws) => (
            <button
              key={ws.id}
              onClick={() => onWorkspaceActivate(activeWorkspaceId === ws.id ? null : ws.id)}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-left text-xs transition-all duration-200",
                "hover:bg-primary/10",
                activeWorkspaceId === ws.id 
                  ? "bg-primary/15 text-primary border border-primary/30" 
                  : "text-muted-foreground"
              )}
            >
              <div className={cn(
                "w-1.5 h-1.5 rounded-full transition-colors",
                activeWorkspaceId === ws.id ? "bg-primary" : "bg-muted-foreground/30"
              )} />
              <span className="font-mono">{ws.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tree View */}
      <div className="flex-1 overflow-auto scrollbar-thin p-3">
        <div className="space-y-1">
          {filteredFolders.map((folder) => (
            <TreeNode
              key={folder.id}
              folder={folder}
              selectedFileId={selectedFileId}
              onFileSelect={onFileSelect}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <FileCode className="h-3.5 w-3.5" />
          <span>{knowledgeTree.rootPath}</span>
        </div>
      </div>
    </aside>
  );
}

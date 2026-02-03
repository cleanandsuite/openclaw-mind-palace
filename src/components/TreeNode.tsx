import { useState } from "react";
import { ChevronRight, Folder, FolderOpen, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { KnowledgeFolder, KnowledgeFile } from "@/data/knowledge-tree";

interface TreeNodeProps {
  folder: KnowledgeFolder;
  level?: number;
  selectedFileId: string | null;
  onFileSelect: (file: KnowledgeFile) => void;
}

const folderColorMap: Record<KnowledgeFolder['color'], string> = {
  compliance: "text-folder-compliance",
  codeStyle: "text-folder-codeStyle",
  database: "text-folder-database",
  design: "text-folder-design",
  structure: "text-folder-structure",
  bugs: "text-folder-bugs",
  testing: "text-folder-testing",
  workspace: "text-folder-workspace",
  archive: "text-folder-archive",
};

const folderBgMap: Record<KnowledgeFolder['color'], string> = {
  compliance: "bg-folder-compliance/10 border-folder-compliance/30",
  codeStyle: "bg-folder-codeStyle/10 border-folder-codeStyle/30",
  database: "bg-folder-database/10 border-folder-database/30",
  design: "bg-folder-design/10 border-folder-design/30",
  structure: "bg-folder-structure/10 border-folder-structure/30",
  bugs: "bg-folder-bugs/10 border-folder-bugs/30",
  testing: "bg-folder-testing/10 border-folder-testing/30",
  workspace: "bg-folder-workspace/10 border-folder-workspace/30",
  archive: "bg-folder-archive/10 border-folder-archive/30",
};

export function TreeNode({ folder, level = 0, selectedFileId, onFileSelect }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(level === 0);

  const FolderIcon = isExpanded ? FolderOpen : Folder;
  const hasChildren = folder.files.length > 0 || (folder.subfolders && folder.subfolders.length > 0);

  return (
    <div className="animate-fade-in" style={{ animationDelay: `${level * 50}ms` }}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-all duration-200",
          "hover:bg-secondary/50 group",
          isExpanded && hasChildren && "bg-secondary/30"
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
      >
        <ChevronRight
          className={cn(
            "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
            isExpanded && "rotate-90",
            !hasChildren && "opacity-0"
          )}
        />
        <FolderIcon className={cn("h-4 w-4", folderColorMap[folder.color])} />
        <span className="text-sm font-medium text-sidebar-foreground group-hover:text-foreground transition-colors">
          {folder.name}
        </span>
      </button>

      {isExpanded && (
        <div className="overflow-hidden">
          {folder.files.map((file) => (
            <button
              key={file.id}
              onClick={() => onFileSelect(file)}
              className={cn(
                "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-all duration-200",
                "hover:bg-secondary/50",
                selectedFileId === file.id && folderBgMap[folder.color],
                selectedFileId === file.id && "border"
              )}
              style={{ paddingLeft: `${(level + 1) * 12 + 24}px` }}
            >
              <FileText className={cn(
                "h-3.5 w-3.5",
                selectedFileId === file.id ? folderColorMap[folder.color] : "text-muted-foreground"
              )} />
              <span className={cn(
                "text-sm transition-colors",
                selectedFileId === file.id ? "text-foreground font-medium" : "text-muted-foreground"
              )}>
                {file.name}
              </span>
            </button>
          ))}

          {folder.subfolders?.map((subfolder) => (
            <TreeNode
              key={subfolder.id}
              folder={subfolder}
              level={level + 1}
              selectedFileId={selectedFileId}
              onFileSelect={onFileSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

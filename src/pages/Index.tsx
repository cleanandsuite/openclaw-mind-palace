import { useState, useCallback } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ContentViewer } from "@/components/ContentViewer";
import { Header } from "@/components/Header";
import { knowledgeTree, KnowledgeFile, getWorkspaces } from "@/data/knowledge-tree";

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<KnowledgeFile | null>(null);
  const [isSystemPromptSelected, setIsSystemPromptSelected] = useState(false);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(() => {
    try { return localStorage.getItem("contree-active-workspace"); } catch { return null; }
  });

  const handleWorkspaceActivate = useCallback((id: string | null) => {
    setActiveWorkspaceId(id);
    try {
      if (id) localStorage.setItem("contree-active-workspace", id);
      else localStorage.removeItem("contree-active-workspace");
    } catch { /* noop */ }
  }, []);

  const workspaces = getWorkspaces();
  const activeWorkspaceName = workspaces.find(w => w.id === activeWorkspaceId)?.name ?? null;

  const handleFileSelect = (file: KnowledgeFile) => {
    setSelectedFile(file);
    setIsSystemPromptSelected(false);
  };

  const handleSystemPromptSelect = () => {
    setSelectedFile(knowledgeTree.systemPrompt);
    setIsSystemPromptSelected(true);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar
        selectedFileId={isSystemPromptSelected ? "system-prompt" : selectedFile?.id ?? null}
        onFileSelect={handleFileSelect}
        onSystemPromptSelect={handleSystemPromptSelect}
        isSystemPromptSelected={isSystemPromptSelected}
        activeWorkspaceId={activeWorkspaceId}
        onWorkspaceActivate={handleWorkspaceActivate}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header activeWorkspace={activeWorkspaceName} />
        <ContentViewer 
          file={selectedFile} 
          isSystemPrompt={isSystemPromptSelected}
        />
      </div>
    </div>
  );
};

export default Index;

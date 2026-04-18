import { useEffect, useState, useCallback } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ContentViewer } from "@/components/ContentViewer";
import { Header } from "@/components/Header";
import {
  KnowledgeFile, chunksToFiles, fetchChunks, fetchSystemPrompt,
} from "@/data/knowledge-tree";
import { toast } from "sonner";

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<KnowledgeFile | null>(null);
  const [isSystemPromptSelected, setIsSystemPromptSelected] = useState(false);
  const [systemPromptFile, setSystemPromptFile] = useState<KnowledgeFile | null>(null);
  const [files, setFiles] = useState<KnowledgeFile[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Load chunks whenever workspace changes
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchChunks(activeWorkspaceId)
      .then((chunks) => { if (!cancelled) setFiles(chunksToFiles(chunks)); })
      .catch((e) => {
        console.error("fetchChunks failed", e);
        toast.error("Failed to load chunks: " + (e?.message ?? "unknown"));
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [activeWorkspaceId]);

  // Load system prompt once
  useEffect(() => {
    fetchSystemPrompt()
      .then(setSystemPromptFile)
      .catch((e) => console.error("fetchSystemPrompt failed", e));
  }, []);

  const handleFileSelect = (file: KnowledgeFile) => {
    setSelectedFile(file);
    setIsSystemPromptSelected(false);
  };

  const handleSystemPromptSelect = (file: KnowledgeFile) => {
    setSelectedFile(file);
    setIsSystemPromptSelected(true);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar
        selectedFileId={isSystemPromptSelected ? systemPromptFile?.id ?? null : selectedFile?.id ?? null}
        onFileSelect={handleFileSelect}
        onSystemPromptSelect={handleSystemPromptSelect}
        isSystemPromptSelected={isSystemPromptSelected}
        activeWorkspaceId={activeWorkspaceId}
        onWorkspaceActivate={handleWorkspaceActivate}
        systemPromptFile={systemPromptFile}
        files={files}
        loading={loading}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header activeWorkspace={activeWorkspaceId} />
        <ContentViewer
          file={selectedFile}
          isSystemPrompt={isSystemPromptSelected}
        />
      </div>
    </div>
  );
};

export default Index;

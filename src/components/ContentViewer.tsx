import { FileText, Code, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";
import { KnowledgeFile } from "@/data/knowledge-tree";

interface ContentViewerProps {
  file: KnowledgeFile | null;
  isSystemPrompt?: boolean;
}

function parseMarkdown(content: string): string {
  // Simple markdown parsing for display
  return content
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/```([\s\S]*?)```/g, '<pre>$1</pre>')
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[huplo])/gm, '<p>')
    .replace(/(?<![>])$/gm, '</p>');
}

export function ContentViewer({ file, isSystemPrompt }: ContentViewerProps) {
  if (!file) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-secondary/50 flex items-center justify-center">
            <Terminal className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-foreground">Select a file</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Choose a file from the knowledge tree to view its contents
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden">
      {/* File header */}
      <div className={cn(
        "flex items-center gap-3 px-6 py-4 border-b border-border",
        isSystemPrompt && "bg-gradient-to-r from-primary/5 to-accent/5"
      )}>
        <div className={cn(
          "p-2 rounded-lg",
          isSystemPrompt ? "bg-primary/10" : "bg-secondary"
        )}>
          {isSystemPrompt ? (
            <Code className="h-4 w-4 text-primary" />
          ) : (
            <FileText className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
        <div>
          <h2 className={cn(
            "font-mono text-sm font-semibold",
            isSystemPrompt ? "text-gradient" : "text-foreground"
          )}>
            {file.name}
          </h2>
          {isSystemPrompt && (
            <p className="text-xs text-muted-foreground">System Identity & Memory Protocol</p>
          )}
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-auto scrollbar-thin p-6">
        <div className="max-w-3xl animate-fade-in">
          <div className="markdown-content font-mono text-sm leading-relaxed">
            {file.content.split('\n').map((line, index) => {
              if (line.startsWith('# ')) {
                return (
                  <h1 key={index} className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">
                    {line.replace('# ', '')}
                  </h1>
                );
              }
              if (line.startsWith('## ')) {
                return (
                  <h2 key={index} className="text-xl font-semibold text-foreground mt-6 mb-3">
                    {line.replace('## ', '')}
                  </h2>
                );
              }
              if (line.startsWith('### ')) {
                return (
                  <h3 key={index} className="text-lg font-medium text-foreground mt-4 mb-2">
                    {line.replace('### ', '')}
                  </h3>
                );
              }
              if (line.startsWith('- ')) {
                const content = line.replace('- ', '');
                return (
                  <div key={index} className="flex items-start gap-2 text-muted-foreground mb-1 pl-2">
                    <span className="text-primary mt-1.5">•</span>
                    <span dangerouslySetInnerHTML={{ 
                      __html: content
                        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>')
                        .replace(/`([^`]+)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-xs text-primary">$1</code>')
                    }} />
                  </div>
                );
              }
              if (line.match(/^\d+\./)) {
                const content = line.replace(/^\d+\.\s*/, '');
                const num = line.match(/^\d+/)?.[0];
                return (
                  <div key={index} className="flex items-start gap-3 text-muted-foreground mb-2 pl-2">
                    <span className="text-primary font-semibold min-w-[1.5rem]">{num}.</span>
                    <span dangerouslySetInnerHTML={{ 
                      __html: content
                        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>')
                        .replace(/`([^`]+)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-xs text-primary">$1</code>')
                    }} />
                  </div>
                );
              }
              if (line.startsWith('```')) {
                return null; // Handle code blocks separately
              }
              if (line.trim() === '') {
                return <div key={index} className="h-3" />;
              }
              return (
                <p key={index} className="text-muted-foreground mb-2" dangerouslySetInnerHTML={{ 
                  __html: line
                    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>')
                    .replace(/`([^`]+)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-xs text-primary">$1</code>')
                }} />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

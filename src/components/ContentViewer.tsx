import { FileText, Code, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";
import { KnowledgeFile } from "@/data/knowledge-tree";
import { useMemo } from "react";

interface ContentViewerProps {
  file: KnowledgeFile | null;
  isSystemPrompt?: boolean;
}

interface ParsedLine {
  type: 'h1' | 'h2' | 'h3' | 'bullet' | 'numbered' | 'code-block' | 'empty' | 'text' | 'table-header' | 'table-separator' | 'table-row';
  content: string;
  lang?: string;
  lines?: string[];
}

function parseLines(content: string): ParsedLine[] {
  const rawLines = content.split('\n');
  const parsed: ParsedLine[] = [];
  let i = 0;

  while (i < rawLines.length) {
    const line = rawLines[i];

    // Code block
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < rawLines.length && !rawLines[i].startsWith('```')) {
        codeLines.push(rawLines[i]);
        i++;
      }
      i++; // skip closing ```
      parsed.push({ type: 'code-block', content: codeLines.join('\n'), lang, lines: codeLines });
      continue;
    }

    if (line.startsWith('# ')) {
      parsed.push({ type: 'h1', content: line.slice(2) });
    } else if (line.startsWith('## ')) {
      parsed.push({ type: 'h2', content: line.slice(3) });
    } else if (line.startsWith('### ')) {
      parsed.push({ type: 'h3', content: line.slice(4) });
    } else if (line.startsWith('- ')) {
      parsed.push({ type: 'bullet', content: line.slice(2) });
    } else if (line.match(/^\d+\./)) {
      parsed.push({ type: 'numbered', content: line });
    } else if (line.startsWith('|') && i + 1 < rawLines.length && rawLines[i + 1]?.match(/^\|[\s-:|]+\|$/)) {
      // Table header
      parsed.push({ type: 'table-header', content: line });
      i++;
      parsed.push({ type: 'table-separator', content: rawLines[i] });
    } else if (line.startsWith('|') && line.endsWith('|')) {
      parsed.push({ type: 'table-row', content: line });
    } else if (line.trim() === '') {
      parsed.push({ type: 'empty', content: '' });
    } else {
      parsed.push({ type: 'text', content: line });
    }
    i++;
  }

  return parsed;
}

function inlineFormat(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>')
    .replace(/`([^`]+)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-xs text-primary">$1</code>')
    .replace(/_([^_]+)_/g, '<em>$1</em>');
}

function parseTableCells(row: string): string[] {
  return row.split('|').slice(1, -1).map(c => c.trim());
}

export function ContentViewer({ file, isSystemPrompt }: ContentViewerProps) {
  const parsed = useMemo(() => file ? parseLines(file.content) : [], [file]);

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
            {parsed.map((item, index) => {
              switch (item.type) {
                case 'h1':
                  return (
                    <h1 key={index} className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">
                      {item.content}
                    </h1>
                  );
                case 'h2':
                  return (
                    <h2 key={index} className="text-xl font-semibold text-foreground mt-6 mb-3">
                      {item.content}
                    </h2>
                  );
                case 'h3':
                  return (
                    <h3 key={index} className="text-lg font-medium text-foreground mt-4 mb-2">
                      {item.content}
                    </h3>
                  );
                case 'bullet':
                  return (
                    <div key={index} className="flex items-start gap-2 text-muted-foreground mb-1 pl-2">
                      <span className="text-primary mt-1.5">•</span>
                      <span dangerouslySetInnerHTML={{ __html: inlineFormat(item.content) }} />
                    </div>
                  );
                case 'numbered': {
                  const num = item.content.match(/^\d+/)?.[0];
                  const text = item.content.replace(/^\d+\.\s*/, '');
                  return (
                    <div key={index} className="flex items-start gap-3 text-muted-foreground mb-2 pl-2">
                      <span className="text-primary font-semibold min-w-[1.5rem]">{num}.</span>
                      <span dangerouslySetInnerHTML={{ __html: inlineFormat(text) }} />
                    </div>
                  );
                }
                case 'code-block':
                  return (
                    <div key={index} className="my-4 rounded-lg overflow-hidden border border-border">
                      {item.lang && (
                        <div className="bg-muted/80 px-4 py-1.5 text-xs text-muted-foreground border-b border-border">
                          {item.lang}
                        </div>
                      )}
                      <pre className="bg-muted/40 p-4 overflow-x-auto text-sm leading-relaxed">
                        <code className="text-muted-foreground">{item.content}</code>
                      </pre>
                    </div>
                  );
                case 'table-header': {
                  // Collect all subsequent table rows
                  const headerCells = parseTableCells(item.content);
                  const rows: string[][] = [];
                  let j = index + 1;
                  while (j < parsed.length && (parsed[j].type === 'table-separator' || parsed[j].type === 'table-row')) {
                    if (parsed[j].type === 'table-row') {
                      rows.push(parseTableCells(parsed[j].content));
                    }
                    j++;
                  }
                  return (
                    <div key={index} className="my-4 overflow-x-auto rounded-lg border border-border">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-muted/50">
                            {headerCells.map((cell, ci) => (
                              <th key={ci} className="px-4 py-2 text-left text-foreground font-semibold border-b border-border">
                                <span dangerouslySetInnerHTML={{ __html: inlineFormat(cell) }} />
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((row, ri) => (
                            <tr key={ri} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                              {row.map((cell, ci) => (
                                <td key={ci} className="px-4 py-2 text-muted-foreground">
                                  <span dangerouslySetInnerHTML={{ __html: inlineFormat(cell) }} />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                }
                case 'table-separator':
                case 'table-row':
                  // Already handled by table-header
                  return null;
                case 'empty':
                  return <div key={index} className="h-3" />;
                default:
                  return (
                    <p key={index} className="text-muted-foreground mb-2" dangerouslySetInnerHTML={{ 
                      __html: inlineFormat(item.content)
                    }} />
                  );
              }
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

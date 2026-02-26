import { Activity, GitBranch, Clock, Crosshair } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface HeaderProps {
  activeWorkspace?: string | null;
}

export function Header({ activeWorkspace }: HeaderProps) {
  return (
    <header className="h-12 bg-card border-b border-border flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground font-mono">main</span>
        </div>
        <div className="h-4 w-px bg-border" />
        <Badge variant="outline" className="bg-success/10 text-success border-success/30 text-xs">
          <Activity className="h-3 w-3 mr-1" />
          Brain Active
        </Badge>
        {activeWorkspace && (
          <>
            <div className="h-4 w-px bg-border" />
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs">
              <Crosshair className="h-3 w-3 mr-1" />
              Active: {activeWorkspace}
            </Badge>
          </>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Clock className="h-3.5 w-3.5" />
        <span className="font-mono">Last sync: Just now</span>
      </div>
    </header>
  );
}

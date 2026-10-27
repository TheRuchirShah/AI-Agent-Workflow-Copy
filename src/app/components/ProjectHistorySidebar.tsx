import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import {
  History,
  FolderOpen,
  Clock,
  CheckCircle2,
  MoreVertical,
  Download,
  Eye,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { toast } from "sonner";

interface ProjectVersion {
  id: string;
  name: string;
  version: string;
  status: "completed" | "in-progress" | "draft";
  createdAt: string;
  lastModified: string;
  phases: {
    completed: number;
    total: number;
  };
}

const mockProjects: ProjectVersion[] = [
  {
    id: "1",
    name: "E-commerce Redesign",
    version: "v2.1",
    status: "in-progress",
    createdAt: "2026-05-20",
    lastModified: "2026-05-27",
    phases: { completed: 3, total: 8 },
  },
  {
    id: "2",
    name: "E-commerce Redesign",
    version: "v2.0",
    status: "completed",
    createdAt: "2026-04-15",
    lastModified: "2026-05-10",
    phases: { completed: 8, total: 8 },
  },
  {
    id: "3",
    name: "Mobile Banking App",
    version: "v1.3",
    status: "completed",
    createdAt: "2026-03-10",
    lastModified: "2026-04-05",
    phases: { completed: 8, total: 8 },
  },
  {
    id: "4",
    name: "SaaS Dashboard",
    version: "v1.0",
    status: "draft",
    createdAt: "2026-05-25",
    lastModified: "2026-05-25",
    phases: { completed: 0, total: 8 },
  },
];

interface ProjectHistorySidebarProps {
  onViewAllProjects?: () => void;
  onOpenProject?: (project: ProjectVersion) => void;
}

export function ProjectHistorySidebar({ onViewAllProjects, onOpenProject }: ProjectHistorySidebarProps) {
  const [open, setOpen] = useState(false);

  const downloadBlueprint = (project: ProjectVersion) => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(project, null, 2)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${project.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-${project.version}-blueprint.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast.success(`Blueprint download started for ${project.name}`);
  };

  const statusConfig = {
    completed: {
      color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
      icon: CheckCircle2,
    },
    "in-progress": {
      color: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
      icon: Clock,
    },
    draft: {
      color: "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20",
      icon: FolderOpen,
    },
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <History className="h-4 w-4" />
          <span className="hidden sm:inline">Project History</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:w-[400px] p-0">
        <SheetHeader className="px-6 pt-6 pb-4">
          <SheetTitle>Project History & Versions</SheetTitle>
          <SheetDescription>
            View and manage all your design pipeline projects
          </SheetDescription>
        </SheetHeader>

        <Separator />

        <ScrollArea className="h-[calc(100vh-120px)]">
          <div className="px-6 py-4 space-y-4">
            {mockProjects.map((project) => {
              const config = statusConfig[project.status];
              const StatusIcon = config.icon;

              return (
                <div
                  key={project.id}
                  className="group border border-border rounded-lg p-4 hover:border-primary/50 hover:bg-muted/30 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate mb-1">{project.name}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-xs">
                          {project.version}
                        </Badge>
                        <Badge variant="outline" className={`text-xs ${config.color}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {project.status}
                        </Badge>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => {
                          onOpenProject?.(project);
                          if (onOpenProject) setOpen(false);
                        }}>
                          <Eye className="h-4 w-4 mr-2" />
                          Open Project
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => downloadBlueprint(project)}>
                          <Download className="h-4 w-4 mr-2" />
                          Download Blueprint
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span>Progress</span>
                      <span className="font-mono">
                        {project.phases.completed}/{project.phases.total} phases
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div
                        className="bg-primary h-1.5 rounded-full transition-all"
                        style={{
                          width: `${(project.phases.completed / project.phases.total) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span>Created: {project.createdAt}</span>
                      <span>Updated: {project.lastModified}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <div className="absolute bottom-0 left-0 right-0 border-t border-border bg-card p-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              if (onViewAllProjects) {
                onViewAllProjects();
                setOpen(false);
              }
            }}
          >
            <FolderOpen className="h-4 w-4 mr-2" />
            View All Projects
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

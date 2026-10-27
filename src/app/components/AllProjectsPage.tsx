import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ThemeToggle } from "./ThemeToggle";
import { ProjectHistorySidebar } from "./ProjectHistorySidebar";
import { SettingsDialog } from "./SettingsDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import {
  Search,
  FolderOpen,
  CheckCircle2,
  Clock,
  MoreVertical,
  Download,
  Eye,
  Trash2,
  Copy,
  Plus,
  Grid3x3,
  List,
  Filter,
  SortAsc,
  Workflow,
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { initialPipelineData } from "../data/pipelineData";

export interface Project {
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
  description?: string;
}

type SortOption = "lastModified" | "createdAt" | "name" | "progress";

const mockProjects: Project[] = [
  {
    id: "1",
    name: "E-commerce Redesign",
    version: "v2.1",
    status: "in-progress",
    createdAt: "2026-05-20",
    lastModified: "2026-05-27",
    phases: { completed: 3, total: 8 },
    description: "Complete overhaul of the e-commerce platform with modern UI/UX",
  },
  {
    id: "2",
    name: "E-commerce Redesign",
    version: "v2.0",
    status: "completed",
    createdAt: "2026-04-15",
    lastModified: "2026-05-10",
    phases: { completed: 8, total: 8 },
    description: "Complete overhaul of the e-commerce platform with modern UI/UX",
  },
  {
    id: "3",
    name: "Mobile Banking App",
    version: "v1.3",
    status: "completed",
    createdAt: "2026-03-10",
    lastModified: "2026-04-05",
    phases: { completed: 8, total: 8 },
    description: "Next-generation mobile banking experience with AI-powered insights",
  },
  {
    id: "4",
    name: "SaaS Dashboard",
    version: "v1.0",
    status: "draft",
    createdAt: "2026-05-25",
    lastModified: "2026-05-25",
    phases: { completed: 0, total: 8 },
    description: "Analytics dashboard for SaaS product metrics",
  },
  {
    id: "5",
    name: "Healthcare Portal",
    version: "v3.2",
    status: "in-progress",
    createdAt: "2026-05-15",
    lastModified: "2026-05-26",
    phases: { completed: 6, total: 8 },
    description: "Patient management and telemedicine platform",
  },
  {
    id: "6",
    name: "Education Platform",
    version: "v2.5",
    status: "completed",
    createdAt: "2026-02-20",
    lastModified: "2026-03-30",
    phases: { completed: 8, total: 8 },
    description: "Interactive learning platform with AI tutoring",
  },
  {
    id: "7",
    name: "Real Estate Marketplace",
    version: "v1.8",
    status: "in-progress",
    createdAt: "2026-04-01",
    lastModified: "2026-05-24",
    phases: { completed: 5, total: 8 },
    description: "Property listing and virtual tour platform",
  },
  {
    id: "8",
    name: "Fitness Tracker App",
    version: "v4.0",
    status: "draft",
    createdAt: "2026-05-22",
    lastModified: "2026-05-22",
    phases: { completed: 1, total: 8 },
    description: "AI-powered fitness and nutrition tracking",
  },
];

interface AllProjectsPageProps {
  onNewProject: () => void;
  onOpenProject: (project: Project) => void;
}

export function AllProjectsPage({ onNewProject, onOpenProject }: AllProjectsPageProps) {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "in-progress" | "draft">("all");
  const [sortOption, setSortOption] = useState<SortOption>("lastModified");
  const [projectPendingDelete, setProjectPendingDelete] = useState<Project | null>(null);
  const [deleteConfirmStep, setDeleteConfirmStep] = useState<"initial" | "final">("initial");

  const statusConfig = {
    completed: {
      color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
      icon: CheckCircle2,
      label: "Completed",
    },
    "in-progress": {
      color: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
      icon: Clock,
      label: "In Progress",
    },
    draft: {
      color: "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20",
      icon: FolderOpen,
      label: "Draft",
    },
  };

  const searchedProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProjects = searchedProjects
    .filter((project) => statusFilter === "all" || project.status === statusFilter)
    .sort((a, b) => {
      if (sortOption === "createdAt") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortOption === "name") return a.name.localeCompare(b.name);
      if (sortOption === "progress") {
        return b.phases.completed / b.phases.total - a.phases.completed / a.phases.total;
      }
      return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
    });

  const projectsByStatus = {
    all: searchedProjects.length,
    completed: searchedProjects.filter((project) => project.status === "completed").length,
    "in-progress": searchedProjects.filter((project) => project.status === "in-progress").length,
    draft: searchedProjects.filter((project) => project.status === "draft").length,
  };

  const sortLabels: Record<SortOption, string> = {
    lastModified: "Last Modified",
    createdAt: "Created Date",
    name: "Name (A-Z)",
    progress: "Progress",
  };

  const openProject = (project: Project) => {
    onOpenProject(project);
  };

  const duplicateProject = (project: Project) => {
    const copyNumber = projects.filter((item) => item.name.startsWith(`${project.name} Copy`)).length + 1;
    const today = new Date().toISOString().slice(0, 10);
    const duplicate: Project = {
      ...project,
      id: `${project.id}-copy-${Date.now()}`,
      name: `${project.name} Copy ${copyNumber}`,
      version: "v1.0",
      status: "draft",
      createdAt: today,
      lastModified: today,
    };
    setProjects((current) => [duplicate, ...current]);
    setStatusFilter("all");
    toast.success(`Duplicated ${project.name}`);
  };

  const downloadBlueprint = (project: Project) => {
    const blueprint = {
      ...project,
      progressPercentage: Math.round((project.phases.completed / project.phases.total) * 100),
      workflow: "Sequential Waterfall",
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(blueprint, null, 2)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${project.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-${project.version}-blueprint.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast.success(`Blueprint download started for ${project.name}`);
  };

  const deleteProject = (project: Project) => {
    setProjects((current) => current.filter((item) => item.id !== project.id));
    setProjectPendingDelete(null);
    setDeleteConfirmStep("initial");
    toast.success(`${project.name} project has been deleted from the platform.`);
  };

  const requestDeleteProject = (project: Project) => {
    setProjectPendingDelete(project);
    setDeleteConfirmStep("initial");
  };

  const getProjectStage = (project: Project) => {
    if (project.phases.completed >= project.phases.total) return "Workflow complete";
    if (project.status === "draft" && project.phases.completed === 0) return "Draft · Not started";

    const phaseIndex = project.status === "in-progress"
      ? Math.min(project.phases.completed, initialPipelineData.phases.length - 1)
      : Math.max(0, Math.min(project.phases.completed - 1, initialPipelineData.phases.length - 1));
    const phase = initialPipelineData.phases[phaseIndex];
    const stagePrefix = project.status === "draft" ? "Draft · " : `Phase ${phase.id} · `;

    return `${stagePrefix}${phase.name}`;
  };

  const renderProjectCard = (project: Project) => {
    const config = statusConfig[project.status];
    const StatusIcon = config.icon;
    const progressPercentage = (project.phases.completed / project.phases.total) * 100;

    return (
      <Card key={project.id} className="group hover:border-primary/50 hover:shadow-md transition-all">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="truncate mb-1">{project.name}</CardTitle>
              <CardDescription className="line-clamp-2">{project.description}</CardDescription>
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
                <DropdownMenuItem onSelect={() => openProject(project)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Open Project
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => duplicateProject(project)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => downloadBlueprint(project)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Blueprint
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive" onSelect={() => requestDeleteProject(project)}>
                  <Trash2 className="h-4 w-4 mr-2 text-destructive" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="font-mono text-xs">
                {project.version}
              </Badge>
              <Badge variant="outline" className={`text-xs ${config.color}`}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {config.label}
              </Badge>
            </div>

            <div className="rounded-md border border-border bg-muted/30 px-3 py-2">
              <div className="text-[11px] uppercase text-muted-foreground">Current stage</div>
              <div className="text-sm font-medium">{getProjectStage(project)}</div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                <span className="font-mono">
                  {project.phases.completed}/{project.phases.total} phases
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Created {project.createdAt}</span>
              <span>Updated {project.lastModified}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderListItem = (project: Project) => {
    const config = statusConfig[project.status];
    const StatusIcon = config.icon;
    const progressPercentage = (project.phases.completed / project.phases.total) * 100;

    return (
      <Card key={project.id} className="group hover:border-primary/50 transition-all">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center gap-3">
                <h3 className="font-medium truncate">{project.name}</h3>
                <Badge variant="outline" className="font-mono text-xs">
                  {project.version}
                </Badge>
                <Badge variant="outline" className={`text-xs ${config.color}`}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {config.label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
              <p className="text-xs text-muted-foreground">
                Current stage: <span className="font-medium text-foreground">{getProjectStage(project)}</span>
              </p>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <div className="w-48">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Progress</span>
                  <span className="font-mono">
                    {project.phases.completed}/{project.phases.total}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div
                    className="bg-primary h-1.5 rounded-full transition-all"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <div>Created {project.createdAt}</div>
                <div>Updated {project.lastModified}</div>
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
                <DropdownMenuItem onSelect={() => openProject(project)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Open Project
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => duplicateProject(project)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => downloadBlueprint(project)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Blueprint
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive" onSelect={() => requestDeleteProject(project)}>
                  <Trash2 className="h-4 w-4 mr-2 text-destructive" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 rounded-lg p-2 border border-primary/20">
                <Workflow className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="font-medium tracking-tight">AI Design Pipeline</h1>
                <p className="text-xs text-muted-foreground font-mono">
                  Sequential Waterfall • 19 Agents • 8 Phases
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <SettingsDialog />
              <ProjectHistorySidebar onOpenProject={onOpenProject} />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Sub-header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold tracking-tight mb-1">All Projects</h2>
              <p className="text-sm text-muted-foreground">
                Manage and view all your design pipeline projects
              </p>
            </div>
            <Button className="gap-2" onClick={onNewProject}>
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => setStatusFilter("all")}>
                  All Projects
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setStatusFilter("completed")}>
                  Completed
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setStatusFilter("in-progress")}>
                  In Progress
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setStatusFilter("draft")}>
                  Draft
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <SortAsc className="h-4 w-4" />
                  {sortLabels[sortOption]}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => setSortOption("lastModified")}>Last Modified</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setSortOption("createdAt")}>Created Date</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setSortOption("name")}>Name (A-Z)</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setSortOption("progress")}>Progress</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="flex items-center gap-1 border border-border rounded-md">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="icon"
                className="h-9 w-9"
                onClick={() => setViewMode("grid")}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="icon"
                className="h-9 w-9"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="container mx-auto px-6 py-6">
          <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)} className="space-y-6">
            <TabsList>
              <TabsTrigger value="all">
                All
                <Badge variant="secondary" className="ml-2">
                  {projectsByStatus.all}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="in-progress">
                In Progress
                <Badge variant="secondary" className="ml-2">
                  {projectsByStatus["in-progress"]}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed
                <Badge variant="secondary" className="ml-2">
                  {projectsByStatus.completed}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="draft">
                Draft
                <Badge variant="secondary" className="ml-2">
                  {projectsByStatus.draft}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value={statusFilter} className="m-0">
              {filteredProjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-1">No projects found</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {searchQuery ? "Try adjusting your search" : "Get started by creating a new project"}
                  </p>
                  {!searchQuery && (
                    <Button className="gap-2" onClick={onNewProject}>
                      <Plus className="h-4 w-4" />
                      Create New Project
                    </Button>
                  )}
                </div>
              ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProjects.map(renderProjectCard)}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredProjects.map(renderListItem)}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>

      <AlertDialog
        open={projectPendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) {
            setProjectPendingDelete(null);
            setDeleteConfirmStep("initial");
          }
        }}
      >
        <AlertDialogContent className="border-2 border-destructive/70">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteConfirmStep === "initial" ? "Delete this project?" : "Confirm project deletion"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {projectPendingDelete && (
                <>
                  {deleteConfirmStep === "initial"
                    ? "Are you sure you want to delete "
                    : "This is the final confirmation. Delete "}
                  <span className="font-medium text-foreground">{projectPendingDelete.name}</span>
                  {deleteConfirmStep === "initial"
                    ? "? This will remove it from the platform."
                    : " from the platform?"}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setProjectPendingDelete(null);
              setDeleteConfirmStep("initial");
            }}>
              No, keep project
            </AlertDialogCancel>
            {deleteConfirmStep === "initial" ? (
              <Button
                variant="destructive"
                onClick={() => setDeleteConfirmStep("final")}
              >
                Yes, delete project
              </Button>
            ) : (
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => {
                  if (projectPendingDelete) deleteProject(projectPendingDelete);
                }}
              >
                Yes, confirm deletion
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

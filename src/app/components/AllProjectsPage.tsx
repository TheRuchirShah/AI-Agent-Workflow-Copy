import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ThemeToggle } from "./ThemeToggle";
import { ProjectHistorySidebar } from "./ProjectHistorySidebar";
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
  Settings,
  Info,
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
import { AgentStatus } from "../types/pipeline";

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
  briefText?: string;
  discoverySummary?: string;
  attachmentName?: string;
  workflowMode?: "human" | "ai";
  runControl?: "running" | "paused" | "stopped" | "awaiting-approval";
  agentStatuses?: Record<string, AgentStatus>;
}

type SortOption = "lastModified" | "createdAt" | "name" | "progress";
const PROJECT_INFO_MAX_LENGTH = 56;

function getProjectSummary(project: Project) {
  const summary = project.description || project.briefText || "No project description provided.";
  return summary.length > PROJECT_INFO_MAX_LENGTH
    ? `${summary.slice(0, PROJECT_INFO_MAX_LENGTH - 1)}…`
    : summary;
}

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

const PROJECTS_STORAGE_KEY = "design-studio-projects";

export function loadProjects(): Project[] {
  try {
    const stored = localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (stored) {
      const parsed: unknown = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed as Project[];
    }
  } catch {
    // Fall back to the bundled sample projects when storage is unavailable.
  }
  return mockProjects;
}

export function saveProjectRecord(project: Project) {
  const projects = loadProjects();
  const existingIndex = projects.findIndex((item) => item.id === project.id);
  const nextProjects = [...projects];
  if (existingIndex === -1) nextProjects.unshift(project);
  else nextProjects[existingIndex] = project;
  try {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(nextProjects));
    window.dispatchEvent(new Event("design-studio-projects-updated"));
  } catch {
    // The current session still remains usable if local storage is full or disabled.
  }
}

function saveProjects(projects: Project[]) {
  try {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
  } catch {
    // Keep in-memory project changes even when persistence is unavailable.
  }
}

interface AllProjectsPageProps {
  onNewProject: () => void;
  onOpenProject: (project: Project) => void;
  onOpenSettings: () => void;
  onOpenAbout: () => void;
}

export function AllProjectsPage({ onNewProject, onOpenProject, onOpenSettings, onOpenAbout }: AllProjectsPageProps) {
  const [projects, setProjects] = useState<Project[]>(loadProjects);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "in-progress" | "draft">("all");
  const [sortOption, setSortOption] = useState<SortOption>("lastModified");
  const [projectPendingDelete, setProjectPendingDelete] = useState<Project | null>(null);
  const [deleteConfirmStep, setDeleteConfirmStep] = useState<"initial" | "final">("initial");

  useEffect(() => saveProjects(projects), [projects]);

  useEffect(() => {
    const refreshProjects = () => setProjects(loadProjects());
    window.addEventListener("design-studio-projects-updated", refreshProjects);
    return () => window.removeEventListener("design-studio-projects-updated", refreshProjects);
  }, []);

  const statusConfig = {
    completed: {
      color: "bg-secondary text-secondary-foreground border-border",
      icon: CheckCircle2,
      label: "Completed",
    },
    "in-progress": {
      color: "bg-secondary text-secondary-foreground border-border",
      icon: Clock,
      label: "In Progress",
    },
    draft: {
      color: "bg-secondary text-secondary-foreground border-border",
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
      phases: { completed: 0, total: project.phases.total },
      runControl: "paused",
      agentStatuses: undefined,
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
    if (project.runControl === "paused") return "Paused · Ready to resume";
    if (project.runControl === "stopped") return "Stopped · Ready to resume";
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
      <Card key={project.id} className="group gap-0 transition-all hover:border-primary/50 hover:bg-slate-100 hover:shadow-md">
        <CardHeader className="p-6 pb-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1 space-y-4">
              <CardTitle className="truncate text-lg font-bold">{project.name}</CardTitle>
              <CardDescription className="line-clamp-2 text-sm font-normal leading-relaxed">{getProjectSummary(project)}</CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100"
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
        <CardContent className="space-y-4 p-6 pt-0">
            <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="text-sm font-medium uppercase text-muted-foreground">Current stage</div>
                <Badge variant="outline" className={`shrink-0 text-xs ${config.color}`}>
                  <StatusIcon className="mr-1 h-3 w-3" />
                  {project.runControl === "paused" ? "Paused" : project.runControl === "stopped" ? "Stopped" : config.label}
                </Badge>
              </div>
              <div className="mt-2 font-semibold leading-snug">{getProjectStage(project)}</div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                <span>Progress</span>
                <span>{project.phases.completed}/{project.phases.total} Phases</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-muted">
                <div
                  className="h-2.5 rounded-full bg-primary transition-all"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span>Created {project.createdAt}</span>
              <span>Updated {project.lastModified}</span>
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
      <Card key={project.id} className="group gap-0 transition-all hover:border-primary/50 hover:bg-slate-100">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="min-w-0 flex-1 space-y-4">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <h3 className="truncate text-lg font-bold">{project.name}</h3>
                <Badge variant="outline" className="font-mono text-xs">
                  {project.version}
                </Badge>
                <Badge variant="outline" className={`text-xs ${config.color}`}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {config.label}
                </Badge>
              </div>
              <p className="line-clamp-2 text-sm font-normal text-muted-foreground">{getProjectSummary(project)}</p>
              <p className="text-xs text-muted-foreground">
                Current stage: <span className="font-medium text-foreground">{getProjectStage(project)}</span>
              </p>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <div className="w-48">
                <div className="mb-1 flex items-center justify-between text-xs font-semibold text-muted-foreground">
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
                  className="h-8 w-8 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100"
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
    <div className="flex h-dvh flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 w-full items-center gap-2 sm:w-auto sm:gap-3">
              <div className="rounded-lg p-2">
                <span className="material-symbols-rounded text-[24px] leading-none text-primary" aria-hidden="true">shapes</span>
              </div>
              <div className="min-w-0">
                <h1 className="font-medium tracking-tight">Design Studio</h1>
                <p className="text-xs text-muted-foreground font-mono">
                  From dreams to design
                </p>
              </div>
            </div>
            <div className="flex w-full shrink-0 items-center justify-end gap-1 sm:w-auto sm:gap-2">
              <Button variant="outline" size="sm" onClick={onOpenAbout} className="gap-2 px-2 sm:px-3" aria-label="About Design Studio" title="About">
                <Info className="h-4 w-4" />
                <span className="hidden sm:inline">About</span>
              </Button>
              <Button variant="outline" size="sm" onClick={onOpenSettings} className="gap-2 px-2 sm:px-3" aria-label="Settings" title="Settings">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Settings</span>
              </Button>
              <ProjectHistorySidebar onOpenProject={onOpenProject} />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Sub-header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-5 sm:px-6 sm:py-6">
          <div className="mb-5 flex flex-col gap-4 sm:mb-6 lg:mb-0 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
            <div className="min-w-0 shrink-0">
              <h2 className="font-semibold tracking-tight mb-1">All Projects</h2>
              <p className="text-sm text-muted-foreground">
                Manage and view all your design pipeline projects
              </p>
            </div>
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 sm:gap-3 lg:flex-nowrap lg:justify-end">
            <div className="relative w-full sm:w-64 sm:flex-none lg:w-[clamp(16rem,24vw,28rem)]">
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
                <Button variant="outline" className="flex-none gap-1.5 px-2 sm:gap-2 sm:px-3">
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
                <Button variant="outline" className="min-w-0 flex-none gap-1.5 px-2 sm:gap-2 sm:px-3">
                  <SortAsc className="h-4 w-4" />
                  <span className="hidden sm:inline">{sortLabels[sortOption]}</span>
                  <span className="sm:hidden">
                    {sortOption === "lastModified" ? "Modified" : sortOption === "createdAt" ? "Created" : sortOption === "name" ? "Name" : "Progress"}
                  </span>
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
            <Button className="w-full gap-2 sm:w-auto" onClick={onNewProject}>
              <Plus className="h-4 w-4" />
              New Project
            </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="min-h-0 flex-1">
        <div className="container mx-auto px-4 py-5 sm:px-6 sm:py-6">
          <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)} className="space-y-6">
            <div className="-mx-1 overflow-x-auto pb-1">
            <TabsList className="w-max max-w-none justify-start sm:w-fit">
              <TabsTrigger className="flex-none" value="all">
                All
                <Badge variant="secondary" className="ml-2">
                  {projectsByStatus.all}
                </Badge>
              </TabsTrigger>
              <TabsTrigger className="flex-none" value="in-progress">
                In Progress
                <Badge variant="secondary" className="ml-2">
                  {projectsByStatus["in-progress"]}
                </Badge>
              </TabsTrigger>
              <TabsTrigger className="flex-none" value="completed">
                Completed
                <Badge variant="secondary" className="ml-2">
                  {projectsByStatus.completed}
                </Badge>
              </TabsTrigger>
              <TabsTrigger className="flex-none" value="draft">
                Draft
                <Badge variant="secondary" className="ml-2">
                  {projectsByStatus.draft}
                </Badge>
              </TabsTrigger>
            </TabsList>
            </div>

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

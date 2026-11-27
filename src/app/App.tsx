import { useEffect, useState } from "react";
import { ThemeProvider } from "./components/ThemeProvider";
import { ThemeToggle } from "./components/ThemeToggle";
import { UploadBrief } from "./components/UploadBrief";
import { ApprovedDiscovery, DiscoveryInterview } from "./components/DiscoveryInterview";
import { PipelineView } from "./components/PipelineView";
import { MasterBlueprint } from "./components/MasterBlueprint";
import { AutomationModeDialog } from "./components/AutomationModeDialog";
import { PhaseProgressStepper } from "./components/PhaseProgressStepper";
import { ProjectHistorySidebar } from "./components/ProjectHistorySidebar";
import { SettingsPage } from "./components/SettingsPage";
import { AboutPage } from "./components/AboutPage";
import { AllProjectsPage, Project, saveProjectRecord } from "./components/AllProjectsPage";
import { initialPipelineData } from "./data/pipelineData";
import { AgentStatus, Phase } from "./types/pipeline";
import { ScrollArea } from "./components/ui/scroll-area";
import { Separator } from "./components/ui/separator";
import { ArrowLeft, Settings, Info, Pause, Play, Square, LoaderCircle, CheckCircle2 } from "lucide-react";
import { Button } from "./components/ui/button";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";

type WorkflowControl = "idle" | "running" | "pause-pending" | "paused" | "stop-pending" | "stopped" | "awaiting-approval" | "complete";

function createProjectPhases(project?: Project): Phase[] {
  return initialPipelineData.phases.map((phase, phaseIndex) => ({
    ...phase,
    agents: phase.agents.map((agent, agentIndex) => {
      const savedStatus = project?.agentStatuses?.[agent.id];
      if (savedStatus) return { ...agent, status: savedStatus };
      if (project?.status === "completed" || phaseIndex < (project?.phases.completed ?? 0)) {
        return { ...agent, status: "completed" as AgentStatus };
      }
      if (project && phaseIndex === Math.min(project.phases.completed, initialPipelineData.phases.length - 1)) {
        const firstPending = phase.agents.findIndex((item) => item.status !== "completed");
        if (agentIndex === Math.max(0, firstPending)) return { ...agent, status: "in-progress" as AgentStatus };
        if (firstPending > 0 && agentIndex < firstPending) return { ...agent, status: "completed" as AgentStatus };
        return { ...agent, status: "locked" as AgentStatus };
      }
      return { ...agent, status: "locked" as AgentStatus };
    }),
  }));
}

function getProjectProgress(phases: Phase[]) {
  return {
    completed: phases.filter((phase) => phase.agents.every((agent) => agent.status === "completed")).length,
    total: phases.length,
  };
}

function getAgentStatusMap(phases: Phase[]) {
  return Object.fromEntries(phases.flatMap((phase) => phase.agents.map((agent) => [agent.id, agent.status])));
}

function activateNextAgent(phases: Phase[]): Phase[] | null {
  let activated = false;
  const next = phases.map((phase) => ({
    ...phase,
    agents: phase.agents.map((agent) => {
      if (!activated && agent.status === "locked") {
        activated = true;
        return { ...agent, status: "in-progress" as AgentStatus };
      }
      return agent;
    }),
  }));
  return activated ? next : null;
}

export default function App() {
  const [submittedBrief, setSubmittedBrief] = useState<{
    projectName: string;
    shortInfo: string;
    briefText: string;
    file: File | null;
  } | null>(null);
  const [currentView, setCurrentView] = useState<"projects" | "pipeline" | "settings" | "about">("projects");
  const [settingsReturnView, setSettingsReturnView] = useState<"projects" | "pipeline">("projects");
  const [aboutReturnView, setAboutReturnView] = useState<"projects" | "pipeline">("projects");
  const [showModeDialog, setShowModeDialog] = useState(false);
  const [automationMode, setAutomationMode] = useState<"human" | "ai" | null>(null);
  const [pipelineStarted, setPipelineStarted] = useState(false);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [pipelinePhases, setPipelinePhases] = useState<Phase[]>(() => createProjectPhases());
  const [workflowControl, setWorkflowControl] = useState<WorkflowControl>("idle");
  const [discoveryOpen, setDiscoveryOpen] = useState(false);
  const [approvedDiscovery, setApprovedDiscovery] = useState<ApprovedDiscovery | null>(null);

  const persistWorkflow = (phases: Phase[], status: Project["status"], runControl: Project["runControl"]) => {
    if (!activeProject) return;
    const updated: Project = {
      ...activeProject,
      status,
      runControl,
      phases: getProjectProgress(phases),
      agentStatuses: getAgentStatusMap(phases),
      lastModified: new Date().toISOString().slice(0, 10),
    };
    setActiveProject(updated);
    saveProjectRecord(updated);
  };

  const handleBriefSubmit = (data: {
    file: File | null;
    projectName: string;
    shortInfo: string;
    briefText: string;
  }) => {
    console.log("Brief submitted:", data);
    setSubmittedBrief(data);
    setApprovedDiscovery(null);
    setPipelineStarted(false);
    setAutomationMode(null);
    setShowModeDialog(true);
  };

  const handleModeSelect = (mode: "human" | "ai") => {
    setAutomationMode(mode);
    setShowModeDialog(false);
    setDiscoveryOpen(true);
    console.log("Selected mode:", mode);
  };

  const handleDiscoveryApprove = (discovery: ApprovedDiscovery) => {
    setApprovedDiscovery(discovery);
    setDiscoveryOpen(false);
    const phases = createProjectPhases();
    const today = new Date().toISOString().slice(0, 10);
    const project: Project = {
      id: `project-${Date.now()}`,
      name: submittedBrief?.projectName ?? "Untitled Project",
      version: "v1.0",
      status: "in-progress",
      createdAt: today,
      lastModified: today,
      phases: getProjectProgress(phases),
      description: submittedBrief?.shortInfo,
      briefText: submittedBrief?.briefText,
      discoverySummary: discovery.summary,
      attachmentName: submittedBrief?.file?.name,
      workflowMode: automationMode ?? "human",
      runControl: "running",
      agentStatuses: getAgentStatusMap(phases),
    };
    setActiveProject(project);
    saveProjectRecord(project);
    setPipelinePhases(phases);
    setWorkflowControl("running");
    setPipelineStarted(true);
  };

  const handleNewProject = () => {
    setActiveProject(null);
    setSubmittedBrief(null);
    setApprovedDiscovery(null);
    setDiscoveryOpen(false);
    setCurrentView("pipeline");
    setPipelineStarted(false);
    setAutomationMode(null);
    setPipelinePhases(createProjectPhases());
    setWorkflowControl("idle");
  };

  const handleOpenProject = (project: Project) => {
    setActiveProject(project);
    setSubmittedBrief(null);
    setApprovedDiscovery(null);
    setDiscoveryOpen(false);
    setPipelineStarted(true);
    setAutomationMode(project.workflowMode ?? (project.status === "completed" ? "ai" : "human"));
    setApprovedDiscovery(project.discoverySummary ? { summary: project.discoverySummary, answers: {}, assumptions: [] } : null);
    const phases = createProjectPhases(project);
    setPipelinePhases(phases);
    setWorkflowControl(
      project.status === "completed"
        ? "complete"
        : project.runControl === "stopped"
          ? "stopped"
          : project.runControl === "paused" || project.status === "draft"
            ? "paused"
            : project.runControl === "awaiting-approval"
              ? "awaiting-approval"
            : "running",
    );
    setCurrentView("pipeline");
  };

  const finishProject = (phases: Phase[]) => {
    setPipelinePhases(phases);
    setWorkflowControl("complete");
    persistWorkflow(phases, "completed", undefined);
    toast.success("All sub-agents have completed this project.");
  };

  useEffect(() => {
    if (!pipelineStarted || !["running", "pause-pending", "stop-pending"].includes(workflowControl)) return;

    const timer = window.setTimeout(() => {
      const activeIndex = pipelinePhases.findIndex((phase) => phase.agents.some((agent) => agent.status === "in-progress"));
      if (activeIndex < 0) {
        const next = activateNextAgent(pipelinePhases);
        if (next) setPipelinePhases(next);
        else finishProject(pipelinePhases);
        return;
      }

      const phasesAfterCompletion = pipelinePhases.map((phase) => ({
        ...phase,
        agents: phase.agents.map((agent) => agent.status === "in-progress"
          ? { ...agent, status: "completed" as AgentStatus }
          : agent),
      }));

      if (workflowControl === "pause-pending") {
        setPipelinePhases(phasesAfterCompletion);
        setWorkflowControl("paused");
        persistWorkflow(phasesAfterCompletion, "draft", "paused");
        toast.success("Current sub-agent finished. Project saved as a draft.");
        return;
      }

      if (workflowControl === "stop-pending") {
        setPipelinePhases(phasesAfterCompletion);
        setWorkflowControl("stopped");
        persistWorkflow(phasesAfterCompletion, "draft", "stopped");
        toast.success("Current sub-agent finished. Project stopped and saved.");
        return;
      }

      if (automationMode === "human") {
        setPipelinePhases(phasesAfterCompletion);
        setWorkflowControl("awaiting-approval");
        persistWorkflow(phasesAfterCompletion, "in-progress", "awaiting-approval");
        return;
      }

      const nextPhases = activateNextAgent(phasesAfterCompletion);
      if (nextPhases) {
        setPipelinePhases(nextPhases);
        persistWorkflow(nextPhases, "in-progress", "running");
      } else {
        finishProject(phasesAfterCompletion);
      }
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [pipelineStarted, pipelinePhases, workflowControl, automationMode]);

  const requestWorkflowControl = (action: "pause" | "stop") => {
    const hasActiveTask = pipelinePhases.some((phase) => phase.agents.some((agent) => agent.status === "in-progress"));
    if (hasActiveTask && ["running", "pause-pending", "stop-pending"].includes(workflowControl)) {
      const pendingState = action === "pause" ? "pause-pending" : "stop-pending";
      setWorkflowControl(pendingState);
      toast.message(`${action === "pause" ? "Pause" : "Stop"} requested`, {
        description: "The current sub-agent will finish before the request takes effect.",
      });
      return;
    }

    const nextState = action === "pause" ? "paused" : "stopped";
    setWorkflowControl(nextState);
    persistWorkflow(pipelinePhases, "draft", nextState);
    toast.success(action === "pause" ? "Project saved as a draft." : "Project stopped and saved.");
  };

  const resumeWorkflow = () => {
    const hasActiveAgent = pipelinePhases.some((phase) => phase.agents.some((agent) => agent.status === "in-progress"));
    const nextPhases = hasActiveAgent ? pipelinePhases : activateNextAgent(pipelinePhases);
    if (!nextPhases) {
      finishProject(pipelinePhases);
      return;
    }
    setPipelinePhases(nextPhases);
    setWorkflowControl("running");
    persistWorkflow(nextPhases, "in-progress", "running");
    toast.success("Project resumed from the next pending sub-agent.");
  };

  const continueAfterApproval = () => {
    const nextPhases = activateNextAgent(pipelinePhases);
    if (!nextPhases) {
      finishProject(pipelinePhases);
      return;
    }
    setPipelinePhases(nextPhases);
    setWorkflowControl("running");
    persistWorkflow(nextPhases, "in-progress", "running");
  };

  const currentSubAgent = pipelinePhases.flatMap((phase) =>
    phase.agents.map((agent) => ({ agent, phase })),
  ).find(({ agent }) => agent.status === "in-progress");

  const handleBackToProjects = () => {
    setCurrentView("projects");
  };

  const handleOpenSettings = () => {
    if (currentView !== "settings") {
      setSettingsReturnView(currentView);
    }
    setCurrentView("settings");
  };

  const handleOpenAbout = () => {
    setAboutReturnView(currentView === "pipeline" ? "pipeline" : "projects");
    setCurrentView("about");
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      {currentView === "about" ? (
        <AboutPage
          onBack={() => setCurrentView(aboutReturnView)}
          backLabel={aboutReturnView === "projects" ? "Back to Projects" : "Back to Project"}
        />
      ) : currentView === "settings" ? (
        <SettingsPage
          onBack={() => setCurrentView(settingsReturnView)}
          backLabel={settingsReturnView === "projects" ? "Back to Projects" : "Back to Pipeline"}
        />
      ) : currentView === "projects" ? (
        <AllProjectsPage
          onNewProject={handleNewProject}
          onOpenProject={handleOpenProject}
          onOpenSettings={handleOpenSettings}
          onOpenAbout={handleOpenAbout}
        />
      ) : (
        <div className="flex h-dvh flex-col bg-background">
          {/* Header */}
          <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
            <div className="container mx-auto px-3 py-3 sm:px-4 sm:py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 w-full flex-1 items-center gap-2 sm:w-auto sm:gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleBackToProjects}
                    className="mr-0 shrink-0 sm:mr-2"
                    aria-label="Back to projects"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div className="rounded-lg p-2">
                    <span className="material-symbols-rounded text-[24px] leading-none text-primary" aria-hidden="true">shapes</span>
                  </div>
                  <div className="min-w-0">
                    <h1 className="truncate font-medium tracking-tight">
                      {activeProject?.name ?? submittedBrief?.projectName ?? "Design Studio"}
                    </h1>
                    <p className="truncate text-xs text-muted-foreground font-mono">
                      {activeProject
                        ? `${activeProject.version} • ${activeProject.phases.completed}/${activeProject.phases.total} phases • ${activeProject.status}`
                        : submittedBrief?.shortInfo ?? "Sequential Waterfall • 19 Agents • 8 Phases"}
                    </p>
                  </div>
                </div>
                <div className="flex w-full shrink-0 items-center justify-end gap-1 sm:w-auto sm:gap-2">
                  <Button variant="outline" size="sm" onClick={handleOpenAbout} className="gap-2 px-2 sm:px-3" aria-label="About Design Studio" title="About">
                    <Info className="h-4 w-4" />
                    <span className="hidden sm:inline">About</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleOpenSettings} className="gap-2 px-2 sm:px-3" aria-label="Settings" title="Settings">
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">Settings</span>
                  </Button>
                  <ProjectHistorySidebar
                    onViewAllProjects={handleBackToProjects}
                    onOpenProject={handleOpenProject}
                  />
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <ScrollArea className="min-h-0 flex-1">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
              <div className="space-y-8">
                {/* Upload Section */}
                <UploadBrief
                  onSubmit={handleBriefSubmit}
                  executionMode={automationMode}
                  readOnlyProject={activeProject ? {
                    projectName: activeProject.name,
                    shortInfo: activeProject.description,
                    briefText: activeProject.briefText,
                    attachmentName: activeProject.attachmentName,
                    executionMode: activeProject.workflowMode,
                    status: activeProject.status,
                    phases: activeProject.phases,
                  } : undefined}
                />

                {pipelineStarted && activeProject && (
                  <section className="space-y-4 rounded-lg border border-border bg-card p-4 sm:p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="font-semibold">Workflow controls</h2>
                          <span className="rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground">
                            {workflowControl === "running" ? "In progress" :
                              workflowControl === "pause-pending" ? "Pause queued" :
                              workflowControl === "paused" ? "Draft · Paused" :
                              workflowControl === "stop-pending" ? "Stop queued" :
                              workflowControl === "stopped" ? "Draft · Stopped" :
                              workflowControl === "awaiting-approval" ? "Awaiting approval" :
                              workflowControl === "complete" ? "Completed" : "Ready"}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {currentSubAgent
                            ? `Current sub-agent: ${currentSubAgent.agent.id} ${currentSubAgent.agent.name}`
                            : workflowControl === "awaiting-approval"
                              ? "The current sub-agent is finished. Approve to start the next pending sub-agent."
                              : workflowControl === "paused"
                                ? "Saved as a draft. Resume to continue from the next pending sub-agent."
                                : workflowControl === "stopped"
                                  ? "Stopped at this checkpoint. Resume to continue from the next pending sub-agent."
                                  : workflowControl === "complete"
                                    ? "All sub-agents in this workflow are complete."
                                    : "Preparing the next sub-agent…"}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2 sm:justify-end">
                        {workflowControl === "running" && (
                          <>
                            <Button variant="outline" className="border-warning/40 bg-warning/20 text-orange-900 hover:bg-warning/30 hover:text-orange-900 focus-visible:border-warning focus-visible:ring-warning/30" onClick={() => requestWorkflowControl("pause")}>
                              <Pause className="mr-2 h-4 w-4" /> Pause
                            </Button>
                            <Button variant="destructive" onClick={() => requestWorkflowControl("stop")}>
                              <Square className="mr-2 h-4 w-4" /> Stop
                            </Button>
                          </>
                        )}
                        {workflowControl === "awaiting-approval" && (
                          <>
                            <Button onClick={continueAfterApproval}>
                              <CheckCircle2 className="mr-2 h-4 w-4" /> Approve & Start Next
                            </Button>
                            <Button variant="outline" className="border-warning/40 bg-warning/20 text-orange-900 hover:bg-warning/30 hover:text-orange-900 focus-visible:border-warning focus-visible:ring-warning/30" onClick={() => requestWorkflowControl("pause")}>
                              <Pause className="mr-2 h-4 w-4" /> Pause
                            </Button>
                            <Button variant="destructive" onClick={() => requestWorkflowControl("stop")}>
                              <Square className="mr-2 h-4 w-4" /> Stop
                            </Button>
                          </>
                        )}
                        {(workflowControl === "paused" || workflowControl === "stopped") && (
                          <Button className="border border-success/40 bg-success/20 text-green-800 hover:bg-success/30 hover:text-green-800 focus-visible:border-success focus-visible:ring-success/30" onClick={resumeWorkflow}>
                            <Play className="mr-2 h-4 w-4" /> Resume
                          </Button>
                        )}
                        {(workflowControl === "pause-pending" || workflowControl === "stop-pending") && (
                          <Button variant="outline" disabled>
                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                            {workflowControl === "pause-pending" ? "Pausing after this sub-agent…" : "Stopping after this sub-agent…"}
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="border-t border-border pt-3 text-xs text-muted-foreground">
                      Local workflow preview: each sub-agent takes about 5 seconds. No live AI model is connected yet.
                    </p>
                  </section>
                )}

                {discoveryOpen && submittedBrief && automationMode && (
                  <DiscoveryInterview
                    key={`${submittedBrief.projectName}-${automationMode}`}
                    brief={submittedBrief}
                    mode={automationMode}
                    onApprove={handleDiscoveryApprove}
                  />
                )}

                {approvedDiscovery && (
                  <section
                    aria-label="Approved discovery summary"
                    className="space-y-3 rounded-lg border border-primary/30 bg-primary/5 p-4 sm:p-6"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h2 className="font-semibold">Phase 1 Discovery approved</h2>
                      <span className="text-sm text-muted-foreground">
                        {Object.values(approvedDiscovery.answers).filter((answer) => answer.trim()).length} interview topics answered
                      </span>
                    </div>
                    <details className="text-sm">
                      <summary className="cursor-pointer font-medium">View the approved context</summary>
                      <pre className="mt-3 whitespace-pre-wrap font-sans text-sm text-muted-foreground">{approvedDiscovery.summary}</pre>
                      {approvedDiscovery.assumptions.length > 0 && (
                        <div className="mt-3">
                          <p className="font-medium text-foreground">Assumptions to validate</p>
                          <ul className="mt-1 list-disc space-y-1 pl-5 text-muted-foreground">
                            {approvedDiscovery.assumptions.map((assumption) => <li key={assumption}>{assumption}</li>)}
                          </ul>
                        </div>
                      )}
                    </details>
                  </section>
                )}

                {/* Progress Stepper */}
                {pipelineStarted && (
                  <>
                    <PhaseProgressStepper
                      phases={pipelinePhases}
                      currentPhaseId={currentSubAgent?.phase.id ?? 1}
                    />

                    {/* Connecting Line */}
                    <div className="flex items-center justify-center">
                      <div className="h-16 w-px bg-gradient-to-b from-primary/50 via-primary to-primary/50" />
                    </div>
                  </>
                )}

                {/* Pipeline Phases */}
                {pipelineStarted && (
                  <PipelineView
                    phases={pipelinePhases}
                    automationMode={automationMode ?? "human"}
                    discoveryContext={approvedDiscovery?.summary}
                  />
                )}

                {/* Final Separator */}
                {pipelineStarted && <Separator className="my-8" />}

                {/* Master Blueprint */}
                {pipelineStarted && (
                  <MasterBlueprint
                    compiled={initialPipelineData.masterBlueprint?.compiled ?? false}
                    agentDocs={initialPipelineData.masterBlueprint?.agentDocs ?? 19}
                    phaseSummaries={initialPipelineData.masterBlueprint?.phaseSummaries ?? 8}
                  />
                )}
              </div>
            </div>
          </ScrollArea>

          {/* Automation Mode Dialog */}
          <AutomationModeDialog
            open={showModeDialog}
            onSelect={handleModeSelect}
            onClose={() => setShowModeDialog(false)}
          />
        </div>
      )}

      {/* Toast Notifications */}
      <Toaster />
    </ThemeProvider>
  );
}

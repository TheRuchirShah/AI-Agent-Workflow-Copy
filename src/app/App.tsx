import { useState } from "react";
import { ThemeProvider } from "./components/ThemeProvider";
import { ThemeToggle } from "./components/ThemeToggle";
import { UploadBrief } from "./components/UploadBrief";
import { PipelineView } from "./components/PipelineView";
import { MasterBlueprint } from "./components/MasterBlueprint";
import { AutomationModeDialog } from "./components/AutomationModeDialog";
import { PhaseProgressStepper } from "./components/PhaseProgressStepper";
import { ProjectHistorySidebar } from "./components/ProjectHistorySidebar";
import { SettingsDialog } from "./components/SettingsDialog";
import { AllProjectsPage, Project } from "./components/AllProjectsPage";
import { initialPipelineData } from "./data/pipelineData";
import { ScrollArea } from "./components/ui/scroll-area";
import { Separator } from "./components/ui/separator";
import { Workflow, ArrowLeft } from "lucide-react";
import { Button } from "./components/ui/button";
import { Toaster } from "./components/ui/sonner";

export default function App() {
  const [submittedBrief, setSubmittedBrief] = useState<{
    projectName: string;
    shortInfo: string;
    briefText: string;
    file: File | null;
  } | null>(null);
  const [currentView, setCurrentView] = useState<"projects" | "pipeline">("projects");
  const [showModeDialog, setShowModeDialog] = useState(false);
  const [automationMode, setAutomationMode] = useState<"human" | "ai" | null>(null);
  const [pipelineStarted, setPipelineStarted] = useState(false);
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  const handleBriefSubmit = (data: {
    file: File | null;
    projectName: string;
    shortInfo: string;
    briefText: string;
  }) => {
    console.log("Brief submitted:", data);
    setSubmittedBrief(data);
    setShowModeDialog(true);
  };

  const handleModeSelect = (mode: "human" | "ai") => {
    setAutomationMode(mode);
    setShowModeDialog(false);
    setPipelineStarted(true);
    console.log("Selected mode:", mode);
  };

  const handleNewProject = () => {
    setActiveProject(null);
    setSubmittedBrief(null);
    setCurrentView("pipeline");
    setPipelineStarted(false);
    setAutomationMode(null);
  };

  const handleOpenProject = (project: Project) => {
    setActiveProject(project);
    setPipelineStarted(true);
    setAutomationMode(project.status === "completed" ? "ai" : "human");
    setCurrentView("pipeline");
  };

  const handleBackToProjects = () => {
    setCurrentView("projects");
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      {currentView === "projects" ? (
        <AllProjectsPage
          onNewProject={handleNewProject}
          onOpenProject={handleOpenProject}
        />
      ) : (
        <div className="h-screen flex flex-col bg-background">
          {/* Header */}
          <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleBackToProjects}
                    className="mr-2"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div className="bg-primary/10 rounded-lg p-2 border border-primary/20">
                    <Workflow className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h1 className="font-medium tracking-tight">
                      {activeProject?.name ?? submittedBrief?.projectName ?? "AI Workflow"}
                    </h1>
                    <p className="text-xs text-muted-foreground font-mono">
                      {activeProject
                        ? `${activeProject.version} • ${activeProject.phases.completed}/${activeProject.phases.total} phases • ${activeProject.status}`
                        : submittedBrief?.shortInfo ?? "Sequential Waterfall • 19 Agents • 8 Phases"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <SettingsDialog />
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
          <ScrollArea className="flex-1">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
              <div className="space-y-8">
                {/* Upload Section */}
                <UploadBrief onSubmit={handleBriefSubmit} />

                {submittedBrief && (
                  <section
                    aria-label="Submitted project brief"
                    className="rounded-lg border border-border bg-card p-4 sm:p-6 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h2 className="font-semibold">Project brief received</h2>
                      <span className="text-sm text-muted-foreground">
                        Mode: {automationMode === "ai" ? "AI autonomous" : automationMode === "human" ? "Human interaction" : "Choose mode"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{submittedBrief.shortInfo}</p>
                    <details className="text-sm">
                      <summary className="cursor-pointer font-medium">Review the details provided</summary>
                      <p className="mt-2 whitespace-pre-wrap text-muted-foreground">{submittedBrief.briefText}</p>
                      {submittedBrief.file && (
                        <p className="mt-2 text-muted-foreground">Attached: {submittedBrief.file.name}</p>
                      )}
                    </details>
                  </section>
                )}

                {/* Progress Stepper */}
                {pipelineStarted && (
                  <>
                    <PhaseProgressStepper
                      phases={initialPipelineData.phases}
                      currentPhaseId={1}
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
                    phases={initialPipelineData.phases}
                    automationMode={automationMode ?? "human"}
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

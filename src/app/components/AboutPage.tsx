import { ArrowLeft, Compass, FileText, Layers3, Sparkles, Target } from "lucide-react";
import { Button } from "./ui/button";
import { initialPipelineData } from "../data/pipelineData";

interface AboutPageProps {
  onBack: () => void;
  backLabel: string;
}

const principles = [
  {
    icon: Compass,
    title: "Start with the real problem",
    description: "Bring the brief, the people you serve, and the outcome you want into focus before jumping to solutions.",
  },
  {
    icon: Layers3,
    title: "Make complexity manageable",
    description: "Explore an ambitious product workflow through eight clear phases and nineteen named sub-agents.",
  },
  {
    icon: Target,
    title: "Keep the work connected",
    description: "Keep a project brief, discovery context, workflow status, and illustrative agent content together in the prototype.",
  },
  {
    icon: FileText,
    title: "Make progress visible",
    description: "Review project details and simulated phase progress in a browser-based project workspace.",
  },
];

const steps = [
  {
    number: "01",
    title: "Set the direction",
    description: "Name your project, explain the idea, and share the brief or supporting files that give the work its starting point.",
  },
  {
    number: "02",
    title: "Choose how to collaborate",
    description: "Choose Human Interaction for discovery questions and approval checkpoints, or AI Autonomous to skip the interview and advance the simulation automatically.",
  },
  {
    number: "03",
    title: "Build a shared understanding",
    description: "Answer six fixed discovery questions in Human Interaction mode, or review a locally assembled summary and unverified assumptions in AI Autonomous mode.",
  },
  {
    number: "04",
    title: "Move from insight to delivery",
    description: "Explore the eight-phase, nineteen-agent workflow and review sample content bundled with the app; progress is simulated in the browser.",
  },
];

const phaseNames = initialPipelineData.phases.map((phase) => phase.name);
const subPhaseCount = initialPipelineData.phases.reduce((total, phase) => total + phase.agents.length, 0);

export function AboutPage({ onBack, backLabel }: AboutPageProps) {
  return (
    <div className="flex h-dvh flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-sm">
        <div className="container mx-auto flex flex-col items-start px-4 py-3 sm:py-4">
          <div className="min-w-0">
            <h1 className="font-semibold tracking-tight">About Design Studio</h1>
            <p className="text-sm text-muted-foreground">From dreams to design</p>
          </div>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-10 sm:py-16">
          <Button variant="ghost" onClick={onBack} className="-ml-2 mb-6 h-7 w-fit justify-start gap-1 px-2 text-sm font-normal text-muted-foreground hover:text-foreground" aria-label={backLabel}>
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Button>
          <section className="border-b border-border pb-10 sm:pb-14">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <p className="mb-3 text-sm font-medium text-primary">A browser-based product design workflow prototype</p>
            <h2 className="max-w-3xl text-3xl font-semibold leading-tight sm:text-4xl">
              Great products don’t begin with more noise. They begin with a better process.
            </h2>
            <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
              Design Studio is a front-end prototype for organizing early product ideas into a structured design workflow. It brings a project brief, discovery context, simulated progress, and illustrative agent content into one browser-based interface. It does not generate research, designs, or other deliverables through AI.
            </p>
          </section>

          <section className="grid grid-cols-2 border-b border-border py-7 sm:grid-cols-3 sm:py-9">
            <div className="border-r border-border pr-4 sm:pr-8">
              <p className="text-3xl font-semibold">{initialPipelineData.phases.length}</p>
              <p className="mt-1 text-sm text-muted-foreground">Workflow phases</p>
            </div>
            <div className="pl-4 sm:px-8">
              <p className="text-3xl font-semibold">{subPhaseCount}</p>
              <p className="mt-1 text-sm text-muted-foreground">Named sub-agents</p>
            </div>
            <div className="col-span-2 mt-5 border-t border-border pt-5 sm:col-span-1 sm:mt-0 sm:border-l sm:border-t-0 sm:pl-8 sm:pt-0">
              <p className="text-3xl font-semibold">Local</p>
              <p className="mt-1 text-sm text-muted-foreground">Browser project storage</p>
            </div>
          </section>

          <section className="border-b border-border py-7 sm:py-9" aria-labelledby="prototype-status-heading">
            <h3 id="prototype-status-heading" className="font-medium">Prototype status</h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              No AI model, backend API, database, authentication, or external integration is connected. Human Interaction and AI Autonomous change the local interface flow only. Project records stay in this browser’s local storage; selecting a file keeps its name but does not upload or parse its contents.
            </p>
          </section>

          <section className="grid gap-10 border-b border-border py-10 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] sm:gap-16 sm:py-14">
            <div>
              <p className="text-sm font-medium text-primary">Why Design Studio</p>
              <h3 className="mt-2 text-2xl font-semibold">Less friction. More forward motion.</h3>
            </div>
            <div className="space-y-4 text-sm leading-6 text-muted-foreground sm:text-base">
              <p>
                Product work can get stuck between a promising idea and a clear next step. Briefs live in one place, decisions in another, and important assumptions are easy to lose along the way.
              </p>
              <p>
                Design Studio demonstrates a structured sequence for that work. Project records are stored in this browser, and the workflow content and status changes are illustrative prototype behavior rather than live agent execution.
              </p>
            </div>
          </section>

          <section className="border-t border-border py-10 sm:py-14">
            <div className="mb-8 max-w-2xl">
              <p className="text-sm font-medium text-primary">How it works</p>
              <h3 className="mt-2 text-2xl font-semibold">A guided prototype, from first brief through simulated handoff.</h3>
            </div>
            <ol className="divide-y divide-border border-y border-border">
              {steps.map((step) => (
                <li key={step.number} className="grid gap-2 py-5 sm:grid-cols-[4rem_minmax(0,0.75fr)_minmax(0,1.25fr)] sm:gap-6">
                  <span className="font-mono text-sm text-primary">{step.number}</span>
                  <h4 className="font-medium">{step.title}</h4>
                  <p className="text-sm leading-6 text-muted-foreground">{step.description}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="border-t border-border py-10 sm:py-14">
            <div className="mb-7">
              <p className="text-sm font-medium text-primary">The 8-phase framework</p>
              <h3 className="mt-2 text-2xl font-semibold">Every stage has a purpose.</h3>
            </div>
            <ol className="grid gap-x-10 gap-y-0 sm:grid-cols-2">
              {phaseNames.map((name, index) => (
                <li key={name} className="flex items-start gap-4 border-t border-border py-4">
                  <span className="w-7 shrink-0 font-mono text-sm text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
                  <span className="text-sm font-medium">{name}</span>
                </li>
              ))}
            </ol>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Across these phases, 19 named sub-agents organize the sample workflow from gathering and strategy through research, design, testing, handoff, and quality assurance. Their logic and deliverable descriptions are bundled examples, not live generated outputs.
            </p>
          </section>

          <section className="py-10 sm:py-14">
            <div className="mb-7 max-w-2xl">
              <p className="text-sm font-medium text-primary">Built around the work</p>
              <h3 className="mt-2 text-2xl font-semibold">A strong idea deserves a thoughtful path.</h3>
            </div>
            <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
              {principles.map(({ icon: Icon, title, description }) => (
                <article key={title} className="flex gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-card">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">{title}</h4>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <footer className="border-t border-border py-7 text-sm text-muted-foreground">
            Design Studio. From dreams to design.
          </footer>
        </div>
      </main>
    </div>
  );
}

import { Phase } from "../types/pipeline";
import { AgentCard } from "./AgentCard";
import { PhaseGateway } from "./PhaseGateway";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { ArrowDown } from "lucide-react";

interface PipelineViewProps {
  phases: Phase[];
  automationMode?: "human" | "ai";
  discoveryContext?: string;
}

export function PipelineView({ phases, automationMode = "human", discoveryContext }: PipelineViewProps) {
  return (
    <div className="space-y-8">
      {phases.map((phase, phaseIdx) => (
        <div key={phase.id}>
          {/* Phase Container */}
          <div className="relative">
            {/* Connecting Line (except for first phase) */}
            {phaseIdx > 0 && (
              <div className="absolute left-1/2 -top-8 h-8 w-px bg-gradient-to-b from-primary/50 to-transparent -translate-x-1/2" />
            )}

            <Card className="border-2 border-muted bg-muted/10">
              <CardHeader className="bg-muted/30 border-b border-border">
                <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
                    <Badge variant="secondary" className="font-mono text-sm px-3 py-1">
                      PHASE {phase.id}
                    </Badge>
                    <CardTitle className="break-words text-base sm:text-xl">{phase.name}</CardTitle>
                  </div>
                  <Badge variant="outline" className="font-mono">
                    {phase.agents.length} Agents
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                {phase.id === 1 && discoveryContext && (
                  <details className="mb-6 border-b border-border pb-4">
                    <summary className="cursor-pointer text-sm font-medium">
                      Approved discovery context for Phase 1
                    </summary>
                    <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap break-words rounded-md bg-muted/30 p-4 font-sans text-sm text-muted-foreground">
                      {discoveryContext}
                    </pre>
                  </details>
                )}
                <div className="space-y-4">
                  {phase.agents.map((agent, agentIdx) => (
                    <div key={agent.id} className="relative">
                      {/* Agent to Agent Connection */}
                      {agentIdx > 0 && (
                        <div className="flex items-center justify-center py-3">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <div className="h-px w-16 bg-border" />
                            <ArrowDown className="h-4 w-4" />
                            <div className="h-px w-16 bg-border" />
                          </div>
                        </div>
                      )}

                      <AgentCard agent={agent} automationMode={automationMode} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Phase Gateway */}
          {phaseIdx < phases.length - 1 && (
            <PhaseGateway
              phaseId={phase.id}
              phaseName={phase.name}
              agentCount={phase.agents.length}
              compiled={phase.summary?.compiled ?? false}
              timing={phase.timing}
            />
          )}
        </div>
      ))}
    </div>
  );
}

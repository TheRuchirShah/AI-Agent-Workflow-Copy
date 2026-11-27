import { Phase } from "../types/pipeline";
import { Card, CardContent } from "./ui/card";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";

interface PhaseProgressStepperProps {
  phases: Phase[];
  currentPhaseId: number;
}

export function PhaseProgressStepper({ phases, currentPhaseId }: PhaseProgressStepperProps) {
  const completedPhases = phases.filter((p) =>
    p.agents.every((a) => a.status === "completed")
  ).length;

  const totalPhases = phases.length;
  const progressPercentage = (completedPhases / totalPhases) * 100;

  const getPhaseStatus = (phaseId: number) => {
    const phase = phases.find((p) => p.id === phaseId);
    if (!phase) return "locked";

    const allCompleted = phase.agents.every((a) => a.status === "completed");
    const anyInProgress = phase.agents.some((a) => a.status === "in-progress");

    if (allCompleted) return "completed";
    if (anyInProgress) return "in-progress";
    return "locked";
  };

  return (
    <Card className="border border-border bg-card/50">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Progress Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium mb-1">Pipeline Progress</h3>
              <p className="text-sm text-muted-foreground">
                Phase {completedPhases} of {totalPhases} completed
              </p>
            </div>
            <Badge variant="secondary" className="font-mono">
              {Math.round(progressPercentage)}%
            </Badge>
          </div>

          {/* Progress Bar */}
          <Progress value={progressPercentage} className="h-2" />

          {/* Phase Stepper */}
          <div className="relative pt-4">
            <div className="flex items-start justify-between">
              {phases.map((phase, idx) => {
                const status = getPhaseStatus(phase.id);
                const isLast = idx === phases.length - 1;

                return (
                  <div key={phase.id} className="flex-1 relative">
                    <div className="flex flex-col items-center">
                      {/* Step Circle */}
                      <div className="relative z-10">
                        {status === "completed" ? (
                          <div className="bg-secondary rounded-full p-1.5">
                            <CheckCircle2 className="h-5 w-5 text-secondary-foreground" />
                          </div>
                        ) : status === "in-progress" ? (
                          <div className="bg-primary rounded-full p-1.5 animate-pulse">
                            <Clock className="h-5 w-5 text-primary-foreground" />
                          </div>
                        ) : (
                          <div className="bg-muted border-2 border-border rounded-full p-1.5">
                            <Circle className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Step Label */}
                      <div className="mt-2 text-center">
                        <div className="font-mono text-xs text-muted-foreground mb-0.5">
                          Phase {phase.id}
                        </div>
                        <div className="text-xs font-medium max-w-[100px] truncate" title={phase.name}>
                          {phase.name.split(" ")[0]}
                        </div>
                      </div>
                    </div>

                    {/* Connecting Line */}
                    {!isLast && (
                      <div
                        className={`absolute top-[14px] left-1/2 w-full h-0.5 -z-0 ${
                          status === "completed"
                            ? "bg-secondary"
                            : "bg-border"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

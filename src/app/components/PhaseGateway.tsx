import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Download, ArrowDown, FileStack, CheckCircle2, Clock, Calendar } from "lucide-react";
import { Badge } from "./ui/badge";

interface PhaseGatewayProps {
  phaseId: number;
  phaseName: string;
  agentCount: number;
  compiled: boolean;
  timing?: {
    startedAt?: string;
    completedAt?: string;
    duration?: string;
  };
}

function formatTimestamp(isoString: string) {
  const date = new Date(isoString);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function PhaseGateway({ phaseId, phaseName, agentCount, compiled, timing }: PhaseGatewayProps) {
  return (
    <div className="relative py-8">
      {/* Connecting Line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-border via-primary/50 to-border -translate-x-1/2" />

      <div className="relative z-10 max-w-3xl mx-auto">
        <Card className="border-2 border-primary/30 bg-gradient-to-br from-card to-muted/30 shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="mb-2 flex flex-wrap items-center justify-center gap-2">
              <div className="flex items-center justify-center gap-1 sm:gap-2">
                <div className="h-1 w-4 rounded-full bg-primary/30 sm:w-12" />
                <Badge variant="secondary" className="font-mono">
                  PHASE {phaseId} GATEWAY
                </Badge>
                <div className="h-1 w-4 rounded-full bg-primary/30 sm:w-12" />
              </div>
              {timing?.duration && (
                <Badge variant="outline" className="gap-1 font-mono text-xs">
                  <Clock className="h-3 w-3" />
                  {timing.duration}
                </Badge>
              )}
            </div>
            <CardTitle className="break-words text-base sm:text-xl">{phaseName}</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex items-center justify-center gap-8 text-sm flex-wrap">
              <div className="flex items-center gap-2">
                <FileStack className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Agent Logs:</span>
                <span className="font-mono font-medium">{agentCount}</span>
              </div>
              {compiled && (
                <div className="flex items-center gap-1.5 text-primary">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="font-medium">Compiled</span>
                </div>
              )}
            </div>

            {/* Timestamp Information */}
            {timing && (timing.startedAt || timing.completedAt) && (
              <div className="border-t border-border pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {timing.startedAt && (
                    <div className="flex items-start gap-2 bg-muted/30 rounded p-2">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <div className="text-muted-foreground mb-0.5">Started</div>
                        <div className="font-mono">{formatTimestamp(timing.startedAt)}</div>
                      </div>
                    </div>
                  )}
                  {timing.completedAt && (
                    <div className="flex items-start gap-2 bg-muted/30 rounded p-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <div className="text-muted-foreground mb-0.5">Completed</div>
                        <div className="font-mono">{formatTimestamp(timing.completedAt)}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="bg-muted/50 rounded-lg border border-border p-4">
              <div className="flex items-start gap-3">
                <Download className="h-8 w-8 text-primary shrink-0 mt-1" />
                <div className="flex-1">
                  <div className="font-medium mb-1">Phase Master Logic Document</div>
                  <div className="text-sm text-muted-foreground mb-3">
                    Aggregated documentation from all {agentCount} agents in this phase
                  </div>
                  <Button size="sm" variant="outline" className="font-mono">
                    <Download className="h-3.5 w-3.5 mr-2" />
                    Download Phase_{phaseId}_Summary.md
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <ArrowDown className="h-5 w-5 text-muted-foreground animate-bounce" />
              <span className="text-sm text-muted-foreground font-medium">
                Unlocking Phase {phaseId + 1}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

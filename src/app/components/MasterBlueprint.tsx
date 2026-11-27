import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Trophy, Download, FileCode2, Layers, CheckCircle2 } from "lucide-react";
import { Badge } from "./ui/badge";

interface MasterBlueprintProps {
  compiled: boolean;
  agentDocs: number;
  phaseSummaries: number;
}

export function MasterBlueprint({ compiled, agentDocs, phaseSummaries }: MasterBlueprintProps) {
  return (
    <div className="relative py-12">
      {/* Terminal Indicator */}
      <div className="absolute left-1/2 top-0 h-16 w-px bg-gradient-to-b from-border to-transparent -translate-x-1/2" />

      <div className="relative z-10 max-w-4xl mx-auto">
        <Card className="border-2 border-primary shadow-2xl bg-gradient-to-br from-card via-card to-primary/5">
          <CardHeader className="text-center pb-6 space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                <div className="relative bg-primary/10 rounded-full p-6 border-2 border-primary/50">
                  <Trophy className="h-12 w-12 text-primary" />
                </div>
              </div>
            </div>

            <div>
              <Badge variant="secondary" className="mb-3 font-mono tracking-wider">
                FINAL TERMINAL
              </Badge>
              <CardTitle className="mb-2 text-2xl sm:text-3xl">Master Project Blueprint</CardTitle>
              <CardDescription className="text-base">
                Comprehensive knowledge graph compiling all agent logic and phase summaries
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-muted/30 rounded-lg border border-border p-4">
                <div className="flex items-start gap-3">
                  <FileCode2 className="h-6 w-6 text-primary shrink-0" />
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Agent Logic Documents</div>
                    <div className="text-2xl font-mono font-medium">{agentDocs}</div>
                  </div>
                </div>
              </div>

              <div className="bg-muted/30 rounded-lg border border-border p-4">
                <div className="flex items-start gap-3">
                  <Layers className="h-6 w-6 text-primary shrink-0" />
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Phase Summaries</div>
                    <div className="text-2xl font-mono font-medium">{phaseSummaries}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border-2 border-primary/30 p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-primary/20 rounded p-2 shrink-0">
                  <FileCode2 className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium mb-1">Master Blueprint Package</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Interconnected machine-readable knowledge graph designed for human clients and external AI systems.
                    Includes full traceability from initial brief through final deliverables.
                  </p>
                  {compiled && (
                    <div className="flex items-center gap-2 text-sm text-primary mb-4">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="font-medium">Compilation Complete</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button variant="default" size="lg" className="w-full font-mono">
                  <Download className="h-4 w-4 mr-2" />
                  Download Master_Blueprint.json
                </Button>
                <Button variant="outline" size="lg" className="w-full font-mono">
                  <Download className="h-4 w-4 mr-2" />
                  Download Master_Blueprint.md
                </Button>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-xs text-muted-foreground">
                <div>
                  <div className="font-mono font-medium text-foreground mb-1">8</div>
                  <div>Phases</div>
                </div>
                <div>
                  <div className="font-mono font-medium text-foreground mb-1">19</div>
                  <div>AI Agents</div>
                </div>
                <div>
                  <div className="font-mono font-medium text-foreground mb-1">100%</div>
                  <div>Documented</div>
                </div>
                <div>
                  <div className="font-mono font-medium text-foreground mb-1">Sequential</div>
                  <div>Waterfall</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

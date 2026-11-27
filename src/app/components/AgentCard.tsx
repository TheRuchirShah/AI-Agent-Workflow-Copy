import { useState } from "react";
import { Agent } from "../types/pipeline";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { CheckCircle2, Clock, Lock, FileCode2, FileText, ChevronRight, Upload, X, Timer } from "lucide-react";
import { Separator } from "./ui/separator";

function formatTimestamp(isoString: string) {
  const date = new Date(isoString);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

interface AgentCardProps {
  agent: Agent;
  onApprove?: (feedback: { text: string; files: File[] }) => void;
  automationMode?: "human" | "ai";
}

export function AgentCard({ agent, onApprove, automationMode = "human" }: AgentCardProps) {
  const [feedbackText, setFeedbackText] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedFiles((prev) => [...prev, ...files]);
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleApprove = () => {
    onApprove?.({ text: feedbackText, files: uploadedFiles });
    setFeedbackText("");
    setUploadedFiles([]);
    setShowFeedback(false);
  };

  const statusConfig = {
    locked: {
      icon: Lock,
      color: "bg-muted",
      textColor: "text-muted-foreground",
      borderColor: "border-border"
    },
    "in-progress": {
      icon: Clock,
      color: "bg-primary",
      textColor: "text-primary",
      borderColor: "border-primary/40"
    },
    completed: {
      icon: CheckCircle2,
      color: "bg-secondary",
      textColor: "text-secondary-foreground",
      borderColor: "border-border"
    }
  };

  const config = statusConfig[agent.status];
  const StatusIcon = config.icon;

  return (
    <Card className={`border ${config.borderColor} transition-all hover:shadow-lg`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge variant="outline" className="font-mono shrink-0">
                {agent.id}
              </Badge>
              <div className={`flex items-center gap-1.5 ${config.textColor}`}>
                <StatusIcon className="h-4 w-4" />
                <span className="font-mono uppercase tracking-wider" style={{ fontSize: "0.6875rem" }}>
                  {agent.status}
                </span>
              </div>
              {agent.timing?.duration && (
                <Badge variant="secondary" className="font-mono text-xs gap-1">
                  <Timer className="h-3 w-3" />
                  {agent.timing.duration}
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg leading-tight mb-2">{agent.name}</CardTitle>
            {agent.timing && (agent.timing.startedAt || agent.timing.completedAt) && (
              <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono flex-wrap">
                {agent.timing.completedAt && (
                  <span>✓ {formatTimestamp(agent.timing.completedAt)}</span>
                )}
                {agent.timing.startedAt && !agent.timing.completedAt && (
                  <span>⏳ Started {formatTimestamp(agent.timing.startedAt)}</span>
                )}
              </div>
            )}
          </div>
          <div className={`h-2 w-2 rounded-full ${config.color} shrink-0 mt-1.5`} />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Deliverable Section */}
        <div className="rounded-md border border-border bg-muted/30 p-3">
          <div className="flex items-start gap-3">
            <FileCode2 className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="font-mono mb-1" style={{ fontSize: "0.6875rem", letterSpacing: "0.05em" }}>
                DELIVERABLE
              </div>
              <div className="font-medium mb-1">{agent.deliverable.type}</div>
              {agent.deliverable.preview && (
                <div className="text-sm text-muted-foreground font-mono">
                  {agent.deliverable.preview}
                </div>
              )}
              {agent.deliverable.url && (
                <Button variant="link" className="h-auto p-0 text-xs mt-1">
                  View Output →
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Logic Document Panel */}
        <div className="rounded-md border border-border bg-card">
          <div className="bg-muted/50 px-3 py-2 border-b border-border">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="font-mono tracking-wide" style={{ fontSize: "0.6875rem", letterSpacing: "0.05em" }}>
                AGENT LOGIC BLUEPRINT
              </span>
            </div>
          </div>

          <div className="p-3">
            <Accordion type="single" collapsible defaultValue="problem">
              <AccordionItem value="problem" className="border-b-0">
                <AccordionTrigger className="py-2 text-sm hover:no-underline">
                  Problem Statement
                </AccordionTrigger>
                <AccordionContent>
                  <div className="bg-muted/30 rounded p-3 font-mono text-xs leading-relaxed border-l-2 border-primary/50">
                    {agent.logicDoc.problemStatement}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="scenarios" className="border-b-0">
                <AccordionTrigger className="py-2 text-sm hover:no-underline">
                  Scenarios
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2">
                    {agent.logicDoc.scenarios.map((scenario, idx) => (
                      <li key={idx} className="flex gap-2 text-sm">
                        <ChevronRight className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
                        <span>{scenario}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="decisions" className="border-b-0">
                <AccordionTrigger className="py-2 text-sm hover:no-underline">
                  Design Decisions & Justifications
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    {agent.logicDoc.designDecisions.map((decision, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="font-medium text-sm">{decision.decision}</div>
                        <div className="text-sm text-muted-foreground pl-4 border-l-2 border-muted">
                          <span className="font-mono text-xs">WHY:</span> {decision.justification}
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="strategy" className="border-b-0">
                <AccordionTrigger className="py-2 text-sm hover:no-underline">
                  Execution Strategy
                </AccordionTrigger>
                <AccordionContent>
                  <div className="bg-muted/30 rounded p-3 font-mono text-xs leading-relaxed">
                    {agent.logicDoc.executionStrategy}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="alternatives" className="border-b-0">
                <AccordionTrigger className="py-2 text-sm hover:no-underline">
                  Alternative Scenarios
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2">
                    {agent.logicDoc.alternativeScenarios.map((alt, idx) => (
                      <li key={idx} className="flex gap-2 text-sm text-muted-foreground">
                        <span className="shrink-0">•</span>
                        <span>{alt}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        {/* Human Approval Gate */}
        {agent.status === "completed" && automationMode === "human" && (
          <>
            <Separator />

            {!showFeedback ? (
              <Button
                onClick={() => setShowFeedback(true)}
                className="w-full"
                variant="default"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Approve & Pass to Next Agent
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor={`feedback-${agent.id}`}>Feedback & Instructions (Optional)</Label>
                  <Textarea
                    id={`feedback-${agent.id}`}
                    placeholder="Provide feedback or additional instructions for the next agent..."
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    className="min-h-[80px] resize-none text-sm"
                  />
                </div>

                {/* File Upload */}
                <div className="space-y-2">
                  <Label>Attach Reference Files (Optional)</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-3 text-center hover:border-primary/50 transition-colors">
                    <Button variant="ghost" size="sm" asChild>
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          multiple
                          className="hidden"
                          onChange={handleFileUpload}
                        />
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Files
                      </label>
                    </Button>
                  </div>

                  {/* Uploaded Files List */}
                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2 mt-2">
                      {uploadedFiles.map((file, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 bg-muted/50 rounded p-2 text-sm"
                        >
                          <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="flex-1 truncate">{file.name}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleRemoveFile(idx)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowFeedback(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleApprove}
                    className="flex-1"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Approve & Continue
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

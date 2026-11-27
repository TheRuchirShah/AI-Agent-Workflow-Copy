import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, CircleHelp, Sparkles } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

export interface DiscoveryBrief {
  projectName: string;
  shortInfo: string;
  briefText: string;
}

export interface ApprovedDiscovery {
  summary: string;
  answers: Record<string, string>;
  assumptions: string[];
}

interface DiscoveryInterviewProps {
  brief: DiscoveryBrief;
  mode: "human" | "ai";
  onApprove: (discovery: ApprovedDiscovery) => void;
}

const questions = [
  { key: "users", topic: "Target users", question: "Who is the primary user you want this product or workflow to serve?" },
  { key: "problem", topic: "Core problem", question: "What specific problem or frustrating task should it solve for them?" },
  { key: "currentApproach", topic: "Current approach", question: "How do those users handle this today, and what is not working well?" },
  { key: "outcome", topic: "Desired outcome", question: "What should users be able to do, or experience, after this is built?" },
  { key: "success", topic: "Success measures", question: "What observable result would tell you this project succeeded?" },
  { key: "constraints", topic: "Constraints and risks", question: "What constraints, dependencies, or risks should shape the solution?" },
];

export function DiscoveryInterview({ brief, mode, onApprove }: DiscoveryInterviewProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [skipped, setSkipped] = useState<string[]>([]);
  const [step, setStep] = useState(0);
  const [reviewing, setReviewing] = useState(mode === "ai");
  const [summary, setSummary] = useState("");

  const assumptions = useMemo(
    () => questions.filter(({ key }) => skipped.includes(key)).map(({ topic }) => `${topic}: not confirmed; validate before finalizing strategy.`),
    [skipped],
  );

  const buildSummary = (skippedKeys = skipped) => {
    const lines = [
      `Project: ${brief.projectName}`,
      `Objective: ${brief.shortInfo}`,
      `Additional brief: ${brief.briefText}`,
      "",
      "Discovery responses:",
      ...questions.map(({ key, topic }) => `${topic}: ${answers[key]?.trim() || (skippedKeys.includes(key) ? "Not confirmed; treat as an assumption." : "Not answered yet.")}`),
    ];
    return lines.join("\n");
  };

  const reviewSummary = () => {
    setSummary(buildSummary());
    setReviewing(true);
  };

  const approve = () => {
    onApprove({ summary: summary || buildSummary(), answers, assumptions });
  };

  const question = questions[step];
  const answeredCount = Object.values(answers).filter((answer) => answer.trim()).length;

  if (reviewing) {
    const autonomousAssumptions = mode === "ai"
      ? questions
          .filter(({ key }) => !answers[key]?.trim())
          .map(({ topic }) => `${topic}: not verified by an AI model; review this assumption.`)
      : assumptions;

    return (
      <Card className="border border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">PHASE 1 DISCOVERY</Badge>
            <Badge variant="outline">Review</Badge>
          </div>
          <CardTitle>Discovery Summary</CardTitle>
          <CardDescription>
            Review and edit the context that Phase 1 will use. This prototype assembles the summary locally; no AI model is connected yet.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="discovery-summary">Project discovery</Label>
            <Textarea
              id="discovery-summary"
              value={summary || buildSummary()}
              onChange={(event) => setSummary(event.target.value)}
              className="min-h-[280px] resize-y font-sans text-sm"
            />
          </div>

          {autonomousAssumptions.length > 0 && (
            <div className="space-y-2 rounded-md border border-border bg-muted/30 p-4">
              <h3 className="text-sm font-semibold">Unverified assumptions</h3>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {autonomousAssumptions.map((assumption) => <li key={assumption}>{assumption}</li>)}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap justify-between gap-2">
            {mode === "human" ? (
              <Button variant="outline" onClick={() => setReviewing(false)}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to interview
              </Button>
            ) : <span />}
            <Button onClick={approve}>
              <CheckCircle2 className="mr-2 h-4 w-4" /> Approve Discovery & Start Phase 1
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-border">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge variant="secondary">PHASE 1 DISCOVERY</Badge>
          <span className="text-sm text-muted-foreground">Question {step + 1} of {questions.length}</span>
        </div>
        <CardTitle>Discovery Interview</CardTitle>
        <CardDescription>
          Clarify the project before its strategy is drafted. Answer in your own words, or skip a topic and keep it visible as an assumption.
        </CardDescription>
        <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
          <CircleHelp className="h-4 w-4 shrink-0" />
          Guided question flow prototype. Adaptive AI follow-ups will be available after a model is connected.
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-1.5" aria-label={`Question ${step + 1} of ${questions.length}`}>
          {questions.map((item, index) => (
            <span
              key={item.key}
              className={`h-1.5 flex-1 rounded-full ${index <= step ? "bg-primary" : "bg-muted"}`}
            />
          ))}
        </div>
        <div className="space-y-2">
          <Label htmlFor="discovery-answer">{question.topic}</Label>
          <p className="font-medium">{question.question}</p>
          <Textarea
            id="discovery-answer"
            value={answers[question.key] ?? ""}
            onChange={(event) => setAnswers((current) => ({ ...current, [question.key]: event.target.value }))}
            placeholder="Type your answer..."
            className="min-h-[120px] resize-y"
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button variant="outline" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                const nextSkipped = skipped.includes(question.key) ? skipped : [...skipped, question.key];
                setSkipped(nextSkipped);
                if (step === questions.length - 1) {
                  setSummary(buildSummary(nextSkipped));
                  setReviewing(true);
                } else {
                  setStep((current) => current + 1);
                }
              }}
            >
              Skip as assumption
            </Button>
            {step < questions.length - 1 ? (
              <Button
                onClick={() => {
                  setSkipped((current) => current.filter((key) => key !== question.key));
                  setStep((current) => current + 1);
                }}
                disabled={!answers[question.key]?.trim()}
              >
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={reviewSummary} disabled={!answers[question.key]?.trim()}>
                <Sparkles className="mr-2 h-4 w-4" /> Review Summary
              </Button>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">{answeredCount} of {questions.length} topics answered</p>
      </CardContent>
    </Card>
  );
}

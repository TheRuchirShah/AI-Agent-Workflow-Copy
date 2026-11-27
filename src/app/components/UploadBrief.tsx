import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Upload, FileText, CheckCircle2, X, Send, Eye } from "lucide-react";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

const SHORT_INFO_MAX_LENGTH = 56;

interface UploadBriefProps {
  executionMode?: "human" | "ai" | null;
  readOnlyProject?: {
    projectName: string;
    shortInfo?: string;
    briefText?: string;
    attachmentName?: string;
    executionMode?: "human" | "ai" | null;
    status?: string;
    phases?: { completed: number; total: number };
  };
  onSubmit?: (data: {
    file: File | null;
    projectName: string;
    shortInfo: string;
    briefText: string;
  }) => void;
}

export function UploadBrief({ onSubmit, executionMode = null, readOnlyProject }: UploadBriefProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [projectName, setProjectName] = useState("");
  const [shortInfo, setShortInfo] = useState("");
  const [briefText, setBriefText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showSubmittedBrief, setShowSubmittedBrief] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemove = () => {
    setUploadedFile(null);
  };

  const handleSubmit = () => {
    const isProjectNameMissing = !projectName.trim();
    const isShortInfoMissing = !shortInfo.trim();
    const isBriefTooShort = briefText.trim().length < 500;

    setShowValidationErrors(true);
    if (isProjectNameMissing || isShortInfoMissing || isBriefTooShort) {
      return;
    }

    onSubmit?.({ file: uploadedFile, projectName: projectName.trim(), shortInfo: shortInfo.trim(), briefText: briefText.trim() });
    setIsSubmitted(true);
  };

  const trimmedBriefLength = briefText.trim().length;
  const projectNameError = showValidationErrors && !projectName.trim();
  const shortInfoError = showValidationErrors && !shortInfo.trim();
  const briefTextError = showValidationErrors && trimmedBriefLength < 500;
  const isReadOnly = isSubmitted || !!readOnlyProject;
  const displayedProjectName = readOnlyProject?.projectName ?? projectName;
  const displayedShortInfo = (readOnlyProject?.shortInfo ?? shortInfo).slice(0, SHORT_INFO_MAX_LENGTH);
  const displayedBriefText = readOnlyProject?.briefText ?? briefText;
  const displayedAttachmentName = readOnlyProject?.attachmentName ?? uploadedFile?.name;
  const displayedExecutionMode = readOnlyProject ? readOnlyProject.executionMode : executionMode;

  if (isReadOnly) {
    return (
      <>
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowSubmittedBrief(true)}
          className="h-auto min-h-16 w-full justify-between gap-4 border-primary/30 bg-primary/10 px-4 py-3 text-left hover:bg-primary/15"
          aria-label="View submitted Client Brief Upload data"
        >
          <span className="min-w-0">
            <span className="block font-medium">Client Brief Upload</span>
            <span className="block truncate text-sm font-normal text-muted-foreground">
              View saved project details{displayedExecutionMode ? ` · ${displayedExecutionMode === "ai" ? "AI Autonomous" : "Human Interaction"}` : ""}
            </span>
          </span>
          <Eye className="h-4 w-4 shrink-0" />
        </Button>

        <Dialog open={showSubmittedBrief} onOpenChange={setShowSubmittedBrief}>
          <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{readOnlyProject ? "Project details" : "Submitted project brief"}</DialogTitle>
              <DialogDescription>
                Read-only information saved for this project.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5">
              <div className="space-y-1">
                <Label>Project Name</Label>
                <p className="text-sm text-muted-foreground">{displayedProjectName}</p>
              </div>
              <div className="space-y-1">
                <Label>Short Project Info</Label>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                  {displayedShortInfo || "No short project description is available."}
                </p>
              </div>
              {displayedBriefText ? (
                <div className="space-y-1">
                  <Label>Additional Brief Details</Label>
                  <p className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded-md border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
                    {displayedBriefText}
                  </p>
                </div>
              ) : readOnlyProject ? (
                <div className="space-y-1">
                  <Label>Additional Brief Details</Label>
                  <p className="text-sm text-muted-foreground">Not available for this existing project.</p>
                </div>
              ) : null}
              {displayedAttachmentName && (
                <div className="space-y-1">
                  <Label>Attached Document</Label>
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" /> {displayedAttachmentName}
                  </p>
                </div>
              )}
              {readOnlyProject?.status && (
                <div className="space-y-1">
                  <Label>Project Status</Label>
                  <p className="text-sm capitalize text-muted-foreground">{readOnlyProject.status.replace("-", " ")}</p>
                </div>
              )}
              {readOnlyProject?.phases && (
                <div className="space-y-1">
                  <Label>Phase Progress</Label>
                  <p className="text-sm text-muted-foreground">
                    {readOnlyProject.phases.completed} of {readOnlyProject.phases.total} phases complete
                  </p>
                </div>
              )}
              {displayedExecutionMode && (
                <div className="space-y-1">
                  <Label>Pipeline Execution Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    {displayedExecutionMode === "ai" ? "AI Autonomous" : "Human Interaction"}
                  </p>
                </div>
              )}
              {readOnlyProject && !readOnlyProject.executionMode && (
                <div className="space-y-1">
                  <Label>Pipeline Execution Mode</Label>
                  <p className="text-sm text-muted-foreground">Not recorded for this existing project.</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <Card className="border-2 border-dashed border-primary/30 bg-gradient-to-br from-card to-muted/20">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="font-mono">INPUT & GENESIS</Badge>
        </div>
        <CardTitle>Client Brief Upload</CardTitle>
        <CardDescription>
          Upload the initial client brief to kickstart the entire sequential pipeline
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">Project Name</Label>
            <Input
              id="project-name"
              placeholder="e.g. Customer onboarding workflow"
              value={projectName}
              onChange={(event) => setProjectName(event.target.value)}
              aria-invalid={projectNameError}
              aria-describedby={projectNameError ? "project-name-error" : undefined}
            />
            {projectNameError && (
              <p id="project-name-error" role="alert" className="text-sm text-destructive">
                Enter a project name to continue.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-short-info">Short Project Info</Label>
            <Textarea
              id="project-short-info"
              placeholder="In a sentence or two, what should this project accomplish?"
              value={shortInfo}
              maxLength={SHORT_INFO_MAX_LENGTH}
              onChange={(event) => setShortInfo(event.target.value.slice(0, SHORT_INFO_MAX_LENGTH))}
              aria-invalid={shortInfoError}
              aria-describedby={shortInfoError ? "project-short-info-error" : undefined}
              className="min-h-[72px] resize-y text-sm"
            />
            <p className="text-right text-xs text-muted-foreground" aria-live="polite">
              {shortInfo.length}/{SHORT_INFO_MAX_LENGTH}
            </p>
            {shortInfoError && (
              <p id="project-short-info-error" role="alert" className="text-sm text-destructive">
                Add a short project summary to continue.
              </p>
            )}
          </div>
        </div>

        {/* Text Input Area */}
        <div className="space-y-2">
          <Label htmlFor="brief-text">Additional Brief Details</Label>
          <Textarea
            id="brief-text"
            placeholder="Provide additional context, requirements, constraints, or specific instructions for the AI agents..."
            value={briefText}
            onChange={(e) => {
              setBriefText(e.target.value);
            }}
            aria-invalid={briefTextError}
            aria-describedby={briefTextError ? "brief-character-count brief-validation-error" : "brief-character-count"}
            className="min-h-[120px] resize-none font-mono text-sm"
          />
          <p id="brief-character-count" className="text-xs text-muted-foreground">
            {trimmedBriefLength}/500 characters minimum
          </p>
        </div>

        {/* File Upload Area */}
        {!uploadedFile ? (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-muted/30"
            }`}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="bg-muted/50 rounded-full p-4">
                <Upload className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <div className="font-medium mb-1">Drop your brief here or click to browse</div>
                <div className="text-sm text-muted-foreground">
                  Supports PDF, DOCX, TXT, MD (max 10MB)
                </div>
              </div>
              <Button variant="outline" asChild>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.docx,.txt,.md"
                    onChange={handleFileChange}
                  />
                  Select File
                </label>
              </Button>
            </div>
          </div>
        ) : (
          <div className="border border-border rounded-lg p-4 bg-muted/30">
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 rounded p-2 shrink-0">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium truncate">{uploadedFile.name}</span>
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                </div>
                <div className="text-sm text-muted-foreground">
                  {(uploadedFile.size / 1024).toFixed(2)} KB
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRemove}
                className="shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          className="w-full"
          size="lg"
        >
          <Send className="h-4 w-4 mr-2" />
          Submit Brief & Start Pipeline
        </Button>
        {briefTextError && (
          <p id="brief-validation-error" role="alert" className="text-sm text-destructive">
            Come on, you must have something interesting to describe your great idea.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

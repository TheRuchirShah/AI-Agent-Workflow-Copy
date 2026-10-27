import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Upload, FileText, CheckCircle2, X, Send } from "lucide-react";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";

interface UploadBriefProps {
  onSubmit?: (data: {
    file: File | null;
    projectName: string;
    shortInfo: string;
    briefText: string;
  }) => void;
}

export function UploadBrief({ onSubmit }: UploadBriefProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [projectName, setProjectName] = useState("");
  const [shortInfo, setShortInfo] = useState("");
  const [briefText, setBriefText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [showValidationErrors, setShowValidationErrors] = useState(false);

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
  };

  const trimmedBriefLength = briefText.trim().length;
  const projectNameError = showValidationErrors && !projectName.trim();
  const shortInfoError = showValidationErrors && !shortInfo.trim();
  const briefTextError = showValidationErrors && trimmedBriefLength < 500;

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
              onChange={(event) => setShortInfo(event.target.value)}
              aria-invalid={shortInfoError}
              aria-describedby={shortInfoError ? "project-short-info-error" : undefined}
              className="min-h-[72px] resize-y text-sm"
            />
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
              <div className="bg-emerald-500/10 rounded p-2 shrink-0">
                <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium truncate">{uploadedFile.name}</span>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
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

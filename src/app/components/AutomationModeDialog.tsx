import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Bot, UserCircle } from "lucide-react";
import { Button } from "./ui/button";
import { X } from "lucide-react";

interface AutomationModeDialogProps {
  open: boolean;
  onSelect: (mode: "human" | "ai") => void;
  onClose: () => void;
}

export function AutomationModeDialog({ open, onSelect, onClose }: AutomationModeDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="pr-8 text-lg">Choose Pipeline Execution Mode</AlertDialogTitle>
          <AlertDialogDescription className="text-base">
            Select how you want the AI agents to proceed through the pipeline
          </AlertDialogDescription>
        </AlertDialogHeader>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Close execution mode dialog"
          title="Close"
          onClick={onClose}
          className="absolute right-3 top-3 h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          {/* Human Interaction Mode */}
          <button
            onClick={() => onSelect("human")}
            className="group relative overflow-hidden rounded-lg border-2 border-border bg-card p-6 text-left transition-all hover:border-primary hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <div className="flex flex-col items-center text-center gap-4">
              <div className="bg-primary/10 rounded-full p-4 group-hover:bg-primary/20 transition-colors">
                <UserCircle className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h3 className="font-medium mb-2">Human Interaction</h3>
                <p className="text-sm text-muted-foreground">
                  Review and approve each agent's work before proceeding. Provide feedback and guidance at each step.
                </p>
              </div>
              <div className="mt-2 font-mono text-xs text-muted-foreground">
                Recommended for critical projects
              </div>
            </div>
          </button>

          {/* AI Autonomous Mode */}
          <button
            onClick={() => onSelect("ai")}
            className="group relative overflow-hidden rounded-lg border-2 border-border bg-card p-6 text-left transition-all hover:border-primary hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <div className="flex flex-col items-center text-center gap-4">
              <div className="bg-primary/10 rounded-full p-4 group-hover:bg-primary/20 transition-colors">
                <Bot className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h3 className="font-medium mb-2">AI Autonomous</h3>
                <p className="text-sm text-muted-foreground">
                  Let AI agents run the entire pipeline automatically. Review final deliverables at the end.
                </p>
              </div>
              <div className="mt-2 font-mono text-xs text-muted-foreground">
                Faster execution, less oversight
              </div>
            </div>
          </button>
        </div>

        <AlertDialogFooter>
          <p className="text-xs text-muted-foreground mr-auto">
            You can change this mode later from settings
          </p>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

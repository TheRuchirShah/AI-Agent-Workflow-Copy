import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { ScrollArea } from "./ui/scroll-area";
import { Save } from "lucide-react";
import { toast } from "sonner";

export function GeneralSettings() {
  const [autoSave, setAutoSave] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [defaultAutomation, setDefaultAutomation] = useState<"human" | "ai">("human");
  const [projectName, setProjectName] = useState("E-commerce Redesign");

  const handleSave = () => {
    toast.success("General settings saved successfully");
  };

  return (
    <ScrollArea className="h-full">
      <div className="space-y-6">
        {/* Project Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Project Settings</CardTitle>
            <CardDescription>Configure default project behavior</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="projectName">Default Project Name</Label>
              <Input
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter default project name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="automation">Default Automation Mode</Label>
              <Select
                value={defaultAutomation}
                onValueChange={(value: "human" | "ai") => setDefaultAutomation(value)}
              >
                <SelectTrigger id="automation">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="human">Human Interaction</SelectItem>
                  <SelectItem value="ai">AI Autonomous</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Choose the default mode when starting a new pipeline
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Customize your experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="autoSave">Auto-save Progress</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically save pipeline progress
                </p>
              </div>
              <Switch
                id="autoSave"
                checked={autoSave}
                onCheckedChange={setAutoSave}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="darkMode">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Use dark color scheme
                </p>
              </div>
              <Switch
                id="darkMode"
                checked={darkMode}
                onCheckedChange={setDarkMode}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive updates via email
                </p>
              </div>
              <Switch id="notifications" />
            </div>
          </CardContent>
        </Card>

        {/* Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Performance</CardTitle>
            <CardDescription>Optimize pipeline execution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="maxConcurrent">Max Concurrent Agents</Label>
              <Select defaultValue="3">
                <SelectTrigger id="maxConcurrent">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 (Sequential)</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3 (Recommended)</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10 (High Performance)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Number of agents that can run simultaneously in AI mode
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeout">Agent Timeout (minutes)</Label>
              <Input
                id="timeout"
                type="number"
                defaultValue={30}
                min={5}
                max={120}
              />
              <p className="text-xs text-muted-foreground">
                Maximum time an agent can run before timing out
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="sticky bottom-0 -mx-4 border-t border-border bg-background/95 px-4 py-4 backdrop-blur-sm sm:-mx-6 sm:px-6">
          <Button onClick={handleSave} size="lg" className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Save General Settings
          </Button>
        </div>
      </div>
    </ScrollArea>
  );
}
